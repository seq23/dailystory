/**
 * Level Clamping Service - Apply age-appropriate constraints to voices
 */

import type { ProcessedVoice } from './types';
import { DifficultyLevel } from './VoiceCatalogService';

export interface LevelConstraints {
  maxComplexity: number;        // 1-10 scale
  maxVocabularyLevel: number;   // Grade level
  maxPsychologicalDepth: number; // 1-5 scale
  maxTwistCount: number;        // Maximum plot twists
  maxPerilLevel: number;        // 1-5 scale for danger/conflict
  allowedNarrativeStyles: string[];
  maxSentenceLength: number;
  requiresSimplification: boolean;
}

export interface ClampedVoice extends ProcessedVoice {
  originalComplexity?: number;
  appliedConstraints: LevelConstraints;
  clampingApplied: boolean;
}

export class LevelClampingService {
  
  /**
   * Get constraints for difficulty level and age
   */
  static getConstraintsForLevel(difficulty: DifficultyLevel, age?: number): LevelConstraints {
    const ageGroup = age ? this.getAgeGroup(age) : 'elementary';
    
    const baseConstraints = this.getBaseConstraints(difficulty);
    const ageConstraints = this.getAgeConstraints(ageGroup);
    
    // Apply most restrictive constraints
    return {
      maxComplexity: Math.min(baseConstraints.maxComplexity, ageConstraints.maxComplexity),
      maxVocabularyLevel: Math.min(baseConstraints.maxVocabularyLevel, ageConstraints.maxVocabularyLevel),
      maxPsychologicalDepth: Math.min(baseConstraints.maxPsychologicalDepth, ageConstraints.maxPsychologicalDepth),
      maxTwistCount: Math.min(baseConstraints.maxTwistCount, ageConstraints.maxTwistCount),
      maxPerilLevel: Math.min(baseConstraints.maxPerilLevel, ageConstraints.maxPerilLevel),
      allowedNarrativeStyles: baseConstraints.allowedNarrativeStyles.filter(style => 
        ageConstraints.allowedNarrativeStyles.includes(style)
      ),
      maxSentenceLength: Math.min(baseConstraints.maxSentenceLength, ageConstraints.maxSentenceLength),
      requiresSimplification: baseConstraints.requiresSimplification || ageConstraints.requiresSimplification
    };
  }

  /**
   * Apply level clamping to a voice
   */
  static applyConstraints(voice: ProcessedVoice, difficulty: DifficultyLevel, age?: number): ClampedVoice {
    const constraints = this.getConstraintsForLevel(difficulty, age);
    const originalComplexity = this.assessVoiceComplexity(voice);
    
    let clampingApplied = false;
    const clampedVoice: ClampedVoice = {
      ...voice,
      originalComplexity,
      appliedConstraints: constraints,
      clampingApplied: false
    };

    // Apply vocabulary level clamping
    if (clampedVoice.rd && clampedVoice.rd.aa > constraints.maxVocabularyLevel) {
      clampedVoice.rd.aa = constraints.maxVocabularyLevel;
      clampingApplied = true;
    }

    // Apply narrative style filtering - use tones as proxy for narrative style
    if (clampedVoice.resolvedElements?.tones) {
      const allowedTones = clampedVoice.resolvedElements.tones.filter(tone =>
        constraints.allowedNarrativeStyles.some(allowed => 
          tone.toLowerCase().includes(allowed.toLowerCase())
        )
      );
      
      if (allowedTones.length !== clampedVoice.resolvedElements.tones.length) {
        clampedVoice.resolvedElements.tones = allowedTones.length > 0 
          ? allowedTones 
          : ['gentle', 'clear', 'straightforward'];
        clampingApplied = true;
      }
    }

    // Apply psychological depth constraints - use arc complexity as proxy
    if (clampedVoice.ch?.arc && clampedVoice.ch.arc.length > constraints.maxPsychologicalDepth) {
      clampedVoice.ch.arc = clampedVoice.ch.arc.slice(0, constraints.maxPsychologicalDepth);
      clampingApplied = true;
    }

    // Apply peril level constraints - use scale as proxy for peril
    if (clampedVoice.wd?.sc && parseInt(clampedVoice.wd.sc) > constraints.maxPerilLevel) {
      clampedVoice.wd.sc = constraints.maxPerilLevel.toString();
      clampingApplied = true;
    }

    // Apply sentence complexity constraints - limit twists for simplification
    if (constraints.requiresSimplification) {
      if (clampedVoice.resolvedElements?.twists && clampedVoice.resolvedElements.twists.length > constraints.maxTwistCount) {
        clampedVoice.resolvedElements.twists = clampedVoice.resolvedElements.twists.slice(0, constraints.maxTwistCount);
        clampingApplied = true;
      }
    }

    clampedVoice.clampingApplied = clampingApplied;
    return clampedVoice;
  }

