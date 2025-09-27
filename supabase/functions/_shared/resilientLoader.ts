/**
 * RESILIENT LOADER SYSTEM
 * Enhanced memoizedImport with multi-CDN fallbacks and structured error handling
 * Replaces fragile esm.sh imports with resilient CDN cascade
 */

// Multi-CDN fallback configuration
const CDN_FALLBACKS = {
  '@supabase/supabase-js': {
    primary: 'https://deno.land/x/supabase@2.0.2/mod.ts',
    fallbacks: [
      'https://esm.sh/@supabase/supabase-js@2.55.0?pin=v135',
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.55.0/+esm',
      'https://unpkg.com/@supabase/supabase-js@2.55.0?module'
    ]
  },
  'openai': {
    primary: 'https://deno.land/x/openai@v4.28.0/mod.ts',
    fallbacks: [
      'https://esm.sh/openai@4.28.0?pin=v135',
      'https://cdn.jsdelivr.net/npm/openai@4.28.0/+esm',
      'https://unpkg.com/openai@4.28.0?module'
    ]
  }
};

// Enhanced memoized import cache
const importCache = new Map<string, Promise<any>>();
const failureCache = new Map<string, boolean>();

/**
 * Enhanced memoizedImport with CDN fallback cascade
 */
export async function memoizedImport(path: string): Promise<any> {
  // Check cache first
  if (importCache.has(path)) {
    return importCache.get(path)!;
  }

  // Check if we've already failed this path
  if (failureCache.has(path)) {
    throw new Error(`Import ${path} previously failed and is cached as failed`);
  }

  // Create import promise with fallback logic
  const importPromise = attemptImportWithFallbacks(path);
  importCache.set(path, importPromise);

  try {
    const result = await importPromise;
    return result;
  } catch (error) {
    // Remove from cache and mark as failed
    importCache.delete(path);
    failureCache.set(path, true);
    throw error;
  }
}

/**
 * Attempt import with CDN fallbacks
 */
async function attemptImportWithFallbacks(path: string): Promise<any> {
  // Try to find matching package in our CDN configuration
  const packageName = extractPackageName(path);
  const cdnConfig = CDN_FALLBACKS[packageName as keyof typeof CDN_FALLBACKS];

  if (cdnConfig) {
    // Try primary CDN first
    try {
      return await import(cdnConfig.primary);
    } catch (primaryError) {
      console.warn(`Primary CDN failed for ${packageName}:`, primaryError);

      // Try fallbacks
      for (const fallbackUrl of cdnConfig.fallbacks) {
        try {
          console.log(`Trying fallback CDN: ${fallbackUrl}`);
          return await import(fallbackUrl);
        } catch (fallbackError) {
          console.warn(`Fallback CDN failed: ${fallbackUrl}`, fallbackError);
        }
      }

      throw new Error(`All CDN fallbacks failed for ${packageName}`);
    }
  }

  // For non-configured packages, try the original path
  try {
    return await import(path);
  } catch (error) {
    console.error(`Direct import failed for ${path}:`, error);
    throw error;
  }
}

/**
 * Extract package name from import path
 */
function extractPackageName(path: string): string {
  if (path.includes('@supabase/supabase-js')) return '@supabase/supabase-js';
  if (path.includes('openai')) return 'openai';
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