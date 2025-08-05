/**
 * Comprehensive Debug Logger for Template System
 * Provides detailed logging for production debugging and monitoring
 */

interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

interface LoggerConfig {
  enableConsoleOutput: boolean;
  enableLocalStorage: boolean;
  maxLogEntries: number;
  enablePerformanceLogging: boolean;
  enableErrorTracking: boolean;
  logLevels: Array<'info' | 'warn' | 'error' | 'debug'>;
}

export class TemplateSystemLogger {
  private static logs: LogEntry[] = [];
  private static sessionId = Math.random().toString(36).substring(7);
  private static config: LoggerConfig = {
    enableConsoleOutput: true,
    enableLocalStorage: true,
    maxLogEntries: 1000,
    enablePerformanceLogging: true,
    enableErrorTracking: true,
    logLevels: ['info', 'warn', 'error', 'debug']
  };

  /**
   * Initialize logger with configuration
   */
  static initialize(config?: Partial<LoggerConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Load existing logs from localStorage
    this.loadStoredLogs();
    
    console.log(`📋 TemplateSystemLogger initialized with session: ${this.sessionId}`);
  }

  /**
   * Log an info message
   */
  static info(category: string, message: string, metadata?: Record<string, any>, userId?: string): void {
    this.log('info', category, message, metadata, userId);
  }

  /**
   * Log a warning message
   */
  static warn(category: string, message: string, metadata?: Record<string, any>, userId?: string): void {
    this.log('warn', category, message, metadata, userId);
  }

  /**
   * Log an error message
   */
  static error(category: string, message: string, metadata?: Record<string, any>, userId?: string): void {
    this.log('error', category, message, metadata, userId);
  }

  /**
   * Log a debug message
   */
  static debug(category: string, message: string, metadata?: Record<string, any>, userId?: string): void {
    this.log('debug', category, message, metadata, userId);
  }

  /**
   * Core logging function
   */
  private static log(
    level: 'info' | 'warn' | 'error' | 'debug',
    category: string,
    message: string,
    metadata?: Record<string, any>,
    userId?: string
  ): void {
    if (!this.config.logLevels.includes(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      metadata,
      userId,
      sessionId: this.sessionId
    };

    this.addLogEntry(entry);

    // Console output
    if (this.config.enableConsoleOutput) {
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        debug: '🔍'
      }[level];

      const style = {
        info: 'color: #2196F3',
        warn: 'color: #FF9800',
        error: 'color: #F44336',
        debug: 'color: #9E9E9E'
      }[level];

      console.log(
        `%c${emoji} [${category}] ${message}`,
        style,
        metadata ? metadata : ''
      );
    }
  }

  /**
   * Add log entry to storage
   */
  private static addLogEntry(entry: LogEntry): void {
    this.logs.push(entry);

    // Maintain max log size
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs = this.logs.slice(-this.config.maxLogEntries);
    }

    // Store in localStorage
    if (this.config.enableLocalStorage) {
      this.saveLogsToStorage();
    }
  }

  /**
   * Load logs from localStorage
   */
  private static loadStoredLogs(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      const stored = localStorage.getItem('template_system_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored logs:', error);
    }
  }

  /**
   * Save logs to localStorage
   */
  private static saveLogsToStorage(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      localStorage.setItem('template_system_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save logs to storage:', error);
    }
  }

  /**
   * Get logs with filtering options
   */
  static getLogs(filter?: {
    level?: 'info' | 'warn' | 'error' | 'debug';
    category?: string;
    userId?: string;
    timeRange?: { start: number; end: number };
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
      }
      
      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => log.category.includes(filter.category!));
      }
      
      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
      }
      
      if (filter.timeRange) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp >= filter.timeRange!.start && 
          log.timestamp <= filter.timeRange!.end
        );
      }
      
      if (filter.limit) {
        filteredLogs = filteredLogs.slice(-filter.limit);
      }
    }

    return filteredLogs;
  }

  /**
   * Get error summary for debugging
   */
  static getErrorSummary(): {
    totalErrors: number;
    recentErrors: LogEntry[];
    errorsByCategory: Record<string, number>;
    criticalIssues: string[];
  } {
    const errors = this.logs.filter(log => log.level === 'error');
    const recent = errors.slice(-10);
    
    const errorsByCategory: Record<string, number> = {};
    errors.forEach(error => {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
    });

    const criticalIssues: string[] = [];
    Object.entries(errorsByCategory).forEach(([category, count]) => {
      if (count > 5) {
        criticalIssues.push(`${category}: ${count} errors`);
      }
    });

    return {
      totalErrors: errors.length,
      recentErrors: recent,
      errorsByCategory,
      criticalIssues
    };
  }

  /**
   * Export logs for analysis
   */
  static exportLogs(): {
    sessionId: string;
    exportTime: number;
    logs: LogEntry[];
    summary: {
      totalLogs: number;
      logsByLevel: Record<string, number>;
      timeRange: { start: number; end: number };
    };
  } {
    const logsByLevel: Record<string, number> = {};
    this.logs.forEach(log => {
      logsByLevel[log.level] = (logsByLevel[log.level] || 0) + 1;
    });

    const timestamps = this.logs.map(log => log.timestamp);
    const timeRange = {
      start: Math.min(...timestamps),
      end: Math.max(...timestamps)
    };

    return {
      sessionId: this.sessionId,
      exportTime: Date.now(),
      logs: [...this.logs],
      summary: {
        totalLogs: this.logs.length,
        logsByLevel,
        timeRange
      }
    };
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    const count = this.logs.length;
    this.logs = [];
    
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('template_system_logs');
    }
    
    console.log(`🧹 Cleared ${count} log entries`);
  }

  /**
   * Log system health status
   */
  static logSystemHealth(): void {
    const memoryUsage = this.logs.length * 150; // Rough estimate
    const errorCount = this.logs.filter(log => log.level === 'error').length;
    const recentErrors = this.logs
      .filter(log => log.level === 'error' && Date.now() - log.timestamp < 300000) // 5 minutes
      .length;

    this.info('system-health', 'System health check', {
      memoryUsage,
      totalLogs: this.logs.length,
      errorCount,
      recentErrors,
      sessionAge: Date.now() - (this.logs[0]?.timestamp || Date.now())
    });
  }

  /**
   * Update configuration
   */
  static updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.info('logger-config', 'Logger configuration updated', newConfig);
  }
}

// Initialize logger
TemplateSystemLogger.initialize();