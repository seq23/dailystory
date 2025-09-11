// Header Monitoring Utilities for Edge Function Request Analysis
// Provides request monitoring and aggregation capabilities

/**
 * Global in-memory header aggregator for monitoring patterns
 */
export const globalHeaderMonitor = {
  requests: new Map(),
  
  addRequest(functionName, headers, timestamp = Date.now()) {
    if (!this.requests.has(functionName)) {
      this.requests.set(functionName, []);
    }
    
    const functionRequests = this.requests.get(functionName);
    functionRequests.push({
      timestamp,
      origin: headers.get('origin') || 'unknown',
      userAgent: headers.get('user-agent') || 'unknown',
      referer: headers.get('referer') || 'direct',
      contentType: headers.get('content-type') || 'none'
    });
    
    // Keep only last 100 requests per function to prevent memory bloat
    if (functionRequests.length > 100) {
      functionRequests.splice(0, functionRequests.length - 100);
    }
  },
  
  getStats(functionName) {
    const requests = this.requests.get(functionName) || [];
    const now = Date.now();
    const last24h = requests.filter(r => (now - r.timestamp) < 86400000);
    const lastHour = requests.filter(r => (now - r.timestamp) < 3600000);
    
    return {
      total: requests.length,
      last24h: last24h.length,
      lastHour: lastHour.length,
      origins: [...new Set(requests.map(r => r.origin))],
      userAgents: [...new Set(requests.map(r => r.userAgent))].slice(0, 10) // Limit for privacy
    };
  }
};

/**
 * Monitor and log request details for a specific function
 */
export function monitorRequest(request, functionName) {
  try {
    const headers = request.headers;
    const timestamp = Date.now();
    
    // Add to global monitor
    globalHeaderMonitor.addRequest(functionName, headers, timestamp);
    
    // Log request details
    console.log(`📊 ${functionName} request monitored:`, {
      timestamp: new Date(timestamp).toISOString(),
      method: request.method,
      origin: headers.get('origin') || 'unknown',
      userAgent: headers.get('user-agent')?.substring(0, 50) + '...' || 'unknown',
      contentType: headers.get('content-type') || 'none'
    });
    
  } catch (error) {
    console.warn(`⚠️ Header monitoring failed for ${functionName}:`, error.message);
  }
}
