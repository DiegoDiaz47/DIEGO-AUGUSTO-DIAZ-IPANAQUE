import React, { useState, useEffect, useCallback } from 'react';
import { JournalEntry, MoodType, Quote, UserSettings } from './types';
import { MOOD_CONFIGS, INITIAL_QUOTES } from './data/quotes';
import { StorageService } from './services/storage';
import { speechService } from './services/tts';
import { notificationManager, AppNotification } from './services/notifications';

import { Navigation, ActiveTab } from './components/Navigation';
import { MainView } from './components/MainView';
import { JournalView } from './components/JournalView';
import { QuotesLibraryView } from './components/QuotesLibraryView';
import { SettingsView } from './components/SettingsView';
import { NotificationToast } from './components/NotificationToast';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedMood, setSelectedMood] = useState<MoodType>('general');
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  // Persisted state
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => StorageService.getJournalEntries());
  const [customQuotes, setCustomQuotes] = useState<Quote[]>(() => StorageService.getCustomQuotes());
  const [favorites, setFavorites] = useState<Quote[]>(() => StorageService.getFavorites());

  // In-app notification toast
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

  // Initialize random quote on first render
  useEffect(() => {
    const recentMood = StorageService.getMostUsedRecentMood();
    setSelectedMood(recentMood);
    const quotes = StorageService.getAllQuotesForMood(recentMood);
    if (quotes.length > 0) {
      const initial = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(initial);
    }
  }, []);

  // Sync notification manager with settings
  useEffect(() => {
    if (settings.notificationsEnabled) {
      notificationManager.startScheduler();
    } else {
      notificationManager.stopScheduler();
    }

    const unsubscribe = notificationManager.subscribe((notif) => {
      setActiveNotification(notif);
      setTimeout(() => {
        setActiveNotification((prev) => (prev?.id === notif.id ? null : prev));
      }, 7000);
    });

    return () => {
      unsubscribe();
      notificationManager.stopScheduler();
    };
  }, [settings.notificationsEnabled, settings.notificationFrequency, settings.customHours]);

  // Handle changing mood chips
  const handleSelectMood = (mood: MoodType) => {
    setSelectedMood(mood);
    StorageService.recordMoodUsage(mood);
    // Pick a matching quote for this mood
    const quotes = StorageService.getAllQuotesForMood(mood);
    if (quotes.length > 0) {
      const filtered = quotes.filter((q) => q.id !== currentQuote?.id);
      const nextQuote = filtered.length > 0
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : quotes[0];
      setCurrentQuote(nextQuote);
    }
  };

  // Speak quote function
  const speakCurrentQuote = useCallback((quoteToSpeak: Quote) => {
    if (!settings.voiceEnabled) return;

    speechService.speak(quoteToSpeak.text, {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      callbacks: {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      },
    });
  }, [settings.voiceEnabled, settings.voiceRate, settings.voicePitch]);

  // Main Action: "Necesito fuerza"
  const handleNeedStrength = () => {
    // 1. Get quotes for selected mood
    const quotes = StorageService.getAllQuotesForMood(selectedMood);
    if (quotes.length === 0) return;

    // Pick a random quote distinct from current if possible
    const available = quotes.filter((q) => q.id !== currentQuote?.id);
    const chosenQuote = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : quotes[Math.floor(Math.random() * quotes.length)];

    setCurrentQuote(chosenQuote);
    StorageService.recordMoodUsage(selectedMood);

    // Read aloud if voice is enabled
    speakCurrentQuote(chosenQuote);
  };

  // Optional AI Action: Generate personalized strength quote using Gemini
  const handleGenerateAiStrength = async (specificJournalEntry?: JournalEntry) => {
    setIsLoadingAi(true);
    speechService.stop();
    setIsSpeaking(false);

    const latestJournal = specificJournalEntry || StorageService.getLatestJournalEntry();
    const moodConfig = MOOD_CONFIGS[selectedMood];

    try {
      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          moodLabel: moodConfig.label,
          latestJournalEntry: latestJournal?.content || '',
        }),
      });

      const data = await res.json();

      if (res.ok && data.message) {
        const aiQuote: Quote = {
          id: 'ai_' + Date.now(),
          text: data.message,
          author: data.author || 'Ánimo IA',
          mood: selectedMood,
          isAiGenerated: true,
          createdAt: new Date().toISOString(),
        };

        setCurrentQuote(aiQuote);
        StorageService.recordMoodUsage(selectedMood);
        speakCurrentQuote(aiQuote);
      } else {
        // Fallback to rich pre-defined quote if server returns error or key is not provided
        console.warn('Fallback to local quote:', data.error);
        handleNeedStrength();
      }
    } catch (err) {
      console.error('AI generation fetch error:', err);
      // Fallback
      handleNeedStrength();
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Voice toggle
  const handleToggleVoice = () => {
    const nextVoiceState = !settings.voiceEnabled;
    const updated = StorageService.saveSettings({ voiceEnabled: nextVoiceState });
    setSettings(updated);
    if (!nextVoiceState) {
      speechService.stop();
      setIsSpeaking(false);
    }
  };

  // Manual speech controls
  const handlePlaySpeech = () => {
    if (currentQuote) {
      speakCurrentQuote(currentQuote);
    }
  };

  const handleStopSpeech = () => {
    speechService.stop();
    setIsSpeaking(false);
  };

  // Favorite toggle
  const handleToggleFavorite = () => {
    if (!currentQuote) return;
    StorageService.toggleFavorite(currentQuote);
    setFavorites(StorageService.getFavorites());
  };

  // Settings update
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = StorageService.saveSettings(newSettings);
    setSettings(updated);
  };

  // Refresh helper for child components
  const refreshJournal = () => {
    setJournalEntries(StorageService.getJournalEntries());
  };

  const refreshCustomQuotes = () => {
    setCustomQuotes(StorageService.getCustomQuotes());
    setFavorites(StorageService.getFavorites());
  };

  const handleTriggerTestNotification = async () => {
    const notif = await notificationManager.triggerNotification();
    setActiveNotification(notif);
  };

  return (
    <div className="min-h-screen bg-[#0b0d18] text-slate-100 flex flex-col font-sans selection:bg-[#ff7a59] selection:text-white">
      {/* Toast Notification Alert */}
      <NotificationToast
        notification={activeNotification}
        onDismiss={() => setActiveNotification(null)}
        voiceEnabled={settings.voiceEnabled}
      />

      {/* Top Header & Mobile Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        voiceEnabled={settings.voiceEnabled}
        onToggleVoice={handleToggleVoice}
        journalCount={journalEntries.length}
        favoritesCount={favorites.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full pt-4">
        {activeTab === 'home' && (
          <MainView
            selectedMood={selectedMood}
            onSelectMood={handleSelectMood}
            currentQuote={currentQuote}
            onNeedStrength={handleNeedStrength}
            onGenerateAiStrength={handleGenerateAiStrength}
            isLoadingAi={isLoadingAi}
            isSpeaking={isSpeaking}
            onPlaySpeech={handlePlaySpeech}
            onStopSpeech={handleStopSpeech}
            isFavorite={currentQuote ? StorageService.isFavorite(currentQuote.id) : false}
            onToggleFavorite={handleToggleFavorite}
            settings={settings}
            onNavigateToJournal={() => setActiveTab('journal')}
          />
        )}

        {activeTab === 'journal' && (
          <JournalView
            entries={journalEntries}
            onRefreshEntries={refreshJournal}
            onGenerateFromEntry={(entry) => {
              setSelectedMood(entry.mood);
              setActiveTab('home');
              handleGenerateAiStrength(entry);
            }}
          />
        )}

        {activeTab === 'quotes' && (
          <QuotesLibraryView
            favorites={favorites}
            customQuotes={customQuotes}
            onRefreshQuotes={refreshCustomQuotes}
            onSelectAsCurrentQuote={(q) => {
              setCurrentQuote(q);
              setSelectedMood(q.mood);
              setActiveTab('home');
            }}
            voiceEnabled={settings.voiceEnabled}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            customQuotes={customQuotes}
            onRefreshCustomQuotes={refreshCustomQuotes}
            onTriggerTestNotification={handleTriggerTestNotification}
          />
        )}
      </main>
    </div>
  );
}
