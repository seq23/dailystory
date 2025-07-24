// Monitoring and Analytics Utilities for Security

export class SecurityMonitor {
  private static readonly MAX_EVENTS = 1000;
  private static events: Array<{
    id: string;
    timestamp: number;
    type: 'security' | 'performance' | 'error' | 'user';
    event: string;
    data: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  static logEvent(
    type: 'security' | 'performance' | 'error' | 'user',
    event: string,
    data: any = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ) {
    const eventLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      type,
      event,
      data: this.sanitizeData(data),
      severity
    };

    this.events.push(eventLog);

    // Keep only the most recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logLevel = severity === 'critical' ? 'error' : 
                     severity === 'high' ? 'warn' : 'log';
      console[logLevel](`[${type.toUpperCase()}] ${event}:`, data);
    }

    // Handle critical events
    if (severity === 'critical') {
      this.handleCriticalEvent(eventLog);
    }
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private static sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    
    // Remove or redact sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'email'];
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private static handleCriticalEvent(event: typeof this.events[0]) {
    // In a real application, this would send alerts to monitoring services
    console.error('CRITICAL SECURITY EVENT:', event);
    
    // Could trigger email alerts, Slack notifications, etc.
    // For now, just store it locally
    const criticalEvents = this.getCriticalEvents();
    localStorage.setItem('criticalSecurityEvents', JSON.stringify(criticalEvents));
  }

  static getEvents(filter?: {
    type?: 'security' | 'performance' | 'error' | 'user';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    since?: number;
  }) {
    let filtered = [...this.events];

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(e => e.type === filter.type);
      }
      if (filter.severity) {
        filtered = filtered.filter(e => e.severity === filter.severity);
      }
      if (filter.since) {
        filtered = filtered.filter(e => e.timestamp >= filter.since);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  static getCriticalEvents() {
    return this.getEvents({ severity: 'critical' });
  }

  static getSecurityEvents() {
    return this.getEvents({ type: 'security' });
  }

  static exportEvents() {
    return {
      exportedAt: Date.now(),
      events: this.events,
      summary: {
        total: this.events.length,
        bySeverity: {
          low: this.events.filter(e => e.severity === 'low').length,
          medium: this.events.filter(e => e.severity === 'medium').length,
          high: this.events.filter(e => e.severity === 'high').length,
          critical: this.events.filter(e => e.severity === 'critical').length,
        },
        byType: {
          security: this.events.filter(e => e.type === 'security').length,
          performance: this.events.filter(e => e.type === 'performance').length,
          error: this.events.filter(e => e.type === 'error').length,
          user: this.events.filter(e => e.type === 'user').length,
        }
      }
    };
  }

  static clearEvents() {
    this.events = [];
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static performanceMarks = new Map<string, number>();

  static startTiming(label: string) {
    this.performanceMarks.set(label, performance.now());
  }

  static endTiming(label: string) {
    const startTime = this.performanceMarks.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(label);
      
      SecurityMonitor.logEvent('performance', 'timing', {
        operation: label,
        duration: Math.round(duration),
        timestamp: Date.now()
      }, duration > 1000 ? 'medium' : 'low');

      return duration;
    }
    return null;
  }

  static measureAsync<T>(label: string, operation: () => Promise<T>): Promise<T> {
    this.startTiming(label);
    return operation().finally(() => {
      this.endTiming(label);
    });
  }
}

// User activity tracking (privacy-conscious)
export class UserActivityMonitor {
  private static sessionId = Math.random().toString(36).substr(2, 9);
  private static sessionStart = Date.now();

  static trackPageView(path: string) {
    SecurityMonitor.logEvent('user', 'page_view', {
      path,
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStart
    });
  }

  static trackUserAction(action: string, details: any = {}) {
    SecurityMonitor.logEvent('user', 'action', {
      action,
      details,
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStart
    });
  }

  static trackError(error: Error, context: string) {
    SecurityMonitor.logEvent('error', 'user_error', {
      message: error.message,
      stack: error.stack?.substring(0, 500), // Limit stack trace length
      context,
      sessionId: this.sessionId
    }, 'medium');
  }
}

// Integration with existing security logger
export const integrateWithSecurityLogger = () => {
  // This would integrate with the existing SecurityLogger if needed
  // For now, they work in parallel
};
