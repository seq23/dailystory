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
  reason?: 'session-end' | 'avatar-change' | 'new-session' | 'manual' | 'navigation-home' | 'premium-rewrite';
  preserveAvatarIdentity?: boolean;
}

export class SessionCacheManager {
  private static readonly VISUAL_STATE_KEY = 'story_visual_state_manager';
  private static readonly CHARACTER_STATE_KEY = 'character_visual_state';

  /**
   * Clear all session-related caches with context-aware behavior
   */
  static clearAllSessionCaches(options: ClearOptions = {}): void {
    const {
      userId = 'guest',
      sessionId,
      avatarType,
      skinTone,
      clearVisualState = true,
      reason = 'session-end',
      preserveAvatarIdentity = false
    } = options;

    console.log('🧹 Clearing session caches:', {
      userId,
      sessionId,
      avatarType,
      skinTone,
      reason,
      clearVisualState,
      preserveAvatarIdentity
    });

    // Handle premium rewrite scenario with selective clearing
    if (reason === 'premium-rewrite' && preserveAvatarIdentity) {
      this.clearForPremiumRewrite(options);
      return;
    }

    try {
      // 1. Clear Enhanced Image Cache
      if (sessionId) {
        EnhancedImageCache.clearSession(sessionId);
      } else {
        // Clear all avatar-specific cached images if no specific session
        EnhancedImageCache.clearAll();
      }

      // 2. Clear Story Session Cache
      if (userId) {
        const context = reason === 'premium-rewrite' ? 'rewrite' : 
                      reason === 'new-session' ? 'next-story' : 'session-end';
        StorySessionCache.clearCachedSession(userId, clearVisualState, avatarType, context);
      }

      // 3. Clear Visual State (character/object tracking)
      if (clearVisualState) {
        this.clearVisualStateCache(sessionId, userId);
      }

      // 4. Clear Character State (appearance consistency)
      this.clearCharacterState(userId, sessionId, avatarType);

      // 5. Clear Session Storage Caches
      this.clearSessionStorageCaches();

      // 6. Clear Navigation Caches
      this.clearNavigationCaches(userId);

      // 7. Clear Server-Side Character Cache
      this.clearServerSideCharacterCache();

      console.log('✅ Session cache clearing completed successfully');

    } catch (error) {
      console.error('❌ Error during session cache clearing:', error);
    }
  }

  /**
   * Premium rewrite: Clear story content but preserve avatar identity
   */
  private static clearForPremiumRewrite(options: ClearOptions): void {
    const { userId = 'guest', sessionId, avatarType } = options;

    console.log('🎭 Premium rewrite: Selective clearing to preserve avatar identity');

    try {
      // 1. Clear story images but keep character seeds
      if (sessionId) {
        EnhancedImageCache.clearStoryImagesKeepCharacterSeeds(sessionId, avatarType);
      }

      // 2. Clear story content but keep avatar metadata
      if (userId) {
        StorySessionCache.clearStoryContentKeepAvatar(userId, avatarType);
      }

      // 3. Preserve character appearance seeds while clearing story details
      this.clearStoryContentPreserveCharacter(userId, sessionId, avatarType);

      console.log('✅ Premium rewrite clearing completed - avatar identity preserved');

    } catch (error) {
      console.error('❌ Error during premium rewrite clearing:', error);
    }
  }

  /**
   * Clear story content while preserving character appearance for premium users
   */
  private static clearStoryContentPreserveCharacter(userId?: string, sessionId?: string, avatarType?: string): void {
    try {
      // Clear story-specific data while preserving avatar consistency markers
      const storageKeys = Object.keys(sessionStorage);
      const storyKeys = storageKeys.filter(key => 
        key.includes('story_content') || 
        key.includes('story_pages') ||
        key.includes('story_narrative')
      );

      storyKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });

      // Keep avatar-related character seeds in localStorage
      const localStorageKeys = Object.keys(localStorage);
      const characterKeys = localStorageKeys.filter(key => 
        key.includes('character_seed') && 
        key.includes(avatarType || 'avatar')
      );

