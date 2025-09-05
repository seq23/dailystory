import type { UserInfo, ExpertGradeLevel } from "@/types";
import { APP_CONFIG } from "@/constants/app";
import { ExpertDifficultyManager } from "./expertDifficultyManager";

export interface ReadingProgress {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  
  // Universal metrics
  storiesCompleted: number;
  totalReadingTime: number; // in seconds
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  
  // Reading performance
  wordsRead: number;
  readingSpeed: number; // words per minute
  comprehensionScore: number; // percentage
  
  // For Native English Speakers
  nativeProgress?: {
    readingLevel: string;
    vocabularyGrowth: number;
    complexWordsEncountered: string[];
    readingComprehensionScores: number[];
    averageSessionTime: number;
    favoriteGenres: string[];
  };
  
  // For ESL Learners  
  eslProgress?: {
    englishVocabularySize: number;
    wordsLearned: string[];
    wordsNeedingPractice: string[];
    grammarPatternsEncountered: string[];
    culturalConceptsLearned: string[];
    confidenceLevel: number; // 1-10 scale
    translationsRequested: number;
    pronunciationPractice: number;
  };
  
  // Learning achievements
  achievements: Achievement[];
  weeklyGoals: WeeklyGoal[];
  personalizedRecommendations: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'vocabulary' | 'streak' | 'comprehension' | 'cultural';
  earnedDate: Date;
  icon: string;
}

export interface WeeklyGoal {
  week: string; // YYYY-WW format
  type: 'reading_time' | 'stories_completed' | 'vocabulary_learned';
  target: number;
  current: number;
  completed: boolean;
}

export interface VocabularyWord {
  word: string;
  definition: string;
  translation?: string; // For ESL learners
  encounteredDate: Date;
  practiceCount: number;
  masteryLevel: number; // 0-100
  sentenceContext: string;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
}

export class ProgressTrackingService {
  private static readonly STORAGE_KEY = APP_CONFIG.PROGRESS_STORAGE_KEY;
  
  static initializeProgress(userInfo: UserInfo): ReadingProgress {
    const userId = this.generateUserId(userInfo);
    const sessionId = this.generateSessionId();
    
    const baseProgress: ReadingProgress = {
      userId,
      sessionId,
      startTime: new Date(),
      storiesCompleted: 0,
      totalReadingTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 1,
      wordsRead: 0,
      readingSpeed: 0,
      comprehensionScore: 100,
      achievements: [],
      weeklyGoals: this.generateWeeklyGoals(userInfo),
      personalizedRecommendations: []
    };
    
    // Add specific progress tracking based on user type
    if (userInfo.nativeLanguage === 'en') {
      baseProgress.nativeProgress = {
        readingLevel: userInfo.difficultyLevel || 'medium',
        vocabularyGrowth: 0,
        complexWordsEncountered: [],
        readingComprehensionScores: [],
        averageSessionTime: 0,
        favoriteGenres: []
      };
    } else {
      baseProgress.eslProgress = {
        englishVocabularySize: 0,
        wordsLearned: [],
        wordsNeedingPractice: [],
        grammarPatternsEncountered: [],
        culturalConceptsLearned: [],
        confidenceLevel: 5,
        translationsRequested: 0,
        pronunciationPractice: 0
      };
    }
    
    return baseProgress;
  }
  
