// ============================================================================
// HEADER MONITORING & ANALYTICS SYSTEM
// ============================================================================
// Tracks all incoming headers across all edge functions for CORS optimization

interface HeaderAnalytics {
  headerName: string;
  usageCount: number;
  firstSeen: string;
  lastSeen: string;
  functions: string[];
  browsers: string[];
  origins: string[];
}

interface MonitoringSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  totalRequests: number;
  uniqueHeaders: Set<string>;
  functionsAccessed: Set<string>;
}

class HeaderMonitoringService {
  private headerAnalytics: Map<string, HeaderAnalytics> = new Map();
  private activeSessions: Map<string, MonitoringSession> = new Map();
  private monitoringEnabled = true;
  
  /**
   * TRACK INCOMING REQUEST HEADERS
   * Call this from every edge function to build comprehensive header database
   */
  trackRequest(request: Request, functionName: string) {
    if (!this.monitoringEnabled) return;
    
    const timestamp = new Date().toISOString();
    const origin = request.headers.get('Origin') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    const sessionId = this.generateSessionId(request);
    
    // Track session
    this.trackSession(sessionId, functionName);
    
    // Analyze all headers in the request
    request.headers.forEach((value, headerName) => {
      this.recordHeaderUsage(
        headerName.toLowerCase(), 
        functionName, 
        origin, 
        userAgent, 
        timestamp
      );
    });
    
    // Log comprehensive request info
    console.log(`📊 Header Monitor [${functionName}]:`, {
      sessionId,
      origin,
      method: request.method,
      headerCount: Array.from(request.headers.keys()).length,
      uniqueHeaders: Array.from(request.headers.keys()).length,
      timestamp
    });
  }
  
  /**
   * RECORD HEADER USAGE ANALYTICS
   */
  private recordHeaderUsage(
    headerName: string, 
    functionName: string, 
    origin: string, 
    userAgent: string, 
    timestamp: string
  ) {
    let analytics = this.headerAnalytics.get(headerName);
    
    if (!analytics) {
      analytics = {
        headerName,
        usageCount: 0,
        firstSeen: timestamp,
        lastSeen: timestamp,
        functions: [],
        browsers: [],
        origins: []
      };
      this.headerAnalytics.set(headerName, analytics);
    }
    
    // Update analytics
    analytics.usageCount++;
    analytics.lastSeen = timestamp;
    
    // Track unique functions
    if (!analytics.functions.includes(functionName)) {
      analytics.functions.push(functionName);
    }
    
    // Track unique origins
    if (!analytics.origins.includes(origin)) {
      analytics.origins.push(origin);
    }
    
    // Extract browser info from user agent (simplified)
    const browser = this.extractBrowserInfo(userAgent);
    if (!analytics.browsers.includes(browser)) {
      analytics.browsers.push(browser);
    }
  }
  
  /**
   * TRACK SESSION ACTIVITY
   */
  private trackSession(sessionId: string, functionName: string) {
    let session = this.activeSessions.get(sessionId);
    
    if (!session) {
      session = {
        sessionId,
        startTime: new Date().toISOString(),
        totalRequests: 0,
        uniqueHeaders: new Set(),
        functionsAccessed: new Set()
      };
      this.activeSessions.set(sessionId, session);
    }
    
    session.totalRequests++;
    session.functionsAccessed.add(functionName);
  }
  
  /**
   * GENERATE SESSION ID FROM REQUEST
   */
  private generateSessionId(request: Request): string {
    const origin = request.headers.get('Origin') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Simple hash-based session ID
    const sessionData = `${origin}-${userAgent.substring(0, 50)}-${ip}`;
    return btoa(sessionData).substring(0, 16);
  }
  
