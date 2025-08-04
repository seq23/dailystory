// Level 0 Story Processor - Dedicated processor for Level 0 stories
// Bypasses UserInputDistributor to ensure vocabulary compliance

import { LEVEL_0_TEMPLATES, getLevel0Template } from '@/constants/level0Templates';
import { validateLevel0Sentence } from '@/constants/level0Vocabulary';
import { SessionTemplateManager } from '@/services/sessionTemplateManager';
import type { UserInfo } from '@/types';

export interface Level0StoryResult {
  content: string[];
  templateIndex: number;
  isValid: boolean;
  validationErrors: string[];
  isRepeating: boolean;
}

export class Level0StoryProcessor {
  /**
   * Generate a Level 0 story using template rotation and strict validation
   */
  static generateStory(userInfo?: UserInfo): Level0StoryResult {
    console.log('🎯 Level0StoryProcessor: Generating new Level 0 story...');
    
    // Convert LEVEL_0_TEMPLATES (array of arrays) to template keys for SessionTemplateManager
    const templateKeys = LEVEL_0_TEMPLATES.map((_, index) => `template_${index}`);
    
    // Get next template using intelligent rotation
    const { template: templateKey, isRepeating, templateIndex } = SessionTemplateManager.getNextTemplate(
      templateKeys,
      'beginner'
    );
    
    // Get the actual template content
    const template = LEVEL_0_TEMPLATES[templateIndex];
    
    console.log(`📖 Level0StoryProcessor: Selected template ${templateIndex + 1}/${LEVEL_0_TEMPLATES.length}`, {
      isRepeating,
      template: template.slice(0, 50) + '...'
    });
    
    // Split template into pages
    const pages = Array.isArray(template) ? template : [template];
    
    // Validate each page against Level 0 vocabulary
    const validationErrors: string[] = [];
    let isValid = true;
    
    const processedPages = pages.map((page, index) => {
      // Simple name substitution without complex processing
      let processedPage = page;
      
      // Only substitute user's name if provided and keep it simple
      if (userInfo?.name) {
        // Simple patterns that maintain Level 0 vocabulary
        processedPage = processedPage.replace(/\bI\b/g, userInfo.name);
        processedPage = processedPage.replace(/\bme\b/g, userInfo.name);
      }
      
      // Validate the processed page
      const validation = validateLevel0Sentence(processedPage, userInfo?.name);
      
      if (!validation.isValid) {
        console.warn(`⚠️ Level0StoryProcessor: Page ${index + 1} validation failed:`, {
          page: processedPage,
          invalidWords: validation.invalidWords
        });
        
        validationErrors.push(`Page ${index + 1}: Invalid words: ${validation.invalidWords.join(', ')}`);
        isValid = false;
        
        // Fallback to original template without name substitution
        processedPage = page;
      }
      
      return processedPage;
    });
    
    if (!isValid) {
      console.error('❌ Level0StoryProcessor: Story validation failed, using original template');
    } else {
      console.log('✅ Level0StoryProcessor: Story validation passed');
    }
    
    return {
      content: processedPages,
      templateIndex,
      isValid,
      validationErrors,
      isRepeating
    };
  }
  
  /**
   * Validate an entire story against Level 0 constraints
   */
  static validateStory(pages: string[], userName?: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    let isValid = true;
    
    pages.forEach((page, index) => {
      const validation = validateLevel0Sentence(page, userName);
      if (!validation.isValid) {
        errors.push(`Page ${index + 1}: ${validation.invalidWords.join(', ')}`);
        isValid = false;
      }
    });
    
    return { isValid, errors };
  }
  
  /**
   * Get statistics about Level 0 template usage
   */
  static getTemplateStats(): {
    totalTemplates: number;
    totalPages: number;
    estimatedReadingTime: number;
    templatesUsed: number;
    isRepeating: boolean;
  } {
    const totalTemplates = LEVEL_0_TEMPLATES.length;
    const totalPages = LEVEL_0_TEMPLATES.reduce((sum, template) => sum + template.length, 0);
    const estimatedReadingTime = totalPages * 12; // 12 seconds per page average
    
    const sessionStats = SessionTemplateManager.getSessionStats();
    
    return {
      totalTemplates,
      totalPages,
      estimatedReadingTime,
      templatesUsed: sessionStats.templatesUsed,
      isRepeating: sessionStats.isRepeating
    };
  }
  
  /**
   * Reset session template rotation
   */
  static resetSession(): void {
    SessionTemplateManager.clearSession();
    console.log('🔄 Level0StoryProcessor: Session reset - template rotation restarted');
  }
}
