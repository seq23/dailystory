/**
 * LEAN PERFORMANCE OPTIMIZER
 * Simple optimizations for common bottlenecks
 */

import { LeanCache } from './LeanCache';

class PerformanceOptimizer {
  // Replace heavy regex with simple string operations
  static fastStringCheck(text: string, patterns: string[]): boolean {
    if (!text || typeof text !== 'string') return false;
    
    const normalized = text.toLowerCase();
    return patterns.some(pattern => normalized.includes(pattern.toLowerCase()));
  }

  // Debounce function calls to prevent spam
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }

  // Throttle function calls
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Lazy load components - simplified for lean approach
  static createLazyLoader<T>(
    loader: () => Promise<{ default: T }>
  ) {
    // Return the loader function directly - React.lazy handles the rest
    return loader;
  }

  // Batch API requests
  static batchRequests<T>(
    requests: Array<() => Promise<T>>,
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    
    return requests.reduce((promise, request, index) => {
      return promise.then(async () => {
        if (index % batchSize === 0) {
          // Process batch
          const batch = requests.slice(index, index + batchSize);
          const batchResults = await Promise.all(batch.map(req => req()));
          results.push(...batchResults);
          
          // Small delay between batches to prevent overload
          if (index + batchSize < requests.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        return results;
      });
    }, Promise.resolve([]));
  }

  // Memory optimization for large lists
  static createVirtualScroll(
    items: any[],
    itemHeight: number,
    containerHeight: number,
    startIndex: number = 0
  ) {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const buffer = Math.ceil(visibleCount * 0.5); // 50% buffer
    
    const start = Math.max(0, startIndex - buffer);
    const end = Math.min(items.length, startIndex + visibleCount + buffer);
    
    return {
      visibleItems: items.slice(start, end),
      startIndex: start,
      endIndex: end,
      totalHeight: items.length * itemHeight,
      offsetY: start * itemHeight
    };
  }

  // Connection health monitoring
  static monitorConnection() {
    const nav = navigator as any;
    return {
      isOnline: navigator.onLine,
      effectiveType: nav.connection?.effectiveType || 'unknown',
      rtt: nav.connection?.rtt || 0
    };
  }
}

export { PerformanceOptimizer };