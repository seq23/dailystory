// Dynamic Vocabulary Loader for Edge Functions
// Loads vocabulary sets only when needed to avoid bloating edge function startup

// Cache for loaded vocabulary sets
const vocabularyCache: Map<string, Set<string>> = new Map();

/**
 * Dynamically load vocabulary set for a specific grade level
 * Uses dynamic imports to avoid loading all vocabulary at startup
 */
export async function getVocabularyForGrade(gradeLevel: number): Promise<Set<string>> {
  const cacheKey = `grade-${gradeLevel}`;
  
  // Return cached version if available
  if (vocabularyCache.has(cacheKey)) {
    return vocabularyCache.get(cacheKey)!;
  }
  
  let vocabulary: string[] = [];
  
  try {
    // Dynamic import based on grade level
    if (gradeLevel <= 0) {
      const { ENHANCED_LEVEL_0_VOCABULARY } = await import('./vocabulary/dolchPrePrimer.ts');
      vocabulary = ENHANCED_LEVEL_0_VOCABULARY;
    } else if (gradeLevel <= 1) {
      const { LEVEL_1_VOCABULARY } = await import('./vocabulary/level1.ts');
      vocabulary = LEVEL_1_VOCABULARY;
    } else if (gradeLevel <= 2) {
      const { LEVEL_2_VOCABULARY } = await import('./vocabulary/level2.ts');
      vocabulary = LEVEL_2_VOCABULARY;
    } else if (gradeLevel <= 3) {
      const { LEVEL_3_VOCABULARY } = await import('./vocabulary/level3.ts');
      vocabulary = LEVEL_3_VOCABULARY;
    } else if (gradeLevel <= 4) {
      const { LEVEL_4_VOCABULARY } = await import('./vocabulary/level4.ts');
      vocabulary = LEVEL_4_VOCABULARY;
    } else {
      // For grades 5+ use level 4 vocabulary as base
      const { LEVEL_4_VOCABULARY } = await import('./vocabulary/level4.ts');
      vocabulary = LEVEL_4_VOCABULARY;
    }
    
    // Convert to Set and cache
    const vocabularySet = new Set(vocabulary.map(word => word.toLowerCase()));
    vocabularyCache.set(cacheKey, vocabularySet);
    
    console.log(`📚 Loaded vocabulary for grade ${gradeLevel}: ${vocabularySet.size} words`);
    return vocabularySet;
    
  } catch (error) {
    console.warn(`⚠️ Failed to load vocabulary for grade ${gradeLevel}:`, error);
    // Return empty set as fallback
    const emptySet = new Set<string>();
    vocabularyCache.set(cacheKey, emptySet);
    return emptySet;
  }
}

/**
 * Calculate vocabulary compliance for a story text
 * Returns percentage of words that are in the expected vocabulary set
 */
export async function calculateVocabularyCompliance(
  storyText: string, 
  gradeLevel: number
): Promise<{ compliance: number; totalWords: number; validWords: number }> {
  const vocabularySet = await getVocabularyForGrade(gradeLevel);
  
  if (vocabularySet.size === 0) {
    return { compliance: 1.0, totalWords: 0, validWords: 0 };
  }
  
  // Extract words from story (simple tokenization)
  const words = storyText
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const validWords = words.filter(word => vocabularySet.has(word)).length;
  const compliance = words.length > 0 ? validWords / words.length : 1.0;
  
  return {
    compliance: Math.round(compliance * 100) / 100, // Round to 2 decimal places
    totalWords: words.length,
    validWords
  };
}

/**
 * Clear vocabulary cache (useful for testing or memory management)
 */
export function clearVocabularyCache(): void {
  vocabularyCache.clear();
  console.log('📚 Vocabulary cache cleared');
}