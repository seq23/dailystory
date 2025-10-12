// Phase 5: Monitoring & Alerts (Observability)
// Real-time error rate tracking, cost anomaly detection, performance alerts

export interface MonitoringMetrics {
  errorRate: number;
  apiCallCount: number;
  avgResponseTime: number;
  costEstimate: number;
  alerts: Alert[];
}

export interface Alert {
  level: 'info' | 'warning' | 'critical';
  type: 'error_rate' | 'cost_spike' | 'performance_degradation' | 'circuit_breaker';
  message: string;
  timestamp: number;
  details?: any;
}

interface TimeWindowMetric {
  timestamp: number;
  value: number;
}

interface CostEstimate {
  runwareCalls: number;
  openaiCalls: number;
  totalEstimatedCost: number;
}

export class MonitoringService {
  private static instance: MonitoringService;
  
  // Rolling window tracking (last 5 minutes)
  private static readonly WINDOW_SIZE = 5 * 60 * 1000; // 5 minutes
  private static readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute
  
  // Metrics storage
  private errorMetrics: TimeWindowMetric[] = [];
  private successMetrics: TimeWindowMetric[] = [];
  private apiCallMetrics: TimeWindowMetric[] = [];
  private responseTimeMetrics: TimeWindowMetric[] = [];
  private costMetrics: CostEstimate = { runwareCalls: 0, openaiCalls: 0, totalEstimatedCost: 0 };
  
  // Alert thresholds
  private static readonly ERROR_RATE_WARNING = 0.15; // 15%
  private static readonly ERROR_RATE_CRITICAL = 0.30; // 30%
  private static readonly COST_SPIKE_THRESHOLD = 2.0; // 2x baseline
  private static readonly PERF_DEGRADATION_MS = 8000; // 8s avg response
  private static readonly API_CALL_SPIKE_THRESHOLD = 50; // calls per minute
  
  // Baseline tracking
  private baselineApiCallsPerMinute = 10;
  private lastCleanup = Date.now();
  
