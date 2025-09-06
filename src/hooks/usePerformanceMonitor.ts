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

  const detectForcedReflows = useCallback(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          // Detect potential forced reflow patterns
          if (entry.duration > 16) { // Frame budget exceeded
            console.warn(`⚡ Potential forced reflow: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          }
        }
        
        // Enhanced detection for layout thrashing
        if (entry.entryType === 'longtask' && entry.duration > 50) {
          console.warn(`🐌 Long task detected: ${entry.name || 'unknown'} took ${entry.duration.toFixed(2)}ms`);
        }
      }
    });
    
    // Lightweight monitoring without overriding native methods
    // This prevents the performance overhead of intercepting every getBoundingClientRect call
    let layoutCallCount = 0;
    let lastLayoutReset = Date.now();
    
    const monitorLayoutCalls = () => {
      const now = Date.now();
      if (now - lastLayoutReset > 1000) {
        if (layoutCallCount > 20) {
          console.warn(`🔄 High layout activity detected: ${layoutCallCount} operations in 1s`);
        }
        layoutCallCount = 0;
        lastLayoutReset = now;
      }
      
      layoutCallCount++;
      requestAnimationFrame(monitorLayoutCalls);
    };
    
    // Start lightweight monitoring
    requestAnimationFrame(monitorLayoutCalls);
    
    if ('PerformanceObserver' in window) {
      try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'longtask'] });
      } catch (e) {
        // Fallback for browsers with limited support
        try {
          observer.observe({ entryTypes: ['measure', 'navigation'] });
        } catch (e2) {
          console.debug('Performance observer not fully supported');
        }
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
    detectForcedReflows,
    getMemoryUsage
  };
}