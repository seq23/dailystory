import React from 'react';

/**
 * Image proxy utility for secure image loading
 * Routes external images through our secure proxy endpoint
 */

const SUPABASE_URL = "https://cpzeuogomaixamrtnnmj.supabase.co";

export interface ImageProxyOptions {
  fallbackSrc?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Convert external image URL to proxied URL
 */
export function getProxiedImageUrl(originalUrl: string | null | undefined): string | null {
  if (!originalUrl) return null;
  
  try {
    // If it's already a proxied URL or local URL, return as-is
    if (originalUrl.startsWith(SUPABASE_URL) || 
        originalUrl.startsWith('/') || 
        originalUrl.startsWith('data:')) {
      return originalUrl;
    }
    
    // Validate the URL format
    new URL(originalUrl);
    
    // Route through our image proxy
    const proxyUrl = `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    return proxyUrl;
    
  } catch (error) {
    console.warn('Invalid image URL:', originalUrl, error);
    return null;
  }
}

/**
 * Preload an image through the proxy to check if it's accessible
 */
export function preloadProxiedImage(url: string, options: ImageProxyOptions = {}): Promise<boolean> {
  const { timeout = 5000 } = options;
  
  return new Promise((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      resolve(false);
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };
    
    const proxiedUrl = getProxiedImageUrl(url);
    if (proxiedUrl) {
      img.src = proxiedUrl;
    } else {
      clearTimeout(timeoutId);
      resolve(false);
    }
  });
}

/**
 * React hook for secure image loading with fallbacks
 */
export function useSecureImage(url: string | null | undefined, options: ImageProxyOptions = {}) {
  const { fallbackSrc = '/placeholder.svg', maxRetries = 2 } = options;
  const [imageSrc, setImageSrc] = React.useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const attemptsRef = React.useRef(0);
  
  React.useEffect(() => {
    if (!url) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      setHasError(false);
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    attemptsRef.current = 0;
    
    const loadImage = async () => {
      const proxiedUrl = getProxiedImageUrl(url);
      
      if (!proxiedUrl) {
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        setHasError(true);
        return;
      }
      
      const success = await preloadProxiedImage(proxiedUrl, options);
      
      if (success) {
        setImageSrc(proxiedUrl);
        setIsLoading(false);
        setHasError(false);
      } else {
        attemptsRef.current++;
        
        if (attemptsRef.current < maxRetries) {
          // Retry with exponential backoff
          setTimeout(loadImage, 1000 * Math.pow(2, attemptsRef.current));
        } else {
          setImageSrc(fallbackSrc);
          setIsLoading(false);
          setHasError(true);
        }
      }
    };
    
    loadImage();
  }, [url, fallbackSrc, maxRetries]);
  
  return { imageSrc, isLoading, hasError };
}