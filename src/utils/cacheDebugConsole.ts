/**
 * Cache debugging utilities for troubleshooting image and story cache issues
 */

import { EnhancedImageCache } from '../services/enhancedImageCache';
import { StorySessionCache } from '../services/storySessionCache';

class CacheDebugConsoleClass {
  /**
   * Investigate current cache state for debugging
   */
  static investigateCache(sessionId?: string) {
    console.group('🔍 Cache Investigation');
    
    try {
      // Get image cache metrics
      const imageMetrics = EnhancedImageCache.getCacheMetrics();
      console.log('📸 Image Cache Metrics:', imageMetrics);
      
      // Get session-specific images if sessionId provided
      if (sessionId) {
        const sessionImages = EnhancedImageCache.getSessionImages(sessionId);
        console.log(`📸 Session Images (${sessionId}):`, sessionImages);
        
        // Check story session cache
        const cachedStory = StorySessionCache.getCachedStorySession('guest');
        const cachedStoryNeutral = StorySessionCache.getCachedStorySession('guest', 'neutral');
        const cachedStoryPreferNotToAnswer = StorySessionCache.getCachedStorySession('guest', 'prefer-not-to-answer');
        
        console.log('📖 Story Session Cache (guest):', cachedStory);
        console.log('📖 Story Session Cache (guest, neutral):', cachedStoryNeutral);
        console.log('📖 Story Session Cache (guest, prefer-not-to-answer):', cachedStoryPreferNotToAnswer);
      }
      
      // Show all cache keys for inspection
      const allCache = localStorage.getItem('enhanced-image-cache');
      if (allCache) {
        const parsedCache = JSON.parse(allCache);
        console.log('🗄️ All Image Cache Keys:', Object.keys(parsedCache));
      }
      
    } catch (error) {
      console.error('❌ Cache investigation failed:', error);
    }
    
    console.groupEnd();
  }
  
  /**
   * Clear problematic cache entries
   */
  static clearProblematicCache(sessionId?: string, avatarType?: string) {
    console.group('🧹 Clearing Problematic Cache');
    
    try {
      if (sessionId) {
        // Clear image cache for session
        EnhancedImageCache.clearSession(sessionId);
        console.log(`✅ Cleared image cache for session: ${sessionId}`);
        
        // Clear story session cache for different avatar variations
        StorySessionCache.clearCachedSession('guest', true, 'neutral');
        StorySessionCache.clearCachedSession('guest', true, 'prefer-not-to-answer');
        StorySessionCache.clearCachedSession('guest', true, avatarType);
        console.log('✅ Cleared story session cache for all avatar variations');
      }
      
    } catch (error) {
      console.error('❌ Cache clearing failed:', error);
    }
    
    console.groupEnd();
  }
  
  /**
   * Test cache key generation for debugging
   */
  static testCacheKey(prompt: string, sessionId: string, avatarType: string = 'prefer-not-to-answer', skinTone: string = 'medium') {
    console.group('🔑 Cache Key Testing');
    
    // This mirrors the private method in EnhancedImageCache
    const createPromptHash = (prompt: string): string => {
      let hash = 0;
      for (let i = 0; i < prompt.length; i++) {
        const char = prompt.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    };
    
    const promptHash = createPromptHash(prompt);
    const baseKey = `${promptHash}-${sessionId}`;
    const normalizedAvatarType = avatarType === 'prefer-not-to-answer' ? 'neutral' : avatarType;
    const avatarKey = `${baseKey}-av:${normalizedAvatarType}-${skinTone}`;
    const finalKey = `${avatarKey}-p0`;
    
    console.log('🔍 Cache Key Components:', {
      prompt: prompt.substring(0, 50) + '...',
      promptHash,
      sessionId,
      originalAvatarType: avatarType,
      normalizedAvatarType,
      skinTone,
      finalCacheKey: finalKey
    });
    
    console.groupEnd();
    return finalKey;
  }
  
  /**
   * Force regenerate current page image
   */
  static forceRegenerateCurrentImage(sessionId: string, pageNumber: number = 0) {
    console.group('🔄 Force Regenerate Current Image');
    
    try {
      // Clear specific page cache
      const sessionImages = EnhancedImageCache.getSessionImages(sessionId);
      if (sessionImages && sessionImages.length > pageNumber) {
        const imageToRemove = sessionImages[pageNumber];
        console.log('🗑️ Removing cached image:', imageToRemove);
      }
      
      // Clear session to force regeneration
      EnhancedImageCache.clearSession(sessionId);
      console.log('✅ Cleared session cache, next image generation will be fresh');
      
      // Trigger page refresh to regenerate
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Force regenerate failed:', error);
    }
    
    console.groupEnd();
  }
}

// Make available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).cacheDebug = {
    investigate: CacheDebugConsoleClass.investigateCache,
    clear: CacheDebugConsoleClass.clearProblematicCache,
    testKey: CacheDebugConsoleClass.testCacheKey,
    forceRegenerate: CacheDebugConsoleClass.forceRegenerateCurrentImage,
  };
  
  console.log('🔧 Cache Debug Console Available:');
  console.log('  window.cacheDebug.investigate(sessionId?) - Investigate cache state');
  console.log('  window.cacheDebug.clear(sessionId?, avatarType?) - Clear problematic cache');
  console.log('  window.cacheDebug.testKey(prompt, sessionId, avatarType, skinTone) - Test cache key generation');
  console.log('  window.cacheDebug.forceRegenerate(sessionId, pageNumber?) - Force regenerate image');
}

export const CacheDebugConsole = CacheDebugConsoleClass;