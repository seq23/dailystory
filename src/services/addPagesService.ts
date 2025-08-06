// Add Pages Service - Smart page addition for both free and premium users
// Uses last page context for continuation, lets AI create new adventures

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel } from '@/types';
import { FlexiblePromptConstraints } from '@/utils/flexiblePromptConstraints';
import { ToleranceBasedValidator } from '@/utils/toleranceBasedValidator';
import { EnhancedFallbackManager } from '@/constants/enhancedFallbackTemplates';
import { ErrorHandler } from '@/utils/errorHandling';

export interface AddPagesResult {
  newPages: string[];
  isComplete: boolean;
  error?: string;
}

export class AddPagesService {
  private static fallbackManager = new EnhancedFallbackManager();

  /**
   * Adds 3-5 pages based on difficulty level, using only the last page as context
   */
  static async addPages(
    userInfo: UserInfo, 
    existingPages: string[], 
    difficulty: DifficultyLevel
  ): Promise<AddPagesResult> {
    try {
      console.log(`📄 AddPages: Adding pages for ${userInfo.name} (difficulty: ${difficulty})`);
      
      // Determine number of pages to add based on difficulty
      const constraints = FlexiblePromptConstraints.getFlexibleConstraints(difficulty);
      const pagesToAdd = Math.max(3, Math.min(5, constraints.pageRange.min));
      
      console.log(`📄 AddPages: Will add ${pagesToAdd} pages`);
      
      // Use only the last page as context to prevent prompt bloat
      const lastPage = existingPages[existingPages.length - 1] || '';
      const currentPageNumber = existingPages.length;
      
      const systemPrompt = `${FlexiblePromptConstraints.createFlexibleSystemPrompt(difficulty)}
      
      IMPORTANT: You are adding ${pagesToAdd} new pages to continue an existing story.
      - Use the last page as inspiration but feel free to introduce new adventures, characters, or concepts
      - You are NOT restricted to the exact same story - be creative and introduce new elements
      - Generate ${pagesToAdd} distinct pages, each building on the previous
      - End the final page with either completion or a new adventure hook
      - Return pages separated by "---PAGE---" markers
      - Focus on engaging storytelling appropriate for the difficulty level
      
      Last page context:
      ${lastPage}`;
      
      const userPrompt = `Continue ${userInfo.name}'s adventure! Create ${pagesToAdd} exciting new pages. Feel free to introduce new characters, locations, or plot twists. ${userInfo.specialRequest ? `Keep in mind: ${userInfo.specialRequest}` : ''} Make each page engaging and build toward either a satisfying conclusion or an exciting new chapter.`;
      
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: difficulty,
          authorStyle: 'continuation',
          theme: 'adventure',
          interests: [userInfo.favoriteAnimal, userInfo.favoriteColor].filter(Boolean),
          config: {
            userName: userInfo.name,
            age: userInfo.age,
            systemPrompt,
            userPrompt,
            pagesToAdd,
            currentPageNumber,
            lastPageContext: lastPage
          }
        }
      });

      if (error || !data?.content) {
        console.error('📄 AddPages: AI generation failed:', error);
        return this.generateFallbackPages(userInfo, difficulty, pagesToAdd, lastPage, 'api_error');
      }

      // Parse pages from response
      const content = data.content.trim();
      let newPages: string[];
      
      if (content.includes('---PAGE---')) {
        newPages = content.split('---PAGE---')
          .map(page => page.trim())
          .filter(page => page.length > 0);
      } else {
        // If no page markers, treat as single page and create additional ones
        newPages = [content];
        if (pagesToAdd > 1) {
          // Generate simple continuation pages
          for (let i = 1; i < pagesToAdd; i++) {
            newPages.push(`${userInfo.name} continued the exciting adventure.`);
          }
        }
      }

      // Ensure we have the right number of pages
      while (newPages.length < pagesToAdd) {
        newPages.push(`${userInfo.name} discovered something wonderful.`);
      }
      newPages = newPages.slice(0, pagesToAdd);

      // Validate pages
      const validation = ToleranceBasedValidator.validateStory(newPages, difficulty, userInfo);
      
      if (!validation.isValid && validation.scores.overallScore < 0.4) {
        console.log('❌ Added pages quality too low, using fallback');
        return this.generateFallbackPages(userInfo, difficulty, pagesToAdd, lastPage, 'quality_failed');
      }

      console.log(`✅ AddPages: Successfully added ${newPages.length} pages`);
      
      return {
        newPages,
        isComplete: false // Let user decide when to end
      };
      
    } catch (error) {
      console.error('📄 AddPages: Error adding pages:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'AddPagesService.addPages');
      return this.generateFallbackPages(userInfo, difficulty, 3, '', 'generation_error');
    }
  }

  private static generateFallbackPages(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    pagesToAdd: number,
    lastPage: string,
    reason: string
  ): AddPagesResult {
    console.log(`📄 AddPages: Using fallback pages (reason: ${reason})`);
    
    try {
      // Use enhanced fallback system
      const fallbackStory = EnhancedFallbackManager.getFallbackTemplate(difficulty, userInfo, 0);
      const templatePages = fallbackStory.split('\n\n').filter(page => page.trim().length > 0);
      
      const newPages: string[] = [];
      
      // Generate appropriate continuation pages
      for (let i = 0; i < pagesToAdd; i++) {
        if (templatePages.length > i) {
          // Use template page with user's name
          newPages.push(templatePages[i].replace(/\[Name\]/g, userInfo.name));
        } else {
          // Generate simple continuation
          const continuations = [
            `${userInfo.name} found a new path to explore.`,
            `Something exciting happened next.`,
            `${userInfo.name} made a wonderful discovery.`,
            `The adventure continued in an unexpected way.`,
            `${userInfo.name} felt happy about the journey.`
          ];
          newPages.push(continuations[i % continuations.length]);
        }
      }

      return {
        newPages,
        isComplete: false
      };
    } catch (error) {
      console.error('📄 AddPages: Enhanced fallback failed:', error);
      return this.generateBasicFallbackPages(userInfo, pagesToAdd);
    }
  }

  private static generateBasicFallbackPages(userInfo: UserInfo, pagesToAdd: number): AddPagesResult {
    console.log('📄 AddPages: Using basic fallback as last resort');
    
    const basicPages = [
      `${userInfo.name} continued the adventure.`,
      `Something wonderful happened next.`,
      `${userInfo.name} discovered something amazing.`,
      `The journey became even more exciting.`,
      `${userInfo.name} smiled with joy.`
    ];

    const newPages = basicPages.slice(0, pagesToAdd);
    
    return {
      newPages,
      isComplete: false
    };
  }
}