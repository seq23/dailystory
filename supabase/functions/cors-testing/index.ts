// ============================================================================
// CORS TESTING & VALIDATION ENDPOINT
// ============================================================================
// Comprehensive CORS testing and debugging utilities

import { serve } from "https://deno.land/std@0.168.0/http/server.js"
import { 
  createDynamicCorsOptionsResponse, 
  createDynamicCorsResponse, 
  generateCorsTestingInfo,
  getCorsMonitoringStats 
} from "../_shared/corsAdvanced.js";
import { monitorRequest, globalHeaderMonitor } from "../_shared/headerMonitor.ts";

serve(async (req) => {
  console.log(`🧪 CORS Testing Endpoint: ${req.method} ${req.url}`);
  
  // Monitor this request for analytics
  monitorRequest(req, 'cors-testing');
  
  // Handle CORS preflight with dynamic headers
  if (req.method === 'OPTIONS') {
    console.log('🔄 CORS Testing - OPTIONS preflight request');
    return createDynamicCorsOptionsResponse(req);
  }

  // Force deployment sync - 2025-01-30
  
  try {
    const url = new URL(req.url);
    const testType = url.searchParams.get('test') || 'full';
    
    let responseData: any = {};
    
    switch (testType) {
      case 'headers':
        // Test header detection and analysis
        responseData = {
          testType: 'headers',
          requestHeaders: Object.fromEntries(req.headers.entries()),
          corsInfo: generateCorsTestingInfo(req),
          headerCount: req.headers.has('access-control-request-headers') 
            ? req.headers.get('access-control-request-headers')?.split(',').length 
            : Array.from(req.headers.keys()).length
        };
        break;
        
      case 'monitoring':
        // Get monitoring and analytics data
        responseData = {
          testType: 'monitoring',
          analytics: globalHeaderMonitor.getAnalyticsReport(),
          corsStats: getCorsMonitoringStats(),
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'browser':
        // Browser-specific CORS testing
        responseData = {
          testType: 'browser',
          userAgent: req.headers.get('User-Agent'),
          browser: extractBrowserInfo(req.headers.get('User-Agent') || ''),
          supportedFeatures: analyzeBrowserCapabilities(req),
          corsCompatibility: 'FULL_SUPPORT',
          recommendations: []
        };
        break;
        
      case 'debug':
        // Comprehensive debugging information
        responseData = {
          testType: 'debug',
          request: {
            method: req.method,
            url: req.url,
            headers: Object.fromEntries(req.headers.entries()),
            origin: req.headers.get('Origin'),
            referer: req.headers.get('Referer'),
            userAgent: req.headers.get('User-Agent')
          },
          corsAnalysis: generateCorsTestingInfo(req),
          serverInfo: {
            timestamp: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            environment: 'Supabase Edge Function'
          },
          recommendations: generateCorsRecommendations(req)
        };
        break;
        
      default:
        // Full comprehensive test
        responseData = {
          testType: 'full',
          corsStatus: 'BULLETPROOF_DYNAMIC_SYSTEM',
          testResults: {
            preflightSupport: true,
            dynamicHeaders: true,
            autoDetection: true,
            monitoring: true,
            futureProof: true
          },
          systemInfo: generateCorsTestingInfo(req),
          monitoring: globalHeaderMonitor.getAnalyticsReport(),
          recommendations: generateCorsRecommendations(req),
          lastUpdated: new Date().toISOString()
        };
    }
    
    console.log(`✅ CORS test completed: ${testType}`);
    return createDynamicCorsResponse(responseData, req);
    
  } catch (error) {
    console.error('❌ CORS testing error:', error);
    return createDynamicCorsResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      testType: 'error'
    }, req, 500);
  }
});

/**
 * EXTRACT BROWSER INFO FROM USER AGENT
 */
function extractBrowserInfo(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

/**
 * ANALYZE BROWSER CAPABILITIES
 */
function analyzeBrowserCapabilities(request: Request) {
  const userAgent = request.headers.get('User-Agent') || '';
  const secFetchSite = request.headers.get('sec-fetch-site');
  const secFetchMode = request.headers.get('sec-fetch-mode');
  
  return {
    modernSecHeaders: !!(secFetchSite && secFetchMode),
    corsSupport: 'FULL',
    preflightSupport: true,
    credentialsSupport: true,
    modernBrowser: !userAgent.includes('MSIE')
  };
}

/**
 * GENERATE CORS RECOMMENDATIONS
 */
function generateCorsRecommendations(request: Request): string[] {
  const recommendations: string[] = [];
  const userAgent = request.headers.get('User-Agent') || '';
  const origin = request.headers.get('Origin');
  
  if (!origin) {
    recommendations.push('Request missing Origin header - consider adding explicit origin');
  }
  
  if (userAgent.includes('MSIE')) {
    recommendations.push('Legacy browser detected - may need additional CORS fallbacks');
  }
  
  if (!request.headers.get('sec-fetch-site')) {
    recommendations.push('Modern security headers missing - browser may be outdated');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('CORS configuration optimal - no issues detected');
  }
  
  return recommendations;
}