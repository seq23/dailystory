// Expert Level 4 Adaptive Difficulty Manager
// Manages 6th-10th grade reading level progression for expert users (11+)

import { DebugLogger } from '@/services/DebugLogger';
import type { ExpertGradeLevel, UserInfo } from '@/types';
import { EXPERT_GRADES, expertGradeForGrade, isExpertGrade } from '@/lib/grades';

interface ExpertProgressData {
  currentGradeLevel: ExpertGradeLevel;
  sessionsCompleted: number;
  successfulSessions: number;
  comprehensionScores: number[]; // Keep for compatibility but not used for progression
  averageReadingSpeed: number;
  totalReadingTime: number;
  lastUpdated: number;
}

export class ExpertDifficultyManager {
  /**
   * Get the appropriate expert grade level for a user
   */
  static async getExpertGradeLevel(userInfo: UserInfo): Promise<ExpertGradeLevel> {
    // A child in 6th–10th grade (or with a chosen expert level) starts at that level.
    const ownGrade = this.startingGradeFor(userInfo);
    // Check premium status server-side
    const { EnhancedSubscriptionManager } = await import('@/services/enhancedSubscriptionManager');
    const isPremium = await EnhancedSubscriptionManager.isPremiumUser().catch(() => false);
    
    if (isPremium) {
      return this.getAdaptiveGradeLevel(userInfo);
    } else {
      return ownGrade ?? this.getRandomGradeLevel();
    }
  }

  /** The child's own expert level: the chosen one, else the one for their school grade. */
  static startingGradeFor(userInfo: UserInfo): ExpertGradeLevel | null {
    if (isExpertGrade(userInfo?.expertGradeLevel)) return userInfo.expertGradeLevel;
    return expertGradeForGrade(userInfo?.grade ?? userInfo?.gradeLevel);
  }

  /**
   * Premium users get adaptive progression based on performance
   */
  private static getAdaptiveGradeLevel(userInfo: UserInfo): ExpertGradeLevel {
    const userId = userInfo.name || 'anonymous';
    let progressData = this.getStoredProgress(userId);
    
    if (!progressData) {
      // Initialize a new user at their own grade's level (7th–10th are not clamped to 6th)
      const start = this.startingGradeFor(userInfo) ?? EXPERT_GRADES[0];
      progressData = {
        currentGradeLevel: start,
        sessionsCompleted: 0,
        successfulSessions: 0,
        comprehensionScores: [],
        averageReadingSpeed: 0,
        totalReadingTime: 0,
        lastUpdated: Date.now(),
      };
      this.storeProgress(userId, progressData);
      
      DebugLogger.log('ui', `Starting ${userId} at ${start} grade level`);
      return start;
    }
    
    return progressData.currentGradeLevel;
  }

  /**
   * Determines if user should progress to next grade level
   * Simplified single-session progression based on current session performance
   */
  private static shouldProgressToNextLevel(progressData: ExpertProgressData): boolean {
    // Single session progression - if they just had a successful session, they can advance
    // The criteria was already checked in updateProgress()
    return progressData.successfulSessions >= 1;
  }

  /**
   * Get the next grade level in sequence
   */
  private static getNextGradeLevel(currentGrade: ExpertGradeLevel): ExpertGradeLevel | null {
    const i = EXPERT_GRADES.indexOf(currentGrade);
    return i >= 0 && i < EXPERT_GRADES.length - 1 ? EXPERT_GRADES[i + 1] : null; // null at 10th
  }

  /**
   * Free users get random grade level selection
   */
  static getRandomGradeLevel(): ExpertGradeLevel {
    const gradeLevels: readonly ExpertGradeLevel[] = EXPERT_GRADES;
    const randomIndex = Math.floor(Math.random() * gradeLevels.length);
    const selectedGrade = gradeLevels[randomIndex];
    
    DebugLogger.log('ui', `Random selection - ${selectedGrade} grade level`);
    return selectedGrade;
  }

