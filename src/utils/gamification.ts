import confetti from 'canvas-confetti';
import { Badge, AnswerRecord, TopicCategory, DifficultyLevel, UserProfile } from '../types';
import { getStoredBadges, saveBadges, saveProfile } from './storage';

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'],
    });
  } catch (e) {
    // Graceful fallback
  }
}

export function evaluateBadgesAfterAnswer(
  latestRecord: AnswerRecord,
  allAnswers: AnswerRecord[],
  profile: UserProfile
): { newlyUnlockedBadges: Badge[]; updatedBadges: Badge[] } {
  const currentBadges = getStoredBadges();
  const newlyUnlocked: Badge[] = [];

  const updatedBadges = currentBadges.map((badge) => {
    if (badge.unlockedAt) return badge; // Already unlocked

    let newProgress = badge.progress || 0;
    let shouldUnlock = false;

    if (badge.id === 'first_step') {
      newProgress = 1;
      shouldUnlock = true;
    } else if (badge.id === 'streak_3') {
      newProgress = profile.streakDays;
      if (newProgress >= 3) shouldUnlock = true;
    } else if (badge.id === 'streak_7') {
      newProgress = profile.streakDays;
      if (newProgress >= 7) shouldUnlock = true;
    } else if (badge.id === 'calc_master') {
      const correctBilangan = allAnswers.filter((a) => a.topic === 'bilangan' && a.isCorrect).length;
      newProgress = correctBilangan;
      if (newProgress >= 5) shouldUnlock = true;
    } else if (badge.id === 'geo_explorer') {
      const correctGeo = allAnswers.filter((a) => a.topic === 'geometri' && a.isCorrect).length;
      newProgress = correctGeo;
      if (newProgress >= 3) shouldUnlock = true;
    } else if (badge.id === 'fraction_hero') {
      const correctPecahan = allAnswers.filter((a) => a.topic === 'pecahan' && a.isCorrect).length;
      newProgress = correctPecahan;
      if (newProgress >= 3) shouldUnlock = true;
    } else if (badge.id === 'logic_ninja') {
      const correctLogika = allAnswers.filter((a) => a.topic === 'logika' && a.isCorrect).length;
      newProgress = correctLogika;
      if (newProgress >= 3) shouldUnlock = true;
    } else if (badge.id === 'olympiad_champ') {
      const correctOlimpiade = allAnswers.filter((a) => a.difficulty === 'olimpiade' && a.isCorrect).length;
      newProgress = correctOlimpiade;
      if (newProgress >= 3) shouldUnlock = true;
    } else if (badge.id === 'speed_demon') {
      if (latestRecord.isCorrect && latestRecord.timeSpentSec < 25) {
        newProgress = 1;
        shouldUnlock = true;
      }
    }

    if (shouldUnlock) {
      const unlocked: Badge = {
        ...badge,
        progress: badge.maxProgress,
        unlockedAt: Date.now(),
      };
      newlyUnlocked.push(unlocked);
      return unlocked;
    }

    return {
      ...badge,
      progress: Math.min(newProgress, badge.maxProgress),
    };
  });

  if (newlyUnlocked.length > 0) {
    saveBadges(updatedBadges);
    fireCelebrationConfetti();
  }

  return { newlyUnlockedBadges: newlyUnlocked, updatedBadges };
}

export function computeAdaptiveDifficulty(answers: AnswerRecord[]): {
  recommended: DifficultyLevel;
  reason: string;
} {
  if (answers.length < 3) {
    return {
      recommended: 'sedang',
      reason: 'Tingkat standar pengenalan materi Olimpiade SD Kelas 4.',
    };
  }

  // Look at last 5 answers
  const recent = answers.slice(0, 5);
  const correctCount = recent.filter((r) => r.isCorrect).length;
  const accuracy = correctCount / recent.length;

  if (accuracy >= 0.8) {
    return {
      recommended: 'olimpiade',
      reason: 'Luar biasa! Akurasi kamu mencapai ' + Math.round(accuracy * 100) + '%. Sistem menaikkan ke tingkat Olimpiade Nasional!',
    };
  } else if (accuracy <= 0.4) {
    return {
      recommended: 'mudah',
      reason: 'Mari perkuat fondasi konsep matematika dasar terlebih dahulu.',
    };
  } else {
    return {
      recommended: 'sedang',
      reason: 'Performa stabil! Terus tingkatkan kemampuan di tingkat Sedang.',
    };
  }
}
