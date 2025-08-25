import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { MultiStageEnhancementPipeline } from '../_shared/MultiStageEnhancementPipeline.js';
import { DifficultyLevelMapper } from '../_shared/DifficultyLevelMapper.js';
import { AVATAR_FALLBACK_DESCRIPTIONS } from '../_shared/avatarConsistency.js';

// Avatar skin tone and cultural context integration
interface UserInfo {
  name: string;
  nativeLanguage: string;
  avatar: {
    type: 'boy' | 'girl' | 'neutral';
    skinTone: 'pale' | 'light' | 'medium' | 'olive' | 'dark';
  };
}

interface OpenAIImageRequest {
  positivePrompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  quality?: 'high' | 'medium' | 'low' | 'auto';
  style?: 'vivid' | 'natural';
  userInfo?: any;
  pageNumber?: number;
  seed?: number; // For consistency tracking
  sessionId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  let positivePrompt = '';
  try {
    const requestData: OpenAIImageRequest = await req.json();
    const { diagnostic, test } = requestData as any;

    // DIAGNOSTIC MODE - Handle diagnostic requests
    if (diagnostic || test) {
      console.log('🔍 OpenAI Image DIAGNOSTIC MODE:', diagnostic || 'basic_test');
      
      if (diagnostic === 'tier_health_check') {
        const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openAIApiKey) {
          return createCorsErrorResponse('OPENAI_API_KEY not configured', 500, {
            diagnostic: true,
            type: 'api_key_missing'
          });
        }
        
        return createCorsResponse({
          success: true,
          diagnostic: true,
          message: 'OpenAI Image (Tier 3) health check passed',
          apiKeyConfigured: true,
          timestamp: new Date().toISOString()
        });
      }
      
      // Basic test mode
      return createCorsResponse({
        success: true,
        diagnostic: true,
        message: 'OpenAI Image diagnostic test passed',
        timestamp: new Date().toISOString()
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return createCorsErrorResponse('OpenAI API key not configured', 500);
    }
    const { 
      positivePrompt: requestPrompt, 
      negativePrompt, 
      width = 1024, 
      height = 1024,
      quality = 'high',
      style = 'vivid',
      userInfo,
      pageNumber,
      seed,
      sessionId
    } = requestData;
    
    positivePrompt = requestPrompt;

    // Validate required parameters first
    if (!positivePrompt || typeof positivePrompt !== 'string') {
      console.error('Invalid positivePrompt parameter:', positivePrompt);
      return createCorsErrorResponse('Invalid prompt parameter: positivePrompt is required and must be a string', 400);
    }

    console.log(`🖼️ Tier 3: OpenAI with Full AI Enhancement - Page ${pageNumber || 'unknown'}`);
    console.log(`📝 Initial prompt: ${positivePrompt.substring(0, 100)}...`);

    // PHASE 1: Build Hardcoded Avatar Description (ALWAYS USED)
    const userName = userInfo?.name || 'child';
    const avatarType = userInfo?.avatar?.type || 'child';
    const skinTone = userInfo?.avatar?.skinTone || 'medium';
    const fallbackKey = `${avatarType}/${skinTone}`;
    const hardcodedAvatarDescription = (AVATAR_FALLBACK_DESCRIPTIONS[fallbackKey] || AVATAR_FALLBACK_DESCRIPTIONS["default"]).replace('{name}', userName);
    
    console.log(`🎭 TIER 3 HARDCODED AVATAR: ${fallbackKey} -> ${hardcodedAvatarDescription}`);

    // STEP 1: AI Story Enhancement Integration
    let aiEnhancedStoryData = {};
    try {
      const aiEnhancementResult = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-story-enhancer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyText: positivePrompt,
          userInfo,
          sessionId: sessionId || 'openai-session',
          pageNumber: pageNumber || 1,
          avatarIdentity: {
            type: avatarType,
            skinTone: skinTone,
            name: userName,
            visualDescription: hardcodedAvatarDescription
          }
        })
      });
      
      if (aiEnhancementResult.ok) {
        const aiData = await aiEnhancementResult.json();
        aiEnhancedStoryData = aiData.enhancedStoryData || {};
        console.log(`🔍 TIER 3 DEBUG - Session: ${sessionId}, Page: ${pageNumber}`);  
        console.log(`🤖 AI Enhancement Output (FULL):`, JSON.stringify(aiEnhancedStoryData, null, 2));
      } else {
        console.warn('⚠️ AI story enhancer failed, will use Tier 2.5 template fallback');
        aiEnhancedStoryData = null; // Mark as failed for fallback trigger
      }
    } catch (error) {
      console.warn('⚠️ AI story enhancer error:', error.message);
      aiEnhancedStoryData = null; // Mark as failed for fallback trigger
    }

    // STEP 2: Build Final Prompt with Hardcoded Avatar + Scene
    const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
    console.log(`🔧 Mapped difficulty: ${mappedDifficulty} for Tier 3 premium processing`);

    let finalPrompt = '';
    let enhancementResult = {};

    // PHASE 2 & 3: AI Enhancement or Tier 2.5 Fallback
    if (aiEnhancedStoryData && aiEnhancedStoryData.primaryScene) {
      // PHASE 2: Use AI Enhancement + Hardcoded Avatar
      console.log(`✅ TIER 3: Using AI Enhancement with hardcoded avatar`);
      
      enhancementResult = await MultiStageEnhancementPipeline.processTier1HighQuality(
        positivePrompt,
        userInfo,
        sessionId || 'openai-session',
        sessionId || 'openai-session',
        pageNumber || 1,
        undefined, // totalPages - let stories be ongoing
        aiEnhancedStoryData // Add AI story data
      );

      // Prepend hardcoded avatar to AI-enhanced scene
      finalPrompt = `${hardcodedAvatarDescription}, ${enhancementResult.enhancedPrompt}`;
      
    } else {
      // PHASE 3: Native Tier 3 Fallback (Independent)
      console.log(`🛡️ TIER 3: AI Enhancement failed, using native Tier 3 fallback`);
      
      // Extract simple scene description directly from prompt
      const simpleSceneDescription = extractSimpleScene(positivePrompt, mappedDifficulty);
      
      // Build prompt directly: avatar + scene + style
      finalPrompt = `${hardcodedAvatarDescription}, ${simpleSceneDescription}`;
      
      // Create minimal enhancement result for compatibility
      enhancementResult = {
        enhancedPrompt: finalPrompt,
        culturalProfile: {},
        framework: {}
      };
    }
    
    // Use unified negative prompt system for comprehensive consistency
    const comprehensiveNegativePrompt = MultiStageEnhancementPipeline.buildUnifiedNegativePrompt(
      userInfo,
      enhancementResult.culturalProfile || {},
      enhancementResult.framework || {},
      pageNumber || 1
    );
    
    console.log(`🎨 AI-Enhanced Prompt (FULL): ${finalPrompt}`);
    console.log(`🚫 Comprehensive Negative Prompt (FULL): ${comprehensiveNegativePrompt}`);
    console.log(`✅ Tier 3 using premium pipeline with style framework protection`);

    // Determine size for gpt-image-1 (different sizes than DALL-E 3)
    let size = '1024x1024';
    if (width === 1536 && height === 1024) size = '1536x1024';
    else if (width === 1024 && height === 1536) size = '1024x1536';

    // Use gpt-image-1 quality settings
    const gptImageQuality = quality === 'high' ? 'high' : 'medium';

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: finalPrompt.slice(0, 4000), // dall-e-3 has a 4000 char limit
        size: size === '1536x1024' ? '1792x1024' : (size === '1024x1536' ? '1024x1792' : '1024x1024'),
        quality: gptImageQuality === 'high' ? 'hd' : 'standard',
        style: 'vivid',
        n: 1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const imageUrl = data.data[0].url;
    
    // Generate a consistent seed for OpenAI (for tracking purposes)
    const generatedSeed = seed || Math.floor(Math.random() * 2147483647);
    
    // PHASE 1: Store image prompt in SessionStateManager 
    const { globalSessionManager } = await import('../_shared/SessionStateManager.js');
    globalSessionManager.storeImagePrompt(sessionId || 'openai-session', {
      tier: '3',
      promptText: finalPrompt,
      negativePrompt: comprehensiveNegativePrompt,
      originalPageText: positivePrompt,
      enhancedPrompt: finalPrompt,
      pageNumber: pageNumber || 1,
      success: true,
      imageURL: imageUrl,
      seed: generatedSeed,
      provider: 'openai',
      model: 'dall-e-3',
      cost: gptImageQuality === 'high' ? 0.08 : 0.04, // dall-e-3 pricing
      generationTime: 0, // OpenAI doesn't provide this
      culturalProfile: enhancementResult.culturalProfile || {},
      styleFramework: enhancementResult.framework || {},
      metadata: {
        quality: gptImageQuality,
        size: size,
        aiEnhanced: !!aiEnhancedStoryData,
        premiumPipeline: true
      }
    });
    
    console.log(`✅ TIER 3 SUCCESS - Session: ${sessionId}, Page: ${pageNumber}`);
    console.log(`🖼️ Image URL: ${imageUrl}`);
    console.log(`🎯 Final Prompt Used: ${finalPrompt}`);
    console.log(`💰 Cost: ${gptImageQuality === 'high' ? 0.08 : 0.04}, Quality: ${gptImageQuality}`);
    console.log(`🎲 Assigned seed ${generatedSeed} for consistency tracking`);

    return createCorsResponse({
      success: true,
      imageURL: imageUrl,
      provider: 'openai',
      model: 'dall-e-3',
      cost: gptImageQuality === 'high' ? 0.08 : 0.04, // dall-e-3 pricing
      pageNumber: pageNumber,
      seed: generatedSeed,
      quality: gptImageQuality,
      size: size
    });

  } catch (error) {
    console.error('❌ OpenAI generation error:', error);
    console.error('❌ Error details:', error instanceof Error ? error.stack : 'No details available');
    console.error('❌ Request was for prompt:', positivePrompt?.substring(0, 50));
    return createCorsErrorResponse(`OpenAI error: ${error.message}`, 500);
  }
});

