/**
 * ImageLoadingManager - Singleton service to prevent duplicate image loading
 * Deduplicates simultaneous loading requests for the same URL
 */

import { DebugLogger } from '@/services/DebugLogger';

interface LoadingRequest {
  promise: Promise<boolean>;
  callbacks: Array<(success: boolean, url?: string) => void>;
  startTime: number;
}

class ImageLoadingManagerClass {
  private static instance: ImageLoadingManagerClass;
  private activeLoads = new Map<string, LoadingRequest>();
  private recentFailures = new Map<string, number>();
  private globalFailureCount = 0;
  private cascadeFailureCount = 0;
  
  // Circuit breaker: stop retrying after consecutive failures from same domain
  private readonly FAILURE_THRESHOLD = 5;
  private readonly FAILURE_WINDOW = 30000; // 30 seconds
  private readonly FAST_FAIL_TIMEOUT = 15000; // 15 seconds for debug mode
  private readonly CASCADE_FAILURE_THRESHOLD = 10; // Stop after 10 cascade failures
  
  static getInstance(): ImageLoadingManagerClass {
    if (!ImageLoadingManagerClass.instance) {
      ImageLoadingManagerClass.instance = new ImageLoadingManagerClass();
    }
    return ImageLoadingManagerClass.instance;
  }

  /**
   * Load an image with session-aware deduplication and circuit breaker logic
   */
  async loadImage(
    url: string, 
    options: { 
      timeout?: number; 
      isDebugMode?: boolean;
      onProgress?: (stage: string) => void;
      sessionId?: string; // NEW: Session context for proper isolation
    } = {}
  ): Promise<boolean> {
    if (!url) return false;

    const { timeout = 10000, isDebugMode = false, sessionId } = options;
    const effectiveTimeout = Math.max(isDebugMode ? this.FAST_FAIL_TIMEOUT : timeout, 12000); // Min 12 seconds
    
    // Check cascade failure circuit breaker
    if (this.cascadeFailureCount >= this.CASCADE_FAILURE_THRESHOLD) {
      DebugLogger.warn('image', `Cascade failure circuit breaker: Stopping image loading (${this.cascadeFailureCount} failures)`);
      return false;
    }
    
    // Check circuit breaker
    if (this.shouldCircuitBreak(url)) {
      DebugLogger.warn('image', `Circuit breaker: Skipping load for ${url} (too many recent failures)`);
      return false;
    }

    // CRITICAL FIX: Create session-aware deduplication key
    const deduplicationKey = sessionId ? `${url}#session:${sessionId}` : url;
    
    // Check if already loading this URL in this session
    const existing = this.activeLoads.get(deduplicationKey);
    if (existing) {
      if (sessionId) {
        DebugLogger.log('image', `Session-aware deduplication: Reusing existing load for ${url} in session ${sessionId}`);
      } else {
        DebugLogger.log('image', `Global deduplication: Reusing existing load for ${url}`);
      }
      return existing.promise;
    }

    // Start new load
    const promise = this.performLoad(url, effectiveTimeout, options.onProgress);
    const request: LoadingRequest = {
      promise,
      callbacks: [],
      startTime: Date.now()
    };

    this.activeLoads.set(deduplicationKey, request);

    try {
      const result = await promise;
      if (!result) {
        this.recordFailure(url);
        this.cascadeFailureCount++;
      } else {
        // Reset cascade failure count on successful load
        this.cascadeFailureCount = Math.max(0, this.cascadeFailureCount - 1);
      }
      return result;
    } finally {
      this.activeLoads.delete(deduplicationKey);
    }
  }

  private async performLoad(url: string, timeout: number, onProgress?: (stage: string) => void): Promise<boolean> {
    // Handle data URLs and blob URLs directly
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      onProgress?.('Direct URL - no validation needed');
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const img = new Image();
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          img.onload = null;
          img.onerror = null;
        }
      };

      // Timeout for slow loading images
      const timeoutId = setTimeout(() => {
        cleanup();
        onProgress?.('Timeout reached');
        resolve(false);
      }, timeout);

      img.onload = () => {
        cleanup();
        clearTimeout(timeoutId);
        onProgress?.('Load successful');
        resolve(true);
      };

      img.onerror = (e) => {
        cleanup();
        clearTimeout(timeoutId);
        onProgress?.('Load failed');
        resolve(false);
      };

      onProgress?.('Starting image preload');
      img.src = url;
    });
  }

  private shouldCircuitBreak(url: string): boolean {
    const domain = this.extractDomain(url);
    const recentFailures = this.recentFailures.get(domain) || 0;
    const timeSinceLastFailure = Date.now() - (this.recentFailures.get(`${domain}_time`) || 0);
    
    // Reset if enough time has passed
    if (timeSinceLastFailure > this.FAILURE_WINDOW) {
      this.recentFailures.delete(domain);
      this.recentFailures.delete(`${domain}_time`);
      return false;
    }

    return recentFailures >= this.FAILURE_THRESHOLD;
  }

  private recordFailure(url: string): void {
    const domain = this.extractDomain(url);
    const current = this.recentFailures.get(domain) || 0;
    this.recentFailures.set(domain, current + 1);
    this.recentFailures.set(`${domain}_time`, Date.now());
    this.globalFailureCount++;

    DebugLogger.warn('image', `Image failure recorded for ${domain}: ${current + 1} recent failures`);
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get loading statistics for debugging
   */
  getStats() {
    return {
      activeLoads: this.activeLoads.size,
      recentFailures: Array.from(this.recentFailures.entries()).filter(([key]) => !key.endsWith('_time')),
      globalFailures: this.globalFailureCount
    };
  }

  /**
   * Clear all caches (for session end)
   */
  clearAll(): void {
    this.activeLoads.clear();
    this.recentFailures.clear();
    this.globalFailureCount = 0;
    this.cascadeFailureCount = 0;
    DebugLogger.log('performance', 'ImageLoadingManager: All caches cleared');
  }
}

export const ImageLoadingManager = ImageLoadingManagerClass.getInstance();