/**
 * Enhanced Network Retry Manager
 * Addresses ERROR-027: Network Quality Check Persistent Failures
 * 
 * Provides intelligent retry logic with exponential backoff,
 * network state caching, and comprehensive error classification
 */

import { ProductionLogging } from '@/services/ProductionLogger';

interface NetworkState {
  quality: 'excellent' | 'good' | 'poor' | 'offline';
  lastCheck: number;
  consecutiveFailures: number;
  isChecking: boolean;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

interface HealthEndpoint {
  url: string;
  timeout: number;
  priority: number;
  name: string;
}

export class NetworkRetryManager {
  private static instance: NetworkRetryManager;
  private networkState: NetworkState = {
    quality: navigator.onLine ? 'good' : 'offline',
    lastCheck: 0,
    consecutiveFailures: 0,
    isChecking: false
  };

  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private healthEndpoints: HealthEndpoint[] = [];
  private retryConfigs = new Map<string, RetryConfig>();

  private constructor() {
    this.initializeHealthEndpoints();
    this.setupNetworkListeners();
  }

  static getInstance(): NetworkRetryManager {
    if (!NetworkRetryManager.instance) {
      NetworkRetryManager.instance = new NetworkRetryManager();
    }
    return NetworkRetryManager.instance;
  }

  /**
   * Initialize health check endpoints in priority order
   */
  private initializeHealthEndpoints(): void {
    this.healthEndpoints = [
      {
        url: '/functions/v1/system-diagnostics',
        timeout: 2000,
        priority: 1,
        name: 'Internal Health Check'
      },
      {
        url: window.location.origin + '/favicon.ico',
        timeout: 1500,
        priority: 2,
        name: 'Origin Connectivity'
      },
      {
        url: 'https://httpbin.org/status/200',
        timeout: 3000,
        priority: 3,
        name: 'External Connectivity'
      }
    ];

    // Set default retry configs
    this.setRetryConfig('default', {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true
    });

    this.setRetryConfig('network-check', {
      maxRetries: 2,
      baseDelay: 500,
      maxDelay: 5000,
      backoffMultiplier: 2,
      jitter: false
    });
  }

  /**
   * Setup network event listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      ProductionLogging.info('NETWORK', 'Browser reports online');
      this.resetNetworkState();
      this.checkNetworkQuality();
    });

    window.addEventListener('offline', () => {
      ProductionLogging.warn('NETWORK', 'Browser reports offline');
      this.networkState = {
        ...this.networkState,
        quality: 'offline',
        consecutiveFailures: this.networkState.consecutiveFailures + 1,
        lastCheck: Date.now()
      };
    });

    // Periodic quality monitoring
    setInterval(() => {
      if (navigator.onLine && this.shouldCheckNetwork()) {
        this.checkNetworkQuality();
      }
    }, 30000);
  }

  /**
   * Set retry configuration for a specific operation type
   */
  setRetryConfig(type: string, config: RetryConfig): void {
    this.retryConfigs.set(type, config);
  }

  /**
   * Get retry configuration for an operation type
   */
  private getRetryConfig(type: string): RetryConfig {
    return this.retryConfigs.get(type) || this.retryConfigs.get('default')!;
  }

  /**
   * Check if network quality check is needed
   */
  private shouldCheckNetwork(): boolean {
    const now = Date.now();
    const timeSinceLastCheck = now - this.networkState.lastCheck;
    
    // Check if cache is expired or we haven't checked yet
    return timeSinceLastCheck > this.cacheTimeout || this.networkState.lastCheck === 0;
  }

  /**
   * Perform comprehensive network quality check
   */
  async checkNetworkQuality(): Promise<'excellent' | 'good' | 'poor' | 'offline'> {
    if (this.networkState.isChecking) {
      return this.networkState.quality;
    }

    if (!navigator.onLine) {
      return this.updateNetworkState('offline');
    }

    // Check cache first
    if (!this.shouldCheckNetwork()) {
      ProductionLogging.debug('NETWORK', 'Using cached network quality', undefined, {
        quality: this.networkState.quality,
        cacheAge: Date.now() - this.networkState.lastCheck
      });
      return this.networkState.quality;
    }

    this.networkState.isChecking = true;

    try {
      const results = await this.runHealthChecks();
      const quality = this.calculateNetworkQuality(results);
      return this.updateNetworkState(quality, results.successCount > 0);
    } catch (error) {
      ProductionLogging.error('NETWORK', 'Network quality check failed', undefined, error);
      return this.updateNetworkState('offline', false);
    } finally {
      this.networkState.isChecking = false;
    }
  }

  /**
   * Run health checks against all endpoints
   */
  private async runHealthChecks(): Promise<{
    results: Array<{ endpoint: HealthEndpoint; success: boolean; duration: number; error?: string }>;
    successCount: number;
    averageLatency: number;
  }> {
    const results = await Promise.allSettled(
      this.healthEndpoints.map(async (endpoint) => {
        const startTime = Date.now();
        try {
          if (endpoint.url.startsWith('/functions/v1/')) {
            // Internal Supabase function call
            const { supabase } = await import('@/integrations/supabase/client');
            const response = await Promise.race([
              supabase.functions.invoke('system-diagnostics', { body: { healthCheck: true } }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), endpoint.timeout))
            ]);
            
            const success = !!(response as any)?.data && !(response as any)?.error;
            return {
              endpoint,
              success,
              duration: Date.now() - startTime,
              error: success ? undefined : 'Response validation failed'
            };
          } else {
            // Regular HTTP request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);
            
            const response = await fetch(endpoint.url, {
              method: 'HEAD',
              cache: 'no-store',
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            return {
              endpoint,
              success: response.ok,
              duration: Date.now() - startTime,
              error: response.ok ? undefined : `HTTP ${response.status}`
            };
          }
        } catch (error: any) {
          return {
            endpoint,
            success: false,
            duration: Date.now() - startTime,
            error: error.message || 'Unknown error'
          };
        }
      })
    );

    const healthResults = results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        endpoint: { name: 'Unknown', url: '', timeout: 0, priority: 999 },
        success: false,
        duration: 0,
        error: 'Promise rejected'
      }
    );

