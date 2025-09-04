// Placeholder Resolver - Enhanced with Plural Detection and Vocabulary Highlighting
// Future enhancement as per implementation plan

export interface PlaceholderResolverConfig {
  enablePluralDetection: boolean;
  enableVocabularyHighlighting: boolean;
  colorCoding: {
    level0: string;
    level1: string; 
    level2: string;
    level3: string;
    level4: string;
    grade6to10: string;
  };
}

export interface PlaceholderResolution {
  original: string;
  resolved: string;
  pluralForm?: string;
  vocabularyLevel?: string;
  highlightColor?: string;
  wasPluralized: boolean;
}

export class PlaceholderResolver {
  private static readonly PLURAL_RULES = new Map([
    // Common irregular plurals
    ['adventure', 'adventures'],
    ['story', 'stories'], 
    ['mystery', 'mysteries'],
    ['journey', 'journeys'],
    ['discovery', 'discoveries'],
    ['fantasy', 'fantasies'],
    ['family', 'families'],
    ['city', 'cities'],
    ['party', 'parties'],
    ['country', 'countries'],
    // Add -s endings
    ['friend', 'friends'],
    ['animal', 'animals'],
    ['book', 'books'],
    ['game', 'games'],
    ['toy', 'toys'],
    // Add -es endings
    ['wish', 'wishes'],
    ['class', 'classes'],
    ['box', 'boxes'],
    ['brush', 'brushes']
  ]);

  private static readonly DEFAULT_CONFIG: PlaceholderResolverConfig = {
    enablePluralDetection: true,
    enableVocabularyHighlighting: true,
    colorCoding: {
      level0: '#4CAF50',  // Green for PreK-K
      level1: '#2196F3',  // Blue for 1st grade  
      level2: '#FF9800',  // Orange for 2nd-3rd grade
      level3: '#9C27B0',  // Purple for 4th-5th grade
      level4: '#F44336',  // Red for Expert
      grade6to10: '#607D8B' // Blue Grey for Grade 6-10
    }
  };

  /**
   * Resolve placeholder with plural detection
   * Example: "Adventure" ↔ "Adventures"
   */
  static resolvePlaceholder(
    placeholder: string, 
    requirePlural: boolean = false,
    config: PlaceholderResolverConfig = this.DEFAULT_CONFIG
  ): PlaceholderResolution {
    const original = placeholder.trim();
    const lowerOriginal = original.toLowerCase();
    
    let resolved = original;
    let pluralForm: string | undefined;
    let wasPluralized = false;

    if (config.enablePluralDetection) {
      // Check if we have a predefined plural rule
      if (this.PLURAL_RULES.has(lowerOriginal)) {
        pluralForm = this.PLURAL_RULES.get(lowerOriginal)!;
        
        // Apply proper casing
        if (original[0] === original[0].toUpperCase()) {
          pluralForm = pluralForm.charAt(0).toUpperCase() + pluralForm.slice(1);
        }
        
        if (requirePlural) {
          resolved = pluralForm;
          wasPluralized = true;
        }
      } else {
        // Apply default pluralization rules
        pluralForm = this.applyDefaultPluralization(original);
        
        if (requirePlural) {
          resolved = pluralForm;
          wasPluralized = true;
        }
      }
    }

    // Determine vocabulary level and highlight color
    let vocabularyLevel: string | undefined;
    let highlightColor: string | undefined;
    
    if (config.enableVocabularyHighlighting) {
      vocabularyLevel = this.determineVocabularyLevel(lowerOriginal);
      highlightColor = this.getHighlightColor(vocabularyLevel, config);
    }

    return {
      original,
      resolved,  
      pluralForm,
      vocabularyLevel,
      highlightColor,
      wasPluralized
    };
  }

  /**
   * Apply default English pluralization rules
   */
  private static applyDefaultPluralization(word: string): string {
    const lower = word.toLowerCase();
    
    // Words ending in s, ss, sh, ch, x, z
    if (lower.match(/[sxz]$/) || lower.match(/(sh|ch)$/)) {
      return word + 'es';
    }
    
    // Words ending in consonant + y
    if (lower.match(/[bcdfghjklmnpqrstvwxz]y$/)) {
      return word.slice(0, -1) + 'ies';
    }
    
    // Words ending in f or fe
    if (lower.match(/f$/)) {
      return word.slice(0, -1) + 'ves';
    }
    if (lower.match(/fe$/)) {
      return word.slice(0, -2) + 'ves';
    }
    
    // Default: add s
    return word + 's';
  }

  /**
   * Determine vocabulary level based on word complexity
   */
  private static determineVocabularyLevel(word: string): string {
    const length = word.length;
    
    // Simple heuristics based on word length and complexity
    if (length <= 3) return 'level0';
    if (length <= 5) return 'level1';  
    if (length <= 7) return 'level2';
    if (length <= 9) return 'level3';
    if (length <= 12) return 'level4';
    return 'grade6to10';
  }

  /**
   * Get highlight color based on vocabulary level
   */
  private static getHighlightColor(level: string | undefined, config: PlaceholderResolverConfig): string | undefined {
    if (!level) return undefined;
    
    return config.colorCoding[level as keyof typeof config.colorCoding];
  }

  /**
   * Process multiple placeholders in text
   */
  static resolveTextPlaceholders(
    text: string,
    config: PlaceholderResolverConfig = this.DEFAULT_CONFIG
  ): {
    processedText: string;
    resolutions: PlaceholderResolution[];
  } {
    const placeholderRegex = /\{([^}]+)\}/g;
    const resolutions: PlaceholderResolution[] = [];
    
    const processedText = text.replace(placeholderRegex, (match, placeholder) => {
      const resolution = this.resolvePlaceholder(placeholder, false, config);
      resolutions.push(resolution);
      return resolution.resolved;
    });

    return {
      processedText,
      resolutions
    };
  }

  /**
   * Generate highlighted HTML for vocabulary words
   */
  static generateHighlightedHTML(
    text: string,
    resolutions: PlaceholderResolution[]
  ): string {
    let highlightedText = text;
    
    resolutions.forEach(resolution => {
      if (resolution.highlightColor) {
        const highlightedWord = `<span style="background-color: ${resolution.highlightColor}; padding: 2px 4px; border-radius: 3px; color: white; font-weight: bold;" title="Vocabulary Level: ${resolution.vocabularyLevel}">${resolution.resolved}</span>`;
        highlightedText = highlightedText.replace(resolution.resolved, highlightedWord);
      }
    });
    
    return highlightedText;
  }
}

// Export default config for easy access
export const DEFAULT_PLACEHOLDER_CONFIG = PlaceholderResolver['DEFAULT_CONFIG'];