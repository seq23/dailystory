// Netflix-style Story Generation Service
// Generates full stories with AI quality preference

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getTokenLimitForDifficulty, STORY_PROMPTS, EXPERT_STORY_PROMPTS, getStoryPrompt, getExpertStoryPrompt, formatUserPrompt } from '../../supabase/functions/_shared/storyPrompts';
import { ErrorHandler } from '@/utils/errorHandling';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { DiagnosticTool } from '@/utils/diagnostics';
import { ErrorHandlingManager } from '@/services/errorHandlingManager';
import { APP_CONFIG } from '@/config/appConfig';
import { toast } from '@/hooks/use-toast';

export interface NetflixStoryResult {
  content: string[];
  pageCount: number;
  source: 'ai' | 'fallback';
  error?: string;
}

export class NetflixStyleStoryService {
  /**
   * Generate a complete story with AI-first preference
   */
  static async generateStory(userInfo: UserInfo, vocabularyData?: any): Promise<NetflixStoryResult> {
    console.log('📺 Netflix: Starting story generation for', userInfo.name);
    
    // Use user-selected difficulty (no automatic overrides)
    const difficulty: DifficultyLevel = (userInfo.difficultyLevel || userInfo.readingAbility || 'beginner') as DifficultyLevel;
    console.log(`🎯 Netflix: Using user-selected difficulty ${difficulty} for ${userInfo.name}`);

    let promptConfig: any;
    let expertGradeLevel: ExpertGradeLevel | undefined;

    if (difficulty === 'expert') {
      // Import expert difficulty manager for adaptive grade selection
      const { ExpertDifficultyManager } = await import('@/services/expertDifficultyManager');
      expertGradeLevel = await ExpertDifficultyManager.getExpertGradeLevel(userInfo);
      promptConfig = getExpertStoryPrompt(expertGradeLevel);
      console.log(`📚 Netflix: Using adaptive expert grade ${expertGradeLevel} for ${userInfo.name}`);
    } else {
      promptConfig = getStoryPrompt(difficulty);
    }

    // Route through unified 4-tier system
    try {
      console.log('🤖 Netflix: Using unified 4-tier generation system');
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      const result = await StoryGenerationService.generateStory(userInfo, {
        sessionType: 'free',
        pageNumber: 1
      });

      if (!result.success || !result.pages || result.pages.length === 0) {
        console.error('📺 Netflix: 4-tier generation failed:', result.error);
        return this.generateFallbackStory(userInfo, difficulty, 'unified_system_error');
      }

      if (result.pages && Array.isArray(result.pages) && result.pages.length > 0) {
        // Pages already cleaned by unified system
        const cleanedPages = result.pages.filter((page: string) => page.length > 10);

        // Token-based validation that aligns with actual AI output
        const isExpertLevel = difficulty === 'expert' || this.isExpertGradeLevel(difficulty);
        const minPagesRequired = isExpertLevel ? 8 : 5; // Reduced minimum pages
        
        // Import token validation utilities
        const { validateTokenLimit, estimateTokenCount } = await import('@/utils/tokenLimitValidator');
        
        // For all levels, validate using proper token-based validation
        const totalContent = (cleanedPages || []).join(' ');
        const tokenValidation = validateTokenLimit(totalContent, difficulty, 'netflix');
        
        // Check if content meets token requirements (more lenient validation)
        const hasSubstantialContent = cleanedPages.length >= minPagesRequired && tokenValidation.actualTokens >= 400;
        
        // Additional quality check: ensure pages aren't just repeated content (concatenation detection)
        const uniqueContentRatio = this.calculateUniqueContentRatio(cleanedPages);
        const hasUniqueContent = uniqueContentRatio >= 0.6; // At least 60% unique content across pages
        
        const isValidContent = hasSubstantialContent && hasUniqueContent;

        if (isValidContent) {
          console.log(`✅ Netflix: AI generation successful - ${cleanedPages.length} pages (${tokenValidation.actualTokens} tokens, ${Math.round(uniqueContentRatio * 100)}% unique)`);
          console.log(`📊 Netflix: Validation details - Min pages: ${minPagesRequired}, Tokens: ${tokenValidation.actualTokens}, Unique ratio: ${Math.round(uniqueContentRatio * 100)}%`);
          try {
            (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          } catch {}

          // Emit story generation complete event
          window.dispatchEvent(new CustomEvent('story:generation:complete'));

          return {
            content: cleanedPages,
            pageCount: cleanedPages.length,
            source: 'ai'
          };
        }
      }

      // Debug validation failure details
      const cleanedPages = result.pages?.filter((page: string) => page.length > 10) || [];
      const isExpertLevel = difficulty === 'expert' || this.isExpertGradeLevel(difficulty);
      const minPagesRequired = isExpertLevel ? 8 : 5;
      
      // Import validation for debug info
      const { validateTokenLimit } = await import('@/utils/tokenLimitValidator');
      const totalContent = cleanedPages.join(' ');
      const tokenValidation = validateTokenLimit(totalContent, difficulty, 'netflix');
      const uniqueContentRatio = this.calculateUniqueContentRatio(cleanedPages);

      console.log('📺 Netflix: AI generation returned insufficient content, using fallback');
      console.log(`📊 Netflix: Content validation failed - Pages: ${cleanedPages.length}/${minPagesRequired}, Tokens: ${tokenValidation.actualTokens}, Unique: ${Math.round(uniqueContentRatio * 100)}%`);
      return this.generateFallbackStory(userInfo, difficulty, 'insufficient_content');

    } catch (error) {
      console.error('📺 Netflix: AI generation error:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'NetflixStyleStoryService.generateStory');
      console.log(`🎯 Netflix Error Fallback: Using difficulty ${difficulty} for ${userInfo.name}`);
      return this.generateFallbackStory(userInfo, difficulty, 'generation_error');
    }
  }

  /**
   * Generate a fallback story using templates
   */
  private static async generateFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel, reason: string): Promise<NetflixStoryResult> {
    console.log(`📺 Netflix: Using fallback story generation (reason: ${reason})`);
    
    // Show toast notification for template usage
    toast({
      title: "Pre-written Story",
      description: "AI service temporarily unavailable. Enjoying quality pre-written content instead!",
      variant: "default"
    });

    try {
      // Use template service for fallback
      const { data, error } = await supabase.functions.invoke('template-service', {
        body: {
          difficulty: difficulty,
          userInfo: userInfo,
          pageCount: 5, // Default page count for fallback
          templateIndex: 0
        }
      });

      if (error || !data?.pages?.length) {
        throw new Error('Template service failed');
      }

      console.log(`📺 Netflix: Fallback template generated - ${data.pages.length} pages`);
      try {
        (globalThis as any).__LAST_STORY_SOURCE__ = 'fallback';
      } catch {}

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content: data.pages,
        pageCount: data.pages.length,
        source: 'fallback'
      };
    } catch (error) {
      console.error('📺 Netflix: Fallback generation failed:', error);
      // Emergency fallback with rhyming educational content
      const emergencyContent = await ErrorHandlingManager.getEmergencyContent(userInfo);

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content: emergencyContent,
        pageCount: emergencyContent.length,
        source: 'fallback'
      };
    }
  }

  /**
   * Check if difficulty is an expert grade level
   */
  private static isExpertGradeLevel(difficulty: string): boolean {
    // Check for standard expert grade levels
    if (['6th', '7th', '8th', '9th', '10th'].includes(difficulty)) {
      return true;
    }
    
    // Check for alternate naming (grade6, grade7, etc.)
    const gradeMatch = difficulty.match(/^grade(\d+)$/);
    if (gradeMatch) {
      const gradeNum = parseInt(gradeMatch[1]);
      return gradeNum >= 6 && gradeNum <= 10;
    }
    
    return false;
  }
  
  /**
   * Calculate unique content ratio to detect concatenation
   */
  private static calculateUniqueContentRatio(pages: string[]): number {
    if (!pages || pages.length <= 1) return 1.0;
    
    // Simple uniqueness check: compare consecutive pages
    let uniquePages = 0;
    const threshold = 0.7; // 70% similarity threshold
    
    for (let i = 0; i < pages.length; i++) {
      let isUnique = true;
      const currentPage = pages[i].toLowerCase().trim();
      
      // Compare with other pages
      for (let j = 0; j < pages.length; j++) {
        if (i === j) continue;
        
        const otherPage = pages[j].toLowerCase().trim();
        const similarity = this.calculateSimilarity(currentPage, otherPage);
        
        if (similarity > threshold) {
          isUnique = false;
          break;
        }
      }
      
      if (isUnique) uniquePages++;
    }
    
    return uniquePages / pages.length;
  }
  
  /**
   * Calculate similarity between two strings (simple word overlap)
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  static async generateCompleteStory(userInfo: UserInfo): Promise<NetflixStoryResult> {
    return this.generateStory(userInfo);
  }
}