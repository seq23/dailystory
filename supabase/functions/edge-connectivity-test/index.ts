// Redeploy touch: 2025-09-12T18:45:32Z - Force complete rebuild
console.log("[edge-connectivity-test] Loaded: 2025-09-12T18:45:32Z");
import { createCorsResponse, createCorsOptionsResponse } from '../_shared/cors.js';

console.log('Edge connectivity test function starting...');

// Force deployment sync - 2025-01-30

Deno.serve(async (req) => {
  console.log(`Connectivity test request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return createCorsOptionsResponse();
  }

  try {
    // Ultra-simple response to test basic connectivity
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Edge function connectivity verified successfully',
      environment: Deno.env.get('DENO_DEPLOYMENT_ID') ? 'production' : 'local',
      functionName: 'edge-connectivity-test',
      method: req.method,
      userAgent: req.headers.get('user-agent') || 'unknown'
    };

    console.log('Connectivity test successful:', response);
    return createCorsResponse(response);

  } catch (error) {
    console.error('Connectivity test error:', error);
    return createCorsResponse({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      functionName: 'edge-connectivity-test'
    }, 500);
  }
});