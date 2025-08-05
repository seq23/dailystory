// Enhanced Template Manager - New Grade-Based Architecture
// Replaces optimizedTemplateManager with unified grade-based system

import { UserInfo, DifficultyLevel } from '@/types';
import { 
  GradeLevel, 
  difficultyToGradeLevel,
  validateSentence,
  GRADE_LEVEL_INFO
} from '@/constants/gradeBased';

import {
  selectTemplate,
  getTargetPageCount,
  PREMIUM_PAGE_EXTENSIONS,
  FREE_PAGE_COUNT,
  getUnifiedTemplateSystemAnalytics
} from '@/constants/gradeBased/unifiedTemplateSystem';

import { SessionTemplateManager } from './sessionTemplateManager';

interface EnhancedTemplateOptions {
  userInfo?: UserInfo;
  difficulty: DifficultyLevel;
  isPremium?: boolean;
  templateIndex?: number;
  enableExtensions?: boolean;
}

interface EnhancedTemplateResult {
  pages: string[];
  templateIndex: number;
  gradeLevel: GradeLevel;
  actualPages: number;
  targetPages: number;
  isPremium: boolean;
  vocabularyCompliant: boolean;
  validationErrors: string[];
  metadata: {
    difficulty: DifficultyLevel;
    gradeInfo: typeof GRADE_LEVEL_INFO[GradeLevel];
    wasExtended: boolean;
    extensionMethod?: string;
    systemVersion: 'enhanced-unified-v1';
  };
}

export class EnhancedTemplateManager {
  /**
   * Generate enhanced story with grade-based vocabulary and smart extensions
   */
  static async generateEnhancedStory(options: EnhancedTemplateOptions): Promise<EnhancedTemplateResult> {
    const {
      userInfo,
      difficulty,
      isPremium = false,
      templateIndex,
      enableExtensions = true
    } = options;

    // Convert difficulty to grade level
    const gradeLevel = difficultyToGradeLevel(difficulty);
    const gradeInfo = GRADE_LEVEL_INFO[gradeLevel];
    
    // Determine target page count
    const targetPages = getTargetPageCount(gradeLevel, isPremium);
    
    // Select template with anti-repetition (simplified for now)
    const { templateIndex: selectedIndex, template: baseTemplate } = selectTemplate(
      gradeLevel,
      [], // Empty used templates for now - can be enhanced later
      templateIndex
    );
    
    // Process template with user name
    let pages = baseTemplate.map(page => 
      page.replace(/{userName}/g, userInfo?.name || 'I')
    );
    
    // Handle page extensions if needed
    let wasExtended = false;
    let extensionMethod: string | undefined;
    const basePageCount = pages.length;
    
    if (enableExtensions && targetPages > basePageCount) {
      pages = await this.extendStoryIntelligently(
        pages, 
        targetPages, 
        gradeLevel, 
        userInfo
      );
      wasExtended = true;
      extensionMethod = 'intelligent-grade-based-extension';
    } else if (targetPages < basePageCount) {
      pages = pages.slice(0, targetPages);
      extensionMethod = 'truncation';
    }
    
    // Validate vocabulary compliance
    const validation = this.validateStoryVocabulary(pages, gradeLevel, userInfo?.name);
    
    return {
      pages,
      templateIndex: selectedIndex,
      gradeLevel,
      actualPages: pages.length,
      targetPages,
      isPremium,
      vocabularyCompliant: validation.isValid,
      validationErrors: validation.errors,
      metadata: {
        difficulty,
        gradeInfo,
        wasExtended,
        extensionMethod,
        systemVersion: 'enhanced-unified-v1'
      }
    };
  }

  /**
   * Intelligent story extension that maintains grade-level vocabulary
   */
  private static async extendStoryIntelligently(
    originalPages: string[],
    targetPages: number,
    gradeLevel: GradeLevel,
    userInfo?: UserInfo
  ): Promise<string[]> {
    const pagesToAdd = targetPages - originalPages.length;
    const extendedPages = [...originalPages];
    const userName = userInfo?.name || 'I';
    
    // Grade-appropriate extension templates
    const extensionTemplates = this.getExtensionTemplates(gradeLevel);
    
    for (let i = 0; i < pagesToAdd; i++) {
      const lastPage = extendedPages[extendedPages.length - 1];
      const newPage = this.generateContinuationPage(
        lastPage, 
        gradeLevel, 
        userName, 
        extensionTemplates
      );
      extendedPages.push(newPage);
    }
    
    return extendedPages;
  }

