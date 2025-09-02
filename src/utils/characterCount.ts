// Character Counting Utilities for Story Testing
// Provides character-level analysis for comprehensive story metrics

/**
 * Count total characters in content (including spaces)
 */
export const countCharacters = (content: string | string[]): number => {
  if (!content) return 0;
  
  // Handle array of pages
  if (Array.isArray(content)) {
    return content.reduce((total, page) => total + countCharacters(page), 0);
  }
  
  // Handle single string
  if (typeof content === 'string') {
    return content.length;
  }
  
  return 0;
};

/**
 * Count characters without spaces
 */
export const countCharactersNoSpaces = (content: string | string[]): number => {
  if (!content) return 0;
  
  // Handle array of pages
  if (Array.isArray(content)) {
    return content.reduce((total, page) => total + countCharactersNoSpaces(page), 0);
  }
  
  // Handle single string
  if (typeof content === 'string') {
    return content.replace(/\s/g, '').length;
  }
  
  return 0;
};

/**
 * Calculate average characters per word
 */
export const calculateCharactersPerWord = (content: string | string[], wordCount: number): number => {
  if (!content || wordCount === 0) return 0;
  
  const totalChars = countCharacters(content);
  return Math.round((totalChars / wordCount) * 10) / 10; // Round to 1 decimal
};

/**
 * Calculate average characters per page
 */
export const calculateCharactersPerPage = (content: string | string[], pageCount: number): number => {
  if (!content || pageCount === 0) return 0;
  
  const totalChars = countCharacters(content);
  return Math.round(totalChars / pageCount);
};

/**
 * Get character analysis for content
 */
export interface CharacterAnalysis {
  totalCharacters: number;
  charactersNoSpaces: number;
  averageCharactersPerWord: number;
  averageCharactersPerPage: number;
  characterWordRatio: number;
}

export const analyzeCharacters = (
  content: string | string[], 
  wordCount: number, 
  pageCount: number
): CharacterAnalysis => {
  const totalCharacters = countCharacters(content);
  const charactersNoSpaces = countCharactersNoSpaces(content);
  const averageCharactersPerWord = calculateCharactersPerWord(content, wordCount);
  const averageCharactersPerPage = calculateCharactersPerPage(content, pageCount);
  const characterWordRatio = wordCount > 0 ? Math.round((totalCharacters / wordCount) * 10) / 10 : 0;

  return {
    totalCharacters,
    charactersNoSpaces,
    averageCharactersPerWord,
    averageCharactersPerPage,
    characterWordRatio
  };
};