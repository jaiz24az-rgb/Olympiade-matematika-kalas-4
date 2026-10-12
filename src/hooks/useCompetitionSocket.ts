import { useState, useEffect, useRef, useCallback } from 'react';
import { CompetitionRoom, UserProfile } from '../types';

export function useCompetitionSocket(profile: UserProfile) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [currentRoom, setCurrentRoom] = useState<CompetitionRoom | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roundReviewData, setRoundReviewData] = useState<{ correctIndex: number } | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionStatus('connecting');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        setErrorMessage(null);
        // Authenticate immediately
        ws.send(JSON.stringify({
          type: 'auth',
          userId: `usr-${profile.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: profile.name,
          school: profile.school,
          city: profile.city,
          avatarId: profile.avatarId,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'authenticated':
              break;

            case 'room_created':
            case 'room_joined':
            case 'room_update':
              setCurrentRoom(msg.room);
              setTimeLeft(msg.room.questionTimeLeft);
              setErrorMessage(null);
              break;

            case 'round_started':
              setCurrentRoom(msg.room);
              setTimeLeft(30);
              setRoundReviewData(null);
              break;

            case 'timer_tick':
              setTimeLeft(msg.timeLeft);
              break;

            case 'player_answered':
              setCurrentRoom(msg.room);
              break;

            case 'round_ended':
              setCurrentRoom(msg.room);
              setRoundReviewData({ correctIndex: msg.correctIndex });
              break;

            case 'match_finished':
              setCurrentRoom(msg.room);
              setRoundReviewData(null);
              break;

            case 'player_left':
              setCurrentRoom(msg.room);
              break;

            case 'error':
              setErrorMessage(msg.message);
              break;
          }
        } catch (err) {
          console.error('Error handling message from socket', err);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        socketRef.current = null;
        // Auto-reconnect after 3 seconds if not unmounted
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        setConnectionStatus('disconnected');
      };
    } catch (e) {
      setConnectionStatus('disconnected');
    }
  }, [profile.name, profile.school, profile.city, profile.avatarId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  const send = (payload: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  const createRoom = () => send({ type: 'create_room' });
  const joinRoom = (roomCode: string) => send({ type: 'join_room', roomCode });
  const quickMatch = () => send({ type: 'quick_match' });
  const toggleReady = () => send({ type: 'toggle_ready' });
  const submitAnswer = (answerIndex: number) => send({ type: 'submit_answer', answerIndex });
  const rematch = () => send({ type: 'rematch' });
  const leaveRoom = () => {
    send({ type: 'leave_room' });
    setCurrentRoom(null);
    setRoundReviewData(null);
  };

  return {
    connectionStatus,
    currentRoom,
    timeLeft,
    roundReviewData,
    errorMessage,
    createRoom,
    joinRoom,
    quickMatch,
    toggleReady,
    submitAnswer,
    rematch,
    leaveRoom,
  };
}
