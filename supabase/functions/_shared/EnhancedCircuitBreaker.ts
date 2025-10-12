// Enhanced Circuit Breaker - Smart Recovery with Network/API Error Classification
// Phase 3 of Universal Reliability System

interface EnhancedCircuitState {
  failures: number;
  networkFailures: number; // Track network-specific failures
  apiFailures: number;     // Track API-specific failures
  lastFailureAt: number;
  isOpen: boolean;
  halfOpenAttempts: number;
  halfOpenSuccesses: number;
  consecutiveSuccesses: number;
}

interface CircuitConfig {
  failThreshold: number;
  cooldownMs: number;
  halfOpenMaxAttempts: number;
  halfOpenSuccessThreshold: number;
}

interface CircuitStats {
  isOpen: boolean;
  failures: number;
  networkFailures: number;
  apiFailures: number;
  timeSinceLastFailure: number;
  halfOpenAttempts: number;
  consecutiveSuccesses: number;
}

class EnhancedCircuitBreaker {
  private static circuits = new Map<string, EnhancedCircuitState>();
  
  private static readonly DEFAULT_CONFIG: CircuitConfig = {
    failThreshold: 5,
    cooldownMs: 45000, // 45s base cooldown for API errors
    halfOpenMaxAttempts: 3,
    halfOpenSuccessThreshold: 2,
  };
  
  private static configs = new Map<string, CircuitConfig>();
  
  /**
   * Configure a circuit breaker
   */
  static configure(key: string, config: Partial<CircuitConfig>): void {
    this.configs.set(key, {
      ...this.DEFAULT_CONFIG,
      ...config,
    });
    console.log(`⚙️ [CIRCUIT] Configured ${key}:`, this.configs.get(key));
  }
  
  /**
   * Get or create circuit state
   */
  private static getOrCreateState(key: string): EnhancedCircuitState {
    if (!this.circuits.has(key)) {
      this.circuits.set(key, {
        failures: 0,
        networkFailures: 0,
        apiFailures: 0,
        lastFailureAt: 0,
        isOpen: false,
        halfOpenAttempts: 0,
        halfOpenSuccesses: 0,
        consecutiveSuccesses: 0,
      });
    }
    return this.circuits.get(key)!;
  }
  
  /**
   * Get config for a circuit
   */
  private static getConfig(key: string): CircuitConfig {
    return this.configs.get(key) || this.DEFAULT_CONFIG;
  }
  
  /**
   * Classify error type for graduated cooldown
   */
  private static classifyError(error: any): 'network' | 'api' {
    const message = error?.message?.toLowerCase() || '';
    const stack = error?.stack?.toLowerCase() || '';
    
    // Network error patterns
    const networkPatterns = [
      'timeout',
      'websocket',
      'network',
      'connection',
      'econnrefused',
      'enotfound',
      'etimedout',
      'fetch failed',
      'socket hang up',
      'aborted',
    ];
    
    const isNetworkError = networkPatterns.some(
      pattern => message.includes(pattern) || stack.includes(pattern)
    );
    
    return isNetworkError ? 'network' : 'api';
  }
  
  /**
   * Check if circuit is open (blocking requests)
   */
  static isOpen(key: string): boolean {
    const state = this.getOrCreateState(key);
    const config = this.getConfig(key);
    const now = Date.now();
    
    if (!state.isOpen) {
      return false;
    }
    
    const timeSinceFailure = now - state.lastFailureAt;
    
    // Graduated cooldown based on failure type
    const cooldown = state.networkFailures > state.apiFailures
      ? config.cooldownMs * 0.5  // 22.5s for network issues (transient)
      : config.cooldownMs;        // 45s for API issues (may need longer recovery)
    
    if (timeSinceFailure >= cooldown) {
      console.log(`🔄 [CIRCUIT] ${key} entering HALF-OPEN state (cooldown: ${Math.round(cooldown/1000)}s)`);
      state.isOpen = false;
      state.halfOpenAttempts = 0;
      state.halfOpenSuccesses = 0;
      return false; // Allow test requests
    }
    
    return true; // Still in open state
  }
  
