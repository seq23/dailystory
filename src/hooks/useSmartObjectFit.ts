import { useState, useCallback } from 'react';

interface SmartObjectFitResult {
  objectFit: 'object-cover' | 'object-contain';
  containerStyle?: string;
}

export const useSmartObjectFit = (containerHeight?: number) => {
  const [objectFitStyle, setObjectFitStyle] = useState<SmartObjectFitResult>({
    objectFit: 'object-contain'
  });

  const determineObjectFit = useCallback((img: HTMLImageElement) => {
    if (!containerHeight) {
      // Mobile/tablet: use object-cover for full-bleed effect
      setObjectFitStyle({ objectFit: 'object-cover' });
      return;
    }

    // Desktop: always use object-contain to prevent cropping and show full image
    setObjectFitStyle({ 
      objectFit: 'object-contain',
      containerStyle: 'bg-muted/20' // Subtle background for contain cases
    });
  }, [containerHeight]);

  return {
    objectFitStyle,
    onImageLoad: determineObjectFit
  };
};