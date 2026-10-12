import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Users, 
  Copy, 
  Check, 
  ArrowRight, 
  Clock, 
  Trophy, 
  RotateCcw, 
  PenTool, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';
import { UserProfile, RoomPlayer } from '../types';
import { useCompetitionSocket } from '../hooks/useCompetitionSocket';
import { MathDiagram } from './MathDiagram';
import { Scratchpad } from './Scratchpad';
import { fireCelebrationConfetti } from '../utils/gamification';
import { saveProfile, calculateLevelFromXP } from '../utils/storage';

interface CompetitionArenaProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenBadges: () => void;
}

export const CompetitionArena: React.FC<CompetitionArenaProps> = ({
  profile,
  onProfileUpdated,
  onOpenBadges,
}) => {
  const {
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
  } = useCompetitionSocket(profile);

  const [inputCode, setInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Identify current player vs opponent in room
  const currentPlayer = currentRoom?.players.find(
    (p) => p.name === profile.name && p.school === profile.school
  ) || currentRoom?.players[0];

  const opponentPlayer = currentRoom?.players.find((p) => p.id !== currentPlayer?.id);

  // Reset selected option when a new round starts
  useEffect(() => {
    if (currentRoom?.status === 'in_game') {
      setSelectedOption(null);
    }
  }, [currentRoom?.currentQuestionIndex, currentRoom?.status]);

  // Award XP upon match completion
  useEffect(() => {
    if (currentRoom?.status === 'finished' && !xpAwarded && currentPlayer) {
      const isWinner = currentRoom.winnerId === currentPlayer.id;
      const isTie = currentRoom.winnerId === 'tie';
      const earnedXp = isWinner ? 150 : isTie ? 100 : 80;

      const newTotalXp = profile.xp + earnedXp;
      const nextLevel = calculateLevelFromXP(newTotalXp);
      const updatedProfile: UserProfile = {
        ...profile,
        xp: newTotalXp,
        level: nextLevel.level,
      };

      saveProfile(updatedProfile);
      onProfileUpdated(updatedProfile);
      setXpAwarded(true);

      if (isWinner || isTie) {
        fireCelebrationConfetti();
      }
    } else if (currentRoom?.status === 'waiting') {
      setXpAwarded(false);
    }
  }, [currentRoom?.status, currentRoom?.winnerId, xpAwarded, profile, currentPlayer, onProfileUpdated]);

  const handleCopyCode = () => {
    if (!currentRoom?.code) return;
    navigator.clipboard.writeText(currentRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSelectOption = (index: number) => {
    if (currentRoom?.status !== 'in_game' || currentPlayer?.answeredCurrent) return;
    setSelectedOption(index);
    submitAnswer(index);
  };

  const currentQuestion = currentRoom && currentRoom.questions
    ? currentRoom.questions[currentRoom.currentQuestionIndex]
    : null;

  // 1. LOBBY SCREEN (When not in any room)
  if (!currentRoom) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              <Swords className="w-4 h-4" />
              <span>Mode Kompetisi Real-Time 1v1</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Adu Cepat Matematika
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
              Tantang teman sekelas atau siswa SD Kelas 4 lainnya di Indonesia! Jawab 5 soal olimpiade matematika secara langsung dengan sistem skor akurasi dan kecepatan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-xs">
            {connectionStatus === 'connected' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Server Real-Time Aktif</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold text-amber-200">Menghubungkan ke Server...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-rose-300" />
                <span className="font-bold text-rose-200">Terputus (Mode Offline)</span>
              </>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Quick Matchmaking */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Cari Lawan Cepat</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Sistem akan secara otomatis mencarikan teman yang sedang menunggu pertandingan.
              </p>
            </div>
            <button
              onClick={quickMatch}
              disabled={connectionStatus !== 'connected'}
              className="mt-6 w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Mulai Tanding Cepat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Create Private Room */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Buat Ruang Tanding</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Dapatkan kode 6-digit dan bagikan kepada sahabat atau teman satu sekolah.
              </p>
            </div>
            <button
              onClick={createRoom}
              disabled={connectionStatus !== 'connected'}
              className="mt-6 w-full py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 disabled:opacity-50 transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Buat Kode Ruangan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Join Room with Code */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Gabung dengan Kode</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Masukkan kode ruangan yang dibagikan oleh temanmu untuk masuk ke ruangannya.
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <input
                type="text"
                placeholder="Contoh: OSN-AB123"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full text-center tracking-widest text-xs font-mono font-bold py-2 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-hidden"
              />
              <button
                onClick={() => joinRoom(inputCode)}
                disabled={connectionStatus !== 'connected' || !inputCode.trim()}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 disabled:opacity-50 transition shadow-xs"
              >
                Gabung Ruangan
              </button>
            </div>
          </div>
        </div>

        {/* Rules Card */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <span className="font-bold text-slate-800 block text-sm">
            Format Pertandingan Olimpiade Real-Time:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">5 Soal Olimpiade</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Soal acak dari bank materi resmi SD Kelas 4.</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">30 Detik per Soal</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Makin cepat menjawab benar, makin tinggi bonus poin kecepatan!</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">+150 XP Pemenang</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tingkatkan level dan peringkat nasionalmu melalui duel adu cepat.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. WAITING LOBBY (Players in Room, waiting to be ready)
  if (currentRoom.status === 'waiting') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
        {/* Room Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-3 shadow-xs">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Ruang Duel Kompetisi
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Kode Ruangan: <span className="font-mono text-blue-600 tracking-wider">{currentRoom.code}</span>
          </h2>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Kode untuk Teman'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {currentRoom.players.length === 1
              ? 'Bagikan kode ruangan ini kepada temanmu agar mereka dapat masuk dan bertanding.'
              : 'Kedua pemain telah bergabung! Tekan tombol "Siap Bertanding" untuk memulai.'}
          </p>
        </div>

        {/* Players Matchup Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Player 1 (You) */}
          <div className="bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-xs relative space-y-3">
            <span className="absolute top-3 right-3 text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md">
              Kamu
            </span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                {currentPlayer?.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{currentPlayer?.name}</h4>
                <p className="text-xs text-slate-500">{currentPlayer?.school}</p>
                <p className="text-[11px] text-slate-400">{currentPlayer?.city}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Status Kesiapan:</span>
              <span
                className={`font-bold ${
                  currentPlayer?.isReady ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {currentPlayer?.isReady ? '✓ Sudah Siap' : 'Belum Siap'}
              </span>
            </div>
          </div>

          {/* Player 2 (Opponent) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative space-y-3">
            <span className="absolute top-3 right-3 text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
              Lawan
            </span>
            {opponentPlayer ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg">
                    {opponentPlayer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{opponentPlayer.name}</h4>
                    <p className="text-xs text-slate-500">{opponentPlayer.school}</p>
                    <p className="text-[11px] text-slate-400">{opponentPlayer.city}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status Kesiapan:</span>
                  <span
                    className={`font-bold ${
                      opponentPlayer.isReady ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {opponentPlayer.isReady ? '✓ Sudah Siap' : 'Belum Siap'}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mx-auto text-slate-400">
                  <Users className="w-5 h-5 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-slate-700">Menunggu Lawan Bergabung...</p>
                <p className="text-[11px] text-slate-400">Kirim kode {currentRoom.code} ke temanmu</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={leaveRoom}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Ruangan</span>
          </button>

          <button
            onClick={toggleReady}
            disabled={!opponentPlayer}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-2 ${
              currentPlayer?.isReady
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50'
            }`}
          >
            <span>{currentPlayer?.isReady ? 'Batalkan Kesiapan' : 'Saya Siap Bertanding!'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. COUNTDOWN SCREEN (3... 2... 1...)
  if (currentRoom.status === 'countdown') {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 shadow-sm animate-in zoom-in-95 duration-150">
        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-4xl mx-auto shadow-md ring-8 ring-blue-100 animate-pulse">
          {currentRoom.countdownSeconds}
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">Bersiaplah!</h3>
          <p className="text-xs text-slate-500 mt-1">
            Pertandingan adu cepat matematika akan segera dimulai dalam hitungan detik.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium">
          {currentPlayer?.name} VS {opponentPlayer?.name}
        </div>
      </div>
    );
  }

  // 4. IN-GAME BATTLE & ROUND REVIEW SCREEN
  if (currentRoom.status === 'in_game' || currentRoom.status === 'round_review') {
    return (
      <div className="space-y-6">
        {/* Live Battle Header Scoreboard */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            {/* Player 1 Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {currentPlayer?.name.charAt(0)}
              </div>
              <div>
                <span className="text-[11px] text-blue-300 font-bold block">Kamu</span>
                <p className="text-sm font-extrabold text-white">{currentPlayer?.name}</p>
                <p className="text-xs font-mono font-bold text-amber-300">{currentPlayer?.score || 0} Poin</p>
              </div>
            </div>

            {/* Timer and Round info in center */}
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                Soal {currentRoom.currentQuestionIndex + 1} / {currentRoom.totalQuestions}
              </span>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono font-black text-base mt-1 ${
                  timeLeft <= 5
                    ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500 animate-pulse'
                    : timeLeft <= 10
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-white/10 text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Player 2 Status */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[11px] text-purple-300 font-bold block">Lawan</span>
                <p className="text-sm font-extrabold text-white">{opponentPlayer?.name}</p>
                <p className="text-xs font-mono font-bold text-amber-300">{opponentPlayer?.score || 0} Poin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                {opponentPlayer?.name.charAt(0)}
              </div>
            </div>
          </div>

          {/* Opponent live status indicator */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">Status Lawan:</span>
              {opponentPlayer?.answeredCurrent ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lawan telah mengunci jawaban!
                </span>
              ) : (
                <span className="text-amber-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Lawan sedang berhitung...
                </span>
              )}
            </div>

            <button
              onClick={() => setIsScratchpadOpen(true)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold flex items-center gap-1 transition text-xs"
            >
              <PenTool className="w-3.5 h-3.5 text-amber-300" />
              <span>Buka Papan Coret</span>
            </button>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
              <span className="font-bold text-blue-600 uppercase">
                Topik: {currentQuestion.topic.replace('_', ' ')}
              </span>
              <span className="font-medium text-slate-400">
                Tingkat {currentQuestion.difficulty}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
              {currentQuestion.question}
            </h3>

            <MathDiagram question={currentQuestion} />

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === idx;
                const isSubmitted = currentPlayer?.answeredCurrent;
                const isReview = currentRoom.status === 'round_review';
                const isCorrect = roundReviewData?.correctIndex === idx;

                let style = 'bg-white border-slate-200 text-slate-800 hover:border-blue-400';

                if (isReview) {
                  if (isCorrect) {
                    style = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400 font-bold';
                  } else if (isSelected && !isCorrect) {
                    style = 'bg-rose-50 border-rose-400 text-rose-900';
                  } else {
                    style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  style = 'bg-blue-50 border-blue-600 ring-2 ring-blue-500 text-blue-900 font-bold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isSubmitted || isReview}
                    className={`p-4 rounded-xl border-2 text-left font-medium transition flex items-center justify-between gap-3 ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {letter}
                      </span>
                      <span className="text-sm font-semibold">{option}</span>
                    </div>

                    {isReview && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isReview && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Review Banner */}
            {currentRoom.status === 'round_review' && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900">
                    💡 Pembahasan Ronde {currentRoom.currentQuestionIndex + 1}:
                  </span>
                  <span className="text-[11px] font-bold text-blue-700">
                    Bersiap soal berikutnya...
                  </span>
                </div>
                <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        <Scratchpad
          isOpen={isScratchpadOpen}
          onClose={() => setIsScratchpadOpen(false)}
        />
      </div>
    );
  }

  // 5. FINISHED PODIUM SCREEN
  if (currentRoom.status === 'finished') {
    const isWinner = currentRoom.winnerId === currentPlayer?.id;
    const isTie = currentRoom.winnerId === 'tie';

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-md ring-8 ${
              isWinner
                ? 'bg-amber-100 text-amber-600 ring-amber-50'
                : isTie
                ? 'bg-blue-100 text-blue-600 ring-blue-50'
                : 'bg-slate-100 text-slate-600 ring-slate-50'
            }`}
          >
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {isWinner
                ? '🏆 Luar Biasa! Kamu Menang Duel!'
                : isTie
                ? '🤝 Pertandingan Berakhir Seri!'
                : '👏 Tetap Semangat! Lawan Unggul Kali Ini'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isWinner
                ? `Selamat ${currentPlayer?.name}! Kamu mendapatkan bonus +150 XP atas kemenanganmu!`
                : isTie
                ? 'Kedua pemain menunjukkan ketajaman berhitung yang seimbang! (+100 XP)'
                : `Permainan hebat! Terus asah kecepatanmu di duel berikutnya (+80 XP).`}
            </p>
          </div>

          {/* Final Score Comparison */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {/* You */}
            <div
              className={`p-4 rounded-2xl border text-center ${
                isWinner ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Kamu</span>
              <p className="text-sm font-black text-slate-900">{currentPlayer?.name}</p>
              <p className="text-2xl font-black text-blue-600 font-mono mt-1">
                {currentPlayer?.score || 0}
              </p>
              <p className="text-[11px] text-slate-500">{currentPlayer?.totalCorrect || 0} Soal Benar</p>
            </div>

            {/* Opponent */}
            <div
              className={`p-4 rounded-2xl border text-center ${
                !isWinner && !isTie ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Lawan</span>
              <p className="text-sm font-black text-slate-900">{opponentPlayer?.name}</p>
              <p className="text-2xl font-black text-purple-600 font-mono mt-1">
                {opponentPlayer?.score || 0}
              </p>
              <p className="text-[11px] text-slate-500">{opponentPlayer?.totalCorrect || 0} Soal Benar</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={leaveRoom}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              Kembali ke Lobi
            </button>
            <button
              onClick={rematch}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tanding Ulang</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
