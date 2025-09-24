/**
 * Unified System Validator - Consolidates all validation logic
 * Replaces scattered validators with a single, comprehensive validation service
 */

import { AudioImplementationValidator } from '@/utils/audioImplementationValidator';
import { DebugLogger } from '@/services/DebugLogger';
import { NetworkDebugger } from '@/services/NetworkDebugger';

export interface ValidationResult {
  isValid: boolean;
  category: string;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  timestamp: number;
}

interface SystemValidationReport {
  overall: {
    status: 'healthy' | 'warning' | 'error' | 'mixed';
    score: number;
    timestamp: number;
  };
  categories: {
    audio: ValidationResult;
    network: ValidationResult;
    cache: ValidationResult;
    ui: ValidationResult;
    performance: ValidationResult;
  };
  recommendations: string[];
  history: ValidationResult[];
}

/**
 * Unified System Validator - Single source of truth for all validation
 */
export class UnifiedSystemValidator {
  private static instance: UnifiedSystemValidator;
  private validationHistory: ValidationResult[] = [];
  private audioValidator: AudioImplementationValidator;

  private constructor() {
    this.audioValidator = new AudioImplementationValidator();
  }

  static getInstance(): UnifiedSystemValidator {
    if (!UnifiedSystemValidator.instance) {
      UnifiedSystemValidator.instance = new UnifiedSystemValidator();
    }
    return UnifiedSystemValidator.instance;
  }

  /**
   * Run comprehensive system validation
   */
  async validateSystem(): Promise<SystemValidationReport> {
    DebugLogger.log('performance', 'Starting comprehensive system validation');

    const audioResult = await this.validateAudioSystem();
    const networkResult = await this.validateNetworkSystem();
    const cacheResult = await this.validateCacheSystem();
    const uiResult = await this.validateUISystem();
    const performanceResult = await this.validatePerformanceSystem();

    const categories = {
      audio: audioResult,
      network: networkResult,
      cache: cacheResult,
      ui: uiResult,
      performance: performanceResult
    };

    const overallStatus = this.calculateOverallStatus(categories);
    const recommendations = this.generateSystemRecommendations(categories);

    const report: SystemValidationReport = {
      overall: {
        status: overallStatus.status,
        score: overallStatus.score,
        timestamp: Date.now()
      },
      categories,
      recommendations,
      history: this.validationHistory.slice(-10) // Last 10 validations
    };

    DebugLogger.log('performance', 'System validation completed', {
      status: overallStatus.status,
      score: overallStatus.score,
      totalIssues: Object.values(categories).reduce((sum, cat) => sum + cat.issues.length, 0),
      totalWarnings: Object.values(categories).reduce((sum, cat) => sum + cat.warnings.length, 0)
    });

    return report;
  }

  /**
   * Validate audio implementation and synchronization
   */
  private async validateAudioSystem(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      category: 'audio',
      issues: [],
      warnings: [],
      recommendations: [],
      timestamp: Date.now()
    };

    try {
      const audioValidation = await this.audioValidator.validateImplementation();
      
      result.isValid = audioValidation.isValid;
      result.issues = audioValidation.issues;
      result.warnings = audioValidation.warnings;

      // Audio-specific recommendations
      if (!audioValidation.deviceCompatibility) {
        result.recommendations.push('Improve mobile audio compatibility');
      }
      if (!audioValidation.languageSupport) {
        result.recommendations.push('Fix language preference restrictions');
      }

      // Check for Charlotte voice service
      if (typeof window !== 'undefined' && !(window as any).__CharlotteVoiceService) {
        result.warnings.push('Charlotte voice service not globally exposed');
      }

    } catch (error) {
      result.isValid = false;
      result.issues.push(`Audio validation failed: ${(error as Error).message}`);
    }

