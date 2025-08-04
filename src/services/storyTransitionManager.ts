import { DifficultyLevel } from '../types';

export interface TransitionConfig {
  fromPages: number;
  toPages: number;
  fromDifficulty?: DifficultyLevel;
  toDifficulty?: DifficultyLevel;
  isPremium: boolean;
}

export interface TransitionMessage {
  title: string;
  message: string;
  encouragement: string;
  continueText: string;
}

export class StoryTransitionManager {
  static generateTransitionMessage(config: TransitionConfig): TransitionMessage {
    if (config.fromDifficulty && config.toDifficulty && config.fromDifficulty !== config.toDifficulty) {
      return this.generateDifficultyTransition(config);
    } else {
      return this.generatePageTransition(config);
    }
  }

  private static generateDifficultyTransition(config: TransitionConfig): TransitionMessage {
    const { fromDifficulty, toDifficulty, isPremium } = config;
    
    const transitions = {
      'easy-medium': {
        title: '🌟 Amazing Progress!',
        message: `Wow! You're reading so well that your story is getting more exciting with new words and adventures!`,
        encouragement: 'You\'re becoming a stronger reader! Let\'s discover what happens next.',
        continueText: isPremium ? 'Continue the Adventure!' : 'Continue Reading!'
      },
      'medium-hard': {
        title: '🚀 Fantastic Growth!',
        message: `Incredible! Your reading skills are soaring! Your story is evolving with more complex adventures and deeper friendships.`,
        encouragement: 'You\'re ready for bigger challenges and richer stories!',
        continueText: isPremium ? 'Unlock New Adventures!' : 'Keep Growing!'
      },
      'hard-expert': {
        title: '🏆 Exceptional Mastery!',
        message: `Outstanding! You've become such a skilled reader that your story is transforming into an epic tale with profound themes and complex characters.`,
        encouragement: 'You\'re ready to explore the most sophisticated stories and ideas!',
        continueText: isPremium ? 'Begin the Epic!' : 'Master the Story!'
      }
    };

    const key = `${fromDifficulty}-${toDifficulty}` as keyof typeof transitions;
    return transitions[key] || transitions['easy-medium'];
  }

  private static generatePageTransition(config: TransitionConfig): TransitionMessage {
    const { fromPages, toPages, isPremium } = config;
    
    if (isPremium) {
      return {
        title: '📚 Story Expanding!',
        message: `Your adventure is growing! From ${fromPages} pages to ${toPages} pages of magical storytelling.`,
        encouragement: 'With premium AI magic, your story becomes richer and more personalized with each page!',
        continueText: 'Continue the Magic!'
      };
    } else {
      return {
        title: '📖 Story Growing!',
        message: `Fantastic reading! Your story is expanding from ${fromPages} to ${toPages} pages of adventure.`,
        encouragement: 'You\'re doing amazing! Let\'s see what exciting new pages await.',
        continueText: 'Keep Reading!'
      };
    }
  }

  static shouldShowTransition(
    currentPages: number, 
    newPages: number, 
    currentDifficulty: DifficultyLevel, 
    newDifficulty: DifficultyLevel
  ): boolean {
    // Show transition if pages increase significantly or difficulty changes
    const significantPageIncrease = newPages > currentPages && (newPages - currentPages) >= 5;
    const difficultyChange = currentDifficulty !== newDifficulty;
    
    return significantPageIncrease || difficultyChange;
  }

  static getTransitionPageContent(config: TransitionConfig): string {
    const message = this.generateTransitionMessage(config);
    
    return `
🌟 **${message.title}** 🌟

${message.message}

${message.encouragement}

---

*${message.continueText}*
    `.trim();
  }

  static getDifficultyProgression(): { [key in DifficultyLevel]: DifficultyLevel | null } {
    return {
      'easy': 'medium',
      'medium': 'hard', 
      'hard': 'expert',
      'expert': null // No progression beyond expert
    };
  }

  static shouldProgressDifficulty(
    currentDifficulty: DifficultyLevel,
    pagesRead: number,
    readingAccuracy: number,
    timeSpent: number
  ): boolean {
    const progression = this.getDifficultyProgression();
    const nextLevel = progression[currentDifficulty];
    
    if (!nextLevel) return false; // Already at highest level
    
    // Progression criteria based on difficulty
    const criteria = {
      'easy': {
        minPages: 15,
        minAccuracy: 0.85,
        minTimeMinutes: 8
      },
      'medium': {
        minPages: 25,
        minAccuracy: 0.80,
        minTimeMinutes: 12
      },
      'hard': {
        minPages: 35,
        minAccuracy: 0.75,
        minTimeMinutes: 18
      }
    };

    const current = criteria[currentDifficulty as keyof typeof criteria];
    if (!current) return false;

    const timeMinutes = timeSpent / (1000 * 60);
    
    return (
      pagesRead >= current.minPages &&
      readingAccuracy >= current.minAccuracy &&
      timeMinutes >= current.minTimeMinutes
    );
  }

  static getPageProgression(currentPages: number, difficulty: DifficultyLevel, isPremium: boolean): number {
    const baseProgression = {
      'easy': [5, 10, 15, 20],
      'medium': [8, 15, 25, 30],
      'hard': [10, 20, 30, 40],
      'expert': [12, 25, 40, 50]
    };

    const progression = baseProgression[difficulty];
    const currentIndex = progression.findIndex(pages => pages >= currentPages);
    
    if (currentIndex === -1 || currentIndex === progression.length - 1) {
      // Already at max for this difficulty
      return currentPages;
    }
    
    const nextPages = progression[currentIndex + 1];
    
    // Premium users get more pages
    if (isPremium) {
      return Math.min(nextPages * 1.5, 60); // Cap at 60 pages for premium
    }
    
    return nextPages;
  }

  static generateCelebrationMessage(achievement: string): string {
    const celebrations = [
      `🎉 Congratulations! You've ${achievement}! Your reading journey is truly inspiring.`,
      `🌟 Amazing work! ${achievement}! You're becoming such a strong reader.`,
      `🏆 Fantastic! You've ${achievement}! Keep up the incredible progress.`,
      `🚀 Wonderful! ${achievement}! Your dedication to reading is paying off.`,
      `💫 Brilliant! You've ${achievement}! Every page makes you a better reader.`
    ];
    
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }
}