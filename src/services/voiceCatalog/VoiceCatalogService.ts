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
    switch (level) {
      case 'beginner':
        return this.loadBeginnerVoices();
      
      case 'easy':
        return this.loadEasyVoices();
      
      case 'medium':
        return this.loadMediumVoices();
      
      case 'hard':
        return this.loadHardVoices();
      
      case 'expert':
        return this.loadExpertVoices();
      
      default:
        console.warn(`⚠️ Unknown difficulty level: ${level}`);
        return [];
    }
  }

  /**
   * Load beginner voices (base level)
   */
  private static loadBeginnerVoices(): VoiceDefinition[] {
    // This would contain your full beginner voice data
    // For now, returning a sample structure
    return [
      {
        "id": "meadow_tales_beg_v1",
        "pn": "Keeper of Meadow Tales",
        "vf": { "tone": [1,0], "cad": 9, "var": 3, "wp": [3], "fig": 0.3, "hum": 0.4, "warm": 0.95, "nar": 1 },
        "st": { "hk": [0], "tr": [0], "pz": [4], "ct": [0], "tw": [0], "en": [0,1] },
        "ch": { "hp": [0,2], "pov": "third", "dlg": [0,1], "arc": [0,1] },
        "wd": { "set": [1,2], "sc": "tiny", "mor": "implied", "lp": [0], "rp": [0,1] },
        "rd": { "rh": "none", "aa": 1, "rf": "just_a_little_more", "ono": [8,1,0], "sl": 1 },
        "eg": { "dir": 1, "lst": 0, "ip": ["point_meadow"], "contr": 0, "exag": 0 },
        "th": ["gentle animals","homey comfort","tiny hero"],
        "tg": [1,2,4,0],
        "uig": {
          "aff": { "u": 1.0, "c": 0.7, "a": 0.8, "f": 0.3, "h": 0.2 },
          "rules": {
            "u": { "m": "direct", "max": 6, "gap": 1 },
            "c": { "m": "direct", "max": 3, "gap": 2 },
            "a": { "m": "direct", "max": 2 },
            "f": { "m": "direct", "max": 1 },
            "h": { "m": "direct", "max": 1 }
          }
        },
        "src": ["Beatrix Potter"]
      }
      // ... more voices would be added here
    ];
  }

  /**
   * Load easy voices (applies overrides to beginner base)
   */
  private static loadEasyVoices(): VoiceDefinition[] {
    const beginnerVoices = this.loadBeginnerVoices();
    const overrides: VoiceOverride[] = [
      { 
        "ref": "meadow_tales_beg_v1", 
        "id": "meadow_tales_easy_v1",
        "vf": {"cad": 10}, 
        "uig": {
          "rules": {
            "u": {"m": "subtle", "max": 4},
            "c": {"m": "subtle", "max": 3},
            "a": {"m": "subtle", "max": 2},
            "f": {"m": "subtle", "max": 1},
            "h": {"m": "subtle", "max": 1}
          }
        }
      }
      // ... more overrides
    ];

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
   * Placeholder methods for other levels (would contain your provided data)
   */
  private static loadMediumVoices(): VoiceDefinition[] {
    // Would contain your medium level voices
    return [];
  }

  private static loadHardVoices(): VoiceDefinition[] {
    // Would contain your hard level voices
    return [];
  }

  private static loadExpertVoices(): VoiceDefinition[] {
    // Would contain your expert level voices
    return [];
  }

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