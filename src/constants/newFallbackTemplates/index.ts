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

// Grade-based Templates (Grades 6-10) - DEPRECATED
export * from './grade6Templates'; // ❌ DEPRECATED - Use backend service
export * from './grade7Templates'; // ❌ DEPRECATED - Use backend service
export * from './grade8Templates'; // ❌ DEPRECATED - Use backend service
export * from './grade9Templates'; // ❌ DEPRECATED - Use backend service
export * from './grade10Templates'; // ❌ DEPRECATED - Use backend service

import { StoryTemplate, PersonalizationPlaceholders, DEFAULT_PLACEHOLDERS } from '../storyTemplateTypes';
import { 
  LEVEL_1_TEMPLATES,
  getLevel1Template,
  getLevel1TemplateCount
} from './level1Templates';
import { 
  LEVEL_2_TEMPLATES,
  getLevel2Template,  
  getLevel2TemplateCount
} from './level2Templates';
import { 
  LEVEL_3_FALLBACK_TEMPLATES,
  getLevel3Template, // FIXED: Remove "Fallback" suffix for consistency
  getLevel3TemplateCount
} from './level3Templates';
import { 
  LEVEL_4_TEMPLATES,
  getLevel4Template,
  getLevel4TemplateCount
} from './level4Templates';
import {
  GRADE_6_FALLBACK_TEMPLATES,
  getGrade6Template, // FIXED: Remove "Fallback" suffix for consistency
  getGrade6TemplateCount
} from './grade6Templates';
import {
  GRADE_7_FALLBACK_TEMPLATES,
  getGrade7Template, // FIXED: Remove "Fallback" suffix for consistency  
  getGrade7TemplateCount
} from './grade7Templates';
import {
  GRADE_8_FALLBACK_TEMPLATES,
  getGrade8Template, // FIXED: Remove "Fallback" suffix for consistency
  getGrade8TemplateCount
} from './grade8Templates';
import {
  GRADE_9_FALLBACK_TEMPLATES,
  getGrade9Template, // FIXED: Remove "Fallback" suffix for consistency
  getGrade9TemplateCount
} from './grade9Templates';
import {
  GRADE_10_FALLBACK_TEMPLATES,
  getGrade10Template, // FIXED: Remove "Fallback" suffix for consistency
  getGrade10TemplateCount
} from './grade10Templates';

export type FallbackLevel = 'level1' | 'level2' | 'level3' | 'level4' | 'grade6' | 'grade7' | 'grade8' | 'grade9' | 'grade10';

/**
 * Complete Fallback Template Collections
 */
export const ALL_FALLBACK_TEMPLATES: Record<FallbackLevel, StoryTemplate[]> = {
  level1: LEVEL_1_TEMPLATES,
  level2: LEVEL_2_TEMPLATES, 
  level3: LEVEL_3_FALLBACK_TEMPLATES,
  level4: LEVEL_4_TEMPLATES,
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
      return getLevel1Template(templateIndex);
    case 'level2':
      return getLevel2Template(templateIndex);
    case 'level3':
      return getLevel3Template(templateIndex); // FIXED: Remove "Fallback" suffix
    case 'level4':
      return getLevel4Template(templateIndex);
    case 'grade6':
      return getGrade6Template(templateIndex); // FIXED: Remove "Fallback" suffix
    case 'grade7':
      return getGrade7Template(templateIndex); // FIXED: Remove "Fallback" suffix
    case 'grade8':
      return getGrade8Template(templateIndex); // FIXED: Remove "Fallback" suffix
    case 'grade9':
      return getGrade9Template(templateIndex); // FIXED: Remove "Fallback" suffix
    case 'grade10':
      return getGrade10Template(templateIndex); // FIXED: Remove "Fallback" suffix
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
      return getLevel1TemplateCount();
    case 'level2':
      return getLevel2TemplateCount();
    case 'level3':
      return getLevel3TemplateCount(); // FIXED: Remove "Fallback" suffix
    case 'level4':
      return getLevel4TemplateCount();
    case 'grade6':
      return getGrade6TemplateCount(); // FIXED: Remove "Fallback" suffix
    case 'grade7':
      return getGrade7TemplateCount(); // FIXED: Remove "Fallback" suffix
    case 'grade8':
      return getGrade8TemplateCount(); // FIXED: Remove "Fallback" suffix
    case 'grade9':
      return getGrade9TemplateCount(); // FIXED: Remove "Fallback" suffix
    case 'grade10':
      return getGrade10TemplateCount(); // FIXED: Remove "Fallback" suffix
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
  LEVEL_1_TEMPLATES.forEach(template => totalPages += template.scenes.length);
  LEVEL_2_TEMPLATES.forEach(template => totalPages += template.scenes.length);
  LEVEL_3_FALLBACK_TEMPLATES.forEach(template => totalPages += template.scenes.length);
  LEVEL_4_TEMPLATES.forEach(template => totalPages += template.scenes.length);
  
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