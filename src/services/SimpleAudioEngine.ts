import { fetchElevenLabsAudioArrayBuffer } from '@/services/simpleElevenLabsTTS';

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

    // Generate audio
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
    this.playing = false;
  }

  isPlaying() { return this.playing; }

  getStatus() {
    return { isPlaying: this.playing, contentHash: this.currentHash };
  }
}
