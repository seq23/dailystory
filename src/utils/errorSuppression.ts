// Enhanced error suppression for better console hygiene
// This is now deprecated in favor of the enhanced errorSuppressionManager

class ErrorSuppressionManager {
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private suppressionEnabled = false;

  constructor() {
    this.originalConsoleError = console.error.bind(console);
    this.originalConsoleWarn = console.warn.bind(console);
  }

  private shouldSuppress(message: string, ...args: any[]): boolean {
    const fullMessage = [message, ...args].join(' ').toLowerCase();

    // Chrome extension runtime errors (enhanced patterns)
    if (fullMessage.includes('unchecked runtime.lasterror') ||
        fullMessage.includes('could not establish connection') ||
        fullMessage.includes('receiving end does not exist') ||
        fullMessage.includes('extension context invalidated') ||
        fullMessage.includes('chrome-extension://') ||
        fullMessage.includes('extensions::')) {
      return true;
    }

    // Permissions Policy warnings
    if (fullMessage.includes('unrecognized feature') ||
        fullMessage.includes('permissions policy') ||
        fullMessage.includes('ambient-light-sensor') ||
        fullMessage.includes('battery') ||
        fullMessage.includes('vr')) {
      return true;
    }

    // Network errors that are already handled
    if (fullMessage.includes('err_http2_protocol_error') ||
        fullMessage.includes('502 ()') ||
        fullMessage.includes('failed to load resource')) {
      return true;
    }

    // Development hot reload messages
    if (fullMessage.includes('[vite] hot updated') ||
        fullMessage.includes('log entries are not shown')) {
      return true;
    }

    return false;
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
    console.log('🔇 Enhanced error suppression enabled');
  }

  disable() {
    if (!this.suppressionEnabled) return;

    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    this.suppressionEnabled = false;
    console.log('🔊 Error suppression disabled');
  }

  getStatus() {
    return {
      enabled: this.suppressionEnabled,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

export const errorSuppressionManager = new ErrorSuppressionManager();

// Auto-enable in production
if (process.env.NODE_ENV === 'production') {
  errorSuppressionManager.enable();
}

// Enable in development if URL param is present
if (typeof window !== 'undefined' && window.location.search.includes('suppress-errors=true')) {
  errorSuppressionManager.enable();
}