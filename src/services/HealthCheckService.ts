import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';

export interface HealthStatus {
  orchestrator: 'healthy' | 'degraded' | 'failed';
  runwareAPI: 'healthy' | 'failed';
  serviceDependencies: 'healthy' | 'failed';
  overallHealth: 'healthy' | 'degraded' | 'failed';
  timestamp: string;
  checkDuration: number;
}

export interface TierStrategy {
  tier: 'TIER_1' | 'TIER_2_5C' | 'TIER_4';
  endpoint: string | null;
  fallback: 'orchestrator' | 'template' | 'SVG' | 'ai_visual_scene_direct';
  reason: string;
}

export class HealthCheckService {
  private static readonly HEALTH_CHECK_TIMEOUT = 2000; // 2 second max for health checks
  private static readonly CACHE_DURATION = 30000; // 30 seconds cache
  private static cachedHealth: { result: HealthStatus; timestamp: number } | null = null;

  /**
   * Performs comprehensive health checks and returns system status
   */
  static async checkSystemHealth(): Promise<HealthStatus> {
    const startTime = Date.now();

    // Check cache first
    if (this.cachedHealth && (Date.now() - this.cachedHealth.timestamp) < this.CACHE_DURATION) {
    DebugLogger.log('network', 'Using cached health status');
    return this.cachedHealth.result;
  }

  DebugLogger.log('network', 'Starting fresh health check');

    const healthChecks = await Promise.allSettled([
      this.checkOrchestrator(),
      this.checkRunwareAPI(),
      this.checkServiceDependencies()
    ]);

    const orchestrator = healthChecks[0].status === 'fulfilled' ? healthChecks[0].value : 'failed';
    const runwareAPI = healthChecks[1].status === 'fulfilled' ? healthChecks[1].value : 'failed';
    const serviceDependencies = healthChecks[2].status === 'fulfilled' ? healthChecks[2].value : 'failed';

    // Determine overall health
    let overallHealth: 'healthy' | 'degraded' | 'failed';
    if (orchestrator === 'healthy' && runwareAPI === 'healthy' && serviceDependencies === 'healthy') {
      overallHealth = 'healthy';
    } else if (runwareAPI === 'failed') {
      overallHealth = 'failed'; // Runware API failure is critical
    } else {
      overallHealth = 'degraded';
    }

    const healthStatus: HealthStatus = {
      orchestrator,
      runwareAPI,
      serviceDependencies,
      overallHealth,
      timestamp: new Date().toISOString(),
      checkDuration: Date.now() - startTime
    };

    // Cache the result
    this.cachedHealth = {
      result: healthStatus,
      timestamp: Date.now()
    };

    DebugLogger.log('network', 'Health check completed', healthStatus);
    return healthStatus;
  }

  /**
   * Checks orchestrator health via GET endpoint
   */
  private static async checkOrchestrator(): Promise<'healthy' | 'degraded' | 'failed'> {
    try {
      const response = await Promise.race([
        supabase.functions.invoke('runware-generate-image', {
          method: 'GET'
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Orchestrator timeout')), this.HEALTH_CHECK_TIMEOUT)
        )
      ]);

      if (response.error) {
        DebugLogger.warn('network', 'Orchestrator degraded', response.error);
        return 'degraded';
      }

      const healthData = response.data;
      if (healthData?.status === 'healthy' && healthData?.handler_loaded) {
        return 'healthy';
      }

      return 'degraded';
    } catch (error) {
      DebugLogger.error('network', 'Orchestrator health check failed', error);
      return 'failed';
    }
  }

  /**
   * Checks Runware API availability through a test connection
   */
  private static async checkRunwareAPI(): Promise<'healthy' | 'failed'> {
    try {
      // Test WebSocket connection with dummy auth
      const testResponse = await Promise.race([
        supabase.functions.invoke('runware-generate-image', {
          body: { test: true }
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Runware API timeout')), this.HEALTH_CHECK_TIMEOUT)
        )
      ]);

      // If we get any response without a Runware-specific error, API is likely healthy
      if (!testResponse.error || !testResponse.error.message?.includes('Runware')) {
        return 'healthy';
      }

      return 'failed';
    } catch (error) {
      DebugLogger.error('network', 'Runware API health check failed', error);
      return 'failed';
    }
  }

  /**
   * Checks service dependencies (PhaseIntegrationOrchestrator, CharacterConsistencyService)
   */
  private static async checkServiceDependencies(): Promise<'healthy' | 'failed'> {
    try {
      // Test service dependencies through orchestrator ready check
      const response = await Promise.race([
        supabase.functions.invoke('runware-generate-image', {
          method: 'GET',
          body: { ready: true }
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Service dependencies timeout')), this.HEALTH_CHECK_TIMEOUT)
        )
      ]);

      if (response.error) {
        return 'failed';
      }

      const healthData = response.data;
      if (healthData?.handler_loaded && healthData?.environment?.hasSupabaseUrl) {
        return 'healthy';
      }

      return 'failed';
    } catch (error) {
      DebugLogger.error('network', 'Service dependencies health check failed', error);
      return 'failed';
    }
  }

  /**
   * Selects optimal tier based on health status
   */
  static selectOptimalTier(healthStatus: HealthStatus): TierStrategy {
    DebugLogger.log('network', 'Selecting tier based on health', healthStatus);

    // Runware API failed → Direct to Tier 4 (SVG fallback)
    if (healthStatus.runwareAPI === 'failed') {
      return {
        tier: 'TIER_4',
        endpoint: null,
        fallback: 'SVG',
        reason: 'Runware API unavailable - using SVG fallback'
      };
    }

    // Service dependencies or orchestrator failed → Direct to ai-visual-scene-creator
    if (healthStatus.serviceDependencies === 'failed' || healthStatus.orchestrator === 'failed') {
      return {
        tier: 'TIER_1',
        endpoint: 'ai-visual-scene-creator',
        fallback: 'ai_visual_scene_direct',
        reason: 'Orchestrator failed - using direct ai-visual-scene-creator mode'
      };
    }

    // All healthy → Standard Tier 1 with orchestrator
    return {
      tier: 'TIER_1',
      endpoint: 'runware-generate-image',
      fallback: 'orchestrator',
      reason: 'All systems healthy - using full orchestrator'
    };
  }

  /**
   * Quick health check with minimal overhead
   */
  static async quickHealthCheck(): Promise<'healthy' | 'degraded' | 'failed'> {
    if (this.cachedHealth && (Date.now() - this.cachedHealth.timestamp) < this.CACHE_DURATION) {
      return this.cachedHealth.result.overallHealth;
    }

    // Just ping the orchestrator for quick check
    try {
      const response = await Promise.race([
        supabase.functions.invoke('runware-generate-image', { method: 'GET' }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Quick health timeout')), 1000)
        )
      ]);

      return response.error ? 'degraded' : 'healthy';
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Clear health cache (useful for testing or forced refresh)
   */
  static clearCache(): void {
    this.cachedHealth = null;
    DebugLogger.log('network', 'Health check cache cleared');
  }
}