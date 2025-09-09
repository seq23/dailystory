import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.js";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  console.log(`🔍 Debug: Prompt History Request: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { sessionId, type = 'ai', limit = 10 } = await req.json();

    if (!sessionId) {
      console.log('❌ No session ID provided');
      return createCorsErrorResponse('Session ID is required', 400);
    }

    console.log(`🔍 Fetching debug data for session: ${sessionId}, type: ${type}, limit: ${limit}`);

    // Query the ai_prompt_debug_log table
    const { data: debugLogs, error: dbError } = await supabase
      .from('ai_prompt_debug_log')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return createCorsErrorResponse(
        `Database query failed: ${dbError.message}`,
        500
      );
    }

    console.log(`✅ Found ${debugLogs?.length || 0} debug entries for session ${sessionId}`);

    // Map database records to expected format
    const aiPrompts = (debugLogs || []).map(log => ({
      sessionId: log.session_id,
      timestamp: new Date(log.created_at).getTime(),
      systemPrompt: log.system_prompt || '',
      userPrompt: log.user_prompt || '',
      bundle: log.bundle_data || {},
      apiResponse: log.api_response || {},
      success: log.success,
      attempt: log.attempt,
      model: log.model,
      tokenLimit: log.token_limit,
      pageNumber: log.page_number
    }));

    const response = {
      success: true,
      sessionId,
      type,
      aiPrompts,
      totalEntries: aiPrompts.length,
      dataSource: 'database' as const,
      fullDebugData: aiPrompts,
      debugInfo: {
        dbEntriesFound: aiPrompts.length,
        memoryEntriesFound: 0,
        sessionManagerAvailable: false,
        environmentCheck: {
          supabaseUrl: !!supabaseUrl,
          serviceRoleKey: !!supabaseServiceKey
        }
      }
    };

    console.log(`🎯 Returning ${aiPrompts.length} debug entries for session ${sessionId}`);

    return createCorsResponse(response);

  } catch (error) {
    console.error('❌ Error in debug-prompt-history function:', error);
    return createCorsErrorResponse(
      `Debug retrieval failed: ${error.message}`,
      500
    );
  }
});