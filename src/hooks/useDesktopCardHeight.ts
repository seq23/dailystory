import { useMemo } from 'react';

interface UseDesktopCardHeightProps {
  textContent: string;
  fontSize: string;
  lineHeight: string;
  isDesktop: boolean;
}

/**
 * Calculates optimal height for desktop card mirroring based on text content
 * Only applies to desktop (xl breakpoint and above)
 */
export const useDesktopCardHeight = ({ 
  textContent, 
  fontSize, 
  lineHeight, 
  isDesktop 
}: UseDesktopCardHeightProps) => {
  
  const dynamicHeight = useMemo(() => {
    if (!isDesktop || !textContent) {
      return null; // Return null for mobile/tablet - they keep aspect-[4/3]
    }

    // Extract numeric values from CSS strings
    const fontSizeNum = parseFloat(fontSize);
    const lineHeightNum = parseFloat(lineHeight);
    
    // Calculate estimated text height based on content
    const words = textContent.trim().split(/\s+/).length;
    const avgWordsPerLine = Math.max(8, Math.min(12, Math.floor(fontSizeNum * 0.8))); // Responsive to font size
    const estimatedLines = Math.ceil(words / avgWordsPerLine);
    
    // Calculate text height with line height
    const textHeight = estimatedLines * (fontSizeNum * lineHeightNum);
    
    // Add padding and spacing (p-3 md:p-4 = roughly 24-32px total padding)
    const paddingHeight = 64;
    
    // Calculate total needed height
    const totalTextHeight = textHeight + paddingHeight;
    
    // Apply reasonable constraints
    const minHeight = 500; // Minimum for good aspect ratio
    const maxHeight = 800; // Maximum to prevent excessive height
    const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, totalTextHeight));
    
    return constrainedHeight;
  }, [textContent, fontSize, lineHeight, isDesktop]);

  return {
    dynamicHeight,
    heightStyle: dynamicHeight ? { height: `${dynamicHeight}px` } : undefined,
    containerClassName: dynamicHeight ? "" : "aspect-[4/3]" // Fallback to aspect ratio when not using dynamic height
  };
};