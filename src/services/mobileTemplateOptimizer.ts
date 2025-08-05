/**
 * Mobile Template Optimizer
 * Optimizes template loading and processing for mobile devices
 */

import type { DifficultyLevel, UserInfo } from '@/types';

interface MobileOptimizationConfig {
  maxTemplateSize: number;
  maxPagesPerTemplate: number;
  enableImageCompression: boolean;
  enableLazyLoading: boolean;
  prefetchNextTemplate: boolean;
  maxConcurrentValidations: number;
}

interface OptimizedTemplate {
  pages: string[];
  originalSize: number;
  compressedSize: number;
  optimizationApplied: string[];
  loadTime: number;
}

export class MobileTemplateOptimizer {
  private static config: MobileOptimizationConfig = {
    maxTemplateSize: 5000, // 5KB max per template on mobile
    maxPagesPerTemplate: 8, // Limit pages for mobile attention spans
    enableImageCompression: true,
    enableLazyLoading: true,
    prefetchNextTemplate: true,
    maxConcurrentValidations: 2 // Limit concurrent processing
  };

  private static isLowEndDevice = false;
  private static isMobile = false;

  /**
   * Initialize mobile detection and optimization
   */
  static initialize(): void {
    // Detect mobile device
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Detect low-end device (basic heuristics)
    this.isLowEndDevice = this.detectLowEndDevice();
    
    if (this.isLowEndDevice) {
      // Reduce limits for low-end devices
      this.config.maxTemplateSize = 3000;
      this.config.maxPagesPerTemplate = 6;
      this.config.maxConcurrentValidations = 1;
    }

    console.log(`📱 Mobile optimizer initialized: mobile=${this.isMobile}, lowEnd=${this.isLowEndDevice}`);
  }

  /**
   * Detect low-end device based on available metrics
   */
  private static detectLowEndDevice(): boolean {
    // Check available memory (if supported)
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory <= 2; // 2GB or less
    }

    // Check connection speed (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType) {
        return ['slow-2g', '2g'].includes(connection.effectiveType);
      }
    }

    // Fallback: assume low-end if mobile and no memory info
    return this.isMobile;
  }

  /**
   * Optimize template for mobile consumption
   */
  static optimizeTemplate(
    pages: string[],
    difficulty: DifficultyLevel,
    userInfo?: UserInfo
  ): OptimizedTemplate {
    const startTime = performance.now();
    const originalSize = JSON.stringify(pages).length;
    let optimizedPages = [...pages];
    const optimizationsApplied: string[] = [];

    // 1. Limit page count for mobile attention spans
    if (optimizedPages.length > this.config.maxPagesPerTemplate) {
      optimizedPages = optimizedPages.slice(0, this.config.maxPagesPerTemplate);
      optimizationsApplied.push('page-limit');
    }

    // 2. Compress overly long sentences for mobile reading
    optimizedPages = optimizedPages.map(page => {
      if (page.length > 200) { // Long sentences are hard on mobile
        // Split long sentences at natural break points
        const sentences = page.split('. ').filter(s => s.trim());
        if (sentences.length > 1) {
          // Keep first sentence if it's reasonable length
          const firstSentence = sentences[0];
          if (firstSentence.length <= 150) {
            optimizationsApplied.push('sentence-optimization');
            return firstSentence + '.';
          }
        }
      }
      return page;
    });

    // 3. Size validation and emergency compression
    const currentSize = JSON.stringify(optimizedPages).length;
    if (currentSize > this.config.maxTemplateSize) {
      // Emergency size reduction
      optimizedPages = optimizedPages.map(page => {
        // Remove redundant words, but preserve meaning
        return page
          .replace(/\b(very|really|quite|rather|pretty)\s+/gi, '') // Remove intensity adverbs
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
      });
      optimizationsApplied.push('emergency-compression');
    }

    // 4. Mobile-specific text adjustments
    if (this.isMobile) {
      optimizedPages = optimizedPages.map(page => {
        // Ensure sentences aren't too complex for mobile reading
        if (page.split(',').length > 3) {
          // Simplify complex sentences
          optimizationsApplied.push('complexity-reduction');
          return page.split(',')[0] + '.'; // Keep first clause
        }
        return page;
      });
    }

    const loadTime = performance.now() - startTime;
    const compressedSize = JSON.stringify(optimizedPages).length;

    console.log(`📱 Template optimized: ${originalSize}→${compressedSize} bytes, ${optimizationsApplied.length} optimizations`);

    return {
      pages: optimizedPages,
      originalSize,
      compressedSize,
      optimizationApplied: optimizationsApplied,
      loadTime
    };
  }

  /**
   * Check if template is suitable for mobile device
   */
  static isMobileFriendly(pages: string[]): {
    isFriendly: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check template size
    const size = JSON.stringify(pages).length;
    if (size > this.config.maxTemplateSize) {
      issues.push(`Template too large: ${size} bytes`);
      suggestions.push('Consider shorter sentences or fewer pages');
    }

    // Check page count
    if (pages.length > this.config.maxPagesPerTemplate) {
      issues.push(`Too many pages: ${pages.length}`);
      suggestions.push('Reduce to 6-8 pages for mobile');
    }

    // Check sentence complexity
    let complexSentences = 0;
    pages.forEach((page, index) => {
      if (page.split(',').length > 3) {
        complexSentences++;
        issues.push(`Complex sentence on page ${index + 1}`);
      }
      if (page.length > 200) {
        issues.push(`Long sentence on page ${index + 1} (${page.length} chars)`);
      }
    });

    if (complexSentences > 0) {
      suggestions.push('Simplify complex sentences for mobile reading');
    }

    return {
      isFriendly: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Get mobile optimization statistics
   */
  static getOptimizationStats(): {
    config: MobileOptimizationConfig;
    deviceInfo: {
      isMobile: boolean;
      isLowEnd: boolean;
      userAgent: string;
    };
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    if (this.isLowEndDevice) {
      recommendations.push('Use shorter templates for better performance');
      recommendations.push('Enable template caching');
      recommendations.push('Limit concurrent operations');
    }

    if (this.isMobile) {
      recommendations.push('Optimize for touch interaction');
      recommendations.push('Use larger fonts and buttons');
      recommendations.push('Minimize scrolling requirements');
    }

    return {
      config: this.config,
      deviceInfo: {
        isMobile: this.isMobile,
        isLowEnd: this.isLowEndDevice,
        userAgent: navigator.userAgent
      },
      recommendations
    };
  }

  /**
   * Update optimization config
   */
  static updateConfig(newConfig: Partial<MobileOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('📱 Mobile optimization config updated:', this.config);
  }
}

// Initialize on module load
MobileTemplateOptimizer.initialize();
