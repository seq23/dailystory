// Simplified Template Manager - Clean processing without complex enhancements
// Replaces EnhancedTemplateManager with reliable, straightforward processing

import { UserInfo, DifficultyLevel } from '@/types';
import { 
  GradeLevel, 
  difficultyToGradeLevel,
  validateSentence,
  GRADE_LEVEL_INFO
} from '@/constants/gradeBased';
import { TemplateDebugger } from './templateDebugger';

import {
  selectTemplate,
  getTargetPageCount,
  getTemplateByGradeLevel,
  getTemplateCountByGradeLevel
} from '@/constants/gradeBased/unifiedTemplateSystem';

import { getDifficultyAppropriateTemplate, validateDifficultyCompliance, DIFFICULTY_APPROPRIATE_TEMPLATES } from '@/constants/difficultyAppropriateTemplates';

// Import existing extension templates  
import { getAllLevel1Extensions } from '@/constants/gradeBased/level1ExtensionTemplates';
import { getAllLevel2Extensions } from '@/constants/gradeBased/level2ExtensionTemplates';
import { getAllLevel3Extensions } from '@/constants/gradeBased/level3ExtensionTemplates';
import { getAllLevel4Extensions } from '@/constants/gradeBased/level4ExtensionTemplates';

interface SimplifiedTemplateOptions {
  userInfo?: UserInfo;
  difficulty: DifficultyLevel;
  isPremium?: boolean;
  templateIndex?: number;
}

interface SimplifiedTemplateResult {
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
    systemVersion: 'simplified-v1';
  };
}

export class SimplifiedTemplateManager {
  // Persistent template exhaustion tracking using sessionStorage
  private static readonly STORAGE_PREFIX = 'simplified_template_manager_';
  
  /**
   * Get persistent session data from sessionStorage
   */
  private static getSessionData(difficulty: DifficultyLevel): {
    usedBaseTemplates: Set<number>;
    usedExtensions: Set<number>;
    phase: 'base' | 'extensions';
    totalGenerated: number;
    currentTemplateIndex: number;
    currentPageIndex: number;
    currentTemplatePages: string[];
  } {
    try {
      const key = `${this.STORAGE_PREFIX}${difficulty}`;
      const stored = sessionStorage.getItem(key);
      
      if (stored) {
        const data = JSON.parse(stored);
        return {
          usedBaseTemplates: new Set(data.usedBaseTemplates || []),
          usedExtensions: new Set(data.usedExtensions || []),
          phase: data.phase || 'base',
          totalGenerated: data.totalGenerated || 0,
          currentTemplateIndex: data.currentTemplateIndex || -1,
          currentPageIndex: data.currentPageIndex || 0,
          currentTemplatePages: data.currentTemplatePages || []
        };
      }
    } catch (error) {
      console.warn('⚠️ SimplifiedTemplateManager: Failed to load session data from storage:', error);
    }
    
    // Return default empty state
    return {
      usedBaseTemplates: new Set(),
      usedExtensions: new Set(),
      phase: 'base',
      totalGenerated: 0,
      currentTemplateIndex: -1,
      currentPageIndex: 0,
      currentTemplatePages: []
    };
  }
  
