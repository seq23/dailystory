/**
 * Story Cache Integration Service
 * Manages the bridge between story persistence and image caching
 */

import { DebugLogger } from '@/services/DebugLogger';
import { EnhancedImageCache } from './enhancedImageCache';
import { ProductionLogging } from '@/services/ProductionLogger';

export interface StoryImageMetadata {
  storyHash: string;
  cacheKeys: string[];
  generationTimestamps: Record<number, number>;
  totalPages: number;
}

export class StoryCacheIntegration {
  /**
   * Generate consistent hash for story content
   */
  static generateStoryHash(story: string[]): string {
    const content = story.join('|');
    // Simple hash function for browser compatibility
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  }

  /**
   * Cache all story images with story hash
   */
  static async cacheStoryImages(
    storyHash: string,
    pageImages: Record<number, string>,
    sessionId: string
  ): Promise<StoryImageMetadata> {
    const cacheKeys: string[] = [];
    const generationTimestamps: Record<number, number> = {};

    // Cache each image with story hash
    for (const [pageIndex, imageUrl] of Object.entries(pageImages)) {
      const pageNum = parseInt(pageIndex);
      const prompt = `story-page-${pageNum}-${storyHash}`;
      
      EnhancedImageCache.cacheImage(prompt, imageUrl, sessionId, pageNum, storyHash);
      cacheKeys.push(prompt);
      generationTimestamps[pageNum] = Date.now();
    }

    DebugLogger.log('story', 'Story images cached', {
      storyHash,
      totalImages: cacheKeys.length,
      sessionId
    });

    return {
      storyHash,
      cacheKeys,
      generationTimestamps,
      totalPages: Object.keys(pageImages).length
    };
  }

  /**
   * Load story images from cache using story hash
   */
  static async loadStoryImages(
    storyHash: string,
    pageCount: number,
    sessionId?: string
  ): Promise<Record<number, string>> {
    const loadedImages: Record<number, string> = {};

    // Try to load each page image from cache
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      const prompt = `story-page-${pageIndex}-${storyHash}`;
      
      // Try with original session first if provided
      let cachedUrl = sessionId 
        ? EnhancedImageCache.getCachedImage(prompt, sessionId, pageIndex)
        : null;

      // If not found with session, try to find any cached version
      if (!cachedUrl) {
        const sessionImages = EnhancedImageCache.getSessionImages('');
        const matchingImage = sessionImages.find(img => 
          img.pageNumber === pageIndex && 
          EnhancedImageCache.getCachedImage(prompt, '', pageIndex)
        );
        cachedUrl = matchingImage?.url || null;
      }

      if (cachedUrl) {
        loadedImages[pageIndex] = cachedUrl;
      }
    }

    ProductionLogging.debug('STORY_CACHE', 'Story images loaded from cache', 'StoryCacheIntegration', {
      storyHash,
      loadedCount: Object.keys(loadedImages).length,
      totalPages: pageCount
    });

    return loadedImages;
  }

  /**
   * Validate URLs and fallback to cache when needed
   */
  static async validateAndFallback(
    images: Record<number, string>,
    storyHash: string
  ): Promise<Record<number, string>> {
    const validatedImages: Record<number, string> = {};

    for (const [pageIndex, imageUrl] of Object.entries(images)) {
      const pageNum = parseInt(pageIndex);
      
      try {
        // Quick validation - check if URL is accessible
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok) {
          validatedImages[pageNum] = imageUrl;
          continue;
        }
      } catch (error) {
        ProductionLogging.warn('STORY_CACHE', `Image validation failed for page ${pageNum}`, 'StoryCacheIntegration', { error });
      }

      // Fallback to cache
      const prompt = `story-page-${pageNum}-${storyHash}`;
      const cachedUrl = EnhancedImageCache.getCachedImage(prompt, '', pageNum);
      
      if (cachedUrl) {
        validatedImages[pageNum] = cachedUrl;
        ProductionLogging.debug('STORY_CACHE', `Using cached fallback for page ${pageNum}`, 'StoryCacheIntegration');
      } else {
        ProductionLogging.warn('STORY_CACHE', `No cached fallback available for page ${pageNum}`, 'StoryCacheIntegration');
      }
    }

    return validatedImages;
  }

  /**
   * Get cached images for a specific story hash
   */
  static getStoryCachedImages(storyHash: string): Record<number, string> {
    const map = EnhancedImageCache['getCacheMap']();
    const storyImages: Record<number, string> = {};

    for (const [key, cachedImage] of map.entries()) {
      if (cachedImage.storyHash === storyHash && cachedImage.pageNumber !== undefined) {
        storyImages[cachedImage.pageNumber] = cachedImage.url;
      }
    }

    return storyImages;
  }

  /**
   * Clean up old story cache entries
   */
  static cleanupOldStories(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const map = EnhancedImageCache['getCacheMap']();
    const now = Date.now();
    let removed = 0;

    for (const [key, cachedImage] of map.entries()) {
      if (cachedImage.storyHash && (now - cachedImage.timestamp) > maxAge) {
        map.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      EnhancedImageCache['saveCacheMap'](map);
      ProductionLogging.debug('STORY_CACHE', `Cleaned up ${removed} old story cache entries`, 'StoryCacheIntegration');
    }
  }
}