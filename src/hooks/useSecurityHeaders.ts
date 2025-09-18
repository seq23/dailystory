import { useEffect } from 'react';
import { initializeSecurityHeaders } from '@/utils/securityHeaders';

/**
 * Hook to implement enhanced security measures
 */
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Only initialize client-side headers in development or when debugging
    // Production uses public/_headers for CSP to avoid conflicts
    if (process.env.NODE_ENV === 'development' || window.location.search.includes('debug=security')) {
      initializeSecurityHeaders({
        enableCSP: false, // Disable client CSP to prevent conflicts with public/_headers
        enableHSTS: false, // Server handles HSTS
        enableFrameOptions: false, // Server handles frame options
        reportViolations: true // Keep violation reporting
      });
    }

    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);
};