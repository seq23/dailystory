/**
 * Mobile Audio Diagnostics - Critical issue monitoring for mobile/tablet devices
 * Tracks the four core issues: hash mismatch, stop button persistence, highlight timing, voice reliability
 */

interface MobileAudioDiagnostic {
  timestamp: number;
  issueType: 'hash_mismatch' | 'stop_button_stuck' | 'highlight_slow' | 'voice_unreliable';
  details: Record<string, any>;
  deviceInfo: {
    userAgent: string;
    isMobile: boolean;
    isTablet: boolean;
    screenSize: string;
  };
}

class MobileAudioDiagnostics {
  private diagnostics: MobileAudioDiagnostic[] = [];
  private maxDiagnostics = 50; // Keep last 50 issues
  
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      isMobile: /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isTablet: /iPad|Android.*Tablet|Windows.*Touch/i.test(navigator.userAgent),
      screenSize: `${window.screen.width}x${window.screen.height}`
    };
  }

  // Track hash mismatch issues
  trackHashMismatch(audioHash: string | null, uiHash: string | null, retryCount: number = 0) {
    if (typeof window === 'undefined') return;
    
    this.addDiagnostic('hash_mismatch', {
      audioHash: audioHash || 'null',
      uiHash: uiHash || 'null',
      retryCount,
      pageContentHash: (window as any).__pageContentHash,
      audioHashLocked: (window as any).__audioHashLocked,
      timestamp: Date.now()
    });
    
    console.log('📊 Hash Mismatch Tracked:', { audioHash, uiHash, retryCount });
  }

  // Track stop button not disappearing
  trackStopButtonStuck(audioServicePlaying: boolean, uiPlaying: boolean, duration: number) {
    this.addDiagnostic('stop_button_stuck', {
      audioServicePlaying,
      uiPlaying,
      stuckDuration: duration,
      pollingActive: false, // We've eliminated polling, so this should be false
      eventDriven: true    // Should be true after our fixes
    });
    
    console.log('📊 Stop Button Issue Tracked:', { audioServicePlaying, uiPlaying, duration });
  }

  // Track slow highlighting issues
  trackHighlightTiming(wordIndex: number, expectedIndex: number, timingOffset: number, isMobile: boolean) {
    if (Math.abs(wordIndex - expectedIndex) > 1) {
      this.addDiagnostic('highlight_slow', {
        actualIndex: wordIndex,
        expectedIndex,
        timingOffset,
        isMobile,
        scalingFactor: this.getHighlightScaling(),
        syncFrequency: isMobile ? 200 : 500
      });
      
      console.log('📊 Highlight Timing Issue Tracked:', { wordIndex, expectedIndex, timingOffset });
    }
  }

  // Track voice command reliability issues
  trackVoiceIssue(issueType: 'wont_start' | 'stops_unexpectedly' | 'no_commands' | 'audio_conflict', details: Record<string, any> = {}) {
    this.addDiagnostic('voice_unreliable', {
      voiceIssueType: issueType,
      audioPlaying: this.isAudioCurrentlyPlaying(),
      mutualExclusionWorking: details.mutualExclusionWorking || false,
      microphoneConstraints: details.constraints || 'unknown',
      ...details
    });
    
    console.log('📊 Voice Issue Tracked:', { issueType, details });
  }

  private addDiagnostic(issueType: MobileAudioDiagnostic['issueType'], details: Record<string, any>) {
    const diagnostic: MobileAudioDiagnostic = {
      timestamp: Date.now(),
      issueType,
      details,
      deviceInfo: this.getDeviceInfo()
    };
    
    this.diagnostics.push(diagnostic);
    
    // Keep only recent diagnostics
    if (this.diagnostics.length > this.maxDiagnostics) {
      this.diagnostics = this.diagnostics.slice(-this.maxDiagnostics);
    }
    
    // Store in sessionStorage for debugging
    try {
      sessionStorage.setItem('mobile_audio_diagnostics', JSON.stringify(this.diagnostics));
    } catch (e) {
      console.warn('Failed to store diagnostics:', e);
    }
  }

  private getHighlightScaling(): number {
    // Try to get scaling factor from audioSyncService if available
    try {
      const service = (window as any).__audioSyncServiceInstance;
      return service?.durationScale || 1.0;
    } catch {
      return 1.0;
    }
  }

  private isAudioCurrentlyPlaying(): boolean {
    try {
      const service = (window as any).__audioSyncServiceInstance;
      return service?.isPlaying || false;
    } catch {
      return false;
    }
  }

  // Generate summary report for debugging
  generateReport(): string {
    const now = Date.now();
    const recent = this.diagnostics.filter(d => now - d.timestamp < 300000); // Last 5 minutes
    
    const summary = {
      total: recent.length,
      hashMismatches: recent.filter(d => d.issueType === 'hash_mismatch').length,
      stopButtonIssues: recent.filter(d => d.issueType === 'stop_button_stuck').length,
      highlightIssues: recent.filter(d => d.issueType === 'highlight_slow').length,
      voiceIssues: recent.filter(d => d.issueType === 'voice_unreliable').length,
      deviceInfo: this.getDeviceInfo()
    };
    
    return JSON.stringify(summary, null, 2);
  }

  // Get all diagnostics (for detailed debugging)
  getAllDiagnostics(): MobileAudioDiagnostic[] {
    return [...this.diagnostics];
  }

  // Clear diagnostics
  clearDiagnostics() {
    this.diagnostics = [];
    try {
      sessionStorage.removeItem('mobile_audio_diagnostics');
    } catch (e) {
      console.warn('Failed to clear diagnostics storage:', e);
    }
  }

  // Check if any critical issues are happening frequently
  hasCriticalIssues(): boolean {
    const now = Date.now();
    const recent = this.diagnostics.filter(d => now - d.timestamp < 60000); // Last minute
    
    // More than 3 issues in the last minute suggests critical problems
    return recent.length > 3;
  }
}

// Export singleton instance
export const mobileAudioDiagnostics = new MobileAudioDiagnostics();

// Make available for console debugging
if (typeof window !== 'undefined') {
  (window as any).__mobileAudioDiagnostics = mobileAudioDiagnostics;
}
