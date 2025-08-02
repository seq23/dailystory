// Context-aware pronunciation service for handling homographs in TTS
export interface PronunciationRule {
  word: string;
  contexts: {
    pattern: RegExp;
    pronunciation: string;
    phonetic: string;
  }[];
  defaultPronunciation: string;
  defaultPhonetic: string;
}

const pronunciationRules: PronunciationRule[] = [
  {
    word: "skies",
    contexts: [
      {
        pattern: /(green|blue|gray|grey|dark|bright|clear|cloudy|stormy|beautiful|vast|open)\s+skies/i,
        pronunciation: "skahyz",
        phonetic: "/skaɪz/"
      },
      {
        pattern: /skies\s+(above|overhead|up|high)/i,
        pronunciation: "skahyz", 
        phonetic: "/skaɪz/"
      }
    ],
    defaultPronunciation: "skeez",
    defaultPhonetic: "/skiːz/"
  },
  {
    word: "read",
    contexts: [
      {
        pattern: /(will|shall|going to|want to|need to|like to|love to)\s+read/i,
        pronunciation: "reed",
        phonetic: "/riːd/"
      },
      {
        pattern: /read\s+(tomorrow|later|soon|next|this|every|daily)/i,
        pronunciation: "reed",
        phonetic: "/riːd/"
      },
      {
        pattern: /(yesterday|last|previously|already|just|have|had)\s+read/i,
        pronunciation: "red",
        phonetic: "/rɛd/"
      },
      {
        pattern: /read\s+(it|that|this|the book|the story)/i,
        pronunciation: "red",
        phonetic: "/rɛd/"
      }
    ],
    defaultPronunciation: "reed",
    defaultPhonetic: "/riːd/"
  },
  {
    word: "lead",
    contexts: [
      {
        pattern: /(metal|heavy|toxic|pipes|paint|pencil|bullet)\s+lead/i,
        pronunciation: "led",
        phonetic: "/lɛd/"
      },
      {
        pattern: /lead\s+(poisoning|pipe|pipes|paint|bullet|weight)/i,
        pronunciation: "led",
        phonetic: "/lɛd/"
      },
      {
        pattern: /(will|shall|can|should|must|going to)\s+lead/i,
        pronunciation: "leed",
        phonetic: "/liːd/"
      },
      {
        pattern: /lead\s+(the|a|them|us|you|away|forward|back)/i,
        pronunciation: "leed",
        phonetic: "/liːd/"
      }
    ],
    defaultPronunciation: "leed",
    defaultPhonetic: "/liːd/"
  },
  {
    word: "bow",
    contexts: [
      {
        pattern: /(arrow|archery|hunting|weapon|shoot|aim)\s+bow/i,
        pronunciation: "boh",
        phonetic: "/boʊ/"
      },
      {
        pattern: /bow\s+(and arrow|hunter|string|tie|knot)/i,
        pronunciation: "boh",
        phonetic: "/boʊ/"
      },
      {
        pattern: /(take a|deep|polite|respectful)\s+bow/i,
        pronunciation: "bau",
        phonetic: "/baʊ/"
      },
      {
        pattern: /bow\s+(down|low|head|gracefully)/i,
        pronunciation: "bau",
        phonetic: "/baʊ/"
      }
    ],
    defaultPronunciation: "boh",
    defaultPhonetic: "/boʊ/"
  },
  {
    word: "close",
    contexts: [
      {
        pattern: /(please|will|should|must|going to|need to)\s+close/i,
        pronunciation: "kloze",
        phonetic: "/kloʊz/"
      },
      {
        pattern: /close\s+(the|your|it|down|up|off)/i,
        pronunciation: "kloze",
        phonetic: "/kloʊz/"
      },
      {
        pattern: /(very|so|too|really|extremely)\s+close/i,
        pronunciation: "klos",
        phonetic: "/kloʊs/"
      },
      {
        pattern: /close\s+(to|by|together|friend|relationship)/i,
        pronunciation: "klos",
        phonetic: "/kloʊs/"
      }
    ],
    defaultPronunciation: "kloze",
    defaultPhonetic: "/kloʊz/"
  },
  {
    word: "tear",
    contexts: [
      {
        pattern: /(sad|cry|crying|emotional|happy)\s+tear/i,
        pronunciation: "teer",
        phonetic: "/tɪr/"
      },
      {
        pattern: /tear\s+(drop|fell|rolling|in eye)/i,
        pronunciation: "teer",
        phonetic: "/tɪr/"
      },
      {
        pattern: /(will|might|could|going to)\s+tear/i,
        pronunciation: "tair",
        phonetic: "/tɛr/"
      },
      {
        pattern: /tear\s+(up|apart|down|off|paper|fabric)/i,
        pronunciation: "tair",
        phonetic: "/tɛr/"
      }
    ],
    defaultPronunciation: "teer",
    defaultPhonetic: "/tɪr/"
  },
  {
    word: "live",
    contexts: [
      {
        pattern: /(broadcast|streaming|show|performance|concert)\s+live/i,
        pronunciation: "lahyv",
        phonetic: "/laɪv/"
      },
      {
        pattern: /live\s+(tv|stream|broadcast|show|performance)/i,
        pronunciation: "lahyv",
        phonetic: "/laɪv/"
      },
      {
        pattern: /(where do|I|we|they|people)\s+live/i,
        pronunciation: "liv",
        phonetic: "/lɪv/"
      },
      {
        pattern: /live\s+(in|at|on|there|here|together|alone)/i,
        pronunciation: "liv",
        phonetic: "/lɪv/"
      }
    ],
    defaultPronunciation: "liv",
    defaultPhonetic: "/lɪv/"
  }
];

