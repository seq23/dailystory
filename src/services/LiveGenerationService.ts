// Live Generation Service for Premium Users
// Generates stories page-by-page on demand

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel } from '@/types';
import { getStoryPrompt, formatUserPrompt, calculateDifficultyFromUser } from '@/config/storyPrompts';

export interface LiveGenerationContext {
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
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
  static async generateFirstPage(userInfo: UserInfo): Promise<LivePageResult> {
    try {
      console.log('🚀 Live Generation: Starting first page for', userInfo.name);
      
      const difficulty = userInfo.difficultyLevel || calculateDifficultyFromUser(userInfo);
      const promptConfig = getStoryPrompt(difficulty);
      
      const systemPrompt = `${promptConfig.systemPrompt}
      
      IMPORTANT: You are generating the FIRST PAGE only of a multi-page story. 
      - Create an engaging opening that establishes the character and setting
      - End with a hook that makes the reader want to continue
      - This is page 1 of approximately ${promptConfig.expectedPages} pages
      - Keep the content appropriate for the difficulty level
      - Return ONLY the page content, no page numbers or formatting`;
      
      const userPrompt = `Create the opening page for ${userInfo.name} (age ${userInfo.age}). They love ${userInfo.favoriteAnimal} and ${userInfo.favoriteColor}. Their hobby is ${userInfo.hobbies}. Make it engaging and leave the reader wanting more.`;
      
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
            isFirstPage: true
          }
        }
      });

      if (error || !data?.content) {
        console.error('🚀 Live Generation: Failed to generate first page:', error);
        return this.generateFallbackFirstPage(userInfo, difficulty);
      }

      const content = data.content.trim();
      
      // Create context for next page
      const context: LiveGenerationContext = {
        userInfo,
        difficulty,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: promptConfig.expectedPages,
        theme: 'adventure',
        characters: [userInfo.name, userInfo.favoriteAnimal]
      };

      console.log('🚀 Live Generation: First page generated successfully');
      
      return {
        content,
        isComplete: false,
        nextContext: context
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating first page:', error);
      return this.generateFallbackFirstPage(userInfo, userInfo.difficultyLevel || 'easy');
    }
  }

  static async generateNextPage(context: LiveGenerationContext): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      const isLastPage = nextPageNumber >= context.totalExpectedPages;
      
      console.log(`🚀 Live Generation: Generating page ${nextPageNumber}/${context.totalExpectedPages}`);
      
      const promptConfig = getStoryPrompt(context.difficulty);
      
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
            storyContext: context.storyContext
          }
        }
      });

      if (error || !data?.content) {
        console.error('🚀 Live Generation: Failed to generate page:', error);
        return this.generateFallbackNextPage(context, nextPageNumber, isLastPage);
      }

      const content = data.content.trim();
      
      // Update context for next page
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...context.storyContext, content],
        currentPage: nextPageNumber
      };

      console.log(`🚀 Live Generation: Page ${nextPageNumber} generated successfully`);
      
      return {
        content,
        isComplete: isLastPage,
        nextContext: isLastPage ? undefined : updatedContext
      };
      
    } catch (error) {
      console.error('🚀 Live Generation: Error generating next page:', error);
      const nextPageNumber = context.currentPage + 1;
      const isLastPage = nextPageNumber >= context.totalExpectedPages;
      return this.generateFallbackNextPage(context, nextPageNumber, isLastPage);
    }
  }

  private static generateFallbackFirstPage(userInfo: UserInfo, difficulty: DifficultyLevel): LivePageResult {
    console.log('🚀 Live Generation: Using fallback first page');
    
    const fallbackContent = {
      beginner: `Hello ${userInfo.name}! Today is a special day. You will meet a new friend.`,
      easy: `${userInfo.name} woke up feeling excited. Something amazing was going to happen today, they could feel it in the air.`,
      medium: `${userInfo.name} had always loved ${userInfo.hobbies}, but today felt different. As they stepped outside, a mysterious ${userInfo.favoriteColor} glow caught their attention.`,
      hard: `At ${userInfo.age} years old, ${userInfo.name} had become quite skilled at ${userInfo.hobbies}. Little did they know that their passion would soon lead them on an extraordinary adventure.`,
      expert: `In the quiet moments before dawn, ${userInfo.name} contemplated the relationship between ${userInfo.hobbies} and the deeper mysteries of existence. Today, that contemplation would become reality.`
    };

    const promptConfig = getStoryPrompt(difficulty);
    const content = fallbackContent[difficulty] || fallbackContent.easy;
    
    const context: LiveGenerationContext = {
      userInfo,
      difficulty,
      storyContext: [content],
      currentPage: 1,
      totalExpectedPages: promptConfig.expectedPages,
      theme: 'adventure',
      characters: [userInfo.name, userInfo.favoriteAnimal]
    };

    return {
      content,
      isComplete: false,
      nextContext: context
    };
  }

  private static generateFallbackNextPage(
    context: LiveGenerationContext, 
    pageNumber: number, 
    isLastPage: boolean
  ): LivePageResult {
    console.log(`🚀 Live Generation: Using fallback page ${pageNumber}`);
    
    const { userInfo, difficulty } = context;
    
    let content: string;
    
    if (isLastPage) {
      // Conclusion content
      content = {
        beginner: `${userInfo.name} is happy. The end!`,
        easy: `${userInfo.name} smiled big. It was the best adventure ever!`,
        medium: `As the sun set, ${userInfo.name} realized that this was just the beginning of many wonderful adventures ahead.`,
        hard: `${userInfo.name} understood that every ending is also a new beginning, filled with infinite possibilities.`,
        expert: `In the quiet aftermath of transformation, ${userInfo.name} carried forward the wisdom that growth and wonder are eternal companions.`
      }[difficulty] || `${userInfo.name} felt grateful for the amazing adventure and looked forward to what tomorrow might bring.`;
    } else {
      // Continuation content
      content = {
        beginner: `${userInfo.name} sees something new. It is ${userInfo.favoriteColor}!`,
        easy: `Suddenly, a friendly ${userInfo.favoriteAnimal} appeared. It wanted to show ${userInfo.name} something special.`,
        medium: `The ${userInfo.favoriteAnimal} led ${userInfo.name} deeper into the adventure, where ${userInfo.favoriteColor} magic filled the air.`,
        hard: `With each step forward, ${userInfo.name} discovered that their skills in ${userInfo.hobbies} were more important than they had ever imagined.`,
        expert: `The journey continued to unfold layers of meaning, each revelation building upon the last in an intricate dance of discovery and understanding.`
      }[difficulty] || `The adventure continued as ${userInfo.name} discovered something wonderful.`;
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
  }
}