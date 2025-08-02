export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'reading' | 'vocabulary' | 'streak' | 'special' | 'session';
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
  category: string;
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: Date;
  streakStartDate: Date;
}

export interface UserStats {
  totalWordsRead: number;
  totalStoriesCompleted: number;
  totalTimeReading: number; // in minutes
  vocabularyWordsLearned: number;
  averageReadingSpeed: number; // words per minute
  currentLevel: number;
  totalPoints: number;
  streak: ReadingStreak;
  achievements: Achievement[];
  badges: Badge[];
}

export class GamificationService {
  private static achievements: Omit<Achievement, 'currentProgress' | 'unlocked' | 'unlockedAt'>[] = [
    // Reading Achievements
    {
      id: 'first_story',
      title: 'First Adventure',
      description: 'Complete your very first story',
      icon: '📚',
      category: 'reading',
      requirement: 1,
      rarity: 'common',
      points: 10
    },
    {
      id: 'story_explorer',
      title: 'Story Explorer',
      description: 'Complete 5 different stories',
      icon: '🗺️',
      category: 'reading',
      requirement: 5,
      rarity: 'common',
      points: 25
    },
    {
      id: 'bookworm',
      title: 'Bookworm',
      description: 'Complete 25 stories',
      icon: '🐛',
      category: 'reading',
      requirement: 25,
      rarity: 'rare',
      points: 100
    },
    {
      id: 'reading_champion',
      title: 'Reading Champion',
      description: 'Complete 100 stories',
      icon: '🏆',
      category: 'reading',
      requirement: 100,
      rarity: 'epic',
      points: 500
    },
    
    // Word Count Achievements - Enhanced Progression
    {
      id: 'first_words',
      title: 'First Words',
      description: 'Read 25 words',
      icon: '📝',
      category: 'reading',
      requirement: 25,
      rarity: 'common',
      points: 3
    },
    {
      id: 'getting_started',
      title: 'Getting Started',
      description: 'Read 100 words',
      icon: '🌱',
      category: 'reading',
      requirement: 100,
      rarity: 'common',
      points: 5
    },
    {
      id: 'word_explorer',
      title: 'Word Explorer',
      description: 'Read 250 words',
      icon: '🔍',
      category: 'reading',
      requirement: 250,
      rarity: 'common',
      points: 8
    },
    {
      id: 'reading_beginner',
      title: 'Reading Beginner',
      description: 'Read 500 words',
      icon: '📖',
      category: 'reading',
      requirement: 500,
      rarity: 'common',
      points: 12
    },
    {
      id: 'word_starter',
      title: 'Word Starter',
      description: 'Read 1,000 words',
      icon: '💬',
      category: 'reading',
      requirement: 1000,
      rarity: 'common',
      points: 15
    },
    {
      id: 'word_enthusiast',
      title: 'Word Enthusiast',
      description: 'Read 2,500 words',
      icon: '📚',
      category: 'reading',
      requirement: 2500,
      rarity: 'common',
      points: 25
    },
    {
      id: 'dedicated_reader',
      title: 'Dedicated Reader',
      description: 'Read 5,000 words',
      icon: '📘',
      category: 'reading',
      requirement: 5000,
      rarity: 'rare',
      points: 40
    },
    {
      id: 'word_master',
      title: 'Word Master',
      description: 'Read 10,000 words',
      icon: '📖',
      category: 'reading',
      requirement: 10000,
      rarity: 'rare',
      points: 75
    },
    {
      id: 'word_champion',
      title: 'Word Champion',
      description: 'Read 25,000 words',
      icon: '🏆',
      category: 'reading',
      requirement: 25000,
      rarity: 'rare',
      points: 150
    },
    {
      id: 'reading_pro',
      title: 'Reading Pro',
      description: 'Read 50,000 words',
      icon: '🌟',
      category: 'reading',
      requirement: 50000,
      rarity: 'epic',
      points: 300
    },
    {
      id: 'vocabulary_genius',
      title: 'Vocabulary Genius',
      description: 'Read 100,000 words',
      icon: '🧠',
      category: 'reading',
      requirement: 100000,
      rarity: 'legendary',
      points: 1000
    },
    
    // Streak Achievements
    {
      id: 'daily_reader',
      title: 'Daily Reader',
      description: 'Read for 3 days in a row',
      icon: '🔥',
      category: 'streak',
      requirement: 3,
      rarity: 'common',
      points: 20
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      description: 'Read for 7 days in a row',
      icon: '⚡',
      category: 'streak',
      requirement: 7,
      rarity: 'rare',
      points: 50
    },
    {
      id: 'streak_legend',
      title: 'Streak Legend',
      description: 'Read for 30 days in a row',
      icon: '🌟',
      category: 'streak',
      requirement: 30,
      rarity: 'epic',
      points: 200
    },
    
    // Vocabulary Achievements - Enhanced Progression
    {
      id: 'first_words_learned',
      title: 'First Words Learned',
      description: 'Learn 5 new vocabulary words',
      icon: '🎯',
      category: 'vocabulary',
      requirement: 5,
      rarity: 'common',
      points: 10
    },
    {
      id: 'word_learner',
      title: 'Word Learner',
      description: 'Learn 10 vocabulary words',
      icon: '📝',
      category: 'vocabulary',
      requirement: 10,
      rarity: 'common',
      points: 15
    },
    {
      id: 'vocabulary_starter',
      title: 'Vocabulary Starter',
      description: 'Learn 25 vocabulary words',
      icon: '📖',
      category: 'vocabulary',
      requirement: 25,
      rarity: 'common',
      points: 20
    },
    {
      id: 'word_collector',
      title: 'Word Collector',
      description: 'Learn 50 new vocabulary words',
      icon: '📝',
      category: 'vocabulary',
      requirement: 50,
      rarity: 'common',
      points: 30
    },
    {
      id: 'word_builder',
      title: 'Word Builder',
      description: 'Learn 75 vocabulary words',
      icon: '🔨',
      category: 'vocabulary',
      requirement: 75,
      rarity: 'common',
      points: 40
    },
    {
      id: 'vocabulary_scholar',
      title: 'Vocabulary Scholar',
      description: 'Learn 100 vocabulary words',
      icon: '🎓',
      category: 'vocabulary',
      requirement: 100,
      rarity: 'rare',
      points: 60
    },
    {
      id: 'word_master_vocab',
      title: 'Word Master',
      description: 'Learn 150 vocabulary words',
      icon: '📚',
      category: 'vocabulary',
      requirement: 150,
      rarity: 'rare',
      points: 80
    },
    {
      id: 'vocabulary_expert',
      title: 'Vocabulary Expert',
      description: 'Learn 200 vocabulary words',
      icon: '🎓',
      category: 'vocabulary',
      requirement: 200,
      rarity: 'rare',
      points: 100
    },
    {
      id: 'language_expert',
      title: 'Language Expert',
      description: 'Learn 300 vocabulary words',
      icon: '🧠',
      category: 'vocabulary',
      requirement: 300,
      rarity: 'epic',
      points: 150
    },
    {
      id: 'vocabulary_genius_vocab',
      title: 'Vocabulary Genius',
      description: 'Learn 500 vocabulary words',
      icon: '🌟',
      category: 'vocabulary',
      requirement: 500,
      rarity: 'epic',
      points: 250
    },
    
    // Special Achievements
    {
      id: 'speed_reader',
      title: 'Speed Reader',
      description: 'Read at 100+ words per minute',
      icon: '💨',
      category: 'special',
      requirement: 100,
      rarity: 'rare',
      points: 75
    },
    {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Complete a story before 8 AM',
      icon: '🌅',
      category: 'special',
      requirement: 1,
      rarity: 'rare',
      points: 40
    },
    {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Complete a story after 8 PM',
      icon: '🦉',
      category: 'special',
      requirement: 1,
      rarity: 'rare',
      points: 40
    },
    
    // Session Achievements (for all users)
    {
      id: 'focused_reader',
      title: 'Focused Reader',
      description: 'Read for 20 minutes in a single session',
      icon: '🎯',
      category: 'session',
      requirement: 20,
      rarity: 'rare',
      points: 400
    },
    {
      id: 'page_turner',
      title: 'Page Turner',
      description: 'Read 10 pages in a single session',
      icon: '📄',
      category: 'session',
      requirement: 10,
      rarity: 'common',
      points: 25
    },
    {
      id: 'chapter_master',
      title: 'Chapter Master',
      description: 'Read 25 pages in a single session',
      icon: '📚',
      category: 'session',
      requirement: 25,
      rarity: 'rare',
      points: 75
    },
    {
      id: 'book_explorer',
      title: 'Book Explorer',
      description: 'Read 50 pages in a single session',
      icon: '🗺️',
      category: 'session',
      requirement: 50,
      rarity: 'epic',
      points: 150
    }
  ];

