import { DebugLogger } from '@/services/DebugLogger';
import { simpleHealth } from '@/utils/robustFetch';
import { ContentGenerationDetector } from '@/services/ContentGenerationDetector';

/**
 * UPDATED FOR ERROR-001 FIX: Tri-state health classification
 * - 'healthy': Service is working properly
 * - 'network': Network connectivity issues (not service fault)
 * - 'server': Service-side failures (needs attention)
 */
export interface HealthStatus {
  orchestrator: 'healthy' | 'network' | 'server';
  runwareAPI: 'healthy' | 'network' | 'server';
  serviceDependencies: 'healthy' | 'network' | 'server';
  overallHealth: 'healthy' | 'network' | 'server';
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
  private static readonly HEALTH_CHECK_TIMEOUT = 1000; // 1 second max for health checks (optimized)
  private static readonly CACHE_DURATION_HEALTHY = 300000; // 5 minutes cache when healthy
  private static readonly CACHE_DURATION_DEGRADED = 5000; // 5 seconds cache for network/server errors
  private static cachedHealth: { result: HealthStatus; timestamp: number } | null = null;
  private static activeHealthCheck: Promise<HealthStatus> | null = null;

  /**
   * ERROR-001 FIX: Use HEAD requests to avoid CORS preflights
   * Returns tri-state classification: healthy | network | server
   */
  static async checkSystemHealth(): Promise<HealthStatus> {
    const startTime = Date.now();

    // Performance optimization: Skip health checks during content generation
    if (ContentGenerationDetector.isGenerating()) {
      DebugLogger.log('network', 'Skipping health check during content generation for performance');
      // Return cached result if available, otherwise assume healthy
      if (this.cachedHealth && (Date.now() - this.cachedHealth.timestamp) < this.CACHE_DURATION_HEALTHY * 2) {
        return this.cachedHealth.result;
      }
      // Return optimistic default when generating content
      return {
        orchestrator: 'healthy',
        runwareAPI: 'healthy', 
        serviceDependencies: 'healthy',
        overallHealth: 'healthy',
        timestamp: new Date().toISOString(),
        checkDuration: 0
      };
    }

    // ERROR-004 FIX: Request deduplication with adaptive cache duration
    if (this.cachedHealth) {
      const cacheDuration = this.cachedHealth.result.overallHealth === 'healthy' 
        ? this.CACHE_DURATION_HEALTHY 
        : this.CACHE_DURATION_DEGRADED;
      
      if ((Date.now() - this.cachedHealth.timestamp) < cacheDuration) {
        DebugLogger.log('network', `Using cached health status (${this.cachedHealth.result.overallHealth}, TTL: ${cacheDuration}ms)`);
        return this.cachedHealth.result;
      }
    }

    // If health check already in progress, return that promise
    if (this.activeHealthCheck) {
      DebugLogger.log('network', 'Joining active health check (race condition avoided)');
      return await this.activeHealthCheck;
    }

    DebugLogger.log('network', 'Starting fresh health check (preflight-free)');

    // Create shared promise for concurrent requests
    this.activeHealthCheck = this.performHealthCheck();
    
    try {
      const result = await this.activeHealthCheck;
      return result;
    } finally {
      // Clear active check when complete
      this.activeHealthCheck = null;
    }
  }

  /**
   * PERFORMANCE OPTIMIZATION: Parallel health checks for 2-5s time savings
   */
  private static async performHealthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();

    // PARALLEL health checks - all run simultaneously for maximum speed
    const [orchestrator, runwareAPI, serviceDependencies] = await Promise.all([
      this.checkOrchestrator(),
      this.checkRunwareAPI(), 
      this.checkServiceDependencies()
    ]);

