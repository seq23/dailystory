/**
 * Simple Image Service for Testing
 * Provides debugging and testing functionality for the image generation pipeline
 */

import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';

export interface ImageGenerationRequest {
  pageText: string;
  userInfo: {
    name: string;
    age: number;
    userName: string;
    avatar: {
      type: string;
      skinTone: string;
    };
    nativeLanguage: string;
  };
  sessionId: string;
  storyId: string;
  pageNumber: number;
  requestId?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageURL?: string;
  imageUrl?: string;
  error?: string;
  metadata?: any;
  routingMetadata?: {
    attemptedTier: string;
    executedTier: string;
    fallbackReason?: string;
    skippedTiers: string[];
    routingDecisions: string[];
    binaryValidation: string;
    avatarCompleteness: string;
    avatarIdentity?: {
      complete: boolean;
      missingFields: string[];
      provided: string[];
    };
  };
}

export class SimpleImageService {
  /**
   * Generate image using the image generation pipeline
   */
  static async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const requestId = request.requestId || `REQ-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 7)}`;
    
    DebugLogger.log('image', `🖼️ SimpleImageService: Starting image generation`, {
      requestId,
      hasUserInfo: !!request.userInfo,
      userName: request.userInfo?.name,
      storyLength: request.pageText?.length || 0
    });

    try {
      const startTime = Date.now();
      
      const response = await supabase.functions.invoke('runware-generate-image', {
        body: {
          ...request,
          requestId
        }
      });

      const processingTime = Date.now() - startTime;

      if (response.error) {
        DebugLogger.error('image', `❌ SimpleImageService: Function invocation failed`, {
          requestId,
          error: response.error,
          processingTime
        });

        return {
          success: false,
          error: response.error.message || 'Function invocation failed',
          metadata: {
            requestId,
            processingTime,
            source: 'SimpleImageService'
          }
        };
      }

      if (response.data?.success) {
        DebugLogger.log('image', `✅ SimpleImageService: Image generation successful`, {
          requestId,
          hasImage: !!(response.data.imageURL || response.data.imageUrl),
          processingTime,
          tier: response.data.metadata?.tier
        });

        return {
          success: true,
          imageURL: response.data.imageURL || response.data.imageUrl,
          metadata: response.data.metadata,
          routingMetadata: response.data.routingMetadata
        };
      } else {
        DebugLogger.warn('image', `⚠️ SimpleImageService: Generation failed`, {
          requestId,
          error: response.data?.error,
          processingTime
        });

        return {
          success: false,
          error: response.data?.error || 'Image generation failed',
          metadata: response.data?.metadata,
          routingMetadata: response.data?.routingMetadata
        };
      }
    } catch (error) {
      DebugLogger.error('image', `💥 SimpleImageService: Exception occurred`, {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          requestId,
          source: 'SimpleImageService',
          exception: true
        }
      };
    }
  }

  /**
   * Test individual edge function health
   */
  static async testFunctionHealth(functionName: string): Promise<{
    success: boolean;
    status: string;
    response?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/${functionName}`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino'
        }
      });

      const data = await response.json();

      return {
        success: response.ok,
        status: response.ok ? 'healthy' : `error-${response.status}`,
        response: data,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        success: false,
        status: 'unreachable',
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Validate user information completeness
   */
  static validateUserInfo(userInfo: any): {
    complete: boolean;
    missingFields: string[];
    provided: string[];
  } {
    const requiredFields = ['name', 'age', 'avatar.type', 'avatar.skinTone', 'nativeLanguage'];
    const provided: string[] = [];
    const missing: string[] = [];

    requiredFields.forEach(field => {
      const value = this.getNestedValue(userInfo, field);
      if (value !== undefined && value !== null && value !== '') {
        provided.push(field);
      } else {
        missing.push(field);
      }
    });

    return {
      complete: missing.length === 0,
      missingFields: missing,
      provided
    };
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}