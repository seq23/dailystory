import { fetchElevenLabsAudioArrayBuffer } from '@/services/simpleElevenLabsTTS';
import { contextualPronunciation } from './contextualPronunciation';
import { AudioPermissions } from '@/utils/audioPermissions';

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
    if (!this.instance) {
      this.instance = new SimpleAudioEngine();
      // Make globally accessible for coordination
      (window as any).__SimpleAudioEngine = this.instance;
    }
    return this.instance;
  }

  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private playing = false;
  private currentHash: string | null = null;
  private inflight?: AbortController;
  private webSpeechSpeaking = false;
  
  // Mobile audio management
  private mobileAudioUnlocked = false;
  private audioContext: AudioContext | null = null;

  private ensureAudio() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.crossOrigin = 'anonymous';
      
      // Mobile-specific configurations
      (this.audio as any).playsInline = true;
      this.audio.setAttribute('playsinline', 'true');
      
      this.audio.addEventListener('ended', () => { 
        this.playing = false; 
        // Emit state change event
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false } 
        }));
        // Release coordination lock
        window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'simple' } }));
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
      
      // Mobile audio unlock on first user interaction
      this.setupMobileAudioUnlock();
    }
    return this.audio;
  }

  private setupMobileAudioUnlock() {
    if (this.mobileAudioUnlocked) return;
    
    const unlockAudio = async () => {
      try {
        // Create AudioContext if needed for mobile
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        
        // Play silent audio to unlock
        if (this.audio) {
          const playPromise = this.audio.play();
          if (playPromise) {
            await playPromise.catch(() => {}); // Ignore rejection
            this.audio.pause();
            this.audio.currentTime = 0;
          }
        }
        
        this.mobileAudioUnlocked = true;
        console.log('🔊 Mobile audio unlocked');
        
        // Remove event listeners after unlock
        ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(event => {
          document.removeEventListener(event, unlockAudio);
        });
      } catch (error) {
        console.warn('Mobile audio unlock failed:', error);
      }
    };

    // Add event listeners for mobile unlock
    ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(event => {
      document.addEventListener(event, unlockAudio, { once: false });
    });
  }

  async playText(opts: PlayOptions) {
    const { text, voiceId, modelId, contentHash } = opts;
    
    // Check basic audio permissions
    if (!AudioPermissions.canPlayAudio()) {
      const reason = AudioPermissions.getBlockReason('any-audio');
      console.log(`🔒 SimpleAudioEngine: Audio blocked - ${reason}`);
      return;
    }
    
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
      
      // Ensure mobile audio is unlocked before attempting playback
      if (!this.mobileAudioUnlocked && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        console.log('🔊 Attempting to unlock mobile audio before playback');
        await this.unlockMobileAudioForPlayback();
      }
      
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
    console.log('🛑 SimpleAudioEngine: Stopping all audio systems');
    
    // Signal stop to coordination system first
    window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'simple' } }));
    
    // Abort any inflight requests immediately
    if (this.inflight) {
      try { 
        this.inflight.abort(); 
        console.log('🛑 Aborted inflight audio request');
      } catch {}
      this.inflight = undefined;
    }
    
    // Stop HTML audio element
    const a = this.audio;
    if (a) {
      try { 
        a.pause(); 
        a.currentTime = 0;
        console.log('🛑 Stopped HTML audio element');
      } catch {}
    }
    
    // Clean up object URLs
    if (this.currentUrl) {
      try { 
        URL.revokeObjectURL(this.currentUrl); 
        console.log('🛑 Revoked audio object URL');
      } catch {}
      this.currentUrl = null;
    }
    
    // Stop browser speech synthesis immediately
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { 
        speechSynthesis.cancel();
        console.log('🛑 Cancelled browser speech synthesis');
      } catch {}
    }
    
    // CRITICAL: Also stop the audio sync service
    try {
      const audioSyncService = (window as any).__audioSyncService;
      if (audioSyncService) {
        audioSyncService.stopAudio();
        console.log('🛑 Stopped AudioSyncService');
      }
    } catch {}
    
    // Update state synchronously
    this.webSpeechSpeaking = false;
    this.playing = false;
    
    // Emit final state change
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: false } 
    }));
    
    console.log('✅ SimpleAudioEngine: All audio stopped successfully');
  }

  private async unlockMobileAudioForPlayback(): Promise<void> {
    if (this.mobileAudioUnlocked) return;
    
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.mobileAudioUnlocked = true;
      console.log('🔊 Mobile audio unlocked successfully');
    } catch (error) {
      console.warn('Failed to unlock mobile audio:', error);
    }
  }

  isPlaying() {
    // Check both audio element and web speech
    return this.playing || this.webSpeechSpeaking; 
  }

  getStatus() {
    return { isPlaying: this.playing, contentHash: this.currentHash };
  }
}
