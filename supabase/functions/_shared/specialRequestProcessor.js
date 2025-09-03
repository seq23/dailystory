/**
 * Special Request Processor - Crash-Proof Request Analysis
 * Safely parses user special requests to extract keywords, themes, and character names
 */

import { safeErrorMessage, safePropertyAccess, logSafeError } from './errorPatterns.ts';

/**
 * Common name patterns for character extraction (gender-neutral approach)
 */
const COMMON_NAMES = [
  'sam', 'alex', 'riley', 'taylor', 'jordan', 'casey', 'kim', 'lee', 'pat', 'jo',
  'chris', 'jamie', 'morgan', 'avery', 'quinn', 'sage', 'rowan', 'finley', 'emery',
  'hayden', 'parker', 'reese', 'blake', 'drew', 'river', 'sky', 'rain', 'storm'
];

/**
 * Validate and sanitize input request
 */
function validateRequest(request) {
  try {
    if (!request) return null;
    if (typeof request !== 'string') return null;
    if (request.length === 0) return null;
    if (request.length > 1000) return null; // Prevent memory issues
    
    // Basic sanitization - remove problematic characters
    const cleaned = request
      .trim()
      .replace(/[^\w\s,.!?'"()-]/g, ' ') // Keep basic punctuation
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .trim();
    
    if (cleaned.length === 0) return null;
    return cleaned;
  } catch (error) {
    logSafeError('Request validation failed', error);
    return null;
  }
}

/**
 * Extract character names from special request with safety checks
 */
export function extractCharacterNames(request) {
  try {
    const validatedRequest = validateRequest(request);
    if (!validatedRequest) return [];
    
    const names = [];
    const lowerRequest = validatedRequest.toLowerCase();
    
    // Look for patterns like "my friend Sarah" or "about Emma"
    const namePatterns = [
      /\b(?:my\s+friend|friend|buddy|pal)\s+([A-Za-z]{2,15})\b/gi,
      /\b(?:about|with|meet)\s+([A-Za-z]{2,15})\b/gi,
      /\b([A-Za-z]{2,15})\s+(?:and\s+me|is\s+my)/gi
    ];
    
    for (const pattern of namePatterns) {
      let match;
      while ((match = pattern.exec(validatedRequest)) !== null) {
        const name = match[1];
        if (name && name.length >= 2 && name.length <= 15) {
          // Check if it's likely a name (not a common word)
          if (!isCommonWord(name.toLowerCase())) {
            names.push(capitalizeFirst(name));
          }
        }
        // Prevent infinite loops
        if (pattern.lastIndex === match.index) {
          pattern.lastIndex++;
        }
      }
    }
    
    // Remove duplicates and limit results
    return [...new Set(names)].slice(0, 3);
    
  } catch (error) {
    logSafeError('Character name extraction failed', error);
    return []; // Safe fallback
  }
}

/**
 * Extract thematic keywords from request
 */
export function extractThematicKeywords(request) {
  try {
    const validatedRequest = validateRequest(request);
    if (!validatedRequest) return [];
    
    const lowerRequest = validatedRequest.toLowerCase();
    
    // Thematic keyword mapping
    const themeKeywords = {
      adventure: ['adventure', 'explore', 'journey', 'quest', 'discover', 'travel', 'expedition'],
      friendship: ['friend', 'friends', 'buddy', 'pal', 'companion', 'together', 'team'],
      animals: ['animal', 'pet', 'cat', 'dog', 'bird', 'fish', 'horse', 'rabbit', 'bear'],
      magic: ['magic', 'wizard', 'fairy', 'dragon', 'spell', 'enchant', 'wand', 'potion'],
      school: ['school', 'class', 'teacher', 'learn', 'study', 'homework', 'lesson'],
      family: ['family', 'mom', 'dad', 'parent', 'sister', 'brother', 'grandma', 'grandpa'],
      nature: ['tree', 'forest', 'garden', 'flower', 'plant', 'outdoor', 'park'],
      space: ['space', 'planet', 'star', 'moon', 'rocket', 'alien', 'astronaut'],
      mystery: ['mystery', 'secret', 'hidden', 'clue', 'solve', 'detective', 'puzzle'],
      sports: ['sport', 'game', 'play', 'ball', 'team', 'win', 'compete', 'race']
    };
    
    const foundThemes = [];
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      for (const keyword of keywords) {
        if (lowerRequest.includes(keyword)) {
          foundThemes.push(theme);
          break; // One match per theme is enough
        }
      }
    }
    
    return foundThemes.slice(0, 5); // Limit to prevent processing issues
    
  } catch (error) {
    logSafeError('Thematic keyword extraction failed', error);
    return []; // Safe fallback
  }
}

/**
 * Parse complete special request with all safety mechanisms
 */
export function parseSpecialRequest(request) {
  try {
    const validatedRequest = validateRequest(request);
    
    if (!validatedRequest) {
      return {
        isValid: false,
        keywords: [],
        themes: [],
        characterNames: [],
        originalRequest: request || ''
      };
    }
    
    // Extract different types of information
    const keywords = extractBasicKeywords(validatedRequest);
    const themes = extractThematicKeywords(validatedRequest);
    const characterNames = extractCharacterNames(validatedRequest);
    
    console.log(`📝 Parsed request: "${validatedRequest}"`);
    console.log(`🔤 Keywords: [${keywords.join(', ')}]`);
    console.log(`🎭 Themes: [${themes.join(', ')}]`);
    console.log(`👤 Characters: [${characterNames.join(', ')}]`);
    
    return {
      isValid: true,
      keywords: keywords,
      themes: themes,
      characterNames: characterNames,
      originalRequest: validatedRequest
    };
    
  } catch (error) {
    logSafeError('Special request parsing failed', error);
    
    // Return safe default structure
    return {
      isValid: false,
      keywords: [],
      themes: [],
      characterNames: [],
      originalRequest: request || ''
    };
  }
}

/**
 * Extract basic keywords from request
 */
function extractBasicKeywords(request) {
  try {
    if (!request || typeof request !== 'string') return [];
    
    const cleaned = request
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && word.length < 20)
      .filter(word => !isCommonWord(word))
      .slice(0, 15); // Limit keywords
      
    return cleaned;
  } catch (error) {
    return [];
  }
}

/**
 * Check if word is a common non-meaningful word
 */
function isCommonWord(word) {
  const commonWords = [
    'the', 'and', 'with', 'for', 'about', 'story', 'tell', 'want', 'like', 
    'can', 'you', 'please', 'make', 'create', 'write', 'need', 'would',
    'this', 'that', 'have', 'will', 'from', 'they', 'were', 'been',
    'said', 'each', 'which', 'their', 'time', 'into', 'very', 'what'
  ];
  return commonWords.includes(word.toLowerCase());
}

/**
 * Capitalize first letter of a string safely
 */
function capitalizeFirst(str) {
  try {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  } catch (error) {
    return str || '';
  }
}