/**
 * IdempotencyMemory: Lightweight in-memory cache for idempotent operations
 * 
 * Features:
 * - TTL-based caching (default 30s)
 * - Automatic cleanup of expired entries
 * - Handles concurrent requests for same key
 * - Minimal memory footprint
 */

interface CacheEntry<T> {
  result: T;
  expiresAt: number;
  inFlight: boolean;
  promise?: Promise<T>;
}

// Global cache: key → CacheEntry
const cache = new Map<string, CacheEntry<any>>();

// Cleanup interval (1 minute)
const CLEANUP_INTERVAL_MS = 60000;
let cleanupTimer: number | null = null;

/**
 * Start background cleanup of expired entries
 */
function startCleanup(): void {
  if (cleanupTimer !== null) return;
  
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of cache.entries()) {
      if (!entry.inFlight && now >= entry.expiresAt) {
        cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 [IDEMPOTENCY] Cleaned ${cleaned} expired entries`);
    }
  }, CLEANUP_INTERVAL_MS) as unknown as number;
}

/**
 * Generate stable hash from input data
 */
export function generateKey(parts: {
  sessionId: string;
  storyId?: string;
  pageNumber?: number;
  operationName: string;
  promptSignature?: string;
}): string {
  const { sessionId, storyId = '', pageNumber = 0, operationName, promptSignature = '' } = parts;
  
  // Simple hash: combine parts with delimiter
  const combined = `${sessionId}:${storyId}:${pageNumber}:${operationName}:${promptSignature}`;
  
  // Use a simple hash function (djb2)
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) + combined.charCodeAt(i);
  }
  
  return `idem:${hash >>> 0}`; // Ensure positive 32-bit integer
}

/**
 * Get or run operation with idempotency guarantee
 * 
 * - If cached and valid: return cached result
 * - If in-flight: wait for existing operation
 * - Otherwise: run operation and cache result
 */
export async function getOrRun<T>(
  key: string,
  ttlMs: number = 30000,
  fn: () => Promise<T>
): Promise<T> {
  startCleanup(); // Ensure cleanup is running
  
  const now = Date.now();
  const existing = cache.get(key);
  
  // Check for valid cached result
  if (existing && !existing.inFlight && now < existing.expiresAt) {
    console.log(`✅ [IDEMPOTENCY] Cache hit: ${key}`);
    return existing.result;
  }
  
  // Check for in-flight operation
  if (existing && existing.inFlight && existing.promise) {
    console.log(`⏳ [IDEMPOTENCY] Waiting for in-flight: ${key}`);
    return existing.promise;
  }
  
  // Run new operation
  console.log(`🔄 [IDEMPOTENCY] Running new operation: ${key}`);
  
  const promise = fn();
  
  // Mark as in-flight
  cache.set(key, {
    result: null as any,
    expiresAt: now + ttlMs,
    inFlight: true,
    promise
  });
  
  try {
    const result = await promise;
    
    // Cache result
    cache.set(key, {
      result,
      expiresAt: now + ttlMs,
      inFlight: false
    });
    
    return result;
  } catch (error) {
    // Remove failed operation from cache
    cache.delete(key);
    throw error;
  }
}

/**
 * Manually invalidate cache entry
 */
export function invalidate(key: string): void {
  cache.delete(key);
  console.log(`🗑️ [IDEMPOTENCY] Invalidated: ${key}`);
}

/**
 * Clear all cache entries (for testing)
 */
export function clearAll(): void {
  cache.clear();
  console.log(`🗑️ [IDEMPOTENCY] Cleared all entries`);
}

/**
 * Get cache statistics
 */
export function getStats(): {
  totalEntries: number;
  inFlightEntries: number;
  expiredEntries: number;
} {
  const now = Date.now();
  let inFlight = 0;
  let expired = 0;
  
  for (const entry of cache.values()) {
    if (entry.inFlight) inFlight++;
    if (now >= entry.expiresAt) expired++;
  }
  
  return {
    totalEntries: cache.size,
    inFlightEntries: inFlight,
    expiredEntries: expired
  };
}
