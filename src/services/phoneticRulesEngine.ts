/**
 * Universal Phonetic Rules Engine
 * Handles phonetic breakdown for ALL users (free/premium), ALL languages, ALL devices
 */
import miniDict from '@/data/phonicsMiniDict';

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
  private dictCache = new Map<string, string[]>();
  private conversationMode: boolean = false;
  
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
    { pattern: /igh/i, replacement: 'eye', priority: 75 },
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
    { pattern: /^gh/i, replacement: 'g', priority: 70 },
    { pattern: /gh$/i, replacement: '', priority: 70 },
    { pattern: /ck/i, replacement: 'k', priority: 60 },
    { pattern: /qu/i, replacement: 'kw', priority: 60 },
    
    // Silent letters
    { pattern: /kn/i, replacement: 'n', priority: 55 },
    { pattern: /wr/i, replacement: 'r', priority: 55 },
    { pattern: /mb$/i, replacement: 'm', priority: 55 },
    
    // Common endings - fix -ed pronunciation
    { pattern: /ing$/i, replacement: 'ing', priority: 50 },
    { pattern: /([td])ed$/i, replacement: '$1-ed', priority: 52 }, // wanted, started -> want-ed, start-ed
    { pattern: /([^td])ed$/i, replacement: '$1d', priority: 51 }, // played, exclaimed -> playd, exclaim-d
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

  // Enhanced known syllables for common words (loaded from data file)
  private knownSyllables: Record<string, string[]> = {
    ...miniDict,
    // Add better -ed handling
    'exclaimed': ['ex', 'claimed'],
    'reached': ['reached'],
    'wanted': ['want', 'ed'],
    'started': ['start', 'ed'],
    'needed': ['need', 'ed'],
    'landed': ['land', 'ed'],
    'painted': ['paint', 'ed'],
    'planted': ['plant', 'ed'],
    'counted': ['count', 'ed'],
    'visited': ['vis', 'it', 'ed'],
    'decided': ['de', 'cid', 'ed']
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
    'm': 'm', 'ing': 'ing', 'd': 'd', 'es': 'iz',
    // Added helpers for clearer segmented pronunciation
    'p': 'p', 'b': 'b', 't': 't', 'v': 'v', 's': 's', 'z': 'z', 'h': 'h', 'l': 'l', 'w': 'w', 'y': 'y', 'g': 'guh',
    // Common clusters (use gentle schwa for better articulation when isolated)
    'bl': 'bl', 'cl': 'cl', 'fl': 'fl', 'gl': 'gl', 'pl': 'pl', 'sl': 'sl', 'br': 'br', 'cr': 'cr', 'dr': 'dr', 'fr': 'fr', 'gr': 'gruh', 'pr': 'pr', 'tr': 'tr', 'st': 'st', 'sn': 'sn', 'sm': 'sm',
    // Vowel teams
    'ue': 'oo', 'oo': 'oo', 'igh': 'eye', 'ee': 'ee',
    // Special helpers
    'whuh': 'whuh', 'ut': 'ut', 'bounce': 'bownss'
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

    // Plural-aware handling for kid-friendly breakdowns
    const pluralAware = this.tryPluralAware(cleanWord);
    if (pluralAware) {
      console.log(`🧩 Plural-aware breakdown: ${pluralAware}`);
      return pluralAware;
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
    return pronunciation;
  }

  // Deterministic async API: override -> heuristic (no network)
  public async breakIntoSyllablesAsync(word: string): Promise<string[]> {
    const key = word.toLowerCase();
    if (this.dictCache.has(key)) return this.dictCache.get(key)!;
    if (this.knownSyllables && this.knownSyllables[key]) {
      this.dictCache.set(key, this.knownSyllables[key]);
      return this.knownSyllables[key];
    }
    const fallback = this.breakIntoSyllables(word);
    this.dictCache.set(key, fallback);
    return fallback;
  }

  /**
   * Set conversation mode - when true, use natural pronunciation
   * When false, use phonetic learning pronunciation
   */
  public setConversationMode(isConversation: boolean): void {
    this.conversationMode = isConversation;
    console.log(`🗣️ Phonetic engine mode: ${isConversation ? 'CONVERSATION' : 'LEARNING'}`);
  }

  /**
   * Get speech-friendly pronunciation with context awareness
   */
  public getSpeechFriendlyPronunciationWithContext(syllable: string, forLearning: boolean = false): string {
    // If in conversation mode and not specifically for learning, use natural pronunciation
    if (this.conversationMode && !forLearning) {
      return syllable; // Return original word for natural speech
    }
    
    // Otherwise use phonetic pronunciation for learning
    return this.getSpeechFriendlyPronunciation(syllable);
  }

  private arpabetToChunks(phones: string[], clean: string): string[] {
    // Group phones into true syllables (onset + nucleus + coda)
    const VOWELS = new Set(['AA','AE','AH','AO','AW','AY','EH','ER','EY','IH','IY','OW','OY','UH','UW']);
    const MAP: Record<string,string> = {
      AA:'ah', AE:'a', AH:'uh', AO:'aw', AW:'ow', AY:'ay', EH:'e', ER:'er', EY:'ay', IH:'ih', IY:'ee', OW:'oh', OY:'oy', UH:'oo', UW:'oo',
      B:'b', CH:'ch', D:'d', DH:'th', F:'f', G:'g', HH:'h', JH:'j', K:'k', L:'l', M:'m', N:'n', NG:'ng', P:'p', R:'r', S:'s', SH:'sh', T:'t', TH:'th', V:'v', W:'w', Y:'y', Z:'z', ZH:'zh'
    };

    const ALLOWED_ONSET_PAIRS: Array<[string,string]> = [
      ['B','L'], ['B','R'], ['C','L'], ['C','R'], ['D','R'], ['F','L'], ['F','R'], ['G','L'], ['G','R'],
      ['K','L'], ['K','R'], ['P','L'], ['P','R'], ['T','R'], ['S','P'], ['S','T'], ['S','K'], ['S','M'], ['S','N'], ['S','L'],
      // Using ARPABET phones; C is not a phone, but we include it to be tolerant if any data source emits 'C'.
    ];
    const isAllowedOnsetPair = (a: string, b: string) => ALLOWED_ONSET_PAIRS.some(([x,y]) => x===a && y===b);

    const mapSeq = (seq: string[]) => seq.map(p => MAP[p] || p.toLowerCase()).join('');

    const result: string[] = [];
    let i = 0;
    while (i < phones.length) {
      // Collect onset
      const onset: string[] = [];
      while (i < phones.length && !VOWELS.has(phones[i])) {
        onset.push(phones[i]);
        i++;
      }
      if (i >= phones.length) {
        // No vowel found; attach leftover consonants to previous syllable if possible
        if (onset.length) {
          if (result.length) {
            result[result.length - 1] += mapSeq(onset);
          } else {
            result.push(mapSeq(onset));
          }
        }
        break;
      }

      // Nucleus (must exist here)
      const nucleus = phones[i];
      i++;

      // Lookahead consonant cluster until next vowel
      let j = i;
      while (j < phones.length && !VOWELS.has(phones[j])) j++;
      const cluster = phones.slice(i, j);

      // Decide how many consonants to keep for next onset (maximal onset principle)
      let keepForNextOnset = 0;
      if (cluster.length === 0) {
        keepForNextOnset = 0;
      } else if (j < phones.length) { // there is another vowel ahead
        if (cluster.length === 1) {
          // V C V -> split V.CV (move the consonant to next onset)
          keepForNextOnset = 1;
        } else {
          // V C C (+) V -> if last two form valid onset cluster, keep them; otherwise keep only last
          const a = cluster[cluster.length - 2];
          const b = cluster[cluster.length - 1];
          keepForNextOnset = isAllowedOnsetPair(a, b) ? 2 : 1;
        }
      } else {
        // No more vowels; all remaining consonants belong to this coda
        keepForNextOnset = 0;
      }

      const coda = cluster.slice(0, Math.max(0, cluster.length - keepForNextOnset));

      // Consume only the coda from the stream; remaining will be onset next loop
      i = i + coda.length;

      const syllable = mapSeq(onset) + (MAP[nucleus] || nucleus.toLowerCase()) + mapSeq(coda);
      result.push(syllable);
    }

    // Special-case tweak for wh- initial
    if (clean.startsWith('wh') && result.length > 0 && result[0] === 'w') result[0] = 'whuh';

    return result.filter(Boolean);
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
   * Plural-aware detection and kid-friendly chunking for English plurals
   * Handles -s, -es (sibilants, -o words), and -ies -> base + s
   * Returns null when not confidently a plural.
   */
  private tryPluralAware(word: string): string[] | null {
    if (!word || word.length < 3) return null;
    const hasVowel = (s: string) => /[aeiouy]/.test(s);

    // -ies -> base+y + s (puppies -> puppy + s)
    if (word.endsWith('ies') && word.length > 4) {
      const stem = word.slice(0, -3) + 'y';
      if (hasVowel(stem)) {
        const base = this.knownSyllables[stem] || this.applyRuleBasedBreaking(stem);
        return [...base, 's'];
      }
    }

    // -es after sibilant or -o words (boxes, buses, heroes)
    if (word.endsWith('es') && word.length > 3) {
      const stem = word.slice(0, -2);
      const sibilant = /(s|x|z|ch|sh)$/.test(stem);
      const endsWithO = /o$/.test(stem);
      if (sibilant || endsWithO) {
        const base = this.knownSyllables[stem] || this.applyRuleBasedBreaking(stem);
        return [...base, 'es'];
      }
    }

    // Simple -s plural (cats, dogs)
    if (word.endsWith('s') && !word.endsWith('ss')) {
      const stem = word.slice(0, -1);
      if (stem.length >= 3 && hasVowel(stem)) {
        const base = this.knownSyllables[stem] || this.applyRuleBasedBreaking(stem);
        return [...base, 's'];
      }
    }

    return null;
  }

  /**
   * Rule-based syllable breaking algorithm - UNIVERSAL for all languages
   */
  private applyRuleBasedBreaking(word: string): string[] {
    if (!word || word.length <= 2) {
      return [word];
    }

    try {
      // Heuristic fallback - avoid transforming the whole word to keep natural chunks
      const transformed = word;
      
      // Simple vowel-based breaking as robust fallback for ALL languages
      const syllables: string[] = [];
      let currentSyllable = '';
      let lastWasVowel = false;
      
      // Extended vowel support for multiple languages
      const vowels = 'aeiouáéíóúñüàèìòùâêîôûäëïöüy';
      // Do not split common vowel teams (keeps "sweet" = one syllable, not "swe-et")
      const vowelTeams = new Set(['aa','ee','ea','ei','ey','ie','oa','oo','ou','ow','oi','oy','ai','ay','au','ue']);
      
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
      let result = syllables.length > 0 ? syllables : [transformed];

      // Heuristics for clearer breakdown on tricky single-syllable words
      if (result.length === 1) {
        const w = transformed;
        // Keep igh together and split around it (e.g., bright → br | igh | t)
        const ighIdx = w.indexOf('igh');
        if (ighIdx !== -1) {
          const parts = [w.slice(0, ighIdx), 'igh', w.slice(ighIdx + 3)].filter(Boolean) as string[];
          console.log('🔧 Heuristic split (igh):', parts);
          return parts;
        }
        // Split simple suffixes off for clarity (plays → play | s, jumped → jump | ed)
        const suffixMatch = w.match(/^(.+[aeiouy][a-z]*)(s|ed|ing)$/);
        if (suffixMatch) {
          const parts = [suffixMatch[1], suffixMatch[2]] as string[];
          console.log('🔧 Heuristic split (suffix):', parts);
          return parts;
        }
        // VCCV and double-consonant split (soccer → soc | cer), protect common digraphs
        const protect = ['th','sh','ch','ck','ph','wh','gh'];
        for (let i = 1; i < w.length - 2; i++) {
          const a = w[i]; const b = w[i+1];
          const left = w.slice(0, i+1); const right = w.slice(i+1);
          if (/[aeiouy]/.test(w[i-1]) && /[bcdfghjklmnpqrstvwxyz]{2}/.test(a + b) && /[aeiouy]/.test(w[i+2])) {
            const pair = (a + b).toLowerCase();
            if (!protect.includes(pair)) {
              const parts = [left, right];
              console.log('🔧 Heuristic split (VCCV):', parts);
              return parts;
            }
          }
        }
        // Vowel-team with trailing -s: trees → tr | ee | s
        if (/^([bcdfghjklmnpqrstvwxyz]{1,2})?(ee|oo)(s)$/.test(w)) {
          const m = w.match(/^([bcdfghjklmnpqrstvwxyz]{1,2})?(ee|oo)(s)$/)!;
          const onset = (m[1] || '').toString();
          const team = m[2]; const sfx = m[3];
          const parts = [onset, team, sfx].filter(Boolean) as string[];
          console.log('🔧 Heuristic split (team+s):', parts);
          return parts;
        }
        // Split around vowel teams for readability (good → g | oo | d, play → pl | ay)
        const teams = ['oo','ee','ay','ai','oi','oy','ow','ou','ea','ie','ue','oa','ey'];
        for (const team of teams) {
          const idx = w.indexOf(team);
          if (idx > 0 && idx < w.length - team.length) {
            const parts = [w.slice(0, idx), team, w.slice(idx + team.length)].filter(Boolean) as string[];
            console.log('🔧 Heuristic split (vowel team):', parts);
            return parts;
          }
        }
        // Silent-e long vowel pattern (chase → ch | ay | s)
        const se = w.match(/^(.+?)([aeiou])([bcdfghjklmnpqrstvwxyz])e$/);
        if (se) {
          const onset = se[1];
          const vowel = se[2];
          const cons = se[3];
          const longMap: Record<string, string> = { a: 'ay', e: 'ee', i: 'eye', o: 'oh', u: 'yoo' };
          const nucleus = longMap[vowel] || vowel;
          const parts = [onset, nucleus, cons].filter(Boolean) as string[];
          console.log('🔧 Heuristic split (silent-e):', parts);
          return parts;
        }
        // Final sanity: if still one large chunk and >=6 letters, split into 2-3 kid-friendly parts
        if (w.length >= 6) {
          const mid = Math.floor(w.length / 2);
          const parts = [w.slice(0, mid), w.slice(mid)];
          console.log('🔧 Heuristic split (fallback-chunk):', parts);
          return parts;
        }
      }
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