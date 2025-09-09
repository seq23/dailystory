/**
 * Cache Debug Console for sessionStorage-based image and story cache debugging
 * Usage: window.cacheDebug.investigate()
 */

import SessionCacheDebugConsoleClass from './sessionCacheDebug';

class CacheDebugConsoleClass {
  
  /**
   * @deprecated Use window.sessionCacheDebug.investigate() instead
   */
  static investigateCache(sessionId?: string) {
    console.warn('⚠️ cacheDebugConsole is deprecated. Use sessionCacheDebug instead.');
    console.log('📋 Redirecting to session-based cache debugging...');
    return SessionCacheDebugConsoleClass.investigate(sessionId);
  }

  /**
   * @deprecated Use window.sessionCacheDebug.clearProblematicCache() instead
   */
  static clearProblematicCache(sessionId?: string, avatarType?: string) {
    console.warn('⚠️ cacheDebugConsole is deprecated. Use sessionCacheDebug instead.');
    return SessionCacheDebugConsoleClass.clearProblematicCache(sessionId, avatarType);
  }

  /**
   * @deprecated Use window.sessionCacheDebug.testCacheKey() instead
   */
  static testCacheKey(prompt: string, sessionId: string, avatarType: string = 'prefer-not-to-answer', skinTone: string = 'medium') {
    console.warn('⚠️ cacheDebugConsole is deprecated. Use sessionCacheDebug instead.');
    return SessionCacheDebugConsoleClass.testCacheKey(prompt, sessionId, avatarType, skinTone);
  }

  /**
   * @deprecated Use window.sessionCacheDebug.forceRegenerateCurrentImage() instead
   */
  static forceRegenerateCurrentImage(sessionId: string, pageNumber: number = 0) {
    console.warn('⚠️ cacheDebugConsole is deprecated. Use sessionCacheDebug instead.');
    return SessionCacheDebugConsoleClass.forceRegenerateCurrentImage(sessionId, pageNumber);
  }
}

// Make both available globally for transition period
if (typeof window !== 'undefined') {
  (window as any).cacheDebug = {
    investigate: CacheDebugConsoleClass.investigateCache,
    clear: CacheDebugConsoleClass.clearProblematicCache,
    testKey: CacheDebugConsoleClass.testCacheKey,
    forceRegenerate: CacheDebugConsoleClass.forceRegenerateCurrentImage,
  };
  (window as any).sessionCacheDebug = SessionCacheDebugConsoleClass; // New preferred method
  
  console.log('🔧 Session Cache Debug Console Available:');
  console.log('  window.sessionCacheDebug.investigate(sessionId?) - Investigate session cache state');
  console.log('  window.sessionCacheDebug.clearProblematicCache(sessionId?, avatarType?) - Clear problematic cache');
  console.log('  window.sessionCacheDebug.testCacheKey(prompt, sessionId, avatarType, skinTone) - Test cache key generation');
  console.log('  window.sessionCacheDebug.forceRegenerateCurrentImage(sessionId, pageNumber?) - Force regenerate image');
  console.log('  window.sessionCacheDebug.getStorageBreakdown() - Get storage usage breakdown');
}

export const CacheDebugConsole = CacheDebugConsoleClass;