      console.log(`🎭 Preserved ${characterKeys.length} character consistency markers for avatar: ${avatarType}`);

    } catch (error) {
      console.warn('Failed to clear story content selectively:', error);
    }
  }

  /**
   * Clear avatar-specific caches when avatar changes
   */
  static clearAvatarSpecificCaches(userId: string, oldAvatar?: any, newAvatar?: any): void {
    console.log('🎭 Clearing avatar-specific caches:', {
      userId,
      oldAvatar: oldAvatar?.type,
      newAvatar: newAvatar?.type
    });

    try {
      // Clear old avatar-specific caches
      if (oldAvatar) {
        const oldAvatarType = oldAvatar.type === 'prefer-not-to-answer' ? 'neutral' : oldAvatar.type;
        StorySessionCache.clearCachedSession(userId, true, oldAvatarType, 'avatar-change');
      }

      // Clear character consistency caches for avatar transition
      this.clearCharacterState(userId, undefined, oldAvatar?.type);

      console.log('✅ Avatar-specific cache clearing completed');

    } catch (error) {
      console.error('❌ Error during avatar cache clearing:', error);
    }
  }

  /**
   * Clear caches related to visual state management
   */
  private static clearVisualStateCache(sessionId?: string, userId?: string): void {
    try {
      // Clear visual state from sessionStorage
      const visualStateKeys = Object.keys(sessionStorage).filter(key => 
        key.includes(this.VISUAL_STATE_KEY) || 
        key.includes('visual_state') ||
        (sessionId && key.includes(sessionId))
      );

      visualStateKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });

      console.log(`🎨 Cleared ${visualStateKeys.length} visual state cache entries`);

    } catch (error) {
      console.warn('Failed to clear visual state cache:', error);
    }
  }

  /**
   * Clear character appearance and consistency state
   */
  private static clearCharacterState(userId?: string, sessionId?: string, avatarType?: string): void {
    try {
      // Clear character state from localStorage
      const characterKeys = Object.keys(localStorage).filter(key => 
        key.includes(this.CHARACTER_STATE_KEY) ||
        key.includes('character_') ||
        (sessionId && key.includes(sessionId)) ||
        (userId && key.includes(userId))
      );

      characterKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`🎭 Cleared ${characterKeys.length} character state entries`);

    } catch (error) {
      console.warn('Failed to clear character state:', error);
    }
  }

  /**
   * Clear specific session storage caches
   */
  private static clearSessionStorageCaches(): void {
    try {
      const keysToRemove = [
        'story_generation_cache',
        'image_generation_queue', 
        'audio_cache',
        'vocabulary_cache',
        'reading_progress'
      ];

      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });

      console.log('🗃️ Cleared session storage caches');

    } catch (error) {
      console.warn('Failed to clear session storage caches:', error);
    }
  }

  /**
   * Clear navigation and routing related caches
   */
  private static clearNavigationCaches(userId: string): void {
    try {
      // Clear navigation state from localStorage
      const navKeys = ['navigation_state', 'route_cache', 'reading_position'];
      navKeys.forEach(key => localStorage.removeItem(key));

      // Clear session navigation from sessionStorage  
      const sessionNavKeys = ['current_session', 'session_navigation'];
      sessionNavKeys.forEach(key => sessionStorage.removeItem(key));

      console.log('🧭 Cleared navigation caches');

    } catch (error) {
      console.warn('Failed to clear navigation caches:', error);
    }
  }

  /**
   * Clear server-side character cache to ensure synchronization
   */
  private static clearServerSideCharacterCache(): void {
    try {
      // Call the server-side clear endpoint asynchronously (don't block the UI)
      fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/clear-character-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'client-cache-clear' })
      })
      .then(response => {
        if (response.ok) {
          console.log('🎭 Server-side character cache cleared successfully');
        } else {
          console.warn('⚠️ Server-side character cache clear failed (non-critical)');
        }
      })
      .catch(error => {
        console.warn('⚠️ Failed to clear server-side character cache (non-critical):', error.message);
      });

    } catch (error) {
      console.warn('⚠️ Error initiating server-side cache clear (non-critical):', error);
    }
  }

  /**
   * Clear caches when user ends their reading session
   */
  static clearOnSessionEnd(userId?: string, avatarType?: string): void {
    console.log('🔚 [DEBUG] clearOnSessionEnd called:', { userId, avatarType });
    this.clearAllSessionCaches({
      userId: userId || 'guest',
      avatarType,
      reason: 'session-end',
      clearVisualState: true
    });
  }

  /**
   * Clear caches when user rewrites current story (regenerate with same characters)
   */
  static clearOnRewrite(userId?: string, avatarType?: string): void {
    console.log('🔄 [DEBUG] clearOnRewrite called:', { userId, avatarType });
    this.clearAllSessionCaches({
      userId: userId || 'guest',
      avatarType,
      reason: 'premium-rewrite',
      clearVisualState: false, // Keep visual continuity for rewrite
      preserveAvatarIdentity: true
    });
  }

  /**
   * Clear caches when user generates next story (completely new story)
   */
  static clearOnNextStory(userId?: string, avatarType?: string): void {
    console.log('✨ [DEBUG] clearOnNextStory called:', { userId, avatarType });
    this.clearAllSessionCaches({
      userId: userId || 'guest',
      avatarType,
      reason: 'new-session',
      clearVisualState: true // Full clear for new story
    });
  }

  /**
   * Get cache status and metrics
   */
  static getCacheStatus(): { 
    imageCacheSize: number; 
    sessionCacheExists: boolean; 
    visualStateKeys: number; 
    characterStateKeys: number; 
  } {
    try {
      // Count image cache entries
      const imageCache = localStorage.getItem(EnhancedImageCache['CACHE_KEY']);
      const imageCacheSize = imageCache ? Object.keys(JSON.parse(imageCache)).length : 0;

      // Check session cache existence
      const sessionKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('time2read_story_session_')
      );
      const sessionCacheExists = sessionKeys.length > 0;

      // Count visual state keys
      const visualStateKeys = Object.keys(sessionStorage).filter(key => 
        key.includes(this.VISUAL_STATE_KEY) || key.includes('visual_state')
      ).length;

      // Count character state keys  
      const characterStateKeys = Object.keys(localStorage).filter(key => 
        key.includes(this.CHARACTER_STATE_KEY) || key.includes('character_')
      ).length;

      return {
        imageCacheSize,
        sessionCacheExists,
        visualStateKeys,
        characterStateKeys
      };

    } catch (error) {
      console.warn('Failed to get cache status:', error);
      return { imageCacheSize: 0, sessionCacheExists: false, visualStateKeys: 0, characterStateKeys: 0 };
    }
  }
}