  private static calculateLevel(totalPoints: number): number {
    // Level progression: 100, 250, 500, 1000, 2000, 4000, etc.
    if (totalPoints < 100) return 1;
    if (totalPoints < 250) return 2;
    if (totalPoints < 500) return 3;
    if (totalPoints < 1000) return 4;
    if (totalPoints < 2000) return 5;
    if (totalPoints < 4000) return 6;
    if (totalPoints < 8000) return 7;
    if (totalPoints < 16000) return 8;
    if (totalPoints < 32000) return 9;
    return Math.floor(Math.log2(totalPoints / 32000)) + 10;
  }

  private static getPointsForNextLevel(currentLevel: number): number {
    const levelThresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];
    if (currentLevel < levelThresholds.length) {
      return levelThresholds[currentLevel];
    }
    return 32000 * Math.pow(2, currentLevel - 9);
  }

  static updateStreak(currentStreak: ReadingStreak): ReadingStreak {
    const today = new Date();
    const lastRead = new Date(currentStreak.lastReadDate);
    const diffTime = Math.abs(today.getTime() - lastRead.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no change
      return currentStreak;
    } else if (diffDays === 1) {
      // Consecutive day, extend streak
      return {
        ...currentStreak,
        currentStreak: currentStreak.currentStreak + 1,
        longestStreak: Math.max(currentStreak.longestStreak, currentStreak.currentStreak + 1),
        lastReadDate: today
      };
    } else {
      // Streak broken, start new
      return {
        currentStreak: 1,
        longestStreak: currentStreak.longestStreak,
        lastReadDate: today,
        streakStartDate: today
      };
    }
  }

  static checkAchievements(stats: UserStats, newActivity: {
    wordsRead?: number;
    storiesCompleted?: number;
    vocabularyLearned?: number;
    readingSpeed?: number;
    currentTime?: Date;
    sessionTimeMinutes?: number;
    sessionPagesRead?: number;
  }, userType: 'free' | 'premium' = 'premium'): { newAchievements: Achievement[], updatedStats: UserStats } {
    const newAchievements: Achievement[] = [];
    const updatedAchievements = stats.achievements.map(achievement => ({ ...achievement }));

    // Filter achievements based on user type
    const availableAchievements = this.achievements.filter(template => {
      // Free users don't get streak achievements
      if (userType === 'free' && template.category === 'streak') {
        return false;
      }
      return true;
    });

    // Update progress and check for unlocks
    availableAchievements.forEach(template => {
      const existing = updatedAchievements.find(a => a.id === template.id);
      if (existing && existing.unlocked) return;

      let currentProgress = 0;
      
      switch (template.category) {
        case 'reading':
          if (template.id.includes('story')) {
            currentProgress = stats.totalStoriesCompleted + (newActivity.storiesCompleted || 0);
          } else if (template.id.includes('word')) {
            currentProgress = stats.totalWordsRead + (newActivity.wordsRead || 0);
          }
          break;
        case 'streak':
          currentProgress = stats.streak.currentStreak;
          break;
        case 'vocabulary':
          currentProgress = stats.vocabularyWordsLearned + (newActivity.vocabularyLearned || 0);
          break;
        case 'special':
          if (template.id === 'speed_reader') {
            currentProgress = newActivity.readingSpeed || stats.averageReadingSpeed;
          } else if (template.id === 'early_bird' || template.id === 'night_owl') {
            const currentTime = newActivity.currentTime || new Date();
            const hour = currentTime.getHours();
            if (template.id === 'early_bird' && hour < 8) currentProgress = 1;
            if (template.id === 'night_owl' && hour >= 20) currentProgress = 1;
          }
          break;
        case 'session':
          if (template.id === 'focused_reader') {
            currentProgress = newActivity.sessionTimeMinutes || 0;
          } else if (template.id.includes('page') || template.id.includes('chapter') || template.id.includes('book')) {
            currentProgress = newActivity.sessionPagesRead || 0;
          }
          break;
      }

      if (existing) {
        existing.currentProgress = currentProgress;
        if (currentProgress >= template.requirement && !existing.unlocked) {
          existing.unlocked = true;
          existing.unlockedAt = new Date();
          newAchievements.push(existing);
        }
      } else {
        const newAchievement: Achievement = {
          ...template,
          currentProgress,
          unlocked: currentProgress >= template.requirement,
          unlockedAt: currentProgress >= template.requirement ? new Date() : undefined
        };
        updatedAchievements.push(newAchievement);
        if (newAchievement.unlocked) {
          newAchievements.push(newAchievement);
        }
      }
    });

    // Calculate new total points
    const totalPoints = updatedAchievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    const updatedStats: UserStats = {
      ...stats,
      totalPoints,
      currentLevel: this.calculateLevel(totalPoints),
      achievements: updatedAchievements
    };

    return { newAchievements, updatedStats };
  }

  static generateBadge(achievement: Achievement): Badge {
    return {
      id: `badge_${achievement.id}`,
      name: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      color: this.getBadgeColor(achievement.rarity),
      earnedAt: achievement.unlockedAt || new Date(),
      category: achievement.category
    };
  }

  private static getBadgeColor(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'common': return '#10B981'; // green
      case 'rare': return '#3B82F6'; // blue  
      case 'epic': return '#8B5CF6'; // purple
      case 'legendary': return '#F59E0B'; // yellow/gold
      default: return '#6B7280'; // gray
    }
  }

  static getProgressToNextLevel(currentPoints: number, currentLevel: number): {
    currentLevelPoints: number;
    nextLevelPoints: number;
    progressPercentage: number;
  } {
    const nextLevelPoints = this.getPointsForNextLevel(currentLevel);
    const currentLevelPoints = currentLevel > 1 ? this.getPointsForNextLevel(currentLevel - 1) : 0;
    
    const pointsInCurrentLevel = currentPoints - currentLevelPoints;
    const pointsNeededForLevel = nextLevelPoints - currentLevelPoints;
    
    return {
      currentLevelPoints: pointsInCurrentLevel,
      nextLevelPoints: pointsNeededForLevel,
      progressPercentage: Math.min(100, (pointsInCurrentLevel / pointsNeededForLevel) * 100)
    };
  }

  static getMotivationalMessage(stats: UserStats): string {
    const messages = [
      `🌟 You're on level ${stats.currentLevel}! Keep reading to level up!`,
      `🔥 Amazing ${stats.streak.currentStreak}-day reading streak!`,
      `📚 You've read ${stats.totalWordsRead.toLocaleString()} words so far!`,
      `🏆 ${stats.achievements.filter(a => a.unlocked).length} achievements unlocked!`,
      `⭐ ${stats.totalPoints} points earned through reading!`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }
}