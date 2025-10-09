/**
 * CACHE COORDINATION SYSTEM
 * Manages cross-service cache invalidation and health monitoring
 */

import { clearImportCache, getCacheStatus, getLoaderHealth } from './resilientLoader.js';

interface CacheHealth {
  timestamp: string;
  loaderHealth: ReturnType<typeof getLoaderHealth>;
  recommendation: string;
}

class CacheCoordinator {
  private static instance: CacheCoordinator;
  private lastHealthCheck: CacheHealth | null = null;
  private healthCheckInterval: number | null = null;

  private constructor() {
    // Start automatic health monitoring
    this.startHealthMonitoring();
  }

  static getInstance(): CacheCoordinator {
    if (!CacheCoordinator.instance) {
      CacheCoordinator.instance = new CacheCoordinator();
    }
    return CacheCoordinator.instance;
  }

  /**
   * Start automatic health monitoring (every 60 seconds)
   */
  private startHealthMonitoring(): void {
    // Check health every minute
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60 * 1000) as unknown as number;
  }

  /**
   * Perform comprehensive health check
   */
  performHealthCheck(): CacheHealth {
    const loaderHealth = getLoaderHealth();
    
    let recommendation = '';
    if (loaderHealth.status === 'critical') {
      recommendation = 'Immediate cache reset recommended for critical services';
    } else if (loaderHealth.status === 'degraded') {
      recommendation = 'Monitor situation, consider cache reset if issues persist';
    } else {
      recommendation = 'System operating normally';
    }

    this.lastHealthCheck = {
      timestamp: new Date().toISOString(),
      loaderHealth,
      recommendation
    };

    // Auto-reset on critical status
    if (loaderHealth.status === 'critical') {
      console.warn('🚨 Critical cache status detected - auto-resetting affected services');
      loaderHealth.details.criticalServicesDown.forEach(service => {
        clearImportCache(service);
      });
    }

    return this.lastHealthCheck;
  }

  /**
   * Get current cache health status
   */
  getHealthStatus(): CacheHealth {
    if (!this.lastHealthCheck || 
        (Date.now() - new Date(this.lastHealthCheck.timestamp).getTime()) > 60000) {
      // Refresh if older than 1 minute
      return this.performHealthCheck();
    }
    return this.lastHealthCheck;
  }

  /**
   * Emergency cache reset cascade
   */
  async emergencyReset(reason: string): Promise<void> {
    console.error(`🚨 EMERGENCY CACHE RESET: ${reason}`);
    
    // Clear all import caches
    clearImportCache();
    
    // Clear static data cache
    try {
      const { EdgeStaticCache } = await import('./StaticDataCache.ts');
      if (EdgeStaticCache?.getInstance()?.clear) {
        EdgeStaticCache.getInstance().clear();
      }
    } catch (error) {
      console.warn('Could not clear StaticDataCache:', error);
    }
    
    // Log the reset
    console.log('✅ Emergency cache reset completed');
    
    // Force new health check
    this.performHealthCheck();
  }

  /**
   * Coordinated cache warming after reset
   */
  async warmCriticalCaches(): Promise<void> {
    console.log('🔥 Warming critical caches...');
    
    // Try to pre-load critical services
    const criticalServices = [
      '@supabase/supabase-js',
      'stripe',
      'openai'
    ];

    for (const service of criticalServices) {
      try {
        // This will populate the import cache
        const { memoizedImport } = await import('./resilientLoader.js');
        await memoizedImport(service);
        console.log(`✅ Warmed cache for ${service}`);
      } catch (error) {
        console.warn(`⚠️ Could not warm cache for ${service}:`, error);
      }
    }
  }

  /**
   * Stop health monitoring (cleanup)
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Export singleton
export const cacheCoordinator = CacheCoordinator.getInstance();

// Export health check function for API endpoint
export function getCacheHealth(): CacheHealth {
  return cacheCoordinator.getHealthStatus();
}

// Export emergency reset function
export function performEmergencyReset(reason: string): Promise<void> {
  return cacheCoordinator.emergencyReset(reason);
}
