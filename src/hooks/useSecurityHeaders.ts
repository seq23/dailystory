import { useEffect } from 'react';

/**
 * Hook to implement client-side security measures
 */
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy via meta tag (for static hosting)
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self'; 
        script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
        style-src 'self' 'unsafe-inline'; 
        img-src 'self' data: blob: https:; 
        connect-src 'self' https: wss:; 
        font-src 'self' data:; 
        media-src 'self' data: blob:;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
      `.replace(/\s+/g, ' ').trim();
      document.head.appendChild(meta);
    }

    // Referrer Policy
    const existingReferrer = document.querySelector('meta[name="referrer"]');
    if (!existingReferrer) {
      const meta = document.createElement('meta');
      meta.name = 'referrer';
      meta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(meta);
    }

    // X-Content-Type-Options
    const existingContentType = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
    if (!existingContentType) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-Content-Type-Options';
      meta.content = 'nosniff';
      document.head.appendChild(meta);
    }

    // Disable right-click context menu in production
    const handleContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    // Disable F12 and other dev tools shortcuts in production
    const handleKeyDown = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV === 'production') {
        // F12 or Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);
};