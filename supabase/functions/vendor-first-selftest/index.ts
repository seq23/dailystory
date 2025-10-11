/**
 * VENDOR-FIRST CLIENT SELF-TEST
 * Validates all vendor-first client methods against production patterns
 * Run manually via: POST /functions/v1/vendor-first-selftest
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { createVendorFirstSupabaseClient } = await import('../_shared/resilientLoader.js');
    const supabase = await createVendorFirstSupabaseClient();

    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: { passed: 0, failed: 0, total: 0 }
    };

    // Test 1: maybeSingle() - 0 rows (should return null, no error)
    try {
      const { data, error } = await supabase
        .from('character_consistency_cache')
        .select('*')
        .eq('session_id', 'vendor-selftest-nonexistent')
        .maybeSingle();
      
      results.tests.push({
        name: 'maybeSingle() with 0 rows',
        passed: data === null && error === null,
        details: { data, error }
      });
    } catch (err) {
      results.tests.push({ name: 'maybeSingle() with 0 rows', passed: false, error: err.message });
    }

    // Test 2: order() + limit()
    try {
      const { data, error } = await supabase
        .from('image_generation_debug')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      
      results.tests.push({
        name: 'order() + limit()',
        passed: !error && Array.isArray(data),
        details: { rowCount: data?.length, error }
      });
    } catch (err) {
      results.tests.push({ name: 'order() + limit()', passed: false, error: err.message });
    }

    // Test 3: gte() + lt() filters
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('id')
        .gte('created_at', yesterday)
        .lt('created_at', tomorrow);
      
      results.tests.push({
        name: 'gte() + lt() filters',
        passed: !error && Array.isArray(data),
        details: { rowCount: data?.length, error }
      });
    } catch (err) {
      results.tests.push({ name: 'gte() + lt() filters', passed: false, error: err.message });
    }

    // Test 4: count support
    try {
      const { count, error } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true });
      
      results.tests.push({
        name: 'select() with count',
        passed: !error && typeof count === 'number',
        details: { count, error }
      });
    } catch (err) {
      results.tests.push({ name: 'select() with count', passed: false, error: err.message });
    }

    // Test 5: neq() filter
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('id')
        .neq('subscription_tier', 'nonexistent_tier')
        .limit(1);
      
      results.tests.push({
        name: 'neq() filter',
        passed: !error && Array.isArray(data),
        details: { rowCount: data?.length, error }
      });
    } catch (err) {
      results.tests.push({ name: 'neq() filter', passed: false, error: err.message });
    }

    // Calculate summary
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.passed).length;
    results.summary.failed = results.summary.total - results.summary.passed;

    const status = results.summary.failed === 0 ? 'PASS' : 'FAIL';

    return new Response(JSON.stringify({ status, ...results }, null, 2), {
      status: status === 'PASS' ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
