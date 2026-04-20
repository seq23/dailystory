/*
 * ============================================================================
 * BUSINESS MODEL DOCUMENTATION - SESSION CACHE MANAGER
 * ============================================================================
 * 
 * UNIFIED CACHE MANAGEMENT FOR DIFFERENT USER EXPERIENCES:
 * 
 * 1. GUEST USER CACHE CLEARING:
 *    - "Next Story": Clears cache to start fresh 6-page cycle
 *    - Session End: Comprehensive clearing after 20-minute timer expires
 *    - Prevents contamination between different guest sessions
 *    - Avatar-aware clearing to maintain character consistency
 * 
 * 2. PREMIUM USER CACHE CLEARING:
 *    - "Rewrite Story": Selective clearing (preserve avatar, clear story)
 *    - Session End: Complete clearing when user chooses to end
 *    - Story Library: Preserve saved stories with original images
 *    - Magic Wand: Regenerate story with new images
 * 
 * 3. CLEARING CONTEXTS:
 *    - 'session-end': Complete wipe for both user types
 *    - 'premium-rewrite': Selective clearing for story regeneration
 *    - 'new-session': Fresh start with clean caches
 *    - 'next-story': Guest cycle management (6-page limit enforcement)
 * 
 * 4. CACHE TYPES MANAGED:
 *    - Image cache: Generated images for stories
 *    - Story content: Pages, navigation, progress
 *    - Visual state: Character appearance, consistency
 *    - Character state: Avatar identity across sessions
 *    - Session data: Timer, progress, user preferences
 * 
 * 5. BUSINESS LOGIC ENFORCEMENT:
 *    - Guest 6-page limit: Cache clearing enables "Next Story" cycle
 *    - Premium continuity: Preserve character identity during rewrites
 *    - Cross-session isolation: Prevent avatar/story contamination
 * 
 * ============================================================================
 */

/**
 * Unified Session Cache Manager
 * Clears ALL session-related caches at reading session end
 */