export class ContextualPronunciationService {
  private rules: Map<string, PronunciationRule> = new Map();

  constructor() {
    // Initialize rules map for faster lookup
    pronunciationRules.forEach(rule => {
      this.rules.set(rule.word.toLowerCase(), rule);
    });
  }

  /**
   * Process text to improve pronunciation of homographs based on context
   */
  processTextForPronunciation(text: string, isChildFriendly: boolean = true): string {
    if (!text || typeof text !== 'string') return text;

    let processedText = text;

    // Clean and normalize text for children
    if (isChildFriendly) {
      processedText = this.childFriendlyTextProcessing(processedText);
    }

    // Apply contextual pronunciation rules
    this.rules.forEach((rule, word) => {
      processedText = this.applyPronunciationRule(processedText, rule);
    });

    return processedText;
  }

  /**
   * Get pronunciation guide for a specific word in context
   */
  getWordPronunciation(word: string, context: string): {
    pronunciation: string;
    phonetic: string;
    isContextAware: boolean;
  } {
    const normalizedWord = word.toLowerCase().replace(/[^\w]/g, '');
    const rule = this.rules.get(normalizedWord);

    if (!rule) {
      return {
        pronunciation: word,
        phonetic: '',
        isContextAware: false
      };
    }

    // Check context patterns
    for (const contextRule of rule.contexts) {
      if (contextRule.pattern.test(context)) {
        return {
          pronunciation: contextRule.pronunciation,
          phonetic: contextRule.phonetic,
          isContextAware: true
        };
      }
    }

    // Return default pronunciation
    return {
      pronunciation: rule.defaultPronunciation,
      phonetic: rule.defaultPhonetic,
      isContextAware: false
    };
  }

  /**
   * Apply pronunciation rule to text
   */
  private applyPronunciationRule(text: string, rule: PronunciationRule): string {
    let result = text;

    // Apply context-specific rules
    rule.contexts.forEach(context => {
      const matches = result.match(context.pattern);
      if (matches) {
        // Replace the specific word with phonetic spelling in parentheses
        const replacement = matches[0].replace(
          new RegExp(`\\b${rule.word}\\b`, 'gi'),
          `${rule.word} (pronounced: ${context.pronunciation})`
        );
        result = result.replace(context.pattern, replacement);
      }
    });

    return result;
  }

  /**
   * Child-friendly text processing for better TTS
   */
  private childFriendlyTextProcessing(text: string): string {
    return text
      // Add pauses after sentences for better comprehension
      .replace(/([.!?])\s+/g, '$1... ')
      // Slow down complex words by adding spaces between syllables
      .replace(/\b(\w{8,})\b/g, (match) => {
        // Add subtle pauses in long words for children
        return match.replace(/(.{3,4})/g, '$1 ');
      })
      // Ensure numbers are spoken clearly
      .replace(/\b(\d+)\b/g, ' $1 ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract sentence context around a word
   */
  extractContext(text: string, wordIndex: number, contextWindow: number = 50): string {
    const start = Math.max(0, wordIndex - contextWindow);
    const end = Math.min(text.length, wordIndex + contextWindow);
    return text.substring(start, end);
  }

  /**
   * Check if a word is a known homograph
   */
  isHomograph(word: string): boolean {
    return this.rules.has(word.toLowerCase().replace(/[^\w]/g, ''));
  }

  /**
   * Get all supported homographs
   */
  getSupportedHomographs(): string[] {
    return Array.from(this.rules.keys());
  }
}

// Export singleton instance
export const contextualPronunciation = new ContextualPronunciationService();