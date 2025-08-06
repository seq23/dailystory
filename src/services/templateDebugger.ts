// Template Debugger - Debug which managers are being called and track template usage
import { DifficultyLevel } from '@/types';
import { MobileSessionManager } from './mobileSessionManager';

interface TemplateUsageEntry {
  timestamp: number;
  manager: string;
  difficulty: DifficultyLevel;
  templateIndex: number;
  templatePreview: string;
  userName?: string;
  phase?: string;
}

export class TemplateDebugger {
  private static readonly STORAGE_KEY = 'template_debug_log';
  private static readonly MAX_ENTRIES = 100;

  /**
   * Log template usage for debugging
   */
  static logTemplateUsage(entry: Omit<TemplateUsageEntry, 'timestamp'>) {
    const fullEntry: TemplateUsageEntry = {
      ...entry,
      timestamp: Date.now()
    };

    console.log('🔍 TemplateDebugger: Logging usage:', fullEntry);

    try {
      const existingLog = this.getUsageLog();
      const updatedLog = [fullEntry, ...existingLog].slice(0, this.MAX_ENTRIES);
      
      MobileSessionManager.setItem(this.STORAGE_KEY, JSON.stringify(updatedLog));
    } catch (error) {
      console.warn('⚠️ TemplateDebugger: Failed to log usage:', error);
    }
  }

  /**
   * Get the current usage log
   */
  static getUsageLog(): TemplateUsageEntry[] {
    try {
      const logData = MobileSessionManager.getItem(this.STORAGE_KEY);
      return logData ? JSON.parse(logData) : [];
    } catch (error) {
      console.warn('⚠️ TemplateDebugger: Failed to read usage log:', error);
      return [];
    }
  }

  /**
   * Get usage statistics
   */
  static getUsageStats(): {
    totalUsages: number;
    managerBreakdown: Record<string, number>;
    difficultyBreakdown: Record<DifficultyLevel, number>;
    recentTemplates: TemplateUsageEntry[];
    repetitionDetected: boolean;
  } {
    const log = this.getUsageLog();
    
    const managerBreakdown: Record<string, number> = {};
    const difficultyBreakdown: Record<DifficultyLevel, number> = {
      beginner: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0
    };

    log.forEach(entry => {
      managerBreakdown[entry.manager] = (managerBreakdown[entry.manager] || 0) + 1;
      difficultyBreakdown[entry.difficulty]++;
    });

    // Check for repetition in last 5 templates
    const recent5 = log.slice(0, 5);
    const templatePreviews = recent5.map(e => e.templatePreview);
    const uniquePreviews = new Set(templatePreviews);
    const repetitionDetected = uniquePreviews.size < templatePreviews.length;

    return {
      totalUsages: log.length,
      managerBreakdown,
      difficultyBreakdown,
      recentTemplates: log.slice(0, 10),
      repetitionDetected
    };
  }

  /**
   * Clear the debug log
   */
  static clearLog() {
    MobileSessionManager.removeItem(this.STORAGE_KEY);
    console.log('🧹 TemplateDebugger: Debug log cleared');
  }

  /**
   * Print current stats to console
   */
  static printDebugStats() {
    const stats = this.getUsageStats();
    
    console.log('📊 TemplateDebugger: === USAGE STATISTICS ===');
    console.log('📈 Total template usages:', stats.totalUsages);
    console.log('🏭 Manager breakdown:', stats.managerBreakdown);
    console.log('📚 Difficulty breakdown:', stats.difficultyBreakdown);
    console.log('🔄 Repetition detected:', stats.repetitionDetected);
    console.log('📋 Recent templates:');
    
    stats.recentTemplates.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.manager} | ${entry.difficulty} | ${entry.templatePreview}`);
    });
    
    console.log('📊 TemplateDebugger: === END STATISTICS ===');
  }
}