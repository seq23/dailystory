// Mobile-specific session management with enhanced reliability
export class MobileSessionManager {
  private static memoryStorage: Map<string, string> = new Map();
  private static isSupported: boolean | null = null;

  /**
   * Check if sessionStorage is available and working
   */
  static isSessionStorageSupported(): boolean {
    if (this.isSupported !== null) {
      return this.isSupported;
    }

    try {
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      this.isSupported = true;
      return true;
    } catch {
      this.isSupported = false;
      console.warn('📱 MobileSessionManager: SessionStorage not available, using memory fallback');
      return false;
    }
  }

  /**
   * Set item with fallback to memory storage
   */
  static setItem(key: string, value: string): void {
    try {
      if (this.isSessionStorageSupported()) {
        sessionStorage.setItem(key, value);
      }
      // Always update memory as backup
      this.memoryStorage.set(key, value);
    } catch (error) {
      console.warn('📱 MobileSessionManager: SessionStorage failed, using memory only:', error);
      this.memoryStorage.set(key, value);
    }
  }

  /**
   * Get item with fallback to memory storage
   */
  static getItem(key: string): string | null {
    try {
      if (this.isSessionStorageSupported()) {
        const value = sessionStorage.getItem(key);
        if (value !== null) {
          // Update memory backup
          this.memoryStorage.set(key, value);
          return value;
        }
      }
      return this.memoryStorage.get(key) || null;
    } catch (error) {
      console.warn('📱 MobileSessionManager: SessionStorage read failed, using memory:', error);
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Remove item from both storage types
   */
  static removeItem(key: string): void {
    try {
      if (this.isSessionStorageSupported()) {
        sessionStorage.removeItem(key);
      }
      this.memoryStorage.delete(key);
    } catch (error) {
      console.warn('📱 MobileSessionManager: SessionStorage remove failed:', error);
      this.memoryStorage.delete(key);
    }
  }

  /**
   * Clear all items
   */
  static clear(): void {
    try {
      if (this.isSessionStorageSupported()) {
        sessionStorage.clear();
      }
      this.memoryStorage.clear();
    } catch (error) {
      console.warn('📱 MobileSessionManager: SessionStorage clear failed:', error);
      this.memoryStorage.clear();
    }
  }

  /**
   * Handle app backgrounding/foregrounding events with audio-aware debouncing
   */
  static setupLifecycleHandlers(): void {
    let lastVisibilityChange = Date.now();
    let isAudioPlaying = false;
    
    // Listen for audio state changes to prevent interference during playback
    window.addEventListener('audio:statechange', (event: any) => {
      isAudioPlaying = event.detail?.isPlaying || false;
    });
    
    // Save critical data when app goes to background
    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      
      // Enhanced debounce for audio playback awareness
      const timeSinceLastChange = now - lastVisibilityChange;
      
      // Longer debounce during audio playback to prevent interference
      const debounceTime = isAudioPlaying ? 3000 : 1000;
      if (timeSinceLastChange < debounceTime) {
        console.log('🔄 Debouncing visibility change (audio-aware)');
        return;
      }
      lastVisibilityChange = now;
      
      if (document.hidden) {
        // Only log if not during audio playback to reduce console noise
        if (!isAudioPlaying) {
          console.log('📱 MobileSessionManager: App backgrounded, preserving session state');
        }
        // Session data is already saved in memory, no additional action needed
      } else {
        // Only log if not during audio playback to reduce console noise
        if (!isAudioPlaying) {
          console.log('📱 MobileSessionManager: App foregrounded, session state preserved');
        }
      }
    });

    // Handle page hide - modern replacement for deprecated beforeunload
    // pagehide is more reliable and not deprecated like beforeunload
    window.addEventListener('pagehide', () => {
      // Final cleanup when page is being hidden/unloaded
      // Session data is already preserved in memory via visibilitychange handler
      if (this.memoryStorage.size > 0 && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
        console.log('📱 MobileSessionManager: Page hidden, session state preserved in memory');
      }
    });
  }

  /**
   * Get storage status for debugging
   */
  static getStorageStatus(): {
    sessionStorageSupported: boolean;
    memoryItemCount: number;
    sessionStorageItemCount: number;
  } {
    let sessionStorageItemCount = 0;
    
    try {
      if (this.isSessionStorageSupported()) {
        sessionStorageItemCount = sessionStorage.length;
      }
    } catch {
      sessionStorageItemCount = 0;
    }

    return {
      sessionStorageSupported: this.isSessionStorageSupported(),
      memoryItemCount: this.memoryStorage.size,
      sessionStorageItemCount
    };
  }
}

// Initialize lifecycle handlers
MobileSessionManager.setupLifecycleHandlers();

export default MobileSessionManager;