import { ContentSecurity } from './security';
import { SecurityMonitor } from './monitoring';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: any;
}

export class SecurityValidator {
  // Enhanced input validation with comprehensive checks
  static validateUserInput(input: any, context: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitized = input;

    try {
      if (typeof input === 'string') {
        // Check content appropriateness
        const contentCheck = ContentSecurity.isContentAppropriate(input);
        if (!contentCheck.appropriate) {
          errors.push(`Inappropriate content detected: ${contentCheck.reason}`);
          SecurityMonitor.logEvent('security', 'inappropriate_content_blocked', {
            context,
            reason: contentCheck.reason
          }, 'medium');
        }

        // Sanitize input
        sanitized = ContentSecurity.sanitizeInput(input);
        
        // Check for potential injection attempts
        const injectionPatterns = [
          /<script[^>]*>.*?<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /data:text\/html/gi,
          /vbscript:/gi
        ];

        injectionPatterns.forEach(pattern => {
          if (pattern.test(input)) {
            errors.push('Potential script injection detected');
            SecurityMonitor.logEvent('security', 'injection_attempt', {
              context,
              pattern: pattern.toString()
            }, 'high');
          }
        });

        // Check for excessive length
        if (input.length > 10000) {
          warnings.push('Input exceeds recommended length');
          SecurityMonitor.logEvent('security', 'excessive_input_length', {
            context,
            length: input.length
          }, 'low');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        sanitized
      };
    } catch (error) {
      SecurityMonitor.logEvent('error', 'validation_error', {
        context,
        error: error.toString()
      }, 'medium');
      
      return {
        valid: false,
        errors: ['Validation process failed'],
        warnings
      };
    }
  }

  // Validate API responses
  static validateApiResponse(response: any, expectedSchema?: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for required fields based on response type
      if (response && typeof response === 'object') {
        // Validate image response
        if (response.imageURL) {
          if (!response.imageURL.startsWith('https://')) {
            errors.push('Image URL must use HTTPS');
          }
          
          if (!response.imageURL.includes('runware.ai')) {
            warnings.push('Image URL from unexpected domain');
          }
        }

        // Check for NSFW content flag
        if (response.NSFWContent === true) {
          errors.push('Content flagged as inappropriate');
          SecurityMonitor.logEvent('security', 'nsfw_content_detected', {
            imageURL: response.imageURL
          }, 'high');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        valid: false,
        errors: ['Response validation failed'],
        warnings
      };
    }
  }

  // Validate file uploads
  static validateFileUpload(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }

    if (file.size > maxSize) {
      errors.push('File size exceeds limit');
    }

    // Check for suspicious filenames
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.scr$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.com$/i,
      /\.pif$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.jar$/i,
      /\.php$/i
    ];

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(file.name)) {
        errors.push('Suspicious file extension detected');
        SecurityMonitor.logEvent('security', 'suspicious_file_upload', {
          filename: file.name,
          type: file.type,
          size: file.size
        }, 'high');
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate environment and runtime security
  static validateEnvironment(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check HTTPS in production
    if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
      errors.push('Application must run over HTTPS in production');
    }

    // Check for development tools in production
    if (process.env.NODE_ENV === 'production') {
      // Check for common development indicators
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        warnings.push('Running on localhost in production mode');
      }
    }

    // Check for required security features
    if (!window.crypto || !window.crypto.randomUUID) {
      warnings.push('Some cryptographic features may not be available');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Enhanced rate limiting validation
  static validateRateLimit(identifier: string, action: string, limit: number = 10, windowMs: number = 60000): ValidationResult {
    const rateLimitKey = `${identifier}_${action}`;
    const isAllowed = ContentSecurity.checkRateLimit(rateLimitKey, limit, windowMs);

    if (!isAllowed) {
      SecurityMonitor.logEvent('security', 'rate_limit_exceeded', {
        identifier,
        action,
        limit,
        windowMs
      }, 'medium');

      return {
        valid: false,
        errors: ['Rate limit exceeded'],
        warnings: []
      };
    }

    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }
}

// Utility function for comprehensive validation
export const validateSecurely = (data: any, context: string, options?: {
  checkRateLimit?: { identifier: string; action: string; limit?: number; windowMs?: number };
  validateEnvironment?: boolean;
}): ValidationResult => {
  const results: ValidationResult[] = [];

  // Always validate input
  results.push(SecurityValidator.validateUserInput(data, context));

  // Optional rate limit check
  if (options?.checkRateLimit) {
    const { identifier, action, limit, windowMs } = options.checkRateLimit;
    results.push(SecurityValidator.validateRateLimit(identifier, action, limit, windowMs));
  }

  // Optional environment validation
  if (options?.validateEnvironment) {
    results.push(SecurityValidator.validateEnvironment());
  }

  // Combine all results
  const combinedErrors = results.flatMap(r => r.errors);
  const combinedWarnings = results.flatMap(r => r.warnings);
  const sanitized = results.find(r => r.sanitized)?.sanitized || data;

  return {
    valid: combinedErrors.length === 0,
    errors: combinedErrors,
    warnings: combinedWarnings,
    sanitized
  };
};