import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// Avatar skin tone and cultural context integration
interface UserInfo {
  name: string;
  nativeLanguage: string;
  avatar: {
    type: 'boy' | 'girl';
    skinTone: 'pale' | 'light' | 'medium' | 'olive' | 'dark';
  };
}

// Enhanced cultural character description generator
class MulticulturalVisualService {
  private static getCulturallyAppropriateDescription(userInfo: UserInfo): string {
    const { avatar, nativeLanguage } = userInfo;
    
    // Map avatar skin tone to culturally appropriate descriptions
    const skinToneDescriptions = {
      'pale': 'pale skin with rosy cheeks',
      'light': 'light skin with warm undertones', 
      'medium': 'medium skin with golden undertones',
      'olive': 'olive skin with warm bronze undertones',
      'dark': this.getDarkSkinCulturalDescription(nativeLanguage)
    };

    // Get culturally appropriate hair styles
    const hairStyle = this.getCulturallyAppropriateHairStyle(avatar.skinTone, nativeLanguage);
    
    const genderTerm = avatar.type === 'boy' ? 'boy' : 'girl';
    const skinDescription = skinToneDescriptions[avatar.skinTone];
    
    return `${genderTerm} with ${skinDescription}, ${hairStyle}`;
  }

  private static getDarkSkinCulturalDescription(nativeLanguage: string): string {
    const culturalDescriptions = {
      'es': 'rich Afro-Latina brown skin',
      'ar': 'rich Middle Eastern brown skin', 
      'hi': 'rich South Asian brown skin',
      'zh': 'warm East Asian skin',
      'pt': 'rich Afro-Brazilian brown skin',
      'fr': 'rich Afro-French brown skin',
      'en': 'rich African American brown skin'
    };
    
    return culturalDescriptions[nativeLanguage] || 'rich brown skin';
  }

  private static getCulturallyAppropriateHairStyle(skinTone: string, nativeLanguage: string): string {
    const hairMappings = {
      'pale': ['flowing red hair', 'straight blonde hair', 'wavy auburn hair'],
      'light': ['straight blonde hair', 'wavy light brown hair', 'flowing golden hair'],
      'medium': ['wavy brown hair', 'straight dark brown hair', 'curly chestnut hair'],
      'olive': ['wavy dark hair', 'straight dark brown hair', 'curly dark hair'],
      'dark': ['natural curly hair', 'beautiful braided hair', 'short coily hair', 'afro textured hair']
    };

    const styles = hairMappings[skinTone] || hairMappings['medium'];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  static generateCharacterDescription(userInfo: UserInfo): string {
    return this.getCulturallyAppropriateDescription(userInfo);
  }
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

    // Validate required parameters first
    if (!positivePrompt || typeof positivePrompt !== 'string') {
      console.error('Invalid positivePrompt parameter:', positivePrompt);
      return createCorsErrorResponse('Invalid prompt parameter: positivePrompt is required and must be a string', 400);
    }

    console.log(`🖼️ OpenAI Image Generation - Page ${pageNumber || 'unknown'}`);
    console.log(`📝 Prompt: ${positivePrompt.substring(0, 100)}...`);

    // Enhanced prompt with avatar support and cultural context
    let enhancedPrompt = positivePrompt;
    
    // Add culturally appropriate character description if userInfo provided
    if (userInfo && userInfo.avatar) {
      const characterDesc = MulticulturalVisualService.generateCharacterDescription(userInfo);
      enhancedPrompt = enhancedPrompt.replace(
        new RegExp(`\\b${userInfo.name}\\b`, 'gi'), 
        `${userInfo.name} (${characterDesc})`
      );
      
      // If no character name replacement occurred, add character description
      if (!enhancedPrompt.includes(characterDesc)) {
        enhancedPrompt += ` featuring ${characterDesc}`;
      }
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