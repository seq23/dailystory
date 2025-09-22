import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DebugLogger } from '@/services/DebugLogger';

interface SecurityEvent {
  type: string;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

class SecurityMonitor {
  private static events: SecurityEvent[] = [];
  private static maxEvents = 1000;
  private static eventCounts = new Map<string, number>();
  private static lastEventTime = new Map<string, number>();
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private static readonly MAX_EVENTS_PER_TYPE = 10; // Max 10 events per type per minute
  private static readonly SAMPLING_RATES = {
    low: 0.1,      // 10% sampling for low severity
    medium: 0.5,   // 50% sampling for medium severity
    high: 0.8,     // 80% sampling for high severity
    critical: 1.0  // 100% sampling for critical severity
  };

  static logEvent(type: string, data: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'low') {
    // Apply sampling based on severity
    if (Math.random() > SecurityMonitor.SAMPLING_RATES[severity]) {
      return;
    }

    // Rate limiting per event type
    const now = Date.now();
    const eventKey = `${type}-${severity}`;
    const lastTime = SecurityMonitor.lastEventTime.get(eventKey) || 0;
    const count = SecurityMonitor.eventCounts.get(eventKey) || 0;

    // Reset counter if window expired
    if (now - lastTime > SecurityMonitor.RATE_LIMIT_WINDOW) {
      SecurityMonitor.eventCounts.set(eventKey, 0);
    }

    // Skip if rate limit exceeded
    if (count >= SecurityMonitor.MAX_EVENTS_PER_TYPE) {
      return;
    }

    // Event deduplication for identical events within 5 seconds
    const eventHash = `${type}-${JSON.stringify(data)}`;
    const lastEventTime = SecurityMonitor.lastEventTime.get(eventHash) || 0;
    if (now - lastEventTime < 5000) {
      return;
    }

    const event: SecurityEvent = {
      type,
      data,
      severity,
      timestamp: now
    };

    SecurityMonitor.events.unshift(event);
    if (SecurityMonitor.events.length > SecurityMonitor.maxEvents) {
      SecurityMonitor.events = SecurityMonitor.events.slice(0, SecurityMonitor.maxEvents);
    }

    // Update counters
    SecurityMonitor.eventCounts.set(eventKey, count + 1);
    SecurityMonitor.lastEventTime.set(eventKey, now);
    SecurityMonitor.lastEventTime.set(eventHash, now);

    // Only log critical and high severity events in production
    if (import.meta.env.DEV || severity === 'critical' || severity === 'high') {
      try {
        DebugLogger?.log('error', `${severity.toUpperCase()}: ${type}`, data);
      } catch (e) {
        // Fallback if DebugLogger is not available
        console.error(`[SECURITY] ${severity.toUpperCase()}: ${type}`, data);
      }
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

  // Monitor performance - ONLY in debug mode to reduce production noise
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('debug=security')) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Only log extremely slow operations (>10000ms) in production
          const threshold = import.meta.env.PROD ? 10000 : 5000;
          if (entry.duration > threshold) {
            SecurityMonitor.logEvent('critical_slow_operation', {
              name: entry.name,
              duration: entry.duration,
              type: entry.entryType
            }, 'high');
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

  // Monitor console access in production (only errors and critical warnings)
  useEffect(() => {
    if (import.meta.env.PROD) {
      const originalConsole = { ...console };
      
      // Only intercept error and warn in production to reduce noise
      ['error', 'warn'].forEach((method) => {
        (console as any)[method] = (...args: any[]) => {
          // Only log if it contains error keywords or is frequent enough to matter
          const message = args.join(' ').toLowerCase();
          if (message.includes('error') || message.includes('failed') || message.includes('critical')) {
            SecurityMonitor.logEvent('console_access', {
              method,
              argsCount: args.length,
              preview: args[0]?.toString?.()?.substring(0, 100) || 'unknown'
            }, method === 'error' ? 'medium' : 'low');
          }
          
          (originalConsole as any)[method](...args);
        };
      });
    }
  }, []);

  const handleError = useCallback((error: Error, errorInfo?: { componentStack: string }) => {
    UserActivityMonitor.trackError(error, errorInfo?.componentStack);
  }, []);

  // Monitor network requests (filtered and optimized)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      
      // URLs to ignore (routine operations)
      const ignoredUrls = [
        '/api/analytics',
        '/api/heartbeat',
        '/api/ping',
        'sentry.io',
        'googleapis.com',
        '/api/session'
      ];
      
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = args[0]?.toString() || 'unknown';
        
        // Skip monitoring for routine requests
        if (ignoredUrls.some(ignored => url.includes(ignored))) {
          return originalFetch(...args);
        }
        
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - startTime;
          
          // Only log failed requests or extremely slow requests in production
          if (!response.ok || (duration > (import.meta.env.PROD ? 10000 : 5000)) || import.meta.env.DEV) {
            SecurityMonitor.logEvent('network_request', {
              url: url.substring(0, 100), // Truncate long URLs
              method: args[1]?.method || 'GET',
              status: response.status,
              duration: Math.round(duration),
              success: response.ok
            }, response.ok ? (duration > 5000 ? 'medium' : 'low') : 'medium');
          }
          
          return response;
        } catch (error) {
          const duration = performance.now() - startTime;
          
          SecurityMonitor.logEvent('network_error', {
            url: url.substring(0, 100),
            method: args[1]?.method || 'GET',
            duration: Math.round(duration),
            error: error instanceof Error ? error.message.substring(0, 200) : 'Unknown error'
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