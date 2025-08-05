import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface SecurityEvent {
  type: string;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

class SecurityMonitor {
  private static events: SecurityEvent[] = [];
  private static maxEvents = 1000;

  static logEvent(type: string, data: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'low') {
    const event: SecurityEvent = {
      type,
      data,
      severity,
      timestamp: Date.now()
    };

    SecurityMonitor.events.unshift(event);
    if (SecurityMonitor.events.length > SecurityMonitor.maxEvents) {
      SecurityMonitor.events = SecurityMonitor.events.slice(0, SecurityMonitor.maxEvents);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Security] ${severity.toUpperCase()}: ${type}`, data);
    }
  }

  static getEvents(): SecurityEvent[] {
    return [...SecurityMonitor.events];
  }

  static getCriticalEvents(): SecurityEvent[] {
    return SecurityMonitor.events.filter(event => event.severity === 'critical' || event.severity === 'high');
  }

  static exportEvents(): string {
    return JSON.stringify({
      events: SecurityMonitor.events,
      exportedAt: new Date().toISOString(),
      totalEvents: SecurityMonitor.events.length
    }, null, 2);
  }

  static clearEvents(): void {
    SecurityMonitor.events = [];
  }
}

class UserActivityMonitor {
  static trackPageView(path: string) {
    SecurityMonitor.logEvent('page_view', { path }, 'low');
  }

  static trackError(error: Error, componentStack?: string) {
    SecurityMonitor.logEvent('error', { 
      message: error.message,
      stack: error.stack,
      componentStack 
    }, 'medium');
  }
}

export const useSecurityMonitoring = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    UserActivityMonitor.trackPageView(location.pathname);
  }, [location.pathname]);

  // Monitor performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 3000) {
            SecurityMonitor.logEvent('slow_operation', {
              name: entry.name,
              duration: entry.duration,
              type: entry.entryType
            }, 'medium');
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });

      return () => observer.disconnect();
    }
  }, []);

  // Monitor CSP violations
  useEffect(() => {
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      SecurityMonitor.logEvent('csp_violation', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        effectiveDirective: event.effectiveDirective
      }, 'high');
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);
    return () => document.removeEventListener('securitypolicyviolation', handleCSPViolation);
  }, []);

  // Monitor console access in production
  useEffect(() => {
    if (import.meta.env.PROD) {
      const originalConsole = { ...console };
      
      ['log', 'warn', 'error', 'debug'].forEach((method) => {
        (console as any)[method] = (...args: any[]) => {
          SecurityMonitor.logEvent('console_access', {
            method,
            argsCount: args.length
          }, 'low');
          
          (originalConsole as any)[method](...args);
        };
      });
    }
  }, []);

  const handleError = useCallback((error: Error, errorInfo?: { componentStack: string }) => {
    UserActivityMonitor.trackError(error, errorInfo?.componentStack);
  }, []);

  // Monitor network requests
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = args[0]?.toString() || 'unknown';
        
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - startTime;
          
          SecurityMonitor.logEvent('network_request', {
            url,
            method: args[1]?.method || 'GET',
            status: response.status,
            duration,
            success: response.ok
          }, response.ok ? 'low' : 'medium');
          
          return response;
        } catch (error) {
          const duration = performance.now() - startTime;
          
          SecurityMonitor.logEvent('network_error', {
            url,
            method: args[1]?.method || 'GET',
            duration,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 'high');
          
          throw error;
        }
      };

      return () => {
        window.fetch = originalFetch;
      };
    }
  }, []);

  return {
    handleError,
    getEvents: SecurityMonitor.getEvents,
    getCriticalEvents: SecurityMonitor.getCriticalEvents,
    exportEvents: SecurityMonitor.exportEvents,
    clearEvents: SecurityMonitor.clearEvents
  };
};