  /**
   * Save session data to sessionStorage
   */
  private static saveSessionData(difficulty: DifficultyLevel, data: {
    usedBaseTemplates: Set<number>;
    usedExtensions: Set<number>;
    phase: 'base' | 'extensions';
    totalGenerated: number;
    currentTemplateIndex: number;
    currentPageIndex: number;
    currentTemplatePages: string[];
  }): void {
    try {
      const key = `${this.STORAGE_PREFIX}${difficulty}`;
      const serializable = {
        usedBaseTemplates: Array.from(data.usedBaseTemplates),
        usedExtensions: Array.from(data.usedExtensions),
        phase: data.phase,
        totalGenerated: data.totalGenerated,
        currentTemplateIndex: data.currentTemplateIndex,
        currentPageIndex: data.currentPageIndex,
        currentTemplatePages: data.currentTemplatePages,
        lastUpdated: Date.now()
      };
      
      sessionStorage.setItem(key, JSON.stringify(serializable));
      console.log(`💾 SimplifiedTemplateManager: Saved session data for ${difficulty}:`, {
        baseUsed: data.usedBaseTemplates.size,
        extensionsUsed: data.usedExtensions.size,
        phase: data.phase,
        totalGenerated: data.totalGenerated
      });
    } catch (error) {
      console.warn('⚠️ SimplifiedTemplateManager: Failed to save session data to storage:', error);
    }
  }
  /**
   * Generate a story with simplified processing - basic variable replacement only
   */
  static async generateStory(options: SimplifiedTemplateOptions): Promise<SimplifiedTemplateResult> {
    // Reset page tracker for new story session
    const { SessionPageTracker } = await import('./sessionPageTracker');
    SessionPageTracker.resetSession();
    
    const {
      userInfo,
      difficulty,
      isPremium = false,
      templateIndex
    } = options;

    console.log('🎯 SimplifiedTemplateManager: === STORY GENERATION START ===');
    console.log('📋 SimplifiedTemplateManager: Options received:', {
      difficulty,
      hasUserInfo: !!userInfo,
      userName: userInfo?.name || 'NO_NAME',
      templateType: 'initial_generation'
    });

    const gradeLevel = difficultyToGradeLevel(difficulty);
    const gradeInfo = GRADE_LEVEL_INFO[gradeLevel];
    
    console.log(`🎯 SimplifiedTemplateManager: Processing ${difficulty} (Level ${gradeLevel})`);
    console.log('📊 SimplifiedTemplateManager: Current template usage before generation:', this.getTemplateAnalytics(difficulty));
    
    // Level 0 should never reach this manager
    if (gradeLevel === 0) {
      throw new Error('Level 0 content should be processed by Level0StoryProcessor');
    }
    
    // Use template exhaustion logic - base templates first, then extensions
    const selection = this.selectNextTemplate(difficulty, templateIndex);
    let pages = selection.pages;
    let selectedIndex = selection.templateIndex;
    
    console.log(`✅ SimplifiedTemplateManager: Using ${selection.source} template ${selectedIndex} for ${difficulty}`);
    
    // Simple variable replacement - no complex character enhancement
    pages = this.processSimpleVariables(pages, userInfo);
    
    // Store the PROCESSED template in session for future continuation
    const sessionData = this.getSessionData(difficulty);
    sessionData.currentTemplateIndex = selectedIndex;
    sessionData.currentPageIndex = 1; // Only used 1 page so far
    sessionData.currentTemplatePages = [...pages]; // Store processed pages, not raw template
    this.saveSessionData(difficulty, sessionData);
    
    // Validate vocabulary compliance
    const validation = await this.validateStoryVocabulary(pages, gradeLevel, userInfo?.name);
    
    // If validation fails, use simple fallback
    if (!validation.isValid) {
      console.warn(`🚨 AUTHOR VOICE LOST: Vocabulary validation failed for ${difficulty}, using fallback instead of rich templates`);
      console.warn(`   💔 Original author voice content: "${pages[0]}"`);
      pages = this.generateSimpleFallback(gradeLevel, userInfo?.name || 'I');
      console.warn(`   📝 Fallback content: "${pages[0]}"`);
    }
    
    console.log(`✅ SimplifiedTemplateManager: Generated ${pages.length} pages for ${difficulty}`);
    
    // Log usage for debugging
    TemplateDebugger.logTemplateUsage({
      manager: 'SimplifiedTemplateManager',
      difficulty,
      templateIndex: selectedIndex,
      templatePreview: pages?.[0]?.substring(0, 50) || 'NO_PREVIEW',
      userName: userInfo?.name,
      phase: 'generation'
    });
    
    console.log('🎯 SimplifiedTemplateManager: === STORY GENERATION COMPLETE ===');
    
    return {
      pages,
      templateIndex: selectedIndex,
      gradeLevel,
      actualPages: pages.length,
      targetPages: pages.length,
      isPremium,
      vocabularyCompliant: validation.isValid,
      validationErrors: validation.errors,
      metadata: {
        difficulty,
        gradeInfo,
        systemVersion: 'simplified-v1'
      }
    };
  }
  
