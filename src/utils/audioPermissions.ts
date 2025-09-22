/**
 * Centralized audio permissions and validation utilities
 * Manages premium status, voice command state, and network availability checks
 */
import { DebugLogger } from '@/services/DebugLogger';

export interface AudioPermissionContext {
  isPremium: boolean;
  vcStatus: 'idle' | 'listening' | 'processing';
  isNetworkAvailable: boolean;
  networkQuality: 'good' | 'poor' | 'offline';
  lastNetworkCheck: number;
}

interface QueuedRequest {
  id: string;
  timestamp: number;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

export class AudioPermissions {
  private static currentContext: AudioPermissionContext = {
    isPremium: false,
    vcStatus: 'idle',
    isNetworkAvailable: navigator.onLine,
    networkQuality: navigator.onLine ? 'good' : 'offline',
    lastNetworkCheck: Date.now()
  };
  
  private static requestQueue: QueuedRequest[] = [];
  private static isCheckingNetwork = false;

  /**
   * Update the current permission context
   */
  static updateContext(updates: Partial<AudioPermissionContext>): void {
    this.currentContext = { ...this.currentContext, ...updates, lastNetworkCheck: Date.now() };
    
    // Process queued requests if network is back online
    if (updates.isNetworkAvailable && this.requestQueue.length > 0) {
      this.processQueuedRequests();
    }
  }

  /**
   * Real-time network quality check with timeout
   */
  static async checkNetworkQuality(): Promise<'good' | 'poor' | 'offline'> {
    if (this.isCheckingNetwork) return this.currentContext.networkQuality;
    
    this.isCheckingNetwork = true;
    
    try {
      // Try multiple network quality checks with fallback approach
      const timeout = (ms: number) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), ms)
      );

      // Try internal health check first (Supabase system diagnostics)
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const healthResponse = await Promise.race([
          supabase.functions.invoke('system-diagnostics', { 
            body: { healthCheck: true } 
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800))
        ]);
        
        if ((healthResponse as any)?.data && !(healthResponse as any)?.error) {
          DebugLogger.log('network', 'Network quality check successful: internal health endpoint');
          this.updateContext({ isNetworkAvailable: true, networkQuality: 'good' });
          return 'good';
        }
      } catch (error) {
        DebugLogger.warn('network', 'Internal health check failed, trying fallback');
      }

      // Try lightweight origin check (no external CORS)
      try {
        await Promise.race([
          fetch(window.location.origin + '/favicon.ico', { method: 'HEAD', cache: 'no-store' }),
          timeout(1500)
        ]);
        DebugLogger.log('network', 'Network quality check successful: favicon');
        this.updateContext({ 
          isNetworkAvailable: true, 
          networkQuality: 'good' 
        });
        return 'good';
      } catch {}

      // Final fallback - assume poor connection
      DebugLogger.warn('network', 'All network quality checks failed, assuming poor connection');
      this.updateContext({ 
        isNetworkAvailable: false, 
        networkQuality: 'offline' 
      });
      return 'offline';
      
    } catch (error) {
      DebugLogger.warn('network', 'Network quality check error', error);
      this.updateContext({ 
        isNetworkAvailable: false, 
        networkQuality: 'offline' 
      });
      return 'offline';
    } finally {
      this.isCheckingNetwork = false;
    }
  }

  /**
   * Queue request during network outages
   */
  static queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        resolve: async () => {
          try {
            const result = await requestFn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        reject
      };
      
      this.requestQueue.push(request);
      
      // Auto-cleanup after 10 seconds
      setTimeout(() => {
        this.removeFromQueue(request.id);
        reject(new Error('Request timeout - network unavailable'));
      }, 10000);
    });
  }

  /**
   * Process queued requests when network returns
   */
  private static async processQueuedRequests(): Promise<void> {
    const requests = [...this.requestQueue];
    this.requestQueue = [];
    
    for (const request of requests) {
      try {
        request.resolve(undefined);
      } catch (error) {
        request.reject(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }

  /**
   * Remove request from queue
   */
  private static removeFromQueue(id: string): void {
    this.requestQueue = this.requestQueue.filter(req => req.id !== id);
  }

  /**
   * Check if voice hover actions are allowed
   */
  static canUseVoiceHover(): boolean {
    const { isPremium, vcStatus, isNetworkAvailable } = this.currentContext;
    DebugLogger.log('network', 'Voice hover permission check', { isPremium, vcStatus, isNetworkAvailable });
    
    // Allow voice hover for all users regardless of voice command status
    // This enables basic word interaction features (hear, explain, syllables) for everyone
    return isNetworkAvailable;
  }

  /**
   * Check if premium audio features are allowed
   */
  static canUsePremiumAudio(): boolean {
    return this.currentContext.isPremium;
  }

  /**
   * Check if any audio can be played
   */
  static canPlayAudio(): boolean {
    return this.currentContext.isNetworkAvailable;
  }

  /**
   * Get current permission context
   */
  static getContext(): AudioPermissionContext {
    return { ...this.currentContext };
  }

  /**
   * Get reason why action is blocked (for debugging)
   */
  static getBlockReason(action: 'voice-hover' | 'premium-audio' | 'any-audio'): string | null {
    const { isPremium, vcStatus, isNetworkAvailable } = this.currentContext;

    if (!isNetworkAvailable) return 'No network connection';
    
    switch (action) {
      case 'voice-hover':
        // Voice hover now works for all users - no restriction
        return null;
      case 'premium-audio':
        if (!isPremium) return 'Premium subscription required';
        return null;
      case 'any-audio':
        return null;
      default:
        return 'Unknown action';
    }
  }
}

// Enhanced network event listeners with quality detection
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    // Quick network quality check when coming back online
    const quality = await AudioPermissions.checkNetworkQuality();
    AudioPermissions.updateContext({ 
      isNetworkAvailable: true,
      networkQuality: quality
    });
  });
  
  window.addEventListener('offline', () => {
    AudioPermissions.updateContext({ 
      isNetworkAvailable: false,
      networkQuality: 'offline'
    });
  });

  // Periodic network quality monitoring (every 30 seconds)
  setInterval(async () => {
    if (navigator.onLine) {
      await AudioPermissions.checkNetworkQuality();
    }
  }, 30000);
}