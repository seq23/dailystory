/**
 * Centralized audio permissions and validation utilities
 * Manages premium status, voice command state, and network availability checks
 */

export interface AudioPermissionContext {
  isPremium: boolean;
  vcStatus: 'idle' | 'listening' | 'processing';
  isNetworkAvailable: boolean;
}

export class AudioPermissions {
  private static currentContext: AudioPermissionContext = {
    isPremium: false,
    vcStatus: 'idle',
    isNetworkAvailable: navigator.onLine
  };

  /**
   * Update the current permission context
   */
  static updateContext(updates: Partial<AudioPermissionContext>): void {
    this.currentContext = { ...this.currentContext, ...updates };
    console.log('🔐 Audio Permissions updated:', this.currentContext);
  }

  /**
   * Check if voice hover actions are allowed
   */
  static canUseVoiceHover(): boolean {
    const { isPremium, vcStatus, isNetworkAvailable } = this.currentContext;
    console.log('🔍 Voice hover check:', { isPremium, vcStatus, isNetworkAvailable });
    
    // Allow voice hover for all users when voice commands are active
    return isNetworkAvailable && vcStatus === 'listening';
  }

  /**
   * Check if premium audio features are allowed
   */
  static canUsePremiumAudio(): boolean {
    return this.currentContext.isPremium;
  }

  /**
   * Check if any audio can be played
   */
  static canPlayAudio(): boolean {
    return this.currentContext.isNetworkAvailable;
  }

  /**
   * Get current permission context
   */
  static getContext(): AudioPermissionContext {
    return { ...this.currentContext };
  }

  /**
   * Get reason why action is blocked (for debugging)
   */
  static getBlockReason(action: 'voice-hover' | 'premium-audio' | 'any-audio'): string | null {
    const { isPremium, vcStatus, isNetworkAvailable } = this.currentContext;

    if (!isNetworkAvailable) return 'No network connection';
    
    switch (action) {
      case 'voice-hover':
        if (vcStatus !== 'listening') return 'Voice commands not active';
        return null;
      case 'premium-audio':
        if (!isPremium) return 'Premium subscription required';
        return null;
      case 'any-audio':
        return null;
      default:
        return 'Unknown action';
    }
  }
}

// Listen for network changes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    AudioPermissions.updateContext({ isNetworkAvailable: true });
  });
  
  window.addEventListener('offline', () => {
    AudioPermissions.updateContext({ isNetworkAvailable: false });
  });
}