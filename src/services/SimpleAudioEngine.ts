import { fetchElevenLabsAudioArrayBuffer } from '@/services/simpleElevenLabsTTS';
import { contextualPronunciation } from './contextualPronunciation';

export type PlayOptions = {
  text: string;
  contentHash?: string;
  voiceId?: string;
  modelId?: string;
};

/**
 * Super-simple audio engine managing a single HTMLAudioElement.
 * Deterministic: every play call is tied to a contentHash snapshot.
 */
export class SimpleAudioEngine {
  private static instance: SimpleAudioEngine | null = null;
  static getInstance() {
    if (!this.instance) this.instance = new SimpleAudioEngine();
    return this.instance;
  }

  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private playing = false;
  private currentHash: string | null = null;
  private inflight?: AbortController;
  private webSpeechSpeaking = false;

  private ensureAudio() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.crossOrigin = 'anonymous';
      this.audio.addEventListener('ended', () => { this.playing = false; });
      this.audio.addEventListener('pause', () => { this.playing = false; });
      this.audio.addEventListener('play', () => { this.playing = true; });
    }
    return this.audio;
  }

  async playText(opts: PlayOptions) {
    const { text, voiceId, modelId, contentHash } = opts;
    // Abort any inflight request and stop current audio
    this.stop();

    // Guard against UI/content mismatch
    this.currentHash = contentHash || null;

    try {
      // Generate audio with ElevenLabs
      this.inflight = new AbortController();
      const signal = this.inflight.signal;

      const arrayBuffer = await fetchElevenLabsAudioArrayBuffer(text, voiceId, modelId);
      if (signal.aborted) return; // canceled by a newer call

      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      const audio = this.ensureAudio();
      try { audio.pause(); } catch {}
      if (this.currentUrl) URL.revokeObjectURL(this.currentUrl);
      this.currentUrl = url;
      audio.src = url;

      await audio.play();
      this.playing = true;
    } catch (error) {
      console.error('ElevenLabs failed, falling back to browser speech:', error);
      // Fallback to browser speech
      this.fallbackToWebSpeech(text);
    }
  }

  private fallbackToWebSpeech(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const processedText = contextualPronunciation.processTextForPronunciation(text, true);
      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.rate = 0.8;
      utterance.pitch = 1.1; // Child-friendly higher pitch
      
      // Try to find a child-friendly voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('child') ||
        voice.name.toLowerCase().includes('kid') ||
        voice.name.toLowerCase().includes('young') ||
        voice.name.toLowerCase().includes('female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      this.webSpeechSpeaking = true;
      this.playing = true;
      
      utterance.onend = () => {
        this.webSpeechSpeaking = false;
        this.playing = false;
      };
      
      utterance.onerror = () => {
        this.webSpeechSpeaking = false;
        this.playing = false;
      };
      
      speechSynthesis.speak(utterance);
    }
  }

  stop() {
    if (this.inflight) {
      try { this.inflight.abort(); } catch {}
      this.inflight = undefined;
    }
    const a = this.audio;
    if (a) {
      try { a.pause(); a.currentTime = 0; } catch {}
    }
    if (this.currentUrl) {
      try { URL.revokeObjectURL(this.currentUrl); } catch {}
      this.currentUrl = null;
    }
    
    // Stop browser speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch {}
    }
    this.webSpeechSpeaking = false;
    this.playing = false;
  }

  isPlaying() { 
    // Check both audio element and web speech
    return this.playing || this.webSpeechSpeaking; 
  }

  getStatus() {
    return { isPlaying: this.playing, contentHash: this.currentHash };
  }
}
