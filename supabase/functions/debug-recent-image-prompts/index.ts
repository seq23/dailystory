import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { 
  createDynamicCorsOptionsResponse, 
  createDynamicCorsResponse, 
  createDynamicCorsErrorResponse 
} from "../_shared/corsAdvanced.ts";
import { monitorRequest } from "../_shared/headerMonitor.ts";
import { SessionStateManager, globalSessionManager } from '../_shared/SessionStateManager.js';

serve(async (req) => {
  console.log(`🖼️ Debug: Recent Image Prompts Request: ${req.method} ${req.url}`);

  // Monitor request for header analytics
  monitorRequest(req, 'debug-recent-image-prompts');

  // Handle CORS preflight requests - BULLETPROOF DYNAMIC
  if (req.method === 'OPTIONS') {
    return createDynamicCorsOptionsResponse(req);
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const limit = parseInt(url.searchParams.get('limit') || '6');
    const tierFilter = url.searchParams.get('tiers')?.split(',') || null;
    const globalSearch = url.searchParams.get('global') === 'true';

    let imagePrompts = [];
    let sessionInfo = null;

    if (globalSearch) {
      // Get prompts from all sessions
      imagePrompts = globalSessionManager.getAllRecentImagePrompts(limit, tierFilter);
      
      console.log(`🌐 Retrieved ${imagePrompts.length} image prompts globally (limit: ${limit})`);
      
      return createDynamicCorsResponse({
        success: true,
        global: true,
        imagePrompts,
        totalEntries: imagePrompts.length,
        tierFilter,
        limit,
        corsSystem: 'BULLETPROOF_DYNAMIC'
      }, req);
    } else if (sessionId) {
      // Get prompts for specific session
      imagePrompts = globalSessionManager.getRecentImagePrompts(sessionId, limit, tierFilter);
      const storyState = globalSessionManager.getOrCreateSessionState(sessionId);
      
      sessionInfo = {
        sessionId,
        exists: !!storyState,
        createdAt: storyState?.createdAt,
        lastUpdated: storyState?.lastUpdated,
        lastPageGenerated: storyState?.lastPageGenerated,
        charactersTracked: storyState?.characters?.size || 0,
        objectsTracked: storyState?.objects?.size || 0,
        imagePromptsStored: storyState?.imagePrompts?.length || 0
      };
      
      console.log(`📚 Retrieved ${imagePrompts.length} image prompts for session ${sessionId}`);
    } else {
      return createDynamicCorsErrorResponse('Missing sessionId parameter or global=true', req, 400);
    }

    // Enhanced response with detailed debug information
    return createDynamicCorsResponse({
      success: true,
      sessionId,
      imagePrompts: imagePrompts.map(prompt => ({
        tier: prompt.tier,
        timestamp: prompt.timestamp,
        success: prompt.success,
        prompt: prompt.prompt?.substring(0, 100) + '...',
        model: prompt.model,
        sessionId: prompt.sessionId,
        pageNumber: prompt.pageNumber,
        generation_time: prompt.generation_time,
        error: prompt.error
      })),
      totalEntries: imagePrompts.length,
      sessionInfo,
      tierFilter,
      limit,
      // Add debugging summary
      tierSummary: imagePrompts.reduce((acc, prompt) => {
        acc[prompt.tier] = (acc[prompt.tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      successRate: imagePrompts.length > 0 ? 
        (imagePrompts.filter(p => p.success).length / imagePrompts.length * 100).toFixed(1) + '%' : 'N/A',
      corsSystem: 'BULLETPROOF_DYNAMIC'
    }, req);

  } catch (error) {
    console.error('❌ Debug recent image prompts failed:', error);
    
    return createDynamicCorsErrorResponse(
      `Image prompt retrieval failed: ${error.message}`,
      req,
      500
    );
  }
});