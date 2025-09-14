/**
 * PHASE 2: VISUAL DETAIL TRACKER
 * Cross-session visual memory and appearance consistency system
 * Note: Requires database migration for visual_details table
 */

import { DebugLogger } from '@/services/DebugLogger';
import { supabase } from '@/integrations/supabase/client';

export interface VisualDetail {
  id: string;
  user_id: string;
  session_id: string;
  character_name: string;
  image_url: string;
  visual_elements: {
    backgroundColor: string;
    lighting: string;
    composition: string;
    setting: string;
    mood: string;
    style: string;
  };
  generated_at: string;
  page_number: number;
}

export interface AppearanceConflict {
  type: 'hair_color' | 'clothing' | 'setting' | 'style';
  previous_value: string;
  new_value: string;
  confidence: number;
  resolved: boolean;
}

export class VisualDetailTracker {
  private static instance: VisualDetailTracker;
  private visualCache = new Map<string, VisualDetail[]>();

  static getInstance(): VisualDetailTracker {
    if (!VisualDetailTracker.instance) {
      VisualDetailTracker.instance = new VisualDetailTracker();
    }
    return VisualDetailTracker.instance;
  }

  async trackVisualDetail(detail: Omit<VisualDetail, 'id' | 'generated_at'>): Promise<boolean> {
    DebugLogger.log('image', `👁️ VisualTracker: Tracking visual detail (cache-based)`, { 
      sessionId: detail.session_id, 
      character: detail.character_name 
    });
    
    // Store in cache until database migration is complete
    const cacheKey = `${detail.user_id}-${detail.session_id}`;
    if (!this.visualCache.has(cacheKey)) {
      this.visualCache.set(cacheKey, []);
    }
    
    const visualDetail: VisualDetail = {
      ...detail,
      id: `visual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      generated_at: new Date().toISOString()
    };
    
    this.visualCache.get(cacheKey)!.push(visualDetail);
    return true;
  }

  async getVisualHistory(userId: string, characterName: string, limit: number = 10): Promise<VisualDetail[]> {
    DebugLogger.log('image', `📊 VisualTracker: Getting history from cache`, { userId, characterName });
    
    // Return from cache until database migration
    const results: VisualDetail[] = [];
    for (const [key, details] of this.visualCache.entries()) {
      if (key.startsWith(userId)) {
        results.push(...details.filter(d => d.character_name === characterName));
      }
    }
    
    return results.slice(0, limit);
  }

  async getConsistencyRecommendations(userId: string, characterName: string): Promise<{
    recommendations: string[];
    consistencyScore: number;
  }> {
    return { recommendations: [], consistencyScore: 1.0 };
  }

  async detectAppearanceConflicts(
    userId: string, 
    characterName: string, 
    newVisualElements: VisualDetail['visual_elements']
  ): Promise<AppearanceConflict[]> {
    return [];
  }

  async resolveConflicts(
    conflicts: AppearanceConflict[], 
    userId: string, 
    characterName: string
  ): Promise<VisualDetail['visual_elements']> {
    return {} as VisualDetail['visual_elements'];
  }

  /**
   * Clear cache for user
   */
  clearUserCache(userId: string): void {
    for (const key of this.visualCache.keys()) {
      if (key.startsWith(userId)) {
        this.visualCache.delete(key);
      }
    }
    DebugLogger.log('image', `🧹 VisualTracker: Cleared cache for user`, { userId });
  }
}

// Export singleton instance
export const visualDetailTracker = VisualDetailTracker.getInstance();