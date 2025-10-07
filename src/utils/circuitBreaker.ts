/**
 * Circuit Breaker Utility
 * Prevents repeated calls to failing services with exponential backoff
 */

interface CircuitBreakerConfig {
  failureThreshold: number;
  backoffDuration: number; // milliseconds
  storageKey: string;
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  
  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }
  
  /**
   * Check if circuit breaker is open (blocking calls)
   */
  isOpen(): boolean {
    const backoffUntil = sessionStorage.getItem(`${this.config.storageKey}_backoff_until`);
    if (backoffUntil && Date.now() < parseInt(backoffUntil)) {
      return true;
    }
    return false;
  }
  
  /**
   * Record a failure and potentially open the circuit
   */
  recordFailure(): void {
    const failureCount = this.getFailureCount() + 1;
    sessionStorage.setItem(`${this.config.storageKey}_failures`, String(failureCount));
    
    if (failureCount >= this.config.failureThreshold) {
      const backoffUntil = Date.now() + this.config.backoffDuration;
      sessionStorage.setItem(`${this.config.storageKey}_backoff_until`, String(backoffUntil));
      console.log(`[CircuitBreaker] ${this.config.storageKey} opened until ${new Date(backoffUntil).toISOString()}`);
    }
  }
  
  /**
   * Record a success and reset the circuit
   */
  recordSuccess(): void {
    sessionStorage.removeItem(`${this.config.storageKey}_failures`);
    sessionStorage.removeItem(`${this.config.storageKey}_backoff_until`);
  }
  
  /**
   * Get current failure count
   */
  private getFailureCount(): number {
    return parseInt(sessionStorage.getItem(`${this.config.storageKey}_failures`) || '0');
  }
  
  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.recordSuccess();
  }
  
  /**
   * Get status information
   */
  getStatus(): { isOpen: boolean; failureCount: number; backoffUntil?: Date } {
    const backoffUntil = sessionStorage.getItem(`${this.config.storageKey}_backoff_until`);
    return {
      isOpen: this.isOpen(),
      failureCount: this.getFailureCount(),
      backoffUntil: backoffUntil ? new Date(parseInt(backoffUntil)) : undefined
    };
  }
}

// Pre-configured circuit breakers for common services
export const subscriptionSyncBreaker = new CircuitBreaker({
  failureThreshold: 2,
  backoffDuration: 15 * 60 * 1000, // 15 minutes
  storageKey: 'billing_sync'
});

export const checkSubscriptionBreaker = new CircuitBreaker({
  failureThreshold: 3,
  backoffDuration: 5 * 60 * 1000, // 5 minutes
  storageKey: 'check_subscription'
});
