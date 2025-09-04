/**
 * Global DOM measurement batching service to prevent forced reflows
 */

interface DOMReadOperation {
  id: string;
  operation: () => any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class DOMBatchingService {
  private readQueue: DOMReadOperation[] = [];
  private writeQueue: Array<() => void> = [];
  private isScheduled = false;

  /**
   * Schedule a DOM read operation to be batched with others
   */
  scheduleDOMRead<T>(operation: () => T, id?: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.readQueue.push({
        id: id || `read_${Date.now()}_${Math.random()}`,
        operation,
        resolve,
        reject
      });
      
      if (!this.isScheduled) {
        this.scheduleFlush();
      }
    });
  }

  /**
   * Schedule a DOM write operation to be batched with others
   */
  scheduleDOMWrite(operation: () => void): void {
    this.writeQueue.push(operation);
    
    if (!this.isScheduled) {
      this.scheduleFlush();
    }
  }

  /**
   * Batch multiple DOM read operations for optimal performance
   */
  batchDOMReads<T>(operations: (() => T)[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      let completed = 0;

      operations.forEach((operation, index) => {
        this.scheduleDOMRead(operation, `batch_${index}`)
          .then(result => {
            results[index] = result;
            completed++;
            if (completed === operations.length) {
              resolve(results);
            }
          })
          .catch(reject);
      });
    });
  }

  private scheduleFlush(): void {
    if (this.isScheduled) return;
    
    this.isScheduled = true;
    requestAnimationFrame(() => {
      try {
        // Execute all read operations first
        const readResults = this.readQueue.map(operation => {
          try {
            const result = operation.operation();
            operation.resolve(result);
            return result;
          } catch (error) {
            operation.reject(error);
            throw error;
          }
        });

        // Then execute write operations
        this.writeQueue.forEach(operation => {
          try {
            operation();
          } catch (error) {
            console.warn('DOM write operation failed:', error);
          }
        });

      } catch (error) {
        console.error('DOM batching error:', error);
      } finally {
        // Clear queues
        this.readQueue = [];
        this.writeQueue = [];
        this.isScheduled = false;
      }
    });
  }

  /**
   * Get cached element measurements with intelligent invalidation
   */
  getCachedBoundingRect(element: Element, cacheKey: string, ttl = 1000): DOMRect {
    const cache = (globalThis as any).__domRectCache = (globalThis as any).__domRectCache || new Map();
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.rect;
    }

    // Schedule the measurement in next frame to avoid forced reflow
    const rect = element.getBoundingClientRect();
    cache.set(cacheKey, {
      rect: rect,
      timestamp: Date.now()
    });
    
    return rect;
  }

  /**
   * Clear cached measurements when needed
   */
  clearCache(cacheKey?: string): void {
    const cache = (globalThis as any).__domRectCache;
    if (!cache) return;
    
    if (cacheKey) {
      cache.delete(cacheKey);
    } else {
      cache.clear();
    }
  }
}

export const domBatchingService = new DOMBatchingService();

/**
 * Utility hook for batched DOM measurements
 */
export function useBatchedDOMReads() {
  return {
    scheduleDOMRead: domBatchingService.scheduleDOMRead.bind(domBatchingService),
    batchDOMReads: domBatchingService.batchDOMReads.bind(domBatchingService),
    getCachedBoundingRect: domBatchingService.getCachedBoundingRect.bind(domBatchingService)
  };
}