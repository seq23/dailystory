/**
 * Template Monitoring Service - Real-time monitoring and analytics
 * Tracks template usage, performance, and failure patterns
 */

export interface TemplateUsageMetrics {
  templateId: string;
  usageCount: number;
  successRate: number;
  averageProcessingTime: number;
  lastUsed: Date;
  userSatisfactionScore?: number;
  successCount: number;
  totalAttempts: number;
}

export interface PlaceholderMetrics {
  placeholder: string;
  resolutionRate: number;
  failureCount: number;
  commonFailureReasons: string[];
  lastFailure?: Date;
}

export interface SystemHealthMetrics {
  overallSuccessRate: number;
  averageResponseTime: number;
  activeTemplateCount: number;
  criticalErrors: number;
  lastHealthCheck: Date;
  recommendations: string[];
}

export class TemplateMonitoringService {
  private static templateMetrics: Map<string, TemplateUsageMetrics> = new Map();
  private static placeholderMetrics: Map<string, PlaceholderMetrics> = new Map();
  private static performanceLog: Array<{
    timestamp: Date;
    operation: string;
    duration: number;
    success: boolean;
    error?: string;
  }> = [];

  /**
   * Record template usage and performance
   */
  static recordTemplateUsage(
    templateId: string,
    processingTime: number,
    success: boolean,
    error?: string
  ): void {
    const existing = this.templateMetrics.get(templateId);
    
    if (existing) {
      existing.usageCount++;
      existing.totalAttempts++;
      if (success) {
        existing.successCount++;
      }
      existing.averageProcessingTime = (
        (existing.averageProcessingTime * (existing.usageCount - 1)) + processingTime
      ) / existing.usageCount;
      
      // Calculate success rate as a proper percentage
      existing.successRate = existing.successCount / existing.totalAttempts;
      existing.lastUsed = new Date();
    } else {
      this.templateMetrics.set(templateId, {
        templateId,
        usageCount: 1,
        successRate: success ? 1 : 0,
        averageProcessingTime: processingTime,
        lastUsed: new Date(),
        successCount: success ? 1 : 0,
        totalAttempts: 1
      });
    }

    // Record performance log
    this.performanceLog.push({
      timestamp: new Date(),
      operation: `template-${templateId}`,
      duration: processingTime,
      success,
      error
    });

    // Cleanup old logs
    this.cleanupLogs();
  }

  /**
   * Record placeholder resolution metrics
   */
  static recordPlaceholderResolution(
    placeholder: string,
    success: boolean,
    failureReason?: string
  ): void {
    const existing = this.placeholderMetrics.get(placeholder);
    
    if (existing) {
      const totalAttempts = existing.failureCount + Math.round(existing.resolutionRate * 100);
      existing.resolutionRate = success 
        ? (existing.resolutionRate * totalAttempts + 1) / (totalAttempts + 1)
        : existing.resolutionRate * totalAttempts / (totalAttempts + 1);
      
      if (!success) {
        existing.failureCount++;
        existing.lastFailure = new Date();
        
        if (failureReason && !existing.commonFailureReasons.includes(failureReason)) {
          existing.commonFailureReasons.push(failureReason);
        }
      }
    } else {
      this.placeholderMetrics.set(placeholder, {
        placeholder,
        resolutionRate: success ? 1 : 0,
        failureCount: success ? 0 : 1,
        commonFailureReasons: failureReason ? [failureReason] : [],
        lastFailure: success ? undefined : new Date()
      });
    }
  }

