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
   * Validate and sanitize file names or IDs
   */
  static sanitizeIdentifier(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove all non-alphanumeric characters except hyphens and underscores
    return input.replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 50);
  }
}