// Level 0 Story Processor - Dedicated processor for Level 0 stories
// Bypasses UserInputDistributor to ensure vocabulary compliance

import { LEVEL_0_COMPLIANT_TEMPLATES, getLevel0CompliantTemplate } from '@/constants/level0TemplatesCompliant';
import { LEVEL_0_STRICT_DOLCH_TEMPLATES, getLevel0StrictDolchTemplate, getLevel0StrictDolchTemplateCount } from '@/constants/level0TemplatesFixed';
import { LEVEL_0_PREMIUM_TEMPLATES, getLevel0PremiumTemplate, getLevel0PremiumTemplateCount } from '@/constants/level0TemplatesPremium';
import { validateLevel0SentenceByUserType, type UserType } from '@/constants/dolchPrePrimer';
import { SessionTemplateManager } from '@/services/sessionTemplateManager';
import { SubscriptionManager } from '@/services/subscriptionManager';
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
  static async generateStory(userInfo?: UserInfo): Promise<Level0StoryResult> {
    console.log('🎯 Level0StoryProcessor: Generating new Level 0 story...');
    
    // Check user subscription status to determine vocabulary tier
    const isPremium = await SubscriptionManager.isPremiumUser();
    const userType: UserType = isPremium ? 'premium' : 'free';
    
    console.log(`👤 Level0StoryProcessor: User type: ${userType} (vocabulary: ${userType === 'premium' ? '75+ words' : '40 words'})`);
    
    // Use appropriate templates based on user type
    const templates = userType === 'free' 
      ? LEVEL_0_STRICT_DOLCH_TEMPLATES 
      : LEVEL_0_PREMIUM_TEMPLATES;
    
    console.log(`📚 Level0StoryProcessor: Using ${userType === 'free' ? 'strict Dolch' : 'premium enhanced'} templates (${templates.length} available)`);
    
    // Convert templates to template keys for SessionTemplateManager
    const templateKeys = templates.map((_, index) => `template_${index}`);
    
    // Get next template using intelligent rotation
    const { template: templateKey, isRepeating, templateIndex } = SessionTemplateManager.getNextTemplate(
      templateKeys,
      'beginner'
    );
    
    // Get the actual template content
    const template = templates[templateIndex];
    
    console.log(`📖 Level0StoryProcessor: Selected template ${templateIndex + 1}/${templates.length}`, {
      userType,
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
      
      // Validate the processed page with subscription-aware vocabulary
      const validation = validateLevel0SentenceByUserType(processedPage, userType, userInfo?.name);
      
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
  static async validateStory(pages: string[], userName?: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    let isValid = true;
    
    // Check user subscription status for appropriate vocabulary validation
    const isPremium = await SubscriptionManager.isPremiumUser();
    const userType: UserType = isPremium ? 'premium' : 'free';
    
    pages.forEach((page, index) => {
      const validation = validateLevel0SentenceByUserType(page, userType, userName);
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
  static async getTemplateStats(): Promise<{
    totalTemplates: number;
    totalPages: number;
    estimatedReadingTime: number;
    templatesUsed: number;
    isRepeating: boolean;
  }> {
    // Get current user type to show correct statistics
    const isPremium = await SubscriptionManager.isPremiumUser();
    const userType: UserType = isPremium ? 'premium' : 'free';
    
    const templates = userType === 'free' 
      ? LEVEL_0_STRICT_DOLCH_TEMPLATES 
      : LEVEL_0_PREMIUM_TEMPLATES;
    
    const totalTemplates = templates.length;
    const totalPages = templates.reduce((sum, template) => sum + template.length, 0);
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
