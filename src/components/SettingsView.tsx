import React, { useState } from 'react';
import { MoodType, NotificationFrequency, Quote, UserSettings } from '../types';
import { MOOD_CONFIGS } from '../data/quotes';
import { StorageService } from '../services/storage';
import { notificationManager } from '../services/notifications';
import { speechService } from '../services/tts';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  Sparkles, 
  Plus, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  Download, 
  Upload, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  customQuotes: Quote[];
  onRefreshCustomQuotes: () => void;
  onTriggerTestNotification: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  customQuotes,
  onRefreshCustomQuotes,
  onTriggerTestNotification,
}) => {
  // Notification custom hours state
  const [newTime, setNewTime] = useState('09:00');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    notificationManager.getPermissionStatus()
  );

  // Custom quote form state
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteMood, setQuoteMood] = useState<MoodType>('general');
  const [quoteSavedSuccess, setQuoteSavedSuccess] = useState(false);

  // Backup state
  const [exportNotice, setExportNotice] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Most used mood for notifications
  const mostUsedMood = StorageService.getMostUsedRecentMood();
  const mostUsedMoodConfig = MOOD_CONFIGS[mostUsedMood];

  const handleRequestPermission = async () => {
    const res = await notificationManager.requestPermission();
    setPermissionStatus(res);
    if (res === 'granted') {
      onUpdateSettings({ notificationsEnabled: true });
    }
  };

  const handleToggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      if (permissionStatus !== 'granted') {
        const res = await notificationManager.requestPermission();
        setPermissionStatus(res);
        if (res !== 'granted') {
          alert('Por favor habilita los permisos de notificación en tu navegador para recibir recordatorios.');
          return;
        }
      }
      onUpdateSettings({ notificationsEnabled: true });
    } else {
      onUpdateSettings({ notificationsEnabled: false });
    }
  };

  const handleAddCustomHour = () => {
    if (!newTime) return;
    if (settings.customHours.includes(newTime)) return;
    const updated = [...settings.customHours, newTime].sort();
    onUpdateSettings({ customHours: updated });
  };

  const handleRemoveCustomHour = (hour: string) => {
    const updated = settings.customHours.filter((h) => h !== hour);
    onUpdateSettings({ customHours: updated });
  };

  const handleSaveCustomQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    StorageService.addCustomQuote({
      text: quoteText.trim(),
      author: quoteAuthor.trim() || 'Mi autoría',
      mood: quoteMood,
    });

    setQuoteText('');
    setQuoteAuthor('');
    setQuoteSavedSuccess(true);
    setTimeout(() => setQuoteSavedSuccess(false), 2500);
    onRefreshCustomQuotes();
  };

  const handleDeleteCustomQuote = (id: string) => {
    StorageService.deleteCustomQuote(id);
    onRefreshCustomQuotes();
  };

  const handleTestVoice = () => {
    speechService.speak('Hola, esta es la voz de Ánimo lista para acompañarte con fuerza.', {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
    });
  };

  const handleExportBackup = () => {
    const json = StorageService.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importData(content);
      if (success) {
        setImportStatus('Copia de seguridad restaurada con éxito.');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('Error: El archivo no es válido.');
      }
    };
    reader.readAsText(file);
  };

  const detectedVoice = speechService.getSpanishVoice();

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-8 pb-32 md:pb-16 pt-2">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Configuración</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Personaliza tus recordatorios locales, voz hablada y tus propias frases.
        </p>
      </div>

      {/* 1. SECCIÓN: RECORDATORIOS Y NOTIFICACIONES LOCALES */}
      <section className="bg-[#141830] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff7a59]/15 border border-[#ff7a59]/30 flex items-center justify-center text-[#ff7a59]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Recordatorios Locales</h3>
              <p className="text-xs text-slate-400">
                Notificaciones periódicas en tu dispositivo con frases de fuerza
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleNotifications}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              settings.notificationsEnabled ? 'bg-[#ff7a59]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Permission status warning if denied or not granted */}
        {permissionStatus !== 'granted' && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Para recibir recordatorios cuando la app esté en segundo plano, se necesitan permisos del navegador.</span>
            </div>
            <button
              type="button"
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-semibold self-start sm:self-auto hover:bg-amber-400 transition-all cursor-pointer"
            >
              Habilitar permisos
            </button>
          </div>
        )}

        {/* Active notifications configuration */}
        {settings.notificationsEnabled && (
          <div className="space-y-5 pt-2 border-t border-white/5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Frecuencia del recordatorio:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { id: '15m', label: '15 min' },
                    { id: '30m', label: '30 min' },
                    { id: '1h', label: '1 hora' },
                    { id: '2h', label: '2 horas' },
                    { id: 'custom', label: 'Horas fijas' },
                  ] as { id: NotificationFrequency; label: string }[]
                ).map((freq) => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => onUpdateSettings({ notificationFrequency: freq.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      settings.notificationFrequency === freq.id
                        ? 'bg-[#ff7a59] text-white border-[#ff7a59] shadow-md shadow-[#ff7a59]/20'
                        : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Fixed Hours Configuration */}
            {settings.notificationFrequency === 'custom' && (
              <div className="p-4 rounded-2xl bg-[#0b0d18] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#ff7a59]" />
                    <span>Horas fijas para recibir recordatorios:</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {settings.customHours.map((hour) => (
                    <span
                      key={hour}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-white text-xs font-mono border border-white/10"
                    >
                      <span>{hour}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomHour(hour)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="bg-[#141830] text-slate-200 border border-white/15 rounded-xl px-2.5 py-1 text-xs outline-none focus:border-[#ff7a59]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomHour}
                      className="px-2.5 py-1 rounded-xl bg-[#ff7a59]/20 text-[#ff7a59] border border-[#ff7a59]/40 text-xs font-semibold hover:bg-[#ff7a59]/30 cursor-pointer"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Explanatory note about category selection rule */}
            <div className="p-3.5 rounded-2xl bg-[#7c6cff]/10 border border-[#7c6cff]/20 text-xs text-slate-300 flex items-start gap-2.5">
              <span className="text-base select-none">{mostUsedMoodConfig.emoji}</span>
              <div>
                <strong className="text-white block font-medium">Categoría más usada recientemente: {mostUsedMoodConfig.label}</strong>
                <span className="text-slate-400 text-[11px]">
                  Tus notificaciones seleccionan automáticamente frases aleatorias de tu ánimo más recurrente para adaptarse a tus necesidades actuales.
                </span>
              </div>
            </div>

            {/* Test Notification Button */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">¿Quieres ver cómo lucen?</span>
              <button
                type="button"
                onClick={onTriggerTestNotification}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 text-[#ff7a59]" />
                <span>Probar recordatorio ahora</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. SECCIÓN: AGREGAR FRASES PROPIAS */}
      <section className="bg-[#141830] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7c6cff]/15 border border-[#7c6cff]/30 flex items-center justify-center text-[#7c6cff]">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Agregar Frases Propias</h3>
            <p className="text-xs text-slate-400">
              Añade tus mantras o citas favoritas a la lista de frases motivacionales
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCustomQuote} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Texto de la frase:
            </label>
            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder="Ej: Recuerda que un mal día no significa una mala vida..."
              rows={2}
              className="w-full bg-[#0b0d18] text-slate-100 placeholder:text-slate-500 border border-white/10 rounded-xl p-3 text-xs sm:text-sm outline-none focus:border-[#7c6cff]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Autor o fuente (opcional):
              </label>
              <input
                type="text"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
                placeholder="Ej: Yo mismo, Séneca, Mi padre..."
                className="w-full bg-[#0b0d18] text-slate-100 placeholder:text-slate-500 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7c6cff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoría de ánimo:
              </label>
              <select
                value={quoteMood}
                onChange={(e) => setQuoteMood(e.target.value as MoodType)}
                className="w-full bg-[#0b0d18] text-slate-100 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7c6cff] cursor-pointer"
              >
                {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => (
                  <option key={m} value={m}>
                    {MOOD_CONFIGS[m].emoji} {MOOD_CONFIGS[m].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {quoteSavedSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                ¡Frase agregada con éxito!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={!quoteText.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c6cff] to-[#6366f1] text-white text-xs font-semibold hover:brightness-110 disabled:opacity-40 cursor-pointer shadow-md transition-all"
            >
              Guardar en mi lista
            </button>
          </div>
        </form>

        {/* Preview of added custom quotes */}
        {customQuotes.length > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tus frases agregadas ({customQuotes.length}):
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {customQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-[#0b0d18] border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <p className="text-slate-200 truncate">“{q.text}”</p>
                    <span className="text-[10px] text-slate-500">— {q.author}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomQuote(q.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. SECCIÓN: VOZ Y TEXT-TO-SPEECH NATIVO */}
      <section className="bg-[#141830] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff7a59]/15 border border-[#ff7a59]/30 flex items-center justify-center text-[#ff7a59]">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Voz en Español (Text-to-Speech)</h3>
              <p className="text-xs text-slate-400">
                Lectura en voz alta nativa del dispositivo al pulsar "Necesito fuerza"
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onUpdateSettings({ voiceEnabled: !settings.voiceEnabled })}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              settings.voiceEnabled ? 'bg-[#ff7a59]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                settings.voiceEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.voiceEnabled && (
          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">Voz nativa detectada:</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10 font-mono text-[11px]">
                {detectedVoice ? `${detectedVoice.name} (${detectedVoice.lang})` : 'Voz estándar en español'}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span>Velocidad de habla:</span>
                <span className="font-mono text-[#ff7a59]">{settings.voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.05"
                value={settings.voiceRate}
                onChange={(e) => onUpdateSettings({ voiceRate: parseFloat(e.target.value) })}
                className="w-full accent-[#ff7a59] cursor-pointer"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleTestVoice}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#ff7a59]" />
                <span>Probar voz</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. SECCIÓN: IA DE BIENESTAR PERSONALIZADO */}
      <section className="bg-[#141830] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7c6cff]/15 border border-[#7c6cff]/30 flex items-center justify-center text-[#7c6cff]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Personalización con IA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7c6cff]/20 text-[#a594fd] border border-[#7c6cff]/30">
                  Gemini
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Permite sintetizar mensajes motivacionales a partir de tus notas del diario
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onUpdateSettings({ useAiPersonalization: !settings.useAiPersonalization })}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              settings.useAiPersonalization ? 'bg-[#7c6cff]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                settings.useAiPersonalization ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Si la opción está activa, la app puede consultar el modelo de lenguaje para crear una reflexión empática basada en tu última nota del diario. Si no hay conexión o se desactiva, la app utiliza la rica biblioteca fija de frases curadas.
        </p>
      </section>

      {/* 5. SECCIÓN: COPIA DE SEGURIDAD Y PRIVACIDAD */}
      <section className="bg-[#141830] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privacidad y Copias de Seguridad</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Tus notas del diario, tus frases favoritas y tus ajustes están guardados únicamente en la memoria local de tu dispositivo.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#ff7a59]" />
            <span>Exportar copia (JSON)</span>
          </button>

          <label className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#7c6cff]" />
            <span>Restaurar copia</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {exportNotice && (
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Archivo de copia descargado exitosamente.
          </p>
        )}

        {importStatus && (
          <p className="text-xs text-slate-300">
            {importStatus}
          </p>
        )}
      </section>
    </div>
  );
};
