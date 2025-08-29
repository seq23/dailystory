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

// Import new dynamic template loader
import { loadTemplate, getDynamicTemplateCount } from './dynamicTemplateLoader.js';

/**
 * Get template count for a given level (for exploration mode)
 * Now uses dynamic template system for all levels including Level 0
 */
export async function getTemplateCount(level: string): Promise<number> {
  try {
    console.log(`📊 Getting template count for ${level}`);
    
    // Use new dynamic template system for all levels
    const count = await getDynamicTemplateCount(level);
    console.log(`✅ Found ${count} templates for ${level}`);
    
    return count;
  } catch (error) {
    console.error(`❌ Error getting template count for ${level}:`, error);
    return 0;
  }
}

/**
 * Get raw template without processing (for exploration mode)
 * Returns the original template structure with scenes/endings intact
 */
export async function getRawTemplate(
  level: string, 
  templateIndex?: number
): Promise<any> {
  try {
    console.log(`📚 Getting raw template for ${level}, index: ${templateIndex}`);
    
    // Use dynamic template loader to get the raw template
    const rawTemplate = await loadTemplate(level, templateIndex);
    
    if (!rawTemplate) {
      console.log(`❌ No raw template found for ${level} at index ${templateIndex}`);
      return null;
    }
    
    console.log(`✅ Found raw template for ${level}`);
    return rawTemplate;
    
  } catch (error) {
    console.error(`❌ Error getting raw template for ${level}:`, error);
    throw error;
  }
}

/**
 * Get and convert a template to string array
 * Now uses dynamic template system for all levels including Level 0
 */
export async function getTemplate(
  level: string, 
  templateIndex?: number, 
  userInfo: UserInfo = {}, 
  pageCount: number = 5,
  mode: string = 'testing'
): Promise<string[] | { pages: string[], testingData?: any } | null> {
  try {
    console.log(`📚 Getting template for ${level}, index: ${templateIndex}`);
    
    // Use new dynamic template loader for all levels
    const storyTemplate = await loadTemplate(level, templateIndex);
    
    if (!storyTemplate) {
      console.log(`❌ No template found for ${level} at index ${templateIndex}`);
      return null;
    }
    
    // Handle Level 0 templates (arrays of strings) vs structured templates
    if (Array.isArray(storyTemplate)) {
      console.log(`✅ Found Level 0 template with ${storyTemplate.length} pages`);
      // Level 0 templates are already string arrays - return as-is (limited to pageCount)
      const level0Pages = storyTemplate.slice(0, Math.min(pageCount, storyTemplate.length));
      
      // For Level 0 templates, return enhanced structure in testing mode
      if (mode === 'testing') {
        return {
          pages: level0Pages,
          testingData: {
            templateStructure: {
              title: `Level 0 Template ${(templateIndex || 0) + 1}`,
              theme: "Basic Learning",
              level: "level0",
              totalScenes: level0Pages.length,
              totalEndings: 1
            },
            sceneDetails: level0Pages.map((page, index) => ({
              index: index + 1,
              mainText: page,
              alternatives: [],
              optionalDetails: [],
              hook: "",
              pause: false
            })),
            endingDetails: [{
              index: 1,
              type: "simple",
              mainText: level0Pages[level0Pages.length - 1] || "",
              variants: []
            }],
            reusableElements: {
              swappableElements: {},
              weatherVariants: [],
              settingVariants: [],
            }
          }
        };
      }
      
      return level0Pages;
    } else {
      console.log(`✅ Found structured template: "${storyTemplate.title}"`);
      
      // Convert structured template to string array with mode support
      const result = convertStoryTemplateToStringArray(storyTemplate, userInfo, pageCount, mode);
      
      // Handle both return types from convertStoryTemplateToStringArray
      if (typeof result === 'object' && 'pages' in result) {
        if (mode === 'testing') {
          console.log(`📖 Converted to ${result.pages.length} pages with testing data`);
        }
        return result;
      } else {
        if (mode === 'testing') {
          console.log(`📖 Converted to ${result.length} pages`);
        }
        return result;
      }
    }
    
  } catch (error) {
    console.error(`❌ Error getting template for ${level}:`, error);
    throw error;
  }
}