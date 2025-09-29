/**
 * RESILIENT LOADER SYSTEM
 * Enhanced memoizedImport with multi-CDN fallbacks and structured error handling
 * Replaces fragile esm.sh imports with resilient CDN cascade
 */

// Multi-CDN fallback configuration
const CDN_FALLBACKS = {
  '@supabase/supabase-js': {
    primary: 'https://esm.sh/@supabase/supabase-js@2.57.4?target=deno&bundle',
    fallbacks: [
      'https://esm.sh/v135/@supabase/supabase-js@2.57.4?target=deno&bundle',
      'https://ga.jspm.io/npm:@supabase/supabase-js@2.57.4/+esm',
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/+esm',
      'https://unpkg.com/@supabase/supabase-js@2.57.4?module'
    ]
  },
  'openai': {
    primary: 'https://deno.land/x/openai@v4.28.0/mod.ts',
    fallbacks: [
      'https://esm.sh/openai@4.28.0?pin=v135',
      'https://cdn.jsdelivr.net/npm/openai@4.28.0/+esm',
      'https://unpkg.com/openai@4.28.0?module'
    ]
  },
  'stripe': {
    primary: 'https://esm.sh/stripe@12.18.0?target=deno',
    fallbacks: [
      'https://esm.sh/stripe@12.18.0',
      'https://cdn.jsdelivr.net/npm/stripe@12.18.0/+esm',
      'https://unpkg.com/stripe@12.18.0?module'
    ]
  }
};

// Enhanced memoized import cache with TTL-based failure tracking
const importCache = new Map<string, Promise<any>>();
const failureCache = new Map<string, { timestamp: number; ttl: number }>();
const FAILURE_TTL = 5 * 60 * 1000; // 5 minutes
const IMPORT_TIMEOUT = 7 * 1000; // 7 seconds

/**
 * Enhanced memoizedImport with CDN fallback cascade
 */
export async function memoizedImport(path: string): Promise<any> {
  // Check cache first
  if (importCache.has(path)) {
    return importCache.get(path)!;
  }

  // Check TTL-based failure cache
  const cachedFailure = failureCache.get(path);
  if (cachedFailure && (Date.now() - cachedFailure.timestamp) < cachedFailure.ttl) {
    throw new Error(`Import ${path} failed recently, retrying in ${Math.ceil((cachedFailure.ttl - (Date.now() - cachedFailure.timestamp)) / 1000)}s`);
  }

  // Create import promise with fallback logic and timeout
  const importPromise = attemptImportWithTimeoutAndFallbacks(path);
  importCache.set(path, importPromise);

  try {
    const result = await importPromise;
    // Clear any cached failure on success
    failureCache.delete(path);
    return result;
  } catch (error) {
    // Remove from cache and mark as failed with TTL
    importCache.delete(path);
    failureCache.set(path, { timestamp: Date.now(), ttl: FAILURE_TTL });
    throw error;
  }
}

/**
 * Attempt import with timeout protection and CDN fallbacks
 */
async function attemptImportWithTimeoutAndFallbacks(path: string): Promise<any> {
  // Try to find matching package in our CDN configuration
  const packageName = extractPackageName(path);
  const cdnConfig = CDN_FALLBACKS[packageName as keyof typeof CDN_FALLBACKS];

  if (cdnConfig) {
    // Try primary CDN first with timeout
    try {
      return await timeoutImport(cdnConfig.primary);
    } catch (primaryError) {
      console.warn(`Primary CDN failed for ${packageName}:`, primaryError);

      // Try fallbacks with timeout
      for (const fallbackUrl of cdnConfig.fallbacks) {
        try {
          console.log(`Trying fallback CDN: ${fallbackUrl}`);
          return await timeoutImport(fallbackUrl);
        } catch (fallbackError) {
          console.warn(`Fallback CDN failed: ${fallbackUrl}`, fallbackError);
        }
      }

      throw new Error(`All CDN fallbacks failed for ${packageName}`);
    }
  }

  // For non-configured packages, try the original path with timeout
  try {
    return await timeoutImport(path);
  } catch (error) {
    console.error(`Direct import failed for ${path}:`, error);
    throw error;
  }
}

/**
 * Import with timeout protection
 */
async function timeoutImport(url: string): Promise<any> {
  return Promise.race([
    import(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Import timeout after ${IMPORT_TIMEOUT}ms for ${url}`)), IMPORT_TIMEOUT)
    )
  ]);
}

/**
 * Extract package name from import path
 */
function extractPackageName(path: string): string {
  if (path.includes('@supabase/supabase-js')) return '@supabase/supabase-js';
  if (path.includes('openai')) return 'openai';
  if (path.includes('stripe')) return 'stripe';
  return path;
}

/**
 * Create resilient Supabase client with error handling
 */
export async function createResilientSupabaseClient() {
  try {
    const { createClient } = await memoizedImport('@supabase/supabase-js');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Failed to create resilient Supabase client:', error);
    throw new Error('Supabase client creation failed - service unavailable');
  }
}

/**
 * Create tiered Supabase client with 3-tier fallback system
 * Tier 1: Network (improved resilientLoader)
 * Tier 2: Vendor (local import)
 * Tier 3: Signal for template fallback
 */
export async function createTieredSupabaseClient() {
  try {
    // Tier 1: Network (improved resilientLoader)
    console.log('🌐 Attempting Tier 1: Network CDN imports');
    return await createResilientSupabaseClient();
  } catch (networkError: any) {
    console.warn('🌐 Tier 1 failed, attempting Tier 2:', networkError?.message || 'Unknown error');
    
    try {
      // Tier 2: Vendor (local import)
      console.log('📦 Attempting Tier 2: Vendor fallback');
      const { createClient } = await import('../_vendor/supabase-js@2.57.4.mjs');
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }

      console.log('✅ Tier 2 successful: Using vendor fallback for Supabase client');
      return createClient(supabaseUrl, supabaseKey);
    } catch (vendorError: any) {
      console.error('📦 Tier 2 failed:', vendorError?.message || 'Unknown vendor error');
      
      // Tier 3: Signal for template fallback
      console.log('🚨 Both network and vendor failed - signaling template fallback');
      throw new Error('SUPABASE_UNAVAILABLE - Both network and vendor failed');
    }
  }
}

/**
 * Create structured 503 response for import failures
 */
export function createImportFailureResponse(error: any, functionName: string): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
    'Access-Control-Max-Age': '600',
  };

  return new Response(
    JSON.stringify({
      success: false,
      error: 'Service temporarily unavailable',
      code: 'IMPORT_FAILURE',
      details: {
        function: functionName,
        timestamp: new Date().toISOString(),
        message: 'Critical dependencies could not be loaded'
      }
    }),
    {
      status: 503,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': '300'
      }
    }
  );
}

/**
 * Clear import cache (for testing/debugging)
 */
export function clearImportCache(): void {
  importCache.clear();
  failureCache.clear();
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus(): { imports: number; failures: number; failureDetails: Array<{ path: string; failedAt: string; retryIn: string }> } {
  const failureDetails = Array.from(failureCache.entries()).map(([path, failure]) => ({
    path,
    failedAt: new Date(failure.timestamp).toISOString(),
    retryIn: `${Math.ceil((failure.ttl - (Date.now() - failure.timestamp)) / 1000)}s`
  }));
  
  return {
    imports: importCache.size,
    failures: failureCache.size,
    failureDetails
  };
}