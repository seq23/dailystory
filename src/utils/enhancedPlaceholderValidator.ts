/**
 * Enhanced Placeholder Validator - Combined Placeholder + Grammar System
 * Consolidates placeholder validation with sophisticated grammar rules moved from edge functions
 */

export interface PlaceholderValidationResult {
  isValid: boolean;
  unresolvedPlaceholders: string[];
  resolvedCount: number;
  totalPlaceholders: number;
  source?: 'ai' | 'template' | 'fallback' | 'emergency' | 'unknown';
  userInputsUsed?: string[];
  userInputsResolved?: number;
  userInputsTotal?: number;
  grammarEnhanced?: boolean;
}

/**
 * Common placeholders that should be resolved in story content
 */
const EXPECTED_PLACEHOLDERS = [
  'userName', 'favoriteColor', 'favoriteAnimal', 'favoriteFood', 'hobbies', 'specialRequest',
  'pronoun', 'animal', 'animalType', 'monsterType', 'food', 'setting', 'object', 'action',
  'adjective', 'color', 'friend', 'friendName', 'forestType', 'forestName', 'weatherType', 'placeType'
];

/**
 * User input placeholders that should be resolved in AI-generated content
 */
const USER_INPUT_PLACEHOLDERS = [
  'userName', 'favoriteColor', 'favoriteAnimal', 'favoriteFood', 'hobbies', 'specialRequest'
];

// Sophisticated grammar rule sets (moved from edge functions)
const GRAMMAR_CONFIG = {
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
  // Fix incorrect articles with plural nouns - more conservative approach
  { pattern: /\b(a|an)\s+(children|feet|geese|men|women|teeth|mice|people|sheep|deer|fish)\b/gi, replacement: '$2' },
  // Fix double articles - enhanced patterns
  { pattern: /\b(a|an)\s+(a|an)\s+(\w+)/gi, replacement: '$1 $3' },
  { pattern: /\b(a|an)\s+(a|an)\s+/gi, replacement: '$1 ' },
  // Fix specific double article patterns like "a blue a cat" and possessive + article errors
  { pattern: /\b(a|an)\s+([\w]+)\s+(a|an)\s+(\w+)/gi, replacement: '$1 $2 $4' },
  { pattern: /\b(his|her)\s+(a|an)\s+(\w+)/gi, replacement: '$1 $3' },
];

const VERB_CONJUGATION_FIXES = [
  // Common verb corrections only - removed problematic subject-verb rules
  { pattern: /\bgoing to went\b/gi, replacement: 'going to go' },
  { pattern: /\bwill went\b/gi, replacement: 'will go' },
];

const SENTENCE_STRUCTURE_FIXES = [
  // Fix run-on sentences
  { pattern: /([.!?])\s*([a-z])/g, replacement: '$1 $2'.toUpperCase() },
  // Fix capitalization after punctuation - using function replacement
  { 
    pattern: /([.!?])\s+([a-z])/g, 
    replacement: (match: string, punct: string, letter: string) => `${punct} ${letter.toUpperCase()}` 
  },
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
  if (!GRAMMAR_CONFIG.grammar.enablePronounAgreement) return text;
  
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
  if (!GRAMMAR_CONFIG.grammar.enableArticleCorrection) return text;
  
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
  if (!GRAMMAR_CONFIG.grammar.enableVerbConjugation) return text;
  
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
  if (!GRAMMAR_CONFIG.grammar.enableSentenceStructure) return text;
  
  let result = text;
  
  for (const fix of SENTENCE_STRUCTURE_FIXES) {
    if (typeof fix.replacement === 'function') {
      result = result.replace(fix.pattern, fix.replacement);
    } else {
      result = result.replace(fix.pattern, fix.replacement);
    }
  }
  
  return result;
}

/**
 * Advanced cleanup with comprehensive rules
 */
function advancedCleanup(text: string): string {
  let result = text;
  
  if (GRAMMAR_CONFIG.cleanup.removeEmptyPlaceholders) {
    // Remove unresolved placeholders
    result = result.replace(/\{[^}]+\}/g, '');
  }
  
  if (GRAMMAR_CONFIG.cleanup.removeDoubleSpaces) {
    // Collapse multiple spaces
    result = result.replace(/\s{2,}/g, ' ');
  }
  
  if (GRAMMAR_CONFIG.cleanup.fixPunctuation) {
    // Fix space before punctuation
    result = result.replace(/\s+([,.!?:;])/g, '$1');
    // Fix double punctuation
    result = result.replace(/\.\s*\./g, '.');
    result = result.replace(/,\s*,/g, ',');
  }
  
  if (GRAMMAR_CONFIG.cleanup.trimWhitespace) {
    result = result.trim();
  }
  
  return result;
}

/**
 * Enhanced grammar validation and improvement (moved from edge functions)
 */
