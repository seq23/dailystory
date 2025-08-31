// Story Session Cache - Persistent storage for story content across navigation
import { DifficultyLevel } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface CachedStorySession {
  id: string;
  userId: string;
  difficulty: DifficultyLevel;
  pages: string[];
  images: Array<{url?: string; prompt: string}>;
  currentPage: number;
  timestamp: number;
  isComplete: boolean;
  characterSessionId?: string; // Link to character state
  sessionType?: 'new' | 'continuation' | 'rewrite';
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

  private static getCacheKey(userId: string, avatarType?: string): string {
    // Avatar-aware cache keys for guest users to prevent cross-session contamination
    if (userId === 'guest' && avatarType) {
      const normalizedAvatar = avatarType === 'prefer-not-to-answer' ? 'neutral' : avatarType;
      return `${CACHE_KEY_PREFIX}${userId}_${normalizedAvatar}`;
    }
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
    metadata: Partial<CachedStorySession['metadata']> = {},
    characterSessionId?: string,
    sessionType?: 'new' | 'continuation' | 'rewrite',
    avatarType?: string
  ): string {
    const sessionId = this.generateSessionId(userId, difficulty);
    const cacheKey = this.getCacheKey(userId, avatarType);
    
    const session: CachedStorySession = {
      id: sessionId,
      userId,
      difficulty,
      pages,
      images,
      currentPage,
      timestamp: Date.now(),
      isComplete: false,
      characterSessionId,
      sessionType,
      metadata: {
        wordCount: (pages || []).join(' ').split(' ').length,
        sessionStartTime: Date.now(),
        timeSpent: 0,
        isPremium: false,
        ...metadata
      }
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(session));
      const avatarInfo = avatarType ? ` (avatar: ${avatarType})` : '';
      console.log(`📚 Story session cached for user ${userId} with difficulty ${difficulty}${avatarInfo}`);
      return sessionId;
    } catch (error) {
      console.warn('Failed to cache story session:', error);
      return sessionId;
    }
  }

  /**
   * Retrieve cached story session
   */
  static getCachedStorySession(userId: string, avatarType?: string): CachedStorySession | null {
    const cacheKey = this.getCacheKey(userId, avatarType);
    
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;

      const session: CachedStorySession = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - session.timestamp > CACHE_DURATION) {
        this.clearCachedSession(userId, true, avatarType);
        return null;
      }

      const avatarInfo = avatarType ? ` (avatar: ${avatarType})` : '';
      console.log(`📖 Retrieved cached story session for user ${userId}${avatarInfo}`);
      return session;
    } catch (error) {
      console.warn('Failed to retrieve cached story session:', error);
      return null;
    }
  }

  /**
   * Update current page in cached session
   */
  static updateCurrentPage(userId: string, currentPage: number, avatarType?: string): void {
    const session = this.getCachedStorySession(userId, avatarType);
    if (!session) return;

    session.currentPage = currentPage;
    session.timestamp = Date.now(); // Update timestamp

    try {
      const cacheKey = this.getCacheKey(userId, avatarType);
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
    metadata: Partial<CachedStorySession['metadata']>,
    avatarType?: string
  ): void {
    const session = this.getCachedStorySession(userId, avatarType);
    if (!session) return;

    session.metadata = { ...session.metadata, ...metadata };
    session.timestamp = Date.now();

    try {
      const cacheKey = this.getCacheKey(userId, avatarType);
      sessionStorage.setItem(cacheKey, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to update session metadata:', error);
    }
  }

  /**
   * Update pages (and optionally currentPage) in cached session
   */
  static updatePages(
    userId: string,
    pages: string[],
    currentPage?: number,
    images: Array<{url?: string; prompt: string}> = [],
    avatarType?: string
  ): void {
    const cacheKey = this.getCacheKey(userId, avatarType);
    try {
      const existing = this.getCachedStorySession(userId, avatarType);
      const session: CachedStorySession = existing ? {
        ...existing,
        pages,
        images: images.length ? images : existing.images,
        currentPage: typeof currentPage === 'number' ? currentPage : existing.currentPage,
        metadata: {
          ...existing.metadata,
          wordCount: (pages || []).join(' ').split(' ').length,
        },
        timestamp: Date.now(),
      } : {
        id: this.generateSessionId(userId, 'beginner' as any),
        userId,
        difficulty: 'beginner' as any,
        pages,
        images,
        currentPage: currentPage || 0,
        timestamp: Date.now(),
        isComplete: false,
        metadata: { wordCount: (pages || []).join(' ').split(' ').length, sessionStartTime: Date.now(), timeSpent: 0, isPremium: false }
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to update pages in cache:', error);
    }
  }

  /**
   * Mark session as complete
   */
  static async markSessionComplete(userId: string, avatarType?: string): Promise<void> {
    const session = this.getCachedStorySession(userId, avatarType);
    if (!session) return;

    session.isComplete = true;
    session.timestamp = Date.now();

    try {
      const cacheKey = this.getCacheKey(userId, avatarType);
      sessionStorage.setItem(cacheKey, JSON.stringify(session));
      
      // Phase 2: Post-completion caching - cache all images with story hash
      if (session.images && session.pages) {
        const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
        const storyHash = btoa(session.pages.join('|')).slice(0, 16);
        session.images.forEach((img, idx) => {
          if (img.url) {
            EnhancedImageCache.cacheImage(img.prompt, img.url, userId, idx, storyHash);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to mark session as complete:', error);
    }
  }

  /**
   * Clear story content only while preserving avatar identity (for premium rewrites)
   */
  static async clearStoryContentKeepAvatar(userId: string, avatarType?: string): Promise<void> {
    const session = this.getCachedStorySession(userId, avatarType);
    if (!session) return;

    // Preserve avatar identity data
    const preservedAvatarData = {
      avatarType: session.metadata.isPremium ? avatarType : undefined,
      characterSessionId: session.characterSessionId, // Keep character session for avatar consistency
    };

    // Clear story content but keep avatar metadata
    const clearedSession: CachedStorySession = {
      ...session,
      pages: [],
      images: [],
      currentPage: 0,
      timestamp: Date.now(),
      isComplete: false,
      sessionType: 'rewrite',
      metadata: {
        ...session.metadata,
        wordCount: 0,
        timeSpent: 0,
        sessionStartTime: Date.now(),
      }
    };

    try {
      const cacheKey = this.getCacheKey(userId, avatarType);
      sessionStorage.setItem(cacheKey, JSON.stringify(clearedSession));
      console.log(`🎭 Cleared story content, preserved avatar identity for user ${userId}`);
    } catch (error) {
      console.warn('Failed to clear story content only:', error);
    }
  }

  /**
   * Clear cached session for user with context-aware behavior
   */
  static async clearCachedSession(userId: string, clearCharacterState: boolean = true, avatarType?: string, context: 'session-end' | 'rewrite' | 'next-story' | 'avatar-change' = 'session-end'): Promise<void> {
    // For guest users, clear all 3 possible avatar cache variants to ensure clean separation
    if (userId === 'guest') {
      const avatarTypes = ['boy', 'girl', 'neutral'];
      for (const avatar of avatarTypes) {
        const cacheKey = this.getCacheKey(userId, avatar);
        try {
          sessionStorage.removeItem(cacheKey);
          console.log(`🗑️ Cleared cached story session for user ${userId} (avatar: ${avatar})`);
        } catch (error) {
          console.warn(`Failed to clear ${avatar} cache:`, error);
        }
      }
    } else {
      const cacheKey = this.getCacheKey(userId, avatarType);
      try {
        sessionStorage.removeItem(cacheKey);
        console.log(`🗑️ Cleared cached story session for user ${userId}`);
      } catch (error) {
        console.warn('Failed to clear cache:', error);
      }
    }
    
    // Get characterSessionId before clearing if we need to clear character state
    let characterSessionId: string | undefined;
    if (clearCharacterState) {
      const session = this.getCachedStorySession(userId, avatarType);
      characterSessionId = session?.characterSessionId;
    }
    
    // Clear character state if requested and we have a characterSessionId
    if (clearCharacterState && characterSessionId) {
      try {
        const { StoryVisualStateManager } = await import('@/services/storyVisualState');
        StoryVisualStateManager.clearStoryState(characterSessionId);
        console.log(`🎭 Cleared character state for session: ${characterSessionId}`);
      } catch (error) {
        console.warn('Failed to clear character state:', error);
      }

      // Clear character consistency cache through backend
      try {
        await supabase.functions.invoke('get-monitoring-data', {
          body: { action: 'cleanup', userId }
        });
        console.log(`🎭 Cleared character consistency cache for user: ${userId}`);
      } catch (error) {
        console.warn('Failed to clear character consistency cache:', error);
      }
    }
    
    // Comprehensive cache clearing for cross-session contamination prevention
    console.log(`🧹 Comprehensive cache clearing to prevent cross-session contamination`);
    try {
      // Clear any cached generation data that might have stale avatar/pronoun content
      const allKeys = Object.keys(sessionStorage);
      const cacheKeys = allKeys.filter(key => 
        key.includes('generation') || 
        key.includes('story') || 
        key.includes('cache') ||
        key.includes('time2read') ||
        key.includes('guest')
      );
      
      cacheKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`🧹 Cleared cache key: ${key}`);
      });
    } catch (error) {
      console.warn('Failed to clear comprehensive cache:', error);
    }
  }

  /**
   * Check if user has a valid cached session
   */
  static hasCachedSession(userId: string, avatarType?: string): boolean {
    return this.getCachedStorySession(userId, avatarType) !== null;
  }

  /**
   * Get session analytics
   */
  static getSessionAnalytics(userId: string, avatarType?: string): {
    hasCachedSession: boolean;
    sessionAge?: number;
    difficulty?: DifficultyLevel;
    progress?: number;
  } {
    const session = this.getCachedStorySession(userId, avatarType);
    
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