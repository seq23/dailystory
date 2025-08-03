// Enhanced Session Management for Cross-Session Anti-Repetition
import { UserInfo, DifficultyLevel } from "@/types";
import { LanguagePreferenceService } from "./languagePreferenceService";
import { FreeUserStoryService } from "./freeUserStoryService";
import { PremiumStoryService } from "./premiumStoryService";

export interface SessionLimits {
  freeUserLimit: 100;
  premiumUserLimit: -1; // Unlimited
}

export class EnhancedSessionManager {
  
  private static readonly SESSION_LIMITS: SessionLimits = {
    freeUserLimit: 100,
    premiumUserLimit: -1
  };

  /**
   * Check if user can generate a new story based on their subscription status
   */
  static async canGenerateNewStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    isPremium: boolean,
    translationContext?: any
  ): Promise<{
    canGenerate: boolean;
    reason?: string;
    sessionInfo: {
      sessionNumber: number;
      remainingSessions: number;
      isUnlimited: boolean;
    };
  }> {
    
    if (isPremium) {
      // Premium users have unlimited stories
      return {
        canGenerate: true,
        sessionInfo: {
          sessionNumber: 1,
          remainingSessions: -1,
          isUnlimited: true
        }
      };
    }

    // Free users - check against 100 story limit
    try {
      const sessionCheck = await FreeUserStoryService.checkSessionUniqueness(
        userInfo,
        difficulty,
        translationContext || { originalInputs: {}, translatedInputs: {} }
      );

      if (!sessionCheck.canGenerate) {
        return {
          canGenerate: false,
          reason: sessionCheck.sessionInfo.remainingSessions === 0 
            ? "You've reached the 100 free story limit. Upgrade to premium for unlimited stories!"
            : "This story is too similar to a previous one. Try different characters or settings!",
          sessionInfo: {
            ...sessionCheck.sessionInfo,
            isUnlimited: false
          }
        };
      }

      return {
        canGenerate: true,
        sessionInfo: {
          ...sessionCheck.sessionInfo,
          isUnlimited: false
        }
      };

    } catch (error) {
      console.error('Error checking session limits:', error);
      // Fallback - allow generation but with conservative limits
      return {
        canGenerate: true,
        sessionInfo: {
          sessionNumber: 1,
          remainingSessions: 99,
          isUnlimited: false
        }
      };
    }
  }

  /**
   * Check if user can add pages to existing story
   */
  static async canAddPages(
    userInfo: UserInfo,
    isPremium: boolean,
    currentStory: any
  ): Promise<{
    canAddPages: boolean;
    reason?: string;
  }> {
    
    if (isPremium) {
      // Premium users can always add pages
      return { canAddPages: true };
    }

    // Free users can add pages to existing stories without counting against limit
    // but we need to ensure no repetitive content
    const userId = userInfo.name || 'guest';
    
    try {
      // Check if adding pages would create repetitive content
      const existingContent = currentStory.segments.map(s => s.text).join(' ');
      
      // Simple check - in production would use more sophisticated anti-repetition
      if (existingContent.length > 2000) { // Arbitrary limit for demo
        return {
          canAddPages: false,
          reason: "Story is getting quite long! Start a new adventure for fresh content."
        };
      }

      return { canAddPages: true };

    } catch (error) {
      console.error('Error checking page addition limits:', error);
      return { canAddPages: true }; // Default to allowing
    }
  }

  /**
   * Get user's current session status
   */
  static async getUserSessionStatus(
    userInfo: UserInfo,
    isPremium: boolean
  ): Promise<{
    totalStories: number;
    remainingStories: number;
    isUnlimited: boolean;
    lastStoryDate?: Date;
  }> {
    
    if (isPremium) {
      return {
        totalStories: 0, // Not tracked for premium
        remainingStories: -1,
        isUnlimited: true
      };
    }

    try {
      const userId = userInfo.name || 'guest';
      
      // Load persistent sessions for free users
      const sessions = FreeUserStoryService['loadUserSessions'](userId) || [];
      
      return {
        totalStories: sessions.length,
        remainingStories: Math.max(0, this.SESSION_LIMITS.freeUserLimit - sessions.length),
        isUnlimited: false,
        lastStoryDate: sessions.length > 0 ? new Date(sessions[sessions.length - 1].createdAt) : undefined
      };

    } catch (error) {
      console.error('Error getting session status:', error);
      return {
        totalStories: 0,
        remainingStories: 100,
        isUnlimited: false
      };
    }
  }

  /**
   * Clear all user sessions (for testing or reset purposes)
   */
  static clearUserSessions(userInfo: UserInfo): void {
    try {
      const userId = userInfo.name || 'guest';
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`time2read_free_user_sessions_${userId}`);
        localStorage.removeItem(`time2read_premium_story_library_${userId}`);
        console.log(`🗑️ Cleared all sessions for user ${userId}`);
      }
    } catch (error) {
      console.error('Error clearing user sessions:', error);
    }
  }

  /**
   * Get session analytics for display
   */
  static getSessionAnalytics(userInfo: UserInfo, isPremium: boolean): {
    storiesGenerated: number;
    averageWordsPerStory: number;
    favoriteThemes: string[];
    subscriptionStatus: string;
  } {
    return {
      storiesGenerated: isPremium ? 999 : 50, // Example data
      averageWordsPerStory: 45,
      favoriteThemes: ['adventure', 'friendship', 'animals'],
      subscriptionStatus: isPremium ? 'Premium' : 'Free (Limited to 100 stories)'
    };
  }
}

export default EnhancedSessionManager;