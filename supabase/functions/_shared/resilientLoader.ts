/**
 * RESILIENT LOADER SYSTEM
 * Enhanced memoizedImport with multi-CDN fallbacks and structured error handling
 * Replaces fragile esm.sh imports with resilient CDN cascade
 * 
 * =================== CLIENT CREATION STRATEGY GUIDE ===================
 * 
 * USE createVendorFirstSupabaseClient() FOR:
 * ✅ CharacterConsistencyService (needs instant .upsert()/.single() access)
 * ✅ Image generation orchestrators (runware-generate-image, templates)
 * ✅ Functions requiring 100% availability without network dependency
 * 
 * USE createDatabaseSupabaseClient() FOR:
 * 📊 General database services (analytics, logging, etc.)
 * 📊 Services that can tolerate 7-second network timeout
 * 
 * USE createPaymentSupabaseClient() FOR:
 * 💳 Payment processing functions (Stripe integration)
 * 💳 Must return null on failure (no template fallback)
 * 
 * USE createTieredSupabaseClient() FOR:
 * 📖 Story generation functions with template fallback
 * 📖 3-tier system: Network → Vendor → Template Service signal
 * 
 * =================== PERFORMANCE COMPARISON ===================
 * createVendorFirstSupabaseClient():  ~5ms (local import)
 * createResilientSupabaseClient():    ~28,000ms (4 CDN attempts @ 7s each)
 * createDatabaseSupabaseClient():     ~7,000ms - ~28,000ms (network first)
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
    ],
    vendor: '../_vendor/supabase-js@2.57.4.mjs'
  },
  'openai': {
    primary: 'https://deno.land/x/openai@v4.28.0/mod.ts',
    fallbacks: [
      'https://esm.sh/openai@4.28.0?pin=v135',
      'https://cdn.jsdelivr.net/npm/openai@4.28.0/+esm',
      'https://unpkg.com/openai@4.28.0?module'
    ],
    vendor: '../_vendor/openai@4.28.0.mjs'
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

// Enhanced memoized import cache with differentiated TTL-based failure tracking
const importCache = new Map<string, Promise<any>>();
const failureCache = new Map<string, { timestamp: number; ttl: number }>();

// Differentiated TTL for critical vs regular services
const CRITICAL_SERVICES = ['@supabase/supabase-js', 'stripe', 'openai'];

// Environment-based cooldown configuration - shorter times for faster debugging
const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development' || 
                     Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;

const CRITICAL_FAILURE_TTL = isDevelopment ? 2 * 1000 : 5 * 1000; // 2s dev, 5s prod
const REGULAR_FAILURE_TTL = isDevelopment ? 5 * 1000 : 30 * 1000; // 5s dev, 30s prod
const IMPORT_TIMEOUT = 7 * 1000; // 7 seconds

// Failure counter for automatic cache reset
const failureCounter = new Map<string, number>();
const FAILURE_THRESHOLD = 3; // Reset cache after 3 consecutive failures

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
    failureCounter.delete(path);
    return result;
  } catch (error) {
    // Remove from cache and mark as failed with differentiated TTL
    importCache.delete(path);
    
    // Determine TTL based on service criticality
    const packageName = extractPackageName(path);
    const isCritical = CRITICAL_SERVICES.includes(packageName);
    const ttl = isCritical ? CRITICAL_FAILURE_TTL : REGULAR_FAILURE_TTL;
    
    failureCache.set(path, { timestamp: Date.now(), ttl });
    
    // Track consecutive failures for automatic cache reset
    const failures = (failureCounter.get(path) || 0) + 1;
    failureCounter.set(path, failures);
    
    // Automatic cache reset on threshold
    if (failures >= FAILURE_THRESHOLD) {
      console.warn(`🚨 ${path} failed ${failures} times - triggering cache reset`);
      clearImportCache();
    }
    
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
    // Special-case: prefer vendor FIRST for @supabase/supabase-js to avoid CDN flakiness
    const preferVendorFirst = packageName === '@supabase/supabase-js' && !!(cdnConfig as any).vendor;

    if (preferVendorFirst) {
      // Try vendor bundle first
      try {
        console.log(`Trying vendor bundle first for ${packageName}: ${(cdnConfig as any).vendor}`);
        return await timeoutImport((cdnConfig as any).vendor as string);
      } catch (vendorError) {
        console.warn(`Vendor bundle failed for ${packageName}:`, vendorError);
      }
      // Fallback to primary CDN then fallbacks
      try {
        return await timeoutImport(cdnConfig.primary);
      } catch (primaryError) {
        console.warn(`Primary CDN failed for ${packageName}:`, primaryError);
        for (const fallbackUrl of cdnConfig.fallbacks) {
          try {
            console.log(`Trying fallback CDN: ${fallbackUrl}`);
            return await timeoutImport(fallbackUrl);
          } catch (fallbackError) {
            console.warn(`Fallback CDN failed: ${fallbackUrl}`, fallbackError);
          }
        }
        throw new Error(`All sources failed for ${packageName}`);
      }
    } else {
      // Default behavior: primary → fallbacks → vendor
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

        // Try vendor bundle if available
        if ((cdnConfig as any).vendor) {
          try {
            console.log(`Trying vendor bundle: ${(cdnConfig as any).vendor}`);
            return await timeoutImport((cdnConfig as any).vendor as string);
          } catch (vendorError) {
            console.warn(`Vendor bundle failed: ${(cdnConfig as any).vendor}`, vendorError);
          }
        }

        throw new Error(`All CDN fallbacks failed for ${packageName}`);
      }
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

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
 * 
 * NOTE: This is for STORY GENERATION functions only.
 * Payment functions should use createPaymentSupabaseClient() instead.
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
 * Create generic database Supabase client with 2-tier fallback system
 * Tier 1: Network CDN imports (with resilient fallbacks)
 * Tier 2: Local vendor fallback
 * 
 * For services requiring database operations (.upsert, .single, etc.) without template fallbacks.
 * Use cases: CharacterConsistencyService, general database services, etc.
 * Throws error on complete failure for proper error handling.
 */
