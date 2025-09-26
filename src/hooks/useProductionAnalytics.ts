// Production Analytics Hook - React hook for tracking user interactions and analytics

import { useEffect, useState, useCallback } from 'react';
import { ProductionAnalyticsTracker } from '@/services/ProductionAnalyticsTracker';
import { UserInfo, DifficultyLevel } from '@/types';
import { DebugLogger } from '@/services/DebugLogger';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsSession {
  sessionId: string;
  isActive: boolean;
  startTime: number;
}

export interface AnalyticsDashboard {
  usageAnalytics: any;
  templateAnalytics: any;
  systemHealth: any;
  costAnalytics: any;
  modelPerformance: any;
  userSatisfaction: any;
  isLoaded: boolean;
}

export const useProductionAnalytics = () => {
  const [currentSession, setCurrentSession] = useState<AnalyticsSession | null>(null);
  const [dashboard, setDashboard] = useState<AnalyticsDashboard>({
    usageAnalytics: null,
    templateAnalytics: null,
    systemHealth: null,
    costAnalytics: null,
    modelPerformance: null,
    userSatisfaction: null,
    isLoaded: false
  });

  // Initialize analytics tracker
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      // Fetch real analytics data from backend
      const { data: analyticsResponse } = await supabase.functions.invoke('get-cost-analytics');
      
      setDashboard({
        usageAnalytics: analyticsResponse?.success ? analyticsResponse.data.usageMetrics : { totalUsers: 0, storiesGenerated: 0 },
        templateAnalytics: { templatesUsed: 0 },
        systemHealth: analyticsResponse?.success ? analyticsResponse.data.systemStatus : { uptime: "99.9%" },
        costAnalytics: analyticsResponse?.success ? analyticsResponse.data.costSummary : null,
        modelPerformance: null,
        userSatisfaction: null,
        isLoaded: true
      });
    } catch (error) {
      DebugLogger.error('error', 'Failed to load analytics dashboard:', error);
      // Fallback to placeholder data
      setDashboard({
        usageAnalytics: { totalUsers: 0, storiesGenerated: 0 },
        templateAnalytics: { templatesUsed: 0 },
        systemHealth: { uptime: "99.9%" },
        costAnalytics: null,
        modelPerformance: null,
        userSatisfaction: null,
        isLoaded: true
      });
    }
  }, []);

  const startSession = useCallback(async (userInfo?: UserInfo, isPremium: boolean = false) => {
    const newSession: AnalyticsSession = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isActive: true,
      startTime: Date.now()
    };
    
    setCurrentSession(newSession);
    
    // Track in database via ProductionAnalyticsTracker
    try {
      await ProductionAnalyticsTracker.startSession({
        sessionId: newSession.sessionId,
        userId: userInfo?.name,
        isPremium
      });
    } catch (error) {
      DebugLogger.error('error', 'Failed to start analytics session:', error);
    }
    
    DebugLogger.log('performance', 'Analytics: Session started', newSession);
  }, []);

  const endSession = useCallback(async () => {
    if (currentSession) {
      // Track session end in database
      try {
        await ProductionAnalyticsTracker.endSession(currentSession.sessionId);
      } catch (error) {
        DebugLogger.error('error', 'Failed to end analytics session:', error);
      }
      
      setCurrentSession(null);
      DebugLogger.log('performance', 'Analytics: Session ended', currentSession.sessionId);
    }
  }, [currentSession]);

  const trackTemplateUsage = useCallback(async (template: string, success: boolean) => {
    if (!currentSession || !currentSession.isActive) return;
    
    DebugLogger.log('performance', 'Analytics: Template usage tracked', {
      sessionId: currentSession.sessionId,
      template,
      success
    });
    
    // Track story generation if successful
    if (success) {
      try {
        await ProductionAnalyticsTracker.trackStoryGeneration(currentSession.sessionId);
      } catch (error) {
        DebugLogger.error('error', 'Failed to track template usage:', error);
      }
    }
  }, [currentSession]);

  const trackWordClick = useCallback((word: string, pageNumber?: number) => {
    if (!currentSession || !currentSession.isActive) return;
    DebugLogger.log('performance', 'Analytics: Word click tracked', { word, pageNumber, sessionId: currentSession.sessionId });
  }, [currentSession]);

  const trackPageTurn = useCallback(async (pageNumber: number, direction: 'next' | 'previous') => {
    if (!currentSession || !currentSession.isActive) return;
    
    DebugLogger.log('performance', 'Analytics: Page turn tracked', {
      sessionId: currentSession.sessionId,
      pageNumber,
      direction
    });
    
    // Track page view
    try {
      await ProductionAnalyticsTracker.trackPageView(currentSession.sessionId);
    } catch (error) {
      DebugLogger.error('error', 'Failed to track page turn:', error);
    }
  }, [currentSession]);

  const trackAudioPlay = useCallback((pageNumber: number, duration?: number) => {
    if (!currentSession || !currentSession.isActive) return;
    DebugLogger.log('performance', 'Analytics: Audio play tracked', { pageNumber, duration, sessionId: currentSession.sessionId });
  }, [currentSession]);

  const trackStoryRestart = useCallback(() => {
    if (!currentSession || !currentSession.isActive) return;
    DebugLogger.log('performance', 'Analytics: Story restart tracked', { sessionId: currentSession.sessionId });
  }, [currentSession]);

  const trackQuizAnswer = useCallback((question: string, answer: string, isCorrect: boolean) => {
    if (!currentSession || !currentSession.isActive) return;
    DebugLogger.log('performance', 'Analytics: Quiz answer tracked', { question, answer, isCorrect, sessionId: currentSession.sessionId });
  }, [currentSession]);

  // Cost tracking methods
  const trackCost = useCallback(async (cost: number, model: string, tokens: { input: number; output: number }, operationType: 'story_generation' | 'image_generation' | 'audio_generation' = 'story_generation') => {
    if (!currentSession || !currentSession.isActive) return;
    
    DebugLogger.log('performance', 'Analytics: Cost tracked', { 
      sessionId: currentSession.sessionId,
      cost,
      model,
      tokens,
      operationType
    });
    
    // Track in database via ProductionAnalyticsTracker
    try {
      await ProductionAnalyticsTracker.trackCost({
        sessionId: currentSession.sessionId,
        inputTokens: tokens.input,
        outputTokens: tokens.output,
        cost,
        modelUsed: model,
        operationType
      });
    } catch (error) {
      DebugLogger.error('error', 'Failed to track cost:', error);
    }
  }, [currentSession]);

  const trackModelPerformance = useCallback((model: string, responseTime: number, success: boolean, retryAttempt: number = 0) => {
    if (!currentSession || !currentSession.isActive) return;
    DebugLogger.log('performance', 'Model performance', { model, responseTime, success, retryAttempt, sessionId: currentSession.sessionId });
  }, [currentSession]);

  const trackUserSatisfaction = useCallback((rating: number, feedback?: string, pageNumber?: number) => {
    if (!currentSession || !currentSession.isActive) return;
    DebugLogger.log('ui', 'User satisfaction', { rating, feedback, pageNumber, sessionId: currentSession.sessionId });
  }, [currentSession]);

  const getDailyCostSummary = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-cost-analytics');
      
      if (error) {
        console.error('Failed to fetch cost analytics:', error);
        return {
          date: new Date().toISOString().split('T')[0],
          totalCost: 0,
          totalRequests: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          averageCostPerRequest: 0,
          modelBreakdown: {},
          isLimitExceeded: false
        };
      }

      return data.data.costSummary;
    } catch (error) {
      console.error('Error fetching cost analytics:', error);
      return {
        date: new Date().toISOString().split('T')[0],
        totalCost: 0,
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        averageCostPerRequest: 0,
        modelBreakdown: {},
        isLimitExceeded: false
      };
    }
  }, []);

  const exportAnalytics = useCallback(() => {
    const data = {
      session: currentSession,
      dashboard,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [currentSession, dashboard]);

  const getSessionSummary = useCallback(() => {
    if (!currentSession) return null;

    return {
      sessionId: currentSession.sessionId,
      duration: Date.now() - currentSession.startTime,
      isActive: currentSession.isActive,
      formattedDuration: formatDuration(Date.now() - currentSession.startTime)
    };
  }, [currentSession]);

  return {
    // Session management
    currentSession,
    startSession,
    endSession,
    getSessionSummary,

    // Interaction tracking
    trackTemplateUsage,
    trackWordClick,
    trackPageTurn,
    trackAudioPlay,
    trackStoryRestart,
    trackQuizAnswer,

    // Cost & performance tracking
    trackCost,
    trackModelPerformance,
    trackUserSatisfaction,
    getDailyCostSummary,

    // Dashboard data
    dashboard,
    refreshDashboard: loadDashboardData,

    // Export functionality
    exportAnalytics,

    // Utility
    isTracking: currentSession?.isActive || false
  };
};

// Helper function to format duration
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}