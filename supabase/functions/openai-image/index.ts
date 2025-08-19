import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { ConsolidatedEnhancementPipeline } from '../_shared/consolidated-enhancement-pipeline.js';
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

    console.log(`🖼️ OpenAI Image Generation - Page ${pageNumber || 'unknown'}`);
    console.log(`📝 Prompt: ${positivePrompt.substring(0, 100)}...`);
    console.log(`🔍 Full request data:`, { 
      positivePrompt: positivePrompt?.length, 
      width, 
      height, 
      quality, 
      style,
      hasUserInfo: !!userInfo,
      pageNumber,
      seed,
      sessionId
    });

    // Use consolidated enhancement pipeline for consistent processing
    const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
    console.log(`🔧 Mapped difficulty: ${mappedDifficulty} from user reading level: ${userInfo?.readingLevel}`);

    const enhancementResult = await ConsolidatedEnhancementPipeline.processThroughPipeline(
      positivePrompt,
      userInfo,
      sessionId || 'openai-session',
      pageNumber || 1,
      10 // totalPages
    );

    let finalPrompt = enhancementResult.enhancedPrompt;
    const comprehensiveNegativePrompt = enhancementResult.negativePrompt;
    
    console.log(`🎨 Enhanced prompt: ${finalPrompt.substring(0, 100)}...`);
    console.log(`🚫 Enhanced negative prompt: ${comprehensiveNegativePrompt.substring(0, 50)}...`);

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
    
    console.log(`✅ OpenAI Image Generated Successfully - URL: ${imageUrl.substring(0, 50)}...`);
    console.log(`🎯 Assigned seed ${generatedSeed} for consistency tracking`);

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