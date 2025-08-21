/**
 * Unified Session Cache Manager
 * Clears ALL session-related caches at reading session end
 */

import { EnhancedImageCache } from './enhancedImageCache';
import { StorySessionCache } from './storySessionCache';

interface ClearOptions {
  userId?: string;
  sessionId?: string;
  avatarType?: string;
  skinTone?: string;
  clearVisualState?: boolean;
  reason?: 'session-end' | 'avatar-change' | 'new-session' | 'manual' | 'navigation-home';
}

export class SessionCacheManager {
  private static readonly VISUAL_STATE_KEY = 'story_visual_state_manager';
  private static readonly CHARACTER_STATE_KEY = 'character_visual_state';

  /**
   * Clear all session-related caches comprehensively
   */
  static clearAllSessionCaches(options: ClearOptions = {}): void {
    const {
      userId = 'guest',
      sessionId,
      avatarType,
      skinTone,
      clearVisualState = true,
      reason = 'session-end'
    } = options;

    console.log('🧹 Clearing all session caches:', {
      userId,
      sessionId,
      avatarType,
      skinTone,
      reason,
      clearVisualState
    });

    try {
      // 1. Clear Enhanced Image Cache
      if (sessionId) {
        EnhancedImageCache.clearSession(sessionId);
      } else {
        // Clear all avatar-specific cached images if no specific session
        EnhancedImageCache.clearAll();
      }

      // 2. Clear Story Session Cache (avatar-aware for guests)
      const avatarKey = avatarType || skinTone;
      StorySessionCache.clearCachedSession(userId, true, avatarKey);

      // 3. Clear Visual State Management
      if (clearVisualState) {
        this.clearVisualStateCache(userId, avatarType, skinTone);
      }

      // 4. Clear Character State
      this.clearCharacterState(userId, avatarType, skinTone);

      // 5. Clear session storage caches
      this.clearSessionStorageCaches();

      // 6. Clear navigation-related caches
      this.clearNavigationCaches(userId);

      console.log('✅ All session caches cleared successfully');

    } catch (error) {
      console.error('❌ Failed to clear session caches:', error);
    }
  }

  /**
   * Clear avatar-specific caches when avatar changes
   */
  static clearAvatarSpecificCaches(userId: string, oldAvatar?: any, newAvatar?: any): void {
    console.log('🎭 Clearing avatar-specific caches:', {
      userId,
      oldAvatar: oldAvatar ? `${oldAvatar.type}-${oldAvatar.skinTone}` : 'none',
      newAvatar: newAvatar ? `${newAvatar.type}-${newAvatar.skinTone}` : 'none'
    });

    try {
      // Clear old avatar caches
      if (oldAvatar) {
        this.clearAllSessionCaches({
          userId,
          avatarType: oldAvatar.type,
          skinTone: oldAvatar.skinTone,
          reason: 'avatar-change'
        });
      }

      // Clear any generic caches that might affect new avatar
      EnhancedImageCache.clearExpiredEntries();
      
    } catch (error) {
      console.error('Failed to clear avatar-specific caches:', error);
    }
  }

  /**
   * Clear visual state management caches
   */
  private static clearVisualStateCache(userId: string, avatarType?: string, skinTone?: string): void {
    try {
      // Clear StoryVisualStateManager cache
      const visualStateKeys = [
        this.VISUAL_STATE_KEY,
        `${this.VISUAL_STATE_KEY}_${userId}`,
        `story_visual_state_${userId}`,
        'story_visual_state'
      ];

      // Add avatar-specific keys
      if (avatarType && skinTone) {
        visualStateKeys.push(
          `${this.VISUAL_STATE_KEY}_${userId}_${avatarType}_${skinTone}`,
          `story_visual_state_${userId}_${avatarType}_${skinTone}`
        );
      }

      visualStateKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch {}
      });

      console.log('🎨 Visual state caches cleared:', visualStateKeys.length);
    } catch (error) {
      console.warn('Failed to clear visual state cache:', error);
    }
  }

  /**
   * Clear character appearance state
   */
  private static clearCharacterState(userId: string, avatarType?: string, skinTone?: string): void {
    try {
      const characterKeys = [
        this.CHARACTER_STATE_KEY,
        `${this.CHARACTER_STATE_KEY}_${userId}`,
        'character_appearance_cache',
        'character_consistency_state'
      ];

      // Add avatar-specific character keys
      if (avatarType && skinTone) {
        characterKeys.push(
          `${this.CHARACTER_STATE_KEY}_${avatarType}_${skinTone}`,
          `character_appearance_${userId}_${avatarType}_${skinTone}`
        );
      }

      characterKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch {}
      });

      console.log('👤 Character state caches cleared:', characterKeys.length);
    } catch (error) {
      console.warn('Failed to clear character state:', error);
    }
  }

  /**
   * Clear session storage caches
   */
  private static clearSessionStorageCaches(): void {
    try {
      const sessionKeys = [
        'session_achievements',
        'session_start_stats',
        'last_user_info',
        'last_story_text',
        'current_story_progress',
        'audio_session_state',
        'reading_session_active'
      ];

      sessionKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch {}
      });

      console.log('🗄️ Session storage caches cleared');
    } catch (error) {
      console.warn('Failed to clear session storage caches:', error);
    }
  }

  /**
   * Clear navigation and routing related caches
   */
  private static clearNavigationCaches(userId: string): void {
    try {
      const navKeys = [
        'navigation_cache_validator',
        `user_navigation_${userId}`,
        'story_navigation_state',
        'page_transition_cache'
      ];

      navKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch {}
      });

      console.log('🧭 Navigation caches cleared');
    } catch (error) {
      console.warn('Failed to clear navigation caches:', error);
    }
  }

  /**
   * Get cache status for debugging
   */
  static getCacheStatus(): {
    imageCacheSize: number;
    sessionCacheExists: boolean;
    visualStateKeys: number;
    characterStateKeys: number;
  } {
    try {
      const metrics = EnhancedImageCache.getCacheMetrics();
      
      // Count visual state keys
      let visualStateKeys = 0;
      let characterStateKeys = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('visual_state')) visualStateKeys++;
        if (key?.includes('character_')) characterStateKeys++;
      }

      return {
        imageCacheSize: metrics.totalImages,
        sessionCacheExists: StorySessionCache.hasCachedSession('guest'),
        visualStateKeys,
        characterStateKeys
      };
    } catch {
      return {
        imageCacheSize: 0,
        sessionCacheExists: false,
        visualStateKeys: 0,
        characterStateKeys: 0
      };
    }
  }
}