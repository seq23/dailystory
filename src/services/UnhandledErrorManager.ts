// Unhandled Error Manager - Production hardening for error handling
import { DebugLogger } from '@/services/DebugLogger';

export class UnhandledErrorManager {
  private static instance: UnhandledErrorManager;
  private errorCounts = new Map<string, number>();
  private suppressPatterns: RegExp[] = [];

  private constructor() {
    this.initializeErrorHandling();
    this.setupDefaultSuppression();
  }

  static getInstance(): UnhandledErrorManager {
    if (!UnhandledErrorManager.instance) {
      UnhandledErrorManager.instance = new UnhandledErrorManager();
    }
    return UnhandledErrorManager.instance;
  }

  private initializeErrorHandling(): void {
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorKey = this.getErrorKey(event.reason);
      this.trackError(errorKey);

      // Check if this error should be suppressed
      if (this.shouldSuppressError(String(event.reason))) {
        event.preventDefault(); // Prevent console noise
        DebugLogger.log('error', 'Suppressed unhandled rejection', {
          reason: event.reason,
          count: this.errorCounts.get(errorKey)
        });
        return;
      }

      // Log to our debug system instead of console
      DebugLogger.error('error', 'Unhandled Promise Rejection', {
        reason: event.reason,
        type: typeof event.reason,
        count: this.errorCounts.get(errorKey),
        stack: event.reason?.stack
      });

      // Prevent default console logging in production
      if (!DebugLogger.isDebugEnabled()) {
        event.preventDefault();
      }
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      const errorKey = this.getErrorKey(event.error?.message || event.message);
      this.trackError(errorKey);

      // Suppress known noisy errors
      if (this.shouldSuppressError(event.message)) {
        DebugLogger.log('error', 'Suppressed global error', {
          message: event.message,
          count: this.errorCounts.get(errorKey)
        });
        return;
      }

      DebugLogger.error('error', 'Global JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        count: this.errorCounts.get(errorKey)
      });
    });
  }

  private setupDefaultSuppression(): void {
    this.suppressPatterns = [
      // Browser-specific noise
      /ResizeObserver loop limit exceeded/i,
      /ResizeObserver loop completed with undelivered notifications/i,
      /Script error\.?$/i,
      /Non-Error promise rejection captured/i,

      // Development tools
      /DevTools/i,
      /devtools/i,
      /chrome-extension:/i,
      /moz-extension:/i,

      // Network-related recoverable errors
      /NetworkError/i,
      /Failed to fetch/i,
      /ERR_NETWORK/i,
      /ERR_INTERNET_DISCONNECTED/i,
      /Load failed/i,

      // Common browser API noise
      /Permissions API/i,
      /Notification API/i,
      /PerformanceObserver/i,
      /IntersectionObserver/i,

      // Media/Audio recoverable errors
      /AbortError/i,
      /NotAllowedError.*autoplay/i,
      /The play\(\) request was interrupted/i,

      // CORS and security (often expected)
      /blocked by CORS/i,
      /Mixed Content/i,
      /Unsafe attempt to load URL/i,

      // Third-party script noise
      /facebook\.net/i,
      /google-analytics/i,
      /googletagmanager/i,
      /doubleclick\.net/i,

      // Mobile Safari specific
      /WebKit discarded an uncaught exception/i,
      /Can't find variable/i,

      // Image loading failures (recoverable)
      /404.*\.(jpg|jpeg|png|gif|webp|svg)$/i,
      /Failed to load resource.*img/i
    ];
  }

  addSuppressionPattern(pattern: RegExp): void {
    this.suppressPatterns.push(pattern);
    DebugLogger.log('error', 'Added error suppression pattern', { pattern: pattern.source });
  }

  private shouldSuppressError(message: string): boolean {
    return this.suppressPatterns.some(pattern => pattern.test(message));
  }

  private getErrorKey(error: any): string {
    if (typeof error === 'string') {
      return error.substring(0, 100); // Limit key length
    }
    if (error?.message) {
      return error.message.substring(0, 100);
    }
    return 'unknown-error';
  }

  private trackError(errorKey: string): void {
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    // Clear old error counts periodically to prevent memory bloat
    if (this.errorCounts.size > 100) {
      // Keep only the 50 most recent error types
      const entries = Array.from(this.errorCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 50);
      
      this.errorCounts.clear();
      entries.forEach(([key, count]) => this.errorCounts.set(key, count));
    }
  }

  // Get error statistics for monitoring
  getErrorStats(): { 
    totalErrors: number; 
    uniqueErrors: number; 
    topErrors: Array<{ error: string; count: number }> 
  } {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const uniqueErrors = this.errorCounts.size;
    const topErrors = Array.from(this.errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { totalErrors, uniqueErrors, topErrors };
  }

  // Clear error tracking (useful for testing)
  clearErrorStats(): void {
    this.errorCounts.clear();
    DebugLogger.log('error', 'Error statistics cleared');
  }

  // Enhanced image generation error detection
  isImageGenerationError(error: any): boolean {
    const message = String(error?.message || error || '').toLowerCase();
    return message.includes('image') || 
           message.includes('generation') || 
           message.includes('runware') ||
           message.includes('tier') ||
           message.includes('fallback');
  }

  // Enhanced page 1 crash detection
  isPage1CrashIndicator(error: any): boolean {
    const message = String(error?.message || error || '').toLowerCase();
    const stack = String(error?.stack || '').toLowerCase();
    
    return (message.includes('page') && message.includes('1')) ||
           stack.includes('generateimagefor') ||
           stack.includes('cleanstorypagecomponent') ||
           message.includes('out of memory') ||
           message.includes('maximum call stack');
  }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  UnhandledErrorManager.getInstance();
}

export const unhandledErrorManager = UnhandledErrorManager.getInstance();
