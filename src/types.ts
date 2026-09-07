export type MoodType =
  | 'Vreugdevol'
  | 'Kalm'
  | 'Dankbaar'
  | 'Gefocust'
  | 'Peinzend'
  | 'Gestrest'
  | 'Energiek'
  | 'Melancholisch';

export interface MoodMeta {
  type: MoodType;
  label: string;
  emoji: string;
  bgLight: string;
  textColor: string;
  dotColor: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string or YYYY-MM-DD
  createdAt: number; // timestamp
  updatedAt?: number;
  mood: MoodType;
  emoji: string;
  photos: string[]; // base64 or URL strings
  aiInsight?: string;
  tags?: string[];
}

export interface WeeklyInsight {
  summary: string;
  keyThemes: string[];
  moodTrend: string;
  encouragement: string;
  updatedAt: string;
}

export interface AppSettings {
  userName: string;
  pinEnabled: boolean;
  pinCode: string; // e.g. "1234"
  isLocked: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // e.g. "20:30"
}

export interface DailyQuote {
  id: string;
  text: string;
  author: string;
  theme?: string;
  reflection?: string;
  date?: string; // YYYY-MM-DD
  isGenerated?: boolean;
}
