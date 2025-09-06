import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileKeyboardHandlerProps {
  children: React.ReactNode;
}

export const MobileKeyboardHandler: React.FC<MobileKeyboardHandlerProps> = ({ children }) => {
  const { isMobileOrTablet } = useIsMobile();

  useEffect(() => {
    if (!isMobileOrTablet) return;

    let originalViewportHeight = window.innerHeight;
    let keyboardOpen = false;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = originalViewportHeight - currentHeight;
      
      // Keyboard is considered open if viewport shrinks by more than 150px (mobile) or 200px (tablet)
      const wasKeyboardOpen = keyboardOpen;
      keyboardOpen = heightDifference > 150;

      if (keyboardOpen !== wasKeyboardOpen) {
        if (keyboardOpen) {
          // Keyboard opened
          document.body.classList.add('keyboard-open');
          document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`);
          
          // Scroll active input into view
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            setTimeout(() => {
              activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        } else {
          // Keyboard closed
          document.body.classList.remove('keyboard-open');
          document.documentElement.style.setProperty('--keyboard-height', '0px');
        }
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Small delay to ensure keyboard animation starts
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.body.classList.remove('keyboard-open');
    };
  }, [isMobileOrTablet]);

  return <>{children}</>;
};