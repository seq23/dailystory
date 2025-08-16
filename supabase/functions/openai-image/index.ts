import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

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

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return createCorsErrorResponse('OpenAI API key not configured', 500);
    }

    const requestData: OpenAIImageRequest = await req.json();
    const { 
      positivePrompt, 
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

    console.log(`🖼️ OpenAI Image Generation - Page ${pageNumber || 'unknown'}`);
    console.log(`📝 Prompt: ${positivePrompt.substring(0, 100)}...`);

    // Construct enhanced prompt for children's book illustration
    let enhancedPrompt = positivePrompt;
    
    // Add negative prompt context if provided
    if (negativePrompt) {
      enhancedPrompt += `. Avoid: ${negativePrompt}`;
    }

    // Add children's book style guidance
    enhancedPrompt += ". Style: Children's book illustration, colorful, engaging, safe for kids, warm lighting, detailed but not overwhelming";

    // Determine size based on width/height
    let size = '1024x1024';
    if (width === 1536 && height === 1024) size = '1792x1024';
    else if (width === 1024 && height === 1536) size = '1024x1792';

    // Fix quality parameter mapping
    const dalleQuality = quality === 'high' ? 'hd' : 'standard';

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: dalleQuality,
        style: style
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
      model: 'dall-e-3',
      cost: dalleQuality === 'hd' ? 0.08 : 0.04, // Actual OpenAI pricing
      pageNumber: pageNumber,
      seed: generatedSeed,
      quality: dalleQuality,
      size: size
    });

  } catch (error) {
    console.error('Error in openai-image function:', error);
    return createCorsErrorResponse(`OpenAI error: ${error.message}`);
  }
});