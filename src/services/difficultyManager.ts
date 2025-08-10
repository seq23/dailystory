// Difficulty Manager - Intelligent difficulty assignment and progression
import { DifficultyLevel, UserInfo } from '@/types';
import { MobileSessionManager } from './mobileSessionManager';

interface DifficultyProfile {
  suggestedDifficulty: DifficultyLevel;
  confidence: number;
  reasoning: string[];
  authorVoiceAvailable: boolean;
}

export class DifficultyManager {
  private static readonly STORAGE_KEY = 'user_difficulty_preferences';

  /**
   * Get intelligent difficulty suggestion based on user info
   */
  static suggestDifficulty(userInfo: UserInfo): DifficultyProfile {
    const reasoning: string[] = [];
    let suggestedDifficulty: DifficultyLevel = 'easy'; // Default with author voice
    let confidence = 0.5;

    // Age-based suggestions
    if (userInfo.age) {
      const age = parseInt(userInfo.age.toString());
      
      if (age <= 5) {
        suggestedDifficulty = 'beginner';
        confidence += 0.3;
        reasoning.push(`Age ${age}: Pre-reader level recommended`);
      } else if (age <= 7) {
        suggestedDifficulty = 'easy';
        confidence += 0.3;
        reasoning.push(`Age ${age}: Early reader with author voice`);
      } else if (age <= 9) {
        suggestedDifficulty = 'medium';
        confidence += 0.3;
        reasoning.push(`Age ${age}: Developing reader with rich storytelling`);
      } else if (age <= 12) {
        suggestedDifficulty = 'hard';
        confidence += 0.3;
        reasoning.push(`Age ${age}: Advanced reader ready for complex narratives`);
      } else {
        suggestedDifficulty = 'expert';
        confidence += 0.3;
        reasoning.push(`Age ${age}: Expert level for sophisticated content`);
      }
    }

    // Grade level adjustments
    if (userInfo.gradeLevel) {
      const grade = parseInt(userInfo.gradeLevel.toString());
      
      if (grade >= 3 && suggestedDifficulty === 'beginner') {
        suggestedDifficulty = 'easy';
        confidence += 0.2;
        reasoning.push(`Grade ${grade}: Upgraded to include author voice patterns`);
      } else if (grade >= 5 && ['beginner', 'easy'].includes(suggestedDifficulty)) {
        suggestedDifficulty = 'medium';
        confidence += 0.2;
        reasoning.push(`Grade ${grade}: Enhanced storytelling recommended`);
      }
    }

    // Reading level overrides
    if (userInfo.readingLevel) {
      const readingLevel = userInfo.readingLevel.toLowerCase();
      
      if (readingLevel.includes('beginner') || readingLevel.includes('pre')) {
        // Keep beginner only for explicit pre-readers
        if (userInfo.age && parseInt(userInfo.age.toString()) >= 6) {
          suggestedDifficulty = 'easy';
          reasoning.push('Reading level: Beginner upgraded to Easy for author voice');
        } else {
          suggestedDifficulty = 'beginner';
          reasoning.push('Reading level: True beginner level');
        }
        confidence += 0.4;
      } else if (readingLevel.includes('elementary') || readingLevel.includes('easy')) {
        suggestedDifficulty = 'easy';
        confidence += 0.4;
        reasoning.push('Reading level: Elementary with author voice support');
      } else if (readingLevel.includes('intermediate') || readingLevel.includes('medium')) {
        suggestedDifficulty = 'medium';
        confidence += 0.4;
        reasoning.push('Reading level: Intermediate storytelling');
      } else if (readingLevel.includes('advanced') || readingLevel.includes('hard')) {
        suggestedDifficulty = 'hard';
        confidence += 0.4;
        reasoning.push('Reading level: Advanced narrative complexity');
      } else if (readingLevel.includes('expert')) {
        suggestedDifficulty = 'expert';
        confidence += 0.4;
        reasoning.push('Reading level: Expert literary analysis');
      }
    }

    // Author voice bias - prefer difficulties with author voice unless explicitly beginner
    const authorVoiceAvailable = suggestedDifficulty !== 'beginner';
    if (!authorVoiceAvailable && userInfo.age && parseInt(userInfo.age.toString()) >= 6) {
      suggestedDifficulty = 'easy';
      confidence = Math.max(0.6, confidence);
      reasoning.push('Upgraded to Easy for author voice storytelling patterns');
    }

    // Cap confidence
    confidence = Math.min(1.0, confidence);

    return {
      suggestedDifficulty,
      confidence,
      reasoning,
      authorVoiceAvailable: suggestedDifficulty !== 'beginner'
    };
  }

