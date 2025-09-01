// Unified Story Generation Service with 4-Layer Priority System
// Removed author voice processing - AI chooses voice inspiration dynamically
// Sends fully resolved bundles to streamlined edge function

import { supabase } from "@/integrations/supabase/client";
import type { UserInfo, DifficultyLevel } from "@/types";
import { VocabularyService, type VocabularyIntegration } from "./vocabularyService";
import { extractThemeIntent, type ThemeIntent } from "@/utils/themeIntent";
import { generateCreativeSeeds } from './inputEnhancementEngine';

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
   * Generate story using 4-layer priority system
   */
  static async generateStory(
    userInfo: UserInfo,
    config: {
      sessionType?: 'free' | 'premium';
      pageNumber?: number;
      existingStory?: string;
      expertGradeLevel?: string;
      difficulty?: string;
    }
  ): Promise<StoryGenerationResult> {
    try {
      console.log('🚀 Starting 4-layer story generation pipeline');
      console.log('🔍 Config received:', {
        sessionType: config.sessionType,
        pageNumber: config.pageNumber,
        expertGradeLevel: config.expertGradeLevel,
        difficulty: config.difficulty,
        userDifficultyLevel: userInfo.difficultyLevel
      });
      
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
      
      // Step 4: PlaceholderResolution with 4-layer priority
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
   * 4-Layer Priority System (removed author voice processing)
   */
  private static resolveAllPlaceholders(
    userInfo: UserInfo,
    vocabularyIntegration: VocabularyIntegration,
    themeIntent: ThemeIntent
  ): string {
    
    // LAYER 1 - Essential User Info Only (null-safe, no forced defaults for preferences)
    const essentialUserInfo = {
      name: userInfo.name || "Child whose name no one could say",
      age: userInfo.age || 5,
      avatar: userInfo.avatar, // Needed for hair mapping in edge function
      nativeLanguage: userInfo.nativeLanguage || 'en', // Needed for hair mapping logic
      difficultyLevel: userInfo.difficultyLevel, // Needed for story complexity
      gradeLevel: userInfo.gradeLevel || 'PreK', // Needed for vocabulary/complexity
      // USER PREFERENCES - only include if they exist, don't force defaults
      ...(userInfo.favoriteColor && { favoriteColor: userInfo.favoriteColor }),
      ...(userInfo.favoriteAnimal && { favoriteAnimal: userInfo.favoriteAnimal }),
      ...(userInfo.favoriteFood && { favoriteFood: userInfo.favoriteFood }),
      ...(userInfo.hobbies && { hobbies: userInfo.hobbies })
    };

    // LAYER 2 - Theme Intent Analysis (pulls from Layer 1 specialRequest only)
    let specialRequestContent = '';
    if (themeIntent.theme.length > 0 || themeIntent.setting.length > 0 || 
        themeIntent.characters.length > 0 || themeIntent.keywords.length > 0) {
      // Structured theme intent found
      const themeElements = [];
      if (themeIntent.theme.length > 0) themeElements.push(`themes: ${themeIntent.theme.join(', ')}`);
      if (themeIntent.setting.length > 0) themeElements.push(`settings: ${themeIntent.setting.join(', ')}`);
      if (themeIntent.characters.length > 0) themeElements.push(`characters: ${themeIntent.characters.join(', ')}`);
      if (themeIntent.keywords.length > 0) themeElements.push(`keywords: ${themeIntent.keywords.join(', ')}`);
      specialRequestContent = themeElements.join('; ');
    } else if (themeIntent.rawInput) {
      // Fallback to raw specialRequest - let AI determine all creative elements
      specialRequestContent = themeIntent.rawInput;
    } else {
      // Ultimate fallback
      specialRequestContent = userInfo.specialRequest || 'AI determines appropriate themes';
    }

    // LAYER 3 - Vocabulary Requirements (pulls from ALL vocabulary sources)
    const allUserVocabWords = VocabularyService.getUserVocabulary(vocabularyIntegration);
    const systemSettings = VocabularyService.getSystemSettings(vocabularyIntegration);
    
    let vocabularyInstructions = '';
    if (allUserVocabWords.length > 0) {
      const vocabSources = [];
      if (vocabularyIntegration.userSpecified.formWords.length > 0) vocabSources.push('form input');
      if (vocabularyIntegration.userSpecified.specialRequestWords.length > 0) vocabSources.push('special request');
      if (vocabularyIntegration.userSpecified.teacherWords.length > 0) vocabSources.push('teacher words');
      
      vocabularyInstructions = `Priority vocabulary to include: ${allUserVocabWords.join(', ')} (from: ${vocabSources.join(', ')})`;
    } else {
      vocabularyInstructions = `Use grade level ${systemSettings.gradeLevel} appropriate vocabulary based on difficulty level ${essentialUserInfo.difficultyLevel}`;
    }

    // LAYER 4 - Creative Seeds (handles favoriteColor/Animal/Food/hobbies exclusively)
    const creativeSeeds = generateCreativeSeeds(userInfo);
    const creativeGuidance = creativeSeeds.length > 0 
      ? `Creative Guidance (use as inspiration, not requirements): ${creativeSeeds.map(seed => 
          `Consider: ${seed.storyPossibilities.join(' OR ')}`
        ).join('; ')}`
      : 'AI determines creative elements organically';

    // Enhanced Natural Language Template (more AI-friendly)
    let userPreferences = '';
    if (essentialUserInfo.favoriteColor || essentialUserInfo.favoriteAnimal || 
        essentialUserInfo.favoriteFood || essentialUserInfo.hobbies) {
      const preferences = [];
      if (essentialUserInfo.favoriteColor) preferences.push(`favorite color: ${essentialUserInfo.favoriteColor}`);
      if (essentialUserInfo.favoriteAnimal) preferences.push(`favorite animal: ${essentialUserInfo.favoriteAnimal}`);
      if (essentialUserInfo.favoriteFood) preferences.push(`favorite food: ${essentialUserInfo.favoriteFood}`);
      if (essentialUserInfo.hobbies) preferences.push(`hobbies: ${essentialUserInfo.hobbies}`);
      userPreferences = `User preferences: ${preferences.join(', ')}. `;
    }

    const STORY_TEMPLATE = `Create a never-ending story for ${essentialUserInfo.name}, age ${essentialUserInfo.age}. ${userPreferences}Theme: ${specialRequestContent}. Vocabulary: ${vocabularyInstructions}. ${creativeGuidance}

Character Info: ${JSON.stringify(essentialUserInfo)}`;

    return STORY_TEMPLATE.trim();
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
      
      // CRITICAL FIX: Format the actual user prompt template with resolved data
      const { getStoryPrompt, getExpertStoryPrompt, formatUserPrompt, mapGradeToExpertLevel } = await import('../constants/storyPrompts');
      
      // Determine difficulty/grade level
      const gradeLevel = bundle.systemSettings.gradeLevel;
      const expertGrade = config.expertGradeLevel || mapGradeToExpertLevel(gradeLevel);
      const difficulty = config.difficulty || this.mapGradeLevelToDifficulty(gradeLevel);
      
      // Get the correct prompt template
      const promptConfig = expertGrade 
        ? getExpertStoryPrompt(expertGrade)
        : getStoryPrompt(difficulty);
      
      // Extract user data from the resolved bundle for formatUserPrompt
      const extractedData = this.extractUserDataFromBundle(bundle.storyContent);
      
      // Format the user prompt template with the extracted data
      const formattedUserPrompt = formatUserPrompt(promptConfig.userPromptTemplate, extractedData);
      
      // Replace bundle.storyContent with the properly formatted prompt
      const enhancedBundle = {
        ...bundle,
        storyContent: formattedUserPrompt
      };
      
      console.log('🔧 Fixed user prompt linkage:', {
        originalLength: bundle.storyContent.length,
        formattedLength: formattedUserPrompt.length,
        difficulty: expertGrade || difficulty
      });
      
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          // Streamlined payload structure with fixed prompt
          bundle: enhancedBundle,
          config: {
            sessionType: config.sessionType || 'free',
            pageNumber: config.pageNumber || 1,
            existingStory: config.existingStory,
            expertGradeLevel: config.expertGradeLevel,
            difficulty: config.difficulty
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
   * Extract user data from resolved bundle for formatUserPrompt
   */
  private static extractUserDataFromBundle(storyContent: string): Record<string, any> {
    let extractedData: Record<string, any> = {};
    
    try {
      // Extract Character Info JSON
      const matches = storyContent.match(/Character Info: ({.*})/);
      if (matches) {
        extractedData = JSON.parse(matches[1]);
      }
      
      // Extract other resolved data from the natural language bundle
      const vocabMatch = storyContent.match(/Vocabulary: (.*?)(?:\.|$)/);
      if (vocabMatch) {
        extractedData.vocabularyInstructions = vocabMatch[1];
      }
      
      const themeMatch = storyContent.match(/Theme: (.*?)(?:\.|Vocabulary)/);
      if (themeMatch) {
        extractedData.specialRequest = themeMatch[1];
      }
      
      // Add a creative seed for variation
      extractedData.seed = Math.floor(Math.random() * 10000);
      
    } catch (error) {
      console.warn('⚠️ Failed to extract user data from bundle:', error);
      // Return safe defaults
      extractedData = {
        userName: 'Child',
        specialRequest: 'adventure',
        vocabularyInstructions: 'age-appropriate vocabulary',
        seed: Math.floor(Math.random() * 10000)
      };
    }
    
    return extractedData;
  }

  /**
   * Map grade level to difficulty for backward compatibility
   */
  private static mapGradeLevelToDifficulty(gradeLevel: number): string {
    if (gradeLevel === 0) return 'beginner';
    if (gradeLevel === 1) return 'easy';
    if (gradeLevel === 2) return 'medium';
    if (gradeLevel === 3) return 'hard';
    return 'expert';
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