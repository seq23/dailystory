import { useEffect } from 'react';

/**
 * Universal audio highlighting fix for all users and devices
 * Ensures word highlighting works reliably across all audio systems
 */
export const useAudioHighlightingFix = () => {
  useEffect(() => {
    let stateChangeTimeout: NodeJS.Timeout | null = null;
    
    // Listen for all audio state changes with debouncing
    const handleAudioStateChange = (event: CustomEvent) => {
      const { isPlaying } = event.detail;
      
      // Clear previous timeout to debounce rapid state changes
      if (stateChangeTimeout) {
        clearTimeout(stateChangeTimeout);
      }
      
      // Debounce with 300ms delay to prevent rapid start/stop cycles
      stateChangeTimeout = setTimeout(() => {
        if (isPlaying) {
          console.log('🎵 Audio started - ensuring highlighting is active');
          
          // Ensure highlighting system is ready
          window.dispatchEvent(new CustomEvent('highlighting:ensure-active'));
        } else {
          console.log('🛑 Audio stopped - clearing all highlights');
          
          // Clear all highlighting immediately
          window.dispatchEvent(new CustomEvent('highlighting:clear-all'));
        }
      }, 300);
    };
    
    // Listen for highlighting requests
    const handleHighlightingRequest = (event: CustomEvent) => {
      const { wordIndex } = event.detail;
      
      // Find all interactive words and update their highlighting
      const interactiveWords = document.querySelectorAll('[data-word-index]');
      
      interactiveWords.forEach((element) => {
        const elementIndex = parseInt(element.getAttribute('data-word-index') || '-1');
        
        if (elementIndex === wordIndex) {
          element.classList.add('highlighted');
          element.setAttribute('data-highlighted', 'true');
        } else {
          element.classList.remove('highlighted');
          element.removeAttribute('data-highlighted');
        }
      });
      
      console.log(`🎯 Universal highlighting: word ${wordIndex} (${interactiveWords.length} words processed)`);
    };
    
    // Listen for clear highlighting requests
    const handleClearHighlighting = () => {
      const highlightedElements = document.querySelectorAll('[data-highlighted]');
      
      highlightedElements.forEach((element) => {
        element.classList.remove('highlighted');
        element.removeAttribute('data-highlighted');
      });
      
      console.log(`🧹 Universal highlighting cleared: ${highlightedElements.length} elements`);
    };
    
    // Register event listeners
    window.addEventListener('audio:statechange', handleAudioStateChange as EventListener);
    window.addEventListener('highlighting:request', handleHighlightingRequest as EventListener);
    window.addEventListener('highlighting:clear-all', handleClearHighlighting as EventListener);
    window.addEventListener('highlighting:ensure-active', handleClearHighlighting as EventListener); // Clear first, then system will re-highlight
    
    // Cleanup
    return () => {
      window.removeEventListener('audio:statechange', handleAudioStateChange as EventListener);
      window.removeEventListener('highlighting:request', handleHighlightingRequest as EventListener);
      window.removeEventListener('highlighting:clear-all', handleClearHighlighting as EventListener);
      window.removeEventListener('highlighting:ensure-active', handleClearHighlighting as EventListener);
    };
  }, []);
  
  // Expose highlighting functions for manual control
  const highlightWord = (wordIndex: number) => {
    window.dispatchEvent(new CustomEvent('highlighting:request', { 
      detail: { wordIndex } 
    }));
  };
  
  const clearHighlighting = () => {
    window.dispatchEvent(new CustomEvent('highlighting:clear-all'));
  };
  
  return {
    highlightWord,
    clearHighlighting
  };
};