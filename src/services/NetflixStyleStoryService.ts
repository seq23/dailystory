/*
 * ============================================================================
 * BUSINESS MODEL DOCUMENTATION - NETFLIX-STYLE STORY SERVICE
 * ============================================================================
 * 
 * PURPOSE: Handles story generation for GUEST USERS (Free, Non-Paid)
 * 
 * GUEST USER STORY GENERATION:
 * - Netflix-style: Generates 10+ pages at once by OpenAI
 * - BUSINESS RULE: Full story generated but users limited to 6 pages
 * - Artificial limitation to encourage premium upgrades
 * - Backend generates complete story, frontend enforces page limits
 * 
 * NEVER-ENDING STORY ARCHITECTURE:
 * - Stories are designed to continue indefinitely
 * - AI should NEVER naturally conclude stories
 * - Guest cutoff at page 6 is purely business logic (not story ending)
 * 
 * DIFFERENTIATION FROM PREMIUM:
 * - Premium users get LiveGenerationService (1 page at a time)
 * - Guest users get this service (full story batch generation)
 * 
 * TOKEN VALIDATION:
 * - Backend now handles all validation and content quality assurance
 * - Falls back to template service if AI generation fails
 * 
 * CACHE BEHAVIOR:
 * - Generated stories cached for guest session duration
 * - Cleared when guest clicks "Next Story" or session ends
 * 
 * ============================================================================
 */

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getTokenLimitForDifficulty, STORY_PROMPTS, EXPERT_STORY_PROMPTS, getStoryPrompt, getExpertStoryPrompt, formatUserPrompt } from '../../supabase/functions/_shared/storyPrompts';
import { DifficultyLevelMapper } from '../../supabase/functions/_shared/DifficultyLevelMapper';
import { ErrorHandler } from '@/utils/errorHandling';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { DiagnosticTool } from '@/utils/diagnostics';
import { ErrorHandlingManager } from '@/services/errorHandlingManager';
import { APP_CONFIG } from '@/config/appConfig';
import { toast } from '@/hooks/use-toast';
import { StoryQualityChecker } from '@/utils/storyQualityChecker';
import { RepairService } from './repairService';

export interface NetflixStoryResult {
  content: string[];
  pageCount: number;
  source: 'ai' | 'fallback' | 'emergency';
  error?: string;
}

