/**
 * STORY GENERATION SYSTEM - Voice Catalog Integration Service
 * Purpose: Bridges the AVC voice catalog with story generation pipeline
 * NOT RELATED TO: User voice commands, audio playback, or microphone input
 */

import { VoiceCatalogService, VoiceSelector, VoiceProcessor, DifficultyLevel } from './index';
import type { UserInfo } from '@/types';
import type { ProcessedVoice, VoiceSelectionResult } from './types';

export interface VoiceIntegrationResult {
  selectedVoice: ProcessedVoice;
  storyBundle: any;
  compatibilityScore: number;
  selectionReasoning: string;
  controlLine: string;
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

    // 1. Process themes through library mapping for enhanced matching
    // Note: Frontend version uses direct theme processing for now
    const enhancedThemes = preferences?.themes;

    console.log(`🎯 Theme processing: ${JSON.stringify(preferences?.themes)} → ${JSON.stringify(enhancedThemes)}`);

    // 2. Select the best voice using the new system with enhanced themes
    const voiceSelection: VoiceSelectionResult = await VoiceSelector.selectVoice(
      userInfo,
      difficulty,
      preferences,
      enhancedThemes, // <-- CRITICAL: Pass enhanced themes for proper weighting
      { failSoft: true, timeout: 150 }
    );

    // 2. Create story bundle from processed voice
    const storyBundle = VoiceProcessor.createStoryBundle(voiceSelection.voice, userInfo);

    // 3. Generate compact control line
    const controlLine = this.createControlLine(userInfo, voiceSelection.voice, difficulty);

    const processingTime = Date.now() - startTime;

    console.log(`✅ Voice integration complete: ${voiceSelection.voice.pn} (${processingTime}ms)`);

    return {
      selectedVoice: voiceSelection.voice,
      storyBundle: storyBundle,
      compatibilityScore: voiceSelection.compatibilityScore,
      selectionReasoning: voiceSelection.selectionReasoning,
      controlLine: controlLine,
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

    return Promise.all(
      options.map(async (option) => {
        const storyBundle = VoiceProcessor.createStoryBundle(option.voice, userInfo);
        const controlLine = this.createControlLine(userInfo, option.voice, difficulty);
        
        return {
          selectedVoice: option.voice,
          storyBundle: storyBundle,
          compatibilityScore: option.compatibilityScore,
          selectionReasoning: option.selectionReasoning,
          controlLine: controlLine,
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
   * Merge voice-specific UIG rules with sensible defaults by difficulty level
   */
  static mergeUsageRules(difficulty: DifficultyLevel, voiceUIG: any) {
    const defaults = {
      beginner: { mode: "direct", gap: 1, t: { u: 6, c: 3, a: 2, f: 1, h: 1 } },
      easy: { mode: "direct", gap: 2, t: { u: 4, c: 3, a: 2, f: 1, h: 1 } },
      medium: { mode: "subtle", gap: 3, t: { u: 2, c: 2, a: 1, f: 1, h: 1 } },
      hard: { mode: "subtle", gap: 3, t: { u: 2, c: 2, a: 1, f: 1, h: 1 } },
      expert: { mode: "subtle", gap: 4, t: { u: 2, c: 2, a: 1, f: 1, h: 1 } }
    };
    
    const base = defaults[difficulty] || defaults.medium;
    const rules = voiceUIG?.rules || {};
    
    const modeFromRules = Object.values(rules).find((r: any) => r && typeof r === 'object' && (r as any).m);
    
    return {
      mode: modeFromRules ? (modeFromRules as any).m : base.mode,
      maxUses: {
        u: (rules as any).u?.max || base.t.u,
        c: (rules as any).c?.max || base.t.c, 
        a: (rules as any).a?.max || base.t.a,
        f: (rules as any).f?.max || base.t.f,
        h: (rules as any).h?.max || base.t.h
      },
      minGaps: {
        u: (rules as any).u?.gap || base.gap,
        c: (rules as any).c?.gap || base.gap,
        a: (rules as any).a?.gap || base.gap, 
        f: (rules as any).f?.gap || base.gap,
        h: (rules as any).h?.gap || base.gap
      }
    };
  }

  /**
   * Create a compact control line for the AI generation system with age adaptation
   */
  static createControlLine(userInfo: UserInfo, voice: ProcessedVoice, difficulty: DifficultyLevel): string {
    const shouldAdaptForAge = (
      difficulty === 'beginner' || 
      difficulty === 'easy' || 
      (userInfo.age && userInfo.age <= 8)
    );

    const ctrlData = {
      vf: {
        id: voice.id,
        pn: voice.pn,
        tone: voice.vf.tone,
        cad: voice.vf.cad,
        var: voice.vf.var,
        warm: voice.vf.warm,
        hum: voice.vf.hum,
        nar: voice.vf.nar
      },
      u: userInfo.name,
      c: userInfo.favoriteColor,
      a: userInfo.favoriteAnimal,
      f: userInfo.favoriteFood,
      h: userInfo.hobbies,
      themes: voice.resolvedElements?.themes || [],
      level: difficulty,
      // Process voice catalog input usage rules with sensible defaults
      iu: this.mergeUsageRules(difficulty, voice.uig),
      ah: voice.uig?.aff || undefined,
      safetyFilter: shouldAdaptForAge ? "adapt_for_age" : undefined,
      ageAdaptation: shouldAdaptForAge ? {
        originalThemes: voice.resolvedElements?.themes || [],
        userAge: userInfo.age,
        instruction: "Create age-appropriate, original content avoiding copyright violations"
      } : undefined
    };

    return `<CTRL>${JSON.stringify(ctrlData)}</CTRL>`;
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