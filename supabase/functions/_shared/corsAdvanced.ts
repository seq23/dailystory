/**
 * ============================================================================
 * COMPREHENSIVE CROSS-ORIGIN RESOURCE SHARING (CORS) SYSTEM - TYPESCRIPT
 * ============================================================================
 * 
 * Dynamic CORS system that automatically detects and allows all necessary 
 * headers and origins, ensuring seamless integration with various clients
 * without manual configuration. This provides TypeScript support for edge
 * functions that need typed CORS handling.
 * 
 * STATUS: PHASE 5 - CORS Option 3 Implementation  
 * SUPPORTS: TypeScript Edge Functions
 * COMPANION: corsAdvanced.js (for JavaScript functions)
 * 
 * KEY FEATURES:
 * - Automatic header detection and allowance
 * - Origin auto-detection with wildcard support
 * - Comprehensive header baseline covering modern browsers
 * - Request monitoring and new header discovery
 * - Structured error responses with CORS fallback
 * 
 * ============================================================================
 */

// ============= COMPREHENSIVE HEADER BASELINE =============
const COMPREHENSIVE_HEADER_BASELINE: string[] = [
  // Standard request headers
  'accept', 'accept-encoding', 'accept-language', 'authorization', 'cache-control', 
  'content-type', 'origin', 'referer', 'user-agent', 'x-requested-with',
  
  // Supabase specific headers
  'apikey', 'x-client-info', 'x-supabase-auth', 'supabase-auth-token', 
  'authorization-bearer', 'x-api-key',
  
  // Security headers
  'x-csrf-token', 'x-xsrf-token', 'x-frame-options', 'x-content-type-options',
  
  // Performance & caching
  'if-none-match', 'if-modified-since', 'pragma', 'expires',
  
  // Custom application headers
  'x-custom-header', 'x-app-version', 'x-device-id', 'x-session-id',
  
  // Modern browser features
  'sec-fetch-dest', 'sec-fetch-mode', 'sec-fetch-site', 'sec-ch-ua',
  'sec-ch-ua-mobile', 'sec-ch-ua-platform', 'dnt', 'upgrade-insecure-requests'
];

// ============= CORS CONFIGURATION =============
interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  maxAge: number;
  exposedHeaders: string[];
  autoDetectHeaders: boolean;
  enableLogging: boolean;
  enableMonitoring: boolean;
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  maxAge: 86400, // 24 hours
  exposedHeaders: ['x-request-id', 'x-response-time'],
  autoDetectHeaders: true,
  enableLogging: true,
  enableMonitoring: true
};

// ============= MONITORING SYSTEM =============
let headerUsageStats: Record<string, number> = {};
let newHeadersDiscovered: string[] = [];

// ============= HEADER EXTRACTION LOGIC =============
function extractRequestedHeaders(request: Request): string[] {
  const requestedHeaders = request.headers.get('Access-Control-Request-Headers');
  
  if (!requestedHeaders) {
    return [...COMPREHENSIVE_HEADER_BASELINE];
  }
  
  const parsedHeaders = requestedHeaders
    .toLowerCase()
    .split(',')
    .map(header => header.trim())
    .filter(header => header.length > 0);
  
  // Track usage statistics
  if (DEFAULT_CORS_CONFIG.enableMonitoring) {
    parsedHeaders.forEach(header => {
      headerUsageStats[header] = (headerUsageStats[header] || 0) + 1;
    });
    
    // Detect new headers not in our baseline
    const newHeaders = parsedHeaders.filter(header => 
      !COMPREHENSIVE_HEADER_BASELINE.includes(header) &&
      !newHeadersDiscovered.includes(header)
    );
    
    if (newHeaders.length > 0) {
      newHeadersDiscovered.push(...newHeaders);
      if (DEFAULT_CORS_CONFIG.enableLogging) {
        console.log('🔍 CORS: New headers discovered:', newHeaders);
      }
    }
  }
  
  // Combine requested headers with our comprehensive baseline
  const allHeaders = [...new Set([...COMPREHENSIVE_HEADER_BASELINE, ...parsedHeaders])];
  
  return allHeaders;
}

