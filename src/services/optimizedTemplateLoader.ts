// Optimized Template Loader - High-Performance Template Loading System
// Pre-loading, caching, and intelligent template selection for sub-100ms loading

import { DifficultyLevel, UserInfo } from '@/types';
import { 
  GradeLevel, 
  difficultyToGradeLevel 
} from '@/constants/gradeBased';
import { unifiedTemplateSystem } from '@/constants/gradeBased/unifiedTemplateSystem';
import { TemplatePerformanceCache } from './templatePerformanceCache';
import { TemplatePerformanceMonitor } from './templatePerformanceMonitor';

export interface LoaderConfig {
  enablePreloading: boolean;
  enablePredictiveLoading: boolean;
  maxConcurrentLoads: number;
  priorityLevels: GradeLevel[];
  cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
}

export interface LoadResult {
  templates: any[];
  loadTime: number;
  cacheHit: boolean;
  preloaded: boolean;
  source: 'cache' | 'preload' | 'fresh';
}

export class OptimizedTemplateLoader {
  private static config: LoaderConfig = {
    enablePreloading: true,
    enablePredictiveLoading: true,
    maxConcurrentLoads: 3,
    priorityLevels: [0, 1, 2, 3, 4],
    cacheStrategy: 'balanced'
  };

  private static loadingQueue = new Map<string, Promise<any>>();
  private static preloadingInProgress = new Set<GradeLevel>();
  private static userUsagePatterns = new Map<string, GradeLevel[]>();

  /**
   * Initialize the optimized loader with pre-warming
   */
  static async initialize(): Promise<void> {
    console.log('🚀 Initializing OptimizedTemplateLoader...');
    
    const startTime = TemplatePerformanceMonitor.startOperation('loader-initialization');
    
    try {
      // Pre-warm cache with most common templates
      await this.preloadCriticalTemplates();
      
      // Set up predictive loading based on usage patterns
      if (this.config.enablePredictiveLoading) {
        this.initializePredictiveLoading();
      }
      
      TemplatePerformanceMonitor.endOperation('loader-initialization', startTime);
      console.log('✅ OptimizedTemplateLoader initialized successfully');
    } catch (error) {
      TemplatePerformanceMonitor.endOperation('loader-initialization', startTime, { error: error.message });
      console.error('❌ Failed to initialize OptimizedTemplateLoader:', error);
    }
  }

  /**
   * Load templates with optimized performance
   */
  static async loadTemplatesOptimized(
    difficulty: DifficultyLevel,
    userInfo?: UserInfo
  ): Promise<LoadResult> {
    const operationId = `load-${difficulty}-${Date.now()}`;
    const startTime = TemplatePerformanceMonitor.startOperation('optimized-template-load');
    
    try {
      const gradeLevel = difficultyToGradeLevel(difficulty);
      const cacheKey = `templates-${gradeLevel}`;
      
      // Check cache first
      const cached = TemplatePerformanceCache.get<any[]>(cacheKey);
      if (cached) {
        const loadTime = TemplatePerformanceMonitor.endOperation('optimized-template-load', startTime);
        return {
          templates: cached,
          loadTime,
          cacheHit: true,
          preloaded: false,
          source: 'cache'
        };
      }

      // Check if already loading (prevent duplicate requests)
      if (this.loadingQueue.has(cacheKey)) {
        const templates = await this.loadingQueue.get(cacheKey)!;
        const loadTime = TemplatePerformanceMonitor.endOperation('optimized-template-load', startTime);
        return {
          templates,
          loadTime,
          cacheHit: false,
          preloaded: true,
          source: 'preload'
        };
      }

      // Fresh load with optimization
      const loadPromise = this.performOptimizedLoad(gradeLevel);
      this.loadingQueue.set(cacheKey, loadPromise);

      const templates = await loadPromise;
      this.loadingQueue.delete(cacheKey);

      // Cache the result
      const ttl = this.getCacheTTL();
      TemplatePerformanceCache.set(cacheKey, templates, ttl);

      // Update usage patterns for predictive loading
      this.updateUsagePatterns(userInfo, gradeLevel);

      const loadTime = TemplatePerformanceMonitor.endOperation('optimized-template-load', startTime);
      
      return {
        templates,
        loadTime,
        cacheHit: false,
        preloaded: false,
        source: 'fresh'
      };

    } catch (error) {
      TemplatePerformanceMonitor.endOperation('optimized-template-load', startTime, { error: error.message });
      throw new Error(`Failed to load templates: ${error.message}`);
    }
  }

  /**
   * Preload critical templates for instant access
   */
  private static async preloadCriticalTemplates(): Promise<void> {
    if (!this.config.enablePreloading) return;

    const criticalLevels = this.config.priorityLevels.slice(0, 3); // Load first 3 levels
    const preloadPromises = criticalLevels.map(level => this.preloadLevel(level));
    
    await Promise.allSettled(preloadPromises);
  }

