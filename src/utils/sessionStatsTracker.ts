/**
 * Session Stats Tracker
 * Tracks session start stats for before/after comparison on session end page
 */

export class SessionStatsTracker {
  private static readonly STORAGE_KEY = 'session_start_stats';

  static storeSessionStartStats(userStats: any) {
    try {
      const sessionStartStats = {
        totalWordsRead: userStats.totalWordsRead || 0,
        totalStoriesCompleted: userStats.totalStoriesCompleted || 0,
        totalTimeReading: userStats.totalTimeReading || 0,
        vocabularyWordsLearned: userStats.vocabularyWordsLearned || 0,
        currentLevel: userStats.currentLevel || 1,
        totalPoints: userStats.totalPoints || 0,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionStartStats));
      console.log('📊 Session start stats stored:', sessionStartStats);
    } catch (error) {
      console.warn('Failed to store session start stats:', error);
    }
  }

  static getSessionStartStats(): any | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to retrieve session start stats:', error);
    }
    return null;
  }

  static clearSessionStartStats() {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear session start stats:', error);
    }
  }

  static hasSessionStartStats(): boolean {
    try {
      return sessionStorage.getItem(this.STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }
}