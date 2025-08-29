import { useMemo } from 'react';

interface ContentAwareTextConfig {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  paragraphSpacing: string;
  maxWordsPerLine: number;
}

/**
 * Hook that provides content-aware text sizing based on word count and image presence
 * Ensures text fills available space appropriately regardless of difficulty level
 */
export const useContentAwareTextSize = (
  text: string,
  isMobile: boolean = false,
  hasImage: boolean = false
): ContentAwareTextConfig => {
  return useMemo(() => {
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Scale factor when images are present - increase text size by 20-30%
    const imageScaleFactor = hasImage ? 1.25 : 1;
    
    // Base configurations for different content densities
    if (wordCount <= 15) {
      // Very short content - large, readable text, even larger with images
      const baseFontSize = isMobile ? 'clamp(1.25rem, 4vw, 2rem)' : 'clamp(1.5rem, 3vw, 2.5rem)';
      const scaledFontSize = hasImage 
        ? (isMobile ? 'clamp(1.5rem, 5vw, 2.5rem)' : 'clamp(1.875rem, 3.75vw, 3.125rem)')
        : baseFontSize;
      
      return {
        fontSize: scaledFontSize,
        lineHeight: hasImage ? '1.7' : '1.6',
        letterSpacing: '0.02em',
        paragraphSpacing: hasImage ? '1.75rem' : '1.5rem',
        maxWordsPerLine: hasImage ? 7 : 8
      };
    } else if (wordCount <= 50) {
      // Medium content - balanced size, scaled for images
      const scaledFontSize = hasImage 
        ? (isMobile ? 'clamp(1.375rem, 4.375vw, 1.875rem)' : 'clamp(1.5625rem, 3.125vw, 2.1875rem)')
        : (isMobile ? 'clamp(1.1rem, 3.5vw, 1.5rem)' : 'clamp(1.25rem, 2.5vw, 1.75rem)');
      
      return {
        fontSize: scaledFontSize,
        lineHeight: hasImage ? '1.6' : '1.5',
        letterSpacing: '0.01em',
        paragraphSpacing: hasImage ? '1.5rem' : '1.25rem',
        maxWordsPerLine: hasImage ? 10 : 12
      };
    } else if (wordCount <= 100) {
      // Longer content - compact but readable, scaled for images
      const scaledFontSize = hasImage 
        ? (isMobile ? 'clamp(1.25rem, 3.75vw, 1.5625rem)' : 'clamp(1.40625rem, 2.5vw, 1.875rem)')
        : (isMobile ? 'clamp(1rem, 3vw, 1.25rem)' : 'clamp(1.125rem, 2vw, 1.5rem)');
      
      return {
        fontSize: scaledFontSize,
        lineHeight: hasImage ? '1.5' : '1.4',
        letterSpacing: '0.005em',
        paragraphSpacing: hasImage ? '1.25rem' : '1rem',
        maxWordsPerLine: hasImage ? 13 : 15
      };
    } else {
      // Very long content - optimized for density, scaled for images
      const scaledFontSize = hasImage 
        ? (isMobile ? 'clamp(1.09375rem, 3.125vw, 1.40625rem)' : 'clamp(1.25rem, 2.25vw, 1.5625rem)')
        : (isMobile ? 'clamp(0.875rem, 2.5vw, 1.125rem)' : 'clamp(1rem, 1.8vw, 1.25rem)');
      
      return {
        fontSize: scaledFontSize,
        lineHeight: hasImage ? '1.4' : '1.35',
        letterSpacing: '0em',
        paragraphSpacing: hasImage ? '1.125rem' : '0.875rem',
        maxWordsPerLine: hasImage ? 16 : 18
      };
    }
  }, [text, isMobile, hasImage]);
};

/**
 * Get container classes for content-aware sizing with image awareness
 */
export const useContentAwareContainer = (wordCount: number, hasImage: boolean = false): string => {
  return useMemo(() => {
    // When images are present, allow wider containers for better text distribution
    if (wordCount <= 15) {
      return hasImage ? 'max-w-5xl mx-auto px-4' : 'max-w-4xl mx-auto px-4';
    } else if (wordCount <= 50) {
      return hasImage ? 'max-w-6xl mx-auto px-4' : 'max-w-5xl mx-auto px-4';
    } else if (wordCount <= 100) {
      return hasImage ? 'max-w-7xl mx-auto px-3' : 'max-w-6xl mx-auto px-3';
    } else {
      return hasImage ? 'w-full mx-auto px-2' : 'max-w-7xl mx-auto px-2';
    }
  }, [wordCount, hasImage]);
};