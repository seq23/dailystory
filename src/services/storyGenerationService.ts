// Unified Story Generation Service with 4-Layer Priority System
// Voice Layer replaces Creative Seeds - AI chooses voice with theme priority and level clamping
// Sends fully resolved bundles to streamlined edge function

import { supabase } from "@/integrations/supabase/client";
import type { UserInfo, DifficultyLevel, LearningGoal, AvatarType } from "@/types";
import { VocabularyService, type VocabularyIntegration } from "./vocabularyService";
import { extractThemeIntent, type ThemeIntent } from "@/utils/themeIntent";
import { getCulturalGuidanceString } from './StaticDataCache';
import { VoiceCatalogIntegration } from './voiceCatalog/VoiceCatalogIntegration';
import { generateSessionId, generateSessionIdWithPrefix } from '@/utils/sessionId';
import { safeThemeJoin } from "@/lib/utils";

import { LevelClampingService } from './voiceCatalog/LevelClampingService';

export interface StoryGenerationBundle {
  sessionId: string;              // Session identifier for debugging and caching
  storyContent: string;           // Fully resolved story requirements
  avatarData: {                   // Separate avatar data for clean prompts
    skinTone?: string;
  };
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

/**
 * Safe error message extraction utility
 */
function safeErrorMessage(error: any): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
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
      sessionId?: string;
      isEndingPage?: boolean;
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
      
      // PHASE 1: Protected 4-Layer Parallelization with Silent Fallbacks
      let vocabularyIntegration: VocabularyIntegration;
      let themeIntent: ThemeIntent;  
      let voiceIntegrationResult: any;

      try {
        vocabularyIntegration = await VocabularyService.fetchAllVocabulary(userInfo);
      } catch (error) {
        console.warn('⚠️ Layer 2 (Vocabulary) failed silently:', safeErrorMessage(error));
        vocabularyIntegration = {
          userSpecified: { formWords: [], specialRequestWords: [], teacherWords: [] },
          systemVocabulary: { level: 2, complianceTarget: 0.7 },
          metadata: { totalUserWords: 0, priorityInstructions: 'AI selects appropriate vocabulary', sources: ['ai_fallback'] }
        };
      }

      try {
        themeIntent = extractThemeIntent(userInfo);
      } catch (error) {
        console.warn('⚠️ Layer 3 (Theme) failed silently:', safeErrorMessage(error));
        themeIntent = {
          theme: ['adventure'], // AI-friendly default
          setting: ['magical world'],
          characters: ['brave hero'],
          keywords: [],
          rawInput: 'AI creates engaging adventure story'
        };
      }

      // LAYER 4: Voice Selection with Raw Themes - Backend Handles Processing
      try {
        // Pass raw themes to backend for AI-driven processing
        
        // Select voice with cross-level search and fail-soft capability
        const difficulty = this.mapToDifficultyLevel(config.difficulty || userInfo.difficultyLevel || 'easy');
        voiceIntegrationResult = await VoiceCatalogIntegration.selectAndPrepareVoice(
          userInfo, 
          difficulty,
          {
            themes: themeIntent.theme,  // Raw themes - backend processes
            warmthPreference: 0.7,
            humorPreference: 0.6
          }
        );

        // Add fail-soft flag for downstream processing
        if (voiceIntegrationResult) {
          voiceIntegrationResult.processingMetadata = {
            ...voiceIntegrationResult.processingMetadata,
            failSoftUsed: false
          };
        }
        
        // Apply level clamping
        const clampedVoice = LevelClampingService.applyConstraints(
          voiceIntegrationResult.selectedVoice, 
          difficulty, 
          userInfo.age
        );
        voiceIntegrationResult.selectedVoice = clampedVoice;
        
        console.log('✅ Voice Layer 4: Selected and clamped voice:', voiceIntegrationResult.selectedVoice.pn);
      } catch (error) {
        console.warn('⚠️ Layer 4 (Voice) failed silently:', safeErrorMessage(error));
        // Fallback voice integration
        voiceIntegrationResult = {
          selectedVoice: { pn: 'AI Narrator', id: 'fallback' },
          storyBundle: 'AI creates engaging story based on user preferences',
          compatibilityScore: 0.5,
          processingMetadata: { fallbackUsed: true }
        };
      }
      
