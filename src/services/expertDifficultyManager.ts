// Expert Level 4 Adaptive Difficulty Manager
// Manages 4th-8th grade reading level progression for expert users (11+)

import type { ExpertGradeLevel, UserInfo } from '@/types';
import { SubscriptionManager } from './subscriptionManager';
import { ProgressTrackingService } from './progressTrackingService';

interface ExpertProgressData {
  currentGrade: ExpertGradeLevel;
  successfulSessions: number;
  totalSessions: number;
  comprehensionScores: number[];
  readingSpeed: number;
  lastUpdated: number;
}

export class ExpertDifficultyManager {
  private static readonly STORAGE_KEY = 'expert_difficulty_progress';
  private static readonly PROGRESSION_THRESHOLD = 0.8; // 80% success rate to advance
  private static readonly MIN_SESSIONS_FOR_PROGRESSION = 3;

  /**
   * Get the appropriate expert grade level for a user
   */
  static async getExpertGradeLevel(userInfo: UserInfo): Promise<ExpertGradeLevel> {
    const isPremium = await SubscriptionManager.isPremiumUser();
    
    if (isPremium) {
      return this.getAdaptiveGradeLevel(userInfo);
    } else {
      return this.getRandomGradeLevel();
    }
  }

  /**
   * Premium users get adaptive progression based on performance
   */
  private static getAdaptiveGradeLevel(userInfo: UserInfo): ExpertGradeLevel {
    const userId = userInfo.name || 'guest';
    const progressData = this.getStoredProgress(userId);
    
    if (!progressData) {
      // Start new users at 4th grade level
      const initialGrade: ExpertGradeLevel = '4th';
      this.storeProgress(userId, {
        currentGrade: initialGrade,
        successfulSessions: 0,
        totalSessions: 0,
        comprehensionScores: [],
        readingSpeed: 0,
        lastUpdated: Date.now()
      });
      
      console.log(`📚 ExpertDifficultyManager: Starting ${userId} at ${initialGrade} grade level`);
      return initialGrade;
    }
    
    // Check if user should progress to next grade level
    const shouldProgress = this.shouldProgressToNextLevel(progressData);
    if (shouldProgress) {
      const nextGrade = this.getNextGradeLevel(progressData.currentGrade);
      if (nextGrade) {
        progressData.currentGrade = nextGrade;
        progressData.successfulSessions = 0; // Reset for new level
        progressData.totalSessions = 0;
        this.storeProgress(userId, progressData);
        
        console.log(`📈 ExpertDifficultyManager: ${userId} progressed to ${nextGrade} grade level`);
        return nextGrade;
      }
    }
    
    console.log(`📚 ExpertDifficultyManager: ${userId} continuing at ${progressData.currentGrade} grade level`);
    return progressData.currentGrade;
  }

  /**
   * Free users get random grade level selection
   */
  private static getRandomGradeLevel(): ExpertGradeLevel {
    const gradeLevels: ExpertGradeLevel[] = ['4th', '5th', '6th', '7th', '8th'];
    const randomIndex = Math.floor(Math.random() * gradeLevels.length);
    const selectedGrade = gradeLevels[randomIndex];
    
    console.log(`🎲 ExpertDifficultyManager: Random selection - ${selectedGrade} grade level`);
    return selectedGrade;
  }

