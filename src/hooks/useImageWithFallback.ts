import { useState, useEffect, useCallback } from 'react';
import { ImageFallbackService } from '@/services/ImageFallbackService';
import { ImageLoadingManager } from '@/services/ImageLoadingManager';
import SessionCacheDebugConsoleClass from '@/utils/sessionCacheDebug';

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
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isManualRetry, setIsManualRetry] = useState(false);
  const maxRetries = retryAttempts;
  
  
  // Check if debug mode is enabled
  const isDebugMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('debug') === '1';

  const debugLog = useCallback((message: string, data?: any) => {
    if (isDebugMode) {
      console.log(`🖼️ useImageWithFallback: ${message}`, data || '');
      // Make session cache debug available in debug mode
      if (typeof window !== 'undefined' && !((window as any).sessionCacheDebug)) {
        (window as any).sessionCacheDebug = SessionCacheDebugConsoleClass;
      }
    }
  }, [isDebugMode]);

  const validateAndSetImage = useCallback(async (url: string, sessionId?: string): Promise<boolean> => {
    if (!url) return false;

    // Use ImageLoadingManager for deduplication and circuit breaking with session context
    const success = await ImageLoadingManager.loadImage(url, {
      timeout: isDebugMode ? 12000 : 8000, // Longer timeout in debug mode to reduce false fallbacks
      isDebugMode,
      sessionId, // Pass session context for proper isolation
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

  const setImageWithValidation = useCallback(async (url: string, sessionId?: string) => {
    if (!url) {
      debugLog('No URL provided to setImageWithValidation');
      setIsUsingFallback(true);
      return;
    }

    debugLog('Setting image with validation', url);
    setIsLoading(true);
    setError(null);
    setIsUsingFallback(false);

    const success = await validateAndSetImage(url, sessionId);
    if (!success) {
      debugLog('Image validation failed, attempting retry');
      await handleRetry(url, sessionId);
    }
  }, [validateAndSetImage]);

  const handleRetry = useCallback(async (originalUrl?: string, sessionId?: string) => {
    debugLog('Manual retry triggered', { originalUrl, retryCount });
    
    if (retryCount >= maxRetries) {
      debugLog('Max retries exceeded, using fallback');
      setIsUsingFallback(true);
      setIsLoading(false);
      return;
    }

    setIsManualRetry(true);
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setError(null);

    if (originalUrl) {
      await validateAndSetImage(originalUrl, sessionId);
    } else if (imageSrc) {
      await validateAndSetImage(imageSrc, sessionId);
    }

    setIsManualRetry(false);
  }, [retryCount, maxRetries, validateAndSetImage, imageSrc, debugLog]);

  const loadImageWithRetry = useCallback(async (url: string, sessionId?: string) => {
    if (isDebugMode) {
      debugLog('Starting image load', { url, attempt: retryCount + 1 });
    }
    
    const success = await validateAndSetImage(url, sessionId);
    
    if (!success && retryCount < retryAttempts) {
      if (isDebugMode) {
        debugLog('Retrying image load', { attempt: retryCount + 1, retryDelay });
      }
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        loadImageWithRetry(url, sessionId);
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
      setIsUsingFallback(true);
      setIsLoading(false);
    }
  }, [retryCount, retryAttempts, retryDelay, fallbackText, validateAndSetImage, debugLog, isDebugMode]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    
    if (!src) {
      debugLog('No src provided, using immediate fallback');
      const fallbackUrl = ImageFallbackService.getBestFallback({
        text: fallbackText
      });
      setImageSrc(fallbackUrl);
      setIsUsingFallback(true);
      setIsLoading(false);
      return;
    }

    // Check for problematic URLs that should use fallback immediately
    if (src.includes('/lovable-uploads/') || src.includes('localhost')) {
      debugLog('Detected problematic URL, using immediate fallback', src);
      const fallbackUrl = ImageFallbackService.getBestFallback({
        text: fallbackText
      });
      setImageSrc(fallbackUrl);
      setIsUsingFallback(true);
      setIsLoading(false);
      return;
    }

    // Check if it's already a fallback image
    if (ImageFallbackService.isFallbackImage(src)) {
      debugLog('Source is already a fallback image');
      setImageSrc(src);
      setIsUsingFallback(true);
      setIsLoading(false);
      return;
    }

    loadImageWithRetry(src);
  }, [src, fallbackText, loadImageWithRetry, debugLog]);


  // No longer need dynamic fallback updates - everything is static now

  return {
    imageSrc,
    isLoading,
    error,
    isUsingFallback,
    isManualRetry,
    setImageWithValidation,
    manualRetry: () => handleRetry()
  };
};