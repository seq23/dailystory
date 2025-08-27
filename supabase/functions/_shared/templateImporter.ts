/**
 * Dynamic Template Importer
 * Handles dynamic imports from frontend template files
 */

import { convertStoryTemplateToStringArray } from './templateConverter.ts';
import { UserInfo } from './placeholderResolver.ts';

interface StoryTemplate {
  title: string;
  theme: string;
  level: string;
  scenes: any[];
  endings: any[];
  reuse: any;
}

interface TemplateModule {
  LEVEL_1_TEMPLATES?: StoryTemplate[];
  LEVEL_2_TEMPLATES?: StoryTemplate[];
  LEVEL_3_FALLBACK_TEMPLATES?: StoryTemplate[];
  LEVEL_4_TEMPLATES?: StoryTemplate[];
  GRADE_6_FALLBACK_TEMPLATES?: StoryTemplate[];
  GRADE_7_FALLBACK_TEMPLATES?: StoryTemplate[];
  GRADE_8_FALLBACK_TEMPLATES?: StoryTemplate[];
  GRADE_9_FALLBACK_TEMPLATES?: StoryTemplate[];
  GRADE_10_FALLBACK_TEMPLATES?: StoryTemplate[];
  getLevel1Template?: (index?: number) => StoryTemplate;
  getLevel1TemplateCount?: () => number;
  getLevel2Template?: (index?: number) => StoryTemplate;
  getLevel2TemplateCount?: () => number;
  getLevel3FallbackTemplate?: (index?: number) => StoryTemplate;
  getLevel3FallbackTemplateCount?: () => number;
  getLevel4Template?: (index?: number) => StoryTemplate;
  getLevel4TemplateCount?: () => number;
  getGrade6FallbackTemplate?: (index?: number) => StoryTemplate;
  getGrade6FallbackTemplateCount?: () => number;
  getGrade7FallbackTemplate?: (index?: number) => StoryTemplate;
  getGrade7FallbackTemplateCount?: () => number;
  getGrade8FallbackTemplate?: (index?: number) => StoryTemplate;
  getGrade8FallbackTemplateCount?: () => number;
  getGrade9FallbackTemplate?: (index?: number) => StoryTemplate;
  getGrade9FallbackTemplateCount?: () => number;
  getGrade10FallbackTemplate?: (index?: number) => StoryTemplate;
  getGrade10FallbackTemplateCount?: () => number;
}

import { TemplateLibraryService } from './TemplateLibraryService.js';

// Map template levels to their TemplateLibraryService methods
const TEMPLATE_MAP = {
  level1: {
    getterName: 'getLevel1Template',
    countName: 'getLevel1TemplateCount'
  },
  level2: {
    getterName: 'getLevel2Template', 
    countName: 'getLevel2TemplateCount'
  },
  level3: {
    getterName: 'getLevel3Template',
    countName: 'getLevel3TemplateCount'
  },
  level4: {
    getterName: 'getLevel4Template',
    countName: 'getLevel4TemplateCount'
  },
  grade6: {
    getterName: 'getGrade6FallbackTemplate',
    countName: 'getGrade6FallbackTemplateCount'
  },
  grade7: {
    getterName: 'getGrade7FallbackTemplate',
    countName: 'getGrade7FallbackTemplateCount'
  },
  grade8: {
    getterName: 'getGrade8FallbackTemplate',
    countName: 'getGrade8FallbackTemplateCount'
  },
  grade9: {
    getterName: 'getGrade9FallbackTemplate',
    countName: 'getGrade9FallbackTemplateCount'
  },
  grade10: {
    getterName: 'getGrade10FallbackTemplate',
    countName: 'getGrade10FallbackTemplateCount'
  }
};

/**
 * Get template count for a given level (for exploration mode)
 */
export async function getTemplateCount(level: string): Promise<number> {
  try {
    const config = TEMPLATE_MAP[level as keyof typeof TEMPLATE_MAP];
    if (!config) return 0;
    
    // Use TemplateLibraryService to get count
    const countFn = TemplateLibraryService[config.countName as keyof typeof TemplateLibraryService];
    if (typeof countFn === 'function') {
      return (countFn as () => number)();
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error getting template count for ${level}:`, error);
    return 0;
  }
}

/**
 * Get and convert a template to string array
 */
export async function getTemplate(
  level: string, 
  templateIndex?: number, 
  userInfo: UserInfo = {}, 
  pageCount: number = 5,
  mode: string = 'testing'
): Promise<string[] | null> {
  try {
    console.log(`📚 Getting template for ${level}, index: ${templateIndex}`);
    
    const config = TEMPLATE_MAP[level as keyof typeof TEMPLATE_MAP];
    if (!config) {
      throw new Error(`No template configuration for level: ${level}`);
    }
    
    let storyTemplate: StoryTemplate | null = null;
    
    // Use TemplateLibraryService to get template
    const getterFn = TemplateLibraryService[config.getterName as keyof typeof TemplateLibraryService];
    if (typeof getterFn === 'function') {
      storyTemplate = (getterFn as (index?: number) => StoryTemplate).call(TemplateLibraryService, templateIndex);
    }
    
    if (!storyTemplate) {
      console.log(`❌ No template found for ${level} at index ${templateIndex}`);
      return null;
    }
    
    console.log(`✅ Found template: "${storyTemplate.title}"`);
    
    // Convert to string array with mode support (Phase 5)
    const pages = convertStoryTemplateToStringArray(storyTemplate, userInfo, pageCount, mode);
    
    console.log(`📖 Converted to ${pages.length} pages`);
    return pages;
    
  } catch (error) {
    console.error(`❌ Error getting template for ${level}:`, error);
    throw error;
  }
}