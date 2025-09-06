/**
 * STORY GENERATION SYSTEM - Voice Selector
 * Purpose: Selects appropriate narrative voices based on user criteria for story generation
 * NOT RELATED TO: User voice commands, audio playback, or microphone input
 */

import type { ProcessedVoice, VoiceSelectionResult } from './types';
import { VoiceCatalogService, DifficultyLevel } from './VoiceCatalogService';
import type { UserInfo } from '@/types';
import { safeThemeJoin } from "@/lib/utils";

export class VoiceSelector {

  /**
   * Select the best voice for a user and difficulty level with enhanced theme matching
   */
  static async selectVoice(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel,
    preferences?: {
      themes?: string[];
      tones?: string[];
      pointOfView?: string;
      warmthPreference?: number;
      humorPreference?: number;
    },
    enhancedThemes?: string[],
    options?: { failSoft?: boolean; timeout?: number }
  ): Promise<VoiceSelectionResult> {
    const { failSoft = false, timeout = 150 } = options || {};

    try {
      // Try current level first
      let voices = await VoiceCatalogService.getVoicesForLevel(difficulty);
      let bestMatch = await this.findBestVoiceMatch(voices, userInfo, preferences, enhancedThemes);
      
      // If theme matching is poor and themes are provided, try cross-level search
      if (bestMatch.compatibilityScore < 0.6 && enhancedThemes && enhancedThemes.length > 0) {
        console.log(`🔄 Cross-level search triggered for themes: ${safeThemeJoin(enhancedThemes)}`);
        bestMatch = await this.performCrossLevelSearch(userInfo, preferences, enhancedThemes, difficulty);
      }
      
      return bestMatch;

    } catch (error) {
      if (failSoft) {
        console.warn('⚠️ Voice selection failed, using neutral fallback:', error);
        
        // Import embedded fallback
        const { getNeutralVoiceForLevel } = await import('../failSoft/EmbeddedDefaults');
        const neutralVoice = getNeutralVoiceForLevel(difficulty, userInfo.age);
        
        return {
          voice: neutralVoice,
          compatibilityScore: 0.5,
          selectionReasoning: 'Fail-soft neutral voice fallback due to voice catalog failure'
        };
      } else {
        throw error;
      }
    }
  }

  /**
   * Find best voice match from a set of voices
   */
  private static async findBestVoiceMatch(
    voices: ProcessedVoice[], 
    userInfo: UserInfo, 
    preferences?: any, 
    enhancedThemes?: string[]
  ): Promise<VoiceSelectionResult> {
    if (voices.length === 0) {
      throw new Error('No voices available');
    }

    // Score each voice based on user criteria
    const scoredVoices = voices.map(voice => ({
      voice,
      score: this.calculateCompatibilityScore(voice, userInfo, preferences, enhancedThemes),
      reasoning: this.generateSelectionReasoning(voice, userInfo, preferences)
    }));

    // Sort by score (highest first)
    scoredVoices.sort((a, b) => b.score - a.score);

    const bestMatch = scoredVoices[0];
    
    console.log(`🎯 Selected voice: ${bestMatch.voice.pn} (score: ${bestMatch.score.toFixed(2)})`);
    
    return {
      voice: bestMatch.voice,
      selectionReasoning: bestMatch.reasoning,
      compatibilityScore: bestMatch.score
    };
  }

