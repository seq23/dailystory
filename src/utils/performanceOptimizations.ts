/**
 * Performance optimization utilities to prevent forced reflows and improve rendering performance
 */

import { DebugLogger } from '@/services/DebugLogger';

/**
 * Batches DOM reads to minimize reflows
 */
export const batchDOMReads = <T>(readOperations: (() => T)[]): T[] => {
  const results: T[] = [];
  
  // Schedule all reads in a single animation frame to batch them
  return new Promise<T[]>((resolve) => {
    requestAnimationFrame(() => {
      for (const operation of readOperations) {
        results.push(operation());
      }
      resolve(results);
    });
  }) as any; // Type assertion for synchronous usage pattern
};

/**
 * Debounces a function with requestAnimationFrame for smooth performance
 */
export const debounceRAF = (fn: Function, delay: number = 16) => {
  let timeoutId: NodeJS.Timeout;
  let frameId: number;
  
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    cancelAnimationFrame(frameId);
    
    timeoutId = setTimeout(() => {
      frameId = requestAnimationFrame(() => fn.apply(null, args));
    }, delay);
  };
};

/**
 * Caches DOM measurements to avoid repeated calculations
 */
export class DOMCache {
  private cache = new Map<string, { value: any; timestamp: number }>();
  private readonly TTL = 1000; // Cache for 1 second
  
  get<T>(key: string, getter: () => T): T {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.TTL) {
      return cached.value;
    }
    
    const value = getter();
    this.cache.set(key, { value, timestamp: now });
    return value;
  }
  
  invalidate(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

/**
 * Optimized ResizeObserver wrapper that debounces callbacks
 */
export class OptimizedResizeObserver {
  private callbacks = new Map<Element, Function>();
  
  constructor(debounceMs: number = 16) {
    // Use globalResizeService instead of creating new ResizeObserver
    import('@/services/GlobalResizeService').then(({ globalResizeService }) => {
      this.globalResizeService = globalResizeService;
    });
  }
  
  private globalResizeService: any;
  
  observe(element: Element, callback: (entry: ResizeObserverEntry) => void) {
    if (!this.globalResizeService) {
      DebugLogger.warn('performance', 'GlobalResizeService not loaded yet');
      return;
    }
    
    const cleanup = this.globalResizeService.observe(element, callback);
    this.callbacks.set(element, cleanup);
  }
  
  unobserve(element: Element) {
    const cleanup = this.callbacks.get(element);
    if (cleanup && typeof cleanup === 'function') {
      cleanup();
    }
    this.callbacks.delete(element);
  }
  
  disconnect() {
    // Cleanup all observations
    for (const cleanup of this.callbacks.values()) {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    }
    this.callbacks.clear();
  }
}

// Global DOM cache instance
export const globalDOMCache = new DOMCache();