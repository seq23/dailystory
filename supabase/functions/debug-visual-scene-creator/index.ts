import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🔍 AI Visual Scene Creator Debug Function - Starting diagnostic');
    
    // Test environment configuration
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL'); 
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔧 Environment check:', {
      openAI: openAIKey ? '✅ Configured' : '❌ Missing',
      supabase: supabaseUrl ? '✅ Configured' : '❌ Missing',
      serviceKey: supabaseServiceKey ? '✅ Configured' : '❌ Missing'
    });

    // Test payload with avatar identity
    const testPayload = {
      storyText: "Sequoia was excited to explore the forest. The tall trees and bright flowers made her smile.",
      userInfo: {
        name: "Sequoia",
        avatar: {
          type: "girl",
          skinTone: "dark"
        },
        nativeLanguage: "en"
      },
      sessionId: "debug-session",
      pageNumber: 1,
      totalPages: 5,
      avatarIdentity: {
        type: "girl", 
        skinTone: "dark",
        culturalBackground: "african-american"
      }
    };

    let testResult = null;
    let testError = null;

    try {
      // Import and test AI Story Enhancer directly
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.55.0');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      console.log('🧪 Testing AI Visual Scene Creator with enhanced avatar identity...');
      const { data, error } = await supabase.functions.invoke('ai-visual-scene-creator', {
        body: testPayload
      });

      testResult = data;
      testError = error;
      
      console.log('📊 Test results:', {
        success: !error && !!data,
        hasEnhancedData: !!(data?.enhancedStoryData),
        characterCount: data?.enhancedStoryData?.characters?.length || 0,
        hasEmotions: data?.enhancedStoryData?.characters?.some(c => c.emotions) || false
      });

    } catch (callError) {
      console.error('❌ Function call failed:', callError.message);
      testError = callError.message;
    }

    const result = {
      success: true,
      message: 'AI Visual Scene Creator diagnostic completed',
      environment: {
        openAIConfigured: !!openAIKey,
        supabaseConfigured: !!supabaseUrl,
        serviceKeyConfigured: !!supabaseServiceKey
      },
      testPayload: {
        hasAvatarIdentity: !!testPayload.avatarIdentity,
        culturalBackground: testPayload.avatarIdentity?.culturalBackground,
        avatarType: testPayload.avatarIdentity?.type
      },
      testResult: {
        data: testResult,
        error: testError,
        hasValidResponse: !testError && !!testResult,
        hasEmotionalData: testResult?.enhancedStoryData?.characters?.some(c => c.emotions)
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Diagnostic completed successfully');
    return createCorsResponse(result);

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    return createCorsErrorResponse(`Diagnostic failed: ${error.message}`, 500);
  }
});