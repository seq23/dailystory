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
import { StoryQualityChecker } from '@/utils/storyQualityChecker';

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
      
      console.log(`🔍 Netflix: Calling unified system with:`, {
        difficulty,
        expertGradeLevel,
        promptTokens: promptConfig?.tokens || 'unknown',
        expectedPages: promptConfig?.expectedPages || 'unknown'
      });
      
      const result = await StoryGenerationService.generateStory(userInfo, {
        sessionType: 'free',
        pageNumber: 1,
        expertGradeLevel, // Pass expert grade level to unified system
        difficulty // Also pass the original difficulty
      });

      if (!result.success || !result.pages || result.pages.length === 0) {
        console.error('📺 Netflix: 4-tier generation failed:', result.error);
        return this.generateFallbackStory(userInfo, difficulty, 'unified_system_error');
      }

      if (result.pages && Array.isArray(result.pages) && result.pages.length > 0) {
        // Pages already cleaned by unified system
        const cleanedPages = result.pages.filter((page: string) => page.length > 10);

        // Use UnifiedValidator for comprehensive validation - fixes 717-token issue
        const { UnifiedValidator } = await import('@/utils/unifiedValidator');
        const level = UnifiedValidator.mapDifficultyToLevel(difficulty);
        
        const validationResult = UnifiedValidator.validateContent(cleanedPages, {
          mode: 'guest',
          level,
          userLanguage: userInfo.nativeLanguage
        });

        // Accept content based on unified validator decision
        if (validationResult.decision === 'ACCEPT' || validationResult.decision === 'REPAIR_AND_SPLIT') {
          const finalContent = validationResult.content || cleanedPages;
          
          console.log(`✅ Netflix: AI generation successful - ${finalContent.length} pages (${validationResult.metrics.tokenCount} tokens)`);
          console.log(`📊 Netflix: Validation decision: ${validationResult.decision}`);
          
          try {
            (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          } catch {}

          // Emit story generation complete event
          window.dispatchEvent(new CustomEvent('story:generation:complete'));

          return {
            content: finalContent,
            pageCount: finalContent.length,
            source: 'ai'
          };
        }

        // Log validation failure details for debugging
        console.log('📺 Netflix: AI generation validation failed');
        console.log(`📊 Netflix: Validation details:`, {
          decision: validationResult.decision,
          reasons: validationResult.reasons,
          metrics: validationResult.metrics
        });
      }

      // Debug validation failure details - Updated for UnifiedValidator
      const cleanedPages = result.pages?.filter((page: string) => page.length > 10) || [];
      
      // Import unified validator for debug info
      const { UnifiedValidator } = await import('@/utils/unifiedValidator');
      const level = UnifiedValidator.mapDifficultyToLevel(difficulty);
      
      const debugValidation = UnifiedValidator.validateContent(cleanedPages, {
        mode: 'guest',
        level,
        userLanguage: userInfo.nativeLanguage
      });

      console.log('📺 Netflix: AI generation returned insufficient content, using fallback');
      console.log(`📊 Netflix: Unified validation debug:`, {
        decision: debugValidation.decision,
        reasons: debugValidation.reasons,
        metrics: debugValidation.metrics
      });
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
      console.log(`🔧 Netflix: Calling template service with difficulty: ${difficulty}, pageCount: 5`);
      
      const { data, error } = await supabase.functions.invoke('template-service', {
        body: {
          difficulty: difficulty,
          userInfo: userInfo,
          pageCount: 5, // Default page count for fallback
          templateIndex: 0
        }
      });

      console.log(`🔧 Netflix: Template service response:`, {
        hasError: !!error,
        hasData: !!data,
        dataStructure: data ? Object.keys(data) : 'no data',
        pagesLength: data?.pages?.length || 0,
        success: data?.success
      });

      if (error) {
        console.error('🔧 Netflix: Template service error:', error);
        throw new Error(`Template service error: ${error.message || error}`);
      }

      if (!data) {
        console.error('🔧 Netflix: No data returned from template service');
        throw new Error('Template service returned no data');
      }

      if (!data.pages || !Array.isArray(data.pages) || data.pages.length === 0) {    
        console.error('🔧 Netflix: Invalid pages data:', {
          hasPages: !!data.pages,
          isArray: Array.isArray(data.pages),
          length: data.pages?.length || 0,
          pages: data.pages
        });
        throw new Error('Template service returned invalid pages data');
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
  

  static async generateCompleteStory(userInfo: UserInfo): Promise<NetflixStoryResult> {
    return this.generateStory(userInfo);
  }
}