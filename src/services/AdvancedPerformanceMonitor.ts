/**
 * Advanced Performance Monitoring Service for Cultural Intelligence System
 * Implements comprehensive monitoring, caching, and automated bias detection
 */

import { toast } from "sonner";
import { DebugLogger } from '@/services/DebugLogger';

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  culturalProfile?: string;
}

export interface BiasDetectionResult {
  score: number;
  issues: string[];
  recommendations: string[];
  culturalBalance: Record<string, number>;
}

export interface PerformanceMetrics {
  generationTime: number;
  cacheHitRate: number;
  biasScore: number;
  qualityScore: number;
  culturalDiversity: number;
}

export class AdvancedPerformanceMonitor {
  private cache = new Map<string, CacheEntry>();
  private performanceMetrics: PerformanceMetrics[] = [];
  private biasDetectionLog: BiasDetectionResult[] = [];
  private maxCacheSize = 1000;
  private cacheHitCount = 0;
  private cacheMissCount = 0;

  /**
   * Phase 6.1: Prompt Caching System for Recurring Patterns
   */
  getCachedPrompt(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.cacheMissCount++;
      return null;
    }

    // Check if cache entry is still valid (24 hours)
    const now = Date.now();
    if (now - entry.timestamp > 24 * 60 * 60 * 1000) {
      this.cache.delete(key);
      this.cacheMissCount++;
      return null;
    }

    // Update access metrics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.cacheHitCount++;
    
