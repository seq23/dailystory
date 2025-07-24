// Enhanced Security Utilities for Children's Story App

// Content filtering and sanitization
export class ContentSecurity {
  private static inappropriateWords = [
    // Violent/scary content
    'scary', 'frightening', 'violent', 'dark', 'death', 'kill', 'weapon', 'gun', 'sword', 'fight',
    'monster', 'ghost', 'zombie', 'vampire', 'witch', 'evil', 'mean', 'bad', 'hurt', 'pain',
    'blood', 'angry', 'mad', 'hate', 'stupid', 'dumb', 'ugly', 'fat', 'skinny',
    
    // Profanity and inappropriate language
    'damn', 'hell', 'crap', 'piss', 'ass', 'bitch', 'bastard', 'shit', 'fuck', 'fucking',
    'motherfucker', 'asshole', 'dickhead', 'prick', 'cock', 'pussy', 'whore', 'slut',
    'retard', 'gay', 'homo', 'fag', 'nigger', 'spic', 'chink', 'kike', 'dick',
    
    // Sexual content
    'sex', 'sexual', 'porn', 'naked', 'nude', 'boobs', 'penis', 'vagina', 'orgasm',
    'masturbate', 'horny', 'sexy', 'erotic', 'prostitute', 'rape', 'molest',
    
    // Drug/alcohol references
    'drunk', 'weed', 'marijuana', 'cocaine', 'heroin', 'meth', 'drugs', 'smoking',
    'cigarette', 'alcohol', 'beer', 'vodka', 'whiskey',
    
    // Other inappropriate content
    'suicide', 'depression', 'cutting', 'self-harm', 'anorexia', 'bulimia'
  ];

  // Character substitution patterns (e.g., "v1ol3nt" → "violent")
  private static substitutionPatterns = [
    { pattern: /[0o]/gi, replacement: 'o' },
    { pattern: /[1l!]/gi, replacement: 'l' },
    { pattern: /[3e]/gi, replacement: 'e' },
    { pattern: /[4a@]/gi, replacement: 'a' },
    { pattern: /[5s\$]/gi, replacement: 's' },
    { pattern: /[7t]/gi, replacement: 't' },
    { pattern: /[8b]/gi, replacement: 'b' },
    { pattern: /[9g]/gi, replacement: 'g' }
  ];

  // Rate limiting storage
  private static submissionCounts = new Map<string, { count: number; timestamp: number }>();

  /**
   * Enhanced content filtering with character substitution detection
   */
  static isContentAppropriate(text: string): { appropriate: boolean; reason?: string } {
    if (!text || typeof text !== 'string') {
      return { appropriate: false, reason: 'Invalid input' };
    }

    // Normalize the text by removing special characters and applying substitution patterns
    let normalizedText = text.toLowerCase().trim();
    
    // Apply character substitution patterns
    this.substitutionPatterns.forEach(({ pattern, replacement }) => {
      normalizedText = normalizedText.replace(pattern, replacement);
    });

    // Remove non-alphabetic characters except spaces
    normalizedText = normalizedText.replace(/[^a-z\s]/g, '');

    // Check against inappropriate words
    for (const word of this.inappropriateWords) {
      if (normalizedText.includes(word)) {
        return { appropriate: false, reason: `Inappropriate content detected: ${word}` };
      }
    }

    // Check for repeated characters (potential obfuscation)
    if (/(.)\1{4,}/.test(normalizedText)) {
      return { appropriate: false, reason: 'Suspicious character repetition detected' };
    }

    return { appropriate: true };
  }

  /**
   * HTML sanitization for user inputs
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
      .slice(0, 500); // Limit input length
  }

  /**
   * Rate limiting for form submissions
   */
  static checkRateLimit(identifier: string, maxSubmissions = 5, windowMs = 60000): boolean {
    const now = Date.now();
    const userSubmissions = this.submissionCounts.get(identifier);

    if (!userSubmissions) {
      this.submissionCounts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    // Reset counter if window has passed
    if (now - userSubmissions.timestamp > windowMs) {
      this.submissionCounts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    // Check if under limit
    if (userSubmissions.count < maxSubmissions) {
      userSubmissions.count++;
      return true;
    }

    return false;
  }

  /**
   * Prompt injection protection for story generation
   */
  static sanitizePrompt(prompt: string): string {
    if (!prompt || typeof prompt !== 'string') return '';

    // Remove potential prompt injection patterns
    const dangerousPatterns = [
      /ignore\s+previous\s+instructions/gi,
      /forget\s+everything/gi,
      /you\s+are\s+now/gi,
      /system\s*:/gi,
      /human\s*:/gi,
      /assistant\s*:/gi,
      /<\|.*\|>/gi, // Special tokens
      /\[INST\].*?\[\/INST\]/gi, // Instruction tokens
    ];

    let sanitized = prompt;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return this.sanitizeInput(sanitized);
  }

  /**
   * Validate story content for appropriateness
   */
  static validateStoryContent(story: string[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    for (let i = 0; i < story.length; i++) {
      const paragraph = story[i];
      const validation = this.isContentAppropriate(paragraph);
      
      if (!validation.appropriate) {
        issues.push(`Paragraph ${i + 1}: ${validation.reason}`);
      }
    }

    return { valid: issues.length === 0, issues };
  }
}

// Security logging utility
export class SecurityLogger {
  private static logs: Array<{ timestamp: number; event: string; details: any }> = [];

  static log(event: string, details: any = {}) {
    this.logs.push({
      timestamp: Date.now(),
      event,
      details: {
        ...details,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Security] ${event}:`, details);
    }

    // Keep only last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  static getLogs() {
    return [...this.logs];
  }

  static exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Error boundary utility for security-related errors
export const handleSecurityError = (error: Error, context: string) => {
  SecurityLogger.log('security_error', {
    error: error.message,
    stack: error.stack,
    context
  });

  // Return user-friendly error message
  return 'We detected an issue with your input. Please try again with different content.';
};
