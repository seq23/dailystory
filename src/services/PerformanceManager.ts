// Performance Manager - Centralized performance optimization utilities
import { DebugLogger } from '@/services/DebugLogger';

export class PerformanceManager {
  private static instance: PerformanceManager;
  private timers = new Set<NodeJS.Timeout>();
  private intervals = new Set<NodeJS.Timeout>();

  private constructor() {}

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  // Prevent memory leaks from timers
  setTimeout(callback: () => void, delay: number, context?: string): NodeJS.Timeout {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
    
    if (context) {
      DebugLogger.log('performance', `Timer set: ${context}`, { delay });
    }
    
    return timer;
  }

  setInterval(callback: () => void, delay: number, context?: string): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    
    if (context) {
      DebugLogger.log('performance', `Interval set: ${context}`, { delay });
    }
    
    return interval;
  }

  clearAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.intervals.forEach(interval => clearTimeout(interval));
    this.timers.clear();
    this.intervals.clear();
    DebugLogger.log('performance', 'All timers cleared');
  }

  // Debounce with requestAnimationFrame for smooth UI updates
  debounceRAF<T extends (...args: any[]) => void>(
    func: T,
    wait: number = 16
  ): T {
    let timeoutId: NodeJS.Timeout | null = null;
    let rafId: number | null = null;

    return ((...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);

      timeoutId = this.setTimeout(() => {
        rafId = requestAnimationFrame(() => {
          func(...args);
        });
      }, wait, 'debounceRAF');
    }) as T;
  }

  // Get current performance stats
  getStats(): { 
    memory: { used: number; total: number; limit: number } | null;
    timers: number;
    intervals: number;
  } {
    const memory = typeof window !== 'undefined' && (performance as any).memory ? {
      used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
    } : null;

    return {
      memory,
      timers: this.timers.size,
      intervals: this.intervals.size
    };
  }
}

export const performanceManager = PerformanceManager.getInstance();