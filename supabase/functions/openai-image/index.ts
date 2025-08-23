import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { MultiStageEnhancementPipeline } from '../_shared/MultiStageEnhancementPipeline.js';
import { DifficultyLevelMapper } from '../_shared/DifficultyLevelMapper.js';

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return createCorsErrorResponse('OpenAI API key not configured', 500);
    }

    const requestData: OpenAIImageRequest = await req.json();
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
          pageNumber: pageNumber || 1
        })
      });
      
      if (aiEnhancementResult.ok) {
        const aiData = await aiEnhancementResult.json();
        aiEnhancedStoryData = aiData.enhancedStoryData || {};
        console.log(`🔍 TIER 3 DEBUG - Session: ${sessionId}, Page: ${pageNumber}`);  
        console.log(`🤖 AI Enhancement Output (FULL):`, JSON.stringify(aiEnhancedStoryData, null, 2));
      } else {
        console.warn('⚠️ AI story enhancer failed, proceeding without AI enhancement');
      }
    } catch (error) {
      console.warn('⚠️ AI story enhancer error:', error.message);
    }

    // STEP 2: Use Premium Pipeline with AI Enhancement
    const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
    console.log(`🔧 Mapped difficulty: ${mappedDifficulty} for Tier 3 premium processing`);

    const enhancementResult = await MultiStageEnhancementPipeline.processTier1HighQuality(
      positivePrompt,
      userInfo,
      sessionId || 'openai-session',
      sessionId || 'openai-session',
      pageNumber || 1,
      undefined, // totalPages - let stories be ongoing
      aiEnhancedStoryData // Add AI story data
    );

    let finalPrompt = enhancementResult.enhancedPrompt;
    
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
        model: 'gpt-image-1',
        prompt: finalPrompt,
        size: size,
        quality: gptImageQuality,
        output_format: 'webp',
        background: 'opaque',
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
    
    console.log(`✅ TIER 3 SUCCESS - Session: ${sessionId}, Page: ${pageNumber}`);
    console.log(`🖼️ Image URL: ${imageUrl}`);
    console.log(`🎯 Final Prompt Used: ${finalPrompt}`);
    console.log(`💰 Cost: ${gptImageQuality === 'high' ? 0.12 : 0.08}, Quality: ${gptImageQuality}`);
    console.log(`🎲 Assigned seed ${generatedSeed} for consistency tracking`);

    return createCorsResponse({
      success: true,
      imageURL: imageUrl,
      provider: 'openai',
      model: 'gpt-image-1',
      cost: gptImageQuality === 'high' ? 0.12 : 0.08, // gpt-image-1 pricing
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