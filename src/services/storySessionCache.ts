// Story Session Cache - Persistent storage for story content across navigation
import { DifficultyLevel } from '@/types';

interface CachedStorySession {
  id: string;
  userId: string;
  difficulty: DifficultyLevel;
  pages: string[];
  images: Array<{url?: string; prompt: string}>;
  currentPage: number;
  timestamp: number;
  isComplete: boolean;
  metadata: {
    wordCount: number;
    sessionStartTime: number;
    timeSpent: number;
    isPremium: boolean;
  };
}

const CACHE_KEY_PREFIX = 'time2read_story_session_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export class StorySessionCache {
  private static generateSessionId(userId: string, difficulty: DifficultyLevel): string {
    return `${userId}_${difficulty}_${Date.now()}`;
  }

  private static getCacheKey(userId: string): string {
    return `${CACHE_KEY_PREFIX}${userId}`;
  }

  /**
   * Store story session in cache
   */
  static cacheStorySession(
    userId: string,
    difficulty: DifficultyLevel,
    pages: string[],
    images: Array<{url?: string; prompt: string}>,
    currentPage: number = 0,
    metadata: Partial<CachedStorySession['metadata']> = {}
  ): string {
    const sessionId = this.generateSessionId(userId, difficulty);
    const cacheKey = this.getCacheKey(userId);
    
    const session: CachedStorySession = {
      id: sessionId,
      userId,
      difficulty,
      pages,
      images,
      currentPage,
      timestamp: Date.now(),
      isComplete: false,
      metadata: {
        wordCount: pages.join(' ').split(' ').length,
        sessionStartTime: Date.now(),
        timeSpent: 0,
        isPremium: false,
        ...metadata
      }
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(session));
      console.log(`📚 Story session cached for user ${userId} with difficulty ${difficulty}`);
      return sessionId;
    } catch (error) {
      console.warn('Failed to cache story session:', error);
      return sessionId;
    }
  }

  /**
   * Retrieve cached story session
   */
  static getCachedStorySession(userId: string): CachedStorySession | null {
    const cacheKey = this.getCacheKey(userId);
    
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;

      const session: CachedStorySession = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - session.timestamp > CACHE_DURATION) {
        this.clearCachedSession(userId);
        return null;
      }

      console.log(`📖 Retrieved cached story session for user ${userId}`);
      return session;
    } catch (error) {
      console.warn('Failed to retrieve cached story session:', error);
      return null;
    }
  }

  /**
   * Update current page in cached session
   */
  static updateCurrentPage(userId: string, currentPage: number): void {
    const session = this.getCachedStorySession(userId);
    if (!session) return;

    session.currentPage = currentPage;
    session.timestamp = Date.now(); // Update timestamp

    try {
      const cacheKey = this.getCacheKey(userId);
      sessionStorage.setItem(cacheKey, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to update current page in cache:', error);
    }
  }

  /**
   * Update session metadata
   */
  static updateSessionMetadata(
    userId: string, 
    metadata: Partial<CachedStorySession['metadata']>
  ): void {
    const session = this.getCachedStorySession(userId);
    if (!session) return;

    session.metadata = { ...session.metadata, ...metadata };
    session.timestamp = Date.now();

    try {
      const cacheKey = this.getCacheKey(userId);
      sessionStorage.setItem(cacheKey, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to update session metadata:', error);
    }
  }

  /**
   * Mark session as complete
   */
  static markSessionComplete(userId: string): void {
    const session = this.getCachedStorySession(userId);
    if (!session) return;

    session.isComplete = true;
    session.timestamp = Date.now();

    try {
      const cacheKey = this.getCacheKey(userId);
      sessionStorage.setItem(cacheKey, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to mark session as complete:', error);
    }
  }

  /**
   * Clear cached session for user
   */
  static clearCachedSession(userId: string): void {
    const cacheKey = this.getCacheKey(userId);
    
    try {
      sessionStorage.removeItem(cacheKey);
      console.log(`🗑️ Cleared cached story session for user ${userId}`);
    } catch (error) {
      console.warn('Failed to clear cached session:', error);
    }
  }

  /**
   * Check if user has a valid cached session
   */
  static hasCachedSession(userId: string): boolean {
    return this.getCachedStorySession(userId) !== null;
  }

  /**
   * Get session analytics
   */
  static getSessionAnalytics(userId: string): {
    hasCachedSession: boolean;
    sessionAge?: number;
    difficulty?: DifficultyLevel;
    progress?: number;
  } {
    const session = this.getCachedStorySession(userId);
    
    if (!session) {
      return { hasCachedSession: false };
    }

    return {
      hasCachedSession: true,
      sessionAge: Date.now() - session.timestamp,
      difficulty: session.difficulty,
      progress: session.pages.length > 0 ? (session.currentPage + 1) / session.pages.length : 0
    };
  }
}