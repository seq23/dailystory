// Unified Story Generation Service with Simplified 3-Layer Priority System
// Removed author voice processing - AI chooses voice inspiration dynamically
// Sends fully resolved bundles to streamlined edge function

import { supabase } from "@/integrations/supabase/client";
import type { UserInfo, DifficultyLevel } from "@/types";
import { VocabularyService, type VocabularyIntegration } from "./vocabularyService";
import { extractThemeIntent, type ThemeIntent } from "@/utils/themeIntent";

export interface StoryGenerationBundle {
  storyContent: string;           // Fully resolved story requirements
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
   * Generate story using simplified 3-layer priority system
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
      console.log('🚀 Starting simplified 3-layer story generation pipeline');
      
      // PROCESSING PIPELINE (simplified to 5 steps)
      
      // Step 1: UserInfo (already available)
      
      // Step 2: VocabularyService (with silent failure)
      let vocabularyIntegration: VocabularyIntegration;
      try {
        vocabularyIntegration = await VocabularyService.fetchAllVocabulary(userInfo);
      } catch (error) {
        console.warn('⚠️ VocabularyService failed silently:', error);
        vocabularyIntegration = {
          userSpecified: { formWords: [], specialRequestWords: [], teacherWords: [] },
          systemVocabulary: { level: 2, complianceTarget: 0.7 },
          metadata: { totalUserWords: 0, priorityInstructions: '', sources: [] }
        };
      }
      
      // Step 3: ThemeIntent extraction (with silent failure)
      let themeIntent: ThemeIntent;
      try {
        themeIntent = extractThemeIntent(userInfo);
      } catch (error) {
        console.warn('⚠️ ThemeIntent extraction failed silently:', error);
        themeIntent = {
          theme: [],
          setting: [],
          characters: [],
          keywords: [],
          rawInput: userInfo.specialRequest || ''
        };
      }
      
      // Step 4: PlaceholderResolution with simplified 3-layer priority
      const resolvedStoryContent = this.resolveAllPlaceholders(
        userInfo,
        vocabularyIntegration,
        themeIntent
      );
      
      // Step 5: Send resolved string to edge function
      const generationBundle: StoryGenerationBundle = {
        storyContent: resolvedStoryContent,
        systemSettings: VocabularyService.getSystemSettings(vocabularyIntegration)
      };

      console.log('📦 Generation bundle prepared:', {
        storyContentLength: resolvedStoryContent.length,
        gradeLevel: generationBundle.systemSettings.gradeLevel
      });

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
   * Simplified 3-Layer Priority System (removed author voice processing)
   */
  private static resolveAllPlaceholders(
    userInfo: UserInfo,
    vocabularyIntegration: VocabularyIntegration,
    themeIntent: ThemeIntent
  ): string {
    
    // LAYER 1 - User Inputs (Highest Priority)
    const userName = userInfo.name?.trim() 
      ? userInfo.name 
      : 'the child whose name no one knew how to say';
    
    if (!userInfo.name?.trim()) {
      console.warn('🚨 USER DATA CORRUPTION: Missing name in userInfo form');
    }
    
    const userLayer = {
      userName,
      favoriteColor: userInfo.favoriteColor || '[AI_DETERMINE_COLOR]',
      favoriteAnimal: userInfo.favoriteAnimal || '[AI_DETERMINE_ANIMAL]',
      favoriteFood: userInfo.favoriteFood || '[AI_DETERMINE_FOOD]',
      hobbies: userInfo.hobbies || '[AI_DETERMINE_HOBBIES]',
      age: userInfo.age?.toString() || '[AI_DETERMINE_AGE]'
    };

    // LAYER 2 - Theme Intent (Structured Creative Elements)
    let specialRequest: string;
    if (themeIntent.theme.length > 0 || themeIntent.characters.length > 0 || themeIntent.setting.length > 0) {
      const parts = [];
      if (themeIntent.theme.length > 0) parts.push(`Themes: ${themeIntent.theme.join(', ')}`);
      if (themeIntent.characters.length > 0) parts.push(`Characters: ${themeIntent.characters.join(', ')}`);
      if (themeIntent.setting.length > 0) parts.push(`Settings: ${themeIntent.setting.join(', ')}`);
      if (themeIntent.keywords.length > 0) parts.push(`Keywords: ${themeIntent.keywords.join(', ')}`);
      specialRequest = parts.join('. ');
    } else if (themeIntent.rawInput?.trim()) {
      specialRequest = `Use these as creative inspiration: ${themeIntent.rawInput}`;
    } else {
      specialRequest = '[AI_DETERMINE_THEME]';
    }

    // LAYER 3 - Vocabulary (Educational Integration)
    const vocabularyInstructions = vocabularyIntegration.userSpecified.formWords.length > 0 || 
                           vocabularyIntegration.userSpecified.specialRequestWords.length > 0 || 
                           vocabularyIntegration.userSpecified.teacherWords.length > 0
      ? `MUST incorporate: ${VocabularyService.getUserVocabulary(vocabularyIntegration).join(', ')}`
      : '[AI_DETERMINE_VOCAB_LEVEL]';

    // Simplified template - AI chooses author voice inspiration dynamically
    const STORY_TEMPLATE = `Create a never-ending story for {userName}, age {age}. 
{specialRequest}
{vocabularyInstructions}`;

    // Resolve placeholders
    let resolvedTemplate = STORY_TEMPLATE;
    const allPlaceholders = { specialRequest, vocabularyInstructions, ...userLayer };
    
    for (const [key, value] of Object.entries(allPlaceholders)) {
      resolvedTemplate = resolvedTemplate.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }

    return resolvedTemplate;
  }

  /**
   * Call the streamlined edge function with fully resolved bundle
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
          authorVoice: 'AI-Selected'
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
      totalGenerations: 0
    };
  }
}