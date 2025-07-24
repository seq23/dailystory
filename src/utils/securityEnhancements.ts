import { SecurityMonitor } from './monitoring';
import { SECURITY_CONFIG } from './securityConfig';

export class SecurityEnhancements {
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private static suspiciousActivityTracker = new Map<string, number>();

  // Enhanced rate limiting with progressive penalties
  static enhancedRateLimit(identifier: string, action: string, baseLimit: number = 10): boolean {
    const key = `${identifier}_${action}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    
    const current = this.rateLimitMap.get(key);
    
    if (!current || now > current.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    // Progressive penalties for repeat offenders
    const suspiciousCount = this.suspiciousActivityTracker.get(identifier) || 0;
    const adjustedLimit = Math.max(1, baseLimit - Math.floor(suspiciousCount / 5));
    
    if (current.count >= adjustedLimit) {
      // Track suspicious activity
      this.suspiciousActivityTracker.set(identifier, suspiciousCount + 1);
      
      SecurityMonitor.logEvent('security', 'enhanced_rate_limit_exceeded', {
        identifier,
        action,
        count: current.count,
        limit: adjustedLimit,
        suspiciousCount
      }, suspiciousCount > 10 ? 'high' : 'medium');
      
      return false;
    }
    
    current.count++;
    return true;
  }

  // Content integrity validation
  static validateContentIntegrity(content: string, expectedType: string): boolean {
    const patterns = {
      story: /^[a-zA-Z0-9\s\.,!?;:'"()\-\u00C0-\u017F\u0100-\u024F]+$/,
      name: /^[a-zA-Z\s\-'\.]{1,50}$/,
      age: /^[0-9]{1,2}$/,
      general: /^[a-zA-Z0-9\s\.,!?;:'"()\-\u00C0-\u017F\u0100-\u024F\n\r]+$/
    };

    const pattern = patterns[expectedType as keyof typeof patterns] || patterns.general;
    
    if (!pattern.test(content)) {
      SecurityMonitor.logEvent('security', 'content_integrity_violation', {
        expectedType,
        contentLength: content.length,
        firstChars: content.slice(0, 50)
      }, 'medium');
      return false;
    }
    
    return true;
  }

  // Advanced XSS prevention
  static sanitizeAndValidateInput(input: string, context: string): { safe: boolean; sanitized: string } {
    // Remove potentially dangerous content
    let sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
      .replace(/<object[^>]*>.*?<\/object>/gis, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gis, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '');

    // Check for remaining suspicious patterns
    const dangerousPatterns = [
      /<[^>]*>/g, // Any remaining HTML tags
      /javascript/gi,
      /vbscript/gi,
      /expression\(/gi,
      /eval\(/gi,
      /document\./gi,
      /window\./gi
    ];

    const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(sanitized));
    
    if (hasDangerousContent) {
      SecurityMonitor.logEvent('security', 'dangerous_content_detected', {
        context,
        original: input.slice(0, 100),
        sanitized: sanitized.slice(0, 100)
      }, 'high');
    }

    return {
      safe: !hasDangerousContent,
      sanitized
    };
  }

  // Real-time security alerts
  static triggerSecurityAlert(severity: 'low' | 'medium' | 'high' | 'critical', message: string, details?: any) {
    SecurityMonitor.logEvent('security', 'security_alert', {
      message,
      details,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }, severity);

    // For critical alerts, consider additional actions
    if (severity === 'critical') {
      this.handleCriticalSecurityEvent(message, details);
    }
  }

  // Critical security event handler
  private static handleCriticalSecurityEvent(message: string, details: any) {
    // Log to console for immediate visibility
    console.error('CRITICAL SECURITY EVENT:', message, details);
    
    // Could trigger additional security measures:
    // - Temporary session suspension
    // - Additional authentication requirements
    // - Rate limit adjustments
    
    SecurityMonitor.logEvent('security', 'critical_security_response', {
      originalEvent: message,
      details,
      responseActions: ['logged', 'monitored']
    }, 'critical');
  }

  // Security metrics collection
  static getSecurityMetrics() {
    const events = SecurityMonitor.getSecurityEvents();
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const lastHour = now - (60 * 60 * 1000);

    const recentEvents = events.filter(e => e.timestamp > last24h);
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical');
    const hourlyEvents = events.filter(e => e.timestamp > lastHour);

    return {
      total24h: recentEvents.length,
      criticalCount: criticalEvents.length,
      hourlyRate: hourlyEvents.length,
      topThreats: this.getTopThreats(recentEvents),
      securityScore: this.calculateSecurityScore(recentEvents)
    };
  }

  // Calculate security score based on recent events
  private static calculateSecurityScore(events: any[]): number {
    if (events.length === 0) return 100;

    const weights = { critical: 25, high: 10, medium: 5, low: 1 };
    const totalWeight = events.reduce((sum, event) => {
      return sum + (weights[event.severity as keyof typeof weights] || 0);
    }, 0);

    // Score decreases with more severe events
    const maxPossibleWeight = events.length * weights.critical;
    const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100);
    
    return Math.round(score);
  }

  // Identify top security threats
  private static getTopThreats(events: any[]): Array<{ type: string; count: number; severity: string }> {
    const threatCounts = new Map<string, { count: number; maxSeverity: string }>();

    events.forEach(event => {
      const current = threatCounts.get(event.type) || { count: 0, maxSeverity: 'low' };
      current.count++;
      
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      if (severityLevels[event.severity] > severityLevels[current.maxSeverity]) {
        current.maxSeverity = event.severity;
      }
      
      threatCounts.set(event.type, current);
    });

    return Array.from(threatCounts.entries())
      .map(([type, data]) => ({ type, count: data.count, severity: data.maxSeverity }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Initialize security enhancements
  static initialize() {
    // Set up automatic cleanup of old rate limit entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.rateLimitMap.entries()) {
        if (now > data.resetTime) {
          this.rateLimitMap.delete(key);
        }
      }
    }, 60000); // Clean up every minute

    // Set up suspicious activity decay
    setInterval(() => {
      for (const [key, count] of this.suspiciousActivityTracker.entries()) {
        if (count > 0) {
          this.suspiciousActivityTracker.set(key, Math.max(0, count - 1));
        }
      }
    }, 300000); // Decay every 5 minutes

    SecurityMonitor.logEvent('security', 'security_enhancements_initialized', {
      timestamp: Date.now(),
      features: ['enhanced_rate_limiting', 'content_integrity', 'xss_prevention', 'real_time_alerts']
    }, 'low');
  }
}

// Auto-initialize when module loads
SecurityEnhancements.initialize();