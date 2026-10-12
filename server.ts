import http from 'http';
import path from 'path';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { INITIAL_QUESTIONS } from './src/data/questions';
import { CompetitionRoom, RoomPlayer, Question } from './src/types';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// In-memory real-time rooms
interface ServerRoom extends CompetitionRoom {
  timerInterval?: NodeJS.Timeout;
}

const rooms = new Map<string, ServerRoom>();
const clientRooms = new Map<WebSocket, string>();
const clientPlayers = new Map<WebSocket, RoomPlayer>();

// Generate unique 6-character room code (e.g. OSN-412)
function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const lPart = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
  const nPart = Math.floor(100 + Math.random() * 900);
  return `OSN-${lPart}${nPart}`;
}

// Select 5 varied questions for the match
function pickMatchQuestions(): Question[] {
  const shuffled = [...INITIAL_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

function broadcastToRoom(roomCode: string, payload: any) {
  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN && clientRooms.get(client) === roomCode) {
      client.send(message);
    }
  }
}

function getSanitizedRoom(room: ServerRoom): CompetitionRoom {
  return {
    code: room.code,
    status: room.status,
    players: room.players,
    questions: room.questions,
    currentQuestionIndex: room.currentQuestionIndex,
    countdownSeconds: room.countdownSeconds,
    questionTimeLeft: room.questionTimeLeft,
    totalQuestions: room.totalQuestions,
    winnerId: room.winnerId,
    createdAt: room.createdAt,
  };
}

function startCountdown(room: ServerRoom) {
  room.status = 'countdown';
  room.countdownSeconds = 3;
  broadcastToRoom(room.code, {
    type: 'room_update',
    room: getSanitizedRoom(room),
  });

  const countInterval = setInterval(() => {
    room.countdownSeconds -= 1;
    if (room.countdownSeconds <= 0) {
      clearInterval(countInterval);
      startRound(room, 0);
    } else {
      broadcastToRoom(room.code, {
        type: 'room_update',
        room: getSanitizedRoom(room),
      });
    }
  }, 1000);
}

function startRound(room: ServerRoom, questionIndex: number) {
  if (room.timerInterval) clearInterval(room.timerInterval);

  room.status = 'in_game';
  room.currentQuestionIndex = questionIndex;
  room.questionTimeLeft = 30; // 30 seconds per question

  // Reset players answered flag
  room.players.forEach((p) => {
    p.answeredCurrent = false;
    p.lastAnswerCorrect = undefined;
  });

  broadcastToRoom(room.code, {
    type: 'round_started',
    room: getSanitizedRoom(room),
  });

  room.timerInterval = setInterval(() => {
    room.questionTimeLeft -= 1;

    // Broadcast tick every second
    broadcastToRoom(room.code, {
      type: 'timer_tick',
      timeLeft: room.questionTimeLeft,
    });

    if (room.questionTimeLeft <= 0) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      handleRoundEnd(room);
    }
  }, 1000);
}

function handleRoundEnd(room: ServerRoom) {
  if (room.timerInterval) clearInterval(room.timerInterval);

  room.status = 'round_review';
  const currentQ = room.questions[room.currentQuestionIndex];

  broadcastToRoom(room.code, {
    type: 'round_ended',
    correctIndex: currentQ ? currentQ.correctIndex : 0,
    room: getSanitizedRoom(room),
  });

  // After 3 seconds review, move to next round or finish
  setTimeout(() => {
    if (room.currentQuestionIndex + 1 < room.totalQuestions) {
      startRound(room, room.currentQuestionIndex + 1);
    } else {
      finishMatch(room);
    }
  }, 3000);
}

function finishMatch(room: ServerRoom) {
  if (room.timerInterval) clearInterval(room.timerInterval);
  room.status = 'finished';

  const [p1, p2] = room.players;
  if (!p2) {
    room.winnerId = p1 ? p1.id : undefined;
  } else if (p1.score > p2.score) {
    room.winnerId = p1.id;
  } else if (p2.score > p1.score) {
    room.winnerId = p2.id;
  } else {
    room.winnerId = 'tie';
  }

  broadcastToRoom(room.code, {
    type: 'match_finished',
    winnerId: room.winnerId,
    room: getSanitizedRoom(room),
  });
}

