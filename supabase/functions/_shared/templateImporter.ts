/**
 * Dynamic Template Importer
 * Handles dynamic imports from frontend template files
 */

import { convertStoryTemplateToStringArray } from './templateConverter.ts';

interface UserInfo {
  name?: string;
  avatar?: any;
  favoriteColor?: string;
  favoriteAnimal?: string;
  favoriteFood?: string;
  hobbies?: string;
  specialRequest?: string;
  difficultyLevel?: string;
}

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
  getLevel3Template?: (index?: number) => StoryTemplate;
  getLevel3TemplateCount?: () => number;
  getLevel4Template?: (index?: number) => StoryTemplate;
  getLevel4TemplateCount?: () => number;
  getGrade6Template?: (index?: number) => StoryTemplate;
  getGrade6TemplateCount?: () => number;
  getGrade7Template?: (index?: number) => StoryTemplate;
  getGrade7TemplateCount?: () => number;
  getGrade8Template?: (index?: number) => StoryTemplate;
  getGrade8TemplateCount?: () => number;
  getGrade9Template?: (index?: number) => StoryTemplate;
  getGrade9TemplateCount?: () => number;
  getGrade10Template?: (index?: number) => StoryTemplate;
  getGrade10TemplateCount?: () => number;
}

// Map template levels to their frontend file paths and export names
const TEMPLATE_MAP = {
  level1: {
    path: '../../src/constants/newFallbackTemplates/level1Templates.ts',
    arrayName: 'LEVEL_1_TEMPLATES',
    getterName: 'getLevel1Template',
    countName: 'getLevel1TemplateCount'
  },
  level2: {
    path: '../../src/constants/newFallbackTemplates/level2Templates.ts',
    arrayName: 'LEVEL_2_TEMPLATES',
    getterName: 'getLevel2Template',
    countName: 'getLevel2TemplateCount'
  },
  level3: {
    path: '../../src/constants/newFallbackTemplates/level3Templates.ts',
    arrayName: 'LEVEL_3_FALLBACK_TEMPLATES',
    getterName: 'getLevel3Template', 
    countName: 'getLevel3TemplateCount'
  },
  level4: {
    path: '../../src/constants/newFallbackTemplates/level4Templates.ts',
    arrayName: 'LEVEL_4_TEMPLATES',
    getterName: 'getLevel4Template',
    countName: 'getLevel4TemplateCount'
  },
  grade6: {
    path: '../../src/constants/newFallbackTemplates/grade6Templates.ts',
    arrayName: 'GRADE_6_FALLBACK_TEMPLATES',
    getterName: 'getGrade6Template',
    countName: 'getGrade6TemplateCount'
  },
  grade7: {
    path: '../../src/constants/newFallbackTemplates/grade7Templates.ts',
    arrayName: 'GRADE_7_FALLBACK_TEMPLATES',
    getterName: 'getGrade7Template',
    countName: 'getGrade7TemplateCount'
  },
  grade8: {
    path: '../../src/constants/newFallbackTemplates/grade8Templates.ts',
    arrayName: 'GRADE_8_FALLBACK_TEMPLATES',
    getterName: 'getGrade8Template',
    countName: 'getGrade8TemplateCount'
  },
  grade9: {
    path: '../../src/constants/newFallbackTemplates/grade9Templates.ts',
    arrayName: 'GRADE_9_FALLBACK_TEMPLATES',
    getterName: 'getGrade9Template',
    countName: 'getGrade9TemplateCount'
  },
  grade10: {
    path: '../../src/constants/newFallbackTemplates/grade10Templates.ts',
    arrayName: 'GRADE_10_FALLBACK_TEMPLATES',
    getterName: 'getGrade10Template',
    countName: 'getGrade10TemplateCount'
  }
};

/**
 * Dynamically import templates for a given level
 */
async function importTemplateModule(level: string): Promise<TemplateModule | null> {
  const config = TEMPLATE_MAP[level as keyof typeof TEMPLATE_MAP];
  if (!config) {
    console.log(`❌ No template configuration for level: ${level}`);
    return null;
  }

  try {
    console.log(`🔄 Importing templates from: ${config.path}`);
    const module = await import(config.path);
    
    if (!module[config.arrayName]) {
      console.log(`❌ Template array ${config.arrayName} not found in module`);
      return null;
    }
    
    console.log(`✅ Successfully imported ${config.arrayName} from ${config.path}`);
    return module;
  } catch (error) {
    console.error(`❌ Failed to import templates for ${level}:`, error);
    return null;
  }
}

/**
 * Get template count for a given level (for exploration mode)
 */
export async function getTemplateCount(level: string): Promise<number> {
  try {
    const module = await importTemplateModule(level);
    if (!module) return 0;
    
    const config = TEMPLATE_MAP[level as keyof typeof TEMPLATE_MAP];
    
    // Try count function first
    if (config.countName && module[config.countName as keyof TemplateModule]) {
      const countFn = module[config.countName as keyof TemplateModule] as () => number;
      return countFn();
    }
    
    // Fallback to array length
    const templateArray = module[config.arrayName as keyof TemplateModule] as StoryTemplate[];
    return templateArray?.length || 0;
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
  pageCount: number = 5
): Promise<string[] | null> {
  try {
    console.log(`📚 Getting template for ${level}, index: ${templateIndex}`);
    
    const module = await importTemplateModule(level);
    if (!module) {
      throw new Error(`Failed to load templates for ${level}`);
    }
    
    const config = TEMPLATE_MAP[level as keyof typeof TEMPLATE_MAP];
    let storyTemplate: StoryTemplate | null = null;
    
    // Try getter function first (e.g., getLevel1Template)
    if (config.getterName && module[config.getterName as keyof TemplateModule]) {
      const getterFn = module[config.getterName as keyof TemplateModule] as (index?: number) => StoryTemplate;
      storyTemplate = getterFn(templateIndex);
    } else {
      // Fallback to array access
      const templateArray = module[config.arrayName as keyof TemplateModule] as StoryTemplate[];
      if (templateArray && templateArray.length > 0) {
        if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templateArray.length) {
          storyTemplate = templateArray[templateIndex];
        } else {
          // Random selection
          const randomIndex = Math.floor(Math.random() * templateArray.length);
          storyTemplate = templateArray[randomIndex];
        }
      }
    }
    
    if (!storyTemplate) {
      console.log(`❌ No template found for ${level} at index ${templateIndex}`);
      return null;
    }
    
    console.log(`✅ Found template: "${storyTemplate.title}"`);
    
    // Convert to string array
    const pages = convertStoryTemplateToStringArray(storyTemplate, userInfo, pageCount);
    
    console.log(`📖 Converted to ${pages.length} pages`);
    return pages;
    
  } catch (error) {
    console.error(`❌ Error getting template for ${level}:`, error);
    throw error;
  }
}