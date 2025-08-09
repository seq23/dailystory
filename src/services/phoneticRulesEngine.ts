/**
 * Universal Phonetic Rules Engine
 * Handles phonetic breakdown for ALL users (free/premium), ALL languages, ALL devices
 */

interface PhoneticRule {
  pattern: RegExp;
  replacement: string;
  priority: number;
}

interface SyllableBreakRule {
  pattern: RegExp;
  breakPoints: number[];
}

export class PhoneticRulesEngine {
  private static instance: PhoneticRulesEngine;
  
  // Phonetic transformation rules (high to low priority)
  private phoneticRules: PhoneticRule[] = [
    // Complex suffixes (highest priority)
    { pattern: /tion$/i, replacement: 'shun', priority: 100 },
    { pattern: /sion$/i, replacement: 'zhun', priority: 100 },
    { pattern: /ical$/i, replacement: 'ih-kul', priority: 90 },
    { pattern: /able$/i, replacement: 'uh-bul', priority: 90 },
    { pattern: /ible$/i, replacement: 'ih-bul', priority: 90 },
    { pattern: /ment$/i, replacement: 'ment', priority: 85 },
    { pattern: /ness$/i, replacement: 'nes', priority: 85 },
    { pattern: /ful$/i, replacement: 'ful', priority: 85 },
    { pattern: /less$/i, replacement: 'les', priority: 85 },
    
    // Common prefixes
    { pattern: /^pre/i, replacement: 'pree', priority: 80 },
    { pattern: /^pro/i, replacement: 'proh', priority: 80 },
    { pattern: /^anti/i, replacement: 'an-tee', priority: 80 },
    { pattern: /^auto/i, replacement: 'aw-toh', priority: 80 },
    { pattern: /^inter/i, replacement: 'in-ter', priority: 80 },
    { pattern: /^under/i, replacement: 'un-der', priority: 80 },
    
    // Vowel combinations
    { pattern: /ough/i, replacement: 'uf', priority: 75 },
    { pattern: /augh/i, replacement: 'af', priority: 75 },
    { pattern: /eigh/i, replacement: 'ay', priority: 75 },
    { pattern: /ea/i, replacement: 'ee', priority: 65 },
    { pattern: /ou/i, replacement: 'ow', priority: 60 },
    { pattern: /oi/i, replacement: 'oy', priority: 60 },
    { pattern: /ai/i, replacement: 'ay', priority: 60 },
    { pattern: /au/i, replacement: 'aw', priority: 60 },
    
    // Consonant clusters
    { pattern: /sch/i, replacement: 'sk', priority: 70 },
    { pattern: /tch/i, replacement: 'ch', priority: 70 },
    { pattern: /dge/i, replacement: 'j', priority: 70 },
    { pattern: /ph/i, replacement: 'f', priority: 65 },
    { pattern: /gh/i, replacement: 'f', priority: 60 },
    { pattern: /ck/i, replacement: 'k', priority: 60 },
    { pattern: /qu/i, replacement: 'kw', priority: 60 },
    
    // Silent letters
    { pattern: /kn/i, replacement: 'n', priority: 55 },
    { pattern: /wr/i, replacement: 'r', priority: 55 },
    { pattern: /mb$/i, replacement: 'm', priority: 55 },
    
    // Common endings
    { pattern: /ing$/i, replacement: 'ing', priority: 50 },
    { pattern: /ed$/i, replacement: 'd', priority: 50 },
    { pattern: /er$/i, replacement: 'er', priority: 45 },
    { pattern: /ly$/i, replacement: 'lee', priority: 45 },
    { pattern: /y$/i, replacement: 'ee', priority: 40 },
  ];

  // Syllable breaking rules
  private syllableRules: SyllableBreakRule[] = [
    // VCV pattern (vowel-consonant-vowel) - break before consonant
    { pattern: /[aeiou][bcdfghjklmnpqrstvwxyz][aeiou]/gi, breakPoints: [1] },
    // VCCV pattern (vowel-consonant-consonant-vowel) - break between consonants
    { pattern: /[aeiou][bcdfghjklmnpqrstvwxyz]{2}[aeiou]/gi, breakPoints: [2] },
    // Prefixes and suffixes
    { pattern: /^(pre|pro|anti|auto|inter|under)/i, breakPoints: [3, 4, 4, 4, 5, 5] },
    { pattern: /(tion|sion|ment|ness|able|ible)$/i, breakPoints: [-4, -4, -4, -4, -4, -4] },
  ];

