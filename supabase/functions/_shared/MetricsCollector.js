/**
 * Metrics Collector - Phase 3 Implementation
 * Tracks success rates, performance metrics, and system health
 */

// In-memory storage for metrics (in production, use database/Redis)
const metricsStore = new Map();
const performanceStore = new Map();

export class MetricsCollector {
  
  /**
   * Track image generation attempt
   */
  static trackImageGeneration(sessionId, attempt) {
    const timestamp = Date.now();
    const key = `generation_${sessionId}_${timestamp}`;
    
    const metrics = {
      sessionId,
      timestamp,
      tier: attempt.tier || 'unknown',
      status: 'started',
      promptLength: attempt.promptLength || 0,
      userType: attempt.userType || 'unknown',
      pageNumber: attempt.pageNumber || 1,
      ...attempt
    };
    
    metricsStore.set(key, metrics);
    console.log(`📊 Tracking image generation: ${key} - Tier ${metrics.tier}`);
    
    return key;
  }
  
  /**
   * Track image generation result
   */
  static trackImageResult(trackingKey, result) {
    const metrics = metricsStore.get(trackingKey);
    if (!metrics) {
      console.warn(`⚠️ No metrics found for tracking key: ${trackingKey}`);
      return;
    }
    
    const now = Date.now();
    metrics.endTimestamp = now;
    metrics.duration = now - metrics.timestamp;
    metrics.status = result.success ? 'success' : 'failed';
    metrics.finalTier = result.tier;
    metrics.errorMessage = result.errorMessage;
    metrics.fallbackCount = result.fallbackCount || 0;
    metrics.imageUrl = result.imageUrl;
    
    metricsStore.set(trackingKey, metrics);
    
    console.log(`📈 Image result tracked: ${trackingKey} - ${metrics.status} in ${metrics.duration}ms`);
    
    // Update aggregated metrics
    this.updateAggregatedMetrics(metrics);
  }
  
  /**
   * Track tier fallback
   */
  static trackTierFallback(sessionId, fromTier, toTier, reason) {
    const timestamp = Date.now();
    const fallbackKey = `fallback_${sessionId}_${timestamp}`;
    
    const fallbackMetrics = {
      sessionId,
      timestamp,
      fromTier,
      toTier,
      reason,
      type: 'tier_fallback'
    };
    
    metricsStore.set(fallbackKey, fallbackMetrics);
    console.log(`📉 Tier fallback tracked: ${fromTier} → ${toTier} (${reason})`);
  }
  
  /**
   * Track performance metrics
   */
  static trackPerformance(operation, duration, success = true, metadata = {}) {
    const timestamp = Date.now();
    const perfKey = `perf_${operation}_${timestamp}`;
    
    const perfMetrics = {
      operation,
      timestamp,
      duration,
      success,
      metadata
    };
    
    performanceStore.set(perfKey, perfMetrics);
    
    // Keep only recent performance data (last hour)
    const cutoff = timestamp - 3600000; // 1 hour
    for (const [key, data] of performanceStore.entries()) {
      if (data.timestamp < cutoff) {
        performanceStore.delete(key);
      }
    }
    
    console.log(`⚡ Performance tracked: ${operation} - ${duration}ms - ${success ? 'success' : 'failed'}`);
  }
  
  /**
   * Get success rate metrics
   */
  static getSuccessRates(timeRange = 3600000) { // Default: last hour
    const now = Date.now();
    const cutoff = now - timeRange;
    
    const generations = Array.from(metricsStore.values())
      .filter(metric => 
        metric.type !== 'tier_fallback' && 
        metric.timestamp > cutoff && 
        metric.status !== 'started'
      );
    
    if (generations.length === 0) {
      return { total: 0, success: 0, failed: 0, rate: 0 };
    }
    
    const successful = generations.filter(g => g.status === 'success').length;
    const failed = generations.length - successful;
    const rate = (successful / generations.length) * 100;
    
    return {
      total: generations.length,
      success: successful,
      failed: failed,
      rate: Math.round(rate * 100) / 100
    };
  }
  
  /**
   * Get tier performance breakdown
   */
  static getTierPerformance(timeRange = 3600000) {
    const now = Date.now();
    const cutoff = now - timeRange;
    
    const generations = Array.from(metricsStore.values())
      .filter(metric => 
        metric.type !== 'tier_fallback' && 
        metric.timestamp > cutoff && 
        metric.status !== 'started'
      );
    
    const tierStats = {};
    
    generations.forEach(gen => {
      const tier = gen.finalTier || gen.tier;
      if (!tierStats[tier]) {
        tierStats[tier] = { total: 0, success: 0, avgDuration: 0, durations: [] };
      }
      
      tierStats[tier].total++;
      if (gen.status === 'success') {
        tierStats[tier].success++;
      }
      
      if (gen.duration) {
        tierStats[tier].durations.push(gen.duration);
      }
    });
    
    // Calculate averages
    Object.keys(tierStats).forEach(tier => {
      const stats = tierStats[tier];
      stats.successRate = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;
      stats.avgDuration = stats.durations.length > 0 ? 
        stats.durations.reduce((sum, d) => sum + d, 0) / stats.durations.length : 0;
      delete stats.durations; // Clean up
    });
    
    return tierStats;
  }
  
