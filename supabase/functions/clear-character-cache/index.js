// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
console.log("[clear-character-cache] Loaded: 2025-09-12T18:45:32Z");
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============= DIRECT DATABASE CLEARING (NO CCS DEPENDENCY) =============

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

async function clearCharacterCache(sessionId) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Clear character consistency cache ONLY for the caller's own session.
  // Note: this table has no `id` column — PK is (session_id, character_key).
  // Scoping to a single session prevents an unauthenticated caller from
  // wiping the entire shared cache table (application-wide DoS).
  const { error } = await supabase
    .from('character_consistency_cache')
    .delete()
    .eq('session_id', sessionId);
  
  if (error) throw error;
  
  return { cleared: true, sessionId, timestamp: new Date().toISOString() };
}

// Inline CORS utilities to fix boot failure
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Max-Age': '600',
};

async function handleRequest(req) {
  console.log(`🗑️ Clear Character Cache: ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Force deployment sync - 2025-01-30

  try {
    // A specific sessionId is required so callers can only clear their own
    // session's cache — never the whole table.
    let sessionId;
    try {
      const body = await req.json();
      sessionId = body?.sessionId;
    } catch {
      sessionId = undefined;
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return new Response(JSON.stringify({
        error: 'Bad request',
        message: 'A valid sessionId is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clear character cache for the caller's session only
    const result = await clearCharacterCache(sessionId);
    
    return new Response(JSON.stringify({ 
      status: 'success',
      message: 'Character cache cleared successfully',
      result: result
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('🗑️ Clear character cache error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Export for TypeScript receptionist
export default handleRequest;

// Maintain backward compatibility
serve(handleRequest);