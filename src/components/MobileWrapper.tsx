import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileWrapperProps {
  children: React.ReactNode;
}

export const MobileWrapper: React.FC<MobileWrapperProps> = ({ children }) => {
  const { isMobileOrTablet, isCapacitor } = useIsMobile();
  const [isInitialized, setIsInitialized] = useState(false);

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

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`homepage ${isMobileOrTablet ? 'mobile-wrapper mobile-safe-area' : ''}`}
      style={{ direction: 'ltr', textAlign: 'left' }}
    >
      {children}
    </div>
  );
};