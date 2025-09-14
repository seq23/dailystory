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
  provider?: string;
  tier?: string;
  templateType?: string;
  positivePrompt?: string;
  negativePrompt?: string;
  enhancementLevel?: string;
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
   * Generate image using the enhanced image generation pipeline with proper fallback chain
   * Orchestrator → Tier 2.5C → Tier 4 (SVG)
   */
  static async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const requestId = request.requestId || `REQ-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 7)}`;
    
    DebugLogger.log('image', `🖼️ SimpleImageService: Starting enhanced image generation`, {
      requestId,
      hasUserInfo: !!request.userInfo,
      userName: request.userInfo?.name,
      storyLength: request.pageText?.length || 0
    });

    try {
      const startTime = Date.now();
      
      // PHASE 3: Enhanced fallback chain - try orchestrator first
      DebugLogger.log('image', `🎯 Attempting Orchestrator (main pipeline)`, { requestId });
      
      const response = await supabase.functions.invoke('runware-generate-image', {
        body: {
          ...request,
          requestId
        }
      });

      const processingTime = Date.now() - startTime;

      // If orchestrator succeeds, return result
      if (!response.error && response.data?.success) {
        DebugLogger.log('image', `✅ Orchestrator succeeded`, {
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
      }

      // PHASE 3: If orchestrator fails, try direct Tier 2.5C fallback
      DebugLogger.warn('image', `⚠️ Orchestrator failed, attempting Tier 2.5C fallback`, {
        requestId,
        orchestratorError: response.error?.message || response.data?.error,
        processingTime
      });

      const tier25CResult = await this.emergencyFallbackTier25C(request);
      
      if (tier25CResult.success) {
        DebugLogger.log('image', `✅ Tier 2.5C fallback succeeded`, { requestId });
        return tier25CResult;
      }

      // PHASE 3: If Tier 2.5C fails, use Tier 4 (SVG fallback)
      DebugLogger.warn('image', `⚠️ Tier 2.5C failed, using Tier 4 (SVG fallback)`, { requestId });
      
      return {
        success: true,
        imageURL: this.generateTier4SVGFallback(request.pageText, request.pageNumber),
        provider: 'svg-fallback',
        tier: '4',
        templateType: 'svg-emergency',
        metadata: {
          requestId,
          source: 'SimpleImageService',
          emergencyFallback: true,
          tier: 4,
          fallbackReason: 'All backend tiers failed'
        }
      };

    } catch (error) {
      DebugLogger.error('image', `💥 SimpleImageService: Critical exception, using Tier 4 SVG`, {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // PHASE 3: Always return a working fallback, never fail completely
      return {
        success: true,
        imageURL: this.generateTier4SVGFallback(request.pageText, request.pageNumber),
        provider: 'svg-fallback',
        tier: '4',
        templateType: 'svg-emergency',
        metadata: {
          requestId,
          source: 'SimpleImageService',
          exception: true,
          tier: 4,
          fallbackReason: 'Critical system exception'
        }
      };
    }
  }

  /**
   * Generate Tier 4 SVG fallback - guaranteed to work
   */
  private static generateTier4SVGFallback(pageText: string, pageNumber: number): string {
    // Simple SVG generation based on story content
    const hasCharacter = /\b(child|person|character|they|he|she|avatar)\b/i.test(pageText);
    const hasOutdoor = /\b(outside|outdoor|garden|playground|park|forest|beach)\b/i.test(pageText);
    const hasActivity = /\b(playing|running|walking|reading|building|creating)\b/i.test(pageText);
    
    const backgroundColor = hasOutdoor ? '#87CEEB' : '#f8f9fa';
    const groundColor = hasOutdoor ? '#90EE90' : '#e5e7eb';
    
    const svg = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="1024" height="1024" fill="${backgroundColor}"/>
        <rect x="0" y="800" width="1024" height="224" fill="${groundColor}"/>
        ${hasCharacter ? '<circle cx="512" cy="600" r="80" fill="#FFB6C1" stroke="#333" stroke-width="4"/>' : ''}
        ${hasActivity ? '<rect x="400" y="700" width="224" height="100" fill="#FFA500" rx="20"/>' : ''}
        <text x="512" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#333">
          Story Scene ${pageNumber}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * EMERGENCY FALLBACK: Direct Tier 2.5C call bypassing orchestrator
   * Used when main orchestrator fails - calls runware-template-cd directly
   */
  static async emergencyFallbackTier25C(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    console.log('🚨 EMERGENCY: Attempting direct Tier 2.5C fallback');
    
    try {
      const { data: emergencyResult, error: emergencyError } = await supabase.functions.invoke('runware-template-cd', {
        body: {
          ...request,
          templateComplexity: 'C',
          emergencyMode: true
        }
      });

      if (emergencyError) {
        console.error('❌ Emergency Tier 2.5C failed:', emergencyError);
        throw new Error(`Emergency fallback failed: ${emergencyError.message}`);
      }

      if (!emergencyResult?.success) {
        throw new Error('Emergency fallback returned unsuccessful result');
      }

      console.log('✅ EMERGENCY: Tier 2.5C fallback successful');
      return {
        success: true,
        imageURL: emergencyResult.imageURL,
        provider: 'runware-template-cd',
        tier: emergencyResult.tier,
        templateType: emergencyResult.templateType,
        positivePrompt: emergencyResult.positivePrompt,
        negativePrompt: emergencyResult.negativePrompt,
        enhancementLevel: 'emergency-fallback',
        metadata: {
          emergencyFallback: true,
          directTierCall: true,
          bypassedOrchestrator: true
        }
      };
    } catch (error) {
      console.error('💥 Emergency Tier 2.5C fallback failed:', error);
      throw error;
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