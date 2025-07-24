import { useEffect, useCallback } from 'react';
import { SecurityMonitor, PerformanceMonitor, UserActivityMonitor } from '@/utils/monitoring';
import { useLocation } from 'react-router-dom';

export const useSecurityMonitoring = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    UserActivityMonitor.trackPageView(location.pathname);
  }, [location.pathname]);

  // Monitor performance
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 3000) { // Log slow operations
          SecurityMonitor.logEvent('performance', 'slow_operation', {
            name: entry.name,
            duration: entry.duration,
            entryType: entry.entryType
          }, 'medium');
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });

    return () => observer.disconnect();
  }, []);

  // Monitor for security violations
  useEffect(() => {
    const handleSecurityViolation = (event: SecurityPolicyViolationEvent) => {
      SecurityMonitor.logEvent('security', 'csp_violation', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy
      }, 'high');
    };

    document.addEventListener('securitypolicyviolation', handleSecurityViolation);

    return () => {
      document.removeEventListener('securitypolicyviolation', handleSecurityViolation);
    };
  }, []);

  // Monitor for console access attempts
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const originalConsole = { ...console };
      
      // Override console methods to detect developer tools usage
      ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
        console[method] = (...args: any[]) => {
          SecurityMonitor.logEvent('security', 'console_access', {
            method,
            timestamp: Date.now()
          }, 'low');
          return originalConsole[method](...args);
        };
      });

      return () => {
        Object.assign(console, originalConsole);
      };
    }
  }, []);

  // Error boundary integration
  const handleError = useCallback((error: Error, errorInfo: any) => {
    UserActivityMonitor.trackError(error, errorInfo.componentStack || 'unknown');
  }, []);

  // Network monitoring
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        SecurityMonitor.logEvent('security', 'network_request', {
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration,
          success: response.ok
        }, response.ok ? 'low' : 'medium');
        
        return response;
      } catch (error) {
        SecurityMonitor.logEvent('error', 'network_error', {
          url,
          error: error.toString(),
          duration: performance.now() - startTime
        }, 'high');
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return {
    handleError,
    getSecurityEvents: () => SecurityMonitor.getSecurityEvents(),
    getCriticalEvents: () => SecurityMonitor.getCriticalEvents(),
    exportEvents: () => SecurityMonitor.exportEvents(),
    clearEvents: () => SecurityMonitor.clearEvents()
  };
};