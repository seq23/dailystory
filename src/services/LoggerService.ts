// Structured Logging Service
// Replaces scattered console.log statements with production-ready logging

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: number;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Reduced from 1000 to save memory
  private logCounts = new Map<string, number>();
  private lastLogTime = new Map<string, number>();
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_LOGS_PER_TYPE = 10; // Max 10 logs per type per minute
  
  // Grouping and frequency tracking
  private messageFrequency = new Map<string, { count: number; firstSeen: number; lastSeen: number }>();
  private activeGroups = new Set<string>();
  private readonly MESSAGE_GROUPING_WINDOW = 30000; // 30 seconds
  
  // Milestone deduplication tracking
  private milestoneTimestamps = new Map<string, number>();

  private constructor() {
    // Set log level based on environment - more restrictive in production
    const isDev = typeof window !== 'undefined' && window.location?.hostname === 'localhost';
    this.logLevel = isDev ? LogLevel.DEBUG : LogLevel.WARN; // Only WARN and ERROR in production
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private createEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      level,
      message,
      context,
      data,
      timestamp: Date.now()
    };
  }

  private addToBuffer(entry: LogEntry): void {
    // Rate limiting check
    const now = Date.now();
    const logKey = `${entry.level}-${entry.context || 'default'}`;
    const lastTime = this.lastLogTime.get(logKey) || 0;
    const count = this.logCounts.get(logKey) || 0;

    // Reset counter if window expired
    if (now - lastTime > this.RATE_LIMIT_WINDOW) {
      this.logCounts.set(logKey, 0);
    }

    // Skip if rate limit exceeded (except for ERROR level)
    if (entry.level !== LogLevel.ERROR && count >= this.MAX_LOGS_PER_TYPE) {
      return;
    }

    // Message frequency tracking for grouping
    const messageKey = `${entry.level}-${entry.message}-${entry.context || ''}`;
    const frequency = this.messageFrequency.get(messageKey);
    
    if (frequency && (now - frequency.firstSeen) < this.MESSAGE_GROUPING_WINDOW) {
      // Update existing frequency count
      frequency.count++;
      frequency.lastSeen = now;
      this.messageFrequency.set(messageKey, frequency);
      return; // Don't add duplicate to buffer, just update count
    } else {
      // New message or outside grouping window
      this.messageFrequency.set(messageKey, {
        count: 1,
        firstSeen: now,
        lastSeen: now
      });
    }

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Update counters
    this.logCounts.set(logKey, count + 1);
    this.lastLogTime.set(logKey, now);
  }

  private formatMessage(entry: LogEntry): string {
    const levelStr = LogLevel[entry.level];
    const contextStr = entry.context ? `[${entry.context}]` : '';
    const messageKey = `${entry.level}-${entry.message}-${entry.context || ''}`;
    const frequency = this.messageFrequency.get(messageKey);
    
    // Add frequency count if message was repeated
    const frequencyStr = frequency && frequency.count > 1 ? ` (×${frequency.count})` : '';
    
    return `${levelStr}${contextStr}: ${entry.message}${frequencyStr}`;
  }

  // Group related log messages
  group(label: string, collapsed: boolean = false): void {
    if (this.activeGroups.has(label)) return; // Don't create duplicate groups
    
    this.activeGroups.add(label);
    if (collapsed) {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }
  }

  groupEnd(label?: string): void {
    if (label && this.activeGroups.has(label)) {
      this.activeGroups.delete(label);
    }
    console.groupEnd();
  }

  error(message: string, context?: string, data?: any): void {
    const entry = this.createEntry(LogLevel.ERROR, message, context, data);
    this.addToBuffer(entry);
    
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(entry), data || '');
    }
  }

  warn(message: string, context?: string, data?: any): void {
    const entry = this.createEntry(LogLevel.WARN, message, context, data);
    this.addToBuffer(entry);
    
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(entry), data || '');
    }
  }

  info(message: string, context?: string, data?: any): void {
    const entry = this.createEntry(LogLevel.INFO, message, context, data);
    this.addToBuffer(entry);
    
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(entry), data || '');
    }
  }

  debug(message: string, context?: string, data?: any): void {
    const entry = this.createEntry(LogLevel.DEBUG, message, context, data);
    this.addToBuffer(entry);
    
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(entry), data || '');
    }
  }

  // Critical milestones that should always be logged
  milestone(message: string, context?: string, data?: any): void {
    // Create unique key for this milestone to prevent duplicates in React Strict Mode
    const milestoneKey = `milestone-${context || 'default'}-${message}`;
    
    // Check if this milestone was already logged within the last 5 seconds
    const now = Date.now();
    const lastTime = this.milestoneTimestamps.get(milestoneKey) || 0;
    if (now - lastTime < 5000) {
      return; // Prevent duplicate milestones
    }
    
    this.milestoneTimestamps.set(milestoneKey, now);
    
    const entry = this.createEntry(LogLevel.INFO, `🎯 MILESTONE: ${message}`, context, data);
    this.addToBuffer(entry);
    console.log(this.formatMessage(entry), data || '');
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience exports for common patterns
export const LoggerService = {
  error: (message: string, context?: string, data?: any) => logger.error(message, context, data),
  warn: (message: string, context?: string, data?: any) => logger.warn(message, context, data),
  info: (message: string, context?: string, data?: any) => logger.info(message, context, data),
  debug: (message: string, context?: string, data?: any) => logger.debug(message, context, data),
  milestone: (message: string, context?: string, data?: any) => logger.milestone(message, context, data),
  setLevel: (level: LogLevel) => logger.setLogLevel(level),
  group: (label: string, collapsed?: boolean) => logger.group(label, collapsed),
  groupEnd: (label?: string) => logger.groupEnd(label)
};