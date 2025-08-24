import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { SessionStateManager } from '../_shared/SessionStateManager.js';

serve(async (req) => {
  console.log(`🖼️ Debug: Recent Image Prompts Request: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
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
      imagePrompts = SessionStateManager.getAllRecentImagePrompts(limit, tierFilter);
      
      console.log(`🌐 Retrieved ${imagePrompts.length} image prompts globally (limit: ${limit})`);
      
      return createCorsResponse({
        success: true,
        global: true,
        imagePrompts,
        totalEntries: imagePrompts.length,
        tierFilter,
        limit
      });
    } else if (sessionId) {
      // Get prompts for specific session
      imagePrompts = SessionStateManager.prototype.getRecentImagePrompts(sessionId, limit, tierFilter);
      const storyState = SessionStateManager.getOrCreateSessionState(sessionId);
      
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
      return createCorsErrorResponse('Missing sessionId parameter or global=true', 400);
    }

    // Enhanced response with detailed debug information
    return createCorsResponse({
      success: true,
      sessionId,
      imagePrompts: imagePrompts.map(prompt => ({
        tier: prompt.tier,
        promptText: prompt.promptText,
        enhancedPrompt: prompt.enhancedPrompt,
        originalPageText: prompt.originalPageText,
        negativePrompt: prompt.negativePrompt,
        pageNumber: prompt.pageNumber,
        timestamp: prompt.timestamp,
        readableTime: new Date(prompt.timestamp).toISOString(),
        success: prompt.success,
        imageURL: prompt.imageURL,
        provider: prompt.provider,
        model: prompt.model,
        cost: prompt.cost,
        generationTime: prompt.generationTime,
        fallbackReason: prompt.fallbackReason,
        metadata: prompt.metadata,
        // Add debug-friendly text lengths
        textLengths: {
          original: prompt.originalPageText?.length || 0,
          enhanced: prompt.enhancedPrompt?.length || 0,
          negative: prompt.negativePrompt?.length || 0
        }
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
        (imagePrompts.filter(p => p.success).length / imagePrompts.length * 100).toFixed(1) + '%' : 'N/A'
    });

  } catch (error) {
    console.error('❌ Debug recent image prompts failed:', error);
    
    return createCorsErrorResponse(
      `Image prompt retrieval failed: ${error.message}`,
      500
    );
  }
});