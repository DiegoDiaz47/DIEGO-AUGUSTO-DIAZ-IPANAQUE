import React, { useState } from 'react';
import { MoodType, Quote, UserSettings } from '../types';
import { MOOD_CONFIGS } from '../data/quotes';
import { MoodSelector } from './MoodSelector';
import { QuoteCard } from './QuoteCard';
import { Sparkles, Zap, BookOpen, ChevronRight, ShieldCheck, Heart } from 'lucide-react';
import { StorageService } from '../services/storage';

interface MainViewProps {
  selectedMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  currentQuote: Quote | null;
  onNeedStrength: () => void;
  onGenerateAiStrength: () => void;
  isLoadingAi: boolean;
  isSpeaking: boolean;
  onPlaySpeech: () => void;
  onStopSpeech: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  settings: UserSettings;
  onNavigateToJournal: () => void;
}

export const MainView: React.FC<MainViewProps> = ({
  selectedMood,
  onSelectMood,
  currentQuote,
  onNeedStrength,
  onGenerateAiStrength,
  isLoadingAi,
  isSpeaking,
  onPlaySpeech,
  onStopSpeech,
  isFavorite,
  onToggleFavorite,
  settings,
  onNavigateToJournal,
}) => {
  const latestEntry = StorageService.getLatestJournalEntry();
  const currentMoodConfig = MOOD_CONFIGS[selectedMood];

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-3xl mx-auto px-4 pt-2">
      {/* Mood Selector Chips */}
      <section className="bg-[#141830]/60 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/5 shadow-xl">
        <MoodSelector
          selectedMood={selectedMood}
          onSelectMood={onSelectMood}
        />
      </section>

      {/* Motivational Central Card */}
      <section className="relative">
        <QuoteCard
          quote={currentQuote}
          isSpeaking={isSpeaking}
          onPlaySpeech={onPlaySpeech}
          onStopSpeech={onStopSpeech}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          voiceEnabled={settings.voiceEnabled}
          isLoadingAi={isLoadingAi}
        />
      </section>

      {/* Main Action Buttons */}
      <section className="space-y-3 pt-2">
        {/* BIG "Necesito fuerza" Button */}
        <button
          type="button"
          onClick={onNeedStrength}
          disabled={isLoadingAi}
          className="w-full relative group overflow-hidden rounded-2xl sm:rounded-3xl p-[2px] transition-all duration-300 transform active:scale-[0.98] cursor-pointer shadow-xl shadow-[#ff7a59]/20"
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff7a59] via-[#ff9259] to-[#7c6cff] group-hover:opacity-100 transition-opacity" />
          
          <div className="relative px-6 py-4 sm:py-5 bg-gradient-to-r from-[#ff7a59] via-[#ff6b4a] to-[#ff7a59] group-hover:from-[#ff8566] group-hover:to-[#7c6cff] rounded-[22px] sm:rounded-[26px] flex items-center justify-center gap-3 text-white font-bold text-lg sm:text-xl tracking-tight transition-all">
            <Zap className="w-6 h-6 fill-white text-white animate-bounce" />
            <span>Necesito fuerza</span>
            {settings.voiceEnabled && (
              <span className="text-xs font-normal opacity-90 px-2 py-0.5 rounded-full bg-black/20 border border-white/20">
                Léelo en voz alta
              </span>
            )}
          </div>
        </button>

        {/* AI Optional Generator Button (Connected with recent journal) */}
        {settings.useAiPersonalization && (
          <button
            type="button"
            onClick={onGenerateAiStrength}
            disabled={isLoadingAi}
            className="w-full group px-5 py-3.5 rounded-2xl bg-[#141830] hover:bg-[#1a2040] border border-[#7c6cff]/40 hover:border-[#7c6cff] text-slate-200 hover:text-white flex items-center justify-between transition-all duration-200 cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7c6cff]/30 to-[#ff7a59]/30 border border-[#7c6cff]/40 flex items-center justify-center text-[#ff7a59] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#ff7a59]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-white">
                  <span>Mensaje personalizado con IA</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#7c6cff]/20 text-[#a594fd]">
                    Gemini
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {latestEntry
                    ? 'Inspirado en tus notas recientes de Mi Diario'
                    : 'Personalizado para tu estado actual'}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
        )}
      </section>

      {/* Latest Journal Quick Glance or Encouragement to write */}
      <section className="bg-[#141830]/40 rounded-2xl border border-white/5 p-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <BookOpen className="w-4 h-4 text-[#7c6cff] shrink-0" />
          <div className="truncate">
            {latestEntry ? (
              <p className="text-slate-300 truncate">
                <span className="font-semibold text-white">Último diario: </span>
                <span className="italic text-slate-400">"{latestEntry.content}"</span>
              </p>
            ) : (
              <p className="text-slate-400">
                Escribe en <strong className="text-white">Mi Diario</strong> para desahogarte y obtener reflexiones personalizadas.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToJournal}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#7c6cff] hover:text-white font-medium transition-all"
        >
          {latestEntry ? 'Ver diario' : 'Escribir ahora'}
        </button>
      </section>

      {/* Privacy guarantee note */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tus reflexiones y notas se guardan de forma 100% privada y local en tu dispositivo.</span>
        </p>
      </div>
    </div>
  );
};