  /**
   * Updates a user's progress after a reading session
   */
  static updateProgress(
    userInfo: UserInfo,
    gradeLevel: ExpertGradeLevel,
    sessionData: {
      readingSpeed?: number; // WPM
      pagesCompleted?: number; // Pages read in this session
      completed: boolean;
    }
  ): { progressed: boolean; previousLevel?: ExpertGradeLevel; newLevel?: ExpertGradeLevel; wpm?: number; pages?: number } {
    const userId = userInfo.name || 'anonymous';
    let progressData = this.getStoredProgress(userId);
    
    if (!progressData) {
      progressData = {
        currentGradeLevel: gradeLevel,
        sessionsCompleted: 0,
        successfulSessions: 0,
        comprehensionScores: [], // Keep for compatibility but not used for progression
        averageReadingSpeed: 0,
        totalReadingTime: 0,
        lastUpdated: Date.now(),
      };
    }

    // Update session count
    progressData.sessionsCompleted++;
    progressData.lastUpdated = Date.now();

    // Track reading speed
    if (sessionData.readingSpeed) {
      const totalSpeed = progressData.averageReadingSpeed * (progressData.sessionsCompleted - 1);
      progressData.averageReadingSpeed = (totalSpeed + sessionData.readingSpeed) / progressData.sessionsCompleted;
    }

    // Only evaluate progression if session was completed
    if (sessionData.completed) {
      const wpm = sessionData.readingSpeed || 0;
      const pages = sessionData.pagesCompleted || 0;
      
      // Simplified progression criteria: WPM + pages completed
      // High performer: ≥6 pages + ≥120 WPM OR Standard reader: ≥10 pages + ≥80 WPM
      const meetsProgressionCriteria = 
        (pages >= 6 && wpm >= 120) || (pages >= 10 && wpm >= 80);
      
      if (meetsProgressionCriteria) {
        progressData.successfulSessions++;
        
        // Check if user should progress to next level
        if (this.shouldProgressToNextLevel(progressData)) {
          const nextLevel = this.getNextGradeLevel(progressData.currentGradeLevel);
          if (nextLevel) {
            const previousLevel = progressData.currentGradeLevel;
            progressData.currentGradeLevel = nextLevel;
            DebugLogger.log('ui', `User progressed from ${previousLevel} to ${nextLevel} grade level! (${wpm} WPM, ${pages} pages)`);
            
            this.storeProgress(userId, progressData);
            // Return progression info for toast notification
            return {
              progressed: true,
              previousLevel,
              newLevel: nextLevel,
              wpm,
              pages
            };
          }
        }
      }
    }

    this.storeProgress(userId, progressData);
    return { progressed: false };
  }

  /**
   * Get stored progress data for a user
   */
  private static getStoredProgress(userId: string): ExpertProgressData | null {
    try {
      const key = `expert_difficulty_progress_${userId}`;
      // Prefer persistent storage
      const localStored = localStorage.getItem(key);
      if (localStored) {
        return JSON.parse(localStored);
      }
      // Migrate from sessionStorage if present
      const legacyStored = sessionStorage.getItem(key);
      if (legacyStored) {
        const data = JSON.parse(legacyStored);
        try {
          localStorage.setItem(key, legacyStored);
          sessionStorage.removeItem(key);
          DebugLogger.log('ui', `Migrated progress to localStorage for ${userId}`);
        } catch {}
        return data;
      }
    } catch (error) {
      DebugLogger.warn('ui', 'Failed to load stored progress:', error);
    }
    return null;
  }

  /**
   * Store progress data for a user
   */
  private static storeProgress(userId: string, progressData: ExpertProgressData): void {
    try {
      const key = `expert_difficulty_progress_${userId}`;
      localStorage.setItem(key, JSON.stringify(progressData));
      try { sessionStorage.removeItem(key); } catch {}
    } catch (error) {
      DebugLogger.warn('ui', 'Failed to store progress:', error);
    }
  }

  /**
   * Get current grade level without progression logic (for display)
   */
  static getCurrentGradeLevel(userInfo: UserInfo): ExpertGradeLevel {
    const userId = userInfo.name || 'anonymous';
    const progressData = this.getStoredProgress(userId);
    return progressData?.currentGradeLevel || '6th';
  }

  /**
   * Reset user progress (for testing or user request)
   */
  static resetProgress(userInfo: UserInfo): void {
    const userId = userInfo.name || 'anonymous';
    const key = `expert_difficulty_progress_${userId}`;
    try { localStorage.removeItem(key); } catch {}
    try { sessionStorage.removeItem(key); } catch {}
    DebugLogger.log('ui', `Reset progress for ${userId}`);
  }

  /**
   * Debug current expert difficulty state
   */
  static debugExpertState(userInfo: UserInfo): void {
    const userId = userInfo.name || 'anonymous';
    const progressData = this.getStoredProgress(userId);
    
    DebugLogger.log('ui', '=== EXPERT DEBUG ===');
    DebugLogger.log('ui', `User: ${userId}`);
    DebugLogger.log('ui', `Progress Data: ${JSON.stringify(progressData)}`);
    if (progressData) {
      DebugLogger.log('ui', `Success Rate: ${progressData.sessionsCompleted > 0 ? 
        (progressData.successfulSessions / progressData.sessionsCompleted * 100).toFixed(1) + '%' : 'N/A'}`);
      DebugLogger.log('ui', `Avg Reading Speed: ${progressData.averageReadingSpeed.toFixed(1)} WPM`);
    }
    DebugLogger.log('ui', '=== END DEBUG ===');
  }
}