  // Enhanced known syllables for common words
  private knownSyllables: Record<string, string[]> = {
    // Level 0 words
    'hello': ['heh', 'loh'],
    'water': ['wah', 'ter'],
    'happy': ['hap', 'ee'],
    'family': ['fam', 'uh', 'lee'],
    'friend': ['frend'],
    'school': ['skool'],
    'sweet': ['sweet'],
    'children': ['chil', 'dren'],
    
    // Level 1 words
    'animal': ['an', 'ih', 'mul'],
    'garden': ['gar', 'den'],
    'mountain': ['mown', 'tin'],
    'adventure': ['ad', 'ven', 'cher'],
    'character': ['kar', 'ik', 'ter'],
    'favorite': ['fay', 'vor', 'it'],
    'flowers': ['flow', 'ers'],
    'wonderful': ['wun', 'der', 'ful'],
    'beautiful': ['byoo', 'ti', 'ful'],
    'together': ['toh', 'get', 'her'],
    'remember': ['rih', 'mem', 'ber'],
    'different': ['dif', 'er', 'ent'],
    'important': ['im', 'por', 'tant'],
    
    // Level 2-4 words (including complex ones)
    'principles': ['prin', 'suh', 'puls'],
    'organization': ['or', 'gan', 'ih', 'zay', 'shun'],
    'development': ['dih', 'vel', 'up', 'ment'],
    'responsibility': ['rih', 'spon', 'suh', 'bil', 'ih', 'tee'],
    'understanding': ['un', 'der', 'stan', 'ding'],
    'environment': ['en', 'vy', 'run', 'ment'],
    'technology': ['tek', 'nol', 'uh', 'jee'],
    'communication': ['kuh', 'myoo', 'nih', 'kay', 'shun'],
    'opportunity': ['op', 'er', 'too', 'nih', 'tee'],
    'experience': ['ik', 'speer', 'ee', 'ens'],
    'education': ['ed', 'yoo', 'kay', 'shun'],
    'government': ['guv', 'ern', 'ment'],
    'information': ['in', 'fer', 'may', 'shun'],
    'international': ['in', 'ter', 'nash', 'uh', 'nul'],
    'management': ['man', 'ij', 'ment'],
    'presentation': ['prez', 'en', 'tay', 'shun'],
    'professional': ['pruh', 'fesh', 'uh', 'nul'],
    'relationship': ['rih', 'lay', 'shun', 'ship'],
    'temperature': ['tem', 'per', 'uh', 'cher'],
    'transportation': ['trans', 'per', 'tay', 'shun'],
  };

  // Speech-friendly pronunciation mapping
  private speechFriendlyMap: Record<string, string> = {
    'geh': 'get', 'geth': 'geth', 'ther': 'ther', 'tuh': 'tuh',
    'fam': 'fam', 'uh': 'uh', 'lee': 'lee', 'maj': 'madge',
    'ih': 'ih', 'kul': 'cool', 'wun': 'wun', 'der': 'der',
    'ful': 'full', 'beau': 'bow', 'byoo': 'byoo', 'ti': 'tee', 'tih': 'tee', 'rih': 'ree',
    'mem': 'mem', 'ber': 'ber', 'dif': 'diff', 'ent': 'ent', 
    'por': 'pour', 'tant': 'tant', 'ad': 'add', 'ven': 'ven', 
    'cher': 'cher', 'kar': 'car', 'ik': 'ick', 'ter': 'ter', 
    'fay': 'fay', 'vor': 'vor', 'it': 'it',
    'prin': 'prin', 'suh': 'suh', 'puls': 'pulls', 'shun': 'shun',
    'zhun': 'zhun', 'proh': 'pro', 'pree': 'pree', 'an-tee': 'antee',
    'aw-toh': 'auto', 'in-ter': 'inter', 'un-der': 'under',
    'uf': 'uff', 'af': 'aff', 'ay': 'ay', 'oh': 'oh', 'ey': 'ee',
    'ow': 'ow', 'oy': 'oy', 'aw': 'aw', 'sk': 'sk', 'ch': 'ch',
    'j': 'j', 'f': 'f', 'k': 'k', 'kw': 'kw', 'n': 'n', 'r': 'r',
    'm': 'm', 'ing': 'ing', 'd': 'd'
  };

  public static getInstance(): PhoneticRulesEngine {
    if (!PhoneticRulesEngine.instance) {
      PhoneticRulesEngine.instance = new PhoneticRulesEngine();
    }
    return PhoneticRulesEngine.instance;
  }

  /**
   * Break a word into phonetic syllables - UNIVERSAL support for all users and languages
   */
  public breakIntoSyllables(word: string): string[] {
    console.log(`🔤 UNIVERSAL PhoneticRulesEngine: Breaking "${word}" into syllables`);
    
    if (!word || typeof word !== 'string') {
      console.warn('⚠️ Invalid word provided to breakIntoSyllables:', word);
      return [word || ''];
    }
    
    const cleanWord = word.toLowerCase().replace(/[^a-záéíóúñü]/g, ''); // Support accented characters
    
    if (cleanWord.length === 0) {
      console.warn('⚠️ Empty word after cleaning:', word);
      return [word];
    }
    
    // Check known syllables first (supports all languages with English phonetics)
    if (this.knownSyllables[cleanWord]) {
      console.log(`✅ UNIVERSAL: Found in known syllables: ${this.knownSyllables[cleanWord]}`);
      return this.knownSyllables[cleanWord];
    }

    // Apply rule-based syllable breaking (works for all languages)
    const syllables = this.applyRuleBasedBreaking(cleanWord);
    console.log(`🎯 UNIVERSAL: Rule-based breakdown: ${syllables}`);
    
    return syllables;
  }