  /**
   * Perform cross-level search for better theme matching
   */
  private static async performCrossLevelSearch(
    userInfo: UserInfo,
    preferences: any,
    enhancedThemes: string[],
    originalDifficulty: DifficultyLevel
  ): Promise<VoiceSelectionResult> {
    const levels: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    const otherLevels = levels.filter(level => level !== originalDifficulty);
    
    let bestOverallMatch: VoiceSelectionResult | null = null;
    let bestScore = 0;

    for (const level of otherLevels) {
      try {
        const voices = await VoiceCatalogService.getVoicesForLevel(level);
        const match = await this.findBestVoiceMatch(voices, userInfo, preferences, enhancedThemes);
        
        if (match.compatibilityScore > bestScore) {
          bestScore = match.compatibilityScore;
          bestOverallMatch = match;
        }
      } catch (error) {
        console.warn(`Failed to search level ${level}:`, error);
      }
    }

    if (bestOverallMatch && bestScore > 0.6) {
      console.log(`✨ Cross-level match found: ${bestOverallMatch.voice.pn} from different difficulty level`);
      return bestOverallMatch;
    }

    // Fallback to original level
    const voices = await VoiceCatalogService.getVoicesForLevel(originalDifficulty);
    return this.findBestVoiceMatch(voices, userInfo, preferences, enhancedThemes);
  }

  /**
   * Get multiple voice options (for variety)
   */
  static async getVoiceOptions(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    count: number = 3
  ): Promise<VoiceSelectionResult[]> {
    const voices = await VoiceCatalogService.getVoicesForLevel(difficulty);
    
    if (voices.length === 0) {
      return [];
    }

    // Score and sort voices
    const scoredVoices = voices.map(voice => ({
      voice,
      score: this.calculateCompatibilityScore(voice, userInfo),
      reasoning: this.generateSelectionReasoning(voice, userInfo)
    })).sort((a, b) => b.score - a.score);

    // Return top options
    return scoredVoices.slice(0, count).map(item => ({
      voice: item.voice,
      selectionReasoning: item.reasoning,
      compatibilityScore: item.score
    }));
  }

  /**
   * Calculate compatibility score between voice and user
   */
  private static calculateCompatibilityScore(
    voice: ProcessedVoice,
    userInfo: UserInfo,
    preferences?: any,
    enhancedThemes?: string[]
  ): number {
    let score = 0.5; // Base score

    // Enhanced theme matching (highest priority)
    if (enhancedThemes && enhancedThemes.length > 0 && voice.resolvedElements.themes) {
      const voiceThemes = voice.resolvedElements.themes.map(t => t.toLowerCase());
      
      const themeMatches = enhancedThemes.filter(theme => 
        voiceThemes.some(voiceTheme => 
          voiceTheme.includes(theme.toLowerCase()) || theme.toLowerCase().includes(voiceTheme)
        )
      ).length;
      
      if (themeMatches > 0) {
        score += (themeMatches / enhancedThemes.length) * 0.4; // Heavy weight for theme matching
      }
    }

    // Legacy theme matching (for backward compatibility)
    if (userInfo.interests && voice.resolvedElements.themes) {
      const userInterests = userInfo.interests.map(i => i.toLowerCase());
      const voiceThemes = voice.resolvedElements.themes.map(t => t.toLowerCase());
      
      const themeMatches = userInterests.filter(interest => 
        voiceThemes.some(theme => 
          theme.includes(interest) || interest.includes(theme)
        )
      ).length;
      
      score += themeMatches * 0.1;
    }

    // Age appropriateness (based on grade level)
    const gradeLevel = parseInt(userInfo.gradeLevel?.replace(/\D/g, '') || '0');
    const ageScore = this.getAgeAppropriatenessScore(voice, gradeLevel);
    score += ageScore * 0.25;

    // Reading level compatibility
    if (userInfo.readingLevel) {
      const readingScore = this.getReadingLevelScore(voice, userInfo.readingLevel);
      score += readingScore * 0.15;
    }

    // User input integration preferences
    const inputScore = this.getUserInputScore(voice, userInfo);
    score += inputScore * 0.1;


    // Preferences matching
    if (preferences) {
      if (preferences.warmthPreference !== undefined) {
        const warmthDiff = Math.abs(voice.vf.warm - preferences.warmthPreference);
        score += (1 - warmthDiff) * 0.05;
      }
      
      if (preferences.humorPreference !== undefined) {
        const humorDiff = Math.abs(voice.vf.hum - preferences.humorPreference);
        score += (1 - humorDiff) * 0.05;
      }
    }

    // Ensure score stays within bounds
    return Math.max(0, Math.min(1, score));
  }


