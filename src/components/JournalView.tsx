import React, { useState } from 'react';
import { JournalEntry, MoodType } from '../types';
import { MOOD_CONFIGS } from '../data/quotes';
import { StorageService } from '../services/storage';
import { 
  BookHeart, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  Lock, 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  PlusCircle,
  Lightbulb
} from 'lucide-react';

interface JournalViewProps {
  entries: JournalEntry[];
  onRefreshEntries: () => void;
  onGenerateFromEntry?: (entry: JournalEntry) => void;
}

const INSPIRATIONAL_PROMPTS = [
  '¿Qué es lo que más te pesó o agotó en el día de hoy?',
  '¿De qué pequeña acción o decisión te sientes satisfecho?',
  '¿Qué pensamiento recurrente necesitas soltar en este momento?',
  '¿Qué meta pequeña quieres cumplir antes de terminar la jornada?',
  '¿Qué te dirías a ti mismo si fueras tu mejor amigo con compasión?',
];

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  onRefreshEntries,
  onGenerateFromEntry,
}) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterMood, setSelectedFilterMood] = useState<MoodType | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    StorageService.saveJournalEntry({
      content: content.trim(),
      mood,
    });

    setContent('');
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    onRefreshEntries();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta entrada de tu diario?')) {
      StorageService.deleteJournalEntry(id);
      onRefreshEntries();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUsePrompt = (prompt: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${prompt} ` : `${prompt} `));
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood =
      selectedFilterMood === 'all' || entry.mood === selectedFilterMood;
    return matchesSearch && matchesMood;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-6 pb-28 md:pb-12 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookHeart className="w-6 h-6 text-[#7c6cff]" />
            <span>Mi Diario Personal</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Un espacio seguro para vaciar tu mente, registrar tus metas y desahogar tus preocupaciones.
          </p>
        </div>

        {/* Privacy badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5" />
          <span>100% Privado y Local</span>
        </div>
      </div>

      {/* Writing Box Form */}
      <section className="bg-[#141830] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-4">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              ¿Cómo te sientes al escribir esto?
            </label>

            {/* Quick Mood Chips for Journal */}
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => {
                const cfg = MOOD_CONFIGS[m];
                const active = mood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      active
                        ? 'bg-[#7c6cff] text-white shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{cfg.emoji}</span>
                    <span>{cfg.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe lo que sientes hoy, tus pequeñas victorias, lo que te preocupa o tus metas del día..."
              rows={4}
              className="w-full bg-[#0b0d18] text-slate-100 placeholder:text-slate-500 border border-white/10 focus:border-[#7c6cff] focus:ring-1 focus:ring-[#7c6cff] rounded-2xl p-4 text-sm leading-relaxed resize-y min-h-[120px] outline-none transition-all"
            />
            <div className="absolute right-3 bottom-3 text-[11px] text-slate-500 pointer-events-none">
              {content.trim() ? `${content.trim().split(/\s+/).length} palabras` : '0 palabras'}
            </div>
          </div>

          {/* Prompt suggestions to spark writing */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-[#ff7a59]" />
              <span>Preguntas guía para reflexionar:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATIONAL_PROMPTS.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUsePrompt(prompt)}
                  className="text-[11px] text-slate-300 hover:text-white bg-white/5 hover:bg-[#ff7a59]/15 hover:border-[#ff7a59]/30 border border-white/5 rounded-xl px-2.5 py-1 text-left transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Submit row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Almacenamiento seguro en tu dispositivo.
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fadeIn">
                  <Check className="w-3.5 h-3.5" />
                  Guardado en tu diario
                </span>
              )}
              <button
                type="submit"
                disabled={!content.trim() || isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7c6cff] to-[#6366f1] text-white text-xs sm:text-sm font-semibold hover:from-[#6b58ff] hover:to-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#7c6cff]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Guardar entrada</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Entries List Header & Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Tus Entradas Guardadas</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-normal">
              {entries.length}
            </span>
          </h3>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar nota..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#141830] border border-white/5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-[#7c6cff]"
              />
            </div>

            {/* Filter by Mood */}
            <select
              value={selectedFilterMood}
              onChange={(e) => setSelectedFilterMood(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-[#141830] border border-white/5 text-xs text-slate-300 outline-none focus:border-[#7c6cff] cursor-pointer"
            >
              <option value="all">Todos los ánimos</option>
              {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => (
                <option key={m} value={m}>
                  {MOOD_CONFIGS[m].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-[#141830]/40 border border-white/5 p-6">
            <BookHeart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-300 mb-1">
              {searchQuery || selectedFilterMood !== 'all'
                ? 'No se encontraron entradas con ese filtro'
                : 'Tu diario está esperando tus palabras'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Escribe lo que sientes. No hay reglas, no hay calificaciones; solo un desahogo honesto para ti.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => {
              const cfg = MOOD_CONFIGS[entry.mood];
              const isCopied = copiedId === entry.id;

              return (
                <article
                  key={entry.id}
                  className="bg-[#141830]/80 hover:bg-[#141830] rounded-2xl border border-white/10 p-4 sm:p-5 transition-all shadow-md group"
                >
                  {/* Top entry metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${cfg.accentColor}15`,
                          borderColor: `${cfg.accentColor}35`,
                          color: cfg.accentColor,
                        }}
                      >
                        <span>{cfg.emoji}</span>
                        <span>{cfg.label}</span>
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatDate(entry.createdAt)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {onGenerateFromEntry && (
                        <button
                          type="button"
                          onClick={() => onGenerateFromEntry(entry)}
                          title="Generar mensaje de fuerza a partir de este diario"
                          className="p-1.5 rounded-lg text-[#ff7a59] hover:bg-[#ff7a59]/15 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopy(entry.id, entry.content)}
                        title="Copiar texto"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        title="Eliminar entrada"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Entry text */}
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text font-normal">
                    {entry.content}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
