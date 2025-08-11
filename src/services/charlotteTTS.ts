import { fetchElevenLabsAudioArrayBuffer } from '@/services/simpleElevenLabsTTS';

/**
 * Singleton Charlotte TTS helper with in-memory caching and unified pacing.
 * - Always uses ElevenLabs Charlotte (Turbo v2.5)
 * - Caches audio by exact text content
 * - Provides speak() that resolves when playback ends
 */
class CharlotteTTS {
  private static instance: CharlotteTTS | null = null;
  static getInstance() {
    if (!this.instance) this.instance = new CharlotteTTS();
    return this.instance;
  }

  private cache = new Map<string, string>(); // text -> object URL
  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private playing = false;

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

  async speak(text: string): Promise<void> {
    const clean = (text || '').trim();
    if (!clean) return;

    // Use cache if available
    let url = this.cache.get(clean) || null;
    if (!url) {
      const arrayBuffer = await fetchElevenLabsAudioArrayBuffer(clean, 'XB0fDUnXU5powFXDhCwa', 'eleven_turbo_v2_5');
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      url = URL.createObjectURL(blob);
      this.cache.set(clean, url);
    }

    const audio = this.ensureAudio();
    try { audio.pause(); } catch {}
    if (this.currentUrl && this.currentUrl !== url) {
      try { URL.revokeObjectURL(this.currentUrl); } catch {}
    }
    this.currentUrl = url;
    audio.src = url;

    await new Promise<void>((resolve) => {
      const onEnd = () => {
        audio.removeEventListener('ended', onEnd);
        audio.removeEventListener('error', onErr);
        resolve();
      };
      const onErr = () => {
        audio.removeEventListener('ended', onEnd);
        audio.removeEventListener('error', onErr);
        resolve();
      };
      audio.addEventListener('ended', onEnd);
      audio.addEventListener('error', onErr);
      audio.play().catch(() => resolve());
    });
  }

  stop() {
    const a = this.audio;
    if (a) {
      try { a.pause(); a.currentTime = 0; } catch {}
    }
    this.playing = false;
  }

  isPlaying() { return this.playing; }
}

export const charlotteTTS = CharlotteTTS.getInstance();
