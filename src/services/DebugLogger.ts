// Unified Debug Logger Service
// Replaces scattered console.log statements with centralized logging
// Only outputs to console in ?debug=1 mode, stores all logs for debug monitor

export type DebugCategory = 'auth' | 'story' | 'audio' | 'image' | 'performance' | 'network' | 'ui' | 'error';

export interface DebugLogEntry {
  id: string;
  timestamp: number;
  category: DebugCategory;
  message: string;
  data?: any;
  level: 'info' | 'warn' | 'error';
}

class DebugLoggerService {
  private static instance: DebugLoggerService;
  private logs: DebugLogEntry[] = [];
  private maxLogs = 1000;
  private isDebugMode = false;
  private listeners: ((logs: DebugLogEntry[]) => void)[] = [];
  
  // Performance optimizations
  private logBatch: DebugLogEntry[] = [];
  private batchFlushTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_FLUSH_DELAY = 100; // 100ms
  private operationCounts: Record<string, number> = {};

  private constructor() {
    // Check for debug mode from URL params and production environment
    this.isDebugMode = this.getProductionLogLevel();
  }

  private getProductionLogLevel(): boolean {
    // Only enable debug logging in specific conditions
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // Enable if debug=1 in URL or on localhost
      return params.has('debug') || window.location.hostname === 'localhost';
    }
    // In Node.js environments, check for development mode
    return process?.env?.NODE_ENV === 'development';
  }

  static getInstance(): DebugLoggerService {
    if (!DebugLoggerService.instance) {
      DebugLoggerService.instance = new DebugLoggerService();
    }
    return DebugLoggerService.instance;
  }

  private createEntry(category: DebugCategory, message: string, data?: any, level: 'info' | 'warn' | 'error' = 'info'): DebugLogEntry {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      category,
      message,
      data,
      level
    };
  }

  private addToBuffer(entry: DebugLogEntry): void {
    // Add to batch for performance
    this.logBatch.push(entry);
    
    // Flush batch if it's full or after delay
    if (this.logBatch.length >= this.BATCH_SIZE) {
      this.flushLogBatch();
    } else if (!this.batchFlushTimeout) {
      this.batchFlushTimeout = setTimeout(() => this.flushLogBatch(), this.BATCH_FLUSH_DELAY);
    }
  }
  
  private flushLogBatch(): void {
    if (this.logBatch.length === 0) return;
    
    // Move batch to main log buffer
    this.logs.push(...this.logBatch);
    
    // Enforce size limits
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Notify listeners with current logs
    this.listeners.forEach(listener => listener(this.logs));
    
    // Clear batch and timeout
    this.logBatch = [];
    if (this.batchFlushTimeout) {
      clearTimeout(this.batchFlushTimeout);
      this.batchFlushTimeout = null;
    }
  }

  private formatMessage(entry: DebugLogEntry): string {
    const categoryEmoji = {
      auth: '🔐',
      story: '📚',
      audio: '🔊',
      image: '🖼️',
      performance: '⚡',
      network: '🌐',
      ui: '🎨',
      error: '❌'
    };
    
    return `${categoryEmoji[entry.category]} [${entry.category.toUpperCase()}] ${entry.message}`;
  }

  log(category: DebugCategory, message: string, data?: any): void {
    // Filter repetitive cache operations for performance
    if (category === 'image' && this.shouldFilterCacheLog(message)) {
      return;
    }
    
    const entry = this.createEntry(category, message, data, 'info');
    this.addToBuffer(entry);
    
    // PRODUCTION HARDENING: Only output in debug mode or during development
    if (this.isDebugMode || process.env.NODE_ENV === 'development') {
      // Use lazy formatting to avoid string construction in production
      const formattedMessage = this.formatMessage(entry);
      console.log(formattedMessage, data || '');
    }
  }
  
  private shouldFilterCacheLog(message: string): boolean {
    // Filter repetitive cache hit/miss logs, keep summary metrics only
    if (message.includes('cache hit') || message.includes('cache miss')) {
      const operation = message.includes('hit') ? 'cache_hit' : 'cache_miss';
      this.operationCounts[operation] = (this.operationCounts[operation] || 0) + 1;
      
      // Log summary every 10 operations instead of individual hits/misses
      if (this.operationCounts[operation] % 10 === 0) {
        const summaryMessage = `Cache summary: ${this.operationCounts.cache_hit || 0} hits, ${this.operationCounts.cache_miss || 0} misses`;
        const summaryEntry = this.createEntry('image', summaryMessage, { 
          totalHits: this.operationCounts.cache_hit || 0, 
          totalMisses: this.operationCounts.cache_miss || 0 
        }, 'info');
        this.addToBuffer(summaryEntry);
        return true; // Filter the original message
      }
      return true; // Filter individual hit/miss messages
    }
    
    // Keep other image-related logs (cache cleared, errors, etc.)
    return false;
  }

  warn(category: DebugCategory, message: string, data?: any): void {
    const entry = this.createEntry(category, message, data, 'warn');
    this.addToBuffer(entry);
    
    // PRODUCTION HARDENING: Only output warnings in debug mode or development
    if (this.isDebugMode || process.env.NODE_ENV === 'development') {
      console.warn(this.formatMessage(entry), data || '');
    }
  }

  error(category: DebugCategory, message: string, data?: any): void {
    const entry = this.createEntry(category, message, data, 'error');
    this.addToBuffer(entry);
    
    // PRODUCTION HARDENING: Always log errors, but with environment awareness
    if (this.isDebugMode || process.env.NODE_ENV === 'development') {
      console.error(this.formatMessage(entry), data || '');
    } else {
      // Production: Log minimal error info without exposing sensitive data
      console.error(`[${entry.category.toUpperCase()}] ${entry.message}`);
    }
  }

  // Subscribe to log updates for the debug monitor
  subscribe(listener: (logs: DebugLogEntry[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getLogs(category?: DebugCategory, limit?: number): DebugLogEntry[] {
    let filteredLogs = category 
      ? this.logs.filter(log => log.category === category)
      : this.logs;
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    
    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
    this.logBatch = [];
    this.operationCounts = {};
    if (this.batchFlushTimeout) {
      clearTimeout(this.batchFlushTimeout);
      this.batchFlushTimeout = null;
    }
    this.listeners.forEach(listener => listener(this.logs));
  }

  logToDebugMonitorOnly(category: DebugCategory, message: string, data?: any): void {
    const entry = this.createEntry(category, message, data, 'info');
    this.addToBuffer(entry);
    // Skip console output - only stored in debug monitor buffer
  }

  setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
  }

  isDebugEnabled(): boolean {
    return this.isDebugMode;
  }
}

// Export singleton instance
export const DebugLogger = DebugLoggerService.getInstance();