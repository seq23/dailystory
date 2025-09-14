/**
 * PHASE 2: VISUAL DETAIL TRACKER
 * Cross-session visual memory and appearance consistency system
 * Note: Requires database migration for visual_details table
 */

import { DebugLogger } from '@/services/DebugLogger';

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
    DebugLogger.log('image', `👁️ VisualTracker: Tracking visual detail (pending migration)`, { 
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

  async detectAppearanceConflicts(): Promise<any[]> {
    return [];
  }

  async resolveConflicts(): Promise<any> {
    return {};
  }
}

export const visualDetailTracker = VisualDetailTracker.getInstance();

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

  /**
   * 2.1 Track visual details for appearance consistency
   */
  async trackVisualDetail(detail: Omit<VisualDetail, 'id' | 'generated_at'>): Promise<boolean> {
    try {
      DebugLogger.log('image', `👁️ VisualTracker: Tracking visual detail`, { 
        sessionId: detail.session_id, 
        character: detail.character_name,
        pageNumber: detail.page_number 
      });

      const { data, error } = await supabase
        .from('visual_details')
        .insert({
          ...detail,
          generated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        DebugLogger.error('image', `❌ VisualTracker: Failed to track detail`, { error, detail });
        return false;
      }

      // Update cache
      const cacheKey = `${detail.user_id}-${detail.session_id}`;
      if (!this.visualCache.has(cacheKey)) {
        this.visualCache.set(cacheKey, []);
      }
      this.visualCache.get(cacheKey)!.push(data);

      DebugLogger.log('image', `✅ VisualTracker: Detail tracked successfully`, { detailId: data.id });
      return true;
    } catch (error) {
      DebugLogger.error('image', `💥 VisualTracker: Exception tracking detail`, { error, detail });
      return false;
    }
  }

  /**
   * 2.2 Cross-session visual memory
   */
  async getVisualHistory(userId: string, characterName: string, limit: number = 10): Promise<VisualDetail[]> {
    try {
      // Check cache first
      const cacheKeys = Array.from(this.visualCache.keys()).filter(key => key.startsWith(userId));
      if (cacheKeys.length > 0) {
        const cached = cacheKeys.flatMap(key => this.visualCache.get(key) || [])
          .filter(detail => detail.character_name === characterName)
          .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())
          .slice(0, limit);
        
        if (cached.length > 0) {
          DebugLogger.log('image', `🎯 VisualTracker: Retrieved from cache`, { userId, characterName, count: cached.length });
          return cached;
        }
      }

      const { data, error } = await supabase
        .from('visual_details')
        .select('*')
        .eq('user_id', userId)
        .eq('character_name', characterName)
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (error) {
        DebugLogger.error('image', `❌ VisualTracker: Failed to get visual history`, { error, userId, characterName });
        return [];
      }

      DebugLogger.log('image', `✅ VisualTracker: Retrieved visual history`, { userId, characterName, count: data?.length || 0 });
      return data || [];
    } catch (error) {
      DebugLogger.error('image', `💥 VisualTracker: Exception getting visual history`, { error, userId, characterName });
      return [];
    }
  }

  /**
   * 2.3 Appearance conflict resolution
   */
  async detectAppearanceConflicts(
    userId: string, 
    characterName: string, 
    newVisualElements: VisualDetail['visual_elements']
  ): Promise<AppearanceConflict[]> {
    try {
      const recentHistory = await this.getVisualHistory(userId, characterName, 5);
      const conflicts: AppearanceConflict[] = [];

      if (recentHistory.length === 0) {
        DebugLogger.log('image', `ℹ️ VisualTracker: No history for conflict detection`, { userId, characterName });
        return conflicts;
      }

      // Get most recent visual elements for comparison
      const mostRecent = recentHistory[0].visual_elements;

      // Check for conflicts in key visual elements
      const conflictChecks = [
        { key: 'backgroundColor', type: 'setting' as const },
        { key: 'lighting', type: 'style' as const },
        { key: 'setting', type: 'setting' as const },
        { key: 'style', type: 'style' as const }
      ];

      for (const check of conflictChecks) {
        const prevValue = mostRecent[check.key as keyof typeof mostRecent];
        const newValue = newVisualElements[check.key as keyof typeof newVisualElements];

        if (prevValue && newValue && prevValue !== newValue) {
          const similarity = this.calculateSimilarity(prevValue, newValue);
          if (similarity < 0.7) { // 70% similarity threshold
            conflicts.push({
              type: check.type,
              previous_value: prevValue,
              new_value: newValue,
              confidence: 1 - similarity,
              resolved: false
            });
          }
        }
      }

      if (conflicts.length > 0) {
        DebugLogger.warn('image', `⚠️ VisualTracker: Appearance conflicts detected`, { 
          userId, 
          characterName, 
          conflicts: conflicts.length 
        });
      } else {
        DebugLogger.log('image', `✅ VisualTracker: No appearance conflicts`, { userId, characterName });
      }

      return conflicts;
    } catch (error) {
      DebugLogger.error('image', `💥 VisualTracker: Exception detecting conflicts`, { error, userId, characterName });
      return [];
    }
  }

  /**
   * Resolve appearance conflicts by selecting most consistent option
   */
  async resolveConflicts(
    conflicts: AppearanceConflict[], 
    userId: string, 
    characterName: string
  ): Promise<VisualDetail['visual_elements']> {
    try {
      const history = await this.getVisualHistory(userId, characterName, 10);
      const resolvedElements: Partial<VisualDetail['visual_elements']> = {};

      for (const conflict of conflicts) {
        // Count frequency of each value in history
        const valueCounts = new Map<string, number>();
        
        for (const detail of history) {
          const value = this.getElementValue(detail.visual_elements, conflict.type);
          if (value) {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
          }
        }

        // Select most frequent value
        let mostFrequent = conflict.previous_value;
        let maxCount = 0;

        for (const [value, count] of valueCounts) {
          if (count > maxCount) {
            maxCount = count;
            mostFrequent = value;
          }
        }

        // Apply resolution
        this.setElementValue(resolvedElements, conflict.type, mostFrequent);
        conflict.resolved = true;
      }

      DebugLogger.log('image', `🔧 VisualTracker: Conflicts resolved`, { 
        userId, 
        characterName, 
        resolvedCount: conflicts.filter(c => c.resolved).length 
      });

      return resolvedElements as VisualDetail['visual_elements'];
    } catch (error) {
      DebugLogger.error('image', `💥 VisualTracker: Exception resolving conflicts`, { error, userId, characterName });
      return {} as VisualDetail['visual_elements'];
    }
  }

  /**
   * Generate visual consistency recommendations
   */
  async getConsistencyRecommendations(userId: string, characterName: string): Promise<{
    recommendations: string[];
    consistencyScore: number;
  }> {
    try {
      const history = await this.getVisualHistory(userId, characterName, 10);
      const recommendations: string[] = [];
      let consistencyScore = 1.0;

      if (history.length < 2) {
        return { recommendations: [], consistencyScore: 1.0 };
      }

      // Analyze consistency patterns
      const elementFrequency = {
        backgroundColor: new Map<string, number>(),
        lighting: new Map<string, number>(),
        setting: new Map<string, number>(),
        style: new Map<string, number>()
      };

      // Count element frequencies
      for (const detail of history) {
        Object.entries(detail.visual_elements).forEach(([key, value]) => {
          if (key in elementFrequency) {
            const map = elementFrequency[key as keyof typeof elementFrequency];
            map.set(value, (map.get(value) || 0) + 1);
          }
        });
      }

      // Generate recommendations based on most common elements
      Object.entries(elementFrequency).forEach(([element, frequency]) => {
        const total = history.length;
        const mostCommon = Array.from(frequency.entries())
          .sort(([,a], [,b]) => b - a)[0];

        if (mostCommon) {
          const [value, count] = mostCommon;
          const consistency = count / total;
          
          if (consistency < 0.8) { // Less than 80% consistent
            recommendations.push(`Consider maintaining consistent ${element}: "${value}" (used in ${Math.round(consistency * 100)}% of images)`);
            consistencyScore *= consistency;
          }
        }
      });

      DebugLogger.log('image', `📊 VisualTracker: Generated consistency recommendations`, { 
        userId, 
        characterName, 
        score: consistencyScore,
        recommendationCount: recommendations.length 
      });

      return { recommendations, consistencyScore };
    } catch (error) {
      DebugLogger.error('image', `💥 VisualTracker: Exception generating recommendations`, { error, userId, characterName });
      return { recommendations: [], consistencyScore: 0.5 };
    }
  }

  // Helper methods
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    return intersection.length / union.length;
  }

  private getElementValue(elements: VisualDetail['visual_elements'], type: string): string | null {
    switch (type) {
      case 'setting': return elements.setting || elements.backgroundColor;
      case 'style': return elements.style || elements.lighting;
      default: return null;
    }
  }

  private setElementValue(elements: Partial<VisualDetail['visual_elements']>, type: string, value: string): void {
    switch (type) {
      case 'setting':
        elements.setting = value;
        break;
      case 'style':
        elements.style = value;
        break;
    }
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