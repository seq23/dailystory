// Unified Prompt Builder Service
// Phase 4: Single source of truth for all image generation prompts

import type { UserInfo, DifficultyLevel } from '@/types';
import { DIFFICULTY_STYLE_MAPPING } from '@/config/appConfig';
import { PromptLengthManager, QUALITY_SUFFIXES } from '@/utils/promptLengthManager';

export interface StreamlinedPromptOptions {
  storyText: string;
  userInfo: UserInfo;
  difficultyLevel: DifficultyLevel;
  pageNumber?: number;
  totalPages?: number;
  characterName?: string;
  characterDescription?: string;
  skinTone?: string;
  avatarType?: string;
}

export interface PromptResult {
  positivePrompt: string;
  negativePrompt: string;
  characterCount: number;
  optimizations: string[];
  method: 'streamlined' | 'fallback';
}

export class UnifiedPromptBuilder {
  private static readonly STREAMLINED_NEGATIVE = "bad anatomy, blurry, text, watermark, ugly, deformed";
  private static readonly FALLBACK_NEGATIVE = "scary, violent, inappropriate, adult content, text, words, speech bubbles, extra limbs, bad anatomy";

  /**
   * Main entry point - builds optimized prompts for any provider
   */
  static buildPrompt(options: StreamlinedPromptOptions): PromptResult {
    const { userInfo, difficultyLevel, storyText, characterName, characterDescription, skinTone, avatarType } = options;
    
    // Determine if we have character consistency data
    const hasCharacterData = characterName && skinTone && avatarType;
    
    if (hasCharacterData) {
      return this.buildCharacterConsistentPrompt(options);
    } else {
      return this.buildSceneOnlyPrompt(options);
    }
  }

  /**
   * Build prompts with character consistency (for Runware)
   */
  private static buildCharacterConsistentPrompt(options: StreamlinedPromptOptions): PromptResult {
    const { storyText, characterName, skinTone, avatarType, difficultyLevel } = options;
    
    // Streamlined character description (unified for all skin tones)
    const genderDesc = skinTone === 'dark' 
      ? (avatarType === 'boy' ? 'young Black boy' : avatarType === 'girl' ? 'young Black girl' : 'young Black child')
      : (avatarType === 'boy' ? 'young boy' : avatarType === 'girl' ? 'young girl' : 'young child');
    
    const skinToneMap = {
      'pale': 'very light skin tone',
      'light': 'light skin tone', 
      'medium': 'medium skin tone',
      'olive': 'olive skin tone',
      'dark': 'dark skin tone'
    };
    
    const consistentSkinTone = skinToneMap[skinTone] || 'medium skin tone';
    
    // Unified character description (saves ~200 chars from original)
    const characterDesc = `${genderDesc} named ${characterName} with ${consistentSkinTone}${skinTone === 'dark' ? ', African/African American features' : ''}, consistent design`;
    
    // Core scene content
    const coreContent = `Children's book illustration of ${characterDesc} in: ${storyText}`;
    
    // Streamlined style framework
    const styleFramework = DIFFICULTY_STYLE_MAPPING[difficultyLevel]?.prompt || DIFFICULTY_STYLE_MAPPING['beginner'].prompt;
    
    // Consolidated critical section (saves ~300 chars)
    const criticalSection = `CRITICAL: ${characterName} maintains ${consistentSkinTone}${skinTone === 'dark' ? ' with accurate features' : ''}, consistent appearance, NO TEXT`;
    
    // Use minimal quality tier for character consistency (saves ~100 chars)
    const segments = PromptLengthManager.createSegments(
      coreContent,
      styleFramework,
      criticalSection,
      '', // No brand suffix for character consistency
      'minimal'
    );
    
    const optimized = PromptLengthManager.optimizePrompt(segments);
    
    return {
      positivePrompt: optimized.optimizedPrompt,
      negativePrompt: this.STREAMLINED_NEGATIVE,
      characterCount: optimized.finalLength,
      optimizations: optimized.optimizations,
      method: 'streamlined'
    };
  }

  /**
   * Build scene-only prompts (for OpenAI fallback)
   */
  private static buildSceneOnlyPrompt(options: StreamlinedPromptOptions): PromptResult {
    const { storyText, difficultyLevel } = options;
    
    // Simple scene description
    const coreContent = `Children's book illustration showing: ${storyText}`;
    
    // Style framework
    const styleFramework = DIFFICULTY_STYLE_MAPPING[difficultyLevel]?.prompt || DIFFICULTY_STYLE_MAPPING['beginner'].prompt;
    
    // Streamlined brand suffix (saves ~50 chars)
    const brandSuffix = "high quality children's book art, vibrant colors";
    
    const segments = PromptLengthManager.createSegments(
      coreContent,
      styleFramework,
      '', // No character details for scene-only
      brandSuffix,
      'standard'
    );
    
    const optimized = PromptLengthManager.optimizePrompt(segments);
    
    return {
      positivePrompt: optimized.optimizedPrompt,
      negativePrompt: this.FALLBACK_NEGATIVE,
      characterCount: optimized.finalLength,
      optimizations: optimized.optimizations,
      method: 'streamlined'
    };
  }

  /**
   * Validate character count savings
   */
  static validateStreamlining(originalLength: number, streamlinedLength: number): {
    saved: number;
    percentage: number;
    target: 'met' | 'exceeded' | 'missed';
  } {
    const saved = originalLength - streamlinedLength;
    const percentage = Math.round((saved / originalLength) * 100);
    
    // Target: 740+ character reduction
    const TARGET_REDUCTION = 740;
    const target = saved >= TARGET_REDUCTION ? 'met' : saved >= TARGET_REDUCTION * 0.8 ? 'exceeded' : 'missed';
    
    return { saved, percentage, target };
  }

  /**
   * Get expected character ranges after streamlining
   */
  static getExpectedRanges(): {
    original: { min: number; max: number };
    streamlined: { min: number; max: number };
    target: { min: number; max: number };
  } {
    return {
      original: { min: 2200, max: 2900 },
      streamlined: { min: 1460, max: 2160 },
      target: { min: 1460, max: 2160 }
    };
  }
}