import { SynchronizedElevenLabsTTS } from '@/services/SynchronizedElevenLabsTTS';
import { contextualPronunciation } from './contextualPronunciation';
import { AudioPermissions } from '@/utils/audioPermissions';

export type SynchronizedPlayOptions = {
  text: string;
  contentHash?: string;
  voiceId?: string;
  context?: 'conversation' | 'learning';
  onWordHighlight?: (wordIndex: number) => void;
};

/**
 * Simplified audio engine using ElevenLabs native timing synchronization
 * Replaces manual timing calculations with ElevenLabs /with-timestamps API
 */
export class SimplifiedAudioEngine {
  private static instance: SimplifiedAudioEngine | null = null;
  static getInstance() {
    if (!this.instance) {
      this.instance = new SimplifiedAudioEngine();
      (window as any).__SimplifiedAudioEngine = this.instance;
    }
    return this.instance;
  }

  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private playing = false;
  private currentHash: string | null = null;
  private inflight?: AbortController;
  private wordTimings: Array<{ word: string; startTime: number; endTime: number }> = [];
  private onWordHighlight?: (wordIndex: number) => void;
  private highlightInterval?: NodeJS.Timeout;
  
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
        this.stopWordHighlighting();
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false } 
        }));
        window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'simple' } }));
      });
      
      this.audio.addEventListener('pause', () => { 
        this.playing = false;
        this.stopWordHighlighting();
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false } 
        }));
      });
      
      this.audio.addEventListener('play', () => { 
        this.playing = true;
        this.startWordHighlighting();
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: true } 
        }));
      });
      
      this.setupMobileAudioUnlock();
    }
    return this.audio;
  }

  private setupMobileAudioUnlock() {
    if (this.mobileAudioUnlocked) return;
    
    const unlockAudio = async () => {
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        
        if (this.audio) {
          const playPromise = this.audio.play();
          if (playPromise) {
            await playPromise.catch(() => {});
            this.audio.pause();
            this.audio.currentTime = 0;
          }
        }
        
        this.mobileAudioUnlocked = true;
        console.log('🔊 Mobile audio unlocked');
        
        ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(event => {
          document.removeEventListener(event, unlockAudio);
        });
      } catch (error) {
        console.warn('Mobile audio unlock failed:', error);
      }
    };

    ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(event => {
      document.addEventListener(event, unlockAudio, { once: false });
    });
  }

  async playTextWithSynchronization(opts: SynchronizedPlayOptions) {
    const { text, voiceId, contentHash, context = 'learning', onWordHighlight } = opts;
    
    if (!AudioPermissions.canPlayAudio()) {
      const reason = AudioPermissions.getBlockReason('any-audio');
      console.log(`🔒 SimplifiedAudioEngine: Audio blocked - ${reason}`);
      return;
    }
    
    console.log('🎵 SimplifiedAudioEngine: Starting synchronized playback:', {
      textLength: text.length,
      voice: voiceId || 'default',
      contentHash: contentHash || 'none',
      isMobile: this.isMobile()
    });
    
    // Request exclusive audio access with high priority for mobile
    window.dispatchEvent(new CustomEvent('audio:request', { 
      detail: { 
        system: 'simple',
        priority: this.isMobile() ? 'high' : 'normal'
      } 
    }));
    
    // Stop any current playback
    this.stop();

    this.currentHash = contentHash || null;
    this.onWordHighlight = onWordHighlight;

    try {
      if (!navigator.onLine) {
        console.warn('🎵 SimplifiedAudioEngine: No network, using fallback');
        this.fallbackToWebSpeech(text);
        return;
      }

      this.inflight = new AbortController();
      const signal = this.inflight.signal;

      console.log('🎵 SimplifiedAudioEngine: Requesting Synchronized ElevenLabs TTS...');
      
      // Use the passed context parameter (conversation = fast, learning = with dictionary)
      const result = await SynchronizedElevenLabsTTS.generateSynchronizedSpeech(text, context, voiceId);
      
      if (signal.aborted) {
        console.log('🎵 SimplifiedAudioEngine: Request was aborted');
        return;
      }

      // Store timing data for synchronization
      this.wordTimings = result.wordTimings;
      console.log('🎯 Word timings loaded:', {
        count: this.wordTimings.length,
        firstWord: this.wordTimings[0],
        lastWord: this.wordTimings[this.wordTimings.length - 1],
        validTimings: this.wordTimings.filter(t => !isNaN(t.startTime) && !isNaN(t.endTime)).length
      });
      
      const blob = new Blob([result.audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      const audio = this.ensureAudio();
      
      // Enhanced mobile audio unlocking
      if (this.isMobile()) {
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
          console.log('📱 Mobile device detected, ensuring audio unlock');
        }
        await this.unlockMobileAudioForPlayback();
        
        // Add mobile-specific audio settings
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
      }
      
      try { audio.pause(); } catch {}
      if (this.currentUrl) URL.revokeObjectURL(this.currentUrl);
      this.currentUrl = url;
      audio.src = url;

      console.log('✅ SimplifiedAudioEngine: ElevenLabs synchronized audio loaded, starting playback');
      await audio.play();
      this.playing = true;
      
    } catch (error) {
      console.error('🎵 ElevenLabs synchronized TTS failed, using fallback:', error);
      this.fallbackToWebSpeech(text);
    }
  }

  private startWordHighlighting() {
    if (!this.audio || !this.onWordHighlight || this.wordTimings.length === 0) {
      console.log('🎯 Cannot start word highlighting:', {
        hasAudio: !!this.audio,
        hasCallback: !!this.onWordHighlight,
        timingsCount: this.wordTimings.length
      });
      return;
    }
    
    this.stopWordHighlighting(); // Clear any existing highlighting
    
    console.log('🎯 Starting native ElevenLabs word highlighting:', {
      timingsCount: this.wordTimings.length,
      firstWord: this.wordTimings[0]?.word,
      lastWord: this.wordTimings[this.wordTimings.length - 1]?.word,
      totalDuration: this.wordTimings[this.wordTimings.length - 1]?.endTime
    });
    
    let lastHighlightedIndex = -1;
    
    // Use audio timeupdate for perfect synchronization
    const updateHighlight = () => {
      if (!this.audio || !this.playing) return;
      
      const currentTimeMs = this.audio.currentTime * 1000;
      
      // Find the current word based on timing with more flexible matching
      let currentWordIndex = -1;
      
      // First try exact match
      currentWordIndex = this.wordTimings.findIndex(timing => 
        currentTimeMs >= timing.startTime && currentTimeMs <= timing.endTime
      );
      
      // If no exact match, find the closest word (for timing gaps)
      if (currentWordIndex === -1) {
        let closestDistance = Infinity;
        for (let i = 0; i < this.wordTimings.length; i++) {
          const timing = this.wordTimings[i];
          const distance = Math.min(
            Math.abs(currentTimeMs - timing.startTime),
            Math.abs(currentTimeMs - timing.endTime)
          );
          
          // Allow some tolerance for timing gaps (±100ms)
          if (distance < 100 && distance < closestDistance) {
            closestDistance = distance;
            currentWordIndex = i;
          }
        }
      }
      
      // Only update if we found a word and it's different from last highlighted
      if (currentWordIndex !== -1 && currentWordIndex !== lastHighlightedIndex) {
        console.log(`🎯 Highlighting word ${currentWordIndex}: "${this.wordTimings[currentWordIndex].word}" at ${currentTimeMs}ms`);
        this.onWordHighlight?.(currentWordIndex);
        lastHighlightedIndex = currentWordIndex;
      } else if (currentWordIndex === -1 && lastHighlightedIndex !== -1) {
        // Clear highlighting if we're between words
        console.log(`🎯 Clearing highlight at ${currentTimeMs}ms (between words)`);
        this.onWordHighlight?.(-1);
        lastHighlightedIndex = -1;
      }
      
      // Debug logging every 500ms
      if (Math.floor(currentTimeMs / 500) !== Math.floor((currentTimeMs - 50) / 500)) {
        console.log(`🎵 Audio progress: ${currentTimeMs.toFixed(0)}ms, word: ${currentWordIndex}, timings available: ${this.wordTimings.length}`);
      }
    };
    
    // Use audio timeupdate event for perfect timing sync
    this.audio.addEventListener('timeupdate', updateHighlight);
    
    // Also use interval as backup for smoother highlighting
    this.highlightInterval = setInterval(updateHighlight, 50);
  }

  private stopWordHighlighting() {
    if (this.highlightInterval) {
      clearInterval(this.highlightInterval);
      this.highlightInterval = undefined;
    }
    
    // Clear the current highlight
    if (this.onWordHighlight) {
      this.onWordHighlight(-1);
    }
    
    console.log('🧹 Stopped word highlighting');
  }

  private fallbackToWebSpeech(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      console.log('🔊 SimplifiedAudioEngine: Using browser speech fallback');
      
      window.dispatchEvent(new CustomEvent('audio:fallback', {
        detail: { message: 'Using device voice due to network issues' }
      }));

      const processedText = contextualPronunciation.processTextForPronunciation(text, true);
      const utterance = new SpeechSynthesisUtterance(processedText);
      
      utterance.rate = 0.7;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang === 'en-us' && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      this.playing = true;
      
      utterance.onstart = () => {
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: true } 
        }));
      };
      
      utterance.onend = () => {
        this.playing = false;
        this.stopWordHighlighting();
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false } 
        }));
      };
      
      utterance.onerror = () => {
        this.playing = false;
        this.stopWordHighlighting();
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false } 
        }));
      };
      
      speechSynthesis.speak(utterance);
    }
  }

  stop() {
    console.log('🛑 SimplifiedAudioEngine: Stopping all audio');
    
    if (this.inflight) {
      try { 
        this.inflight.abort(); 
      } catch {}
      this.inflight = undefined;
    }
    
    const a = this.audio;
    if (a) {
      try { 
        a.pause(); 
        a.currentTime = 0;
      } catch {}
    }
    
    if (this.currentUrl) {
      try { 
        URL.revokeObjectURL(this.currentUrl); 
      } catch {}
      this.currentUrl = null;
    }
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { 
        speechSynthesis.cancel();
      } catch {}
    }
    
    this.stopWordHighlighting();
    this.playing = false;
    
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: false } 
    }));
    
    window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'simple' } }));
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
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
    return this.playing; 
  }

  getStatus() {
    return { isPlaying: this.playing, contentHash: this.currentHash };
  }
}