import React from 'react';
import { AppNotification } from '../services/notifications';
import { MOOD_CONFIGS } from '../data/quotes';
import { Bell, Volume2, X } from 'lucide-react';
import { speechService } from '../services/tts';

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  voiceEnabled: boolean;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  voiceEnabled,
}) => {
  if (!notification) return null;

  const moodConfig = MOOD_CONFIGS[notification.mood];

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speak(notification.body);
  };

  return (
    <aside 
      aria-label="Notificación de Ánimo"
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-bounce-in"
    >
      <div className="bg-[#141830]/95 backdrop-blur-xl border border-[#ff7a59]/40 rounded-2xl p-4 shadow-2xl shadow-[#ff7a59]/20 flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: `${moodConfig.accentColor}20`,
            borderColor: `${moodConfig.accentColor}40`,
            color: moodConfig.accentColor,
          }}
        >
          <span className="text-lg select-none">{moodConfig.emoji}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 truncate">
              <span>{notification.title}</span>
            </h4>
            <span className="text-[10px] text-[#ff7a59] font-medium shrink-0">Ahora</span>
          </div>

          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
            {notification.body}
          </p>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
            {voiceEnabled && (
              <button
                type="button"
                onClick={handleSpeak}
                className="text-[11px] font-semibold text-[#ff7a59] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar en voz alta</span>
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
