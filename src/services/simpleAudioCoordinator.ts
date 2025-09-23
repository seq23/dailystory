/**
 * Enhanced Audio Coordination - Centralized coordination for all audio systems
 * Prevents conflicts between audioSyncService, SimplifiedAudioEngine, and voice commands
 * Provides timeout protection and better mutual exclusion
 */

import { DebugLogger } from '@/services/DebugLogger';

type AudioSystem = 'sync' | 'simple' | 'voice' | 'charlotte' | 'interactive-word' | null;

class SimpleAudioCoordinator {
  private activeSystem: AudioSystem = null;
  private lockTimeout: number | null = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for audio requests
    window.addEventListener('audio:request', ((event: CustomEvent) => {
      const system = event.detail?.system as AudioSystem;
      if (system && this.activeSystem !== system) {
        DebugLogger.log('audio', `${system} requesting control, current: ${this.activeSystem}`);
        
        // Clear any existing timeout
        if (this.lockTimeout) {
          clearTimeout(this.lockTimeout);
          this.lockTimeout = null;
        }
        
        // Handle system priority - Charlotte has higher priority for story reading
        const currentPriority = this.getSystemPriority(this.activeSystem);
        const requestPriority = this.getSystemPriority(system);
        
        // Always allow Charlotte to interrupt for story reading
        if (system === 'charlotte' || (currentPriority >= requestPriority && event.detail?.priority !== 'high')) {
          if (system !== 'charlotte' && currentPriority >= requestPriority) {
            ProductionLogging.info(`Rejecting ${system} request (lower priority)`, 'simpleAudioCoordinator');
            return;
          }
        }
        
        // Stop the other system if active
        if (this.activeSystem === 'sync') {
          window.dispatchEvent(new CustomEvent('audio:stop:sync'));
        } else if (this.activeSystem === 'simple') {
          window.dispatchEvent(new CustomEvent('audio:stop:simple'));
        } else if (this.activeSystem === 'voice') {
          window.dispatchEvent(new CustomEvent('audio:stop:voice'));
        } else if (this.activeSystem === 'charlotte') {
          window.dispatchEvent(new CustomEvent('audio:stop:charlotte'));
        } else if (this.activeSystem === 'interactive-word') {
          // Interactive word system will handle its own cleanup
          ProductionLogging.info('Interactive word system in control', 'simpleAudioCoordinator');
        }
        
        this.activeSystem = system;
        ProductionLogging.info(`Control granted to ${system}`, 'simpleAudioCoordinator');
        
        // Set timeout to auto-release lock if system doesn't respond
        this.lockTimeout = window.setTimeout(() => {
          if (this.activeSystem === system) {
            ProductionLogging.info(`Auto-releasing lock for ${system} (timeout)`, 'simpleAudioCoordinator');
            this.activeSystem = null;
          }
        }, 30000); // 30 second timeout
      }
    }) as EventListener);

    // Listen for audio stops
    window.addEventListener('audio:stopped', ((event: CustomEvent) => {
      const system = event.detail?.system as AudioSystem;
      if (system === this.activeSystem) {
        this.activeSystem = null;
        if (this.lockTimeout) {
          clearTimeout(this.lockTimeout);
          this.lockTimeout = null;
        }
        ProductionLogging.info(`${system} released control`, 'simpleAudioCoordinator');
      }
    }) as EventListener);

    // Setup stop handlers for each system
    window.addEventListener('audio:stop:sync', async () => {
      try {
        // TODO: Replace with SimplifiedAudioEngine
        // const { SimplifiedAudioEngine } = await import('@/services/SimplifiedAudioEngine');
        // TODO: Replace with SimplifiedAudioEngine.stop()
        // SimplifiedAudioEngine.getInstance().stop();
      } catch (e) {
        ProductionLogging.warn('Failed to stop sync audio:', 'simpleAudioCoordinator', e);
      }
    });

    window.addEventListener('audio:stop:simple', async () => {
      try {
        const { SimplifiedAudioEngine } = await import('@/services/SimplifiedAudioEngine');
        SimplifiedAudioEngine.getInstance().stop();
      } catch (e) {
        ProductionLogging.warn('Failed to stop simple audio:', 'simpleAudioCoordinator', e);
      }
    });

    window.addEventListener('audio:stop:voice', () => {
      try {
        // Stop voice command audio systems
        window.dispatchEvent(new CustomEvent('voice:stop'));
      } catch (e) {
        ProductionLogging.warn('Failed to stop voice audio:', 'simpleAudioCoordinator', e);
      }
    });

    window.addEventListener('audio:stop:charlotte', () => {
      try {
        // Stop Charlotte's conversation system
        window.dispatchEvent(new CustomEvent('charlotte:stop'));
        ProductionLogging.info('Requested Charlotte to stop speaking', 'simpleAudioCoordinator');
      } catch (e) {
        ProductionLogging.warn('Failed to stop Charlotte audio:', 'simpleAudioCoordinator', e);
      }
    });
  }

  getActiveSystem(): AudioSystem {
    return this.activeSystem;
  }

  /**
   * Get system priority for coordination
   */
  private getSystemPriority(system: AudioSystem): number {
    const priorities = {
      'charlotte': 100,      // Highest priority for story reading
      'interactive-word': 80, // High priority for user interactions
      'voice': 70,
      'simple': 50,
      'sync': 40
    };
    return priorities[system as keyof typeof priorities] || 0;
  }

  /**
   * Force release all locks (emergency cleanup)
   */
  forceReleaseAll(): void {
    this.activeSystem = null;
    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout);
      this.lockTimeout = null;
    }
    ProductionLogging.info('All locks force released', 'simpleAudioCoordinator');
  }
}

// Initialize coordinator immediately
if (typeof window !== 'undefined') {
  new SimpleAudioCoordinator();
}

export { SimpleAudioCoordinator };