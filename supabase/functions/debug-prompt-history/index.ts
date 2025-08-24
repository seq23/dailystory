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

    if (!sessionId) {
      return createCorsErrorResponse('Missing sessionId parameter', 400);
    }

    // Get prompt history for the session
    const promptHistory = globalSessionManager.getPromptHistory(sessionId, limit);
    const storyState = globalSessionManager.getOrCreateSessionState(sessionId);

    console.log(`📚 Retrieved ${promptHistory.length} prompt history entries for session ${sessionId}`);

    return createCorsResponse({
      success: true,
      sessionId,
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