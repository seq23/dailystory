import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🧪 Test endpoint called successfully');
    console.log('🧪 Headers:', Object.fromEntries(req.headers.entries()));
    
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('🧪 Request body:', body);
    }

    return createCorsResponse({
      success: true,
      message: 'Test endpoint working correctly',
      timestamp: new Date().toISOString(),
      method: req.method
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return createCorsErrorResponse(`Test error: ${error.message}`, 500);
  }
});