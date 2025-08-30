
/**
 * Placeholder Validation Utility
 * Verifies that all placeholders are properly resolved in generated content
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

/**
 * Validate that all placeholders in story pages are properly resolved
 */
export function validatePlaceholders(pages: string[], source?: 'ai' | 'template' | 'fallback' | 'emergency' | 'unknown'): PlaceholderValidationResult {
  const unresolvedPlaceholders: Set<string> = new Set();
  const userInputsUsed: Set<string> = new Set();
  let totalPlaceholders = 0;
  let userInputsTotal = 0;

  // Regex to find any remaining placeholder patterns
  const placeholderRegex = /\{([^}]+)\}/g;

  pages.forEach((page, pageIndex) => {
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
    userInputsTotal: source === 'ai' ? USER_INPUT_PLACEHOLDERS.length : userInputsTotal
  };
}

/**
 * Get user-friendly message for placeholder validation results
 */
export function getPlaceholderValidationMessage(result: PlaceholderValidationResult): string {
  if (result.isValid) {
    if (result.source === 'ai') {
      if (result.userInputsResolved && result.userInputsTotal && result.userInputsUsed && result.userInputsUsed.length > 0) {
        return `✅ AI-generated content (incorporates ${result.userInputsResolved}/${result.userInputsTotal} user inputs: ${result.userInputsUsed.join(', ')})`;
      }
      return '✅ AI-generated content (incorporates user preferences directly)';
    }
    
    return result.totalPlaceholders > 0 
      ? `✅ All ${result.totalPlaceholders} placeholders resolved successfully`
      : '✅ No placeholders found (static template)';
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
