/**
 * Session Achievement Tracker
 * Tracks achievements earned during a reading session for display on session end page
 */

export class SessionAchievementTracker {
  private static sessionAchievements: any[] = [];

  static addAchievement(achievement: any) {
    this.sessionAchievements.push({
      ...achievement,
      timestamp: Date.now()
    });
    
    // Store in sessionStorage for persistence across navigation
    try {
      sessionStorage.setItem('session_achievements', JSON.stringify(this.sessionAchievements));
    } catch (error) {
      console.warn('Failed to store session achievements:', error);
    }
  }

  static getSessionAchievements(): any[] {
    try {
      const stored = sessionStorage.getItem('session_achievements');
      if (stored) {
        this.sessionAchievements = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to retrieve session achievements:', error);
    }
    
    return [...this.sessionAchievements];
  }

  static clearSessionAchievements() {
    this.sessionAchievements = [];
    try {
      sessionStorage.removeItem('session_achievements');
    } catch (error) {
      console.warn('Failed to clear session achievements:', error);
    }
  }

  static getAchievementCount(): number {
    return this.sessionAchievements.length;
  }
}