  static updateReadingSession(
    progress: ReadingProgress, 
    sessionData: {
      wordsRead: number;
      timeSpent: number;
      storiesCompleted: number;
      comprehensionScore?: number;
      expertGradeLevel?: ExpertGradeLevel;
      difficulty?: string;
    }
  ): ReadingProgress {
    const updatedProgress = { ...progress };
    
    // Update universal metrics
    updatedProgress.wordsRead += sessionData.wordsRead;
    updatedProgress.totalReadingTime += sessionData.timeSpent;
    updatedProgress.storiesCompleted += sessionData.storiesCompleted;
    updatedProgress.readingSpeed = Math.round((updatedProgress.wordsRead / (updatedProgress.totalReadingTime / 60)));
    
    if (sessionData.comprehensionScore) {
      updatedProgress.comprehensionScore = Math.round(
        (updatedProgress.comprehensionScore + sessionData.comprehensionScore) / 2
      );
    }
    
    // Update streak
    updatedProgress.currentStreak++;
    if (updatedProgress.currentStreak > updatedProgress.longestStreak) {
      updatedProgress.longestStreak = updatedProgress.currentStreak;
    }
    
    // Check for new achievements
    const newAchievements = this.checkForAchievements(updatedProgress);
    updatedProgress.achievements.push(...newAchievements);
    
    // Update weekly goals
    updatedProgress.weeklyGoals = this.updateWeeklyGoals(updatedProgress.weeklyGoals, sessionData);
    
    // Update expert difficulty progression if applicable
    if (sessionData.difficulty === 'expert' && sessionData.expertGradeLevel) {
      // Extract userInfo from progress (we'll need to improve this structure later)
      const userInfo: UserInfo = {
        name: updatedProgress.userId.split('_')[1] || 'user',
        age: 11, // Default for expert level
        grade: '6th+',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
        favoriteColor: '',
        favoriteAnimal: '',
        hobbies: '',
        favoriteFood: '',
        specialRequest: ''
      };
      
      ExpertDifficultyManager.updateProgress(userInfo, sessionData.expertGradeLevel, {
        readingSpeed: updatedProgress.readingSpeed,
        pagesCompleted: sessionData.storiesCompleted || 0,
        completed: sessionData.storiesCompleted > 0
      });
    }
    
    return updatedProgress;
  }
  
  static updateVocabulary(
    progress: ReadingProgress,
    word: VocabularyWord,
    userInfo: UserInfo
  ): ReadingProgress {
    const updatedProgress = { ...progress };
    
    if (userInfo.nativeLanguage === 'en' && updatedProgress.nativeProgress) {
      // For native speakers, track complex vocabulary
      if (word.difficulty === 'hard' || word.difficulty === 'expert') {
        if (!updatedProgress.nativeProgress.complexWordsEncountered.includes(word.word)) {
          updatedProgress.nativeProgress.complexWordsEncountered.push(word.word);
          updatedProgress.nativeProgress.vocabularyGrowth++;
        }
      }
    } else if (updatedProgress.eslProgress) {
      // For ESL learners, track all vocabulary
      if (!updatedProgress.eslProgress.wordsLearned.includes(word.word)) {
        updatedProgress.eslProgress.wordsLearned.push(word.word);
        updatedProgress.eslProgress.englishVocabularySize++;
      }
      
      // Track words that need more practice
      if (word.masteryLevel < 70 && !updatedProgress.eslProgress.wordsNeedingPractice.includes(word.word)) {
        updatedProgress.eslProgress.wordsNeedingPractice.push(word.word);
      }
    }
    
    return updatedProgress;
  }
  
  static generatePersonalizedRecommendations(progress: ReadingProgress, userInfo: UserInfo): string[] {
    const recommendations: string[] = [];
    
    if (userInfo.nativeLanguage === 'en' && progress.nativeProgress) {
      // Recommendations for native speakers
      if (progress.readingSpeed < 100) {
        recommendations.push("Try reading shorter stories to build speed and confidence");
      }
      if (progress.nativeProgress.vocabularyGrowth < 5) {
        recommendations.push("Challenge yourself with slightly harder stories to expand vocabulary");
      }
      if (progress.totalReadingTime < 600) { // less than 10 minutes
        recommendations.push("Try reading for a bit longer each day to improve fluency");
      }
    } else if (progress.eslProgress) {
      // Recommendations for ESL learners
      if (progress.eslProgress.englishVocabularySize < 20) {
        recommendations.push("Focus on easier stories to build your English vocabulary foundation");
      }
      if (progress.eslProgress.translationsRequested > progress.eslProgress.englishVocabularySize * 0.8) {
        recommendations.push("Try to guess word meanings before using translations");
      }
      if (progress.eslProgress.confidenceLevel < 5) {
        recommendations.push("Don't worry about understanding every word - focus on the story!");
      }
    }
    
    // Universal recommendations
    if (progress.currentStreak === 0) {
      recommendations.push("Start a reading streak by reading a little bit each day");
    }
    if (progress.storiesCompleted > 10) {
      recommendations.push("Great job! You're becoming a strong reader");
    }
    
    return recommendations;
  }
  
