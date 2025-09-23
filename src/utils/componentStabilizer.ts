/**
 * Component stability utilities to prevent excessive re-renders and mounting/unmounting cycles
 */
import React from 'react';

interface StabilityConfig {
  debounceDelay?: number;
  maxRerenders?: number;
  timeWindow?: number;
}

class ComponentStabilizer {
  private static instance: ComponentStabilizer;
  private renderCounts: Map<string, { count: number; lastReset: number }> = new Map();
  private debouncedCallbacks: Map<string, { timer: NodeJS.Timeout; callback: () => void }> = new Map();

  static getInstance(): ComponentStabilizer {
    if (!ComponentStabilizer.instance) {
      ComponentStabilizer.instance = new ComponentStabilizer();
    }
    return ComponentStabilizer.instance;
  }

  /**
   * Debounce a callback to prevent excessive calls
   */
  debounce<T extends (...args: any[]) => void>(
    key: string,
    callback: T,
    delay: number = 300
  ): T {
    return ((...args: any[]) => {
      const existing = this.debouncedCallbacks.get(key);
      if (existing) {
        clearTimeout(existing.timer);
      }

      const timer = setTimeout(() => {
        callback(...args);
        this.debouncedCallbacks.delete(key);
      }, delay);

      this.debouncedCallbacks.set(key, { timer, callback: () => callback(...args) });
    }) as T;
  }

  /**
   * Check if component should re-render based on render frequency
   */
  shouldRender(componentKey: string, config: StabilityConfig = {}): boolean {
    const { maxRerenders = 10, timeWindow = 5000 } = config;
    const now = Date.now();
    
    const renderData = this.renderCounts.get(componentKey);
    
    if (!renderData) {
      this.renderCounts.set(componentKey, { count: 1, lastReset: now });
      return true;
    }

    // Reset counter if time window has passed
    if (now - renderData.lastReset > timeWindow) {
      this.renderCounts.set(componentKey, { count: 1, lastReset: now });
      return true;
    }

    // Increment render count
    renderData.count++;

    // Block rendering if exceeded max rerenders in time window
    if (renderData.count > maxRerenders) {
      console.warn(`Component ${componentKey} blocked due to excessive rerenders (${renderData.count})`);
      return false;
    }

    return true;
  }

  /**
   * Clear all stability data for a component (useful for cleanup)
   */
  clearComponent(componentKey: string): void {
    this.renderCounts.delete(componentKey);
    const debounced = this.debouncedCallbacks.get(componentKey);
    if (debounced) {
      clearTimeout(debounced.timer);
      this.debouncedCallbacks.delete(componentKey);
    }
  }

  /**
   * Get stability stats for debugging
   */
  getStats(): { renderCounts: Map<string, { count: number; lastReset: number }>; activeDebouncers: string[] } {
    return {
      renderCounts: new Map(this.renderCounts),
      activeDebouncers: Array.from(this.debouncedCallbacks.keys())
    };
  }

  /**
   * Clear all stability data
   */
  clearAll(): void {
    this.renderCounts.clear();
    this.debouncedCallbacks.forEach(({ timer }) => clearTimeout(timer));
    this.debouncedCallbacks.clear();
  }
}

export const componentStabilizer = ComponentStabilizer.getInstance();

/**
 * Hook for stable component rendering
 */
export function useStableRender(componentKey: string, config?: StabilityConfig): boolean {
  return componentStabilizer.shouldRender(componentKey, config);
}

/**
 * Hook for debounced callbacks
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 300,
  deps: any[] = []
): T {
  const key = `callback-${Math.random().toString(36).substr(2, 9)}`;
  
  React.useEffect(() => {
    return () => componentStabilizer.clearComponent(key);
  }, []);

  return React.useMemo(() => 
    componentStabilizer.debounce(key, callback, delay),
    [callback, delay, ...deps]
  );
}