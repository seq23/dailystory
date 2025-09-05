/**
 * Voice Catalog Integration Service
 * Bridges the new AVC voice catalog with existing story generation
 */

import { VoiceCatalogService, VoiceSelector, VoiceProcessor, DifficultyLevel } from './index';
import { generateCreativeSeeds } from '../inputEnhancementEngine';
import type { UserInfo } from '@/types';
import type { ProcessedVoice, VoiceSelectionResult } from './types';

export interface VoiceIntegrationResult {
  selectedVoice: ProcessedVoice;
  storyBundle: any;
  compatibilityScore: number;
  selectionReasoning: string;
  userSeeds: any[];
  processingMetadata: {
    voiceId: string;
    voiceName: string;
    level: DifficultyLevel;
    processingTime: number;
    timestamp: number;
  };
}

export class VoiceCatalogIntegration {
  /**
   * Main integration point - replaces AuthorVoiceService usage
   */
  static async selectAndPrepareVoice(
    userInfo: UserInfo,
    difficulty: DifficultyLevel = 'easy',
    preferences?: {
      themes?: string[];
      warmthPreference?: number;
      humorPreference?: number;
    }
  ): Promise<VoiceIntegrationResult> {
    const startTime = Date.now();

    console.log(`🎭 Selecting voice for ${userInfo.name || 'user'} at ${difficulty} level`);

    // 1. Select the best voice using the new system
    const voiceSelection: VoiceSelectionResult = await VoiceSelector.selectVoice(
      userInfo,
      difficulty,
      preferences
    );

    // 2. Generate user input seeds (legacy compatibility)
    const userSeeds = generateCreativeSeeds(userInfo);

    // 3. Create story bundle from processed voice
    const storyBundle = VoiceProcessor.createStoryBundle(voiceSelection.voice, userInfo);

    // 4. Add user seeds to the bundle for complete context
    const enhancedBundle = {
      ...storyBundle,
      userSeeds: userSeeds,
      legacyCompatibility: {
        authorVoiceName: voiceSelection.voice.pn,
        inspirationSources: voiceSelection.voice.src,
        difficultyLevel: difficulty
      }
    };

    const processingTime = Date.now() - startTime;

    console.log(`✅ Voice integration complete: ${voiceSelection.voice.pn} (${processingTime}ms)`);

    return {
      selectedVoice: voiceSelection.voice,
      storyBundle: enhancedBundle,
      compatibilityScore: voiceSelection.compatibilityScore,
      selectionReasoning: voiceSelection.selectionReasoning,
      userSeeds,
      processingMetadata: {
        voiceId: voiceSelection.voice.id,
        voiceName: voiceSelection.voice.pn,
        level: difficulty,
        processingTime,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Get multiple voice options for variety
   */
  static async getVoiceAlternatives(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    count: number = 3
  ): Promise<VoiceIntegrationResult[]> {
    const options = await VoiceSelector.getVoiceOptions(userInfo, difficulty, count);
    const userSeeds = generateCreativeSeeds(userInfo);

    return Promise.all(
      options.map(async (option) => {
        const storyBundle = VoiceProcessor.createStoryBundle(option.voice, userInfo);
        
        return {
          selectedVoice: option.voice,
          storyBundle: { ...storyBundle, userSeeds },
          compatibilityScore: option.compatibilityScore,
          selectionReasoning: option.selectionReasoning,
          userSeeds,
          processingMetadata: {
            voiceId: option.voice.id,
            voiceName: option.voice.pn,
            level: difficulty,
            processingTime: 0,
            timestamp: Date.now()
          }
        };
      })
    );
  }

  /**
   * Legacy compatibility - maps difficulty string to DifficultyLevel
   */
  static mapLegacyDifficulty(difficulty?: string): DifficultyLevel {
    if (!difficulty) return 'easy';
    
    const normalized = difficulty.toLowerCase();
    
    if (normalized.includes('beginner') || normalized === 'k') return 'beginner';
    if (normalized.includes('easy') || normalized === '1' || normalized === '2') return 'easy';
    if (normalized.includes('medium') || normalized === '3' || normalized === '4') return 'medium';
    if (normalized.includes('hard') || normalized === '5' || normalized === '6') return 'hard';
    if (normalized.includes('expert') || normalized === '7' || normalized === '8') return 'expert';
    
    return 'easy'; // Default fallback
  }

  /**
   * Create a story prompt bundle for the AI generation system
   */
  static createStoryPromptBundle(integrationResult: VoiceIntegrationResult): string {
    const { selectedVoice, storyBundle, userSeeds } = integrationResult;
    const { resolvedElements } = selectedVoice;

    return `
VOICE PROFILE: ${selectedVoice.pn}
Inspired by: ${selectedVoice.src.join(', ')}

TONE & STYLE:
- Primary tones: ${resolvedElements.tones.join(', ')}
- Warmth level: ${selectedVoice.vf.warm}
- Humor level: ${selectedVoice.vf.hum}
- Narrative perspective: ${selectedVoice.ch.pov} person
- Cadence: ${selectedVoice.vf.cad}/14

STORY ELEMENTS:
- Settings: ${resolvedElements.settings.join(', ')}
- Story scale: ${selectedVoice.wd.sc}
- Themes: ${resolvedElements.themes.join(', ')}
- Potential helpers: ${resolvedElements.helpers.join(', ')}

STRUCTURE GUIDANCE:
- Opening hooks: ${resolvedElements.hooks.join(', ')}
- Transitions: ${resolvedElements.transitions.join(', ')}
- Possible twists: ${resolvedElements.twists.join(', ')}
- Ending styles: ${resolvedElements.endings.join(', ')}

USER INTEGRATION:
${userSeeds.map(seed => `- ${seed.storyPossibilities[0]}`).join('\n')}

VOICE-SPECIFIC GUIDANCE:
- Dialog style: ${resolvedElements.dialogStyles.join(', ')}
- Sound effects: ${resolvedElements.sounds.join(', ')}
- User name integration: ${storyBundle.userInputRules.aff.u > 0.7 ? 'frequent' : 'moderate'}
- Moral approach: ${selectedVoice.wd.mor}

Create a story that embodies this voice profile while incorporating the user's interests naturally.
`.trim();
  }

  /**
   * Get catalog statistics for debugging
   */
  static async getCatalogInfo() {
    const stats = await VoiceCatalogService.getCatalogStats();
    
    return {
      ...stats,
      integrationVersion: '1.0.0',
      avcVersion: '1.1.0',
      supportedLevels: ['beginner', 'easy', 'medium', 'hard', 'expert'] as DifficultyLevel[]
    };
  }

  /**
   * Test voice selection with sample user data
   */
  static async testVoiceSelection(difficulty: DifficultyLevel = 'easy') {
    const testUser: UserInfo = {
      name: 'Test Child',
      age: 7,
      grade: '2nd',
      gradeLevel: '2nd',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
      readingLevel: 'easy',
      interests: ['animals', 'adventure'],
      favoriteColor: 'blue',
      favoriteAnimal: 'dog',
      favoriteFood: 'cookies',
      hobbies: 'drawing',
      specialRequest: '',
      difficultyLevel: difficulty
    };

    console.log(`🧪 Testing voice selection for ${difficulty} level...`);
    
    const result = await this.selectAndPrepareVoice(testUser, difficulty);
    
    console.log('Test Results:', {
      voice: result.selectedVoice.pn,
      score: result.compatibilityScore,
      reasoning: result.selectionReasoning,
      processingTime: result.processingMetadata.processingTime
    });

    return result;
  }
}