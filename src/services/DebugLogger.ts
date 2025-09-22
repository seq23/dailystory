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
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.logs));
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
    const entry = this.createEntry(category, message, data, 'info');
    this.addToBuffer(entry);
    
    // PRODUCTION HARDENING: Only output in debug mode or during development
    if (this.isDebugMode || process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage(entry), data || '');
    }
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
    this.listeners.forEach(listener => listener(this.logs));
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