/**
 * Nuclear Session Manager - Maximum Reliability for Arc Sessions
 * localStorage backup, memory management, and failsafe operations
 */

// Session state with nuclear resilience
interface NuclearSessionState {
  sessionId: string;
  userId?: string;
  arcHistory: Array<{
    arcNumber: number;
    completedAt: number;
    environmentalState: Record<string, any>;
    swappableElements: Record<string, any>;
  }>;
  currentArc: {
    arcNumber: number;
    sceneIndex: number;
    environmentalState: Record<string, any>;
    swappableElements: Record<string, any>;
  };
  templateLevel: string;
  lastActivity: number;
  backupVersion: number;
}

// Nuclear session cache with automatic cleanup
const nuclearSessionCache = new Map<string, NuclearSessionState>();
const sessionBackupQueue = new Map<string, NuclearSessionState>();

// Configuration
const NUCLEAR_SESSION_CONFIG = {
  maxSessions: 100,
  maxArcHistory: 2, // Reduced from 3 for memory efficiency
  inactivityTimeout: 1800000, // 30 minutes
  backupInterval: 30000, // 30 seconds
  compressionThreshold: 10000 // Characters
};

/**
 * localStorage Backup System
 */
class LocalStorageBackup {
  private static getBackupKey(sessionId: string): string {
    return `nuclear_session_${sessionId}`;
  }
  
  static saveToLocalStorage(sessionState: NuclearSessionState): boolean {
    try {
      const backupKey = this.getBackupKey(sessionState.sessionId);
      const compressed = this.compressSessionState(sessionState);
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(backupKey, JSON.stringify(compressed));
        console.log(`💾 Session ${sessionState.sessionId} backed up to localStorage`);
        return true;
      }
    } catch (error) {
      console.warn(`⚠️ localStorage backup failed for ${sessionState.sessionId}:`, error);
    }
    return false;
  }
  
  static loadFromLocalStorage(sessionId: string): NuclearSessionState | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const backupKey = this.getBackupKey(sessionId);
        const stored = localStorage.getItem(backupKey);
        
        if (stored) {
          const compressed = JSON.parse(stored);
          const restored = this.decompressSessionState(compressed);
          console.log(`📥 Session ${sessionId} restored from localStorage`);
          return restored;
        }
      }
    } catch (error) {
      console.warn(`⚠️ localStorage restore failed for ${sessionId}:`, error);
    }
    return null;
  }
  
  static clearBackup(sessionId: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const backupKey = this.getBackupKey(sessionId);
        localStorage.removeItem(backupKey);
        console.log(`🗑️ Backup cleared for session ${sessionId}`);
      }
    } catch (error) {
      console.warn(`⚠️ Backup clear failed for ${sessionId}:`, error);
    }
  }
  
  private static compressSessionState(state: NuclearSessionState): any {
    // Simple compression - remove verbose data, keep essentials
    return {
      id: state.sessionId,
      uid: state.userId,
      ah: state.arcHistory.slice(-NUCLEAR_SESSION_CONFIG.maxArcHistory), // Keep only recent history
      ca: state.currentArc,
      tl: state.templateLevel,
      la: state.lastActivity,
      bv: state.backupVersion
    };
  }
  
  private static decompressSessionState(compressed: any): NuclearSessionState {
    return {
      sessionId: compressed.id,
      userId: compressed.uid,
      arcHistory: compressed.ah || [],
      currentArc: compressed.ca || { arcNumber: 0, sceneIndex: 0, environmentalState: {}, swappableElements: {} },
      templateLevel: compressed.tl || 'level1',
      lastActivity: compressed.la || Date.now(),
      backupVersion: compressed.bv || 1
    };
  }
}

/**
 * Get or create nuclear session with automatic backup
 */
export function getNuclearSession(sessionId: string, templateLevel: string = 'level1'): NuclearSessionState {
  // Stage 1: Check memory cache
  if (nuclearSessionCache.has(sessionId)) {
    const session = nuclearSessionCache.get(sessionId)!;
    session.lastActivity = Date.now();
    return session;
  }
  
  // Stage 2: Check localStorage backup
  const backupSession = LocalStorageBackup.loadFromLocalStorage(sessionId);
  if (backupSession) {
    backupSession.lastActivity = Date.now();
    nuclearSessionCache.set(sessionId, backupSession);
    return backupSession;
  }
  
  // Stage 3: Create new nuclear session
  const newSession: NuclearSessionState = {
    sessionId,
    arcHistory: [],
    currentArc: {
      arcNumber: 0,
      sceneIndex: 0,
      environmentalState: {},
      swappableElements: {}
    },
    templateLevel,
    lastActivity: Date.now(),
    backupVersion: 1
  };
  
  nuclearSessionCache.set(sessionId, newSession);
  LocalStorageBackup.saveToLocalStorage(newSession);
  
  console.log(`🆕 Created nuclear session: ${sessionId}`);
  return newSession;
}

/**
 * Update nuclear session with automatic versioning and backup
 */
