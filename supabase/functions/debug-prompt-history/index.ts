import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// Fix import to use proper Deno import for JS files
let globalSessionManager: any = null;
try {
  const { globalSessionManager: sessionManager } = await import('../_shared/SessionStateManager.js');
  globalSessionManager = sessionManager;
  console.log('✅ SessionStateManager imported successfully');
} catch (importError) {
  console.error('❌ Failed to import SessionStateManager:', importError);
}

serve(async (req) => {
  console.log(`🔍 Debug: Prompt History Request: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    // Add detailed environment and setup logging
    console.log('🔍 [DEBUG-INIT] Environment check:', {
      supabaseUrl: Deno.env.get('SUPABASE_URL') ? 'Set' : 'Missing',
      serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Set' : 'Missing',
      sessionManagerAvailable: !!globalSessionManager,
      timestamp: new Date().toISOString()
    });
    let sessionId: string | null = null;
    let limit = 5;
    let type = 'image';

    // For POST requests, read from request body
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        sessionId = body.sessionId;
        limit = parseInt(body.limit || '5');
        type = body.type || 'image';
      } catch (bodyError) {
        console.error('❌ Failed to parse request body:', bodyError);
        return createCorsErrorResponse('Invalid request body', 400);
      }
    } else {
      // For GET requests, read from URL parameters
      const url = new URL(req.url);
      sessionId = url.searchParams.get('sessionId');
      limit = parseInt(url.searchParams.get('limit') || '5');
      type = url.searchParams.get('type') || 'image';
    }

    if (!sessionId) {
      console.error('❌ Missing sessionId parameter');
      return createCorsErrorResponse('Missing sessionId parameter', 400);
    }

    console.log(`🔍 [DEBUG-SESSION] Processing session: ${sessionId}, type: ${type}, limit: ${limit}`);

    // Check if session manager is available
    if (!globalSessionManager) {
      console.warn('⚠️ Session manager not available, will only use database data');
    }

    const storyState = globalSessionManager?.getOrCreateSessionState?.(sessionId) || null;
    console.log(`🔍 [DEBUG-STATE] Session state found: ${!!storyState}`);

    // Handle AI prompt debugging - now with database persistence
    if (type === 'ai') {
      let aiPrompts = [];
      let dbEntries = [];
      
      try {
        // Primary: Query database for persistent data
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.55.0');
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !serviceRoleKey) {
          throw new Error('Missing Supabase environment variables');
        }
        
        console.log(`🔍 [DEBUG-DB] Connecting to database for session: ${sessionId}`);
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        console.log(`🔍 [DEBUG-DB] Querying ai_prompt_debug_log for session: ${sessionId}`);
        const { data, error } = await supabase
          .from('ai_prompt_debug_log')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          dbEntries = data;
          console.log(`✅ [AI-DEBUG] Retrieved ${dbEntries.length} entries from database for session ${sessionId}`);
          
          if (dbEntries.length === 0) {
            console.log(`🔍 [DEBUG-DB] No database entries found for session: ${sessionId}`);
          }
        } else {
          console.error('❌ Database query failed:', error);
          console.warn('⚠️ Will fall back to in-memory data');
        }
      } catch (dbError) {
        console.error('❌ Database connection failed:', dbError.message);
        console.error('❌ Full database error:', dbError);
      }

      // Fallback: Get in-memory data
      let memoryPrompts = [];
      if (globalSessionManager?.getAIPrompts) {
        try {
          memoryPrompts = globalSessionManager.getAIPrompts(sessionId, limit);
          console.log(`🔍 [AI-DEBUG] Retrieved ${memoryPrompts.length} in-memory AI prompt entries`);
        } catch (memoryError) {
          console.error('❌ Memory retrieval failed:', memoryError);
        }
      } else {
        console.warn('⚠️ Session manager getAIPrompts method not available');
      }

      // Use database data if available, otherwise use in-memory
      aiPrompts = dbEntries.length > 0 ? dbEntries.map(entry => ({
        model: entry.model,
        tokenLimit: entry.token_limit,
        systemPrompt: entry.system_prompt,
        userPrompt: entry.user_prompt,
        pageNumber: entry.page_number,
        attempt: entry.attempt,
        timestamp: new Date(entry.created_at).getTime(),
        apiResponse: entry.api_response,
        success: entry.success,
        sessionId: entry.session_id,
        bundle: entry.bundle_data
      })) : memoryPrompts;

      // Final debug logging
      console.log(`🔍 [DEBUG-FINAL] Result summary:`, {
        dbEntries: dbEntries.length,
        memoryEntries: memoryPrompts.length,
        finalEntries: aiPrompts.length,
        dataSource: dbEntries.length > 0 ? 'database' : 'memory'
      });

      return createCorsResponse({
        success: true,
        sessionId,
        type: 'ai',
        aiPrompts,
        totalEntries: aiPrompts.length,
        sessionExists: !!storyState,
        sessionInfo: storyState ? {
          createdAt: storyState.createdAt,
          lastUpdated: storyState.lastUpdated,
          lastPageGenerated: storyState.lastPageGenerated,
          charactersTracked: storyState.characters?.size || 0,
          objectsTracked: storyState.objects?.size || 0
        } : null,
        dataSource: dbEntries.length > 0 ? 'database' : 'memory',
        debugInfo: {
          dbEntriesFound: dbEntries.length,
          memoryEntriesFound: memoryPrompts.length,
          sessionManagerAvailable: !!globalSessionManager,
          environmentCheck: {
            supabaseUrl: !!Deno.env.get('SUPABASE_URL'),
            serviceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
          }
        },
        // Complete bundle data from database or memory
        fullDebugData: aiPrompts.map(prompt => ({
          sessionId: prompt.sessionId,
          timestamp: prompt.timestamp,
          systemPrompt: prompt.systemPrompt,
          userPrompt: prompt.userPrompt,
          bundle: prompt.bundle,
          apiResponse: prompt.apiResponse,
          success: prompt.success,
          attempt: prompt.attempt,
          model: prompt.model,
          tokenLimit: prompt.tokenLimit,
          pageNumber: prompt.pageNumber
        }))
      });
    }

    // Default: Get image prompt history for the session
    const promptHistory = globalSessionManager.getPromptHistory(sessionId, limit);

    console.log(`📚 Retrieved ${promptHistory.length} image prompt history entries for session ${sessionId}`);

    return createCorsResponse({
      success: true,
      sessionId,
      type: 'image',
      promptHistory,
      totalEntries: promptHistory.length,
      sessionExists: !!storyState,
      sessionInfo: storyState ? {
        createdAt: storyState.createdAt,
        lastUpdated: storyState.lastUpdated,
        lastPageGenerated: storyState.lastPageGenerated,
        charactersTracked: storyState.characters.size,
        objectsTracked: storyState.objects.size
      } : null
    });

  } catch (error) {
    console.error('❌ Debug prompt history failed:', error);
    console.error('❌ Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return createCorsErrorResponse(
      `Prompt history retrieval failed: ${error.message}. Check edge function logs for details.`,
      500
    );
  }
});