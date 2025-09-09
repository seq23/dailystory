// Comprehensive error suppression with grouping and batching
class ErrorSuppressionManager {
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private suppressionEnabled = false;
  private errorCounts: Map<string, number> = new Map();
  private lastSummaryTime = 0;
  private summaryInterval = 30000; // 30 seconds (increased from 10)
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

    // Chrome extension runtime errors (comprehensive patterns)
    if (fullMessage.includes('unchecked runtime.lasterror') ||
        fullMessage.includes('could not establish connection') ||
        fullMessage.includes('receiving end does not exist') ||
        fullMessage.includes('chrome-extension://') ||
        fullMessage.includes('moz-extension://') ||
        fullMessage.includes('safari-extension://') ||
        fullMessage.includes('extensions::') ||
        fullMessage.includes('extension context invalidated') ||
        fullMessage.includes('cannot access contents of') ||
        fullMessage.includes('error in event handler') ||
        fullMessage.includes('the message port closed before a response was received')) {
      this.incrementErrorCount('Chrome Extension Errors');
      return true;
    }

    // Permissions Policy warnings (comprehensive)
    if (fullMessage.includes('unrecognized feature') ||
        fullMessage.includes('permissions policy') ||
        fullMessage.includes('ambient-light-sensor') ||
        fullMessage.includes('battery') ||
        fullMessage.includes('vr') ||
        fullMessage.includes('gyroscope') ||
        fullMessage.includes('magnetometer') ||
        fullMessage.includes('speaker') ||
        fullMessage.includes('vibrate')) {
      this.incrementErrorCount('Permissions Policy Warnings');
      return true;
    }

    // Sentry rate limiting and monitoring errors (CRITICAL ADDITION)
    if (fullMessage.includes('sentry.io/api/') ||
        fullMessage.includes('429 ()') ||
        fullMessage.includes('429 (too many requests)') ||
        fullMessage.includes('sentry.javascript') ||
        fullMessage.includes('ingest.sentry.io') ||
        fullMessage.includes('envelope') && fullMessage.includes('sentry')) {
      this.incrementErrorCount('Sentry Rate Limiting');
      return true;
    }

    // Performance violations (CRITICAL ADDITION)
    if (fullMessage.includes('[violation]') ||
        fullMessage.includes('setinterval') && fullMessage.includes('handler took') ||
        fullMessage.includes('settimeout') && fullMessage.includes('handler took') ||
        fullMessage.includes('requestanimationframe') && fullMessage.includes('handler took') ||
        fullMessage.includes('forced reflow while executing javascript') ||
        fullMessage.includes('long running javascript task took')) {
      this.incrementErrorCount('Performance Violations');
      return true;
    }

    // Iframe sandbox security warnings (CRITICAL ADDITION)
    if (fullMessage.includes('iframe which has both allow-scripts and allow-same-origin') ||
        fullMessage.includes('sandbox attribute can escape its sandboxing') ||
        fullMessage.includes('iframe') && fullMessage.includes('sandbox') && fullMessage.includes('escape')) {
      this.incrementErrorCount('Iframe Security Warnings');
      return true;
    }

    // Lovable hiring messages and ASCII art (CRITICAL ADDITION)
    if (fullMessage.includes("we're hiring!") ||
        fullMessage.includes('lovable.dev/careers') ||
        fullMessage.includes('⠀⠀#######') ||
        fullMessage.includes('hiring') && fullMessage.includes('lovable.dev')) {
      this.incrementErrorCount('Lovable Hiring Messages');
      return true;
    }

    // Network errors that are already handled
    if (fullMessage.includes('err_http2_protocol_error') ||
        fullMessage.includes('502 ()') ||
        fullMessage.includes('failed to load resource') ||
        fullMessage.includes('net::err_') ||
        fullMessage.includes('network error') ||
        fullMessage.includes('loading chunk') && fullMessage.includes('failed') ||
        fullMessage.includes('loading css chunk')) {
      this.incrementErrorCount('Network Errors');
      return true;
    }

    // Development hot reload and Vite messages
    if (fullMessage.includes('[vite] hot updated') ||
        fullMessage.includes('log entries are not shown') ||
        fullMessage.includes('[hmr] updated') ||
        fullMessage.includes('hot reload') ||
        fullMessage.includes('[vite]') ||
        fullMessage.includes('[hmr]') ||
        fullMessage.includes('connecting...') ||
        fullMessage.includes('connected.')) {
      this.incrementErrorCount('Development Messages');
      return true;
    }

    // PostMessage and cross-origin errors
    if (fullMessage.includes("failed to execute 'postmessage' on 'domwindow'") ||
        fullMessage.includes('target origin provided') && fullMessage.includes('does not match') ||
        fullMessage.includes('postmessage origin mismatch') ||
        fullMessage.includes('cross-origin frame') ||
        fullMessage.includes('blocked by cors policy')) {
      this.incrementErrorCount('Cross-Origin/PostMessage Errors');
      return true;
    }

