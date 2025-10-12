// Resilient Runware WebSocket - Phase 4: WebSocket Stability Enhancement
// Wraps RunwareWebSocketService with auto-reconnect, retry logic, and enhanced error recovery

import { RunwareWebSocketService } from './RunwareWebSocketService.ts';
import type { GenerateImageParams, ImageGenerationResult } from './RunwareWebSocketService.ts';

interface ConnectionAttempt {
  attempt: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface ResilientConfig {
  maxConnectAttempts?: number;
  maxGenerateRetries?: number;
  connectTimeoutMs?: number;
  generateTimeoutMs?: number;
  retryDelayMs?: number;
}

class ResilientRunwareWebSocket {
  private static connectionHistory: ConnectionAttempt[] = [];
  private static lastSuccessfulConnection: number = 0;
  
  private static readonly DEFAULT_CONFIG: Required<ResilientConfig> = {
    maxConnectAttempts: 3,
    maxGenerateRetries: 2,
    connectTimeoutMs: 10000,
    generateTimeoutMs: 25000, // Increased from 20s to 25s
    retryDelayMs: 2000,
  };
  
  /**
   * Test WebSocket connection with retry logic
   */
  static async testConnectionWithRetry(
    apiKey: string,
    config: ResilientConfig = {}
  ): Promise<{ success: boolean; attempts: number; error?: string }> {
    const cfg = { ...this.DEFAULT_CONFIG, ...config };
    let lastError: string = '';
    
    for (let attempt = 1; attempt <= cfg.maxConnectAttempts; attempt++) {
      try {
        console.log(`🔌 [RESILIENT_WS] Connection test attempt ${attempt}/${cfg.maxConnectAttempts}`);
        
        const startTime = Date.now();
        const result = await RunwareWebSocketService.testConnection(apiKey, cfg.connectTimeoutMs);
        const duration = Date.now() - startTime;
        
        // Record attempt
        this.connectionHistory.push({
          attempt,
          timestamp: Date.now(),
          success: result.success,
          error: result.error,
        });
        
        // Limit history to last 20 attempts
        if (this.connectionHistory.length > 20) {
          this.connectionHistory = this.connectionHistory.slice(-20);
        }
        
        if (result.success) {
          this.lastSuccessfulConnection = Date.now();
          console.log(`✅ [RESILIENT_WS] Connection successful (attempt ${attempt}, ${duration}ms)`);
          return { success: true, attempts: attempt };
        }
        
        lastError = result.error || 'Unknown connection error';
        console.warn(`⚠️ [RESILIENT_WS] Connection attempt ${attempt} failed:`, lastError);
        
        // Apply exponential backoff before retry
        if (attempt < cfg.maxConnectAttempts) {
          const backoff = Math.min(cfg.retryDelayMs * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ [RESILIENT_WS] Waiting ${backoff}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.error(`❌ [RESILIENT_WS] Connection test error (attempt ${attempt}):`, lastError);
        
        this.connectionHistory.push({
          attempt,
          timestamp: Date.now(),
          success: false,
          error: lastError,
        });
        
        // Apply backoff before retry
        if (attempt < cfg.maxConnectAttempts) {
          const backoff = Math.min(cfg.retryDelayMs * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
    }
    
    console.error(`❌ [RESILIENT_WS] All connection attempts failed (${cfg.maxConnectAttempts} attempts)`);
    return { 
      success: false, 
      attempts: cfg.maxConnectAttempts, 
      error: lastError 
    };
  }
  
  /**
   * Generate image with automatic retry on WebSocket failures
   */
  static async generateImageWithRetry(
    params: GenerateImageParams,
    config: ResilientConfig = {}
  ): Promise<ImageGenerationResult> {
    const cfg = { ...this.DEFAULT_CONFIG, ...config };
    let lastError: Error;
    
    // Override timeout with resilient config
    const enhancedParams = {
      ...params,
      timeout: cfg.generateTimeoutMs,
    };
    
    for (let attempt = 1; attempt <= cfg.maxGenerateRetries; attempt++) {
      try {
        console.log(`🎨 [RESILIENT_WS] Image generation attempt ${attempt}/${cfg.maxGenerateRetries}`);
        
        const startTime = Date.now();
        const result = await RunwareWebSocketService.generateImage(enhancedParams);
        const duration = Date.now() - startTime;
        
        console.log(`✅ [RESILIENT_WS] Image generated successfully (attempt ${attempt}, ${duration}ms)`);
        
        // Track successful generation
        this.lastSuccessfulConnection = Date.now();
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        const errorMessage = lastError.message || String(error);
        
        console.error(
          `❌ [RESILIENT_WS] Generation attempt ${attempt} failed:`,
          errorMessage
        );
        
        // Classify error type
        const isWebSocketError = this.isWebSocketError(lastError);
        const isTransientError = this.isTransientError(lastError);
        
        console.log(`🔍 [RESILIENT_WS] Error classification:`, {
          isWebSocketError,
          isTransientError,
          errorType: (lastError as any).type,
          nextAction: (lastError as any).nextAction,
        });
        
        // Don't retry on non-retryable errors
        if (!isTransientError && !isWebSocketError) {
          console.warn(`⚠️ [RESILIENT_WS] Non-retryable error detected, failing fast`);
          throw lastError;
        }
        
        // Last attempt - throw error
        if (attempt >= cfg.maxGenerateRetries) {
          console.error(
            `❌ [RESILIENT_WS] All generation attempts exhausted (${cfg.maxGenerateRetries} attempts)`
          );
          throw lastError;
        }
        
        // Apply backoff before retry (only for WebSocket errors)
        if (isWebSocketError || isTransientError) {
          const backoff = cfg.retryDelayMs * Math.pow(2, attempt - 1);
          console.log(`⏳ [RESILIENT_WS] WebSocket error detected, waiting ${backoff}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
        } else {
          // Shorter delay for non-WebSocket errors
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError!;
  }
  
  /**
   * Check if error is WebSocket-related
   */
  private static isWebSocketError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    const type = error?.type?.toLowerCase() || '';
    
    const wsPatterns = [
      'websocket',
      'ws closed',
      'connection',
      'abnormal closure',
      'network error',
      'socket',
    ];
    
    return wsPatterns.some(
      pattern => message.includes(pattern) || type.includes(pattern)
    );
  }
  
  /**
   * Check if error is transient (worth retrying)
   */
  private static isTransientError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    const type = error?.type?.toLowerCase() || '';
    const nextAction = error?.nextAction || '';
    
    // Transient error patterns
    const transientPatterns = [
      'timeout',
      'aborted',
      'network',
      'connection',
      'econnrefused',
      'etimedout',
      'fetch failed',
    ];
    
    // Check if error suggests retry
    const shouldRetry = nextAction.includes('RETRY') || 
                       transientPatterns.some(p => message.includes(p) || type.includes(p));
    
    return shouldRetry;
  }
  
  /**
   * Get connection health statistics
   */
  static getHealthStats(): {
    recentAttempts: number;
    successRate: number;
    lastSuccessAgo: number;
    recentFailures: number;
    connectionHistory: ConnectionAttempt[];
  } {
    const now = Date.now();
    const recentWindow = 5 * 60 * 1000; // Last 5 minutes
    
    const recentAttempts = this.connectionHistory.filter(
      a => now - a.timestamp < recentWindow
    );
    
    const successCount = recentAttempts.filter(a => a.success).length;
    const failureCount = recentAttempts.filter(a => !a.success).length;
    
    const successRate = recentAttempts.length > 0
      ? successCount / recentAttempts.length
      : 0;
    
    const lastSuccessAgo = this.lastSuccessfulConnection > 0
      ? now - this.lastSuccessfulConnection
      : -1;
    
    return {
      recentAttempts: recentAttempts.length,
      successRate,
      lastSuccessAgo,
      recentFailures: failureCount,
      connectionHistory: this.connectionHistory.slice(-10), // Last 10 attempts
    };
  }
  
  /**
   * Reset connection history (useful for testing or after maintenance)
   */
  static resetHistory(): void {
    this.connectionHistory = [];
    this.lastSuccessfulConnection = 0;
    console.log('🔄 [RESILIENT_WS] Connection history reset');
  }
}

// Export for use in edge functions
export { ResilientRunwareWebSocket };
export type { ResilientConfig };
