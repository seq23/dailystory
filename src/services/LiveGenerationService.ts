// Live Generation Service for Premium Users
// Generates stories page-by-page with backend validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getTokenLimitForDifficulty, STORY_PROMPTS, EXPERT_STORY_PROMPTS, getStoryPrompt, getExpertStoryPrompt, formatUserPrompt } from '../../supabase/functions/_shared/storyPrompts';
import { DifficultyLevelMapper } from '../../supabase/functions/_shared/DifficultyLevelMapper';
import { ErrorHandler } from '@/utils/errorHandling';
import { ExpertDifficultyManager } from '@/services/expertDifficultyManager';
import { ErrorHandlingManager } from '@/services/errorHandlingManager';
import { APP_CONFIG } from '@/config/appConfig';
import { toast } from '@/hooks/use-toast';
import { RepairService } from './repairService';
import { LoggerService } from '@/services/LoggerService';

export interface LiveGenerationContext {
  userInfo: UserInfo;
  difficulty: string; // Frontend difficulty level - will be converted to backend in service methods
  expertGradeLevel?: ExpertGradeLevel;
  storyContext: string[];
  currentPage: number;
  totalExpectedPages: number;
  characters: string[];
}

export interface LivePageResult {
  content: string | string[];
  isComplete: boolean;
  nextContext?: LiveGenerationContext;
  error?: string;
  endingPageCount?: number;
}

export class LiveGenerationService {
  /**
   * Generate the first page of a story for premium users
   */
  static async generateFirstPage(userInfo: UserInfo, sessionType?: 'new' | 'continuation' | 'rewrite', vocabularyData?: any, sessionId?: string): Promise<LivePageResult> {
    try {
      LoggerService.milestone('Starting first page generation', 'LiveGeneration', { user: userInfo.name });
      
      // Convert frontend difficulty to backend format for validation system
      const frontendDifficulty = userInfo.difficultyLevel || 'beginner';
      const difficulty: DifficultyLevel = DifficultyLevelMapper.toBackend(frontendDifficulty) as DifficultyLevel;
      LoggerService.info(`🔄 Live: Difficulty mapping - Frontend: "${frontendDifficulty}" → Backend: "${difficulty}"`, 'LiveGeneration', { user: userInfo.name });
      
      // Premium Expert: adaptive grade selection
      let expertGradeLevel: ExpertGradeLevel | undefined;
      
      if (difficulty === 'expert') {
        // Premium expert progression: adaptive grade selection
        expertGradeLevel = await ExpertDifficultyManager.getExpertGradeLevel(userInfo);
        LoggerService.info(`Using adaptive expert grade ${expertGradeLevel}`, 'LiveGeneration', { user: userInfo.name });
      }
      
      LoggerService.debug('Using unified 4-tier system', 'LiveGeneration');
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      const actualSessionId = sessionId || `live-first-${userInfo.name}-${Date.now()}`;
      console.log(`🆔 LiveGen: First Page Session ID: ${actualSessionId}`);
      
      const result = await StoryGenerationService.generateStory(userInfo, {
        sessionType: 'premium',
        pageNumber: 1,
        expertGradeLevel,
        difficulty,
        sessionId: actualSessionId
      });

      if (!result.success || !result.pages || result.pages.length === 0) {
        LoggerService.error('4-tier system failed', 'LiveGeneration', result.error);
        return this.generateFallbackFirstPage(userInfo, difficulty, 'unified_system_error');
      }

      // Extract first page from unified system - backend handles all validation
      const content = result.pages[0] || '';
      LoggerService.milestone('Content received from backend', 'LiveGeneration');
      
      // Create context for next page
      const context: LiveGenerationContext = {
        userInfo,
        difficulty: frontendDifficulty, // Store frontend difficulty in context
        expertGradeLevel,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: 999,
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend']
      };

      // PHASE 4: Use dynamic character validation based on level
      const { mapDifficultyToLevel, getMinCharactersPerPage } = await import('../../supabase/functions/_shared/validation-utils');
      const validationLevel = mapDifficultyToLevel(expertGradeLevel || difficulty);
      const minCharsPerPage = getMinCharactersPerPage(validationLevel);
      const hasValidContent = result.pages && result.pages.length > 0 && result.pages[0] && result.pages[0].length >= minCharsPerPage;
      console.log(`🔍 Dynamic content validation: Length=${result.pages?.[0]?.length}, MinRequired=${minCharsPerPage}, Level=${validationLevel}, Difficulty=${difficulty}, Grade=${expertGradeLevel}`);
      
      if (hasValidContent) {
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          console.log('✅ Confirmed AI-generated content, setting source tracking');
        } catch {}
      } else {
        console.log('⚠️ AI call succeeded but content insufficient, setting source to unknown');
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'unknown';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'unknown';
          console.log('⚠️ Set Live source to unknown due to insufficient content');
        } catch {}
      }