export function validateAndEnhanceGrammar(text: string, pronoun: string = 'they'): string {
  if (!GRAMMAR_CONFIG.grammar.enableAdvancedValidation) {
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
 * Validate that all placeholders in story pages are properly resolved and apply grammar enhancement
 */
export function validatePlaceholders(
  pages: string[], 
  source?: 'ai' | 'template' | 'fallback' | 'emergency' | 'unknown',
  applyGrammarEnhancement: boolean = true
): PlaceholderValidationResult {
  const unresolvedPlaceholders: Set<string> = new Set();
  const userInputsUsed: Set<string> = new Set();
  let totalPlaceholders = 0;
  let userInputsTotal = 0;
  let grammarEnhanced = false;

  // Apply grammar enhancement to pages if requested
  const processedPages = applyGrammarEnhancement 
    ? pages.map(page => {
        const enhanced = validateAndEnhanceGrammar(page, 'they');
        grammarEnhanced = enhanced !== page || grammarEnhanced;
        return enhanced;
      })
    : pages;

  // Regex to find any remaining placeholder patterns
  const placeholderRegex = /\{([^}]+)\}/g;

  processedPages.forEach((page, pageIndex) => {
    let match;
    while ((match = placeholderRegex.exec(page)) !== null) {
      const placeholder = match[1];
      unresolvedPlaceholders.add(`${placeholder} (page ${pageIndex + 1})`);
      totalPlaceholders++;
      
      // Track user input placeholders
      if (USER_INPUT_PLACEHOLDERS.includes(placeholder)) {
        userInputsTotal++;
      }
    }
    
    // For AI content, check which user inputs were actually incorporated
    if (source === 'ai') {
      USER_INPUT_PLACEHOLDERS.forEach(userInput => {
        // Simple heuristic: check if the page contains references that might indicate the user input was used
        const lowerPage = page.toLowerCase();
        if (userInput === 'userName' && /\b[A-Z][a-z]+\b/.test(page)) {
          userInputsUsed.add(userInput);
        } else if (userInput === 'favoriteColor' && /\b(red|blue|green|yellow|purple|pink|orange|black|white|brown)\b/i.test(page)) {
          userInputsUsed.add(userInput);
        } else if (userInput === 'favoriteAnimal' && /\b(cat|dog|bird|fish|rabbit|bear|lion|tiger|elephant|monkey)\b/i.test(page)) {
          userInputsUsed.add(userInput);
        }
        // Add more heuristics as needed
      });
    }
  });

  const unresolvedArray = Array.from(unresolvedPlaceholders);
  const resolvedCount = totalPlaceholders - unresolvedArray.length;

  return {
    isValid: unresolvedArray.length === 0,
    unresolvedPlaceholders: unresolvedArray,
    resolvedCount: resolvedCount,
    totalPlaceholders: totalPlaceholders,
    source,
    userInputsUsed: Array.from(userInputsUsed),
    userInputsResolved: userInputsUsed.size,
    userInputsTotal: source === 'ai' ? USER_INPUT_PLACEHOLDERS.length : userInputsTotal,
    grammarEnhanced
  };
}

/**
 * Get user-friendly message for placeholder validation results
 */
export function getPlaceholderValidationMessage(result: PlaceholderValidationResult): string {
  if (result.isValid) {
    if (result.source === 'ai') {
      if (result.userInputsResolved && result.userInputsTotal && result.userInputsUsed && result.userInputsUsed.length > 0) {
        const grammarNote = result.grammarEnhanced ? ' (grammar enhanced)' : '';
        return `✅ AI-generated content (incorporates ${result.userInputsResolved}/${result.userInputsTotal} user inputs: ${result.userInputsUsed.join(', ')})${grammarNote}`;
      }
      return '✅ AI-generated content (incorporates user preferences directly)';
    }
    
    const grammarNote = result.grammarEnhanced ? ' (grammar enhanced)' : '';
    return result.totalPlaceholders > 0 
      ? `✅ All ${result.totalPlaceholders} placeholders resolved successfully${grammarNote}`
      : `✅ No placeholders found (static template)${grammarNote}`;
  }

  const unresolvedList = result.unresolvedPlaceholders || [];
  const count = unresolvedList.length;
  const prefix = result.source === 'ai' ? 'Unresolved user inputs' : 'Unresolved placeholders';
  return `⚠️ ${count} ${prefix.toLowerCase()}: ${unresolvedList.join(', ')}`;
}

/**
 * Check if content contains any suspicious patterns that might indicate placeholder issues
 */
export function checkForPlaceholderIssues(pages: string[]): string[] {
  const issues: string[] = [];

  pages.forEach((page, index) => {
    // Check for obvious placeholder artifacts
    if (page.includes('undefined') || page.includes('null')) {
      issues.push(`Page ${index + 1}: Contains 'undefined' or 'null' text`);
    }

    // Check for grammar issues that might indicate pronoun resolution problems
    if (page.match(/\bthey\s+(is|was|has|does|goes)\b/gi)) {
      issues.push(`Page ${index + 1}: Grammar issue with 'they' pronoun`);
    }

    // Check for missing proper names (common placeholder issue)
    if (page.match(/\b(a|the)\s+friend\b/gi) && !page.match(/\b[A-Z][a-z]+\b/)) {
      issues.push(`Page ${index + 1}: Generic 'friend' reference without proper name`);
    }

    // Check for repetitive fallback content
    if (page.includes('Child') && page.includes('adventure')) {
      issues.push(`Page ${index + 1}: May be using fallback content`);
    }
  });

  return issues;
}

/**
 * Quick cleanup function for basic text processing
 */
export function quickCleanup(text: string): string {
  return advancedCleanup(text);
}