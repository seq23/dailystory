import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { SessionStateManager, globalSessionManager } from '../_shared/SessionStateManager.js';

serve(async (req) => {
  console.log(`🔍 Debug: Prompt History Request: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const type = url.searchParams.get('type') || 'image'; // 'image' or 'ai'

    if (!sessionId) {
      return createCorsErrorResponse('Missing sessionId parameter', 400);
    }

    const storyState = globalSessionManager.getOrCreateSessionState(sessionId);

    // Handle AI prompt debugging - now with database persistence
    if (type === 'ai') {
      let aiPrompts = [];
      let dbEntries = [];
      
      try {
        // Primary: Query database for persistent data
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.55.0');
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL'),
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        );

        const { data, error } = await supabase
          .from('ai_prompt_debug_log')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          dbEntries = data;
          console.log(`🔍 [AI-DEBUG] Retrieved ${dbEntries.length} entries from database for session ${sessionId}`);
        } else {
          console.warn('⚠️ Database query failed, falling back to in-memory:', error);
        }
      } catch (dbError) {
        console.error('❌ Database connection failed, using in-memory data:', dbError);
      }

      // Fallback: Get in-memory data
      const memoryPrompts = globalSessionManager.getAIPrompts(sessionId, limit);
      console.log(`🔍 [AI-DEBUG] Retrieved ${memoryPrompts.length} in-memory AI prompt entries`);

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
          charactersTracked: storyState.characters.size,
          objectsTracked: storyState.objects.size
        } : null,
        dataSource: dbEntries.length > 0 ? 'database' : 'memory',
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
    
    return createCorsErrorResponse(
      `Prompt history retrieval failed: ${error.message}`,
      500
    );
  }
});