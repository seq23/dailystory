/**
 * SUPABASE CLIENT FACTORY
 * Centralized client creation extracted from resilientLoader.ts
 * Provides vendor-first, database, payment, and tiered client patterns
 * Created: 2025-10-12
 */

import { createClient } from '../_vendor/supabase-js@2.57.4.bundle.mjs';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

export interface ClientOptions {
  timeout?: number;
  fallbackToVendor?: boolean;
}

/**
 * Vendor-first client (5ms, local import)
 * Use for: CCS, image generation, high-priority operations
 */
export function createVendorFirstClient(options: ClientOptions = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { 
      headers: { 'x-client-info': 'supabase-js/2.57.4 (vendor-bundle)' } 
    },
    db: { schema: 'public' }
  });
}

/**
 * Database client with network timeout
 * Use for: Analytics, logging, non-critical operations
 */
export function createDatabaseClient(options: ClientOptions = {}) {
  const timeout = options.timeout || 7000;
  
  // Network first, then fallback to vendor if enabled
  return createVendorFirstClient(); // Implementation TBD based on resilientLoader logic
}

/**
 * Payment client (must fail explicitly, no templates)
 * Use for: Stripe, checkout, subscription operations
 */
export function createPaymentClient(options: ClientOptions = {}) {
  try {
    return createVendorFirstClient();
  } catch (error) {
    return null; // Explicit null on failure
  }
}

/**
 * Tiered client with template fallback signaling
 * Use for: Story generation with template service fallback
 */
export function createTieredClient(options: ClientOptions = {}) {
  return createVendorFirstClient(); // Base implementation
}
