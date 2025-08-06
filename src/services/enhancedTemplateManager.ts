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

// Enhanced session state interface for template continuation
interface EnhancedTemplateSessionState {
  currentTemplate: string[] | null;
  currentTemplateIndex: number;
  currentPageIndex: number;
  usedTemplates: Set<number>;
  sessionStartTime: number;
  gradeLevel: GradeLevel;
}

export class EnhancedTemplateManager {
  // Track used templates per session to avoid repetition
  private static sessionUsedTemplates: Map<GradeLevel, Set<number>> = new Map();
  
  // Session storage for template continuation
  private static getSessionStorageKey(gradeLevel: GradeLevel): string {
    return `enhanced_template_session_${gradeLevel}`;
  }
  
  /**
   * Get current session state for a grade level
   */
  private static getSessionState(gradeLevel: GradeLevel): EnhancedTemplateSessionState | null {
    try {
      const { MobileSessionManager } = require('./mobileSessionManager');
      const stored = MobileSessionManager.getItem(this.getSessionStorageKey(gradeLevel));
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return {
        currentTemplate: parsed.currentTemplate || null,
        currentTemplateIndex: parsed.currentTemplateIndex || -1,
        currentPageIndex: parsed.currentPageIndex || 0,
        usedTemplates: new Set(parsed.usedTemplates || []),
        sessionStartTime: parsed.sessionStartTime || Date.now(),
        gradeLevel
      };
    } catch (error) {
      console.warn(`⚠️ Failed to load session state for ${gradeLevel}:`, error);
      return null;
    }
  }
  
  /**
   * Save current session state for a grade level
   */
  private static saveSessionState(state: EnhancedTemplateSessionState): void {
    try {
      const { MobileSessionManager } = require('./mobileSessionManager');
      MobileSessionManager.setItem(this.getSessionStorageKey(state.gradeLevel), JSON.stringify({
        currentTemplate: state.currentTemplate,
        currentTemplateIndex: state.currentTemplateIndex,
        currentPageIndex: state.currentPageIndex,
        usedTemplates: Array.from(state.usedTemplates),
        sessionStartTime: state.sessionStartTime,
        gradeLevel: state.gradeLevel
      }));
    } catch (error) {
      console.warn(`⚠️ Failed to save session state for ${state.gradeLevel}:`, error);
    }
  }
  
  /**
   * Continue an existing story for Levels 1-4 with proper template state management
   * Fixed to respect current template sequence instead of starting new templates
   */
  static async continueStory(options: EnhancedTemplateOptions & { targetPages?: number }): Promise<EnhancedTemplateResult> {
    const { targetPages = 5, ...generateOptions } = options;
    const { userInfo, difficulty, isPremium = false } = generateOptions;
    
    const gradeLevel = difficultyToGradeLevel(difficulty);
    const gradeInfo = GRADE_LEVEL_INFO[gradeLevel];
    
    console.log(`🔄 EnhancedTemplateManager: Continuing story for ${difficulty} (Level ${gradeLevel}) with ${targetPages} pages`);
    
    // Get current session state
    let sessionState = this.getSessionState(gradeLevel);
    
    // Initialize session if not exists
    if (!sessionState) {
      console.log(`🔄 No existing session for Level ${gradeLevel}, initializing new session`);
      sessionState = {
        currentTemplate: null,
        currentTemplateIndex: -1,
        currentPageIndex: 0,
        usedTemplates: new Set(),
        sessionStartTime: Date.now(),
        gradeLevel
      };
    }
    
    const pages: string[] = [];
    let pagesGenerated = 0;
    
    // Generate exactly the requested number of pages
    while (pagesGenerated < targetPages) {
      // If no current template or current template is exhausted, get a new one
      if (!sessionState.currentTemplate || sessionState.currentPageIndex >= sessionState.currentTemplate.length) {
        console.log(`🔄 Level ${gradeLevel}: Need new template (current: ${sessionState.currentTemplateIndex}, page: ${sessionState.currentPageIndex})`);
        
        // Select next template with anti-repetition
        const totalTemplates = getTemplateCountByGradeLevel(gradeLevel);
        const usedTemplates = Array.from(sessionState.usedTemplates);
        const { templateIndex: selectedIndex, template: baseTemplate } = selectTemplate(
          gradeLevel,
          usedTemplates
        );
        
        // Process the complete template with character enhancement and author voice
        const processedTemplate = await this.processCompleteTemplate(
          baseTemplate,
          userInfo,
          difficulty,
          gradeLevel
        );
        
        // Update session state with new template
        sessionState.currentTemplate = processedTemplate;
        sessionState.currentTemplateIndex = selectedIndex;
        sessionState.currentPageIndex = 0;
        sessionState.usedTemplates.add(selectedIndex);
        
        console.log(`✅ Level ${gradeLevel}: Selected template ${selectedIndex + 1}/${totalTemplates} with ${processedTemplate.length} pages`);
      }
      
      // Get pages from current template up to the remaining target
      const remainingPages = targetPages - pagesGenerated;
      const remainingTemplatePages = sessionState.currentTemplate.length - sessionState.currentPageIndex;
      const pagesToTake = Math.min(remainingPages, remainingTemplatePages);
      
      // Extract pages from current template
      for (let i = 0; i < pagesToTake; i++) {
        const pageIndex = sessionState.currentPageIndex + i;
        pages.push(sessionState.currentTemplate[pageIndex]);
      }
      
      // Update session state
      sessionState.currentPageIndex += pagesToTake;
      pagesGenerated += pagesToTake;
      
      console.log(`📄 Level ${gradeLevel}: Added ${pagesToTake} pages (${pagesGenerated}/${targetPages} total)`);
    }
    
    // Save updated session state
    this.saveSessionState(sessionState);
    
    // Validate vocabulary compliance
    const validation = this.validateStoryVocabulary(pages, gradeLevel, userInfo?.name);
    
    console.log(`🎯 Level ${gradeLevel} Continuation Complete:`, {
      totalPages: pages.length,
      templateIndex: sessionState.currentTemplateIndex,
      templateProgress: `${sessionState.currentPageIndex}/${sessionState.currentTemplate?.length || 0}`,
      vocabularyCompliant: validation.isValid
    });
    
    return {
      pages,
      templateIndex: sessionState.currentTemplateIndex,
      gradeLevel,
      actualPages: pages.length,
      targetPages,
      isPremium,
      vocabularyCompliant: validation.isValid,
      validationErrors: validation.errors,
      metadata: {
        difficulty,
        gradeInfo,
        wasExtended: false,
        extensionMethod: 'template-continuation',
        systemVersion: 'enhanced-unified-v1'
      }
    };
  }

