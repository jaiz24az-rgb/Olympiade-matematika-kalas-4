import React, { useState } from 'react';
import { Calendar, CheckCircle, Sparkles, Award, ArrowRight, BookOpen, Flame, Star } from 'lucide-react';
import { Question, UserProfile, AnswerRecord } from '../types';
import { INITIAL_QUESTIONS } from '../data/questions';
import { MathDiagram } from './MathDiagram';
import { Scratchpad } from './Scratchpad';
import { saveAnswerRecord, saveProfile, checkAndUpdateDailyStreak } from '../utils/storage';
import { fireCelebrationConfetti } from '../utils/gamification';

interface DailyChallengeProps {
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Derive 3 questions deterministically based on date so it refreshes daily
  const dayHash = todayStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const q1 = INITIAL_QUESTIONS[dayHash % INITIAL_QUESTIONS.length];
  const q2 = INITIAL_QUESTIONS[(dayHash + 3) % INITIAL_QUESTIONS.length];
  const q3 = INITIAL_QUESTIONS[(dayHash + 7) % INITIAL_QUESTIONS.length];
  const dailyQuestions: Question[] = [q1, q2, q3];

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  const question = dailyQuestions[currentStep];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    const isCorrect = selectedOption === question.correctIndex;
    setIsAnswerSubmitted(true);

    const record: AnswerRecord = {
      questionId: `daily-${todayStr}-${question.id}`,
      topic: question.topic,
      difficulty: question.difficulty,
      selectedAnswer: selectedOption,
      isCorrect,
      timeSpentSec: 30,
      timestamp: Date.now(),
      pointsEarned: isCorrect ? question.points : 0,
    };
    saveAnswerRecord(record);

    if (isCorrect) {
      fireCelebrationConfetti();
    }

    const nextCompleted = [...completedSteps];
    nextCompleted[currentStep] = true;
    setCompletedSteps(nextCompleted);

    // If step 3 completed
    if (currentStep === 2) {
      setIsAllCompleted(true);
      const { updatedProfile } = checkAndUpdateDailyStreak(profile);
      const bonusXp = 50; // Daily challenge completion bonus
      const newProfile: UserProfile = {
        ...updatedProfile,
        xp: updatedProfile.xp + bonusXp,
      };
      saveProfile(newProfile);
      onProfileUpdated(newProfile);
      fireCelebrationConfetti();
    }
  };

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>{todayFormatted}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Tantangan Kognitif Harian
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1">
              3 soal terstruktur setiap hari untuk melatih ketajaman nalar, logika, dan strategi penyelesaian olimpiade.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black">
              <Flame className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">Streak Belajar</p>
              <p className="text-base font-extrabold text-white">{profile.streakDays} Hari Aktif</p>
            </div>
          </div>
        </div>

        {/* Step Progression Indicators */}
        <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-3 gap-3">
          {['Tahap 1: Pemanasan', 'Tahap 2: Pola Nalar', 'Tahap 3: Tantangan OSN'].map((title, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl transition-all ${
                idx === currentStep
                  ? 'bg-white text-slate-900 shadow-md ring-2 ring-amber-400'
                  : completedSteps[idx]
                  ? 'bg-emerald-600/40 text-white border border-emerald-400/50'
                  : 'bg-white/10 text-blue-200 border border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase">{title}</span>
                {completedSteps[idx] ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <span className="text-[10px] font-mono">Soal {idx + 1}/3</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Finished Summary or Active Question */}
      {isAllCompleted ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-amber-50">
            <Star className="w-9 h-9 fill-amber-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Hebat Sekali! Tantangan Hari Ini Selesai
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Kamu telah menyelesaikan 3 soal harian hari ini dan meraih bonus <strong>+50 XP</strong>. 
            Kembalilah besok untuk tantangan baru atau terus berlatih di menu Arena Latihan!
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Status: Tercatat Selesai Hari Ini</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-500 uppercase">
              Tahap {currentStep + 1} dari 3 · Topik: {question.topic.replace('_', ' ')}
            </span>
            <button
              onClick={() => setIsScratchpadOpen(true)}
              className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition"
            >
              Buka Papan Coret
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
            {question.question}
          </h3>

          <MathDiagram question={question} />

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {question.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === idx;
              const isCorrect = idx === question.correctIndex;

              let style = 'bg-white border-slate-200 text-slate-800';
              if (isAnswerSubmitted) {
                if (isCorrect) style = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400';
                else if (isSelected) style = 'bg-rose-50 border-rose-400 text-rose-900';
                else style = 'bg-slate-50 opacity-60';
              } else if (isSelected) {
                style = 'bg-blue-50 border-blue-600 ring-2 ring-blue-500 text-blue-900';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`p-4 rounded-xl border-2 text-left font-medium transition flex items-center gap-3 ${style}`}
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {letter}
                  </span>
                  <span className="text-sm font-semibold">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="ml-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-40 transition shadow-sm"
              >
                Kunci Jawaban
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="ml-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <span>{currentStep === 2 ? 'Selesaikan Tantangan' : 'Lanjut ke Tahap Berikutnya'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Explanation */}
          {isAnswerSubmitted && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-700 block">💡 Pembahasan:</span>
              <p className="text-slate-800 whitespace-pre-line leading-relaxed">{question.explanation}</p>
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
};
