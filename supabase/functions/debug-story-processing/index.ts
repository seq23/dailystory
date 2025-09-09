import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { 
  createDynamicCorsOptionsResponse, 
  createDynamicCorsResponse, 
  createDynamicCorsErrorResponse 
} from "../_shared/corsAdvanced.ts";
import { monitorRequest } from "../_shared/headerMonitor.ts";

// Story processing tracker for detecting text flicker
const storyProcessingLog: Array<{
  sessionId: string;
  timestamp: number;
  phase: string;
  textBefore: string;
  textAfter: string;
  changes: string[];
  pageNumber?: number;
}> = [];

// Store story processing event
function logStoryProcessing(sessionId: string, phase: string, textBefore: string, textAfter: string, pageNumber?: number) {
  const changes = [];
  
  if (textBefore !== textAfter) {
    changes.push(`Length: ${textBefore.length} → ${textAfter.length}`);
    
    if (textBefore.toLowerCase() !== textAfter.toLowerCase()) {
      changes.push('Content modified');
    }
    
    if (textBefore.trim() !== textAfter.trim()) {
      changes.push('Whitespace changes');
    }
  }
  
  const entry = {
    sessionId,
    timestamp: Date.now(),
    phase,
    textBefore: textBefore.substring(0, 100),
    textAfter: textAfter.substring(0, 100),
    changes,
    pageNumber
  };
  
  storyProcessingLog.push(entry);
  
  // Keep only last 50 entries
  if (storyProcessingLog.length > 50) {
    storyProcessingLog.splice(0, storyProcessingLog.length - 50);
  }
  
  console.log(`📚 Story Processing [${phase}]:`, {
    sessionId,
    pageNumber,
    hasChanges: changes.length > 0,
    changes
  });
}

serve(async (req) => {
  console.log(`📚 Debug: Story Processing Request: ${req.method} ${req.url}`);
  
  // Monitor request for header analytics
  monitorRequest(req, 'debug-story-processing');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createDynamicCorsOptionsResponse(req);
  }
  
  if (req.method === 'POST') {
    // Log story processing event
    try {
      const { sessionId, phase, textBefore, textAfter, pageNumber } = await req.json();
      
      if (!sessionId || !phase) {
        return createDynamicCorsErrorResponse('Missing required fields: sessionId, phase', req, 400);
      }
      
      logStoryProcessing(sessionId, phase, textBefore || '', textAfter || '', pageNumber);
      
      return createDynamicCorsResponse({
        success: true,
        logged: true,
        corsSystem: 'BULLETPROOF_DYNAMIC'
      }, req);
      
    } catch (error) {
      console.error('❌ Error logging story processing:', error);
      return createDynamicCorsErrorResponse(`Logging failed: ${error.message}`, req, 500);
    }
  }
  
  // GET request - retrieve story processing log
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    let filteredLog = storyProcessingLog;
    
    if (sessionId) {
      filteredLog = storyProcessingLog.filter(entry => entry.sessionId === sessionId);
    }
    
    // Get most recent entries
    const recentEntries = filteredLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    
    console.log(`📚 Retrieved ${recentEntries.length} story processing entries${sessionId ? ` for session ${sessionId}` : ' globally'}`);
    
    return createDynamicCorsResponse({
      success: true,
      sessionId,
      storyProcessingLog: recentEntries,
      totalEntries: recentEntries.length,
      limit,
      flickerDetected: recentEntries.some(entry => entry.changes.length > 0),
      corsSystem: 'BULLETPROOF_DYNAMIC'
    }, req);
    
  } catch (error) {
    console.error('❌ Debug story processing failed:', error);
    
    return createDynamicCorsErrorResponse(
      `Story processing retrieval failed: ${error.message}`,
      req,
      500
    );
  }
});
