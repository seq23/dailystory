// Production Analytics Tracker - Comprehensive Usage Analytics for Production Deployment
// Tracks user engagement, template performance, and system health metrics

import { generateSessionIdWithPrefix } from '@/utils/sessionId';
import { DebugLogger } from '@/services/DebugLogger';

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  difficulty: string;
  gradeLevel: number;
  isPremium: boolean;
  pagesGenerated: number;
  templatesUsed: string[];
  interactions: UserInteraction[];
  completionStatus: 'completed' | 'abandoned' | 'active';
}

export interface UserInteraction {
  type: 'word_click' | 'page_turn' | 'audio_play' | 'story_restart' | 'quiz_answer';
  timestamp: number;
  data: Record<string, any>;
  deviceInfo: {
    isMobile: boolean;
    isTablet: boolean;
    screenSize: string;
  };
}

export interface TemplateUsageMetric {
  templateId: string;
  gradeLevel: number;
  usageCount: number;
  averageCompletionRate: number;
  averageEngagementTime: number;
  userSatisfactionScore: number;
  lastUsed: number;
}

export interface SystemHealthMetric {
  timestamp: number;
  templateLoadTime: number;
  errorRate: number;
  activeUsers: number;
  cacheHitRate: number;
  memoryUsage: number;
  performanceScore: number;
}

export class ProductionAnalyticsTracker {
  private static sessions = new Map<string, UserSession>();
  private static templateMetrics = new Map<string, TemplateUsageMetric>();
  private static systemMetrics: SystemHealthMetric[] = [];
  private static isInitialized = false;

  /**
   * Initialize analytics tracking for production
   */
  static initialize(): void {
    if (this.isInitialized) return;

    DebugLogger.log('performance', 'Initializing Production Analytics Tracker...');
    
    // Set up periodic health monitoring
    // Disabled auto-refresh intervals to prevent unwanted page refreshes
    // setInterval(() => {
    //   this.recordSystemHealth();
    // }, 60000); // Every minute

    // setInterval(() => {
    //   this.cleanupOldSessions();
    // }, 300000); // Every 5 minutes

    this.isInitialized = true;
    DebugLogger.log('performance', 'Production Analytics Tracker initialized');
  }

  /**
   * Start tracking a user session
   */
  static startSession(
    difficulty: string,
    gradeLevel: number,
    isPremium: boolean,
    userId?: string
  ): string {
    const sessionId = generateSessionIdWithPrefix('session');
    
    const session: UserSession = {
      sessionId,
      userId,
      startTime: Date.now(),
      difficulty,
      gradeLevel,
      isPremium,
      pagesGenerated: 0,
      templatesUsed: [],
      interactions: [],
      completionStatus: 'active'
    };

    this.sessions.set(sessionId, session);
    
    DebugLogger.log('performance', `Started session ${sessionId} for ${isPremium ? 'premium' : 'free'} user`);
    return sessionId;
  }

  /**
   * Track template usage in a session
   */
  static trackTemplateUsage(
    sessionId: string,
    templateId: string,
    pagesGenerated: number
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Update session
    session.pagesGenerated += pagesGenerated;
    session.templatesUsed.push(templateId);

    // Update template metrics
    const existing = this.templateMetrics.get(templateId);
    if (existing) {
      existing.usageCount++;
      existing.lastUsed = Date.now();
    } else {
      this.templateMetrics.set(templateId, {
        templateId,
        gradeLevel: session.gradeLevel,
        usageCount: 1,
        averageCompletionRate: 0,
        averageEngagementTime: 0,
        userSatisfactionScore: 0,
        lastUsed: Date.now()
      });
    }
  }

