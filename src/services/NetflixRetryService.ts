/**
 * Netflix Next Story Retry Service
 * Handles retry logic and circuit breaking for "next story" AI generation failures
 */

import { DebugLogger } from './DebugLogger';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export class NetflixRetryService {
  private static circuitBreakers = new Map<string, CircuitBreakerState>();
  
  private static readonly defaultConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true
  };

  private static readonly circuitBreakerConfig = {
    failureThreshold: 3, // More forgiving for "next story" scenarios
    timeoutMs: 45000, // Reduced timeout for faster recovery
    halfOpenRetryDelay: 15000, // Faster retry for better UX
    nextStoryThreshold: 2 // Special threshold for subsequent stories
  };

  /**
   * Execute function with retry logic and circuit breaker
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const circuitKey = `netflix-${operationName}`;
    const isNextStory = operationName.includes('next-story');
    
    DebugLogger.log('story', `NETFLIX-RETRY: Starting ${operationName}`, {
      maxRetries: finalConfig.maxRetries,
      isNextStory,
      circuitKey
    });
    
    // Check circuit breaker with special handling for next story
    if (this.isCircuitOpen(circuitKey)) {
      if (isNextStory) {
        DebugLogger.log('story', 'NETFLIX-RETRY: Circuit breaker open for next story - attempting reset');
        this.resetCircuitBreaker(circuitKey);
      } else {
        DebugLogger.warn('network', `Circuit breaker open for ${operationName}, failing fast`);
        throw new Error(`Circuit breaker open for ${operationName}`);
      }
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        DebugLogger.log('network', `Executing ${operationName}, attempt ${attempt}/${finalConfig.maxRetries}`);
        
        const result = await operation();
        
        // Success - reset circuit breaker
        this.recordSuccess(circuitKey);
        DebugLogger.log('network', `${operationName} succeeded on attempt ${attempt}`);
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        DebugLogger.warn('network', `${operationName} failed on attempt ${attempt}: ${lastError.message}`);
        
        // Record failure for circuit breaker
        this.recordFailure(circuitKey);
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          DebugLogger.error('network', `Non-retryable error for ${operationName}: ${lastError.message}`);
          break;
        }
        
        // Calculate delay for next attempt
        if (attempt < finalConfig.maxRetries) {
          const delay = this.calculateDelay(attempt, finalConfig);
          DebugLogger.log('network', `Waiting ${delay}ms before retry ${attempt + 1}`);
          await this.sleep(delay);
        }
      }
    }
    
    DebugLogger.error('network', `${operationName} failed after ${finalConfig.maxRetries} attempts`);
    throw lastError || new Error(`${operationName} failed after all retries`);
  }

  /**
   * Check if circuit breaker is open
   */
  private static isCircuitOpen(circuitKey: string): boolean {
    const state = this.circuitBreakers.get(circuitKey);
    
    if (!state) return false;
    
    const now = Date.now();
    
    switch (state.state) {
      case 'closed':
        return false;
        
      case 'open':
        // Check if enough time has passed to transition to half-open
        if (now - state.lastFailureTime > this.circuitBreakerConfig.halfOpenRetryDelay) {
          state.state = 'half-open';
          DebugLogger.log('network', `Circuit breaker ${circuitKey} transitioning to half-open`);
          return false;
        }
        return true;
        
      case 'half-open':
        return false;
        
      default:
        return false;
    }
  }

  /**
   * Record successful operation
   */
  private static recordSuccess(circuitKey: string): void {
    const state = this.circuitBreakers.get(circuitKey);
    
    if (state) {
      // Reset circuit breaker on success
      state.failures = 0;
      state.state = 'closed';
      DebugLogger.log('network', `Circuit breaker ${circuitKey} reset to closed state`);
    }
  }

  /**
   * Record failed operation
   */
  private static recordFailure(circuitKey: string): void {
    let state = this.circuitBreakers.get(circuitKey);
    
    if (!state) {
      state = {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed'
      };
      this.circuitBreakers.set(circuitKey, state);
    }
    
    state.failures++;
    state.lastFailureTime = Date.now();
    
    const isNextStory = circuitKey.includes('next-story');
    const threshold = isNextStory ? 
      this.circuitBreakerConfig.nextStoryThreshold : 
      this.circuitBreakerConfig.failureThreshold;
    
    DebugLogger.warn('story', `NETFLIX-RETRY: Recording failure for ${circuitKey}: ${state.failures}/${threshold} (next story: ${isNextStory})`);
    
    // Open circuit if threshold exceeded
    if (state.failures >= threshold) {
      state.state = 'open';
      DebugLogger.warn('network', `Circuit breaker ${circuitKey} opened after ${state.failures} failures (threshold: ${threshold})`);
    }
  }

  /**
   * Check if error should not be retried
   */
  private static isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      'authentication',
      'unauthorized',
      'permission',
      'forbidden',
      'not found',
      'bad request'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return nonRetryablePatterns.some(pattern => errorMessage.includes(pattern));
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, config.maxDelay);
    
    if (config.jitter) {
      // Add random jitter ±25%
      const jitter = delay * 0.25 * (Math.random() * 2 - 1);
      delay = Math.max(0, delay + jitter);
    }
    
    return Math.round(delay);
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker status for monitoring
   */
  static getCircuitBreakerStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [key, state] of this.circuitBreakers.entries()) {
      status[key] = {
        state: state.state,
        failures: state.failures,
        lastFailureTime: state.lastFailureTime,
        timeSinceLastFailure: Date.now() - state.lastFailureTime
      };
    }
    
    return status;
  }

  /**
   * Reset specific circuit breaker (for testing/admin)
   */
  static resetCircuitBreaker(circuitKey: string): void {
    const state = this.circuitBreakers.get(circuitKey);
    if (state) {
      state.failures = 0;
      state.state = 'closed';
      state.lastFailureTime = 0;
      DebugLogger.log('network', `Circuit breaker ${circuitKey} manually reset`);
    }
  }

  /**
   * Reset all circuit breakers (for testing/admin)
   */
  static resetAllCircuitBreakers(): void {
    this.circuitBreakers.clear();
    DebugLogger.log('network', 'All circuit breakers reset');
  }
}