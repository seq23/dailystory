/**
 * Simplified Audio Coordination - Event-driven coordination without dynamic imports
 * Prevents conflicts between audio systems using global events
 */

type AudioSystem = 'sync' | 'simple' | null;

class SimpleAudioCoordinator {
  private activeSystem: AudioSystem = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for audio requests
    window.addEventListener('audio:request', ((event: CustomEvent) => {
      const system = event.detail?.system as AudioSystem;
      if (system && this.activeSystem !== system) {
        console.log(`🔒 Audio Coordinator: ${system} requesting control, current: ${this.activeSystem}`);
        
        // Stop the other system if active
        if (this.activeSystem === 'sync') {
          window.dispatchEvent(new CustomEvent('audio:stop:sync'));
        } else if (this.activeSystem === 'simple') {
          window.dispatchEvent(new CustomEvent('audio:stop:simple'));
        }
        
        this.activeSystem = system;
        console.log(`🔓 Audio Coordinator: Control granted to ${system}`);
      }
    }) as EventListener);

    // Listen for audio stops
    window.addEventListener('audio:stopped', ((event: CustomEvent) => {
      const system = event.detail?.system as AudioSystem;
      if (system === this.activeSystem) {
        this.activeSystem = null;
        console.log(`🔓 Audio Coordinator: ${system} released control`);
      }
    }) as EventListener);

    // Setup stop handlers for each system
    window.addEventListener('audio:stop:sync', async () => {
      try {
        const { audioSyncService } = await import('@/services/audioSyncService');
        audioSyncService.stopAudio();
      } catch (e) {
        console.warn('Failed to stop sync audio:', e);
      }
    });

    window.addEventListener('audio:stop:simple', async () => {
      try {
        const { SimpleAudioEngine } = await import('@/services/SimpleAudioEngine');
        SimpleAudioEngine.getInstance().stop();
      } catch (e) {
        console.warn('Failed to stop simple audio:', e);
      }
    });
  }

  getActiveSystem(): AudioSystem {
    return this.activeSystem;
  }
}

// Initialize coordinator immediately
if (typeof window !== 'undefined') {
  new SimpleAudioCoordinator();
}

export { SimpleAudioCoordinator };