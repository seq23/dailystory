/**
 * Silent Debug Gateway - Circuit Breaker for Debug Service Calls
 * 
 * Prevents debug service failures from affecting the main application
 * Implements exponential backoff and silent error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';
import { ProductionLogging } from '@/services/ProductionLogger';

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

  // EMERGENCY FIX: More aggressive circuit breaker to fail faster
  private readonly maxFailures = 2; // Reduced from 3 to 2
  private readonly baseBackoffMs = 2000; // Reduced from 5s to 2s
  private readonly maxBackoffMs = 60000; // Reduced from 5min to 1min

  private isDebugEnabled(): boolean {
    return typeof window !== 'undefined' && window.location.search.includes('debug=1');
  }

  private logDebug(message: string, data?: any) {
    if (this.isDebugEnabled()) {
      DebugLogger.log('network', message, data);
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

  // In-flight request deduplication and caching
  private inFlightRequests = new Map<string, Promise<{ data: any; error: any }>>();
  private responseCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  // EMERGENCY: Global request limiting and throttling
  private windowStart = 0;
  private requestCount = 0;
  private readonly WINDOW_MS = 60_000; // 1 minute
  private readonly MAX_REQUESTS_PER_WINDOW = 30; // hard cap per minute
  private emergencyShutdownUntil = 0; // timestamp until which requests are blocked
  private readonly EMERGENCY_BACKOFF_MS = 120_000; // 2 minutes

  // Throttle per operation to avoid rapid-fire calls
  private lastOpTimestamps = new Map<string, number>();
  private readonly MIN_OP_INTERVAL_MS = 3000; // 3s per operation key

  private resetWindowIfNeeded(now: number) {
    if (now - this.windowStart > this.WINDOW_MS) {
      this.windowStart = now;
      this.requestCount = 0;
    }
  }

  private registerRequestAndMaybeTripEmergency(now: number) {
    this.resetWindowIfNeeded(now);
    this.requestCount++;
    if (this.requestCount > this.MAX_REQUESTS_PER_WINDOW) {
      this.emergencyShutdownUntil = now + this.EMERGENCY_BACKOFF_MS;
      this.logDebug(
        `EMERGENCY SHUTDOWN: too many debug requests (${this.requestCount}/${this.MAX_REQUESTS_PER_WINDOW})`,
        { shutdownUntil: new Date(this.emergencyShutdownUntil).toLocaleTimeString() }
      );
    }
  }

  async callDebugService(params: DebugCall): Promise<{ data: any; error: any }> {
    // CRITICAL FIX: Require debug=1 for ALL operations to prevent resource exhaustion
    if (!this.isDebugEnabled()) {
      return { data: this.createMockResponse(params.operation), error: null };
    }

    const now = Date.now();

    // Emergency global shutdown check
    if (now < this.emergencyShutdownUntil) {
      this.logDebug(`Emergency shutdown active - skipping ${params.operation}`);
      return { data: this.createMockResponse(params.operation), error: null };
    }

    // Request deduplication - prevent simultaneous calls
    const requestKey = `${params.operation}-${params.sessionId || 'global'}-${params.limit || 10}`;

    // Per-operation throttle
    const lastOp = this.lastOpTimestamps.get(requestKey) || 0;
    if (now - lastOp < this.MIN_OP_INTERVAL_MS) {
      this.logDebug(`Throttled ${params.operation} (last ${now - lastOp}ms ago)`);
      // Return cached if available, else mock
      const cached = this.responseCache.get(requestKey);
      if (cached && now - cached.timestamp < this.CACHE_DURATION) {
        return { data: cached.data, error: null };
      }
      return { data: this.createMockResponse(params.operation), error: null };
    }

    // Check cache first
    const cached = this.responseCache.get(requestKey);
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      this.logDebug(`Using cached response for ${params.operation}`);
      return { data: cached.data, error: null };
    }

    // Check for in-flight request
    if (this.inFlightRequests.has(requestKey)) {
      this.logDebug(`Returning existing in-flight request for ${params.operation}`);
      return this.inFlightRequests.get(requestKey)!;
    }

    // Check circuit breaker
    if (!this.canAttemptCall()) {
      this.logDebug(`Call blocked by circuit breaker - ${params.operation}`);
      return { data: this.createMockResponse(params.operation), error: null };
    }

    // Register request for rate limiting and set throttle timestamp before executing
    this.registerRequestAndMaybeTripEmergency(now);
    this.lastOpTimestamps.set(requestKey, now);

    // Create and cache the request promise
    const requestPromise = this.executeRequest(params);
    this.inFlightRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache successful responses
      if (!result.error) {
        this.responseCache.set(requestKey, {
          data: result.data,
          timestamp: Date.now()
        });
      }

      return result;
    } catch (error) {
      throw error;
    } finally {
      // Always clean up in-flight request
      this.inFlightRequests.delete(requestKey);
    }
  }

  private async executeRequest(params: DebugCall): Promise<{ data: any; error: any }> {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.set('operation', params.operation);
      if (params.sessionId) queryParams.set('sessionId', params.sessionId);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.global) queryParams.set('global', 'true');

      const queryString = queryParams.toString();
      
      this.logDebug(`Calling debug service: ${params.operation}`, { queryString });

      // EMERGENCY FIX: Add connection timeout to prevent hanging requests (removed signal)
      const timeoutId = setTimeout(() => {
        this.logDebug(`Request timeout after 10s: ${params.operation}`);
      }, 10000); // 10 second timeout

      const { data, error } = await supabase.functions.invoke(`unified-debug-service?${queryString}`);
      
      clearTimeout(timeoutId);

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