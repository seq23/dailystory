/**
 * PERFORMANCE OPTIMIZATION: Smart orchestrator bypass for simple content
 */

import { DebugLogger } from '@/services/DebugLogger';

interface BypassMetrics {
  orchestratorResponseTimes: number[];
  templateResponseTimes: number[];
  recentFailures: number;
  lastBypassSuccess: number;
}

export class SmartOrchestrationBypass {
  private static metrics = new Map<string, BypassMetrics>();
  private static readonly SIMPLE_CONTENT_THRESHOLD = 100; // characters
  private static readonly FAST_RESPONSE_THRESHOLD = 3000; // 3 seconds
  private static readonly MAX_METRICS_AGE = 600000; // 10 minutes
  
  /**
   * Determine if content is simple enough for direct template routing
   */
  static shouldBypassOrchestrator(
    content: string, 
    sessionId: string,
    healthStatus?: any
  ): { shouldBypass: boolean; reason: string; targetTemplate?: string } {
    
    // Always bypass for very simple content
    if (content.length < this.SIMPLE_CONTENT_THRESHOLD) {
      return {
        shouldBypass: true,
        reason: `Simple content (${content.length} chars) - direct template routing`,
        targetTemplate: 'runware-template-cd'
      };
    }
    
    // Get performance metrics for this session
    const metrics = this.getSessionMetrics(sessionId);
    
    // Bypass if orchestrator has been consistently slow
    const avgOrchestratorTime = this.calculateAverage(metrics.orchestratorResponseTimes);
    const avgTemplateTime = this.calculateAverage(metrics.templateResponseTimes);
    
    if (avgOrchestratorTime > this.FAST_RESPONSE_THRESHOLD && avgTemplateTime < this.FAST_RESPONSE_THRESHOLD) {
      return {
        shouldBypass: true,
        reason: `Orchestrator slow (${avgOrchestratorTime}ms avg) vs template fast (${avgTemplateTime}ms avg)`,
        targetTemplate: 'runware-template-ab'
      };
    }
    
    // Bypass if recent orchestrator failures
    if (metrics.recentFailures > 2) {
      return {
        shouldBypass: true,
        reason: `Recent orchestrator failures (${metrics.recentFailures})`,
        targetTemplate: 'runware-template-cd'
      };
    }
    
    // Don't bypass for complex content when orchestrator is healthy
    return {
      shouldBypass: false,
      reason: 'Complex content with healthy orchestrator'
    };
  }
  
  /**
   * Record orchestrator performance for future decisions
   */
  static recordOrchestratorResponse(sessionId: string, responseTime: number, success: boolean): void {
    const metrics = this.getSessionMetrics(sessionId);
    
    metrics.orchestratorResponseTimes.push(responseTime);
    if (metrics.orchestratorResponseTimes.length > 5) {
      metrics.orchestratorResponseTimes.shift(); // Keep only last 5
    }
    
    if (!success) {
      metrics.recentFailures++;
    } else {
      metrics.recentFailures = Math.max(0, metrics.recentFailures - 1);
    }
    
    this.metrics.set(sessionId, metrics);
    DebugLogger.log('image', '⚡ Recorded orchestrator metrics', {
      sessionId,
      responseTime,
      success,
      failures: metrics.recentFailures
    });
  }
  
  /**
   * Record template performance for comparison
   */
  static recordTemplateResponse(sessionId: string, responseTime: number): void {
    const metrics = this.getSessionMetrics(sessionId);
    
    metrics.templateResponseTimes.push(responseTime);
    if (metrics.templateResponseTimes.length > 5) {
      metrics.templateResponseTimes.shift(); // Keep only last 5
    }
    
    this.metrics.set(sessionId, metrics);
  }
  
  /**
   * Get or create session metrics
   */
  private static getSessionMetrics(sessionId: string): BypassMetrics {
    if (!this.metrics.has(sessionId)) {
      this.metrics.set(sessionId, {
        orchestratorResponseTimes: [],
        templateResponseTimes: [],
        recentFailures: 0,
        lastBypassSuccess: 0
      });
    }
    return this.metrics.get(sessionId)!;
  }
  
  /**
   * Calculate average response time
   */
  private static calculateAverage(times: number[]): number {
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  /**
   * Clean old metrics to prevent memory leaks
   */
  static cleanOldMetrics(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, metrics] of this.metrics.entries()) {
      if (now - metrics.lastBypassSuccess > this.MAX_METRICS_AGE) {
        this.metrics.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      DebugLogger.log('image', '⚡ Cleaned old bypass metrics', { cleaned });
    }
  }
  
  /**
   * Get bypass statistics for monitoring
   */
  static getStats() {
    return {
      activeSessions: this.metrics.size,
      totalMetrics: Array.from(this.metrics.values()).reduce((sum, m) => 
        sum + m.orchestratorResponseTimes.length + m.templateResponseTimes.length, 0
      )
    };
  }
}