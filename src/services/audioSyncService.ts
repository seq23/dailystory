import type { UserInfo } from '@/types';

interface AudioSyncOptions {
  text: string;
  voice: string;
  model: string;
  speed: number;
  onWordHighlight?: (wordIndex: number) => void;
  onSyncError?: () => void;
}

interface VoiceTimingProfile {
  baseWordInterval: number; // milliseconds per word
  speedMultiplier: number;
  pauseMultiplier: number; // for punctuation
}

/**
 * Enhanced audio service with real-time synchronization for word highlighting
 */
export class AudioSyncService {
  private audio: HTMLAudioElement | null = null;
  private words: string[] = [];
  private currentWordIndex = -1;
  private isPlaying = false;
  private progressInterval: NodeJS.Timeout | null = null;
  private syncTimeouts: NodeJS.Timeout[] = [];
  private onStateChange?: (isPlaying: boolean) => void; // Add state change callback
  private lastVoice: string = 'default';
  private lastSpeed: number = 1.0;
  private lastOnWordHighlight?: (wordIndex: number) => void;
  
  // Enhanced timing profiles optimized for eleven_multilingual_v2 model
  private readonly voiceProfiles: Record<string, VoiceTimingProfile> = {
    // Charlotte - primary voice for all users, optimized for eleven_multilingual_v2
    'XB0fDUnXU5powFXDhCwa': {
      baseWordInterval: 165, // Slightly slower to match multilingual model natural pauses
      speedMultiplier: 1.0,
      pauseMultiplier: 1.4   // Enhanced pause for better sync with eleven_multilingual_v2
    },
    // Legacy voice profiles (for fallback scenarios)
    'cgSgspJ2msm6clMCkdW9': {
      baseWordInterval: 165, // Unified timing
      speedMultiplier: 1.0,
      pauseMultiplier: 1.4
    },
    'EXAVITQu4vr4xnSDxMaL': {
      baseWordInterval: 170, // Slower for children
      speedMultiplier: 0.95,
      pauseMultiplier: 1.6
    },
    // Default profile optimized for eleven_multilingual_v2
    'default': {
      baseWordInterval: 165, // Optimized for multilingual model
      speedMultiplier: 1.0,
      pauseMultiplier: 1.4   // Better sync with natural pauses
    }
  };

