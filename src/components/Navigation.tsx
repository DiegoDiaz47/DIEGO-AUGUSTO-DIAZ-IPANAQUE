import React from 'react';
import { Sparkles, BookHeart, Bookmark, Settings2, Volume2, VolumeX } from 'lucide-react';

export type ActiveTab = 'home' | 'journal' | 'quotes' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  journalCount: number;
  favoritesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  voiceEnabled,
  onToggleVoice,
  journalCount,
  favoritesCount,
}) => {
  return (
    <>
      {/* Desktop / Tablet Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b0d18]/85 border-b border-white/5 transition-all">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff7a59] via-[#7c6cff] to-[#3b82f6] p-[2px] shadow-lg shadow-[#7c6cff]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0d18] rounded-[14px] flex items-center justify-center">
                <span className="font-bold text-lg bg-gradient-to-tr from-[#ff7a59] to-[#7c6cff] bg-clip-text text-transparent">Á</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Ánimo
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#ff7a59]/15 text-[#ff7a59] border border-[#ff7a59]/30">
                  Bienestar
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">Motivación y calma interior</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-[#141830]/90 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-[#7c6cff] to-[#6366f1] text-white shadow-md shadow-[#7c6cff]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Inicio</span>
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all relative ${
                activeTab === 'journal'
                  ? 'bg-gradient-to-r from-[#7c6cff] to-[#6366f1] text-white shadow-md shadow-[#7c6cff]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookHeart className="w-4 h-4" />
              <span>Mi Diario</span>
              {journalCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-medium">
                  {journalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all relative ${
                activeTab === 'quotes'
                  ? 'bg-gradient-to-r from-[#7c6cff] to-[#6366f1] text-white shadow-md shadow-[#7c6cff]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Mis Frases</span>
              {favoritesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ff7a59] text-white font-medium">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-[#7c6cff] to-[#6366f1] text-white shadow-md shadow-[#7c6cff]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>Ajustes</span>
            </button>
          </nav>

          {/* Quick Voice Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleVoice}
              title={voiceEnabled ? 'Voz activada (clic para silenciar)' : 'Voz desactivada (clic para activar)'}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                voiceEnabled
                  ? 'bg-[#ff7a59]/15 text-[#ff7a59] border-[#ff7a59]/40 hover:bg-[#ff7a59]/25 shadow-sm shadow-[#ff7a59]/20'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#ff7a59] animate-pulse" />
                  <span className="hidden sm:inline">Voz activa</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline">Voz apagada</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0b0d18]/95 backdrop-blur-2xl border-t border-white/10 px-3 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
              activeTab === 'home'
                ? 'text-[#ff7a59] scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-[#ff7a59]/15 shadow-sm shadow-[#ff7a59]/30' : ''}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all relative ${
              activeTab === 'journal'
                ? 'text-[#7c6cff] scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'journal' ? 'bg-[#7c6cff]/15 shadow-sm shadow-[#7c6cff]/30' : ''}`}>
              <BookHeart className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Mi Diario</span>
            {journalCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#7c6cff] ring-2 ring-[#0b0d18]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all relative ${
              activeTab === 'quotes'
                ? 'text-[#ff7a59] scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'quotes' ? 'bg-[#ff7a59]/15 shadow-sm shadow-[#ff7a59]/30' : ''}`}>
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Mis Frases</span>
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#ff7a59] ring-2 ring-[#0b0d18]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
              activeTab === 'settings'
                ? 'text-white scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10' : ''}`}>
              <Settings2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Ajustes</span>
          </button>
        </div>
      </div>
    </>
  );
};
