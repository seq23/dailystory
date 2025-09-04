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

    // Deduplication - skip identical messages within 30 seconds
    const messageHash = `${entry.level}-${entry.message}`;
    const lastMessageTime = this.lastLogTime.get(messageHash) || 0;
    if (now - lastMessageTime < 30000 && entry.level !== LogLevel.ERROR) {
      return;
    }

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Update counters
    this.logCounts.set(logKey, count + 1);
    this.lastLogTime.set(logKey, now);
    this.lastLogTime.set(messageHash, now);
  }

  private formatMessage(entry: LogEntry): string {
    const levelStr = LogLevel[entry.level];
    const contextStr = entry.context ? `[${entry.context}]` : '';
    return `${levelStr}${contextStr}: ${entry.message}`;
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
  setLevel: (level: LogLevel) => logger.setLogLevel(level)
};