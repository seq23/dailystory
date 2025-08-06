// Simplified Level 0 Processor - Clean, reliable processing for Level 0 stories
// Removes complex session management and focuses on basic template delivery

import { LEVEL_0_FREE_TEMPLATES } from '@/constants/level0TemplatesFree';
import { LEVEL_0_PREMIUM_TEMPLATES } from '@/constants/level0TemplatesPremium';
import { validateLevel0SentenceByUserType, type UserType } from '@/constants/dolchPrePrimer';
import type { UserInfo } from '@/types';

export interface SimplifiedLevel0Result {
  content: string[];
  templateIndex: number;
  isValid: boolean;
  validationErrors: string[];
}

export class SimplifiedLevel0Processor {
  private static usedTemplates = new Set<number>();
  
  /**
   * Generate a Level 0 story with simplified processing
   */
  static async generateStory(userInfo?: UserInfo, isPremium?: boolean): Promise<SimplifiedLevel0Result> {
    // Reset page tracker for new story session
    const { SessionPageTracker } = await import('./sessionPageTracker');
    SessionPageTracker.resetSession();
    console.log('🎯 SimplifiedLevel0Processor: Generating Level 0 story');
    
    const userType: UserType = isPremium ? 'premium' : 'free';
    const templates = isPremium ? LEVEL_0_PREMIUM_TEMPLATES : LEVEL_0_FREE_TEMPLATES;
    
    // Simple template selection with anti-repetition
    let templateIndex = this.selectUnusedTemplate(templates.length);
    let template = templates[templateIndex];
    
    // Fallback if all templates used
    if (this.usedTemplates.size >= templates.length) {
      console.log('🔄 All templates used, resetting selection');
      this.usedTemplates.clear();
      templateIndex = Math.floor(Math.random() * templates.length);
      template = templates[templateIndex];
    }
    
    // Mark template as used
    this.usedTemplates.add(templateIndex);
    
    // Simple variable replacement - only {userName}
    const processedPages = template.map(page => {
      if (userInfo?.name) {
        return page.replace(/\{userName\}/g, userInfo.name);
      }
      return page;
    });
    
    // Basic validation
    const validation = this.validateStory(processedPages, userType, userInfo?.name);
    
    console.log(`✅ SimplifiedLevel0Processor: Generated ${processedPages.length} pages (template ${templateIndex + 1})`);
    
    return {
      content: processedPages,
      templateIndex,
      isValid: validation.isValid,
      validationErrors: validation.errors
    };
  }
  
  /**
   * Continue story with simple approach
   */
  static async continueStory(userInfo?: UserInfo, isPremium?: boolean, targetPages: number = 5): Promise<SimplifiedLevel0Result> {
    console.log(`🔄 SimplifiedLevel0Processor: Continuing story with ${targetPages} pages`);
    
    // For simplicity, generate a new story segment
    const result = await this.generateStory(userInfo, isPremium);
    
    // Extend if needed
    if (result.content.length < targetPages) {
      const userName = userInfo?.name || 'I';
      while (result.content.length < targetPages) {
        result.content.push(`${userName} sees something new.`);
      }
    }
    
    // Trim if too long
    if (result.content.length > targetPages) {
      result.content = result.content.slice(0, targetPages);
    }
    
    return {
      ...result,
      content: result.content
    };
  }
  
  /**
   * Select an unused template index
   */
  private static selectUnusedTemplate(totalTemplates: number): number {
    const available: number[] = [];
    
    for (let i = 0; i < totalTemplates; i++) {
      if (!this.usedTemplates.has(i)) {
        available.push(i);
      }
    }
    
    if (available.length === 0) {
      // All used, pick random
      return Math.floor(Math.random() * totalTemplates);
    }
    
    return available[Math.floor(Math.random() * available.length)];
  }
  
  /**
   * Simple validation
   */
  private static validateStory(pages: string[], userType: UserType, userName?: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    let isValid = true;
    
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
   * Reset session
   */
  static resetSession(): void {
    this.usedTemplates.clear();
    console.log('🔄 SimplifiedLevel0Processor: Session reset');
  }
  
  /**
   * Get template statistics
   */
  static getTemplateStats(isPremium?: boolean): any {
    const templates = isPremium ? LEVEL_0_PREMIUM_TEMPLATES : LEVEL_0_FREE_TEMPLATES;
    
    return {
      totalTemplates: templates.length,
      templatesUsed: this.usedTemplates.size,
      templatesRemaining: templates.length - this.usedTemplates.size,
      totalPages: templates.reduce((sum, template) => sum + template.length, 0)
    };
  }
}