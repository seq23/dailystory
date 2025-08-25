import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { SessionStateManager } from "../_shared/SessionStateManager.js";
import { SecurityValidator } from "../_shared/SecurityValidator.js";
import { AVATAR_FALLBACK_DESCRIPTIONS, validateAvatarConsistency, validateAvatarQuality } from "../_shared/avatarConsistency.js";

/**
 * ============================================================================
 * IMAGE GENERATION TIER POLICY - CRITICAL BUSINESS RULE
 * ============================================================================
 * 
 * ALL USERS (GUEST AND PREMIUM) RECEIVE TIER 1 IMAGES
 * 
 * This is a fundamental business decision to ensure:
 * - 100% image generation success rate through comprehensive fallback system
 * - Consistent high-quality user experience regardless of subscription status  
 * - Premium value proposition focused on other features (unlimited time, saves, etc.)
 * - Simplified architecture without subscription-based image quality tiers
 * 
 * TIER PROGRESSION FOR ALL USERS:
 * - Tier 1: AI-Enhanced Premium (runware:100@1 with full enhancement pipeline)
 * - Tier 2: Template-Based Fallback (structured templates)
 * - Tier 2.5: Nuclear Hardcoded Fallback (guaranteed generation)
 * - Tier 3: OpenAI DALL-E Fallback (external provider)
 * - Tier 4: SVG Placeholder (100% guaranteed success)
 * 
 * IMPORTANT: The `isGuestUser` parameter is for analytics/tracking only
 * DO NOT use it for tier selection or image quality degradation
 * 
 * REGRESSION PREVENTION:
 * - Never implement subscription-based tier restrictions
 * - All users must start with Tier 1 premium image generation
 * - Fallbacks exist for reliability, not subscription enforcement
 * 
 * ============================================================================
 */

