import type { UserInfo } from '@/types';
import { tokenizeForHighlighting, hashText } from '@/utils/tokenize';
import { fetchElevenLabsAudioArrayBuffer } from '@/services/simpleElevenLabsTTS';
import { contextualPronunciation } from './contextualPronunciation';

interface AudioSyncOptions {
  text: string;
  voice?: string;
  model?: string;
  speed?: number;
  userInfo?: UserInfo;
  onWordHighlight?: (wordIndex: number) => void;
  onError?: (error: Error) => void;
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
    const { text, voice = 'XB0fDUnXU5powFXDhCwa', model = 'eleven_turbo_v2_5', speed = 1.0, onWordHighlight, onError, onStateChange } = options;
    
    // Request exclusive audio access - event-based coordination
    window.dispatchEvent(new CustomEvent('audio:request', { detail: { system: 'sync' } }));
    window.dispatchEvent(new CustomEvent('audio:stop:simple'));
    
    // Stop any active voice commands or simple audio (mutual exclusion)
    try {
      window.dispatchEvent(new CustomEvent('voice:stop'));
      window.dispatchEvent(new CustomEvent('audio:stop:simple'));
      await new Promise(r => setTimeout(r, 200)); // Brief pause for cleanup
    } catch (e) {
      console.warn('Failed to stop other audio systems:', e);
    }
    
    // Stop any existing playback and in-flight requests BEFORE setting new session
    this.isPlaying = false;
    this.currentWordIndex = -1;
    
    // Clear any pending timeouts
    this.syncTimeouts.forEach(timeout => clearTimeout(timeout));
    this.syncTimeouts = [];
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    
    if (this.fetchAbortController) {
      try { this.fetchAbortController.abort(); } catch {}
    }
    this.fetchAbortController = new AbortController();
    
    // New session guards (AFTER cleanup to avoid session mismatch)
    this.activeSessionId = ++this.sessionIdCounter;
    const localSessionId = this.activeSessionId;
    this.activeContentHash = hashText(text);
    const localContentHash = this.activeContentHash;
    
    // Store state change callback
    this.onStateChange = onStateChange;
    this.lastVoice = voice;
    this.lastSpeed = speed;
    this.lastOnWordHighlight = onWordHighlight;
    
    // Prepare words for highlighting using unified tokenizer
    const tokenization = tokenizeForHighlighting(text);
    this.words = tokenization.wordsOnly;

    // Compute story-length multiplier to slow highlighting for longer texts
    const wordCount = this.words.length;
    // Reduced story length scaling for better mobile performance
    if (wordCount > 1200) {
      this.storyLengthMultiplier = 1.3; // Cap at 1.3x instead of 2x
    } else if (wordCount > 800) {
      this.storyLengthMultiplier = 1.2;
    } else if (wordCount > 500) {
      this.storyLengthMultiplier = 1.1;
    } else if (wordCount > 300) {
      this.storyLengthMultiplier = 1.05;
    } else {
      this.storyLengthMultiplier = 1.0;
    }
    