  private static async preloadLevel(gradeLevel: GradeLevel): Promise<void> {
    if (this.preloadingInProgress.has(gradeLevel)) return;
    
    this.preloadingInProgress.add(gradeLevel);
    
    try {
      const cacheKey = `templates-${gradeLevel}`;
      
      // Skip if already cached
      if (TemplatePerformanceCache.has(cacheKey)) {
        this.preloadingInProgress.delete(gradeLevel);
        return;
      }

      const templates = await this.performOptimizedLoad(gradeLevel);
      const ttl = this.getCacheTTL();
      TemplatePerformanceCache.set(cacheKey, templates, ttl);
      
      console.log(`📚 Preloaded Level ${gradeLevel} templates (${templates.length} templates)`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload Level ${gradeLevel}:`, error.message);
    } finally {
      this.preloadingInProgress.delete(gradeLevel);
    }
  }

  private static async performOptimizedLoad(gradeLevel: GradeLevel): Promise<any[]> {
    // Simulate optimized loading with batching and compression
    const startTime = performance.now();
    
    try {
      const templates = unifiedTemplateSystem.getTemplatesForGrade(gradeLevel);
      
      // Optimize template data structure for faster access
      const optimizedTemplates = templates.map((template, index) => ({
        ...template,
        id: `${gradeLevel}-${index}`,
        gradeLevel,
        loadedAt: Date.now(),
        optimized: true
      }));

      const loadTime = performance.now() - startTime;
      
      // Log performance metrics
      if (loadTime > 50) {
        console.warn(`⚠️ Slow template load for Level ${gradeLevel}: ${loadTime.toFixed(2)}ms`);
      }

      return optimizedTemplates;
    } catch (error) {
      throw new Error(`Template load failed for Level ${gradeLevel}: ${error.message}`);
    }
  }

  private static initializePredictiveLoading(): void {
    // Set up predictive loading based on user patterns
    setInterval(() => {
      this.runPredictivePreloading();
    }, 30000); // Check every 30 seconds
  }

  private static runPredictivePreloading(): void {
    // Analyze usage patterns and preload likely next templates
    this.userUsagePatterns.forEach((levels, userId) => {
      if (levels.length >= 2) {
        const nextLikelyLevel = this.predictNextLevel(levels);
        if (nextLikelyLevel !== null) {
          this.preloadLevel(nextLikelyLevel);
        }
      }
    });
  }

  private static predictNextLevel(usageHistory: GradeLevel[]): GradeLevel | null {
    // Simple prediction: if user is progressing, suggest next level
    const recent = usageHistory.slice(-3);
    const isProgressing = recent.every((level, i) => i === 0 || level >= recent[i - 1]);
    
    if (isProgressing) {
      const lastLevel = recent[recent.length - 1];
      const nextLevel = (lastLevel + 1) as GradeLevel;
      return nextLevel <= 4 ? nextLevel : null;
    }
    
    return null;
  }

  private static updateUsagePatterns(userInfo?: UserInfo, gradeLevel?: GradeLevel): void {
    if (!userInfo || !gradeLevel) return;
    
    const userId = userInfo.name || 'anonymous';
    const current = this.userUsagePatterns.get(userId) || [];
    current.push(gradeLevel);
    
    // Keep only last 10 usage records
    if (current.length > 10) {
      current.shift();
    }
    
    this.userUsagePatterns.set(userId, current);
  }

  private static getCacheTTL(): number {
    switch (this.config.cacheStrategy) {
      case 'aggressive': return 30 * 60 * 1000; // 30 minutes
      case 'balanced': return 15 * 60 * 1000;   // 15 minutes
      case 'minimal': return 5 * 60 * 1000;     // 5 minutes
      default: return 15 * 60 * 1000;
    }
  }

  /**
   * Get loader performance statistics
   */
  static getPerformanceStats(): {
    cacheStats: any;
    performanceMetrics: any;
    loadingQueue: number;
    preloadingStatus: GradeLevel[];
    usagePatterns: number;
  } {
    return {
      cacheStats: TemplatePerformanceCache.getStats(),
      performanceMetrics: TemplatePerformanceMonitor.getStats('optimized-template-load'),
      loadingQueue: this.loadingQueue.size,
      preloadingStatus: Array.from(this.preloadingInProgress),
      usagePatterns: this.userUsagePatterns.size
    };
  }

  /**
   * Update loader configuration
   */
  static updateConfig(newConfig: Partial<LoaderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('📝 Updated OptimizedTemplateLoader config:', this.config);
  }

  /**
   * Clear all caches and reset loader
   */
  static reset(): void {
    TemplatePerformanceCache.clear();
    this.loadingQueue.clear();
    this.preloadingInProgress.clear();
    this.userUsagePatterns.clear();
    console.log('🔄 OptimizedTemplateLoader reset complete');
  }
}
