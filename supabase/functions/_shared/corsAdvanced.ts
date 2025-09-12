// ============================================================================
// BULLETPROOF DYNAMIC CORS SYSTEM - Master Plan Implementation
// ============================================================================
// Auto-detects and handles ALL possible browser/client headers dynamically
// Zero maintenance, future-proof, self-adapting CORS solution

import { createCorsResponse, createCorsErrorResponse } from "./cors.js";

// Comprehensive baseline of all known browser and Supabase client headers
export const COMPREHENSIVE_HEADER_BASELINE = [
  // Authentication & API
  'authorization', 'apikey', 'x-client-info', 'x-supabase-info',
  
  // Content handling
  'content-type', 'content-length', 'content-encoding', 'content-language',
  
  // Standard browser headers
  'accept', 'accept-encoding', 'accept-language', 'accept-charset',
  'user-agent', 'referer', 'origin', 'host',
  
  // Request control
  'x-requested-with', 'x-forwarded-for', 'x-forwarded-proto', 'x-real-ip',
  
  // Caching
  'cache-control', 'pragma', 'expires', 'if-modified-since', 'if-none-match',
  'if-match', 'if-unmodified-since', 'if-range',
  
  // CORS & Security
  'access-control-request-headers', 'access-control-request-method',
  
  // Network & Performance
  'connection', 'keep-alive', 'upgrade-insecure-requests',
  
  // Mobile & Modern browsers
  'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest', 'sec-ch-ua',
  'sec-ch-ua-mobile', 'sec-ch-ua-platform',
  
  // Custom application headers (common patterns)
  'x-api-key', 'x-session-id', 'x-request-id', 'x-correlation-id'
];

// Header monitoring for auto-discovery
const headerUsageStats: Record<string, number> = {};
const newHeadersDiscovered: Set<string> = new Set();

// Dynamic CORS configuration
interface DynamicCorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  maxAge: number;
  exposeHeaders: string[];
  autoDetectHeaders: boolean;
  logNewHeaders: boolean;
  enableMonitoring: boolean;
}

const DEFAULT_CORS_CONFIG: DynamicCorsConfig = {
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  maxAge: 86400,
  exposeHeaders: [
    'content-length', 'date', 'server', 'x-ratelimit-limit', 
    'x-ratelimit-remaining', 'x-ratelimit-reset', 'x-request-id'
  ],
  autoDetectHeaders: true,
  logNewHeaders: true,
  enableMonitoring: true
};

/**
 * AUTO-DETECT HEADERS FROM PREFLIGHT REQUEST
 * Dynamically mirrors back ALL requested headers from Access-Control-Request-Headers
 */
function extractRequestedHeaders(request: Request): string[] {
  const requestedHeaders = request.headers.get('Access-Control-Request-Headers');
  
  if (!requestedHeaders) {
    return COMPREHENSIVE_HEADER_BASELINE;
  }
  
  // Parse comma-separated header list from preflight request
  const detectedHeaders = requestedHeaders
    .split(',')
    .map(header => header.trim().toLowerCase())
    .filter(header => header.length > 0);
  
  // Log new headers for monitoring
  detectedHeaders.forEach(header => {
    if (!COMPREHENSIVE_HEADER_BASELINE.includes(header)) {
      if (DEFAULT_CORS_CONFIG.logNewHeaders) {
        console.log(`🆕 New header detected: ${header}`);
        newHeadersDiscovered.add(header);
      }
    }
    
    // Track usage statistics
    if (DEFAULT_CORS_CONFIG.enableMonitoring) {
      headerUsageStats[header] = (headerUsageStats[header] || 0) + 1;
    }
  });
  
  // Combine detected headers with comprehensive baseline
  const allHeaders = [...new Set([...COMPREHENSIVE_HEADER_BASELINE, ...detectedHeaders])];
  
  return allHeaders;
}

/**
 * GENERATE DYNAMIC CORS HEADERS
 * Creates CORS headers that auto-adapt to the incoming request
 */
