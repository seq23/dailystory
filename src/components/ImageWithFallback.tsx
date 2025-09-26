import React from 'react';
import { useImageWithFallback } from '@/hooks/useImageWithFallback';
import { useSmartObjectFit } from '@/hooks/useSmartObjectFit';
import { DebugLogger } from '@/services/DebugLogger';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackText?: string;
  onLoadingChange?: (isLoading: boolean) => void;
  onFallbackUsed?: (isUsingFallback: boolean) => void;
  smartObjectFit?: boolean;
  containerHeight?: number;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackText,
  onLoadingChange,
  onFallbackUsed,
  smartObjectFit = false,
  containerHeight,
}) => {
  const { imageSrc, isLoading, error, isUsingFallback } = useImageWithFallback(src, {
    fallbackText
  });

  const { objectFitStyle, onImageLoad } = useSmartObjectFit(containerHeight);

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
      <div className={`animate-pulse bg-muted rounded-lg ${containerClassName} ${className}`}>
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
    <div className={`relative ${containerClassName} ${smartObjectFit && objectFitStyle.containerStyle ? objectFitStyle.containerStyle : ''}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={smartObjectFit ? `w-full h-full ${objectFitStyle.objectFit} rounded-lg` : className}
        style={{ display: 'block' }}
        onLoad={(e) => {
          if (smartObjectFit) {
            onImageLoad(e.currentTarget);
          }
        }}
        onError={(e) => {
          if (isDebugMode) {
            DebugLogger.error('image', 'ImageWithFallback: Image display error', {
              src: imageSrc,
              error: e
            });
          }
        }}
      />
      {isUsingFallback && (
        <div className="absolute top-2 right-2 bg-background/80 rounded px-2 py-1 text-xs text-muted-foreground">
          Fallback
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