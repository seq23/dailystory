/**
 * Enhanced Image Cache Service for story generation
 * Handles cache management, clearing, and backward navigation support
 */

interface CachedImage {
  url: string;
  timestamp: number;
  sessionId: string;
  pageNumber?: number;
  storyHash?: string;
}

interface CacheMetrics {
  totalImages: number;
  sessionImages: number;
  oldestTimestamp: number;
  newestTimestamp: number;
}

export class EnhancedImageCache {
  private static readonly CACHE_KEY = 'session_image_cache';
  private static readonly MAX_CACHE_SIZE = 100; // Maximum cached images
  private static readonly CACHE_EXPIRY_HOURS = 24; // 24 hours cache lifetime (now session-scoped)
  private static readonly MAX_SESSION_IMAGES = 20; // Per session limit

  /**
   * Get cached images map
   */
  private static getCacheMap(): Map<string, CachedImage> {
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (!cached) return new Map();
      
      const data = JSON.parse(cached);
      const map = new Map<string, CachedImage>();
      
      // Convert array back to Map and filter expired entries
      const now = Date.now();
      const expiryTime = this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
      
      Object.entries(data).forEach(([key, value]) => {
        const item = value as CachedImage;
        if (now - item.timestamp < expiryTime) {
          map.set(key, item);
        }
      });
      
      return map;
    } catch (error) {
      console.warn('Failed to load image cache:', error);
      return new Map();
    }
  }

  /**
   * Save cached images map
   */
  private static saveCacheMap(map: Map<string, CachedImage>): void {
    try {
      // Enforce size limits
      if (map.size > this.MAX_CACHE_SIZE) {
        // Remove oldest entries
        const entries = Array.from(map.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toKeep = entries.slice(-this.MAX_CACHE_SIZE);
        map.clear();
        toKeep.forEach(([key, value]) => map.set(key, value));
      }

      // Convert Map to object for storage
      const data = Object.fromEntries(map);
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
      
      console.log('📸 Image cache saved:', {
        totalImages: map.size,
        cacheSize: JSON.stringify(data).length
      });
    } catch (error) {
      console.error('Failed to save image cache:', error);
      // If storage is full, try clearing old entries
      this.clearExpiredEntries();
    }
  }

  /**
   * Generate session-isolated cache key with microsecond precision for unique story instances
   */
  private static generateCacheKey(
    prompt: string, 
    sessionId: string, 
    pageNumber?: number, 
    storyId?: string, 
    contextualMarkers?: string,
    avatarType?: string,
    skinTone?: string
  ): string {
    // Create a hash of prompt for consistent length
    const promptHash = this.createPromptHash(prompt);
    
    // CRITICAL FIX: Use session-deterministic timestamp instead of dynamic timestamp
    // Create a session-unique but story-specific identifier using microseconds + random seed
    const sessionSeed = this.getSessionSeed(sessionId);
    const storyInstanceId = storyId ? 
      `${this.createPromptHash(storyId)}-${sessionSeed}` : 
      `${sessionSeed}-${Date.now().toString(36).slice(-4)}`;
    
    const baseKey = `${promptHash}-${sessionId}-${storyInstanceId}`;
    
    // Enhanced story hash for better cross-story isolation
    const contextKey = contextualMarkers ? `${baseKey}-ctx:${this.createPromptHash(contextualMarkers)}` : baseKey;
    
    // Add avatar awareness to prevent cross-avatar contamination
    const normalizedAvatarType = avatarType === 'prefer-not-to-answer' ? 'neutral' : (avatarType || 'default');
    const avatarKey = (normalizedAvatarType && skinTone) ? `${contextKey}-av:${normalizedAvatarType}-${skinTone}` : contextKey;
    
    return pageNumber !== undefined ? `${avatarKey}-p${pageNumber}` : avatarKey;
  }

  /**
   * Get deterministic session seed for consistent cache keys within session
   */
  private static getSessionSeed(sessionId: string): string {
    // Create deterministic but session-unique seed
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      const char = sessionId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 6);
  }

  /**
   * Create a consistent hash from prompt text for cache keys
   */
  private static createPromptHash(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Cache an image with story continuity context and avatar awareness
   */
  static cacheImage(
    prompt: string, 
    imageUrl: string, 
    sessionId: string, 
    pageNumber?: number,
    storyHash?: string,
    storyId?: string,
    contextualMarkers?: string,
    avatarType?: string,
    skinTone?: string
  ): void {
    try {
      const map = this.getCacheMap();
      const key = this.generateCacheKey(prompt, sessionId, pageNumber, storyId, contextualMarkers, avatarType, skinTone);
      
      // Check session image limit
      const sessionImages = Array.from(map.values()).filter(img => img.sessionId === sessionId);
      if (sessionImages.length >= this.MAX_SESSION_IMAGES) {
        // Remove oldest session image
        const oldest = sessionImages.sort((a, b) => a.timestamp - b.timestamp)[0];
        const oldestKey = Array.from(map.entries()).find(([, value]) => value === oldest)?.[0];
        if (oldestKey) map.delete(oldestKey);
      }

      map.set(key, {
        url: imageUrl,
        timestamp: Date.now(),
        sessionId,
        pageNumber,
        storyHash
      });

      this.saveCacheMap(map);
      
      console.log('📸 Image cached:', {
        key,
        sessionId,
        pageNumber,
        totalCached: map.size
      });
    } catch (error) {
      console.error('Failed to cache image:', error);
    }
  }

  /**
   * Get cached image with story continuity validation and avatar checking
   */
  static getCachedImage(
    prompt: string, 
    sessionId: string, 
    pageNumber?: number, 
    storyId?: string, 
    contextualMarkers?: string,
    avatarType?: string,
    skinTone?: string
  ): string | null {
    try {
      const map = this.getCacheMap();
      const key = this.generateCacheKey(prompt, sessionId, pageNumber, storyId, contextualMarkers, avatarType, skinTone);
      const cached = map.get(key);

      // Avatar validation: reject cached images if avatar doesn't match
      if (cached && avatarType && skinTone) {
        const keyContainsAvatar = key.includes(`av:${avatarType}-${skinTone}`);
        if (!keyContainsAvatar) {
          console.log('📸 Image cache rejected due to avatar mismatch:', { 
            key, 
            expectedAvatar: `${avatarType}-${skinTone}`,
            sessionId, 
            pageNumber 
          });
          return null;
        }
      }
      
      if (cached) {
        // Additional validation: check if contextual markers have changed significantly
        if (contextualMarkers && pageNumber && pageNumber > 1) {
          // For pages beyond the first, validate story continuity
          const isValidContext = this.validateStoryContinuity(cached, contextualMarkers);
          if (!isValidContext) {
            console.log('📸 Image cache invalidated due to context mismatch:', { key, sessionId, pageNumber });
            map.delete(key);
            this.saveCacheMap(map);
            return null;
          }
        }
        
        console.log('📸 Image cache hit:', { key, sessionId, pageNumber, contextValidated: !!contextualMarkers });
        return cached.url;
      }
      
      console.log('📸 Image cache miss:', { key, sessionId, pageNumber });
      return null;
    } catch (error) {
      console.error('Failed to get cached image:', error);
      return null;
    }
  }

  /**
   * Clear all cached images for a specific session (e.g., when starting new story)
   */
  static clearSession(sessionId: string): void {
    try {
      const map = this.getCacheMap();
      const initialSize = map.size;
      
      // Remove all entries for this session
      for (const [key, value] of map.entries()) {
        if (value.sessionId === sessionId) {
          map.delete(key);
        }
      }
      
      this.saveCacheMap(map);
      
      console.log('📸 Session cache cleared:', {
        sessionId,
        removedImages: initialSize - map.size,
        remainingImages: map.size
      });
    } catch (error) {
      console.error('Failed to clear session cache:', error);
    }
  }

  /**
   * Clear all cached images for a specific story hash
   */
  static clearStory(storyHash: string): void {
    try {
      const map = this.getCacheMap();
      const initialSize = map.size;
      
      // Remove all entries for this story
      for (const [key, value] of map.entries()) {
        if (value.storyHash === storyHash) {
          map.delete(key);
        }
      }
      
      this.saveCacheMap(map);
      
      console.log('📸 Story cache cleared:', {
        storyHash,
        removedImages: initialSize - map.size,
        remainingImages: map.size
      });
    } catch (error) {
      console.error('Failed to clear story cache:', error);
    }
  }

  /**
   * Clear story images but preserve character seeds for avatar consistency
   */
  static clearStoryImagesKeepCharacterSeeds(sessionId: string, avatarType?: string): void {
    const map = this.getCacheMap();
    const before = map.size;
    
    // Only clear story-specific images, preserve character-related caches
    for (const [key, value] of map.entries()) {
      if (value.sessionId === sessionId) {
        // Check if this is a character consistency marker that should be preserved
        const isCharacterSeed = key.includes('character') || key.includes('avatar') || key.includes(avatarType || '');
        if (!isCharacterSeed) {
          map.delete(key);
        }
      }
    }
    
    this.saveCacheMap(map);
    const cleared = before - map.size;
    
    console.log(`🖼️ Cleared ${cleared} story images, preserved character seeds for session: ${sessionId}`);
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredEntries(): void {
    try {
      const map = this.getCacheMap(); // This already filters expired entries
      this.saveCacheMap(map);
      
      console.log('📸 Expired cache entries cleared');
    } catch (error) {
      console.error('Failed to clear expired entries:', error);
    }
  }

  /**
   * Clear all cached images (now clears sessionStorage)
   */
  static clearAll(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY);
      console.log('📸 All session image cache cleared');
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * Get cache metrics
   */
  static getCacheMetrics(): CacheMetrics {
    try {
      const map = this.getCacheMap();
      const timestamps = Array.from(map.values()).map(img => img.timestamp);
      
      return {
        totalImages: map.size,
        sessionImages: 0, // Would need sessionId to calculate
        oldestTimestamp: timestamps.length > 0 ? Math.min(...timestamps) : 0,
        newestTimestamp: timestamps.length > 0 ? Math.max(...timestamps) : 0
      };
    } catch (error) {
      console.error('Failed to get cache metrics:', error);
      return {
        totalImages: 0,
        sessionImages: 0,
        oldestTimestamp: 0,
        newestTimestamp: 0
      };
    }
  }

  /**
   * Get all images for a session (for backward navigation)
   */
  static getSessionImages(sessionId: string): Array<{ pageNumber?: number; url: string; timestamp: number }> {
    try {
      const map = this.getCacheMap();
      return Array.from(map.values())
        .filter(img => img.sessionId === sessionId)
        .sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0))
        .map(img => ({
          pageNumber: img.pageNumber,
          url: img.url,
          timestamp: img.timestamp
        }));
    } catch (error) {
      console.error('Failed to get session images:', error);
      return [];
    }
  }

  /**
   * Get cached images for a specific story hash
   */
  static getStoryCachedImages(storyHash: string): Record<number, string> {
    try {
      const map = this.getCacheMap();
      const storyImages: Record<number, string> = {};

      for (const [key, cachedImage] of map.entries()) {
        if (cachedImage.storyHash === storyHash && cachedImage.pageNumber !== undefined) {
          storyImages[cachedImage.pageNumber] = cachedImage.url;
        }
      }

      console.log('📸 Story cache retrieved:', { storyHash, imageCount: Object.keys(storyImages).length });
      return storyImages;
    } catch (error) {
      console.error('Failed to get story cached images:', error);
      return {};
    }
  }

  /**
   * Cache image with story hash and avatar awareness
   */
  static cacheImageWithStoryHash(
    prompt: string,
    imageUrl: string,
    storyHash: string,
    pageNumber: number,
    sessionId: string = 'story-cache',
    storyId?: string,
    avatarType?: string,
    skinTone?: string
  ): void {
    this.cacheImage(prompt, imageUrl, sessionId, pageNumber, storyHash, storyId, undefined, avatarType, skinTone);
  }

  /**
   * Validate story continuity for cached images with enhanced story-image alignment
   */
  private static validateStoryContinuity(cached: CachedImage, currentMarkers: string): boolean {
    // Simple validation: if we have contextual markers, they should remain consistent
    // This prevents using images from different story contexts
    if (!currentMarkers) return true;
    
    // Extract key elements that should remain consistent
    const currentElements = currentMarkers.toLowerCase().split(',').map(s => s.trim());
    const timeAgo = Date.now() - cached.timestamp;
    
    // Enhanced story alignment validation - check for story content fingerprint match
    const storyFingerprint = this.extractStoryFingerprint(currentMarkers);
    const cachedFingerprint = cached.storyHash || 'unknown';
    
    // If story content has changed significantly, invalidate cache
    if (storyFingerprint !== cachedFingerprint && timeAgo > 2 * 60 * 1000) {
      console.log('📸 Story content fingerprint mismatch:', {
        current: storyFingerprint,
        cached: cachedFingerprint,
        ageMinutes: Math.round(timeAgo / 60000)
      });
      return false;
    }
    
    // Allow flexibility for very recent images (within 2 minutes) to handle story post-processing
    if (timeAgo < 2 * 60 * 1000) {
      return true;
    }
    
    // For older cached images, be more strict about context matching
    return currentElements.length > 0 && currentElements.some(element => 
      cachedFingerprint.includes(element) || storyFingerprint.includes(element)
    );
  }

  /**
   * Extract story fingerprint for content alignment validation
   */
  private static extractStoryFingerprint(markers: string): string {
    if (!markers) return 'default';
    
    // Create a normalized fingerprint from story markers
    const elements = markers.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    return elements.sort().join('-');
  }

  /**
   * Extract story continuity markers from text
   */
  static extractStoryMarkers(text: string, userInfo?: any): string {
    const markers: string[] = [];
    
    // CRITICAL FIX: Validate text parameter to prevent runtime errors
    if (!text || typeof text !== 'string') {
      console.warn('⚠️ extractStoryMarkers called with invalid text:', text);
      // Return user info markers only if text is invalid
      if (userInfo?.avatar?.type) {
        const fallbackMarkers = [userInfo.avatar.type];
        if (userInfo.avatar.skinTone) {
          fallbackMarkers.push(userInfo.avatar.skinTone);
        }
        return fallbackMarkers.join(',').toLowerCase();
      }
      return 'default';
    }
    
    // Extract key visual elements that should remain consistent
    const colorMatches = text.match(/\b(red|blue|green|yellow|purple|pink|orange|brown|black|white|colorful)\b/gi);
    const objectMatches = text.match(/\b(ball|car|bike|tree|house|animal|bird|dog|cat|flower)\b/gi);
    const settingMatches = text.match(/\b(park|hill|forest|home|school|yard|garden|beach)\b/gi);
    
    if (colorMatches) markers.push(...colorMatches.slice(0, 2));
    if (objectMatches) markers.push(...objectMatches.slice(0, 2)); 
    if (settingMatches) markers.push(...settingMatches.slice(0, 1));
    
    // Add user avatar type AND skin tone for character consistency
    if (userInfo?.avatar?.type) {
      markers.push(userInfo.avatar.type);
      if (userInfo.avatar.skinTone) {
        markers.push(userInfo.avatar.skinTone);
      }
    }
    
    return markers.join(',').toLowerCase();
  }

  /**
   * Check if cache is approaching storage limits (now checks sessionStorage)
   */
  static isStorageNearLimit(): boolean {
    try {
      // Check sessionStorage usage (rough estimate)
      const used = JSON.stringify(sessionStorage).length;
      const limit = 5 * 1024 * 1024; // 5MB rough limit for sessionStorage
      return used > limit * 0.8; // 80% threshold
    } catch {
      return false;
    }
  }

  /**
   * Clear images for story transition while preserving user session
   * Used for guest "Next Story" and premium "New Story" actions
   */
  static clearForStoryTransition(sessionId: string): void {
    try {
      const map = this.getCacheMap();
      const initialSize = map.size;
      
      // Remove all images for this session to start fresh story
      for (const [key, value] of map.entries()) {
        if (value.sessionId === sessionId) {
          map.delete(key);
        }
      }
      
      this.saveCacheMap(map);
      
      console.log('📸 Story transition cache cleared:', {
        sessionId,
        removedImages: initialSize - map.size,
        remainingImages: map.size
      });
    } catch (error) {
      console.error('Failed to clear story transition cache:', error);
    }
  }

  /**
   * Clear images for premium story "Finish" while preserving for navigation
   * Premium users can still navigate after finishing their story
   */
  static clearForPremiumFinish(sessionId: string): void {
    // For premium users, "Finish Story" does NOT clear cache
    // Images are preserved until they start a new story or end session
    console.log('📸 Premium finish: Images preserved for navigation');
  }
}

export default EnhancedImageCache;