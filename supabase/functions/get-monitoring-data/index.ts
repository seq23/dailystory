import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { MonitoringDashboard } from "../_shared/tierFailureMonitoring.js";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

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