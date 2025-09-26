import { supabase } from "@/integrations/supabase/client";
import { DebugLogger } from '@/services/DebugLogger';

export interface CostEntry {
  sessionId: string;
  userId?: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  modelUsed: string;
  operationType: 'story_generation' | 'image_generation' | 'audio_generation';
}

export interface AnalyticsSession {
  sessionId: string;
  userId?: string;
  isPremium: boolean;
  totalCost?: number;
  storiesGenerated?: number;
  imagesGenerated?: number;
  pagesViewed?: number;
}

export class ProductionAnalyticsTracker {
  private static sessionCache = new Map<string, AnalyticsSession>();

  /**
   * Start a new analytics session
   */
  static async startSession(sessionData: AnalyticsSession): Promise<void> {
    try {
      // Cache session data
      this.sessionCache.set(sessionData.sessionId, sessionData);

      // Store in database
      const { error } = await supabase
        .from('analytics_sessions')
        .insert({
          session_id: sessionData.sessionId,
          user_id: sessionData.userId,
          is_premium: sessionData.isPremium,
          total_cost: sessionData.totalCost || 0,
          stories_generated: sessionData.storiesGenerated || 0,
          images_generated: sessionData.imagesGenerated || 0,
          pages_viewed: sessionData.pagesViewed || 0,
          is_active: true
        });

      if (error) {
        DebugLogger.warn('performance', 'Failed to start analytics session', error);
      } else {
        DebugLogger.log('performance', 'Analytics session started', { sessionId: sessionData.sessionId });
      }
    } catch (error) {
      DebugLogger.warn('performance', 'Error starting analytics session', error);
    }
  }

  /**
   * End an analytics session
   */
  static async endSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_sessions')
        .update({
          ended_at: new Date().toISOString(),
          is_active: false
        })
        .eq('session_id', sessionId);

      if (error) {
        DebugLogger.warn('performance', 'Failed to end analytics session', error);
      } else {
        DebugLogger.log('performance', 'Analytics session ended', { sessionId });
      }

