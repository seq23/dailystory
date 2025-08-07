// Live Generation Service for Premium Users
// Generates stories page-by-page with tolerance-based validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getStoryPrompt, getExpertStoryPrompt, formatUserPrompt, calculateDifficultyFromUser } from '@/config/storyPrompts';
import { EnhancedFallbackManager } from '@/constants/enhancedFallbackTemplates';
import { ErrorHandler } from '@/utils/errorHandling';
import { DifficultyManager } from '@/services/difficultyManager';
import { ExpertDifficultyManager } from '@/services/expertDifficultyManager';

export interface LiveGenerationContext {
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
  expertGradeLevel?: ExpertGradeLevel;
  storyContext: string[];
  currentPage: number;
  totalExpectedPages: number;
  theme: string;
  characters: string[];
}

export interface LivePageResult {
  content: string;
  isComplete: boolean;
  nextContext?: LiveGenerationContext;
  error?: string;
}

export class LiveGenerationService {
  private static fallbackManager = new EnhancedFallbackManager();

  static async generateFirstPage(userInfo: UserInfo): Promise<LivePageResult> {
    try {
      console.log('🚀 Live Generation: Starting first page for', userInfo.name);
      
      // Use DifficultyManager for consistent difficulty calculation
      const difficultyResult = DifficultyManager.getFinalDifficulty(userInfo);
      const difficulty = difficultyResult.difficulty;
      console.log(`🎯 Live Generation: Using difficulty ${difficulty} for ${userInfo.name}`);
      
      // Get expert grade level if using expert difficulty
      let expertGradeLevel: ExpertGradeLevel | undefined;
      let promptConfig: any;
      
      if (difficulty === 'expert') {
        expertGradeLevel = await ExpertDifficultyManager.getExpertGradeLevel(userInfo);
        promptConfig = getExpertStoryPrompt(expertGradeLevel);
        console.log(`📚 Live Generation: Using expert grade ${expertGradeLevel} for ${userInfo.name}`);
      } else {
        promptConfig = getStoryPrompt(difficulty);
      }
      const systemPrompt = `${promptConfig.systemPrompt}
      
      IMPORTANT: You are generating the FIRST PAGE only of a multi-page story. 
      - Create an engaging opening that establishes the character and setting
      - End with a hook that makes the reader want to continue
      - This is page 1 of approximately 5-8 pages
      - Keep the content appropriate for the difficulty level
      - Return ONLY the page content, no page numbers or formatting
      - Focus on quality storytelling over exact word counts`;
      
      const userPrompt = `Create the opening page for ${userInfo.name} (age ${userInfo.age}). They love ${userInfo.favoriteAnimal || 'animals'} and ${userInfo.favoriteColor || 'bright colors'}. Their hobby is ${userInfo.hobbies || 'playing'}. ${userInfo.specialRequest ? `Special request: ${userInfo.specialRequest}` : ''} Make it engaging and leave the reader wanting more.`;
      
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: difficulty,
          authorStyle: 'live-generation',
          theme: 'adventure',
          interests: [userInfo.favoriteAnimal, userInfo.favoriteColor].filter(Boolean),
          config: {
            userName: userInfo.name,
            age: userInfo.age,
            systemPrompt,
            userPrompt,
            pageNumber: 1,
            isFirstPage: true,
            expertGrade: expertGradeLevel
          }
        }
      });

      if (error || !data?.content) {
        console.error('🚀 Live Generation: Failed to generate first page:', error);
        return this.generateEnhancedFallbackFirstPage(userInfo, difficulty, 'api_error');
      }

      const content = data.content.trim();
      
      // Simple validation - just check if content exists and has reasonable length
      if (!content || content.length < 10) {
        console.log('❌ First page too short, using fallback');
        return this.generateEnhancedFallbackFirstPage(userInfo, difficulty, 'content_too_short');
      }
      
      // Create context for next page
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
        expertGradeLevel,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: promptConfig.expectedPages || 6,
        theme: 'adventure',
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend']
      };

      console.log('🚀 Live Generation: First page generated and validated successfully');
      
      return {
        content,
        isComplete: false,
        nextContext: context
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating first page:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateFirstPage');
      return this.generateEnhancedFallbackFirstPage(userInfo, userInfo.difficultyLevel || 'easy', 'generation_error');
    }
  }

  static async generateNextPage(context: LiveGenerationContext): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      const isLastPage = nextPageNumber >= context.totalExpectedPages;
      
      console.log(`🚀 Live Generation: Generating page ${nextPageNumber}/${context.totalExpectedPages}`);
      
      let promptConfig: any;
      if (context.difficulty === 'expert' && context.expertGradeLevel) {
        promptConfig = getExpertStoryPrompt(context.expertGradeLevel);
      } else {
        promptConfig = getStoryPrompt(context.difficulty);
      }
      
      const systemPrompt = `${promptConfig.systemPrompt}
      
      IMPORTANT: You are generating page ${nextPageNumber} of a ${context.totalExpectedPages}-page story.
      - Continue the story naturally from the previous pages
      - ${isLastPage ? 'This is the FINAL page - provide a satisfying conclusion' : 'End with engagement to continue to the next page'}
      - Maintain consistency with characters and themes
      - Return ONLY the page content, no page numbers or formatting
      
      Previous story context:
      ${context.storyContext.join('\n\n')}`;
      
      const userPrompt = `Continue the story for ${context.userInfo.name}. This is page ${nextPageNumber}. ${isLastPage ? 'Bring the story to a satisfying and uplifting conclusion.' : 'Continue the adventure and build excitement for what comes next.'}`;
      
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: context.difficulty,
          authorStyle: 'live-generation',
          theme: context.theme,
          interests: [context.userInfo.favoriteAnimal, context.userInfo.favoriteColor].filter(Boolean),
          config: {
            userName: context.userInfo.name,
            age: context.userInfo.age,
            systemPrompt,
            userPrompt,
            pageNumber: nextPageNumber,
            isLastPage,
            storyContext: context.storyContext,
            expertGrade: context.expertGradeLevel
          }
        }
      });

      if (error || !data?.content) {
        console.error('🚀 Live Generation: Failed to generate page:', error);
        return this.generateEnhancedFallbackNextPage(context, nextPageNumber, isLastPage, 'api_error');
      }

      const content = data.content.trim();
      
      // Simple validation - just check if content exists and has reasonable length
      if (!content || content.length < 10) {
        console.log(`❌ Page ${nextPageNumber} too short, using fallback`);
        return this.generateEnhancedFallbackNextPage(context, nextPageNumber, isLastPage, 'content_too_short');
      }
      
      // Update context for next page
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...context.storyContext, content],
        currentPage: nextPageNumber
      };

      console.log(`🚀 Live Generation: Page ${nextPageNumber} generated and validated successfully`);
      
      return {
        content,
        isComplete: isLastPage,
        nextContext: isLastPage ? undefined : updatedContext
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating next page:', error);
      const nextPageNumber = context.currentPage + 1;
      const isLastPage = nextPageNumber >= context.totalExpectedPages;
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateNextPage');
      return this.generateEnhancedFallbackNextPage(context, nextPageNumber, isLastPage, 'generation_error');
    }
  }

  private static generateEnhancedFallbackFirstPage(userInfo: UserInfo, difficulty: DifficultyLevel, reason: string): LivePageResult {
    console.log(`🚀 Live Generation: Using enhanced fallback first page (reason: ${reason})`);
    
    try {
      // Use enhanced fallback system
      const fallbackStory = EnhancedFallbackManager.getFallbackTemplate(difficulty, userInfo, 0);
      const pages = fallbackStory.split('\n\n').filter(page => page.trim().length > 0);
      const content = pages[0] || `${userInfo.name} began a wonderful adventure.`;
      
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: 6, // Simple fixed value
        theme: 'adventure',
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend']
      };

      return {
        content,
        isComplete: false,
        nextContext: context
      };
    } catch (error) {
      console.error('🚀 Enhanced fallback failed:', error);
      // Emergency fallback - should rarely be needed with 187 templates
      const content = `${userInfo.name} began a wonderful adventure.`;
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: 6,
        theme: 'adventure',
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend']
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
    
    try {
      // Use enhanced fallback system for continuation (187 templates available)
      const fallbackStory = EnhancedFallbackManager.getFallbackTemplate(context.difficulty, context.userInfo, pageNumber - 1, context.storyContext);
      const pages = fallbackStory.split('\n\n').filter(page => page.trim().length > 0);
      
      let content: string;
      if (pages.length > pageNumber - 1) {
        content = pages[pageNumber - 1];
      } else {
        // Generate appropriate content for the page
        content = isLastPage 
          ? `${context.userInfo.name} felt happy about the wonderful adventure. The end!`
          : `${context.userInfo.name} continued the exciting journey.`;
      }
      
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
    } catch (error) {
      console.error('🚀 Enhanced fallback failed:', error);
      // Emergency fallback - should rarely be needed
      const content = isLastPage 
        ? `${context.userInfo.name} had a great day. The end.`
        : `${context.userInfo.name} continued the adventure.`;
      
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