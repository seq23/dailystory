// Shared batch processing service for library error recovery.
// One image path for everyone — see StoryImageService.
import { StoryImageService } from '@/services/StoryImageService';
import type { UserInfo } from '@/types';
import { DebugLogger } from '@/services/DebugLogger';

export interface BatchImageConfig {
  concurrencyLimit?: number;
  sessionId?: string;
  onProgress?: (completed: number, total: number) => void;
  onError?: (pageIndex: number, error: any) => void;
}

export class BatchImageService {
  static async generateMissingImages(
    pages: string[],
    existingImages: Record<number, string>,
    userInfo: UserInfo,
    config: BatchImageConfig = {}
  ): Promise<Record<number, string>> {
    const { concurrencyLimit = 4, onProgress, onError } = config;
    const sessionId = config.sessionId ?? `batch-${Date.now()}`;
    const missing = pages.map((_, i) => i).filter(i => !existingImages[i]);
    
    if (!missing.length) return existingImages;
    
    const results = { ...existingImages };
    const batches: number[][] = [];
    
    // Split into batches for controlled concurrency
    for (let i = 0; i < missing.length; i += concurrencyLimit) {
      batches.push(missing.slice(i, i + concurrencyLimit));
    }
    
    let completed = 0;
    
    for (const batch of batches) {
      const promises = batch.map(async (pageIndex) => {
        try {
          const result = await StoryImageService.generateStoryImage(
            pages[pageIndex],
            userInfo as unknown as Record<string, unknown>,
            sessionId,
            pageIndex + 1
          );
          
          if (result.success && result.url) {
            results[pageIndex] = result.url;
          }
          
          completed++;
          onProgress?.(completed, missing.length);
        } catch (error) {
          DebugLogger.warn('image', `Failed to generate image for page ${pageIndex}`, error);
          onError?.(pageIndex, error);
          completed++;
          onProgress?.(completed, missing.length);
        }
      });
      
      await Promise.allSettled(promises);
    }
    
    return results;
  }
}