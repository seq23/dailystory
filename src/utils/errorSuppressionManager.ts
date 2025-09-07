// Comprehensive error suppression with grouping and batching
class ErrorSuppressionManager {
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private suppressionEnabled = false;
  private errorCounts: Map<string, number> = new Map();
  private lastSummaryTime = 0;
  private summaryInterval = 10000; // 10 seconds
  private batchTimeout: number | null = null;

  constructor() {
    this.originalConsoleError = console.error.bind(console);
    this.originalConsoleWarn = console.warn.bind(console);
  }

  private normalizeMessage(message: string, ...args: any[]): string {
    return [message, ...args].join(' ').toLowerCase().trim();
  }

  private shouldSuppress(message: string, ...args: any[]): boolean {
    const fullMessage = this.normalizeMessage(message, ...args);

    // Chrome extension runtime errors (the main culprit)
    if (fullMessage.includes('unchecked runtime.lasterror') ||
        fullMessage.includes('could not establish connection') ||
        fullMessage.includes('receiving end does not exist') ||
        fullMessage.includes('chrome-extension://') ||
        fullMessage.includes('extensions::') ||
        fullMessage.includes('extension context invalidated') ||
        fullMessage.includes('the message port closed before a response was received')) {
      this.incrementErrorCount('Chrome Extension Errors');
      return true;
    }

    // Permissions Policy warnings
    if (fullMessage.includes('unrecognized feature') ||
        fullMessage.includes('permissions policy') ||
        fullMessage.includes('ambient-light-sensor') ||
        fullMessage.includes('battery') ||
        fullMessage.includes('vr') ||
        fullMessage.includes('gyroscope') ||
        fullMessage.includes('magnetometer')) {
      this.incrementErrorCount('Permissions Policy Warnings');
      return true;
    }

    // Network errors that are already handled
    if (fullMessage.includes('err_http2_protocol_error') ||
        fullMessage.includes('502 ()') ||
        fullMessage.includes('failed to load resource') ||
        fullMessage.includes('net::err_') ||
        fullMessage.includes('network error')) {
      this.incrementErrorCount('Network Errors');
      return true;
    }

    // Development hot reload messages
    if (fullMessage.includes('[vite] hot updated') ||
        fullMessage.includes('log entries are not shown') ||
        fullMessage.includes('[hmr] updated') ||
        fullMessage.includes('hot reload')) {
      this.incrementErrorCount('Development Messages');
      return true;
    }

    // Ad blocker and privacy extension warnings
    if (fullMessage.includes('content script') ||
        fullMessage.includes('adblock') ||
        fullMessage.includes('privacy') ||
        fullMessage.includes('tracker') ||
        fullMessage.includes('blocked a frame')) {
      this.incrementErrorCount('Privacy/Ad Blocker Messages');
      return true;
    }

    return false;
  }

  private incrementErrorCount(category: string) {
    const current = this.errorCounts.get(category) || 0;
    this.errorCounts.set(category, current + 1);
    this.scheduleSummary();
  }

  private scheduleSummary() {
    if (this.batchTimeout) return;

    this.batchTimeout = window.setTimeout(() => {
      this.showSummary();
      this.batchTimeout = null;
    }, 1000); // Show summary after 1 second of no new errors
  }

  private showSummary() {
    const now = Date.now();
    if (now - this.lastSummaryTime < this.summaryInterval) return;

    if (this.errorCounts.size > 0) {
      const totalSuppressed = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
      
      if (totalSuppressed > 0) {
        this.originalConsoleWarn(
          `🔇 Console Hygiene: Suppressed ${totalSuppressed} noisy messages in the last ${this.summaryInterval / 1000}s`,
          '\n📊 Breakdown:',
          Object.fromEntries(this.errorCounts)
        );
        
        this.errorCounts.clear();
        this.lastSummaryTime = now;
      }
    }
  }

  enable() {
    if (this.suppressionEnabled) return;

    console.error = (message: any, ...args: any[]) => {
      if (!this.shouldSuppress(String(message), ...args)) {
        this.originalConsoleError(message, ...args);
      }
    };

    console.warn = (message: any, ...args: any[]) => {
      if (!this.shouldSuppress(String(message), ...args)) {
        this.originalConsoleWarn(message, ...args);
      }
    };

    this.suppressionEnabled = true;
    console.log('🔇 Enhanced error suppression with grouping enabled');
  }

  disable() {
    if (!this.suppressionEnabled) return;

    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    this.suppressionEnabled = false;
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    this.showSummary(); // Show final summary
    console.log('🔊 Error suppression disabled');
  }

  getStatus() {
    return {
      enabled: this.suppressionEnabled,
      totalSuppressed: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0),
      categories: Object.fromEntries(this.errorCounts),
      environment: typeof process !== 'undefined' ? process.env.NODE_ENV : 'browser'
    };
  }

  // Force show current summary (useful for debugging)
  showCurrentSummary() {
    this.lastSummaryTime = 0; // Reset to force showing
    this.showSummary();
  }
}

export const errorSuppressionManager = new ErrorSuppressionManager();

// Enable immediately in all environments
errorSuppressionManager.enable();

// Add a global function for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).showErrorSuppression = () => errorSuppressionManager.showCurrentSummary();
  (window as any).errorSuppressionStatus = () => errorSuppressionManager.getStatus();
}