export class NetflixStyleStoryService {
  /**
   * Generate a complete story with AI-first preference
   */
  static async generateStory(userInfo: UserInfo, vocabularyData?: any, sessionId?: string): Promise<NetflixStoryResult> {
    console.log('📺 Netflix: Starting story generation for', userInfo.name);
    
    // Convert frontend difficulty to backend format for validation system
    const frontendDifficulty = userInfo.difficultyLevel || 'beginner';
    const difficulty: DifficultyLevel = DifficultyLevelMapper.toBackend(frontendDifficulty) as DifficultyLevel;
    console.log(`🔄 Netflix: Difficulty mapping - Frontend: "${frontendDifficulty}" → Backend: "${difficulty}" for ${userInfo.name}`);

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
      
      const actualSessionId = sessionId || `netflix-${userInfo.name}-${Date.now()}`;
      console.log(`🆔 Netflix: Session ID: ${actualSessionId}`);
      
      const result = await StoryGenerationService.generateStory(userInfo, {
        sessionType: 'free',
        pageNumber: 1,
        expertGradeLevel, // Pass expert grade level to unified system
        difficulty, // Also pass the original difficulty
        sessionId: actualSessionId
      });

      // DIAGNOSTIC LOGGING: Check exact result structure
      console.log('🔍 Netflix: DETAILED RESULT ANALYSIS:', {
        resultExists: !!result,
        resultKeys: result ? Object.keys(result) : 'no result',
        success: result?.success,
        hasPages: !!result?.pages,
        pagesType: typeof result?.pages,
        pagesIsArray: Array.isArray(result?.pages),
        pagesLength: result?.pages?.length,
        pagesContent: result?.pages?.slice(0, 2), // Show first 2 pages for debugging
        error: result?.error,
        fullResult: result // Full object for complete diagnosis
      });

      // Check for different possible response formats
      if (!result) {
        console.error('📺 Netflix: No result returned from StoryGenerationService');
        return this.generateFallbackStory(userInfo, difficulty, 'no_result_returned');
      }

      if (!result.success) {
        console.error('📺 Netflix: StoryGenerationService returned success=false:', result.error);
        return this.generateFallbackStory(userInfo, difficulty, 'generation_failed');
      }

      // Check for missing or empty pages array
      if (!result.pages) {
        console.error('📺 Netflix: Result has no pages property');
        return this.generateFallbackStory(userInfo, difficulty, 'no_pages_property');
      }

      if (!Array.isArray(result.pages)) {
        console.error('📺 Netflix: Pages is not an array:', typeof result.pages);
        return this.generateFallbackStory(userInfo, difficulty, 'pages_not_array');
      }

      if (result.pages.length === 0) {
        console.error('📺 Netflix: Pages array is empty');
        return this.generateFallbackStory(userInfo, difficulty, 'empty_pages_array');
      }

      if (result.pages && Array.isArray(result.pages) && result.pages.length > 0) {
        // Pages already cleaned by unified system
        const cleanedPages = result.pages.filter((page: string) => page.length > 10);

        // Backend now handles all validation - trust the response
        console.log(`✅ Netflix: Story received from backend - ${cleanedPages.length} pages`);
        
        // Success: Return the validated content directly
        const finalContent = cleanedPages;
        
        console.log(`✅ Netflix: AI generation successful - ${finalContent.length} pages`);
        
        // PHASE 4: Use dynamic character validation based on difficulty level
        const { mapDifficultyToLevel, getMinCharactersTotal, getExpectedPagesForService } = await import('../../supabase/functions/_shared/validation-utils');
        const validationLevel = mapDifficultyToLevel(expertGradeLevel || difficulty);
        const expectedPages = getExpectedPagesForService('netflix', validationLevel) || 12;
        const minTotalChars = getMinCharactersTotal(validationLevel, expectedPages);
        const hasValidContent = result.story && result.story.length >= minTotalChars && result.pages && result.pages.length > 0 && finalContent.length > 0;
        console.log(`🔍 Netflix dynamic validation: StoryLength=${result.story?.length}, MinRequired=${minTotalChars}, Level=${validationLevel}, Pages=${expectedPages}`);
        
        if (hasValidContent) {
          try {
            (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
            console.log('✅ Confirmed Netflix AI-generated story content, setting source tracking');
          } catch {}
        } else {
          console.log('⚠️ Netflix AI call succeeded but content insufficient, setting source to unknown');
          try {
            (globalThis as any).__LAST_STORY_SOURCE__ = 'unknown';
            console.log('⚠️ Set Netflix source to unknown due to insufficient content');
          } catch {}
        }

        // Emit story generation complete event
        window.dispatchEvent(new CustomEvent('story:generation:complete'));

        return {
          content: finalContent,
          pageCount: finalContent.length,
          source: 'ai'
        };
      }

      // Debug insufficient content 
      console.log('📺 Netflix: AI generation returned insufficient content, using fallback');
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
      title: "⚠️ Using Pre-Written Content",
      description: "AI is taking a break. You're reading quality backup stories! Parents: This is normal during high demand.",
      variant: "warning",
      duration: 7000
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
      
      // Set global emergency source tracking
      (globalThis as any).__LAST_STORY_SOURCE__ = 'emergency';

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content: emergencyContent,
        pageCount: emergencyContent.length,
        source: 'emergency'
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

  static async generateCompleteStory(userInfo: UserInfo, sessionId?: string): Promise<NetflixStoryResult> {
    return this.generateStory(userInfo, undefined, sessionId);
  }
}