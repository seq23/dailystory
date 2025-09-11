// Global ResizeObserver Service
// Consolidates multiple ResizeObserver instances to prevent performance issues

class GlobalResizeService {
  private static instance: GlobalResizeService;
  private observers = new Map<Element, Set<(entry: ResizeObserverEntry) => void>>();
  private resizeObserver: ResizeObserver | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const callbacks = this.observers.get(entry.target);
          if (callbacks) {
            callbacks.forEach((callback) => {
              try {
                callback(entry);
              } catch (error) {
                // Silently handle callback errors to prevent cascade
              }
            });
          }
        });
      });
    }
  }

  static getInstance(): GlobalResizeService {
    if (!GlobalResizeService.instance) {
      GlobalResizeService.instance = new GlobalResizeService();
    }
    return GlobalResizeService.instance;
  }

  observe(element: Element, callback: (entry: ResizeObserverEntry) => void): () => void {
    if (!this.resizeObserver) return () => {};

    if (!this.observers.has(element)) {
      this.observers.set(element, new Set());
      this.resizeObserver.observe(element);
    }

    const callbacks = this.observers.get(element)!;
    callbacks.add(callback);

    // Return cleanup function
    return () => {
      const elementCallbacks = this.observers.get(element);
      if (elementCallbacks) {
        elementCallbacks.delete(callback);
        if (elementCallbacks.size === 0) {
          this.observers.delete(element);
          this.resizeObserver?.unobserve(element);
        }
      }
    };
  }

  // Throttle utility for performance-sensitive callbacks
  throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number = 16
  ): T {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;

    return ((...args: any[]) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  }
}

export const globalResizeService = GlobalResizeService.getInstance();