  /**
   * Continue an existing story with proper template continuation
   */
  static async continueStory(options: SimplifiedTemplateOptions & { targetPages?: number }): Promise<SimplifiedTemplateResult> {
    const { targetPages = 5, ...generateOptions } = options;
    const { userInfo, difficulty, isPremium = false } = generateOptions;
    
    console.log('🔄 SimplifiedTemplateManager: === STORY CONTINUATION START ===');
    console.log('📋 SimplifiedTemplateManager: Continuation options:', {
      difficulty,
      targetPages,
      hasUserInfo: !!userInfo,
      userName: userInfo?.name || 'NO_NAME'
    });
    
    const gradeLevel = difficultyToGradeLevel(difficulty);
    const gradeInfo = GRADE_LEVEL_INFO[gradeLevel];
    
    console.log(`🔄 SimplifiedTemplateManager: Continuing story for ${difficulty} with ${targetPages} pages`);
    console.log('📊 SimplifiedTemplateManager: Template usage before continuation:', this.getTemplateAnalytics(difficulty));
    
    // Get session data to check current template state
    const sessionData = this.getSessionData(difficulty);
    let pages: string[] = [];
    let templateIndex = sessionData.currentTemplateIndex;
    
    // Continue generating pages until we have targetPages
    while (pages.length < targetPages) {
      // Check if we have pages remaining in current template
      if (sessionData.currentTemplatePages.length > sessionData.currentPageIndex) {
        // Use remaining pages from current template
        const remainingPages = sessionData.currentTemplatePages.slice(sessionData.currentPageIndex);
        const neededPages = Math.min(remainingPages.length, targetPages - pages.length);
        
        pages.push(...remainingPages.slice(0, neededPages));
        sessionData.currentPageIndex += neededPages;
        
        console.log(`📄 Used ${neededPages} pages from current template ${templateIndex}, page index now ${sessionData.currentPageIndex}`);
      } else {
        // Current template exhausted, get next template
        const selection = this.selectNextTemplate(difficulty);
        const newPages = this.processSimpleVariables(selection.pages, userInfo);
        
        // Update session with new template
        sessionData.currentTemplateIndex = selection.templateIndex;
        sessionData.currentTemplatePages = newPages;
        sessionData.currentPageIndex = 0;
        templateIndex = selection.templateIndex;
        
        console.log(`🔄 Started new template ${templateIndex} from ${selection.source}`);
        
        // Add pages from new template
        const neededPages = Math.min(newPages.length, targetPages - pages.length);
        pages.push(...newPages.slice(0, neededPages));
        sessionData.currentPageIndex = neededPages;
        
        console.log(`📄 Used ${neededPages} pages from new template ${templateIndex}`);
      }
    }
    
    // Save updated session state
    this.saveSessionData(difficulty, sessionData);
    
    // Validate vocabulary compliance
    const validation = await this.validateStoryVocabulary(pages, gradeLevel, userInfo?.name);
    
    console.log(`✅ SimplifiedTemplateManager: Generated ${pages.length} continuation pages for ${difficulty}`);
    
    return {
      pages,
      templateIndex,
      gradeLevel,
      actualPages: pages.length,
      targetPages,
      isPremium,
      vocabularyCompliant: validation.isValid,
      validationErrors: validation.errors,
      metadata: {
        difficulty,
        gradeInfo,
        systemVersion: 'simplified-v1'
      }
    };
  }
  
  /**
   * Simple variable replacement without complex character enhancement
   */
  private static processSimpleVariables(pages: string[], userInfo?: UserInfo): string[] {
    const userName = userInfo?.name || 'I';
    const favoriteAnimal = userInfo?.favoriteAnimal || 'dog';
    const favoriteColor = userInfo?.favoriteColor || 'blue';
    const favoriteFood = userInfo?.favoriteFood || 'pizza';
    
    return pages.map(page => {
      let processed = page
        // Handle DIFFICULTY_APPROPRIATE_TEMPLATES format
        .replace(/\{name\}/g, userName)
        .replace(/\{userName\}/g, userName)
        .replace(/\{animal\}/g, favoriteAnimal)
        .replace(/\{favoriteAnimal\}/g, favoriteAnimal)
        .replace(/\{color\}/g, favoriteColor)
        .replace(/\{favoriteColor\}/g, favoriteColor)
        .replace(/\{food\}/g, favoriteFood)
        .replace(/\{object\}/g, 'toy')
        .replace(/\{pronoun\}/g, userName === 'I' ? 'I' : (userName.endsWith('a') ? 'She' : 'He'));
      
      return processed;
    });
  }
  
