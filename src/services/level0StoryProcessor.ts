// Level 0 Story Processor - Dedicated processor for Level 0 stories
// Uses hierarchical template system with minimal processing

import { LEVEL_0_FREE_TEMPLATES, getLevel0FreeTemplate, getLevel0FreeTemplateCount } from '@/constants/level0TemplatesFree';
import { LEVEL_0_PREMIUM_TEMPLATES, getLevel0PremiumTemplate, getLevel0PremiumTemplateCount } from '@/constants/level0TemplatesPremium';
import { validateLevel0SentenceByUserType, type UserType } from '@/constants/dolchPrePrimer';
import { HierarchicalSessionTemplateManager } from '@/services/hierarchicalSessionTemplateManager';
import { EnhancedSubscriptionManager as SubscriptionManager } from '@/services/enhancedSubscriptionManager';
import { MultilingualTemplateManager } from '@/services/multilingualTemplateManager';
import { ErrorHandlingManager } from '@/services/errorHandlingManager';
import { Level0Simplifier } from '@/services/level0Simplifier';
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
   * Generate a Level 0 story using hierarchical template system with minimal processing
   */
  static async generateStory(userInfo?: UserInfo): Promise<Level0StoryResult> {
    console.log('🎯 Level0StoryProcessor: Generating new Level 0 story with hierarchical system...');
    
    return await ErrorHandlingManager.executeWithRecovery(
      async () => {
        // Check user subscription status to determine vocabulary tier
        const isPremium = await SubscriptionManager.isPremiumUser();
        const userType: UserType = isPremium ? 'premium' : 'free';
        
        // Get appropriate language for templates
        const templateLanguage = MultilingualTemplateManager.getTemplateLanguage(userInfo);
        
        console.log(`👤 Level0StoryProcessor: User type: ${userType} (vocabulary: ${userType === 'premium' ? '75+ words' : '40 words'}), language: ${templateLanguage}`);
        
        // Get next template using hierarchical system
        const selection = HierarchicalSessionTemplateManager.getNextTemplate('beginner', isPremium);
        
        return await this.processStorySelection(selection, userInfo, userType, isPremium);
      },
      {
        component: 'Level0StoryProcessor',
        action: 'generateStory',
        userInfo,
        language: userInfo?.storyLanguagePreference || userInfo?.nativeLanguage
      },
      async () => {
        // Emergency fallback
        const emergencyContent = ErrorHandlingManager.getEmergencyContent(userInfo);
        return {
          content: emergencyContent,
          templateIndex: -1,
          isValid: true,
          validationErrors: [],
          isRepeating: true
        };
      }
    ).then(result => {
      if (result.success && result.data) {
        return result.data;
      } else {
        console.warn('⚠️ Level0StoryProcessor: Using fallback content due to error:', result.error);
        return result.fallback || {
          content: ErrorHandlingManager.getEmergencyContent(userInfo),
          templateIndex: -1,
          isValid: true,
          validationErrors: [],
          isRepeating: true
        };
      }
    });
  }

  private static async processStorySelection(
    selection: any,
    userInfo?: UserInfo,
    userType: UserType = 'free',
    isPremium: boolean = false
  ): Promise<Level0StoryResult> {
    let processedPages: string[] = [];
    let templateIndex = selection.templateIndex;
    let isValid = true;
    let validationErrors: string[] = [];
    
    if (selection.phase === 'base') {
      console.log(`📚 Level0StoryProcessor: Using base template ${templateIndex + 1} (phase: ${selection.phase})`);
      
      // Minimal processing for base templates - they're already pre-validated
      const pages = Array.isArray(selection.template) ? selection.template : [selection.template];
      
      processedPages = pages.map((page, index) => {
        let processedPage = page;
        
        // Smart name substitution for Level 0 - only replace {userName} markers
        if (userInfo?.name) {
          processedPage = processedPage.replace(/\{userName\}/g, userInfo.name);
          // Keep "I" and "me" unchanged for personal connection
        }
        
        // Quick validation check (base templates should always pass)
        const validation = validateLevel0SentenceByUserType(processedPage, userType, userInfo?.name);
        if (!validation.isValid) {
          console.warn(`⚠️ Level0StoryProcessor: Base template validation failed unexpectedly on page ${index + 1}`);
          return page; // Fallback to original
        }
        
        return processedPage;
      });
      
    } else if (selection.phase === 'extension') {
      console.log(`📚 Level0StoryProcessor: Using extension template ${templateIndex + 1} (phase: ${selection.phase})`);
      
      // Extension templates get same minimal processing as base templates
      const pages = Array.isArray(selection.template) ? selection.template : [selection.template];
      
      processedPages = pages.map((page, index) => {
        let processedPage = page;
        
        if (userInfo?.name) {
          processedPage = processedPage.replace(/\{userName\}/g, userInfo.name);
          // Keep "I" and "me" unchanged for personal connection
        }
        
        return processedPage;
      });
      
    } else {
      // Fallback phase - use Level0Simplifier for quality content
      console.log(`🔄 Level0StoryProcessor: Generating fallback content (phase: ${selection.phase})`);
      
      try {
        const fallbackContent = await Level0Simplifier.generateSimplifiedStory(userInfo);
        processedPages = fallbackContent.pages;
        templateIndex = -1; // No template index for fallback
        
        // Record fallback usage
        HierarchicalSessionTemplateManager.recordFallbackUsed(`fallback_${Date.now()}`);
        
      } catch (error) {
        console.error('❌ Level0StoryProcessor: Fallback generation failed, using emergency content');
        
        // Emergency ultra-simple content with language support
        const templateLanguage = MultilingualTemplateManager.getTemplateLanguage(userInfo);
        processedPages = MultilingualTemplateManager.getLanguageFallback(templateLanguage, userInfo);
        templateIndex = -1;
      }
    }
    
    console.log(`✅ Level0StoryProcessor: Generated ${processedPages.length} pages using ${selection.phase} phase`);
    
    return {
      content: processedPages,
      templateIndex,
      isValid,
      validationErrors,
      isRepeating: selection.isRepeating
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
      ? LEVEL_0_FREE_TEMPLATES 
      : LEVEL_0_PREMIUM_TEMPLATES;
    
    const totalTemplates = templates.length;
    const totalPages = templates.reduce((sum, template) => sum + template.length, 0);
    const estimatedReadingTime = totalPages * 12; // 12 seconds per page average
    
    const sessionStats = HierarchicalSessionTemplateManager.getSessionStats();
    
    return {
      totalTemplates,
      totalPages,
      estimatedReadingTime,
      templatesUsed: sessionStats.baseTemplatesUsed + sessionStats.extensionTemplatesUsed + sessionStats.fallbacksUsed,
      isRepeating: sessionStats.currentPhase !== 'base' || sessionStats.baseTemplatesUsed > 0
    };
  }
  
  /**
   * Continue an existing Level 0 story using hierarchical template system
   * Respects current template exhaustion state and adds exactly 5 pages
   */
  static async continueStory(userInfo?: UserInfo, targetPages: number = 5): Promise<Level0StoryResult> {
    console.log('🔄 Level0StoryProcessor: Continuing Level 0 story with hierarchical system...');
    
    return await ErrorHandlingManager.executeWithRecovery(
      async () => {
        // Check user subscription status to determine vocabulary tier
        const isPremium = await SubscriptionManager.isPremiumUser();
        const userType: UserType = isPremium ? 'premium' : 'free';
        
        // Get appropriate language for templates
        const templateLanguage = MultilingualTemplateManager.getTemplateLanguage(userInfo);
        
        console.log(`👤 Level0StoryProcessor (Continuation): User type: ${userType}, language: ${templateLanguage}, target pages: ${targetPages}`);
        
        const continuationPages: string[] = [];
        
        // Generate exactly the requested number of pages
        for (let i = 0; i < targetPages; i++) {
          // Get next template from hierarchical system (respects current state)
          const selection = HierarchicalSessionTemplateManager.getNextTemplate('beginner', isPremium);
          
          if (selection.phase === 'fallback' || !selection.template || (Array.isArray(selection.template) && selection.template.length === 0)) {
            // Use fallback content generation
            try {
              const fallbackContent = await Level0Simplifier.generateSimplifiedStory(userInfo);
              if (fallbackContent.pages.length > 0) {
                continuationPages.push(fallbackContent.pages[0]);
              } else {
                const emergencyPage = userInfo?.name ? `${userInfo.name} continues the adventure.` : 'The story continues.';
                continuationPages.push(emergencyPage);
              }
            } catch (error) {
              const emergencyPage = userInfo?.name ? `${userInfo.name} continues the adventure.` : 'The story continues.';
              continuationPages.push(emergencyPage);
            }
          } else {
            // Process the template selection to get a single page
            const pageResult = await this.processStorySelection(selection, userInfo, userType, isPremium);
            
            // Add the first page from this template to continuation
            if (pageResult.content.length > 0) {
              continuationPages.push(pageResult.content[0]);
            } else {
              // Fallback if template processing fails
              const emergencyPage = userInfo?.name ? `${userInfo.name} continues the adventure.` : 'The story continues.';
              continuationPages.push(emergencyPage);
            }
          }
        }
        
        console.log(`✅ Level0StoryProcessor: Generated ${continuationPages.length} continuation pages using hierarchical system`);
        
        return {
          content: continuationPages,
          templateIndex: -1, // Not applicable for continuation
          isValid: true,
          validationErrors: [],
          isRepeating: false
        };
      },
      {
        component: 'Level0StoryProcessor',
        action: 'continueStory',
        userInfo,
        language: userInfo?.storyLanguagePreference || userInfo?.nativeLanguage
      },
      async () => {
        // Emergency fallback for continuation
        const emergencyContent = Array.from({ length: targetPages }, (_, i) => 
          userInfo?.name ? `${userInfo.name} sees something new.` : 'Something new happens.'
        );
        return {
          content: emergencyContent,
          templateIndex: -1,
          isValid: true,
          validationErrors: [],
          isRepeating: true
        };
      }
    ).then(result => {
      if (result.success && result.data) {
        return result.data;
      } else {
        console.warn('⚠️ Level0StoryProcessor: Using fallback content for continuation due to error:', result.error);
        return result.fallback || {
          content: Array.from({ length: targetPages }, () => 'The story continues.'),
          templateIndex: -1,
          isValid: true,
          validationErrors: [],
          isRepeating: true
        };
      }
    });
  }

  /**
   * Reset session template rotation
   */
  static resetSession(): void {
    HierarchicalSessionTemplateManager.clearSession();
    console.log('🔄 Level0StoryProcessor: Session reset - hierarchical template rotation restarted');
  }
}
