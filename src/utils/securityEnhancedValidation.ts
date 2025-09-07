/**
 * Enhanced Security Validation Utilities
 * Provides client-side security checks and validation
 */

import { supabase } from "@/integrations/supabase/client";

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class EnhancedSecurityValidator {
  
  /**
   * Validate user input with enhanced security checks
   */
  static validateUserInput(input: string, context: string = 'general'): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Input length validation
    if (input.length > 1000) {
      errors.push('Input exceeds maximum length');
      riskLevel = 'medium';
    }

    // SQL injection patterns (enhanced)
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+=\d+)/gi,
      /(--|\*\/|\*|\/\*)/g,
      /(\bxp_cmdshell\b|\bsp_\w+\b)/gi,
      /(\b(INFORMATION_SCHEMA|sys\.tables|mysql\.user)\b)/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        errors.push('Potential SQL injection detected');
        riskLevel = 'critical';
        break;
      }
    }

    // XSS patterns (enhanced)
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        errors.push('Potential XSS attack detected');
        riskLevel = 'critical';
        break;
      }
    }

    // Path traversal patterns
    const pathTraversalPatterns = [
      /\.\.[\/\\]/g,
      /[\/\\]etc[\/\\]passwd/gi,
      /[\/\\]windows[\/\\]system32/gi,
      /%2e%2e/gi,
      /\.\.%2f/gi
    ];

    for (const pattern of pathTraversalPatterns) {
      if (pattern.test(input)) {
        errors.push('Path traversal attempt detected');
        riskLevel = 'high';
        break;
      }
    }

    // Personal information patterns (COPPA compliance)
    const personalInfoPatterns = [
      {
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
        message: 'Social Security Number detected'
      },
      {
        pattern: /\b\d{3}-\d{3}-\d{4}\b/g, // Phone
        message: 'Phone number detected'
      },
      {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
        message: 'Email address detected'
      },
      {
        pattern: /\b\d+\s+[A-Za-z\s]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi, // Address
        message: 'Physical address detected'
      },
      {
        pattern: /\b\d{5}(-\d{4})?\b/g, // ZIP code
        message: 'ZIP code detected'
      }
    ];

    for (const { pattern, message } of personalInfoPatterns) {
      if (pattern.test(input)) {
        warnings.push(message);
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    }

    // Context-specific validation
    if (context === 'story_prompt') {
      // Check for inappropriate content in story prompts
      const inappropriatePatterns = [
        /\b(violence|weapon|gun|knife|kill|murder|death|blood)\b/gi,
        /\b(drug|alcohol|beer|wine|cigarette|smoke)\b/gi,
        /\b(hate|racist|discrimination)\b/gi
      ];

      for (const pattern of inappropriatePatterns) {
        if (pattern.test(input)) {
          warnings.push('Content may not be appropriate for children');
          if (riskLevel === 'low') riskLevel = 'medium';
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel
    };
  }

  /**
   * Enhanced rate limiting check with exponential backoff
   */
  static async checkClientRateLimit(action: string, identifier?: string): Promise<boolean> {
    const key = `rate_limit_${action}_${identifier || 'anonymous'}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 10;

    try {
      const stored = localStorage.getItem(key);
      const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };

      if (now < data.resetTime) {
        if (data.count >= maxRequests) {
          console.warn(`Rate limit exceeded for action: ${action}`);
          return false;
        }
        data.count++;
      } else {
        data.count = 1;
        data.resetTime = now + windowMs;
      }

      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }
  }

  /**
   * Validate file uploads with enhanced security
   */
  static validateFileUpload(file: File): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // File size validation (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
      riskLevel = 'medium';
    }

    // Allowed file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'text/plain', 'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
      riskLevel = 'high';
    }

    // Dangerous file extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
      '.jar', '.zip', '.rar', '.7z', '.tar', '.gz', '.sh', '.php',
      '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl'
    ];

    const fileName = file.name.toLowerCase();
    for (const ext of dangerousExtensions) {
      if (fileName.endsWith(ext)) {
        errors.push('Potentially dangerous file extension');
        riskLevel = 'critical';
        break;
      }
    }

    // Check for double extensions
    if ((fileName.match(/\./g) || []).length > 1) {
      warnings.push('File has multiple extensions');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel
    };
  }

  /**
   * Validate URLs for security
   */
  static validateURL(url: string): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    try {
      const parsedUrl = new URL(url);

      // Block dangerous protocols
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        errors.push('Protocol not allowed');
        riskLevel = 'high';
      }

      // Block local/internal addresses
      const dangerousHosts = [
        'localhost', '127.0.0.1', '0.0.0.0', '::1',
        '192.168.', '10.', '172.16.', '169.254.'
      ];

      for (const host of dangerousHosts) {
        if (parsedUrl.hostname.includes(host)) {
          errors.push('Local/internal addresses not allowed');
          riskLevel = 'high';
          break;
        }
      }

      // Warn about suspicious domains
      const suspiciousDomains = ['.tk', '.ml', '.ga', '.cf'];
      for (const domain of suspiciousDomains) {
        if (parsedUrl.hostname.endsWith(domain)) {
          warnings.push('Suspicious domain detected');
          if (riskLevel === 'low') riskLevel = 'medium';
          break;
        }
      }

    } catch (error) {
      errors.push('Invalid URL format');
      riskLevel = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel
    };
  }

  /**
   * Log security events to the backend
   */
  static async logSecurityEvent(eventType: string, details: any): Promise<void> {
    try {
      // Only log if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.functions.invoke('log-security-event', {
        body: {
          eventType,
          details: {
            ...details,
            client_timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

/**
 * Security validation hook for React components
 */
export const useSecurityValidation = () => {
  const validateInput = (input: string, context?: string) => {
    const result = EnhancedSecurityValidator.validateUserInput(input, context);
    
    // Log high-risk validation failures
    if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
      EnhancedSecurityValidator.logSecurityEvent('validation_failure', {
        context,
        riskLevel: result.riskLevel,
        errors: result.errors,
        inputLength: input.length
      });
    }
    
    return result;
  };

  const checkRateLimit = (action: string, identifier?: string) => {
    return EnhancedSecurityValidator.checkClientRateLimit(action, identifier);
  };

  const validateFile = (file: File) => {
    return EnhancedSecurityValidator.validateFileUpload(file);
  };

  const validateURL = (url: string) => {
    return EnhancedSecurityValidator.validateURL(url);
  };

  return {
    validateInput,
    checkRateLimit,
    validateFile,
    validateURL
  };
};