  /**
   * Validate story vocabulary against grade level with context-aware relaxation for Level 3+
   */
  private static async validateStoryVocabulary(
    pages: string[], 
    gradeLevel: GradeLevel, 
    userName?: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    console.log(`🔍 VOCABULARY VALIDATION: Checking ${pages.length} pages for Grade Level ${gradeLevel}`);
    
    // Use relaxed validation for Level 3+ (GradeLevel 3 corresponds to hard difficulty)
    if (gradeLevel >= 3) {
      console.log(`🎭 RELAXED VALIDATION: Using context-aware validation for Level ${gradeLevel}`);
      return await this.validateWithRelaxedStandards(pages, gradeLevel, userName);
    }
    
    const errors: string[] = [];
    let isValid = true;
    
    pages.forEach((page, index) => {
      console.log(`📄 Validating page ${index + 1}: "${page}"`);
      
      const validation = validateSentence(page, gradeLevel, userName);
      
      if (!validation.isValid) {
        console.log(`❌ AUTHOR VOICE BLOCKED: Page ${index + 1} failed validation!`);
        console.log(`   🚫 Invalid words: ${validation.invalidWords.join(', ')}`);
        console.log(`   🔍 Expected words for Level ${gradeLevel} author voice: opportunity, curiosity, experiment, adventure, realized`);
        console.log(`   📝 This is likely why Level ${gradeLevel} author voice isn't appearing`);
        errors.push(`Page ${index + 1}: ${validation.invalidWords.join(', ')}`);
        isValid = false;
      } else {
        console.log(`✅ Page ${index + 1} passed validation - author voice preserved!`);
      }
    });
    
    if (!isValid) {
      console.log(`🚨 AUTHOR VOICE FAILURE: Level ${gradeLevel} templates failed validation, falling back to generic content`);
    } else {
      console.log(`🎭 AUTHOR VOICE SUCCESS: Level ${gradeLevel} templates validated successfully!`);
    }
    
    return { isValid, errors };
  }

  /**
   * Relaxed validation for Level 3+ using context-aware simplifiers
   */
  private static async validateWithRelaxedStandards(pages: string[], gradeLevel: GradeLevel, userName?: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    console.log(`🎭 CONTEXT-AWARE VALIDATION: Processing ${pages.length} pages with relaxed standards`);
    
    const errors: string[] = [];
    let allValid = true;
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      let result;
      
      console.log(`📄 RELAXED CHECK: Page ${i + 1}: "${page}"`);
      
      // Use appropriate simplifier based on grade level (GradeLevel is 0|1|2|3, but we're checking levels 3+)
      if (gradeLevel === 3) {
        const { Level3Simplifier } = await import('@/services/level3Simplifier');
        result = Level3Simplifier.simplifyForLevel3(page, userName || '');
      } else if (gradeLevel >= 4) {
        // For any level 4+ (if they exist), use Level 4 simplifier
        const { Level4Simplifier } = await import('@/services/level4Simplifier');
        result = Level4Simplifier.simplifyForLevel4(page, userName || '');
      } else {
        // Fallback for unexpected grade levels
        console.warn(`⚠️ Unexpected grade level ${gradeLevel} in relaxed validation`);
        continue;
      }
      
      if (result.wasSimplified) {
        console.log(`❌ RELAXED VALIDATION FAILED: Page ${i + 1} exceeds even relaxed standards`);
        allValid = false;
        errors.push(`Page ${i + 1}: Story complexity exceeds relaxed standards`);
      } else {
        console.log(`✅ RELAXED VALIDATION PASSED: Page ${i + 1} - Strategy: ${result.strategyUsed}, Context words: ${result.contextAllowed?.length || 0}`);
      }
    }
    