      window.dispatchEvent(new CustomEvent('story:generation:complete'));
      
      return {
        content,
        isComplete: false,
        nextContext: context
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating first page:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateFirstPage');
      const fallbackDifficulty: DifficultyLevel = DifficultyLevelMapper.toBackend(userInfo.difficultyLevel || 'beginner');
      console.log(`🎯 Live Generation Error Fallback: Using difficulty ${fallbackDifficulty} for ${userInfo.name}`);
      return this.generateFallbackFirstPage(userInfo, fallbackDifficulty, 'generation_error');
    }
  }

  static async generateNextPage(context: LiveGenerationContext, vocabularyData?: any, userRequestedEnding?: boolean, sessionId?: string): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      // Never auto-conclude stories - only conclude if user explicitly requests ending
      const shouldConclude = !!userRequestedEnding;
      
      console.log(`🚀 Live Generation: Generating page ${nextPageNumber} (never-ending story, userRequestedEnding=${!!userRequestedEnding})`);
      
      let promptConfig: any;
      const backendDifficulty = DifficultyLevelMapper.toBackend(context.difficulty) as DifficultyLevel;
      if (backendDifficulty === 'expert' && context.expertGradeLevel) {
        promptConfig = getExpertStoryPrompt(context.expertGradeLevel);
      } else {
        promptConfig = getStoryPrompt(backendDifficulty);
      }
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      // Create enhanced userInfo with story context for continuation
      const contextualUserInfo = {
        ...context.userInfo,
        specialRequest: `${context.userInfo.specialRequest || 'adventure'} (continuing from: ${context.storyContext.slice(-1)[0]?.substring(0, 100)}...)`
      };
      
      const actualSessionId = sessionId || `live-next-${context.userInfo.name}-${Date.now()}`;
      console.log(`🆔 LiveGen: Next Page Session ID: ${actualSessionId}`);
      
      const result = await StoryGenerationService.generateStory(contextualUserInfo, {
        sessionType: 'premium',
        pageNumber: nextPageNumber,
        existingStory: (context.storyContext || []).join('\n\n'),
        sessionId: actualSessionId
      });

      if (!result.success || !result.pages || result.pages.length === 0) {
        console.error('🚀 Live Generation: 4-tier continuation failed:', result.error);
        return this.generateFallbackNextPage(context, nextPageNumber, 'unified_system_error', userRequestedEnding);
      }

      // Extract first page from unified system - backend handles all validation
      const content = result.pages[0] || '';
      console.log('✅ Live Generation: Next page content received from backend');
      
      // Update context for next page (never-ending stories grow dynamically)
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...(context.storyContext || []), content],
        currentPage: nextPageNumber,
        totalExpectedPages: context.totalExpectedPages // Keep original expectation
      };

      console.log(`🚀 Live Generation: Page ${nextPageNumber} generated successfully`);
      // PHASE 4: Use dynamic character validation for next page
      const { mapDifficultyToLevel, getMinCharactersPerPage } = await import('../../supabase/functions/_shared/validation-utils');
      const backendDifficultyForValidation = DifficultyLevelMapper.toBackend(context.difficulty) as DifficultyLevel;
      const validationLevel = mapDifficultyToLevel(context.expertGradeLevel || backendDifficultyForValidation);
      const minCharsPerPage = getMinCharactersPerPage(validationLevel);
      if (result.pages && result.pages.length > 0 && result.pages[0] && result.pages[0].length >= minCharsPerPage) {
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          console.log('✅ Confirmed AI-generated next page content, setting source tracking');
        } catch {}
      } else {
        console.log('⚠️ AI call succeeded but next page content insufficient, setting source to unknown');
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'unknown';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'unknown';
          console.log('⚠️ Set Live next page source to unknown due to insufficient content');
        } catch {}
      }
      console.log('🧭 PAGE_SOURCE', { page: nextPageNumber, source: 'ai', service: 'Live' });
      
      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));
      
      return {
        content,
        isComplete: shouldConclude,
        nextContext: shouldConclude ? undefined : updatedContext
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating next page:', error);
      const nextPageNumber = context.currentPage + 1;
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateNextPage');
      return this.generateFallbackNextPage(context, nextPageNumber, 'generation_error', false);
    }
  }

  // Generate an explicit concluding page without ending the reading session
  static async generateEndingPage(context: LiveGenerationContext, sessionId?: string): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      // CRITICAL FIX: Preserve user's original themes, characters, and settings for conclusion
      // Don't overwrite specialRequest - let user's preferences guide the ending
      const endingUserInfo = {
        ...context.userInfo,
        specialRequest: `${context.userInfo.specialRequest || 'adventure'} - please provide a satisfying conclusion to this story: ${context.storyContext.slice(-1)[0]?.substring(0, 100)}...`
      };
      
      const actualSessionId = sessionId || `live-ending-${context.userInfo.name}-${Date.now()}`;
      console.log(`🆔 LiveGen: Ending Page Session ID: ${actualSessionId}`);
      
      const result = await StoryGenerationService.generateStory(endingUserInfo, {
        sessionType: 'premium', 
        pageNumber: nextPageNumber,
        existingStory: (context.storyContext || []).join('\n\n'),
        sessionId: actualSessionId,
        isEndingPage: true
      });

      if (!result.success || !result.pages || result.pages.length === 0) {
        console.error('🚀 Live Generation: 4-tier ending failed:', result.error);
        return this.generateFallbackNextPage(context, nextPageNumber, 'unified_system_error', true);
      }

      // Extract ALL ending pages from unified system - backend handles validation
      const allPages = result.pages || [];
      if (allPages.length === 0 || !allPages[0] || allPages[0].length < 10) {
        return this.generateFallbackNextPage(context, nextPageNumber, 'content_too_short_conclusion', true);
      }

      console.log(`🚀 Live Generation: Ending generated with ${allPages.length} page(s)`);
      // PHASE 4: Use dynamic character validation for ending pages
      const { mapDifficultyToLevel, getMinCharactersPerPage } = await import('../../supabase/functions/_shared/validation-utils');
      const backendDifficultyForValidation = DifficultyLevelMapper.toBackend(context.difficulty) as DifficultyLevel;
      const validationLevel = mapDifficultyToLevel(context.expertGradeLevel || backendDifficultyForValidation);
      const minCharsPerPage = getMinCharactersPerPage(validationLevel);
      if (result.pages && result.pages.length > 0 && result.pages[0] && result.pages[0].length >= minCharsPerPage) {
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          console.log('✅ Confirmed AI-generated story ending content, setting source tracking');
        } catch {}
      } else {
        console.log('⚠️ AI call succeeded but story ending content insufficient, setting source to unknown');
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'unknown';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'unknown';
          console.log('⚠️ Set Live ending source to unknown due to insufficient content');
        } catch {}
      }

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content: allPages.length === 1 ? allPages[0] : allPages,
        isComplete: true,
        nextContext: undefined,
        endingPageCount: allPages.length
      };
    } catch (error) {
      console.error('🚀 Live Generation: Error generating ending page:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateEndingPage');
      return {
        content: '',
        isComplete: true,
        error: 'Failed to generate story ending. Please try again.'
      };
    }
  }

  private static async generateFallbackFirstPage(userInfo: UserInfo, difficulty: DifficultyLevel, reason: string): Promise<LivePageResult> {
    console.log(`🚀 Live Generation: Using fallback first page (reason: ${reason})`);
    
    // Show toast notification for template usage
    toast({
      title: "⚠️ Using Pre-Written Content",
      description: "AI is taking a break. You're reading quality backup stories! Parents: This is normal during high demand.",
      variant: "warning",
      duration: 7000
    });
    
    try {
      // Use template service for fallback
      const { data, error } = await supabase.functions.invoke('template-service', {
        body: {
          difficulty: difficulty,
          userInfo: userInfo,
          pageCount: 1,
          templateIndex: 0
        }
      });

      if (error || !data?.pages?.length) {
        throw new Error('Template service failed');
      }

      const content = data.pages[0];
      
      // Get proper prompt config to preserve page expectations
      let promptConfig: any;
      if (difficulty === 'expert') {
        promptConfig = { expectedPages: 14 }; // Middle-ground for expert stories (12-16 pages)
      } else {
        promptConfig = getStoryPrompt(difficulty);
      }

      const context: LiveGenerationContext = {
        userInfo,
        difficulty: DifficultyLevelMapper.toFrontend(difficulty), // Store frontend difficulty in context
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: promptConfig.expectedPages || 999, // Preserve unlimited behavior
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend']
      };

      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'fallback';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'fallback';
      } catch {}
      console.log('🧭 PAGE_SOURCE', { page: 1, source: (globalThis as any).__LAST_PAGE_SOURCE__, service: 'Live' });

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content,
        isComplete: false,
        nextContext: context
      };
    } catch (error) {
      console.error('🚀 Fallback failed:', error);
      // Emergency fallback with rhyming educational content
      const emergencyContent = await ErrorHandlingManager.getEmergencyContent(userInfo);
      const content = emergencyContent[0] || `${userInfo.name} began a wonderful adventure.`;
      
      // Set global emergency source tracking
      (globalThis as any).__LAST_STORY_SOURCE__ = 'emergency';
      (globalThis as any).__LAST_PAGE_SOURCE__ = 'emergency';
      
      let promptConfig: any;
      if (difficulty === 'expert') {
        promptConfig = { expectedPages: 14 };
      } else {
        promptConfig = getStoryPrompt(difficulty);
      }
      
      const context: LiveGenerationContext = {
        userInfo,
        difficulty: DifficultyLevelMapper.toFrontend(difficulty), // Store frontend difficulty in context
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: promptConfig.expectedPages || 999,
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend']
      };

      return {
        content,
        isComplete: false,
        nextContext: context
      };
    }
  }

  private static async generateFallbackNextPage(
    context: LiveGenerationContext, 
    pageNumber: number, 
    reason: string,
    userRequestedEnding?: boolean
  ): Promise<LivePageResult> {
    console.log(`🚀 Live Generation: Using fallback page ${pageNumber} (reason: ${reason})`);
    
    const isLastPage = !!userRequestedEnding;
    
    // Show toast notification for template usage
    toast({
      title: "⚠️ Using Pre-Written Content",
      description: "AI is taking a break. You're reading quality backup stories! Parents: This is normal during high demand.",
      variant: "warning",
      duration: 7000
    });
    
    try {
      // Use template service for fallback continuation
      const { data, error } = await supabase.functions.invoke('template-service', {
        body: {
          difficulty: context.difficulty,
          userInfo: context.userInfo,
          pageCount: pageNumber,
          templateIndex: 0
        }
      });

      if (error || !data?.pages?.length) {
        throw new Error('Template service failed');
      }

      // Get the appropriate page or use the last available page
      const content = data.pages[Math.min(pageNumber - 1, data.pages.length - 1)] ||
        (isLastPage ? `${context.userInfo.name} felt happy about the wonderful adventure. The end!` : 
         `${context.userInfo.name} continued the exciting journey.`);
      
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...context.storyContext, content],
        currentPage: pageNumber
      };

      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'fallback';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'fallback';
      } catch {}
      console.log('🧭 PAGE_SOURCE', { page: pageNumber, source: (globalThis as any).__LAST_PAGE_SOURCE__, service: 'Live' });

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content,
        isComplete: isLastPage,
        nextContext: isLastPage ? undefined : updatedContext
      };
    } catch (error) {
      console.error('🚀 Fallback failed:', error);
      // Emergency fallback with rhyming educational content
      const emergencyContent = await ErrorHandlingManager.getEmergencyContent(context.userInfo);
      const content = isLastPage ? 
        (emergencyContent[0] || `${context.userInfo.name} had a great day. The end.`) : 
        (emergencyContent[0] || `${context.userInfo.name} continued the adventure.`);
      
      // Set global emergency source tracking
      (globalThis as any).__LAST_STORY_SOURCE__ = 'emergency';
      (globalThis as any).__LAST_PAGE_SOURCE__ = 'emergency';
      
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...context.storyContext, content],
        currentPage: pageNumber
      };

      return {
        content,
        isComplete: isLastPage,
        nextContext: isLastPage ? undefined : updatedContext
      };
    }
  }
}