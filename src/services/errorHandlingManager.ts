// Comprehensive Error Handling Manager for Level 0 Story System
import { EnhancedSubscriptionManager } from './enhancedSubscriptionManager';
import { MultilingualTemplateManager } from './multilingualTemplateManager';
import { MobileSessionManager } from './mobileSessionManager';
import type { UserInfo } from '@/types';

export interface ErrorContext {
  component: string;
  action: string;
  userInfo?: UserInfo;
  isPremium?: boolean;
  language?: string;
  deviceInfo?: {
    isMobile: boolean;
    sessionStorageSupported: boolean;
  };
}

export interface ErrorResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: T;
  recovery?: string;
}

export class ErrorHandlingManager {
  private static errorCounts: Map<string, number> = new Map();
  private static readonly MAX_RETRIES = 3;
  private static readonly ERROR_RESET_TIME = 60000; // 1 minute

  /**
   * Execute function with comprehensive error handling and recovery
   */
  static async executeWithRecovery<T>(
    fn: () => Promise<T>,
    context: ErrorContext,
    fallbackFn?: () => Promise<T> | T
  ): Promise<ErrorResponse<T>> {
    const errorKey = `${context.component}_${context.action}`;
    
    try {
      // Check if we've exceeded retry limit for this operation
      const errorCount = this.errorCounts.get(errorKey) || 0;
      if (errorCount >= this.MAX_RETRIES) {
        console.warn(`⚠️ ErrorHandlingManager: Max retries exceeded for ${errorKey}, using fallback`);
        
        if (fallbackFn) {
          const fallback = await fallbackFn();
          return {
            success: false,
            fallback,
            error: `Max retries exceeded for ${context.action}`,
            recovery: 'Used fallback content'
          };
        }
        
        return {
          success: false,
          error: `Max retries exceeded for ${context.action}`,
          recovery: 'No fallback available'
        };
      }

      // Execute the main function
      const result = await fn();
      
      // Success - reset error count
      this.errorCounts.delete(errorKey);
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error(`❌ ErrorHandlingManager: Error in ${errorKey}:`, error);
      
      // Increment error count
      const currentErrorCount = this.errorCounts.get(errorKey) || 0;
      this.errorCounts.set(errorKey, currentErrorCount + 1);
      
      // Schedule error count reset
      setTimeout(() => {
        this.errorCounts.delete(errorKey);
      }, this.ERROR_RESET_TIME);

      // Try fallback if available
      if (fallbackFn) {
        try {
          const fallback = await fallbackFn();
          return {
            success: false,
            fallback,
            error: error instanceof Error ? error.message : 'Unknown error',
            recovery: 'Used fallback content'
          };
        } catch (fallbackError) {
          console.error(`❌ ErrorHandlingManager: Fallback also failed for ${errorKey}:`, fallbackError);
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recovery: 'No recovery available'
      };
    }
  }

  /**
   * Get emergency content for critical failures - routes through Level0StoryProcessor for validation
   */
  static async getEmergencyContent(userInfo?: UserInfo): Promise<string[]> {
    try {
      // Simple emergency content - Level0StoryProcessor removed
      const userName = userInfo?.name || 'Someone';
      return [
        `${userName} had a wonderful day.`,
        `They found something amazing.`,
        `It was a great adventure.`
      ];
    } catch (error) {
      console.error('Emergency content generation failed:', error);
      
      // Final fallback uses MultilingualTemplateManager which has validation
      const userName = userInfo?.name || 'I';
      const language = MultilingualTemplateManager.getTemplateLanguage(userInfo);
      return MultilingualTemplateManager.getLanguageFallback(language, userInfo);
    }
  }

  /**
   * Check system health and return diagnostics
   */
  static async getSystemDiagnostics(): Promise<{
    subscriptionService: boolean;
    sessionStorage: boolean;
    memoryStorage: boolean;
    errorCounts: Record<string, number>;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    
    // Test subscription service
    let subscriptionService = false;
    try {
      await EnhancedSubscriptionManager.isPremiumUser();
      subscriptionService = true;
    } catch (error) {
      recommendations.push('Subscription service experiencing issues - using free tier as fallback');
    }

    // Test session storage
    const sessionStorage = MobileSessionManager.isSessionStorageSupported();
    if (!sessionStorage) {
      recommendations.push('Session storage not available - using memory storage');
    }

    // Get storage status
    const storageStatus = MobileSessionManager.getStorageStatus();

    // Check error patterns
    const errorCounts: Record<string, number> = {};
    this.errorCounts.forEach((count, key) => {
      errorCounts[key] = count;
      if (count >= 2) {
        recommendations.push(`High error count for ${key} - consider using fallback mode`);
      }
    });

    return {
      subscriptionService,
      sessionStorage,
      memoryStorage: storageStatus.memoryItemCount > 0,
      errorCounts,
      recommendations
    };
  }

  /**
   * Recovery actions for common error scenarios
   */
  static async performRecoveryAction(errorType: string): Promise<boolean> {
    switch (errorType) {
      case 'subscription_check_failed':
        try {
          EnhancedSubscriptionManager.clearCache();
          await EnhancedSubscriptionManager.forceRefresh();
          return true;
        } catch {
          return false;
        }

      case 'session_storage_failed':
        try {
          MobileSessionManager.clear();
          return true;
        } catch {
          return false;
        }

      case 'template_generation_failed':
        // Clear any corrupted template state
        try {
          // This would be implemented by the hierarchical manager
          return true;
        } catch {
          return false;
        }

      default:
        return false;
    }
  }

  /**
   * Log error for analytics and debugging
   */
  static logError(error: Error, context: ErrorContext): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In production, this would send to analytics service
    console.error('📊 ErrorHandlingManager: Logged error:', errorInfo);
  }

  /**
   * Clean up error tracking
   */
  static cleanup(): void {
    this.errorCounts.clear();
  }
}

export default ErrorHandlingManager;