/**
 * Audio System Coordinator - Manages mutual exclusion between audio systems
 * Prevents conflicts between audioSyncService and SimpleAudioEngine
 */

type AudioSystem = 'sync' | 'simple' | null;

export class AudioCoordinator {
  private static instance: AudioCoordinator | null = null;
  private activeSystem: AudioSystem = null;
  private lockResolvers: (() => void)[] = [];

  static getInstance(): AudioCoordinator {
    if (!this.instance) {
      this.instance = new AudioCoordinator();
    }
    return this.instance;
  }

  /**
   * Request exclusive access to audio system
   */
  async requestLock(system: AudioSystem): Promise<void> {
    if (this.activeSystem === system) {
      return; // Already locked by this system
    }

    if (this.activeSystem !== null) {
      console.log(`🔒 Audio Coordinator: Waiting for ${this.activeSystem} to release lock for ${system}`);
      
      // Stop the other system
      if (this.activeSystem === 'sync') {
        window.dispatchEvent(new CustomEvent('audio:stop:sync'));
      } else if (this.activeSystem === 'simple') {
        window.dispatchEvent(new CustomEvent('audio:stop:simple'));
      }

      // Wait for release or timeout
      await Promise.race([
        new Promise<void>(resolve => this.lockResolvers.push(resolve)),
        new Promise<void>(resolve => setTimeout(resolve, 1000)) // 1s timeout
      ]);
    }

    this.activeSystem = system;
    console.log(`🔓 Audio Coordinator: Lock acquired by ${system}`);
  }

  /**
   * Release audio system lock
   */
  releaseLock(system: AudioSystem): void {
    if (this.activeSystem === system) {
      this.activeSystem = null;
      console.log(`🔓 Audio Coordinator: Lock released by ${system}`);
      
      // Notify any waiting systems
      const resolvers = this.lockResolvers.splice(0);
      resolvers.forEach(resolve => resolve());
    }
  }

  /**
   * Force release all locks (emergency cleanup)
   */
  forceReleaseAll(): void {
    this.activeSystem = null;
    const resolvers = this.lockResolvers.splice(0);
    resolvers.forEach(resolve => resolve());
    console.log('🔓 Audio Coordinator: All locks force released');
  }

  getActiveSystem(): AudioSystem {
    return this.activeSystem;
  }
}

// Global instance
export const audioCoordinator = AudioCoordinator.getInstance();

// Setup global event listeners for coordination
if (typeof window !== 'undefined') {
  window.addEventListener('audio:stop:sync', () => {
    try {
      const { audioSyncService } = require('@/services/audioSyncService');
      audioSyncService.stopAudio();
    } catch (e) {
      console.warn('Failed to stop sync audio:', e);
    }
  });

  window.addEventListener('audio:stop:simple', () => {
    try {
      const { SimpleAudioEngine } = require('@/services/SimpleAudioEngine');
      SimpleAudioEngine.getInstance().stop();
    } catch (e) {
      console.warn('Failed to stop simple audio:', e);
    }
  });
}