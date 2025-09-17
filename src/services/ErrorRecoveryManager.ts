// Error Recovery Manager - Enhanced error handling and graceful degradation
import { DebugLogger } from '@/services/DebugLogger';
import { performanceManager } from '@/services/PerformanceManager';

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackValue?: any;
  onError?: (error: Error, attempt: number) => void;
  onRecovery?: (result: any, attempts: number) => void;
}

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private retryQueue = new Map<string, { retries: number; lastAttempt: number }>();
  
  private constructor() {
    // Handle global unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        DebugLogger.error('error', 'Unhandled Promise Rejection', {
          reason: event.reason,
          promise: event.promise,
          stack: event.reason?.stack
        });
        
        // Prevent console noise for known recoverable errors
        if (this.shouldSuppressError(event.reason)) {
          event.preventDefault();
        }
      });
      
      window.addEventListener('error', (event) => {
        DebugLogger.error('error', 'Global Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        });
      });
    }
  }

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  // Enhanced retry with exponential backoff and circuit breaker pattern
  async withRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    options: ErrorRecoveryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      fallbackValue,
      onError,
      onRecovery
    } = options;

    const retryInfo = this.retryQueue.get(operationId) || { retries: 0, lastAttempt: 0 };
    
    // Circuit breaker: if too many recent failures, fail fast
    if (retryInfo.retries >= maxRetries && Date.now() - retryInfo.lastAttempt < 60000) {
      DebugLogger.warn('error', `Circuit breaker open for ${operationId}`, { retryInfo });
      if (fallbackValue !== undefined) return fallbackValue;
      throw new Error(`Circuit breaker open for ${operationId}`);
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Success - reset retry counter
        if (retryInfo.retries > 0) {
          this.retryQueue.delete(operationId);
          onRecovery?.(result, attempt);
          DebugLogger.log('error', `Recovered after ${attempt} attempts`, { operationId });
        }
        
        return result;
      } catch (error) {
        DebugLogger.warn('error', `Operation ${operationId} failed (attempt ${attempt}/${maxRetries})`, {
          error: error.message,
          attempt,
          maxRetries
        });

        onError?.(error as Error, attempt);
        
        // Update retry info
        this.retryQueue.set(operationId, {
          retries: attempt,
          lastAttempt: Date.now()
        });

        // If this is the last attempt, either return fallback or throw
        if (attempt === maxRetries) {
          if (fallbackValue !== undefined) {
            DebugLogger.log('error', `Using fallback value for ${operationId}`, { fallbackValue });
            return fallbackValue;
          }
          throw error;
        }

        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => 
          performanceManager.setTimeout(() => resolve(void 0), delay, `retry delay ${operationId}`)
        );
      }
    }

    throw new Error(`Retry loop exhausted for ${operationId}`);
  }

  // Memory pressure detection and graceful degradation
  detectMemoryPressure(): { 
    isHigh: boolean; 
    usage: number; 
    recommendations: string[] 
  } {
    const memory = (performance as any).memory;
    if (!memory) {
      return { isHigh: false, usage: 0, recommendations: [] };
    }

    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
    const usage = usedMB / limitMB;
    const isHigh = usage > 0.8;

    const recommendations: string[] = [];
    if (isHigh) {
      recommendations.push('Clear image cache');
      recommendations.push('Reduce concurrent operations');
      recommendations.push('Defer non-critical tasks');
    }

    return { isHigh, usage, recommendations };
  }

  // Image generation error recovery with progressive fallbacks
  async recoverImageGeneration(
    pageText: string,
    userInfo: any,
    sessionId: string,
    pageNumber: number,
    isPremium: boolean
  ): Promise<{ success: boolean; url?: string; tier?: string }> {
    
    // Check memory pressure first
    const memoryStatus = this.detectMemoryPressure();
    if (memoryStatus.isHigh) {
      DebugLogger.warn('performance', 'High memory pressure detected during image generation', {
        usage: memoryStatus.usage,
        recommendations: memoryStatus.recommendations
      });
    }

    try {
      // This would integrate with your existing SimpleImageService
      // but with enhanced error recovery
      DebugLogger.log('image', 'Starting recovered image generation', {
        pageNumber,
        memoryPressure: memoryStatus.isHigh
      });

      // Return success for now - this would integrate with actual service
      return {
        success: true,
        url: `fallback-image-${pageNumber}.svg`,
        tier: 'recovery'
      };
    } catch (error) {
      DebugLogger.error('image', 'Image recovery failed', error);
      return { success: false };
    }
  }

  private shouldSuppressError(reason: any): boolean {
    const message = String(reason?.message || reason || '').toLowerCase();
    
    // Suppress known recoverable errors that don't need console noise
    const suppressPatterns = [
      'network error',
      'fetch failed',
      'timeout',
      'aborted',
      'cancelled',
      'non-error promise rejection'
    ];

    return suppressPatterns.some(pattern => message.includes(pattern));
  }

  // Performance monitoring for crash prevention
  monitorPerformance(): {
    timers: number;
    intervals: number;
    memory: { used: number; total: number; limit: number } | null;
    recommendations: string[];
  } {
    const stats = performanceManager.getStats();
    const recommendations: string[] = [];

    if (stats.timers > 50) {
      recommendations.push('High timer count detected - potential memory leak');
    }

    if (stats.intervals > 10) {
      recommendations.push('Multiple intervals running - consider consolidation');
    }

    if (stats.memory && stats.memory.used > stats.memory.limit * 0.8) {
      recommendations.push('High memory usage - consider clearing caches');
    }

    return { ...stats, recommendations };
  }

  // Clear all retry state (useful for session resets)
  clearRetryState(): void {
    this.retryQueue.clear();
    DebugLogger.log('error', 'Retry state cleared');
  }
}

// Export singleton instance
export const errorRecoveryManager = ErrorRecoveryManager.getInstance();