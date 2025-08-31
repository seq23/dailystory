// Live Generation Service for Premium Users
// Generates stories page-by-page with tolerance-based validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getTokenLimitForDifficulty, STORY_PROMPTS, EXPERT_STORY_PROMPTS, getStoryPrompt, getExpertStoryPrompt, formatUserPrompt } from '../../supabase/functions/_shared/storyPrompts';
import { ErrorHandler } from '@/utils/errorHandling';
import { ExpertDifficultyManager } from '@/services/expertDifficultyManager';
import { ErrorHandlingManager } from '@/services/errorHandlingManager';
import { APP_CONFIG } from '@/config/appConfig';
import { toast } from '@/hooks/use-toast';

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
  content: string;
  isComplete: boolean;
  nextContext?: LiveGenerationContext;
  error?: string;
}

export class LiveGenerationService {
  /**
   * Generate the first page of a story for premium users
   * @param userInfo - User information
   * @param sessionType - Optional session type for context isolation ('new' | 'continuation' | 'rewrite')
   * @param vocabularyData - Pre-fetched vocabulary data for integration
   */
  static async generateFirstPage(userInfo: UserInfo, sessionType?: 'new' | 'continuation' | 'rewrite', vocabularyData?: any): Promise<LivePageResult> {
    try {
      console.log('🚀 Live Generation: Starting first page for', userInfo.name);
      
      // Use user-selected difficulty only (no automatic overrides)
      const difficulty: DifficultyLevel = (userInfo.difficultyLevel || userInfo.readingAbility || 'beginner') as DifficultyLevel;
      console.log(`🎯 Live Generation: Using user-selected difficulty ${difficulty} for ${userInfo.name}`);
      
      // Premium Expert: adaptive grade selection
      let expertGradeLevel: ExpertGradeLevel | undefined;
      let promptConfig: any;
      
      if (difficulty === 'expert') {
        // Premium expert progression: adaptive grade selection
        expertGradeLevel = await ExpertDifficultyManager.getExpertGradeLevel(userInfo);
        promptConfig = getExpertStoryPrompt(expertGradeLevel);
        console.log(`📚 Live Generation: Using adaptive expert grade ${expertGradeLevel} for ${userInfo.name}`);
      } else {
        promptConfig = getStoryPrompt(difficulty);
      }
      const systemPrompt = `${promptConfig.systemPrompt}
      
      IMPORTANT: You are generating the FIRST PAGE only of a multi-page story. 
      - Create an engaging opening that establishes the character and setting
      - End with a hook that makes the reader want to continue
      - This is page 1 of ${promptConfig.expectedPages || 'an unlimited'} ${promptConfig.expectedPages ? 'pages' : 'story'}
      - Keep the content appropriate for the difficulty level
      - Return ONLY the page content, no page numbers or formatting
      - Focus on quality storytelling over exact word counts`;
      
      // Use configured prompts from storyPrompts.ts only
      let userPrompt = formatUserPrompt(promptConfig.userPromptTemplate, userInfo);
      
      console.log('🔄 Live Generation: Using unified 4-tier system');
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      const result = await StoryGenerationService.generateStory(userInfo, {
        sessionType: 'premium',
        pageNumber: 1
      });

      if (!result.success || !result.pages || result.pages.length === 0) {
        console.error('🚀 Live Generation: 4-tier system failed:', result.error);
        return this.generateFallbackFirstPage(userInfo, difficulty, 'unified_system_error');
      }

      // Extract first page from unified system
      const content = result.pages[0] || '';
      
      // Simple validation - just check if content exists and has reasonable length
      if (!content || content.length < 10) {
        console.log('❌ First page too short, using fallback');
        return this.generateFallbackFirstPage(userInfo, difficulty, 'content_too_short');
      }
      
      // Create context for next page
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
        expertGradeLevel,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: promptConfig.expectedPages || 999, // Use high number for unlimited stories
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend']
      };

      console.log('🚀 Live Generation: First page generated and validated successfully');
      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
      } catch {}
      console.log('🧭 PAGE_SOURCE', { page: 1, source: 'ai', service: 'Live' });
      
      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));
      
      return {
        content,
        isComplete: false,
        nextContext: context
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating first page:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateFirstPage');
      // Use same difficulty determination logic as main function
      const fallbackDifficulty: DifficultyLevel = (userInfo.difficultyLevel || userInfo.readingAbility || 'beginner') as DifficultyLevel;
      console.log(`🎯 Live Generation Error Fallback: Using difficulty ${fallbackDifficulty} for ${userInfo.name} (from ${userInfo.difficultyLevel ? 'difficultyLevel' : userInfo.readingAbility ? 'readingAbility' : 'default'})`);
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
      
      const systemPrompt = `${promptConfig.systemPrompt}

      CRITICAL NEVER-ENDING STORY RULES:
      - You are generating page ${nextPageNumber} of a NEVER-ENDING story
      - Stories should NEVER naturally conclude on their own
      - Always continue the adventure with new discoveries, challenges, or mysteries
      - ${shouldConclude ? 'USER REQUESTED ENDING: Provide a satisfying conclusion to this adventure' : 'NEVER end the story - always leave room for more adventures'}
      - End each page with intrigue, discovery, or new possibilities
      - Maintain consistency with characters and themes
      - Return ONLY the page content, no page numbers or formatting
      
      Previous story context:
      ${(context.storyContext || []).join('\n\n')}`;
      
      // Use configured prompts from storyPrompts.ts only - append page context
      let baseUserPrompt = formatUserPrompt(promptConfig.userPromptTemplate, context.userInfo);
      const userPrompt = `${baseUserPrompt} This is page ${nextPageNumber}. ${shouldConclude ? 'The user has requested to end this adventure - bring the story to a satisfying and uplifting conclusion.' : 'Continue the never-ending adventure with new discoveries and possibilities. End with intrigue that makes the reader want to continue.'}`;
      
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

      // Extract first page from unified system
      const content = result.pages[0] || '';
      
      // Simple validation - just check if content exists and has reasonable length
      if (!content || content.length < 10) {
        console.log(`❌ Page ${nextPageNumber} too short, using fallback`);
        return this.generateFallbackNextPage(context, nextPageNumber, 'content_too_short', userRequestedEnding);
      }
      
      // Update context for next page (never-ending stories grow dynamically)
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...(context.storyContext || []), content],
        currentPage: nextPageNumber,
        totalExpectedPages: context.totalExpectedPages // Keep original expectation
      };

      console.log(`🚀 Live Generation: Page ${nextPageNumber} generated and validated successfully`);
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
      let promptConfig: any;
      if (context.difficulty === 'expert' && context.expertGradeLevel) {
        promptConfig = getExpertStoryPrompt(context.expertGradeLevel);
      } else {
        promptConfig = getStoryPrompt(context.difficulty);
      }

      const systemPrompt = `${promptConfig.systemPrompt}

      IMPORTANT: You are generating a CONCLUDING page for the ongoing story.
      - Provide a satisfying, age-appropriate ending that wraps up current threads
      - Keep tone uplifting and encouraging
      - Return ONLY the page content, no page numbers or formatting

      Previous story context:
      ${(context.storyContext || []).join('\n\n')}`;

      let baseUserPrompt = formatUserPrompt(promptConfig.userPromptTemplate, context.userInfo);
      const userPrompt = `${baseUserPrompt} Create a concluding page that ties the adventure together warmly and clearly indicates the story has reached a nice ending.`;

      const { StoryGenerationService } = await import('./storyGenerationService');
      
      // Create ending-focused userInfo
      const endingUserInfo = {
        ...context.userInfo,
        specialRequest: `Provide a satisfying conclusion to this adventure: ${context.storyContext.slice(-1)[0]?.substring(0, 100)}...`
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

      // Extract content from unified system
      const content = result.pages[0] || '';
      if (!content || content.length < 10) {
        return this.generateFallbackNextPage(context, nextPageNumber, 'content_too_short_conclusion', true);
      }

      console.log('🚀 Live Generation: Ending page generated successfully');
      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
      } catch {}

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content,
        isComplete: true,
        nextContext: undefined
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