// Mobile Audio Manager
// Comprehensive mobile audio optimization and policy compliance

export interface MobileAudioContext {
  isInitialized: boolean;
  hasUserInteraction: boolean;
  audioFormat: 'mp3' | 'webm' | 'ogg';
  networkQuality: 'high' | 'medium' | 'low';
  isLowPowerMode: boolean;
}

export class MobileAudioManager {
  private static instance: MobileAudioManager;
  private audioContext: AudioContext | null = null;
  private isUnlocked = false;
  private audioElement: HTMLAudioElement | null = null;
  private preloadedAudio = new Map<string, string>();
  private networkMonitor: any = null;
  private wasPausedByVisibility = false;

  public static getInstance(): MobileAudioManager {
    if (!MobileAudioManager.instance) {
      MobileAudioManager.instance = new MobileAudioManager();
    }
    return MobileAudioManager.instance;
  }

  constructor() {
    this.initializeMobileAudio();
    this.setupNetworkMonitoring();
  }

  // Initialize mobile-optimized audio system
  async initializeMobileAudio(): Promise<void> {
    try {
      // Create audio context for mobile
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Handle iOS audio unlocking
      if (this.isMobile()) {
        await this.setupMobileAudioUnlocking();
      }

      // Setup audio element with mobile optimizations
      this.audioElement = new Audio();
      this.audioElement.preload = 'metadata';
      (this.audioElement as any).playsInline = true;
      
      // Handle audio interruptions (phone calls, etc.)
      this.setupAudioInterruptionHandling();
      
      console.log('✅ Mobile audio manager initialized');
    } catch (error) {
      console.error('❌ Mobile audio initialization failed:', error);
    }
  }

  // Setup audio unlocking for mobile browsers
  private async setupMobileAudioUnlocking(): Promise<void> {
    const unlockAudio = async () => {
      if (this.isUnlocked) return;

      try {
        // Resume audio context
        if (this.audioContext?.state === 'suspended') {
          await this.audioContext.resume();
        }

        // Create and play silent audio to unlock
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAABAABAAEAVFYAAIhYAQBkAAAABABkYXRhBAAAAAEAAQ==';
        audio.volume = 0;
        
        const playPromise = audio.play();
        if (playPromise) {
          await playPromise.catch(() => {});
        }

        this.isUnlocked = true;
        console.log('✅ Mobile audio unlocked');
        
        // Remove event listeners
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
      } catch (error) {
        console.warn('⚠️ Audio unlock attempt failed:', error);
      }
    };

    // Listen for first user interaction
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
  }

  // Setup audio interruption handling
  private setupAudioInterruptionHandling(): void {
    if (!this.audioElement) return;

    // Handle phone calls and other interruptions
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.audioElement && !this.audioElement.paused) {
        this.wasPausedByVisibility = true;
        this.audioElement.pause();
      } else if (!document.hidden && this.audioElement && this.wasPausedByVisibility) {
        this.wasPausedByVisibility = false;
        this.audioElement.play().catch(console.error);
      }
    });

    // Handle audio focus changes (Android)
    if ('navigator' in window && 'mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('pause', () => {
        this.audioElement?.pause();
      });
      
      navigator.mediaSession.setActionHandler('play', () => {
        this.audioElement?.play().catch(console.error);
      });
    }
  }

  // Setup network quality monitoring
  private setupNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.networkMonitor = () => {
        const effectiveType = connection.effectiveType;
        console.log(`📶 Network quality: ${effectiveType}`);
      };
      
      connection.addEventListener('change', this.networkMonitor);
    }
  }

  // Get optimal audio format for current device
  getOptimalAudioFormat(): 'mp3' | 'webm' | 'ogg' {
    const audio = new Audio();
    
    if (audio.canPlayType('audio/webm; codecs="opus"')) {
      return 'webm';
    } else if (audio.canPlayType('audio/ogg; codecs="vorbis"')) {
      return 'ogg';
    } else {
      return 'mp3';
    }
  }

  // Enhanced audio playback with mobile optimizations
  async playAudioBlob(audioBlob: Blob, options: {
    onEnded?: () => void;
    onError?: (error: Error) => void;
    volume?: number;
  } = {}): Promise<void> {
    if (!this.isUnlocked) {
      throw new Error('Audio not unlocked - user interaction required');
    }

    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.preload = 'metadata';
        (this.audioElement as any).playsInline = true;
      }

      // Stop current audio
      this.audioElement.pause();
      this.audioElement.currentTime = 0;

      // Set new audio source
      this.audioElement.src = audioUrl;
      this.audioElement.volume = options.volume ?? 1.0;

      // Event handlers
      this.audioElement.onended = () => {
        URL.revokeObjectURL(audioUrl);
        options.onEnded?.();
      };

      this.audioElement.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        options.onError?.(new Error('Audio playback failed'));
      };

      // Enhanced mobile playback
      if (this.isMobile()) {
        // Load metadata first
        await new Promise((resolve, reject) => {
          this.audioElement!.onloadedmetadata = resolve;
          this.audioElement!.onerror = reject;
          this.audioElement!.load();
        });
      }

      await this.audioElement.play();
      console.log('✅ Mobile audio playback started');
    } catch (error) {
      console.error('❌ Mobile audio playback failed:', error);
      throw error;
    }
  }

  // Stop current audio playback
  stopAudio(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  // Check if device is mobile
  private isMobile(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Check if audio is ready
  isAudioReady(): boolean {
    return this.isUnlocked && this.audioContext?.state === 'running';
  }

  // Get audio status
  getAudioStatus(): MobileAudioContext {
    return {
      isInitialized: this.audioContext !== null,
      hasUserInteraction: this.isUnlocked,
      audioFormat: this.getOptimalAudioFormat(),
      networkQuality: this.getNetworkQuality(),
      isLowPowerMode: this.isLowPowerMode()
    };
  }

  // Get network quality
  private getNetworkQuality(): 'high' | 'medium' | 'low' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === '4g') return 'high';
      if (effectiveType === '3g') return 'medium';
      return 'low';
    }
    return 'medium';
  }

  // Check if device is in low power mode
  private isLowPowerMode(): boolean {
    if ('getBattery' in navigator) {
      return false; // Implement battery API check if needed
    }
    return false;
  }

  // Cleanup resources
  destroy(): void {
    this.stopAudio();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    if (this.networkMonitor && 'connection' in navigator) {
      (navigator as any).connection.removeEventListener('change', this.networkMonitor);
    }
    
    this.preloadedAudio.clear();
  }
}