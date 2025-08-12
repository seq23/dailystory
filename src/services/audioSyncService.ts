import type { UserInfo } from '@/types';
import { tokenizeForHighlighting, hashText } from '@/utils/tokenize';

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
  private storyLengthMultiplier: number = 1.0;
  private durationScale: number = 1.0;
  
  // Session and request guards
  private sessionIdCounter = 0;
  private activeSessionId = 0;
  private activeContentHash = '';
  private fetchAbortController: AbortController | null = null;
  
  // Enhanced timing profiles optimized for eleven_multilingual_v2 model
  private readonly voiceProfiles: Record<string, VoiceTimingProfile> = {
    // Charlotte - primary voice for all users, optimized for eleven_multilingual_v2
    'XB0fDUnXU5powFXDhCwa': {
      baseWordInterval: 180, // Slightly slower to match Charlotte's natural pacing
      speedMultiplier: 1.0,
      pauseMultiplier: 1.45   // Slightly longer sentence pauses
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
    
    // New session guards
    this.activeSessionId = ++this.sessionIdCounter;
    const localSessionId = this.activeSessionId;
    this.activeContentHash = hashText(text);
    const localContentHash = this.activeContentHash;
    
    // Store state change callback
    this.onStateChange = onStateChange;
    this.lastVoice = voice;
    this.lastSpeed = speed;
    this.lastOnWordHighlight = onWordHighlight;
    
    // Stop any existing playback and in-flight requests
    this.stopAudio();
    if (this.fetchAbortController) {
      try { this.fetchAbortController.abort(); } catch {}
    }
    this.fetchAbortController = new AbortController();
    
    // Prepare words for highlighting using unified tokenizer
    const tokenization = tokenizeForHighlighting(text);
    this.words = tokenization.wordsOnly;

    // Compute story-length multiplier to slow highlighting for longer texts
    const wordCount = this.words.length;
    // Keep short stories unchanged, scale up progressively for longer stories
    if (wordCount > 1200) {
      this.storyLengthMultiplier = 1.25;
    } else if (wordCount > 800) {
      this.storyLengthMultiplier = 1.18;
    } else if (wordCount > 500) {
      this.storyLengthMultiplier = 1.12;
    } else if (wordCount > 300) {
      this.storyLengthMultiplier = 1.07;
    } else {
      this.storyLengthMultiplier = 1.0;
    }
    
    try {
      // Generate audio from ElevenLabs
      const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 3000),
          voice: voice,
          model: model
        }),
        signal: this.fetchAbortController.signal
      });

      // If session changed during fetch, abort silently
      if (this.activeSessionId !== localSessionId || this.activeContentHash !== localContentHash) {
        throw new Error('stale-session');
      }

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      // Guard again after heavy work
      if (this.activeSessionId !== localSessionId || this.activeContentHash !== localContentHash) {
        throw new Error('stale-session');
      }
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.audio = new Audio(audioUrl);
      // Ensure inline playback on iOS Safari and mobile browsers
      try { (this.audio as any).playsInline = true; } catch {}
      try { this.audio.setAttribute?.('playsinline', 'true'); } catch {}
      
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
        
        const done = (fn: Function) => (evt: any) => {
          // Ignore if stale
          if (this.activeSessionId !== localSessionId || this.activeContentHash !== localContentHash) return;
          fn(evt);
        };
        this.audio!.addEventListener('loadedmetadata', done(resolve) as any, { once: true });
        this.audio!.addEventListener('error', done(reject) as any, { once: true });
        this.audio!.load();
      });

      // Compute global duration scale to align highlighting with actual audio length
      const profile = this.voiceProfiles[voice] || this.voiceProfiles['default'];
      let totalExpected = 0;
      for (const w of this.words) {
        totalExpected += this.calculateWordDurationUnscaled(w, profile, speed);
      }
      const targetMs = Math.max(500, (this.audio!.duration * 1000));
      this.durationScale = Math.min(3.0, Math.max(0.6, targetMs / Math.max(1, totalExpected)));
      console.log(`⏱️ Highlight scaling: words=${this.words.length}, target=${Math.round(targetMs)}ms, sum=${Math.round(totalExpected)}ms, scale=${this.durationScale.toFixed(3)}`);

      // Setup playback event handlers with session guard
      this.setupAudioEventHandlers(voice, speed, onWordHighlight, onSyncError, localSessionId, localContentHash);
      
      // Start playback (guard on start)
      await this.audio.play();
      if (this.activeSessionId !== localSessionId || this.activeContentHash !== localContentHash) {
        // Stop immediately if stale
        this.audio.pause();
        this.onStateChange?.(false);
        return;
      }
      this.isPlaying = true;
      this.onStateChange?.(true); // Notify state change
      
      // Start real-time progress tracking
      this.startProgressTracking(voice, speed, onWordHighlight, localSessionId, localContentHash);
      
    } catch (error: any) {
      if (error?.name === 'AbortError' || String(error?.message).includes('stale-session')) {
        console.log('🛑 Audio request aborted due to navigation or new session');
        // Do not call onSyncError for expected aborts
        return;
      }
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
    onSyncError?: () => void,
    sessionId?: number,
    contentHash?: string
  ): void {
    if (!this.audio) return;

    const isStale = () => this.activeSessionId !== sessionId || this.activeContentHash !== contentHash;

    this.audio.onended = () => {
      if (isStale()) return;
      console.log('🏁 Audio playback ended, clearing highlights');
      onWordHighlight?.(-1); // Clear highlighting immediately
      this.isPlaying = false;
      this.onStateChange?.(false); // Notify state change
      this.stopAudio();
    };

    this.audio.onerror = () => {
      if (isStale()) return;
      console.error('Audio playback error');
      this.isPlaying = false;
      this.onStateChange?.(false); // Notify state change
      onSyncError?.();
      this.stopAudio();
    };

    // Monitor for significant sync drift and auto-correct
    this.audio.ontimeupdate = () => {
      if (!this.audio || !this.isPlaying || isStale()) return;
      
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
    onWordHighlight?: (wordIndex: number) => void,
    sessionId?: number,
    contentHash?: string
  ): void {
    if (!this.audio) return;

    const isStale = () => this.activeSessionId !== sessionId || this.activeContentHash !== contentHash;

    const profile = this.voiceProfiles[voice] || this.voiceProfiles['default'];
    let nextWordTime = 0;
    let wordIndex = 0;
    let lastSyncCheck = 0;

    const trackProgress = () => {
      if (!this.audio || !this.isPlaying || isStale()) return;

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
        this.highlightWord(wordIndex, onWordHighlight, isStale);
        
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
        this.highlightWord(this.words.length - 1, onWordHighlight, isStale);
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

    // Duration-based index (sums modeled word durations)
    let totalTime = 0;
    let durationBasedIndex = 0;
    for (const word of this.words) {
      const wordDuration = this.calculateWordDuration(word, profile, speed);
      totalTime += wordDuration;
      if (totalTime > currentTimeMs) break;
      durationBasedIndex++;
    }

    // Proportional index based on overall audio progress
    const durationSec = this.audio?.duration || 0;
    if (durationSec <= 0) {
      return Math.min(durationBasedIndex, this.words.length - 1);
    }
    const proportionalIndex = Math.floor(
      Math.min(1, Math.max(0, currentTimeSeconds / durationSec)) * this.words.length
    );

    // Blend: favor proportional mapping more for long stories
    const w = this.words.length > 800 ? 0.7 : this.words.length > 400 ? 0.6 : 0.45;
    const blended = Math.round((1 - w) * durationBasedIndex + w * proportionalIndex);
    return Math.max(0, Math.min(blended, this.words.length - 1));
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

    // Slow down highlighting slightly for longer stories
    duration *= this.storyLengthMultiplier;

    // Apply global scaling to match actual audio duration
    duration *= this.durationScale;
    
    return duration;
  }

  // Calculate duration without applying global scaling (used to compute scale factor)
  private calculateWordDurationUnscaled(word: string, profile: VoiceTimingProfile, speed: number): number {
    let duration = profile.baseWordInterval;

    duration += word.length * 10;

    if (/[.!?]/.test(word)) {
      duration *= profile.pauseMultiplier;
    } else if (/[,;:]/.test(word)) {
      duration *= 1.2;
    }

    duration *= profile.speedMultiplier;
    duration /= speed;

    // Keep story multiplier so distribution stays similar for long stories
    duration *= this.storyLengthMultiplier;

    return duration;
  }

  /**
   * Highlight a specific word and update tracking
   */
  private highlightWord(wordIndex: number, onWordHighlight?: (wordIndex: number) => void, isStale?: () => boolean): void {
    if (isStale && isStale()) return;
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
    
    // Abort any in-flight TTS requests
    if (this.fetchAbortController) {
      try { this.fetchAbortController.abort(); } catch {}
      this.fetchAbortController = null;
    }
    
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
  getPlaybackStatus(): { isPlaying: boolean; currentWordIndex: number; totalWords: number; contentHash: string } {
    return {
      isPlaying: this.isPlaying,
      currentWordIndex: this.currentWordIndex,
      totalWords: this.words.length,
      contentHash: this.activeContentHash
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