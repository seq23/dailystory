/**
 * TTS Circuit Breaker
 * Fast-fail mechanism to prevent cascading failures during ElevenLabs outages
 * NO RETRY LOGIC - maintains fast-fail design for better UX
 */
import { DebugLogger } from './DebugLogger';

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export class TTSCircuitBreaker {
  private static state: CircuitState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed'
  };
  
  private static readonly FAILURE_THRESHOLD = 5; // Open after 5 consecutive failures
  private static readonly HALF_OPEN_DELAY = 30000; // 30 seconds - try recovery after 30s
  
  /**
   * Check if circuit breaker is open (blocking TTS requests)
   * @returns true if circuit is open and TTS should fail-fast
   */
  static isOpen(): boolean {
    const now = Date.now();
    
    if (this.state.state === 'open') {
      // Check if enough time has passed to try recovery (half-open state)
      if (now - this.state.lastFailureTime > this.HALF_OPEN_DELAY) {
        this.state.state = 'half-open';
        DebugLogger.log('audio', '🔄 TTS circuit breaker: HALF-OPEN (testing recovery)');
        return false; // Allow one request to test
      }
      return true; // Still in open state, block requests
    }
    
    return false; // Closed or half-open, allow requests
  }
  
  /**
   * Record successful TTS generation
   * Resets failure count and closes circuit if in half-open state
   */
  static recordSuccess(): void {
    if (this.state.state === 'half-open') {
      DebugLogger.log('audio', '✅ TTS circuit breaker: CLOSED (service recovered)');
    }
    this.state.failures = 0;
    this.state.state = 'closed';
  }
  
  /**
   * Record TTS generation failure
   * Opens circuit after threshold is reached
   */
  static recordFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();
    
    if (this.state.failures >= this.FAILURE_THRESHOLD) {
      this.state.state = 'open';
      DebugLogger.warn('audio', `⚠️ TTS circuit breaker: OPEN (${this.state.failures} consecutive failures)`);
      DebugLogger.warn('audio', `⚠️ Failing fast to browser speech for next 30s`);
    } else if (this.state.state === 'half-open') {
      // If half-open test failed, go back to open state
      this.state.state = 'open';
      DebugLogger.warn('audio', '⚠️ TTS circuit breaker: reopened (recovery test failed)');
    }
  }
  
  /**
   * Get current circuit breaker state for monitoring
   */
  static getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state.state,
      failures: this.state.failures,
      lastFailureTime: this.state.lastFailureTime
    };
  }
  
  /**
   * Manually reset circuit breaker (for testing/admin purposes)
   */
  static reset(): void {
    this.state.failures = 0;
    this.state.state = 'closed';
    this.state.lastFailureTime = 0;
    DebugLogger.log('audio', '🔄 TTS circuit breaker manually reset');
  }
}
