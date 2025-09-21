/**
 * Simple Image Service for Testing
 * Provides debugging and testing functionality for the image generation pipeline
 */

import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';
import { HealthCheckService } from '@/services/HealthCheckService';

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
   * Generate image using the comprehensive 5-tier fallback chain
   * Orchestrator → Direct Tier Fallbacks (2.5A → 2.5B → 2.5C → 2.5D) → Tier 4 (SVG)
   */
  static async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const requestId = request.requestId || `REQ-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 7)}`;
    
    DebugLogger.log('image', `🖼️ SimpleImageService: Starting comprehensive 5-tier generation`, {
      requestId,
      hasUserInfo: !!request.userInfo,
      userName: request.userInfo?.name,
      storyLength: request.pageText?.length || 0
    });

    try {
      const startTime = Date.now();
      
      // Check system health to determine routing strategy
      const healthStatus = await HealthCheckService.checkSystemHealth();
      const tierStrategy = HealthCheckService.selectOptimalTier(healthStatus);
      
      DebugLogger.log('image', `🏥 Health check completed, tier strategy selected`, { 
        requestId, 
        overallHealth: healthStatus.overallHealth,
        selectedTier: tierStrategy.tier,
        fallbackType: tierStrategy.fallback,
        reason: tierStrategy.reason
      });

      // If health check determines ai_visual_scene_direct, use it immediately
      if (tierStrategy.fallback === 'ai_visual_scene_direct') {
        DebugLogger.log('image', `🎯 Health check routed to direct AI Visual Scene Creator`, { requestId });
        
        const directResult = await this.generateWithDirectAiVisualSceneCreator(request);
        if (directResult.success) {
          return {
            ...directResult,
            metadata: {
              ...directResult.metadata,
              healthRouting: true,
              routingReason: tierStrategy.reason
            }
          };
        }
        
        DebugLogger.warn('image', `⚠️ Health-routed direct AI Visual Scene failed, falling back to orchestrator`, { requestId });
      }
      
      // Try orchestrator first (handles Tier 1 → 2.5A → 2.5B → 2.5C → 2.5D → 4)
      DebugLogger.log('image', `🎯 Attempting Orchestrator (main 5-tier pipeline)`, { requestId });
      
      const response = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText: request.pageText,
          userInfo: request.userInfo,
          sessionId: request.sessionId,
          pageNumber: request.pageNumber,
          requestId,
          // Backward compatibility fields for legacy edge functions
          storyText: request.pageText,
          enhancedStoryData: { userInfo: request.userInfo },
          avatarIdentity: request.userInfo?.avatar
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

      // If orchestrator fails completely, try direct tier fallback chain
      DebugLogger.warn('image', `⚠️ Orchestrator failed, starting frontend fallback chain`, {
        requestId,
        orchestratorError: response.error?.message || response.data?.error,
        processingTime
      });

      // Frontend Fallback Chain: Direct AI Visual Scene Creator → 2.5A → 2.5B → 2.5C → 2.5D → SVG
      const tiers = [
        { name: 'Direct AI Visual Scene', function: 'ai-visual-scene-creator', complexity: 'direct', isDirect: true },
        { name: '2.5A', function: 'runware-template-ab', complexity: 'A' },
        { name: '2.5B', function: 'runware-template-ab', complexity: 'B' },
        { name: '2.5C', function: 'runware-template-cd', complexity: 'C' },
        { name: '2.5D', function: 'runware-template-cd', complexity: 'D' }
      ];

      for (const tier of tiers) {
        try {
          DebugLogger.log('image', `🔄 Frontend attempting Tier ${tier.name}`, { requestId });
          
          // Use direct AI Visual Scene Creator method if it's the direct tier
          const tierResult = tier.isDirect 
            ? await this.generateWithDirectAiVisualSceneCreator(request)
            : await this.callDirectTier(request, tier.function, tier.complexity);
          
          if (tierResult.success) {
            DebugLogger.log('image', `✅ Frontend Tier ${tier.name} succeeded`, { requestId });
            return {
              ...tierResult,
              metadata: {
                ...tierResult.metadata,
                frontendFallback: true,
                bypassedOrchestrator: true,
                tier: tier.name
              }
            };
          }
          
          DebugLogger.warn('image', `⚠️ Frontend Tier ${tier.name} failed`, { requestId });
          
        } catch (error) {
          DebugLogger.error('image', `💥 Frontend Tier ${tier.name} exception`, {
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // All tiers failed, use SVG fallback
      DebugLogger.warn('image', `⚠️ All frontend tiers failed, using Tier 4 (SVG fallback)`, { requestId });
      
      return {
        success: true,
        imageURL: this.generateTier4SVGFallback(request.pageText, request.pageNumber),
        provider: 'svg-fallback',
        tier: '4',
        templateType: 'svg-emergency',
        metadata: {
          requestId,
          source: 'SimpleImageService',
          frontendFallback: true,
          tier: 4,
          fallbackReason: 'All tiers failed including frontend fallbacks'
        }
      };

    } catch (error) {
      DebugLogger.error('image', `💥 SimpleImageService: Critical exception, using Tier 4 SVG`, {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Always return a working fallback
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
   * Call a specific tier directly (for frontend fallback chain)
   */
  private static async callDirectTier(
    request: ImageGenerationRequest, 
    functionName: string, 
    complexity: string
  ): Promise<ImageGenerationResponse> {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          pageText: request.pageText,
          userInfo: request.userInfo,
          sessionId: request.sessionId,
          pageNumber: request.pageNumber,
          templateComplexity: complexity,
          frontendFallback: true,
          // Backward compatibility fields for legacy edge functions
          storyText: request.pageText,
          enhancedStoryData: { userInfo: request.userInfo },
          avatarIdentity: request.userInfo?.avatar
        }
      });

    if (error) {
      throw new Error(`Direct tier call failed: ${error.message}`);
    }

    if (!data?.success) {
      throw new Error('Direct tier returned unsuccessful result');
    }

    return {
      success: true,
      imageURL: data.imageURL,
      provider: data.provider,
      tier: data.tier,
      templateType: data.templateType,
      positivePrompt: data.positivePrompt,
      negativePrompt: data.negativePrompt,
      enhancementLevel: 'direct-tier-call',
      metadata: {
        directTierCall: true,
        functionName,
        complexity
      }
    };
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
   * DIRECT AI VISUAL SCENE CREATOR: Call ai-visual-scene-creator directly bypassing orchestrator
   * Used when orchestrator boot fails - generates with direct mode
   */
  static async generateWithDirectAiVisualSceneCreator(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    console.log('🎯 Direct AI Visual Scene Creator mode activated');
    
    try {
      const { data: directResult, error: directError } = await supabase.functions.invoke('ai-visual-scene-creator', {
        body: {
          pageText: request.pageText,
          userInfo: request.userInfo,
          sessionId: request.sessionId,
          pageNumber: request.pageNumber,
          directMode: true,
          // Backward compatibility fields for legacy edge functions
          storyText: request.pageText,
          enhancedStoryData: { userInfo: request.userInfo },
          avatarIdentity: request.userInfo?.avatar
        }
      });

      if (directError) {
        console.error('❌ Direct AI Visual Scene Creator failed:', directError);
        throw new Error(`Direct AI visual scene creator failed: ${directError.message}`);
      }

      if (!directResult?.success) {
        throw new Error('Direct AI visual scene creator returned unsuccessful result');
      }

      console.log('✅ Direct AI Visual Scene Creator successful');
      return {
        success: true,
        imageURL: directResult.imageURL,
        provider: 'ai-visual-scene-creator',
        tier: directResult.tier,
        templateType: directResult.templateType,
        positivePrompt: directResult.positivePrompt,
        negativePrompt: directResult.negativePrompt,
        enhancementLevel: 'direct-ai-visual-scene',
        metadata: {
          directAiVisualScene: true,
          bypassedOrchestrator: true
        }
      };
    } catch (error) {
      console.error('💥 Direct AI Visual Scene Creator fallback failed:', error);
      throw error;
    }
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
          pageText: request.pageText,
          userInfo: request.userInfo,
          sessionId: request.sessionId,
          pageNumber: request.pageNumber,
          templateComplexity: 'C',
          emergencyMode: true,
          // Backward compatibility fields for legacy edge functions
          storyText: request.pageText,
          enhancedStoryData: { userInfo: request.userInfo },
          avatarIdentity: request.userInfo?.avatar
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