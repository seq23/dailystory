// Enhanced Unified Template System - Central Template Manager
// Integrates all 5 grade levels with 40 templates each (200 total templates, 1000 pages)

import { 
  getLevel0FreeTemplate, 
  getLevel0FreeTemplateCount 
} from '@/constants/level0TemplatesFree';

import { 
  getLevel0PremiumTemplate, 
  getLevel0PremiumTemplateCount
} from '@/constants/level0TemplatesPremium';

import { 
  getLevel1Template, 
  getLevel1TemplateCount,
  LEVEL_1_TEMPLATES 
} from './level1Templates';

import { 
  getLevel2Template, 
  getLevel2TemplateCount,
  LEVEL_2_TEMPLATES 
} from './level2Templates';

import { 
  getLevel3Template, 
  getLevel3TemplateCount,
  LEVEL_3_TEMPLATES 
} from './level3Templates';

import { 
  getLevel4Template, 
  getLevel4TemplateCount,
  LEVEL_4_TEMPLATES 
} from './level4Templates';

import { 
  GradeLevel, 
  difficultyToGradeLevel, 
  gradeLevelToDifficulty 
} from './index';

import { DifficultyLevel } from '@/types';
import { GrammarValidator } from '@/utils/grammarValidator';

// Template retrieval by grade level
export function getTemplateByGradeLevel(
  gradeLevel: GradeLevel, 
  templateIndex?: number,
  isPremium?: boolean
): string[] {
  switch (gradeLevel) {
    case 0: 
      // Premium users get enhanced vocabulary templates, free users get strict Dolch
      return isPremium 
        ? getLevel0PremiumTemplate(templateIndex)
        : getLevel0FreeTemplate(templateIndex);
    case 1: return getLevel1Template(templateIndex);
    case 2: return getLevel2Template(templateIndex);
    case 3: return getLevel3Template(templateIndex);
    case 4: return getLevel4Template(templateIndex);
    default: return getLevel0FreeTemplate(templateIndex);
  }
}

// Template retrieval by difficulty level (backward compatibility)
export function getTemplateByDifficulty(
  difficulty: DifficultyLevel, 
  templateIndex?: number
): string[] {
  const gradeLevel = difficultyToGradeLevel(difficulty);
  return getTemplateByGradeLevel(gradeLevel, templateIndex);
}

// Get template count by grade level
export function getTemplateCountByGradeLevel(gradeLevel: GradeLevel, isPremium?: boolean): number {
  switch (gradeLevel) {
    case 0: 
      // Premium users have more templates with enhanced vocabulary
      return isPremium 
        ? getLevel0PremiumTemplateCount()
        : getLevel0FreeTemplateCount();
    case 1: return getLevel1TemplateCount();
    case 2: return getLevel2TemplateCount();
    case 3: return getLevel3TemplateCount();
    case 4: return getLevel4TemplateCount();
    default: return getLevel0FreeTemplateCount();
  }
}

// Get template count by difficulty (backward compatibility)
export function getTemplateCountByDifficulty(difficulty: DifficultyLevel): number {
  const gradeLevel = difficultyToGradeLevel(difficulty);
  return getTemplateCountByGradeLevel(gradeLevel);
}

// Get all templates for a grade level (for preview/admin)
export function getAllTemplatesByGradeLevel(gradeLevel: GradeLevel): string[][] {
  switch (gradeLevel) {
    case 0: {
      const count = getLevel0FreeTemplateCount();
      return Array.from({ length: count }, (_, i) => getLevel0FreeTemplate(i));
    }
    case 1: return [...LEVEL_1_TEMPLATES];
    case 2: return [...LEVEL_2_TEMPLATES];
    case 3: return [...LEVEL_3_TEMPLATES];
    case 4: return [...LEVEL_4_TEMPLATES];
    default: {
      const count = getLevel0FreeTemplateCount();
      return Array.from({ length: count }, (_, i) => getLevel0FreeTemplate(i));
    }
  }
}

// System analytics
export function getUnifiedTemplateSystemAnalytics() {
  const analytics = {
    totalTemplates: 0,
    totalPages: 0,
    byGradeLevel: {} as Record<GradeLevel, {
      templateCount: number;
      pageCount: number;
      estimatedReadingTime: number; // minutes
    }>
  };

  for (let grade = 0; grade <= 4; grade++) {
    const gradeLevel = grade as GradeLevel;
    const templateCount = getTemplateCountByGradeLevel(gradeLevel);
    const pageCount = templateCount * 5; // All templates are 5 pages
    
    // Estimate reading time based on grade level
    const wordsPerPage = [15, 25, 40, 75, 120][gradeLevel]; // Rough estimates
    const wordsPerMinute = [30, 50, 75, 125, 200][gradeLevel]; // Reading speeds
    const estimatedReadingTime = Math.round((pageCount * wordsPerPage) / wordsPerMinute);
    
    analytics.byGradeLevel[gradeLevel] = {
      templateCount,
      pageCount,
      estimatedReadingTime
    };
    
    analytics.totalTemplates += templateCount;
    analytics.totalPages += pageCount;
  }

  return analytics;
}

