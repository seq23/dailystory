import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionDelay: number;
}

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
      
      if (renderTime > 16) { // Longer than one frame (60fps)
        console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
      
      return renderTime;
    };
  }, []);

  const measureInteraction = useCallback((interactionName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) { // Interaction should feel instant
        console.warn(`🐌 Slow interaction: ${interactionName} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
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
    // Report Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with Core Web Vitals library if needed
      console.log('📊 Performance monitoring active');
    }
  }, []);

  return {
    measureLoadTime,
    measureRenderTime,
    measureInteraction,
    getMemoryUsage
  };
}