function generateDynamicCorsHeaders(request: Request, config: Partial<DynamicCorsConfig> = {}): Record<string, string> {
  const finalConfig = { ...DEFAULT_CORS_CONFIG, ...config };
  
  // Auto-detect headers from preflight request
  const allowedHeaders = finalConfig.autoDetectHeaders 
    ? extractRequestedHeaders(request)
    : COMPREHENSIVE_HEADER_BASELINE;
  
  // Dynamic origin handling (can be enhanced for specific origins)
  const origin = request.headers.get('Origin');
  const allowedOrigin = finalConfig.allowedOrigins.includes('*') ? '*' : 
    (finalConfig.allowedOrigins.includes(origin || '') ? origin : finalConfig.allowedOrigins[0]);
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Allow-Methods': finalConfig.allowedMethods.join(', '),
    'Access-Control-Max-Age': finalConfig.maxAge.toString(),
    'Access-Control-Expose-Headers': finalConfig.exposeHeaders.join(', '),
    'Vary': 'Origin, Access-Control-Request-Headers',
    'X-CORS-Auto-Detected': `${allowedHeaders.length} headers`,
    'X-CORS-Timestamp': new Date().toISOString()
  };
}

/**
 * BULLETPROOF CORS OPTIONS HANDLER
 * Handles ALL preflight requests with dynamic header detection
 */
export function createDynamicCorsOptionsResponse(request: Request, config?: Partial<DynamicCorsConfig>): Response {
  const corsHeaders = generateDynamicCorsHeaders(request, config);
  
  console.log(`🔄 Dynamic CORS preflight handled:`, {
    requestedHeaders: request.headers.get('Access-Control-Request-Headers'),
    allowedHeaders: corsHeaders['Access-Control-Allow-Headers'],
    autoDetected: corsHeaders['X-CORS-Auto-Detected'],
    timestamp: corsHeaders['X-CORS-Timestamp']
  });
  
  return new Response(null, { 
    status: 200, 
    headers: corsHeaders 
  });
}

/**
 * ENHANCED CORS RESPONSE WITH DYNAMIC HEADERS
 * All successful responses include the same dynamic CORS headers
 */
export function createDynamicCorsResponse(data: any, request: Request, status = 200, config?: Partial<DynamicCorsConfig>): Response {
  const corsHeaders = generateDynamicCorsHeaders(request, config);
  
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  };
  
  return new Response(JSON.stringify(data), { status, headers });
}

/**
 * ENHANCED ERROR RESPONSE WITH DYNAMIC CORS
 */
export function createDynamicCorsErrorResponse(error: string | Error, request: Request, status = 500, config?: Partial<DynamicCorsConfig>): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error with dynamic CORS:', errorMessage);
  
  return createDynamicCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, request, status, config);
}

/**
 * HEADER MONITORING & ANALYTICS
 * Get insights into header usage patterns
 */
export function getCorsMonitoringStats() {
  return {
    headerUsageStats: { ...headerUsageStats },
    newHeadersDiscovered: Array.from(newHeadersDiscovered),
    totalHeadersTracked: Object.keys(headerUsageStats).length,
    baselineHeaders: COMPREHENSIVE_HEADER_BASELINE.length,
    monitoringSince: DEFAULT_CORS_CONFIG.enableMonitoring,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * CORS VALIDATION UTILITY
 * Test if a request would be allowed by our CORS policy
 */
export function validateCorsRequest(request: Request): { allowed: boolean; reason?: string; headers: string[] } {
  const origin = request.headers.get('Origin');
  const method = request.method;
  const requestedHeaders = request.headers.get('Access-Control-Request-Headers');
  
  const allowedHeaders = extractRequestedHeaders(request);
  
  return {
    allowed: true, // Our system allows all by design
    headers: allowedHeaders,
    reason: `Dynamic CORS allows all origins and auto-detects ${allowedHeaders.length} headers`
  };
}

/**
 * CORS TESTING ENDPOINT DATA
 * Provides comprehensive CORS testing information
 */
export function generateCorsTestingInfo(request: Request) {
  const validation = validateCorsRequest(request);
  const stats = getCorsMonitoringStats();
  
  return {
    corsStatus: 'BULLETPROOF_DYNAMIC',
    validation,
    monitoring: stats,
    request: {
      method: request.method,
      origin: request.headers.get('Origin'),
      userAgent: request.headers.get('User-Agent'),
      requestedHeaders: request.headers.get('Access-Control-Request-Headers')
    },
    systemCapabilities: [
      'Auto-header-detection',
      'Zero-maintenance',
      'Future-proof',
      'Browser-agnostic',
      'Comprehensive-logging',
      'Real-time-monitoring'
    ],
    lastUpdate: new Date().toISOString()
  };
}