  /**
   * Get fallback patterns
   */
  static getFallbackPatterns(timeRange = 3600000) {
    const now = Date.now();
    const cutoff = now - timeRange;
    
    const fallbacks = Array.from(metricsStore.values())
      .filter(metric => 
        metric.type === 'tier_fallback' && 
        metric.timestamp > cutoff
      );
    
    const patterns = {};
    
    fallbacks.forEach(fallback => {
      const pattern = `${fallback.fromTier}->${fallback.toTier}`;
      if (!patterns[pattern]) {
        patterns[pattern] = { count: 0, reasons: {} };
      }
      
      patterns[pattern].count++;
      
      const reason = fallback.reason || 'unknown';
      patterns[pattern].reasons[reason] = (patterns[pattern].reasons[reason] || 0) + 1;
    });
    
    return patterns;
  }
  
  /**
   * Get performance summary
   */
  static getPerformanceSummary(timeRange = 3600000) {
    const now = Date.now();
    const cutoff = now - timeRange;
    
    const operations = Array.from(performanceStore.values())
      .filter(perf => perf.timestamp > cutoff);
    
    const summary = {};
    
    operations.forEach(op => {
      if (!summary[op.operation]) {
        summary[op.operation] = {
          count: 0,
          successCount: 0,
          avgDuration: 0,
          maxDuration: 0,
          minDuration: Infinity,
          durations: []
        };
      }
      
      const stats = summary[op.operation];
      stats.count++;
      if (op.success) stats.successCount++;
      
      stats.durations.push(op.duration);
      stats.maxDuration = Math.max(stats.maxDuration, op.duration);
      stats.minDuration = Math.min(stats.minDuration, op.duration);
    });
    
    // Calculate averages and success rates
    Object.keys(summary).forEach(operation => {
      const stats = summary[operation];
      stats.avgDuration = stats.durations.reduce((sum, d) => sum + d, 0) / stats.durations.length;
      stats.successRate = (stats.successCount / stats.count) * 100;
      stats.minDuration = stats.minDuration === Infinity ? 0 : stats.minDuration;
      delete stats.durations; // Clean up
    });
    
    return summary;
  }
  
  /**
   * Update aggregated metrics for dashboards
   */
  static updateAggregatedMetrics(metrics) {
    const dateKey = new Date(metrics.timestamp).toISOString().split('T')[0];
    const hourKey = `${dateKey}_${new Date(metrics.timestamp).getHours()}`;
    
    // Daily aggregation
    const dailyKey = `daily_${dateKey}`;
    let dailyStats = metricsStore.get(dailyKey) || {
      date: dateKey,
      total: 0,
      success: 0,
      tiers: {},
      avgDuration: 0,
      durations: []
    };
    
    dailyStats.total++;
    if (metrics.status === 'success') dailyStats.success++;
    
    const tier = metrics.finalTier || metrics.tier;
    dailyStats.tiers[tier] = (dailyStats.tiers[tier] || 0) + 1;
    
    if (metrics.duration) {
      dailyStats.durations.push(metrics.duration);
      dailyStats.avgDuration = dailyStats.durations.reduce((sum, d) => sum + d, 0) / dailyStats.durations.length;
    }
    
    metricsStore.set(dailyKey, dailyStats);
  }
  
  /**
   * Generate health report
   */
  static generateHealthReport() {
    const now = Date.now();
    const oneHour = 3600000;
    const oneDay = 86400000;
    
    return {
      timestamp: new Date().toISOString(),
      lastHour: {
        successRates: this.getSuccessRates(oneHour),
        tierPerformance: this.getTierPerformance(oneHour),
        fallbackPatterns: this.getFallbackPatterns(oneHour)
      },
      last24Hours: {
        successRates: this.getSuccessRates(oneDay),
        tierPerformance: this.getTierPerformance(oneDay),
        performanceSummary: this.getPerformanceSummary(oneDay)
      },
      system: {
        totalMetricsStored: metricsStore.size,
        totalPerfMetricsStored: performanceStore.size,
        memoryUsage: this.getMemoryUsage()
      }
    };
  }
  
  /**
   * Get memory usage estimate
   */
  static getMemoryUsage() {
    const metricsSize = Array.from(metricsStore.values())
      .reduce((sum, metric) => sum + JSON.stringify(metric).length, 0);
    
    const perfSize = Array.from(performanceStore.values())
      .reduce((sum, perf) => sum + JSON.stringify(perf).length, 0);
    
    return {
      metricsKB: Math.round(metricsSize / 1024),
      performanceKB: Math.round(perfSize / 1024),
      totalKB: Math.round((metricsSize + perfSize) / 1024)
    };
  }
  
  /**
   * Clean up old metrics
   */
  static cleanupOldMetrics(maxAge = 86400000) { // Default: 24 hours
    const cutoff = Date.now() - maxAge;
    let cleaned = 0;
    
    for (const [key, metric] of metricsStore.entries()) {
      if (metric.timestamp < cutoff && !key.startsWith('daily_')) {
        metricsStore.delete(key);
        cleaned++;
      }
    }
    
    console.log(`🧹 Cleaned up ${cleaned} old metrics entries`);
  }
}

// Cleanup old metrics every hour
setInterval(() => {
  MetricsCollector.cleanupOldMetrics();
}, 3600000);
