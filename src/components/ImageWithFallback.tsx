import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useImageWithFallback } from '@/hooks/useImageWithFallback';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  onLoadingChange?: (isLoading: boolean) => void;
  onFallbackUsed?: (isUsingFallback: boolean) => void;
  onRetry?: () => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
  onLoadingChange,
  onFallbackUsed,
  onRetry
}) => {
  const { imageSrc, isLoading, error, isUsingFallback, manualRetry, isManualRetry } = useImageWithFallback(src, {
    fallbackText
  });

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      manualRetry();
    }
  };

  React.useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  React.useEffect(() => {
    onFallbackUsed?.(isUsingFallback);
  }, [isUsingFallback, onFallbackUsed]);

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
          console.error('🖼️ ImageWithFallback: Image display error', {
            src: imageSrc,
            error: e
          });
        }}
      />
      {isUsingFallback && (
        <div className="absolute top-2 right-2 bg-background/80 rounded px-2 py-1 text-xs text-muted-foreground">
          Generated
        </div>
      )}
      {error && (
        <div className="absolute bottom-2 left-2 bg-destructive/10 border border-destructive/20 rounded px-2 py-1 text-xs text-destructive">
          Image unavailable
        </div>
      )}
      {(error || (isUsingFallback && src)) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleRetry}
            disabled={isManualRetry}
            className="bg-background/90 hover:bg-background border border-border rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-foreground transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Retry loading image"
          >
            <RefreshCw className={`h-4 w-4 ${isManualRetry ? 'animate-spin' : ''}`} />
            {isManualRetry ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      )}
    </div>
  );
};