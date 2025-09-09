import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'
import { 
  createDynamicCorsOptionsResponse, 
  createDynamicCorsResponse, 
  createDynamicCorsErrorResponse 
} from "../_shared/corsAdvanced.ts";
import { monitorRequest } from "../_shared/headerMonitor.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  console.log(`🧠 Debug: AI Prompts Request: ${req.method} ${req.url}`);
  
  // Monitor request for header analytics
  monitorRequest(req, 'debug-ai-prompts');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createDynamicCorsOptionsResponse(req);
  }
  
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    if (!sessionId) {
      return createDynamicCorsErrorResponse('Missing sessionId parameter', req, 400);
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Query AI prompt debug log
    const { data: aiPrompts, error } = await supabase
      .from('ai_prompt_debug_log')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('❌ Error fetching AI prompts:', error);
      return createDynamicCorsErrorResponse(`Database error: ${error.message}`, req, 500);
    }
    
    console.log(`🧠 Retrieved ${aiPrompts?.length || 0} AI prompts for session ${sessionId}`);
    
    // Format response with full prompts
    const formattedPrompts = (aiPrompts || []).map(prompt => ({
      id: prompt.id,
      sessionId: prompt.session_id,
      model: prompt.model,
      pageNumber: prompt.page_number,
      success: prompt.success,
      createdAt: prompt.created_at,
      
      // System prompt - full text available
      systemPrompt: prompt.system_prompt || '',
      systemPromptLength: (prompt.system_prompt || '').length,
      systemPromptPreview: (prompt.system_prompt || '').substring(0, 200) + '...',
      
      // User prompt - full text available  
      userPrompt: prompt.user_prompt || '',
      userPromptLength: (prompt.user_prompt || '').length,
      userPromptPreview: (prompt.user_prompt || '').substring(0, 200) + '...',
      
      // Response data
      responseData: prompt.response_data || {},
      inputTokens: prompt.input_tokens || 0,
      outputTokens: prompt.output_tokens || 0,
      cost: prompt.cost || 0,
      processingTime: prompt.processing_time || 0,
      attempt: prompt.attempt || 1,
      
      // Bundle data if available
      bundleData: prompt.bundle_data || {}
    }));
    
    return createDynamicCorsResponse({
      success: true,
      sessionId,
      aiPrompts: formattedPrompts,
      totalEntries: formattedPrompts.length,
      limit,
      corsSystem: 'BULLETPROOF_DYNAMIC'
    }, req);
    
  } catch (error) {
    console.error('❌ Debug AI prompts failed:', error);
    
    return createDynamicCorsErrorResponse(
      `AI prompt retrieval failed: ${error.message}`,
      req,
      500
    );
  }
});