  /**
   * Get comprehensive system health metrics
   */
  static getSystemHealth(): SystemHealthMetrics {
    const now = new Date();
    const recentLogs = this.performanceLog.filter(
      log => now.getTime() - log.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const totalOperations = recentLogs.length;
    const successfulOperations = recentLogs.filter(log => log.success).length;
    const overallSuccessRate = totalOperations > 0 ? successfulOperations / totalOperations : 0;

    const totalTime = recentLogs.reduce((sum, log) => sum + log.duration, 0);
    const averageResponseTime = totalOperations > 0 ? totalTime / totalOperations : 0;

    const activeTemplateCount = this.templateMetrics.size;
    const criticalErrors = recentLogs.filter(
      log => !log.success && log.error?.includes('critical')
    ).length;

    // Generate recommendations based on metrics
    const recommendations = this.generateHealthRecommendations(
      overallSuccessRate,
      averageResponseTime,
      criticalErrors
    );

    return {
      overallSuccessRate,
      averageResponseTime,
      activeTemplateCount,
      criticalErrors,
      lastHealthCheck: now,
      recommendations
    };
  }

  /**
   * Get template performance rankings
   */
  static getTemplateRankings(): TemplateUsageMetrics[] {
    return Array.from(this.templateMetrics.values())
      .sort((a, b) => {
        // Sort by success rate first, then usage count
        if (Math.abs(a.successRate - b.successRate) < 0.1) {
          return b.usageCount - a.usageCount;
        }
        return b.successRate - a.successRate;
      });
  }

  /**
   * Get problematic placeholders that need attention
   */
  static getProblematicPlaceholders(): PlaceholderMetrics[] {
    return Array.from(this.placeholderMetrics.values())
      .filter(metric => metric.resolutionRate < 0.9 || metric.failureCount > 5)
      .sort((a, b) => a.resolutionRate - b.resolutionRate);
  }

  /**
   * Generate monitoring report
   */
  static generateMonitoringReport(): {
    summary: SystemHealthMetrics;
    topPerformingTemplates: TemplateUsageMetrics[];
    problematicTemplates: TemplateUsageMetrics[];
    placeholderIssues: PlaceholderMetrics[];
    recommendations: string[];
  } {
    const systemHealth = this.getSystemHealth();
    const templateRankings = this.getTemplateRankings();
    const problematicPlaceholders = this.getProblematicPlaceholders();

    const topPerformingTemplates = templateRankings
      .filter(t => t.successRate >= 0.95)
      .slice(0, 10);

    const problematicTemplates = templateRankings
      .filter(t => t.successRate < 0.8 || t.averageProcessingTime > 1000)
      .slice(0, 10);

    const recommendations = [
      ...systemHealth.recommendations,
      ...this.generateTemplateRecommendations(problematicTemplates),
      ...this.generatePlaceholderRecommendations(problematicPlaceholders)
    ];

    return {
      summary: systemHealth,
      topPerformingTemplates,
      problematicTemplates,
      placeholderIssues: problematicPlaceholders,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  /**
   * Alert system for critical issues
   */
  static checkForCriticalIssues(): Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    issue: string;
    recommendation: string;
  }> {
    const alerts: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      issue: string;
      recommendation: string;
    }> = [];

    const systemHealth = this.getSystemHealth();

    // Check overall success rate
    if (systemHealth.overallSuccessRate < 0.5) {
      alerts.push({
        severity: 'critical',
        issue: `System success rate critically low: ${(systemHealth.overallSuccessRate * 100).toFixed(1)}%`,
        recommendation: 'Investigate template validation and placeholder resolution issues immediately'
      });
    } else if (systemHealth.overallSuccessRate < 0.8) {
      alerts.push({
        severity: 'high',
        issue: `System success rate below target: ${(systemHealth.overallSuccessRate * 100).toFixed(1)}%`,
        recommendation: 'Review recent template changes and user data quality'
      });
    }

    // Check response time
    if (systemHealth.averageResponseTime > 2000) {
      alerts.push({
        severity: 'high',
        issue: `Response time too slow: ${systemHealth.averageResponseTime}ms`,
        recommendation: 'Optimize template processing and consider caching strategies'
      });
    }

    // Check for failing placeholders
    const failingPlaceholders = this.getProblematicPlaceholders();
    if (failingPlaceholders.length > 5) {
      alerts.push({
        severity: 'medium',
        issue: `Multiple placeholders failing resolution: ${failingPlaceholders.length} affected`,
        recommendation: 'Update placeholder resolver with missing mappings'
      });
    }

    return alerts;
  }

  /**
   * Clear monitoring data (for testing)
   */
  static clearMonitoringData(): void {
    this.templateMetrics.clear();
    this.placeholderMetrics.clear();
    this.performanceLog = [];
  }

  // Private helper methods

  private static cleanupLogs(): void {
    const maxLogSize = 1000;
    if (this.performanceLog.length > maxLogSize) {
      this.performanceLog = this.performanceLog.slice(-maxLogSize * 0.8);
    }
  }

  private static generateHealthRecommendations(
    successRate: number,
    responseTime: number,
    criticalErrors: number
  ): string[] {
    const recommendations: string[] = [];

    if (successRate < 0.9) {
      recommendations.push('Consider implementing more robust error handling and fallback mechanisms');
    }

    if (responseTime > 1000) {
      recommendations.push('Optimize template processing performance');
    }

    if (criticalErrors > 0) {
      recommendations.push('Investigate and resolve critical error patterns');
    }

    return recommendations;
  }

  private static generateTemplateRecommendations(
    problematicTemplates: TemplateUsageMetrics[]
  ): string[] {
    const recommendations: string[] = [];

    if (problematicTemplates.length > 0) {
      recommendations.push(`Review ${problematicTemplates.length} underperforming templates`);
      
      const slowTemplates = problematicTemplates.filter(t => t.averageProcessingTime > 1000);
      if (slowTemplates.length > 0) {
        recommendations.push(`Optimize ${slowTemplates.length} slow-performing templates`);
      }
    }

    return recommendations;
  }

  private static generatePlaceholderRecommendations(
    problematicPlaceholders: PlaceholderMetrics[]
  ): string[] {
    const recommendations: string[] = [];

    if (problematicPlaceholders.length > 0) {
      const criticalPlaceholders = problematicPlaceholders
        .filter(p => p.resolutionRate < 0.7)
        .map(p => p.placeholder);

      if (criticalPlaceholders.length > 0) {
        recommendations.push(
          `Add fallback mappings for failing placeholders: ${criticalPlaceholders.join(', ')}`
        );
      }
    }

    return recommendations;
  }
}