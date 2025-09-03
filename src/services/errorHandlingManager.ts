// Comprehensive Error Handling Manager for Level 0 Story System
import { EnhancedSubscriptionManager } from './enhancedSubscriptionManager';
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
   * Get creative rhyming emergency content for critical failures
   */
  static async getEmergencyContent(userInfo?: UserInfo): Promise<string[]> {
    try {
      // Set global emergency source tracking when nuclear content is used
      (globalThis as any).__LAST_STORY_SOURCE__ = 'emergency';
      (globalThis as any).__LAST_PAGE_SOURCE__ = 'emergency';
      
      const userName = userInfo?.name || 'Friend';
      
      // Rotate through 5 different rhyming templates to avoid repetition
      const rhymingTemplates = [
        [
          `Oh dear ${userName}, our story machine took a little rest,`,
          `Sometimes computers need breaks to work their very best!`,
          `Click the magic "Try Again" button that you can see,`,
          `And soon a wonderful new story there will be!`
        ],
        [
          `Whoops-a-daisy ${userName}, our story elves went to play,`,
          `They're fixing all the gears in their magical way!`,
          `Press "Try Again" when you're ready for more fun,`,
          `Your amazing adventure has only just begun!`
        ],
        [
          `Hello there ${userName}, our story box needs a snack,`,
          `Give it just a moment and it will bounce right back!`,
          `The "Try Again" button is your magical key,`,
          `To unlock the stories that are waiting to be free!`
        ],
        [
          `Oh my ${userName}, our story garden needs some rain,`,
          `Click "Try Again" and the flowers will bloom again!`,
          `Every great adventure sometimes needs a little pause,`,
          `Before the magic continues with thunderous applause!`
        ],
        [
          `Dear ${userName}, our story rocket ran out of fuel,`,
          `But don't you worry - that's just part of the rule!`,
          `Hit "Try Again" to help it soar up high,`,
          `And watch your story reach up to the sky!`
        ]
      ];
      
      // Add helpful instruction for max retries
      const maxRetryMessage = [
        `If three little tries don't make it quite right,`,
        `Don't worry, don't fret - everything's still bright!`,
        `Come back in a few minutes to try once more,`,
        `Or tell us what happened - we'd love to explore!`
      ];
      
      // Select random template and add max retry instruction
      const randomIndex = Math.floor(Math.random() * rhymingTemplates.length);
      const selectedTemplate = rhymingTemplates[randomIndex];
      
      return [...selectedTemplate, ...maxRetryMessage];
      
    } catch (error) {
      console.error('Emergency content generation failed:', error);
      
      // Final simple rhyming fallback for critical errors
      const userName = userInfo?.name || 'Friend';
      return [
        `Dear ${userName}, something went a bit wrong,`,
        `But don't you worry - we'll fix it before too long!`,
        `Try again later when our systems are ready,`,
        `Your amazing story adventure will be steady!`
      ];
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