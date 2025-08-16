// Production Analytics Hook - React hook for tracking user interactions and analytics

import { useEffect, useState, useCallback } from 'react';
import { ProductionAnalyticsTracker } from '@/services/productionAnalyticsTracker';
import { UserInfo, DifficultyLevel } from '@/types';

export interface AnalyticsSession {
  sessionId: string;
  isActive: boolean;
  startTime: number;
}

export interface AnalyticsDashboard {
  usageAnalytics: any;
  templateAnalytics: any;
  systemHealth: any;
  isLoaded: boolean;
}

export const useProductionAnalytics = () => {
  const [currentSession, setCurrentSession] = useState<AnalyticsSession | null>(null);
  const [dashboard, setDashboard] = useState<AnalyticsDashboard>({
    usageAnalytics: null,
    templateAnalytics: null,
    systemHealth: null,
    isLoaded: false
  });

  // Initialize analytics tracker
  useEffect(() => {
    ProductionAnalyticsTracker.initialize();
    loadDashboardData();
    
    // Disabled auto-refresh to prevent unwanted page refreshes
    // const interval = setInterval(loadDashboardData, 30000);
    // return () => clearInterval(interval);
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const [usageAnalytics, templateAnalytics, systemHealth] = await Promise.all([
        Promise.resolve(ProductionAnalyticsTracker.getUsageAnalytics()),
        Promise.resolve(ProductionAnalyticsTracker.getTemplateAnalytics()),
        Promise.resolve(ProductionAnalyticsTracker.getSystemHealthDashboard())
      ]);

      setDashboard({
        usageAnalytics,
        templateAnalytics,
        systemHealth,
        isLoaded: true
      });
    } catch (error) {
      console.error('Failed to load analytics dashboard:', error);
    }
  }, []);

  const startSession = useCallback((
    difficulty: DifficultyLevel,
    gradeLevel: number,
    isPremium: boolean,
    userInfo?: UserInfo
  ) => {
    if (currentSession?.isActive) {
      endSession('abandoned');
    }

    const sessionId = ProductionAnalyticsTracker.startSession(
      difficulty,
      gradeLevel,
      isPremium,
      userInfo?.name
    );

    setCurrentSession({
      sessionId,
      isActive: true,
      startTime: Date.now()
    });

    return sessionId;
  }, [currentSession]);

  const endSession = useCallback((status: 'completed' | 'abandoned' = 'completed') => {
    if (currentSession?.isActive) {
      ProductionAnalyticsTracker.endSession(currentSession.sessionId, status);
      setCurrentSession(prev => prev ? { ...prev, isActive: false } : null);
    }
  }, [currentSession]);

  const trackTemplateUsage = useCallback((templateId: string, pagesGenerated: number) => {
    if (currentSession?.isActive) {
      ProductionAnalyticsTracker.trackTemplateUsage(
        currentSession.sessionId,
        templateId,
        pagesGenerated
      );
    }
  }, [currentSession]);

  const trackInteraction = useCallback((
    type: 'word_click' | 'page_turn' | 'audio_play' | 'story_restart' | 'quiz_answer',
    data: Record<string, any> = {}
  ) => {
    if (currentSession?.isActive) {
      ProductionAnalyticsTracker.trackInteraction(currentSession.sessionId, type, data);
    }
  }, [currentSession]);

  const trackWordClick = useCallback((word: string, pageNumber?: number) => {
    trackInteraction('word_click', { word, pageNumber });
  }, [trackInteraction]);

  const trackPageTurn = useCallback((fromPage: number, toPage: number) => {
    trackInteraction('page_turn', { fromPage, toPage });
  }, [trackInteraction]);

  const trackAudioPlay = useCallback((pageNumber: number, duration?: number) => {
    trackInteraction('audio_play', { pageNumber, duration });
  }, [trackInteraction]);

  const trackStoryRestart = useCallback(() => {
    trackInteraction('story_restart', { timestamp: Date.now() });
  }, [trackInteraction]);

  const trackQuizAnswer = useCallback((question: string, answer: string, isCorrect: boolean) => {
    trackInteraction('quiz_answer', { question, answer, isCorrect });
  }, [trackInteraction]);

  const exportAnalytics = useCallback(() => {
    const data = ProductionAnalyticsTracker.exportAnalyticsData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

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