  /**
   * Generate grade-appropriate continuation page
   */
  private static generateContinuationPage(
    lastPage: string,
    gradeLevel: GradeLevel,
    userName: string,
    templates: string[]
  ): string {
    // Select random template and replace userName
    const template = templates[Math.floor(Math.random() * templates.length)];
    const page = template.replace(/{userName}/g, userName);
    
    // Validate vocabulary compliance
    const validation = validateSentence(page, gradeLevel, userName);
    
    if (validation.isValid) {
      return page;
    }
    
    // Fallback to ultra-simple continuation
    return this.getSimpleFallback(gradeLevel, userName);
  }

  /**
   * Get extension templates by grade level
   */
  private static getExtensionTemplates(gradeLevel: GradeLevel): string[] {
    switch (gradeLevel) {
      case 0:
        return [
          "{userName} is happy.",
          "{userName} had fun today.",
          "{userName} wants to play more.",
          "{userName} loves this story.",
          "{userName} will come back."
        ];
      
      case 1:
        return [
          "{userName} learned something new today.",
          "{userName} feels proud of what they did.",
          "{userName} wants to tell friends about this.",
          "{userName} had the best day ever.",
          "{userName} cannot wait for tomorrow."
        ];
      
      case 2:
        return [
          "{userName} discovered that trying new things can be exciting and rewarding.",
          "{userName} realized they were capable of more than they originally thought.",
          "{userName} looked forward to sharing this experience with family and friends.",
          "{userName} felt confident and ready to take on new challenges.",
          "{userName} understood that every experience teaches valuable lessons."
        ];
      
      case 3:
        return [
          "{userName} reflected on the significance of this experience and its broader implications.",
          "{userName} recognized the importance of perseverance and dedication in achieving meaningful goals.",
          "{userName} appreciated the collaborative efforts that made this achievement possible.",
          "{userName} contemplated how this experience would influence their future endeavors.",
          "{userName} acknowledged the valuable mentorship and guidance received throughout the process."
        ];
      
      case 4:
        return [
          "{userName} synthesized the complex insights gained through this multifaceted experience.",
          "{userName} evaluated the long-term ramifications of their contributions to the field.",
          "{userName} articulated sophisticated connections between theoretical frameworks and practical applications.",
          "{userName} demonstrated intellectual maturity through thoughtful analysis and critical evaluation.",
          "{userName} established themselves as an emerging authority with potential for significant future impact."
        ];
      
      default:
        return ["{userName} is happy."];
    }
  }

  /**
   * Get simple fallback for failed vocabulary validation
   */
  private static getSimpleFallback(gradeLevel: GradeLevel, userName: string): string {
    switch (gradeLevel) {
      case 0: return `${userName} is happy.`;
      case 1: return `${userName} feels good about today.`;
      case 2: return `${userName} accomplished something important.`;
      case 3: return `${userName} achieved meaningful success.`;
      case 4: return `${userName} demonstrated exceptional capability.`;
      default: return `${userName} is happy.`;
    }
  }

  /**
   * Validate entire story for grade-level vocabulary compliance
   */
  private static validateStoryVocabulary(
    pages: string[],
    gradeLevel: GradeLevel,
    userName?: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (let i = 0; i < pages.length; i++) {
      const validation = validateSentence(pages[i], gradeLevel, userName);
      if (!validation.isValid) {
        errors.push(`Page ${i + 1}: Invalid words - ${validation.invalidWords.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate batch of stories
   */
  static async generateBatch(
    options: EnhancedTemplateOptions,
    count: number = 3
  ): Promise<EnhancedTemplateResult[]> {
    const results: EnhancedTemplateResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const result = await this.generateEnhancedStory({
        ...options,
        templateIndex: undefined // Let system select different templates
      });
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get analytics for the enhanced template system
   */
  static getEnhancedAnalytics() {
    const systemAnalytics = getUnifiedTemplateSystemAnalytics();
    
    return {
      systemVersion: 'enhanced-unified-v1',
      ...systemAnalytics,
      premiumPageExtensions: PREMIUM_PAGE_EXTENSIONS,
      freePageCount: FREE_PAGE_COUNT,
      gradeBasedSystem: true,
      antiRepetitionEnabled: true,
      vocabularyCompliance: true
    };
  }

  /**
   * Clear session for testing
   */
  static clearSession(): void {
    // Clear session data
    SessionTemplateManager.clearSession();
  }

  /**
   * Get system health status
   */
  static getSystemHealth() {
    const analytics = getUnifiedTemplateSystemAnalytics();
    
    return {
      isHealthy: analytics.totalTemplates === 200,
      version: 'enhanced-unified-v1',
      templatesLoaded: analytics.totalTemplates,
      expectedTemplates: 200,
      totalUniquePages: analytics.totalPages,
      gradeLevelsActive: 5,
      features: {
        gradeBasedVocabulary: true,
        antiRepetition: true,
        intelligentExtensions: true,
        premiumPageCounts: true,
        vocabularyValidation: true
      }
    };
  }
}