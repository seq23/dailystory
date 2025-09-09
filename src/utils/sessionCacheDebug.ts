/**
 * Enhanced Session Cache Debug Console for sessionStorage-based caching
 * Usage: window.sessionCacheDebug.investigate()
 */

class SessionCacheDebugConsoleClass {
  
  /**
   * Investigate current session cache state
   */
  static investigate(sessionId?: string) {
    console.log('🔍 ===== SESSION CACHE INVESTIGATION =====');
    
    // 1. Session Image Cache (sessionStorage)
    console.log('\n📸 Session Image Cache (sessionStorage):');
    const imageCache = sessionStorage.getItem('session_image_cache');
    if (imageCache) {
      try {
        const parsed = JSON.parse(imageCache);
        const keys = Object.keys(parsed);
        console.log(`Total cached images: ${keys.length}`);
        
        keys.forEach((key, index) => {
          const item = parsed[key];
          console.log(`${index + 1}. ${key}:`, {
            sessionId: item.sessionId,
            pageNumber: item.pageNumber,
            age: Math.round((Date.now() - item.timestamp) / 60000) + ' mins',
            url: item.url?.substring(0, 50) + '...'
          });
        });
        
        if (sessionId) {
          const sessionImages = keys.filter(key => parsed[key].sessionId === sessionId);
          console.log(`\n🎯 Session ${sessionId} images: ${sessionImages.length}`);
        }
      } catch (error) {
        console.error('Failed to parse image cache:', error);
      }
    } else {
      console.log('No session image cache found');
    }
    
    // 2. Story Session Cache (sessionStorage)
    console.log('\n📚 Story Session Cache (sessionStorage):');
    const sessionKeys = Object.keys(sessionStorage).filter(key => 
      key.includes('time2read_story_session_')
    );
    console.log(`Story sessions: ${sessionKeys.length}`);
    sessionKeys.forEach(key => {
      console.log(`- ${key}`);
    });
    
    // 3. All sessionStorage keys
    console.log('\n🗄️ All sessionStorage keys:');
    const allKeys = Object.keys(sessionStorage);
    console.log(`Total keys: ${allKeys.length}`);
    allKeys.forEach(key => {
      const size = sessionStorage.getItem(key)?.length || 0;
      console.log(`- ${key}: ${(size / 1024).toFixed(1)}KB`);
    });
    
    // 4. Cache metrics
    console.log('\n📊 Cache Metrics:');
    const totalSize = JSON.stringify(sessionStorage).length;
    console.log(`Total sessionStorage size: ${(totalSize / 1024).toFixed(1)}KB`);
    console.log(`Storage limit approach: ${((totalSize / (5 * 1024 * 1024)) * 100).toFixed(1)}%`);
    
    console.log('\n🔍 ===== END INVESTIGATION =====');
  }
  
  /**
   * Clear problematic session cache
   */
  static clearProblematicCache(sessionId?: string, avatarType?: string) {
    console.log('🧹 Clearing problematic session cache...');
    
    if (sessionId) {
      // Clear session-specific image cache
      const imageCache = sessionStorage.getItem('session_image_cache');
      if (imageCache) {
        try {
          const parsed = JSON.parse(imageCache);
          Object.keys(parsed).forEach(key => {
            if (parsed[key].sessionId === sessionId) {
              delete parsed[key];
            }
          });
          sessionStorage.setItem('session_image_cache', JSON.stringify(parsed));
          console.log(`✅ Cleared images for session: ${sessionId}`);
        } catch (error) {
          console.error('Failed to clear session images:', error);
        }
      }
      
      // Clear story session cache for various avatar types
      const sessionCacheKeys = [
        `time2read_story_session_${sessionId}`,
        `time2read_story_session_${sessionId}_neutral`,
        `time2read_story_session_${sessionId}_${avatarType || 'default'}`
      ];
      
      sessionCacheKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
          console.log(`✅ Cleared: ${key}`);
        }
      });
    } else {
      // Clear all session cache
      sessionStorage.removeItem('session_image_cache');
      Object.keys(sessionStorage)
        .filter(key => key.includes('time2read_story_session_'))
        .forEach(key => sessionStorage.removeItem(key));
      console.log('✅ Cleared all session cache');
    }
  }
  
  /**
   * Test session cache key generation
   */
  static testCacheKey(
    prompt: string, 
    sessionId: string, 
    avatarType: string = 'prefer-not-to-answer',
    skinTone: string = 'medium'
  ) {
    console.log('🔑 Testing session cache key generation...');
    
    // Mimic EnhancedImageCache key generation
    const createPromptHash = (text: string): string => {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    };
    
    const promptHash = createPromptHash(prompt);
    const sessionTimestamp = Date.now().toString(36).substring(0, 8);
    const normalizedAvatarType = avatarType === 'prefer-not-to-answer' ? 'neutral' : avatarType;
    
    const components = {
      promptHash,
      sessionId,
      sessionTimestamp,
      normalizedAvatarType,
      skinTone
    };
    
    const cacheKey = `${promptHash}-${sessionId}-${sessionTimestamp}-av:${normalizedAvatarType}-${skinTone}-p0`;
    
    console.log('Cache key components:', components);
    console.log('Final cache key:', cacheKey);
    
    return cacheKey;
  }
  
  /**
   * Force regenerate current session image
   */
  static forceRegenerateCurrentImage(sessionId: string, pageNumber: number = 0) {
    console.log(`🔄 Force regenerating image for session ${sessionId}, page ${pageNumber}...`);
    
    // Clear the specific session cache
    this.clearProblematicCache(sessionId);
    
    // Clear any related visual state
    Object.keys(sessionStorage)
      .filter(key => key.includes(sessionId) || key.includes('visual_state'))
      .forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Cleared: ${key}`);
      });
    
    console.log('✅ Session cache cleared - reload page to regenerate image');
    
    // Reload page to force fresh generation
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
  
  /**
   * Get storage usage breakdown
   */
  static getStorageBreakdown() {
    console.log('📊 Session Storage Breakdown:');
    
    const breakdown: Record<string, number> = {};
    Object.keys(sessionStorage).forEach(key => {
      const value = sessionStorage.getItem(key);
      const size = value ? value.length : 0;
      breakdown[key] = size;
    });
    
    // Sort by size
    const sorted = Object.entries(breakdown)
      .sort(([,a], [,b]) => b - a)
      .map(([key, size]) => ({ key, size: (size / 1024).toFixed(1) + 'KB' }));
    
    console.table(sorted);
    
    const total = Object.values(breakdown).reduce((sum, size) => sum + size, 0);
    console.log(`Total: ${(total / 1024).toFixed(1)}KB`);
    
    return breakdown;
  }
}

// Make available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).sessionCacheDebug = SessionCacheDebugConsoleClass;
}

export default SessionCacheDebugConsoleClass;