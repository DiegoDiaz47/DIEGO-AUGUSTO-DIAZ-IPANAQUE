import React, { useState } from 'react';
import { MoodType, Quote } from '../types';
import { MOOD_CONFIGS, INITIAL_QUOTES } from '../data/quotes';
import { StorageService } from '../services/storage';
import { speechService } from '../services/tts';
import { 
  Bookmark, 
  Heart, 
  Plus, 
  Trash2, 
  Volume2, 
  Sparkles, 
  Filter, 
  Share2, 
  Check, 
  Copy 
} from 'lucide-react';

interface QuotesLibraryViewProps {
  favorites: Quote[];
  customQuotes: Quote[];
  onRefreshQuotes: () => void;
  onSelectAsCurrentQuote: (quote: Quote) => void;
  voiceEnabled: boolean;
}

export const QuotesLibraryView: React.FC<QuotesLibraryViewProps> = ({
  favorites,
  customQuotes,
  onRefreshQuotes,
  onSelectAsCurrentQuote,
  voiceEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'custom' | 'all'>('favorites');
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state for adding custom quote
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [newText, setNewText] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newMood, setNewMood] = useState<MoodType>('general');

  const handleAddCustomQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    StorageService.addCustomQuote({
      text: newText.trim(),
      author: newAuthor.trim() || 'Mi autoría',
      mood: newMood,
    });

    setNewText('');
    setNewAuthor('');
    setIsAddingQuote(false);
    onRefreshQuotes();
  };

  const handleDeleteCustom = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta frase personalizada?')) {
      StorageService.deleteCustomQuote(id);
      onRefreshQuotes();
    }
  };

  const handleToggleFavorite = (quote: Quote) => {
    StorageService.toggleFavorite(quote);
    onRefreshQuotes();
  };

  const handleCopy = (id: string, text: string, author: string) => {
    navigator.clipboard.writeText(`"${text}" — ${author}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (quote: Quote) => {
    speechService.speak(quote.text);
  };

  // Determine quotes to display
  let displayQuotes: Quote[] = [];
  if (activeTab === 'favorites') {
    displayQuotes = favorites;
  } else if (activeTab === 'custom') {
    displayQuotes = customQuotes;
  } else {
    // All quotes
    displayQuotes = [...customQuotes, ...INITIAL_QUOTES];
  }

  if (selectedMood !== 'all') {
    displayQuotes = displayQuotes.filter((q) => q.mood === selectedMood);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-6 pb-28 md:pb-12 pt-2">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#ff7a59]" />
            <span>Biblioteca de Frases</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Tus citas favoritas, frases propias y la colección completa de sabiduría.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingQuote(!isAddingQuote)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff7a59] to-[#ff9259] text-white text-xs sm:text-sm font-semibold hover:brightness-110 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar mi frase</span>
        </button>
      </div>

      {/* Add Custom Quote Box Modal/Drawer */}
      {isAddingQuote && (
        <section className="bg-[#141830] rounded-3xl border border-[#ff7a59]/30 p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#ff7a59]" />
            <span>Crear frase motivacional propia</span>
          </h3>

          <form onSubmit={handleAddCustomQuote} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Frase o afirmación que te da fuerza:
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Escribe aquí tu frase inspiradora..."
                rows={3}
                className="w-full bg-[#0b0d18] text-slate-100 placeholder:text-slate-500 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#ff7a59]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Autor / Origen (opcional):
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Ej: Yo mismo, Mi abuela, Séneca..."
                  className="w-full bg-[#0b0d18] text-slate-100 placeholder:text-slate-500 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ff7a59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Categoría de ánimo:
                </label>
                <select
                  value={newMood}
                  onChange={(e) => setNewMood(e.target.value as MoodType)}
                  className="w-full bg-[#0b0d18] text-slate-100 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ff7a59] cursor-pointer"
                >
                  {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => (
                    <option key={m} value={m}>
                      {MOOD_CONFIGS[m].emoji} {MOOD_CONFIGS[m].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingQuote(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newText.trim()}
                className="px-5 py-2 rounded-xl bg-[#ff7a59] text-white text-xs font-semibold hover:bg-[#ff6842] disabled:opacity-50"
              >
                Guardar frase
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Tabs Switcher: Favoritas, Frases Propias, Todas */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#141830] rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Favoritas</span>
            <span className="text-[10px] px-1 rounded-full bg-white/20">
              {favorites.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#ff7a59] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mis Propias</span>
            <span className="text-[10px] px-1 rounded-full bg-white/20">
              {customQuotes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#7c6cff] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Colección Total</span>
          </button>
        </div>

        {/* Mood filter dropdown */}
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value as any)}
          className="px-3 py-1.5 rounded-xl bg-[#141830] border border-white/5 text-xs text-slate-300 outline-none focus:border-[#7c6cff] cursor-pointer"
        >
          <option value="all">Todas las categorías</option>
          {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => (
            <option key={m} value={m}>
              {MOOD_CONFIGS[m].emoji} {MOOD_CONFIGS[m].label}
            </option>
          ))}
        </select>
      </div>

      {/* Quotes Grid / List */}
      {displayQuotes.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-[#141830]/40 border border-white/5 p-6">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300 mb-1">
            {activeTab === 'favorites'
              ? 'No tienes frases favoritas aún'
              : activeTab === 'custom'
              ? 'Aún no has agregado frases propias'
              : 'No hay frases en esta categoría'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'favorites'
              ? 'Toca el ícono de corazón en cualquier frase para tenerla siempre a mano aquí.'
              : 'Agrega tus mantras personales o citas que te inspiren a seguir adelante.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayQuotes.map((q) => {
            const cfg = MOOD_CONFIGS[q.mood];
            const isFav = favorites.some((f) => f.id === q.id);
            const isCopied = copiedId === q.id;

            return (
              <div
                key={q.id}
                className="bg-[#141830]/80 hover:bg-[#141830] rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col justify-between transition-all shadow-md group relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                      style={{
                        backgroundColor: `${cfg.accentColor}15`,
                        borderColor: `${cfg.accentColor}35`,
                        color: cfg.accentColor,
                      }}
                    >
                      <span>{cfg.emoji}</span>
                      <span>{cfg.shortLabel}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(q)}
                        title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isFav
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400 text-rose-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSpeak(q)}
                        title="Escuchar en voz alta"
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(q.id, q.text, q.author)}
                        title="Copiar frase"
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/5"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {q.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustom(q.id)}
                          title="Eliminar frase propia"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-100 leading-relaxed font-serif-quote">
                    “{q.text}”
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">— {q.author || 'Ánimo'}</span>

                  <button
                    type="button"
                    onClick={() => onSelectAsCurrentQuote(q)}
                    className="text-[11px] text-[#ff7a59] hover:underline font-semibold"
                  >
                    Mostrar en inicio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
