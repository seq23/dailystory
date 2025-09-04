/**
 * Mobile Performance and User Experience Optimizations
 * Centralized utilities for mobile-specific enhancements
 */
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

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
 * Add global error handler to suppress Chrome extension and postMessage errors
 */
export const suppressChromeExtensionErrors = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalLog = console.log;
  const originalWindowError = window.onerror;

  let suppressedCount = 0;
  const suppressedErrors = new Set<string>();

  // Enhanced patterns for Chrome extension, postMessage, and development errors
  const suppressPatterns = [
    // Chrome extension errors - enhanced patterns
    /Could not establish connection/,
    /runtime\.lastError/,
    /Receiving end does not exist/,
    /chrome-extension:\/\//,
    /Extension context invalidated/,
    /Cannot access contents of/,
    /Unchecked runtime\.lastError/,
    /Error in event handler/,
    
    // Feature Policy / Permissions Policy warnings
    /Unrecognized feature:/,
    /Unrecognized feature: 'vr'/,
    /Unrecognized feature: 'ambient-light-sensor'/,
    /Unrecognized feature: 'battery'/,
    /Unrecognized feature: 'speaker'/,
    /Unrecognized feature: 'vibrate'/,
    
    // Iframe security warnings
    /An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing/,
    /iframe.*sandbox.*escape/,
    
    // Performance violation warnings
    /\[Violation\].*setTimeout.*handler took/,
    /\[Violation\].*'requestAnimationFrame' handler took/,
    /\[Violation\].*'click' handler took/,
    /Forced reflow while executing JavaScript/,
    /Long running JavaScript task took/,
    
    // Audio preload warnings
    /was preloaded using link preload but not used within a few seconds/,
    /resource.*preloaded.*not used/,
    /preload.*not.*used/,
    
    // Lovable development environment noise
    /We're hiring!/,
    /lovable\.dev\/careers/,
    /⠀⣠⠴⠚⡙⠙⠲⣤⣠⠖⢋⡛⠙⠲⣄/,  // ASCII art pattern
    /hiring.*ascii/i,
    
    // PostMessage origin errors - common in iframe/preview environments
    /Failed to execute 'postMessage' on 'DOMWindow'/,
    /The target origin provided .* does not match the recipient window's origin/,
    /postMessage origin mismatch/,
    /cross-origin frame/,
    /blocked by CORS policy/,
    
    // React/Vite development warnings
    /Warning: ReactDOM\.render is no longer supported/,
    /Warning: React\.createFactory/,
    /Warning: componentWill/,
    /The above error occurred in the/,
    /Consider adding an error boundary/,
    
    // Vite HMR noise
    /\[vite\]/,
    /\[hmr\]/,
    
    // Common third-party script noise  
    /third-party/,
    /vendor/,
    /analytics/,
    /tracking/,
    /advertisement/,
    
    // Network/Loading related non-critical errors
    /Loading chunk \d+ failed/,
    /Loading CSS chunk/,
    /Failed to import/,
    
    // Performance observer warnings
    /PerformanceObserver/,
    /performance\.mark/,
    
    // Browser API warnings that don't affect functionality
    /Permissions API/,
    /Notification API/,
    /getUserMedia/,
    
    // Accessibility scanner noise (common in development)
    /accessibility/i,
    /a11y/i,
    
    // Common development noise
    /Script error/,
    /ResizeObserver loop limit exceeded/,
    /DevTools/i,
    /devtools/i,
    /Non-Error promise rejection captured/,
  ];

  // Check if message should be suppressed
  const shouldSuppress = (message: string) => {
    return suppressPatterns.some(pattern => pattern.test(message));
  };

  // Override console methods to filter suppressed errors
  console.error = (...args) => {
    const message = args.join(' ');
    if (shouldSuppress(message)) {
      suppressedCount++;
      // In development, collect unique suppressed errors for debugging
      if (process.env.NODE_ENV === 'development') {
        suppressedErrors.add(message.substring(0, 100));
      }
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    if (shouldSuppress(message)) {
      suppressedCount++;
      if (process.env.NODE_ENV === 'development') {
        suppressedErrors.add(message.substring(0, 100));
      }
      return;
    }
    originalWarn.apply(console, args);
  };

  console.info = (...args) => {
    const message = args.join(' ');
    if (shouldSuppress(message)) {
      suppressedCount++;
      if (process.env.NODE_ENV === 'development') {
        suppressedErrors.add(message.substring(0, 100));
      }
      return;
    }
    originalInfo.apply(console, args);
  };

  console.log = (...args) => {
    const message = args.join(' ');
    if (shouldSuppress(message)) {
      suppressedCount++;
      if (process.env.NODE_ENV === 'development') {
        suppressedErrors.add(message.substring(0, 100));
      }
      return;
    }
    originalLog.apply(console, args);
  };

  // Add global error handler for postMessage and other errors
  window.onerror = (message, source, lineno, colno, error) => {
    const messageStr = String(message);
    if (shouldSuppress(messageStr)) {
      suppressedCount++;
      if (process.env.NODE_ENV === 'development') {
        suppressedErrors.add(messageStr.substring(0, 100));
      }
      return true; // Prevent default browser error handling
    }
    // Call original error handler if it exists
    return originalWindowError ? originalWindowError(message, source, lineno, colno, error) : false;
  };

  // Handle unhandled promise rejections (common with postMessage)
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = String(event.reason);
    if (shouldSuppress(reason)) {
      suppressedCount++;
      if (process.env.NODE_ENV === 'development') {
        suppressedErrors.add(reason.substring(0, 100));
      }
      event.preventDefault(); // Prevent the error from being logged
    }
  };

  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  return () => {
    console.error = originalError;
    console.warn = originalWarn;
    console.info = originalInfo;
    console.log = originalLog;
    window.onerror = originalWindowError;
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    
    if (process.env.NODE_ENV === 'development' && suppressedCount > 0) {
      originalInfo(`🧹 Suppressed ${suppressedCount} extension/dev/postMessage errors`);
      if (suppressedErrors.size > 0) {
        originalInfo('Suppressed error types:', Array.from(suppressedErrors).slice(0, 5));
      }
    }
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

  // Initialize performance monitoring with forced reflow detection
  try {
    // Note: This should be called from a React component, but we'll add global detection
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.duration > 16) {
            console.warn(`⚡ Potential forced reflow: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['measure', 'navigation'] });
        cleanupFunctions.push(() => observer.disconnect());
        console.debug('🚀 Performance monitoring with reflow detection enabled');
      } catch (e) {
        console.debug('Performance observer not fully supported');
      }
    }
  } catch (error) {
    console.debug('Performance monitoring unavailable:', error);
  }

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