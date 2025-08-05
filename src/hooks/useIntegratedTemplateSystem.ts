import { useCallback, useEffect, useState } from 'react';
import { ComprehensiveTemplateManager } from '@/services/comprehensiveTemplateManager';
import { TemplatePerformanceMonitor } from '@/services/templatePerformanceMonitor';
import { TemplateSystemLogger } from '@/services/templateSystemLogger';
import { DifficultyLevel, UserInfo } from '@/types';

interface TemplateSystemState {
  isLoading: boolean;
  error: string | null;
  performance: {
    avgResponseTime: number;
    successRate: number;
    cacheHitRate: number;
  };
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const useIntegratedTemplateSystem = () => {
  const [state, setState] = useState<TemplateSystemState>({
    isLoading: false,
    error: null,
    performance: {
      avgResponseTime: 0,
      successRate: 100,
      cacheHitRate: 0
    },
    systemHealth: 'healthy'
  });

  // Initialize system on mount
  useEffect(() => {
    TemplateSystemLogger.initialize({
      enableConsoleOutput: import.meta.env.DEV,
      enableLocalStorage: true,
      maxLogEntries: 1000,
      enableErrorTracking: true
    });

    TemplateSystemLogger.info('SYSTEM', 'Template system initialized');
  }, []);

  // Monitor system health
  useEffect(() => {
    const checkHealth = () => {
      const health = TemplatePerformanceMonitor.getSystemHealth();
      const stats = TemplatePerformanceMonitor.getStats();
      
      setState(prev => ({
        ...prev,
        systemHealth: health.status,
        performance: {
          avgResponseTime: stats.averageDuration,
          successRate: ((stats.totalOperations - stats.recentOperations.length) / Math.max(stats.totalOperations, 1)) * 100,
          cacheHitRate: 85 // Placeholder for actual cache hit rate
        }
      }));
    };

    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    checkHealth(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const generateStory = useCallback(async (
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    theme?: string,
    enhanceForReadability: boolean = true,
    enhanceForMobile: boolean = true
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const startTime = TemplatePerformanceMonitor.startOperation('story_generation');
    
    try {
      TemplateSystemLogger.info('GENERATION', 'Starting story generation', {
        difficulty,
        theme,
        userInfo: { name: userInfo.name, readingLevel: userInfo.readingLevel }
      });

      const result = await ComprehensiveTemplateManager.generateStory({
        userInfo,
        difficulty
      });

      const duration = TemplatePerformanceMonitor.endOperation('story_generation', startTime, {
        templateIndex: result.templateIndex,
        pageCount: result.pages.length,
        wordCount: result.pages.join(' ').split(' ').length
      });

      TemplateSystemLogger.info('GENERATION', 'Story generation completed', {
        duration,
        success: true,
        templateIndex: result.templateIndex
      });

      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const duration = TemplatePerformanceMonitor.endOperation('story_generation', startTime, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      TemplateSystemLogger.error('GENERATION', 'Story generation failed', {
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      
      throw error;
    }
  }, []);

  const generateBatch = useCallback(async (
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    count: number = 3,
    theme?: string
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const startTime = TemplatePerformanceMonitor.startOperation('batch_generation');
    
    try {
      TemplateSystemLogger.info('BATCH', 'Starting batch generation', {
        difficulty,
        count,
        theme
      });

      const results = await ComprehensiveTemplateManager.generateBatch({
        userInfo,
        difficulty
      }, count);

      const duration = TemplatePerformanceMonitor.endOperation('batch_generation', startTime, {
        count: results.length,
        totalPages: results.reduce((sum, r) => sum + r.pages.length, 0)
      });

      TemplateSystemLogger.info('BATCH', 'Batch generation completed', {
        duration,
        count: results.length
      });

      setState(prev => ({ ...prev, isLoading: false }));
      return results;
    } catch (error) {
      const duration = TemplatePerformanceMonitor.endOperation('batch_generation', startTime, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      TemplateSystemLogger.error('BATCH', 'Batch generation failed', {
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      
      throw error;
    }
  }, []);

  const getSystemAnalytics = useCallback(() => {
    return {
      templateManager: ComprehensiveTemplateManager.getAnalytics(),
      performance: TemplatePerformanceMonitor.getFullReport(),
      logs: TemplateSystemLogger.getErrorSummary()
    };
  }, []);

  const clearSession = useCallback(() => {
    ComprehensiveTemplateManager.clearSession();
    TemplatePerformanceMonitor.clearMetrics();
    TemplateSystemLogger.info('SYSTEM', 'Session cleared');
  }, []);

  const exportDiagnostics = useCallback(() => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      state,
      analytics: getSystemAnalytics(),
      systemHealth: TemplatePerformanceMonitor.getSystemHealth(),
      performanceIssues: TemplatePerformanceMonitor.getPerformanceIssues(),
      logs: TemplateSystemLogger.exportLogs()
    };

    const dataStr = JSON.stringify(diagnostics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-system-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state, getSystemAnalytics]);

  return {
    state,
    generateStory,
    generateBatch,
    getSystemAnalytics,
    clearSession,
    exportDiagnostics
  };
};