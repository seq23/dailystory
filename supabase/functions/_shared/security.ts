// Force clean redeployment: 2025-01-23T02:45:00Z
/**
 * Enhanced Security Middleware for Supabase Edge Functions
 * Provides JWT validation, rate limiting, security headers, and audit logging
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

// Enhanced CORS headers with security policies
export const secureHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS', // ERROR-001 FIX: Added HEAD
  'Access-Control-Max-Age': '600', // ERROR-001 FIX: Changed from 86400 to 600 (10 minutes)
  
  // Security Headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  
  // Content Security Policy
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self';",
  
  // HSTS for production
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export interface SecurityOptions {
  requireAuth?: boolean;
  requirePremium?: boolean;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  allowedOrigins?: string[];
  auditLog?: boolean;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  isPremium?: boolean;
}

// In-memory rate limiting (for demonstration - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export class SecurityMiddleware {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
  }

  /**
   * Validate JWT token and extract user information
   */
  async validateAuth(req: Request): Promise<AuthenticatedUser> {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await this.supabase.auth.getUser(token);
    
    if (userError) {
      await this.logSecurityEvent('auth_failure', {
        error: userError.message,
        ip: this.getClientIP(req),
        userAgent: req.headers.get('User-Agent')
      });
      throw new Error(`Authentication failed: ${userError.message}`);
    }

    const user = userData.user;
    if (!user) {
      throw new Error("Invalid user token");
    }

    // Check premium status
    let isPremium = false;
    try {
      const { data: subscriber } = await this.supabase
        .from('subscribers')
        .select('subscribed, subscription_end, override_premium, override_end')
        .eq('user_id', user.id)
        .single();

      if (subscriber) {
        const now = new Date();
        isPremium = (
          (subscriber.subscribed && (!subscriber.subscription_end || new Date(subscriber.subscription_end) > now)) ||
          (subscriber.override_premium && (!subscriber.override_end || new Date(subscriber.override_end) > now))
        );
      }
    } catch (error) {
      console.warn('Error checking premium status:', error);
    }

    return {
      id: user.id,
      email: user.email,
      isPremium
    };
  }

  /**
   * Check rate limits
   */
  async checkRateLimit(identifier: string, options: { requests: number; windowMs: number }): Promise<void> {
    const now = Date.now();
    const key = identifier;
    const stored = rateLimitStore.get(key);

    if (stored && now < stored.resetTime) {
      if (stored.count >= options.requests) {
        await this.logSecurityEvent('rate_limit_exceeded', {
          identifier,
          count: stored.count,
          limit: options.requests
        });
        throw new Error('Rate limit exceeded');
      }
      stored.count++;
    } else {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
    }

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now >= v.resetTime) {
          rateLimitStore.delete(k);
        }
      }
    }
  }

  /**
   * Log security events
   */
  async logSecurityEvent(eventType: string, details: any): Promise<void> {
    try {
      await this.supabase
        .from('security_audit_log')
        .insert({
          event_type: eventType,
          details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Get client IP address
   */
  getClientIP(req: Request): string {
    return req.headers.get('x-forwarded-for') || 
           req.headers.get('x-real-ip') || 
           'unknown';
  }

  /**
   * Validate request origin
   */
  validateOrigin(req: Request, allowedOrigins?: string[]): void {
    if (!allowedOrigins || allowedOrigins.includes('*')) return;

    const origin = req.headers.get('Origin');
    if (origin && !allowedOrigins.includes(origin)) {
      throw new Error('Origin not allowed');
    }
  }

  /**
   * Create secure response
   */
  createSecureResponse(data: any, status: number = 200, additionalHeaders: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        ...secureHeaders,
        'Content-Type': 'application/json',
        ...additionalHeaders
      }
    });
  }

  /**
   * Create error response
   */
  createErrorResponse(error: string, status: number = 400, additionalHeaders: Record<string, string> = {}): Response {
    return new Response(JSON.stringify({ 
      error, 
      timestamp: new Date().toISOString() 
    }), {
      status,
      headers: {
        ...secureHeaders,
        'Content-Type': 'application/json',
        ...additionalHeaders
      }
    });
  }

  /**
   * Handle CORS preflight
   */
  handleCORS(): Response {
    return new Response(null, { headers: secureHeaders });
  }
}

/**
 * Security wrapper for edge functions
 */
export async function withSecurity(
  handler: (req: Request, user?: AuthenticatedUser) => Promise<Response>,
  options: SecurityOptions = {}
): Promise<(req: Request) => Promise<Response>> {
  const security = new SecurityMiddleware();

  return async (req: Request): Promise<Response> => {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        return security.handleCORS();
      }

      // Ultra-fast health endpoint - bypass all security checks
      if (req.method === 'HEAD' && new URL(req.url).pathname === '/health') {
        return new Response(null, { 
          status: 200, 
          headers: { 
            ...secureHeaders, 
            'x-health': 'true', 
            'Cache-Control': 'no-store' 
          }
        });
      }

      // Validate origin
      security.validateOrigin(req, options.allowedOrigins);

      let user: AuthenticatedUser | undefined;

      // Authentication check
      if (options.requireAuth) {
        user = await security.validateAuth(req);
        
        // Premium check
        if (options.requirePremium && !user.isPremium) {
          await security.logSecurityEvent('premium_required', {
            userId: user.id,
            endpoint: req.url
          });
          return security.createErrorResponse('Premium subscription required', 403);
        }
      }

      // Rate limiting
      if (options.rateLimit) {
        const identifier = user?.id || security.getClientIP(req);
        await security.checkRateLimit(identifier, options.rateLimit);
      }

      // Audit logging
      if (options.auditLog && user) {
        await security.logSecurityEvent('function_access', {
          userId: user.id,
          endpoint: req.url,
          method: req.method,
          ip: security.getClientIP(req),
          userAgent: req.headers.get('User-Agent')
        });
      }

      // Call the actual handler
      return await handler(req, user);

    } catch (error) {
      console.error('Security middleware error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Security validation failed';
      
      // Log security violations
      if (errorMessage.includes('Authentication') || 
          errorMessage.includes('Rate limit') || 
          errorMessage.includes('Premium')) {
        await security.logSecurityEvent('security_violation', {
          error: errorMessage,
          endpoint: req.url,
          ip: security.getClientIP(req),
          userAgent: req.headers.get('User-Agent')
        });
      }

      return security.createErrorResponse(errorMessage, 
        errorMessage.includes('Authentication') ? 401 :
        errorMessage.includes('Premium') ? 403 :
        errorMessage.includes('Rate limit') ? 429 : 400
      );
    }
  };
}