// Netflix-Style Story Service for Free Users
// Generates complete stories upfront with tolerance-based validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel } from '@/types';
import { getStoryPrompt, formatUserPrompt, calculateDifficultyFromUser } from '@/config/storyPrompts';
import { ToleranceBasedValidator } from '@/utils/toleranceBasedValidator';
import { FlexiblePromptConstraints } from '@/utils/flexiblePromptConstraints';
import { EnhancedFallbackManager } from '@/constants/enhancedFallbackTemplates';
import { ErrorHandler } from '@/utils/errorHandling';
import { DifficultyManager } from '@/services/difficultyManager';

export interface NetflixStoryResult {
  pages: string[];
  difficulty: DifficultyLevel;
  title: string;
  isComplete: boolean;
  error?: string;
}

export class NetflixStyleStoryService {
  private static fallbackManager = new EnhancedFallbackManager();

  static async generateCompleteStory(userInfo: UserInfo): Promise<NetflixStoryResult> {
    try {
      console.log('🎬 Netflix-Style: Generating complete story for', userInfo.name);
      
      // Use DifficultyManager for consistent difficulty calculation
      const difficultyResult = DifficultyManager.getFinalDifficulty(userInfo);
      const difficulty = difficultyResult.difficulty;
      console.log(`🎯 Netflix-Style: Using difficulty ${difficulty} for ${userInfo.name}`);
      
      // Use flexible prompts instead of rigid constraints
      const systemPrompt = FlexiblePromptConstraints.createFlexibleSystemPrompt(difficulty);
      const userPrompt = FlexiblePromptConstraints.createFlexibleUserPrompt(difficulty, userInfo);
      
      console.log('🎬 Calling OpenAI with flexible constraints...');
      
      // Call OpenAI via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: difficulty,
          authorStyle: 'simple',
          theme: 'adventure',
          interests: [userInfo.favoriteAnimal, userInfo.favoriteColor].filter(Boolean),
          config: {
            userName: userInfo.name,
            age: userInfo.age,
            gradeLevel: userInfo.grade,
            favoriteColor: userInfo.favoriteColor,
            favoriteAnimal: userInfo.favoriteAnimal,
            favoriteFood: userInfo.favoriteFood,
            hobbies: userInfo.hobbies,
            maxLength: 500,
            expectedPages: 7,
            systemPrompt: systemPrompt,
            userPrompt: userPrompt,
            avatar: {
              type: 'child',
              skinTone: 'medium'
            }
          }
        }
      });

      if (error) {
        console.error('🎬 Netflix-Style: OpenAI call failed:', error);
        return this.generateEnhancedFallbackStory(userInfo, difficulty, 'api_error');
      }

      if (data?.pages && data.pages.length > 0) {
        console.log(`🎬 Netflix-Style: Generated ${data.pages.length} pages, validating...`);
        
        // Validate story with tolerance-based approach
        const validation = ToleranceBasedValidator.validateStory(data.pages, difficulty, userInfo);
        ToleranceBasedValidator.logValidationResult(validation, difficulty);
        
        if (validation.isValid) {
          console.log('✅ Story passed validation');
          return {
            pages: data.pages,
            difficulty: data.difficulty || difficulty,
            title: data.title || `${userInfo.name}'s Adventure`,
            isComplete: data.isComplete || true
          };
        } else {
          console.log('❌ Story failed validation, using enhanced fallback');
          return this.generateEnhancedFallbackStory(userInfo, difficulty, validation.fallbackReason || 'validation_failed');
        }
      }

      // Fallback if no content
      return this.generateEnhancedFallbackStory(userInfo, difficulty, 'no_content');
      
    } catch (error) {
      console.error('🎬 Netflix-Style: Story generation failed:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'NetflixStyleStoryService.generateCompleteStory');
      return this.generateEnhancedFallbackStory(userInfo, userInfo.difficultyLevel || 'easy', 'generation_error');
    }
  }

  private static generateEnhancedFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel, reason: string): NetflixStoryResult {
    console.log(`🎬 Netflix-Style: Using enhanced fallback (reason: ${reason})`);
    
    try {
      // Use the sophisticated enhanced fallback system
      const fallbackStory = EnhancedFallbackManager.getFallbackTemplate(difficulty, userInfo, 0);
      const pages = fallbackStory.split('\n\n').filter(page => page.trim().length > 0);
      
      // Validate the fallback story too
      const validation = ToleranceBasedValidator.validateStory(pages, difficulty, userInfo);
      
      if (validation.isValid || validation.scores.overallScore > 0.6) {
        console.log('✅ Enhanced fallback story validated successfully');
        return {
          pages,
          difficulty,
          title: `${userInfo.name}'s ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Adventure`,
          isComplete: true
        };
      } else {
        console.log('⚠️ Enhanced fallback validation failed, using basic fallback');
        return this.generateBasicFallbackStory(userInfo, difficulty);
      }
    } catch (error) {
      console.error('🎬 Enhanced fallback failed:', error);
      return this.generateBasicFallbackStory(userInfo, difficulty);
    }
  }

  private static generateBasicFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel): NetflixStoryResult {
    console.log('🎬 Netflix-Style: Using basic fallback as last resort');
    
    // Simple, guaranteed-to-work fallback
    const basicStories = {
      beginner: [
        `${userInfo.name} is happy.`,
        `${userInfo.name} sees a ${userInfo.favoriteColor || 'blue'} ${userInfo.favoriteAnimal || 'cat'}.`,
        `The ${userInfo.favoriteAnimal || 'cat'} is good.`,
        `${userInfo.name} and the ${userInfo.favoriteAnimal || 'cat'} play.`,
        `The end.`
      ],
      easy: [
        `${userInfo.name} had a wonderful day.`,
        `They found a ${userInfo.favoriteColor || 'beautiful'} ${userInfo.favoriteAnimal || 'friend'}.`,
        `Together they played happily.`,
        `${userInfo.name} felt very lucky.`,
        `It was the best day ever.`,
        `${userInfo.name} smiled all the way home.`
      ]
    };

    const pages = basicStories[difficulty as keyof typeof basicStories] || basicStories.easy;

    return {
      pages,
      difficulty,
      title: `${userInfo.name}'s Adventure`,
      isComplete: true
    };
  }
}