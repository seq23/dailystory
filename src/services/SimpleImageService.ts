import { supabase } from '@/integrations/supabase/client';
import { ImageFallbackService } from './ImageFallbackService';
import { DebugLogger } from '@/services/DebugLogger';
import { errorRecoveryManager } from '@/services/ErrorRecoveryManager';
import { HealthCheckService, type HealthStatus, type TierStrategy } from './HealthCheckService';
import { OptimizedImageCache } from './OptimizedImageCache';
import { SmartOrchestrationBypass } from '@/utils/SmartOrchestrationBypass';

// ============= TYPES =============

export interface ImageResult {
  success: boolean;
  url?: string;
  imageURL?: string;
  error?: string;
  generatedAt?: string;
  tier?: string;
  usedTier?: string;
  tierErrors?: any[];
  requestId?: string;
  timestamp?: string;
  provider?: string;
  model?: string;
  cost?: number;
  seed?: number | string;
  orchestratorFailed?: boolean;
  orchestratorFailureReason?: string;
  metadata?: any;
}

export interface UserInfo {
  name?: string;
  age?: number;
  ethnicity?: string;
  hair?: string;
  features?: string;
  avatar?: {
    type?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Direct Mode Bypass Decision Types
export interface BypassDecision {
  shouldBypass: boolean;
  reason: string;
  conditions: string[];
}

export interface BypassConditions {
  forceTier1?: boolean;
  orchestratorUnhealthy?: boolean;
  recentFailures?: boolean;
  testMode?: boolean;
  debugMode?: boolean;
  userPreference?: boolean;
}

// ============= SIMPLE IMAGE SERVICE =============

export class SimpleImageService {
  // Service constants
  private static readonly ESTIMATED_COST_PER_IMAGE_USD = 0.002;
  private static readonly isIndexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;
  
  // Orchestrator failure metrics
  private static orchestratorFailureCount = 0;
  private static orchestratorSuccessCount = 0;

  // Database management for caching
  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ImageCacheDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'id' });
          store.createIndex('sessionId', 'sessionId', { unique: false });
          store.createIndex('pageNumber', 'pageNumber', { unique: false });
        }
      };
    });
  }

  // Store image in IndexedDB cache
  private static async storeImageInDB(sessionId: string, pageNumber: number, imageURL: string | null, metadata: any = {}): Promise<void> {
    if (!this.isIndexedDBAvailable) return;
    
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const imageData = {
        id: `${sessionId}-${pageNumber}`,
        sessionId,
        pageNumber,
        imageURL,
        metadata,
        timestamp: new Date().toISOString()
      };
      
      await store.put(imageData);
      DebugLogger.log('image', `Stored image data for session ${sessionId}, page ${pageNumber}`);
    } catch (error) {
      DebugLogger.warn('image', 'Failed to store image in IndexedDB', error);
    }
  }

  // Get cached image from IndexedDB
  private static async getImageFromDB(sessionId: string, pageNumber: number): Promise<any | null> {
    if (!this.isIndexedDBAvailable) return null;
    
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      
      return new Promise((resolve, reject) => {
        const request = store.get(`${sessionId}-${pageNumber}`);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      DebugLogger.warn('image', 'Failed to get image from IndexedDB', error);
      return null;
    }
  }

  // Clear session cache
  static async clearSessionCache(sessionId: string): Promise<void> {
    if (!this.isIndexedDBAvailable) return;
    
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const index = store.index('sessionId');
      
      const request = index.openCursor(IDBKeyRange.only(sessionId));
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      DebugLogger.log('image', `Cleared cache for session ${sessionId}`);
    } catch (error) {
      DebugLogger.warn('image', 'Failed to clear session cache', error);
    }
  }

  // Health-aware image generation with intelligent tier skipping
  static async generateStoryImage(
    storyText: string,
    userInfo?: UserInfo,
    sessionId?: string,
    pageNumber: number = 1,
    isPremium: boolean = false,
    forceTier1: boolean = false,
    smartBypassEnabled: boolean = true
  ): Promise<ImageResult> {
    DebugLogger.log('image', 'SimpleImageService: Starting health-aware image generation');
    
    // Emit timer pause event for guest users
    try {
      window.dispatchEvent(new CustomEvent('image:generation:start'));
    } catch {}
    DebugLogger.log('image', 'Parameters', { 
      storyLength: storyText?.length || 0, 
      hasUserInfo: !!userInfo, 
      sessionId, 
      pageNumber, 
      isPremium 
    });

    // PHASE 1: Health Check and Tier Selection
    const orchestratorServiceHealth = await this.checkOrchestratorServiceHealth();
    const healthStatus = await HealthCheckService.checkSystemHealth();
    const tierStrategy = HealthCheckService.selectOptimalTier(healthStatus);
    
    DebugLogger.log('image', 'Health validation comparison', {
      orchestratorSpecific: orchestratorServiceHealth,
      generalHealth: healthStatus.overallHealth,
      correlation: orchestratorServiceHealth === 'healthy' && healthStatus.overallHealth === 'healthy' ? 'MATCH' : 'MISMATCH',
      health: healthStatus,
      selectedTier: tierStrategy.tier,
      reason: tierStrategy.reason
    });

    // PHASE 2: Orchestrator-first routing - always attempt orchestrator first

    switch (tierStrategy.tier) {
      case 'TIER_4':
        // Direct SVG fallback - no backend calls needed
        DebugLogger.warn('image', 'Using direct SVG fallback due to Runware API failure');
        return {
          success: true,
          url: ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber),
          tier: 'TIER_4_HEALTH_SKIP',
          metadata: { 
            healthReason: tierStrategy.reason,
            healthStatus: healthStatus
          }
        };

      case 'TIER_2_5C':
        // Direct nuclear independent template
        DebugLogger.log('image', 'Using nuclear independent template due to orchestrator failure');
        return await this.generateWithTemplate(storyText, userInfo, sessionId, pageNumber, isPremium, healthStatus);

      case 'TIER_1':
      default:
        // Enhanced error recovery with orchestrator - check memory pressure first
        const memoryStatus = errorRecoveryManager.detectMemoryPressure();
        if (memoryStatus.isHigh) {
          DebugLogger.warn('image', 'High memory pressure detected, using recovery mode', {
            usage: memoryStatus.usage,
            recommendations: memoryStatus.recommendations
          });
          
          // Use memory-efficient generation path
          return await errorRecoveryManager.withRetry(
            () => this.generateWithOrchestrator(storyText, userInfo, sessionId, pageNumber, isPremium, healthStatus),
            `image-gen-recovery-${pageNumber}`,
            {
              maxRetries: 2,
              retryDelay: 2000,
              fallbackValue: {
                success: true,
                url: ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber),
                tier: 'Memory Recovery',
                metadata: { recoveryMode: true, healthStatus }
              }
            }
          );
        }

        // Standard orchestrator path with enhanced error recovery
        return await errorRecoveryManager.withRetry(
          () => this.generateWithOrchestrator(storyText, userInfo, sessionId, pageNumber, isPremium, healthStatus, forceTier1, smartBypassEnabled),
          `image-gen-${pageNumber}`,
          {
            maxRetries: 3,
            retryDelay: 1000,
            fallbackValue: {
              success: true,
              url: ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber),
              tier: 'Error Recovery',
              metadata: { recoveryMode: true, healthStatus }
            }
          }
        );
    }
  }

  // Orchestrator-based generation (Tier 1)
  private static async generateWithOrchestrator(
    storyText: string,
    userInfo?: UserInfo,
    sessionId?: string,
    pageNumber: number = 1,
    isPremium: boolean = false,
    healthStatus?: HealthStatus,
    forceTier1: boolean = false,
    smartBypassEnabled: boolean = true
  ): Promise<ImageResult> {

  // Normalize session ID for consistent caching
    const normalizedSessionId = sessionId?.toString() || 'unknown';
    
    // Detect character changes and invalidate cache if needed
    if (userInfo && normalizedSessionId !== 'unknown') {
      const lastUserInfo = await this.getLastUserInfoFromSession(normalizedSessionId);
      if (lastUserInfo && this.hasCharacterChanged(lastUserInfo, userInfo)) {
        DebugLogger.log('image', 'Character appearance changed, clearing session cache', {
          sessionId: normalizedSessionId,
          oldCharacter: lastUserInfo.ethnicity,
          newCharacter: userInfo.ethnicity
        });
        await this.clearSessionCharacterCache(normalizedSessionId);
      }
      await this.saveUserInfoToSession(normalizedSessionId, userInfo);
    }
    
    // PERFORMANCE: Fast cache check with content-based keys
    const cachedImage = OptimizedImageCache.getCachedImage(storyText, normalizedSessionId);
    if (cachedImage) {
      DebugLogger.log('image', `⚡ Fast cache hit: session ${normalizedSessionId}, page ${pageNumber}`);
      return {
        success: true,
        url: cachedImage,
        generatedAt: new Date().toISOString(),
        tier: 'FastCache',
        metadata: { fromCache: true, optimized: true }
      };
    }
    DebugLogger.log('image', `⚡ Fast cache miss: session ${normalizedSessionId}, page ${pageNumber}`);

    // Validate input
    if (!storyText || storyText.trim().length === 0) {
      DebugLogger.error('image', 'No story text provided');
      return {
        success: false,
        error: 'Story text is required for image generation',
        timestamp: new Date().toISOString()
      };
    }

    const cleanScene = storyText.trim().substring(0, 3000);
    DebugLogger.log('image', `Clean scene (${cleanScene.length} chars)`, cleanScene.substring(0, 200) + '...');

    // Enhance character description with universal hair color mapping
    if (userInfo?.ethnicity && userInfo?.skinTone) {
      const universalHair = this.getUniversalHairColorForSkinTone(userInfo.skinTone, userInfo.ethnicity, normalizedSessionId);
      const enhancedUserInfo = {
        ...userInfo,
        hair: universalHair,
        universalHairColor: universalHair
      };
      userInfo = enhancedUserInfo;
      DebugLogger.log('image', '🎨 Session-Seeded Hair Resolution', {
        skinTone: userInfo.skinTone,
        ethnicity: userInfo.ethnicity,
        mappedHair: universalHair,
        sessionId: normalizedSessionId,
        source: 'HAIR_BY_SKIN_TONE',
        varietyCount: '73 variations',
        isSeeded: true
      });
    }

    // PERFORMANCE: Skip processing for simple content
    const enhancedPrompt = cleanScene;
    let backendDifficulty: string;
    
    if (OptimizedImageCache.shouldSkipProcessing(cleanScene)) {
      DebugLogger.log('image', '⚡ Skipping processing for simple content', { 
        contentLength: enhancedPrompt.length
      });
      backendDifficulty = 'easy'; // Default for simple content
    } else {
      // Only map difficulty for complex content
      backendDifficulty = this.mapDifficultyLevel(userInfo);
      DebugLogger.log('image', 'Mapped difficulty level', backendDifficulty);
    }

    // PERFORMANCE: Smart orchestrator bypass decision
    // Defensive: derive tier from isPremium if userTier missing
    const effectiveTier = userInfo?.userTier || (isPremium ? 'premium' : 'guest');
    
    DebugLogger.log('image', '⚡ Bypass Decision Input', {
      userTier: effectiveTier,
      isPremium,
      smartBypassEnabled,
      cleanSceneLength: cleanScene.length,
      sessionId: normalizedSessionId
    });
    
    const bypassDecision = SmartOrchestrationBypass.shouldBypassOrchestrator(
      cleanScene, 
      normalizedSessionId, 
      healthStatus,
      !smartBypassEnabled,  // forceDisable = true when smartBypassEnabled = false
      effectiveTier // Pass user tier for routing decision
    );
    
    if (bypassDecision.shouldBypass && !forceTier1) {
      DebugLogger.log('image', '⚡ SMART BYPASS: Routing directly to template', {
        reason: bypassDecision.reason,
        targetTemplate: bypassDecision.targetTemplate,
        contentLength: cleanScene.length
      });
      
      // Route directly to optimized template
      const startTime = Date.now();
      try {
        let templateResult = await supabase.functions.invoke(bypassDecision.targetTemplate || 'runware-template-cd', {
          body: {
            pageText: enhancedPrompt,
            userInfo,
            sessionId: normalizedSessionId,
            pageNumber,
            templateComplexity: bypassDecision.templateComplexity || 'C'
          }
        });

        // If Complexity C fails, escalate to Complexity D
        if (!templateResult.data?.success && (bypassDecision.templateComplexity === 'C' || !bypassDecision.templateComplexity)) {
          DebugLogger.log('image', '⚡ Smart bypass Complexity C failed, escalating to D', {
            sessionId: normalizedSessionId,
            error: templateResult.error
          });
          
          templateResult = await supabase.functions.invoke(bypassDecision.targetTemplate || 'runware-template-cd', {
            body: {
              pageText: enhancedPrompt,
              userInfo,
              sessionId: normalizedSessionId,
              pageNumber,
              templateComplexity: 'D'
            }
          });
        }
        
        const responseTime = Date.now() - startTime;
        SmartOrchestrationBypass.recordTemplateResponse(normalizedSessionId, responseTime);
        
        const imageURL = templateResult.data?.imageURL;
        if (templateResult.data?.success && imageURL?.trim()) {
          OptimizedImageCache.cacheImage(storyText, imageURL, normalizedSessionId);
          
          try {
            window.dispatchEvent(new CustomEvent('image:generation:complete'));
          } catch {}
          
          return {
            success: true,
            url: imageURL,
            generatedAt: new Date().toISOString(),
            tier: 'Smart Bypass',
            metadata: { 
              ...templateResult.data, 
              bypassReason: bypassDecision.reason,
              responseTime
            }
          };
        }
      } catch (bypassError) {
        DebugLogger.warn('image', '⚡ Smart bypass failed, falling back to orchestrator', {
          error: bypassError.message
        });
        SmartOrchestrationBypass.recordTemplateResponse(normalizedSessionId, Date.now() - startTime);
        // Fall through to orchestrator
      }
    }

    // Setup timeout handling
    let timeoutId: NodeJS.Timeout | null = null;
    let requestAborted = false;

    // Initialize cascade history tracking (shared between try and catch)
    const cascadeHistory: string[] = [];

    try {
      // Create timeout promise that rejects after 60 seconds (balanced)
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          requestAborted = true;
          DebugLogger.warn('image', 'Frontend timeout: Request exceeded 60 seconds');
          reject(new Error('Request timeout: Image generation took longer than 60 seconds'));
        }, 60000); // Balanced timeout: 60s for full orchestration with retries
      });

      // Call the main orchestrator (runware-generate-image) which handles all tiers
      DebugLogger.log('image', 'Calling main orchestrator: runware-generate-image');
      
      const startTime = Date.now();
      
      // Debug payload before sending
      const orchestratorPayload = {
        storyText: enhancedPrompt,
        userInfo,
        sessionId: normalizedSessionId,
        storyId: normalizedSessionId, // Use normalized sessionId as storyId for consistency
        pageNumber,
        isGuestUser: !isPremium,
        difficultyLevel: backendDifficulty
        // Removed protectionNegatives - using raw content only
      };
      
      DebugLogger.log('image', 'Orchestrator payload debug', {
        hasStoryText: !!orchestratorPayload.storyText,
        storyTextLength: orchestratorPayload.storyText?.length || 0,
        storyTextPreview: orchestratorPayload.storyText?.substring(0, 100) + '...',
        hasUserInfo: !!orchestratorPayload.userInfo,
        hasSessionId: !!orchestratorPayload.sessionId,
        sessionId: orchestratorPayload.sessionId,
        pageNumber: orchestratorPayload.pageNumber
      });
      
      cascadeHistory.push('🎯 Attempting Tier 1 (orchestrator)');
      
      const requestPromise = supabase.functions.invoke('runware-generate-image', {
        body: orchestratorPayload
      });
      
        // Check for orchestrator response guidance
        const { data: orchResult, error: orchError } = await Promise.race([
          requestPromise,
          timeoutPromise
        ]);

        const responseTime = Date.now() - startTime;
        SmartOrchestrationBypass.recordOrchestratorResponse(normalizedSessionId, responseTime, !!orchResult?.success);

        // Clear timeout since request completed
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (requestAborted) {
          DebugLogger.warn('image', 'Request was aborted due to timeout');
          return {
            success: false,
            error: 'Request timeout: Image generation exceeded time limit',
            timestamp: new Date().toISOString()
          };
        }

        // Handle structured orchestrator responses (including 400 errors with nextAction)
        if (orchResult?.nextAction === 'TRY_DIRECT_MODE') {
          DebugLogger.log('image', 'Orchestrator suggests Direct Mode, attempting...');
          throw new Error('ORCHESTRATOR_SUGGESTS_DIRECT_MODE');
        }

        if (orchError) {
          DebugLogger.error('image', 'Orchestrator response error', {
            errorMessage: orchError.message,
            errorDetails: orchError,
            status: orchError.status || 'unknown'
          });
          throw new Error(`Orchestrator error: ${orchError.message}`);
        }

        // ENHANCED ORCHESTRATOR RESPONSE LOGGING - Diagnose "false success" issue
        DebugLogger.log('image', '🔍 Orchestrator Response Validation (BEFORE URL CHECK)', {
          hasResult: !!orchResult,
          hasSuccess: orchResult?.hasOwnProperty('success'),
          successValue: orchResult?.success,
          hasImageURL: orchResult?.hasOwnProperty('imageURL'),
          hasImage_url: orchResult?.hasOwnProperty('image_url'),
          hasImageUrl: orchResult?.hasOwnProperty('imageUrl'),
          hasUrl: orchResult?.hasOwnProperty('url'),
          imageURLValue: orchResult?.imageURL,
          image_urlValue: orchResult?.image_url,
          imageUrlValue: orchResult?.imageUrl,
          urlValue: orchResult?.url,
          allKeys: orchResult ? Object.keys(orchResult) : [],
          fullResponsePreview: JSON.stringify(orchResult).substring(0, 500)
        });

        // CONSOLIDATED VALIDATION: Use universal validation utilities
        const { extractImageUrl, extractSuccessValue } = await import('@/utils/typeGuards');
        
        const imageURL = extractImageUrl(orchResult);
        const isSuccess = extractSuccessValue(orchResult);
        const hasValidImageURL = !!imageURL;
        
        DebugLogger.log('image', '🔍 CRITICAL: Validation Breakdown (Universal Utils)', {
          // Raw values
          rawSuccess: orchResult?.success,
          rawSuccessType: typeof orchResult?.success,
          rawImageURL: imageURL,
          // Computed booleans
          isSuccess,
          hasValidImageURL,
          // Final validation
          validationWillPass: isSuccess && hasValidImageURL,
          // Full response for debugging
          orchResultKeys: orchResult ? Object.keys(orchResult) : []
        });
        
        if (isSuccess && hasValidImageURL) {
        DebugLogger.log('image', `🖼️ Auto-generated image successfully: ${imageURL}`, {
          contentHash: orchResult.contentHash || 'no-hash',
          usedTier: orchResult.usedTier || 'orchestrator'
        });
        
        // Store result in fast cache  
        OptimizedImageCache.cacheImage(storyText, imageURL, normalizedSessionId);

        // Emit timer resume event
        try {
          window.dispatchEvent(new CustomEvent('image:generation:complete'));
        } catch {}

        // Add success cascade entry
        cascadeHistory.push(`✅ Orchestrator Success: ${orchResult.usedTier || 'TIER_1'}`);
        
        // Track success metrics
        SimpleImageService.orchestratorSuccessCount++;
        DebugLogger.log('image', 'Orchestrator success - metrics updated', {
          successes: SimpleImageService.orchestratorSuccessCount,
          failures: SimpleImageService.orchestratorFailureCount,
          successRate: (SimpleImageService.orchestratorSuccessCount / 
            (SimpleImageService.orchestratorSuccessCount + SimpleImageService.orchestratorFailureCount) * 100).toFixed(2) + '%'
        });

        return {
          success: true,
          url: imageURL,
          imageURL: imageURL,
          generatedAt: new Date().toISOString(),
          tier: orchResult.usedTier,
          usedTier: orchResult.usedTier,
          tierErrors: orchResult.tierErrors,
          requestId: orchResult.requestId,
          metadata: {
            ...orchResult,
            orchestratorAttempted: true,
            orchestratorSuccess: true,
            cascadeHistory: orchResult.metadata?.cascadeHistory || cascadeHistory,
            flowType: orchResult.templateStructure === 'COMPLETE_TIER_1' ? 'Enhanced Character-First Flow' : 'Template Flow'
          }
        };
      } else {
        throw new Error(`Orchestrator returned no image: ${JSON.stringify(orchResult)}`);
      }
        
    } catch (error) {
      // Append to existing cascade history
      cascadeHistory.push(`❌ Tier 1 Failed: ${error.message}`);
      
      DebugLogger.error('image', 'Image generation orchestrator failed', error);
      
      // Track failure metrics
      SimpleImageService.orchestratorFailureCount++;
      
      // Enhanced error capture with detailed context and metrics
      DebugLogger.error('image', 'Orchestrator failure details', {
        errorType: this.categorizeOrchestratorError(error),
        errorMessage: error.message,
        statusCode: this.extractStatusCode(error),
        sessionId: normalizedSessionId,
        failureTimestamp: new Date().toISOString(),
        isCharacterServiceFailure: error.message?.includes('CharacterConsistencyService'),
        metrics: {
          failures: SimpleImageService.orchestratorFailureCount,
          successes: SimpleImageService.orchestratorSuccessCount,
          failureRate: (SimpleImageService.orchestratorFailureCount / 
            (SimpleImageService.orchestratorFailureCount + SimpleImageService.orchestratorSuccessCount) * 100).toFixed(2) + '%'
        }
      });
      
      // Clear timeout if still active
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Store failure in IndexedDB for debugging with normalized session ID
      if (this.isIndexedDBAvailable && normalizedSessionId !== 'unknown') {
        await this.storeImageInDB(normalizedSessionId, pageNumber, null, { 
          error: error.message, 
          timestamp: new Date().toISOString(),
          orchestratorFailure: true
        });
      }

      // Detect orchestrator failure type for proper cascade handling
      const is503Error = error.message?.includes('503') || error.message?.includes('Service temporarily unavailable');
      const is400Error = error.message?.includes('400') || error.message?.includes('validation failed') || error.message?.includes('VALIDATION_ERROR');
      const suggestsDirectMode = error.message?.includes('ORCHESTRATOR_SUGGESTS_DIRECT_MODE') || error.message?.includes('TRY_DIRECT_MODE');
      
      DebugLogger.warn('image', 'Orchestrator error categorization', {
        errorMessage: error.message,
        is503Error,
        is400Error,
        suggestsDirectMode
      });
      
      if (is503Error) {
        DebugLogger.warn('image', 'Orchestrator unreachable (503), attempting Direct Mode fallback');
      } else if (is400Error || suggestsDirectMode) {
        DebugLogger.warn('image', 'Orchestrator validation/runtime failure, attempting Direct Mode fallback');
      } else {
        DebugLogger.warn('image', 'Orchestrator general failure, attempting Direct Mode fallback');
      }

      // Direct Mode attempt - call ai-visual-scene-creator with directMode: true
      let directModeAttempted = false;
      let directModeError: string | undefined;
      
      try {
        cascadeHistory.push('🔁 Attempting Direct Mode (ai-visual-scene-creator)');
        directModeAttempted = true;
        
        DebugLogger.log('image', 'Attempting Direct Mode via ai-visual-scene-creator');
        const directModeResult = await supabase.functions.invoke('ai-visual-scene-creator', {
          body: {
            storyText: enhancedPrompt,
            userInfo,
            sessionId: normalizedSessionId,
            pageNumber,
            directMode: true, // KEY: Enable Direct Mode
            isGuestUser: !isPremium
          }
        });

        if (directModeResult.data?.success && directModeResult.data?.imageURL) {
          cascadeHistory.push('✅ Direct Mode Success');
          DebugLogger.log('image', 'Direct Mode successful');
          return {
            success: true,
            url: directModeResult.data.imageURL,
            imageURL: directModeResult.data.imageURL,
            generatedAt: new Date().toISOString(),
            tier: 'Direct Mode',
            orchestratorFailed: true,
            orchestratorFailureReason: this.categorizeOrchestratorError(error),
            metadata: { 
              ...directModeResult.data, 
              cascadeHistory,
              directModeAttempted: true,
              pathUsed: 'DIRECT_MODE',
              fallbackFromOrchestrator: true,
              originalOrchestrator: 'runware-generate-image',
              fallbackFlow: 'Direct Mode'
            }
          };
        } else {
          throw new Error(`Direct Mode failed: ${JSON.stringify(directModeResult)}`);
        }
      } catch (directModeErr) {
        directModeError = directModeErr.message;
        cascadeHistory.push(`❌ Direct Mode Failed: ${directModeError}`);
        DebugLogger.warn('image', 'Direct Mode also failed, escalating to nuclear templates', directModeErr);
      }

      // TIER 2.5C: Template fallback before final resort
      try {
        cascadeHistory.push('🧪 Attempting Tier 2.5C nuclear template');
        DebugLogger.log('image', 'Attempting Tier 2.5C template fallback');
        const templateResult = await this.generateWithTemplate(
          storyText, userInfo, sessionId, pageNumber, isPremium
        );
        if (templateResult.success && templateResult.url) {
          cascadeHistory.push('✅ Tier 2.5C Success (Nuclear Fallback)');
          DebugLogger.log('image', 'Tier 2.5C template fallback successful');
          return {
            ...templateResult,
            metadata: {
              ...templateResult.metadata,
              cascadeHistory,
              directModeAttempted,
              directModeError,
              orchestratorFailed: true,
              orchestratorFailureReason: this.categorizeOrchestratorError(error),
              pathUsed: 'TIER_2_5C_TEMPLATE'
            }
          };
        }
      } catch (templateError) {
        cascadeHistory.push(`❌ Tier 2.5C Failed: ${templateError.message}`);
        DebugLogger.warn('image', 'Tier 2.5C template fallback also failed', templateError);
      }

      // TIER 4: Intelligent fallback system with quality prioritization
      cascadeHistory.push('🔄 Attempting Intelligent Fallback System');
      DebugLogger.warn('image', 'Using intelligent fallback system as final resort');
      const intelligentFallback = await this.getImageWithIntelligentFallback(
        userInfo || {}, cleanScene, !isPremium, normalizedSessionId, pageNumber
      );

      const fallbackUrl = intelligentFallback || ImageFallbackService.generateStoryPlaceholder(cleanScene, pageNumber);
      cascadeHistory.push(`✅ Intelligent Fallback Success: ${intelligentFallback ? 'Match Found' : 'SVG Placeholder'}`);
      
      DebugLogger.log('image', 'Intelligent fallback completed', {
        foundIntelligentMatch: !!intelligentFallback,
        finalUrl: fallbackUrl.substring(0, 50) + '...'
      });
      
      // Emit timer resume event
      try {
        window.dispatchEvent(new CustomEvent('image:generation:complete'));
      } catch {}
      
      return {
        success: true,
        url: fallbackUrl,
        imageURL: fallbackUrl,
        generatedAt: new Date().toISOString(),
        tier: 'Intelligent Fallback',
        metadata: {
          cascadeHistory,
          directModeAttempted,
          directModeError,
          orchestratorFailed: true,
          orchestratorFailureReason: this.categorizeOrchestratorError(error),
          pathUsed: intelligentFallback ? 'INTELLIGENT_FALLBACK' : 'SVG_PLACEHOLDER',
          isFallback: true,
          originalError: error.message,
          tier: 'intelligent_fallback',
          healthStatus,
          usedIntelligentFallback: !!intelligentFallback
        }
      };
    }
  }

  // Direct AI Visual Scene Creator call (bypassing orchestrator)
  private static async generateWithDirectAiVisualSceneCreator(
    storyText: string,
    userInfo?: UserInfo,
    sessionId?: string,
    pageNumber: number = 1,
    isPremium: boolean = false,
    healthStatus?: HealthStatus
  ): Promise<ImageResult> {
    const normalizedSessionId = sessionId?.toString() || 'unknown';
    
    DebugLogger.log('image', 'Direct AI Visual Scene Creator: Starting generation');
    
    try {
      // Apply the same preprocessing as orchestrator
      const cleanScene = storyText.trim().substring(0, 3000);
      
      // Enhance character description
      if (userInfo?.ethnicity && userInfo?.skinTone) {
        const universalHair = this.getUniversalHairColorForSkinTone(userInfo.skinTone, userInfo.ethnicity, normalizedSessionId);
        const enhancedUserInfo = {
          ...userInfo,
          hair: universalHair,
          universalHairColor: universalHair
        };
        userInfo = enhancedUserInfo;
      }

      // Use raw story content directly - no protection enhancement
      const enhancedPrompt = cleanScene;
      const protectionNegatives: string[] = [];
      
      // Map difficulty level
      const backendDifficulty = this.mapDifficultyLevel(userInfo);
      
      DebugLogger.log('image', 'Calling ai-visual-scene-creator directly');
      
      const { data: result, error } = await supabase.functions.invoke('ai-visual-scene-creator', {
        body: {
          storyText: enhancedPrompt,
          userInfo,
          sessionId: normalizedSessionId,
          storyId: normalizedSessionId,
          pageNumber,
          isGuestUser: !isPremium,
          difficultyLevel: backendDifficulty,
          protectionNegatives,
          directMode: true
        }
      });

      if (error) {
        throw new Error(`AI Visual Scene Creator error: ${error.message}`);
      }

      // Phase A: Multi-Field Image URL Validation - Handle all API response variations  
      const imageURL = result?.imageURL || result?.image_url || result?.imageUrl || result?.url;
      if (result?.success && imageURL?.trim()) {
        DebugLogger.log('image', `🖼️ Direct AI Visual Scene Creator success: ${imageURL}`);
        
        // Store in fast cache
        OptimizedImageCache.cacheImage(storyText, imageURL, normalizedSessionId);

        // Emit timer resume event
        try {
          window.dispatchEvent(new CustomEvent('image:generation:complete'));
        } catch {}

        return {
          success: true,
          url: imageURL,
          imageURL: imageURL,
          generatedAt: new Date().toISOString(),
          tier: 'AI_VISUAL_SCENE_DIRECT',
          usedTier: 'AI_VISUAL_SCENE_DIRECT',
          tierErrors: [],
          requestId: result.requestId,
          metadata: { ...result, directCall: true }
        };
      } else {
        throw new Error(`AI Visual Scene Creator returned no image: ${JSON.stringify(result)}`);
      }
      
    } catch (error) {
      DebugLogger.error('image', 'Direct AI Visual Scene Creator failed - escalating to Tier 2.5C', error);
      
      // Re-throw to allow main orchestrator to handle Tier 2.5C escalation
      const escalationError = new Error('DIRECT_MODE_FAILED');
      (escalationError as any).cause = error;
      throw escalationError;
    }
  }

  // Template-based generation (Tier 2.5C)
  private static async generateWithTemplate(
    storyText: string,
    userInfo?: UserInfo,
    sessionId?: string,
    pageNumber: number = 1,
    isPremium: boolean = false,
    healthStatus?: HealthStatus
  ): Promise<ImageResult> {
    const normalizedSessionId = sessionId?.toString() || 'unknown';
    
    // Check cache first
    if (this.isIndexedDBAvailable && normalizedSessionId !== 'unknown') {
      const cached = await this.getImageFromDB(normalizedSessionId, pageNumber);
      if (cached?.imageURL) {
        DebugLogger.log('image', `📸 Template cache hit: session ${normalizedSessionId}, page ${pageNumber}`);
        return {
          success: true,
          url: cached.imageURL,
          generatedAt: cached.timestamp,
          tier: 'Template Cache',
          metadata: { ...cached.metadata, fromCache: true, healthStatus }
        };
      }
    }

    // Try nuclear templates in order: 2.5C → 2.5D
    const templates = [
      { complexity: 'C', tierName: 'TIER_2_5C_TEMPLATE' },
      { complexity: 'D', tierName: 'TIER_2_5D_TEMPLATE' }
    ];

    for (const template of templates) {
      try {
        DebugLogger.log('image', `Calling nuclear independent template: runware-template-cd (complexity ${template.complexity})`);
        
        const { data: templateResult, error: templateError } = await supabase.functions.invoke('runware-template-cd', {
          body: {
            pageText: storyText.trim().substring(0, 3000),
            userInfo,
            sessionId: normalizedSessionId,
            pageNumber,
            isGuestUser: !isPremium,
            difficultyLevel: this.mapDifficultyLevel(userInfo),
            templateComplexity: template.complexity
          }
        });

        if (templateError) {
          throw new Error(`Template ${template.complexity} error: ${templateError.message}`);
        }

        // Phase A: Multi-Field Image URL Validation - Handle all API response variations
        const imageURL = templateResult?.imageURL || templateResult?.image_url || templateResult?.imageUrl || templateResult?.url;
        if (templateResult?.success && imageURL?.trim()) {
          DebugLogger.log('image', `🖼️ Template ${template.complexity} generated successfully: ${imageURL}`);
          
          // Store result in fast cache
          OptimizedImageCache.cacheImage(storyText, imageURL, normalizedSessionId);

          // Emit timer resume event
          try {
            window.dispatchEvent(new CustomEvent('image:generation:complete'));
          } catch {}

          return {
            success: true,
            url: imageURL,
            imageURL: imageURL,
            generatedAt: new Date().toISOString(),
            tier: template.tierName,
            usedTier: template.tierName,
            metadata: { ...templateResult, healthStatus }
          };
        } else {
          throw new Error(`Template ${template.complexity} returned no image: ${JSON.stringify(templateResult)}`);
        }
      } catch (error) {
        DebugLogger.error('image', `Template ${template.complexity} generation failed`, error);
        // Continue to next template if this one fails
        if (template.complexity === 'D') {
          // Last template failed, proceed to final fallback
          break;
        }
      }
    }

    // All nuclear templates failed - final SVG fallback
    DebugLogger.error('image', 'All nuclear templates (2.5C and 2.5D) failed, using SVG fallback');
    
    const fallbackUrl = ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber);
    
    // Emit timer resume event
    try {
      window.dispatchEvent(new CustomEvent('image:generation:complete'));
    } catch {}
    
    return {
      success: true,
      url: fallbackUrl,
      imageURL: fallbackUrl,
      generatedAt: new Date().toISOString(),
      tier: 'TIER_4_TEMPLATE_FALLBACK',
      metadata: {
        isFallback: true,
        originalError: 'All nuclear templates failed',
        tier: 'template_fallback',
        healthStatus
      }
    };
  }

  // Map user info to backend difficulty level
  private static mapDifficultyLevel(userInfo?: UserInfo): string {
    if (!userInfo?.age) return 'medium';
    
    const age = userInfo.age;
    if (age <= 5) return 'beginner';
    if (age <= 8) return 'easy';
    if (age <= 12) return 'medium';
    if (age <= 16) return 'hard';
    return 'expert';
  }

  // Session-seeded random selection for consistent variety
  private static createSeededRandom(seed: number): () => number {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  private static pickFromArray<T>(arr: T[], sessionId: string): T {
    if (!Array.isArray(arr) || arr.length === 0) return arr[0];
    
    // Convert sessionId to numeric seed
    const numericSeed = sessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = this.createSeededRandom(numericSeed);
    
    return arr[Math.floor(seededRandom() * arr.length)];
  }

  // Universal hair color mapping for all skin tones and ethnicities - SESSION-SEEDED for variety
  private static getUniversalHairColorForSkinTone(skinTone: string, ethnicity: string, sessionId: string): string {
    // PROPER HAIR VARIATIONS - matches backend StaticDataCache.HAIR_BY_SKIN_TONE (73 variations)
    const HAIR_BY_SKIN_TONE = {
      'pale': [
        'strawberry blonde hair', 'golden red hair', 'auburn curls', 'copper hair',
        'reddish brown hair', 'ginger hair', 'red-gold hair', 'russet hair',
        'mahogany red hair', 'burgundy hair', 'crimson hair', 'rose gold hair',
        'amber red hair', 'cinnamon red hair'
      ],
      'light': [
        'platinum blonde hair', 'golden blonde hair', 'honey blonde hair', 'ash blonde hair',
        'sandy blonde hair', 'wheat blonde hair', 'butter blonde hair', 'cream blonde hair',
        'champagne blonde hair', 'vanilla blonde hair', 'pearl blonde hair', 'silver blonde hair',
        'moonlight blonde hair', 'sunshine blonde hair', 'caramel blonde hair'
      ],
      'medium': [
        'chestnut brown hair', 'chocolate brown hair', 'coffee brown hair', 'walnut brown hair',
        'hazelnut brown hair', 'mahogany brown hair', 'amber brown hair', 'bronze brown hair',
        'toffee brown hair', 'mocha brown hair', 'caramel brown hair', 'russet brown hair',
        'cedar brown hair', 'oak brown hair', 'maple brown hair'
      ],
      'olive': [
        'jet black hair', 'raven black hair', 'midnight black hair', 'obsidian hair',
        'coal black hair', 'ebony hair', 'onyx hair', 'charcoal hair',
        'deep black hair', 'ink black hair', 'shadow black hair', 'pitch black hair',
        'dark espresso hair', 'blackest brown hair'
      ],
      'dark': [
        'beautiful dark hair', 'rich black hair', 'lustrous dark hair', 'silky black hair',
        'gorgeous dark hair', 'shining black hair', 'magnificent dark hair'
      ]
    };
    
    // Ethnicity overrides (cultural authenticity - DETERMINISTIC)
    const ethnicityOverrides = {
      'african': 'black',
      'african-american': 'black',
      'hispanic': 'black',
      'asian': 'black',
      'middle-eastern': 'black'
    };
    
    const ethnicKey = ethnicity?.toLowerCase().replace(/\s+/g, '-');
    if (ethnicKey && ethnicityOverrides[ethnicKey]) {
      return `${ethnicityOverrides[ethnicKey]} hair`; // Deterministic for cultural authenticity
    }
    
    // Map skin tone variations to base categories
    const skinToneMapping = {
      'very-light': 'pale',
      'fair': 'pale',
      'pale': 'pale',
      'beige': 'light',
      'light': 'light',
      'honey': 'medium',
      'tan': 'medium',
      'medium': 'medium',
      'olive': 'olive',
      'dark': 'dark',
      'very-dark': 'dark',
      'deep': 'dark',
      'ebony': 'dark',
      'mahogany': 'dark'
    };
    
    const skinKey = skinTone?.toLowerCase().replace(/\s+/g, '-');
    const baseCategory = skinToneMapping[skinKey] || 'medium';
    const hairOptions = HAIR_BY_SKIN_TONE[baseCategory] || HAIR_BY_SKIN_TONE['medium'];
    
    // SESSION-SEEDED selection for variety + consistency
    return this.pickFromArray(hairOptions, sessionId);
  }

  // Intelligent fallback ordering system for image generation
  private static async getImageWithIntelligentFallback(
    userInfo: UserInfo, 
    pageContent: string, 
    isGuestUser: boolean,
    sessionId?: string,
    pageNumber: number = 1
  ): Promise<string | null> {
    // Priority order: Runware > Fallback Images > Generic
    const fallbackStrategies = [
      () => this.tryRunwareGeneration(userInfo, pageContent, isGuestUser, sessionId, pageNumber),
      () => this.tryFallbackImageService(userInfo, pageContent, pageNumber),
      () => this.tryGenericImageGeneration(pageContent)
    ];
    
    for (const strategy of fallbackStrategies) {
      try {
        const result = await strategy();
        if (result && result.startsWith('http')) {
          DebugLogger.log('image', `Fallback success with strategy: ${strategy.name}`);
          return result;
        }
      } catch (error) {
        DebugLogger.warn('image', `Fallback strategy failed: ${strategy.name}`, error);
        continue;
      }
    }
    
    DebugLogger.warn('image', 'All fallback strategies exhausted');
    return null;
  }

  // Try Runware generation as first priority
  private static async tryRunwareGeneration(
    userInfo: UserInfo, 
    pageContent: string, 
    isGuestUser: boolean,
    sessionId?: string,
    pageNumber: number = 1
  ): Promise<string | null> {
    try {
      const result = await this.generateWithOrchestrator(
        pageContent, userInfo, sessionId, pageNumber, !isGuestUser
      );
      return result.success ? (result.url || result.imageURL) : null;
    } catch (error) {
      DebugLogger.warn('image', 'Runware generation failed in fallback', error);
      return null;
    }
  }

  // Try fallback image service as second priority
  private static async tryFallbackImageService(
    userInfo: UserInfo, 
    pageContent: string, 
    pageNumber: number
  ): Promise<string | null> {
    try {
      return ImageFallbackService.generateStoryPlaceholder(pageContent, pageNumber);
    } catch (error) {
      DebugLogger.warn('image', 'Fallback image service failed', error);
      return null;
    }
  }

  // Try generic image generation as last resort
  private static async tryGenericImageGeneration(pageContent: string): Promise<string | null> {
    try {
      const svgResult = this.generateSVGPlaceholder(pageContent);
      return svgResult.url;
    } catch (error) {
      DebugLogger.warn('image', 'Generic SVG generation failed', error);
      return null;
    }
  }

  // Generate character versioned cache key for consistency tracking
  private static generateCharacterVersionedCacheKey(userInfo: UserInfo, pageContent: string): string {
    const baseKey = `${userInfo?.name || 'user'}_${pageContent.substring(0, 50)}`;
    const characterSignature = JSON.stringify({
      ethnicity: userInfo?.ethnicity,
      hair: userInfo?.hair, 
      features: userInfo?.features,
      avatar: userInfo?.avatar?.type
    });
    const versionHash = btoa(characterSignature).substring(0, 8);
    return `${baseKey}_v${versionHash}`;
  }

  // Detect if character appearance has changed during session
  private static hasCharacterChanged(oldUserInfo: UserInfo, newUserInfo: UserInfo): boolean {
    const oldSig = JSON.stringify({
      ethnicity: oldUserInfo?.ethnicity,
      hair: oldUserInfo?.hair,
      features: oldUserInfo?.features,
      avatar: oldUserInfo?.avatar?.type
    });
    const newSig = JSON.stringify({
      ethnicity: newUserInfo?.ethnicity,
      hair: newUserInfo?.hair,
      features: newUserInfo?.features,
      avatar: newUserInfo?.avatar?.type
    });
    return oldSig !== newSig;
  }

  // Generate SVG placeholder as final fallback
  private static generateSVGPlaceholder(cleanScene: string, userInfo?: UserInfo): { url: string } {
    DebugLogger.warn('image', 'Using local SVG fallback due to backend unavailability');
    
    // Extract key elements from the scene for the placeholder
    const hasCharacter = /\b(child|person|character|they|he|she|avatar)\b/i.test(cleanScene);
    const hasOutdoor = /\b(outside|outdoor|garden|playground|park|forest|beach)\b/i.test(cleanScene);
    const hasActivity = /\b(playing|running|walking|reading|building|creating)\b/i.test(cleanScene);
    
    const backgroundColor = hasOutdoor ? '#87CEEB' : '#f8f9fa';
    const groundColor = hasOutdoor ? '#90EE90' : '#e5e7eb';
    
    // Create a simple but contextual SVG
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <!-- Background -->
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        
        <!-- Ground/Floor -->
        <rect x="0" y="200" width="400" height="100" fill="${groundColor}"/>
        
        ${hasCharacter ? `
        <!-- Simple character representation -->
        <circle cx="200" cy="150" r="20" fill="#ffdbac" stroke="#333" stroke-width="2"/>
        <rect x="185" y="170" width="30" height="40" fill="#4a90e2" rx="5"/>
        <line x1="185" y1="185" x2="170" y2="220" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        <line x1="215" y1="185" x2="230" y2="220" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        <line x1="185" y1="175" x2="160" y2="195" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        <line x1="215" y1="175" x2="240" y2="195" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        <!-- Simple face -->
        <circle cx="190" cy="145" r="2" fill="#333"/>
        <circle cx="210" cy="145" r="2" fill="#333"/>
        <path d="M 190 155 Q 200 165 210 155" stroke="#333" stroke-width="2" fill="none"/>
        ` : ''}
        
        ${hasActivity && hasCharacter ? `
        <!-- Activity indicator -->
        <circle cx="250" cy="180" r="8" fill="#ff6b6b" opacity="0.7"/>
        <circle cx="270" cy="170" r="6" fill="#4ecdc4" opacity="0.7"/>
        <circle cx="290" cy="185" r="7" fill="#45b7d1" opacity="0.7"/>
        ` : ''}
        
        ${hasOutdoor ? `
        <!-- Sun -->
        <circle cx="350" cy="50" r="15" fill="#ffd93d"/>
        <line x1="350" y1="20" x2="350" y2="35" stroke="#ffd93d" stroke-width="2"/>
        <line x1="320" y1="50" x2="335" y2="50" stroke="#ffd93d" stroke-width="2"/>
        <line x1="365" y1="50" x2="380" y2="50" stroke="#ffd93d" stroke-width="2"/>
        <line x1="350" y1="65" x2="350" y2="80" stroke="#ffd93d" stroke-width="2"/>
        
        <!-- Clouds -->
        <ellipse cx="100" cy="60" rx="25" ry="15" fill="white" opacity="0.8"/>
        <ellipse cx="120" cy="55" rx="20" ry="12" fill="white" opacity="0.8"/>
        <ellipse cx="85" cy="55" rx="18" ry="10" fill="white" opacity="0.8"/>
        ` : `
        <!-- Indoor lighting -->
        <rect x="50" y="20" width="300" height="30" fill="#fff3cd" opacity="0.6" rx="15"/>
        `}
        
        <!-- Scene title -->
        <text x="200" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
          Story Scene Placeholder
        </text>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;base64,' + btoa(svgContent)
    };
  }

  // Session-based user info persistence for character consistency
  private static async getLastUserInfoFromSession(sessionId: string): Promise<UserInfo | null> {
    try {
      const stored = sessionStorage.getItem(`userInfo_${sessionId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private static async saveUserInfoToSession(sessionId: string, userInfo: UserInfo): Promise<void> {
    try {
      sessionStorage.setItem(`userInfo_${sessionId}`, JSON.stringify(userInfo));
    } catch (error) {
      DebugLogger.warn('image', 'Failed to save user info to session', error);
    }
  }

  private static async clearSessionCharacterCache(sessionId: string): Promise<void> {
    try {
      // Clear session storage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes(sessionId)) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Clear IndexedDB entries for this session
      if (this.isIndexedDBAvailable) {
        await this.clearDBEntriesForSession(sessionId);
      }
      
      DebugLogger.log('image', `Cleared character cache for session: ${sessionId}`);
    } catch (error) {
      DebugLogger.warn('image', 'Failed to clear session character cache', error);
    }
  }

  private static async clearDBEntriesForSession(sessionId: string): Promise<void> {
    if (!this.isIndexedDBAvailable) return;
    
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const index = store.index('sessionId');
      
      const request = index.openCursor(IDBKeyRange.only(sessionId));
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      DebugLogger.log('image', `Cleared IndexedDB entries for session ${sessionId}`);
    } catch (error) {
      DebugLogger.warn('image', 'Failed to clear IndexedDB entries for session', error);
    }
  }

  // ============= PROACTIVE DIRECT MODE BYPASS LOGIC =============
  
  /**
   * Evaluate whether to bypass the orchestrator and go directly to Direct Mode
   */
  private static async evaluateDirectModeBypass(
    sessionId: string, 
    healthStatus?: HealthStatus
  ): Promise<BypassDecision> {
    const conditions: string[] = [];
    
    // Check for force tier 1 flag (URL param, localStorage, etc.)
    const forceTier1 = this.checkForceTier1Flag();
    if (forceTier1.active) {
      conditions.push(`Force Tier 1: ${forceTier1.source}`);
    }
    
    // Check orchestrator health status
    const orchestratorUnhealthy = this.checkOrchestratorHealth(healthStatus);
    if (orchestratorUnhealthy.unhealthy) {
      conditions.push(`Orchestrator Health: ${orchestratorUnhealthy.reason}`);
    }
    
    // Check recent failure history
    const recentFailures = await this.checkRecentFailures(sessionId);
    if (recentFailures.hasFailures) {
      conditions.push(`Recent Failures: ${recentFailures.count} in last ${recentFailures.window}`);
    }
    
    // Check test/debug modes
    const debugMode = this.checkDebugMode();
    if (debugMode.active) {
      conditions.push(`Debug Mode: ${debugMode.type}`);
    }
    
    // Check user preferences
    const userPreference = this.checkUserPreference();
    if (userPreference.preferDirectMode) {
      conditions.push(`User Preference: ${userPreference.reason}`);
    }
    
    // Decision logic: bypass if any condition is met
    const shouldBypass = conditions.length > 0;
    
    const decision: BypassDecision = {
      shouldBypass,
      reason: shouldBypass 
        ? `Proactive bypass triggered: ${conditions.join(', ')}`
        : 'No bypass conditions met',
      conditions
    };
    
    return decision;
  }
  
  /**
   * Check for force tier 1 flags
   */
  private static checkForceTier1Flag(): { active: boolean; source?: string } {
    try {
      // Check URL parameters
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('forceTier1') === 'true' || urlParams.get('directMode') === 'true') {
          return { active: true, source: 'URL parameter' };
        }
        
        // Check localStorage
        if (localStorage.getItem('forceTier1') === 'true' || localStorage.getItem('debugDirectMode') === 'true') {
          return { active: true, source: 'localStorage setting' };
        }
      }
    } catch (error) {
      // Ignore errors in checking flags
    }
    
    return { active: false };
  }
  
  /**
   * Check orchestrator health status
   */
  private static checkOrchestratorHealth(healthStatus?: HealthStatus): { unhealthy: boolean; reason?: string } {
    if (!healthStatus) {
      return { unhealthy: false };
    }
    
    // Aggressively bypass if orchestrator specifically is unhealthy
    if (healthStatus.orchestrator !== 'healthy') {
      return { 
        unhealthy: true, 
        reason: `Orchestrator status: ${healthStatus.orchestrator}` 
      };
    }
    
    // Also bypass if multiple services are unhealthy (fallback logic)
    const downServices = Object.entries(healthStatus).filter(([_, status]) => status !== 'healthy');
    if (downServices.length >= 2) {
      return { 
        unhealthy: true, 
        reason: `${downServices.length} services unhealthy: ${downServices.map(([name, status]) => `${name}(${status})`).join(', ')}` 
      };
    }
    
    return { unhealthy: false };
  }
  
  /**
   * Check recent orchestrator failures for this session
   */
  private static async checkRecentFailures(sessionId: string): Promise<{ hasFailures: boolean; count?: number; window?: string }> {
    try {
      if (!this.isIndexedDBAvailable) {
        return { hasFailures: false };
      }
      
      const db = await this.openDB();
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const index = store.index('sessionId');
      
      let failureCount = 0;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return new Promise((resolve) => {
        const request = index.openCursor(IDBKeyRange.only(sessionId));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const record = cursor.value;
            const recordTime = new Date(record.timestamp);
            
            if (recordTime > oneHourAgo && record.metadata?.orchestratorFailure) {
              failureCount++;
            }
            
            cursor.continue();
          } else {
            // Finished checking records
            const hasFailures = failureCount >= 3; // 3+ failures in last hour
            resolve({ 
              hasFailures, 
              count: failureCount, 
              window: '1 hour' 
            });
          }
        };
        
        request.onerror = () => {
          resolve({ hasFailures: false });
        };
      });
      
    } catch (error) {
      return { hasFailures: false };
    }
  }
  
  /**
   * Check debug/test mode flags
   */
  private static checkDebugMode(): { active: boolean; type?: string } {
    try {
      if (typeof window !== 'undefined') {
        // Check for debug mode in URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === 'true' || urlParams.get('testMode') === 'true') {
          return { active: true, type: 'URL debug flag' };
        }
        
        if (localStorage.getItem('imageDebugMode') === 'true') {
          return { active: true, type: 'localStorage debug mode' };
        }
        
        // Check for development environment
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
          const devMode = localStorage.getItem('autoDirectMode');
          if (devMode === 'true') {
            return { active: true, type: 'development auto-bypass' };
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return { active: false };
  }
  
  /**
   * Orchestrator-specific health check - quick ping to runware-generate-image
   */
  private static async checkOrchestratorServiceHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      const response = await supabase.functions.invoke('runware-generate-image', {
        body: { healthCheck: true }
      });
      
      if (response.error) {
        DebugLogger.warn('image', 'Orchestrator health check failed', { error: response.error });
        return 'down';
      }
      
      DebugLogger.log('image', 'Orchestrator health check passed');
      return 'healthy';
    } catch (error) {
      DebugLogger.error('image', 'Orchestrator health check exception', { error });
      return 'down';
    }
  }
  
  /**
   * Check user preference for Direct Mode
   */
  private static checkUserPreference(): { preferDirectMode: boolean; reason?: string } {
    try {
      if (typeof window !== 'undefined') {
        const preference = localStorage.getItem('imageGenerationMode');
        if (preference === 'direct' || preference === 'tier1-only') {
          return { 
            preferDirectMode: true, 
            reason: 'user selected Direct Mode preference' 
          };
        }
        
        // Check for performance mode
        const performanceMode = localStorage.getItem('performanceMode');
        if (performanceMode === 'fast' || performanceMode === 'bypass-orchestrator') {
          return {
            preferDirectMode: true,
            reason: 'performance mode enabled'
          };
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return { preferDirectMode: false };
  }
  
  /**
   * Categorize orchestrator error for debugging
   */
  private static categorizeOrchestratorError(error: any): string {
    const errorMsg = error?.message || error?.toString() || 'Unknown error';
    
    if (errorMsg.includes('503') || errorMsg.includes('Service temporarily unavailable')) {
      return 'SERVICE_UNAVAILABLE';
    }
    if (errorMsg.includes('400') || errorMsg.includes('validation failed')) {
      return 'VALIDATION_ERROR';
    }
    if (errorMsg.includes('timeout') || errorMsg.includes('exceeded')) {
      return 'TIMEOUT';
    }
    if (errorMsg.includes('CharacterConsistencyService')) {
      return 'CHARACTER_SERVICE_FAILURE';
    }
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }
  
  /**
   * Extract status code from error object
   */
  private static extractStatusCode(error: any): number | null {
    if (error?.status) return error.status;
    if (error?.response?.status) return error.response.status;
    
    const errorMsg = error?.message || error?.toString() || '';
    const match = errorMsg.match(/\b([45]\d{2})\b/);
    return match ? parseInt(match[1]) : null;
  }

  // Legacy method support
  static async generateImage(params: any): Promise<ImageResult> {
    return this.generateStoryImage(
      params.storyText || params.pageText || '',
      params.userInfo,
      params.sessionId,
      params.pageNumber || 1,
      params.isPremium || false,
      params.forceTier1 || false
    );
  }
}

// Export default for backwards compatibility
export default SimpleImageService;