export type DifficultyLevel = 'mudah' | 'sedang' | 'olimpiade';

export type TopicCategory = 
  | 'bilangan' 
  | 'geometri' 
  | 'pecahan' 
  | 'logika' 
  | 'soal_cerita';

export interface TopicInfo {
  id: TopicCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  accentBg: string;
}

export interface Question {
  id: string;
  topic: TopicCategory;
  difficulty: DifficultyLevel;
  question: string;
  context?: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  points: number;
  svgDiagramType?: 'rectangle_grid' | 'fraction_bars' | 'angle_geometry' | 'number_pyramid' | 'pattern_sequence' | 'balance_scale';
  svgData?: Record<string, any>;
}

export interface AnswerRecord {
  questionId: string;
  topic: TopicCategory;
  difficulty: DifficultyLevel;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpentSec: number;
  timestamp: number;
  pointsEarned: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'topic' | 'mastery' | 'daily';
  unlockedAt?: number;
  progress?: number;
  maxProgress: number;
}

export interface UserProfile {
  name: string;
  school: string;
  city: string;
  avatarId: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  adaptiveDifficulty: DifficultyLevel;
  parentPin: string; // default "1234"
}

export interface TopicStats {
  totalAnswered: number;
  correctAnswered: number;
  timeSpentSec: number;
}

export interface DailyReminderConfig {
  enabled: boolean;
  time: string; // "HH:MM" e.g. "16:00"
  hasPermission: boolean;
  lastNotifiedDate: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  school: string;
  city: string;
  score: number;
  xp: number;
  avatarId: string;
  badgeCount: number;
  streak: number;
  rank: number;
  isCurrent?: boolean;
}

export interface RoomPlayer {
  id: string;
  name: string;
  school: string;
  city: string;
  avatarId: string;
  isReady: boolean;
  score: number;
  answeredCurrent: boolean;
  lastAnswerCorrect?: boolean;
  lastAnswerTime?: number;
  totalCorrect: number;
  isConnected: boolean;
}

export type RoomStatus = 'waiting' | 'countdown' | 'in_game' | 'round_review' | 'finished';

export interface CompetitionRoom {
  code: string;
  status: RoomStatus;
  players: RoomPlayer[];
  questions: Question[];
  currentQuestionIndex: number;
  countdownSeconds: number;
  questionTimeLeft: number;
  totalQuestions: number;
  winnerId?: string | 'tie';
  createdAt: number;
}

