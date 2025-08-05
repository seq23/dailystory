/**
 * Performance Monitor for Template System
 * Tracks template selection, validation, and processing performance
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalOperations: number;
  recentOperations: PerformanceMetric[];
  slowOperations: PerformanceMetric[];
}

export class TemplatePerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static readonly MAX_METRICS = 1000;
  private static readonly SLOW_OPERATION_THRESHOLD = 100; // ms
  
  /**
   * Start performance tracking for an operation
   */
  static startOperation(operation: string, metadata?: Record<string, any>): number {
    const startTime = performance.now();
    console.log(`⏱️ Starting operation: ${operation}`);
    return startTime;
  }

  /**
   * End performance tracking and record metric
   */
  static endOperation(
    operation: string, 
    startTime: number, 
    metadata?: Record<string, any>
  ): number {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: Date.now(),
      metadata
    };

    this.addMetric(metric);
    
    // Log performance warnings
    if (duration > this.SLOW_OPERATION_THRESHOLD) {
      console.warn(`🐌 Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`✅ Operation completed: ${operation} (${duration.toFixed(2)}ms)`);
    }
    
    return duration;
  }

  /**
   * Add metric to tracking
   */
  private static addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Maintain max metrics limit
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Get performance statistics for an operation
   */
  static getStats(operation?: string): PerformanceStats {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (relevantMetrics.length === 0) {
      return {
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalOperations: 0,
        recentOperations: [],
        slowOperations: []
      };
    }

    const durations = relevantMetrics.map(m => m.duration);
    const recent = relevantMetrics.slice(-10);
    const slow = relevantMetrics.filter(m => m.duration > this.SLOW_OPERATION_THRESHOLD);

    return {
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalOperations: relevantMetrics.length,
      recentOperations: recent,
      slowOperations: slow
    };
  }

  /**
   * Get performance summary for all operations
   */
  static getFullReport(): Record<string, PerformanceStats> {
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    const report: Record<string, PerformanceStats> = {};

    for (const operation of operations) {
      report[operation] = this.getStats(operation);
    }

    return report;
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    const count = this.metrics.length;
    this.metrics = [];
    console.log(`🧹 Cleared ${count} performance metrics`);
  }

  /**
   * Export metrics for analysis
   */
  static exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Check for performance issues
   */
  static getPerformanceIssues(): {
    slowOperations: string[];
    memoryUsage: number;
    recommendations: string[];
  } {
    const report = this.getFullReport();
    const slowOperations: string[] = [];
    const recommendations: string[] = [];

    for (const [operation, stats] of Object.entries(report)) {
      if (stats.averageDuration > this.SLOW_OPERATION_THRESHOLD) {
        slowOperations.push(`${operation} (avg: ${stats.averageDuration.toFixed(2)}ms)`);
      }
      
      if (stats.slowOperations.length > stats.totalOperations * 0.1) {
        recommendations.push(`Optimize ${operation} - ${stats.slowOperations.length} slow operations`);
      }
    }

    // Memory usage estimate
    const memoryUsage = this.metrics.length * 100; // Rough estimate in bytes

    if (memoryUsage > 50000) {
      recommendations.push('Consider clearing old performance metrics');
    }

    if (slowOperations.length > 0) {
      recommendations.push('Enable template caching for slow operations');
    }

    return {
      slowOperations,
      memoryUsage,
      recommendations
    };
  }

  /**
   * Monitor template system health
   */
  static getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: {
      responseTime: number;
      errorRate: number;
      throughput: number;
    };
  } {
    const report = this.getFullReport();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Calculate overall metrics
    const allDurations = this.metrics.map(m => m.duration);
    const avgResponseTime = allDurations.length > 0 
      ? allDurations.reduce((a, b) => a + b, 0) / allDurations.length 
      : 0;

    const recentMetrics = this.metrics.slice(-50);
    const errorCount = recentMetrics.filter(m => m.metadata?.error).length;
    const errorRate = recentMetrics.length > 0 ? errorCount / recentMetrics.length : 0;

    const throughput = recentMetrics.length / 60; // operations per minute (rough)

    // Health checks
    if (avgResponseTime > 200) {
      issues.push('High average response time');
      status = 'warning';
    }

    if (avgResponseTime > 500) {
      issues.push('Critical response time');
      status = 'critical';
    }

    if (errorRate > 0.05) {
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
      status = status === 'critical' ? 'critical' : 'warning';
    }

    if (throughput < 1) {
      issues.push('Low throughput detected');
      if (status === 'healthy') status = 'warning';
    }

    return {
      status,
      issues,
      metrics: {
        responseTime: avgResponseTime,
        errorRate,
        throughput
      }
    };
  }
}