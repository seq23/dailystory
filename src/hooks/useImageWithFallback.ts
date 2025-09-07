import { useState, useEffect, useCallback } from 'react';
import { ImageFallbackService } from '@/services/ImageFallbackService';
import { ImageLoadingManager } from '@/services/ImageLoadingManager';

interface UseImageWithFallbackOptions {
  fallbackText?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export const useImageWithFallback = (
  src: string | undefined,
  options: UseImageWithFallbackOptions = {}
) => {
  const { fallbackText = '📖 Story Illustration', retryAttempts = 1, retryDelay = 1000 } = options;
  
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isManualRetry, setIsManualRetry] = useState(false);
  
  // Check if debug mode is enabled
  const isDebugMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('debug') === '1';

  const debugLog = useCallback((message: string, data?: any) => {
    if (isDebugMode) {
      console.log(`🖼️ useImageWithFallback: ${message}`, data || '');
    }
  }, [isDebugMode]);

  const validateAndSetImage = useCallback(async (url: string): Promise<boolean> => {
    if (!url) return false;

    // Use ImageLoadingManager for deduplication and circuit breaking
    const success = await ImageLoadingManager.loadImage(url, {
      timeout: isDebugMode ? 3000 : 8000, // Faster timeout in debug mode
      isDebugMode,
      onProgress: (stage) => debugLog(stage, { url: url.substring(0, 50) + '...' })
    });

    if (success) {
      debugLog('Image loaded successfully via manager', url);
      setImageSrc(url);
      setIsLoading(false);
      setError(null);
      return true;
    } else {
      debugLog('Image failed to load via manager', url);
      return false;
    }
  }, [debugLog, isDebugMode]);

  const loadImageWithRetry = useCallback(async (url: string) => {
    if (isDebugMode) {
      debugLog('Starting image load', { url, attempt: attempts + 1 });
    }
    
    const success = await validateAndSetImage(url);
    
    if (!success && attempts < retryAttempts) {
      if (isDebugMode) {
        debugLog('Retrying image load', { attempt: attempts + 1, retryDelay });
      }
      setAttempts(prev => prev + 1);
      setTimeout(() => {
        loadImageWithRetry(url);
      }, retryDelay);
      return;
    }
    
    if (!success) {
      if (isDebugMode) {
        debugLog('All retry attempts failed, using fallback');
      }
      setError('Failed to load image after retries');
      const fallbackUrl = ImageFallbackService.getBestFallback({
        text: fallbackText
      });
      setImageSrc(fallbackUrl);
      setIsLoading(false);
    }
  }, [attempts, retryAttempts, retryDelay, fallbackText, validateAndSetImage, debugLog, isDebugMode]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setAttempts(0);
    
    if (!src) {
      debugLog('No src provided, using immediate fallback');
      const fallbackUrl = ImageFallbackService.getBestFallback({
        text: fallbackText
      });
      setImageSrc(fallbackUrl);
      setIsLoading(false);
      return;
    }

    // Check if it's already a fallback image
    if (ImageFallbackService.isFallbackImage(src)) {
      debugLog('Source is already a fallback image');
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    loadImageWithRetry(src);
  }, [src, fallbackText, loadImageWithRetry, debugLog]);

  const manualRetry = useCallback(() => {
    if (!src) return;
    
    debugLog('Manual retry triggered');
    setIsManualRetry(true);
    setError(null);
    setAttempts(0);
    setIsLoading(true);
    
    loadImageWithRetry(src).finally(() => {
      setIsManualRetry(false);
    });
  }, [src, loadImageWithRetry, debugLog]);

  return {
    imageSrc,
    isLoading,
    error,
    isUsingFallback: ImageFallbackService.isFallbackImage(imageSrc) || error !== null,
    manualRetry,
    isManualRetry
  };
};