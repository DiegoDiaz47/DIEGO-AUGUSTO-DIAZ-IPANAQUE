export type MoodType = 
  | 'general'
  | 'tired'
  | 'unmotivated'
  | 'procrastinating'
  | 'anxious'
  | 'self_recognition';

export interface MoodConfig {
  id: MoodType;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  accentColor: string; // Tailwind color class or hex
  glowColor: string;
  gradient: string;
  emoji: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  mood: MoodType;
  isCustom?: boolean;
  isAiGenerated?: boolean;
  createdAt?: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  mood: MoodType;
  createdAt: string;
  title?: string;
  updatedAt?: string;
}

export type NotificationFrequency = '15m' | '30m' | '1h' | '2h' | 'custom';

export interface UserSettings {
  voiceEnabled: boolean;
  voiceRate: number;
  voicePitch: number;
  notificationsEnabled: boolean;
  notificationFrequency: NotificationFrequency;
  customHours: string[]; // e.g. ["09:00", "14:30", "21:00"]
  useAiPersonalization: boolean; // Generate AI quote based on latest journal entry
}

export interface MoodUsageRecord {
  mood: MoodType;
  timestamp: number;
}
