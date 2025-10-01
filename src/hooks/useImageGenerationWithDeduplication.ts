import { useState, useCallback } from 'react';
import { ImageDeduplicationService } from '@/services/imageDeduplicationService';
import { SimpleImageService } from '@/services/SimpleImageService';
import { DebugLogger } from '@/services/DebugLogger';
import { isAPIResponse, extractImageUrl } from '@/utils/typeGuards';

interface ImageGenerationResult {
  imageUrl: string;
  cached: boolean;
  generationTime?: number;
}

export const useImageGenerationWithDeduplication = (sessionId: string) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useCallback(async (
    prompt: string, 
    pageNumber: number
  ): Promise<ImageGenerationResult> => {
    setIsGenerating(true);

    try {
      // Check for duplicate first
      const cachedImage = ImageDeduplicationService.checkForDuplicate(prompt, sessionId);
      if (cachedImage) {
        DebugLogger.log('image', 'Using cached image for duplicate prompt', { prompt, sessionId });
        return { imageUrl: cachedImage, cached: true };
      }

      // Generate new image
      const startTime = Date.now();
      const result = await SimpleImageService.generateImage({
        prompt,
        sessionId,
        pageNumber
      });

      // Validate API response
      if (!isAPIResponse(result) || !result.success) {
        throw new Error('Invalid image generation response');
      }

      const generationTime = Date.now() - startTime;

      // Extract image URL using universal utility
      const imageUrl = extractImageUrl(result);
      if (!imageUrl) {
        throw new Error('No valid image URL in response');
      }

      // Cache the generated image
      ImageDeduplicationService.cacheImage(prompt, imageUrl, sessionId);

      DebugLogger.log('image', 'New image generated and cached', {
        pageNumber,
        generationTime,
        sessionId
      });

      return { 
        imageUrl, 
        cached: false, 
        generationTime 
      };

    } catch (error) {
      DebugLogger.error('image', 'Image generation failed', { 
        error, 
        prompt, 
        pageNumber 
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [sessionId]);

  const clearSessionImages = useCallback(() => {
    ImageDeduplicationService.clearSessionCache(sessionId);
    DebugLogger.log('image', 'Cleared session image cache', { sessionId });
  }, [sessionId]);

  return {
    generateImage,
    clearSessionImages,
    isGenerating
  };
};