  private constructor() {
    // Private constructor for singleton
  }
  
  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }
  
  /**
   * Record a successful operation
   */
  recordSuccess(responseTimeMs: number): void {
    const now = Date.now();
    this.successMetrics.push({ timestamp: now, value: 1 });
    this.responseTimeMetrics.push({ timestamp: now, value: responseTimeMs });
    this.apiCallMetrics.push({ timestamp: now, value: 1 });
    this.cleanupOldMetrics();
  }
  
  /**
   * Record a failed operation
   */
  recordError(responseTimeMs?: number): void {
    const now = Date.now();
    this.errorMetrics.push({ timestamp: now, value: 1 });
    this.apiCallMetrics.push({ timestamp: now, value: 1 });
    if (responseTimeMs) {
      this.responseTimeMetrics.push({ timestamp: now, value: responseTimeMs });
    }
    this.cleanupOldMetrics();
  }
  
  /**
   * Record API call cost
   */
  recordApiCost(provider: 'runware' | 'openai', estimatedCost: number): void {
    if (provider === 'runware') {
      this.costMetrics.runwareCalls++;
      this.costMetrics.totalEstimatedCost += estimatedCost;
    } else {
      this.costMetrics.openaiCalls++;
      this.costMetrics.totalEstimatedCost += estimatedCost;
    }
  }
  
  /**
   * Get current monitoring metrics and alerts
   */
  getMetrics(): MonitoringMetrics {
    this.cleanupOldMetrics();
    
    const errorRate = this.calculateErrorRate();
    const apiCallCount = this.apiCallMetrics.length;
    const avgResponseTime = this.calculateAvgResponseTime();
    const alerts = this.generateAlerts(errorRate, apiCallCount, avgResponseTime);
    
    return {
      errorRate,
      apiCallCount,
      avgResponseTime,
      costEstimate: this.costMetrics.totalEstimatedCost,
      alerts
    };
  }
  
  /**
   * Get detailed statistics for health check
   */
  getDetailedStats(): any {
    this.cleanupOldMetrics();
    
    const errorRate = this.calculateErrorRate();
    const apiCallCount = this.apiCallMetrics.length;
    const avgResponseTime = this.calculateAvgResponseTime();
    
    return {
      windowSize: '5 minutes',
      errorRate: `${(errorRate * 100).toFixed(2)}%`,
      successCount: this.successMetrics.length,
      errorCount: this.errorMetrics.length,
      totalApiCalls: apiCallCount,
      apiCallsPerMinute: (apiCallCount / 5).toFixed(1),
      avgResponseTimeMs: Math.round(avgResponseTime),
      costTracking: {
        runwareCallCount: this.costMetrics.runwareCalls,
        openaiCallCount: this.costMetrics.openaiCalls,
        estimatedTotalCost: `$${this.costMetrics.totalEstimatedCost.toFixed(4)}`
      },
      thresholds: {
        errorRateWarning: `${MonitoringService.ERROR_RATE_WARNING * 100}%`,
        errorRateCritical: `${MonitoringService.ERROR_RATE_CRITICAL * 100}%`,
        perfDegradationMs: MonitoringService.PERF_DEGRADATION_MS,
        apiCallSpikeThreshold: MonitoringService.API_CALL_SPIKE_THRESHOLD
      }
    };
  }
  
  /**
   * Reset all metrics (for testing or daily reset)
   */
  reset(): void {
    this.errorMetrics = [];
    this.successMetrics = [];
    this.apiCallMetrics = [];
    this.responseTimeMetrics = [];
    this.costMetrics = { runwareCalls: 0, openaiCalls: 0, totalEstimatedCost: 0 };
  }
  
  // Private helper methods
  
  private cleanupOldMetrics(): void {
    const now = Date.now();
    
    // Only cleanup once per minute
    if (now - this.lastCleanup < MonitoringService.CLEANUP_INTERVAL) {
      return;
    }
    
    const cutoff = now - MonitoringService.WINDOW_SIZE;
    
    this.errorMetrics = this.errorMetrics.filter(m => m.timestamp > cutoff);
    this.successMetrics = this.successMetrics.filter(m => m.timestamp > cutoff);
    this.apiCallMetrics = this.apiCallMetrics.filter(m => m.timestamp > cutoff);
    this.responseTimeMetrics = this.responseTimeMetrics.filter(m => m.timestamp > cutoff);
    
    this.lastCleanup = now;
  }
  
  private calculateErrorRate(): number {
    const totalCalls = this.errorMetrics.length + this.successMetrics.length;
    if (totalCalls === 0) return 0;
    return this.errorMetrics.length / totalCalls;
  }
  
  private calculateAvgResponseTime(): number {
    if (this.responseTimeMetrics.length === 0) return 0;
    const sum = this.responseTimeMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / this.responseTimeMetrics.length;
  }
  
  private generateAlerts(errorRate: number, apiCallCount: number, avgResponseTime: number): Alert[] {
    const alerts: Alert[] = [];
    const now = Date.now();
    
    // Error rate alerts
    if (errorRate >= MonitoringService.ERROR_RATE_CRITICAL) {
      alerts.push({
        level: 'critical',
        type: 'error_rate',
        message: `Critical error rate: ${(errorRate * 100).toFixed(1)}% (threshold: ${MonitoringService.ERROR_RATE_CRITICAL * 100}%)`,
        timestamp: now,
        details: { errorRate, threshold: MonitoringService.ERROR_RATE_CRITICAL }
      });
    } else if (errorRate >= MonitoringService.ERROR_RATE_WARNING) {
      alerts.push({
        level: 'warning',
        type: 'error_rate',
        message: `Elevated error rate: ${(errorRate * 100).toFixed(1)}% (threshold: ${MonitoringService.ERROR_RATE_WARNING * 100}%)`,
        timestamp: now,
        details: { errorRate, threshold: MonitoringService.ERROR_RATE_WARNING }
      });
    }
    
    // API call spike detection
    const callsPerMinute = apiCallCount / 5;
    if (callsPerMinute > MonitoringService.API_CALL_SPIKE_THRESHOLD) {
      alerts.push({
        level: 'warning',
        type: 'cost_spike',
        message: `High API usage: ${callsPerMinute.toFixed(1)} calls/min (threshold: ${MonitoringService.API_CALL_SPIKE_THRESHOLD})`,
        timestamp: now,
        details: { callsPerMinute, threshold: MonitoringService.API_CALL_SPIKE_THRESHOLD }
      });
    }
    
    // Performance degradation
    if (avgResponseTime > MonitoringService.PERF_DEGRADATION_MS) {
      alerts.push({
        level: 'warning',
        type: 'performance_degradation',
        message: `Slow response times: ${Math.round(avgResponseTime)}ms avg (threshold: ${MonitoringService.PERF_DEGRADATION_MS}ms)`,
        timestamp: now,
        details: { avgResponseTime, threshold: MonitoringService.PERF_DEGRADATION_MS }
      });
    }
    
    // Cost anomaly detection
    const costPerCall = this.costMetrics.totalEstimatedCost / (this.costMetrics.runwareCalls + this.costMetrics.openaiCalls || 1);
    if (costPerCall > 0.05) { // $0.05 per call is high
      alerts.push({
        level: 'warning',
        type: 'cost_spike',
        message: `High cost per API call: $${costPerCall.toFixed(4)} (expected < $0.05)`,
        timestamp: now,
        details: { costPerCall, totalCost: this.costMetrics.totalEstimatedCost }
      });
    }
    
    return alerts;
  }
}

// Export singleton instance
export const monitoringService = MonitoringService.getInstance();
