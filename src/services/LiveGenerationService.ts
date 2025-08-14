// Live Generation Service for Premium Users
// Generates stories page-by-page with tolerance-based validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getStoryPrompt, getExpertStoryPrompt, formatUserPrompt } from '@/config/storyPrompts';
import { EnhancedFallbackManager } from '@/constants/enhancedFallbackTemplates';
import { ErrorHandler } from '@/utils/errorHandling';
import { ExpertDifficultyManager } from '@/services/expertDifficultyManager';
import { getColorVoiceForUser, applyAuthorVoice } from '@/constants/authorVoicePatterns';
import { APP_CONFIG } from '@/config/appConfig';

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

  static async generateFirstPage(userInfo: UserInfo): Promise<LivePageResult> {
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

      // Append author voice preferred themes as a gentle hint
      try {
        if ((APP_CONFIG as any)?.features?.authorVoice?.deepeningEnabled) {
          const voice = getColorVoiceForUser(userInfo, difficulty);
          if (voice?.preferredThemes?.length) {
            userPrompt = `${userPrompt}\n\nPrefer themes: ${voice.preferredThemes.slice(0, 3).join(', ')}.`;
          }
        }
      } catch {}
      
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: difficulty,
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

      if (error || !data?.pages) {
        console.error('🚀 Live Generation: Failed to generate first page:', error);
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
      
      let contentOut = content;
      try {
        if ((APP_CONFIG as any)?.features?.authorVoice?.deepeningEnabled) {
          const voice = getColorVoiceForUser(userInfo, difficulty);
          const applyOn = (APP_CONFIG as any).features.authorVoice.applyOn;
          contentOut = applyAuthorVoice(content, voice, applyOn.first);
        }
      } catch {}

      return {
        content: contentOut,
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
      // Append author voice preferred themes as a gentle hint
      try {
        if ((APP_CONFIG as any)?.features?.authorVoice?.deepeningEnabled) {
          const voice = getColorVoiceForUser(context.userInfo, context.difficulty);
          if (voice?.preferredThemes?.length) {
            baseUserPrompt = `${baseUserPrompt}\n\nPrefer themes: ${voice.preferredThemes.slice(0, 3).join(', ')}.`;
          }
        }
      } catch {}
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
            expertGrade: context.expertGradeLevel
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
      try {
        if ((APP_CONFIG as any)?.features?.authorVoice?.deepeningEnabled) {
          const voice = getColorVoiceForUser(context.userInfo, context.difficulty);
          const applyOn = (APP_CONFIG as any).features.authorVoice.applyOn;
          const position = shouldConclude ? applyOn.last : applyOn.middle;
          contentOut = applyAuthorVoice(content, voice, position);
        }
      } catch {}

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
      // Append author voice preferred themes as a gentle hint
      try {
        if ((APP_CONFIG as any)?.features?.authorVoice?.deepeningEnabled) {
          const voice = getColorVoiceForUser(context.userInfo, context.difficulty);
          if (voice?.preferredThemes?.length) {
            baseUserPrompt = `${baseUserPrompt}\n\nPrefer themes: ${voice.preferredThemes.slice(0, 3).join(', ')}.`;
          }
        }
      } catch {}
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
            expertGrade: context.expertGradeLevel
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
      try {
        if ((APP_CONFIG as any)?.features?.authorVoice?.deepeningEnabled) {
          const voice = getColorVoiceForUser(context.userInfo, context.difficulty);
          const applyOn = (APP_CONFIG as any).features.authorVoice.applyOn;
          contentOut = applyAuthorVoice(content, voice, applyOn.last);
        }
      } catch {}

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
    
    try {
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
        totalExpectedPages: 6, // Simple fixed value
        characters: [userInfo.name, userInfo.favoriteAnimal || 'friend']
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
      // Emergency fallback using Enhanced Template Library
      const emergencyFallback = EnhancedFallbackManager.getFallbackTemplate(difficulty, userInfo, 0);
      const rawContent = emergencyFallback.split('\n\n')[0] || `${userInfo.name} began a wonderful adventure.`;
      const content = rawContent.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim();
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: 6,
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