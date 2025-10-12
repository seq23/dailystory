/**
 * RELIABILITY MANAGER - Unified Orchestration Layer
 * Consolidates: Circuit Breaker → Deduplication → LKG Cache
 * Created: 2025-10-12
 */

import { UniversalLKGCache } from './UniversalLKGCache.ts';
import { RequestDeduplicator } from './RequestDeduplicator.ts';
import { EnhancedCircuitBreaker } from './EnhancedCircuitBreaker.ts';
import { monitoringService } from './MonitoringService.ts';

export class ReliabilityManager {
  private static instance: ReliabilityManager | null = null;

  static getInstance(): ReliabilityManager {
    if (!this.instance) {
      this.instance = new ReliabilityManager();
    }
    return this.instance;
  }

  /**
   * Execute operation with full reliability stack
   * Combines: Circuit Breaker → Deduplication → LKG Cache
   * 
   * @example
   * const result = await reliabilityManager.executeResilient(
   *   'story-text-key',
   *   () => callRunwareAPI(...),
   *   {
   *     functionName: 'runware-template-cd',
   *     sessionId: 'sess_123',
   *     tier: 'NUCLEAR_2.5C',
   *     quality: 'high'
   *   }
   * );
   */
  async executeResilient<T>(
    operationKey: string,
    operation: () => Promise<T>,
    options: {
      functionName: string;
      sessionId?: string;
      tier?: string;
      quality?: 'high' | 'medium' | 'low';
      timeout?: number;
    }
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Step 1: Circuit breaker check
      const circuitKey = `${options.functionName}:${options.tier || 'default'}`;
      
      // Step 2: Deduplication wrapper
      const dedupKey = RequestDeduplicator.createKey({
        functionName: options.functionName,
        sessionId: options.sessionId,
        content: operationKey
      });

      // Step 3: Check LKG cache first
      const requestHash = UniversalLKGCache.createRequestHash({ operationKey });
      const cachedResult = UniversalLKGCache.getLKG(requestHash, options.functionName);
      
      if (cachedResult) {
        console.log(`♻️ [RELIABILITY] LKG cache hit for ${options.functionName}`);
        monitoringService.recordSuccess(Date.now() - startTime);
        return cachedResult;
      }

      // Step 4: Execute with circuit breaker
      const result = await EnhancedCircuitBreaker.execute<T>(
        circuitKey,
        async () => {
          return await RequestDeduplicator.deduplicate(
            dedupKey,
            operation,
            options.timeout
          );
        },
        {
          onCircuitOpen: async () => {
            // Return LKG on circuit open
            const lkg = UniversalLKGCache.getLKG(requestHash, options.functionName);
            if (lkg) {
              console.log(`🔄 [RELIABILITY] Circuit open, using LKG for ${options.functionName}`);
              return lkg;
            }
            throw new Error('Circuit open and no LKG available');
          }
        }
      );

      // Step 5: Warm LKG cache on success
      UniversalLKGCache.warmFromSuccess(
        requestHash,
        result,
        options.tier || 'unknown',
        options.functionName
      );

      monitoringService.recordSuccess(Date.now() - startTime);
      return result;

    } catch (error) {
      monitoringService.recordError(Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Health dashboard aggregating all reliability systems
   */
  getHealthDashboard() {
    return {
      timestamp: new Date().toISOString(),
      lkgCache: UniversalLKGCache.getStats(),
      deduplication: RequestDeduplicator.getStats(),
      circuitBreakers: EnhancedCircuitBreaker.getAllStats(),
      monitoring: monitoringService.getMetrics()
    };
  }

  /**
   * Emergency reset all reliability systems
   */
  emergencyReset(reason: string) {
    console.log(`🚨 [RELIABILITY] Emergency reset triggered: ${reason}`);
    UniversalLKGCache.clear();
    RequestDeduplicator.cancelAll();
    RequestDeduplicator.resetStats();
    monitoringService.reset();
  }
}

export const reliabilityManager = ReliabilityManager.getInstance();
