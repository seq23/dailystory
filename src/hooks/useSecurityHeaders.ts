/**
 * Lean security headers hook - simplified version
 */

export const useSecurityHeaders = () => {
  // Lean implementation - let server handle headers
  // Only enforce HTTPS redirect in production
  if (typeof window !== 'undefined' && 
      process.env.NODE_ENV === 'production' && 
      window.location.protocol !== 'https:') {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
};