export async function createDatabaseSupabaseClient() {
  try {
    // Tier 1: Network CDN imports
    console.log('💾 Database Client Tier 1: Attempting network CDN imports');
    return await createResilientSupabaseClient();
  } catch (networkError: any) {
    console.warn('💾 Database Client Tier 1 failed, attempting Tier 2:', networkError?.message || 'Unknown error');
    
    try {
      // Tier 2: Local vendor fallback
      console.log('💾 Database Client Tier 2: Attempting vendor fallback');
      const { createClient } = await import('../_vendor/supabase-js@2.57.4.mjs');
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }

      console.log('✅ Database Client Tier 2 successful: Using vendor fallback');
      return createClient(supabaseUrl, supabaseKey);
    } catch (vendorError: any) {
      console.error('💾 Database Client: Both network and vendor failed:', vendorError?.message || 'Unknown vendor error');
      throw new Error('Database connection unavailable - both network and vendor failed');
    }
  }
}

/**
 * Create vendor-first Supabase client with REVERSED priority
 * Optimized for CharacterConsistencyService and image generation functions
 * that need guaranteed availability without network dependency.
 * 
 * Tier 1: Local vendor bundle (instant, 100% reliable)
 * Tier 2: Network CDN fallback (if vendor somehow fails)
 */
export async function createVendorFirstSupabaseClient() {
  try {
    // Tier 1: Try vendor bundle FIRST (no network delay)
    console.log('📦 Vendor-First Client Tier 1: Attempting local vendor bundle');
    const { createClient } = await import('../_vendor/supabase-js@2.57.4.mjs');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    console.log('✅ Vendor-First Client Tier 1 successful: Using vendor bundle (0ms network delay)');
    return createClient(supabaseUrl, supabaseKey);
  } catch (vendorError: any) {
    console.warn('📦 Vendor-First Client Tier 1 failed, attempting Tier 2:', vendorError?.message || 'Unknown error');
    
    try {
      // Tier 2: Fallback to network CDN (inverted priority)
      console.log('🌐 Vendor-First Client Tier 2: Attempting network CDN fallback');
      return await createResilientSupabaseClient();
    } catch (networkError: any) {
      console.error('🌐 Vendor-First Client: Both vendor and network failed:', networkError?.message || 'Unknown error');
      throw new Error('Supabase client unavailable - both vendor and network failed');
    }
  }
}

/**
 * Create payment-specific Supabase client with 2-tier fallback system
 * Tier 1: Network CDN imports (with resilient fallbacks)
 * Tier 2: Local vendor fallback
 * 
 * Payment functions require live database access and CANNOT use template fallbacks.
 * Returns null on complete failure instead of throwing.
 */
export async function createPaymentSupabaseClient() {
  try {
    // Tier 1: Network CDN imports
    console.log('💳 Payment Client Tier 1: Attempting network CDN imports');
    return await createResilientSupabaseClient();
  } catch (networkError: any) {
    console.warn('💳 Payment Client Tier 1 failed, attempting Tier 2:', networkError?.message || 'Unknown error');
    
    try {
      // Tier 2: Local vendor fallback
      console.log('💳 Payment Client Tier 2: Attempting vendor fallback');
      const { createClient } = await import('../_vendor/supabase-js@2.57.4.mjs');
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }

      console.log('✅ Payment Client Tier 2 successful: Using vendor fallback');
      return createClient(supabaseUrl, supabaseKey);
    } catch (vendorError: any) {
      console.error('💳 Payment Client: Both network and vendor failed:', vendorError?.message || 'Unknown vendor error');
      
      // Payment functions cannot use template fallback - return null
      console.error('🚨 Payment service unavailable: Database connection required for payments');
      return null;
    }
  }
}

