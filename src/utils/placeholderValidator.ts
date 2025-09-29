/**
 * Frontend Placeholder Validator - Simplified version for UI components
 * Basic placeholder validation without grammar enhancement (handled by edge functions)
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
  placeholderDetails?: {
    name: boolean;
    favoriteColor: boolean;
    favoriteAnimal: boolean;
    favoriteFood: boolean;
    hobbies: boolean;
    specialRequest: boolean;
  };
  foundInstances?: {
    name: string[];
    favoriteColor: string[];
    favoriteAnimal: string[];
    favoriteFood: string[];
    hobbies: string[];
    specialRequest: string[];
  };
}

/**
 * User input placeholders that should be resolved in AI-generated content
 */
const USER_INPUT_PLACEHOLDERS = [
  'userName', 'favoriteColor', 'favoriteAnimal', 'favoriteFood', 'hobbies', 'specialRequest'
];

/**
 * Validate that all placeholders in story pages are properly resolved
 * Enhanced version that searches for actual user input values
 */
export function validatePlaceholders(
  pages: string[], 
  source?: 'ai' | 'template' | 'fallback' | 'emergency' | 'unknown',
  applyGrammarEnhancement: boolean = false, // Not used in frontend version
  userInfo?: {
    name?: string;
    favoriteColor?: string;
    favoriteAnimal?: string;
    favoriteFood?: string;
    hobbies?: string;
    specialRequest?: string;
  }
): PlaceholderValidationResult {
  const unresolvedPlaceholders: Set<string> = new Set();
  const userInputsUsed: Set<string> = new Set();
  let totalPlaceholders = 0;
  let userInputsTotal = 0;

  // Initialize placeholder tracking
  const placeholderDetails = {
    name: false,
    favoriteColor: false,
    favoriteAnimal: false,
    favoriteFood: false,
    hobbies: false,
    specialRequest: false
  };

  const foundInstances = {
    name: [] as string[],
    favoriteColor: [] as string[],
    favoriteAnimal: [] as string[],
    favoriteFood: [] as string[],
    hobbies: [] as string[],
    specialRequest: [] as string[]
  };

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
  });

  // If userInfo is provided, search for actual user input values in the content
  if (userInfo && (source === 'ai' || source === 'template')) {
    const allContent = pages.join(' ').toLowerCase();
    
    // Search for name (case insensitive)
    if (userInfo.name) {
      const nameRegex = new RegExp(`\\b${userInfo.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = pages.join(' ').match(nameRegex);
      if (matches && matches.length > 0) {
        placeholderDetails.name = true;
        foundInstances.name = [...new Set(matches)]; // Remove duplicates
        userInputsUsed.add('name');
      }
    }

    // Search for favorite color
    if (userInfo.favoriteColor) {
      const colorRegex = new RegExp(`\\b${userInfo.favoriteColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = pages.join(' ').match(colorRegex);
      if (matches && matches.length > 0) {
        placeholderDetails.favoriteColor = true;
        foundInstances.favoriteColor = [...new Set(matches)];
        userInputsUsed.add('favoriteColor');
      }
    }

    // Search for favorite animal
    if (userInfo.favoriteAnimal) {
      const animalRegex = new RegExp(`\\b${userInfo.favoriteAnimal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = pages.join(' ').match(animalRegex);
      if (matches && matches.length > 0) {
        placeholderDetails.favoriteAnimal = true;
        foundInstances.favoriteAnimal = [...new Set(matches)];
        userInputsUsed.add('favoriteAnimal');
      }
    }

    // Search for favorite food
    if (userInfo.favoriteFood) {
      const foodRegex = new RegExp(`\\b${userInfo.favoriteFood.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = pages.join(' ').match(foodRegex);
      if (matches && matches.length > 0) {
        placeholderDetails.favoriteFood = true;
        foundInstances.favoriteFood = [...new Set(matches)];
        userInputsUsed.add('favoriteFood');
      }
    }

    // Search for hobbies (split by common delimiters and search for each)
    if (userInfo.hobbies) {
      const hobbies = userInfo.hobbies.split(/[,&\s]+/).filter(h => h.length > 2);
      for (const hobby of hobbies) {
        const hobbyRegex = new RegExp(`\\b${hobby.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = pages.join(' ').match(hobbyRegex);
        if (matches && matches.length > 0) {
          placeholderDetails.hobbies = true;
          foundInstances.hobbies.push(...matches);
          userInputsUsed.add('hobbies');
          break; // Found at least one hobby
        }
      }
      foundInstances.hobbies = [...new Set(foundInstances.hobbies)]; // Remove duplicates
    }

    // Search for special request keywords
    if (userInfo.specialRequest) {
      const keywords = userInfo.specialRequest.split(/[,&\s]+/).filter(k => k.length > 3);
      for (const keyword of keywords) {
        const keywordRegex = new RegExp(`\\b${keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = pages.join(' ').match(keywordRegex);
        if (matches && matches.length > 0) {
          placeholderDetails.specialRequest = true;
          foundInstances.specialRequest.push(...matches);
          userInputsUsed.add('specialRequest');
          break; // Found at least one keyword
        }
      }
      foundInstances.specialRequest = [...new Set(foundInstances.specialRequest)]; // Remove duplicates
    }
  }

  const unresolvedArray = Array.from(unresolvedPlaceholders);
  const resolvedCount = totalPlaceholders - unresolvedArray.length;
  const userInputsResolved = userInfo && (source === 'ai' || source === 'template') ? userInputsUsed.size : 0;
  const totalUserInputs = userInfo && (source === 'ai' || source === 'template') ? 6 : userInputsTotal;

  return {
    isValid: unresolvedArray.length === 0,
    unresolvedPlaceholders: unresolvedArray,
    resolvedCount: resolvedCount,
    totalPlaceholders: totalPlaceholders,
    source,
    userInputsUsed: Array.from(userInputsUsed),
    userInputsResolved,
    userInputsTotal: totalUserInputs,
    grammarEnhanced: false, // Grammar enhancement handled by edge functions
    placeholderDetails: userInfo && (source === 'ai' || source === 'template') ? placeholderDetails : undefined,
    foundInstances: userInfo && (source === 'ai' || source === 'template') ? foundInstances : undefined
  };
}

/**
 * Get user-friendly message for placeholder validation results
 */
export function getPlaceholderValidationMessage(result: PlaceholderValidationResult): string {
  if ((result.source === 'ai' || result.source === 'template') && result.userInputsResolved !== undefined && result.userInputsTotal !== undefined) {
    return `${result.userInputsResolved}/${result.userInputsTotal} placeholders found`;
  }
  
  if (result.isValid) {
    if (result.source === 'ai') {
      if (result.userInputsResolved && result.userInputsTotal && result.userInputsUsed && result.userInputsUsed.length > 0) {
        return `✅ AI-generated content (incorporates ${result.userInputsResolved}/${result.userInputsTotal} user inputs: ${result.userInputsUsed.join(', ')})`;
      }
      return '✅ AI-generated content (incorporates user preferences directly)';
    }
    
    return result.totalPlaceholders > 0 
      ? `✅ All ${result.totalPlaceholders} placeholders resolved successfully`
      : `✅ No placeholders found (static template)`;
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