// Phase 2: Enhanced Backend Orchestrator for All Image Generation Tiers
// Now handles: AI Enhancement → Tier 1 → Tier 2 → Tier 2.5 → Tier 3 → Tier 4
serve(async (req) => {
  console.log(`🎯 Image Generation Orchestrator: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  // Validate API key
  const apiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!apiKey) {
    console.error('❌ RUNWARE_API_KEY not found in environment');
    return createCorsErrorResponse('Server configuration error', 500);
  }

  try {
    // Orchestrator services are now statically imported
    
    // Parse request
    const { 
      pageText, 
      userInfo, 
      storyId,
      sessionId,
      pageNumber = 1,
      isGuestUser = false, // Default to false for analytics tracking
      enhancedStoryData,
      forceTier // Optional: force specific tier for testing
    } = await req.json();

    // ============================================================================
    // PHASE 4: CRITICAL SECURITY VALIDATION
    // ============================================================================
    
    // Validate required parameters
    if (!pageText) {
      return createCorsErrorResponse('Missing pageText parameter', 400);
    }
    
    if (!sessionId) {
      return createCorsErrorResponse('Missing sessionId parameter', 400);
    }
    
    if (!storyId) {
      return createCorsErrorResponse('Missing storyId parameter', 400);
    }

    // Security validation
    const securityCheck = await SecurityValidator.validateImageRequest(req, {
      pageText,
      sessionId,
      pageNumber,
      userInfo
    });
    
    if (!securityCheck.valid) {
      console.error('🚨 Security validation failed:', securityCheck.reason);
      return createCorsErrorResponse(`Security validation failed: ${securityCheck.reason}`, securityCheck.status || 403);
    }

    // Rate limiting check
    const rateLimitCheck = await SecurityValidator.checkRateLimit(sessionId, 'image_generation');
    if (!rateLimitCheck.allowed) {
      console.error('🚨 Rate limit exceeded for session:', sessionId);
      return createCorsErrorResponse('Rate limit exceeded. Please try again later.', 429);
    }

        console.log(`🎯 Starting image orchestration for page ${pageNumber} (Guest: ${isGuestUser || false})`);
        console.log(`🧠 Enhanced data available: ${enhancedStoryData ? 'Yes' : 'No'}`);
        console.log('🔍 TIER SYSTEM DEBUG - Starting orchestrated tier progression', {
          pageText: pageText.substring(0, 100) + '...',
          userInfo: !!userInfo,
          sessionId,
          pageNumber,
          totalPages: 'unknown',
          forceTier: forceTier || 'auto',
          timestamp: new Date().toISOString()
        });

    // PHASE 1: Avatar Identity Mapper - Process user avatar data once at orchestrator level
    const avatarIdentity = mapAvatarIdentity(userInfo);
    console.log(`👤 Avatar Identity Mapped: ${avatarIdentity.type}/${avatarIdentity.skinTone} - Cultural: ${avatarIdentity.culturalProfile}`);
    
    // ENHANCED AVATAR MAPPING DEBUG
    console.log(`🔍 AVATAR MAPPING DETAILED DEBUG:`, {
      input: {
        userInfoAvatar: userInfo?.avatar,
        userInfoName: userInfo?.name,
        userInfoId: userInfo?.id
      },
      output: {
        type: avatarIdentity.type,
        skinTone: avatarIdentity.skinTone,
        culturalProfile: avatarIdentity.culturalProfile,
        nativeLanguage: avatarIdentity.nativeLanguage,
        name: avatarIdentity.name
      },
      mapping: `${userInfo?.avatar?.type || 'unknown'}/${userInfo?.avatar?.skinTone || 'unknown'} → ${avatarIdentity.type}/${avatarIdentity.skinTone}`
    });

    // ============================================================================ 
    // TIER 1: AI-Enhanced High-Quality - PROVIDED TO ALL USERS
    // ============================================================================
    // CRITICAL: This tier is available to BOTH guest and premium users
    // The isGuestUser flag is for analytics/tracking ONLY, not tier restrictions
    if (!forceTier || forceTier === 1) {
      try {
        console.log('🧠 Starting Tier 1: AI-Enhanced High-Quality Generation');
        console.log('🔍 TIER 1 DEBUG - Calling ai-story-enhancer directly (clean architecture)');
        
        // Collect previous page text for context continuity
        let previousPageText = '';
        try {
          if (pageNumber > 1) {
            const sessionManager = new SessionStateManager(sessionId);
            previousPageText = await sessionManager.getPreviousPageText(pageNumber - 1) || '';
            console.log(`📖 Collected previous page context: ${previousPageText ? 'Yes' : 'No'}`);
          }
        } catch (error) {
          // NOTE: This is genuinely non-critical - previous page context is optional for continuity
          console.warn('⚠️ Failed to collect previous page context (non-critical):', error);
        }
        
        // Call ai-story-enhancer directly with pre-processed avatar identity and previous context
        const aiEnhancerResult = await callTierFunction('ai-story-enhancer', {
          storyText: pageText,
          userInfo,
          storyId,
          sessionId,
          pageNumber,
          avatarIdentity, // Pass pre-processed avatar identity directly
          enhancedStoryData,
          previousPageText // Pass previous page text for continuity
        });

        console.log('🔍 TIER 1 DEBUG - AI enhancer returned pure schema, doing direct technical assembly in orchestrator');
        
        if (!aiEnhancerResult.success) {
          throw new Error(`AI enhancer failed: ${aiEnhancerResult.error || 'Unknown error'}`);
        }

        // Get the pure AI schema from enhancer
        const aiSchema = aiEnhancerResult.aiSchema;
        
        // PHASE 2: DIRECT TECHNICAL ASSEMBLY IN ORCHESTRATOR
        console.log('🔧 Orchestrator: Starting direct technical assembly');
        
        // Import services for direct assembly
        const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
        const { getStyleFramework } = await import('../_shared/styleFrameworks.js');
        const { validateAvatarConsistency } = await import('../_shared/avatarConsistency.js');
        
        // Initialize character consistency service
        const characterService = new CharacterConsistencyService();
        
        // 1. Character Consistency Generation
        const characterData = await characterService.getCharacterSeed(
          sessionId, 
          userInfo.id || 'unknown-user',
          userInfo,
          pageText,
          avatarIdentity,
          'standard'
        );
        
        // 2. Style Framework Application - Map grade level to difficulty
        const gradeLevelToDifficulty = (grade) => {
          const gradeStr = String(grade).toLowerCase();
          if (gradeStr === 'k' || gradeStr === 'kindergarten') return 'beginner';
          if (['1', '2'].includes(gradeStr)) return 'easy';
          if (['3', '4'].includes(gradeStr)) return 'medium';
          if (['5', '6'].includes(gradeStr)) return 'hard';
          return 'expert'; // 7+
        };
        
        const difficulty = gradeLevelToDifficulty(userInfo.gradeLevel || 'K');
        const storyFramework = getStyleFramework(difficulty);
        
        // 3. Avatar Validation
        const validatedAvatar = validateAvatarConsistency(avatarIdentity, userInfo, sessionId);
        
        // PHASE 5: Generate unique request ID for cross-function correlation
        const requestId = `IMG-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
        console.log(`🎯 [${requestId}] Starting Runware prompt assembly phase`);

        // PHASE 4: Comprehensive Runware prompt construction with proper segment order
        const segments = [];
        
        console.log(`🎨 [${requestId}] Style Framework Retrieved:`, {
          difficulty,
          frameworkName: storyFramework.name,
          gradeLevel: userInfo.gradeLevel || 'K',
          hasAllComponents: {
            artStyle: !!storyFramework.artStyle,
            colorPalette: !!storyFramework.colorPalette,
            lighting: !!storyFramework.lighting,
            texture: !!storyFramework.texture,
            composition: !!storyFramework.composition,
            quality: !!storyFramework.quality,
            brandSuffix: !!storyFramework.brandSuffix,
            prompt: !!storyFramework.prompt,
            negativePrompt: !!storyFramework.negativePrompt
          }
        });
        
        // 1. CHARACTER DESCRIPTION (First - establishes visual identity)
        if (characterData.characterDescription) {
          segments.push(characterData.characterDescription);
          console.log(`✅ [${requestId}] Segment 1 - Character Description Added:`, {
            length: characterData.characterDescription.length,
            preview: characterData.characterDescription.substring(0, 100) + '...',
            seed: characterData.seed,
            source: 'CharacterConsistencyService'
          });
        } else {
          console.warn(`⚠️ [${requestId}] Missing character description`);
        }
        
        // 2. PRIMARY SCENE (Second - main story context)
        if (aiSchema.primaryScene) {
          segments.push(aiSchema.primaryScene);
          console.log(`🎯 [${requestId}] Segment 2 - Primary Scene Added:`, {
            length: aiSchema.primaryScene.length,
            preview: aiSchema.primaryScene.substring(0, 150) + '...',
            source: 'AI-enhanced primaryScene'
          });
        } else {
          console.warn(`⚠️ [${requestId}] Missing primaryScene from AI schema`);
        }
        
        // 3. ART STYLE (Third - establishes visual approach)
        if (storyFramework.artStyle) {
          segments.push(storyFramework.artStyle);
          console.log(`🎨 [${requestId}] Segment 3 - Art Style Added:`, {
            content: storyFramework.artStyle,
            source: 'styleFramework.artStyle'
          });
        }
        
        // 4. COLOR PALETTE (Fourth - color harmony)
        if (storyFramework.colorPalette) {
          segments.push(storyFramework.colorPalette);
          console.log(`🎨 [${requestId}] Segment 4 - Color Palette Added:`, {
            content: storyFramework.colorPalette,
            source: 'styleFramework.colorPalette'
          });
        }
        
        // 5. LIGHTING (Fifth - lighting technique)
        if (storyFramework.lighting) {
          segments.push(storyFramework.lighting);
          console.log(`🎨 [${requestId}] Segment 5 - Lighting Added:`, {
            content: storyFramework.lighting,
            source: 'styleFramework.lighting'
          });
        }
        
        // 6. TEXTURE (Sixth - surface details)
        if (storyFramework.texture) {
          segments.push(storyFramework.texture);
          console.log(`🎨 [${requestId}] Segment 6 - Texture Added:`, {
            content: storyFramework.texture,
            source: 'styleFramework.texture'
          });
        }
        
        // 7. COMPOSITION (Seventh - layout guidelines)
        if (storyFramework.composition) {
          segments.push(storyFramework.composition);
          console.log(`🎨 [${requestId}] Segment 7 - Composition Added:`, {
            content: storyFramework.composition,
            source: 'styleFramework.composition'
          });
        }
        
        // 8. QUALITY STANDARDS (Eighth - rendering quality)
        if (storyFramework.quality) {
          segments.push(storyFramework.quality);
          console.log(`🎨 [${requestId}] Segment 8 - Quality Standards Added:`, {
            content: storyFramework.quality,
            source: 'styleFramework.quality'
          });
        }
        
        // 9. BRAND SUFFIX (Ninth - brand enhancement)
        if (storyFramework.brandSuffix) {
          segments.push(storyFramework.brandSuffix);
          console.log(`🎨 [${requestId}] Segment 9 - Brand Suffix Added:`, {
            content: storyFramework.brandSuffix,
            source: 'styleFramework.brandSuffix'
          });
        }
        
        // 10. FRAMEWORK PROMPT (Tenth - complete framework prompt)
        if (storyFramework.prompt) {
          segments.push(storyFramework.prompt);
          console.log(`🎨 [${requestId}] Segment 10 - Framework Prompt Added:`, {
            content: storyFramework.prompt,
            source: 'styleFramework.prompt'
          });
        }
        
        // Build comprehensive prompts with all framework components
        const enhancedPrompt = segments.filter(s => s && s.trim()).join(', ');
        const negativePrompt = storyFramework.negativePrompt || 'blurry, low quality, distorted';
        
        // PHASE 4: Comprehensive prompt assembly logging
        console.log(`🔧 [${requestId}] Runware Prompt Assembly Complete:`, {
          totalSegments: segments.length,
          finalPromptLength: enhancedPrompt.length,
          difficulty,
          frameworkName: storyFramework.name,
          segmentBreakdown: segments.map((seg, i) => ({
            segment: i + 1,
            length: seg.length,
            preview: seg.substring(0, 50) + '...'
          })),
          componentStatus: {
            hasCharacterData: !!characterData.characterDescription,
            hasAiSchema: !!aiSchema.primaryScene,
            hasArtStyle: !!storyFramework.artStyle,
            hasColorPalette: !!storyFramework.colorPalette,
            hasLighting: !!storyFramework.lighting,
            hasTexture: !!storyFramework.texture,
            hasComposition: !!storyFramework.composition,
            hasQuality: !!storyFramework.quality,
            hasBrandSuffix: !!storyFramework.brandSuffix,
            hasFrameworkPrompt: !!storyFramework.prompt
          },
          negativePromptLength: negativePrompt.length,
          assemblyMethod: 'comma-separated concatenation with comprehensive style framework'
        });

        // COMPREHENSIVE DEBUGGING: Full prompt logging (no truncation for debugging)
        console.log(`🎯 [${requestId}] FULL Runware Prompt (${enhancedPrompt.length} chars):`);
        console.log(`📝 [${requestId}] COMPLETE POSITIVE PROMPT:`, enhancedPrompt);
        console.log(`🚫 [${requestId}] COMPLETE NEGATIVE PROMPT:`, negativePrompt);
        
        // Avatar mapping debug logging
        console.log(`👤 [${requestId}] AVATAR MAPPING DEBUG:`, {
          originalAvatarType: userInfo?.avatar?.type,
          originalSkinTone: userInfo?.avatar?.skinTone,
          mappedAvatarType: avatarIdentity.type,
          mappedSkinTone: avatarIdentity.skinTone,
          culturalProfile: avatarIdentity.culturalProfile,
          nativeLanguage: avatarIdentity.nativeLanguage,
          characterName: userInfo?.name || 'child'
        });
        
        // Character consistency debug logging
        console.log(`🎭 [${requestId}] CHARACTER CONSISTENCY DEBUG:`, {
          characterSeed: characterData.seed,
          characterDescription: characterData.characterDescription,
          characterDescriptionLength: characterData.characterDescription?.length || 0,
          hasCharacterData: !!characterData.characterDescription
        });

        const enhancementResult = {
          enhancedPrompt,
          negativePrompt,
          metadata: {
            processingTier: 'tier-1-orchestrator-direct',
            aiEnhancement: true,
            characterSeed: characterData.seed,
            segmentCount: segments.length,
            requestId: requestId, // PHASE 5: Cross-function correlation
            ...aiEnhancerResult.metadata
          }
        };
        
        // PHASE 4: Detailed avatar validation with before/after comparison
        console.log(`🔍 [${requestId}] Avatar Validation Phase - Before:`, {
          promptLength: enhancedPrompt.length,
          avatarIdentityType: avatarIdentity.type,
          avatarIdentitySkinTone: avatarIdentity.skinTone,
          promptPreview: enhancedPrompt.substring(0, 150) + '...'
        });

        const validatedPrompt = validateAvatarConsistency(enhancedPrompt, avatarIdentity, userInfo);

        console.log(`🔍 [${requestId}] Avatar Validation Phase - After:`, {
          originalLength: enhancedPrompt.length,
          validatedLength: validatedPrompt.length,
          changed: enhancedPrompt !== validatedPrompt,
          lengthDifference: validatedPrompt.length - enhancedPrompt.length,
          validatedPreview: validatedPrompt.substring(0, 150) + '...',
          validationApplied: enhancedPrompt !== validatedPrompt ? 'YES - fallback used' : 'NO - passed validation'
        });

        console.log(`🎨 [${requestId}] Final Tier 1 Prompt Ready for Runware (${validatedPrompt.length} chars):`, 
          validatedPrompt.substring(0, 200) + (validatedPrompt.length > 200 ? '...' : ''));

        // PHASE 4: Generate with Runware Tier 1 (Premium) with enhanced logging
        console.log(`🚀 [${requestId}] Initiating Runware Premium Generation:`, {
          apiKeyPresent: !!apiKey,
          promptLength: validatedPrompt.length,
          negativePromptLength: negativePrompt.length,
          characterSeed: characterData.seed,
          sessionId: sessionId,
          pageNumber: pageNumber
        });

        const tier1Result = await generateWithRunwarePremium(
          apiKey, 
          validatedPrompt, 
          negativePrompt, 
          characterData.seed,
          sessionId,
          pageNumber,
          requestId // PHASE 5: Pass requestId for correlation
        );
        
        if (tier1Result.success) {
          console.log('✅ Tier 1 AI-Enhanced succeeded');
          
          // TIER POLICY COMPLIANCE LOG - Critical for regression prevention
          console.log(`🔒 TIER POLICY COMPLIANCE: User type "${isGuestUser ? 'GUEST' : 'PREMIUM'}" received TIER 1 image - Policy maintained`);
          
          // Store visual state for consistency
          if (sessionId && characterData?.seed) {
            try {
              const sessionManager = new SessionStateManager(sessionId);
              await sessionManager.addSuccessfulPrompt(
                validatedPrompt,
                enhancementResult.metadata, 
                characterData.seed,
                tier1Result.imageURL,
                pageNumber
              );
            } catch (error) {
              // NOTE: This is genuinely non-critical - visual state storage is optional for consistency
              console.warn('⚠️ Failed to store visual state (non-critical):', error);
            }
          }

          // PHASE 1: Store successful Tier 1 image prompt  
          const { globalSessionManager } = await import('../_shared/SessionStateManager.js');
          globalSessionManager.storeImagePrompt(sessionId, {
            tier: '1',
            promptText: validatedPrompt,
            negativePrompt: enhancementResult.negativePrompt || '',
            originalPageText: pageText,
            enhancedPrompt: validatedPrompt,
            pageNumber: pageNumber,
            success: true,
            imageURL: tier1Result.imageURL,
            seed: tier1Result.seed,
            provider: 'runware-premium',
            model: 'runware:100@1',
            cost: 0.01,
            generationTime: 0,
            culturalProfile: enhancementResult.culturalProfile || {},
            styleFramework: enhancementResult.framework || {},
            metadata: {
              aiEnhanced: true,
              characterConsistency: true,
              avatarValidated: true,
              orchestrated: true,
              validationApplied: validatedPrompt !== enhancedPrompt,
              segmentCount: segments.length,
              qualityScore: enhancementResult.qualityScore || 95
            }
          });

          return createCorsResponse({
            success: true,
            imageURL: tier1Result.imageURL,
            seed: tier1Result.seed,
            provider: 'runware-orchestrator',
            tier: 1,
            enhancementLevel: 'ai-enhanced-premium',
            qualityScore: enhancementResult.qualityScore || 95,
            metadata: {
              model: "runware:100@1",
              promptLength: validatedPrompt.length,
              sessionId: sessionId || 'unknown',
              pageNumber,
              isGuestUser,
              orchestrated: true,
              validationApplied: validatedPrompt !== enhancedPrompt,
              segmentCount: segments.length,
              characterSeed: characterData.seed
            }
          });
        }
        
        console.log('⚠️ Tier 1 failed, falling back to Tier 2');
        console.log('🔍 TIER 1 FAILURE DEBUG - Generation failed but no error thrown');
      } catch (error) {
        console.log('⚠️ Tier 1 error, falling back to Tier 2:', error.message);
        console.log('🔍 TIER 1 ERROR DEBUG - Full error:', {
          message: error.message,
          stack: error.stack?.substring(0, 200) || 'no stack'
        });
      }
    }

    // TIER 2: Template-based Generation  
    if (!forceTier || forceTier === 2) {
      try {
        console.log('🎨 Starting Tier 2: Template-based Generation (using stripped MultiStageEnhancementPipeline)');
        
        // Import stripped pipeline for systematic services only
        const { MultiStageEnhancementPipeline } = await import('../_shared/MultiStageEnhancementPipeline.js');
        
        const tier2Result = await MultiStageEnhancementPipeline.processTier2HighQuality(
          pageText,
          userInfo,
          storyId,
          sessionId,
          pageNumber,
          null, // totalPages
          null, // enhancedStoryData
          avatarIdentity
        );
        
        if (tier2Result?.enhancedPrompt) {
          console.log('✅ Tier 2 Template-based succeeded');
          
          // Check for avatar quality issues that should trigger Tier 2.5
          if (tier2Result.metadata?.avatarQualityCheck && !tier2Result.metadata.avatarQualityCheck.isQualityAcceptable) {
            console.log('🔍 TIER 2.5 TRIGGER: Avatar quality check failed, forcing Tier 2.5 fallback');
            console.log('🔍 QUALITY CHECK: Avatar quality unacceptable -', tier2Result.metadata.avatarQualityCheck.reason);
            throw new Error(`Avatar quality check failed: ${tier2Result.metadata.avatarQualityCheck.reason}`);
          }
          
          // Generate with Runware using Tier 2 prompt
          const tier2GenerationResult = await generateWithRunwarePremium(
            apiKey, 
            tier2Result.enhancedPrompt, 
            tier2Result.negativePrompt,
            undefined, // no seed for Tier 2
            sessionId,
            pageNumber
          );
          
          if (tier2GenerationResult.success) {
            // PHASE 1: Store Tier 2 image prompt
            const { globalSessionManager } = await import('../_shared/SessionStateManager.js');
            globalSessionManager.storeImagePrompt(sessionId, {
              tier: '2',
              promptText: tier2Result.enhancedPrompt,
              negativePrompt: tier2Result.negativePrompt,
              originalPageText: pageText,
              enhancedPrompt: tier2Result.enhancedPrompt,
              pageNumber: pageNumber,
              success: true,
              imageURL: tier2GenerationResult.imageURL,
              seed: tier2GenerationResult.seed,
              provider: 'runware-premium',
              model: 'runware:100@1',
              cost: tier2GenerationResult.cost || 0.01,
              generationTime: tier2GenerationResult.generationTime || 0,
              metadata: {
                strippedPipeline: true,
                fallbackFromTier1: true,
                tier2Processing: true,
                ...tier2Result.metadata
              }
            });
            
            return createCorsResponse({
              success: true,
              imageURL: tier2GenerationResult.imageURL,
              seed: tier2GenerationResult.seed,
              provider: 'runware-orchestrator',
              tier: 2,
              enhancementLevel: 'systematic-services',
              metadata: { 
                ...tier2Result.metadata, 
                orchestrated: true,
                promptLength: tier2Result.enhancedPrompt.length
              }
            });
          }
        }
        
        console.log('⚠️ Tier 2 failed, falling back to Tier 2.5');
        console.log('🔍 TIER 2 FAILURE DEBUG - Systematic services failed');
      } catch (error) {
        console.log('⚠️ Tier 2 error, falling back to Tier 2.5:', error.message);
        console.log('🔍 TIER 2 ERROR DEBUG - Full error:', {
          message: error.message,
          stack: error.stack?.substring(0, 200) || 'no stack'
        });
      }
    }

    // TIER 2.5: Nuclear Hardcoded Fallback
    if (!forceTier || forceTier === 2.5) {
      try {
        console.log('🔧 Starting Tier 2.5: Nuclear Hardcoded Fallback');
        console.log('🔍 TIER 2.5 DEBUG - Calling runware-simple-fallback function (FIXED VERSION)');
        
        // TIER 2.5: Get proper difficulty mapping (same as Tier 1 & 2)
        const { DifficultyLevelMapper } = await import('../_shared/DifficultyLevelMapper.js');
        const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
        
        const tier25Result = await callTierFunction('runware-simple-fallback', {
          pageText,
          userInfo,
          difficultyLevel: mappedDifficulty,
          avatarIdentity // Pass optimized avatar identity to all tiers
        });
        
        console.log('🔍 TIER 2.5 DEBUG - Function response:', {
          success: tier25Result?.success || false,
          hasImageURL: !!tier25Result?.imageURL,
          error: tier25Result?.error || 'none',
          tier: '2.5 (ANIMAL BIAS FIXED)'
        });

        if (tier25Result.success) {
          console.log('✅ Tier 2.5 Nuclear Hardcoded succeeded');
          return createCorsResponse({
            success: true,
            imageURL: tier25Result.imageURL,
            seed: tier25Result.seed,
            provider: 'runware-orchestrator',
            tier: 2.5,
            enhancementLevel: 'nuclear-hardcoded',
            metadata: { orchestrated: true }
          });
        }
        
        console.log('⚠️ Tier 2.5 failed, falling back to Tier 3');
      } catch (error) {
        console.log('⚠️ Tier 2.5 error, falling back to Tier 3:', error.message);
      }
    }

    // TIER 3: OpenAI DALL-E Fallback
    if (!forceTier || forceTier === 3) {
      try {
        console.log('🎯 Starting Tier 3: OpenAI DALL-E Generation');
        
        // Apply dynamic style framework for OpenAI tier (same as Tier 1 & 2)
        const { getStyleFramework } = await import('../_shared/styleFrameworks.js');
        const { DifficultyLevelMapper } = await import('../_shared/DifficultyLevelMapper.js');
        const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
        const tier3Style = getStyleFramework(mappedDifficulty);
        
        const tier3Result = await callTierFunction('openai-image', {
          positivePrompt: `${tier3Style?.artStyle || 'Children\'s book illustration'}: ${pageText}. ${tier3Style?.quality || 'High quality rendering'}.`,
          negativePrompt: "text, letters, words, writing, signs, watermarks, ugly, deformed, bad anatomy, photorealistic, anime",
          size: '1024x1024',
          model: 'gpt-image-1',
          quality: 'standard',
          avatarIdentity // Pass optimized avatar identity to all tiers
        });

        if (tier3Result.success) {
          // PHASE 1: Store Tier 3 image prompt (already stored in openai-image function)
          console.log('✅ Tier 3 OpenAI succeeded');
          return createCorsResponse({
            success: true,
            imageURL: tier3Result.imageURL,
            provider: 'runware-orchestrator',
            tier: 3,
            enhancementLevel: 'openai-fallback',
            metadata: { orchestrated: true }
          });
        }
        
        console.log('⚠️ Tier 3 failed, falling back to Tier 4');
      } catch (error) {
        console.log('⚠️ Tier 3 error, falling back to Tier 4:', error.message);
      }
    }

    // TIER 4: SVG Placeholder (Guaranteed Success)
    console.log('📝 Generating Tier 4: SVG Placeholder');
    const svgResult = generateSVGPlaceholder(pageText, userInfo);
    
    // PHASE 1: Store Tier 4 SVG prompt
    const { globalSessionManager } = await import('../_shared/SessionStateManager.js');
    globalSessionManager.storeImagePrompt(sessionId, {
      tier: '4',
      promptText: `SVG Placeholder: ${pageText.substring(0, 100)}...`,
      negativePrompt: '',
      originalPageText: pageText,
      enhancedPrompt: `Generated SVG for ${avatarIdentity.name}`,
      pageNumber: pageNumber,
      success: true,
      imageURL: svgResult.url,
      seed: 0,
      provider: 'svg-placeholder',
      model: 'internal-svg',
      cost: 0,
      generationTime: 0,
      fallbackReason: 'All image generation tiers failed',
      metadata: {
        avatarIdentity,
        guaranteedFallback: true
      }
    });
    
    return createCorsResponse({
      success: true,
      imageURL: svgResult.url,
      provider: 'runware-orchestrator',
      tier: 4,
      enhancementLevel: 'svg-placeholder',
      metadata: { orchestrated: true }
    });

  } catch (error) {
    console.error('❌ Image orchestration failed:', error);
    
    // TIER POLICY COMPLIANCE LOG - Log any orchestration failures  
    console.error(`🔒 TIER POLICY WARNING: Image orchestration failed for user type "${isGuestUser ? 'GUEST' : 'PREMIUM'}" - Check fallback system`);
    
    return createCorsErrorResponse(
      `Image generation orchestration failed: ${error.message}`,
      500
    );
  }
});

