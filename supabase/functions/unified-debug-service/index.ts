import { serve } from "https://deno.land/std@0.168.0/http/server.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createCorsOptionsResponse, createCorsResponse, createCorsErrorResponse } from "https://deno.land/x/cors@v1.2.2/mod.js";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Force deployment sync - 2025-01-30

  try {
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
        const { data: prompts, error } = await supabase
          .from('ai_prompt_debug_log')
          .select('*')
          .contains('details', { type: 'image_generation' })
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching recent image prompts:', error);
          return createCorsErrorResponse('Failed to fetch recent image prompts', 500);
        }

        return createCorsResponse({ data: prompts || [] }, 200);
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