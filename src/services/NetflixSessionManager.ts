/**
 * Netflix Session Manager - Handles session state for Netflix-style story generation
 */

import { generateSessionId } from '@/utils/sessionId';
import { DebugLogger } from '@/services/DebugLogger';

export class NetflixSessionManager {
  private static sessions = new Map<string, {
    baseSessionId: string;
    storyCount: number;
    lastActivity: number;
    userId: string;
  }>();

  /**
   * Get or create a session for a user
   */
  static getOrCreateSession(userId: string): string {
    const existing = this.sessions.get(userId);
    const now = Date.now();

    // If session exists and is recent (within 1 hour), reuse base
    if (existing && (now - existing.lastActivity) < 3600000) {
      existing.storyCount++;
      existing.lastActivity = now;
      
      const sessionId = `netflix-${userId}-story${existing.storyCount}-${existing.baseSessionId}`;
      DebugLogger.log('story', `Reusing session for user ${userId}`, { sessionId, storyCount: existing.storyCount });
      return sessionId;
    }

    // Create new session
    const baseSessionId = generateSessionId();
    const session = {
      baseSessionId,
      storyCount: 1,
      lastActivity: now,
      userId
    };

    this.sessions.set(userId, session);
    const sessionId = `netflix-${userId}-story1-${baseSessionId}`;
    
    DebugLogger.log('story', `Created new session for user ${userId}`, { sessionId });
    return sessionId;
  }

  /**
   * Force fresh session for Netflix "Next Story" - prevents image recycling
   */
  static getNextStorySession(userId: string): string {
    const now = Date.now();
    const baseSessionId = generateSessionId();
    
    const session = {
      baseSessionId,
      storyCount: 1,
      lastActivity: now,
      userId
    };

    this.sessions.set(userId, session);
    const sessionId = `netflix-${userId}-story1-${baseSessionId}`;
    
    DebugLogger.log('story', `Fresh Netflix session for user ${userId}`, { sessionId });
    return sessionId;
  }

  /**
   * Clear session for a user (when they end their reading session)
   */
  static clearSession(userId: string): void {
    this.sessions.delete(userId);
    DebugLogger.log('story', `Cleared session for user ${userId}`);
  }

  /**
   * Get session info for debugging
   */
  static getSessionInfo(userId: string) {
    return this.sessions.get(userId);
  }

  /**
   * Cleanup old sessions (call periodically)
   */
  static cleanup(): void {
    const now = Date.now();
    const oneHour = 3600000;

    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > oneHour) {
        this.sessions.delete(userId);
        DebugLogger.log('performance', `Cleaned up old session for user ${userId}`);
      }
    }
  }
}

// Cleanup every 30 minutes
setInterval(() => {
  NetflixSessionManager.cleanup();
}, 1800000);