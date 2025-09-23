/**
 * Prompt Flow Debugger Service
 * Tracks and logs prompt flow from frontend through backend to Runware
 */

import { ProductionLogging } from '@/services/ProductionLogger';
import { DebugLogger } from '@/services/DebugLogger';

interface PromptFlowEntry {
  id: string;
  timestamp: number;
  stage: 'frontend' | 'ai-scene-creator' | 'orchestrator' | 'runware';
  sessionId: string;
  pageNumber: number;
  prompt: string;
  metadata?: any;
}

export class PromptFlowDebugger {
  private static entries: Map<string, PromptFlowEntry[]> = new Map();
  private static readonly MAX_ENTRIES_PER_SESSION = 50;

  /**
   * Log a prompt flow stage
   */
  static logPromptStage(
    sessionId: string,
    pageNumber: number,
    stage: PromptFlowEntry['stage'],
    prompt: string,
    metadata?: any
  ): void {
    const id = `${sessionId}-${pageNumber}`;
    const entry: PromptFlowEntry = {
      id,
      timestamp: Date.now(),
      stage,
      sessionId,
      pageNumber,
      prompt: prompt.substring(0, 500), // Truncate for debugging
      metadata
    };

    if (!this.entries.has(id)) {
      this.entries.set(id, []);
    }

    const stageEntries = this.entries.get(id)!;
    stageEntries.push(entry);

    // Limit entries per session
    if (stageEntries.length > this.MAX_ENTRIES_PER_SESSION) {
      stageEntries.shift();
    }

    // Log to console for immediate debugging
    DebugLogger.log('story', `${stage.toUpperCase()}`, {
      sessionId,
      pageNumber,
      promptPreview: prompt.substring(0, 100) + '...',
      stage,
      metadata
    });
  }

  /**
   * Get complete prompt flow for a session/page
   */
  static getPromptFlow(sessionId: string, pageNumber: number): PromptFlowEntry[] {
    const id = `${sessionId}-${pageNumber}`;
    return this.entries.get(id) || [];
  }

  /**
   * Compare prompts between stages to detect issues
   */
  static comparePromptStages(sessionId: string, pageNumber: number): {
    isConsistent: boolean;
    stages: string[];
    discrepancies: string[];
  } {
    const flow = this.getPromptFlow(sessionId, pageNumber);
    const stages = flow.map(entry => entry.stage);
    const discrepancies: string[] = [];

    // Check for missing stages
    const expectedStages = ['frontend', 'ai-scene-creator', 'orchestrator', 'runware'];
    const missingStages = expectedStages.filter(stage => !stages.includes(stage as any));
    
    if (missingStages.length > 0) {
      discrepancies.push(`Missing stages: ${missingStages.join(', ')}`);
    }

    // Check for significant prompt differences
    for (let i = 1; i < flow.length; i++) {
      const prev = flow[i - 1];
      const curr = flow[i];
      
      if (prev.prompt && curr.prompt) {
        const similarity = this.calculateStringSimilarity(prev.prompt, curr.prompt);
        if (similarity < 0.3) { // Less than 30% similarity
          discrepancies.push(`Prompt changed significantly between ${prev.stage} and ${curr.stage}`);
        }
      }
    }

    return {
      isConsistent: discrepancies.length === 0,
      stages,
      discrepancies
    };
  }

  /**
   * Calculate string similarity (simple implementation)
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + (str1[i - 1] === str2[j - 1] ? 0 : 1)
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - distance) / maxLen;
  }

  /**
   * Clear entries for a session
   */
  static clearSession(sessionId: string): void {
    const keysToDelete = Array.from(this.entries.keys()).filter(key => key.startsWith(sessionId));
    keysToDelete.forEach(key => this.entries.delete(key));
    
    DebugLogger.log('network', 'Cleared debug entries for session', { sessionId });
  }

  /**
   * Get all sessions with prompt flow data
   */
  static getAllSessions(): string[] {
    const sessions = new Set<string>();
    this.entries.forEach((_, key) => {
      const sessionId = key.split('-')[0];
      sessions.add(sessionId);
    });
    return Array.from(sessions);
  }

  /**
   * Export prompt flow data for debugging
   */
  static exportFlowData(sessionId?: string): any {
    if (sessionId) {
      const sessionEntries = Array.from(this.entries.entries())
        .filter(([key]) => key.startsWith(sessionId))
        .reduce((acc, [key, entries]) => {
          acc[key] = entries;
          return acc;
        }, {} as Record<string, PromptFlowEntry[]>);
      
      return { sessionId, entries: sessionEntries };
    }

    return {
      allSessions: Object.fromEntries(this.entries)
    };
  }
}

// Add global debugging functions for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugPromptFlow = (sessionId: string, pageNumber: number) => {
    const flow = PromptFlowDebugger.getPromptFlow(sessionId, pageNumber);
    const comparison = PromptFlowDebugger.comparePromptStages(sessionId, pageNumber);
    
    DebugLogger.log('network', 'Debug report generated', {
      flow,
      comparison,
      sessionId,
      pageNumber
    });
    
    return { flow, comparison };
  };
  
  (window as any).exportPromptFlowData = (sessionId?: string) => {
    return PromptFlowDebugger.exportFlowData(sessionId);
  };
}