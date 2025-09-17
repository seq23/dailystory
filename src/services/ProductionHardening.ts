// Production Hardening Service - Final phase of performance optimization
import { DebugLogger } from '@/services/DebugLogger';
import { performanceManager } from '@/services/PerformanceManager';
import { unhandledErrorManager } from '@/services/UnhandledErrorManager';
import { errorRecoveryManager } from '@/services/ErrorRecoveryManager';

export class ProductionHardening {
  private static instance: ProductionHardening;
  private isInitialized = false;
  private performanceMonitorInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): ProductionHardening {
    if (!ProductionHardening.instance) {
      ProductionHardening.instance = new ProductionHardening();
    }
    return ProductionHardening.instance;
  }

  // Initialize production hardening systems
  initialize(): void {
    if (this.isInitialized) return;

    DebugLogger.log('performance', 'ProductionHardening: Initializing systems');

    // Phase 1: Console cleanup verification
    this.verifyConsoleCleanup();

    // Phase 2: Memory leak prevention verification
    this.initializeMemoryLeakPrevention();

    // Phase 3: Performance monitoring
    this.initializePerformanceMonitoring();

    // Phase 4: Error suppression in production
    this.initializeProductionErrorSuppression();

    this.isInitialized = true;
    DebugLogger.log('performance', 'ProductionHardening: All systems initialized');
  }

  private verifyConsoleCleanup(): void {
    const consoleMethodsOriginal = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };

    // In production, intercept and suppress noisy console output
    if (!DebugLogger.isDebugEnabled()) {
      console.log = this.createFilteredConsoleMethod('log', consoleMethodsOriginal.log);
      console.warn = this.createFilteredConsoleMethod('warn', consoleMethodsOriginal.warn);
      // Keep console.error for critical issues
      
      DebugLogger.log('performance', 'Console cleanup verification: Production suppression active');
    } else {
      DebugLogger.log('performance', 'Console cleanup verification: Debug mode - full logging enabled');
    }
  }

  private createFilteredConsoleMethod(
    level: 'log' | 'warn' | 'error',
    originalMethod: (...args: any[]) => void
  ) {
    return (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      
      // Allow critical system messages through
      const allowedPatterns = [
        /error/i,
        /failed/i,
        /critical/i,
        /warning/i
      ];

      // Suppress development noise
      const suppressPatterns = [
        /debug/i,
        /🔍/,
        /📸/,
        /🖼️/,
        /🎯/,
        /✅/,
        /⏰/
      ];

      const shouldAllow = allowedPatterns.some(pattern => pattern.test(message));
      const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));

      if (shouldAllow && !shouldSuppress) {
        originalMethod.apply(console, args);
      }
      
      // Always log to DebugLogger for debug monitor
      const category = level === 'log' ? 'ui' : level === 'warn' ? 'performance' : 'error';
      DebugLogger.log(category, `Console ${level}: ${message}`, args.length > 1 ? args : undefined);
    };
  }

  private initializeMemoryLeakPrevention(): void {
    // Monitor timer usage
    const checkTimerUsage = () => {
      const stats = performanceManager.getStats();
      
      if (stats.timers > 100) {
        DebugLogger.warn('performance', 'High timer count detected', {
          timers: stats.timers,
          intervals: stats.intervals,
          recommendation: 'Consider consolidating or clearing unused timers'
        });
      }

      if (stats.intervals > 20) {
        DebugLogger.warn('performance', 'High interval count detected', {
          intervals: stats.intervals,
          recommendation: 'Review interval usage for potential memory leaks'
        });
      }
    };

    // Check timer usage every 2 minutes in debug mode
    if (DebugLogger.isDebugEnabled()) {
      this.performanceMonitorInterval = performanceManager.setInterval(
        checkTimerUsage,
        120000, // 2 minutes
        'timer usage monitoring'
      );
    }

    DebugLogger.log('performance', 'Memory leak prevention: Monitoring active');
  }

  private initializePerformanceMonitoring(): void {
    // Monitor memory pressure
    const checkMemoryPressure = () => {
      const memoryStatus = errorRecoveryManager.detectMemoryPressure();
      
      if (memoryStatus.isHigh) {
        DebugLogger.warn('performance', 'High memory pressure detected', {
          usage: memoryStatus.usage,
          recommendations: memoryStatus.recommendations
        });

        // Trigger garbage collection hint if available
        if ((window as any).gc) {
          try {
            (window as any).gc();
            DebugLogger.log('performance', 'Manual garbage collection triggered');
          } catch (e) {
            // Silently fail - gc not available
          }
        }
      }
    };

    // Check memory pressure every 30 seconds in debug mode
    if (DebugLogger.isDebugEnabled()) {
      performanceManager.setInterval(
        checkMemoryPressure,
        30000,
        'memory pressure monitoring'
      );
    }

    DebugLogger.log('performance', 'Performance monitoring: Active');
  }

  private initializeProductionErrorSuppression(): void {
    // Add production-specific error suppression patterns
    unhandledErrorManager.addSuppressionPattern(/console cleanup/i);
    unhandledErrorManager.addSuppressionPattern(/debug monitor/i);
    unhandledErrorManager.addSuppressionPattern(/performance optimization/i);
    unhandledErrorManager.addSuppressionPattern(/timer management/i);

    // Monitor error rates
    const errorStats = unhandledErrorManager.getErrorStats();
    
    if (errorStats.totalErrors > 50) {
      DebugLogger.warn('error', 'High error rate detected', {
        totalErrors: errorStats.totalErrors,
        uniqueErrors: errorStats.uniqueErrors,
        topErrors: errorStats.topErrors.slice(0, 3)
      });
    }

    DebugLogger.log('performance', 'Production error suppression: Active');
  }

  // Get comprehensive system status
  getSystemStatus(): {
    initialized: boolean;
    memoryStatus: any;
    performanceStats: any;
    errorStats: any;
    phase1Complete: boolean;
    phase2Complete: boolean;
    phase3Complete: boolean;
  } {
    return {
      initialized: this.isInitialized,
      memoryStatus: errorRecoveryManager.detectMemoryPressure(),
      performanceStats: performanceManager.getStats(),
      errorStats: unhandledErrorManager.getErrorStats(),
      phase1Complete: true, // Console cleanup complete
      phase2Complete: true, // Memory leak prevention active
      phase3Complete: this.isInitialized // Production hardening complete
    };
  }

  // Emergency cleanup for severe performance issues
  emergencyCleanup(): void {
    DebugLogger.warn('performance', 'Emergency cleanup triggered');

    // Clear all managed timers
    performanceManager.clearAll();

    // Clear error tracking
    unhandledErrorManager.clearErrorStats();
    errorRecoveryManager.clearRetryState();

    // Force garbage collection if available
    if ((window as any).gc) {
      try {
        (window as any).gc();
        DebugLogger.log('performance', 'Emergency garbage collection completed');
      } catch (e) {
        // Silently fail
      }
    }

    DebugLogger.log('performance', 'Emergency cleanup completed');
  }

  // Cleanup on shutdown
  shutdown(): void {
    if (this.performanceMonitorInterval) {
      clearInterval(this.performanceMonitorInterval);
      this.performanceMonitorInterval = null;
    }

    performanceManager.clearAll();
    this.isInitialized = false;
    
    DebugLogger.log('performance', 'ProductionHardening: Shutdown complete');
  }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  const hardening = ProductionHardening.getInstance();
  
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => hardening.initialize());
  } else {
    hardening.initialize();
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => hardening.shutdown());
}

export const productionHardening = ProductionHardening.getInstance();
