// Simplified Template Manager - Clean processing without complex enhancements
// Replaces EnhancedTemplateManager with reliable, straightforward processing

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
  // Template exhaustion tracking (similar to Level 0 pattern)
  private static usedBaseTemplates = new Map<DifficultyLevel, Set<number>>();
  private static usedExtensions = new Map<DifficultyLevel, Set<number>>();
  private static sessionData = new Map<DifficultyLevel, {
    phase: 'base' | 'extensions';
    totalGenerated: number;
  }>();
  /**
   * Generate a story with simplified processing - basic variable replacement only
   */
  static async generateStory(options: SimplifiedTemplateOptions): Promise<SimplifiedTemplateResult> {
    const {
      userInfo,
      difficulty,
      isPremium = false,
      templateIndex
    } = options;

    const gradeLevel = difficultyToGradeLevel(difficulty);
    const gradeInfo = GRADE_LEVEL_INFO[gradeLevel];
    
    console.log(`🎯 SimplifiedTemplateManager: Processing ${difficulty} (Level ${gradeLevel})`);
    
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
    
    // Validate vocabulary compliance
    const validation = this.validateStoryVocabulary(pages, gradeLevel, userInfo?.name);
    
    // If validation fails, use simple fallback
    if (!validation.isValid) {
      console.warn(`⚠️ Vocabulary validation failed for ${difficulty}, using fallback`);
      pages = this.generateSimpleFallback(gradeLevel, userInfo?.name || 'I');
    }
    
    console.log(`✅ SimplifiedTemplateManager: Generated ${pages.length} pages for ${difficulty}`);
    
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
   * Continue an existing story with simple processing
   */
  static async continueStory(options: SimplifiedTemplateOptions & { targetPages?: number }): Promise<SimplifiedTemplateResult> {
    const { targetPages = 5, ...generateOptions } = options;
    const { userInfo, difficulty, isPremium = false } = generateOptions;
    
    const gradeLevel = difficultyToGradeLevel(difficulty);
    
    console.log(`🔄 SimplifiedTemplateManager: Continuing story for ${difficulty} with ${targetPages} pages`);
    
    // For simplicity, generate a new story segment
    const result = await this.generateStory(generateOptions);
    
    // Trim or extend to target pages
    let pages = result.pages;
    if (pages.length > targetPages) {
      pages = pages.slice(0, targetPages);
    } else if (pages.length < targetPages) {
      // Add simple continuation pages
      const userName = userInfo?.name || 'I';
      while (pages.length < targetPages) {
        pages.push(`${userName} continues the adventure.`);
      }
    }
    
    return {
      ...result,
      pages,
      actualPages: pages.length,
      targetPages
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
   * Validate story vocabulary against grade level
   */
  private static validateStoryVocabulary(
    pages: string[], 
    gradeLevel: GradeLevel, 
    userName?: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    let isValid = true;
    
    pages.forEach((page, index) => {
      const validation = validateSentence(page, gradeLevel, userName);
      if (!validation.isValid) {
        errors.push(`Page ${index + 1}: ${validation.invalidWords.join(', ')}`);
        isValid = false;
      }
    });
    
    return { isValid, errors };
  }
  
  /**
   * Generate simple fallback content by grade level
   */
  private static generateSimpleFallback(gradeLevel: GradeLevel, userName: string): string[] {
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
        `${userName} begins an exciting project at school.`,
        `Research and preparation take several weeks of hard work.`,
        `Challenges arise that require creative problem-solving skills.`,
        `With determination and help from others, progress is made.`,
        `The completed project brings satisfaction and valuable learning.`
      ],
      4: [
        `${userName} embarks on a challenging academic endeavor.`,
        `The project requires extensive research and analysis.`,
        `Complex problems emerge that demand innovative solutions.`,
        `Collaboration with mentors provides guidance and support.`,
        `The experience demonstrates growth and academic achievement.`
      ]
    };
    
    return fallbacks[gradeLevel] || fallbacks[1];
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
   * Select next template using exhaustion logic with randomization and safety limits
   */
  private static selectNextTemplate(difficulty: DifficultyLevel, preferredIndex?: number): {
    pages: string[];
    templateIndex: number;
    source: 'base' | 'extension';
  } {
    const MAX_SELECTION_ATTEMPTS = 1000; // Safety limit to prevent infinite loops
    
    // Initialize tracking for this difficulty if needed
    if (!this.usedBaseTemplates.has(difficulty)) {
      this.usedBaseTemplates.set(difficulty, new Set());
      this.usedExtensions.set(difficulty, new Set());
      this.sessionData.set(difficulty, { phase: 'base', totalGenerated: 0 });
      console.log(`🚀 SimplifiedTemplateManager: Initialized tracking for ${difficulty}`);
    }

    const usedBase = this.usedBaseTemplates.get(difficulty)!;
    const usedExt = this.usedExtensions.get(difficulty)!;
    const session = this.sessionData.get(difficulty)!;

    // Get base templates count (40 for each difficulty)
    const baseTemplates = DIFFICULTY_APPROPRIATE_TEMPLATES[difficulty];
    const baseCount = baseTemplates.length;

    // Get extension templates based on difficulty level
    const extensionTemplates = this.getExtensionTemplates(difficulty);
    const extensionCount = extensionTemplates.length;

    console.log(`📊 Template State for ${difficulty}: Base ${usedBase.size}/${baseCount}, Extensions ${usedExt.size}/${extensionCount}, Phase: ${session.phase}`);

    let selectedIndex: number;
    let pages: string[];
    let source: 'base' | 'extension';

    // Phase 1: Use base templates (40 templates) with randomization
    if (session.phase === 'base' && usedBase.size < baseCount) {
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
        session.phase = 'extensions';
        console.log(`🔄 All base templates exhausted for ${difficulty} - moving to extensions phase`);
      }
    }
    // Phase 2: Use extension templates (5 templates) with randomization
    else if (session.phase === 'extensions' && usedExt.size < extensionCount) {
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
        this.resetExhaustion(difficulty);
      }
    }
    // Fallback: cycle back to base templates with safety check
    else {
      console.log(`🔄 Fallback triggered for ${difficulty} - cycling back to base templates`);
      this.resetExhaustion(difficulty);
      
      // Safety check - ensure we have base templates
      if (baseCount === 0) {
        throw new Error(`No base templates available for ${difficulty}`);
      }
      
      selectedIndex = Math.floor(Math.random() * baseCount);
      const updatedUsedBase = this.usedBaseTemplates.get(difficulty)!;
      updatedUsedBase.add(selectedIndex);
      pages = [...baseTemplates[selectedIndex]];
      source = 'base';
      
      console.log(`✅ Fallback selected random base template ${selectedIndex} for ${difficulty}`);
    }

    session.totalGenerated++;
    
    console.log(`📈 Template selection complete for ${difficulty}: Index ${selectedIndex}, Source: ${source}, Total generated: ${session.totalGenerated}`);
    
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
    this.usedBaseTemplates.set(difficulty, new Set());
    this.usedExtensions.set(difficulty, new Set());
    this.sessionData.set(difficulty, { phase: 'base', totalGenerated: 0 });
    console.log(`🔄 SimplifiedTemplateManager: Reset exhaustion for ${difficulty} - cycling back to base templates`);
  }

  /**
   * Get analytics for template usage
   */
  static getTemplateAnalytics(difficulty?: DifficultyLevel): any {
    if (difficulty) {
      const usedBase = this.usedBaseTemplates.get(difficulty)?.size || 0;
      const usedExt = this.usedExtensions.get(difficulty)?.size || 0;
      const session = this.sessionData.get(difficulty) || { phase: 'base', totalGenerated: 0 };
      
      return {
        difficulty,
        usedBaseTemplates: usedBase,
        usedExtensions: usedExt,
        totalGenerated: session.totalGenerated,
        currentPhase: session.phase,
        exhaustionRate: {
          base: `${usedBase}/40`,
          extensions: `${usedExt}/5`
        }
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
    this.usedBaseTemplates.clear();
    this.usedExtensions.clear();
    this.sessionData.clear();
    console.log('🔄 SimplifiedTemplateManager: Session cleared - all exhaustion tracking reset');
  }
}