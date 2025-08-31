// Unified Story Generation Service with 5-Layer Priority System
// Integrates VocabularyService, AuthorVoiceService, and CreativeSeeds
// Sends fully resolved bundles to streamlined edge function

import { supabase } from "@/integrations/supabase/client";
import type { UserInfo, DifficultyLevel } from "@/types";
import { VocabularyService, type VocabularyIntegration } from "./vocabularyService";
import { AuthorVoiceService, type AuthorVoiceBundle } from "./authorVoiceService";
import { generateCreativeSeeds, type CreativeStorySeed } from "./inputEnhancementEngine";
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
   * Generate story using 5-layer priority system with full frontend processing
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
      console.log('🚀 Starting 5-layer story generation pipeline');
      
      // PROCESSING PIPELINE (7 steps with silent failures)
      
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
      
      // Step 4: AuthorVoice selection (with silent failure)
      let authorVoiceBundle: AuthorVoiceBundle;
      try {
        authorVoiceBundle = AuthorVoiceService.createVoiceBundle(
          userInfo.favoriteColor || 'green', 
          userInfo.difficultyLevel || 'easy'
        );
      } catch (error) {
        console.warn('⚠️ AuthorVoice selection failed silently:', error);
        // Create minimal fallback bundle
        authorVoiceBundle = {
          voice: {
            name: "Green",
            description: "Safe fallback voice",
            ageRange: "5-7",
            patterns: {
              openings: ["Let's begin our story..."],
              transitions: ["What happens next?"],
              closings: ["The adventure continues..."],
              plotTwists: ["Something unexpected happens..."],
              continuations: ["Part two awaits..."],
              pauses: ["Take a moment to think..."],
              hooks: ["Something catches your attention..."]
            },
            characteristics: ["Safe narrative voice"],
            preferredThemes: ["friendship"],
            styleSummary: "Simple, safe storytelling",
            sampleMicroLines: ["Let's continue..."]
          },
          selectedPatterns: {
            opening: "Let's begin our story...",
            transitions: ["What happens next?"],
            closing: "The adventure continues..."
          },
          characteristics: ["Safe narrative voice"],
          themeAlignment: ["friendship"]
        };
      }
      
      // Step 5: CreativeSeeds generation (with silent failure)
      let creativeSeeds: CreativeStorySeed[];
      try {
        creativeSeeds = generateCreativeSeeds(userInfo);
      } catch (error) {
        console.warn('⚠️ CreativeSeeds generation failed silently:', error);
        creativeSeeds = [];
      }
      
      // Step 6: PlaceholderResolution with 5-layer priority
      const resolvedStoryContent = this.resolveAllPlaceholders(
        userInfo,
        vocabularyIntegration,
        themeIntent,
        authorVoiceBundle,
        creativeSeeds
      );
      
      // Step 7: Send resolved string to edge function
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
   * 5-Layer Priority System with Full Placeholder Resolution
   */
  private static resolveAllPlaceholders(
    userInfo: UserInfo,
    vocabularyIntegration: VocabularyIntegration,
    themeIntent: ThemeIntent,
    authorVoiceBundle: AuthorVoiceBundle,
    creativeSeeds: CreativeStorySeed[]
  ): string {
    
    // LAYER 1 - User Inputs (Highest Priority)
    // Smart name handling with corruption detection
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
      // HYBRID: Structured guidance + keywords
      const parts = [];
      if (themeIntent.theme.length > 0) parts.push(`Themes: ${themeIntent.theme.join(', ')}`);
      if (themeIntent.characters.length > 0) parts.push(`Characters: ${themeIntent.characters.join(', ')}`);
      if (themeIntent.setting.length > 0) parts.push(`Settings: ${themeIntent.setting.join(', ')}`);
      if (themeIntent.keywords.length > 0) parts.push(`Keywords: ${themeIntent.keywords.join(', ')}`);
      specialRequest = parts.join('. ');
    } else if (themeIntent.rawInput?.trim()) {
      // KEYWORDS: Pass everything as creative keywords
      specialRequest = `Use these as creative inspiration: ${themeIntent.rawInput}`;
    } else {
      specialRequest = '[AI_DETERMINE_THEME]';
    }

    // LAYER 3 - Creative Seeds (Enhancement Suggestions)
    const creativeLayer = {
      colorElement: creativeSeeds.find(s => s.inputType === 'color')?.storyPossibilities[0] || '[AI_DETERMINE_COLOR_USE]',
      animalElement: creativeSeeds.find(s => s.inputType === 'animal')?.storyPossibilities[0] || '[AI_DETERMINE_ANIMAL_USE]',
      hobbyElement: creativeSeeds.find(s => s.inputType === 'hobby')?.storyPossibilities[0] || '[AI_DETERMINE_HOBBY_USE]',
      foodElement: creativeSeeds.find(s => s.inputType === 'food')?.storyPossibilities[0] || '[AI_DETERMINE_FOOD_USE]'
    };

    // LAYER 4 - Vocabulary (Educational Integration)
    const vocabularyLayer = {
      targetVocabulary: VocabularyService.getUserVocabulary(vocabularyIntegration).join(', ') || '[AI_DETERMINE_VOCABULARY]',
      vocabularyInstructions: vocabularyIntegration.userSpecified.formWords.length > 0 || 
                             vocabularyIntegration.userSpecified.specialRequestWords.length > 0 || 
                             vocabularyIntegration.userSpecified.teacherWords.length > 0
        ? `MUST incorporate: ${VocabularyService.getUserVocabulary(vocabularyIntegration).join(', ')}`
        : '[AI_DETERMINE_VOCAB_LEVEL]'
    };

    // LAYER 5 - Author Voice (Style Guidance)
    const authorLayer = {
      authorStyle: authorVoiceBundle?.voice?.styleSummary || '[AI_DETERMINE_TONE]',
      storyOpenings: authorVoiceBundle?.selectedPatterns?.opening || '[AI_DETERMINE_OPENING]',
      storyTransitions: authorVoiceBundle?.selectedPatterns?.transitions?.[0] || '[AI_DETERMINE_TRANSITIONS]',
      plotTwists: authorVoiceBundle?.voice?.patterns?.plotTwists?.[0] || '[AI_DETERMINE_TWISTS]',
      continuations: authorVoiceBundle?.voice?.patterns?.continuations?.[0] || '[AI_DETERMINE_CONTINUATIONS]',
      pauses: authorVoiceBundle?.voice?.patterns?.pauses?.[0] || '[AI_DETERMINE_PAUSES]',
      hooks: authorVoiceBundle?.voice?.patterns?.hooks?.[0] || '[AI_DETERMINE_HOOKS]'
    };

    // Final Placeholder Resolution (User layer wins conflicts)
    const allPlaceholders = { 
      ...creativeLayer, 
      ...vocabularyLayer, 
      ...authorLayer, 
      specialRequest,
      ...userLayer  // User layer wins conflicts
    };

    // Template with all new placeholders
    const STORY_TEMPLATE = `Create a never-ending story for {userName}, age {age}. 
{specialRequest}
{colorElement} {animalElement} {hobbyElement} {foodElement}
{vocabularyInstructions}
Writing style: {authorStyle}
Opening style: {storyOpenings}
Transition style: {storyTransitions}
Plot twist style: {plotTwists}
Continuation style: {continuations}
Pause style: {pauses}
Hook style: {hooks}`;

    // Resolve all placeholders
    let resolvedTemplate = STORY_TEMPLATE;
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
          authorVoice: bundle.storyContent.includes('Green') ? 'Green' : 'AI-Selected'
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