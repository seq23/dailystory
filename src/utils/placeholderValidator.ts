/**
 * Placeholder Validation Utility
 * Verifies that all placeholders are properly resolved in generated content
 */

export interface PlaceholderValidationResult {
  isValid: boolean;
  unresolvedPlaceholders: string[];
  resolvedCount: number;
  totalPlaceholders: number;
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
 * Validate that all placeholders in story pages are properly resolved
 */
export function validatePlaceholders(pages: string[]): PlaceholderValidationResult {
  const unresolvedPlaceholders: Set<string> = new Set();
  let totalPlaceholders = 0;

  // Regex to find any remaining placeholder patterns
  const placeholderRegex = /\{([^}]+)\}/g;

  pages.forEach((page, pageIndex) => {
    let match;
    while ((match = placeholderRegex.exec(page)) !== null) {
      const placeholder = match[1];
      unresolvedPlaceholders.add(`${placeholder} (page ${pageIndex + 1})`);
      totalPlaceholders++;
    }
  });

  const unresolvedArray = Array.from(unresolvedPlaceholders);
  const resolvedCount = totalPlaceholders - unresolvedArray.length;

  return {
    isValid: unresolvedArray.length === 0,
    unresolvedPlaceholders: unresolvedArray,
    resolvedCount: resolvedCount,
    totalPlaceholders: totalPlaceholders
  };
}

/**
 * Get user-friendly message for placeholder validation results
 */
export function getPlaceholderValidationMessage(result: PlaceholderValidationResult): string {
  if (result.isValid) {
    return result.totalPlaceholders > 0 
      ? `✅ All ${result.totalPlaceholders} placeholders resolved successfully`
      : '✅ No placeholders found (static template)';
  }

  const count = result.unresolvedPlaceholders.length;
  return `⚠️ ${count} unresolved placeholder${count > 1 ? 's' : ''}: ${result.unresolvedPlaceholders.join(', ')}`;
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