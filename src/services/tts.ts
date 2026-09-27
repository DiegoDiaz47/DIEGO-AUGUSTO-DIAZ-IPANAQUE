export interface TTSCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.isInitialized = true;
  }

  public isSupported(): boolean {
    return !!this.synth;
  }

  public getSpanishVoice(): SpeechSynthesisVoice | null {
    if (!this.voices.length && this.synth) {
      this.voices = this.synth.getVoices();
    }

    // Try preferred Spanish voices
    const spanishVoices = this.voices.filter((v) =>
      v.lang.toLowerCase().startsWith('es')
    );

    if (spanishVoices.length > 0) {
      // Prefer neural, natural, or common voices
      const preferred = spanishVoices.find(
        (v) =>
          v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('Paulina') ||
          v.name.includes('Monica') ||
          v.name.includes('Jorge') ||
          v.name.includes('Helena') ||
          v.lang.toLowerCase() === 'es-es' ||
          v.lang.toLowerCase() === 'es-mx'
      );
      return preferred || spanishVoices[0];
    }

    return null;
  }

  public speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      callbacks?: TTSCallbacks;
    } = {}
  ): void {
    if (!this.synth) {
      console.warn('Text-to-speech not supported on this device');
      options.callbacks?.onError?.('TTS no soportado');
      return;
    }

    // Stop any ongoing speech
    this.stop();

    // Prepare text: strip quotes or markdown symbols for clean pronunciation
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/[«»"]/g, '')
      .trim();

    if (!cleanText) return;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voice = this.getSpanishVoice();

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'es-ES';
      }

      utterance.rate = options.rate ?? 0.95;
      utterance.pitch = options.pitch ?? 1.0;

      utterance.onstart = () => {
        options.callbacks?.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        options.callbacks?.onEnd?.();
      };

      utterance.onerror = (e) => {
        // Interrupted is not a fatal error
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis error:', e);
          options.callbacks?.onError?.(e);
        }
        this.currentUtterance = null;
        options.callbacks?.onEnd?.();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (e) {
      console.error('Failed to trigger speech synthesis:', e);
      options.callbacks?.onError?.(e);
    }
  }

  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (err) {
        console.warn('Error cancelling speech synthesis:', err);
      }
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking);
  }
}

export const speechService = new TTSService();
