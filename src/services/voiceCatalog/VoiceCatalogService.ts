/**
 * Voice Catalog Service
 * Manages loading and processing of voice level files
 */

import type { 
  LevelFile, 
  DeltaLevelFile, 
  VoiceDefinition, 
  VoiceOverride, 
  ProcessedVoice 
} from './types';
import { VoiceProcessor } from './VoiceProcessor';

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export class VoiceCatalogService {
  private static voiceCache = new Map<DifficultyLevel, ProcessedVoice[]>();
  private static rawLevelData = new Map<DifficultyLevel, LevelFile | DeltaLevelFile>();

  // Embedded level data (your provided files)
  private static readonly LEVEL_DATA = {
    beginner: {
      "schema": "avc.level.v1",
      "v": "1.0.0",
      "level": "beginner",
      "voices": [
        // ... full beginner voice data would go here
        // For now, I'll include a few examples and implement the loading logic
      ]
    } as LevelFile,

    easy: {
      "schema": "avc.level.delta.v1",
      "v": "1.0.0",
      "level": "easy",
      "overrides": [
        // ... easy overrides would go here
      ]
    } as DeltaLevelFile
  };

  /**
   * Get processed voices for a specific difficulty level
   */
  static async getVoicesForLevel(level: DifficultyLevel): Promise<ProcessedVoice[]> {
    // Check cache first
    if (this.voiceCache.has(level)) {
      return this.voiceCache.get(level)!;
    }

    // Load and process voices
    const rawVoices = await this.loadRawVoices(level);
    const processedVoices = VoiceProcessor.processVoices(rawVoices);
    
    // Cache the results
    this.voiceCache.set(level, processedVoices);
    
    console.log(`✅ Loaded ${processedVoices.length} voices for ${level} level`);
    return processedVoices;
  }

  /**
   * Load raw voice definitions for a level (handles delta format for easy)
   */
  private static async loadRawVoices(level: DifficultyLevel): Promise<VoiceDefinition[]> {
    const { VoiceDataLoader } = await import('./VoiceDataLoader');
    
    switch (level) {
      case 'beginner':
        return VoiceDataLoader.loadBeginnerVoices();
      
      case 'easy':
        return this.loadEasyVoices();
      
      case 'medium':
        return VoiceDataLoader.loadMediumVoices();
      
      case 'hard':
        return VoiceDataLoader.loadHardVoices();
      
      case 'expert':
        return VoiceDataLoader.loadExpertVoices();
      
      default:
        console.warn(`⚠️ Unknown difficulty level: ${level}`);
        return [];
    }
  }

  /**
   * Load easy voices (applies overrides to beginner base)
   */
  private static async loadEasyVoices(): Promise<VoiceDefinition[]> {
    const { VoiceDataLoader } = await import('./VoiceDataLoader');
    const beginnerVoices = VoiceDataLoader.loadBeginnerVoices();
    const overrides = VoiceDataLoader.loadEasyOverrides();

    return this.applyOverrides(beginnerVoices, overrides);
  }

  /**
   * Apply delta overrides to base voices
   */
  private static applyOverrides(baseVoices: VoiceDefinition[], overrides: VoiceOverride[]): VoiceDefinition[] {
    const result: VoiceDefinition[] = [];

    for (const override of overrides) {
      const baseVoice = baseVoices.find(v => v.id === override.ref);
      if (!baseVoice) {
        console.warn(`⚠️ Base voice not found for override: ${override.ref}`);
        continue;
      }

      // Deep clone and apply overrides
      const newVoice: VoiceDefinition = {
        ...baseVoice,
        id: override.id,
        vf: { ...baseVoice.vf, ...override.vf },
        st: { ...baseVoice.st, ...override.st },
        ch: { ...baseVoice.ch, ...override.ch },
        wd: { ...baseVoice.wd, ...override.wd },
        rd: { ...baseVoice.rd, ...override.rd },
        eg: { ...baseVoice.eg, ...override.eg },
        th: override.th || baseVoice.th,
        tg: override.tg || baseVoice.tg,
        uig: this.mergeUserInputGuidelines(baseVoice.uig, override.uig)
      };

      result.push(newVoice);
    }

    return result;
  }

  /**
   * Merge user input guidelines (deep merge for nested rules)
   */
  private static mergeUserInputGuidelines(base: any, override: any): any {
    if (!override) return base;
    
    return {
      aff: { ...base.aff, ...override.aff },
      rules: {
        u: { ...base.rules.u, ...override.rules?.u },
        c: { ...base.rules.c, ...override.rules?.c },
        a: { ...base.rules.a, ...override.rules?.a },
        f: { ...base.rules.f, ...override.rules?.f },
        h: { ...base.rules.h, ...override.rules?.h }
      }
    };
  }

  /**
   * Placeholder methods for other levels (now using VoiceDataLoader)
   */
  // These are no longer needed as they're handled by loadRawVoices

  /**
   * Clear cache (useful for testing or reloading)
   */
  static clearCache(): void {
    this.voiceCache.clear();
    console.log('🧹 Voice catalog cache cleared');
  }

  /**
   * Get catalog statistics
   */
  static async getCatalogStats() {
    const stats: Record<DifficultyLevel, number> = {
      beginner: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0
    };

    for (const level of Object.keys(stats) as DifficultyLevel[]) {
      try {
        const voices = await this.getVoicesForLevel(level);
        stats[level] = voices.length;
      } catch (error) {
        console.warn(`⚠️ Failed to load ${level} voices:`, error);
      }
    }

    return {
      levelCounts: stats,
      totalVoices: Object.values(stats).reduce((sum, count) => sum + count, 0),
      cacheSize: this.voiceCache.size
    };
  }
}