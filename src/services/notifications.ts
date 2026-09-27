import { StorageService } from './storage';
import { MOOD_CONFIGS } from '../data/quotes';
import { MoodType, NotificationFrequency, Quote } from '../types';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  mood: MoodType;
  timestamp: number;
}

type NotificationListener = (notification: AppNotification) => void;

class LocalNotificationManager {
  private timerId: any = null;
  private listeners: Set<NotificationListener> = new Set();
  private lastTriggerTime: number = 0;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initServiceWorker();
  }

  private async initServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = reg;
      } catch (err) {
        console.warn('Could not register SW for notifications:', err);
      }
    }
  }

  public subscribe(listener: NotificationListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  public async triggerNotification(quote?: Quote): Promise<AppNotification> {
    // 1. Determine mood: most used recently
    const targetMood = quote ? quote.mood : StorageService.getMostUsedRecentMood();
    const moodConfig = MOOD_CONFIGS[targetMood];

    // 2. Select quote
    let selectedQuote = quote;
    if (!selectedQuote) {
      const quotes = StorageService.getAllQuotesForMood(targetMood);
      selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }

    const title = `Ánimo • ${moodConfig.emoji} ${moodConfig.label}`;
    const body = `"${selectedQuote.text}" — ${selectedQuote.author}`;

    const appNotification: AppNotification = {
      id: 'notif_' + Date.now(),
      title,
      body,
      mood: targetMood,
      timestamp: Date.now(),
    };

    // 3. Dispatch native notification if allowed
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        if (this.swRegistration && this.swRegistration.showNotification) {
          await this.swRegistration.showNotification(title, {
            body,
            icon: '/icon.png',
            badge: '/icon.png',
            tag: 'animo-reminder',
            data: { quoteId: selectedQuote.id },
          });
        } else {
          new Notification(title, {
            body,
            icon: '/icon.png',
          });
        }
      } catch (err) {
        console.warn('Native notification display error:', err);
      }
    }

    // 4. Dispatch to in-app listeners
    this.listeners.forEach((listener) => {
      try {
        listener(appNotification);
      } catch (e) {
        console.error('Error in notification listener:', e);
      }
    });

    this.lastTriggerTime = Date.now();
    return appNotification;
  }

  public startScheduler() {
    this.stopScheduler();

    // Check every 30 seconds
    this.timerId = setInterval(() => {
      this.checkSchedule();
    }, 30000);

    // Initial check
    this.checkSchedule();
  }

  public stopScheduler() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private checkSchedule() {
    const settings = StorageService.getSettings();
    if (!settings.notificationsEnabled) return;

    const now = new Date();
    const currentMillis = now.getTime();

    if (settings.notificationFrequency === 'custom') {
      // Check if current time matches any of the custom hours (HH:mm)
      const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (settings.customHours.includes(currentHourMinute)) {
        // Ensure we don't trigger multiple times in the same minute
        if (currentMillis - this.lastTriggerTime > 65000) {
          this.triggerNotification();
        }
      }
      return;
    }

    // Interval frequencies
    const intervalMap: Record<NotificationFrequency, number> = {
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '2h': 120 * 60 * 1000,
      custom: 60 * 60 * 1000,
    };

    const interval = intervalMap[settings.notificationFrequency] || 60 * 60 * 1000;
    if (this.lastTriggerTime === 0) {
      this.lastTriggerTime = currentMillis; // Initialize from first start
      return;
    }

    if (currentMillis - this.lastTriggerTime >= interval) {
      this.triggerNotification();
    }
  }
}

export const notificationManager = new LocalNotificationManager();
