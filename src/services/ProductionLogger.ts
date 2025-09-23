// Temporary stub ProductionLogger - replaced by DebugLogger
// This stub eliminates build errors while maintaining console cleanup

export const ProductionLogging = {
  error: (...args: any[]) => {}, // No-op - replaced by DebugLogger
  warn: (...args: any[]) => {},  // No-op - replaced by DebugLogger
  info: (...args: any[]) => {},  // No-op - replaced by DebugLogger
  debug: (...args: any[]) => {}, // No-op - replaced by DebugLogger
  log: (...args: any[]) => {}    // No-op - replaced by DebugLogger
};

// Legacy export for compatibility
export const ProductionLogger = ProductionLogging;