      // Remove from cache
      this.sessionCache.delete(sessionId);
    } catch (error) {
      DebugLogger.warn('performance', 'Error ending analytics session', error);
    }
  }

  /**
   * Track cost for a specific operation
   */
  static async trackCost(costEntry: CostEntry): Promise<void> {
    try {
      // Store cost tracking
      const { error: costError } = await supabase
        .from('cost_tracking')
        .insert({
          session_id: costEntry.sessionId,
          user_id: costEntry.userId,
          input_tokens: costEntry.inputTokens,
          output_tokens: costEntry.outputTokens,
          cost: costEntry.cost,
          model_used: costEntry.modelUsed,
          operation_type: costEntry.operationType
        });

      if (costError) {
        DebugLogger.warn('performance', 'Failed to track cost', costError);
        return;
      }

      // Update session total cost - simplified version without RPC
      const { data: sessionData } = await supabase
        .from('analytics_sessions')
        .select('total_cost')
        .eq('session_id', costEntry.sessionId)
        .single();

      if (sessionData) {
        const newTotalCost = (sessionData.total_cost || 0) + costEntry.cost;
        const { error: updateError } = await supabase
          .from('analytics_sessions')
          .update({ total_cost: newTotalCost })
          .eq('session_id', costEntry.sessionId);

        if (updateError) {
          DebugLogger.warn('performance', 'Failed to update session cost', updateError);
        }
      }

      DebugLogger.log('performance', 'Cost tracked successfully', {
        sessionId: costEntry.sessionId,
        cost: costEntry.cost,
        operationType: costEntry.operationType
      });
    } catch (error) {
      DebugLogger.warn('performance', 'Error tracking cost', error);
    }
  }

  /**
   * Track story generation
   */
  static async trackStoryGeneration(sessionId: string): Promise<void> {
    try {
      // Get current count and increment
      const { data: sessionData } = await supabase
        .from('analytics_sessions')
        .select('stories_generated')
        .eq('session_id', sessionId)
        .single();

      if (sessionData) {
        const newCount = (sessionData.stories_generated || 0) + 1;
        const { error } = await supabase
          .from('analytics_sessions')
          .update({ stories_generated: newCount })
          .eq('session_id', sessionId);

        if (error) {
          DebugLogger.warn('performance', 'Failed to track story generation', error);
        } else {
          DebugLogger.log('performance', 'Story generation tracked', { sessionId });
        }
      }
    } catch (error) {
      DebugLogger.warn('performance', 'Error tracking story generation', error);
    }
  }

  /**
   * Track image generation
   */
  static async trackImageGeneration(sessionId: string): Promise<void> {
    try {
      // Get current count and increment
      const { data: sessionData } = await supabase
        .from('analytics_sessions')
        .select('images_generated')
        .eq('session_id', sessionId)
        .single();

      if (sessionData) {
        const newCount = (sessionData.images_generated || 0) + 1;
        const { error } = await supabase
          .from('analytics_sessions')
          .update({ images_generated: newCount })
          .eq('session_id', sessionId);

        if (error) {
          DebugLogger.warn('performance', 'Failed to track image generation', error);
        } else {
          DebugLogger.log('performance', 'Image generation tracked', { sessionId });
        }
      }
    } catch (error) {
      DebugLogger.warn('performance', 'Error tracking image generation', error);
    }
  }

  /**
   * Track page view
   */
  static async trackPageView(sessionId: string): Promise<void> {
    try {
      // Get current count and increment
      const { data: sessionData } = await supabase
        .from('analytics_sessions')
        .select('pages_viewed')
        .eq('session_id', sessionId)
        .single();

      if (sessionData) {
        const newCount = (sessionData.pages_viewed || 0) + 1;
        const { error } = await supabase
          .from('analytics_sessions')
          .update({ pages_viewed: newCount })
          .eq('session_id', sessionId);

        if (error) {
          DebugLogger.warn('performance', 'Failed to track page view', error);
        }
      }
    } catch (error) {
      DebugLogger.warn('performance', 'Error tracking page view', error);
    }
  }

  /**
   * Get current session data
   */
  static getSessionData(sessionId: string): AnalyticsSession | undefined {
    return this.sessionCache.get(sessionId);
  }

  /**
   * Get daily cost summary from database
   */
  static async getDailyCostSummary(): Promise<any> {
    try {
      // Get today's cost tracking data
      const today = new Date().toISOString().split('T')[0];
      
      const { data: costData, error: costError } = await supabase
        .from('cost_tracking')
        .select('*')
        .gte('timestamp', `${today}T00:00:00Z`)
        .lt('timestamp', `${today}T23:59:59Z`);

      if (costError) {
        DebugLogger.warn('performance', 'Failed to get daily cost summary', costError);
        return null;
      }

      // Calculate summary statistics
      const totalCost = costData?.reduce((sum, entry) => sum + Number(entry.cost), 0) || 0;
      const totalRequests = costData?.length || 0;
      const totalInputTokens = costData?.reduce((sum, entry) => sum + entry.input_tokens, 0) || 0;
      const totalOutputTokens = costData?.reduce((sum, entry) => sum + entry.output_tokens, 0) || 0;

      // Model breakdown
      const modelBreakdown: Record<string, { requests: number; cost: number }> = {};
      costData?.forEach(entry => {
        if (!modelBreakdown[entry.model_used]) {
          modelBreakdown[entry.model_used] = { requests: 0, cost: 0 };
        }
        modelBreakdown[entry.model_used].requests++;
        modelBreakdown[entry.model_used].cost += Number(entry.cost);
      });

      return {
        date: today,
        totalCost,
        totalRequests,
        totalInputTokens,
        totalOutputTokens,
        averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
        modelBreakdown,
        dailyLimit: 5.0, // $5 daily limit
        remainingBudget: Math.max(0, 5.0 - totalCost)
      };
    } catch (error) {
      DebugLogger.warn('performance', 'Error getting daily cost summary', error);
      return null;
    }
  }
}