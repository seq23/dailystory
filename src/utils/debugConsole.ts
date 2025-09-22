// Comprehensive debugging console functions for prompt and story analysis
import { supabase } from '@/integrations/supabase/client';
import { DebugGateway } from '@/services/DebugGateway';
import { DebugLogger } from '../services/DebugLogger';

export class DebugConsole {
  /**
   * Get full prompts for any tier from the last 6 images
   * If sessionId is provided, gets prompts for that specific session
   */
  static async getFullPrompts(sessionId?: string, tier?: string, limit = 6) {
    if (sessionId) {
      // Get prompts for specific session
      const { data } = await DebugGateway.getPromptHistory(sessionId, limit);
      
      if (data && data.data) {
        console.log(`🖼️ Session Prompts for ${sessionId}:`, data);
        console.table(data.data?.map((p: any) => ({
          Tier: p.tier,
          Page: p.pageNumber || p.page_number,
          Success: p.success,
          Model: p.model,
          PromptLength: p.prompt?.length || p.promptFull?.length || 0,
          ImageURL: p.imageURL || p.image_url ? '✅' : '❌'
        })));
        
        return { data: data.data };
      }
    }
    
    // Use the gateway for silent error handling (recent images)
    const { data } = await DebugGateway.getRecentImagePrompts(limit);
    
    if (data && data.imagePrompts) {
      console.log('🖼️ Full Image Prompts Retrieved:', data);
      console.table(data.imagePrompts?.map((p: any) => ({
        Tier: p.tier,
        Page: p.pageNumber,
        Success: p.success,
        Model: p.model,
        PromptLength: p.promptFull?.length || 0,
        ImageURL: p.imageURL ? '✅' : '❌'
      })));
      
      return { data: data.imagePrompts };
    }
    
    return null;
  }
  
  /**
   * Get AI prompts (system/user prompts sent to OpenAI)
   */
  static async getAIPrompts(sessionId: string, limit = 10) {
    // Use the gateway for silent error handling
    const { data } = await DebugGateway.getAiPrompts(sessionId, limit);
    
    if (data && data.data) {
      console.log('🧠 AI Prompts Retrieved:', data);
      console.table(data.data?.map((p: any) => ({
        Model: p.model,
        Page: p.pageNumber,
        Success: p.success,
        SystemLength: p.systemPromptLength,
        UserLength: p.userPromptLength,
        Cost: p.cost,
        ProcessingTime: p.processingTime + 'ms'
      })));
      
      // Show full prompts in expandable groups
      data.data?.forEach((prompt: any, index: number) => {
        console.groupCollapsed(`🧠 AI Prompt ${index + 1} - Page ${prompt.pageNumber}`);
        console.log('System Prompt:', prompt.systemPrompt);
        console.log('User Prompt:', prompt.userPrompt);
        console.log('Response:', prompt.responseData);
        console.groupEnd();
      });
      
      return data;
    }
    
    return null;
  }
  
  /**
   * Track story generation pipeline for flicker detection
   */
  static async trackStoryGeneration(sessionId: string) {
    // Use the gateway for silent error handling
    const { data } = await DebugGateway.callDebugService({
      operation: 'story-processing',
      sessionId
    });
    
    if (data && data.data) {
      console.log('📚 Story Processing Log:', data);
      
      if (data.flickerDetected) {
        DebugLogger.warn('ui', 'TEXT FLICKER DETECTED! Story text was modified after generation');
        console.table(data.storyProcessingLog?.filter((entry: any) => entry.changes.length > 0));
      } else {
        console.log('✅ No text flicker detected - story text remains stable');
      }
      
      return data;
    }
    
    return null;
  }
  
  /**
   * Check text stability by logging story processing events
   */
  static logStoryProcessing(sessionId: string, phase: string, textBefore: string, textAfter: string, pageNumber?: number) {
    // Silent logging through gateway - no errors thrown
    DebugGateway.callDebugService({
      operation: 'story-processing'
    }).then(() => {
      // Story processing logged silently
    }).catch(() => {
      // Silent failure - no console spam
    });
    
    // Local logging
    if (textBefore !== textAfter) {
      DebugLogger.warn('story', `Story Text Changed in ${phase}`, {
        sessionId,
        pageNumber,
        lengthChange: `${textBefore.length} → ${textAfter.length}`,
        contentChanged: textBefore.toLowerCase() !== textAfter.toLowerCase()
      });
    }
  }
  