  /**
   * Track user interaction
   */
  static trackInteraction(
    sessionId: string,
    type: UserInteraction['type'],
    data: Record<string, any> = {}
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const interaction: UserInteraction = {
      type,
      timestamp: Date.now(),
      data,
      deviceInfo: {
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    session.interactions.push(interaction);

    // Update template engagement metrics
    if (type === 'word_click' || type === 'page_turn') {
      this.updateEngagementMetrics(session, interaction);
    }
  }

  /**
   * End a user session
   */
  static endSession(sessionId: string, completionStatus: UserSession['completionStatus'] = 'completed'): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.endTime = Date.now();
    session.completionStatus = completionStatus;

    // Update completion rates for used templates
    session.templatesUsed.forEach(templateId => {
      const metric = this.templateMetrics.get(templateId);
      if (metric) {
        const completionRate = completionStatus === 'completed' ? 1 : 0;
        metric.averageCompletionRate = (
          (metric.averageCompletionRate * (metric.usageCount - 1) + completionRate) / 
          metric.usageCount
        );
      }
    });

    DebugLogger.log('performance', `Ended session ${sessionId} with status: ${completionStatus}`);
  }

  /**
   * Get usage analytics dashboard data
   */
  static getUsageAnalytics(): {
    totalSessions: number;
    activeSessions: number;
    averageSessionDuration: number;
    premiumVsFreeUsage: { premium: number; free: number };
    popularGradeLevels: { level: number; count: number }[];
    deviceBreakdown: { mobile: number; tablet: number; desktop: number };
    completionRates: { completed: number; abandoned: number };
  } {
    const allSessions = Array.from(this.sessions.values());
    const completedSessions = allSessions.filter(s => s.endTime);

    const averageSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.endTime! - s.startTime), 0) / completedSessions.length
      : 0;

    const premiumSessions = allSessions.filter(s => s.isPremium).length;
    const freeSessions = allSessions.length - premiumSessions;

    const gradeLevelCounts = new Map<number, number>();
    allSessions.forEach(s => {
      gradeLevelCounts.set(s.gradeLevel, (gradeLevelCounts.get(s.gradeLevel) || 0) + 1);
    });