import { EnhancedImageCache } from './enhancedImageCache';
import { StorySessionCache } from './storySessionCache';
import { generateSessionIdWithPrefix } from '@/utils/sessionId';
import { DebugLogger } from '@/services/DebugLogger';

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

    // CRITICAL FIX: Ensure sessionId is always defined
    const effectiveSessionId = sessionId || generateSessionIdWithPrefix('fallback_session');
    
    DebugLogger.log('ui', 'clearAllSessionCaches', {
      userId,
      sessionId: effectiveSessionId,
      originalSessionId: sessionId,
      sessionIdSource: sessionId ? 'provided' : 'generated',
      avatarType,
      skinTone,
      reason,
      clearVisualState,
      preserveAvatarIdentity,
      timestamp: new Date().toISOString()
    });

    // Handle premium rewrite scenario with selective clearing
    if (reason === 'premium-rewrite' && preserveAvatarIdentity) {
      this.clearForPremiumRewrite(options);
      return;
    }

    try {
      // 1. Clear Enhanced Image Cache (now uses sessionStorage)
      DebugLogger.log('performance', 'Step 1: Clearing Enhanced Image Cache');
      // Use story transition clearing for new stories
      if (reason === 'new-session') {
        EnhancedImageCache.clearForStoryTransition(effectiveSessionId);
      } else {
        EnhancedImageCache.clearSession(effectiveSessionId);
      }
      DebugLogger.log('performance', 'Enhanced Image Cache cleared for session', { sessionId: effectiveSessionId });

      // 2. Clear Story Session Cache
      DebugLogger.log('performance', 'Step 2: Clearing Story Session Cache');
      if (userId) {
        const context = reason === 'premium-rewrite' ? 'rewrite' : 
                      reason === 'new-session' ? 'next-story' : 'session-end';
        StorySessionCache.clearCachedSession(userId, clearVisualState, avatarType, context);
        DebugLogger.log('performance', 'Story Session Cache cleared', { userId, context, avatarType });
      }

      // 3. Clear Visual State (character/object tracking)
      if (clearVisualState) {
        DebugLogger.log('performance', 'Step 3: Clearing Visual State Cache');
        this.clearVisualStateCache(effectiveSessionId, userId);
      } else {
        DebugLogger.log('performance', 'Step 3: Skipping Visual State Cache (preserving for rewrite)');
      }

      // 4. Clear Character State (appearance consistency)
      DebugLogger.log('performance', 'Step 4: Clearing Character State');
      this.clearCharacterState(userId, effectiveSessionId, avatarType);

      // 5. Clear Session Storage Caches
      DebugLogger.log('performance', 'Step 5: Clearing Session Storage Caches');
      this.clearSessionStorageCaches();

      // 6. Clear Navigation Caches
      DebugLogger.log('performance', 'Step 6: Clearing Navigation Caches');
      this.clearNavigationCaches(userId);

      // 7. Clear Server-Side Character Cache
      DebugLogger.log('performance', 'Step 7: Clearing Server-Side Character Cache');
      this.clearServerSideCharacterCache();

      DebugLogger.log('performance', 'All cache clearing steps completed successfully');

    } catch (error) {
      DebugLogger.error('performance', 'Error during session cache clearing', { error });
    }
  }

  /**
   * Premium rewrite: Clear story content but preserve avatar identity
   */
  private static clearForPremiumRewrite(options: ClearOptions): void {
    const { userId = 'guest', sessionId, avatarType } = options;

    // CRITICAL FIX: Ensure sessionId is always defined
    const effectiveSessionId = sessionId || generateSessionIdWithPrefix('fallback_session');

    DebugLogger.log('performance', 'Premium rewrite: Selective clearing to preserve avatar identity', {
      userId,
      sessionId: effectiveSessionId,
      originalSessionId: sessionId,
      avatarType
    });

    try {
      // 1. Clear story images but keep character seeds
      EnhancedImageCache.clearStoryImagesKeepCharacterSeeds(effectiveSessionId, avatarType);

      // 2. Clear story content but keep avatar metadata
      if (userId) {
        StorySessionCache.clearStoryContentKeepAvatar(userId, avatarType);
      }

      // 3. Preserve character appearance seeds while clearing story details
      this.clearStoryContentPreserveCharacter(userId, effectiveSessionId, avatarType);

      DebugLogger.log('performance', 'Premium rewrite clearing completed - avatar identity preserved');

    } catch (error) {
      DebugLogger.error('performance', 'Error during premium rewrite clearing', { error });
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
        key.includes('story_narrative') ||
        key.includes('session_image_cache') // Clear sessionStorage image cache too
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

      DebugLogger.log('performance', `Preserved ${characterKeys.length} character consistency markers for avatar: ${avatarType}`);

    } catch (error) {
      DebugLogger.warn('performance', 'Failed to clear story content selectively', { error });
    }
  }

  /**
   * Clear avatar-specific caches when avatar changes
   */
  static clearAvatarSpecificCaches(userId: string, oldAvatar?: any, newAvatar?: any): void {
    DebugLogger.log('performance', `Clearing avatar-specific caches for ${userId}`, {
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

      DebugLogger.log('performance', 'Avatar-specific cache clearing completed');

    } catch (error) {
      DebugLogger.error('performance', 'Error during avatar cache clearing', { error });
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

      DebugLogger.log('performance', `Cleared ${visualStateKeys.length} visual state cache entries`);

    } catch (error) {
      DebugLogger.warn('performance', 'Failed to clear visual state cache', { error });
    }
  }

  /**
   * Clear character appearance and consistency state
   */
  private static clearCharacterState(userId?: string, sessionId?: string, avatarType?: string): void {
    try {
      // Clear character state from localStorage
      // IMPORTANT: never wipe guest session-state keys (guest.active, guest.userInfo, guest.timer.*)
      // — those are required for refresh-resume. They are NOT character state.
      const isGuestSessionStateKey = (k: string) => k.startsWith('guest.');
      const characterKeys = Object.keys(localStorage).filter(key => {
        if (isGuestSessionStateKey(key)) return false;
        return (
          key.includes(this.CHARACTER_STATE_KEY) ||
          key.includes('character_') ||
          (sessionId && key.includes(sessionId)) ||
          (userId && key.includes(userId))
        );
      });

      characterKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      DebugLogger.log('performance', `Cleared ${characterKeys.length} character state entries`);

    } catch (error) {
      DebugLogger.warn('performance', 'Failed to clear character state', { error });
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

      DebugLogger.log('performance', 'Cleared session storage caches');

    } catch (error) {
      DebugLogger.warn('performance', 'Failed to clear session storage caches', { error });
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

      DebugLogger.log('performance', 'Cleared navigation caches');

    } catch (error) {
      DebugLogger.warn('performance', 'Failed to clear navigation caches', { error });
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
          DebugLogger.log('performance', 'Server-side character cache cleared successfully');
        } else {
          DebugLogger.warn('performance', 'Server-side character cache clear failed (non-critical)');
        }
      })
      .catch(error => {
        DebugLogger.warn('performance', 'Failed to clear server-side character cache (non-critical)', { error: error.message });
      });

    } catch (error) {
      DebugLogger.warn('performance', 'Error initiating server-side cache clear (non-critical)', { error });
    }
  }

  /**
   * Clear caches when user ends their reading session
   */
  static clearOnSessionEnd(userId?: string, avatarType?: string): void {
    DebugLogger.log('performance', 'clearOnSessionEnd ENTRY', { userId, avatarType, timestamp: new Date().toISOString() });
    try {
      this.clearAllSessionCaches({
        userId: userId || 'guest',
        avatarType,
        reason: 'session-end',
        clearVisualState: true
      });
        DebugLogger.error('performance', 'clearOnSessionEnd COMPLETED successfully');
      DebugLogger.log('performance', 'clearOnSessionEnd COMPLETED successfully');
    } catch (error) {
      DebugLogger.error('performance', 'clearOnSessionEnd FAILED', { error });
    }
  }

  /**
   * Clear caches when user rewrites current story (regenerate with same characters)
   */
  static clearOnRewrite(userId?: string, avatarType?: string): void {
    DebugLogger.log('performance', 'clearOnRewrite ENTRY', { userId, avatarType, timestamp: new Date().toISOString() });
    try {
      this.clearAllSessionCaches({
        userId: userId || 'guest',
        avatarType,
        reason: 'premium-rewrite',
        clearVisualState: false, // Keep visual continuity for rewrite
        preserveAvatarIdentity: true
      });
      DebugLogger.log('performance', 'clearOnRewrite COMPLETED - avatar identity preserved');
    } catch (error) {
      DebugLogger.error('performance', 'clearOnRewrite FAILED', { error });
    }
  }

  /**
   * Clear caches when user generates next story (completely new story)
   */
  static clearOnNextStory(userId?: string, avatarType?: string): void {
    DebugLogger.log('performance', 'clearOnNextStory ENTRY', { userId, avatarType, timestamp: new Date().toISOString() });
    try {
      // Use story transition clearing for next story
      this.clearAllSessionCaches({
        userId: userId || 'guest',
        avatarType,
        reason: 'new-session',
        clearVisualState: true // Full clear for new story
      });
      
      // Mark that next Netflix session should be fresh
      try {
        sessionStorage.setItem('netflix_force_fresh_session', 'true');
        DebugLogger.log('performance', 'Netflix marked for fresh session generation');
      } catch (error) {
        DebugLogger.warn('performance', 'Failed to mark fresh session', { error });
      }
      
      DebugLogger.log('performance', 'clearOnNextStory COMPLETED - full cache clear done');
    } catch (error) {
      DebugLogger.error('performance', 'clearOnNextStory FAILED', { error });
    }
  }

  /**
   * Clear caches for premium finish story (preserve images for navigation)
   */
  static clearOnPremiumFinish(userId?: string, sessionId?: string): void {
    DebugLogger.log('performance', 'clearOnPremiumFinish ENTRY', { userId, sessionId, timestamp: new Date().toISOString() });
    try {
      // Premium finish preserves images until new story or session end
      if (sessionId) {
        EnhancedImageCache.clearForPremiumFinish(sessionId);
      }
      DebugLogger.log('performance', 'clearOnPremiumFinish - Images preserved for navigation');
    } catch (error) {
      DebugLogger.error('performance', 'clearOnPremiumFinish FAILED', { error });
    }
  }

  /**
   * ERROR-017 FIX: Synchronous cache clearing for Next Story transitions
   * Prevents race conditions between cache clearing and new story generation
   */
  static clearOnNextStorySync(userId: string = 'guest', avatarType?: string): void {
    DebugLogger.log('performance', 'clearOnNextStorySync ENTRY', { userId, avatarType, timestamp: new Date().toISOString() });
    
    try {
      // Immediate synchronous clearing without async operations
      const effectiveSessionId = generateSessionIdWithPrefix('next_story_sync');
      
      // 1. Clear Enhanced Image Cache synchronously
      EnhancedImageCache.clearForStoryTransition(effectiveSessionId);
      
      // 2. Clear Story Session Cache with next-story context
      StorySessionCache.clearCachedSession(userId, true, avatarType, 'next-story');
      
      // 3. Mark Netflix session for immediate fresh generation
      sessionStorage.setItem('netflix_force_fresh_session', 'true');
      sessionStorage.setItem('cache_cleared_timestamp', Date.now().toString());
      
      // 4. Clear visual state synchronously
      const visualStateKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('story_visual_state_manager') || 
        key.includes('visual_state')
      );
      visualStateKeys.forEach(key => sessionStorage.removeItem(key));
      
      // 5. Clear character state from localStorage
      const characterKeys = Object.keys(localStorage).filter(key => 
        key.includes('character_visual_state') ||
        key.includes('character_')
      );
      characterKeys.forEach(key => localStorage.removeItem(key));
      
      DebugLogger.log('performance', 'clearOnNextStorySync COMPLETED - synchronous cache clear done');
      
    } catch (error) {
      DebugLogger.error('performance', 'clearOnNextStorySync FAILED', { error });
      throw error; // Re-throw to allow caller to handle
    }
  }

  /**
   * Clear comprehensive guest cache including all image caches
   */
  static async clearGuestCache(sessionId?: string): Promise<void> {
    DebugLogger.log('performance', 'clearGuestCache ENTRY', { sessionId, timestamp: new Date().toISOString() });
    
    try {
      // Clear all image-related caches
      const imageKeys = [
        'generatedImageUrls',
        'imageGenerationStates', 
        'cachedImages',
        'runware-cache',
        'fallback-images'
      ];
      
      imageKeys.forEach(key => {
        try {
          sessionStorage.removeItem(`guest_${key}`);
          localStorage.removeItem(`guest_${key}`);
        } catch (error) {
          DebugLogger.warn('performance', `Failed to clear ${key}`, { error });
        }
      });
      
      // Clear IndexedDB image caches
      await this.clearIndexedDBImageCache();
      
      // Clear session-specific caches if sessionId provided
      if (sessionId) {
        const sessionKeys = Object.keys(sessionStorage).filter(key => key.includes(sessionId));
        sessionKeys.forEach(key => {
          try {
            sessionStorage.removeItem(key);
          } catch {}
        });
      }
      
      DebugLogger.log('performance', 'Guest image cache cleared completely');
      DebugLogger.log('performance', 'clearGuestCache COMPLETED successfully');
      
    } catch (error) {
      DebugLogger.warn('performance', 'Failed clearing guest image cache', error);
      DebugLogger.error('performance', 'clearGuestCache FAILED', { error });
    }
  }

  /**
   * Clear IndexedDB image caches
   */
  private static async clearIndexedDBImageCache(): Promise<void> {
    const dbNames = ['ImageCacheDB', 'RunwareImageCache', 'FallbackImageCache'];
    
    for (const dbName of dbNames) {
      try {
        const deleteRequest = indexedDB.deleteDatabase(dbName);
        await new Promise((resolve, reject) => {
          deleteRequest.onsuccess = () => resolve(true);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onblocked = () => {
            DebugLogger.warn('performance', `IndexedDB deletion blocked for ${dbName}`);
            resolve(true); // Continue anyway
          };
        });
        DebugLogger.log('performance', `Cleared IndexedDB: ${dbName}`);
      } catch (error) {
        DebugLogger.warn('performance', `Failed to clear ${dbName}:`, error);
      }
    }
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
      // Count image cache entries (now in sessionStorage)
      const imageCache = sessionStorage.getItem('session_image_cache');
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
      DebugLogger.warn('performance', 'Failed to get cache status', { error });
      return { imageCacheSize: 0, sessionCacheExists: false, visualStateKeys: 0, characterStateKeys: 0 };
    }
  }
}
