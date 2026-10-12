import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  PenTool, 
  Zap, 
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  Award
} from 'lucide-react';
import { Question, DifficultyLevel, TopicCategory, UserProfile, AnswerRecord } from '../types';
import { INITIAL_QUESTIONS, TOPICS } from '../data/questions';
import { MathDiagram } from './MathDiagram';
import { Scratchpad } from './Scratchpad';
import { 
  saveAnswerRecord, 
  saveProfile, 
  getStoredAnswers, 
  checkAndUpdateDailyStreak, 
  calculateLevelFromXP 
} from '../utils/storage';
import { 
  fireCelebrationConfetti, 
  evaluateBadgesAfterAnswer, 
  computeAdaptiveDifficulty 
} from '../utils/gamification';

interface PracticeArenaProps {
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
  onOpenBadges: () => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  profile,
  onProfileUpdated,
  onOpenBadges,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory | 'all'>('all');
  const [difficultyMode, setDifficultyMode] = useState<'adaptive' | 'manual'>('adaptive');
  const [manualDifficulty, setManualDifficulty] = useState<DifficultyLevel>('sedang');
  
  // Current question index & filtered list
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [newBadgeAlert, setNewBadgeAlert] = useState<string | null>(null);

  // Filter questions based on topic and adaptive/manual difficulty
  const effectiveDifficulty: DifficultyLevel = difficultyMode === 'adaptive'
    ? profile.adaptiveDifficulty
    : manualDifficulty;

  const filteredQuestions = INITIAL_QUESTIONS.filter((q) => {
    const matchTopic = selectedTopic === 'all' || q.topic === selectedTopic;
    const matchDifficulty = q.difficulty === effectiveDifficulty;
    return matchTopic && matchDifficulty;
  });

  // Fallback if no questions in specific filter
  const currentQuestionList = filteredQuestions.length > 0
    ? filteredQuestions
    : INITIAL_QUESTIONS.filter((q) => selectedTopic === 'all' || q.topic === selectedTopic);

  const currentQuestion: Question | undefined = currentQuestionList[activeQuestionIndex % currentQuestionList.length];

