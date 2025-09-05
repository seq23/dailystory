/**
 * Resource loader for generating single CTRL lines
 * Replaces verbose templates with structured control parameters
 */

import type { ThemeIntent } from '@/utils/themeIntent';

export class ResourceLoader {
  /**
   * Build structured CTRL line for AI guidance
   */
  static buildControlLine(
    userInfo: any,
    themeIntent: ThemeIntent,
    voiceResult: any,
    difficultyLevel: string
  ): string {
    // Extract voice characteristics
    const voiceCharacteristics = {
      name: voiceResult?.selectedVoice?.pn || 'AI Narrator',
      tones: voiceResult?.selectedVoice?.resolvedElements?.tones?.slice(0, 3) || ['engaging'],
      warmth: voiceResult?.selectedVoice?.vf?.warm || 0.7,
      humor: voiceResult?.selectedVoice?.vf?.hum || 0.6,
      narrative: voiceResult?.selectedVoice?.vf?.nar || 'storybook',
      pointOfView: voiceResult?.selectedVoice?.ch?.pov || 'third_person'
    };

    // Extract theme information
    const themeInfo = {
      primary: themeIntent.theme.slice(0, 2) || ['friendship'],
      setting: themeIntent.setting.slice(0, 1) || ['magical world'],
      characters: themeIntent.characters.slice(0, 1) || ['brave hero']
    };

    // Extract user constraints
    const userConstraints = {
      age: userInfo.age || 5,
      gradeLevel: userInfo.gradeLevel || 'PreK',
      difficultyLevel: difficultyLevel,
      nativeLanguage: userInfo.nativeLanguage || 'en'
    };

    // Build structured control object
    const controlData = {
      voice: voiceCharacteristics,
      themes: themeInfo,
      user: userConstraints,
      safety: {
        ageAppropriate: true,
        contentLevel: difficultyLevel,
        culturalSensitive: true
      }
    };

    // Return as structured CTRL line
    return `<CTRL>${JSON.stringify(controlData)}</CTRL>`;
  }

  /**
   * Build minimal control line for fallback cases
   */
  static buildFallbackControlLine(userInfo: any, difficultyLevel: string): string {
    const fallbackData = {
      voice: {
        name: 'AI Narrator',
        tones: ['warm', 'engaging'],
        narrative: 'storybook'
      },
      themes: {
        primary: ['friendship', 'adventure'],
        setting: ['magical world'],
        characters: ['brave hero']
      },
      user: {
        age: userInfo.age || 5,
        gradeLevel: userInfo.gradeLevel || 'PreK',
        difficultyLevel: difficultyLevel
      },
      safety: {
        ageAppropriate: true,
        contentLevel: difficultyLevel,
        fallbackMode: true
      }
    };

    return `<CTRL>${JSON.stringify(fallbackData)}</CTRL>`;
  }
}