export function updateNuclearSession(sessionId: string, updates: Partial<NuclearSessionState>): NuclearSessionState {
  const session = getNuclearSession(sessionId);
  
  // Apply updates
  Object.assign(session, updates);
  session.lastActivity = Date.now();
  session.backupVersion++;
  
  // Optimize arc history (keep only recent arcs)
  if (session.arcHistory.length > NUCLEAR_SESSION_CONFIG.maxArcHistory) {
    session.arcHistory = session.arcHistory.slice(-NUCLEAR_SESSION_CONFIG.maxArcHistory);
  }
  
  // Update cache and backup
  nuclearSessionCache.set(sessionId, session);
  sessionBackupQueue.set(sessionId, { ...session });
  
  return session;
}

/**
 * Complete arc with nuclear history management
 */
export function completeNuclearArc(sessionId: string, arcData: any): NuclearSessionState {
  const session = getNuclearSession(sessionId);
  
  // Add to history with space optimization
  const arcRecord = {
    arcNumber: session.currentArc.arcNumber,
    completedAt: Date.now(),
    environmentalState: { ...session.currentArc.environmentalState },
    swappableElements: { ...session.currentArc.swappableElements }
  };
  
  session.arcHistory.push(arcRecord);
  
  // Advance to next arc
  session.currentArc = {
    arcNumber: session.currentArc.arcNumber + 1,
    sceneIndex: 0,
    environmentalState: arcRecord.environmentalState, // Carry forward environment
    swappableElements: {} // Reset swappable elements for variety
  };
  
  return updateNuclearSession(sessionId, session);
}

/**
 * Memory pressure detection and cleanup
 */
export function performNuclearCleanup(): void {
  const now = Date.now();
  let cleanedSessions = 0;
  
  // Clean inactive sessions
  for (const [sessionId, session] of nuclearSessionCache.entries()) {
    const inactive = now - session.lastActivity > NUCLEAR_SESSION_CONFIG.inactivityTimeout;
    
    if (inactive) {
      nuclearSessionCache.delete(sessionId);
      sessionBackupQueue.delete(sessionId);
      LocalStorageBackup.clearBackup(sessionId);
      cleanedSessions++;
    }
  }
  
  // Enforce cache size limits
  if (nuclearSessionCache.size > NUCLEAR_SESSION_CONFIG.maxSessions) {
    const entries = Array.from(nuclearSessionCache.entries());
    const sortedByActivity = entries.sort(([, a], [, b]) => a.lastActivity - b.lastActivity);
    const toRemove = sortedByActivity.slice(0, nuclearSessionCache.size - NUCLEAR_SESSION_CONFIG.maxSessions);
    
    for (const [sessionId] of toRemove) {
      nuclearSessionCache.delete(sessionId);
      sessionBackupQueue.delete(sessionId);
      LocalStorageBackup.clearBackup(sessionId);
      cleanedSessions++;
    }
  }
  
  if (cleanedSessions > 0) {
    console.log(`🧹 Nuclear cleanup: Removed ${cleanedSessions} inactive sessions`);
  }
}

/**
 * Batch backup processing
 */
function processBatchBackups(): void {
  const backupCount = sessionBackupQueue.size;
  
  if (backupCount > 0) {
    for (const [sessionId, session] of sessionBackupQueue.entries()) {
      LocalStorageBackup.saveToLocalStorage(session);
      sessionBackupQueue.delete(sessionId);
    }
    
    console.log(`💾 Processed ${backupCount} session backups`);
  }
}

/**
 * Clear nuclear session with proper cleanup
 */
export function clearNuclearSession(sessionId: string): void {
  nuclearSessionCache.delete(sessionId);
  sessionBackupQueue.delete(sessionId);
  LocalStorageBackup.clearBackup(sessionId);
  console.log(`🗑️ Nuclear session cleared: ${sessionId}`);
}

/**
 * Get nuclear system health metrics
 */
export function getNuclearSystemHealth(): {
  activeSessions: number;
  backupQueueSize: number;
  memoryPressure: 'low' | 'medium' | 'high';
  oldestSession: number;
} {
  const now = Date.now();
  let oldestActivity = now;
  
  for (const session of nuclearSessionCache.values()) {
    if (session.lastActivity < oldestActivity) {
      oldestActivity = session.lastActivity;
    }
  }
  
  const memoryPressure = nuclearSessionCache.size > 75 ? 'high' : 
                        nuclearSessionCache.size > 50 ? 'medium' : 'low';
  
  return {
    activeSessions: nuclearSessionCache.size,
    backupQueueSize: sessionBackupQueue.size,
    memoryPressure,
    oldestSession: now - oldestActivity
  };
}

/**
 * Initialize nuclear session system
 */
export function initializeNuclearSessionSystem(): void {
  console.log('🚀 Initializing Nuclear Session System...');
  
  // Set up periodic cleanup
  setInterval(performNuclearCleanup, 300000); // Every 5 minutes
  
  // Set up batch backup processing
  setInterval(processBatchBackups, NUCLEAR_SESSION_CONFIG.backupInterval);
  
  console.log('✅ Nuclear Session System initialized');
}