  useEffect(() => {
    // Reset state on question change
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowHint(false);
    setQuestionStartTime(Date.now());
  }, [activeQuestionIndex, selectedTopic, effectiveDifficulty]);

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQuestion) return;

    const timeSpentSec = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const pointsEarned = isCorrect ? currentQuestion.points : 0;

    setIsAnswerSubmitted(true);

    // Save answer record
    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      selectedAnswer: selectedOption,
      isCorrect,
      timeSpentSec,
      timestamp: Date.now(),
      pointsEarned,
    };
    saveAnswerRecord(record);

    // Update profile XP & streak
    const { updatedProfile } = checkAndUpdateDailyStreak(profile);
    const newXp = updatedProfile.xp + (isCorrect ? currentQuestion.points : 2); // 2 consolation XP for effort
    const nextLevelInfo = calculateLevelFromXP(newXp);

    const allAnswers = getStoredAnswers();
    const adaptiveInfo = computeAdaptiveDifficulty(allAnswers);

    const finalProfile: UserProfile = {
      ...updatedProfile,
      xp: newXp,
      level: nextLevelInfo.level,
      adaptiveDifficulty: adaptiveInfo.recommended,
    };
    saveProfile(finalProfile);
    onProfileUpdated(finalProfile);

    // Check badges
    if (isCorrect) {
      fireCelebrationConfetti();
    }
    const { newlyUnlockedBadges } = evaluateBadgesAfterAnswer(record, allAnswers, finalProfile);
    if (newlyUnlockedBadges.length > 0) {
      setNewBadgeAlert(`🎉 Lencana Baru Terbuka: "${newlyUnlockedBadges[0].title}"!`);
      setTimeout(() => setNewBadgeAlert(null), 5000);
    }
  };

  const handleNextQuestion = () => {
    setActiveQuestionIndex((prev) => (prev + 1) % currentQuestionList.length);
  };

  return (
    <div className="space-y-6">
      {/* Alert toast for newly unlocked badge */}
      {newBadgeAlert && (
        <div className="p-3.5 bg-amber-500 text-white rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="font-bold text-xs sm:text-sm">{newBadgeAlert}</span>
          </div>
          <button
            onClick={onOpenBadges}
            className="px-2.5 py-1 bg-white text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-50"
          >
            Lihat Lencana
          </button>
        </div>
      )}

      {/* Control Strip: Topic filters & Difficulty Mode */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Topic tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => { setSelectedTopic('all'); setActiveQuestionIndex(0); }}
            className={`px-3 py-1.5 font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              selectedTopic === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Topik ({INITIAL_QUESTIONS.length})
          </button>
          {TOPICS.map((topic) => {
            const count = INITIAL_QUESTIONS.filter((q) => q.topic === topic.id).length;
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => { setSelectedTopic(topic.id); setActiveQuestionIndex(0); }}
                className={`px-3 py-1.5 font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {topic.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Difficulty Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Adaptive vs Manual Mode Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setDifficultyMode('adaptive')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-all flex items-center gap-1 ${
                difficultyMode === 'adaptive'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tingkat kesulitan menyesuaikan otomatis dengan kemampuanmu"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Adaptif Cerdas</span>
            </button>
            <button
              onClick={() => setDifficultyMode('manual')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                difficultyMode === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pilih Manual
            </button>
          </div>

          {difficultyMode === 'manual' && (
            <select
              value={manualDifficulty}
              onChange={(e) => {
                setManualDifficulty(e.target.value as DifficultyLevel);
                setActiveQuestionIndex(0);
              }}
              className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-800"
            >
              <option value="mudah">Mudah (+10 poin)</option>
              <option value="sedang">Sedang (+20 poin)</option>
              <option value="olimpiade">Olimpiade (+35 poin)</option>
            </select>
          )}

          {/* Quick Scratchpad Launcher */}
          <button
            onClick={() => setIsScratchpadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
          >
            <PenTool className="w-3.5 h-3.5 text-blue-600" />
            <span>Papan Coret-Coret</span>
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Question Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-bold text-blue-600 uppercase tracking-wider">
                Soal {activeQuestionIndex + 1} dari {currentQuestionList.length}
              </span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{currentQuestion.topic.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span
                className={`font-bold capitalize ${
                  currentQuestion.difficulty === 'olimpiade'
                    ? 'text-rose-600'
                    : currentQuestion.difficulty === 'sedang'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                Tingkat {currentQuestion.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                +{currentQuestion.points} XP
              </span>
              {difficultyMode === 'adaptive' && (
                <span className="text-[11px] text-slate-400 font-medium">
                  (Diselaraskan Otomatis)
                </span>
              )}
            </div>
          </div>

          {/* Question Body */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
              {currentQuestion.question}
            </h3>

            {/* Visual Diagram if available */}
            <MathDiagram question={currentQuestion} />
          </div>

          {/* Hint Trigger */}
          <div className="pt-1">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Butuh petunjuk berpikir? Klik di sini</span>
              </button>
            ) : (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold block mb-1">💡 Petunjuk Berpikir:</span>
                <p className="leading-relaxed">{currentQuestion.hint}</p>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let cardStyle = 'bg-white border-slate-200 hover:border-blue-400 text-slate-800';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                } else {
                  cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                cardStyle = 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between gap-3 ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm font-semibold">{option}</span>
                  </div>

                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={() => setIsScratchpadOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <PenTool className="w-4 h-4 text-blue-600" />
              <span>Oret-Oret Jawaban</span>
            </button>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="ml-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                Kunci Jawaban
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="ml-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Soal Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Step-by-Step Explanation when submitted */}
          {isAnswerSubmitted && (
            <div
              className={`p-5 rounded-2xl border text-sm leading-relaxed animate-in fade-in duration-200 ${
                selectedOption === currentQuestion.correctIndex
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                  Pembahasan Terstruktur:
                </span>
              </div>
              <p className="whitespace-pre-line text-xs sm:text-sm font-medium text-slate-800">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">
            Tidak ada soal untuk filter ini. Silakan pilih topik lain!
          </p>
        </div>
      )}

      {/* Floating Scratchpad Canvas */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />
    </div>
  );
};
