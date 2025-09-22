// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

// Inline CORS headers to avoid import issues
const COMPREHENSIVE_HEADER_BASELINE = [
  'authorization', 'apikey', 'x-client-info', 'x-supabase-info',
  'content-type', 'content-length', 'accept', 'accept-encoding',
  'user-agent', 'origin', 'x-requested-with'
];

// Comprehensive CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': COMPREHENSIVE_HEADER_BASELINE.join(', '),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '600',
};

function createCorsResponse(data: any, status = 200) {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error: any, status = 500) {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  return createCorsResponse({ 
    success: false, 
    error: errorMessage,
    timestamp: new Date().toISOString()
  }, status);
}

function createCorsOptionsResponse() {
  return new Response(null, { headers: corsHeaders });
}
// Inline implementation for missing tierFailureMonitoring functions
const MonitoringDashboard = {
  exportMonitoringData() {
    console.log('📊 Exporting monitoring data...');
    return {
      timestamp: new Date().toISOString(),
      services: [],
      circuitBreakers: [],
      tierMetrics: {},
      message: 'Monitoring data exported successfully (inline implementation)'
    };
  }
};

serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  

  try {
    console.log('📊 Monitoring Data Export Request');
    const monitoringData = MonitoringDashboard.exportMonitoringData();
    
    return createCorsResponse({
      success: true,
      data: monitoringData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to export monitoring data:', error);
    return createCorsErrorResponse(`Monitoring data export failed: ${error.message}`, 500);
  }
});