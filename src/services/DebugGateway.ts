/**
 * Silent Debug Gateway - Circuit Breaker for Debug Service Calls
 * 
 * Prevents debug service failures from affecting the main application
 * Implements exponential backoff and silent error handling
 */

import { supabase } from '@/integrations/supabase/client';

interface DebugCall {
  operation: string;
  sessionId?: string;
  limit?: number;
  global?: boolean;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  nextAttempt: number;
  isOpen: boolean;
}

class DebugGatewayService {
  private circuitBreaker: CircuitBreakerState = {
    failures: 0,
    lastFailure: 0,
    nextAttempt: 0,
    isOpen: false
  };

  private readonly maxFailures = 3;
  private readonly baseBackoffMs = 5000; // 5 seconds
  private readonly maxBackoffMs = 300000; // 5 minutes

  private isDebugEnabled(): boolean {
    return typeof window !== 'undefined' && window.location.search.includes('debug=1');
  }

  private logDebug(message: string, data?: any) {
    if (this.isDebugEnabled()) {
      console.log(`🔧 [DebugGateway] ${message}`, data || '');
    }
  }

  private canAttemptCall(): boolean {
    if (!this.circuitBreaker.isOpen) {
      return true;
    }

    const now = Date.now();
    if (now >= this.circuitBreaker.nextAttempt) {
      this.logDebug('Circuit breaker half-open - attempting recovery');
      return true;
    }

    return false;
  }

  private recordSuccess() {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.isOpen = false;
    this.logDebug('Circuit breaker closed - service recovered');
  }

  private recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();

    if (this.circuitBreaker.failures >= this.maxFailures) {
      const backoffTime = Math.min(
        this.baseBackoffMs * Math.pow(2, this.circuitBreaker.failures - this.maxFailures),
        this.maxBackoffMs
      );
      
      this.circuitBreaker.isOpen = true;
      this.circuitBreaker.nextAttempt = Date.now() + backoffTime;

      this.logDebug(`Circuit breaker opened - backing off for ${backoffTime}ms`, {
        failures: this.circuitBreaker.failures,
        nextAttempt: new Date(this.circuitBreaker.nextAttempt).toLocaleTimeString()
      });
    }
  }

  private createMockResponse(operation: string): any {
    switch (operation) {
      case 'recent-image-prompts':
        return { data: { imagePrompts: [] } };
      case 'prompt-history':
        return { data: { data: [], totalEntries: 0, fullDebugData: [] } };
      case 'ai-prompts':
        return { data: { data: [] } };
      case 'db-functions':
        return { data: { functions: [] } };
      default:
        return { data: [] };
    }
  }

  async callDebugService(params: DebugCall): Promise<{ data: any; error: any }> {
    // In production mode, return mock data unless debug is explicitly enabled
    if (!this.isDebugEnabled()) {
      return { data: this.createMockResponse(params.operation), error: null };
    }

    // Check circuit breaker
    if (!this.canAttemptCall()) {
      this.logDebug(`Call blocked by circuit breaker - ${params.operation}`);
      return { data: this.createMockResponse(params.operation), error: null };
    }

    try {
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.set('operation', params.operation);
      if (params.sessionId) queryParams.set('sessionId', params.sessionId);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.global) queryParams.set('global', 'true');

      const queryString = queryParams.toString();
      
      this.logDebug(`Calling debug service: ${params.operation}`, { queryString });

      const { data, error } = await supabase.functions.invoke(`unified-debug-service?${queryString}`);

      if (error) {
        throw error;
      }

      this.recordSuccess();
      this.logDebug(`Debug service call successful: ${params.operation}`);
      
      return { data, error: null };

    } catch (error: any) {
      this.recordFailure();
      
      // Silent error handling - log only in debug mode
      this.logDebug(`Debug service call failed: ${params.operation}`, {
        error: error.message,
        circuitBreakerState: this.circuitBreaker
      });

      // Always return mock data instead of throwing
      return { data: this.createMockResponse(params.operation), error: null };
    }
  }

  // Convenience methods for common operations
  async getRecentImagePrompts(limit = 5): Promise<{ data: any; error: any }> {
    return this.callDebugService({
      operation: 'recent-image-prompts',
      global: true,
      limit
    });
  }

  async getPromptHistory(sessionId: string, limit = 10): Promise<{ data: any; error: any }> {
    return this.callDebugService({
      operation: 'prompt-history',
      sessionId,
      limit
    });
  }

  async getAiPrompts(sessionId: string, limit = 50): Promise<{ data: any; error: any }> {
    return this.callDebugService({
      operation: 'ai-prompts',
      sessionId,
      limit
    });
  }

  // Get circuit breaker status for debugging
  getStatus() {
    return {
      ...this.circuitBreaker,
      canAttempt: this.canAttemptCall(),
      debugEnabled: this.isDebugEnabled()
    };
  }

  // Manual reset for debugging
  reset() {
    this.circuitBreaker = {
      failures: 0,
      lastFailure: 0,
      nextAttempt: 0,
      isOpen: false
    };
    this.logDebug('Circuit breaker manually reset');
  }
}

export const DebugGateway = new DebugGatewayService();

// Global access for debugging
if (typeof window !== 'undefined') {
  (window as any).debugGateway = DebugGateway;
}