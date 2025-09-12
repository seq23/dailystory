// Comprehensive debugging console functions for prompt and story analysis
import { supabase } from '@/integrations/supabase/client';

export class DebugConsole {
  /**
   * Get full prompts for any tier from the last 6 images
   */
  static async getFullPrompts(sessionId?: string, tier?: string, limit = 6) {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (tier) params.append('tiers', tier);
      params.append('limit', limit.toString());
      
      let url = sessionId 
        ? `unified-debug-service?operation=recent-image-prompts&sessionId=${sessionId}&${params}`
        : `unified-debug-service?operation=recent-image-prompts&global=true&${params}`;
      
      const { data, error } = await supabase.functions.invoke(url);
      
      if (error) throw error;
      
      console.log('🖼️ Full Image Prompts Retrieved:', data);
      console.table(data.data?.map((p: any) => ({
        Tier: p.tier,
        Page: p.pageNumber,
        Success: p.success,
        Model: p.model,
        PromptLength: p.promptFull?.length || 0,
        ImageURL: p.imageURL ? '✅' : '❌'
      })));
      
      return data;
    } catch (error) {
      console.error('❌ Failed to get full prompts:', error);
      return null;
    }
  }
  
  /**
   * Get AI prompts (system/user prompts sent to OpenAI)
   */
  static async getAIPrompts(sessionId: string, limit = 10) {
    try {
      const { data, error } = await supabase.functions.invoke(`unified-debug-service?operation=ai-prompts&sessionId=${sessionId}&limit=${limit}`);
      
      if (error) throw error;
      
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
    } catch (error) {
      console.error('❌ Failed to get AI prompts:', error);
      return null;
    }
  }
  
  /**
   * Track story generation pipeline for flicker detection
   */
  static async trackStoryGeneration(sessionId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(`unified-debug-service?operation=story-processing&sessionId=${sessionId}`);
      
      if (error) throw error;
      
      console.log('📚 Story Processing Log:', data);
      
      if (data.flickerDetected) {
        console.warn('⚠️ TEXT FLICKER DETECTED! Story text was modified after generation');
        console.table(data.storyProcessingLog?.filter((entry: any) => entry.changes.length > 0));
      } else {
        console.log('✅ No text flicker detected - story text remains stable');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to track story generation:', error);
      return null;
    }
  }
  
  /**
   * Check text stability by logging story processing events
   */
  static logStoryProcessing(sessionId: string, phase: string, textBefore: string, textAfter: string, pageNumber?: number) {
    // Send to debug endpoint for tracking
    supabase.functions.invoke('unified-debug-service?operation=story-processing', {
      body: {
        sessionId,
        phase,
        textBefore,
        textAfter,
        pageNumber
      }
    }).catch(error => {
      console.warn('⚠️ Failed to log story processing:', error);
    });
    
    // Local logging
    if (textBefore !== textAfter) {
      console.warn(`📚 Story Text Changed in ${phase}:`, {
        sessionId,
        pageNumber,
        lengthChange: `${textBefore.length} → ${textAfter.length}`,
        contentChanged: textBefore.toLowerCase() !== textAfter.toLowerCase()
      });
    }
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
        console.warn('📚 Story Processing Event:', message);
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
    trackStoryGeneration: typeof DebugConsole.trackStoryGeneration;
    trackStoryStability: typeof DebugConsole.trackStoryStability;
    logStoryProcessing: typeof DebugConsole.logStoryProcessing;
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.getFullPrompts = DebugConsole.getFullPrompts;
  window.getAIPrompts = DebugConsole.getAIPrompts;
  window.trackStoryGeneration = DebugConsole.trackStoryGeneration;
  window.trackStoryStability = DebugConsole.trackStoryStability;
  window.logStoryProcessing = DebugConsole.logStoryProcessing;
  
  console.log('🔧 Debug Console Functions Available:');
  console.log('  window.getFullPrompts(sessionId?, tier?, limit?) - Get full image prompts');
  console.log('  window.getAIPrompts(sessionId, limit?) - Get AI system/user prompts');
  console.log('  window.trackStoryGeneration(sessionId) - Check for story text flicker');
  console.log('  window.trackStoryStability() - Monitor story changes in real-time');
}