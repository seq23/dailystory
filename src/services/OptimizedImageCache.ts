/**
 * PERFORMANCE OPTIMIZATION: Fast memory-based image cache
 * Replaces slower IndexedDB for simple content-based caching
 */

import { DebugLogger } from '@/services/DebugLogger';

interface FastCacheEntry {
  imageUrl: string;
  timestamp: number;
  contentHash: string;
  sessionId: string;
}

export class OptimizedImageCache {
  private static cache = new Map<string, FastCacheEntry>();
  private static storySeedCache = new Map<string, number>();
  private static readonly MAX_CACHE_SIZE = 200; // Increased capacity
  private static readonly CACHE_DURATION = 1800000; // 30 minutes
  private static readonly SIMPLE_CONTENT_THRESHOLD = 50; // Characters
  
  /**
   * Fast hash function optimized for image cache lookups
   */
  private static generateContentHash(content: string, sessionId: string): string {
    const normalized = content.toLowerCase().trim().replace(/\s+/g, ' ');
    let hash = 0;
    
    // Fast hash algorithm
    for (let i = 0; i < normalized.length; i++) {
      hash = ((hash << 5) - hash + normalized.charCodeAt(i)) & 0x7fffffff;
    }
    
    return `${sessionId}_${hash.toString(36)}`;
  }
  
  /**
   * Check cache with content-based key instead of session-based
   */
  static getCachedImage(content: string, sessionId: string): string | null {
    // Skip cache for complex content that changes frequently
    if (content.length > 500) {
      return null;
    }
    
    const cacheKey = this.generateContentHash(content, sessionId);
    const entry = this.cache.get(cacheKey);
    
    if (entry && Date.now() - entry.timestamp < this.CACHE_DURATION) {
      DebugLogger.log('image', '⚡ Fast cache hit', { contentLength: content.length });
      return entry.imageUrl;
    }
    
    // Clean expired entries during lookup for efficiency
    if (entry && Date.now() - entry.timestamp >= this.CACHE_DURATION) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }
  
  /**
   * Store image with aggressive eviction for performance
   */
  static cacheImage(content: string, imageUrl: string, sessionId: string): void {
    const cacheKey = this.generateContentHash(content, sessionId);
    
    // Aggressive LRU eviction when cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const keysToDelete = Array.from(this.cache.keys()).slice(0, 20); // Remove 20 oldest
      keysToDelete.forEach(key => this.cache.delete(key));
    }
    
    this.cache.set(cacheKey, {
      imageUrl,
      timestamp: Date.now(),
      contentHash: cacheKey,
      sessionId
    });
    
    DebugLogger.log('image', '⚡ Fast cache store', { 
      contentLength: content.length,
      cacheSize: this.cache.size 
    });
  }
  
  /**
   * Clear session cache faster than IndexedDB
   */
  static clearSessionCache(sessionId: string): void {
    let deletedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.sessionId === sessionId) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    this.clearStorySeed(sessionId);
    DebugLogger.log('image', '⚡ Fast session cache cleared', { deletedCount });
  }
  
  /**
   * Get stored seed for story session (visual consistency)
   */
  static getStorySeed(sessionId: string): number | null {
    return this.storySeedCache.get(sessionId) || null;
  }
  
  /**
   * Store seed for story session
   */
  static setStorySeed(sessionId: string, seed: number): void {
    this.storySeedCache.set(sessionId, seed);
    DebugLogger.log('image', '🌱 Story seed stored', { sessionId, seed });
  }
  
  /**
   * Clear story seed (called on "Next Story" or "End Session")
   */
  static clearStorySeed(sessionId: string): void {
    this.storySeedCache.delete(sessionId);
    DebugLogger.log('image', '🌱 Story seed cleared', { sessionId });
  }
  
  /**
   * Validate seed consistency - warn about mismatches
   */
  static validateSeedConsistency(sessionId: string, newSeed: number): boolean {
    const existingSeed = this.storySeedCache.get(sessionId);
    if (existingSeed && existingSeed !== newSeed) {
      DebugLogger.warn('image', '⚠️ SEED MISMATCH DETECTED', {
        sessionId,
        existingSeed,
        newSeed,
        impact: 'Character appearance may change'
      });
      return false;
    }
    return true;
  }
  
  /**
   * Skip content processing for simple content
   */
  static shouldSkipProcessing(content: string): boolean {
    return content.length < this.SIMPLE_CONTENT_THRESHOLD;
  }
  
  /**
   * Preemptive cache warming for common patterns
   */
  static warmCache(commonPatterns: string[], sessionId: string): void {
    // This could be called with common story patterns to pre-warm cache
    DebugLogger.log('image', '⚡ Cache warming started', { 
      patterns: commonPatterns.length 
    });
  }
  
  /**
   * Get cache statistics for monitoring
   */
  static getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const entry of this.cache.values()) {
      if (now - entry.timestamp < this.CACHE_DURATION) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      hitRatio: validEntries / this.cache.size || 0
    };
  }
}