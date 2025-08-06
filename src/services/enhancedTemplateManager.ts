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
import { HierarchicalSessionTemplateManager } from './hierarchicalSessionTemplateManager';
import { CharacterDrivenStoryArc } from './characterDrivenStoryArc';
import { InputEnhancementEngine } from './inputEnhancementEngine';
import { TemplateQualityAssurance } from './templateQualityAssurance';
import { CharacterPoolManager } from './characterPoolManager';
import { getAuthorVoiceForUser, applyAuthorVoice } from '@/constants/authorVoicePatterns';
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
   * Continue an existing story for Levels 1-4 using the same template selection logic as initial generation
   * Ensures consistency with already-used templates tracking
   */
  static async continueStory(options: EnhancedTemplateOptions & { targetPages?: number }): Promise<EnhancedTemplateResult> {
    const { targetPages = 5, ...generateOptions } = options;
    
    console.log(`🔄 EnhancedTemplateManager: Continuing story for ${generateOptions.difficulty} with ${targetPages} pages`);
    
    // Generate a new story segment using the same logic but with reduced page count
    const result = await this.generateEnhancedStory({
      ...generateOptions,
      enableExtensions: false // Disable extensions for continuation to get base template content
    });
    
    // Return exactly the requested number of pages
    const continuationPages = result.pages.slice(0, targetPages);
    
    return {
      ...result,
      pages: continuationPages,
      actualPages: continuationPages.length,
      targetPages,
      metadata: {
        ...result.metadata,
        wasExtended: false,
        extensionMethod: 'continuation-slice'
      }
    };
  }
  /**
   * Generate enhanced story with grade-based vocabulary and smart extensions
   * Level 0: Minimal processing (name substitution + validation only)
   * Levels 1-4: Full processing pipeline (Character Arc + Author Voice + Quality Assessment)
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
    
    console.log(`🎯 EnhancedTemplateManager: Processing ${gradeLevel} content (Level ${gradeLevel === 0 ? '0: minimal' : '1-4: full pipeline'})`);
    
    // Level 0 should never reach this manager - handled by Level0StoryProcessor
    if (gradeLevel === 0) {
      throw new Error('Level 0 content should be processed by Level0StoryProcessor, not EnhancedTemplateManager');
    }
    
    // Levels 1-4: Full processing pipeline
    console.log(`🚀 EnhancedTemplateManager: Starting full processing pipeline for Level ${gradeLevel}`);
    
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
    
    // STEP 1: Process template with user context
    let pages = baseTemplate.map(page => 
      page.replace(/{userName}/g, userInfo?.name || 'I')
    );
    
    // STEP 2: Generate Robust Character Pool for rich storytelling (Levels 1-4 only)
    console.log(`👥 EnhancedTemplateManager: Generating Character Pool for Level ${gradeLevel}`);
    const characterPool = CharacterPoolManager.generateCharacterPool(userInfo || {} as UserInfo, difficulty);
    
    // STEP 3: Get Enhanced User Inputs for deeper story context
    console.log(`🔧 EnhancedTemplateManager: Processing Enhanced User Inputs for Level ${gradeLevel}`);
    const enhancedInputs = InputEnhancementEngine.enhanceUserInputs(userInfo || {} as UserInfo);
    
    // STEP 4: Select Author Voice for consistent storytelling
    console.log(`✍️ EnhancedTemplateManager: Selecting Author Voice for Level ${gradeLevel}`);
    const authorVoice = getAuthorVoiceForUser(userInfo || {} as UserInfo, difficulty);
    
    // STEP 5: Apply Character Details to Template (Levels 1-4 only)
    console.log(`🎭 EnhancedTemplateManager: Applying Character Details to Template for Level ${gradeLevel}`);
    try {
      // Enhance each template page with character details while preserving the template narrative
      pages = pages.map((page, index) => {
        const context = {
          currentPage: index + 1,
          totalPages: pages.length,
          characters: characterPool,
          userInfo: userInfo || {} as UserInfo,
          difficulty,
          storyTheme: this.determineStoryTheme(userInfo, enhancedInputs, characterPool),
          currentConflict: this.generateCharacterDrivenConflict(characterPool, index, pages.length)
        };
        
        // Enhance the template page with character details (don't replace)
        return this.enhanceTemplateWithCharacters(page, characterPool, context, enhancedInputs);
      });
    } catch (error) {
      console.warn(`⚠️ EnhancedTemplateManager: Character enhancement failed:`, error);
      // Continue with original pages on error
    }
    
    // STEP 6: Apply Systematic Author Voice across all pages (Levels 1-4 only)
    console.log(`🎨 EnhancedTemplateManager: Applying Systematic Author Voice for Level ${gradeLevel}`);
    try {
      // Apply consistent author voice to all pages based on story position
      pages = pages.map((page, index) => {
        const isOpening = index === 0;
        const isClosing = index === pages.length - 1;
        const isTransition = !isOpening && !isClosing;
        
        if (isOpening) {
          return applyAuthorVoice(page, authorVoice, 'opening');
        } else if (isClosing) {
          return applyAuthorVoice(page, authorVoice, 'closing');
        } else if (isTransition) {
          // Apply transition voice to ALL middle pages for consistency
          return applyAuthorVoice(page, authorVoice, 'transition');
        }
        
        return page;
      });
    } catch (error) {
      console.warn(`⚠️ EnhancedTemplateManager: Author Voice enhancement failed:`, error);
    }
    
    // Handle page extensions if needed
    let wasExtended = false;
    let extensionMethod: string | undefined;
    const basePageCount = pages.length;
    
    // STEP 4: Apply Quality Assessment (Levels 1-4 only)
    console.log(`🔍 EnhancedTemplateManager: Applying Quality Assessment for Level ${gradeLevel}`);
    try {
      // Basic vocabulary validation using existing system
      const validation = this.validateStoryVocabulary(pages, gradeLevel, userInfo?.name);
      if (!validation.isValid) {
        console.warn(`⚠️ EnhancedTemplateManager: Quality assessment found vocabulary issues:`, validation.errors);
      }
    } catch (error) {
      console.warn(`⚠️ EnhancedTemplateManager: Quality Assessment failed:`, error);
    }
    
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
   * Determine story theme based on user info, enhanced inputs, and character pool
   */
  private static determineStoryTheme(
    userInfo?: UserInfo,
    enhancedInputs?: any,
    characterPool?: any
  ): string {
    // Use special request if available
    if (userInfo?.specialRequest && userInfo.specialRequest.trim().length > 0) {
      return userInfo.specialRequest;
    }
    
    // Use enhanced inputs theme if available
    if (enhancedInputs?.thematicConnections && enhancedInputs.thematicConnections.length > 0) {
      return enhancedInputs.thematicConnections[0];
    }
    
    // Use character-driven theme based on main character personality
    if (characterPool?.main?.personality) {
      const personality = characterPool.main.personality.toLowerCase();
      if (personality.includes('brave')) return 'courage and adventure';
      if (personality.includes('kind')) return 'friendship and kindness';
      if (personality.includes('creative')) return 'creativity and imagination';
      if (personality.includes('wise')) return 'learning and discovery';
    }
    
    // Default theme based on user age
    if (userInfo?.age && userInfo.age <= 6) {
      return 'friendship and fun';
    } else if (userInfo?.age && userInfo.age <= 10) {
      return 'adventure and discovery';
    }
    
    return 'adventure and friendship';
  }

  /**
   * Generate character-driven conflict based on character pool and story position
   */
  private static generateCharacterDrivenConflict(
    characterPool: any,
    pageIndex: number,
    totalPages: number
  ): string {
    const storyPosition = pageIndex / totalPages;
    const mainCharacter = characterPool?.main?.name || 'the main character';
    
    // Early story - setup conflicts
    if (storyPosition < 0.25) {
      const conflicts = [
        `${mainCharacter} discovers something unusual`,
        `${mainCharacter} meets someone new and interesting`,
        `${mainCharacter} notices something that needs help`
      ];
      return conflicts[Math.floor(Math.random() * conflicts.length)];
    }
    
    // Middle story - development conflicts
    if (storyPosition < 0.75) {
      const friend = characterPool?.friends?.[0]?.name || 'a friend';
      const animal = characterPool?.animals?.[0]?.name || 'an animal companion';
      const conflicts = [
        `${mainCharacter} and ${friend} face a challenge together`,
        `${animal} needs ${mainCharacter}'s help`,
        `${mainCharacter} must use their special skills`,
        `${mainCharacter} learns something important from ${characterPool?.family?.[0]?.name || 'family'}`
      ];
      return conflicts[Math.floor(Math.random() * conflicts.length)];
    }
    
    // Late story - resolution conflicts
    const conflicts = [
      `${mainCharacter} finds the perfect solution`,
      `${mainCharacter} brings everyone together`,
      `${mainCharacter} celebrates with all their friends`
    ];
    return conflicts[Math.floor(Math.random() * conflicts.length)];
  }

  /**
   * Enhance template with character details while preserving the template narrative
   */
  private static enhanceTemplateWithCharacters(
    templatePage: string,
    characterPool: any,
    context: any,
    enhancedInputs?: any
  ): string {
    let enhancedPage = templatePage;
    
    // Replace basic placeholders with character names
    if (characterPool.main) {
      enhancedPage = enhancedPage.replace(/{main}/g, characterPool.main.name);
      enhancedPage = enhancedPage.replace(/{character}/g, characterPool.main.name);
    }
    
    if (characterPool.family && characterPool.family.length > 0) {
      enhancedPage = enhancedPage.replace(/{family}/g, characterPool.family[0].name);
    }
    
    if (characterPool.friends && characterPool.friends.length > 0) {
      enhancedPage = enhancedPage.replace(/{friend}/g, characterPool.friends[0].name);
    }
    
    if (characterPool.animals && characterPool.animals.length > 0) {
      enhancedPage = enhancedPage.replace(/{animal}/g, characterPool.animals[0].name);
      enhancedPage = enhancedPage.replace(/{pet}/g, characterPool.animals[0].name);
    }
    
    if (characterPool.helpers && characterPool.helpers.length > 0) {
      enhancedPage = enhancedPage.replace(/{helper}/g, characterPool.helpers[0].name);
    }
    
    // Replace user preference placeholders from enhanced inputs
    if (enhancedInputs) {
      Object.entries(enhancedInputs).forEach(([key, value]) => {
        if (typeof value === 'string' && key !== 'name') {
          const regex = new RegExp(`\\{${key}\\}`, 'g');
          enhancedPage = enhancedPage.replace(regex, value);
        }
      });
    }
    
    // Add subtle character details without breaking the template narrative
    const storyPosition = context.currentPage / context.totalPages;
    
    // Only add character details if the page doesn't already have rich character content
    if (enhancedPage.length < 100 && !enhancedPage.includes(', who ') && !enhancedPage.includes(' the ')) {
      // Early pages - add character relationships
      if (storyPosition < 0.4 && characterPool.family && characterPool.family.length > 0) {
        const familyMember = characterPool.family[0];
        if (!enhancedPage.includes(familyMember.name)) {
          enhancedPage = enhancedPage.replace(
            /\./,
            ` with ${familyMember.name}.`
          );
        }
      }
      
      // Middle pages - add friend interactions
      if (storyPosition >= 0.4 && storyPosition < 0.8 && characterPool.friends && characterPool.friends.length > 0) {
        const friend = characterPool.friends[0];
        if (!enhancedPage.includes(friend.name)) {
          enhancedPage = enhancedPage.replace(
            /\./,
            ` and ${friend.name}.`
          );
        }
      }
    }
    
    return enhancedPage;
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