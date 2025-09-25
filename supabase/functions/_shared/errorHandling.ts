// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
// Shared error handling utilities for all edge functions
import { createDynamicCorsResponse, createDynamicCorsErrorResponse } from "./corsAdvanced.js";

export enum EdgeErrorType {
  VALIDATION = 'validation',
  API = 'api',
  NETWORK = 'network',
  AUTH = 'auth',
  TIMEOUT = 'timeout',
  CONFIGURATION = 'configuration',
  WEBSOCKET = 'websocket',
  GENERATION = 'generation',
  UNKNOWN = 'unknown'
}

export interface EdgeError {
  type: EdgeErrorType;
  message: string;
  functionName: string;
  timestamp: number;
  details?: any;
  userInfo?: any;
  sessionId?: string;
}

export interface PerformanceMetrics {
  functionName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  model?: string;
  success: boolean;
  errorType?: EdgeErrorType;
}

export class EdgeErrorHandler {
  private static errorCounts = new Map<string, number>();
  private static performanceMetrics: PerformanceMetrics[] = [];

  /**
   * Standardized error logging and response
   */
  static handleError(
    error: Error | EdgeError | any,
    functionName: string,
    context?: {
      userInfo?: any;
      sessionId?: string;
      details?: any;
    }
  ): Response {
    const edgeError: EdgeError = {
      type: error.type || EdgeErrorType.UNKNOWN,
      message: error instanceof Error ? error.message : (error.message || 'An unexpected error occurred'),
      functionName,
      timestamp: Date.now(),
      details: context?.details || error.details,
      userInfo: context?.userInfo,
      sessionId: context?.sessionId
    };

    // Log the error
    console.error(`❌ ${functionName} Error:`, edgeError);

    // Track error frequency
    const errorKey = `${functionName}_${edgeError.type}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    // Log if error is happening frequently
    if (count > 3) {
      console.warn(`⚠️ Frequent error detected: ${errorKey} (${count + 1} occurrences)`);
    }

    return createDynamicCorsErrorResponse(
      `${functionName}: ${edgeError.message}`,
      undefined,
      this.getHttpStatusCode(edgeError.type)
    );
  }

  /**
   * Performance monitoring wrapper for edge functions
   */
  static async withPerformanceTracking<T>(
    functionName: string,
    model: string | undefined,
    operation: () => Promise<T>
  ): Promise<T> {
    const metrics: PerformanceMetrics = {
      functionName,
      model,
      startTime: Date.now(),
      success: false
    };

    try {
      const result = await operation();
      metrics.success = true;
      return result;
    } catch (error) {
      const errorType = (error && typeof error === 'object' && 'type' in error && typeof (error as any).type === 'string') 
        ? (error as any).type as EdgeErrorType 
        : EdgeErrorType.UNKNOWN;
      metrics.errorType = errorType;
      throw error;
    } finally {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      
      this.performanceMetrics.push(metrics);
      
      // Keep only last 100 metrics to prevent memory bloat
      if (this.performanceMetrics.length > 100) {
        this.performanceMetrics.shift();
      }

      console.log(`⏱️ ${functionName} Performance: ${metrics.duration}ms (${metrics.success ? 'SUCCESS' : 'FAILED'})`);
    }
  }

  /**
   * Validation helper for common parameters
   */
  static validateRequest(params: {
    pageText?: string;
    positivePrompt?: string;
    userInfo?: any;
    apiKey?: string;
    functionName: string;
  }): void {
    const { pageText, positivePrompt, userInfo, apiKey, functionName } = params;

    if (!apiKey) {
      throw {
        type: EdgeErrorType.CONFIGURATION,
        message: 'API key not configured'
      };
    }

    if (!pageText && !positivePrompt) {
      throw {
        type: EdgeErrorType.VALIDATION,
        message: 'Missing required parameter: pageText or positivePrompt'
      };
    }

    if (pageText && typeof pageText !== 'string') {
      throw {
        type: EdgeErrorType.VALIDATION,
        message: 'pageText must be a string'
      };
    }

    if (positivePrompt && typeof positivePrompt !== 'string') {
      throw {
        type: EdgeErrorType.VALIDATION,
        message: 'positivePrompt must be a string'
      };
    }
  }

  /**
   * Get standardized HTTP status codes for error types
   */
  private static getHttpStatusCode(errorType: EdgeErrorType): number {
    switch (errorType) {
      case EdgeErrorType.VALIDATION:
        return 400;
      case EdgeErrorType.AUTH:
        return 401;
      case EdgeErrorType.CONFIGURATION:
        return 500;
      case EdgeErrorType.TIMEOUT:
        return 408;
      case EdgeErrorType.API:
      case EdgeErrorType.NETWORK:
      case EdgeErrorType.WEBSOCKET:
      case EdgeErrorType.GENERATION:
        return 500;
      default:
        return 500;
    }
  }

  /**
   * Get error statistics for monitoring
   */
  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Get performance metrics for monitoring
   */
  static getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * Clear metrics (for testing or reset)
   */
  static clearMetrics(): void {
    this.errorCounts.clear();
    this.performanceMetrics.length = 0;
  }
}

/**
 * Standardized success response format
 */
export interface StandardSuccessResponse {
  success: true;
  imageURL: string; // Standardized field name
  provider: string;
  model?: string;
  seed?: number;
  processingTime?: number;
  qualityScore?: number;
  metadata?: Record<string, any>;
}

/**
 * Helper to create standardized success responses
 */
export function createStandardSuccessResponse(data: {
  imageURL: string;
  provider: string;
  model?: string;
  seed?: number;
  processingTime?: number;
  qualityScore?: number;
  metadata?: Record<string, any>;
}): Response {
  const response: StandardSuccessResponse = {
    success: true,
    ...data
  };
  return createDynamicCorsResponse(response, undefined, 200);
}
