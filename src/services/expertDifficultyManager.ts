// Expert Level 4 Adaptive Difficulty Manager
// Manages 6th-10th grade reading level progression for expert users (11+)

import type { ExpertGradeLevel, UserInfo } from '@/types';

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
    // Check if user is premium (simplified - you may want to integrate proper premium check)
    const isPremium = true; // This should use your actual premium check logic
    
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
    const userId = userInfo.name || 'anonymous';
    let progressData = this.getStoredProgress(userId);
    
    if (!progressData) {
      // Initialize new user at 6th grade
      progressData = {
        currentGradeLevel: '6th',
        sessionsCompleted: 0,
        successfulSessions: 0,
        comprehensionScores: [],
        averageReadingSpeed: 0,
        totalReadingTime: 0,
        lastUpdated: Date.now(),
      };
      this.storeProgress(userId, progressData);
      
      console.log(`📚 ExpertDifficultyManager: Starting ${userId} at 6th grade level`);
      return '6th';
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
    const progression: Record<ExpertGradeLevel, ExpertGradeLevel | null> = {
      '6th': '7th',
      '7th': '8th', 
      '8th': '9th',
      '9th': '10th',
      '10th': null // Already at highest level
    };
    
    return progression[currentGrade];
  }

  /**
   * Free users get random grade level selection
   */
  static getRandomGradeLevel(): ExpertGradeLevel {
    const gradeLevels: ExpertGradeLevel[] = ['6th', '7th', '8th', '9th', '10th'];
    const randomIndex = Math.floor(Math.random() * gradeLevels.length);
    const selectedGrade = gradeLevels[randomIndex];
    
    console.log(`🎲 ExpertDifficultyManager: Random selection - ${selectedGrade} grade level`);
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
            console.log(`🎓 User progressed from ${previousLevel} to ${nextLevel} grade level! (${wpm} WPM, ${pages} pages)`);
            
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
          console.log('🔄 ExpertDifficultyManager: Migrated progress to localStorage for', userId);
        } catch {}
        return data;
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
      const key = `expert_difficulty_progress_${userId}`;
      localStorage.setItem(key, JSON.stringify(progressData));
      try { sessionStorage.removeItem(key); } catch {}
    } catch (error) {
      console.warn('⚠️ ExpertDifficultyManager: Failed to store progress:', error);
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
    console.log(`🔄 ExpertDifficultyManager: Reset progress for ${userId}`);
  }

  /**
   * Debug current expert difficulty state
   */
  static debugExpertState(userInfo: UserInfo): void {
    const userId = userInfo.name || 'anonymous';
    const progressData = this.getStoredProgress(userId);
    
    console.log('🔍 ExpertDifficultyManager: === EXPERT DEBUG ===');
    console.log('👤 User:', userId);
    console.log('📊 Progress Data:', progressData);
    if (progressData) {
      console.log('📈 Success Rate:', progressData.sessionsCompleted > 0 ? 
        (progressData.successfulSessions / progressData.sessionsCompleted * 100).toFixed(1) + '%' : 'N/A');
      console.log('🧠 Avg Reading Speed:', progressData.averageReadingSpeed.toFixed(1) + ' WPM');
    }
    console.log('🔍 ExpertDifficultyManager: === END DEBUG ===');
  }
}