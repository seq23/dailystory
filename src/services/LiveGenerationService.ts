// Live Generation Service for Premium Users
// Generates stories page-by-page with tolerance-based validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { EnhancedFallbackManager } from '@/constants/enhancedFallbackTemplates';
import { ErrorHandler } from '@/utils/errorHandling';
import { ExpertDifficultyManager } from '@/services/expertDifficultyManager';
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
  private static fallbackManager = new EnhancedFallbackManager();

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
      
      // Simple prompts for free users - no complex configuration
      const systemPrompt = `Generate a ${difficulty} level story with 6 pages. Keep it age-appropriate and engaging.`;
      const userPrompt = `Create a story for ${userInfo.name} who likes ${userInfo.favoriteAnimal || 'animals'} and the color ${userInfo.favoriteColor || 'blue'}. ${userInfo.specialRequest || 'Make it fun!'}`;
      
      console.log(`🔄 Live Generation: Calling generate-adaptive-story with sessionType: ${sessionType || 'default'}`);
      
      // Remove removed prompt config references
      let expertGradeLevel: ExpertGradeLevel | undefined;
      
      if (difficulty === 'expert') {
        expertGradeLevel = (userInfo.expertGradeLevel || '6th') as ExpertGradeLevel;
        console.log(`📚 Live Generation: Using expert grade ${expertGradeLevel} for ${userInfo.name}`);
      }
      
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
        return this.generateEnhancedFallbackFirstPage(userInfo, difficulty, 'api_error');
      }

      // Extract first page from the pages array and strip any page markers
      const rawContent = (data.pages[0] || '').trim();
      const content = rawContent.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim();
      
      // Simple validation - just check if content exists and has reasonable length
      if (!content || content.length < 10) {
        console.log('❌ First page too short, using fallback');
        return this.generateEnhancedFallbackFirstPage(userInfo, difficulty, 'content_too_short');
      }
      
      // Remove removed prompt config references  
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
        expertGradeLevel,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: 6, // Fixed for live generation  
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend'],
        openEnded: false // Fixed stories for simplicity
      };

      console.log('🚀 Live Generation: First page generated and validated successfully');
      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = (data as any)?.source || 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = (globalThis as any).__LAST_PAGE_SOURCE__;
      } catch {}
      console.log('🧭 PAGE_SOURCE', { page: 1, source: (globalThis as any).__LAST_PAGE_SOURCE__, service: 'Live' });
      
      let contentOut = content;
      // Removed author voice processing for simplicity

      return {
        content: contentOut,
        isComplete: false,
        nextContext: context
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating first page:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateFirstPage');
      // Use same difficulty determination logic as main function
      const fallbackDifficulty: DifficultyLevel = (userInfo.difficultyLevel || userInfo.readingAbility || 'beginner') as DifficultyLevel;
      console.log(`🎯 Live Generation Error Fallback: Using difficulty ${fallbackDifficulty} for ${userInfo.name} (from ${userInfo.difficultyLevel ? 'difficultyLevel' : userInfo.readingAbility ? 'readingAbility' : 'default'})`);
      return this.generateEnhancedFallbackFirstPage(userInfo, fallbackDifficulty, 'generation_error');
    }
  }

  static async generateNextPage(context: LiveGenerationContext): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      const reachedEnd = nextPageNumber >= context.totalExpectedPages;
      const openEnded = !!context.openEnded;
      const shouldConclude = !openEnded && reachedEnd;
      
      console.log(`🚀 Live Generation: Generating page ${nextPageNumber}/${context.totalExpectedPages} (openEnded=${openEnded})`);
      
      // Simple prompts for continued generation
      const systemPrompt = `Generate page ${nextPageNumber} of a story. Keep it consistent with the story so far.`;
      const userPrompt = `Continue the story for ${context.userInfo.name}. ${shouldConclude ? 'Bring the story to a satisfying conclusion.' : 'Keep the story going with excitement.'}`;
      
      console.log(`Generated system prompt: ${systemPrompt.substring(0, 100)}...`);
      console.log(`Previous context: ${context.storyContext.slice(-1)[0]?.substring(0, 100)}...`);
      
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
        return this.generateEnhancedFallbackNextPage(context, nextPageNumber, shouldConclude, 'api_error');
      }

      // Extract first page from the pages array and strip any page markers
      const rawContent = (data.pages[0] || '').trim();
      const content = rawContent.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim();
      
      // Simple validation - just check if content exists and has reasonable length
      if (!content || content.length < 10) {
        console.log(`❌ Page ${nextPageNumber} too short, using fallback`);
        return this.generateEnhancedFallbackNextPage(context, nextPageNumber, shouldConclude, 'content_too_short');
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
      
      let contentOut = content;
      // Removed author voice processing for simplicity

      return {
        content: contentOut,
        isComplete: shouldConclude,
        nextContext: shouldConclude ? undefined : updatedContext
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating next page:', error);
      const nextPageNumber = context.currentPage + 1;
      const reachedEnd = nextPageNumber >= context.totalExpectedPages;
      const shouldConclude = !context.openEnded && reachedEnd;
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateNextPage');
      return this.generateEnhancedFallbackNextPage(context, nextPageNumber, shouldConclude, 'generation_error');
    }
  }

  // Generate an explicit concluding page without ending the reading session
  static async generateEndingPage(context: LiveGenerationContext): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      // Simple ending prompts
      const systemPrompt = `Generate a concluding page for the story. Make it satisfying and age-appropriate.`;
      const userPrompt = `Create a nice ending for ${context.userInfo.name}'s story that wraps things up warmly.`;

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
        return this.generateEnhancedFallbackNextPage(context, nextPageNumber, true, 'api_error_conclusion');
      }

      // Strip page markers from ending page content
      const rawContent = (data.pages[0] || '').trim();
      const content = rawContent.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim();
      if (!content || content.length < 10) {
        return this.generateEnhancedFallbackNextPage(context, nextPageNumber, true, 'content_too_short_conclusion');
      }

      console.log('🚀 Live Generation: Ending page generated successfully');
      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = (data as any)?.source || 'ai';
        (globalThis as any).__LAST_STORY_SOURCE__ = (globalThis as any).__LAST_PAGE_SOURCE__;
      } catch {}

      let contentOut = content;
      // Removed author voice processing for simplicity

      return {
        content: contentOut,
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

  private static generateEnhancedFallbackFirstPage(userInfo: UserInfo, difficulty: DifficultyLevel, reason: string): LivePageResult {
    console.log(`🚀 Live Generation: Using enhanced fallback first page (reason: ${reason})`);
    
    // Show toast notification for template usage
    toast({
      title: "Pre-written Story",
      description: "AI service temporarily unavailable. Enjoying quality pre-written content instead!",
      variant: "default"
    });
    
    try {
      // Simple prompts for fallback
      const promptConfig = { expectedPages: 6 }; // Fixed pages for simplicity
      
      // Use enhanced fallback system
      const fallbackStory = EnhancedFallbackManager.getFallbackTemplate(difficulty, userInfo, 0);
      const rawPages = fallbackStory.split('\n\n').filter(page => page.trim().length > 0);
      // Strip page markers from fallback pages as safety net
      const pages = rawPages.map(page => 
        page.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim()
      ).filter(page => page.length > 0);
      const content = pages[0] || `${userInfo.name} began a wonderful adventure.`;
      
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: promptConfig.expectedPages || 999, // Use same logic as main generation
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend'],
        openEnded: !promptConfig.expectedPages // Preserve unlimited behavior
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
      console.error('🚀 Enhanced fallback failed:', error);
      // Simple prompts for fallback
      const promptConfig = { expectedPages: 6 }; // Fixed pages for simplicity
      
      // Emergency fallback using Enhanced Template Library
      const emergencyFallback = EnhancedFallbackManager.getFallbackTemplate(difficulty, userInfo, 0);
      const rawContent = emergencyFallback.split('\n\n')[0] || `${userInfo.name} began a wonderful adventure.`;
      const content = rawContent.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim();
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: promptConfig.expectedPages || 999, // Preserve unlimited behavior
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

  private static generateEnhancedFallbackNextPage(
    context: LiveGenerationContext, 
    pageNumber: number, 
    isLastPage: boolean,
    reason: string
  ): LivePageResult {
    console.log(`🚀 Live Generation: Using enhanced fallback templates page ${pageNumber} (reason: ${reason})`);
    
    // Show toast notification for template usage
    toast({
      title: "Pre-written Story",
      description: "AI service temporarily unavailable. Enjoying quality pre-written content instead!",
      variant: "default"
    });
    
    try {
      // Use enhanced fallback system for continuation (187 templates available)
      const fallbackStory = EnhancedFallbackManager.getFallbackTemplate(context.difficulty, context.userInfo, pageNumber - 1, context.storyContext);
      const rawPages = fallbackStory.split('\n\n').filter(page => page.trim().length > 0);
      // Strip page markers from fallback pages as safety net
      const pages = rawPages.map(page => 
        page.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim()
      ).filter(page => page.length > 0);
      
      let content: string;
      if (pages.length > pageNumber - 1) {
        content = pages[pageNumber - 1];
      } else {
        // Use Enhanced Template Library for missing pages
        const fallbackTemplate = EnhancedFallbackManager.getFallbackTemplate(context.difficulty, context.userInfo, pageNumber - 1, context.storyContext);
        const rawFallbackPages = fallbackTemplate.split('\n\n').filter(page => page.trim().length > 0);
        const fallbackPages = rawFallbackPages.map(page => 
          page.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim()
        ).filter(page => page.length > 0);
        content = fallbackPages[Math.min(pageNumber - 1, fallbackPages.length - 1)] || 
          (isLastPage ? `${context.userInfo.name} felt happy about the wonderful adventure. The end!` : `${context.userInfo.name} continued the exciting journey.`);
      }
      
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
      console.error('🚀 Enhanced fallback failed:', error);
      // Emergency fallback using Enhanced Template Library
      const emergencyFallback = EnhancedFallbackManager.getFallbackTemplate(context.difficulty, context.userInfo, pageNumber - 1, context.storyContext);
      const rawEmergencyPages = emergencyFallback.split('\n\n').filter(page => page.trim().length > 0);
      const emergencyPages = rawEmergencyPages.map(page => 
        page.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim()
      ).filter(page => page.length > 0);
      const content = emergencyPages[Math.min(pageNumber - 1, emergencyPages.length - 1)] || 
        (isLastPage ? `${context.userInfo.name} had a great day. The end.` : `${context.userInfo.name} continued the adventure.`);
      
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