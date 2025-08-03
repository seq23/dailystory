// Name formatting utilities for proper capitalization
export class NameFormatter {
  /**
   * Properly capitalizes names handling various edge cases
   */
  static capitalize(name: string): string {
    if (!name || typeof name !== 'string') return '';
    
    const trimmed = name.trim();
    if (!trimmed) return '';
    
    // Handle hyphenated names (Mary-Jane -> Mary-Jane)
    if (trimmed.includes('-')) {
      return trimmed.split('-')
        .map(part => this.capitalizeWord(part))
        .join('-');
    }
    
    // Handle multiple words (Mary Jane -> Mary Jane)
    if (trimmed.includes(' ')) {
      return trimmed.split(' ')
        .map(part => this.capitalizeWord(part))
        .join(' ');
    }
    
    // Single word
    return this.capitalizeWord(trimmed);
  }
  
  /**
   * Capitalizes a single word (first letter uppercase, rest lowercase)
   */
  private static capitalizeWord(word: string): string {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  
  /**
   * Validates if a name is properly formatted
   */
  static isProperlyCapitalized(name: string): boolean {
    if (!name) return false;
    const formatted = this.capitalize(name);
    return name === formatted;
  }
}