  /**
   * Get stored user difficulty preference
   */
  static getStoredDifficulty(userId: string): DifficultyLevel | null {
    try {
      const stored = MobileSessionManager.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        return data.difficulty || null;
      }
    } catch (error) {
      console.warn('⚠️ DifficultyManager: Failed to load stored difficulty:', error);
    }
    return null;
  }

  /**
   * Store user difficulty preference
   */
  static storeDifficulty(userId: string, difficulty: DifficultyLevel, userInfo: UserInfo): void {
    try {
      const data = {
        difficulty,
        lastUpdated: Date.now(),
        userAge: userInfo.age,
        userGrade: userInfo.gradeLevel,
        confidence: this.suggestDifficulty(userInfo).confidence
      };
      
      MobileSessionManager.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(data));
      console.log(`💾 DifficultyManager: Stored difficulty ${difficulty} for user ${userId}`);
    } catch (error) {
      console.warn('⚠️ DifficultyManager: Failed to store difficulty:', error);
    }
  }

  /**
   * Get final difficulty recommendation - prioritizes user's explicit readingAbility choice
   */
  static getFinalDifficulty(userInfo: UserInfo): {
    difficulty: DifficultyLevel;
    isStored: boolean;
    profile: DifficultyProfile;
  } {
    const userId = userInfo.name || 'guest';
    const profile = this.suggestDifficulty(userInfo);
    
    // FIRST PRIORITY: User's explicit selection (complete user control)
    if (userInfo.difficultyLevel) {
      console.log(`🎯 DifficultyManager: Using user's explicit difficultyLevel ${userInfo.difficultyLevel} for ${userId}`);
      return {
        difficulty: userInfo.difficultyLevel,
        isStored: false,
        profile: {
          ...profile,
          suggestedDifficulty: userInfo.difficultyLevel,
          reasoning: ["Using user's explicit difficulty choice", ...profile.reasoning]
        }
      };
    }
    if (userInfo.readingAbility) {
      console.log(`🎯 DifficultyManager: Using user's explicit readingAbility ${userInfo.readingAbility} for ${userId}`);
      return {
        difficulty: userInfo.readingAbility,
        isStored: false,
        profile: {
          ...profile,
          suggestedDifficulty: userInfo.readingAbility,
          reasoning: ['Using user\'s explicit reading ability choice', ...profile.reasoning]
        }
      };
    }
    
    // SECOND PRIORITY: Check for stored preference
    const storedDifficulty = this.getStoredDifficulty(userId);
    if (storedDifficulty) {
      console.log(`🎯 DifficultyManager: Using stored difficulty ${storedDifficulty} for ${userId}`);
      return {
        difficulty: storedDifficulty,
        isStored: true,
        profile: {
          ...profile,
          suggestedDifficulty: storedDifficulty,
          reasoning: ['Using stored user preference', ...profile.reasoning]
        }
      };
    }
    
    // LAST PRIORITY: Age-based suggestions (all levels available regardless of age)
    console.log(`🎯 DifficultyManager: Suggesting ${profile.suggestedDifficulty} for ${userId} (confidence: ${profile.confidence})`);
    console.log(`📋 DifficultyManager: Reasoning:`, profile.reasoning);
    
    return {
      difficulty: profile.suggestedDifficulty,
      isStored: false,
      profile
    };
  }

  /**
   * Check if difficulty includes author voice
   */
  static hasAuthorVoice(difficulty: DifficultyLevel): boolean {
    return difficulty !== 'beginner';
  }

  /**
   * Get difficulty progression path
   */
  static getProgressionPath(currentDifficulty: DifficultyLevel): DifficultyLevel | null {
    const progression: Record<DifficultyLevel, DifficultyLevel | null> = {
      'beginner': 'easy',
      'easy': 'medium',
      'medium': 'hard',
      'hard': 'expert',
      'expert': null
    };
    
    return progression[currentDifficulty];
  }

  /**
   * Debug current difficulty state
   */
  static debugDifficultyState(userInfo: UserInfo): void {
    const result = this.getFinalDifficulty(userInfo);
    
    console.log('🔍 DifficultyManager: === DIFFICULTY DEBUG ===');
    console.log('👤 User Info:', {
      name: userInfo.name,
      age: userInfo.age,
      gradeLevel: userInfo.gradeLevel,
      readingLevel: userInfo.readingLevel
    });
    console.log('🎯 Final Difficulty:', result.difficulty);
    console.log('💾 Is Stored:', result.isStored);
    console.log('🌟 Author Voice Available:', this.hasAuthorVoice(result.difficulty));
    console.log('📋 Reasoning:', result.profile.reasoning);
    console.log('📊 Confidence:', result.profile.confidence);
    console.log('🔍 DifficultyManager: === END DEBUG ===');
  }
}