// NATIVE TIER 3 FALLBACK SYSTEM (Independent from Tier 2.5)
function extractSimpleScene(positivePrompt: string, difficulty: string): string {
  if (!positivePrompt) return 'in a beautiful outdoor scene. cheerful and happy. 3D Pixar animation style, professional quality, child-friendly';
  
  // Remove existing style suffixes to get clean scene
  let cleanScene = positivePrompt
    .replace(/3D Pixar animation style.*$/i, '')
    .replace(/professional.*quality.*$/i, '')
    .replace(/child-friendly.*$/i, '')
    .replace(/,\s*$/, '')
    .trim();
  
  // Extract the core action/scene from the clean text
  const sentences = cleanScene.split(/[.!?]+/).filter(s => s.trim());
  const mainScene = sentences[0] || cleanScene;
  
  // Add appropriate setting context
  let setting = 'outdoor';
  const lowerScene = mainScene.toLowerCase();
  if (lowerScene.includes('bed') || lowerScene.includes('room') || lowerScene.includes('house') || lowerScene.includes('inside')) {
    setting = 'indoor';
  }
  
  // Build DALL-E 3 compatible prompt with scene + style
  return `${mainScene} in ${setting}. cheerful and happy. 3D Pixar animation style, professional quality, child-friendly`;
}