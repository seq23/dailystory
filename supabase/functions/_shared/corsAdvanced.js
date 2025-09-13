// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
// Advanced CORS Utilities for Dynamic Edge Function Responses
// Provides comprehensive CORS handling with request monitoring

// Import the comprehensive header baseline from the TypeScript version
import { COMPREHENSIVE_HEADER_BASELINE } from './corsAdvanced.ts';

/**
 * Creates a dynamic CORS OPTIONS response based on request headers
 */
export function createDynamicCorsOptionsResponse(req) {
  const requestOrigin = req.headers.get('origin') || '*';
  const requestMethod = req.headers.get('access-control-request-method') || 'GET,POST,OPTIONS';
  const requestHeaders = req.headers.get('access-control-request-headers') || COMPREHENSIVE_HEADER_BASELINE.join(', ');
  
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Methods': requestMethod,
      'Access-Control-Allow-Headers': requestHeaders,
      'Access-Control-Max-Age': '86400', // 24 hours
    }
  });
}

/**
 * Creates a dynamic CORS response with data payload
 */
export function createDynamicCorsResponse(data, req = null, status = 200) {
  const requestOrigin = req?.headers?.get('origin') || '*';
  
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Headers': COMPREHENSIVE_HEADER_BASELINE.join(', '),
      'Content-Type': 'application/json',
    }
  });
}

/**
 * Creates a dynamic CORS error response
 */
export function createDynamicCorsErrorResponse(error, req = null, status = 500) {
  const requestOrigin = req?.headers?.get('origin') || '*';
  const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
  
  return new Response(JSON.stringify({ 
    success: false, 
    error: errorMessage,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Headers': COMPREHENSIVE_HEADER_BASELINE.join(', '),
      'Content-Type': 'application/json',
    }
  });
}

// Standard CORS headers for backward compatibility
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': COMPREHENSIVE_HEADER_BASELINE.join(', '),
};