import { useState, useEffect, useCallback } from 'react';
import { ImageFallbackService } from '@/services/ImageFallbackService';

interface UseImageWithFallbackOptions {
  fallbackText?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export const useImageWithFallback = (
  src: string | undefined,
  options: UseImageWithFallbackOptions = {}
) => {
  const { fallbackText = '📖 Story Illustration', retryAttempts = 2, retryDelay = 1000 } = options;
  
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isManualRetry, setIsManualRetry] = useState(false);

  const debugLog = useCallback((message: string, data?: any) => {
    console.log(`🖼️ useImageWithFallback: ${message}`, data || '');
  }, []);

  const validateAndSetImage = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }

      // Handle data URLs and blob URLs differently
      if (url.startsWith('data:') || url.startsWith('blob:')) {
        debugLog('Using data/blob URL directly', url.substring(0, 50) + '...');
        setImageSrc(url);
        setIsLoading(false);
        setError(null);
        resolve(true);
        return;
      }

      // For external URLs, validate with Image object
      const img = new Image();
      
      // Add timeout for slow loading images
      const timeoutId = setTimeout(() => {
        debugLog('Image load timeout', url);
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        debugLog('Image loaded successfully', url);
        setImageSrc(url);
        setIsLoading(false);
        setError(null);
        resolve(true);
      };
      
      img.onerror = (e) => {
        clearTimeout(timeoutId);
        debugLog('Image failed to load', { url, error: e });
        resolve(false);
      };
      
      // Preload image to check validity before setting
      img.src = url;
    });
  }, [debugLog]);

  const loadImageWithRetry = useCallback(async (url: string) => {
    debugLog('Starting image load', { url, attempt: attempts + 1 });
    
    const success = await validateAndSetImage(url);
    
    if (!success && attempts < retryAttempts) {
      debugLog('Retrying image load', { attempt: attempts + 1, retryDelay });
      setAttempts(prev => prev + 1);
      setTimeout(() => {
        loadImageWithRetry(url);
      }, retryDelay);
      return;
    }
    
    if (!success) {
      debugLog('All retry attempts failed, using fallback');
      setError('Failed to load image after retries');
      const fallbackUrl = ImageFallbackService.getBestFallback({
        text: fallbackText
      });
      setImageSrc(fallbackUrl);
      setIsLoading(false);
    }
  }, [attempts, retryAttempts, retryDelay, fallbackText, validateAndSetImage, debugLog]);

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