    const successCount = healthResults.filter(r => r.success).length;
    const successfulLatencies = healthResults.filter(r => r.success).map(r => r.duration);
    const averageLatency = successfulLatencies.length > 0 
      ? successfulLatencies.reduce((a, b) => a + b, 0) / successfulLatencies.length 
      : 0;

    ProductionLogging.debug('NETWORK', 'Health check results', undefined, {
      total: healthResults.length,
      successful: successCount,
      averageLatency,
      results: healthResults.map(r => ({
        name: r.endpoint.name,
        success: r.success,
        duration: r.duration,
        error: r.error
      }))
    });

    return { results: healthResults, successCount, averageLatency };
  }

  /**
   * Calculate network quality based on health check results
   */
  private calculateNetworkQuality(results: {
    successCount: number;
    averageLatency: number;
  }): 'excellent' | 'good' | 'poor' | 'offline' {
    const { successCount, averageLatency } = results;
    const totalChecks = this.healthEndpoints.length;

    if (successCount === 0) {
      return 'offline';
    }

    const successRate = successCount / totalChecks;

    if (successRate >= 0.8 && averageLatency < 500) {
      return 'excellent';
    } else if (successRate >= 0.6 && averageLatency < 2000) {
      return 'good';
    } else {
      return 'poor';
    }
  }

  /**
   * Update network state with new quality and reset failures on success
   */
  private updateNetworkState(
    quality: 'excellent' | 'good' | 'poor' | 'offline', 
    success: boolean = false
  ): 'excellent' | 'good' | 'poor' | 'offline' {
    this.networkState = {
      quality,
      lastCheck: Date.now(),
      consecutiveFailures: success ? 0 : this.networkState.consecutiveFailures + 1,
      isChecking: false
    };

    ProductionLogging.info('NETWORK', `Network quality updated: ${quality}`, undefined, {
      consecutiveFailures: this.networkState.consecutiveFailures,
      cacheValidUntil: new Date(this.networkState.lastCheck + this.cacheTimeout).toISOString()
    });

    return quality;
  }

  /**
   * Reset network state (called when coming back online)
   */
  private resetNetworkState(): void {
    this.networkState = {
      quality: 'good',
      lastCheck: 0, // Force immediate check
      consecutiveFailures: 0,
      isChecking: false
    };
  }

  /**
   * Execute operation with intelligent retry logic
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    operationType: string = 'default',
    context?: string
  ): Promise<T> {
    const config = this.getRetryConfig(operationType);
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          ProductionLogging.debug('NETWORK', `Retry attempt ${attempt}/${config.maxRetries}`, context);
        }

        const result = await operation();
        
        if (attempt > 0) {
          ProductionLogging.info('NETWORK', `Operation succeeded after ${attempt} retries`, context);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        ProductionLogging.warn('NETWORK', `Operation failed (attempt ${attempt + 1})`, context, {
          error: error.message,
          willRetry: attempt < config.maxRetries
        });

        if (attempt < config.maxRetries) {
          const delay = this.calculateDelay(attempt, config);
          await this.delay(delay);
        }
      }
    }

    ProductionLogging.error('NETWORK', `Operation failed after ${config.maxRetries + 1} attempts`, context, lastError);
    throw lastError;
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = Math.min(config.baseDelay * Math.pow(config.backoffMultiplier, attempt), config.maxDelay);
    
    if (config.jitter) {
      // Add ±25% jitter to prevent thundering herd
      const jitterRange = delay * 0.25;
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }
    
    return Math.max(delay, 0);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current network state
   */
  getNetworkState(): NetworkState {
    return { ...this.networkState };
  }

  /**
   * Check if network operations should be attempted
   */
  shouldAttemptNetworkOperation(): boolean {
    return this.networkState.quality !== 'offline' && navigator.onLine;
  }

  /**
   * Get network statistics
   */
  getStats(): {
    currentQuality: string;
    consecutiveFailures: number;
    lastCheckAge: number;
    cacheValid: boolean;
  } {
    const now = Date.now();
    return {
      currentQuality: this.networkState.quality,
      consecutiveFailures: this.networkState.consecutiveFailures,
      lastCheckAge: now - this.networkState.lastCheck,
      cacheValid: now - this.networkState.lastCheck < this.cacheTimeout
    };
  }
}

// Export singleton and convenience functions
export const networkRetryManager = NetworkRetryManager.getInstance();

export const NetworkRetry = {
  checkQuality: () => networkRetryManager.checkNetworkQuality(),
  withRetry: <T>(operation: () => Promise<T>, type?: string, context?: string) => 
    networkRetryManager.withRetry(operation, type, context),
  shouldAttempt: () => networkRetryManager.shouldAttemptNetworkOperation(),
  getState: () => networkRetryManager.getNetworkState(),
  getStats: () => networkRetryManager.getStats(),
  setRetryConfig: (type: string, config: any) => networkRetryManager.setRetryConfig(type, config)
};