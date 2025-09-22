import { useEffect, useCallback } from 'react';
import { DebugLogger } from '@/services/DebugLogger';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionDelay: number;
}

// Check if performance debugging is enabled
const isPerformanceDebugEnabled = () => {
  return typeof window !== 'undefined' && (
    window.location.search.includes('debug=performance') ||
    process.env.NODE_ENV === 'development' && window.location.search.includes('perf=true')
  );
};

export function usePerformanceMonitor() {
  const measureLoadTime = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation?.loadEventEnd - navigation?.fetchStart || 0;
    }
    return 0;
  }, []);

  const measureRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Only log CRITICAL render issues (>100ms) and only in debug mode
      if (renderTime > 100 && isPerformanceDebugEnabled()) {
        DebugLogger.error('performance', `🚨 CRITICAL: Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
      
      return renderTime;
    };
  }, []);

  const measureInteraction = useCallback((interactionName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Only log CRITICAL interaction issues (>300ms) and only in debug mode
      if (duration > 300 && isPerformanceDebugEnabled()) {
        DebugLogger.error('performance', `🚨 CRITICAL: Slow interaction: ${interactionName} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    };
  }, []);

  const detectForcedReflows = useCallback(() => {
    // Only enable performance monitoring in debug mode
    if (!isPerformanceDebugEnabled()) {
      return () => {}; // Return noop cleanup function
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only log CRITICAL performance issues (>100ms) 
        if (entry.entryType === 'longtask' && entry.duration > 100) {
          DebugLogger.error('performance', `🚨 CRITICAL: Long blocking task: ${entry.name || 'unknown'} took ${entry.duration.toFixed(2)}ms`);
        }
      }
    });
    
    if ('PerformanceObserver' in window) {
      try {
        observer.observe({ entryTypes: ['longtask'] }); // Only monitor truly blocking tasks
      } catch (e) {
        // Observer not supported
      }
    }
    
    return () => {
      try {
        observer.disconnect();
      } catch (e) {
        // Observer already disconnected
      }
    };
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }, []);

  useEffect(() => {
    // Only log in debug mode
    if (isPerformanceDebugEnabled()) {
      DebugLogger.log('performance', 'Performance monitoring active (debug mode)');
    }
  }, []);

  return {
    measureLoadTime,
    measureRenderTime,
    measureInteraction,
    detectForcedReflows,
    getMemoryUsage
  };
}