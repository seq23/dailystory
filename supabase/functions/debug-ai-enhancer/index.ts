import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🔧 AI Story Enhancer Diagnostic Started');
    
    // Phase 1: Check Configuration & Secrets
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('✅ Environment Variables Check:');
    console.log('- OPENAI_API_KEY:', openAIKey ? 'Found (' + openAIKey.substring(0, 10) + '...)' : 'NOT FOUND');
    console.log('- SUPABASE_URL:', supabaseUrl ? 'Found' : 'NOT FOUND');
    console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found' : 'NOT FOUND');
    
    // Phase 2: Test Shared Module Imports
    console.log('🔍 Testing Shared Module Imports:');
    
    try {
      const { validateAndEnhanceContent } = await import('../_shared/SimpleContentValidator.js');
      console.log('✅ SimpleContentValidator.js - OK');
    } catch (error) {
      console.error('❌ SimpleContentValidator.js - FAILED:', error.message);
    }
    
    try {
      const { MultiStageEnhancementPipeline } = await import('../_shared/MultiStageEnhancementPipeline.js');
      console.log('✅ MultiStageEnhancementPipeline.js - OK');
    } catch (error) {
      console.error('❌ MultiStageEnhancementPipeline.js - FAILED:', error.message);
    }
    
    try {
      const { performanceTracker } = await import('../_shared/errorHandling.ts');
      console.log('✅ errorHandling.ts - OK');
    } catch (error) {
      console.error('❌ errorHandling.ts - FAILED:', error.message);
    }
    
    // Phase 3: Test OpenAI Connection
    if (openAIKey) {
      console.log('🌐 Testing OpenAI API Connection:');
      try {
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
          },
        });
        
        if (testResponse.ok) {
          console.log('✅ OpenAI API - Connection successful');
        } else {
          console.error('❌ OpenAI API - Response error:', testResponse.status);
        }
      } catch (error) {
        console.error('❌ OpenAI API - Connection failed:', error.message);
      }
    }
    
    // Phase 4: Function Health Check
    console.log('💡 Function Health Status: ALL SYSTEMS CHECKED');
    
    return createCorsResponse({
      success: true,
      message: 'AI Story Enhancer diagnostic completed',
      environment: {
        openAIConfigured: !!openAIKey,
        supabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Diagnostic function error:', error);
    return createCorsErrorResponse(`Diagnostic error: ${error.message}`);
  }
});