      // Step 4: PlaceholderResolution with 4-layer priority (now includes voice layer)
      const resolvedResult = await this.resolveAllPlaceholders(
        userInfo,
        vocabularyIntegration,
        themeIntent,
        voiceIntegrationResult
      );
      
      // Step 5: Send resolved string to edge function
      const generationBundle: StoryGenerationBundle = {
        sessionId: config.sessionId || generateSessionId(),
        storyContent: resolvedResult.storyContent,
        avatarData: resolvedResult.avatarData,
        systemSettings: VocabularyService.getSystemSettings(vocabularyIntegration)
      };

      console.log(`🆔 StoryGen: Session ID: ${generationBundle.sessionId}`);
      console.log('📦 Generation bundle prepared:', {
        sessionId: generationBundle.sessionId,
        storyContentLength: resolvedResult.storyContent.length,
        gradeLevel: generationBundle.systemSettings.gradeLevel,
        avatarDataPresent: !!resolvedResult.avatarData.skinTone
      });
      console.log('📦 Generation bundle prepared:', {
        sessionId: generationBundle.sessionId,
        storyContentLength: resolvedResult.storyContent.length,
        gradeLevel: generationBundle.systemSettings.gradeLevel,
        avatarDataPresent: !!resolvedResult.avatarData.skinTone
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
   * 4-Layer Priority System with Voice Layer
   */
  private static async resolveAllPlaceholders(
    userInfo: UserInfo,
    vocabularyIntegration: VocabularyIntegration,
    themeIntent: ThemeIntent,
    voiceIntegrationResult: any
  ): Promise<{ storyContent: string; avatarData: { skinTone?: string } }> {
    
    // LAYER 1 - Essential User Info Only (SECURITY FIX: Remove skin tone from AI-visible data)
    const essentialUserInfo = {
      name: userInfo.name || "Child whose name no one could say",
      age: userInfo.age || 5,
      nativeLanguage: userInfo.nativeLanguage || 'en',
      avatarType: userInfo.avatar?.type,
      // REMOVED: avatarSkinTone - kept separate for edge function hair mapping only
      difficultyLevel: userInfo.difficultyLevel, // Needed for story complexity
      gradeLevel: userInfo.gradeLevel || 'PreK', // Needed for vocabulary/complexity
      // USER PREFERENCES - only include if they exist, don't force defaults
      ...(userInfo.favoriteColor && { favoriteColor: userInfo.favoriteColor }),
      ...(userInfo.favoriteAnimal && { favoriteAnimal: userInfo.favoriteAnimal }),
      ...(userInfo.favoriteFood && { favoriteFood: userInfo.favoriteFood }),
      ...(userInfo.hobbies && { hobbies: userInfo.hobbies })
    };

    // SEPARATE SKIN TONE HANDLING: Keep for edge function hair mapping only
    const separateAvatarData = {
      skinTone: userInfo.avatar?.skinTone
    };

    // LAYER 2 - Theme Intent Analysis (pulls from Layer 1 specialRequest only)
    let specialRequestContent = '';
    if (themeIntent.theme.length > 0 || themeIntent.setting.length > 0 || 
        themeIntent.characters.length > 0 || themeIntent.keywords.length > 0) {
      // Structured theme intent found
      const themeElements = [];
      if (themeIntent.theme.length > 0) themeElements.push(`themes: ${safeThemeJoin(themeIntent.theme)}`);
      if (themeIntent.setting.length > 0) themeElements.push(`settings: ${safeThemeJoin(themeIntent.setting)}`);
      if (themeIntent.characters.length > 0) themeElements.push(`characters: ${safeThemeJoin(themeIntent.characters)}`);
      if (themeIntent.keywords.length > 0) themeElements.push(`keywords: ${safeThemeJoin(themeIntent.keywords)}`);
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
    
    // LAYER 3 - Vocabulary Requirements (Conditional Integration)
    const vocabSources = [];
    if (vocabularyIntegration.userSpecified.formWords.length > 0) vocabSources.push('form input');
    if (vocabularyIntegration.userSpecified.specialRequestWords.length > 0) vocabSources.push('special request');
    if (vocabularyIntegration.userSpecified.teacherWords.length > 0) vocabSources.push('teacher words');

    // Create vocabulary compliance configuration
    const vocabularyConfig = {
      hasUserWords: allUserVocabWords.length > 0,
      userWords: allUserVocabWords,
      sources: vocabSources,
      gradeLevel: systemSettings.gradeLevel,
      complianceTarget: systemSettings.complianceTarget,
      difficultyLevel: essentialUserInfo.difficultyLevel
    };

    // Validate vocabulary integration
    try {
      const vocabularyValidation = VocabularyService.validateSentenceWithPriority(
        essentialUserInfo.name || 'test', 
        vocabularyIntegration, 
        essentialUserInfo.name
      );
      
      if (vocabularyConfig.hasUserWords && vocabularyValidation.compliancePercentage < 0.5) {
        console.warn('Low vocabulary compliance detected:', vocabularyValidation);
      }
    } catch (error) {
      console.error('Vocabulary validation error:', error);
    }

    // LAYER 4 - Voice Integration with Level Clamping
    let voiceControlParams = '';
    if (voiceIntegrationResult.selectedVoice && !voiceIntegrationResult.processingMetadata?.fallbackUsed) {
      // Generate clamped control parameters for AI
      if (voiceIntegrationResult.selectedVoice.clampingApplied) {
        voiceControlParams = LevelClampingService.generateClampedControlParams(voiceIntegrationResult.selectedVoice);
      } else {
        // Standard voice fingerprint
        voiceControlParams = JSON.stringify({
          voiceName: voiceIntegrationResult.selectedVoice.pn,
          voiceCharacteristics: voiceIntegrationResult.selectedVoice.resolvedElements?.tones?.slice(0, 3) || ['engaging'],
          userIntegrationStyle: voiceIntegrationResult.selectedVoice.uig || {},
          themeAlignment: voiceIntegrationResult.selectedVoice.resolvedElements?.themes?.slice(0, 2) || ['adventure'],
          levelAppropriate: true
        });
      }
    } else {
      // Fallback voice guidance
      voiceControlParams = JSON.stringify({
        voiceName: 'AI Narrator',
        voiceCharacteristics: ['warm', 'engaging', 'age-appropriate'],
        userIntegrationStyle: 'moderate',
        themeAlignment: themeIntent.theme,
        levelAppropriate: true
      });
    }

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

    // CULTURAL CONTEXT INTEGRATION
    const reconstructedUserInfo: UserInfo = {
      ...essentialUserInfo,
      grade: essentialUserInfo.gradeLevel,
      learningGoal: 'improve-english-reading' as LearningGoal,
      avatar: {
        type: (essentialUserInfo.avatarType || 'prefer-not-to-answer') as AvatarType,
        skinTone: separateAvatarData.skinTone || 'light'
      },
      specialRequest: themeIntent.rawInput || userInfo.specialRequest || ''
    };
    const culturalContext = getCulturalGuidanceString(reconstructedUserInfo);

    const educationalStandards = this.getEducationalVocabularyInstructions(vocabularyConfig.gradeLevel, vocabularyConfig.difficultyLevel);
    
      // Generate single CTRL line instead of verbose template  
      const { ResourceLoader } = await import('./failSoft/ResourceLoader');
      const ctrlLine = ResourceLoader.buildControlLine(
        essentialUserInfo,
        themeIntent,
        voiceIntegrationResult,
        vocabularyConfig.difficultyLevel
      );

    const STORY_TEMPLATE = `${ctrlLine}

Create a never-ending story for ${essentialUserInfo.name}, age ${essentialUserInfo.age}. ${userPreferences}Theme: ${specialRequestContent}.

${vocabularyConfig.hasUserWords 
  ? `Vocabulary System - User Priority Mode:
1. MANDATORY (100% INCLUSION): Use ALL of these user-specified words: ${vocabularyConfig.userWords.join(', ')} (sources: ${vocabularyConfig.sources.join(', ')})
2. SUPPLEMENTAL (${Math.round(vocabularyConfig.complianceTarget * 100)}% compliance): ${educationalStandards}
3. DIFFICULTY CONTEXT: Story difficulty level is ${vocabularyConfig.difficultyLevel}
4. FALLBACK: Age-appropriate vocabulary for ${essentialUserInfo.age}-year-olds`
  : `Vocabulary System - Educational Standards Mode:
1. PRIMARY (${Math.round(vocabularyConfig.complianceTarget * 100)}% compliance): ${educationalStandards}
2. DIFFICULTY CONTEXT: Story difficulty level is ${vocabularyConfig.difficultyLevel}
3. FALLBACK: Age-appropriate vocabulary for ${essentialUserInfo.age}-year-olds
4. EMERGENCY: Simple vocabulary for ages 7-10 if needed`}

${culturalContext ? `${culturalContext} ` : ''}Character Info: ${JSON.stringify(essentialUserInfo)}`;

    return {
      storyContent: STORY_TEMPLATE.trim(),
      avatarData: separateAvatarData
    };
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
          // Pass original resolved bundle with rich creative guidance
          bundle: bundle,
          config: {
            sessionType: config.sessionType || 'free',
            pageNumber: config.pageNumber || 1,
            existingStory: config.existingStory,
            expertGradeLevel: config.expertGradeLevel,
            difficulty: config.difficulty,
            isEndingPage: config.isEndingPage
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

      // Phase 2: Apply centralized grammar processing via process-story-content
      console.log('🔄 Applying centralized grammar processing...');
      
      let processedPages = data.pages;
      try {
        const { data: processResult, error: processError } = await supabase.functions.invoke('process-story-content', {
          body: {
            pages: data.pages || [],
            userInfo: this.reconstructUserInfoFromBundle(bundle),
            sessionId: generateSessionIdWithPrefix('ai-generation')
          }
        });

        if (processError) {
          console.warn('⚠️ Grammar processing failed, using raw pages:', processError);
        } else if (processResult?.success && processResult?.processedPages) {
          processedPages = processResult.processedPages;
          console.log('✅ Grammar processing successful:', processResult.processingMetadata);
        }
      } catch (processError) {
        console.warn('⚠️ Grammar processing failed, using raw pages:', processError);
      }

      return {
        success: true,
        story: data.story,
        pages: processedPages,
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
   * Map string difficulty to DifficultyLevel enum
   */
  private static mapToDifficultyLevel(difficulty?: string): DifficultyLevel {
    const validLevels: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    const normalized = difficulty?.toLowerCase() as DifficultyLevel;
    return validLevels.includes(normalized) ? normalized : 'easy';
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
   * Get educational vocabulary instructions based on grade level and difficulty
   */
  private static getEducationalVocabularyInstructions(gradeLevel: number, difficultyLevel?: string): string {
    const gradeInstructions = {
      0: "Use Pre-K vocabulary following Dolch Pre-Primer sight words (40 essential words like: a, and, away, big, blue, can, come, down, find, for)",
      1: "Use 1st-2nd grade vocabulary following Dolch Primer + Fry's First 100 words (includes: after, again, an, any, as, ask, by, could, every, fly, from, give, going, had, has, her, him, his, how, just)",
      2: "Use 2nd-3rd grade vocabulary following Dolch Grade 1-2 + Fry's words 101-300 (includes: around, because, before, best, both, buy, call, cold, does, don't, fast, first, five, found, gave, goes, green, its, made, many, off, or, pull, read, right, sing, sit, sleep, tell, their, these, those, upon, us, use, very, wash, which, why, wish, work, would, write, your)",
      3: "Use 4th-5th grade vocabulary following Common Core Grade 4-5 + Fry's words 301-600 (includes more complex words like: beautiful, country, decided, discover, during, enough, especially, February, finally, happened, important, interesting, library, neither, probably, question, surprised, together, usually, weight)",
      4: "Use middle/high school vocabulary following Academic Word List + Oxford 3000 + Common Core Tier 2 academic vocabulary (includes sophisticated words like: analyze, approach, appropriate, assume, category, concept, consist, constitute, create, define, demonstrate, element, establish, estimate, evaluate, factor, identify, indicate, individual, interpret, method, occur, percent, period, policy, principle, procedure, process, require, research, respond, role, section, significant, similar, source, specific, structure, theory, vary)"
    };
    
    const baseInstruction = gradeInstructions[gradeLevel as keyof typeof gradeInstructions] || gradeInstructions[1];
    
    // Add difficulty-specific guidance
    const difficultyGuidance = difficultyLevel ? ` Focus on ${difficultyLevel} level complexity within this grade range.` : '';
    
    return baseInstruction + difficultyGuidance;
  }

  /**
   * Extract user data from resolved bundle for formatUserPrompt (also used for process-story-content)
   */
  private static extractUserInfoFromBundle(storyContent: string): Record<string, any> {
    let extractedData: Record<string, any> = {
      userName: 'Child',
      specialRequest: 'adventure story',
      vocabularyInstructions: 'age-appropriate vocabulary',
      seed: Math.floor(Math.random() * 10000)
    };
    
    try {
      // Safe Character Info JSON extraction with validation
      const matches = storyContent.match(/Character Info: ({.*})/);
      if (matches?.[1]) {
        try {
          const parsed = JSON.parse(matches[1]);
          if (parsed && typeof parsed === 'object') {
            extractedData = { ...extractedData, ...parsed };
          }
        } catch (jsonError) {
          console.warn('⚠️ JSON parsing failed, using AI defaults:', safeErrorMessage(jsonError));
        }
      }
      
      // Safe regex-based extraction with null checks
      const vocabMatch = storyContent.match(/Vocabulary: (.*?)(?:\.|$)/);
      if (vocabMatch?.[1]) {
        extractedData.vocabularyInstructions = vocabMatch[1];
      }
      
      const themeMatch = storyContent.match(/Theme: (.*?)(?:\.|Vocabulary)/);
      if (themeMatch?.[1]) {
        extractedData.specialRequest = themeMatch[1];
      }
      
    } catch (error) {
      console.warn('⚠️ Bundle extraction failed, AI will create appropriate content:', safeErrorMessage(error));
    }
    
    return extractedData;
  }

  /**
   * Reconstruct UserInfo object from bundle for grammar processing compatibility
   */
  private static reconstructUserInfoFromBundle(bundle: StoryGenerationBundle): UserInfo {
    // Extract character info from storyContent
    const extractedData = this.extractUserInfoFromBundle(bundle.storyContent);
    
    // Reconstruct UserInfo interface
    return {
      name: extractedData.name || extractedData.userName || 'Child',
      age: extractedData.age || 5,
      nativeLanguage: extractedData.nativeLanguage || 'en',
      difficultyLevel: extractedData.difficultyLevel || 'beginner',
      gradeLevel: extractedData.gradeLevel || 'PreK',
      grade: extractedData.gradeLevel || 'PreK',
      learningGoal: 'improve-english-reading' as LearningGoal,
      avatar: {
        type: (extractedData.avatarType || 'prefer-not-to-answer') as AvatarType,
        skinTone: 'light'
      },
      specialRequest: extractedData.specialRequest || '',
      favoriteColor: extractedData.favoriteColor,
      favoriteAnimal: extractedData.favoriteAnimal, 
      favoriteFood: extractedData.favoriteFood,
      hobbies: extractedData.hobbies
    };
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