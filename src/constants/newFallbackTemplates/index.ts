/**
 * Complete Fallback Story Template Library Index
 * Exports all template collections for the new modular story system
 */

// Template Types
export * from '../storyTemplateTypes';

// Level-based Templates (Ages 5-13)
export * from './level1Templates';
export * from './level2Templates'; 
export * from './level3Templates';
export * from './level4Templates';

// Grade-based Templates (Grades 6-10)
export * from './grade6Templates';
export * from './grade7Templates';
export * from './grade8Templates';
export * from './grade9Templates';
export * from './grade10Templates';

import { StoryTemplate, PersonalizationPlaceholders, DEFAULT_PLACEHOLDERS } from '../storyTemplateTypes';
import { 
  LEVEL_1_FALLBACK_TEMPLATES,
  getLevel1FallbackTemplate,
  getLevel1FallbackTemplateCount
} from './level1Templates';
import { 
  LEVEL_2_FALLBACK_TEMPLATES,
  getLevel2FallbackTemplate,
  getLevel2FallbackTemplateCount
} from './level2Templates';
import { 
  LEVEL_3_FALLBACK_TEMPLATES,
  getLevel3FallbackTemplate,
  getLevel3FallbackTemplateCount
} from './level3Templates';
import { 
  LEVEL_4_FALLBACK_TEMPLATES,
  getLevel4FallbackTemplate,
  getLevel4FallbackTemplateCount
} from './level4Templates';
import {
  GRADE_6_FALLBACK_TEMPLATES,
  getGrade6FallbackTemplate,
  getGrade6FallbackTemplateCount
} from './grade6Templates';
import {
  GRADE_7_FALLBACK_TEMPLATES,
  getGrade7FallbackTemplate,
  getGrade7FallbackTemplateCount
} from './grade7Templates';
import {
  GRADE_8_FALLBACK_TEMPLATES,
  getGrade8FallbackTemplate,
  getGrade8FallbackTemplateCount
} from './grade8Templates';
import {
  GRADE_9_FALLBACK_TEMPLATES,
  getGrade9FallbackTemplate,
  getGrade9FallbackTemplateCount
} from './grade9Templates';
import {
  GRADE_10_FALLBACK_TEMPLATES,
  getGrade10FallbackTemplate,
  getGrade10FallbackTemplateCount
} from './grade10Templates';

export type FallbackLevel = 'level1' | 'level2' | 'level3' | 'level4' | 'grade6' | 'grade7' | 'grade8' | 'grade9' | 'grade10';

/**
 * Complete Fallback Template Collections
 */
export const ALL_FALLBACK_TEMPLATES: Record<FallbackLevel, StoryTemplate[]> = {
  level1: LEVEL_1_FALLBACK_TEMPLATES,
  level2: LEVEL_2_FALLBACK_TEMPLATES,
  level3: LEVEL_3_FALLBACK_TEMPLATES,
  level4: LEVEL_4_FALLBACK_TEMPLATES,
  grade6: GRADE_6_FALLBACK_TEMPLATES,
  grade7: GRADE_7_FALLBACK_TEMPLATES,
  grade8: GRADE_8_FALLBACK_TEMPLATES,
  grade9: GRADE_9_FALLBACK_TEMPLATES,
  grade10: GRADE_10_FALLBACK_TEMPLATES
};

/**
 * Get a random template for the specified level
 */
export function getFallbackTemplate(level: FallbackLevel, templateIndex?: number): StoryTemplate | null {
  switch (level) {
    case 'level1':
      return getLevel1FallbackTemplate(templateIndex);
    case 'level2':
      return getLevel2FallbackTemplate(templateIndex);
    case 'level3':
      return getLevel3FallbackTemplate(templateIndex);
    case 'level4':
      return getLevel4FallbackTemplate(templateIndex);
    case 'grade6':
      return getGrade6FallbackTemplate(templateIndex);
    case 'grade7':
      return getGrade7FallbackTemplate(templateIndex);
    case 'grade8':
      return getGrade8FallbackTemplate(templateIndex);
    case 'grade9':
      return getGrade9FallbackTemplate(templateIndex);
    case 'grade10':
      return getGrade10FallbackTemplate(templateIndex);
    default:
      return null;
  }
}