// ============= DYNAMIC CORS HEADER GENERATION =============
function generateDynamicCorsHeaders(request: Request, config: CorsConfig = DEFAULT_CORS_CONFIG): Record<string, string> {
  const origin = request.headers.get('Origin');
  const allowedHeaders = config.autoDetectHeaders 
    ? extractRequestedHeaders(request)
    : COMPREHENSIVE_HEADER_BASELINE;
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': config.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Max-Age': '86400', // 24 hours cache
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin, Access-Control-Request-Headers',
    'Accept-Ranges': 'bytes'
  };
  
  if (config.exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ');
  }
  
  return headers;
}

// ============= PREFLIGHT OPTIONS RESPONSE =============
export function createDynamicCorsOptionsResponse(
  request: Request, 
  config: CorsConfig = DEFAULT_CORS_CONFIG
): Response {
  const corsHeaders = generateDynamicCorsHeaders(request, config);
  
  if (config.enableLogging) {
    console.log('🔄 CORS: Preflight request handled for origin:', 
      request.headers.get('Origin') || 'unknown');
  }
  
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}

// ============= SUCCESS RESPONSE WITH CORS =============
export function createDynamicCorsResponse(
  data: any,
  request: Request,
  status: number = 200,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): Response {
  const corsHeaders = generateDynamicCorsHeaders(request, config);
  
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// ============= ERROR RESPONSE WITH CORS =============
export function createDynamicCorsErrorResponse(
  error: any,
  request?: Request,
  status: number = 500,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): Response {
  // Fallback CORS headers if request is not available
  const fallbackHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
    'Access-Control-Allow-Headers': COMPREHENSIVE_HEADER_BASELINE.join(', '),
    'Access-Control-Allow-Credentials': 'true'
  };
  
  const corsHeaders = request 
    ? generateDynamicCorsHeaders(request, config)
    : fallbackHeaders;
  
  const errorResponse = {
    success: false,
    error: typeof error === 'string' ? error : error?.message || 'An error occurred',
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// ============= MONITORING STATISTICS =============
export function getCorsMonitoringStats(): {
  headerUsage: Record<string, number>;
  newHeadersDiscovered: string[];
  totalRequests: number;
  monitoringEnabled: boolean;
} {
  return {
    headerUsage: { ...headerUsageStats },
    newHeadersDiscovered: [...newHeadersDiscovered],
    totalRequests: Object.values(headerUsageStats).reduce((sum, count) => sum + count, 0),
    monitoringEnabled: DEFAULT_CORS_CONFIG.enableMonitoring
  };
}

// ============= CORS REQUEST VALIDATION =============
export function validateCorsRequest(request: Request): boolean {
  // In this dynamic system, we allow all requests by default
  // This can be customized based on specific security requirements
  return true;
}

// ============= CORS TESTING INFORMATION =============
export function generateCorsTestingInfo(request: Request): {
  status: string;
  origin: string | null;
  requestedHeaders: string[];
  allowedHeaders: string[];
  monitoring: any;
  validation: boolean;
  system: string;
} {
  const origin = request.headers.get('Origin');
  const requestedHeaders = extractRequestedHeaders(request);
  
  return {
    status: 'CORS system operational',
    origin,
    requestedHeaders,
    allowedHeaders: COMPREHENSIVE_HEADER_BASELINE,
    monitoring: getCorsMonitoringStats(),
    validation: validateCorsRequest(request),
    system: 'TypeScript Dynamic CORS v1.0'
  };
}

// ============= EXPORT DEFAULT CONFIGURATION =============
export { DEFAULT_CORS_CONFIG };
export type { CorsConfig };
export type { CorsConfig as CorsConfiguration };

// ============= USAGE EXAMPLE =============
/*
// TypeScript Edge Function Usage:

import { createDynamicCorsOptionsResponse, createDynamicCorsResponse, createDynamicCorsErrorResponse } from '../_shared/corsAdvanced.ts';

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createDynamicCorsOptionsResponse(req);
  }

  try {
    // Your function logic here
    const result = { success: true, data: 'Hello World' };
    return createDynamicCorsResponse(result, req);
  } catch (error) {
    return createDynamicCorsErrorResponse(error, req, 500);
  }
});
*/