  /**
   * Update user progress after a reading session
   */
  static updateProgress(
    userInfo: UserInfo, 
    gradeLevel: ExpertGradeLevel,
    sessionData: {
      comprehensionScore?: number;
      readingSpeed?: number;
      completed: boolean;
    }
  ): void {
    const userId = userInfo.name || 'guest';
    const progressData = this.getStoredProgress(userId) || {
      currentGrade: gradeLevel,
      successfulSessions: 0,
      totalSessions: 0,
      comprehensionScores: [],
      readingSpeed: 0,
      lastUpdated: Date.now()
    };
    
    progressData.totalSessions++;
    
    if (sessionData.completed) {
      progressData.successfulSessions++;
    }
    
    if (sessionData.comprehensionScore) {
      progressData.comprehensionScores.push(sessionData.comprehensionScore);
      // Keep only last 10 scores
      if (progressData.comprehensionScores.length > 10) {
        progressData.comprehensionScores = progressData.comprehensionScores.slice(-10);
      }
    }
    
    if (sessionData.readingSpeed) {
      progressData.readingSpeed = sessionData.readingSpeed;
    }
    
    progressData.lastUpdated = Date.now();
    this.storeProgress(userId, progressData);
    
    console.log(`📊 ExpertDifficultyManager: Updated progress for ${userId}:`, {
      grade: progressData.currentGrade,
      successful: progressData.successfulSessions,
      total: progressData.totalSessions,
      successRate: progressData.totalSessions > 0 ? progressData.successfulSessions / progressData.totalSessions : 0
    });
  }

  /**
   * Check if user should progress to next grade level
   */
  private static shouldProgressToNextLevel(progressData: ExpertProgressData): boolean {
    if (progressData.totalSessions < this.MIN_SESSIONS_FOR_PROGRESSION) {
      return false;
    }
    
    const successRate = progressData.successfulSessions / progressData.totalSessions;
    const averageComprehension = progressData.comprehensionScores.length > 0 
      ? progressData.comprehensionScores.reduce((a, b) => a + b, 0) / progressData.comprehensionScores.length 
      : 0;
    
    // Progress if high success rate and good comprehension
    return successRate >= this.PROGRESSION_THRESHOLD && averageComprehension >= 75;
  }

  /**
   * Get the next grade level in progression
   */
  private static getNextGradeLevel(currentGrade: ExpertGradeLevel): ExpertGradeLevel | null {
    const progression: Record<ExpertGradeLevel, ExpertGradeLevel | null> = {
      '4th': '5th',
      '5th': '6th',
      '6th': '7th',
      '7th': '8th',
      '8th': null // Already at highest level
    };
    
    return progression[currentGrade];
  }

  /**
   * Get stored progress data for a user
   */
  private static getStoredProgress(userId: string): ExpertProgressData | null {
    try {
      const stored = sessionStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('⚠️ ExpertDifficultyManager: Failed to load stored progress:', error);
    }
    return null;
  }

  /**
   * Store progress data for a user
   */
  private static storeProgress(userId: string, progressData: ExpertProgressData): void {
    try {
      sessionStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(progressData));
    } catch (error) {
      console.warn('⚠️ ExpertDifficultyManager: Failed to store progress:', error);
    }
  }

  /**
   * Get current grade level without progression logic (for display)
   */
  static getCurrentGradeLevel(userInfo: UserInfo): ExpertGradeLevel {
    const userId = userInfo.name || 'guest';
    const progressData = this.getStoredProgress(userId);
    return progressData?.currentGrade || '4th';
  }

  /**
   * Reset user progress (for testing or user request)
   */
  static resetProgress(userInfo: UserInfo): void {
    const userId = userInfo.name || 'guest';
    sessionStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
    console.log(`🔄 ExpertDifficultyManager: Reset progress for ${userId}`);
  }

  /**
   * Debug current expert difficulty state
   */
  static debugExpertState(userInfo: UserInfo): void {
    const userId = userInfo.name || 'guest';
    const progressData = this.getStoredProgress(userId);
    
    console.log('🔍 ExpertDifficultyManager: === EXPERT DEBUG ===');
    console.log('👤 User:', userId);
    console.log('📊 Progress Data:', progressData);
    if (progressData) {
      console.log('📈 Success Rate:', progressData.totalSessions > 0 ? 
        (progressData.successfulSessions / progressData.totalSessions * 100).toFixed(1) + '%' : 'N/A');
      console.log('🧠 Avg Comprehension:', progressData.comprehensionScores.length > 0 ?
        (progressData.comprehensionScores.reduce((a, b) => a + b, 0) / progressData.comprehensionScores.length).toFixed(1) + '%' : 'N/A');
    }
    console.log('🔍 ExpertDifficultyManager: === END DEBUG ===');
  }
}