  /**
   * Get image generation logs with tier routing and API details
   */
  static async getImageGenerationLogs(sessionId?: string, limit = 6) {
    try {
      const currentSessionId = sessionId || getCurrentSessionId();
      
      if (!currentSessionId) {
        DebugLogger.warn('story', 'No session ID provided or found');
        return null;
      }
      
      const { data, error } = await supabase
        .from('image_generation_debug')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) {
        DebugLogger.error('network', 'Failed to fetch image generation logs', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.log('🔍 No image generation logs found for session:', currentSessionId);
        return null;
      }
      
      console.log(`🖼️ Image Generation Logs for ${currentSessionId}:`, data);
      console.table(data.map((log: any) => ({
        Tier: log.tier,
        Status: log.status,
        EdgeFunction: log.edge_function,
        Page: log.page_number,
        Success: log.success ? '✅' : '❌',
        ProcessingTime: log.processing_time_ms ? `${log.processing_time_ms}ms` : 'N/A',
        ImageURL: log.image_url ? '✅' : '❌',
        FailureReason: log.failure_reason || '-',
        Timestamp: new Date(log.created_at).toLocaleTimeString()
      })));
      
      // Show detailed info for each log
      data.forEach((log: any, index: number) => {
        console.groupCollapsed(`🖼️ Image Generation ${index + 1} - ${log.tier} ${log.status}`);
        console.log('Positive Prompt:', log.positive_prompt);
        console.log('Negative Prompt:', log.negative_prompt);
        console.log('API Response:', log.api_response);
        console.log('Context:', log.context);
        console.log('Template Complexity:', log.template_complexity);
        console.groupEnd();
      });
      
      return { data, sessionId: currentSessionId };
    } catch (error) {
      DebugLogger.error('network', 'Error fetching image generation logs', error);
      return null;
    }
  }
  static async checkTier() {
    const { data } = await DebugGateway.getRecentImagePrompts(5);
    
    if (data && data.imagePrompts) {
      console.log('🖼️ Recent Image Tiers:');
      console.table(data.imagePrompts?.map((p: any) => ({
        Tier: p.tier,
        Success: p.success,
        Model: p.model,
        Timestamp: new Date(p.created_at).toLocaleTimeString(),
        ImageURL: p.imageURL ? '✅' : '❌'
      })));
      
      const successfulTiers = data.imagePrompts
        ?.filter((p: any) => p.success && p.imageURL)
        .map((p: any) => p.tier);
        
      if (successfulTiers && successfulTiers.length > 0) {
        console.log(`✅ Working tiers: ${[...new Set(successfulTiers)].join(', ')}`);
      }
      
      return { data: data.imagePrompts, workingTiers: [...new Set(successfulTiers)] };
    }
    
    DebugLogger.warn('performance', 'No recent image data found');
    return null;
  }

  /**
   * Monitor story stability in real-time
   */
  static trackStoryStability() {
    console.log('🔍 Story Stability Monitor Active');
    
    // Hook into story generation events
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      const message = args.join(' ');
      
      // Detect story processing phases
      if (message.includes('📚 Setting story content') || 
          message.includes('Story generation completed') ||
          message.includes('Grammar processing')) {
        DebugLogger.warn('story', 'Story Processing Event', { message });
      }
      
      originalConsoleLog.apply(console, args);
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.log('🔍 Story Stability Monitor Disabled');
    };
  }
}

// Global window functions for easy console access
declare global {
  interface Window {
    getFullPrompts: typeof DebugConsole.getFullPrompts;
    getAIPrompts: typeof DebugConsole.getAIPrompts;
    checkTier: typeof DebugConsole.checkTier;
    trackStoryGeneration: typeof DebugConsole.trackStoryGeneration;
    trackStoryStability: typeof DebugConsole.trackStoryStability;
    logStoryProcessing: typeof DebugConsole.logStoryProcessing;
    getImageGenerationLogs: typeof DebugConsole.getImageGenerationLogs;
    getCurrentSessionId: () => string | null;
  }
}

// Helper function to find current session ID
const getCurrentSessionId = (): string | null => {
  try {
    // Check for session data in various places
    const sessionStorage = window.sessionStorage;
    const keys = Object.keys(sessionStorage);
    
    // Look for session-related keys
    const sessionKey = keys.find(key => 
      key.includes('session') || key.includes('guest_') || key.includes('premium_')
    );
    
    if (sessionKey) {
      const sessionId = sessionKey.includes('_') ? sessionKey.split('_')[0] + '_' + sessionKey.split('_')[1] : sessionKey;
      console.log('🔍 Found session ID:', sessionId);
      return sessionId;
    }
    
    console.warn('🔍 No session ID found in storage');
    return null;
  } catch (error) {
    console.error('🔍 Error finding session ID:', error);
    return null;
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.getFullPrompts = DebugConsole.getFullPrompts;
  window.getAIPrompts = DebugConsole.getAIPrompts;
  window.checkTier = DebugConsole.checkTier;
  window.trackStoryGeneration = DebugConsole.trackStoryGeneration;
  window.trackStoryStability = DebugConsole.trackStoryStability;
  window.logStoryProcessing = DebugConsole.logStoryProcessing;
  window.getImageGenerationLogs = DebugConsole.getImageGenerationLogs;
  window.getCurrentSessionId = getCurrentSessionId;
  
  console.log('🔧 Debug Console Functions Available (No Debug Mode Required):');
  console.log('  window.checkTier() - Check recent image tiers');
  console.log('  window.getFullPrompts() - Get recent image prompts');
  console.log('  window.getFullPrompts("sessionId") - Get prompts for specific session');
  console.log('  window.getImageGenerationLogs("sessionId") - Get image generation debug logs with tier routing');  
  console.log('  window.getCurrentSessionId() - Get current session ID');
  console.log('');
  console.log('🔧 Advanced Functions (Debug Mode Required):');
  console.log('  window.getAIPrompts("sessionId") - Get AI system/user prompts');
  console.log('  window.trackStoryGeneration("sessionId") - Check for story text flicker');
  console.log('  window.trackStoryStability() - Monitor story changes in real-time');
  console.log('🔧 Session Cache Debug Console Available:');
  console.log('  window.sessionCacheDebug.investigate(sessionId?) - Investigate session cache state');
  console.log('  window.sessionCacheDebug.clearProblematicCache(sessionId?, avatarType?) - Clear problematic cache');
  console.log('  window.sessionCacheDebug.testCacheKey(prompt, sessionId, avatarType, skinTone) - Test cache key generation');
  console.log('  window.sessionCacheDebug.forceRegenerateCurrentImage(sessionId, pageNumber?) - Force regenerate image');
  console.log('  window.sessionCacheDebug.getCurrentSessionId() - Find current session ID from storage');
  console.log('  window.sessionCacheDebug.getStorageBreakdown() - Get storage usage breakdown');
}