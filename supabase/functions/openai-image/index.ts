import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { MultiStageEnhancementPipeline } from '../_shared/MultiStageEnhancementPipeline.js';
import { DifficultyLevelMapper } from '../_shared/DifficultyLevelMapper.js';
// ============= STEP 3: EXPANDED HARDCODED AVATAR DESCRIPTIONS =============
// Comprehensive language-aware visual descriptions matching orchestrator's umbrella system

const AVATAR_FALLBACK_DESCRIPTIONS = {
  // ENGLISH SPEAKERS
  'boy/light': 'A young American boy with blonde hair, bright blue eyes, fair skin, wearing casual comfortable clothes',
  'boy/medium': 'A young American boy with brown hair, warm brown eyes, medium skin tone, wearing everyday casual attire',
  'boy/olive': 'A young American boy with dark brown hair, hazel eyes, olive complexion, wearing modern casual wear',
  'boy/dark': 'A young African American boy with textured dark hair, warm brown eyes, rich brown skin, wearing stylish casual clothing',
  'girl/light': 'A young American girl with blonde hair, sparkling blue eyes, fair skin, wearing colorful casual clothes',
  'girl/medium': 'A young American girl with brown hair, bright brown eyes, medium skin tone, wearing comfortable everyday attire',
  'girl/olive': 'A young American girl with dark brown hair, warm hazel eyes, olive complexion, wearing trendy casual wear',
  'girl/dark': 'A young African American girl with beautiful natural hair, expressive brown eyes, rich brown skin, wearing vibrant casual clothing',
  'child/light': 'A young child with light hair, bright eyes, fair skin, wearing neutral comfortable clothing',
  'child/medium': 'A young child with brown hair, warm eyes, medium skin tone, wearing casual everyday clothes',
  'child/olive': 'A young child with dark hair, gentle eyes, olive complexion, wearing simple casual attire',
  'child/dark': 'A young child with textured dark hair, bright eyes, rich brown skin, wearing comfortable casual clothing',

  // SPANISH SPEAKERS (Hispanic/Latino Features)
  'boy/light/es': 'A young Hispanic boy with dark brown hair, warm brown eyes, light olive skin, wearing colorful casual clothes',
  'boy/medium/es': 'A young Latino boy with black wavy hair, deep brown eyes, golden tan complexion, wearing vibrant casual attire',
  'boy/olive/es': 'A young Hispanic boy with straight black hair, amber brown eyes, warm olive skin, wearing festive casual wear',
  'boy/dark/es': 'A young Afro-Hispanic boy with textured curly hair, rich brown eyes, warm brown complexion, wearing stylish cultural attire',
  'girl/light/es': 'A young Hispanic girl with long dark hair, expressive brown eyes, light olive skin, wearing bright colorful clothes',
  'girl/medium/es': 'A young Latina girl with wavy black hair, warm hazel eyes, golden bronze complexion, wearing traditional-inspired modern wear',
  'girl/olive/es': 'A young Hispanic girl with straight dark hair, beautiful brown eyes, warm olive skin, wearing vibrant casual attire',
  'girl/dark/es': 'A young Afro-Hispanic girl with curly natural hair, bright brown eyes, rich caramel complexion, wearing culturally-inspired clothing',
  'child/light/es': 'A young Hispanic child with dark hair, warm eyes, light olive skin, wearing colorful comfortable clothing',
  'child/medium/es': 'A young Latino child with black hair, gentle brown eyes, golden tan skin, wearing casual vibrant attire',
  'child/olive/es': 'A young Hispanic child with straight dark hair, kind eyes, warm olive complexion, wearing festive casual wear',
  'child/dark/es': 'A young child with textured hair, bright eyes, warm brown skin, wearing comfortable cultural attire',

  // CHINESE SPEAKERS (Asian Features)
  'boy/light/zh': 'A young Chinese boy with straight black hair, dark brown eyes, light golden complexion, wearing neat modern clothes',
  'boy/medium/zh': 'A young Asian boy with layered black hair, intelligent dark eyes, warm golden skin, wearing contemporary casual attire',
  'boy/olive/zh': 'A young Chinese boy with classic straight hair, gentle brown eyes, golden beige complexion, wearing clean casual wear',
  'boy/dark/zh': 'A young Asian boy with neat black hair, expressive dark eyes, warm golden brown skin, wearing modern comfortable clothes',
  'girl/light/zh': 'A young Chinese girl with straight black hair in neat style, bright dark eyes, light golden skin, wearing elegant casual attire',
  'girl/medium/zh': 'A young Asian girl with bob-cut black hair, sparkling brown eyes, warm golden complexion, wearing traditional-inspired modern wear',
  'girl/olive/zh': 'A young Chinese girl with long straight hair, gentle dark eyes, golden beige skin, wearing contemporary casual clothes',
  'girl/dark/zh': 'A young Asian girl with beautiful black hair, expressive eyes, warm golden brown complexion, wearing stylish modern attire',
  'child/light/zh': 'A young Chinese child with neat black hair, kind dark eyes, light golden skin, wearing simple modern clothing',
  'child/medium/zh': 'A young Asian child with straight dark hair, gentle eyes, warm golden complexion, wearing comfortable casual wear',
  'child/olive/zh': 'A young Chinese child with classic black hair, bright eyes, golden beige skin, wearing neat casual attire',
  'child/dark/zh': 'A young child with straight dark hair, warm eyes, golden brown complexion, wearing modern comfortable clothes',

  // ARABIC SPEAKERS (Middle Eastern Features)
  'boy/light/ar': 'A young Middle Eastern boy with dark wavy hair, warm brown eyes, light olive complexion, wearing traditional-inspired modern clothes',
  'boy/medium/ar': 'A young Arab boy with thick black hair, striking dark eyes, golden olive skin, wearing elegant casual attire',
  'boy/olive/ar': 'A young Middle Eastern boy with curly dark hair, expressive hazel eyes, warm olive complexion, wearing cultural modern wear',
  'boy/dark/ar': 'A young Arab boy with wavy black hair, deep brown eyes, rich bronze skin, wearing traditional-modern fusion clothing',
  'girl/light/ar': 'A young Middle Eastern girl with long dark hair, beautiful brown eyes, light olive skin, wearing modest fashionable attire',
  'girl/medium/ar': 'A young Arab girl with thick wavy hair, striking dark eyes, golden olive complexion, wearing elegant cultural wear',
  'girl/olive/ar': 'A young Middle Eastern girl with curly black hair, warm hazel eyes, rich olive skin, wearing traditional-inspired modern clothes',
  'girl/dark/ar': 'A young Arab girl with beautiful dark hair, expressive brown eyes, warm bronze complexion, wearing cultural elegant attire',
  'child/light/ar': 'A young Middle Eastern child with dark hair, gentle eyes, light olive skin, wearing comfortable cultural clothing',
  'child/medium/ar': 'A young Arab child with wavy black hair, kind eyes, golden olive complexion, wearing modest casual wear',
  'child/olive/ar': 'A young Middle Eastern child with thick dark hair, warm eyes, rich olive skin, wearing traditional-modern attire',
  'child/dark/ar': 'A young child with curly dark hair, bright eyes, warm bronze complexion, wearing comfortable cultural clothes',

  // DEFAULT FALLBACKS
  'default': 'A young child with medium skin, brown hair, and brown eyes, with no gender specific characteristics',
  'boy/unknown': 'A young boy with brown hair, warm eyes, medium complexion, wearing casual comfortable clothing',
  'girl/unknown': 'A young girl with brown hair, bright eyes, medium skin tone, wearing colorful casual attire',
  'child/unknown': 'A young child with brown hair, gentle eyes, medium complexion, wearing neutral comfortable clothes'
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
    
    positivePrompt = requestPrompt;

    // Validate required parameters first
    if (!positivePrompt || typeof positivePrompt !== 'string') {
      console.error('Invalid positivePrompt parameter:', positivePrompt);
      return createCorsErrorResponse('Invalid prompt parameter: positivePrompt is required and must be a string', 400);
    }

    console.log(`🖼️ Tier 3: OpenAI with Full AI Enhancement - Page ${pageNumber || 'unknown'}`);
    console.log(`📝 Initial prompt: ${positivePrompt.substring(0, 100)}...`);

    // ============= STEP 3: ENHANCED HARDCODED AVATAR DESCRIPTION =============
    // Language-aware avatar descriptions matching orchestrator's comprehensive coverage
    
    const userName = userInfo?.name || 'child';
    const avatarType = userInfo?.avatar?.type || 'child';
    const skinTone = userInfo?.avatar?.skinTone || 'medium';
    const language = userInfo?.nativeLanguage || 'en';
    
    // Build comprehensive fallback key with language awareness
    let fallbackKey = `${avatarType}/${skinTone}`;
    if (language !== 'en') {
      const languageAwareKey = `${avatarType}/${skinTone}/${language}`;
      if (AVATAR_FALLBACK_DESCRIPTIONS[languageAwareKey]) {
        fallbackKey = languageAwareKey;
      }
    }
    
    const hardcodedAvatarDescription = (AVATAR_FALLBACK_DESCRIPTIONS[fallbackKey] || AVATAR_FALLBACK_DESCRIPTIONS["default"]).replace('{name}', userName);
    
    console.log(`🎭 TIER 3 ENHANCED AVATAR: ${fallbackKey} (${language}+${skinTone}) -> ${hardcodedAvatarDescription.substring(0, 80)}...`);

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