    console.log(`🎯 RELAXED VALIDATION COMPLETE: ${allValid ? 'PASSED' : 'FAILED'} for Grade Level ${gradeLevel}`);
    return { isValid: allValid, errors };
  }
  
  /**
   * Generate enhanced fallback content with author voice patterns for Level 3+
   */
  private static generateSimpleFallback(gradeLevel: GradeLevel, userName: string): string[] {
    console.log(`🎭 ENHANCED FALLBACK: Generating Level ${gradeLevel} fallback with author voice patterns`);
    
    const fallbacks = {
      1: [
        `${userName} goes to the park.`,
        `${userName} sees a big tree.`,
        `${userName} plays with friends.`,
        `${userName} has a good day.`,
        `${userName} goes home happy.`
      ],
      2: [
        `${userName} starts a new adventure today.`,
        `Something interesting happens at school.`,
        `${userName} makes an important decision.`,
        `Friends help ${userName} solve the problem.`,
        `Everything works out well in the end.`
      ],
      3: [
        // Level 3+ includes Purple Pattern author voice elements
        `If you give ${userName} a creative opportunity...`,
        `That will remind them of their curiosity about amazing discoveries.`,
        `So they will want to investigate mysteries that fascinate everyone.`,
        `Which means they will need careful research and helpful friends.`,
        `And chances are, they will want another adventure - which will remind them how this all started.`
      ],
      4: [
        // Level 4 uses advanced Purple Pattern author voice 
        `If you give ${userName} a challenging academic opportunity...`,
        `That will remind them of their curiosity about complex problems and fascinating solutions.`,
        `So they will want to investigate advanced theories that challenge conventional thinking.`,
        `Which means they will need extensive research and collaboration with expert mentors.`,
        `And chances are, they will want another intellectual challenge - which will remind them how this all started.`
      ]
    };
    
    const result = fallbacks[gradeLevel] || fallbacks[1];
    console.log(`🎭 ENHANCED FALLBACK SUCCESS: Generated ${result.length} pages with ${gradeLevel >= 3 ? 'AUTHOR VOICE' : 'simple'} patterns`);
    
    return result;
  }
  
  /**
   * Get system health status
   */
  static getSystemHealth(): any {
    return {
      status: 'healthy',
      version: 'simplified-v1',
      templatesAvailable: true,
      processingMethod: 'simple-variable-replacement'
    };
  }
  
   /**
    * Select next template using persistent exhaustion logic with enhanced randomization
    */
   private static selectNextTemplate(difficulty: DifficultyLevel, preferredIndex?: number): {
     pages: string[];
     templateIndex: number;
     source: 'base' | 'extension';
   } {
     const MAX_SELECTION_ATTEMPTS = 1000; // Safety limit to prevent infinite loops
     
     // Load persistent session data
     const sessionData = this.getSessionData(difficulty);
     const { usedBaseTemplates: usedBase, usedExtensions: usedExt } = sessionData;
     let { phase, totalGenerated } = sessionData;
     
     console.log(`🚀 SimplifiedTemplateManager: Loaded persistent data for ${difficulty}:`, {
       baseUsed: usedBase.size,
       extensionsUsed: usedExt.size,
       phase,
       totalGenerated
     });

    // Get base templates count (40 for each difficulty)
    const baseTemplates = DIFFICULTY_APPROPRIATE_TEMPLATES[difficulty];
    const baseCount = baseTemplates.length;

    // Get extension templates based on difficulty level
    const extensionTemplates = this.getExtensionTemplates(difficulty);
    const extensionCount = extensionTemplates.length;

    console.log(`📊 Template State for ${difficulty}: Base ${usedBase.size}/${baseCount}, Extensions ${usedExt.size}/${extensionCount}, Phase: ${phase}`);

    let selectedIndex: number;
    let pages: string[];
    let source: 'base' | 'extension';

     // Phase 1: Use base templates (40 templates) with enhanced randomization
     if (phase === 'base' && usedBase.size < baseCount) {
      if (preferredIndex !== undefined && !usedBase.has(preferredIndex) && preferredIndex < baseCount) {
        selectedIndex = preferredIndex;
        console.log(`🎯 Using preferred base template ${selectedIndex} for ${difficulty}`);
      } else {
        // Randomized selection from unused base templates
        const availableIndices = Array.from({ length: baseCount }, (_, i) => i)
          .filter(i => !usedBase.has(i));
        
        if (availableIndices.length === 0) {
          throw new Error(`No available base templates for ${difficulty} - this should not happen`);
        }
        
        selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        console.log(`🎲 Randomly selected base template ${selectedIndex} from ${availableIndices.length} available for ${difficulty}`);
      }
      
      usedBase.add(selectedIndex);
      pages = [...baseTemplates[selectedIndex]];
      source = 'base';

      console.log(`✅ Selected base template ${selectedIndex} - Progress: ${usedBase.size}/${baseCount} base templates used`);

       // If all base templates used, move to extension phase
       if (usedBase.size >= baseCount) {
         phase = 'extensions';
         console.log(`🔄 All base templates exhausted for ${difficulty} - moving to extensions phase`);
       }
    }
     // Phase 2: Use extension templates (5 templates) with enhanced randomization
     else if (phase === 'extensions' && usedExt.size < extensionCount) {
      // Randomized selection from unused extension templates
      const availableExtIndices = Array.from({ length: extensionCount }, (_, i) => i)
        .filter(i => !usedExt.has(i));
      
      if (availableExtIndices.length === 0) {
        throw new Error(`No available extension templates for ${difficulty} - this should not happen`);
      }
      
      selectedIndex = availableExtIndices[Math.floor(Math.random() * availableExtIndices.length)];
      console.log(`🎲 Randomly selected extension template ${selectedIndex} from ${availableExtIndices.length} available for ${difficulty}`);
      
      usedExt.add(selectedIndex);
      pages = [...extensionTemplates[selectedIndex]];
      source = 'extension';

      console.log(`✅ Selected extension template ${selectedIndex} - Progress: ${usedExt.size}/${extensionCount} extension templates used`);

       // If all extensions used, cycle back to base templates
       if (usedExt.size >= extensionCount) {
         console.log(`🔄 All extension templates exhausted for ${difficulty} - cycling back to base templates`);
         // Reset and update local variables
         usedBase.clear();
         usedExt.clear();
         phase = 'base';
         totalGenerated = 0;
         console.log(`✨ SimplifiedTemplateManager: Reset cycle complete for ${difficulty}`);
       }
    }
     // Fallback: cycle back to base templates with safety check
     else {
       console.log(`🔄 Fallback triggered for ${difficulty} - cycling back to base templates`);
       
       // Reset and update local variables
       usedBase.clear();
       usedExt.clear();
       phase = 'base';
       totalGenerated = 0;
       
       // Safety check - ensure we have base templates
       if (baseCount === 0) {
         throw new Error(`No base templates available for ${difficulty}`);
       }
       
       selectedIndex = Math.floor(Math.random() * baseCount);
       usedBase.add(selectedIndex);
       pages = [...baseTemplates[selectedIndex]];
       source = 'base';
       
       console.log(`✅ Fallback selected random base template ${selectedIndex} for ${difficulty}`);
     }

     totalGenerated++;
     
      // Save updated session data to persistent storage
      this.saveSessionData(difficulty, {
        usedBaseTemplates: usedBase,
        usedExtensions: usedExt,
        phase,
        totalGenerated,
        currentTemplateIndex: selectedIndex,
        currentPageIndex: 0,
        currentTemplatePages: pages
      });
     
     console.log(`📈 Template selection complete for ${difficulty}: Index ${selectedIndex}, Source: ${source}, Total generated: ${totalGenerated}`);
    
    return { pages, templateIndex: selectedIndex, source };
  }

  /**
   * Get extension templates for a difficulty level
   */
  private static getExtensionTemplates(difficulty: DifficultyLevel): string[][] {
    switch (difficulty) {
      case 'easy': return getAllLevel1Extensions();
      case 'medium': return getAllLevel2Extensions();
      case 'hard': return getAllLevel3Extensions();
      case 'expert': return getAllLevel4Extensions();
      default: return []; // beginner uses Level 0 processor, not this manager
    }
  }

   /**
    * Reset exhaustion state and cycle back to base templates
    */
   private static resetExhaustion(difficulty: DifficultyLevel): void {
     const resetData = {
       usedBaseTemplates: new Set<number>(),
       usedExtensions: new Set<number>(),
       phase: 'base' as const,
       totalGenerated: 0,
       currentTemplateIndex: -1,
       currentPageIndex: 0,
       currentTemplatePages: []
     };
     
     this.saveSessionData(difficulty, resetData);
     console.log(`🔄 SimplifiedTemplateManager: Reset exhaustion for ${difficulty} - cycling back to base templates`);
   }

  /**
   * Get analytics for template usage
   */
   static getTemplateAnalytics(difficulty?: DifficultyLevel): any {
     if (difficulty) {
       const sessionData = this.getSessionData(difficulty);
       const usedBase = sessionData.usedBaseTemplates.size;
       const usedExt = sessionData.usedExtensions.size;
       
       return {
         difficulty,
         usedBaseTemplates: usedBase,
         usedExtensions: usedExt,
         totalGenerated: sessionData.totalGenerated,
         currentPhase: sessionData.phase,
         exhaustionRate: {
           base: `${usedBase}/40`,
           extensions: `${usedExt}/5`
         },
         persistentStorage: true
       };
     }

    // Return analytics for all difficulties
    const allDifficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
    return allDifficulties.reduce((acc, diff) => {
      acc[diff] = this.getTemplateAnalytics(diff);
      return acc;
    }, {} as Record<string, any>);
  }

   /**
    * Clear session data and reset exhaustion tracking
    */
   static clearSession(): void {
     const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
     
     difficulties.forEach(difficulty => {
       try {
         const key = `${this.STORAGE_PREFIX}${difficulty}`;
         sessionStorage.removeItem(key);
       } catch (error) {
         console.warn(`⚠️ Failed to clear session storage for ${difficulty}:`, error);
       }
     });
     
     console.log('🔄 SimplifiedTemplateManager: Session cleared - all exhaustion tracking reset from persistent storage');
   }
}