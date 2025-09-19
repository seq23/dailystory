/**
 * Session-aware image loading hook
 * Provides session context to ImageLoadingManager for proper isolation
 */
import { useCallback } from 'react';
import { ImageLoadingManager } from '@/services/ImageLoadingManager';
import { DebugLogger } from '@/services/DebugLogger';

interface UseSessionAwareImageLoaderOptions {
  sessionId?: string;
  timeout?: number;
  isDebugMode?: boolean;
}

export function useSessionAwareImageLoader(options: UseSessionAwareImageLoaderOptions = {}) {
  const { sessionId, timeout = 10000, isDebugMode = false } = options;

  const loadImage = useCallback(async (
    url: string,
    onProgress?: (stage: string) => void
  ): Promise<boolean> => {
    DebugLogger.log('image', 'Loading image with session context:', {
      url: url.substring(0, 50) + '...',
      sessionId,
      timeout,
      isDebugMode
    });
    
    return ImageLoadingManager.loadImage(url, {
      timeout,
      isDebugMode,
      sessionId, // Pass session context for proper isolation
      onProgress
    });
  }, [sessionId, timeout, isDebugMode]);

  return { loadImage };
}