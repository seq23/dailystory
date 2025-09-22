/**
 * ROBUST FETCH - Network-aware fetch wrapper with timeout/retry logic
 * Part of ERROR-001 fix: Eliminates false network/server error classification
 */

export type FetchResult = { 
  ok: boolean; 
  status?: number; 
  networkError?: string; 
};

export interface RobustFetchOptions {
  timeoutMs?: number;
  retries?: number;
  baseDelayMs?: number;
}

/**
 * Network-aware fetch with timeout, retries, and proper error classification
 * 
 * @param input - URL or Request object
 * @param init - Fetch options 
 * @param options - Robust fetch configuration
 * @returns Promise<FetchResult> with proper network vs server error classification
 */
export async function robustFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  { 
    timeoutMs = 4000, 
    retries = 2, 
    baseDelayMs = 150 
  }: RobustFetchOptions = {}
): Promise<FetchResult> {

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    
    try {
      const res = await fetch(input, { 
        ...init, 
        signal: ctrl.signal,
        cache: "no-store" // Prevent cache interference with health checks
      });
      clearTimeout(timer);
      return { ok: res.ok, status: res.status };
    } catch (e: any) {
      clearTimeout(timer);
      
      // If this was our last attempt, return the error
      if (attempt === retries) {
        return { 
          ok: false, 
          networkError: e?.name === "AbortError" ? "timeout" : (e?.message || "network") 
        };
      }
      
      // Calculate backoff with jitter for next retry
      const jitter = baseDelayMs * (1 + Math.random());
      const delay = jitter * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { ok: false, networkError: "unknown" };
}

/**
 * Simple health check using HEAD method (no preflight triggers)
 * 
 * @param url - Health endpoint URL
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise<boolean> - true if healthy, false if network/server error
 */
export async function simpleHealth(url: string, timeoutMs = 2000): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, { 
      method: "HEAD", 
      signal: ctrl.signal, 
      cache: "no-store" 
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    clearTimeout(timer);
    return false; // Treat network errors as unhealthy, not server failures
  }
}