  /**
   * Get speech-friendly pronunciation for a syllable - UNIVERSAL for all devices
   */
  public getSpeechFriendlyPronunciation(syllable: string): string {
    if (!syllable || typeof syllable !== 'string') {
      console.warn('⚠️ Invalid syllable provided:', syllable);
      return syllable || '';
    }
    
    const pronunciation = this.speechFriendlyMap[syllable.toLowerCase()] || syllable;
    console.log(`🗣️ UNIVERSAL: Syllable "${syllable}" → pronunciation "${pronunciation}"`);
    return pronunciation;
  }

  /**
   * Apply phonetic transformations to make text more speech-friendly
   */
  public applyPhoneticTransformations(text: string): string {
    let transformed = text.toLowerCase();
    
    // Apply rules by priority (highest first)
    const sortedRules = [...this.phoneticRules].sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      if (rule.pattern.test(transformed)) {
        transformed = transformed.replace(rule.pattern, rule.replacement);
        console.log(`🔄 Applied rule ${rule.pattern} → "${transformed}"`);
      }
    }
    
    return transformed;
  }

  /**
   * Check if the engine supports a word (either in known syllables or can process with rules)
   */
  public supportsWord(word: string): boolean {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    return cleanWord.length > 0; // We can process any alphabetic word
  }

  /**
   * Get debug information about how a word would be processed
   */
  public getDebugInfo(word: string): {
    originalWord: string;
    cleanWord: string;
    hasKnownSyllables: boolean;
    syllables: string[];
    pronunciations: string[];
    appliedRules: string[];
  } {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    const hasKnownSyllables = !!this.knownSyllables[cleanWord];
    const syllables = this.breakIntoSyllables(word);
    const pronunciations = syllables.map(s => this.getSpeechFriendlyPronunciation(s));
    
    const appliedRules: string[] = [];
    let testWord = cleanWord;
    for (const rule of this.phoneticRules) {
      if (rule.pattern.test(testWord)) {
        appliedRules.push(`${rule.pattern} → ${rule.replacement}`);
      }
    }

    return {
      originalWord: word,
      cleanWord,
      hasKnownSyllables,
      syllables,
      pronunciations,
      appliedRules
    };
  }

  /**
   * Rule-based syllable breaking algorithm - UNIVERSAL for all languages
   */
  private applyRuleBasedBreaking(word: string): string[] {
    if (!word || word.length <= 2) {
      return [word];
    }

    try {
      // Apply phonetic transformations first
      const transformed = this.applyPhoneticTransformations(word);
      
      // Simple vowel-based breaking as robust fallback for ALL languages
      const syllables: string[] = [];
      let currentSyllable = '';
      let lastWasVowel = false;
      
      // Extended vowel support for multiple languages
      const vowels = 'aeiouáéíóúñüàèìòùâêîôûäëïöüy';
      // Do not split common vowel teams (keeps "sweet" = one syllable, not "swe-et")
      const vowelTeams = new Set(['aa','ee','ea','ei','ie','oa','oo','ou','ow','oi','oy','ai','ay','au','ue']);
      
      for (let i = 0; i < transformed.length; i++) {
        const char = transformed[i];
        const isVowel = vowels.includes(char.toLowerCase());
        
        if (isVowel && lastWasVowel && currentSyllable.length > 0) {
          const prevChar = transformed[i - 1]?.toLowerCase() || '';
          const pair = (prevChar + char.toLowerCase());
          if (vowelTeams.has(pair)) {
            // Keep vowel team together
            currentSyllable += char;
          } else {
            // Two vowels in a row, break before this one
            syllables.push(currentSyllable);
            currentSyllable = char;
          }
        } else if (!isVowel && lastWasVowel && i < transformed.length - 1) {
          // Consonant after vowel, might be a break point
          const nextIsVowel = vowels.includes(transformed[i + 1].toLowerCase());
          if (nextIsVowel && currentSyllable.length > 1) {
            currentSyllable += char;
            syllables.push(currentSyllable);
            currentSyllable = '';
          } else {
            currentSyllable += char;
          }
        } else {
          currentSyllable += char;
        }
        
        lastWasVowel = isVowel;
      }
      
      if (currentSyllable) {
        syllables.push(currentSyllable);
      }
      
      // Ensure we have at least one syllable
      const result = syllables.length > 0 ? syllables : [transformed];
      console.log(`🔤 UNIVERSAL: Syllable breakdown result for "${word}": ${result}`);
      return result;
      
    } catch (error) {
      console.error('❌ UNIVERSAL: Error in syllable breaking, using fallback:', error);
      return [word]; // Robust fallback
    }
  }
}

// Export singleton instance
export const phoneticRulesEngine = PhoneticRulesEngine.getInstance();