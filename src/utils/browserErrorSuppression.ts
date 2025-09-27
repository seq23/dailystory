// Browser-level error suppression for Chrome extension runtime errors
class BrowserErrorSuppression {
  private suppressionEnabled = false;
  private originalOnError: OnErrorEventHandler | null = null;
  private originalOnUnhandledRejection: ((event: PromiseRejectionEvent) => any) | null = null;
  private suppressedCount = 0;
  private lastSummaryTime = 0;
  private summaryInterval = 60000; // 1 minute

  private isDebugMode(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.search.includes('debug=1') || 
            window.location.search.includes('debug=extensions'));
  }

  private shouldSuppressBrowserError(message: string, filename?: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    // In debug mode, suppress browser noise but not application errors
    if (this.isDebugMode()) {
      // ALWAYS suppress browser extensions, permissions policy, iframe warnings, and deprecated APIs even in debug mode
      return lowerMessage.includes('chrome-extension://') || 
             lowerMessage.includes('moz-extension://') ||
             lowerMessage.includes('permissions policy') ||
             lowerMessage.includes('unrecognized feature') ||
             lowerMessage.includes('ambient-light-sensor') ||
             lowerMessage.includes('battery') ||
             lowerMessage.includes('vr') ||
             lowerMessage.includes('iframe which has both allow-scripts and allow-same-origin') ||
             lowerMessage.includes('sandbox attribute can escape its sandboxing') ||
             lowerMessage.includes('deprecated api for given entry type') ||
             lowerMessage.includes('deprecated feature used') ||
             lowerMessage.includes('unchecked runtime.lasterror') ||
             lowerMessage.includes('could not establish connection');
    }

    // Chrome extension runtime errors
    if (lowerMessage.includes('unchecked runtime.lasterror') ||
        lowerMessage.includes('could not establish connection') ||
        lowerMessage.includes('receiving end does not exist') ||
        lowerMessage.includes('extension context invalidated') ||
        lowerMessage.includes('cannot access contents of') ||
        lowerMessage.includes('the message port closed before a response was received') ||
        lowerMessage.includes('deprecated feature used') ||
        lowerMessage.includes('permissions policy directive') ||
        lowerMessage.includes('not allowed to use feature')) {
      this.suppressedCount++;
      return true;
    }

    // Extension-related URLs
    if (filename && (
        filename.includes('chrome-extension://') ||
        filename.includes('moz-extension://') ||
        filename.includes('safari-extension://'))) {
      this.suppressedCount++;
      return true;
    }

    // Content script injection errors
    if (lowerMessage.includes('content script') ||
        lowerMessage.includes('script injected') ||
        lowerMessage.includes('extension script')) {
      this.suppressedCount++;
      return true;
    }

    return false;
  }

  private shouldSuppressPromiseRejection(reason: any): boolean {
    if (this.isDebugMode()) return false;

    const reasonStr = String(reason).toLowerCase();
    
    // Extension-related promise rejections
    if (reasonStr.includes('chrome-extension://') ||
        reasonStr.includes('extension') ||
        reasonStr.includes('runtime.lasterror') ||
        reasonStr.includes('connection') && reasonStr.includes('receiving end')) {
      this.suppressedCount++;
      return true;
    }

    return false;
  }

  private showSummary() {
    const now = Date.now();
    if (now - this.lastSummaryTime < this.summaryInterval || this.suppressedCount === 0) return;

    // Only show summary if there are many errors or in debug mode
    if (this.suppressedCount > 50 || this.isDebugMode()) {
      console.warn(
        `🔇 Browser Error Suppression: Blocked ${this.suppressedCount} extension runtime errors in the last ${this.summaryInterval / 1000}s`
      );
    }
    
    this.suppressedCount = 0;
    this.lastSummaryTime = now;
  }

  enable() {
    if (this.suppressionEnabled || typeof window === 'undefined') return;

    // Store original handlers
    this.originalOnError = window.onerror;
    this.originalOnUnhandledRejection = window.onunhandledrejection;

    // Override window.onerror
    window.onerror = (message, filename, lineno, colno, error) => {
      const messageStr = String(message);
      
      if (this.shouldSuppressBrowserError(messageStr, filename)) {
        return true; // Prevent default error handling
      }

      // Call original handler if not suppressed
      if (this.originalOnError) {
        return this.originalOnError(message, filename, lineno, colno, error);
      }
      
      return false;
    };

    // Override unhandled promise rejection handler
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      if (this.shouldSuppressPromiseRejection(event.reason)) {
        event.preventDefault();
        return;
      }

      // Call original handler if not suppressed
      if (this.originalOnUnhandledRejection) {
        this.originalOnUnhandledRejection(event);
      }
    };

    this.suppressionEnabled = true;
    
    // Set up periodic summary
    setInterval(() => this.showSummary(), this.summaryInterval);
    
    console.log('🔇 Browser-level error suppression enabled for extension runtime errors');
  }

  disable() {
    if (!this.suppressionEnabled || typeof window === 'undefined') return;

    // Restore original handlers
    window.onerror = this.originalOnError;
    window.onunhandledrejection = this.originalOnUnhandledRejection;
    
    this.suppressionEnabled = false;
    this.showSummary(); // Show final summary
    
    console.log('🔊 Browser-level error suppression disabled');
  }

  getStatus() {
    return {
      enabled: this.suppressionEnabled,
      suppressedCount: this.suppressedCount,
      debugMode: this.isDebugMode(),
      environment: typeof process !== 'undefined' ? process.env.NODE_ENV : 'browser'
    };
  }

  // Detect problematic extensions (for user guidance)
  detectProblematicExtensions(): string[] {
    const extensions: string[] = [];
    
    // Check for common extension indicators in DOM
    if (typeof document !== 'undefined') {
      // Look for extension-injected elements
      const extensionElements = document.querySelectorAll('[class*="extension"], [id*="extension"]');
      if (extensionElements.length > 0) {
        extensions.push('DOM-modifying extensions detected');
      }

      // Check for ad blocker indicators
      const adBlockerTest = document.createElement('div');
      adBlockerTest.innerHTML = '&nbsp;';
      adBlockerTest.className = 'adsbox';
      document.body.appendChild(adBlockerTest);
      
      if (adBlockerTest.offsetHeight === 0) {
        extensions.push('Ad blocker detected');
      }
      
      document.body.removeChild(adBlockerTest);
    }

    return extensions;
  }
}

export const browserErrorSuppression = new BrowserErrorSuppression();

// Enable immediately in all environments
browserErrorSuppression.enable();

// Add debugging functions in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).browserErrorSuppressionStatus = () => browserErrorSuppression.getStatus();
  (window as any).detectExtensions = () => browserErrorSuppression.detectProblematicExtensions();
}