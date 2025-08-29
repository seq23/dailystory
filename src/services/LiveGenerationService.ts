// Live Generation Service for Premium Users
// Generates stories page-by-page with tolerance-based validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getStoryPrompt, getExpertStoryPrompt, formatUserPrompt } from '@/config/storyPrompts';
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
  openEnded?: boolean;
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
   */
  static async generateFirstPage(userInfo: UserInfo, sessionType?: 'new' | 'continuation' | 'rewrite'): Promise<LivePageResult> {
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
      
      console.log(`🔄 Live Generation: Calling generate-adaptive-story with sessionType: ${sessionType || 'default'}`);
      
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: difficulty,
          interests: [userInfo.favoriteAnimal, userInfo.favoriteColor].filter(Boolean),
          sessionType, // Pass sessionType for context isolation
          config: {
            userName: userInfo.name,
            age: userInfo.age,
            systemPrompt,
            userPrompt,
            pageNumber: 1,
            isFirstPage: true,
            expertGrade: expertGradeLevel,
            userInfo: userInfo // Pass complete userInfo including avatar
          }
        }
      });

      if (error || !data?.pages) {
        console.error('🚀 Live Generation: Failed to generate first page:', error);
        console.log(`🎯 Live Generation API Error Fallback: Using difficulty ${difficulty} for ${userInfo.name}`);
        return this.generateFallbackFirstPage(userInfo, difficulty, 'api_error');
      }

      // Extract first page from the pages array and strip any page markers
      const rawContent = (data.pages[0] || '').trim();
      const content = rawContent.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim();
      
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
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend'],
        openEnded: !promptConfig.expectedPages // Open-ended if no expected pages set
      };

      console.log('🚀 Live Generation: First page generated and validated successfully');
      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = (data as any)?.source || 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = (globalThis as any).__LAST_PAGE_SOURCE__;
      } catch {}
      console.log('🧭 PAGE_SOURCE', { page: 1, source: (globalThis as any).__LAST_PAGE_SOURCE__, service: 'Live' });
      
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

  static async generateNextPage(context: LiveGenerationContext): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      const reachedEnd = nextPageNumber >= context.totalExpectedPages;
      const openEnded = !!context.openEnded;
      const shouldConclude = !openEnded && reachedEnd;
      
      console.log(`🚀 Live Generation: Generating page ${nextPageNumber}/${context.totalExpectedPages} (openEnded=${openEnded})`);
      
      let promptConfig: any;
      if (context.difficulty === 'expert' && context.expertGradeLevel) {
        promptConfig = getExpertStoryPrompt(context.expertGradeLevel);
      } else {
        promptConfig = getStoryPrompt(context.difficulty);
      }
      
      const systemPrompt = `${promptConfig.systemPrompt}
      
      IMPORTANT: You are generating page ${nextPageNumber} of a ${openEnded ? 'continuous' : context.totalExpectedPages + '-page'} story.
      - Continue the story naturally from the previous pages
      - ${shouldConclude ? 'This is the FINAL page - provide a satisfying conclusion' : 'End with a small hook/cliffhanger. Do NOT conclude the entire story.'}
      - Maintain consistency with characters and themes
      - Return ONLY the page content, no page numbers or formatting
      
      Previous story context:
      ${context.storyContext.join('\n\n')}`;
      
      // Use configured prompts from storyPrompts.ts only - append page context
      let baseUserPrompt = formatUserPrompt(promptConfig.userPromptTemplate, context.userInfo);
      const userPrompt = `${baseUserPrompt} This is page ${nextPageNumber}. ${shouldConclude ? 'Bring the story to a satisfying and uplifting conclusion.' : 'Keep momentum and end with an engaging teaser for what happens next.'}`;
      
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: context.difficulty,
          interests: [context.userInfo.favoriteAnimal, context.userInfo.favoriteColor].filter(Boolean),
          config: {
            userName: context.userInfo.name,
            age: context.userInfo.age,
            systemPrompt,
            userPrompt,
            pageNumber: nextPageNumber,
            isLastPage: shouldConclude,
            storyContext: context.storyContext,
            expertGrade: context.expertGradeLevel,
            userInfo: context.userInfo // Pass complete userInfo including avatar
          }
        }
      });

      if (error || !data?.pages) {
        console.error('🚀 Live Generation: Failed to generate page:', error);
        return this.generateFallbackNextPage(context, nextPageNumber, shouldConclude, 'api_error');
      }

      // Extract first page from the pages array and strip any page markers
      const rawContent = (data.pages[0] || '').trim();
      const content = rawContent.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim();
      
      // Simple validation - just check if content exists and has reasonable length
      if (!content || content.length < 10) {
        console.log(`❌ Page ${nextPageNumber} too short, using fallback`);
        return this.generateFallbackNextPage(context, nextPageNumber, shouldConclude, 'content_too_short');
      }
      
      // Update context for next page
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...context.storyContext, content],
        currentPage: nextPageNumber,
        totalExpectedPages: openEnded && reachedEnd ? context.totalExpectedPages + 1 : context.totalExpectedPages
      };

      console.log(`🚀 Live Generation: Page ${nextPageNumber} generated and validated successfully`);
      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = (data as any)?.source || 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = (globalThis as any).__LAST_PAGE_SOURCE__;
      } catch {}
      console.log('🧭 PAGE_SOURCE', { page: nextPageNumber, source: (globalThis as any).__LAST_PAGE_SOURCE__, service: 'Live' });
      
      return {
        content,
        isComplete: shouldConclude,
        nextContext: shouldConclude ? undefined : updatedContext
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating next page:', error);
      const nextPageNumber = context.currentPage + 1;
      const reachedEnd = nextPageNumber >= context.totalExpectedPages;
      const shouldConclude = !context.openEnded && reachedEnd;
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateNextPage');
      return this.generateFallbackNextPage(context, nextPageNumber, shouldConclude, 'generation_error');
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
      ${context.storyContext.join('\n\n')}`;

      let baseUserPrompt = formatUserPrompt(promptConfig.userPromptTemplate, context.userInfo);
      const userPrompt = `${baseUserPrompt} Create a concluding page that ties the adventure together warmly and clearly indicates the story has reached a nice ending.`;

      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: context.difficulty,
          interests: [context.userInfo.favoriteAnimal, context.userInfo.favoriteColor].filter(Boolean),
          config: {
            userName: context.userInfo.name,
            age: context.userInfo.age,
            systemPrompt,
            userPrompt,
            pageNumber: nextPageNumber,
            isLastPage: true,
            storyContext: context.storyContext,
            expertGrade: context.expertGradeLevel,
            userInfo: context.userInfo // Pass complete userInfo including avatar
          }
        }
      });

      if (error || !data?.pages) {
        console.error('🚀 Live Generation: Failed to generate ending page:', error);
        // Fallback: use next-page fallback with isLastPage true
        return this.generateFallbackNextPage(context, nextPageNumber, true, 'api_error_conclusion');
      }

      // Strip page markers from ending page content
      const rawContent = (data.pages[0] || '').trim();
      const content = rawContent.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim();
      if (!content || content.length < 10) {
        return this.generateFallbackNextPage(context, nextPageNumber, true, 'content_too_short_conclusion');
      }

      console.log('🚀 Live Generation: Ending page generated successfully');
      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = (data as any)?.source || 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = (globalThis as any).__LAST_PAGE_SOURCE__;
      } catch {}

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
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend'],
        openEnded: !promptConfig.expectedPages
      };

      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'fallback';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'fallback';
      } catch {}
      console.log('🧭 PAGE_SOURCE', { page: 1, source: (globalThis as any).__LAST_PAGE_SOURCE__, service: 'Live' });

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
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend'],
        openEnded: !promptConfig.expectedPages
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
    isLastPage: boolean,
    reason: string
  ): Promise<LivePageResult> {
    console.log(`🚀 Live Generation: Using fallback page ${pageNumber} (reason: ${reason})`);
    
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