  private static generateWeeklyGoals(userInfo: UserInfo): WeeklyGoal[] {
    const currentWeek = this.getCurrentWeek();
    
    const goals: WeeklyGoal[] = [
      {
        week: currentWeek,
        type: 'stories_completed',
        target: userInfo.nativeLanguage === 'en' ? 7 : 5, // Adjust for ESL learners
        current: 0,
        completed: false
      },
      {
        week: currentWeek,
        type: 'reading_time',
        target: userInfo.nativeLanguage === 'en' ? 1800 : 1200, // 30 min vs 20 min
        current: 0,
        completed: false
      }
    ];
    
    if (userInfo.nativeLanguage !== 'en') {
      goals.push({
        week: currentWeek,
        type: 'vocabulary_learned',
        target: 10,
        current: 0,
        completed: false
      });
    }
    
    return goals;
  }
  
  private static updateWeeklyGoals(goals: WeeklyGoal[], sessionData: any): WeeklyGoal[] {
    const currentWeek = this.getCurrentWeek();
    
    return goals.map(goal => {
      if (goal.week === currentWeek) {
        switch (goal.type) {
          case 'stories_completed':
            goal.current += sessionData.storiesCompleted;
            break;
          case 'reading_time':
            goal.current += sessionData.timeSpent;
            break;
        }
        goal.completed = goal.current >= goal.target;
      }
      return goal;
    });
  }
  
  private static checkForAchievements(progress: ReadingProgress): Achievement[] {
    const newAchievements: Achievement[] = [];
    const existingTypes = progress.achievements.map(a => a.type);
    
    // First story achievement
    if (progress.storiesCompleted === 1 && !existingTypes.includes('reading')) {
      newAchievements.push({
        id: 'first_story',
        title: 'First Story Complete!',
        description: 'You completed your very first story',
        type: 'reading',
        earnedDate: new Date(),
        icon: '📚'
      });
    }
    
    // Reading streak achievements
    if (progress.currentStreak === 7 && !progress.achievements.find(a => a.id === 'week_streak')) {
      newAchievements.push({
        id: 'week_streak',
        title: 'Week Reader',
        description: '7 days of reading in a row!',
        type: 'streak',
        earnedDate: new Date(),
        icon: '🔥'
      });
    }
    
    // Vocabulary achievements for ESL learners
    if (progress.eslProgress && progress.eslProgress.englishVocabularySize >= 50 && !progress.achievements.find(a => a.id === 'vocab_50')) {
      newAchievements.push({
        id: 'vocab_50',
        title: 'Word Collector',
        description: 'Learned 50 English words!',
        type: 'vocabulary',
        earnedDate: new Date(),
        icon: '📖'
      });
    }
    
    return newAchievements;
  }
  
  private static getCurrentWeek(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }
  
  private static generateUserId(userInfo: UserInfo): string {
    return `user_${userInfo.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }
  
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
  
  static saveProgress(progress: ReadingProgress): void {
    // Session-only storage - no persistence between sessions until user creates profile
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }
  
  static loadProgress(): ReadingProgress | null {
    // Only load from current session, not persistent storage
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error loading progress:', error);
        return null;
      }
    }
    return null;
  }
  
  static clearProgress(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}