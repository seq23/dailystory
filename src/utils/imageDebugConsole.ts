/**
 * Image debugging console utility
 * Provides window.imageDebug methods for live inspection of image loading issues
 */

interface ImageDebugInfo {
  sessionIds: {
    stable: string;
    character: string;
  };
  currentPage: number;
  pageImages: Record<number, string>;
  loadingManagerStats: any;
  cacheMetrics: any;
}

class ImageDebugConsoleClass {
  /**
   * Get comprehensive image debug information
   */
  static getDebugInfo(): ImageDebugInfo | null {
    try {
      // Try to access current session state from component
      const stableSessionId = sessionStorage.getItem('current_stable_session_id');
      const characterSessionId = sessionStorage.getItem('current_character_session_id');
      const currentPage = parseInt(sessionStorage.getItem('current_page') || '0');
      
      // Get loading manager stats
      const { ImageLoadingManager } = require('@/services/ImageLoadingManager');
      const loadingStats = ImageLoadingManager.getStats();
      
      // Get cache metrics
      const { EnhancedImageCache } = require('@/services/enhancedImageCache');
      const cacheMetrics = EnhancedImageCache.getCacheMetrics();
      
      return {
        sessionIds: {
          stable: stableSessionId || 'not-found',
          character: characterSessionId || 'not-found'
        },
        currentPage,
        pageImages: JSON.parse(sessionStorage.getItem('current_page_images') || '{}'),
        loadingManagerStats: loadingStats,
        cacheMetrics
      };
    } catch (error) {
      console.error('Failed to get image debug info:', error);
      return null;
    }
  }
  
  /**
   * Check for session ID mismatches (the main issue we fixed)
   */
  static checkSessionMismatch(): void {
    const info = this.getDebugInfo();
    if (!info) return;
    
    const { stable, character } = info.sessionIds;
    
    console.log('🔍 Image Session ID Analysis:');
    console.log(`  Stable Session ID: ${stable}`);
    console.log(`  Character Session ID: ${character}`);
    
    if (stable !== character && character !== 'not-found') {
      console.warn('⚠️ SESSION MISMATCH DETECTED! This was the bug causing images to break after page 1');
      console.log('  Images are generated with stableSessionId but loaded with characterSessionId');
      console.log('  This should be FIXED now - both should use stableSessionId');
    } else if (stable === character) {
      console.log('✅ Session IDs match - image loading should work correctly');
    } else {
      console.log('ℹ️ Character session ID not tracked (normal for current fix)');
    }
  }
  
  /**
   * Inspect cache state for current session
   */
  static inspectCache(sessionId?: string): void {
    try {
      const { EnhancedImageCache } = require('@/services/enhancedImageCache');
      const targetSessionId = sessionId || sessionStorage.getItem('current_stable_session_id');
      
      if (!targetSessionId) {
        console.warn('No session ID provided and none found in storage');
        return;
      }
      
      const sessionImages = EnhancedImageCache.getSessionImages(targetSessionId);
      console.log(`🖼️ Cached images for session ${targetSessionId}:`, sessionImages);
      
      if (sessionImages.length === 0) {
        console.log('No cached images found for this session');
      } else {
        console.log(`Found ${sessionImages.length} cached images`);
      }
      
    } catch (error) {
      console.error('Failed to inspect cache:', error);
    }
  }
  
  /**
   * Clear cache for current session (useful for testing)
   */
  static clearCurrentCache(): void {
    try {
      const { EnhancedImageCache } = require('@/services/enhancedImageCache');
      const sessionId = sessionStorage.getItem('current_stable_session_id');
      
      if (sessionId) {
        EnhancedImageCache.clearSession(sessionId);
        console.log(`🧹 Cleared cache for session: ${sessionId}`);
      } else {
        console.warn('No current session ID found');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
  
  /**
   * Get full debug report
   */
  static getFullReport(): void {
    console.log('🔍 === IMAGE DEBUG REPORT ===');
    this.checkSessionMismatch();
    
    const info = this.getDebugInfo();
    if (info) {
      console.log('📊 Current State:', {
        currentPage: info.currentPage,
        imagesLoaded: Object.keys(info.pageImages).length,
        loadingManagerStats: info.loadingManagerStats,
        cacheMetrics: info.cacheMetrics
      });
    }
    
    console.log('📋 Available commands:');
    console.log('  window.imageDebug.checkSessionMismatch() - Check for session ID issues');
    console.log('  window.imageDebug.inspectCache(sessionId?) - View cached images');
    console.log('  window.imageDebug.clearCurrentCache() - Clear current session cache');
    console.log('  window.imageDebug.getFullReport() - Show this report');
  }
}

// Make available globally
declare global {
  interface Window {
    imageDebug: typeof ImageDebugConsoleClass;
  }
}

if (typeof window !== 'undefined') {
  window.imageDebug = ImageDebugConsoleClass;
  console.log('🔧 Image Debug Console Available:');
  console.log('  window.imageDebug.getFullReport() - Get comprehensive debug info');
  console.log('  window.imageDebug.checkSessionMismatch() - Check for session ID issues');
}

export { ImageDebugConsoleClass };