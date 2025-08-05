// Optimized Template Manager - Phase 2 & 3 Implementation
// Handles 6-page templates and premium/free differentiation

import { UserInfo, DifficultyLevel } from '@/types';
import { getLevel0Template6Page, getLevel0TemplateCount } from '@/constants/level0Templates6Page';
import { validateByMode, VocabularyMode } from '@/constants/dolchPrePrimer';
import { SessionTemplateManager } from './sessionTemplateManager';

interface OptimizedTemplateOptions {
  userInfo?: UserInfo;
  difficulty: DifficultyLevel;
  isPremium?: boolean;
  vocabularyMode?: VocabularyMode;
  templateIndex?: number;
}

interface OptimizedTemplateResult {
  pages: string[];
  templateIndex: number;
  actualPages: number;
  targetPages: number;
  isPremium: boolean;
  vocabularyCompliant: boolean;
  validationErrors: string[];
  metadata: {
    difficulty: DifficultyLevel;
    vocabularyMode: VocabularyMode;
    wasExtended: boolean;
    extensionMethod?: string;
  };
}

export class OptimizedTemplateManager {
  // Premium page counts by difficulty (Phase 3)
  private static readonly PREMIUM_PAGE_COUNTS = {
    'beginner': 6,  // Level 0
    'easy': 8,
    'medium': 10,
    'hard': 12,
    'expert': 15
  } as const;

  // Free users get universal 10-page experience
  private static readonly FREE_PAGE_COUNT = 10;

  /**
   * Generate optimized story with proper page counts and vocabulary compliance
   */
  static async generateOptimizedStory(options: OptimizedTemplateOptions): Promise<OptimizedTemplateResult> {
    const {
      userInfo,
      difficulty,
      isPremium = false,
      vocabularyMode = 'enhanced-level0',
      templateIndex
    } = options;

    // Phase 3: Determine target page count
    const targetPages = isPremium 
      ? this.PREMIUM_PAGE_COUNTS[difficulty]
      : this.FREE_PAGE_COUNT;

    // Phase 2: Get 6-page template (no dynamic extension needed)
    let pages: string[];
    let selectedTemplateIndex: number;

    if (difficulty === 'beginner') {
      // Use Level 0 system
      selectedTemplateIndex = templateIndex ?? await this.getNextLevel0TemplateIndex();
      pages = getLevel0Template6Page(selectedTemplateIndex);
    } else {
      // For other levels, we'll need to implement similar 6-page template systems
      // For now, use Level 0 as fallback (this will be expanded)
      selectedTemplateIndex = templateIndex ?? await this.getNextLevel0TemplateIndex();
      pages = getLevel0Template6Page(selectedTemplateIndex);
    }

    // Handle page count adjustment if needed
    const actualPages = pages.length;
    let wasExtended = false;
    let extensionMethod: string | undefined;

    // If target pages != actual pages, we need to adjust
    if (targetPages !== actualPages) {
      if (targetPages > actualPages) {
        // Extend story intelligently
        pages = await this.extendStoryPages(pages, targetPages, userInfo, vocabularyMode);
        wasExtended = true;
        extensionMethod = 'intelligent-extension';
      } else {
        // Truncate to target (less common)
        pages = pages.slice(0, targetPages);
        extensionMethod = 'truncation';
      }
    }

    // Validate vocabulary compliance
    const validation = this.validateStoryVocabulary(pages, vocabularyMode, userInfo?.name);

    return {
      pages,
      templateIndex: selectedTemplateIndex,
      actualPages: pages.length,
      targetPages,
      isPremium,
      vocabularyCompliant: validation.isValid,
      validationErrors: validation.errors,
      metadata: {
        difficulty,
        vocabularyMode,
        wasExtended,
        extensionMethod
      }
    };
  }

  /**
   * Intelligent story extension that maintains vocabulary compliance
   */
  private static async extendStoryPages(
    originalPages: string[], 
    targetPages: number, 
    userInfo?: UserInfo,
    vocabularyMode: VocabularyMode = 'enhanced-level0'
  ): Promise<string[]> {
    const pagesToAdd = targetPages - originalPages.length;
    const extendedPages = [...originalPages];

    // Simple but effective extension strategy
    for (let i = 0; i < pagesToAdd; i++) {
      const lastPage = extendedPages[extendedPages.length - 1];
      const newPage = this.generateContinuationPage(lastPage, userInfo, vocabularyMode);
      extendedPages.push(newPage);
    }

    return extendedPages;
  }

  /**
   * Generate a continuation page that maintains vocabulary compliance
   */
  private static generateContinuationPage(
    lastPage: string, 
    userInfo?: UserInfo,
    vocabularyMode: VocabularyMode = 'enhanced-level0'
  ): string {
    const userName = userInfo?.name || 'I';
    
    // Simple continuation templates that maintain vocabulary compliance
    const continuationTemplates = [
      `${userName} had fun today.`,
      `${userName} learned something new.`,
      `${userName} smiled and laughed.`,
      `${userName} wants to play more.`,
      `${userName} loves this adventure.`,
      `${userName} will remember this day.`,
      `${userName} feels very happy.`,
      `${userName} cannot wait to return.`
    ];

    const randomTemplate = continuationTemplates[Math.floor(Math.random() * continuationTemplates.length)];
    
    // Validate the continuation page
    const validation = validateByMode(randomTemplate, vocabularyMode, userInfo?.name);
    
    if (validation.isValid) {
      return randomTemplate;
    }
    
    // Fallback to ultra-simple page
    return `${userName} is happy.`;
  }

  /**
   * Validate entire story for vocabulary compliance
   */
  private static validateStoryVocabulary(
    pages: string[], 
    vocabularyMode: VocabularyMode,
    userName?: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (let i = 0; i < pages.length; i++) {
      const validation = validateByMode(pages[i], vocabularyMode, userName);
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
   * Get next Level 0 template index with anti-repetition
   */
  private static async getNextLevel0TemplateIndex(): Promise<number> {
    const templateCount = getLevel0TemplateCount();
    return Math.floor(Math.random() * templateCount); // Simple random for now
  }

  /**
   * Get analytics for the optimized template system
   */
  static getOptimizedAnalytics() {
    return {
      level0Templates: getLevel0TemplateCount(),
      totalLevel0Pages: getLevel0TemplateCount() * 6,
      premiumPageCounts: this.PREMIUM_PAGE_COUNTS,
      freePageCount: this.FREE_PAGE_COUNT,
      sessionStats: { templatesUsed: 0, isRepeating: false } // Simplified for now
    };
  }

  /**
   * Clear session for testing
   */
  static clearOptimizedSession(): void {
    // Clear session logic here
  }
}