  /**
   * Record a failure
   */
  static recordFailure(key: string, error: any): void {
    const state = this.getOrCreateState(key);
    const config = this.getConfig(key);
    const errorType = this.classifyError(error);
    
    // Reset consecutive successes
    state.consecutiveSuccesses = 0;
    
    // Update failure counts
    state.failures++;
    state.lastFailureAt = Date.now();
    
    if (errorType === 'network') {
      state.networkFailures++;
    } else {
      state.apiFailures++;
    }
    
    // If in half-open state, handle differently
    if (state.halfOpenAttempts > 0) {
      state.halfOpenAttempts++;
      
      // If max half-open attempts reached, reopen circuit
      if (state.halfOpenAttempts >= config.halfOpenMaxAttempts) {
        state.isOpen = true;
        console.warn(
          `⚠️ [CIRCUIT] ${key} REOPENED after ${state.halfOpenAttempts} failed half-open attempts ` +
          `(${state.failures} total failures: ${state.networkFailures} network, ${state.apiFailures} API)`
        );
        state.halfOpenAttempts = 0;
        state.halfOpenSuccesses = 0;
        return;
      }
    }
    
    // Open circuit if threshold exceeded
    if (state.failures >= config.failThreshold && !state.isOpen) {
      state.isOpen = true;
      console.warn(
        `⚠️ [CIRCUIT] ${key} OPENED: ${state.failures} failures ` +
        `(${state.networkFailures} network, ${state.apiFailures} API, type: ${errorType})`
      );
    }
  }
  
  /**
   * Record a success
   */
  static recordSuccess(key: string): void {
    const state = this.getOrCreateState(key);
    const config = this.getConfig(key);
    
    state.consecutiveSuccesses++;
    
    // If in half-open state, track successes
    if (state.halfOpenAttempts > 0) {
      state.halfOpenSuccesses++;
      
      // If enough successes in half-open state, fully close circuit
      if (state.halfOpenSuccesses >= config.halfOpenSuccessThreshold) {
        console.log(
          `✅ [CIRCUIT] ${key} CLOSED after ${state.halfOpenSuccesses} successful half-open attempts ` +
          `(resetting ${state.failures} failures)`
        );
        this.reset(key);
        return;
      }
    }
    
    // Progressive recovery: reduce failure count on successful requests
    if (state.failures > 0 && state.consecutiveSuccesses >= 3) {
      const oldFailures = state.failures;
      state.failures = Math.max(0, state.failures - 1);
      state.networkFailures = Math.max(0, state.networkFailures - 1);
      
      if (state.failures === 0) {
        console.log(`✅ [CIRCUIT] ${key} fully recovered (was ${oldFailures} failures)`);
        this.reset(key);
      }
    }
  }
  
  /**
   * Reset circuit breaker
   */
  static reset(key: string): void {
    this.circuits.set(key, {
      failures: 0,
      networkFailures: 0,
      apiFailures: 0,
      lastFailureAt: 0,
      isOpen: false,
      halfOpenAttempts: 0,
      halfOpenSuccesses: 0,
      consecutiveSuccesses: 0,
    });
  }
  
  /**
   * Get circuit statistics
   */
  static getStats(key: string): CircuitStats {
    const state = this.getOrCreateState(key);
    const now = Date.now();
    
    return {
      isOpen: state.isOpen,
      failures: state.failures,
      networkFailures: state.networkFailures,
      apiFailures: state.apiFailures,
      timeSinceLastFailure: state.lastFailureAt > 0 ? now - state.lastFailureAt : 0,
      halfOpenAttempts: state.halfOpenAttempts,
      consecutiveSuccesses: state.consecutiveSuccesses,
    };
  }
  
  /**
   * Get all circuit statistics
   */
  static getAllStats(): Record<string, CircuitStats> {
    const stats: Record<string, CircuitStats> = {};
    
    for (const [key] of this.circuits) {
      stats[key] = this.getStats(key);
    }
    
    return stats;
  }
  
  /**
   * Execute operation with circuit breaker protection
   */
  static async execute<T>(
    key: string,
    operation: () => Promise<T>,
    options?: {
      onCircuitOpen?: () => T | Promise<T>;
      beforeAttempt?: () => void;
    }
  ): Promise<T> {
    // Check if circuit is open
    if (this.isOpen(key)) {
      console.warn(`🚫 [CIRCUIT] ${key} is OPEN - rejecting request`);
      
      if (options?.onCircuitOpen) {
        return options.onCircuitOpen();
      }
      
      throw new Error(`Circuit breaker is open for ${key}`);
    }
    
    // Track half-open attempts
    const state = this.getOrCreateState(key);
    if (state.halfOpenAttempts > 0) {
      console.log(`🧪 [CIRCUIT] ${key} testing in HALF-OPEN state (attempt ${state.halfOpenAttempts + 1})`);
    }
    state.halfOpenAttempts = Math.max(1, state.halfOpenAttempts);
    
    if (options?.beforeAttempt) {
      options.beforeAttempt();
    }
    
    try {
      const result = await operation();
      this.recordSuccess(key);
      return result;
    } catch (error) {
      this.recordFailure(key, error);
      throw error;
    }
  }
}

export { EnhancedCircuitBreaker, type CircuitStats };