/**
 * Create a Stripe client with vendor fallback resilience
 * Tier 1: Network CDN (esm.sh)
 * Tier 2: Local vendor bundle
 * Tier 3: Graceful degradation (return null, caller handles)
 */
export async function createResilientStripeClient(apiKey: string): Promise<any> {
  console.log('🔧 Creating resilient Stripe client...');
  
  try {
    // Tier 1: Try network CDN
    console.log('📡 Tier 1: Attempting Stripe import from network CDN...');
    const { default: Stripe } = await memoizedImport('stripe');
    console.log('✅ Tier 1 SUCCESS: Stripe loaded from network CDN');
    return new Stripe(apiKey, { apiVersion: '2023-10-16' });
  } catch (cdnError) {
    console.warn('⚠️ Tier 1 FAILED: Network CDN unavailable', cdnError);
    
    try {
      // Tier 2: Try local vendor bundle
      console.log('📦 Tier 2: Attempting Stripe import from local vendor...');
      const { default: Stripe } = await import('../_vendor/stripe@12.18.0.mjs');
      console.log('✅ Tier 2 SUCCESS: Stripe loaded from local vendor');
      return new Stripe(apiKey, { apiVersion: '2023-10-16' });
    } catch (vendorError) {
      console.error('❌ Tier 2 FAILED: Local vendor unavailable', vendorError);
      
      // Tier 3: Graceful degradation - return null, caller handles
      console.error('🚨 All Stripe import tiers exhausted - returning null for graceful degradation');
      return null;
    }
  }
}

/**
 * Create standardized 503 response for payment service unavailability
 */
export function createPaymentUnavailableResponse(functionName: string): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
    'Access-Control-Max-Age': '600',
  };

  return new Response(
    JSON.stringify({
      success: false,
      error: 'Payment services temporarily unavailable',
      code: 'PAYMENT_SERVICE_UNAVAILABLE',
      details: {
        function: functionName,
        timestamp: new Date().toISOString(),
        message: 'Our payment system requires database connectivity which is currently unavailable. Please try again in a few moments.'
      }
    }),
    {
      status: 503,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': '60' // Suggest retry after 60 seconds
      }
    }
  );
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
 * Clear import cache with optional selective clearing
 */
export function clearImportCache(packageName?: string): void {
  if (packageName) {
    // Clear specific package cache
    for (const [key] of importCache) {
      if (key.includes(packageName)) {
        importCache.delete(key);
        failureCache.delete(key);
        failureCounter.delete(key);
      }
    }
    console.log(`🧹 Cleared cache for ${packageName}`);
  } else {
    // Clear all caches
    importCache.clear();
    failureCache.clear();
    failureCounter.clear();
    console.log('🧹 Cleared all import caches');
  }
}

/**
 * Get cache status for debugging and monitoring
 */
export function getCacheStatus(): { 
  imports: number; 
  failures: number; 
  consecutiveFailures: number;
  criticalServicesDown: string[];
  failureDetails: Array<{ 
    path: string; 
    failedAt: string; 
    retryIn: string;
    failures: number;
    isCritical: boolean;
  }> 
} {
  const failureDetails = Array.from(failureCache.entries()).map(([path, failure]) => {
    const packageName = extractPackageName(path);
    return {
      path,
      failedAt: new Date(failure.timestamp).toISOString(),
      retryIn: `${Math.ceil((failure.ttl - (Date.now() - failure.timestamp)) / 1000)}s`,
      failures: failureCounter.get(path) || 0,
      isCritical: CRITICAL_SERVICES.includes(packageName)
    };
  });
  
  const criticalServicesDown = failureDetails
    .filter(f => f.isCritical)
    .map(f => extractPackageName(f.path));
  
  return {
    imports: importCache.size,
    failures: failureCache.size,
    consecutiveFailures: Array.from(failureCounter.values()).reduce((sum, count) => sum + count, 0),
    criticalServicesDown,
    failureDetails
  };
}

/**
 * Health check for resilient loader system
 */
export function getLoaderHealth(): { 
  healthy: boolean; 
  status: 'healthy' | 'degraded' | 'critical';
  message: string;
  details: ReturnType<typeof getCacheStatus>;
} {
  const status = getCacheStatus();
  
  if (status.criticalServicesDown.length > 0) {
    return {
      healthy: false,
      status: 'critical',
      message: `Critical services unavailable: ${status.criticalServicesDown.join(', ')}`,
      details: status
    };
  }
  
  if (status.failures > 0) {
    return {
      healthy: true,
      status: 'degraded',
      message: `${status.failures} non-critical services experiencing issues`,
      details: status
    };
  }
  
  return {
    healthy: true,
    status: 'healthy',
    message: 'All services operational',
    details: status
  };
}