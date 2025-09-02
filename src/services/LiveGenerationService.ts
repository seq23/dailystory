// Live Generation Service for Premium Users
// Generates stories page-by-page with backend validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getTokenLimitForDifficulty, STORY_PROMPTS, EXPERT_STORY_PROMPTS, getStoryPrompt, getExpertStoryPrompt, formatUserPrompt } from '../../supabase/functions/_shared/storyPrompts';
import { ErrorHandler } from '@/utils/errorHandling';
import { ExpertDifficultyManager } from '@/services/expertDifficultyManager';
import { ErrorHandlingManager } from '@/services/errorHandlingManager';
import { APP_CONFIG } from '@/config/appConfig';
import { toast } from '@/hooks/use-toast';
import { RepairService } from './repairService';
import { LoggerService } from '@/services/LoggerService';

export interface LiveGenerationContext {
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
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
  static async generateFirstPage(userInfo: UserInfo, sessionType?: 'new' | 'continuation' | 'rewrite', vocabularyData?: any): Promise<LivePageResult> {
    try {
      LoggerService.milestone('Starting first page generation', 'LiveGeneration', { user: userInfo.name });
      
      // Use user-selected difficulty only (no automatic overrides)
      const difficulty: DifficultyLevel = (userInfo.difficultyLevel || userInfo.readingAbility || 'beginner') as DifficultyLevel;
      LoggerService.info(`Using user-selected difficulty ${difficulty}`, 'LiveGeneration', { user: userInfo.name });
      
      // Premium Expert: adaptive grade selection
      let expertGradeLevel: ExpertGradeLevel | undefined;
      
      if (difficulty === 'expert') {
        // Premium expert progression: adaptive grade selection
        expertGradeLevel = await ExpertDifficultyManager.getExpertGradeLevel(userInfo);
        LoggerService.info(`Using adaptive expert grade ${expertGradeLevel}`, 'LiveGeneration', { user: userInfo.name });
      }
      
      LoggerService.debug('Using unified 4-tier system', 'LiveGeneration');
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      const result = await StoryGenerationService.generateStory(userInfo, {
        sessionType: 'premium',
        pageNumber: 1,
        expertGradeLevel,
        difficulty
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
        difficulty,
        expertGradeLevel,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: 999,
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend']
      };

      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
      } catch {}

      window.dispatchEvent(new CustomEvent('story:generation:complete'));
      
      return {
        content,
        isComplete: false,
        nextContext: context
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating first page:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateFirstPage');
      const fallbackDifficulty: DifficultyLevel = (userInfo.difficultyLevel || userInfo.readingAbility || 'beginner') as DifficultyLevel;
      console.log(`🎯 Live Generation Error Fallback: Using difficulty ${fallbackDifficulty} for ${userInfo.name}`);
      return this.generateFallbackFirstPage(userInfo, fallbackDifficulty, 'generation_error');
    }
  }

  static async generateNextPage(context: LiveGenerationContext, vocabularyData?: any, userRequestedEnding?: boolean): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      // Never auto-conclude stories - only conclude if user explicitly requests ending
      const shouldConclude = !!userRequestedEnding;
      
      console.log(`🚀 Live Generation: Generating page ${nextPageNumber} (never-ending story, userRequestedEnding=${!!userRequestedEnding})`);
      
      let promptConfig: any;
      if (context.difficulty === 'expert' && context.expertGradeLevel) {
        promptConfig = getExpertStoryPrompt(context.expertGradeLevel);
      } else {
        promptConfig = getStoryPrompt(context.difficulty);
      }
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      // Create enhanced userInfo with story context for continuation
      const contextualUserInfo = {
        ...context.userInfo,
        specialRequest: `${context.userInfo.specialRequest || 'adventure'} (continuing from: ${context.storyContext.slice(-1)[0]?.substring(0, 100)}...)`
      };
      
      const result = await StoryGenerationService.generateStory(contextualUserInfo, {
        sessionType: 'premium',
        pageNumber: nextPageNumber,
        existingStory: (context.storyContext || []).join('\n\n')
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
      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
      } catch {}
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
  static async generateEndingPage(context: LiveGenerationContext): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      // CRITICAL FIX: Preserve user's original themes, characters, and settings for conclusion
      // Don't overwrite specialRequest - let user's preferences guide the ending
      const endingUserInfo = {
        ...context.userInfo,
        specialRequest: `${context.userInfo.specialRequest || 'adventure'} - please provide a satisfying conclusion to this story: ${context.storyContext.slice(-1)[0]?.substring(0, 100)}...`
      };
      
      const result = await StoryGenerationService.generateStory(endingUserInfo, {
        sessionType: 'premium', 
        pageNumber: nextPageNumber,
        existingStory: (context.storyContext || []).join('\n\n')
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
      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
      } catch {}

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
        difficulty,
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
      
      let promptConfig: any;
      if (difficulty === 'expert') {
        promptConfig = { expectedPages: 14 };
      } else {
        promptConfig = getStoryPrompt(difficulty);
      }
      
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
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
      title: "Pre-written Story",
      description: "AI service temporarily unavailable. Enjoying quality pre-written content instead!",
      variant: "default"
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