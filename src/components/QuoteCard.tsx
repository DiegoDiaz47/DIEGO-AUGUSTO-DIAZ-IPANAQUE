import React, { useState } from 'react';
import { Quote } from '../types';
import { MOOD_CONFIGS } from '../data/quotes';
import { Volume2, VolumeX, Heart, Copy, Check, Sparkles, RefreshCw, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuoteCardProps {
  quote: Quote | null;
  isSpeaking: boolean;
  onPlaySpeech: () => void;
  onStopSpeech: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  voiceEnabled: boolean;
  isLoadingAi?: boolean;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  isSpeaking,
  onPlaySpeech,
  onStopSpeech,
  isFavorite,
  onToggleFavorite,
  voiceEnabled,
  isLoadingAi = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!quote && !isLoadingAi) {
    return null;
  }

  const moodConfig = quote ? MOOD_CONFIGS[quote.mood] : null;

  const handleCopy = () => {
    if (!quote) return;
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!quote) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ánimo - Mensaje de Fuerza',
          text: `"${quote.text}" — ${quote.author}`,
          url: window.location.href,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative w-full">
      {/* Outer ambient glow based on mood color */}
      <div
        className="absolute -inset-1 rounded-3xl blur-2xl opacity-40 transition-all duration-700 pointer-events-none"
        style={{
          background: moodConfig
            ? `radial-gradient(circle, ${moodConfig.glowColor} 0%, rgba(11,13,24,0) 70%)`
            : 'radial-gradient(circle, rgba(124,108,255,0.3) 0%, rgba(11,13,24,0) 70%)',
        }}
      />

      <div className="relative overflow-hidden rounded-3xl bg-[#141830]/90 backdrop-blur-xl border border-white/10 p-6 sm:p-9 shadow-2xl transition-all">
        {/* Decorative subtle background accents */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-white/5 via-white/[0.02] to-transparent rounded-full pointer-events-none -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-[#7c6cff]/10 to-transparent rounded-full pointer-events-none -ml-8 -mb-8" />

        {isLoadingAi ? (
          <div className="py-14 sm:py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff7a59] to-[#7c6cff] flex items-center justify-center animate-spin">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-[#ff7a59] blur-lg opacity-50 animate-pulse" />
            </div>
            <p className="text-base sm:text-lg font-medium text-white">
              Sintetizando tu mensaje de fuerza...
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Conectando con tu estado de ánimo y tus reflexiones del diario para crear palabras que resuenen contigo hoy.
            </p>
          </div>
        ) : quote ? (
          <div>
            {/* Top metadata row */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {moodConfig && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md"
                    style={{
                      backgroundColor: `${moodConfig.accentColor}18`,
                      borderColor: `${moodConfig.accentColor}40`,
                      color: moodConfig.accentColor,
                    }}
                  >
                    <span>{moodConfig.emoji}</span>
                    <span>{moodConfig.label}</span>
                  </span>
                )}

                {quote.isAiGenerated && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-[#ff7a59]/20 to-[#7c6cff]/20 text-[#ff7a59] border border-[#ff7a59]/40">
                    <Sparkles className="w-3 h-3 text-[#ff7a59]" />
                    <span>Personalizado con IA</span>
                  </span>
                )}

                {quote.isCustom && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span>Frase propia</span>
                  </span>
                )}
              </div>

              {/* Top controls: favorite & share */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  className={`p-2 rounded-xl border transition-all ${
                    isFavorite
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  title="Compartir o copiar"
                  className="p-2 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Central large motivational quote */}
            <div className="py-2 sm:py-4">
              <span className="block font-serif text-5xl sm:text-6xl text-[#ff7a59]/30 leading-none select-none -mb-3 sm:-mb-5">
                “
              </span>
              <blockquote className="font-serif-quote text-2xl sm:text-3xl md:text-4xl text-slate-100 font-normal leading-relaxed tracking-tight select-text">
                {quote.text}
              </blockquote>
              <div className="mt-5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-[2px] w-6 bg-gradient-to-r from-[#ff7a59] to-[#7c6cff]" />
                  <cite className="not-italic text-sm sm:text-base font-medium text-slate-300">
                    {quote.author || 'Ánimo'}
                  </cite>
                </div>

                {/* Animated Speech indicator badge */}
                {isSpeaking && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff7a59]/15 border border-[#ff7a59]/30 text-[#ff7a59] text-xs font-medium animate-pulse">
                    <span className="w-1.5 h-3 bg-[#ff7a59] rounded-full animate-bounce" />
                    <span className="w-1.5 h-4 bg-[#ff7a59] rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-2.5 bg-[#ff7a59] rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="ml-1">Leyendo en voz alta...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
              {/* Voice action button */}
              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <button
                    type="button"
                    onClick={onStopSpeech}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition-all cursor-pointer"
                  >
                    <VolumeX className="w-4 h-4" />
                    <span>Pausar voz</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onPlaySpeech}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#ff7a59]" />
                    <span>Escuchar de nuevo</span>
                  </button>
                )}
              </div>

              {/* Copy confirmation feedback */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar frase</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
