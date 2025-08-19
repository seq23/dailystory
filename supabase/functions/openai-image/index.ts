import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { MulticulturalVisualService } from '../_shared/cultural-visual-service.js';

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

    // Enhanced prompt with avatar support and cultural context
    let enhancedPrompt = positivePrompt;
    
    // Add culturally appropriate character description if userInfo provided
    if (userInfo && userInfo.avatar) {
      const characterDesc = MulticulturalVisualService.generateCulturalCharacterDescription(userInfo);
      enhancedPrompt = enhancedPrompt.replace(
        new RegExp(`\\b${userInfo.name}\\b`, 'gi'), 
        `${userInfo.name} (${characterDesc})`
      );
      
      // If no character name replacement occurred, add character description
      if (!enhancedPrompt.includes(characterDesc)) {
        enhancedPrompt += ` featuring ${characterDesc}`;
      }
      
      console.log(`🎭 OpenAI character description: ${characterDesc}`);
    }
    
    // Add negative prompt context if provided
    if (negativePrompt) {
      enhancedPrompt += `. Avoid: ${negativePrompt}`;
    }

    // Import and apply centralized style framework
    const { getStyleFramework } = await import('../_shared/styleFrameworks.js');
    const userDifficulty = userInfo?.readingLevel || 'medium';
    const framework = getStyleFramework(userDifficulty);
    
    // Enhanced children's book style with framework consistency
    enhancedPrompt += `. Style: ${framework.artStyle}, ${framework.quality}, ${framework.brandSuffix}`;

    // AI-enhanced scene analysis with fallback
    const extractEnhancedScene = async (text: string) => {
      try {
        // Try to get AI-enhanced scene description
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-story-elements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            storyText: text,
            pageNumber: pageNumber || 1,
            totalPages: 10,
            difficultyLevel: userInfo?.readingLevel || 'medium',
            sessionId: sessionId || 'openai-session',
            userInfo: userInfo
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.enhancedDescription) {
            console.log(`🤖 AI-Enhanced Scene Description: ${data.enhancedDescription.substring(0, 100)}...`);
            return {
              character: userInfo?.name || 'child',
              setting: 'contextual scene',
              primaryScene: data.enhancedDescription,
              isAIEnhanced: true
            };
          }
        }
      } catch (error) {
        console.log(`⚠️ AI scene enhancement failed, using simple analysis: ${error.message}`);
      }

      // Fallback to simple scene detection
      const lowerText = text.toLowerCase();
      
      let character = 'child';
      if (userInfo?.name) character = userInfo.name;
      else if (lowerText.includes('girl') || lowerText.includes('she')) character = 'girl';
      else if (lowerText.includes('boy') || lowerText.includes('he')) character = 'boy';
      
      let setting = 'outdoor scene';
      if (lowerText.includes('house') || lowerText.includes('home')) setting = 'indoor scene';
      else if (lowerText.includes('forest') || lowerText.includes('tree')) setting = 'forest scene';
      else if (lowerText.includes('park') || lowerText.includes('playground')) setting = 'park scene';
      
      return { character, setting, primaryScene: text, isAIEnhanced: false };
    };
    
    const pageContent = await extractEnhancedScene(positivePrompt);
    
    // Add emotional and visual context
    const emotionalKeywords = ['happy', 'sad', 'excited', 'scared', 'curious', 'surprised'];
    const detectedEmotion = emotionalKeywords.find(emotion => 
      positivePrompt.toLowerCase().includes(emotion)) || 'neutral';
    
    // Build comprehensive scene description with avatar details
    let avatarDesc = '';
    if (userInfo?.avatar) {
      const skinTone = userInfo.avatar.skinTone || 'medium';
      const skinMap = {
        'pale': 'fair skin', 'light': 'light skin', 'medium': 'medium skin',
        'olive': 'olive skin', 'dark': 'dark skin'
      };
      const hairMap = {
        'pale': 'blonde hair', 'light': 'brown hair', 'medium': 'brown hair',
        'olive': 'dark brown hair', 'dark': 'black hair'
      };
      avatarDesc = `, ${skinMap[skinTone] || 'medium skin'}, ${hairMap[skinTone] || 'brown hair'}`;
    }
    
    const sceneAnalysis = `${pageContent.character}${avatarDesc} in ${pageContent.setting}. Scene: ${pageContent.primaryScene}. Mood: ${detectedEmotion}`;
    
    // Create final enhanced prompt combining everything
    const aiEnhancementNote = pageContent.isAIEnhanced ? 'AI-enhanced visual elements. ' : '';
    const finalPrompt = `${sceneAnalysis}. ${enhancedPrompt}. ${aiEnhancementNote}Ultra high resolution children's book illustration`;

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