/**
 * Production-Ready Logging Service
 * Replaces 581+ console.log statements with structured, filterable logging
 * 
 * Key Features:
 * - Structured logging with levels and context
 * - Production filtering (no debug/info in production)
 * - Rate limiting to prevent log spam
 * - Context-aware categorization
 * - Memory-efficient buffering
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2, 
  DEBUG = 3
}

export interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  context?: string;
  data?: any;
  timestamp: number;
  sessionId?: string;
  userId?: string;
}

interface RateLimitEntry {
  count: number;
  firstSeen: number;
  lastSeen: number;
}

export class ProductionLogger {
  private static instance: ProductionLogger;
  private logLevel: LogLevel = LogLevel.INFO;
  private buffer: LogEntry[] = [];
  private maxBufferSize = 100;
  private rateLimits = new Map<string, RateLimitEntry>();
  private rateLimitWindow = 10000; // 10 seconds
  private rateLimitThreshold = 5; // Max 5 identical messages per window

  private constructor() {
    // Set production log level based on environment
    if (typeof window !== 'undefined') {
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname.includes('preview');
      this.logLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
    }
  }

  static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  /**
   * Set the minimum log level for output
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  /**
   * Apply rate limiting to prevent log spam
   */
  private isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (!entry) {
      this.rateLimits.set(key, { count: 1, firstSeen: now, lastSeen: now });
      return false;
    }

    // Reset if outside window
    if (now - entry.firstSeen > this.rateLimitWindow) {
      this.rateLimits.set(key, { count: 1, firstSeen: now, lastSeen: now });
      return false;
    }

    // Update count
    entry.count++;
    entry.lastSeen = now;

    return entry.count > this.rateLimitThreshold;
  }

  /**
   * Create a rate limit key for message deduplication
   */
  private createRateLimitKey(category: string, message: string): string {
    return `${category}:${message.substring(0, 50)}`;
  }

  /**
   * Add log entry to buffer and output if appropriate
   */
  private log(level: LogLevel, category: string, message: string, context?: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const rateLimitKey = this.createRateLimitKey(category, message);
    if (this.isRateLimited(rateLimitKey)) return;

    const entry: LogEntry = {
      level,
      category: category.toUpperCase(),
      message,
      context,
      data,
      timestamp: Date.now(),
      sessionId: this.getCurrentSessionId(),
      userId: this.getCurrentUserId()
    };

    // Add to buffer
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // Output to console with structured format
    this.outputToConsole(entry);
  }

  /**
   * Output log entry to console with proper formatting
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString().substring(11, 23);
    const prefix = `${timestamp} ${this.getLevelIcon(entry.level)} [${entry.category}]`;
    
    if (entry.context) {
      const contextMessage = `${prefix} ${entry.context}: ${entry.message}`;
      this.consoleOutput(entry.level, contextMessage, entry.data);
    } else {
      const message = `${prefix} ${entry.message}`;
      this.consoleOutput(entry.level, message, entry.data);
    }
  }

  /**
   * Get icon for log level
   */
  private getLevelIcon(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR: return '❌';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.DEBUG: return '🔍';
      default: return '📝';
    }
  }

  /**
   * Output to appropriate console method
   */
  private consoleOutput(level: LogLevel, message: string, data?: any): void {
    switch (level) {
      case LogLevel.ERROR:
        console.error(message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, data || '');
        break;
      case LogLevel.INFO:
        console.info(message, data || '');
        break;
      case LogLevel.DEBUG:
        console.log(message, data || '');
        break;
    }
  }

  /**
   * Get current session ID for correlation
   */
  private getCurrentSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('storySessionId') || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get current user ID for correlation
   */
  private getCurrentUserId(): string | undefined {
    try {
      const userInfo = localStorage.getItem('currentUser');
      return userInfo ? JSON.parse(userInfo)?.id : undefined;
    } catch {
      return undefined;
    }
  }

  // Public logging methods
  error(category: string, message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, context, data);
  }

  warn(category: string, message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, context, data);
  }

  info(category: string, message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, context, data);
  }

  debug(category: string, message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, context, data);
  }

  /**
   * Log milestone events (always logged regardless of level)
   */
  milestone(category: string, message: string, context?: string, data?: any): void {
    const entry: LogEntry = {
      level: LogLevel.INFO,
      category: `MILESTONE-${category.toUpperCase()}`,
      message,
      context,
      data,
      timestamp: Date.now(),
      sessionId: this.getCurrentSessionId(),
      userId: this.getCurrentUserId()
    };

    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // Always output milestones
    this.outputToConsole(entry);
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.buffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * Get buffer size
   */
  getBufferSize(): number {
    return this.buffer.length;
  }
}

// Export singleton instance
export const logger = ProductionLogger.getInstance();

// Export convenience methods for direct use
export const ProductionLogging = {
  error: (category: string, message: string, context?: string, data?: any) => logger.error(category, message, context, data),
  warn: (category: string, message: string, context?: string, data?: any) => logger.warn(category, message, context, data),  
  info: (category: string, message: string, context?: string, data?: any) => logger.info(category, message, context, data),
  debug: (category: string, message: string, context?: string, data?: any) => logger.debug(category, message, context, data),
  milestone: (category: string, message: string, context?: string, data?: any) => logger.milestone(category, message, context, data),
  setLogLevel: (level: LogLevel) => logger.setLogLevel(level),
  getRecentLogs: (count?: number) => logger.getRecentLogs(count),
  clearBuffer: () => logger.clearBuffer()
};