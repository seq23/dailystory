import { useEffect } from 'react';
import { initializeSecurityHeaders } from '@/utils/securityHeaders';

/**
 * Hook to implement enhanced security measures
 */
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Initialize comprehensive security headers
    initializeSecurityHeaders({
      enableCSP: true,
      enableHSTS: true,
      enableFrameOptions: true,
      reportViolations: true
    });

    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);
};