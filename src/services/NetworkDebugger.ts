/**
 * Network Request Debug Logger
 * Tracks fetch requests, Supabase calls, and network failures
 */

import { DebugLogger } from '@/services/DebugLogger';

export interface NetworkRequest {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  duration?: number;
  error?: string;
  type: 'fetch' | 'supabase' | 'edge-function';
}

class NetworkDebuggerService {
  private static instance: NetworkDebuggerService;
  private requests: NetworkRequest[] = [];
  private maxRequests = 200;
  private originalFetch: typeof fetch;

  private constructor() {
    this.originalFetch = fetch;
    this.interceptFetch();
  }

  static getInstance(): NetworkDebuggerService {
    if (!NetworkDebuggerService.instance) {
      NetworkDebuggerService.instance = new NetworkDebuggerService();
    }
    return NetworkDebuggerService.instance;
  }

  private interceptFetch() {
    // Only intercept in debug mode for performance
    if (!DebugLogger.isDebugEnabled()) return;

    // Store reference to original fetch and instance methods
    const originalFetch = this.originalFetch;
    const getRequestType = this.getRequestType.bind(this);
    const addRequest = this.addRequest.bind(this);
    
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      const startTime = Date.now();
      
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      // Filter out routine health checks and system requests for performance
      const shouldLog = !url.includes('/api/health') && 
                        !url.includes('/favicon.ico') && 
                        !url.includes('/_next/') &&
                        !url.includes('/static/');

      const request: NetworkRequest = {
        id: requestId,
        timestamp: startTime,
        method: method.toUpperCase(),
        url,
        type: getRequestType(url)
      };

      if (shouldLog) {
        DebugLogger.log('network', `→ ${method} ${url}`, { requestId, type: request.type });
      }

      try {
        const response = await originalFetch.call(window, input, init);
        const duration = Date.now() - startTime;
        
        request.status = response.status;
        request.statusText = response.statusText;
        request.duration = duration;

        if (!response.ok) {
          request.error = `HTTP ${response.status} ${response.statusText}`;
          if (shouldLog) {
            DebugLogger.warn('network', `← ${method} ${url} failed`, {
              requestId,
              status: response.status,
              statusText: response.statusText,
              duration
            });
          }
        } else {
          if (shouldLog) {
            DebugLogger.log('network', `← ${method} ${url} success`, {
              requestId,
              status: response.status,
              duration
            });
          }
        }

        addRequest(request);
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        request.duration = duration;
        request.error = error instanceof Error ? error.message : String(error);
        
        if (shouldLog) {
          DebugLogger.error('network', `← ${method} ${url} error`, {
            requestId,
            error: request.error,
            duration
          });
        }

        addRequest(request);
        throw error;
      }
    };
  }

  private getRequestType(url: string): NetworkRequest['type'] {
    if (url.includes('supabase.co')) {
      if (url.includes('/functions/v1/')) {
        return 'edge-function';
      }
      return 'supabase';
    }
    return 'fetch';
  }

  private addRequest(request: NetworkRequest) {
    this.requests.push(request);
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(-this.maxRequests);
    }
  }

  getRequests(limit?: number): NetworkRequest[] {
    const reqs = limit ? this.requests.slice(-limit) : this.requests;
    return [...reqs].reverse(); // Most recent first
  }

  getFailedRequests(): NetworkRequest[] {
    return this.requests.filter(req => req.error || (req.status && req.status >= 400));
  }

  clearRequests(): void {
    this.requests = [];
    DebugLogger.log('network', 'Network request history cleared');
  }

  getStats(): {
    total: number;
    failed: number;
    avgDuration: number;
    byType: Record<string, number>;
  } {
    const failed = this.getFailedRequests().length;
    const withDuration = this.requests.filter(req => req.duration !== undefined);
    const avgDuration = withDuration.length > 0 
      ? withDuration.reduce((sum, req) => sum + (req.duration || 0), 0) / withDuration.length 
      : 0;

    const byType = this.requests.reduce((acc, req) => {
      acc[req.type] = (acc[req.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.requests.length,
      failed,
      avgDuration: Math.round(avgDuration),
      byType
    };
  }
}

// Export singleton instance
export const NetworkDebugger = NetworkDebuggerService.getInstance();

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).networkDebug = {
    getRequests: (limit?: number) => NetworkDebugger.getRequests(limit),
    getFailedRequests: () => NetworkDebugger.getFailedRequests(),
    getStats: () => NetworkDebugger.getStats(),
    clearRequests: () => NetworkDebugger.clearRequests()
  };
}