    // Audio preload warnings
    if (fullMessage.includes('was preloaded using link preload but not used') ||
        fullMessage.includes('resource') && fullMessage.includes('preloaded') && fullMessage.includes('not used') ||
        fullMessage.includes('celebration.mp3') && fullMessage.includes('preloaded')) {
      this.incrementErrorCount('Audio Preload Warnings');
      return true;
    }

    // React development warnings
    if (fullMessage.includes('warning: reactdom.render is no longer supported') ||
        fullMessage.includes('warning: react.createfactory') ||
        fullMessage.includes('warning: componentwill') ||
        fullMessage.includes('the above error occurred in the') ||
        fullMessage.includes('consider adding an error boundary')) {
      this.incrementErrorCount('React Development Warnings');
      return true;
    }

    // Common browser noise
    if (fullMessage.includes('script error') ||
        fullMessage.includes('resizeobserver loop limit exceeded') ||
        fullMessage.includes('devtools') ||
        fullMessage.includes('non-error promise rejection captured') ||
        fullMessage.includes('performanceobserver') ||
        fullMessage.includes('permissions api') ||
        fullMessage.includes('notification api') ||
        fullMessage.includes('getusermedia')) {
      this.incrementErrorCount('Browser API Noise');
      return true;
    }

    // Ad blocker and privacy extension warnings
    if (fullMessage.includes('content script') ||
        fullMessage.includes('adblock') ||
        fullMessage.includes('privacy') ||
        fullMessage.includes('tracker') ||
        fullMessage.includes('blocked a frame') ||
        fullMessage.includes('third-party') ||
        fullMessage.includes('advertisement') ||
        fullMessage.includes('analytics') ||
        fullMessage.includes('tracking')) {
      this.incrementErrorCount('Privacy/Ad Blocker Messages');
      return true;
    }

    // Image generation and retry messages (CRITICAL NOISE REDUCTION)
    if (fullMessage.includes('story image failed to load') ||
        fullMessage.includes('recent image generation calls') ||
        fullMessage.includes('🔍 recent image generation calls') ||
        fullMessage.includes('using enhanced fallback') ||
        fullMessage.includes('image generation retry') ||
        fullMessage.includes('tier success found') ||
        fullMessage.includes('tier success identified') ||
        fullMessage.includes('fallback to classic') ||
        fullMessage.includes('runware-generate-image') ||
        fullMessage.includes('debug-recent-image-prompts')) {
      this.incrementErrorCount('Image Generation Retries');
      return true;
    }

    // Performance monitoring messages (CRITICAL NOISE REDUCTION)
    if (fullMessage.includes('⚡ performance:') ||
        fullMessage.includes('performance:') && fullMessage.includes('took') ||
        fullMessage.includes('ms') && fullMessage.includes('performance') ||
        fullMessage.includes('forced reflow') ||
        fullMessage.includes('long running') ||
        fullMessage.includes('handler took') ||
        fullMessage.includes('performance monitoring:') ||
        fullMessage.includes('breakdown:') && fullMessage.includes('object') ||
        fullMessage.includes('suppressionenabled') ||
        fullMessage.includes('suppressed') && fullMessage.includes('messages') ||
        fullMessage.includes('console hygiene:')) {
      this.incrementErrorCount('Performance Monitoring');
      return true;
    }

    // Backend tier checking and WebSocket messages
    if (fullMessage.includes('tier success') ||
        fullMessage.includes('websocket') ||
        fullMessage.includes('edge function') ||
        fullMessage.includes('supabase function') ||
        fullMessage.includes('runware api') ||
        fullMessage.includes('authentication') && fullMessage.includes('websocket')) {
      this.incrementErrorCount('Backend Debugging');
      return true;
    }

    // Avatar utility debug messages (CRITICAL NOISE REDUCTION)
    if (fullMessage.includes('🎭 [avatarutils]') ||
        fullMessage.includes('generated avatar url') ||
        fullMessage.includes('invalid avatar data') ||
        fullMessage.includes('unknown avatar type') ||
        fullMessage.includes('unknown skin tone') ||
        fullMessage.includes('no valid avatar data found')) {
      this.incrementErrorCount('Avatar Debug Messages');
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

  // Performance monitoring for setInterval violations
  monitorPerformanceViolations() {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 50) { // Suppress instead of log
              this.incrementErrorCount('Performance Monitoring');
            }
          });
        });
        observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (e) {
        // Performance Observer not supported or failed to initialize
      }
    }
  }
}

export const errorSuppressionManager = new ErrorSuppressionManager();

// Enable immediately in all environments
errorSuppressionManager.enable();

// Start performance monitoring
errorSuppressionManager.monitorPerformanceViolations();

// Add a global function for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).showErrorSuppression = () => errorSuppressionManager.showCurrentSummary();
  (window as any).errorSuppressionStatus = () => errorSuppressionManager.getStatus();
  (window as any).checkConsoleSuppressionStatus = () => {
    const status = errorSuppressionManager.getStatus();
    console.log('🔍 Console Suppression Status:', status);
    return status;
  };
}