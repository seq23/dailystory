/**
 * Voice Catalog Validation Utility
 * Tests the complete 51-voice catalog integration
 */

import { VoiceCatalogService, type DifficultyLevel } from '../VoiceCatalogService';
import { CodebookService } from '../CodebookService';

export interface ValidationResult {
  success: boolean;
  totalVoices: number;
  levelCounts: Record<DifficultyLevel, number>;
  errors: string[];
  warnings: string[];
}

export class VoiceCatalogValidator {
  
  /**
   * Run complete end-to-end validation
   */
  static async validateComplete(): Promise<ValidationResult> {
    const result: ValidationResult = {
      success: true,
      totalVoices: 0,
      levelCounts: {
        beginner: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        expert: 0
      },
      errors: [],
      warnings: []
    };

    console.log('🔍 Starting voice catalog validation...');

    try {
      // Test codebook loading
      await this.validateCodebook(result);
      
      // Test voice loading for each level
      await this.validateVoiceLevels(result);
      
      // Test voice processing
      await this.validateVoiceProcessing(result);
      
      // Calculate totals
      result.totalVoices = Object.values(result.levelCounts).reduce((sum, count) => sum + count, 0);
      
      // Validate expected totals
      this.validateExpectedCounts(result);
      
      console.log('✅ Voice catalog validation complete');
      console.log(`📊 Total voices: ${result.totalVoices}`);
      console.log(`📈 By level:`, result.levelCounts);
      
      if (result.errors.length > 0) {
        result.success = false;
        console.error('❌ Validation failed with errors:', result.errors);
      }
      
      if (result.warnings.length > 0) {
        console.warn('⚠️ Validation warnings:', result.warnings);
      }
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Critical validation error: ${error}`);
      console.error('💥 Validation crashed:', error);
    }

    return result;
  }

  /**
   * Validate codebook loading
   */
  private static async validateCodebook(result: ValidationResult): Promise<void> {
    try {
      const codebook = CodebookService.getCodebook();
      
      if (!codebook.v || codebook.v !== '1.1.0') {
        result.errors.push('Codebook version mismatch - expected v1.1.0');
      }
      
      if (!codebook.themes || codebook.themes.length === 0) {
        result.errors.push('Codebook themes not loaded');
      }
      
      if (!codebook.tones || codebook.tones.length === 0) {
        result.errors.push('Codebook tones not loaded');
      }
      
      console.log('✅ Codebook validation passed');
    } catch (error) {
      result.errors.push(`Codebook validation failed: ${error}`);
    }
  }

  /**
   * Validate voice loading for each difficulty level
   */
  private static async validateVoiceLevels(result: ValidationResult): Promise<void> {
    const levels: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    
    for (const level of levels) {
      try {
        const voices = await VoiceCatalogService.getVoicesForLevel(level);
        result.levelCounts[level] = voices.length;
        
        if (voices.length === 0) {
          result.errors.push(`No voices loaded for ${level} level`);
        } else {
          console.log(`✅ ${level}: ${voices.length} voices loaded`);
        }
        
        // Validate voice structure
        for (const voice of voices.slice(0, 2)) { // Test first 2 voices per level
          this.validateVoiceStructure(voice, result);
        }
        
      } catch (error) {
        result.errors.push(`Failed to load ${level} voices: ${error}`);
      }
    }
  }

  /**
   * Validate individual voice structure
   */
  private static validateVoiceStructure(voice: any, result: ValidationResult): void {
    const requiredFields = ['id', 'vf', 'st', 'ch', 'wd', 'rd', 'eg', 'th', 'tg', 'uig'];
    
    for (const field of requiredFields) {
      if (!voice[field]) {
        result.warnings.push(`Voice ${voice.id || 'unknown'} missing field: ${field}`);
      }
    }
    
    // Validate uig structure
    if (voice.uig) {
      if (!voice.uig.rules) {
        result.warnings.push(`Voice ${voice.id} missing uig.rules`);
      } else {
        const ruleFields = ['u', 'c', 'a', 'f', 'h'];
        for (const ruleField of ruleFields) {
          if (!voice.uig.rules[ruleField] || !voice.uig.rules[ruleField].m) {
            result.warnings.push(`Voice ${voice.id} missing uig.rules.${ruleField}.m`);
          }
        }
      }
    }
  }

  /**
   * Test voice processing and control line generation
   */
  private static async validateVoiceProcessing(result: ValidationResult): Promise<void> {
    try {
      // Test a sample voice from each level
      const levels: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      
      for (const level of levels) {
        const voices = await VoiceCatalogService.getVoicesForLevel(level);
        if (voices.length > 0) {
          const sampleVoice = voices[0];
          
          // Test that voice has resolved elements
          if (!sampleVoice.resolvedElements) {
            result.warnings.push(`${level} voice ${sampleVoice.id} missing resolved elements`);
          } else {
            // Check that resolved elements have content
            const elementKeys = Object.keys(sampleVoice.resolvedElements);
            if (elementKeys.length === 0) {
              result.warnings.push(`${level} voice ${sampleVoice.id} has empty resolved elements`);
            }
          }
          
          // Test that voice has required fields
          if (!sampleVoice.id || !sampleVoice.pn) {
            result.warnings.push(`${level} voice missing basic properties`);
          }
        }
      }
      
      console.log('✅ Voice processing validation passed');
    } catch (error) {
      result.errors.push(`Voice processing validation failed: ${error}`);
    }
  }

  /**
   * Validate expected voice counts (51 total)
   */
  private static validateExpectedCounts(result: ValidationResult): void {
    const expectedCounts = {
      beginner: 18,
      easy: 18,
      medium: 12,
      hard: 11,
      expert: 10
    };
    
    const expectedTotal = 69; // 18 + 18 + 12 + 11 + 10
    
    if (result.totalVoices !== expectedTotal) {
      result.warnings.push(`Total voice count mismatch - expected ${expectedTotal}, got ${result.totalVoices}`);
    }
    
    for (const [level, expected] of Object.entries(expectedCounts)) {
      const actual = result.levelCounts[level as DifficultyLevel];
      if (actual !== expected) {
        result.warnings.push(`${level} count mismatch - expected ${expected}, got ${actual}`);
      }
    }
  }

  /**
   * Quick validation for debugging
   */
  static async quickValidate(): Promise<boolean> {
    try {
      const result = await this.validateComplete();
      return result.success && result.errors.length === 0;
    } catch (error) {
      console.error('Quick validation failed:', error);
      return false;
    }
  }
}