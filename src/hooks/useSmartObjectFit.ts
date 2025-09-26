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
      setObjectFitStyle({ objectFit: 'object-cover' });
      return;
    }

    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerWidth = img.offsetWidth;
    const containerAspectRatio = containerWidth / containerHeight;

    // If image is wider than container, use object-contain to show full image
    // If image is taller/similar to container, use object-cover to fill space
    if (imageAspectRatio > containerAspectRatio * 1.2) {
      setObjectFitStyle({ 
        objectFit: 'object-contain',
        containerStyle: 'bg-muted/20' // Subtle background for contain cases
      });
    } else {
      setObjectFitStyle({ objectFit: 'object-cover' });
    }
  }, [containerHeight]);

  return {
    objectFitStyle,
    onImageLoad: determineObjectFit
  };
};