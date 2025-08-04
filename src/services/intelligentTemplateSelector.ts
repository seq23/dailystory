// Intelligent Template Selection System
// Implements smart template rotation with tier-specific anti-repetition

import { DifficultyLevel } from '@/types';
import { getRobustTemplate, getTemplatePoolStats } from '@/constants/robustStoryTemplates';

interface TemplateUsageData {
  templateId: string;
  usageCount: number;
  lastUsed: number;
  difficulty: DifficultyLevel;
  tier: 'free' | 'premium';
}

interface SelectionConfig {
  tier: 'free' | 'premium';
  difficulty: DifficultyLevel;
  lookbackPages: number; // 5 for free, 10 for premium
  cooldownPages: number; // 8 for free, 15 for premium
  sessionId?: string;
  userId?: string;
}

export class IntelligentTemplateSelector {
  private static usageTracker = new Map<string, TemplateUsageData[]>();
  private static recentSelections = new Map<string, number[]>();
  
  // Initialize or get user-specific tracking
  private static getUserKey(config: SelectionConfig): string {
    return `${config.userId || 'anonymous'}_${config.tier}_${config.difficulty}`;
  }

  // FREE TIER: Enhanced template selection with 5-page lookback
  private static selectFreeTemplate(config: SelectionConfig): { template: string[]; templateId: string } {
    const userKey = this.getUserKey(config);
    const recentTemplates = this.recentSelections.get(userKey) || [];
    const usageData = this.usageTracker.get(userKey) || [];
    
    // Get available templates excluding recent ones
    const excludeIndices = recentTemplates.slice(-config.lookbackPages);
    const template = getRobustTemplate(config.difficulty, 'free', undefined, excludeIndices);
    
    // Find template index for tracking
    const templateId = this.generateTemplateId(template, config);
    
    // Update recent selections (maintain lookback window)
    const templateIndex = this.findTemplateIndex(template, config);
    const updatedRecent = [...recentTemplates, templateIndex].slice(-config.lookbackPages);
    this.recentSelections.set(userKey, updatedRecent);
    
    // Update usage tracking
    this.updateUsageTracking(userKey, templateId, config);
    
    console.log(`🎯 Free Template Selected: ${config.difficulty} | Recent: ${updatedRecent.length}/${config.lookbackPages} | Pool: ${getTemplatePoolStats('free')[config.difficulty]}`);
    
    return { template, templateId };
  }

  // PREMIUM TIER: Ultra-robust selection with 10-page lookback + AI-powered variety
  private static selectPremiumTemplate(config: SelectionConfig): { template: string[]; templateId: string; isAIGenerated?: boolean } {
    const userKey = this.getUserKey(config);
    const recentTemplates = this.recentSelections.get(userKey) || [];
    const usageData = this.usageTracker.get(userKey) || [];
    
    // Advanced selection logic for premium users
    const excludeIndices = recentTemplates.slice(-config.lookbackPages);
    
    // Check if we should generate a new AI template (premium exclusive)
    const shouldGenerateAI = this.shouldGenerateAITemplate(usageData, config);
    
    if (shouldGenerateAI) {
      // TODO: Integrate with AI template generation service
      const aiTemplate = this.generateAITemplate(config);
      const templateId = `ai_${Date.now()}_${config.difficulty}`;
      
      console.log(`🤖 Premium AI Template Generated: ${config.difficulty} | Reason: Enhanced variety`);
      return { template: aiTemplate, templateId, isAIGenerated: true };
    }
    
    // Use enhanced base templates with advanced filtering
    const template = getRobustTemplate(config.difficulty, 'premium', undefined, excludeIndices);
    const templateId = this.generateTemplateId(template, config);
    
    // Update tracking with premium-specific logic
    const templateIndex = this.findTemplateIndex(template, config);
    const updatedRecent = [...recentTemplates, templateIndex].slice(-config.lookbackPages);
    this.recentSelections.set(userKey, updatedRecent);
    
    this.updateUsageTracking(userKey, templateId, config);
    
    console.log(`⭐ Premium Template Selected: ${config.difficulty} | Recent: ${updatedRecent.length}/${config.lookbackPages} | Pool: ${getTemplatePoolStats('premium')[config.difficulty]}`);
    
    return { template, templateId };
  }

  // Main public interface
  public static selectTemplate(config: SelectionConfig): { template: string[]; templateId: string; isAIGenerated?: boolean } {
    if (config.tier === 'premium') {
      return this.selectPremiumTemplate(config);
    } else {
      return this.selectFreeTemplate(config);
    }
  }

  // Template cooldown checking
  public static isTemplateCooledDown(templateId: string, config: SelectionConfig): boolean {
    const userKey = this.getUserKey(config);
    const usageData = this.usageTracker.get(userKey) || [];
    const templateUsage = usageData.find(data => data.templateId === templateId);
    
    if (!templateUsage) return true;
    
    const pagesSinceLastUse = Date.now() - templateUsage.lastUsed;
    const cooldownThreshold = config.cooldownPages * 1000; // Convert to ms for demo
    
    return pagesSinceLastUse >= cooldownThreshold;
  }

