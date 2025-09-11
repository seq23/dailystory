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
  // Novelty scoring for variety
  private static voiceSelectionHistory: Map<string, { voiceId: string; timestamp: number }[]> = new Map();
  private static readonly NOVELTY_PENALTY = 0.15;
  private static readonly RANDOM_VARIANCE = 0.05;

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
      
      // Record selection for novelty tracking
      this.recordVoiceSelection(bestMatch.voice.id, userInfo.name || 'anonymous');
      
      // If theme matching is poor and themes are provided, try cross-level search
      if (bestMatch.compatibilityScore < 0.6 && enhancedThemes && enhancedThemes.length > 0) {
        console.log(`🔄 Cross-level search triggered for themes: ${safeThemeJoin(enhancedThemes)}`);
        bestMatch = await this.performCrossLevelSearch(userInfo, preferences, enhancedThemes, difficulty);
        this.recordVoiceSelection(bestMatch.voice.id, userInfo.name || 'anonymous');
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
   * Perform cross-level search for better theme matching with age restrictions
   */
  private static async performCrossLevelSearch(
    userInfo: UserInfo,
    preferences: any,
    enhancedThemes: string[],
    originalDifficulty: DifficultyLevel
  ): Promise<VoiceSelectionResult> {
    // Age boundary validation - block very young users from cross-level
    const userAge = userInfo.age || 8;
    
    if (userAge <= 6) {
      console.log('🚫 Cross-level search blocked for very young users');
      const voices = await VoiceCatalogService.getVoicesForLevel(originalDifficulty);
      return this.findBestVoiceMatch(voices, userInfo, preferences, enhancedThemes);
    }
    
    // Limit to adjacent levels only for safety
    const levelOrder: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    const currentIndex = levelOrder.indexOf(originalDifficulty);
    const adjacentLevels = [
      levelOrder[currentIndex - 1],
      levelOrder[currentIndex + 1]
    ].filter(level => level !== undefined);
    
    let bestOverallMatch: VoiceSelectionResult | null = null;
    let bestScore = 0;

    for (const level of adjacentLevels) {
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
   * Calculate compatibility score with dynamic weighting system
   */
  private static calculateCompatibilityScore(
    voice: ProcessedVoice,
    userInfo: UserInfo,
    preferences?: any,
    enhancedThemes?: string[]
  ): number {
    let score = 0.5; // Base score
    
    // Determine scoring mode based on theme specificity
    const isExplicitRequest = enhancedThemes && enhancedThemes.length > 0;
    
    if (isExplicitRequest) {
      // INTENT-FOCUSED SCORING (60% theme weight for explicit requests)
      const themeScore = this.calculateThemeScore(voice, enhancedThemes);
      score += themeScore * 0.6; // HIGH theme weight for explicit user requests
      
      const ageScore = this.getAgeAppropriatenessScore(voice, parseInt(userInfo.gradeLevel?.replace(/\D/g, '') || '0'));
      score += ageScore * 0.2; // Reduced age weight when themes are specified
      
      const readingScore = userInfo.readingLevel ? this.getReadingLevelScore(voice, userInfo.readingLevel) : 0.5;
      score += readingScore * 0.1; // Reduced reading level weight
      
    } else {
      // BALANCED DISCOVERY SCORING (no explicit themes)
      const ageScore = this.getAgeAppropriatenessScore(voice, parseInt(userInfo.gradeLevel?.replace(/\D/g, '') || '0'));
      score += ageScore * 0.35; // Higher age weight for general discovery
      
      const readingScore = userInfo.readingLevel ? this.getReadingLevelScore(voice, userInfo.readingLevel) : 0.5;
      score += readingScore * 0.25; // Higher reading level weight
      
      // Profile themes from interests (legacy compatibility)
      if (userInfo.interests && voice.resolvedElements.themes) {
        const profileThemeScore = this.calculateProfileThemeScore(voice, userInfo.interests);
        score += profileThemeScore * 0.2;
      }
    }
    
    // NOVELTY SCORING (session-based variety)
    const noveltyScore = this.calculateNoveltyScore(voice.id, userInfo.name || 'anonymous');
    score += noveltyScore * 0.1;
    
    // Add small random variance to break ties and ensure variety
    score += (Math.random() - 0.5) * this.RANDOM_VARIANCE;
    
    // User input integration preferences (minor weight)
    const inputScore = this.getUserInputScore(voice, userInfo);
    score += inputScore * 0.05;
    
    // Voice preference matching (warmth, humor)
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
   * Calculate theme matching score for explicit theme requests
   */
  private static calculateThemeScore(voice: ProcessedVoice, enhancedThemes: string[]): number {
    if (!voice.resolvedElements.themes || enhancedThemes.length === 0) return 0;
    
    const voiceThemes = voice.resolvedElements.themes.map(t => t.toLowerCase());
    const matches = enhancedThemes.filter(theme => 
      voiceThemes.some(voiceTheme => 
        voiceTheme.includes(theme.toLowerCase()) || theme.toLowerCase().includes(voiceTheme)
      )
    ).length;
    
    return matches / enhancedThemes.length;
  }
  
  /**
   * Calculate profile-based theme score from user interests
   */
  private static calculateProfileThemeScore(voice: ProcessedVoice, userInterests: string[]): number {
    if (!voice.resolvedElements.themes || userInterests.length === 0) return 0;
    
    const voiceThemes = voice.resolvedElements.themes.map(t => t.toLowerCase());
    const userInterestsLower = userInterests.map(i => i.toLowerCase());
    
    const matches = userInterestsLower.filter(interest => 
      voiceThemes.some(theme => 
        theme.includes(interest) || interest.includes(theme)
      )
    ).length;
    
    return matches / userInterests.length;
  }
  
  /**
   * Calculate novelty score based on recent selection history
   */
  private static calculateNoveltyScore(voiceId: string, userId: string): number {
    const userHistory = this.voiceSelectionHistory.get(userId) || [];
    const now = Date.now();
    
    // Clean old history (older than 24 hours)
    const recentHistory = userHistory.filter(entry => now - entry.timestamp < 24 * 60 * 60 * 1000);
    this.voiceSelectionHistory.set(userId, recentHistory);
    
    // Apply penalties for recently used voices
    const recentUses = recentHistory.filter(entry => entry.voiceId === voiceId).length;
    return Math.max(0, 1 - (recentUses * this.NOVELTY_PENALTY));
  }
  
  /**
   * Record voice selection for novelty tracking
   */
  private static recordVoiceSelection(voiceId: string, userId: string): void {
    const userHistory = this.voiceSelectionHistory.get(userId) || [];
    userHistory.push({ voiceId, timestamp: Date.now() });
    this.voiceSelectionHistory.set(userId, userHistory);
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