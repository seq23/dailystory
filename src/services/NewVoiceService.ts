/**
 * STORY GENERATION SYSTEM - New Voice Service 
 * Purpose: Bridge to AVC Voice Catalog for story generation pipeline
 * NOT RELATED TO: User voice commands, audio playback, or microphone input
 * 
 * This service replaces the old AuthorVoiceService while maintaining compatibility
 */

import { VoiceCatalogIntegration, DifficultyLevel } from './voiceCatalog';
import type { UserInfo } from '@/types';
import { DebugLogger } from '@/services/DebugLogger';

export interface NewVoiceResult {
  voiceId: string;
  voiceName: string;
  storyPrompt: string;
  compatibilityScore: number;
  processingTime: number;
  voiceMetadata: {
    tones: string[];
    themes: string[];
    warmth: number;
    humor: number;
    inspirationSources: string[];
  };
}

/**
 * New Voice Service using AVC v1.1.0 system
 * Provides a simplified interface for existing story generation
 */
export class NewVoiceService {
  /**
   * Main method to get a voice for story generation
   * Replaces AuthorVoiceService.selectInspirationalVoice()
   */
  static async getVoiceForStory(
    userInfo: UserInfo,
    options: {
      difficulty?: string;
      themes?: string[];
      warmthPreference?: number;
      humorPreference?: number;
    } = {}
  ): Promise<NewVoiceResult> {
    const startTime = Date.now();

    // Map legacy difficulty to DifficultyLevel
    const difficulty = VoiceCatalogIntegration.mapLegacyDifficulty(
      options.difficulty || userInfo.difficultyLevel || userInfo.gradeLevel
    );

    DebugLogger.log('audio', `Getting voice for ${userInfo.name} (${difficulty} level)`);

    // Select and prepare voice using the new system
    const integrationResult = await VoiceCatalogIntegration.selectAndPrepareVoice(
      userInfo,
      difficulty,
      {
        themes: options.themes,
        warmthPreference: options.warmthPreference,
        humorPreference: options.humorPreference
      }
    );

    // Create control line for AI
    const controlLine = integrationResult.controlLine;

    const processingTime = Date.now() - startTime;

    const result: NewVoiceResult = {
      voiceId: integrationResult.selectedVoice.id,
      voiceName: integrationResult.selectedVoice.pn,
      storyPrompt: controlLine,
      compatibilityScore: integrationResult.compatibilityScore,
      processingTime,
      voiceMetadata: {
        tones: integrationResult.selectedVoice.resolvedElements.tones,
        themes: integrationResult.selectedVoice.resolvedElements.themes,
        warmth: integrationResult.selectedVoice.vf.warm,
        humor: integrationResult.selectedVoice.vf.hum,
        inspirationSources: integrationResult.selectedVoice.src
      }
    };

    DebugLogger.log('audio', `Voice selected: ${result.voiceName} (${processingTime}ms)`);
    return result;
  }

  /**
   * Get multiple voice options for variety
   */
  static async getVoiceOptions(
    userInfo: UserInfo,
    count: number = 3,
    options: {
      difficulty?: string;
    } = {}
  ): Promise<NewVoiceResult[]> {
    const difficulty = VoiceCatalogIntegration.mapLegacyDifficulty(
      options.difficulty || userInfo.difficultyLevel || userInfo.gradeLevel
    );

    const alternatives = await VoiceCatalogIntegration.getVoiceAlternatives(
      userInfo,
      difficulty,
      count
    );

    return alternatives.map(alt => ({
      voiceId: alt.selectedVoice.id,
      voiceName: alt.selectedVoice.pn,
      storyPrompt: alt.controlLine,
      compatibilityScore: alt.compatibilityScore,
      processingTime: alt.processingMetadata.processingTime,
      voiceMetadata: {
        tones: alt.selectedVoice.resolvedElements.tones,
        themes: alt.selectedVoice.resolvedElements.themes,
        warmth: alt.selectedVoice.vf.warm,
        humor: alt.selectedVoice.vf.hum,
        inspirationSources: alt.selectedVoice.src
      }
    }));
  }

  /**
   * Legacy compatibility method
   * Mimics the old AuthorVoiceService interface
   */
  static async selectInspirationalVoice(
    difficulty?: string,
    themeHints?: string[]
  ): Promise<any> {
    // Create a minimal user info for legacy compatibility (honest fallbacks only)
    const legacyUserInfo: UserInfo = {
      name: 'Reader',
      age: 8,
      grade: '2',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
      specialRequest: '',
      difficultyLevel: difficulty,
      interests: themeHints
      // favoriteColor, favoriteAnimal, favoriteFood, hobbies omitted = truly optional
    };

    const result = await this.getVoiceForStory(legacyUserInfo, {
      difficulty,
      themes: themeHints
    });

    // Return in old format for compatibility
    return {
      name: result.voiceName,
      description: `${result.voiceMetadata.tones.join(' and ')} storytelling`,
      ageRange: this.getAgeRangeForDifficulty(difficulty),
      themes: result.voiceMetadata.themes,
      characteristics: result.voiceMetadata.tones,
      storyPrompt: result.storyPrompt,
      inspirationSources: result.voiceMetadata.inspirationSources
    };
  }

  /**
   * Get age range for difficulty (legacy compatibility)
   */
  private static getAgeRangeForDifficulty(difficulty?: string): string {
    const level = VoiceCatalogIntegration.mapLegacyDifficulty(difficulty);
    
    switch (level) {
      case 'beginner': return '3-6 years';
      case 'easy': return '5-8 years';
      case 'medium': return '7-12 years';
      case 'hard': return '10-16 years';
      case 'expert': return '14-18 years';
      default: return '5-8 years';
    }
  }

  /**
   * Get system information
   */
  static async getSystemInfo() {
    const catalogInfo = await VoiceCatalogIntegration.getCatalogInfo();
    
    return {
      ...catalogInfo,
      serviceName: 'NewVoiceService',
      serviceVersion: '1.0.0',
      replaces: 'AuthorVoiceService',
      compatibility: 'Full legacy support'
    };
  }

  /**
   * Test the voice service
   */
  static async test(difficulty: DifficultyLevel = 'easy') {
    DebugLogger.log('audio', `Testing NewVoiceService with ${difficulty} level...`);
    
    const testUser: UserInfo = {
      name: 'Test User',
      age: 8,
      grade: '2',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
      favoriteColor: 'green',  // Explicitly provided for testing
      favoriteAnimal: 'cat',   // Explicitly provided for testing
      favoriteFood: 'ice cream', // Explicitly provided for testing
      hobbies: 'drawing',      // Explicitly provided for testing
      specialRequest: 'adventure story',
      interests: ['adventure', 'animals'],
      difficultyLevel: difficulty
    };

    const result = await this.getVoiceForStory(testUser, { difficulty });
    
    DebugLogger.log('audio', 'Test Results', {
      voice: result.voiceName,
      score: result.compatibilityScore,
      processingTime: result.processingTime,
      promptLength: result.storyPrompt.length
    });

    return result;
  }
}