    try {
      // Generate audio with ElevenLabs
      const arrayBuffer = await fetchElevenLabsAudioArrayBuffer(
        text.slice(0, 3000),
        voice,
        model
      );

      // If session changed during fetch, abort silently
      if (this.activeSessionId !== localSessionId || this.activeContentHash !== localContentHash) {
        throw new Error('stale-session');
      }

      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      // Guard again after heavy work
      if (this.activeSessionId !== localSessionId || this.activeContentHash !== localContentHash) {
        throw new Error('stale-session');
      }
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.audio = new Audio(audioUrl);
      // Ensure inline playback on iOS Safari and mobile browsers
      try { (this.audio as any).playsInline = true; } catch {}
      try { this.audio.setAttribute?.('playsinline', 'true'); } catch {}
      
      // Mobile-specific audio setup with enhanced stability
      if (this.isMobile()) {
        console.log('📱 Mobile audio setup starting...');
        this.audio.preload = 'metadata';
        this.audio.crossOrigin = 'anonymous';
        
        // Mobile audio unlock - crucial for iOS/Android
        console.log('📱 Attempting mobile audio unlock...');
        await this.unlockMobileAudio();
        
        // Enhanced mobile audio stabilization - wait longer for mobile
        console.log('📱 Mobile audio - adding extra stabilization time');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 2s to 1s
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
      
      // Reduced mobile scaling for faster highlighting
      const mobileMultiplier = this.isMobile() ? 1.05 : 1.0;
      this.durationScale = Math.min(1.5, Math.max(0.6, (targetMs / Math.max(1, totalExpected)) * mobileMultiplier));
      console.log(`⏱️ Highlight scaling: words=${this.words.length}, target=${Math.round(targetMs)}ms, sum=${Math.round(totalExpected)}ms, scale=${this.durationScale.toFixed(3)}, mobile=${this.isMobile()}`);

      // Setup playback event handlers with session guard
      this.setupAudioEventHandlers(voice, speed, onWordHighlight, onError, localSessionId, localContentHash);
      
      // Enhanced mobile playback with better error handling
      try {
        console.log('🎵 Starting audio playback...');
        await this.audio.play();
        console.log('🎵 Audio playback started successfully');
      } catch (playError) {
        console.error('🎵 Audio playback failed:', playError);
        
        // Mobile-specific playback retry
        if (this.isMobile()) {
          console.log('📱 Retrying mobile audio playback...');
          try {
            // Try user gesture-based unlock
            await this.unlockMobileAudio();
            await this.audio.play();
            console.log('📱 Mobile audio retry successful');
          } catch (retryError) {
            console.error('📱 Mobile audio retry failed:', retryError);
            throw retryError;
          }
        } else {
          throw playError;
        }
      }
      
      if (this.activeSessionId !== localSessionId || this.activeContentHash !== localContentHash) {
        // Stop immediately if stale
        this.audio.pause();
        this.onStateChange?.(false);
        return;
      }
      this.isPlaying = true;
      this.onStateChange?.(true); // Notify state change
      // Emit global event for all audio components
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: true } 
      }));
      
      // Start real-time progress tracking
      this.startProgressTracking(voice, speed, onWordHighlight, localSessionId, localContentHash);
      
    } catch (error: any) {
      if (error?.name === 'AbortError' || String(error?.message).includes('stale-session')) {
        console.log('🛑 Audio request aborted due to navigation or new session');
        return;
      }
      console.error('ElevenLabs TTS failed, falling back to browser speech:', error);
      
      // Fallback to browser speech with word highlighting
      this.fallbackToWebSpeech(text, onWordHighlight, speed);
      onStateChange?.(true);
    }
  }

  /**
   * Setup audio event handlers for cleanup and sync correction
   */
  private setupAudioEventHandlers(
    voice: string, 
    speed: number, 
    onWordHighlight?: (wordIndex: number) => void,
    onError?: (error: Error) => void,
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
      // Emit global event for all audio components
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: false } 
      }));
      this.stopAudio();
    };

    this.audio.onerror = () => {
      if (isStale()) return;
      console.error('Audio playback error');
      this.isPlaying = false;
      this.onStateChange?.(false); // Notify state change
      onError?.(new Error('Audio playback error'));
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
      
      // Increased sync frequency for mobile - every 200ms
      const syncInterval = this.isMobile() ? 200 : 500;
      if (currentTime - lastSyncCheck > syncInterval && wordIndex > 0) {
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

    // Mobile optimized tracking frequency
    const trackingInterval = this.isMobile() ? 100 : 80;
    this.progressInterval = setInterval(trackProgress, trackingInterval);
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
      console.log('🔓 Starting mobile audio unlock process...');
      
      // Enhanced mobile audio unlock strategy
      // Strategy 1: Try to play the actual audio first (most direct)
      this.audio.volume = 0.01; // Very low volume
      this.audio.muted = true; // Start muted
      
      try {
        console.log('🔓 Attempting direct audio unlock...');
        const directPlayPromise = this.audio.play();
        if (directPlayPromise) {
          await directPlayPromise;
          console.log('🔓 Direct audio unlock successful');
          this.audio.pause();
          this.audio.currentTime = 0;
          this.audio.muted = false; // Unmute for actual playback
          this.audio.volume = 1.0; // Restore volume
          return;
        }
      } catch (directError) {
        console.log('🔓 Direct audio unlock failed, trying silent audio...', directError);
      }
      
      // Strategy 2: Create a short silent audio to unlock mobile audio context
      const silentAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeBS113+TQeCkELI7L7tmNQAgMW7Dn7adTEw1GnN/y');
      silentAudio.volume = 0.01;
      
      const playPromise = silentAudio.play();
      if (playPromise) {
        await playPromise.catch(() => {}); // Ignore errors
      }
      silentAudio.pause();
      
      // Restore original audio settings
      this.audio.muted = false;
      this.audio.volume = 1.0;
      
      console.log('🔓 Mobile audio unlocked via silent audio');
    } catch (error) {
      console.warn('🔓 Mobile audio unlock failed:', error);
      // Try to at least unmute and restore volume
      try {
        if (this.audio) {
          this.audio.muted = false;
          this.audio.volume = 1.0;
        }
      } catch (e) {
        console.warn('Failed to restore audio settings:', e);
      }
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
    // Signal stop to coordination system
    window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'sync' } }));
    
    // CRITICAL: Synchronously update playing state FIRST for immediate UI feedback
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    
    // Immediately notify state change for responsive stop button
    if (wasPlaying && this.onStateChange) {
      this.onStateChange(false);
    }
    
    // Clear highlighting immediately
    this.currentWordIndex = -1;
    if (this.lastOnWordHighlight) {
      try {
        this.lastOnWordHighlight(-1);
      } catch (error) {
        console.warn('Error clearing word highlight:', error);
      }
    }
    
    // Abort any in-flight TTS requests
    if (this.fetchAbortController) {
      try { this.fetchAbortController.abort(); } catch {}
      this.fetchAbortController = null;
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
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.removeAttribute('src');
        this.audio.load(); // Force reset
        
        const src = this.audio.src;
        if (src && src.startsWith('blob:')) {
          URL.revokeObjectURL(src);
        }
      } catch (error) {
        console.warn('Audio cleanup error:', error);
      }
      this.audio = null;
    }
    
    // Clear words array and session state
    this.words = [];
    this.activeContentHash = '';
    
    // Emit global event for state synchronization
    try {
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: false } 
      }));
    } catch (error) {
      console.warn('Error dispatching audio state change event:', error);
    }
    
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
   * Browser speech fallback with basic word highlighting
   */
  private fallbackToWebSpeech(text: string, onWordHighlight?: (wordIndex: number) => void, speed: number = 0.85): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.1, Math.min(2.0, speed));
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

      // Set up basic word highlighting for browser speech
      if (onWordHighlight && this.words.length > 0) {
        const wordDuration = 60000 / (120 * speed); // Approximate 120 WPM baseline
        
        let wordIndex = 0;
        const highlightInterval = setInterval(() => {
          if (wordIndex < this.words.length && this.isPlaying) {
            onWordHighlight(wordIndex);
            this.currentWordIndex = wordIndex;
            wordIndex++;
          } else {
            clearInterval(highlightInterval);
          }
        }, wordDuration);
        
        utterance.onend = () => {
          clearInterval(highlightInterval);
          this.isPlaying = false;
        };
        
        utterance.onerror = () => {
          clearInterval(highlightInterval);
          this.isPlaying = false;
        };
      }
      
      this.isPlaying = true;
      speechSynthesis.speak(utterance);
    }
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