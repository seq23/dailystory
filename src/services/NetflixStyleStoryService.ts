// Netflix-style Story Generation Service
// Generates full stories with AI quality preference

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import { getStoryPrompt, getExpertStoryPrompt, formatUserPrompt } from '@/config/storyPrompts';
import { ErrorHandler } from '@/utils/errorHandling';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { DiagnosticTool } from '@/utils/diagnostics';
import { APP_CONFIG } from '@/config/appConfig';
import { toast } from '@/hooks/use-toast';

export interface NetflixStoryResult {
  content: string[];
  pageCount: number;
  source: 'ai' | 'fallback';
  error?: string;
}

export class NetflixStyleStoryService {
  /**
   * Generate a complete story with AI-first preference
   */
  static async generateStory(userInfo: UserInfo): Promise<NetflixStoryResult> {
    console.log('📺 Netflix: Starting story generation for', userInfo.name);
    
    // Use user-selected difficulty (no automatic overrides)
    const difficulty: DifficultyLevel = (userInfo.difficultyLevel || userInfo.readingAbility || 'beginner') as DifficultyLevel;
    console.log(`🎯 Netflix: Using user-selected difficulty ${difficulty} for ${userInfo.name}`);

    let promptConfig: any;
    let expertGradeLevel: ExpertGradeLevel | undefined;

    if (difficulty === 'expert') {
      // Import expert difficulty manager for adaptive grade selection
      const { ExpertDifficultyManager } = await import('@/services/expertDifficultyManager');
      expertGradeLevel = await ExpertDifficultyManager.getExpertGradeLevel(userInfo);
      promptConfig = getExpertStoryPrompt(expertGradeLevel);
      console.log(`📚 Netflix: Using adaptive expert grade ${expertGradeLevel} for ${userInfo.name}`);
    } else {
      promptConfig = getStoryPrompt(difficulty);
    }

    // AI Generation First
    try {
      console.log('🤖 Netflix: Attempting AI generation first');

      const systemPrompt = `${promptConfig.systemPrompt}

      IMPORTANT: Generate a complete ${promptConfig.expectedPages}-page story.
      - Each page should be a complete scene or chapter segment
      - Maintain consistent character development throughout
      - Ensure age-appropriate content for ${difficulty} level
      - Return pages as an array, no page numbers in content
      - Focus on engaging storytelling and emotional connection`;

      // Use configured prompts from storyPrompts.ts only
      const userPrompt = formatUserPrompt(promptConfig.userPromptTemplate, userInfo);

      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: difficulty,
          interests: [userInfo.favoriteAnimal, userInfo.favoriteColor].filter(Boolean),
          config: {
            userName: userInfo.name,
            age: userInfo.age,
            systemPrompt,
            userPrompt,
            pageCount: promptConfig.expectedPages,
            isComplete: true,
            expertGrade: expertGradeLevel,
            userInfo: userInfo
          }
        }
      });

      if (error) {
        console.error('📺 Netflix: AI generation failed:', error);
        console.log(`🎯 Netflix API Error Fallback: Using difficulty ${difficulty} for ${userInfo.name}`);
        return this.generateFallbackStory(userInfo, difficulty, 'ai_error');
      }

      if (data?.pages && Array.isArray(data.pages) && data.pages.length > 0) {
        // Clean pages by removing any page markers
        const cleanedPages = data.pages.map((page: string) => 
          page.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim()
        ).filter((page: string) => page.length > 10);

        if (cleanedPages.length >= 3) {
          console.log(`✅ Netflix: AI generation successful - ${cleanedPages.length} pages`);
          try {
            (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          } catch {}

          return {
            content: cleanedPages,
            pageCount: cleanedPages.length,
            source: 'ai'
          };
        }
      }

      console.log('📺 Netflix: AI generation returned insufficient content, using fallback');
      return this.generateFallbackStory(userInfo, difficulty, 'insufficient_content');

    } catch (error) {
      console.error('📺 Netflix: AI generation error:', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'NetflixStyleStoryService.generateStory');
      console.log(`🎯 Netflix Error Fallback: Using difficulty ${difficulty} for ${userInfo.name}`);
      return this.generateFallbackStory(userInfo, difficulty, 'generation_error');
    }
  }

  /**
   * Generate a fallback story using templates
   */
  private static async generateFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel, reason: string): Promise<NetflixStoryResult> {
    console.log(`📺 Netflix: Using fallback story generation (reason: ${reason})`);
    
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
          pageCount: 5, // Default page count for fallback
          templateIndex: 0
        }
      });

      if (error || !data?.pages?.length) {
        throw new Error('Template service failed');
      }

      console.log(`📺 Netflix: Fallback template generated - ${data.pages.length} pages`);
      try {
        (globalThis as any).__LAST_STORY_SOURCE__ = 'fallback';
      } catch {}

      return {
        content: data.pages,
        pageCount: data.pages.length,
        source: 'fallback'
      };
    } catch (error) {
      console.error('📺 Netflix: Fallback generation failed:', error);
      // Emergency fallback with simple story
      const emergencyStory = [
        `${userInfo.name} started a wonderful day.`,
        `${userInfo.name} discovered something amazing.`,
        `It was the most exciting adventure ever.`,
        `${userInfo.name} felt very happy about the discovery.`,
        `The adventure ended perfectly, and ${userInfo.name} smiled.`
      ];

      return {
        content: emergencyStory,
        pageCount: emergencyStory.length,
        source: 'fallback'
      };
    }
  }

  static async generateCompleteStory(userInfo: UserInfo): Promise<NetflixStoryResult> {
    return this.generateStory(userInfo);
  }
}