// Premium page extension configuration
export const PREMIUM_PAGE_EXTENSIONS = {
  0: 5,  // Level 0: 5 pages (no extension needed)
  1: 5,  // Level 1: 5 pages (no extension needed)
  2: 10, // Level 2: Extend to 10 pages
  3: 10, // Level 3: Extend to 10 pages
  4: 15  // Level 4: Extend to 15 pages
} as const;

export const FREE_PAGE_COUNT = 10; // Universal for all levels

// Get target page count for a grade level
export function getTargetPageCount(
  gradeLevel: GradeLevel, 
  isPremium: boolean = false
): number {
  if (!isPremium) {
    return FREE_PAGE_COUNT;
  }
  
  return PREMIUM_PAGE_EXTENSIONS[gradeLevel];
}

// Enhanced template selection with anti-repetition
export function selectTemplate(
  gradeLevel: GradeLevel,
  usedTemplates: number[] = [],
  preferredIndex?: number
): { templateIndex: number; template: string[] } {
  const totalTemplates = getTemplateCountByGradeLevel(gradeLevel);
  
  // If preferred index is valid and not recently used, use it
  if (
    preferredIndex !== undefined && 
    preferredIndex >= 0 && 
    preferredIndex < totalTemplates &&
    !usedTemplates.includes(preferredIndex)
  ) {
    return {
      templateIndex: preferredIndex,
      template: getTemplateByGradeLevel(gradeLevel, preferredIndex)
    };
  }
  
  // Find unused templates
  const availableTemplates = Array.from({ length: totalTemplates }, (_, i) => i)
    .filter(i => !usedTemplates.includes(i));
  
  // If all templates have been used, reset (start over)
  if (availableTemplates.length === 0) {
    const randomIndex = Math.floor(Math.random() * totalTemplates);
    return {
      templateIndex: randomIndex,
      template: getTemplateByGradeLevel(gradeLevel, randomIndex)
    };
  }
  
  // Select random from available templates
  const selectedIndex = availableTemplates[
    Math.floor(Math.random() * availableTemplates.length)
  ];
  
  return {
    templateIndex: selectedIndex,
    template: getTemplateByGradeLevel(gradeLevel, selectedIndex)
  };
}

// Validate template exists
export function validateTemplateIndex(
  gradeLevel: GradeLevel, 
  templateIndex: number
): boolean {
  const totalTemplates = getTemplateCountByGradeLevel(gradeLevel);
  return templateIndex >= 0 && templateIndex < totalTemplates;
}

// Get template preview (first page only)
export function getTemplatePreview(
  gradeLevel: GradeLevel, 
  templateIndex: number
): string | null {
  if (!validateTemplateIndex(gradeLevel, templateIndex)) {
    return null;
  }
  
  const template = getTemplateByGradeLevel(gradeLevel, templateIndex);
  return template[0] || null;
}

// System status and health check
// Validate sentence for grammar and vocabulary (used by template system)
export function validateSentence(sentence: string, gradeLevel: GradeLevel, userName?: string): {
  isValid: boolean;
  invalidWords: string[];
  grammarErrors?: string[];
} {
  // Import the appropriate vocabulary validator based on grade level
  let vocabularyValidation: { isValid: boolean; invalidWords: string[]; grammarErrors?: string[] };
  
  switch (gradeLevel) {
    case 0: {
      const { validateLevel0Sentence } = require('./level0Vocabulary');
      vocabularyValidation = validateLevel0Sentence(sentence, userName);
      break;
    }
    case 1: {
      const { validateLevel1Sentence } = require('./level1Vocabulary');
      vocabularyValidation = validateLevel1Sentence(sentence, userName);
      break;
    }
    case 2: {
      const { validateLevel2Sentence } = require('./level2Vocabulary');
      vocabularyValidation = validateLevel2Sentence(sentence, userName);
      break;
    }
    case 3: {
      const { validateLevel3Sentence } = require('./level3Vocabulary');
      vocabularyValidation = validateLevel3Sentence(sentence, userName);
      break;
    }
    case 4: {
      const { validateLevel4Sentence } = require('./level4Vocabulary');
      vocabularyValidation = validateLevel4Sentence(sentence, userName);
      break;
    }
    default:
      vocabularyValidation = { isValid: true, invalidWords: [] };
  }
  
  // Add grammar validation using the GrammarValidator
  const grammarValidation = GrammarValidator.validateStoryText(sentence);
  
  return {
    isValid: vocabularyValidation.isValid && grammarValidation.isValid,
    invalidWords: vocabularyValidation.invalidWords,
    grammarErrors: grammarValidation.errors
  };
}

export function getSystemStatus() {
  const analytics = getUnifiedTemplateSystemAnalytics();
  
  return {
    isHealthy: analytics.totalTemplates === 200, // Should have exactly 200 templates
    totalTemplates: analytics.totalTemplates,
    totalPages: analytics.totalPages,
    expectedTemplates: 200,
    expectedPages: 1000,
    gradeLevelStatus: Object.entries(analytics.byGradeLevel).map(([grade, data]) => ({
      gradeLevel: parseInt(grade) as GradeLevel,
      ...data,
      isComplete: data.templateCount === 40
    }))
  };
}