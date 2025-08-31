// Unified Story Generation Service
// Integrates VocabularyService, AuthorVoiceService, and CreativeElementsProcessor
// Sends pre-processed bundles to streamlined edge function

import { supabase } from "@/integrations/supabase/client";
import type { UserInfo, DifficultyLevel } from "@/types";
import { VocabularyService, type VocabularyIntegration } from "./vocabularyService";
import { AuthorVoiceService, type AuthorVoiceBundle, COLOR_VOICES } from "./authorVoiceService";
import { CreativeElementsProcessor, type CreativeBundle } from "./creativeElementsProcessor";

export interface StoryGenerationBundle {
  storyContent: string;           // Pre-processed story requirements
  authorVoice: AuthorVoiceBundle; // Pre-selected voice patterns
  userVocabulary: string[];       // Consolidated priority vocabulary
  systemSettings: {              // Minimal system requirements
    gradeLevel: number;
    complianceTarget: number;
  };
}

export interface StoryGenerationResult {
  success: boolean;
  story?: string;
  pages?: string[];
  error?: string;
  metadata?: {
    vocabCompliance: number;
    processingTime: number;
    authorVoice: string;
  };
}

export class StoryGenerationService {
  /**
   * Generate story using unified frontend processing pipeline
   */
  static async generateStory(
    userInfo: UserInfo,
    config: {
      sessionType?: 'free' | 'premium';
      pageNumber?: number;
      existingStory?: string;
    }
  ): Promise<StoryGenerationResult> {
    try {
      console.log('🚀 Starting unified story generation pipeline');
      
      // Step 1: Process vocabulary from all sources
      const vocabularyIntegration = await VocabularyService.fetchAllVocabulary(userInfo);
      
      // Step 2: Select author voice based on favorite color
      const authorVoiceBundle = AuthorVoiceService.createVoiceBundle(
        userInfo.favoriteColor, 
        userInfo.difficultyLevel || 'easy'
      );
      
      // Step 3: Process creative elements (simplified)
      const creativeBundle = CreativeElementsProcessor.processUserInputs(userInfo);
      
      // Step 4: Create story content requirements
      const storyContent = this.createStoryContent(userInfo, creativeBundle, authorVoiceBundle);
      
      // Step 5: Bundle for edge function
      const generationBundle: StoryGenerationBundle = {
        storyContent,
        authorVoice: authorVoiceBundle,
        userVocabulary: VocabularyService.getUserVocabulary(vocabularyIntegration),
        systemSettings: VocabularyService.getSystemSettings(vocabularyIntegration)
      };

      console.log('📦 Generation bundle prepared:', {
        storyContentLength: storyContent.length,
        userVocabularyCount: generationBundle.userVocabulary.length,
        authorVoice: authorVoiceBundle.voice.name,
        gradeLevel: generationBundle.systemSettings.gradeLevel
      });

      // Step 6: Call streamlined edge function
      const result = await this.callStreamlinedEdgeFunction(generationBundle, config);
      
      return result;
      
    } catch (error) {
      console.error('❌ Story generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create story content requirements from processed elements
   */
  private static createStoryContent(
    userInfo: UserInfo, 
    creativeBundle: CreativeBundle,
    authorVoiceBundle: AuthorVoiceBundle
  ): string {
    const elements = [];

    // Basic story setup
    elements.push(`Create a never-ending story for ${userInfo.name}, age ${userInfo.age || 6}.`);
    
    // Character traits from creative bundle
    if (creativeBundle.characterTraits.length > 0) {
      elements.push(`Character traits: ${creativeBundle.characterTraits.join(', ')}.`);
    }
    
    // Story elements
    if (creativeBundle.storyElements.length > 0) {
      elements.push(`Story elements: ${creativeBundle.storyElements.join(', ')}.`);
    }
    
    // Cultural elements
    if (creativeBundle.culturalElements.length > 0) {
      elements.push(`Cultural context: ${creativeBundle.culturalElements.join(', ')}.`);
    }
    
    // User vocabulary priority
    if (creativeBundle.vocabularyWords.length > 0) {
      elements.push(`PRIORITY WORDS to include: ${creativeBundle.vocabularyWords.join(', ')}.`);
    }
    
    // Special request (if any)
    if (userInfo.specialRequest) {
      elements.push(`Special theme: ${userInfo.specialRequest}.`);
    }
    
    // Author voice guidance
    elements.push(`Writing style: ${authorVoiceBundle.voice.styleSummary}`);
    elements.push(`Preferred themes: ${authorVoiceBundle.themeAlignment.join(', ')}`);

    return elements.join(' ');
  }

  /**
   * Call the streamlined edge function with pre-processed bundle
   */
  private static async callStreamlinedEdgeFunction(
    bundle: StoryGenerationBundle,
    config: any
  ): Promise<StoryGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🎯 Calling streamlined edge function');
      
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          // Streamlined payload structure
          bundle,
          config: {
            sessionType: config.sessionType || 'free',
            pageNumber: config.pageNumber || 1,
            existingStory: config.existingStory
          }
        }
      });

      const processingTime = Date.now() - startTime;

      if (error) {
        throw new Error(error.message || 'Edge function error');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Story generation failed');
      }

      console.log('✅ Story generation successful:', {
        processingTime,
        pagesGenerated: data.pages?.length || 0,
        storyLength: data.story?.length || 0
      });

      return {
        success: true,
        story: data.story,
        pages: data.pages,
        metadata: {
          vocabCompliance: data.vocabCompliance || 0,
          processingTime,
          authorVoice: bundle.authorVoice.voice.name
        }
      };

    } catch (error) {
      console.error('❌ Edge function call failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate story against vocabulary integration
   */
  static validateGeneratedStory(
    story: string,
    vocabularyIntegration: VocabularyIntegration,
    userName?: string
  ): { isValid: boolean; compliance: number; issues: string[] } {
    const validation = VocabularyService.validateSentenceWithPriority(
      story,
      vocabularyIntegration,
      userName
    );

    const issues: string[] = [];
    
    if (validation.invalidWords.length > 0) {
      issues.push(`Invalid words: ${validation.invalidWords.join(', ')}`);
    }
    
    if (validation.compliancePercentage < vocabularyIntegration.systemVocabulary.complianceTarget) {
      issues.push(`Low vocabulary compliance: ${Math.round(validation.compliancePercentage * 100)}%`);
    }

    return {
      isValid: validation.isValid,
      compliance: validation.compliancePercentage,
      issues
    };
  }

  /**
   * Get processing analytics
   */
  static getProcessingAnalytics() {
    return {
      cacheHits: 0, // TODO: Implement cache analytics
      averageProcessingTime: 0,
      vocabularySources: ['form', 'special_request', 'teacher_words', 'system'],
      authorVoicesUsed: Object.keys(COLOR_VOICES),
      totalGenerations: 0
    };
  }
}