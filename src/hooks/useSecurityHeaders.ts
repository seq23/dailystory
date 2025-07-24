import { useEffect } from 'react';

/**
 * Hook to implement enhanced security measures
 */
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Only add essential meta tags that work client-side
    // Note: True security headers should be set server-side
    
    // Basic referrer policy
    const existingReferrer = document.querySelector('meta[name="referrer"]');
    if (!existingReferrer) {
      const meta = document.createElement('meta');
      meta.name = 'referrer';
      meta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(meta);
    }

    // Viewport security
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (!existingViewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);
};