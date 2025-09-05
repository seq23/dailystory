/**
 * Educational Standards - Frontend Educational Compliance System
 * Replaces static vocabulary imports with educational validation
 * Aligns with backend educational standards approach
 */

import type { DifficultyLevel } from '@/types';

// Educational Compliance Levels based on research-backed standards
export type EducationalLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Educational level mapping from difficulty
 */
export function difficultyToEducationalLevel(difficulty: DifficultyLevel): EducationalLevel {
  switch (difficulty) {
    case 'beginner': return 0;  // Pre-K to K (Ages 3-5)
    case 'easy': return 1;      // 1st-2nd Grade (Ages 5-7) 
    case 'medium': return 2;    // 2nd-3rd Grade (Ages 7-9)
    case 'hard': return 3;      // 4th Grade+ (Ages 9-11)
    case 'expert': return 4;    // Advanced/Adaptive (Ages 11+)
    default: return 0;
  }
}

/**
 * Educational level to difficulty mapping
 */
export function educationalLevelToDifficulty(level: EducationalLevel): DifficultyLevel {
  switch (level) {
    case 0: return 'beginner';
    case 1: return 'easy';
    case 2: return 'medium';
    case 3: return 'hard';
    case 4: return 'expert';
    default: return 'beginner';
  }
}

/**
 * Educational standards metadata
 */
export const EDUCATIONAL_STANDARDS = {
  0: { 
    ages: '3-5', 
    description: 'Pre-Reader/Early Learning',
    targetWords: 40,
    complianceThreshold: 50 // 50% of words can be educational level appropriate
  },
  1: { 
    ages: '5-7', 
    description: 'Beginning Reader',
    targetWords: 120,
    complianceThreshold: 60 // 60% compliance required
  },
  2: { 
    ages: '7-9', 
    description: 'Developing Reader', 
    targetWords: 200,
    complianceThreshold: 70 // 70% compliance required
  },
  3: { 
    ages: '9-11', 
    description: 'Independent Reader',
    targetWords: 300,
    complianceThreshold: 80 // 80% compliance required
  },
  4: { 
    ages: '11+', 
    description: 'Advanced/Adaptive Learning',
    targetWords: 'unlimited',
    complianceThreshold: 0 // No vocabulary restrictions - adaptive system
  }
} as const;

/**
 * Basic educational word sets for frontend validation
 * These are minimal sets for UI validation - full validation happens on backend
 */
export const CORE_EDUCATIONAL_WORDS = {
  // Level 0: Essential pre-reader words (40 core words)
  0: new Set([
    'i', 'a', 'to', 'and', 'he', 'you', 'it', 'of', 'in', 'was',
    'said', 'his', 'that', 'she', 'for', 'on', 'they', 'with', 'be', 'at',
    'one', 'have', 'this', 'from', 'or', 'had', 'by', 'word', 'but', 'not',
    'what', 'all', 'were', 'when', 'your', 'can', 'an', 'each', 'which', 'do'
  ]),
  
  // Level 1: Beginning reader expansion (additional 80 words)
  1: new Set([
    'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two', 'more', 'go',
    'see', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who',
    'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made',
    'may', 'part', 'over', 'new', 'sound', 'take', 'only', 'little', 'work', 'know',
    'place', 'year', 'live', 'me', 'back', 'give', 'most', 'very', 'after', 'thing',
    'our', 'just', 'name', 'good', 'sentence', 'man', 'think', 'say', 'great', 'where',
    'help', 'through', 'much', 'before', 'line', 'right', 'too', 'mean', 'old', 'any',
    'same', 'tell', 'boy', 'follow', 'came', 'want', 'show', 'also', 'around', 'form'
  ])
};

/**
 * Quick educational compliance check for frontend validation
 * Full validation should use backend services
 */
export function isEducationallyAppropriate(
  word: string, 
  level: EducationalLevel,
  userName?: string
): boolean {
  const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
  
  // Always allow user names
  if (userName && cleanWord === userName.toLowerCase()) {
    return true;
  }
  
  // Level 4 (Expert) allows all words - adaptive system handles validation
  if (level >= 4) return true;
  
  // Check against core educational words for basic levels
  if (level === 0) {
    return CORE_EDUCATIONAL_WORDS[0].has(cleanWord);
  }
  
  if (level === 1) {
    return CORE_EDUCATIONAL_WORDS[0].has(cleanWord) || 
           CORE_EDUCATIONAL_WORDS[1].has(cleanWord);
  }
  
  // For levels 2-3, allow levels 0-1 words plus assume additional educational words
  // (Full validation should be done by backend services)
  if (level >= 2) {
    return CORE_EDUCATIONAL_WORDS[0].has(cleanWord) || 
           CORE_EDUCATIONAL_WORDS[1].has(cleanWord) ||
           cleanWord.length <= 6; // Simple heuristic for frontend
  }
  
  return false;
}

/**
 * Calculate educational compliance percentage
 */
export function calculateEducationalCompliance(
  text: string,
  level: EducationalLevel,
  userName?: string
): { compliancePercentage: number; inappropriateWords: string[]; isCompliant: boolean } {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  if (words.length === 0) {
    return { compliancePercentage: 100, inappropriateWords: [], isCompliant: true };
  }
  
  const inappropriateWords: string[] = [];
  let appropriateCount = 0;
  
  words.forEach(word => {
    if (isEducationallyAppropriate(word, level, userName)) {
      appropriateCount++;
    } else {
      inappropriateWords.push(word);
    }
  });
  
  const compliancePercentage = Math.round((appropriateCount / words.length) * 100);
  const threshold = EDUCATIONAL_STANDARDS[level]?.complianceThreshold || 50;
  const isCompliant = compliancePercentage >= threshold;
  
  return {
    compliancePercentage,
    inappropriateWords,
    isCompliant
  };
}

/**
 * Get educational level info
 */
export function getEducationalLevelInfo(level: EducationalLevel) {
  return EDUCATIONAL_STANDARDS[level] || EDUCATIONAL_STANDARDS[0];
}

// Re-export types for backward compatibility  
export type GradeLevel = EducationalLevel;
export const GRADE_LEVEL_INFO = EDUCATIONAL_STANDARDS;