  /**
   * Play text with synchronized word highlighting
   */
  async playText(options: AudioSyncOptions & { onStateChange?: (isPlaying: boolean) => void }): Promise<void> {
    const { text, voice, model, speed, onWordHighlight, onSyncError, onStateChange } = options;
    
    // Store state change callback
    this.onStateChange = onStateChange;
    this.lastVoice = voice;
    this.lastSpeed = speed;
    this.lastOnWordHighlight = onWordHighlight;
    
    // Stop any existing playback
    this.stopAudio();
    
    // Prepare words for highlighting
    this.words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    
    try {
      // Generate audio from ElevenLabs
      const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 3000),
          voice: voice,
          model: model
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.audio = new Audio(audioUrl);
      
      // Mobile-specific audio setup
      if (this.isMobile()) {
        this.audio.preload = 'metadata';
        this.audio.crossOrigin = 'anonymous';
        
        // Mobile audio unlock - crucial for iOS/Android
        await this.unlockMobileAudio();
      }
      
      // Wait for metadata to load to get accurate duration
      await new Promise((resolve, reject) => {
        if (!this.audio) return reject('Audio not initialized');
        
        this.audio.addEventListener('loadedmetadata', resolve, { once: true });
        this.audio.addEventListener('error', reject, { once: true });
        this.audio.load();
      });

      // Setup playback event handlers
      this.setupAudioEventHandlers(voice, speed, onWordHighlight, onSyncError);
      
      // Start playback
      await this.audio.play();
      this.isPlaying = true;
      this.onStateChange?.(true); // Notify state change
      
      // Start real-time progress tracking
      this.startProgressTracking(voice, speed, onWordHighlight);
      
    } catch (error) {
      console.error('Audio sync service error:', error);
      this.isPlaying = false;
      this.onStateChange?.(false); // Notify state change
      onSyncError?.();
      throw error;
    }
  }

  /**
   * Setup audio event handlers for cleanup and sync correction
   */
  private setupAudioEventHandlers(
    voice: string, 
    speed: number, 
    onWordHighlight?: (wordIndex: number) => void,
    onSyncError?: () => void
  ): void {
    if (!this.audio) return;

    this.audio.onended = () => {
      console.log('🏁 Audio playback ended, clearing highlights');
      onWordHighlight?.(-1); // Clear highlighting immediately
      this.isPlaying = false;
      this.onStateChange?.(false); // Notify state change
      this.stopAudio();
    };

    this.audio.onerror = () => {
      console.error('Audio playback error');
      this.isPlaying = false;
      this.onStateChange?.(false); // Notify state change
      onSyncError?.();
      this.stopAudio();
    };

    // Monitor for significant sync drift and auto-correct
    this.audio.ontimeupdate = () => {
      if (!this.audio || !this.isPlaying) return;
      
      const currentTime = this.audio.currentTime;
      const expectedWordIndex = this.calculateExpectedWordIndex(voice, speed, currentTime);
      
      // If we're off by more than 1 word, correct the highlighting
      if (Math.abs(expectedWordIndex - this.currentWordIndex) > 1) {
        console.log(`🔄 Sync correction: expected ${expectedWordIndex}, current ${this.currentWordIndex}`);
        this.correctHighlighting(expectedWordIndex, onWordHighlight);
      }
    };
  }

  /**
   * Enhanced progress tracking with buffer time for last word and drift correction
   */
  private startProgressTracking(
    voice: string, 
    speed: number, 
    onWordHighlight?: (wordIndex: number) => void
  ): void {
    if (!this.audio) return;

    const profile = this.voiceProfiles[voice] || this.voiceProfiles['default'];
    let nextWordTime = 0;
    let wordIndex = 0;
    let lastSyncCheck = 0;

    const trackProgress = () => {
      if (!this.audio || !this.isPlaying) return;

      const currentTime = this.audio.currentTime * 1000; // Convert to milliseconds
      
      // Real-time sync monitoring every 500ms
      if (currentTime - lastSyncCheck > 500 && wordIndex > 0) {
        const expectedIndex = this.calculateExpectedWordIndex(voice, speed, this.audio.currentTime);
        if (Math.abs(expectedIndex - wordIndex) > 1) {
          console.log(`🔄 Real-time sync correction: expected ${expectedIndex}, current ${wordIndex}`);
          wordIndex = Math.max(0, Math.min(expectedIndex, this.words.length - 1));
          nextWordTime = currentTime;
        }
        lastSyncCheck = currentTime;
      }
      
      // Check if it's time for the next word
      if (currentTime >= nextWordTime && wordIndex < this.words.length) {
        this.highlightWord(wordIndex, onWordHighlight);
        
        // Calculate next word timing with text length adjustment
        const word = this.words[wordIndex];
        const wordDuration = this.calculateWordDuration(word, profile, speed);
        
        // Add buffer time for last word to ensure it gets highlighted
        if (wordIndex === this.words.length - 1) {
          const bufferTime = Math.min(500, wordDuration * 0.5);
          console.log(`📍 Last word buffer: +${bufferTime}ms for "${word}"`);
          nextWordTime += wordDuration + bufferTime;
        } else {
          nextWordTime += wordDuration;
        }
        
        wordIndex++;
      }
      
      // Ensure last word stays highlighted until audio ends
      if (wordIndex >= this.words.length && this.audio.currentTime < this.audio.duration - 0.1) {
        this.highlightWord(this.words.length - 1, onWordHighlight);
      }
    };

    // More frequent tracking for better precision
    this.progressInterval = setInterval(trackProgress, 80);
  }

  /**
   * Calculate expected word index based on audio position
   */
  private calculateExpectedWordIndex(voice: string, speed: number, currentTimeSeconds: number): number {
    const profile = this.voiceProfiles[voice] || this.voiceProfiles['default'];
    const currentTimeMs = currentTimeSeconds * 1000;
    
    let totalTime = 0;
    let wordIndex = 0;
    
    for (const word of this.words) {
      const wordDuration = this.calculateWordDuration(word, profile, speed);
      totalTime += wordDuration;
      
      if (totalTime > currentTimeMs) {
        return wordIndex;
      }
      wordIndex++;
    }
    
    return Math.min(wordIndex, this.words.length - 1);
  }

  /**
   * Calculate duration for a single word based on voice profile and speed
   */
  private calculateWordDuration(word: string, profile: VoiceTimingProfile, speed: number): number {
    let duration = profile.baseWordInterval;
    
    // Adjust for word length
    duration += word.length * 10;
    
    // Adjust for punctuation (longer pauses)
    if (/[.!?]/.test(word)) {
      duration *= profile.pauseMultiplier;
    } else if (/[,;:]/.test(word)) {
      duration *= 1.2;
    }
    
    // Apply voice-specific and user speed adjustments
    duration *= profile.speedMultiplier;
    duration /= speed; // User speed adjustment
    
    return duration;
  }

  /**
   * Highlight a specific word and update tracking
   */
  private highlightWord(wordIndex: number, onWordHighlight?: (wordIndex: number) => void): void {
    this.currentWordIndex = wordIndex;
    onWordHighlight?.(wordIndex);
    console.log(`🎯 Highlighting word ${wordIndex}: "${this.words[wordIndex]}"`);
  }

  /**
   * Correct highlighting when sync drift is detected
   */
  private correctHighlighting(expectedIndex: number, onWordHighlight?: (wordIndex: number) => void): void {
    if (expectedIndex >= 0 && expectedIndex < this.words.length) {
      this.highlightWord(expectedIndex, onWordHighlight);
    }
  }

  /**
   * Mobile audio unlock - required for iOS/Android
   */
  private async unlockMobileAudio(): Promise<void> {
    if (!this.audio) return;
    
    try {
      // Create a short silent audio to unlock mobile audio context
      const silentAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeBS113+TQeCkELI7L7tmNQAgMW7Dn7adTEw1GnN/y');
      silentAudio.volume = 0.01;
      
      const playPromise = silentAudio.play();
      if (playPromise) {
        await playPromise.catch(() => {}); // Ignore errors
      }
      silentAudio.pause();
      
      console.log('🔓 Mobile audio unlocked');
    } catch (error) {
      console.warn('Mobile audio unlock failed:', error);
    }
  }

  /**
   * Pause audio playback
   */
  pauseAudio(): void {
    if (!this.audio) return;
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.onStateChange?.(false);
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    }
  }

  /**
   * Resume audio playback
   */
  async resumeAudio(): Promise<void> {
    if (!this.audio) return;
    if (!this.isPlaying) {
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.onStateChange?.(true);
        // Restart tracking using last known settings
        this.startProgressTracking(this.lastVoice, this.lastSpeed, this.lastOnWordHighlight);
      } catch (e) {
        console.warn('Failed to resume audio', e);
      }
    }
  }

  /**
   * Seek by a number of seconds (positive or negative)
   */
  seekBySeconds(seconds: number): void {
    if (!this.audio) return;
    const target = Math.max(0, Math.min(this.audio.currentTime + seconds, this.audio.duration || Infinity));
    this.audio.currentTime = target;
    // Update highlighting to match new time
    const expectedIndex = this.calculateExpectedWordIndex(this.lastVoice, this.lastSpeed, target);
    this.correctHighlighting(expectedIndex, this.lastOnWordHighlight);
  }

  /**
   * Stop audio and clear all highlighting
   */
  stopAudio(): void {
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    this.currentWordIndex = -1;
    
    // Notify state change if we were playing
    if (wasPlaying) {
      this.onStateChange?.(false);
    }
    
    // Clear progress tracking
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    
    // Clear any pending timeouts
    this.syncTimeouts.forEach(timeout => clearTimeout(timeout));
    this.syncTimeouts = [];
    
    // Stop and cleanup audio
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      try {
        URL.revokeObjectURL(this.audio.src);
      } catch (e) {
        console.warn('Failed to revoke audio URL:', e);
      }
      this.audio = null;
    }
    
    // Clear words array to prevent stale references
    this.words = [];
    
    console.log('🧹 Audio sync service completely cleaned up');
  }

  /**
   * Get current playback status
   */
  getPlaybackStatus(): { isPlaying: boolean; currentWordIndex: number; totalWords: number } {
    return {
      isPlaying: this.isPlaying,
      currentWordIndex: this.currentWordIndex,
      totalWords: this.words.length
    };
  }

  /**
   * Adjust playback speed (requires restart)
   */
  adjustSpeed(newSpeed: number): void {
    if (this.audio) {
      // HTML5 Audio playbackRate can cause quality issues with TTS
      // Better to restart with new speed settings
      console.log(`🎛️ Speed adjustment to ${newSpeed}x requires restart`);
    }
  }

  /**
   * Detect mobile device
   */
  private isMobile(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}

// Singleton instance
export const audioSyncService = new AudioSyncService();