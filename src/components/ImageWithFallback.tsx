import React from 'react';
import { useImageWithFallback } from '@/hooks/useImageWithFallback';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  onLoadingChange?: (isLoading: boolean) => void;
  onFallbackUsed?: (isUsingFallback: boolean) => void;
  
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
  onLoadingChange,
  onFallbackUsed,
}) => {
  const { imageSrc, isLoading, error, isUsingFallback } = useImageWithFallback(src, {
    fallbackText
  });

  React.useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  React.useEffect(() => {
    onFallbackUsed?.(isUsingFallback);
  }, [isUsingFallback, onFallbackUsed]);

  // Check if debug mode is active for console optimization
  const isDebugMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('debug') === '1';

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-muted rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted-foreground/20"></div>
            <p className="text-sm">Loading image...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        style={{ display: 'block' }}
        onError={(e) => {
          if (isDebugMode) {
            console.error('🖼️ ImageWithFallback: Image display error', {
              src: imageSrc,
              error: e
            });
          }
        }}
      />
      {isUsingFallback && (
        <div className="absolute top-2 right-2 bg-background/80 rounded px-2 py-1 text-xs text-muted-foreground">
          Generated
        </div>
      )}
      {error && !isDebugMode && (
        <div className="absolute bottom-2 left-2 bg-destructive/10 border border-destructive/20 rounded px-2 py-1 text-xs text-destructive">
          Image unavailable
        </div>
      )}
    </div>
  );
};