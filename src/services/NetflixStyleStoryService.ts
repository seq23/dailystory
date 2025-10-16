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
import { NetflixRetryService } from './NetflixRetryService';
import { NetflixSessionManager } from './NetflixSessionManager';
import { DebugLogger } from '@/services/DebugLogger';

export interface NetflixStoryResult {
  content: string[];
  pageCount: number;
  source: 'ai' | 'fallback' | 'emergency';
  error?: string;
}

export class NetflixStyleStoryService {
  /**
   * Generate a complete story with AI-first preference and comprehensive debugging
   */
  static async generateStory(userInfo: UserInfo, vocabularyData?: any, sessionId?: string): Promise<NetflixStoryResult> {
    try {
      const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      DebugLogger.log('story', `Netflix: Starting story generation for ${userInfo.name}`, { generationId });
      DebugLogger.log('story', `Netflix DEBUG: Full UserInfo`, {
        generationId,
        name: userInfo.name,
        age: userInfo.age,
        difficulty: userInfo.difficultyLevel,
        avatar: userInfo.avatar,
        specialRequest: userInfo.specialRequest,
        sessionId: sessionId
      });
      
      // userInfo.difficultyLevel is already in backend format after form submission
      const difficulty: DifficultyLevel = (userInfo.difficultyLevel || 'beginner') as DifficultyLevel;
      DebugLogger.log('story', `Netflix: Using backend difficulty: "${difficulty}" for ${userInfo.name}`, { generationId });

      let promptConfig: any;
      let expertGradeLevel: ExpertGradeLevel | undefined;

      if (difficulty === 'expert') {
        // Import expert difficulty manager for adaptive grade selection
        const { ExpertDifficultyManager } = await import('@/services/expertDifficultyManager');
        expertGradeLevel = await ExpertDifficultyManager.getExpertGradeLevel(userInfo);
        promptConfig = getExpertStoryPrompt(expertGradeLevel);
        DebugLogger.log('story', `Netflix: Using adaptive expert grade ${expertGradeLevel} for ${userInfo.name}`, { generationId });
      } else {
        promptConfig = getStoryPrompt(difficulty);
      }

      // Use NetflixRetryService for robust retry logic with circuit breaker
      return await NetflixRetryService.executeWithRetry(async () => {
        const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        DebugLogger.log('story', `Netflix: Starting AI generation attempt ${attemptId}`, { generationId });
        const { StoryGenerationService } = await import('./storyGenerationService');
        
        DebugLogger.log('story', `Netflix: Calling unified system`, {
          generationId,
          difficulty,
          expertGradeLevel,
          promptTokens: promptConfig?.tokens || 'unknown',
          expectedPages: promptConfig?.expectedPages || 'unknown',
          attemptId
        });
        
        // Use managed session system for consistency
        let actualSessionId: string;
        
        // Check if this should be a fresh Netflix session (after "Next Story" click)
        const shouldUseFreshSession = sessionStorage.getItem('netflix_force_fresh_session') === 'true';
        if (shouldUseFreshSession) {
          actualSessionId = sessionId || NetflixSessionManager.getNextStorySession(userInfo.name);
          sessionStorage.removeItem('netflix_force_fresh_session'); // Clear flag after use
          DebugLogger.log('story', `Netflix: Using FRESH session ID: ${actualSessionId}`, { generationId });
        } else {
          actualSessionId = sessionId || NetflixSessionManager.getOrCreateSession(userInfo.name);
          DebugLogger.log('story', `Netflix: Using regular session ID: ${actualSessionId}`, { generationId });
        }
        
        DebugLogger.log('story', `Netflix: Session ID determined`, { generationId });
        
        // Add timeout wrapper for AI generation (aligned with backend: 75s frontend > 50s backend > 40s OpenAI)
        const result = await Promise.race([
          StoryGenerationService.generateStory(userInfo, {
            sessionType: 'free',
            pageNumber: 1,
            expertGradeLevel, // Pass expert grade level to unified system
            difficulty, // Also pass the original difficulty
            sessionId: actualSessionId
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI generation timeout after 75 seconds')), 75000)
          )
        ]) as any;

        DebugLogger.log('story', `Netflix: Raw result received`, {
          generationId,
          success: result?.success,
          hasPages: !!result?.pages,
          pagesLength: result?.pages?.length,
          hasStory: !!result?.story,
          error: result?.error
        });

        // Validate result structure progressively with detailed logging
        if (!result) {
          throw new Error(`No result returned from StoryGenerationService`);
        }

        if (!result.success) {
          throw new Error(`AI generation returned success=false: ${result.error}`);
        }

        // Check for missing or empty pages array
        if (!result.pages) {
          throw new Error(`Result has no pages property`);
        }

        if (!Array.isArray(result.pages)) {
          throw new Error(`Pages is not an array: ${typeof result.pages}`);
        }

        if (result.pages.length === 0) {
          throw new Error(`Pages array is empty`);
        }

        // SUCCESS CASE: Process valid AI result
        DebugLogger.log('story', `Netflix: Valid AI result received - processing...`, { generationId });
        
        // Pages already cleaned by unified system
        const cleanedPages = result.pages.filter((page: string) => page.length > 10);
        DebugLogger.log('story', `Netflix: AI story received - ${cleanedPages.length} pages`, { generationId });
        
        // PHASE 4: Apply Netflix 6-page minimum validation to AI generation
        const { validateNetflixStoryWithPageMinimum } = await import('../../supabase/functions/_shared/netflix-page-validation');
        const { mapDifficultyToLevel } = await import('../../supabase/functions/_shared/validation-utils');
        const validationLevel = mapDifficultyToLevel(expertGradeLevel || difficulty);
        
        // Apply Netflix validation to ensure 6-page minimum
        const netflixValidation = validateNetflixStoryWithPageMinimum(
          result.story || '',
          validationLevel,
          cleanedPages
        );
        
        if (!netflixValidation.isValid || netflixValidation.pages.length < 6) {
          throw new Error(`Netflix validation failed: ${netflixValidation.pages.length} pages, valid=${netflixValidation.isValid}`);
        }
        
        DebugLogger.log('story', `Netflix AI generation: Using ${netflixValidation.pages.length} pages (${netflixValidation.wasForceSplit ? 'force-split' : 'natural'})`, { generationId });
        const validatedContent = netflixValidation.pages;
        
        try {
          (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          DebugLogger.log('story', `Confirmed Netflix AI-generated story content, setting source tracking`, { generationId });
        } catch {}

        // Emit story generation complete event
        window.dispatchEvent(new CustomEvent('story:generation:complete'));

        return {
          content: validatedContent,
          pageCount: validatedContent.length,
          source: 'ai' as const
        };
        
      }, `next-story-generation-${userInfo.name}`, {
        maxRetries: 3,
        initialDelay: 1500, // Faster initial retry for next story
        maxDelay: 6000,     // Lower max delay for better UX
        backoffMultiplier: 1.5 // Gentler backoff
      }).catch(async (error) => {
        // All retries exhausted - fall back to templates with comprehensive error reporting
        DebugLogger.error('story', 'Netflix: All AI generation attempts failed, using fallback', { generationId });
        DebugLogger.error('story', 'Netflix: Final error', { generationId, error });
        const wrappedError = ErrorHandler.handleError(error || new Error('Unknown error'), 'NetflixStyleStoryService.generateStory');
        DebugLogger.warn('story', `Netflix Error Fallback: Using difficulty ${difficulty} for ${userInfo.name}`, { generationId });
        return this.generateFallbackStory(userInfo, difficulty, `ai_exhausted_all_attempts`);
      });
    } catch (outerError) {
      // ULTIMATE SAFETY NET: Should never reach here due to inner fallbacks, but guarantee no exceptions
      DebugLogger.error('story', 'CRITICAL: Outer safety net caught error in Netflix generation', { outerError });
      
      // Generate emergency content as last resort
      const emergencyContent = await ErrorHandlingManager.getEmergencyContent(userInfo);
      
      // Set global emergency source tracking
      (globalThis as any).__LAST_STORY_SOURCE__ = 'emergency';
      
      return {
        content: emergencyContent,
        pageCount: emergencyContent.length,
        source: 'emergency'
      };
    }
  }

  /**
   * Generate a fallback story using templates with enhanced debugging
   */
  private static async generateFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel, reason: string): Promise<NetflixStoryResult> {
    const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    DebugLogger.log('story', `Netflix: Using fallback story generation (reason: ${reason})`, { fallbackId });
    DebugLogger.log('story', `Netflix FALLBACK DEBUG: UserInfo`, {
      fallbackId,
      name: userInfo.name,
      difficulty,
      originalDifficulty: userInfo.difficultyLevel,
      age: userInfo.age
    });
    
    // Show toast notification for template usage with more specific messaging
    const toastMessage = reason.includes('ai_exhausted') ? 
      "AI couldn't create your story after multiple tries. Using quality backup stories!" :
      "AI is taking a break. You're reading quality backup stories! Parents: This is normal during high demand.";
      
    toast({
      title: "⚠️ Using Pre-Written Content", 
      description: toastMessage,
      variant: "warning",
      duration: 7000
    });

    try {
      // Use template service for fallback with enhanced error handling
      DebugLogger.log('story', `Netflix: Calling template service with difficulty: ${difficulty}, pageCount: 12`, { fallbackId });
      DebugLogger.log('story', `Netflix: Template service call details`, {
        fallbackId,
        difficulty,
        userInfo: {
          name: userInfo.name,
          age: userInfo.age,
          difficultyLevel: userInfo.difficultyLevel
        },
        pageCount: 12,
        templateIndex: 0
      });
      
      const { data, error } = await supabase.functions.invoke('template-service', {
        body: {
          difficulty: difficulty,
          userInfo: userInfo,
          pageCount: 12, // Enhanced fallback page count for unlimited experience
          templateIndex: 0
        }
      });

      DebugLogger.log('story', `Netflix: Template service response`, {
        fallbackId,
        hasError: !!error,
        hasData: !!data,
        dataStructure: data ? Object.keys(data) : 'no data',
        pagesLength: data?.pages?.length || 0,
        success: data?.success,
        errorDetails: error ? {
          message: error.message,
          code: error.code,
          details: error.details
        } : null
      });

      if (error) {
        DebugLogger.error('story', 'Netflix: Template service error', { error });
        throw new Error(`Template service error: ${error.message || error}`);
      }

      if (!data) {
        DebugLogger.error('story', 'Netflix: No data returned from template service');
        throw new Error('Template service returned no data');
      }

      if (!data.pages || !Array.isArray(data.pages) || data.pages.length === 0) {    
        DebugLogger.error('story', 'Netflix: Invalid pages data', {
          hasPages: !!data.pages,
          isArray: Array.isArray(data.pages),
          length: data.pages?.length || 0,
          pages: data.pages
        });
        throw new Error('Template service returned invalid pages data');
      }

      // NETFLIX INTEGRATION: Apply 6-page minimum validation to template fallback
      if (data.pages.length < 6) {
        DebugLogger.log('story', `Netflix: Template fallback has ${data.pages.length} pages, applying 6-page minimum`);
        const { validateNetflixStoryWithPageMinimum } = await import('../../supabase/functions/_shared/netflix-page-validation');
        const { mapDifficultyToLevel } = await import('../../supabase/functions/_shared/validation-utils');
        
        const validationLevel = mapDifficultyToLevel(difficulty);
        const storyText = data.pages.join(' ');
        
        const netflixValidation = validateNetflixStoryWithPageMinimum(
          storyText,
          validationLevel,
          data.pages
        );
        
        if (netflixValidation.isValid && netflixValidation.pages.length >= 6) {
          DebugLogger.log('story', `Netflix: Template expanded from ${data.pages.length} to ${netflixValidation.pages.length} pages`);
          data.pages = netflixValidation.pages;
        }
      }

      DebugLogger.log('story', `Netflix: Fallback template generated - ${data.pages.length} pages`);
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
      DebugLogger.error('story', 'Netflix: Fallback generation failed', { error });
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