    DebugLogger.log('performance', `Cache hit for prompt pattern: ${key}`);
    return entry.value;
  }

  setCachedPrompt(key: string, value: any, culturalProfile?: string): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      culturalProfile
    };

    this.cache.set(key, entry);
    DebugLogger.log('performance', `Cached prompt pattern: ${key}`);
  }

  /**
   * Phase 6.2: Progressive Enhancement Based on Usage Patterns
   */
  analyzeUsagePatterns(): {
    popularPrompts: string[];
    culturalTrends: Record<string, number>;
    optimizationSuggestions: string[];
  } {
    const entries = Array.from(this.cache.values());
    
    // Sort by access count
    const popularPrompts = entries
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map(e => e.key);

    // Analyze cultural distribution
    const culturalTrends: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.culturalProfile) {
        culturalTrends[entry.culturalProfile] = (culturalTrends[entry.culturalProfile] || 0) + entry.accessCount;
      }
    });

    // Generate optimization suggestions
    const optimizationSuggestions: string[] = [];
    const hitRate = this.getCacheHitRate();
    
    if (hitRate < 0.3) {
      optimizationSuggestions.push("Low cache hit rate - consider improving prompt standardization");
    }
    
    const topCultural = Object.entries(culturalTrends).sort((a, b) => b[1] - a[1])[0];
    if (topCultural && topCultural[1] > entries.length * 0.6) {
      optimizationSuggestions.push(`High usage for ${topCultural[0]} culture - consider specialized optimization`);
    }

    return { popularPrompts, culturalTrends, optimizationSuggestions };
  }

  /**
   * Phase 6.3: Automated Cultural Bias Detection
   */
  detectCulturalBias(prompt: string, generatedDescription: string, culturalContext: any): BiasDetectionResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100; // Start with perfect score, deduct for issues
    
    const culturalBalance: Record<string, number> = {
      'african-american': 0,
      'hispanic': 0,
      'asian': 0,
      'european': 0,
      'multicultural': 0
    };

    // Detect cultural stereotypes
    const stereotypePatterns = {
      'african-american': ['urban', 'athletic', 'musical', 'basketball'],
      'hispanic': ['soccer', 'family-oriented', 'colorful'],
      'asian': ['smart', 'studious', 'quiet', 'math'],
      'european': ['blonde', 'classical', 'sophisticated']
    };

    const lowerDesc = generatedDescription.toLowerCase();
    
    Object.entries(stereotypePatterns).forEach(([culture, patterns]) => {
      const matchCount = patterns.filter(pattern => lowerDesc.includes(pattern)).length;
      culturalBalance[culture] = matchCount;
      
      if (matchCount >= 2) {
        issues.push(`Potential ${culture} stereotype detected`);
        score -= 15;
        recommendations.push(`Diversify ${culture} representation beyond common stereotypes`);
      }
    });

    // Check for cultural balance
    const totalCulturalReferences = Object.values(culturalBalance).reduce((a, b) => a + b, 0);
    if (totalCulturalReferences === 0) {
      culturalBalance.multicultural = 1;
    }

    // Check for skin tone variety
    const skinTones = ['fair', 'light', 'medium', 'olive', 'dark'];
    const mentionedTones = skinTones.filter(tone => lowerDesc.includes(tone));
    if (mentionedTones.length === 0) {
      issues.push('No explicit skin tone diversity mentioned');
      score -= 10;
      recommendations.push('Include diverse skin tone representation');
    }

    // Check for setting diversity
    const settings = ['urban', 'suburban', 'rural', 'professional', 'educational', 'recreational'];
    const mentionedSettings = settings.filter(setting => lowerDesc.includes(setting));
    if (mentionedSettings.length <= 1) {
      issues.push('Limited setting diversity');
      score -= 5;
      recommendations.push('Vary cultural settings beyond common environments');
    }

    const result: BiasDetectionResult = {
      score: Math.max(0, score),
      issues,
      recommendations,
      culturalBalance
    };

    this.biasDetectionLog.push(result);
    
    // Alert on significant bias detection
    if (score < 70) {
      DebugLogger.warn('performance', `Cultural bias detected (score: ${score}):`, issues);
    }

    return result;
  }

  /**
   * Phase 6.4: Performance Tracking with Quality Scoring
   */
  trackGeneration(
    startTime: number,
    endTime: number,
    biasResult: BiasDetectionResult,
    qualityScore: number
  ): void {
    const generationTime = endTime - startTime;
    const cacheHitRate = this.getCacheHitRate();
    
    // Calculate cultural diversity score
    const culturalDiversity = this.calculateCulturalDiversity(biasResult.culturalBalance);
    
    const metrics: PerformanceMetrics = {
      generationTime,
      cacheHitRate,
      biasScore: biasResult.score,
      qualityScore,
      culturalDiversity
    };

    this.performanceMetrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Alert on performance degradation
    if (generationTime > 10000) { // 10 seconds
      toast.error(`Slow generation detected: ${generationTime}ms`);
    }
    
    if (biasResult.score < 60) {
      toast.warning(`Cultural bias detected (score: ${biasResult.score})`);
    }
  }

  /**
   * Phase 6.5: Fallback Escalation for Failed Generations
   */
  handleGenerationFailure(
    attempt: number,
    error: string,
    fallbackStrategy: 'simplify' | 'cache' | 'alternative'
  ): {
    shouldRetry: boolean;
    newStrategy: string;
    modifiedPrompt?: string;
  } {
    DebugLogger.error('performance', `Generation attempt ${attempt} failed: ${error}`);
    
    if (attempt >= 3) {
      return { shouldRetry: false, newStrategy: 'manual-fallback' };
    }

    switch (fallbackStrategy) {
      case 'simplify':
        return {
          shouldRetry: true,
          newStrategy: 'simplified-prompt',
          modifiedPrompt: 'simple children\'s book illustration with diverse characters'
        };
        
      case 'cache':
        // Try to find similar cached prompt
        const cachedAlternative = this.findSimilarCachedPrompt();
        return {
          shouldRetry: true,
          newStrategy: 'cached-alternative',
          modifiedPrompt: cachedAlternative
        };
        
      case 'alternative':
        return {
          shouldRetry: true,
          newStrategy: 'alternative-service'
        };
        
      default:
        return { shouldRetry: false, newStrategy: 'final-fallback' };
    }
  }

  /**
   * Get comprehensive monitoring dashboard data
   */
  getMonitoringDashboard(): {
    performance: PerformanceMetrics;
    cacheStats: { hitRate: number; size: number; maxSize: number };
    biasAnalysis: { averageScore: number; commonIssues: string[] };
    usagePatterns: any;
  } {
    const recentMetrics = this.performanceMetrics.slice(-100);
    const avgPerformance = this.calculateAverageMetrics(recentMetrics);
    
    const recentBias = this.biasDetectionLog.slice(-50);
    const avgBiasScore = recentBias.reduce((sum, b) => sum + b.score, 0) / recentBias.length || 0;
    const commonIssues = this.extractCommonIssues(recentBias);
    
    return {
      performance: avgPerformance,
      cacheStats: {
        hitRate: this.getCacheHitRate(),
        size: this.cache.size,
        maxSize: this.maxCacheSize
      },
      biasAnalysis: {
        averageScore: avgBiasScore,
        commonIssues
      },
      usagePatterns: this.analyzeUsagePatterns()
    };
  }

  // Private helper methods
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      DebugLogger.log('performance', `Evicted cache entry: ${oldestKey}`);
    }
  }

  private getCacheHitRate(): number {
    const total = this.cacheHitCount + this.cacheMissCount;
    return total > 0 ? this.cacheHitCount / total : 0;
  }

  private calculateCulturalDiversity(balance: Record<string, number>): number {
    const values = Object.values(balance);
    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    
    // Calculate entropy as diversity measure
    const entropy = values.reduce((entropy, count) => {
      if (count === 0) return entropy;
      const p = count / total;
      return entropy - p * Math.log2(p);
    }, 0);
    
    return entropy / Math.log2(values.length); // Normalize to 0-1
  }

  private findSimilarCachedPrompt(): string {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 'fallback prompt';
    
    // Return most frequently accessed prompt as fallback
    const popular = entries.sort((a, b) => b.accessCount - a.accessCount)[0];
    return popular.value || 'fallback prompt';
  }

  private calculateAverageMetrics(metrics: PerformanceMetrics[]): PerformanceMetrics {
    if (metrics.length === 0) {
      return {
        generationTime: 0,
        cacheHitRate: 0,
        biasScore: 100,
        qualityScore: 0,
        culturalDiversity: 0
      };
    }
    
    return {
      generationTime: metrics.reduce((sum, m) => sum + m.generationTime, 0) / metrics.length,
      cacheHitRate: metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / metrics.length,
      biasScore: metrics.reduce((sum, m) => sum + m.biasScore, 0) / metrics.length,
      qualityScore: metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length,
      culturalDiversity: metrics.reduce((sum, m) => sum + m.culturalDiversity, 0) / metrics.length
    };
  }

  private extractCommonIssues(biasResults: BiasDetectionResult[]): string[] {
    const issueCount: Record<string, number> = {};
    
    biasResults.forEach(result => {
      result.issues.forEach(issue => {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
    });
    
    return Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);
  }
}

// Global instance for consistent monitoring
export const performanceMonitor = new AdvancedPerformanceMonitor();