/**
 * Get the count of available templates for a level
 */
export function getFallbackTemplateCount(level: FallbackLevel): number {
  switch (level) {
    case 'level1':
      return getLevel1FallbackTemplateCount();
    case 'level2':
      return getLevel2FallbackTemplateCount();
    case 'level3':
      return getLevel3FallbackTemplateCount();
    case 'level4':
      return getLevel4FallbackTemplateCount();
    case 'grade6':
      return getGrade6FallbackTemplateCount();
    case 'grade7':
      return getGrade7FallbackTemplateCount();
    case 'grade8':
      return getGrade8FallbackTemplateCount();
    case 'grade9':
      return getGrade9FallbackTemplateCount();
    case 'grade10':
      return getGrade10FallbackTemplateCount();
    default:
      return 0;
  }
}

/**
 * Resolve all placeholders in a text string using user info
 */
export function resolveStoryPlaceholders(
  text: string, 
  userInfo: Partial<PersonalizationPlaceholders>
): string {
  const placeholders = { ...DEFAULT_PLACEHOLDERS, ...userInfo };
  
  let resolvedText = text;
  
  // Replace each placeholder with actual values
  Object.entries(placeholders).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    resolvedText = resolvedText.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return resolvedText;
}

/**
 * Convert a StoryTemplate to a simple string array (for backward compatibility)
 */
export function templateToStringArray(template: StoryTemplate): string[] {
  return template.scenes.map(scene => scene.text);
}

/**
 * Get a random ending for any template
 */
export function getRandomEnding(template: StoryTemplate, type?: 'cozy' | 'silly' | 'triumphant' | 'reflective'): string {
  if (type) {
    const ending = template.endings.find(e => e.type === type);
    return ending?.text || template.endings[0].text;
  }
  
  const randomIndex = Math.floor(Math.random() * template.endings.length);
  return template.endings[randomIndex].text;
}

/**
 * Get total page count across all implemented templates
 */
export function getTotalFallbackPages(): number {
  let totalPages = 0;
  
  // Level templates (each scene = 1 page)
  LEVEL_1_FALLBACK_TEMPLATES.forEach(template => totalPages += template.scenes.length);
  LEVEL_2_FALLBACK_TEMPLATES.forEach(template => totalPages += template.scenes.length);
  LEVEL_3_FALLBACK_TEMPLATES.forEach(template => totalPages += template.scenes.length);
  LEVEL_4_FALLBACK_TEMPLATES.forEach(template => totalPages += template.scenes.length);
  
  // Grade templates (designed as chapters, count as multiple pages)
  GRADE_6_FALLBACK_TEMPLATES.forEach(template => totalPages += 12); // ~12 pages per grade 6 template
  GRADE_7_FALLBACK_TEMPLATES.forEach(template => totalPages += 13); // ~13 pages per grade 7 template
  GRADE_8_FALLBACK_TEMPLATES.forEach(template => totalPages += 14); // ~14 pages per grade 8 template
  GRADE_9_FALLBACK_TEMPLATES.forEach(template => totalPages += 15); // ~15 pages per grade 9 template
  GRADE_10_FALLBACK_TEMPLATES.forEach(template => totalPages += 16); // ~16 pages per grade 10 template
  
  return totalPages;
}

/**
 * Library Statistics
 */
export const FALLBACK_LIBRARY_STATS = {
  get totalTemplates(): number {
    return Object.values(ALL_FALLBACK_TEMPLATES)
      .reduce((total, templates) => total + templates.length, 0);
  },
  
  get totalPages(): number {
    return getTotalFallbackPages();
  },
  
  get implementedLevels(): FallbackLevel[] {
    return Object.keys(ALL_FALLBACK_TEMPLATES).filter(
      level => ALL_FALLBACK_TEMPLATES[level as FallbackLevel].length > 0
    ) as FallbackLevel[];
  },
  
  get pendingLevels(): FallbackLevel[] {
    return Object.keys(ALL_FALLBACK_TEMPLATES).filter(
      level => ALL_FALLBACK_TEMPLATES[level as FallbackLevel].length === 0
    ) as FallbackLevel[];
  }
};