  /**
   * Generate clamped control parameters for AI
   */
  static generateClampedControlParams(clampedVoice: ClampedVoice): string {
    const constraints = clampedVoice.appliedConstraints;
    
    const controlParams = {
      vocabularyLevel: `Grade ${constraints.maxVocabularyLevel} maximum`,
      sentenceComplexity: constraints.maxSentenceLength < 15 ? 'simple' : 'moderate',
      narrativeStyle: constraints.allowedNarrativeStyles.join(', '),
      contentMaturity: `Peril level ${constraints.maxPerilLevel}/5 maximum`,
      psychologicalDepth: `Emotional complexity ${constraints.maxPsychologicalDepth}/5 maximum`,
      plotComplexity: `Maximum ${constraints.maxTwistCount} plot elements`,
      ageAppropriate: true,
      clampingApplied: clampedVoice.clampingApplied
    };

    return JSON.stringify(controlParams, null, 0);
  }

  /**
   * Get base constraints for difficulty level
   */
  private static getBaseConstraints(difficulty: DifficultyLevel): LevelConstraints {
    const constraintMap: { [key in DifficultyLevel]: LevelConstraints } = {
      beginner: {
        maxComplexity: 3,
        maxVocabularyLevel: 1,
        maxPsychologicalDepth: 2,
        maxTwistCount: 1,
        maxPerilLevel: 2,
        allowedNarrativeStyles: ['simple', 'clear', 'straightforward', 'gentle'],
        maxSentenceLength: 10,
        requiresSimplification: true
      },
      easy: {
        maxComplexity: 4,
        maxVocabularyLevel: 2,
        maxPsychologicalDepth: 3,
        maxTwistCount: 2,
        maxPerilLevel: 2,
        allowedNarrativeStyles: ['simple', 'clear', 'straightforward', 'gentle', 'playful'],
        maxSentenceLength: 12,
        requiresSimplification: true
      },
      medium: {
        maxComplexity: 6,
        maxVocabularyLevel: 4,
        maxPsychologicalDepth: 3,
        maxTwistCount: 3,
        maxPerilLevel: 3,
        allowedNarrativeStyles: ['clear', 'straightforward', 'playful', 'descriptive', 'engaging'],
        maxSentenceLength: 15,
        requiresSimplification: false
      },
      hard: {
        maxComplexity: 8,
        maxVocabularyLevel: 6,
        maxPsychologicalDepth: 4,
        maxTwistCount: 4,
        maxPerilLevel: 4,
        allowedNarrativeStyles: ['descriptive', 'engaging', 'sophisticated', 'complex', 'layered'],
        maxSentenceLength: 20,
        requiresSimplification: false
      },
      expert: {
        maxComplexity: 10,
        maxVocabularyLevel: 8,
        maxPsychologicalDepth: 5,
        maxTwistCount: 5,
        maxPerilLevel: 4,
        allowedNarrativeStyles: ['sophisticated', 'complex', 'layered', 'nuanced', 'mature'],
        maxSentenceLength: 25,
        requiresSimplification: false
      }
    };

    return constraintMap[difficulty];
  }

  /**
   * Get age-based constraints
   */
  private static getAgeConstraints(ageGroup: string): LevelConstraints {
    const ageConstraintMap: { [key: string]: LevelConstraints } = {
      preschool: { // 3-4
        maxComplexity: 2,
        maxVocabularyLevel: 0,
        maxPsychologicalDepth: 1,
        maxTwistCount: 0,
        maxPerilLevel: 1,
        allowedNarrativeStyles: ['simple', 'gentle'],
        maxSentenceLength: 8,
        requiresSimplification: true
      },
      early_elementary: { // 5-7
        maxComplexity: 4,
        maxVocabularyLevel: 2,
        maxPsychologicalDepth: 2,
        maxTwistCount: 1,
        maxPerilLevel: 2,
        allowedNarrativeStyles: ['simple', 'clear', 'gentle', 'playful'],
        maxSentenceLength: 12,
        requiresSimplification: true
      },
      elementary: { // 8-10
        maxComplexity: 6,
        maxVocabularyLevel: 4,
        maxPsychologicalDepth: 3,
        maxTwistCount: 2,
        maxPerilLevel: 3,
        allowedNarrativeStyles: ['clear', 'playful', 'descriptive', 'engaging'],
        maxSentenceLength: 15,
        requiresSimplification: false
      },
      middle: { // 11-12
        maxComplexity: 8,
        maxVocabularyLevel: 6,
        maxPsychologicalDepth: 4,
        maxTwistCount: 3,
        maxPerilLevel: 4,
        allowedNarrativeStyles: ['descriptive', 'engaging', 'sophisticated', 'complex'],
        maxSentenceLength: 18,
        requiresSimplification: false
      }
    };

    return ageConstraintMap[ageGroup] || ageConstraintMap.elementary;
  }

  /**
   * Determine age group from age
   */
  private static getAgeGroup(age: number): string {
    if (age <= 4) return 'preschool';
    if (age <= 7) return 'early_elementary';
    if (age <= 10) return 'elementary';
    return 'middle';
  }

  /**
   * Assess voice complexity for comparison
   */
  private static assessVoiceComplexity(voice: ProcessedVoice): number {
    let complexity = 5; // Base complexity
    
    // Factor in reading specs
    if (voice.rd?.aa) {
      complexity += voice.rd.aa * 0.5;
    }
    
    // Factor in character arc complexity
    if (voice.ch?.arc) {
      complexity += voice.ch.arc.length * 0.5;
    }
    
    // Factor in world scale
    if (voice.wd?.sc) {
      complexity += parseInt(voice.wd.sc) || 0;
    }
    
    return Math.min(complexity, 10);
  }
}