  /**
   * Process a complete template with full enhancement pipeline
   * This method applies the same processing as generateEnhancedStory but without extensions
   */
  private static async processCompleteTemplate(
    baseTemplate: string[],
    userInfo?: UserInfo,
    difficulty?: DifficultyLevel,
    gradeLevel?: GradeLevel
  ): Promise<string[]> {
    try {
      // STEP 1: Basic user name replacement
      let pages = baseTemplate.map(page => 
        page.replace(/{userName}/g, userInfo?.name || 'I')
      );

      if (!difficulty || !gradeLevel) {
        return pages; // Return basic processed pages if missing required params
      }

      // STEP 2: Generate Character Pool
      const characterPool = CharacterPoolManager.generateCharacterPool(userInfo || {} as UserInfo, difficulty);
      
      // STEP 3: Get Enhanced User Inputs
      const { EnhancedInputProcessor } = await import('./enhancedInputProcessor');
      const processedInputs = await EnhancedInputProcessor.processUserInputsAdvanced(userInfo, difficulty);
      const baseEnhancedInputs = InputEnhancementEngine.enhanceUserInputs(userInfo || {} as UserInfo);
      const enhancedInputs = { ...baseEnhancedInputs, ...processedInputs };
      
      // STEP 4: Select Author Voice
      const authorVoice = getAuthorVoiceForUser(userInfo || {} as UserInfo, difficulty);
      
      // STEP 5: Apply Character Enhancement
      pages = await Promise.all(pages.map(async (page, index) => {
        try {
          return await this.enhanceTemplateWithCharacters(
            page,
            userInfo || {} as UserInfo,
            characterPool,
            enhancedInputs,
            { currentPage: index + 1, totalPages: pages.length }
          );
        } catch (error) {
          console.warn(`⚠️ Character enhancement failed for page ${index + 1}:`, error);
          return page; // Return original page on error
        }
      }));
      
      // STEP 6: Apply Author Voice
      pages = pages.map((page, index) => {
        const isOpening = index === 0;
        const isClosing = index === pages.length - 1;
        const isTransition = !isOpening && !isClosing;
        
        try {
          if (isOpening) {
            return applyAuthorVoice(page, authorVoice, 'opening');
          } else if (isClosing) {
            return applyAuthorVoice(page, authorVoice, 'closing');
          } else if (isTransition) {
            return applyAuthorVoice(page, authorVoice, 'transition');
          }
        } catch (error) {
          console.warn(`⚠️ Author voice application failed for page ${index + 1}:`, error);
        }
        
        return page;
      });

      return pages;
    } catch (error) {
      console.warn(`⚠️ Template processing failed, returning basic template:`, error);
      // Fallback to basic name replacement
      return baseTemplate.map(page => 
        page.replace(/{userName}/g, userInfo?.name || 'I')
      );
    }
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
    
    // Process enhanced user inputs for richer personalization
    const { EnhancedInputProcessor } = await import('./enhancedInputProcessor');
    const processedInputs = await EnhancedInputProcessor.processUserInputsAdvanced(userInfo, difficulty);
    
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
    
    // STEP 3: Get Enhanced User Inputs for deeper story context (use both systems)
    console.log(`🔧 EnhancedTemplateManager: Processing Enhanced User Inputs for Level ${gradeLevel}`);
    const baseEnhancedInputs = InputEnhancementEngine.enhanceUserInputs(userInfo || {} as UserInfo);
    const enhancedInputs = { ...baseEnhancedInputs, ...processedInputs };
    
    // STEP 4: Select Author Voice for consistent storytelling
    console.log(`✍️ EnhancedTemplateManager: Selecting Author Voice for Level ${gradeLevel}`);
    const authorVoice = getAuthorVoiceForUser(userInfo || {} as UserInfo, difficulty);
    
    // STEP 5: Apply Character Details to Template (Levels 1-4 only)
    console.log(`🎭 EnhancedTemplateManager: Applying Character Details to Template for Level ${gradeLevel}`);
    try {
      // Enhance each template page with character details while preserving the template narrative
      pages = await Promise.all(pages.map(async (page, index) => {
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
        return await this.enhanceTemplateWithCharacters(
          page,
          userInfo || {} as UserInfo,
          characterPool,
          enhancedInputs,
          { currentPage: index + 1, totalPages: pages.length }
        );
      }));
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
   * Enhance template pages with contextual character integration (FIXED)
   * Replaces broken placeholder system with intelligent character enhancement
   */
  private static async enhanceTemplateWithCharacters(
    page: string,
    userInfo: UserInfo,
    characterPool: any,
    enhancedInputs: any,
    context: { currentPage: number; totalPages: number }
  ): Promise<string> {
    try {
      // Import the new contextual character enhancer
      const { ContextualCharacterEnhancer } = await import('./contextualCharacterEnhancer');
      
      // Determine difficulty level from grade
      const difficultyMapping = {
        'PreK': 'beginner' as DifficultyLevel,
        'K': 'beginner' as DifficultyLevel,
        '1st': 'easy' as DifficultyLevel,
        '2nd': 'easy' as DifficultyLevel,
        '3rd': 'medium' as DifficultyLevel,
        '4th': 'medium' as DifficultyLevel,
        '5th': 'hard' as DifficultyLevel,
        '6th+': 'hard' as DifficultyLevel
      };
      
      const difficulty = difficultyMapping[userInfo.grade] || 'easy';
      
      // Create enhancement context
      const enhancementContext = {
        currentPage: context.currentPage,
        totalPages: context.totalPages,
        gradeLevel: this.getGradeLevelNumber(userInfo.grade),
        templateTheme: 'general',
        storyProgression: this.getStoryProgression(context.currentPage, context.totalPages)
      };
      
      // Use new contextual enhancement system
      return ContextualCharacterEnhancer.enhanceTemplateWithContext(
        page,
        userInfo,
        difficulty,
        enhancementContext
      );
      
    } catch (error) {
      console.error('Contextual character enhancement failed:', error);
      
      // Fallback: return original page with basic userName replacement only
      // This prevents the broken placeholder system from corrupting content
      return page; // Templates already have {userName} replaced by TemplateVariableProcessor
    }
  }
  
  /**
   * Get numeric grade level for processing
   */
  private static getGradeLevelNumber(grade: string): number {
    const mapping = {
      'PreK': 0,
      'K': 0,
      '1st': 1,
      '2nd': 2,
      '3rd': 3,
      '4th': 4,
      '5th': 5,
      '6th+': 6
    };
    
    return mapping[grade as keyof typeof mapping] || 1;
  }
  
  /**
   * Determine story progression phase
   */
  private static getStoryProgression(currentPage: number, totalPages: number): 'opening' | 'development' | 'climax' | 'resolution' {
    const position = currentPage / totalPages;
    
    if (position < 0.25) return 'opening';
    if (position < 0.75) return 'development';
    if (position < 0.9) return 'climax';
    return 'resolution';
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
    
    // Clear enhanced template session storage for all grade levels
    try {
      const { MobileSessionManager } = require('./mobileSessionManager');
      const gradeLevels = [1, 2, 3, 4] as GradeLevel[];
      gradeLevels.forEach(gradeLevel => {
        MobileSessionManager.removeItem(this.getSessionStorageKey(gradeLevel));
      });
      console.log('🧹 Cleared enhanced template session storage for all grade levels');
    } catch (error) {
      console.warn('⚠️ Failed to clear enhanced template session storage:', error);
    }
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