/**
 * Sophisticated Grammar Validation for Edge Functions
 * Migrated from frontend with complete rule sets
 */

// Server Configuration for Grammar Rules
const SERVER_CONFIG = {
  grammar: {
    enableAdvancedValidation: true,
    enablePronounAgreement: true,
    enableArticleCorrection: true,
    enableVerbConjugation: true,
    enableSentenceStructure: true
  },
  cleanup: {
    removeDoubleSpaces: true,
    fixPunctuation: true,
    trimWhitespace: true,
    removeEmptyPlaceholders: true
  }
};

// Comprehensive grammar rule sets
const PRONOUN_FIXES = {
  they: {
    'they is': 'they are',
    'they was': 'they were', 
    'they has': 'they have',
    'they does': 'they do',
    'they goes': 'they go',
    'they explores': 'they explore',
    'they plays': 'they play',
    'they runs': 'they run',
    'they walks': 'they walk',
    'they talks': 'they talk',
    'they learns': 'they learn'
  },
  singular: {
    'he have': 'he has',
    'he are': 'he is', 
    'he were': 'he was',
    'he do': 'he does',
    'she have': 'she has',
    'she are': 'she is',
    'she were': 'she was', 
    'she do': 'she does'
  }
};

const ARTICLE_FIXES = [
  // Fix incorrect articles with plural nouns
  { pattern: /\b(a|an)\s+(children|feet|geese|men|women|teeth|mice|people|sheep|deer|fish)\b/gi, replacement: '$2' },
  { pattern: /\b(a|an)\s+([a-zA-Z]*s)\b/gi, replacement: '$2' },
  // Fix missing articles (only if not already preceded by an article)
  { pattern: /\b(?<!(a|an|the)\s)(cat|dog|bird|rabbit|duck|pig|cow|horse|bear|book|ball|car|toy|tree)\b/gi, replacement: 'a $2' },
  // Fix double articles
  { pattern: /\b(a|an)\s+(a|an)\s+/gi, replacement: '$1 ' },
];

const VERB_CONJUGATION_FIXES = [
  // Subject-verb agreement
  { pattern: /\b([A-Z][a-z]+)\s+(are)\b/g, replacement: '$1 is' },
  { pattern: /\b(The\s+[a-z]+)\s+(are)\b/g, replacement: '$1 is' },
  // Common verb corrections
  { pattern: /\bgoing to went\b/gi, replacement: 'going to go' },
  { pattern: /\bwill went\b/gi, replacement: 'will go' },
];

const SENTENCE_STRUCTURE_FIXES = [
  // Fix run-on sentences
  { pattern: /([.!?])\s*([a-z])/g, replacement: '$1 $2'.toUpperCase() },
  // Fix capitalization after punctuation
  { pattern: /([.!?])\s+([a-z])/g, replacement: (match, punct, letter) => `${punct} ${letter.toUpperCase()}` },
  // Fix double punctuation
  { pattern: /[.]{2,}/g, replacement: '.' },
  { pattern: /[,]{2,}/g, replacement: ',' },
  { pattern: /[!]{2,}/g, replacement: '!' },
  { pattern: /[?]{2,}/g, replacement: '?' },
];

/**
 * Apply pronoun-specific grammar fixes
 */
function applyPronounFixes(text: string, pronoun: string): string {
  if (!SERVER_CONFIG.grammar.enablePronounAgreement) return text;
  
  let result = text;
  
  if (pronoun === 'they') {
    for (const [incorrect, correct] of Object.entries(PRONOUN_FIXES.they)) {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      result = result.replace(regex, correct);
    }
  } else if (pronoun === 'he' || pronoun === 'she') {
    for (const [incorrect, correct] of Object.entries(PRONOUN_FIXES.singular)) {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      result = result.replace(regex, correct);
    }
  }
  
  return result;
}

/**
 * Apply article corrections
 */
function applyArticleFixes(text: string): string {
  if (!SERVER_CONFIG.grammar.enableArticleCorrection) return text;
  
  let result = text;
  
  for (const fix of ARTICLE_FIXES) {
    result = result.replace(fix.pattern, fix.replacement);
  }
  
  return result;
}

/**
 * Apply verb conjugation fixes
 */
function applyVerbFixes(text: string): string {
  if (!SERVER_CONFIG.grammar.enableVerbConjugation) return text;
  
  let result = text;
  
  for (const fix of VERB_CONJUGATION_FIXES) {
    result = result.replace(fix.pattern, fix.replacement);
  }
  
  return result;
}

/**
 * Apply sentence structure corrections
 */
function applySentenceStructureFixes(text: string): string {
  if (!SERVER_CONFIG.grammar.enableSentenceStructure) return text;
  
  let result = text;
  
  for (const fix of SENTENCE_STRUCTURE_FIXES) {
    result = result.replace(fix.pattern, fix.replacement);
  }
  
  return result;
}

/**
 * Advanced cleanup with comprehensive rules
 */
function advancedCleanup(text: string): string {
  let result = text;
  
  if (SERVER_CONFIG.cleanup.removeEmptyPlaceholders) {
    // Remove unresolved placeholders
    result = result.replace(/\{[^}]+\}/g, '');
  }
  
  if (SERVER_CONFIG.cleanup.removeDoubleSpaces) {
    // Collapse multiple spaces
    result = result.replace(/\s{2,}/g, ' ');
  }
  
  if (SERVER_CONFIG.cleanup.fixPunctuation) {
    // Fix space before punctuation
    result = result.replace(/\s+([,.!?:;])/g, '$1');
    // Fix double punctuation
    result = result.replace(/\.\s*\./g, '.');
    result = result.replace(/,\s*,/g, ',');
  }
  
  if (SERVER_CONFIG.cleanup.trimWhitespace) {
    result = result.trim();
  }
  
  return result;
}

/**
 * Main grammar validation function
 */
export function validateAndEnhanceGrammar(text: string, pronoun: string = 'they'): string {
  if (!SERVER_CONFIG.grammar.enableAdvancedValidation) {
    return advancedCleanup(text);
  }
  
  let result = text;
  
  // Apply grammar fixes in sequence
  result = applyPronounFixes(result, pronoun);
  result = applyArticleFixes(result);
  result = applyVerbFixes(result);
  result = applySentenceStructureFixes(result);
  result = advancedCleanup(result);
  
  return result;
}

/**
 * Quick cleanup function for basic text processing
 */
export function quickCleanup(text: string): string {
  return advancedCleanup(text);
}

/**
 * Update server configuration
 */
export function updateGrammarConfig(config: Partial<typeof SERVER_CONFIG>): void {
  Object.assign(SERVER_CONFIG, config);
}