    this.addToHistory(result);
    return result;
  }

  /**
   * Validate network health and connectivity
   */
  private async validateNetworkSystem(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      category: 'network',
      issues: [],
      warnings: [],
      recommendations: [],
      timestamp: Date.now()
    };

    try {
      const networkStats = NetworkDebugger.getStats();
      const failedRequests = NetworkDebugger.getFailedRequests();

      // Check failure rates
      const failureRate = networkStats.total > 0 ? networkStats.failed / networkStats.total : 0;
      
      if (failureRate > 0.1) { // More than 10% failure rate
        result.issues.push(`High network failure rate: ${(failureRate * 100).toFixed(1)}%`);
        result.isValid = false;
      } else if (failureRate > 0.05) { // More than 5% failure rate
        result.warnings.push(`Elevated network failure rate: ${(failureRate * 100).toFixed(1)}%`);
      }

      // Check for slow requests
      if (networkStats.avgDuration > 3000) {
        result.warnings.push(`Slow average response time: ${networkStats.avgDuration}ms`);
        result.recommendations.push('Optimize API response times or implement caching');
      }

      // Check for failed image generation requests
      const imageFailures = failedRequests.filter(req => 
        req.type === 'edge-function' && req.url.includes('image')
      );
      
      if (imageFailures.length > 0) {
        result.warnings.push(`${imageFailures.length} image generation failures detected`);
        result.recommendations.push('Check image generation service stability');
      }

    } catch (error) {
      result.issues.push(`Network validation error: ${(error as Error).message}`);
      result.isValid = false;
    }

    this.addToHistory(result);
    return result;
  }

  /**
   * Validate cache systems and storage
   */
  private async validateCacheSystem(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      category: 'cache',
      issues: [],
      warnings: [],
      recommendations: [],
      timestamp: Date.now()
    };

    try {
      if (typeof window !== 'undefined') {
        // Check sessionStorage usage
        const sessionStorageSize = JSON.stringify(sessionStorage).length;
        const sessionStorageLimit = 5 * 1024 * 1024; // 5MB typical limit
        const sessionUsagePercent = (sessionStorageSize / sessionStorageLimit) * 100;

        if (sessionUsagePercent > 80) {
          result.issues.push(`SessionStorage usage critical: ${sessionUsagePercent.toFixed(1)}%`);
          result.isValid = false;
        } else if (sessionUsagePercent > 60) {
          result.warnings.push(`SessionStorage usage high: ${sessionUsagePercent.toFixed(1)}%`);
          result.recommendations.push('Consider implementing cache cleanup policies');
        }

        // Check for orphaned cache entries
        const sessionKeys = Object.keys(sessionStorage);
        const storySessionKeys = sessionKeys.filter(key => key.includes('time2read_story_session_'));
        const imageCacheKeys = sessionKeys.filter(key => key.includes('session_image_cache'));

        if (storySessionKeys.length > 10) {
          result.warnings.push(`Many story sessions cached: ${storySessionKeys.length}`);
          result.recommendations.push('Implement automatic cache cleanup for old sessions');
        }

        if (imageCacheKeys.length === 0 && sessionStorageSize > 1024) {
          result.warnings.push('No image cache found but storage is being used');
        }
      }

    } catch (error) {
      result.issues.push(`Cache validation error: ${(error as Error).message}`);
      result.isValid = false;
    }

    this.addToHistory(result);
    return result;
  }

  /**
   * Validate UI responsiveness and accessibility
   */
  private async validateUISystem(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      category: 'ui',
      issues: [],
      warnings: [],
      recommendations: [],
      timestamp: Date.now()
    };

    try {
      if (typeof window !== 'undefined') {
        // Check viewport and mobile optimization
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        };

        const isMobile = viewport.width < 768;
        
        if (isMobile) {
          // Check for mobile-specific issues
          const audioButtons = document.querySelectorAll('button[aria-label*=\\\"audio\\\"], button[aria-label*=\\\"play\\\"]');
          let smallTouchTargets = 0;
          
          audioButtons.forEach(button => {
            const rect = button.getBoundingClientRect();
            if (rect.height < 44 || rect.width < 44) {
              smallTouchTargets++;
            }
          });

          if (smallTouchTargets > 0) {
            result.warnings.push(`${smallTouchTargets} audio controls smaller than 44px touch target`);
            result.recommendations.push('Ensure all interactive elements meet accessibility guidelines');
          }
        }

        // Check for debug mode pollution in production
        if (!window.location.search.includes('debug=1')) {
          const debugElements = document.querySelectorAll('[id*=\\\"debug\\\"], [class*=\\\"debug\\\"]');
          if (debugElements.length > 0) {
            result.warnings.push(`${debugElements.length} debug elements found in non-debug mode`);
          }
        }

        // Check for accessibility issues
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
          result.warnings.push(`${imagesWithoutAlt.length} images missing alt text`);
          result.recommendations.push('Add descriptive alt text to all images');
        }
      }

    } catch (error) {
      result.issues.push(`UI validation error: ${(error as Error).message}`);
      result.isValid = false;
    }

    this.addToHistory(result);
    return result;
  }

  /**
   * Validate system performance metrics
   */
  private async validatePerformanceSystem(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      category: 'performance',
      issues: [],
      warnings: [],
      recommendations: [],
      timestamp: Date.now()
    };

    try {
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Check memory usage if available
        if ((performance as any).memory) {
          const memory = (performance as any).memory;
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          const totalMB = memory.totalJSHeapSize / 1024 / 1024;
          const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;

          const memoryUsagePercent = (usedMB / limitMB) * 100;

          if (memoryUsagePercent > 80) {
            result.issues.push(`Critical memory usage: ${memoryUsagePercent.toFixed(1)}%`);
            result.isValid = false;
          } else if (memoryUsagePercent > 60) {
            result.warnings.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`);
            result.recommendations.push('Consider implementing memory optimization strategies');
          }
        }

        // Check for performance entries
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navigation = navigationEntries[0] as PerformanceNavigationTiming;
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          
          if (loadTime > 5000) {
            result.warnings.push(`Slow page load time: ${loadTime}ms`);
            result.recommendations.push('Optimize initial page load performance');
          }
        }

        // Check for long tasks (if supported)
        try {
          const longTasks = performance.getEntriesByType('longtask');
          if (longTasks.length > 5) {
            result.warnings.push(`${longTasks.length} long tasks detected`);
            result.recommendations.push('Optimize JavaScript execution to avoid blocking main thread');
          }
        } catch {
          // Long tasks API not supported
        }
      }

    } catch (error) {
      result.issues.push(`Performance validation error: ${(error as Error).message}`);
      result.isValid = false;
    }

    this.addToHistory(result);
    return result;
  }

  /**
   * Calculate overall system status from individual category results
   */
  private calculateOverallStatus(categories: SystemValidationReport['categories']): { status: 'healthy' | 'warning' | 'error' | 'mixed'; score: number } {
    const results = Object.values(categories);
    const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
    const totalWarnings = results.reduce((sum, result) => sum + result.warnings.length, 0);
    const invalidCategories = results.filter(result => !result.isValid).length;

    let status: 'healthy' | 'warning' | 'error' | 'mixed';
    let score: number;

    if (totalIssues === 0 && totalWarnings === 0) {
      status = 'healthy';
      score = 100;
    } else if (invalidCategories > 1) {
      status = 'error';
      score = Math.max(0, 40 - (totalIssues * 10));
    } else if (invalidCategories === 1 || totalIssues > 0) {
      status = 'mixed';
      score = Math.max(20, 70 - (totalIssues * 15) - (totalWarnings * 5));
    } else {
      status = 'warning';
      score = Math.max(50, 85 - (totalWarnings * 3));
    }

    return { status, score };
  }

  /**
   * Generate system-wide recommendations
   */
  private generateSystemRecommendations(categories: SystemValidationReport['categories']): string[] {
    const recommendations: string[] = [];
    
    // Collect all category recommendations
    Object.values(categories).forEach(category => {
      recommendations.push(...category.recommendations);
    });

    // Add system-wide recommendations based on patterns
    const totalIssues = Object.values(categories).reduce((sum, cat) => sum + cat.issues.length, 0);
    const totalWarnings = Object.values(categories).reduce((sum, cat) => sum + cat.warnings.length, 0);

    if (totalIssues > 3) {
      recommendations.push('Consider implementing systematic error monitoring and alerting');
    }

    if (totalWarnings > 5) {
      recommendations.push('Review and prioritize warning resolution to prevent future issues');
    }

    // Remove duplicates and return
    return [...new Set(recommendations)];
  }

  /**
   * Add validation result to history
   */
  private addToHistory(result: ValidationResult): void {
    this.validationHistory.push(result);
    // Keep only last 50 results per category
    this.validationHistory = this.validationHistory.slice(-50);
  }

  /**
   * Get validation history for a specific category
   */
  getValidationHistory(category?: string, limit: number = 10): ValidationResult[] {
    let history = this.validationHistory;
    
    if (category) {
      history = history.filter(result => result.category === category);
    }
    
    return history.slice(-limit);
  }

  /**
   * Get health summary for quick status check
   */
  async getHealthSummary(): Promise<{ status: string; score: number; lastCheck: number; recommendations: string[] }> {
    try {
      const report = await this.validateSystem();
      return {
        status: report.overall.status,
        score: report.overall.score,
        lastCheck: report.overall.timestamp,
        recommendations: report.recommendations.slice(0, 3) // Top 3 recommendations
      };
    } catch (error) {
      return {
        status: 'error',
        score: 0,
        lastCheck: Date.now(),
        recommendations: ['System validation failed - check console for details']
      };
    }
  }

  /**
   * Quick validation for specific component
   */
  async validateComponent(component: 'audio' | 'network' | 'cache' | 'ui' | 'performance'): Promise<ValidationResult> {
    switch (component) {
      case 'audio':
        return this.validateAudioSystem();
      case 'network':
        return this.validateNetworkSystem();
      case 'cache':
        return this.validateCacheSystem();
      case 'ui':
        return this.validateUISystem();
      case 'performance':
        return this.validatePerformanceSystem();
      default:
        throw new Error(`Unknown component: ${component}`);
    }
  }
}

// Export singleton instance
export const unifiedSystemValidator = UnifiedSystemValidator.getInstance();

// Expose globally in debug mode for console access
if (typeof window !== 'undefined' && window.location.search.includes('debug=1')) {
  (window as any).unifiedSystemValidator = unifiedSystemValidator;
}

// Make available globally for debugging (only in debug mode)
if (typeof window !== 'undefined' && window.location.search.includes('debug=1')) {
  (window as any).unifiedSystemValidator = unifiedSystemValidator;
  console.log('🔧 Unified System Validator available globally as window.unifiedSystemValidator');
}