  /**
   * EXTRACT BROWSER INFO FROM USER AGENT
   */
  private extractBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }
  
  /**
   * GET COMPREHENSIVE ANALYTICS REPORT
   */
  getAnalyticsReport() {
    const sortedHeaders = Array.from(this.headerAnalytics.values())
      .sort((a, b) => b.usageCount - a.usageCount);
    
    const activeSessions = Array.from(this.activeSessions.values())
      .filter(session => !session.endTime);
    
    return {
      totalHeadersTracked: this.headerAnalytics.size,
      totalRequests: Array.from(this.activeSessions.values())
        .reduce((sum, session) => sum + session.totalRequests, 0),
      activeSessionsCount: activeSessions.length,
      
      topHeaders: sortedHeaders.slice(0, 20).map(h => ({
        name: h.headerName,
        usage: h.usageCount,
        functions: h.functions.length,
        browsers: h.browsers.length,
        origins: h.origins.length
      })),
      
      functionUsage: this.getFunctionUsageStats(),
      browserDistribution: this.getBrowserDistribution(),
      originDistribution: this.getOriginDistribution(),
      
      recentActivity: sortedHeaders
        .filter(h => new Date(h.lastSeen) > new Date(Date.now() - 60000))
        .length,
      
      reportGenerated: new Date().toISOString()
    };
  }
  
  /**
   * GET MISSING HEADERS ANALYSIS
   * Compare our baseline against actual usage
   */
  getMissingHeadersAnalysis(baselineHeaders: string[]) {
    const actualHeaders = new Set(this.headerAnalytics.keys());
    
    const missingFromBaseline = baselineHeaders.filter(header => 
      !actualHeaders.has(header.toLowerCase())
    );
    
    const extraHeaders = Array.from(actualHeaders).filter(header =>
      !baselineHeaders.map(h => h.toLowerCase()).includes(header)
    );
    
    return {
      missingFromBaseline,
      extraHeaders,
      baselineSize: baselineHeaders.length,
      actualSize: actualHeaders.size,
      coveragePercentage: Math.round(
        (actualHeaders.size / baselineHeaders.length) * 100
      )
    };
  }
  
  /**
   * FUNCTION USAGE STATISTICS
   */
  private getFunctionUsageStats() {
    const functionStats: Record<string, number> = {};
    
    this.headerAnalytics.forEach(analytics => {
      analytics.functions.forEach(func => {
        functionStats[func] = (functionStats[func] || 0) + analytics.usageCount;
      });
    });
    
    return functionStats;
  }
  
  /**
   * BROWSER DISTRIBUTION ANALYTICS
   */
  private getBrowserDistribution() {
    const browserStats: Record<string, number> = {};
    
    this.headerAnalytics.forEach(analytics => {
      analytics.browsers.forEach(browser => {
        browserStats[browser] = (browserStats[browser] || 0) + 1;
      });
    });
    
    return browserStats;
  }
  
  /**
   * ORIGIN DISTRIBUTION ANALYTICS
   */
  private getOriginDistribution() {
    const originStats: Record<string, number> = {};
    
    this.headerAnalytics.forEach(analytics => {
      analytics.origins.forEach(origin => {
        originStats[origin] = (originStats[origin] || 0) + 1;
      });
    });
    
    return originStats;
  }
  
  /**
   * CLEANUP OLD DATA
   */
  cleanup(retentionHours = 24) {
    const cutoffTime = new Date(Date.now() - (retentionHours * 60 * 60 * 1000));
    
    // Clean up old sessions
    this.activeSessions.forEach((session, sessionId) => {
      if (new Date(session.startTime) < cutoffTime) {
        this.activeSessions.delete(sessionId);
      }
    });
    
    console.log(`🧹 Header Monitor cleanup: Removed sessions older than ${retentionHours} hours`);
  }
  
  /**
   * ENABLE/DISABLE MONITORING
   */
  setMonitoring(enabled: boolean) {
    this.monitoringEnabled = enabled;
    console.log(`📊 Header monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Global instance for all edge functions to use
export const globalHeaderMonitor = new HeaderMonitoringService();

/**
 * CONVENIENCE FUNCTION FOR EDGE FUNCTIONS
 * Add this single line to any edge function to enable monitoring
 */
export function monitorRequest(request: Request, functionName: string) {
  globalHeaderMonitor.trackRequest(request, functionName);
}

/**
 * PERIODIC CLEANUP UTILITY
 * Call periodically to prevent memory bloat
 */
export function performHeaderMonitorCleanup() {
  globalHeaderMonitor.cleanup();
}