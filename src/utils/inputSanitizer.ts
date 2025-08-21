import DOMPurify from 'dompurify';

export class InputSanitizer {
  private static config = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input']
  };

  /**
   * Sanitize user input for story generation
   */
  static sanitizeStoryInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove script tags and dangerous content
    const cleaned = DOMPurify.sanitize(input.trim(), this.config);
    
    // Additional validation for story content
    const words = cleaned.split(/\s+/);
    if (words.length > 50) {
      return words.slice(0, 50).join(' ') + '...';
    }
    
    return cleaned;
  }

  /**
   * Sanitize user profile information
   */
  static sanitizeUserInfo(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    const cleaned = DOMPurify.sanitize(input.trim(), this.config);
    
    // Limit length for user profile fields
    return cleaned.length > 100 ? cleaned.slice(0, 100) : cleaned;
  }

  /**
   * Sanitize theme input for validation
   */
  static sanitizeThemeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // First sanitize with DOMPurify
    const cleaned = DOMPurify.sanitize(input.trim(), this.config);
    
    // Additional theme-specific cleaning
    return cleaned
      .replace(/[<>\"']/g, '') // Remove remaining dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .slice(0, 50); // Limit length
  }

  /**
   * Validate and sanitize file names or IDs
   */
  static sanitizeIdentifier(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove all non-alphanumeric characters except hyphens and underscores
    return input.replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 50);
  }

  /**
   * Enhanced COPPA compliance validation with semantic analysis
   */
  static validateChildSafeInput(input: string, context: 'name' | 'interest' | 'theme' | 'general' = 'general'): {
    isValid: boolean;
    issues: string[];
    suggestions?: string[];
  } {
    if (!input || typeof input !== 'string') {
      return { isValid: false, issues: ['Input is required'] };
    }

    const cleaned = input.trim().toLowerCase();
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Enhanced keyword detection with context awareness
    const inappropriatePatterns = {
      contact: /\b(phone|email|address|meet|location|where.*live|contact.*me)\b/i,
      personal: /\b(last.*name|full.*name|real.*name|password|secret)\b/i,
      inappropriate: /\b(scary|violent|fight|hurt|blood|weapon|kill)\b/i,
      adult: /\b(dating|romance|kiss|love|boyfriend|girlfriend)\b/i
    };

    // Check patterns based on context
    const contextChecks = {
      name: ['contact', 'personal'],
      interest: ['inappropriate', 'adult'],
      theme: ['inappropriate', 'adult', 'contact'],
      general: ['contact', 'personal', 'inappropriate', 'adult']
    };

    const checksToRun = contextChecks[context] || contextChecks.general;
    
    for (const checkType of checksToRun) {
      const pattern = inappropriatePatterns[checkType as keyof typeof inappropriatePatterns];
      if (pattern.test(cleaned)) {
        issues.push(`Contains potentially inappropriate content for children (${checkType})`);
        
        // Provide context-specific suggestions
        if (context === 'name') {
          suggestions.push('Please use only your child\'s first name');
        } else if (context === 'interest') {
          suggestions.push('Try child-friendly activities like "reading", "animals", "sports"');
        } else if (context === 'theme') {
          suggestions.push('Consider fun, age-appropriate themes like "adventure", "friendship", "magic"');
        }
      }
    }

    // Length and complexity validation
    if (cleaned.length > 100) {
      issues.push('Input is too long for safety');
      suggestions.push('Please keep input under 100 characters');
    }

    // URL or email detection
    if (/[@.]/.test(cleaned) && (cleaned.includes('.com') || cleaned.includes('@'))) {
      issues.push('Personal contact information detected');
      suggestions.push('Please remove any email addresses or websites');
    }

    // Number sequences (potential phone numbers)
    if (/\d{3,}/.test(cleaned.replace(/\s/g, ''))) {
      issues.push('Number sequences detected - avoid sharing personal numbers');
      suggestions.push('Please remove any phone numbers or personal identifiers');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Real-time validation for form fields
   */
  static validateFieldRealtime(field: string, value: string, context: 'name' | 'interest' | 'theme' | 'general' = 'general'): {
    sanitized: string;
    validation: ReturnType<typeof InputSanitizer.validateChildSafeInput>;
  } {
    const sanitized = this.sanitizeUserInfo(value);
    const validation = this.validateChildSafeInput(sanitized, context);
    
    return { sanitized, validation };
  }
}