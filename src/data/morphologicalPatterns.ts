/**
 * Morphological Pattern Recognition for Scalable Syllable Breaking
 * Handles stem + suffix combinations automatically
 */

export interface StemPattern {
  stem: string;
  syllables: string[];
  variants?: string[]; // alternative spellings
}

export interface SuffixPattern {
  suffix: string;
  syllables: string[];
  requiresVowelStem?: boolean;
  replacesStemEnding?: string; // e.g., "y" → "i" for "-ies"
}

// Common word stems with correct phonetic breakdowns
export const WORD_STEMS: Record<string, StemPattern> = {
  // Magic family
  'magic': { stem: 'magic', syllables: ['maj', 'ick'] },
  'music': { stem: 'music', syllables: ['myoo', 'zick'] },
  'logic': { stem: 'logic', syllables: ['loj', 'ick'] },
  'physic': { stem: 'physic', syllables: ['fiz', 'ick'] },
  'comic': { stem: 'comic', syllables: ['kom', 'ick'] },
  'tragic': { stem: 'tragic', syllables: ['traj', 'ick'] },
  'classic': { stem: 'classic', syllables: ['klas', 'ick'] },
  'basic': { stem: 'basic', syllables: ['bay', 'sick'] },
  'plastic': { stem: 'plastic', syllables: ['plas', 'tick'] },
  'elastic': { stem: 'elastic', syllables: ['ee', 'las', 'tick'] },
  
  // Common base words
  'animal': { stem: 'animal', syllables: ['an', 'ih', 'mul'] },
  'nation': { stem: 'nation', syllables: ['nay', 'shun'] },
  'create': { stem: 'create', syllables: ['kree', 'ate'] },
  'nature': { stem: 'nature', syllables: ['nay', 'cher'] },
  'picture': { stem: 'picture', syllables: ['pick', 'cher'] },
  'future': { stem: 'future', syllables: ['fyoo', 'cher'] },
  'culture': { stem: 'culture', syllables: ['kul', 'cher'] },
  
  // Action stems
  'educate': { stem: 'educate', syllables: ['ed', 'yoo', 'kate'] },
  'communicate': { stem: 'communicate', syllables: ['kuh', 'myoo', 'nih', 'kate'] },
  'celebrate': { stem: 'celebrate', syllables: ['sel', 'uh', 'brate'] },
  'navigate': { stem: 'navigate', syllables: ['nav', 'ih', 'gate'] },
};

// Suffix patterns that work with stems
export const SUFFIX_PATTERNS: Record<string, SuffixPattern> = {
  // -al suffix family
  'al': { 
    suffix: 'al', 
    syllables: ['ul'],
    requiresVowelStem: false 
  },
  'ical': { 
    suffix: 'ical', 
    syllables: ['ih', 'kul'],
    requiresVowelStem: false 
  },
  
  // -tion family  
  'tion': { 
    suffix: 'tion', 
    syllables: ['shun'],
    requiresVowelStem: false 
  },
  'ation': { 
    suffix: 'ation', 
    syllables: ['ay', 'shun'],
    requiresVowelStem: false 
  },
  'ition': { 
    suffix: 'ition', 
    syllables: ['ih', 'shun'],
    requiresVowelStem: false 
  },
  
  // -ing, -ed family
  'ing': { 
    suffix: 'ing', 
    syllables: ['ing'],
    requiresVowelStem: false 
  },
  'ed': { 
    suffix: 'ed', 
    syllables: ['ed'],
    requiresVowelStem: false 
  },
  
  // -ly family
  'ly': { 
    suffix: 'ly', 
    syllables: ['lee'],
    requiresVowelStem: false 
  },
  'ally': { 
    suffix: 'ally', 
    syllables: ['ul', 'lee'],
    requiresVowelStem: false 
  },
  
  // -ous family
  'ous': { 
    suffix: 'ous', 
    syllables: ['us'],
    requiresVowelStem: false 
  },
  'ious': { 
    suffix: 'ious', 
    syllables: ['ee', 'us'],
    requiresVowelStem: false 
  },
};

/**
 * Attempt to break word using morphological patterns
 * Returns null if no pattern matches
 */
export function tryMorphologicalBreakdown(word: string): string[] | null {
  const cleanWord = word.toLowerCase();
  
  // Try each suffix pattern
  for (const [suffixKey, suffixPattern] of Object.entries(SUFFIX_PATTERNS)) {
    if (cleanWord.endsWith(suffixPattern.suffix)) {
      // Extract potential stem
      const stemCandidate = cleanWord.slice(0, -suffixPattern.suffix.length);
      
      // Check if we know this stem
      if (WORD_STEMS[stemCandidate]) {
        const stemSyllables = WORD_STEMS[stemCandidate].syllables;
        const suffixSyllables = suffixPattern.syllables;
        
        console.log(`🧩 Morphological match: "${word}" → ${stemCandidate}(${stemSyllables.join('-')}) + ${suffixPattern.suffix}(${suffixSyllables.join('-')})`);
        return [...stemSyllables, ...suffixSyllables];
      }
      
      // Check for stem variants (e.g., magic → magical)
      const stemVariants = Object.values(WORD_STEMS).filter(pattern => 
        pattern.variants?.includes(stemCandidate) || 
        stemCandidate.startsWith(pattern.stem.slice(0, -1)) // partial stem match
      );
      
      if (stemVariants.length > 0) {
        const bestMatch = stemVariants[0];
        console.log(`🧩 Morphological variant match: "${word}" → ${bestMatch.stem}(${bestMatch.syllables.join('-')}) + ${suffixPattern.suffix}(${suffixPattern.syllables.join('-')})`);
        return [...bestMatch.syllables, ...suffixPattern.syllables];
      }
    }
  }
  
  return null;
}