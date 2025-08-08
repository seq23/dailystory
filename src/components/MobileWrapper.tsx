import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdaptiveEnhancedLoading } from '@/components/AdaptiveEnhancedLoading';
interface MobileWrapperProps {
  children: React.ReactNode;
}

export const MobileWrapper: React.FC<MobileWrapperProps> = ({ children }) => {
  const { isMobileOrTablet, isCapacitor } = useIsMobile();
  const [isInitialized, setIsInitialized] = useState(false);
  const debugMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  useEffect(() => {
    // Mobile initialization
    if (isMobileOrTablet) {
      // Prevent double-tap zoom
      document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
          event.preventDefault();
        }
      }, { passive: false });

      let lastTouchEnd = 0;
      document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, { passive: false });

      // Prevent pinch-to-zoom
      document.addEventListener('gesturestart', function (event) {
        event.preventDefault();
      });

      // Set viewport meta tag for mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Add mobile-specific body classes
      document.body.classList.add('mobile-optimized', 'mobile-text-fixed');
      
      // Add safe area support
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    }

    setIsInitialized(true);

    return () => {
      if (isMobileOrTablet) {
        document.body.classList.remove('mobile-optimized', 'mobile-text-fixed');
      }
    };
  }, [isMobileOrTablet]);

  // Desktop: render immediately without blocking
  if (!isMobileOrTablet) {
    return (
      <div className="homepage">
        {children}
      </div>
    );
  }

  // Mobile/tablet: show enhanced loader until initialized
  if (!isInitialized) {
    console.log('📱 MobileWrapper: showing AdaptiveEnhancedLoading', { isMobileOrTablet, initialized: isInitialized });
    return (
      <>
        <AdaptiveEnhancedLoading isPremium={false} />
        {debugMode && (
          <div className="fixed top-2 right-2 z-50 text-xs px-2 py-1 rounded bg-primary text-primary-foreground shadow">
            Mobile loader active
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`homepage ${isMobileOrTablet ? 'mobile-wrapper mobile-safe-area' : ''}`}>
      {children}
    </div>
  );
};