    const popularGradeLevels = Array.from(gradeLevelCounts.entries())
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count);

    // Device breakdown from interactions
    let mobileCount = 0, tabletCount = 0, desktopCount = 0;
    allSessions.forEach(session => {
      const lastInteraction = session.interactions[session.interactions.length - 1];
      if (lastInteraction?.deviceInfo) {
        if (lastInteraction.deviceInfo.isMobile) mobileCount++;
        else if (lastInteraction.deviceInfo.isTablet) tabletCount++;
        else desktopCount++;
      }
    });

    const completedCount = allSessions.filter(s => s.completionStatus === 'completed').length;
    const abandonedCount = allSessions.filter(s => s.completionStatus === 'abandoned').length;

    return {
      totalSessions: allSessions.length,
      activeSessions: allSessions.filter(s => s.completionStatus === 'active').length,
      averageSessionDuration,
      premiumVsFreeUsage: { premium: premiumSessions, free: freeSessions },
      popularGradeLevels,
      deviceBreakdown: { mobile: mobileCount, tablet: tabletCount, desktop: desktopCount },
      completionRates: { completed: completedCount, abandoned: abandonedCount }
    };
  }

  /**
   * Get template performance analytics
   */
  static getTemplateAnalytics(): {
    topPerformingTemplates: TemplateUsageMetric[];
    underperformingTemplates: TemplateUsageMetric[];
    gradeLevelPerformance: { level: number; averageCompletion: number; usage: number }[];
  } {
    const allMetrics = Array.from(this.templateMetrics.values());

    const topPerforming = allMetrics
      .filter(m => m.usageCount >= 5)
      .sort((a, b) => b.averageCompletionRate - a.averageCompletionRate)
      .slice(0, 10);

    const underperforming = allMetrics
      .filter(m => m.usageCount >= 5 && m.averageCompletionRate < 0.5)
      .sort((a, b) => a.averageCompletionRate - b.averageCompletionRate)
      .slice(0, 5);

    const gradeLevelPerf = new Map<number, { totalCompletion: number; count: number; usage: number }>();
    allMetrics.forEach(metric => {
      const existing = gradeLevelPerf.get(metric.gradeLevel) || { totalCompletion: 0, count: 0, usage: 0 };
      existing.totalCompletion += metric.averageCompletionRate;
      existing.count++;
      existing.usage += metric.usageCount;
      gradeLevelPerf.set(metric.gradeLevel, existing);
    });

    const gradeLevelPerformance = Array.from(gradeLevelPerf.entries())
      .map(([level, data]) => ({
        level,
        averageCompletion: data.totalCompletion / data.count,
        usage: data.usage
      }))
      .sort((a, b) => a.level - b.level);

    return {
      topPerformingTemplates: topPerforming,
      underperformingTemplates: underperforming,
      gradeLevelPerformance
    };
  }

  /**
   * Get real-time system health metrics
   */
  static getSystemHealthDashboard(): {
    currentHealth: SystemHealthMetric;
    healthTrend: SystemHealthMetric[];
    alerts: string[];
    recommendations: string[];
  } {
    const recentMetrics = this.systemMetrics.slice(-60); // Last hour
    const currentHealth = this.systemMetrics[this.systemMetrics.length - 1] || {
      timestamp: Date.now(),
      templateLoadTime: 0,
      errorRate: 0,
      activeUsers: 0,
      cacheHitRate: 1,
      memoryUsage: 0,
      performanceScore: 100
    };

    const alerts: string[] = [];
    const recommendations: string[] = [];

    // Generate alerts and recommendations
    if (currentHealth.templateLoadTime > 200) {
      alerts.push('High template load times detected');
      recommendations.push('Consider optimizing template caching strategy');
    }

    if (currentHealth.errorRate > 0.05) {
      alerts.push('Elevated error rate detected');
      recommendations.push('Investigate error logs for common failure patterns');
    }

    if (currentHealth.cacheHitRate < 0.7) {
      alerts.push('Low cache hit rate');
      recommendations.push('Review cache configuration and TTL settings');
    }

    if (currentHealth.performanceScore < 80) {
      alerts.push('Performance below optimal levels');
      recommendations.push('Consider scaling resources or optimizing code paths');
    }

    return {
      currentHealth,
      healthTrend: recentMetrics,
      alerts,
      recommendations
    };
  }

  private static updateEngagementMetrics(session: UserSession, interaction: UserInteraction): void {
    session.templatesUsed.forEach(templateId => {
      const metric = this.templateMetrics.get(templateId);
      if (metric) {
        const sessionDuration = interaction.timestamp - session.startTime;
        metric.averageEngagementTime = (
          (metric.averageEngagementTime * (metric.usageCount - 1) + sessionDuration) / 
          metric.usageCount
        );
      }
    });
  }

  private static recordSystemHealth(): void {
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.completionStatus === 'active').length;
    
    // Mock system metrics (in production, these would come from real monitoring)
    const healthMetric: SystemHealthMetric = {
      timestamp: Date.now(),
      templateLoadTime: Math.random() * 100 + 50, // 50-150ms
      errorRate: Math.random() * 0.02, // 0-2%
      activeUsers: activeSessions,
      cacheHitRate: 0.8 + Math.random() * 0.2, // 80-100%
      memoryUsage: Math.random() * 50 + 30, // 30-80%
      performanceScore: 90 + Math.random() * 10 // 90-100%
    };

    this.systemMetrics.push(healthMetric);

    // Keep only last 24 hours of metrics
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.systemMetrics = this.systemMetrics.filter(metric => metric.timestamp > oneDayAgo);
  }

  private static cleanupOldSessions(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [sessionId, session] of this.sessions.entries()) {
      // Mark abandoned sessions that have been inactive for over an hour
      if (session.completionStatus === 'active' && session.startTime < oneHourAgo) {
        session.completionStatus = 'abandoned';
        session.endTime = Date.now();
      }

      // Remove very old completed/abandoned sessions
      const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
      if (session.endTime && session.endTime < sixHoursAgo) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Export analytics data for external analysis
   */
  static exportAnalyticsData(): {
    sessions: UserSession[];
    templateMetrics: TemplateUsageMetric[];
    systemMetrics: SystemHealthMetric[];
    exportTimestamp: number;
  } {
    return {
      sessions: Array.from(this.sessions.values()),
      templateMetrics: Array.from(this.templateMetrics.values()),
      systemMetrics: this.systemMetrics,
      exportTimestamp: Date.now()
    };
  }

  /**
   * Reset all analytics data (for testing purposes)
   */
  static reset(): void {
    this.sessions.clear();
    this.templateMetrics.clear();
    this.systemMetrics = [];
    DebugLogger.log('performance', 'Production Analytics Tracker reset complete');
  }
}
