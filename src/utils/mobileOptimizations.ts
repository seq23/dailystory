/**
 * Mobile Performance and User Experience Optimizations
 * Centralized utilities for mobile-specific enhancements
 */

export interface MobileOptimizationConfig {
  enableTouchOptimizations: boolean;
  enablePerformanceOptimizations: boolean;
  enableAccessibilityFeatures: boolean;
}

// Default configuration for mobile optimizations
export const DEFAULT_MOBILE_CONFIG: MobileOptimizationConfig = {
  enableTouchOptimizations: true,
  enablePerformanceOptimizations: true,
  enableAccessibilityFeatures: true,
};

/**
 * Apply mobile-specific touch optimizations
 */
export const applyTouchOptimizations = () => {
  try {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Prevent pinch-to-zoom
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent context menu on long press
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  } catch (error) {
    // Suppress Chrome extension interference errors
    console.debug('Touch optimizations skipped:', error);
    return () => {}; // No-op cleanup
  }
};

/**
 * Apply performance optimizations for mobile devices
 */
export const applyPerformanceOptimizations = () => {
  // Set mobile-friendly viewport
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }

  // Set CSS custom properties for dynamic viewport
  const updateViewportHeight = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    document.documentElement.style.setProperty('--dvh', `${window.innerHeight}px`);
  };

  // Set safe area insets
  document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
  document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
  document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
  document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');

  // Performance optimizations
  document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');
  document.body.style.setProperty('overflow-scrolling', 'touch');

  // Update viewport on resize with throttling
  let resizeTimeout: NodeJS.Timeout;
  const throttledUpdate = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateViewportHeight, 100);
  };

  updateViewportHeight();
  window.addEventListener('resize', throttledUpdate);
  window.addEventListener('orientationchange', throttledUpdate);

  return () => {
    window.removeEventListener('resize', throttledUpdate);
    window.removeEventListener('orientationchange', throttledUpdate);
  };
};

/**
 * Enhanced touch target utilities
 */
export const ensureTouchTargetSize = (element: HTMLElement, minSize: number = 48) => {
  const style = element.style;
  style.minHeight = `${minSize}px`;
  style.minWidth = `${minSize}px`;
  style.touchAction = 'manipulation';
  // Use setProperty for vendor-prefixed properties
  style.setProperty('-webkit-tap-highlight-color', 'transparent');
};

/**
 * Mobile-optimized animation utilities
 */
export const getMobileAnimationConfig = () => ({
  duration: 200, // Faster animations on mobile
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
});

/**
 * Font loading optimizations for mobile
 */
export const optimizeFontLoading = () => {
  // Load critical fonts as stylesheets
  const criticalFonts = [
    'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap'
  ];

  criticalFonts.forEach(fontUrl => {
    try {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    } catch (error) {
      // Suppress Chrome extension interference errors
      console.debug('Font loading skipped:', error);
    }
  });
};

/**
 * Add global error handler to suppress Chrome extension errors
 */
export const suppressChromeExtensionErrors = () => {
  const originalError = console.error;
  const originalWarn = console.warn;

  // Filter out Chrome extension errors
  console.error = (...args) => {
    const message = args.join(' ');
    if (
      message.includes('Could not establish connection') ||
      message.includes('runtime.lastError') ||
      message.includes('Receiving end does not exist') ||
      message.includes('chrome-extension://')
    ) {
      return; // Suppress Chrome extension errors
    }
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('chrome-extension://')) {
      return; // Suppress Chrome extension warnings
    }
    originalWarn.apply(console, args);
  };

  return () => {
    console.error = originalError;
    console.warn = originalWarn;
  };
};

/**
 * Debug preload links to identify problematic ones
 */
export const debugPreloadLinks = () => {
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  console.debug('Preload links found:', preloadLinks.length);
  
  preloadLinks.forEach((link, index) => {
    const linkElement = link as HTMLLinkElement;
    console.debug(`Preload ${index + 1}:`, {
      href: linkElement.href,
      as: linkElement.as,
      type: linkElement.type,
      crossOrigin: linkElement.crossOrigin
    });
    
    // Check for problematic preload links
    if (!linkElement.as || linkElement.as.trim() === '') {
      console.warn('Preload link missing "as" attribute:', linkElement.href);
    }
  });
};

/**
 * Mobile accessibility enhancements
 */
export const enhanceMobileAccessibility = () => {
  // Ensure minimum contrast ratios
  document.documentElement.style.setProperty('--mobile-min-contrast', '4.5');
  
  // Enhanced focus indicators for mobile
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      :focus-visible {
        outline: 3px solid hsl(var(--primary));
        outline-offset: 2px;
        border-radius: 4px;
      }
      
      .touch-target:focus-visible {
        outline-width: 4px;
        outline-offset: 3px;
      }
    }
  `;
  document.head.appendChild(style);
};

/**
 * Initialize all mobile optimizations
 */
export const initializeMobileOptimizations = (config: Partial<MobileOptimizationConfig> = {}) => {
  const finalConfig = { ...DEFAULT_MOBILE_CONFIG, ...config };
  const cleanupFunctions: (() => void)[] = [];

  // Always suppress Chrome extension errors for cleaner console
  cleanupFunctions.push(suppressChromeExtensionErrors());

  // Debug preload links in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => debugPreloadLinks(), 1000); // Wait for page to load
  }

  if (finalConfig.enableTouchOptimizations) {
    cleanupFunctions.push(applyTouchOptimizations());
  }

  if (finalConfig.enablePerformanceOptimizations) {
    cleanupFunctions.push(applyPerformanceOptimizations());
    optimizeFontLoading();
  }

  if (finalConfig.enableAccessibilityFeatures) {
    enhanceMobileAccessibility();
  }

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};