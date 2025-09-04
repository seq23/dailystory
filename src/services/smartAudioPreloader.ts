/**
 * Smart Audio Preloader Service
 * Intelligently preloads audio only when needed to avoid console warnings
 */

export interface AudioPreloadOptions {
  preloadThreshold?: number; // seconds before completion to start preloading
  maxRetries?: number;
  volume?: number;
}

class SmartAudioPreloader {
  private static instance: SmartAudioPreloader;
  private audioCache = new Map<string, HTMLAudioElement>();
  private preloadPromises = new Map<string, Promise<HTMLAudioElement>>();
  
  static getInstance(): SmartAudioPreloader {
    if (!SmartAudioPreloader.instance) {
      SmartAudioPreloader.instance = new SmartAudioPreloader();
    }
    return SmartAudioPreloader.instance;
  }

  /**
   * Preload audio intelligently - only when actually needed
   */
  async preloadWhenNeeded(
    audioSrc: string, 
    options: AudioPreloadOptions = {}
  ): Promise<HTMLAudioElement | null> {
    const { maxRetries = 2, volume = 0.5 } = options;

    // Return cached audio if available
    if (this.audioCache.has(audioSrc)) {
      return this.audioCache.get(audioSrc)!;
    }

    // Return existing preload promise if in progress
    if (this.preloadPromises.has(audioSrc)) {
      return this.preloadPromises.get(audioSrc)!;
    }

    // Create new preload promise
    const preloadPromise = this.createAudioElement(audioSrc, volume, maxRetries);
    this.preloadPromises.set(audioSrc, preloadPromise);

    try {
      const audio = await preloadPromise;
      this.audioCache.set(audioSrc, audio);
      return audio;
    } catch (error) {
      // Silently handle preload failures
      return null;
    } finally {
      this.preloadPromises.delete(audioSrc);
    }
  }

  /**
   * Play preloaded audio or load and play immediately
   */
  async playAudio(
    audioSrc: string, 
    options: AudioPreloadOptions = {}
  ): Promise<boolean> {
    const { volume = 0.5 } = options;

    try {
      let audio = this.audioCache.get(audioSrc);
      
      if (!audio) {
        // If not preloaded, create and play immediately
        audio = await this.createAudioElement(audioSrc, volume);
      }

      if (audio) {
        audio.currentTime = 0; // Reset to start
        await audio.play();
        return true;
      }
    } catch (error) {
      // Silently handle audio play failures
    }
    
    return false;
  }

  /**
   * Preload celebration audio when timer reaches threshold
   */
  preloadCelebrationAudio(timeRemaining: number, threshold = 10): Promise<HTMLAudioElement | null> {
    if (timeRemaining <= threshold && timeRemaining > 0) {
      return this.preloadWhenNeeded('/audio/celebration.mp3', { volume: 0.5 });
    }
    return Promise.resolve(null);
  }

  private async createAudioElement(
    src: string, 
    volume: number, 
    maxRetries = 2
  ): Promise<HTMLAudioElement> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const audio = new Audio();
        audio.volume = volume;
        audio.preload = 'auto';
        
        // Create promise that resolves when audio can play
        const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'));
          }, 5000);

          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
            resolve(audio);
          }, { once: true });

          audio.addEventListener('error', () => {
            clearTimeout(timeout);
            reject(new Error('Audio load failed'));
          }, { once: true });
        });

        audio.src = src;
        return await loadPromise;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
    throw new Error('Failed to load audio after retries');
  }

  /**
   * Clear all cached audio
   */
  clearCache(): void {
    this.audioCache.forEach(audio => {
      audio.src = '';
      audio.load();
    });
    this.audioCache.clear();
    this.preloadPromises.clear();
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): Record<string, 'cached' | 'preloading'> {
    const status: Record<string, 'cached' | 'preloading'> = {};
    
    this.audioCache.forEach((_, src) => {
      status[src] = 'cached';
    });
    
    this.preloadPromises.forEach((_, src) => {
      status[src] = 'preloading';
    });
    
    return status;
  }
}

export const smartAudioPreloader = SmartAudioPreloader.getInstance();