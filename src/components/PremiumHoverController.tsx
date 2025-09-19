import { useEffect, useRef } from 'react';
import { SimplifiedAudioEngine } from '@/services/SimplifiedAudioEngine';
import { contextualPronunciation } from '@/services/contextualPronunciation';
import { DebugLogger } from '@/services/DebugLogger';

interface PremiumHoverControllerProps {
  isPremium: boolean;
}

/**
 * Premium Hover Controller - Instant word pronunciation on hover/long-press
 * Desktop: Hover triggers immediate pronunciation for premium users
 * Mobile/Tablet: Long-press triggers immediate pronunciation for premium users
 * No floating menus - keeps interface clean
 */
export const PremiumHoverController = ({ isPremium }: PremiumHoverControllerProps) => {
  const lastProcessedWordRef = useRef<string>('');
  const processingRef = useRef<boolean>(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const longPressTimeoutRef = useRef<number | null>(null);
  const longPressStartRef = useRef<number>(0);

  useEffect(() => {
    // Clear any existing timeouts when component unmounts or premium status changes
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [isPremium]);

  useEffect(() => {
    // CRITICAL FIX: Check device type to disable hover on mobile/tablet
    const isMobileOrTablet = window.innerWidth < 900 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Desktop hover events for premium users (DESKTOP ONLY)
    const handleMouseEnter = async (event: MouseEvent) => {
      // CRITICAL FIX: Block hover TTS on mobile/tablet devices
      if (!isPremium || processingRef.current || isMobileOrTablet) return;
      
      const target = event.target as HTMLElement;
      if (!target || !target.classList || !target.classList.contains('interactive-word-premium-hover')) return;
      
      const word = target.textContent?.trim();
      if (!word || lastProcessedWordRef.current === word) return;
      
      // Debounce hover events
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      hoverTimeoutRef.current = window.setTimeout(async () => {
        await playWordPronunciation(word);
      }, 150); // Small delay to prevent accidental hovers
    };

    const handleMouseLeave = (event: MouseEvent) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    };

    // Mobile/Tablet long-press events for premium users (LONG-PRESS ONLY)
    const handleTouchStart = (event: TouchEvent) => {
      // CRITICAL FIX: Only premium users get long-press TTS
      if (!isPremium || !isMobileOrTablet) return;
      
      const target = event.target as HTMLElement;
      if (!target || !target.classList || !target.classList.contains('interactive-word-premium-hover')) return;
      
      longPressStartRef.current = Date.now();
      
      // CRITICAL FIX: 500ms+ long-press required (prevents accidental triggers)
      longPressTimeoutRef.current = window.setTimeout(async () => {
        const word = target.textContent?.trim();
        if (word) {
          // Provide haptic feedback if available
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
          // Prevent modal from opening during TTS
          event.preventDefault();
          event.stopPropagation();
          await playWordPronunciation(word);
        }
      }, 500); // 500ms for long press
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
      
      // If it was a quick press (not long press), don't prevent default behavior
      const touchDuration = Date.now() - longPressStartRef.current;
      if (touchDuration < 400) {
        // This is a quick press - let the normal modal behavior handle it
        return;
      }
      
      // This was a long press - prevent the modal from opening
      event.preventDefault();
      event.stopPropagation();
    };

    const playWordPronunciation = async (word: string) => {
      if (processingRef.current) return;
      
      lastProcessedWordRef.current = word;
      processingRef.current = true;
      
      try {
        const audioEngine = SimplifiedAudioEngine.getInstance();
        const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
        const processedWord = contextualPronunciation.processTextForPronunciation(cleanWord, false);
        
        // Use audio coordinator to request audio channel
        window.dispatchEvent(new CustomEvent('audio:request', {
          detail: { system: 'premium-hover', priority: 3 }
        }));
        
        await audioEngine.playTextWithSynchronization({
          text: processedWord,
          voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
          contentHash: `premium-hover-${processedWord}`
        });
        
        DebugLogger.log('audio', `Premium hover played: "${processedWord}"`);
        
      } catch (error) {
        console.error('Premium hover pronunciation failed:', error);
        
        // Fallback to browser speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.rate = 0.8;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          speechSynthesis.speak(utterance);
        }
      } finally {
        // Release audio and reset processing state
        window.dispatchEvent(new CustomEvent('audio:stopped', {
          detail: { system: 'premium-hover' }
        }));
        
        setTimeout(() => {
          processingRef.current = false;
          lastProcessedWordRef.current = '';
        }, 1000);
      }
    };

    // Add event listeners
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('touchstart', handleTouchStart, true);
    document.addEventListener('touchend', handleTouchEnd, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('touchstart', handleTouchStart, true);
      document.removeEventListener('touchend', handleTouchEnd, true);
    };
  }, [isPremium]);

  // This component doesn't render anything - it's just for event handling
  return null;
};