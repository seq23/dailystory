import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
// ============= STEP 3: EXPANDED HARDCODED AVATAR DESCRIPTIONS =============
// Comprehensive language-aware visual descriptions matching orchestrator's umbrella system

const AVATAR_FALLBACK_DESCRIPTIONS = {
  // English Speakers (Standard American)
  'boy/light': 'A young American boy with blonde hair and blue eyes',
  'girl/light': 'A young American girl with blonde hair and blue eyes',
  'boy/dark': 'A young African American boy with dark textured hair, brown eyes, brown skin with warm undertones and authentic features',
  'girl/dark': 'A young African American girl with dark long coily textured hair, brown eyes, brown skin with warm undertones and authentic features',
  
  // Spanish Speakers (Hispanic/Latino)
  'boy/medium/es': 'A young Hispanic boy with dark hair and warm brown eyes',
  'girl/medium/es': 'A young Hispanic girl with dark hair and warm brown eyes',
  'boy/dark/es': 'A young Afro-Hispanic boy with curly hair and brown eyes',
  'girl/dark/es': 'A young Afro-Hispanic girl with curly hair and brown eyes',
  
  // Chinese Speakers (Asian)
  'boy/medium/zh': 'A young Chinese boy with straight black hair and dark eyes',
  'girl/medium/zh': 'A young Chinese girl with straight black hair and dark eyes',
  
  // Arabic Speakers (Middle Eastern)
  'boy/medium/ar': 'A young Middle Eastern boy with dark wavy hair and brown eyes',
  'girl/medium/ar': 'A young Middle Eastern girl with long dark hair and brown eyes',
  
  // Default fallback
  'default': 'A young child with brown hair and brown eyes'
};

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
    
    // 🔍 COMPREHENSIVE AVATAR DEBUG LOGGING
    console.log('🔍 [AVATAR DEBUG] ========== FULL REQUEST ANALYSIS ==========');
    console.log('🔍 [AVATAR DEBUG] Complete requestData:', JSON.stringify(requestData, null, 2));
    console.log('🔍 [AVATAR DEBUG] UserInfo extracted:', JSON.stringify(userInfo, null, 2));
    
    if (userInfo && userInfo.avatar) {
      console.log('🔍 [AVATAR DEBUG] Avatar object found:');
      console.log('🔍 [AVATAR DEBUG]   - type:', userInfo.avatar.type);
      console.log('🔍 [AVATAR DEBUG]   - skinTone:', userInfo.avatar.skinTone);
      console.log('🔍 [AVATAR DEBUG]   - raw avatar object:', JSON.stringify(userInfo.avatar, null, 2));
    } else {
      console.log('🔍 [AVATAR DEBUG] ⚠️ No avatar object found in userInfo');
    }
    
    console.log('🔍 [AVATAR DEBUG] Available avatar keys:', Object.keys(AVATAR_FALLBACK_DESCRIPTIONS));
    console.log('🔍 [AVATAR DEBUG] =======================================');
    
    positivePrompt = requestPrompt;

    // Validate required parameters first
    if (!positivePrompt || typeof positivePrompt !== 'string') {
      console.error('Invalid positivePrompt parameter:', positivePrompt);
      return createCorsErrorResponse('Invalid prompt parameter: positivePrompt is required and must be a string', 400);
    }

    console.log(`🖼️ Tier 3: OpenAI Simplified - Page ${pageNumber || 'unknown'}`);
    console.log(`📝 Initial prompt: ${positivePrompt.substring(0, 100)}...`);

    // Simple avatar selection
    const userName = userInfo?.name || 'child';
    const avatarType = userInfo?.avatar?.type || 'boy';
    const skinTone = userInfo?.avatar?.skinTone || 'medium';
    const language = userInfo?.nativeLanguage || 'en';
    
    // 🔍 AVATAR SELECTION DEBUG LOGGING
    console.log('🔍 [AVATAR DEBUG] ========== AVATAR SELECTION PROCESS ==========');
    console.log('🔍 [AVATAR DEBUG] Extracted values:');
    console.log('🔍 [AVATAR DEBUG]   - userName:', userName);
    console.log('🔍 [AVATAR DEBUG]   - avatarType:', avatarType, '(from userInfo?.avatar?.type ||', userInfo?.avatar?.type, ')');
    console.log('🔍 [AVATAR DEBUG]   - skinTone:', skinTone, '(from userInfo?.avatar?.skinTone ||', userInfo?.avatar?.skinTone, ')');
    console.log('🔍 [AVATAR DEBUG]   - language:', language, '(from userInfo?.nativeLanguage ||', userInfo?.nativeLanguage, ')');
    
    // Build avatar key with language awareness
    let avatarKey = `${avatarType}/${skinTone}`;
    console.log('🔍 [AVATAR DEBUG] Initial avatarKey constructed:', avatarKey);
    
    if (language !== 'en') {
      const languageAwareKey = `${avatarType}/${skinTone}/${language}`;
      console.log('🔍 [AVATAR DEBUG] Non-English language detected, checking languageAwareKey:', languageAwareKey);
      console.log('🔍 [AVATAR DEBUG] LanguageAwareKey exists in descriptions?', !!AVATAR_FALLBACK_DESCRIPTIONS[languageAwareKey]);
      if (AVATAR_FALLBACK_DESCRIPTIONS[languageAwareKey]) {
        avatarKey = languageAwareKey;
        console.log('🔍 [AVATAR DEBUG] Using language-aware key:', avatarKey);
      } else {
        console.log('🔍 [AVATAR DEBUG] Language-aware key not found, sticking with:', avatarKey);
      }
    } else {
      console.log('🔍 [AVATAR DEBUG] English language, using standard key:', avatarKey);
    }
    
    const selectedAvatarDescription = AVATAR_FALLBACK_DESCRIPTIONS[avatarKey] || AVATAR_FALLBACK_DESCRIPTIONS['default'];
    
    console.log('🔍 [AVATAR DEBUG] Final Results:');
    console.log('🔍 [AVATAR DEBUG]   - Final avatarKey:', avatarKey);
    console.log('🔍 [AVATAR DEBUG]   - Key exists in descriptions?', !!AVATAR_FALLBACK_DESCRIPTIONS[avatarKey]);
    console.log('🔍 [AVATAR DEBUG]   - selectedAvatarDescription:', selectedAvatarDescription);
    console.log('🔍 [AVATAR DEBUG]   - Used fallback default?', selectedAvatarDescription === AVATAR_FALLBACK_DESCRIPTIONS['default']);
    console.log('🔍 [AVATAR DEBUG] =======================================');
    
    console.log(`🎭 Selected Avatar: ${avatarKey} -> ${selectedAvatarDescription}`);

    // Build clean prompt: avatar + full page text + style
    const finalPrompt = `${selectedAvatarDescription}, ${positivePrompt}, cheerful and happy, beautiful illustration for children's book, professional quality, soft warm lighting, wholesome, safe`;
    
    console.log(`🎨 Final Prompt: ${finalPrompt.substring(0, 200)}...`);

    // Determine size for gpt-image-1 (different sizes than DALL-E 3)
    let size = '1024x1024';
    if (width === 1536 && height === 1024) size = '1536x1024';
    else if (width === 1024 && height === 1536) size = '1024x1536';

    // Use gpt-image-1 quality settings
    const gptImageQuality = quality === 'high' ? 'high' : 'medium';

    // 🔍 FINAL API CALL DEBUG LOGGING
    console.log('🔍 [API DEBUG] ========== OPENAI API CALL DETAILS ==========');
    console.log('🔍 [API DEBUG] About to send to OpenAI API:');
    console.log('🔍 [API DEBUG]   - Full finalPrompt:', finalPrompt);
    console.log('🔍 [API DEBUG]   - Truncated prompt (4000 chars):', finalPrompt.slice(0, 4000));
    console.log('🔍 [API DEBUG]   - Contains "blonde hair"?', finalPrompt.includes('blonde hair'));
    console.log('🔍 [API DEBUG]   - Contains "brown hair"?', finalPrompt.includes('brown hair'));
    console.log('🔍 [API DEBUG]   - Quality:', gptImageQuality);
    console.log('🔍 [API DEBUG]   - Size:', size);
    console.log('🔍 [API DEBUG] =======================================');

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
    
    // Store image prompt in SessionStateManager 
    const globalSessionManager = { storeImagePrompt: () => {} }; // Simplified for now
    
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