  // Premium-specific AI generation decision
  private static shouldGenerateAITemplate(usageData: TemplateUsageData[], config: SelectionConfig): boolean {
    if (config.tier !== 'premium') return false;
    
    // Generate AI template if:
    // 1. User has used 80% of available templates
    // 2. Recent templates show high repetition patterns
    // 3. User requests enhanced variety (future feature)
    
    const totalTemplates = getTemplatePoolStats('premium')[config.difficulty];
    const usedTemplates = usageData.length;
    const usagePercentage = usedTemplates / totalTemplates;
    
    return usagePercentage > 0.8 || this.detectRepetitionPattern(usageData);
  }

  // AI template generation (placeholder for future AI integration)
  private static generateAITemplate(config: SelectionConfig): string[] {
    // TODO: Integrate with OpenAI or similar service
    // For now, return a dynamic variation of existing templates
    const baseTemplate = getRobustTemplate(config.difficulty, 'premium');
    
    // Apply AI-style variations (placeholder logic)
    return baseTemplate.map(sentence => {
      // Dynamic placeholder replacement would happen here
      return sentence.replace(/{(\w+)}/g, (match, placeholder) => {
        return this.getAIPlaceholderValue(placeholder, config);
      });
    });
  }

  // Helper methods
  private static generateTemplateId(template: string[], config: SelectionConfig): string {
    const templateHash = template.join('|').substring(0, 20);
    return `${config.tier}_${config.difficulty}_${templateHash}`;
  }

  private static findTemplateIndex(template: string[], config: SelectionConfig): number {
    // This would ideally search through the template pool to find the index
    // For now, return a random index for tracking purposes
    const stats = getTemplatePoolStats(config.tier);
    return Math.floor(Math.random() * stats[config.difficulty]);
  }

  private static updateUsageTracking(userKey: string, templateId: string, config: SelectionConfig): void {
    const usageData = this.usageTracker.get(userKey) || [];
    const existingUsage = usageData.find(data => data.templateId === templateId);
    
    if (existingUsage) {
      existingUsage.usageCount++;
      existingUsage.lastUsed = Date.now();
    } else {
      usageData.push({
        templateId,
        usageCount: 1,
        lastUsed: Date.now(),
        difficulty: config.difficulty,
        tier: config.tier
      });
    }
    
    this.usageTracker.set(userKey, usageData);
  }

  private static detectRepetitionPattern(usageData: TemplateUsageData[]): boolean {
    // Analyze usage patterns to detect if variety is needed
    const recentUsage = usageData.slice(-10);
    const uniqueTemplates = new Set(recentUsage.map(data => data.templateId));
    
    // If less than 70% unique templates in recent usage, request AI generation
    return uniqueTemplates.size / recentUsage.length < 0.7;
  }

  private static getAIPlaceholderValue(placeholder: string, config: SelectionConfig): string {
    // AI-powered placeholder replacement would happen here
    // For now, return enhanced placeholder values based on difficulty
    const placeholderValues: Record<string, string[]> = {
      name: ['Alex', 'Sam', 'Riley', 'Jordan', 'Taylor'],
      animal: ['dragon', 'phoenix', 'unicorn', 'griffin', 'wolf'],
      color: ['shimmering', 'radiant', 'mysterious', 'brilliant', 'magical'],
      object: ['crystal', 'artifact', 'compass', 'scroll', 'amulet']
    };
    
    const values = placeholderValues[placeholder] || [placeholder];
    return values[Math.floor(Math.random() * values.length)];
  }

  // Analytics and debugging
  public static getSelectionStats(config: Partial<SelectionConfig> = {}): {
    totalSelections: number;
    templateDistribution: Record<string, number>;
    cooldownViolations: number;
    aiGenerations: number;
  } {
    const stats = {
      totalSelections: 0,
      templateDistribution: {} as Record<string, number>,
      cooldownViolations: 0,
      aiGenerations: 0
    };
    
    for (const [userKey, usageData] of this.usageTracker.entries()) {
      if (config.tier && !userKey.includes(config.tier)) continue;
      if (config.difficulty && !userKey.includes(config.difficulty)) continue;
      
      stats.totalSelections += usageData.length;
      
      usageData.forEach(data => {
        stats.templateDistribution[data.templateId] = (stats.templateDistribution[data.templateId] || 0) + 1;
        if (data.templateId.startsWith('ai_')) {
          stats.aiGenerations++;
        }
      });
    }
    
    return stats;
  }

  // Clear user data (for testing/reset)
  public static clearUserData(userId: string, tier?: 'free' | 'premium'): void {
    const keysToRemove: string[] = [];
    
    for (const key of this.usageTracker.keys()) {
      if (key.startsWith(userId) && (!tier || key.includes(tier))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      this.usageTracker.delete(key);
      this.recentSelections.delete(key);
    });
    
    console.log(`🧹 Cleared template data for user ${userId} (tier: ${tier || 'all'})`);
  }
}