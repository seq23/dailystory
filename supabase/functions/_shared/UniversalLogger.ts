/**
 * UNIVERSAL STRUCTURED LOGGER
 * Replaces tierLogging.js with TypeScript and enhanced features
 * Maintains backward compatibility for existing calls
 * Created: 2025-10-12
 */

export interface LogEntry {
  timestamp: string;
  tier: string;
  status: 'success' | 'failure' | 'skipped' | 'fallback';
  message: string;
  duration?: number;
  metadata?: Record<string, any>;
}

const logStore = new Map<string, LogEntry[]>();

/**
 * Core logging function (backward compatible with tierLogging.js)
 */
export function logTier(
  sessionId: string,
  tier: string,
  status: 'success' | 'failure' | 'skipped' | 'fallback',
  message: string,
  metadata?: Record<string, any>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    tier,
    status,
    message,
    metadata
  };

  if (!logStore.has(sessionId)) {
    logStore.set(sessionId, []);
  }
  logStore.get(sessionId)!.push(entry);

  // Console output for debugging
  const emoji = status === 'success' ? '✅' : status === 'failure' ? '❌' : status === 'fallback' ? '🔄' : '⏭️';
  console.log(`${emoji} [${tier}] ${message}`);
}

/**
 * Get logs for a session (backward compatible)
 */
export function getTierLogs(sessionId: string): LogEntry[] {
  return logStore.get(sessionId) || [];
}

/**
 * Clear logs for a session (backward compatible)
 */
export function clearTierLogs(sessionId: string): void {
  logStore.delete(sessionId);
}

/**
 * Get cascade summary (backward compatible with tierLogging.js line 202-225)
 */
export function getTierCascadeSummary(sessionId: string, tierLogs?: LogEntry[]) {
  const logs = tierLogs || getTierLogs(sessionId);
  
  const cascade = {
    sessionId,
    totalAttempts: logs.length,
    sequence: [] as any[],
    finalOutcome: null as any
  };

  const byTier: Record<string, LogEntry[]> = {};
  for (const log of logs) {
    if (!byTier[log.tier]) byTier[log.tier] = [];
    byTier[log.tier].push(log);
  }

  for (const tier of ['tier-1', 'tier-2.5A', 'tier-2.5B', 'tier-2.5C', 'tier-2.5D']) {
    if (byTier[tier]) {
      const success = byTier[tier].some(l => l.status === 'success');
      const fail = byTier[tier].some(l => l.status === 'failure');
      cascade.sequence.push({ tier, success, fail, count: byTier[tier].length });
      if (success) {
        cascade.finalOutcome = { tier, log: byTier[tier].find(l => l.status === 'success') };
      }
    }
  }

  return cascade;
}

/**
 * Enhanced logger with structured metadata
 */
export class UniversalLogger {
  static log(
    context: string,
    level: 'info' | 'warn' | 'error',
    message: string,
    metadata?: Record<string, any>
  ): void {
    const timestamp = new Date().toISOString();
    const emoji = level === 'info' ? 'ℹ️' : level === 'warn' ? '⚠️' : '❌';
    
    console.log(`${emoji} [${context}] ${message}`, metadata ? JSON.stringify(metadata) : '');
  }

  static success(context: string, message: string, metadata?: Record<string, any>): void {
    this.log(context, 'info', `✅ ${message}`, metadata);
  }

  static failure(context: string, message: string, metadata?: Record<string, any>): void {
    this.log(context, 'error', `❌ ${message}`, metadata);
  }
}
