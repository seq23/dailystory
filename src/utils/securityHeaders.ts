/**
 * Client-side security headers and CSP utilities
 * Provides runtime security header management and CSP violation detection
 */

import { supabase } from "@/integrations/supabase/client";

export interface SecurityHeadersConfig {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableFrameOptions?: boolean;
  reportViolations?: boolean;
}

export class SecurityHeadersManager {
  private static instance: SecurityHeadersManager;
  private config: SecurityHeadersConfig;
  private violationReports: any[] = [];

  private constructor(config: SecurityHeadersConfig) {
    this.config = config;
    this.setupViolationReporting();
  }

  static getInstance(config: SecurityHeadersConfig = {}): SecurityHeadersManager {
    if (!SecurityHeadersManager.instance) {
      SecurityHeadersManager.instance = new SecurityHeadersManager(config);
    }
    return SecurityHeadersManager.instance;
  }

  /**
   * Apply client-side security meta tags
   */
  applySecurityHeaders(): void {
    // Remove existing security meta tags to avoid duplicates
    this.removeExistingSecurityTags();

    // Apply Content Security Policy
    if (this.config.enableCSP !== false) {
      this.applyCSP();
    }

    // Apply security-related meta tags
    this.applySecurityMetaTags();

    // Set up violation reporting
    if (this.config.reportViolations !== false) {
      this.setupViolationReporting();
    }
  }

  private removeExistingSecurityTags(): void {
    const securityTags = [
      'meta[http-equiv="Content-Security-Policy"]',
      'meta[http-equiv="X-Content-Type-Options"]',
      'meta[http-equiv="X-Frame-Options"]',
      'meta[http-equiv="X-XSS-Protection"]',
      'meta[http-equiv="Referrer-Policy"]',
      'meta[http-equiv="Permissions-Policy"]'
    ];

    securityTags.forEach(selector => {
      const existing = document.querySelector(selector);
      if (existing) {
        existing.remove();
      }
    });
  }

  private applyCSP(): void {
    // Enhanced CSP policy for children's app
    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://*.lovable.dev https://*.lovable.app https://*.gptengineer.app",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' wss: https:",
      "font-src 'self' data:",
      "media-src 'self' data: blob:",
      "object-src 'none'",
      "frame-ancestors 'self' https://*.lovable.dev https://*.lovable.app https://*.gptengineer.app",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    meta.setAttribute('content', cspPolicy);
    document.head.appendChild(meta);
  }

  private applySecurityMetaTags(): void {
    const securityHeaders = [
      {
        'http-equiv': 'X-Content-Type-Options',
        content: 'nosniff'
      },
      {
        'http-equiv': 'X-Frame-Options',
        content: 'SAMEORIGIN'
      },
      {
        'http-equiv': 'X-XSS-Protection',
        content: '1; mode=block'
      },
      {
        'http-equiv': 'Referrer-Policy',
        content: 'strict-origin-when-cross-origin'
      },
      {
        'http-equiv': 'Permissions-Policy',
        content: 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    ];

    securityHeaders.forEach(header => {
      const meta = document.createElement('meta');
      Object.entries(header).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      document.head.appendChild(meta);
    });
  }

  private setupViolationReporting(): void {
    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      const violation = {
        type: 'csp-violation',
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        effectiveDirective: event.effectiveDirective,
        originalPolicy: event.originalPolicy,
        referrer: event.referrer,
        statusCode: event.statusCode,
        violatedDirective: event.violatedDirective,
        timestamp: new Date().toISOString()
      };

      this.violationReports.push(violation);
      this.reportViolation(violation);

      // Limit stored violations to prevent memory leaks
      if (this.violationReports.length > 100) {
        this.violationReports = this.violationReports.slice(-50);
      }
    });

    // Monitor for suspicious iframe attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'IFRAME' || element.tagName === 'OBJECT' || element.tagName === 'EMBED') {
              const violation = {
                type: 'suspicious-element',
                tagName: element.tagName,
                src: element.getAttribute('src'),
                timestamp: new Date().toISOString()
              };
              this.violationReports.push(violation);
              this.reportViolation(violation);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private async reportViolation(violation: any): Promise<void> {
    try {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Security violation detected:', violation);
      }

      // Report to backend security monitoring
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.functions.invoke('log-security-event', {
          body: {
            eventType: 'security_violation',
            details: violation
          }
        });
      }
    } catch (error) {
      console.error('Failed to report security violation:', error);
    }
  }

  /**
   * Get violation reports for debugging
   */
  getViolationReports(): any[] {
    return [...this.violationReports];
  }

  /**
   * Clear violation reports
   */
  clearViolationReports(): void {
    this.violationReports = [];
  }

  /**
   * Check if running in secure context (HTTPS)
   */
  isSecureContext(): boolean {
    return window.isSecureContext;
  }

  /**
   * Validate current page security
   */
  validatePageSecurity(): {
    isSecure: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check HTTPS
    if (!this.isSecureContext()) {
      issues.push('Page not served over HTTPS');
      recommendations.push('Enable HTTPS for production deployment');
    }

    // Check for mixed content
    if (window.location.protocol === 'https:') {
      const scripts = document.querySelectorAll('script[src]');
      const links = document.querySelectorAll('link[href]');
      const images = document.querySelectorAll('img[src]');

      [scripts, links, images].forEach(elements => {
        elements.forEach(element => {
          const src = element.getAttribute('src') || element.getAttribute('href');
          if (src && src.startsWith('http:')) {
            issues.push(`Mixed content detected: ${src}`);
            recommendations.push('Use HTTPS URLs for all external resources');
          }
        });
      });
    }

    // Check for inline scripts (potential XSS risk)
    const inlineScripts = document.querySelectorAll('script:not([src])');
    if (inlineScripts.length > 0) {
      issues.push(`${inlineScripts.length} inline script(s) detected`);
      recommendations.push('Move inline scripts to external files with proper CSP');
    }

    // Check for dangerous attributes
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover'];
    dangerousAttributes.forEach(attr => {
      const elements = document.querySelectorAll(`[${attr}]`);
      if (elements.length > 0) {
        issues.push(`Elements with ${attr} attribute detected`);
        recommendations.push(`Remove inline event handlers and use addEventListener`);
      }
    });

    return {
      isSecure: issues.length === 0,
      issues,
      recommendations
    };
  }
}

/**
 * Initialize security headers for the application
 */
export const initializeSecurityHeaders = (config: SecurityHeadersConfig = {}): void => {
  const manager = SecurityHeadersManager.getInstance(config);
  
  // Apply headers immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      manager.applySecurityHeaders();
    });
  } else {
    manager.applySecurityHeaders();
  }
};

/**
 * React hook for security headers management
 */
export const useSecurityHeaders = (config: SecurityHeadersConfig = {}) => {
  const manager = SecurityHeadersManager.getInstance(config);
  
  const validateSecurity = () => manager.validatePageSecurity();
  const getViolations = () => manager.getViolationReports();
  const clearViolations = () => manager.clearViolationReports();
  const isSecure = () => manager.isSecureContext();

  return {
    validateSecurity,
    getViolations,
    clearViolations,
    isSecure
  };
};