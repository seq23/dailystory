/**
 * Security Validator - Phase 4 Implementation
 * Handles security validation, rate limiting, and request authentication
 */

// Types and interfaces
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  status?: number;
}

export interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

export interface RateLimitData {
  requests: number[];
  windowStart: number;
}

export interface RateLimitResult {
  allowed: boolean;
  resetTime?: number;
  current?: number;
  limit?: number;
}

export interface RateLimitStatus {
  requests: number;
  limit: number;
  resetTime: number | null;
}

export interface ImageRequestParams {
  pageText: string;
  sessionId: string;
  pageNumber: number;
  userInfo?: any;
}

export interface ContentValidationResult {
  valid: boolean;
  reason?: string;
}

// Rate limiting storage (simple in-memory for demo, would use Redis/DB in production)
const rateLimitStore = new Map<string, RateLimitData>();
const sessionValidityStore = new Map<string, number>();

export class SecurityValidator {
  
  // Rate limits by operation type
  static RATE_LIMITS: Record<string, RateLimitConfig> = {
    image_generation: { requests: 50, windowMs: 60000 }, // 50 requests per minute
    discount_validation: { requests: 10, windowMs: 60000 }, // 10 requests per minute
    story_generation: { requests: 20, windowMs: 60000 } // 20 requests per minute
  };

  /**
   * Validate image generation request
   */
  static async validateImageRequest(req: Request, params: ImageRequestParams): Promise<ValidationResult> {
    const { pageText, sessionId, pageNumber, userInfo } = params;
    
    console.log(`🛡️ SecurityValidator - Validating request for session: ${sessionId}`);
    
    // 1. Basic parameter validation
    if (!sessionId || sessionId.length < 8) {
      return { valid: false, reason: 'Invalid session ID format', status: 400 };
    }
    
    if (!pageText || pageText.length < 10) {
      return { valid: false, reason: 'Invalid page text content', status: 400 };
    }
    
    if (pageNumber < 1 || pageNumber > 100) {
      return { valid: false, reason: 'Invalid page number', status: 400 };
    }
    
    // 2. Content validation - check for malicious content
    const contentCheck = this.validateContent(pageText);
    if (!contentCheck.valid) {
      return { valid: false, reason: `Content validation failed: ${contentCheck.reason}`, status: 400 };
    }
    
    // 3. Request origin validation
    const origin = req.headers.get('origin');
    const userAgent = req.headers.get('user-agent');
    
    if (!userAgent || userAgent.length < 10) {
      return { valid: false, reason: 'Invalid user agent', status: 403 };
    }
    
    // 4. Session freshness check (prevent replay attacks)
    const now = Date.now();
    const sessionKey = `session_${sessionId}`;
    const lastRequest = sessionValidityStore.get(sessionKey);
    
    if (lastRequest && (now - lastRequest) < 1000) {
      return { valid: false, reason: 'Request too frequent', status: 429 };
    }
    
    sessionValidityStore.set(sessionKey, now);
    
    // 5. Payload size validation
    const requestSize = JSON.stringify(params).length;
    if (requestSize > 50000) { // 50KB limit
      return { valid: false, reason: 'Request payload too large', status: 413 };
    }
    
    console.log(`✅ Security validation passed for session: ${sessionId}`);
    return { valid: true };
  }
  
  /**
   * Check rate limits for specific operations
   */
  static async checkRateLimit(identifier: string, operationType: string): Promise<RateLimitResult> {
    const limits = this.RATE_LIMITS[operationType];
    if (!limits) {
      console.log(`⚠️ No rate limit defined for operation: ${operationType}`);
      return { allowed: true };
    }
    
    const now = Date.now();
    const key = `${operationType}_${identifier}`;
    
    // Get current rate limit data
    let rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData) {
      rateLimitData = { requests: [], windowStart: now };
      rateLimitStore.set(key, rateLimitData);
    }
    
    // Clean old requests outside the window
    const windowStart = now - limits.windowMs;
    rateLimitData.requests = rateLimitData.requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (rateLimitData.requests.length >= limits.requests) {
      console.log(`🚨 Rate limit exceeded for ${key}: ${rateLimitData.requests.length}/${limits.requests}`);
      return { 
        allowed: false, 
        resetTime: rateLimitData.requests[0] + limits.windowMs,
        current: rateLimitData.requests.length,
        limit: limits.requests
      };
    }
    
    // Add current request
    rateLimitData.requests.push(now);
    rateLimitStore.set(key, rateLimitData);
    
    console.log(`✅ Rate limit check passed for ${key}: ${rateLimitData.requests.length}/${limits.requests}`);
    return { 
      allowed: true,
      current: rateLimitData.requests.length,
      limit: limits.requests,
      resetTime: windowStart + limits.windowMs
    };
  }
  
  /**
   * Validate content for malicious patterns
   */
  static validateContent(content: string): ContentValidationResult {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
      /javascript:/gi, // JavaScript URLs
      /on\w+\s*=/gi, // Event handlers
      /data:text\/html/gi, // Data URLs
      /vbscript:/gi, // VBScript
      /expression\s*\(/gi, // CSS expressions
      /import\s+['"]/gi, // ES6 imports (in content)
      /eval\s*\(/gi, // Eval functions
      /setTimeout|setInterval/gi, // Timer functions
      /document\.|window\.|location\./gi // DOM manipulation
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        return { valid: false, reason: 'Suspicious content pattern detected' };
      }
    }
    
    // Check content length
    if (content.length > 10000) {
      return { valid: false, reason: 'Content too long' };
    }
    
    // Check for excessive repetition (potential spam)
    const words = content.toLowerCase().split(/\s+/);
    const wordCounts: Record<string, number> = {};
    let maxRepeats = 0;
    
    words.forEach(word => {
      if (word.length > 3) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
        maxRepeats = Math.max(maxRepeats, wordCounts[word]);
      }
    });
    
    if (maxRepeats > 20) {
      return { valid: false, reason: 'Excessive word repetition detected' };
    }
    
    return { valid: true };
  }
  
  /**
   * Clean up old rate limit data (call periodically)
   */
  static cleanupRateLimitData(): void {
    const now = Date.now();
    const maxAge = Math.max(...Object.values(this.RATE_LIMITS).map(limit => limit.windowMs)) * 2;
    
    for (const [key, data] of rateLimitStore.entries()) {
      if (now - data.windowStart > maxAge) {
        rateLimitStore.delete(key);
      }
    }
    
    for (const [key, timestamp] of sessionValidityStore.entries()) {
      if (now - timestamp > 300000) { // 5 minutes
        sessionValidityStore.delete(key);
      }
    }
    
    console.log(`🧹 Cleaned up rate limit data. Active entries: ${rateLimitStore.size}`);
  }
  
  /**
   * Get rate limit status for monitoring
   */
  static getRateLimitStatus(identifier: string, operationType: string): RateLimitStatus {
    const key = `${operationType}_${identifier}`;
    const data = rateLimitStore.get(key);
    const limits = this.RATE_LIMITS[operationType];
    
    if (!data || !limits) {
      return { requests: 0, limit: limits?.requests || 0, resetTime: null };
    }
    
    const now = Date.now();
    const validRequests = data.requests.filter(timestamp => timestamp > now - limits.windowMs);
    
    return {
      requests: validRequests.length,
      limit: limits.requests,
      resetTime: validRequests.length > 0 ? validRequests[0] + limits.windowMs : null
    };
  }
}

// Cleanup rate limit data every 5 minutes
setInterval(() => {
  SecurityValidator.cleanupRateLimitData();
}, 300000);