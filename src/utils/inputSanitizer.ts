import DOMPurify from 'dompurify';
import { ContentSecurity } from './security';

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

  // Advanced character substitution patterns for leetspeak detection
  private static readonly leetspeakPatterns = [
    { pattern: /[0o]/gi, replacement: 'o' },
    { pattern: /[1l!|]/gi, replacement: 'l' },
    { pattern: /[3e]/gi, replacement: 'e' },
    { pattern: /[4a@]/gi, replacement: 'a' },
    { pattern: /[5s\$]/gi, replacement: 's' },
    { pattern: /[7t]/gi, replacement: 't' },
    { pattern: /[8b]/gi, replacement: 'b' },
    { pattern: /[9g]/gi, replacement: 'g' },
    { pattern: /[6g]/gi, replacement: 'g' },
    { pattern: /[2z]/gi, replacement: 'z' },
    { pattern: /[+t]/gi, replacement: 't' },
    { pattern: /[\*]/gi, replacement: '' },
    { pattern: /[_]/gi, replacement: '' }
  ];

  // Phonetic similarity patterns for common misspellings
  private static readonly phoneticPatterns = [
    { pattern: /f[u\*]ck?/gi, replacement: 'fuck' },
    { pattern: /sh[i!1]t/gi, replacement: 'shit' },
    { pattern: /b[i!1]tch/gi, replacement: 'bitch' },
    { pattern: /a[s\$][s\$]/gi, replacement: 'ass' },
    { pattern: /d[a@]mn/gi, replacement: 'damn' },
    { pattern: /h[e3][l1][l1]/gi, replacement: 'hell' },
    { pattern: /wh[o0]r[e3]/gi, replacement: 'whore' },
    { pattern: /h[o0][e3]?s?/gi, replacement: 'hoe' }
  ];

  // Semantic context patterns for inappropriate combinations
  private static readonly semanticPatterns = [
    { pattern: /\b(bad|hot|sexy|fine|nasty)\s+(hoe?s?|girl?s?|boy?s?|bitch|chick?s?)\b/gi, reason: 'inappropriate description' },
    { pattern: /\b(big|huge|small|tiny)\s+(boob?s?|tit?s?|butt?s?|ass|dick?s?|penis|vagina)\b/gi, reason: 'inappropriate body reference' },
    { pattern: /\b(having|want|need|like)\s+(sex|intercourse|coitus|fucking|mating)\b/gi, reason: 'inappropriate sexual content' },
    { pattern: /\b(my|our|the)\s+(house|home|address|location)\s+(at|on|is)\s+\d/gi, reason: 'personal location information' },
    { pattern: /\b(born|birthday|bday)\s+(on|at|in)?\s*\d+[\/\-\.]\d+/gi, reason: 'personal birth information' },
    { pattern: /\b(call|text|email|contact)\s+me\s+(at|on)?\s*[\d\-\(\)]/gi, reason: 'personal contact request' }
  ];

  /**
   * Multi-pass text normalization for comprehensive detection
   */
  private static normalizeText(input: string): string {
    let normalized = input.toLowerCase().trim();
    
    // Pass 1: Apply leetspeak substitutions
    this.leetspeakPatterns.forEach(({ pattern, replacement }) => {
      normalized = normalized.replace(pattern, replacement);
    });
    
    // Pass 2: Apply phonetic corrections
    this.phoneticPatterns.forEach(({ pattern, replacement }) => {
      normalized = normalized.replace(pattern, replacement);
    });
    
    // Pass 3: Remove extra spaces and punctuation for word boundary detection
    normalized = normalized.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
    
    return normalized;
  }

  /**
   * Enhanced COPPA compliance validation with multi-layered semantic analysis
   */
  static validateChildSafeInput(input: string, context: 'name' | 'interest' | 'theme' | 'general' = 'general'): {
    isValid: boolean;
    issues: string[];
    suggestions?: string[];
  } {
    if (!input || typeof input !== 'string') {
      return { isValid: false, issues: ['Input is required'] };
    }

    const cleaned = input.trim();
    const normalized = this.normalizeText(cleaned);
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Pass 1: Check comprehensive profanity using ContentSecurity word lists
    const contentCheck = ContentSecurity.isContentAppropriate(cleaned);
    if (!contentCheck.appropriate) {
      issues.push('Contains inappropriate language or content');
      if (context === 'name') {
        suggestions.push('Please use only your child\'s first name without inappropriate words');
      } else if (context === 'interest') {
        suggestions.push('Try child-friendly activities like "reading", "animals", "sports"');
      } else if (context === 'theme') {
        suggestions.push('Consider fun, age-appropriate themes like "adventure", "friendship", "magic"');
      } else {
        suggestions.push('Please use appropriate language suitable for children');
      }
    }

    // Pass 2: Check semantic context patterns for inappropriate combinations
    for (const { pattern, reason } of this.semanticPatterns) {
      if (pattern.test(normalized) || pattern.test(cleaned)) {
        issues.push(`Contains ${reason} not suitable for children`);
        suggestions.push('Please rephrase using child-friendly language');
      }
    }

    // Pass 3: Enhanced personal information patterns
    const personalInfoPatterns = {
      contact: /\b(phone|email|address|meet|location|where.*live|contact.*me|call.*me|text.*me|find.*me)\b/i,
      personal: /\b(last.*name|full.*name|real.*name|password|secret|ssn|social.*security|birth.*date|birthday)\b/i,
      personalInfo: /\b(\d{3}[-.]?\d{3}[-.]?\d{4}|\(\d{3}\)\s*\d{3}[-.]?\d{4}|\d{3}-?\d{2}-?\d{4})\b/,
      addresses: /\b\d+\s+[A-Za-z\s]*(street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|boulevard|blvd\.?|way|ct\.?|court|place|pl\.?|circle|cir\.?|trail|pkwy\.?|parkway|hunt|fox\s+hunt)\b/i,
      birthdays: /\b(0?[1-9]|1[0-2])[\/\-\.](0?[1-9]|[12][0-9]|3[01])[\/\-\.](\d{2,4})\b/,
      myHouse: /\b(my\s+house|my\s+home|my\s+address|where\s+i\s+live)\b/i
    };

    // Pass 4: Context-specific validation
    const contextChecks = {
      name: ['personal', 'personalInfo', 'addresses', 'birthdays'],
      interest: ['contact', 'personalInfo', 'addresses', 'birthdays', 'myHouse'],
      theme: ['contact', 'personal', 'personalInfo', 'addresses', 'birthdays', 'myHouse'],
      general: ['contact', 'personal', 'personalInfo', 'addresses', 'birthdays', 'myHouse']
    };

    const checksToRun = contextChecks[context] || contextChecks.general;
    
    for (const checkType of checksToRun) {
      const pattern = personalInfoPatterns[checkType as keyof typeof personalInfoPatterns];
      if (pattern.test(cleaned) || pattern.test(normalized)) {
        issues.push(`Contains personal information that shouldn't be shared (${checkType})`);
        
        if (context === 'name') {
          suggestions.push('Please use only your child\'s first name');
        } else {
          suggestions.push('Please remove any personal information like addresses, phone numbers, or birthdays');
        }
      }
    }

    // Pass 5: Additional safety checks
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