import { UserProfile, AnswerRecord, DailyReminderConfig, Badge, TopicCategory } from '../types';
import { INITIAL_BADGES, LEVEL_TIERS } from '../data/badges';

const PROFILE_KEY = 'olimpiade_sd4_profile';
const ANSWERS_KEY = 'olimpiade_sd4_answers';
const BADGES_KEY = 'olimpiade_sd4_badges';
const REMINDER_KEY = 'olimpiade_sd4_reminder';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Ahmad Faiz',
  school: 'SD Bintang Kejora',
  city: 'Bandung',
  avatarId: 'boy_hero',
  xp: 120,
  level: 2,
  streakDays: 2,
  lastActiveDate: new Date().toISOString().split('T')[0],
  adaptiveDifficulty: 'sedang',
  parentPin: '1234',
};

export const DEFAULT_REMINDER: DailyReminderConfig = {
  enabled: true,
  time: '16:00',
  hasPermission: false,
  lastNotifiedDate: '',
};

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function getStoredAnswers(): AnswerRecord[] {
  try {
    const raw = localStorage.getItem(ANSWERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveAnswerRecord(record: AnswerRecord): void {
  try {
    const answers = getStoredAnswers();
    // remove previous attempt for same question if needed or keep history
    answers.unshift(record);
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  } catch (e) {
    console.error('Failed to save answer record', e);
  }
}

export function getStoredBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    if (!raw) {
      saveBadges(INITIAL_BADGES);
      return INITIAL_BADGES;
    }
    const saved: Badge[] = JSON.parse(raw);
    // Merge in case initial badges has new items
    return INITIAL_BADGES.map((b) => {
      const match = saved.find((s) => s.id === b.id);
      return match || b;
    });
  } catch (e) {
    return INITIAL_BADGES;
  }
}

export function saveBadges(badges: Badge[]): void {
  try {
    localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  } catch (e) {
    console.error('Failed to save badges', e);
  }
}

export function getStoredReminder(): DailyReminderConfig {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return DEFAULT_REMINDER;
    return { ...DEFAULT_REMINDER, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_REMINDER;
  }
}

export function saveReminderConfig(config: DailyReminderConfig): void {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save reminder config', e);
  }
}

export function calculateLevelFromXP(xp: number): { level: number; title: string; minXp: number; maxXp: number } {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXp) {
      return LEVEL_TIERS[i];
    }
  }
  return LEVEL_TIERS[0];
}

export function checkAndUpdateDailyStreak(currentProfile: UserProfile): { updatedProfile: UserProfile; streakIncremented: boolean } {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastActive = currentProfile.lastActiveDate;

  if (lastActive === todayStr) {
    return { updatedProfile: currentProfile, streakIncremented: false };
  }

  const today = new Date(todayStr);
  const lastDate = new Date(lastActive);
  const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

  let newStreak = currentProfile.streakDays;
  if (diffDays === 1) {
    // Consecutive day
    newStreak += 1;
  } else if (diffDays > 1) {
    // Broken streak
    newStreak = 1;
  }

  const updatedProfile: UserProfile = {
    ...currentProfile,
    streakDays: newStreak,
    lastActiveDate: todayStr,
  };

  saveProfile(updatedProfile);
  return { updatedProfile, streakIncremented: diffDays === 1 };
}
