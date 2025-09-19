// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
console.log("[background-image-pregeneration] Loaded: 2025-09-12T18:45:32Z");
// Phase 4: Background pre-generation cron job
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getDifficultyMapper() {
  try {
    const { DifficultyLevelMapper } = await import("../_shared/DifficultyLevelMapper.ts");
    return DifficultyLevelMapper;
  } catch (error) {
    console.warn('DifficultyLevelMapper lazy load failed:', error);
    return null;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

async function handleRequest(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
...
  }
}

// Export for TypeScript receptionist
export default handleRequest;

// Maintain backward compatibility
serve(handleRequest);