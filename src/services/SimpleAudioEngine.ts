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
      this.audio.addEventListener('ended', () => { 
        this.playing = false; 
        // Emit state change event
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false } 
        }));
      });
      this.audio.addEventListener('pause', () => { 
        this.playing = false;
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false } 
        }));
      });
      this.audio.addEventListener('play', () => { 
        this.playing = true;
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: true } 
        }));
      });
    }
    return this.audio;
  }

  async playText(opts: PlayOptions) {
    const { text, voiceId, modelId, contentHash } = opts;
    
    console.log('🎵 SimpleAudioEngine: Starting playback:', {
      textLength: text.length,
      voice: voiceId || 'default',
      contentHash: contentHash || 'none'
    });
    
    // Request exclusive audio access - event-based coordination
    window.dispatchEvent(new CustomEvent('audio:request', { detail: { system: 'simple' } }));
    window.dispatchEvent(new CustomEvent('audio:stop:sync'));
    
    // Abort any inflight request and stop current audio
    this.stop();

    // Guard against UI/content mismatch
    this.currentHash = contentHash || null;

    try {
      // Check network connectivity before attempting TTS
      if (!navigator.onLine) {
        console.warn('🎵 SimpleAudioEngine: No network connection, using fallback immediately');
        this.fallbackToWebSpeech(text);
        return;
      }

      // Generate audio with ElevenLabs
      this.inflight = new AbortController();
      const signal = this.inflight.signal;

      console.log('🎵 SimpleAudioEngine: Requesting ElevenLabs TTS...');
      const arrayBuffer = await fetchElevenLabsAudioArrayBuffer(text, voiceId, modelId);
      
      if (signal.aborted) {
        console.log('🎵 SimpleAudioEngine: Request was aborted');
        return; // canceled by a newer call
      }

      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      const audio = this.ensureAudio();
      try { audio.pause(); } catch {}
      if (this.currentUrl) URL.revokeObjectURL(this.currentUrl);
      this.currentUrl = url;
      audio.src = url;

      console.log('✅ SimpleAudioEngine: ElevenLabs audio loaded, starting playback');
      await audio.play();
      this.playing = true;
    } catch (error) {
      console.error('🎵 SimpleAudioEngine: ElevenLabs failed, falling back to browser speech:', error);
      // Enhanced fallback with user notification
      this.fallbackToWebSpeech(text, true);
    }
  }

  private fallbackToWebSpeech(text: string, showNotification = false): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      console.log('🔊 SimpleAudioEngine: Using browser speech fallback');
      
      if (showNotification) {
        // Dispatch event to show user notification about fallback
        window.dispatchEvent(new CustomEvent('audio:fallback', {
          detail: { message: 'Using device voice due to network issues' }
        }));
      }

      const processedText = contextualPronunciation.processTextForPronunciation(text, true);
      const utterance = new SpeechSynthesisUtterance(processedText);
      
      // Optimized settings for better mobile experience
      utterance.rate = 0.9; // Slightly faster for mobile
      utterance.pitch = 1.1; // Child-friendly higher pitch
      utterance.volume = 1.0;
      
      // Enhanced voice selection for better quality
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        
        // Prefer high-quality voices
        return (name.includes('premium') || name.includes('enhanced') || 
                name.includes('neural') || name.includes('natural')) &&
               (lang.startsWith('en-') || lang === 'en');
      }) || voices.find(voice => {
        const name = voice.name.toLowerCase();
        // Fallback to child-friendly voices
        return name.includes('child') || name.includes('kid') || 
               name.includes('young') || name.includes('female');
      }) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('🔊 Using voice:', preferredVoice.name);
      }

      this.webSpeechSpeaking = true;
      this.playing = true;
      
      utterance.onstart = () => {
        console.log('🔊 Browser speech started');
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: true } 
        }));
      };
      
      utterance.onend = () => {
        console.log('🔊 Browser speech ended');
        this.webSpeechSpeaking = false;
        this.playing = false;
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false } 
        }));
      };
      
      utterance.onerror = (event) => {
        console.error('🔊 Browser speech error:', event.error);
        this.webSpeechSpeaking = false;
        this.playing = false;
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false } 
        }));
      };
      
      speechSynthesis.speak(utterance);
    } else {
      console.error('🔊 Browser speech not available');
    }
  }

  stop() {
    // Signal stop to coordination system
    window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'simple' } }));
    
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