  /**
   * Generate human-readable reasoning for voice selection
   */
  private static generateSelectionReasoning(
    voice: ProcessedVoice,
    userInfo: UserInfo,
    preferences?: any
  ): string {
    const reasons: string[] = [];

    // Voice characteristics
    reasons.push(`${voice.pn} offers ${voice.resolvedElements.tones.join(' and ')} storytelling`);

    // Theme alignment
    if (userInfo.interests && voice.resolvedElements.themes) {
      const matchingThemes = userInfo.interests.filter(interest =>
        voice.resolvedElements.themes.some(theme =>
          theme.toLowerCase().includes(interest.toLowerCase())
        )
      );
      
      if (matchingThemes.length > 0) {
        reasons.push(`aligns with interest in ${safeThemeJoin(matchingThemes)}`);
      }
    }

    // Reading characteristics
    if (voice.vf.warm > 0.8) {
      reasons.push('provides warm, comforting narrative style');
    }
    
    if (voice.vf.hum > 0.6) {
      reasons.push('includes playful humor');
    }

    // User integration
    if (voice.uig.aff.u > 0.8) {
      reasons.push(`frequently incorporates ${userInfo.name || 'the reader'} into the story`);
    }

    return reasons.join(', ');
  }

  /**
   * Score voice appropriateness for age/grade level
   */
  private static getAgeAppropriatenessScore(voice: ProcessedVoice, gradeLevel: number): number {
    // Infer target age from voice ID and characteristics
    if (voice.id.includes('_beg_')) {
      return gradeLevel <= 1 ? 1.0 : Math.max(0, 1 - (gradeLevel - 1) * 0.2);
    }
    
    if (voice.id.includes('_easy_')) {
      return gradeLevel <= 3 && gradeLevel >= 1 ? 1.0 : Math.max(0, 1 - Math.abs(gradeLevel - 2) * 0.2);
    }
    
    if (voice.id.includes('_med_')) {
      return gradeLevel <= 6 && gradeLevel >= 3 ? 1.0 : Math.max(0, 1 - Math.abs(gradeLevel - 4.5) * 0.1);
    }
    
    if (voice.id.includes('_hard_')) {
      return gradeLevel <= 10 && gradeLevel >= 6 ? 1.0 : Math.max(0, 1 - Math.abs(gradeLevel - 8) * 0.1);
    }
    
    if (voice.id.includes('_exp_')) {
      return gradeLevel >= 9 ? 1.0 : Math.max(0, 1 - (9 - gradeLevel) * 0.15);
    }

    return 0.5; // Default score
  }

  /**
   * Score reading level compatibility
   */
  private static getReadingLevelScore(voice: ProcessedVoice, readingLevel: string): number {
    const level = readingLevel.toLowerCase();
    
    if (level.includes('beginner') && voice.id.includes('_beg_')) return 1.0;
    if (level.includes('easy') && voice.id.includes('_easy_')) return 1.0;
    if (level.includes('intermediate') && voice.id.includes('_med_')) return 1.0;
    if (level.includes('advanced') && voice.id.includes('_hard_')) return 1.0;
    if (level.includes('expert') && voice.id.includes('_exp_')) return 1.0;
    
    return 0.3; // Partial compatibility
  }

  /**
   * Score user input integration capabilities
   */
  private static getUserInputScore(voice: ProcessedVoice, userInfo: UserInfo): number {
    let score = 0.5;

    // High user integration affinity
    if (voice.uig.aff.u > 0.8) score += 0.3;
    
    // Good color integration (if user has favorite color)
    if (userInfo.favoriteColor && voice.uig.aff.c > 0.5) score += 0.2;
    
    // Animal integration (if user has favorite animal)
    if (userInfo.favoriteAnimal && voice.uig.aff.a > 0.5) score += 0.2;

    return Math.min(1, score);
  }

}