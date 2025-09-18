/**
 * LEAN ERROR DEDUPLICATION SERVICE
 * Prevents console spam with global error grouping and throttling
 */

interface ErrorGroup {
  count: number;
  lastSeen: number;
  throttled: boolean;
}

class LeanErrorService {
  private static errorGroups = new Map<string, ErrorGroup>();
  private static readonly THROTTLE_MS = 60000; // 1 minute
  private static readonly MAX_ERRORS_PER_GROUP = 1;

  static logError(error: any, context: string = 'Unknown') {
    const errorKey = this.getErrorKey(error, context);
    const now = Date.now();
    
    let group = this.errorGroups.get(errorKey);
    if (!group) {
      group = { count: 0, lastSeen: 0, throttled: false };
      this.errorGroups.set(errorKey, group);
    }

    // Reset if throttle window passed
    if (now - group.lastSeen > this.THROTTLE_MS) {
      group.count = 0;
      group.throttled = false;
    }

    group.count++;
    group.lastSeen = now;

    // Only log first error in each group per minute
    if (group.count <= this.MAX_ERRORS_PER_GROUP) {
      console.group(`🚨 ${context} Error`);
      console.error('Error:', error?.message || error);
      if (group.count === this.MAX_ERRORS_PER_GROUP) {
        console.warn('Similar errors will be throttled for 1 minute');
      }
      console.groupEnd();
    } else if (!group.throttled) {
      console.warn(`🔇 ${context}: Further errors throttled (${group.count} total)`);
      group.throttled = true;
    }
  }

  static logWarning(message: string, context: string = 'Unknown') {
    const errorKey = `warning:${context}:${message}`;
    const now = Date.now();
    
    let group = this.errorGroups.get(errorKey);
    if (!group || now - group.lastSeen > this.THROTTLE_MS) {
      console.warn(`⚠️ ${context}: ${message}`);
      this.errorGroups.set(errorKey, { count: 1, lastSeen: now, throttled: false });
    }
  }

  private static getErrorKey(error: any, context: string): string {
    const message = error?.message || String(error);
    return `${context}:${message.substring(0, 50)}`;
  }

  static clearThrottles() {
    this.errorGroups.clear();
  }
}

export { LeanErrorService };