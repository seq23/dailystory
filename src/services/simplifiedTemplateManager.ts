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

import { getDifficultyAppropriateTemplate, validateDifficultyCompliance } from '@/constants/difficultyAppropriateTemplates';

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
    
    // Use DIFFICULTY_APPROPRIATE_TEMPLATES as primary source for Levels 1-4
    let pages: string[];
    let selectedIndex: number;
    
    try {
      // Get template from DIFFICULTY_APPROPRIATE_TEMPLATES
      const template = getDifficultyAppropriateTemplate(difficulty, templateIndex, userInfo);
      pages = template;
      selectedIndex = templateIndex ?? 0;
      
      console.log(`✅ SimplifiedTemplateManager: Using DIFFICULTY_APPROPRIATE_TEMPLATES for ${difficulty}`);
    } catch (error) {
      console.warn(`⚠️ Fallback to unified templates for ${difficulty}:`, error);
      
      // Fallback to unified template system
      const { templateIndex: fallbackIndex, template: fallbackTemplate } = selectTemplate(
        gradeLevel,
        [],
        templateIndex
      );
      
      pages = fallbackTemplate;
      selectedIndex = fallbackIndex;
    }
    
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
    
    return pages.map(page => {
      let processed = page
        .replace(/\{userName\}/g, userName)
        .replace(/\{favoriteAnimal\}/g, favoriteAnimal)
        .replace(/\{favoriteColor\}/g, favoriteColor)
        .replace(/\{animal\}/g, favoriteAnimal)
        .replace(/\{color\}/g, favoriteColor);
      
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
   * Clear any cached data
   */
  static clearSession(): void {
    console.log('🔄 SimplifiedTemplateManager: Session cleared');
  }
}