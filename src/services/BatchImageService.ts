// Phase 3: Shared batch processing service for library error recovery
// 
// TIER POLICY COMPLIANCE: All batch-generated images use Tier 1 quality
// The isPremium parameter (passed as false) is for analytics only
// ALL users receive the same high-quality image generation regardless of subscription
import { SimpleImageService } from '@/services/SimpleImageService';
import type { UserInfo } from '@/types';

export interface BatchImageConfig {
  concurrencyLimit?: number;
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
      const result = await SimpleImageService.generateStoryImage(
        pages[pageIndex],
        userInfo,
        undefined, // No session ID for batch
        pageIndex + 1,
        false // For analytics only - all users get Tier 1 quality regardless
      );
          
          if (result.success && result.url) {
            results[pageIndex] = result.url;
          }
          
          completed++;
          onProgress?.(completed, missing.length);
        } catch (error) {
          console.warn(`Failed to generate image for page ${pageIndex}:`, error);
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