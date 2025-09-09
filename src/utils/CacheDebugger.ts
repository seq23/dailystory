/**
 * Cache Debugging and Inspection Tools
 * Provides utilities to inspect and debug cache behavior
 */

import { EnhancedImageCache } from '@/services/enhancedImageCache';
import { StorySessionCache } from '@/services/storySessionCache';

interface CacheInspectionResult {
  imageCacheStatus: {
    totalImages: number;
    sessions: Record<string, number>;
    storageUsage: number;
    keys: string[];
  };
  sessionCacheStatus: {
    hasCachedSessions: boolean;
    sessions: string[];
  };
  storageBreakdown: {
    sessionStorage: {
      totalKeys: number;
      imageCache: number;
      otherKeys: string[];
    };
    localStorage: {
      totalKeys: number;
      storyKeys: number;
      otherKeys: string[];
    };
  };
}

export class CacheDebugger {
  /**
   * Perform comprehensive cache inspection
   */
  static inspectAllCaches(userId?: string, sessionId?: string): CacheInspectionResult {
    console.log('🔍 [CACHE DEBUGGER] Starting comprehensive cache inspection...');
    
    const result: CacheInspectionResult = {
      imageCacheStatus: this.inspectImageCache(),
      sessionCacheStatus: this.inspectSessionCache(userId),
      storageBreakdown: this.inspectStorageBreakdown()
    };
    
    console.log('🔍 [CACHE DEBUGGER] Inspection complete:', result);
    return result;
  }

  /**
   * Inspect Enhanced Image Cache
   */
  private static inspectImageCache() {
    try {
      const metrics = EnhancedImageCache.getCacheMetrics();
      const sessionStorageData = sessionStorage.getItem('session_image_cache');
      const cacheData = sessionStorageData ? JSON.parse(sessionStorageData) : {};
      
      const sessions: Record<string, number> = {};
      const keys = Object.keys(cacheData);
      
      // Count images per session
      Object.values(cacheData).forEach((item: any) => {
        if (item.sessionId) {
          sessions[item.sessionId] = (sessions[item.sessionId] || 0) + 1;
        }
      });
      
      return {
        totalImages: metrics.totalImages,
        sessions,
        storageUsage: sessionStorageData?.length || 0,
        keys
      };
    } catch (error) {
      console.error('Failed to inspect image cache:', error);
      return {
        totalImages: 0,
        sessions: {},
        storageUsage: 0,
        keys: []
      };
    }
  }

  /**
   * Inspect Story Session Cache
   */
  private static inspectSessionCache(userId?: string) {
    try {
      const sessionKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('time2read_story_session_')
      );
      
      return {
        hasCachedSessions: sessionKeys.length > 0,
        sessions: sessionKeys
      };
    } catch (error) {
      console.error('Failed to inspect session cache:', error);
      return {
        hasCachedSessions: false,
        sessions: []
      };
    }
  }

  /**
   * Inspect storage breakdown
   */
  private static inspectStorageBreakdown() {
    try {
      // SessionStorage analysis
      const sessionKeys = Object.keys(sessionStorage);
      const imageCache = sessionKeys.filter(key => key.includes('session_image_cache')).length;
      const otherSessionKeys = sessionKeys.filter(key => !key.includes('session_image_cache'));
      
      // LocalStorage analysis
      const localKeys = Object.keys(localStorage);
      const storyKeys = localKeys.filter(key => 
        key.includes('story') || key.includes('session') || key.includes('character')
      ).length;
      const otherLocalKeys = localKeys.filter(key => 
        !key.includes('story') && !key.includes('session') && !key.includes('character')
      );
      
      return {
        sessionStorage: {
          totalKeys: sessionKeys.length,
          imageCache,
          otherKeys: otherSessionKeys
        },
        localStorage: {
          totalKeys: localKeys.length,
          storyKeys,
          otherKeys: otherLocalKeys
        }
      };
    } catch (error) {
      console.error('Failed to inspect storage breakdown:', error);
      return {
        sessionStorage: { totalKeys: 0, imageCache: 0, otherKeys: [] },
        localStorage: { totalKeys: 0, storyKeys: 0, otherKeys: [] }
      };
    }
  }

  /**
   * Generate cache key for testing (mirrors EnhancedImageCache logic)
   */
  static generateTestCacheKey(
    prompt: string,
    sessionId: string,
    pageNumber?: number,
    storyId?: string,
    avatarType?: string,
    skinTone?: string
  ): string {
    // Simple hash function (matches EnhancedImageCache.createPromptHash)
    const createHash = (text: string): string => {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36);
    };

    const promptHash = createHash(prompt);
    
    // Session seed generation (matches EnhancedImageCache.getSessionSeed)
    let sessionHash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      const char = sessionId.charCodeAt(i);
      sessionHash = ((sessionHash << 5) - sessionHash) + char;
      sessionHash = sessionHash & sessionHash;
    }
    const sessionSeed = Math.abs(sessionHash).toString(36).substring(0, 6);
    
    const storyInstanceId = storyId ? `${createHash(storyId)}-${sessionSeed}` : sessionSeed;
    const baseKey = `${promptHash}-${sessionId}-${storyInstanceId}`;
    
    // Add avatar awareness
    const normalizedAvatarType = avatarType === 'prefer-not-to-answer' ? 'neutral' : (avatarType || 'default');
    const avatarKey = (normalizedAvatarType && skinTone) ? 
      `${baseKey}-av:${normalizedAvatarType}-${skinTone}` : baseKey;
    
    return pageNumber !== undefined ? `${avatarKey}-p${pageNumber}` : avatarKey;
  }

  /**
   * Compare cache keys to debug reuse issues
   */
  static debugCacheKeyReuse(
    prompt1: string,
    prompt2: string,
    sessionId: string,
    pageNumber?: number,
    storyId?: string,
    avatarType?: string,
    skinTone?: string
  ) {
    const key1 = this.generateTestCacheKey(prompt1, sessionId, pageNumber, storyId, avatarType, skinTone);
    const key2 = this.generateTestCacheKey(prompt2, sessionId, pageNumber, storyId, avatarType, skinTone);
    
    console.log('🔑 [CACHE KEY DEBUG] Comparing cache keys:', {
      prompt1: prompt1.substring(0, 50) + '...',
      prompt2: prompt2.substring(0, 50) + '...',
      key1,
      key2,
      keysMatch: key1 === key2,
      sessionId,
      pageNumber,
      storyId,
      avatarType,
      skinTone
    });
    
    return {
      key1,
      key2,
      match: key1 === key2
    };
  }

  /**
   * Clear all caches and log the action
   */
  static clearAllCachesWithLogging(reason: string, sessionId?: string) {
    console.log('🧹 [CACHE DEBUGGER] Clearing all caches:', { reason, sessionId });
    
    try {
      if (sessionId) {
        EnhancedImageCache.clearSession(sessionId);
      } else {
        EnhancedImageCache.clearAll();
      }
      
      // Clear other session storage
      const sessionKeys = Object.keys(sessionStorage);
      const storyKeys = sessionKeys.filter(key => 
        key.includes('story') || key.includes('session') || key.includes('visual')
      );
      
      storyKeys.forEach(key => sessionStorage.removeItem(key));
      
      console.log('✅ [CACHE DEBUGGER] Cache clearing completed:', {
        reason,
        sessionId,
        clearedKeys: storyKeys.length
      });
      
    } catch (error) {
      console.error('❌ [CACHE DEBUGGER] Cache clearing failed:', error);
    }
  }
}

// Global debugging helper for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).CacheDebugger = CacheDebugger;
}