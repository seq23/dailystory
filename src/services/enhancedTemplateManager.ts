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
  getUnifiedTemplateSystemAnalytics,
  getTemplateByGradeLevel,
  getTemplateCountByGradeLevel
} from '@/constants/gradeBased/unifiedTemplateSystem';

import { SessionTemplateManager } from './sessionTemplateManager';
import { LEVEL_0_FREE_EXTENSIONS, LEVEL_0_PREMIUM_EXTENSIONS } from '@/constants/gradeBased/level0ExtensionTemplates';

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
  // Track used templates per session to avoid repetition
  private static sessionUsedTemplates: Map<GradeLevel, Set<number>> = new Map();
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
    
    // Get or initialize used templates for this grade level
    if (!this.sessionUsedTemplates.has(gradeLevel)) {
      this.sessionUsedTemplates.set(gradeLevel, new Set());
    }
    const usedTemplates = Array.from(this.sessionUsedTemplates.get(gradeLevel)!);
    
    // Select template with anti-repetition
    const { templateIndex: selectedIndex, template: baseTemplate } = selectTemplate(
      gradeLevel,
      usedTemplates,
      templateIndex
    );
    
    // Track this template as used
    this.sessionUsedTemplates.get(gradeLevel)!.add(selectedIndex);
    
    // Process template with user name
    let pages = baseTemplate.map(page => 
      page.replace(/{userName}/g, userInfo?.name || 'I')
    );
    
    // Handle page extensions if needed
    let wasExtended = false;
    let extensionMethod: string | undefined;
    const basePageCount = pages.length;
    
    if (enableExtensions && targetPages > basePageCount) {
      const extensionResult = await this.extendStoryIntelligently(
        pages, 
        targetPages, 
        gradeLevel, 
        userInfo,
        selectedIndex
      );
      pages = extensionResult.pages;
      wasExtended = true;
      extensionMethod = extensionResult.method;
    } else if (targetPages < basePageCount) {
      pages = pages.slice(0, targetPages);
      extensionMethod = 'truncation';
    }
    
    // Validate vocabulary compliance
    const validation = this.validateStoryVocabulary(pages, gradeLevel, userInfo?.name);
    
    // Log which type of templates were used (for debugging vocabulary issues)
    console.log(`🎯 Level ${gradeLevel} Story Generation:`, {
      totalPages: pages.length,
      baseTemplatePages: basePageCount,
      extensionPages: pages.length - basePageCount,
      userName: userInfo?.name,
      vocabularyCompliant: validation.isValid,
      difficulty: options.difficulty,
      wasExtended: wasExtended,
      extensionMethod
    });
    
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
   * Now prioritizes unused base templates over extension templates
   */
  private static async extendStoryIntelligently(
    originalPages: string[],
    targetPages: number,
    gradeLevel: GradeLevel,
    userInfo?: UserInfo,
    usedTemplateIndex?: number
  ): Promise<{ pages: string[]; method: string }> {
    const pagesToAdd = targetPages - originalPages.length;
    const extendedPages = [...originalPages];
    const userName = userInfo?.name || 'I';
    
    // Get available base templates (exclude already used one)
    const totalTemplates = getTemplateCountByGradeLevel(gradeLevel);
    const usedTemplates = this.sessionUsedTemplates.get(gradeLevel) || new Set();
    const availableTemplateIndices = Array.from({ length: totalTemplates }, (_, i) => i)
      .filter(i => !usedTemplates.has(i));
    
    let extensionMethod = 'base-template-cycling';
    let templateIndex = 0;
    
    for (let i = 0; i < pagesToAdd; i++) {
      let newPage: string;
      
      // First priority: Use additional base templates
      if (availableTemplateIndices.length > templateIndex) {
        const nextTemplateIndex = availableTemplateIndices[templateIndex];
        const template = getTemplateByGradeLevel(gradeLevel, nextTemplateIndex);
        
        // Use a random page from this template, processed with user name
        const randomPageIndex = Math.floor(Math.random() * template.length);
        newPage = template[randomPageIndex].replace(/{userName}/g, userName);
        
        // Track this template as used
        this.sessionUsedTemplates.get(gradeLevel)!.add(nextTemplateIndex);
        templateIndex++;
      } else {
        // Fallback: Use extension templates only after all base templates are exhausted
        // Check subscription status - for level 0, free users get strict vocabulary
        const isPremium = gradeLevel !== 0 || (userInfo as any)?.subscription?.plan === 'premium';
        const extensionTemplates = this.getExtensionTemplates(gradeLevel, isPremium);
        newPage = this.generateContinuationPage(
          extendedPages[extendedPages.length - 1], 
          gradeLevel, 
          userName, 
          extensionTemplates
        );
        extensionMethod = 'extension-templates-fallback';
      }
      
      // Validate vocabulary compliance
      const validation = validateSentence(newPage, gradeLevel, userName);
      if (!validation.isValid) {
        // Use simple fallback if validation fails
        newPage = this.getSimpleFallback(gradeLevel, userName);
        extensionMethod = 'simple-fallback';
      }
      
      extendedPages.push(newPage);
    }
    
    return { pages: extendedPages, method: extensionMethod };
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
   * Get extension templates by grade level with universal access for levels 1-4
   */
  private static getExtensionTemplates(gradeLevel: GradeLevel, isPremium: boolean = true): string[] {
    switch (gradeLevel) {
      case 0:
        // Level 0 maintains free vs premium distinction using proper 5-page templates
        const level0Extensions = isPremium ? LEVEL_0_PREMIUM_EXTENSIONS : LEVEL_0_FREE_EXTENSIONS;
        const randomTemplate = level0Extensions[Math.floor(Math.random() * level0Extensions.length)];
        return randomTemplate;
      
      case 1:
        // Universal access - import level 1 extensions
        const { getLevel1Extension } = require('@/constants/gradeBased/level1ExtensionTemplates');
        return getLevel1Extension();
      
      case 2:
        // Universal access - import level 2 extensions
        const { getLevel2Extension } = require('@/constants/gradeBased/level2ExtensionTemplates');
        return getLevel2Extension();
      
      case 3:
        // Universal access - import level 3 extensions
        const { getLevel3Extension } = require('@/constants/gradeBased/level3ExtensionTemplates');
        return getLevel3Extension();
      
      case 4:
        // Universal access - import level 4 extensions
        const { getLevel4Extension } = require('@/constants/gradeBased/level4ExtensionTemplates');
        return getLevel4Extension();
      
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
      case 2: return `${userName} found something new and fun.`;
      case 3: return `${userName} learned something important today.`;
      case 4: return `${userName} discovered an interesting book in the library.`;
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
    // Clear used templates tracking
    this.sessionUsedTemplates.clear();
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