// WebSocket handler
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'auth': {
          const player: RoomPlayer = {
            id: msg.userId || `usr-${Math.random().toString(36).substring(2, 7)}`,
            name: msg.name || 'Siswa Kelas 4',
            school: msg.school || 'SD Indonesia',
            city: msg.city || 'Indonesia',
            avatarId: msg.avatarId || 'boy_hero',
            isReady: false,
            score: 0,
            answeredCurrent: false,
            totalCorrect: 0,
            isConnected: true,
          };
          clientPlayers.set(ws, player);
          ws.send(JSON.stringify({ type: 'authenticated', player }));
          break;
        }

        case 'create_room': {
          const player = clientPlayers.get(ws);
          if (!player) return;

          const code = generateRoomCode();
          const matchQuestions = pickMatchQuestions();

          player.isReady = false;
          player.score = 0;
          player.totalCorrect = 0;
          player.answeredCurrent = false;

          const newRoom: ServerRoom = {
            code,
            status: 'waiting',
            players: [player],
            questions: matchQuestions,
            currentQuestionIndex: 0,
            countdownSeconds: 3,
            questionTimeLeft: 30,
            totalQuestions: matchQuestions.length,
            createdAt: Date.now(),
          };

          rooms.set(code, newRoom);
          clientRooms.set(ws, code);

          ws.send(JSON.stringify({
            type: 'room_created',
            roomCode: code,
            room: getSanitizedRoom(newRoom),
          }));
          break;
        }

        case 'join_room': {
          const player = clientPlayers.get(ws);
          if (!player) return;

          const code = (msg.roomCode || '').toUpperCase().trim();
          const room = rooms.get(code);

          if (!room) {
            ws.send(JSON.stringify({ type: 'error', message: 'Kode ruangan tidak ditemukan!' }));
            return;
          }

          if (room.players.length >= 2) {
            ws.send(JSON.stringify({ type: 'error', message: 'Ruangan sudah penuh (maksimal 2 pemain)!' }));
            return;
          }

          if (room.status !== 'waiting') {
            ws.send(JSON.stringify({ type: 'error', message: 'Pertandingan di ruangan ini sudah berlangsung!' }));
            return;
          }

          player.isReady = false;
          player.score = 0;
          player.totalCorrect = 0;
          player.answeredCurrent = false;

          room.players.push(player);
          clientRooms.set(ws, code);

          broadcastToRoom(code, {
            type: 'room_update',
            room: getSanitizedRoom(room),
          });
          break;
        }

        case 'quick_match': {
          const player = clientPlayers.get(ws);
          if (!player) return;

          // Find an open room waiting for 1 opponent
          let openRoom: ServerRoom | undefined;
          for (const r of rooms.values()) {
            if (r.status === 'waiting' && r.players.length === 1) {
              openRoom = r;
              break;
            }
          }

          if (openRoom) {
            player.isReady = false;
            player.score = 0;
            player.totalCorrect = 0;
            player.answeredCurrent = false;

            openRoom.players.push(player);
            clientRooms.set(ws, openRoom.code);

            broadcastToRoom(openRoom.code, {
              type: 'room_update',
              room: getSanitizedRoom(openRoom),
            });
          } else {
            // Create a new public room
            const code = generateRoomCode();
            const matchQuestions = pickMatchQuestions();

            player.isReady = false;
            player.score = 0;
            player.totalCorrect = 0;
            player.answeredCurrent = false;

            const newRoom: ServerRoom = {
              code,
              status: 'waiting',
              players: [player],
              questions: matchQuestions,
              currentQuestionIndex: 0,
              countdownSeconds: 3,
              questionTimeLeft: 30,
              totalQuestions: matchQuestions.length,
              createdAt: Date.now(),
            };

            rooms.set(code, newRoom);
            clientRooms.set(ws, code);

            ws.send(JSON.stringify({
              type: 'room_created',
              roomCode: code,
              room: getSanitizedRoom(newRoom),
            }));
          }
          break;
        }

        case 'toggle_ready': {
          const roomCode = clientRooms.get(ws);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room) return;

          const player = clientPlayers.get(ws);
          if (!player) return;

          const pInRoom = room.players.find((p) => p.id === player.id);
          if (pInRoom) {
            pInRoom.isReady = !pInRoom.isReady;
          }

          broadcastToRoom(roomCode, {
            type: 'room_update',
            room: getSanitizedRoom(room),
          });

          // If 2 players and both ready, start countdown!
          if (room.players.length === 2 && room.players.every((p) => p.isReady)) {
            startCountdown(room);
          }
          break;
        }

        case 'submit_answer': {
          const roomCode = clientRooms.get(ws);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room || room.status !== 'in_game') return;

          const player = clientPlayers.get(ws);
          if (!player) return;

          const pInRoom = room.players.find((p) => p.id === player.id);
          if (!pInRoom || pInRoom.answeredCurrent) return;

          const currentQ = room.questions[room.currentQuestionIndex];
          if (!currentQ) return;

          const isCorrect = msg.answerIndex === currentQ.correctIndex;
          pInRoom.answeredCurrent = true;
          pInRoom.lastAnswerCorrect = isCorrect;
          pInRoom.lastAnswerTime = Date.now();

          if (isCorrect) {
            pInRoom.totalCorrect += 1;
            // Base 100 points + speed bonus (up to 50 points based on remaining time)
            const speedBonus = Math.round((Math.max(1, room.questionTimeLeft) / 30) * 50);
            pInRoom.score += 100 + speedBonus;
          }

          // Broadcast that this player answered (without revealing correctness to prevent leaking to opponent before round end)
          broadcastToRoom(roomCode, {
            type: 'player_answered',
            playerId: player.id,
            room: getSanitizedRoom(room),
          });

          // If all active players answered, end round immediately!
          const allAnswered = room.players.every((p) => p.answeredCurrent);
          if (allAnswered) {
            handleRoundEnd(room);
          }
          break;
        }

        case 'rematch': {
          const roomCode = clientRooms.get(ws);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room) return;

          room.status = 'waiting';
          room.questions = pickMatchQuestions();
          room.currentQuestionIndex = 0;
          room.winnerId = undefined;
          room.players.forEach((p) => {
            p.isReady = false;
            p.score = 0;
            p.totalCorrect = 0;
            p.answeredCurrent = false;
            p.lastAnswerCorrect = undefined;
          });

          broadcastToRoom(roomCode, {
            type: 'room_update',
            room: getSanitizedRoom(room),
          });
          break;
        }

        case 'leave_room': {
          const roomCode = clientRooms.get(ws);
          if (!roomCode) return;
          handleLeave(ws, roomCode);
          break;
        }
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    const roomCode = clientRooms.get(ws);
    if (roomCode) {
      handleLeave(ws, roomCode);
    }
    clientPlayers.delete(ws);
  });
});

function handleLeave(ws: WebSocket, roomCode: string) {
  const room = rooms.get(roomCode);
  const player = clientPlayers.get(ws);
  clientRooms.delete(ws);

  if (room && player) {
    room.players = room.players.filter((p) => p.id !== player.id);
    if (room.players.length === 0) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      rooms.delete(roomCode);
    } else {
      if (room.status === 'in_game' || room.status === 'countdown') {
        if (room.timerInterval) clearInterval(room.timerInterval);
        room.status = 'finished';
        room.winnerId = room.players[0].id;
      }
      broadcastToRoom(roomCode, {
        type: 'player_left',
        playerId: player.id,
        room: getSanitizedRoom(room),
      });
    }
  }
}

// REST health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    roomsCount: rooms.size,
    onlineClients: wss.clients.size,
  });
});

// Serve frontend in dev or prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
