/**
 * Story refresh utility to force regeneration with updated user data
 */
import { StorySessionCache } from '@/services/storySessionCache';
import { StoryVisualStateManager } from '@/services/storyVisualState';
import { supabase } from '@/integrations/supabase/client';

export class StoryRefreshService {
  /**
   * Force refresh story generation with updated user profile data
   * This clears all cached content to ensure fresh generation with correct pronouns
   */
  static async forceRefreshWithUserData(
    userId?: string, 
    characterSessionId?: string,
    context: 'rewrite' | 'new-session' | 'general' = 'general'
  ): Promise<void> {
    console.log('🔄 Force refreshing story with updated user data');
    
    try {
      // Get the actual user ID if logged in
      let effectiveUserId = userId || 'guest';
      
      if (!userId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id) {
            effectiveUserId = user.id;
          }
        } catch (error) {
          console.warn('Could not get authenticated user, using guest ID');
        }
      }
      
      // Clear all cached story content
      StorySessionCache.clearCachedSession(effectiveUserId);
      
      // Clear character visual state if provided
      if (characterSessionId) {
        StoryVisualStateManager.clearStoryState(characterSessionId);
        console.log(`🎭 Cleared character state for session: ${characterSessionId}`);
      }
      
      // Clear any additional caches that might interfere
      const cacheKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('story') || 
        key.includes('generation') || 
        key.includes('userInput') ||
        key.includes('template')
      );
      
      cacheKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
          console.log(`🧹 Cleared cache key: ${key}`);
        } catch (error) {
          console.warn(`Failed to clear cache key ${key}:`, error);
        }
      });
      
      // Clear localStorage caches that might affect story generation
      const localCacheKeys = Object.keys(localStorage).filter(key => 
        key.includes('userInput') || 
        key.includes('template') ||
        key.includes('story')
      );
      
      localCacheKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🧹 Cleared local cache key: ${key}`);
        } catch (error) {
          console.warn(`Failed to clear local cache key ${key}:`, error);
        }
      });
      
      console.log('✅ Story refresh completed - all caches cleared');
      
      // Dispatch event to notify components that refresh is complete
      window.dispatchEvent(new CustomEvent('story:refresh:complete', {
        detail: { userId: effectiveUserId }
      }));
      
    } catch (error) {
      console.error('❌ Failed to refresh story data:', error);
      throw error;
    }
  }
  
  /**
   * Clear just the pronoun-related caches to fix pronoun issues
   */
  static clearPronounCaches(userId?: string, characterSessionId?: string): void {
    console.log('🎯 Clearing pronoun-related caches');
    
    try {
      const effectiveUserId = userId || 'guest';
      
      // Clear story session cache
      StorySessionCache.clearCachedSession(effectiveUserId);
      
      // Clear character state if provided
      if (characterSessionId) {
        StoryVisualStateManager.clearStoryState(characterSessionId);
      }
      
      // Clear template caches that might have stale pronoun data
      const pronounKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('template') || 
        key.includes('pronoun') ||
        key.includes('userInput')
      );
      
      pronounKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
          console.log(`🎯 Cleared pronoun cache: ${key}`);
        } catch (error) {
          console.warn(`Failed to clear pronoun cache ${key}:`, error);
        }
      });
      
      console.log('✅ Pronoun caches cleared');
    } catch (error) {
      console.error('❌ Failed to clear pronoun caches:', error);
    }
  }
}