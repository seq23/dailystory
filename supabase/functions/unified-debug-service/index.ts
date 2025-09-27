import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { handleHealthAndCors } from "../_shared/healthCors.ts";

// Inline CORS helpers to avoid external dependencies
function createCorsResponse(data: any, status = 200): Response {
  const headers = { 
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json' 
  };
  
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error: string | Error, status = 500): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '600',
};

serve(async (req) => {
  // Handle health check and CORS preflight
  const healthCorsResponse = handleHealthAndCors(req);
  if (healthCorsResponse) return healthCorsResponse;

  try {
const { memoizedImport } = await import("../_shared/resilientLoader.ts");
const { createClient } = await memoizedImport('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const operation = url.searchParams.get('operation');
    const sessionId = url.searchParams.get('sessionId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    console.log(`Unified Debug Service - Operation: ${operation}, Session: ${sessionId}`);

    switch (operation) {
      case 'ai-prompts': {
        if (!sessionId) {
          return createCorsErrorResponse('sessionId is required for ai-prompts operation', 400);
        }

        const { data: prompts, error } = await supabase
          .from('ai_prompt_debug_log')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching AI prompts:', error);
          return createCorsErrorResponse('Failed to fetch AI prompts', 500);
        }

        const aiPrompts = prompts?.map(prompt => ({
          id: prompt.id,
          sessionId: prompt.session_id,
          model: prompt.model,
          systemPrompt: prompt.system_prompt?.substring(0, 200) + '...',
          userPrompt: prompt.user_prompt?.substring(0, 200) + '...',
          apiResponse: prompt.api_response?.substring(0, 300) + '...',
          success: prompt.success,
          pageNumber: prompt.page_number,
          executionTime: prompt.execution_time_ms,
          createdAt: prompt.created_at
        })) || [];

        return createCorsResponse({ data: aiPrompts }, 200);
      }

      case 'prompt-history': {
        if (!sessionId) {
          return createCorsErrorResponse('sessionId is required for prompt-history operation', 400);
        }

        const { data: prompts, error } = await supabase
          .from('ai_prompt_debug_log')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching prompt history:', error);
          return createCorsErrorResponse('Failed to fetch prompt history', 500);
        }

        return createCorsResponse({ data: prompts || [] }, 200);
      }

      case 'recent-image-prompts': {
        // Add session filtering for image generation data
        let query = supabase
          .from('image_generation_debug')
          .select('*');
        
        if (sessionId) {
          query = query.eq('session_id', sessionId);
        }
        
        const { data: imagePrompts, error } = await query
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching image generation data:', error);
          return createCorsErrorResponse('Failed to fetch image generation data', 500);
        }

        return createCorsResponse({ data: imagePrompts || [] }, 200);
      }

      case 'story-processing': {
        if (req.method === 'POST') {
          const { sessionId: postSessionId, phase, textBefore, textAfter, pageNumber } = await req.json();
          
          // Log story processing event
          const { error } = await supabase
            .from('ai_prompt_debug_log')
            .insert({
              session_id: postSessionId,
              user_id: null,
              model: 'story-processing',
              system_prompt: `Phase: ${phase}`,
              user_prompt: `Before: ${textBefore?.substring(0, 100)}...`,
              api_response: `After: ${textAfter?.substring(0, 100)}...`,
              success: true,
              page_number: pageNumber,
              details: {
                type: 'story_processing',
                phase,
                textBefore: textBefore?.substring(0, 500),
                textAfter: textAfter?.substring(0, 500),
                changes: textBefore !== textAfter
              }
            });

          if (error) {
            console.error('Error logging story processing:', error);
            return createCorsErrorResponse('Failed to log story processing', 500);
          }

          return createCorsResponse({ logged: true }, 200);
        }

        // GET request - retrieve logs
        const { data: logs, error } = await supabase
          .from('ai_prompt_debug_log')
          .select('*')
          .eq('model', 'story-processing')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching story processing logs:', error);
          return createCorsErrorResponse('Failed to fetch story processing logs', 500);
        }

        return createCorsResponse({ data: logs || [] }, 200);
      }

      case 'tier-cascade': {
        if (!sessionId) {
          return createCorsErrorResponse('sessionId is required for tier-cascade operation', 400);
        }

        const { data: tierLogs, error } = await supabase
          .from('image_generation_debug')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching tier cascade logs:', error);
          return createCorsErrorResponse('Failed to fetch tier cascade logs', 500);
        }

        const tierCascadeData = tierLogs?.map(log => ({
          id: log.id,
          sessionId: log.session_id,
          requestId: log.request_id,
          tier: log.tier,
          status: log.status,
          context: log.context,
          createdAt: log.created_at
        })) || [];

        return createCorsResponse({ data: tierCascadeData }, 200);
      }

      case 'visual-scene-debug': {
        // Test the AI Visual Scene Creator with sample data
        const testPayload = {
          storyText: "The brave knight walked through the enchanted forest, sunlight filtering through the ancient oak trees.",
          userInfo: {
            childName: "Test Child",
            avatarIdentity: "knight",
            favoriteColor: "blue"
          }
        };

        const { data: result, error } = await supabase
          .functions
          .invoke('ai-visual-scene-creator', { body: testPayload });

        const diagnosticResult = {
          environmentCheck: {
            openaiKey: !!Deno.env.get('OPENAI_API_KEY'),
            supabaseUrl: !!Deno.env.get('SUPABASE_URL'),
            supabaseKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
          },
          testPayload,
          functionResult: result,
          functionError: error,
          timestamp: new Date().toISOString()
        };

        return createCorsResponse(diagnosticResult, 200);
      }

      default:
        return createCorsErrorResponse(`Unknown operation: ${operation}`, 400);
    }
  } catch (error) {
    console.error('Unified Debug Service error:', error);
    return createCorsErrorResponse('Internal server error', 500);
  }
});