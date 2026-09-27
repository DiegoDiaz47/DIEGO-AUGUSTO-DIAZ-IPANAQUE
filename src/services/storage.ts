import { JournalEntry, MoodType, MoodUsageRecord, NotificationFrequency, Quote, UserSettings } from '../types';
import { INITIAL_QUOTES } from '../data/quotes';

const STORAGE_KEYS = {
  JOURNAL: 'animo_local_journal_v1',
  CUSTOM_QUOTES: 'animo_local_custom_quotes_v1',
  FAVORITES: 'animo_local_favorites_v1',
  SETTINGS: 'animo_local_settings_v1',
  MOOD_HISTORY: 'animo_local_mood_history_v1',
  LAST_NOTIFICATION: 'animo_last_notification_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  voiceEnabled: true,
  voiceRate: 0.95,
  voicePitch: 1.0,
  notificationsEnabled: false,
  notificationFrequency: '1h',
  customHours: ['09:00', '14:00', '20:30'],
  useAiPersonalization: true,
};

// Safe localStorage wrapper
function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

export const StorageService = {
  // Journal entries
  getJournalEntries(): JournalEntry[] {
    return safeGetItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
  },

  saveJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): JournalEntry {
    const entries = this.getJournalEntries();
    const newEntry: JournalEntry = {
      ...entry,
      id: 'journal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    safeSetItem(STORAGE_KEYS.JOURNAL, updated);
    this.recordMoodUsage(entry.mood);
    return newEntry;
  },

  deleteJournalEntry(id: string): void {
    const entries = this.getJournalEntries().filter((e) => e.id !== id);
    safeSetItem(STORAGE_KEYS.JOURNAL, entries);
  },

  getLatestJournalEntry(): JournalEntry | null {
    const entries = this.getJournalEntries();
    return entries.length > 0 ? entries[0] : null;
  },

  // Custom quotes
  getCustomQuotes(): Quote[] {
    return safeGetItem<Quote[]>(STORAGE_KEYS.CUSTOM_QUOTES, []);
  },

  addCustomQuote(quote: Omit<Quote, 'id' | 'isCustom' | 'createdAt'>): Quote {
    const customQuotes = this.getCustomQuotes();
    const newQuote: Quote = {
      ...quote,
      id: 'custom_' + Date.now(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    safeSetItem(STORAGE_KEYS.CUSTOM_QUOTES, [newQuote, ...customQuotes]);
    return newQuote;
  },

  deleteCustomQuote(id: string): void {
    const customQuotes = this.getCustomQuotes().filter((q) => q.id !== id);
    safeSetItem(STORAGE_KEYS.CUSTOM_QUOTES, customQuotes);
  },

  getAllQuotesForMood(mood: MoodType): Quote[] {
    const base = INITIAL_QUOTES.filter((q) => q.mood === mood);
    const custom = this.getCustomQuotes().filter((q) => q.mood === mood);
    return [...custom, ...base];
  },

  // Favorites
  getFavorites(): Quote[] {
    return safeGetItem<Quote[]>(STORAGE_KEYS.FAVORITES, []);
  },

  isFavorite(quoteId: string): boolean {
    return this.getFavorites().some((f) => f.id === quoteId);
  },

  toggleFavorite(quote: Quote): boolean {
    const favs = this.getFavorites();
    const exists = favs.some((f) => f.id === quote.id);
    let updated: Quote[];
    if (exists) {
      updated = favs.filter((f) => f.id !== quote.id);
    } else {
      updated = [quote, ...favs];
    }
    safeSetItem(STORAGE_KEYS.FAVORITES, updated);
    return !exists;
  },

  // Settings
  getSettings(): UserSettings {
    const saved = safeGetItem<Partial<UserSettings>>(STORAGE_KEYS.SETTINGS, {});
    return { ...DEFAULT_SETTINGS, ...saved };
  },

  saveSettings(newSettings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    safeSetItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // Mood history for calculating the most recently used mood
  recordMoodUsage(mood: MoodType): void {
    const history = safeGetItem<MoodUsageRecord[]>(STORAGE_KEYS.MOOD_HISTORY, []);
    // Keep last 40 mood records
    const updated = [{ mood, timestamp: Date.now() }, ...history].slice(0, 40);
    safeSetItem(STORAGE_KEYS.MOOD_HISTORY, updated);
  },

  getMostUsedRecentMood(): MoodType {
    const history = safeGetItem<MoodUsageRecord[]>(STORAGE_KEYS.MOOD_HISTORY, []);
    if (history.length === 0) return 'general';

    // Count frequency within the history (weight recent ones higher)
    const counts: Partial<Record<MoodType, number>> = {};
    history.forEach((record, index) => {
      // Recent records have higher weight
      const weight = Math.max(1, 10 - Math.floor(index / 4));
      counts[record.mood] = (counts[record.mood] || 0) + weight;
    });

    let bestMood: MoodType = 'general';
    let maxScore = -1;
    (Object.keys(counts) as MoodType[]).forEach((m) => {
      const score = counts[m] || 0;
      if (score > maxScore) {
        maxScore = score;
        bestMood = m;
      }
    });

    return bestMood;
  },

  // Backup data
  exportData(): string {
    const data = {
      journal: this.getJournalEntries(),
      customQuotes: this.getCustomQuotes(),
      favorites: this.getFavorites(),
      settings: this.getSettings(),
      moodHistory: safeGetItem<MoodUsageRecord[]>(STORAGE_KEYS.MOOD_HISTORY, []),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.journal) safeSetItem(STORAGE_KEYS.JOURNAL, parsed.journal);
      if (parsed.customQuotes) safeSetItem(STORAGE_KEYS.CUSTOM_QUOTES, parsed.customQuotes);
      if (parsed.favorites) safeSetItem(STORAGE_KEYS.FAVORITES, parsed.favorites);
      if (parsed.settings) safeSetItem(STORAGE_KEYS.SETTINGS, parsed.settings);
      if (parsed.moodHistory) safeSetItem(STORAGE_KEYS.MOOD_HISTORY, parsed.moodHistory);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },
};
