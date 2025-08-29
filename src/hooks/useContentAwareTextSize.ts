import { useMemo } from 'react';

interface ContentAwareTextConfig {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  paragraphSpacing: string;
  maxWordsPerLine: number;
}

/**
 * Hook that provides content-aware text sizing based on word count
 * Ensures text fills available space appropriately regardless of difficulty level
 */
export const useContentAwareTextSize = (
  text: string,
  isMobile: boolean = false
): ContentAwareTextConfig => {
  return useMemo(() => {
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Base configurations for different content densities
    if (wordCount <= 15) {
      // Very short content - large, readable text
      return {
        fontSize: isMobile ? 'clamp(1.25rem, 4vw, 2rem)' : 'clamp(1.5rem, 3vw, 2.5rem)',
        lineHeight: '1.6',
        letterSpacing: '0.02em',
        paragraphSpacing: '1.5rem',
        maxWordsPerLine: 8
      };
    } else if (wordCount <= 50) {
      // Medium content - balanced size
      return {
        fontSize: isMobile ? 'clamp(1.1rem, 3.5vw, 1.5rem)' : 'clamp(1.25rem, 2.5vw, 1.75rem)',
        lineHeight: '1.5',
        letterSpacing: '0.01em',
        paragraphSpacing: '1.25rem',
        maxWordsPerLine: 12
      };
    } else if (wordCount <= 100) {
      // Longer content - compact but readable
      return {
        fontSize: isMobile ? 'clamp(1rem, 3vw, 1.25rem)' : 'clamp(1.125rem, 2vw, 1.5rem)',
        lineHeight: '1.4',
        letterSpacing: '0.005em',
        paragraphSpacing: '1rem',
        maxWordsPerLine: 15
      };
    } else {
      // Very long content - optimized for density
      return {
        fontSize: isMobile ? 'clamp(0.875rem, 2.5vw, 1.125rem)' : 'clamp(1rem, 1.8vw, 1.25rem)',
        lineHeight: '1.35',
        letterSpacing: '0em',
        paragraphSpacing: '0.875rem',
        maxWordsPerLine: 18
      };
    }
  }, [text, isMobile]);
};

/**
 * Get container classes for content-aware sizing
 */
export const useContentAwareContainer = (wordCount: number): string => {
  return useMemo(() => {
    if (wordCount <= 15) {
      return 'max-w-4xl mx-auto px-4';
    } else if (wordCount <= 50) {
      return 'max-w-5xl mx-auto px-4';
    } else if (wordCount <= 100) {
      return 'max-w-6xl mx-auto px-3';
    } else {
      return 'max-w-7xl mx-auto px-2';
    }
  }, [wordCount]);
};