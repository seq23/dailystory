/**
 * CACHE HEALTH MONITORING ENDPOINT
 * Provides cache health status and manual reset capabilities
 */

import { getCacheHealth, performEmergencyReset } from '../_shared/CacheCoordinator.ts';
import { clearImportCache, getCacheStatus } from '../_shared/resilientLoader.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // GET: Return cache health status
    if (req.method === 'GET') {
      const health = getCacheHealth();
      const cacheStatus = getCacheStatus();

      return new Response(
        JSON.stringify({
          success: true,
          health,
          cacheStatus,
          endpoints: {
            reset: '?action=reset',
            resetPackage: '?action=reset&package=@supabase/supabase-js',
            emergency: '?action=emergency&reason=manual'
          }
        }, null, 2),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // POST: Perform cache operations
    if (req.method === 'POST') {
      switch (action) {
        case 'reset': {
          const packageName = url.searchParams.get('package');
          clearImportCache(packageName || undefined);
          
          return new Response(
            JSON.stringify({
              success: true,
              message: packageName 
                ? `Cache cleared for ${packageName}` 
                : 'All caches cleared',
              timestamp: new Date().toISOString()
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        }

        case 'emergency': {
          const reason = url.searchParams.get('reason') || 'Manual emergency reset';
          performEmergencyReset(reason);
          
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Emergency cache reset completed',
              reason,
              timestamp: new Date().toISOString()
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        }

        default:
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Invalid action. Use: reset, emergency'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      }
    );

  } catch (error) {
    console.error('Cache health endpoint error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
