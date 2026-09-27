import React from 'react';
import { MoodType } from '../types';
import { MOOD_CONFIGS } from '../data/quotes';
import { Sparkles, Moon, Flame, Zap, Wind, HeartHandshake } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  className?: string;
}

const ICONS_MAP: Record<MoodType, React.ReactNode> = {
  general: <Sparkles className="w-4 h-4" />,
  tired: <Moon className="w-4 h-4" />,
  unmotivated: <Flame className="w-4 h-4" />,
  procrastinating: <Zap className="w-4 h-4" />,
  anxious: <Wind className="w-4 h-4" />,
  self_recognition: <HeartHandshake className="w-4 h-4" />,
};

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  className = '',
}) => {
  const moods: MoodType[] = [
    'general',
    'tired',
    'unmotivated',
    'procrastinating',
    'anxious',
    'self_recognition',
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>¿Cómo te sientes en este instante?</span>
        </label>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          {MOOD_CONFIGS[selectedMood].description}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {moods.map((moodKey) => {
          const config = MOOD_CONFIGS[moodKey];
          const isSelected = selectedMood === moodKey;

          return (
            <button
              key={moodKey}
              type="button"
              onClick={() => onSelectMood(moodKey)}
              className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'bg-[#141830]/80 text-slate-300 hover:text-white hover:bg-[#1a2040] border border-white/5'
              }`}
              style={{
                backgroundColor: isSelected ? config.accentColor : undefined,
                boxShadow: isSelected
                  ? `0 10px 25px -5px ${config.glowColor}, 0 4px 6px -2px rgba(0,0,0,0.4)`
                  : undefined,
              }}
            >
              <span className="text-base select-none">{config.emoji}</span>
              <span className="flex items-center gap-1.5">
                {config.label}
              </span>

              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