// ============= WEBSOCKET ERROR CLASSIFICATION =============
class WebSocketError extends Error {
  constructor(message: string, public type: 'CONNECTION' | 'TIMEOUT' | 'RATE_LIMIT' | 'AUTH' | 'GENERATION' | 'NETWORK', public isRetryable: boolean = false) {
    super(message);
    this.name = 'WebSocketError';
  }
}

// ============= ENHANCED WEBSOCKET MANAGER =============
class RunwareWebSocketManager {
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY = 1000; // 1 second
  private static readonly MAX_DELAY = 8000; // 8 seconds
  private static readonly CONNECTION_TIMEOUT = 30000; // 30 seconds
  
  static async connectWithRetry(
    apiKey: string, 
    positivePrompt: string, 
    negativePrompt: string, 
    seed?: number, 
    sessionId?: string, 
    pageNumber?: number,
    attempt: number = 1,
    requestId?: string // PHASE 5: Cross-function correlation
  ): Promise<any> {
    try {
      return await this.attemptConnection(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, requestId);
    } catch (error) {
      const wsError = error as WebSocketError;
      const logPrefix = requestId ? `[${requestId}]` : '';
      
      // Check if error is retryable and we haven't exceeded max attempts
      if (wsError.isRetryable && attempt < this.MAX_RETRIES) {
        const delay = Math.min(this.BASE_DELAY * Math.pow(2, attempt - 1), this.MAX_DELAY);
        console.warn(`🔄 ${logPrefix} WebSocket attempt ${attempt} failed, retrying in ${delay}ms: ${wsError.message}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connectWithRetry(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, attempt + 1, requestId);
      }
      
      console.error(`❌ ${logPrefix} WebSocket failed after ${attempt} attempts: ${wsError.message}`);
      throw wsError;
    }
  }
  
  private static attemptConnection(
    apiKey: string, 
    positivePrompt: string, 
    negativePrompt: string, 
    seed?: number, 
    sessionId?: string, 
    pageNumber?: number,
    requestId?: string // PHASE 5: Cross-function correlation
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let ws: WebSocket;
      let connectionTimeout: number;
      let isResolved = false;
      
      const cleanup = () => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      };
      
      const safeReject = (error: WebSocketError) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(error);
        }
      };
      
      const safeResolve = (result: any) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(result);
        }
      };
      
      try {
        ws = new WebSocket('wss://ws-api.runware.ai/v1');
        
        // Enhanced timeout with better error handling
        connectionTimeout = setTimeout(() => {
          safeReject(new WebSocketError(
            `WebSocket timeout after ${this.CONNECTION_TIMEOUT}ms for session ${sessionId || 'unknown'}`,
            'TIMEOUT',
            true // Timeout errors are retryable
          ));
        }, this.CONNECTION_TIMEOUT);

        ws.onopen = () => {
          const logPrefix = requestId ? `[${requestId}]` : '';
          console.log(`📡 ${logPrefix} WebSocket connected to Runware (session ${sessionId || 'unknown'})`);
          
          // Send authentication with error handling
          try {
            console.log(`🔐 ${logPrefix} Sending Runware authentication...`);
            ws.send(JSON.stringify([{
              taskType: "authentication",
              apiKey: apiKey
            }]));
          } catch (sendError) {
            console.error(`❌ ${logPrefix} Failed to send authentication:`, sendError.message);
            safeReject(new WebSocketError(
              `Failed to send authentication: ${sendError.message}`,
              'AUTH',
              true
            ));
          }
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            
            // Enhanced error detection with rate limiting
            if (response.error || response.errors) {
              const errorMsg = response.errorMessage || response.errors?.[0]?.message || 'Generation failed';
              const errorCode = response.errorCode || response.errors?.[0]?.code;
              
              console.error('❌ Runware API error:', { errorMsg, errorCode, sessionId });
              
              // Classify error types for better handling
              let errorType: 'RATE_LIMIT' | 'AUTH' | 'GENERATION' = 'GENERATION';
              let isRetryable = false;
              
              if (errorCode === 'RATE_LIMIT_EXCEEDED' || errorMsg.toLowerCase().includes('rate limit')) {
                errorType = 'RATE_LIMIT';
                isRetryable = true;
                console.warn(`🚦 Rate limit detected for session ${sessionId}, will retry with backoff`);
              } else if (errorCode === 'INVALID_API_KEY' || errorMsg.toLowerCase().includes('authentication')) {
                errorType = 'AUTH';
                isRetryable = false;
              } else if (errorMsg.toLowerCase().includes('busy') || errorMsg.toLowerCase().includes('overload')) {
                isRetryable = true;
              }
              
              safeReject(new WebSocketError(errorMsg, errorType, isRetryable));
              return;
            }

            if (response.data) {
              for (const item of response.data) {
                if (item.taskType === "authentication") {
                  const logPrefix = requestId ? `[${requestId}]` : '';
                  console.log(`✅ ${logPrefix} Runware authenticated for session ${sessionId || 'unknown'}`);
                  
                  // PHASE 4: Detailed prompt length and truncation logging
                  console.log(`📏 ${logPrefix} Runware Prompt Length Analysis:`, {
                    originalLength: positivePrompt.length,
                    limit: 2990,
                    withinLimit: positivePrompt.length <= 2990,
                    truncationRequired: positivePrompt.length > 2990,
                    excessChars: positivePrompt.length > 2990 ? positivePrompt.length - 2990 : 0
                  });

                  if (positivePrompt.length > 2990) {
                    console.warn(`🚨 ${logPrefix} EMERGENCY TRUNCATION: Prompt length ${positivePrompt.length} > 2990, truncating for session ${sessionId || 'unknown'} page ${pageNumber || 0}...`);
                    const originalPrompt = positivePrompt;
                    positivePrompt = positivePrompt.substring(0, 2990);
                    console.log(`✂️ ${logPrefix} Prompt truncated:`, {
                      originalLength: originalPrompt.length,
                      truncatedLength: positivePrompt.length,
                      removedChars: originalPrompt.length - positivePrompt.length,
                      truncatedContent: originalPrompt.substring(2990, 2990 + 50) + '...',
                      sessionId: sessionId || 'unknown',
                      pageNumber: pageNumber || 0
                    });
                  }

                  // PHASE 4: Detailed Runware generation request construction
                  const taskUUID = crypto.randomUUID();
                  const imageRequest = [{
                    taskType: "imageInference",
                    taskUUID: taskUUID,
                    positivePrompt: positivePrompt,
                    negativePrompt: negativePrompt,
                    width: 1024,
                    height: 1024,
                    model: "runware:100@1",
                    numberResults: 1,
                    outputFormat: "WEBP",
                    CFGScale: 4.0,
                    scheduler: "FlowMatchEulerDiscreteScheduler",
                    steps: 12,
                    ...(seed && { seed })
                  }];
                  
                  console.log(`🚀 ${logPrefix} Runware Generation Request:`, {
                    taskUUID: taskUUID,
                    positivePromptLength: positivePrompt.length,
                    negativePromptLength: negativePrompt.length,
                    model: "runware:100@1",
                    dimensions: "1024x1024",
                    hasSeed: !!seed,
                    seedValue: seed || 'random',
                    sessionId: sessionId || 'unknown',
                    pageNumber: pageNumber || 0,
                    CFGScale: 4.0,
                    steps: 12
                  });

                  console.log(`🎨 ${logPrefix} Final Runware Prompt Being Sent:`, 
                    positivePrompt.substring(0, 300) + (positivePrompt.length > 300 ? '...' : ''));
                  
                  try {
                    ws.send(JSON.stringify(imageRequest));
                  } catch (sendError) {
                    console.error(`❌ ${logPrefix} Failed to send image request:`, sendError.message);
                    safeReject(new WebSocketError(
                      `Failed to send image request: ${sendError.message}`,
                      'NETWORK',
                      true
                    ));
                  }
                  
                } else if (item.taskType === "imageInference") {
                  const logPrefix = requestId ? `[${requestId}]` : '';
                  console.log(`🎯 ${logPrefix} Runware Generation Complete:`, {
                    taskUUID: item.taskUUID,
                    imageURL: item.imageURL,
                    seed: item.seed,
                    NSFWContent: item.NSFWContent || false,
                    cost: item.cost || 'unknown',
                    sessionId: sessionId || 'unknown',
                    pageNumber: pageNumber || 0,
                    generatedSuccessfully: true
                  });
                  
                  safeResolve({
                    success: true,
                    imageURL: item.imageURL,
                    seed: item.seed,
                    taskUUID: item.taskUUID
                  });
                }
              }
            }
          } catch (parseError) {
            safeReject(new WebSocketError(
              `Failed to parse WebSocket response: ${parseError.message}`,
              'NETWORK',
              true
            ));
          }
        };

        ws.onerror = (error) => {
          console.error(`❌ WebSocket connection error for session ${sessionId || 'unknown'}:`, error);
          safeReject(new WebSocketError(
            `WebSocket connection failed: ${error.toString()}`,
            'CONNECTION',
            true // Connection errors are retryable
          ));
        };

        ws.onclose = (event) => {
          console.log(`📡 WebSocket closed for session ${sessionId || 'unknown'} (code: ${event.code})`);
          
          // Only reject if we haven't already resolved/rejected
          if (!isResolved) {
            const isAbnormalClose = event.code !== 1000 && event.code !== 1001;
            safeReject(new WebSocketError(
              `WebSocket closed unexpectedly (code: ${event.code})`,
              'CONNECTION',
              isAbnormalClose // Abnormal closes are retryable
            ));
          }
        };
        
      } catch (error) {
        safeReject(new WebSocketError(
          `Failed to create WebSocket: ${error.message}`,
          'CONNECTION',
          true
        ));
      }
    });
  }
}

// TIER 1: Premium Runware Generation with Enhanced Robustness
async function generateWithRunwarePremium(
  apiKey: string, 
  positivePrompt: string, 
  negativePrompt: string, 
  seed?: number, 
  sessionId?: string, 
  pageNumber?: number,
  requestId?: string // PHASE 5: Cross-function correlation
) {
  const logPrefix = requestId ? `[${requestId}]` : '';
  console.log(`🚀 ${logPrefix} Starting enhanced WebSocket generation for session ${sessionId || 'unknown'}, page ${pageNumber || 0}`);
  
  // PHASE 4: Detailed Runware generation parameters logging
  console.log(`🚀 ${logPrefix} Runware Generation Parameters:`, {
    apiKeyLength: apiKey?.length || 0,
    positivePromptLength: positivePrompt.length,
    negativePromptLength: negativePrompt.length,
    hasSeed: !!seed,
    seedValue: seed || 'random',
    sessionId: sessionId || 'unknown',
    pageNumber: pageNumber || 0,
    promptPreview: positivePrompt.substring(0, 100) + '...',
    negativePromptContent: negativePrompt
  });
  
  try {
    return await RunwareWebSocketManager.connectWithRetry(
      apiKey, 
      positivePrompt, 
      negativePrompt, 
      seed, 
      sessionId, 
      pageNumber,
      1, // attempt
      requestId // PHASE 5: Pass requestId for correlation
    );
  } catch (error) {
    const wsError = error as WebSocketError;
    console.error(`💥 ${logPrefix} Enhanced WebSocket generation failed for session ${sessionId || 'unknown'}:`, {
      type: wsError.type,
      retryable: wsError.isRetryable,
      message: wsError.message,
      promptLength: positivePrompt.length,
      sessionId: sessionId
    });
    
    // Re-throw with additional context for tier fallback logic
    throw new Error(`WebSocket generation failed (${wsError.type}): ${wsError.message}`);
  }
}

// Helper: Call other tier functions
async function callTierFunction(functionName: string, params: any) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`${functionName} failed: ${response.status}`);
  }

  return await response.json();
}

// NEW MASTER PLAN: Avatar Identity Mapper with Direct Visual Descriptions
function mapAvatarIdentity(userInfo: any) {
  const avatar = userInfo?.avatar || {};
  const { type, skinTone = 'medium' } = avatar;
  const { nativeLanguage = 'en' } = userInfo;

  // Map avatar type and skin tone to standardized identity - PHASE 2: Enhanced mapping logic
  const avatarType = type === 'prefer-not-to-answer' ? 'child' : (type || 'child');
  console.log(`🎯 AVATAR MAPPING - Original type: ${type} → Mapped type: ${avatarType} (PHASE 2 FIX: proper null handling)`);
  const genderText = avatarType === 'boy' ? 'boy' : avatarType === 'girl' ? 'girl' : 'child';
  
  // Standardized skin tone mapping
  const skinToneMap = {
    'pale': 'fair',
    'light': 'light', 
    'medium': 'medium',
    'olive': 'olive',
    'dark': 'dark'
  };
  const standardizedSkinTone = skinToneMap[skinTone] || 'medium';

  // Age extraction and mapping
  let age = userInfo?.age;
  let ageCategory = 'child';
  
  if (!age) {
    // Fallback: map from difficulty level to age
    const difficulty = userInfo?.readingLevel || userInfo?.difficultyLevel || 'easy';
    const ageMap = {
      'beginner': 5,    // Pre-reader
      'easy': 6,        // Beginner 
      'medium': 8,      // Developing
      'hard': 10,       // Independent
      'expert': 12      // Advanced
    };
    age = ageMap[difficulty] || 7;
  }
  
  // Determine age category for descriptions
  if (age <= 6) ageCategory = 'young child';
  else if (age <= 9) ageCategory = 'child';  
  else if (age <= 12) ageCategory = 'older child';
  else ageCategory = 'teen';

  // NEW MASTER PLAN: Direct Visual Descriptions for English Speakers Only
  let visualDescription = '';
  if (nativeLanguage === 'en') {
    const agePrefix = age ? `${age}-year-old ` : '';
    const visualDescriptionMap = {
      'fair': genderText === 'child' ? `${agePrefix}fair skin child with no gender specific characteristics, red hair` : `${agePrefix}fair skin white ${genderText} with red hair`,
      'light': genderText === 'child' ? `${agePrefix}white child with no gender specific characteristics, blonde hair` : `${agePrefix}white ${genderText} with blonde hair`,
      'medium': genderText === 'child' ? `${agePrefix}medium skin white child with no gender specific characteristics, brown hair` : `${agePrefix}medium skin white ${genderText} with brown hair`,
      'olive': genderText === 'child' ? `${agePrefix}olive skin white child with no gender specific characteristics, black hair` : `${agePrefix}olive skin white ${genderText} with black hair`,
      'dark': genderText === 'child' ? `${agePrefix}black child with no gender specific characteristics` : `${agePrefix}black ${genderText}`
    };
    visualDescription = visualDescriptionMap[standardizedSkinTone] || `${agePrefix}${genderText}`;
  }

  // Cultural profile determination (legacy compatibility)
  let culturalProfile;
  if (nativeLanguage === 'en') {
    if (standardizedSkinTone === 'dark') culturalProfile = 'african-american';
    else culturalProfile = 'standard-american';
  } else if (nativeLanguage === 'es') {
    if (standardizedSkinTone === 'dark') culturalProfile = 'afro-hispanic';
    else if (standardizedSkinTone === 'olive' || standardizedSkinTone === 'medium') culturalProfile = 'hispanic-latino';
    else culturalProfile = 'hispanic-multicultural';
  } else if (nativeLanguage === 'fr') culturalProfile = standardizedSkinTone === 'dark' ? 'african-french' : 'french-multicultural';
  else if (nativeLanguage === 'zh') culturalProfile = 'chinese-asian';
  else if (nativeLanguage === 'hi') culturalProfile = 'indian-south-asian';
  else if (nativeLanguage === 'ar') culturalProfile = 'middle-eastern';
  else culturalProfile = 'standard-american'; // PHASE 2: Default to standard-american instead of global-multicultural

  // Hair color mapping (legacy compatibility)
  const hairColorMap = {
    'fair': 'red',
    'light': 'blonde',
    'medium': 'brown', 
    'olive': 'black',
    'dark': 'realistic natural black hair texture with individual strand detail'
  };
  const inferredHairColor = hairColorMap[standardizedSkinTone] || 'brown';

  return {
    type: avatarType,
    skinTone: standardizedSkinTone,
    inferredHairColor,  // FIXED: Renamed from hairColor for clarity
    culturalProfile,
    nativeLanguage,
    name: userInfo?.name || 'child',
    age,               // NEW: Age from userInfo or difficulty mapping
    ageCategory,       // NEW: Age category for descriptions
    visualDescription  // NEW: Direct visual description for Runware optimization
  };
}

// Helper: Generate SVG Placeholder
function generateSVGPlaceholder(pageText: string, userInfo: any) {
  const characterName = userInfo?.name || 'Character';
  const shortScene = pageText.substring(0, 50);
  
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#f0f9ff"/>
      <circle cx="200" cy="150" r="60" fill="#ddd6fe"/>
      <text x="200" y="250" text-anchor="middle" font-family="Arial" font-size="16" fill="#1f2937">
        ${characterName}
      </text>
      <text x="200" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">
        ${shortScene}...
      </text>
      <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">
        Story illustration loading...
      </text>
    </svg>
  `;
  
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  return { url, success: true };
}