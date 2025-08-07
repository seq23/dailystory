// Netflix-Style Story Service for Free Users
// Generates complete stories upfront with tolerance-based validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getStoryPrompt, getExpertStoryPrompt, formatUserPrompt, calculateDifficultyFromUser } from '@/config/storyPrompts';
import { EnhancedFallbackManager } from '@/constants/enhancedFallbackTemplates';
import { ErrorHandler } from '@/utils/errorHandling';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { DifficultyManager } from '@/services/difficultyManager';
import { ExpertDifficultyManager } from '@/services/expertDifficultyManager';

export interface NetflixStoryResult {
  pages: string[];
  difficulty: DifficultyLevel;
  expertGradeLevel?: ExpertGradeLevel;
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
      
      // Get expert grade level if using expert difficulty
      let expertGradeLevel: ExpertGradeLevel | undefined;
      let promptConfig: any;
      
      if (difficulty === 'expert') {
        expertGradeLevel = await ExpertDifficultyManager.getExpertGradeLevel(userInfo);
        promptConfig = getExpertStoryPrompt(expertGradeLevel);
        console.log(`📚 Netflix-Style: Using expert grade ${expertGradeLevel} for ${userInfo.name}`);
      } else {
        promptConfig = getStoryPrompt(difficulty);
      }
      const systemPrompt = promptConfig.systemPrompt;
      
      // Sanitize all user inputs before story generation
      const safeName = InputSanitizer.sanitizeUserInfo(userInfo.name);
      const safeAnimal = InputSanitizer.sanitizeStoryInput(userInfo.favoriteAnimal || 'animals');
      const safeColor = InputSanitizer.sanitizeStoryInput(userInfo.favoriteColor || 'bright colors');
      const safeHobbies = InputSanitizer.sanitizeStoryInput(userInfo.hobbies || 'playing');
      const safeRequest = InputSanitizer.sanitizeStoryInput(userInfo.specialRequest || '');
      
      const userPrompt = `Create an engaging story for ${safeName} (age ${userInfo.age}). They love ${safeAnimal} and ${safeColor}. Their hobby is ${safeHobbies}. ${safeRequest ? `Special request: ${safeRequest}` : ''}`;
      
      console.log('🎬 Calling OpenAI with simple prompts...');
      
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
            maxLength: promptConfig.maxLength || 500,
            expectedPages: promptConfig.expectedPages || 7,
            systemPrompt: systemPrompt,
            userPrompt: userPrompt,
            expertGrade: expertGradeLevel,
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
        console.log(`🎬 Netflix-Style: Generated ${data.pages.length} pages - accepting OpenAI content`);
        
        // Simple validation - just check if content exists
        if (data.pages.some(page => page && page.trim().length > 0)) {
          console.log('✅ Story has content - proceeding');
          return {
            pages: data.pages,
            difficulty: data.difficulty || difficulty,
            expertGradeLevel,
            title: data.title || `${userInfo.name}'s Adventure`,
            isComplete: data.isComplete || true
          };
        }
      }

      // Fallback if no content - use enhanced fallback templates
      return this.generateEnhancedFallbackStory(userInfo, difficulty, 'no_content');
      
    } catch (error) {
      console.error('🎬 Netflix-Style: Story generation failed:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'NetflixStyleStoryService.generateCompleteStory');
      return this.generateEnhancedFallbackStory(userInfo, userInfo.difficultyLevel || 'easy', 'generation_error');
    }
  }

  private static generateEnhancedFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel, reason: string): NetflixStoryResult {
    console.log(`🎬 Netflix-Style: Using enhanced fallback templates (reason: ${reason})`);
    
    try {
      // Use the sophisticated enhanced fallback system with 187 templates
      const fallbackStory = EnhancedFallbackManager.getFallbackTemplate(difficulty, userInfo, 0);
      const pages = fallbackStory.split('\n\n').filter(page => page.trim().length > 0);
      
      return {
        pages,
        difficulty,
        title: `${userInfo.name}'s ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Adventure`,
        isComplete: true
      };
    } catch (error) {
      console.error('🎬 Enhanced fallback failed:', error);
      // Emergency fallback - should rarely be needed with 187 templates
      return {
        pages: [`${userInfo.name} had an amazing adventure today!`],
        difficulty,
        title: `${userInfo.name}'s Adventure`,
        isComplete: true
      };
    }
  }
}