    // Determine overall health with network awareness
    let overallHealth: 'healthy' | 'network' | 'server';
    if (orchestrator === 'healthy' && runwareAPI === 'healthy' && serviceDependencies === 'healthy') {
      overallHealth = 'healthy';
    } else if (orchestrator === 'network' || runwareAPI === 'network' || serviceDependencies === 'network') {
      overallHealth = 'network'; // Network issues take precedence
    } else {
      overallHealth = 'server'; // Server-side issues
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
   * ERROR-001 FIX: Use HEAD /health to avoid CORS preflights
   */
  private static async checkOrchestrator(): Promise<'healthy' | 'network' | 'server'> {
    const url = 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-generate-image/health';
    
    try {
      const isHealthy = await simpleHealth(url, this.HEALTH_CHECK_TIMEOUT);
      if (isHealthy) {
        return 'healthy';
      } else {
        DebugLogger.warn('network', 'Orchestrator health check failed - treating as server issue');
        return 'server';
      }
    } catch (error: any) {
      const isNetworkError = error?.name === 'AbortError' || error?.message?.includes('network');
      if (isNetworkError) {
        DebugLogger.warn('network', 'Orchestrator network error', error);
        return 'network';
      } else {
        DebugLogger.error('network', 'Orchestrator server error', error);
        return 'server';
      }
    }
  }

  /**
   * ERROR-001 FIX: Use HEAD /health for Runware API check
   */
  private static async checkRunwareAPI(): Promise<'healthy' | 'network' | 'server'> {
    const url = 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-generate-image/health';
    
    try {
      const isHealthy = await simpleHealth(url, this.HEALTH_CHECK_TIMEOUT);
      if (isHealthy) {
        return 'healthy';
      } else {
        DebugLogger.warn('network', 'Runware API health check failed - treating as server issue');
        return 'server';
      }
    } catch (error: any) {
      const isNetworkError = error?.name === 'AbortError' || error?.message?.includes('network');
      if (isNetworkError) {
        DebugLogger.warn('network', 'Runware API network error', error);
        return 'network';
      } else {
        DebugLogger.error('network', 'Runware API server error', error);
        return 'server';
      }
    }
  }

  /**
   * ERROR-001 FIX: Use HEAD /health for service dependencies check
   */
  private static async checkServiceDependencies(): Promise<'healthy' | 'network' | 'server'> {
    const url = 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/ai-visual-scene-creator/health';
    
    try {
      const isHealthy = await simpleHealth(url, this.HEALTH_CHECK_TIMEOUT);
      if (isHealthy) {
        return 'healthy';
      } else {
        DebugLogger.warn('network', 'Service dependencies health check failed - treating as server issue');
        return 'server';
      }
    } catch (error: any) {
      const isNetworkError = error?.name === 'AbortError' || error?.message?.includes('network');
      if (isNetworkError) {
        DebugLogger.warn('network', 'Service dependencies network error', error);
        return 'network';
      } else {
        DebugLogger.error('network', 'Service dependencies server error', error);
        return 'server';
      }
    }
  }

  /**
   * ERROR-001 FIX: Updated tier selection with network awareness
   */
  static selectOptimalTier(healthStatus: HealthStatus): TierStrategy {
    DebugLogger.log('network', 'Selecting tier based on health', healthStatus);

    // Server failures → Use appropriate fallbacks
    if (healthStatus.runwareAPI === 'server') {
      return {
        tier: 'TIER_4',
        endpoint: null,
        fallback: 'SVG',
        reason: 'Runware API server failure - using SVG fallback'
      };
    }

    // Network issues → Orchestrator-first; direct mode attempted only if orchestrator fails
    if (healthStatus.overallHealth === 'network') {
      return {
        tier: 'TIER_1',
        endpoint: 'runware-generate-image',
        fallback: 'orchestrator',
        reason: 'Network connectivity issues - orchestrator-first; direct mode will be attempted only if orchestrator fails'
      };
    }

    // Service dependencies or orchestrator server issues → Still orchestrator-first
    if (healthStatus.serviceDependencies === 'server' || healthStatus.orchestrator === 'server') {
      return {
        tier: 'TIER_1',
        endpoint: 'runware-generate-image',
        fallback: 'orchestrator',
        reason: 'Orchestrator server failure detected - orchestrator-first; direct mode will be attempted only if orchestrator fails'
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
   * ERROR-001 FIX: Quick health check using HEAD method
   */
  static async quickHealthCheck(): Promise<'healthy' | 'network' | 'server'> {
    if (this.cachedHealth) {
      const cacheDuration = this.cachedHealth.result.overallHealth === 'healthy' 
        ? this.CACHE_DURATION_HEALTHY 
        : this.CACHE_DURATION_DEGRADED;
      
      if ((Date.now() - this.cachedHealth.timestamp) < cacheDuration) {
        return this.cachedHealth.result.overallHealth;
      }
    }

    // Use HEAD /health for quick check (no preflight)
    const url = 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-generate-image/health';
    
    try {
      const isHealthy = await simpleHealth(url, 1000);
      return isHealthy ? 'healthy' : 'server';
    } catch (error: any) {
      const isNetworkError = error?.name === 'AbortError' || error?.message?.includes('network');
      return isNetworkError ? 'network' : 'server';
    }
  }

  /**
   * Clear health cache (useful for testing or forced refresh)
   */
  static clearCache(): void {
    this.cachedHealth = null;
    this.activeHealthCheck = null; // ERROR-004 FIX: Clear active check too
    DebugLogger.log('network', 'Health check cache cleared');
  }
}