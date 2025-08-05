// Enhanced Optimized Template Manager - Migrated to Grade-Based System
// Now uses the new Enhanced Template Manager as its core engine

import { UserInfo, DifficultyLevel } from '@/types';
import { EnhancedTemplateManager } from './enhancedTemplateManager';
import { 
  difficultyToGradeLevel,
  validateSentence 
} from '@/constants/gradeBased';

interface OptimizedTemplateOptions {
  userInfo?: UserInfo;
  difficulty: DifficultyLevel;
  isPremium?: boolean;
  templateIndex?: number;
}

interface OptimizedTemplateResult {
  pages: string[];
  templateIndex: number;
  gradeLevel: number;
  actualPages: number;
  targetPages: number;
  isPremium: boolean;
  vocabularyCompliant: boolean;
  validationErrors: string[];
  metadata: {
    difficulty: DifficultyLevel;
    wasExtended: boolean;
    extensionMethod?: string;
    systemVersion: 'enhanced-unified-v1';
  };
}

export class OptimizedTemplateManager {
  /**
   * Generate optimized story using Enhanced Template Manager
   * This is now a wrapper around the new grade-based system
   */
  static async generateOptimizedStory(options: OptimizedTemplateOptions): Promise<OptimizedTemplateResult> {
    const {
      userInfo,
      difficulty,
      isPremium = false,
      templateIndex
    } = options;

    try {
      // Use Enhanced Template Manager as the core engine
      const enhancedResult = await EnhancedTemplateManager.generateEnhancedStory({
        userInfo,
        difficulty,
        isPremium,
        templateIndex,
        enableExtensions: true
      });

      // Convert to OptimizedTemplateResult format for backward compatibility
      return {
        pages: enhancedResult.pages,
        templateIndex: enhancedResult.templateIndex,
        gradeLevel: enhancedResult.gradeLevel,
        actualPages: enhancedResult.actualPages,
        targetPages: enhancedResult.targetPages,
        isPremium: enhancedResult.isPremium,
        vocabularyCompliant: enhancedResult.vocabularyCompliant,
        validationErrors: enhancedResult.validationErrors,
        metadata: {
          difficulty,
          wasExtended: enhancedResult.metadata.wasExtended,
          extensionMethod: enhancedResult.metadata.extensionMethod,
          systemVersion: 'enhanced-unified-v1'
        }
      };

    } catch (error) {
      console.error('Error in OptimizedTemplateManager:', error);
      
      // Fallback to basic generation
      const fallbackResult = await EnhancedTemplateManager.generateEnhancedStory({
        userInfo: userInfo || { 
          name: 'Guest', 
          readingLevel: 'beginner',
          age: 5,
          grade: 'K',
          nativeLanguage: 'en',
          learningGoal: 'improve-english-reading',
          avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
          favoriteColor: 'blue',
          favoriteAnimal: 'cat',
          hobbies: 'reading',
          favoriteFood: 'pizza',
          specialRequest: ''
        },
        difficulty: 'beginner',
        isPremium: false,
        enableExtensions: false
      });

      return {
        pages: fallbackResult.pages,
        templateIndex: fallbackResult.templateIndex,
        gradeLevel: fallbackResult.gradeLevel,
        actualPages: fallbackResult.actualPages,
        targetPages: fallbackResult.targetPages,
        isPremium: false,
        vocabularyCompliant: fallbackResult.vocabularyCompliant,
        validationErrors: fallbackResult.validationErrors,
        metadata: {
          difficulty: 'beginner',
          wasExtended: false,
          extensionMethod: 'fallback',
          systemVersion: 'enhanced-unified-v1'
        }
      };
    }
  }

  /**
   * Get analytics - now uses Enhanced Template Manager
   */
  static getOptimizedAnalytics() {
    const enhancedAnalytics = EnhancedTemplateManager.getEnhancedAnalytics();
    
    return {
      ...enhancedAnalytics,
      systemVersion: 'enhanced-unified-v1',
      migratedToGradeBased: true,
      backwardCompatible: true
    };
  }

  /**
   * Clear session - now uses Enhanced Template Manager
   */
  static clearOptimizedSession(): void {
    EnhancedTemplateManager.clearSession();
  }

  /**
   * Get system health status
   */
  static getSystemHealth() {
    return EnhancedTemplateManager.getSystemHealth();
  }
}