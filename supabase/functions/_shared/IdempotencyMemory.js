/**
 * IdempotencyMemory: Lightweight in-memory cache for idempotent operations
 * JavaScript Runtime Version - Auto-generated from IdempotencyMemory.ts
 * 
 * Features:
 * - TTL-based caching (default 30s)
 * - Automatic cleanup of expired entries
 * - Handles concurrent requests for same key
 * - Minimal memory footprint
 */

// Global cache: key → CacheEntry
const cache = new Map();

// Cleanup interval (1 minute)
const CLEANUP_INTERVAL_MS = 60000;
let cleanupTimer = null;

/**
 * Start background cleanup of expired entries
 */
function startCleanup() {
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
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Generate stable hash from input data
 */
export function generateKey(parts) {
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
export async function getOrRun(key, ttlMs = 30000, fn) {
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
    result: null,
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
export function invalidate(key) {
  cache.delete(key);
  console.log(`🗑️ [IDEMPOTENCY] Invalidated: ${key}`);
}

/**
 * Clear all cache entries (for testing)
 */
export function clearAll() {
  cache.clear();
  console.log(`🗑️ [IDEMPOTENCY] Cleared all entries`);
}

/**
 * Get cache statistics
 */
export function getStats() {
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
