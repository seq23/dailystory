// Performance-Optimized Test Suite Manager
import type { TestSuiteResult } from '../ComprehensiveTestSuite';

export interface PerformanceOptimizedTestConfig {
  maxExecutionTime: number;
  enableCaching: boolean;
  useIdleCallback: boolean;
  batchSize: number;
  prioritizeQuickWins: boolean;
  summaryOnly: boolean;
}

export class PerformanceOptimizedTestSuite {
  private static readonly DEFAULT_CONFIG: PerformanceOptimizedTestConfig = {
    maxExecutionTime: 5000, // 5 seconds max
    enableCaching: true,
    useIdleCallback: true,
    batchSize: 10,
    prioritizeQuickWins: true,
    summaryOnly: true
  };

  private static cache = new Map<string, any>();
  private static performanceMetrics = {
    totalExecutionTime: 0,
    testsRun: 0,
    cacheHits: 0,
    memoryUsage: 0
  };

  static async runOptimizedTestSuite(config: Partial<PerformanceOptimizedTestConfig> = {}): Promise<{
    summary: string;
    detailedResults?: TestSuiteResult;
    performanceMetrics: typeof PerformanceOptimizedTestSuite.performanceMetrics;
  }> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();
    let memoryBefore = 0;

    // Memory measurement if available
    if ('memory' in performance) {
      memoryBefore = (performance as any).memory.usedJSHeapSize;
    }

    try {
      // Run high-priority tests first
      const priorityTests = await this.runPriorityTests(finalConfig);
      
      // Generate compact summary
      const summary = this.generateCompactSummary(priorityTests);
      
      // Update performance metrics
      const executionTime = performance.now() - startTime;
      this.performanceMetrics.totalExecutionTime = executionTime;
      this.performanceMetrics.testsRun = priorityTests.length;
      this.performanceMetrics.cacheHits = this.cache.size;
      
      if ('memory' in performance) {
        this.performanceMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize - memoryBefore;
      }

      // Log ultra-compact console output
      console.log(`🚀 Tests: ${summary} (${executionTime.toFixed(1)}ms)`);

      return {
        summary,
        detailedResults: finalConfig.summaryOnly ? undefined : await this.getDetailedResults(),
        performanceMetrics: this.performanceMetrics
      };

    } catch (error) {
      console.error('❌ Optimized test suite failed:', error);
      return {
        summary: '❌ Test suite failed',
        performanceMetrics: this.performanceMetrics
      };
    }
  }

  private static async runPriorityTests(config: PerformanceOptimizedTestConfig) {
    const tests = [
      {
        name: 'Mobile',
        priority: 1,
        runner: () => this.runMobileTestsOptimized(),
        quickWin: true
      },
      {
        name: 'Accessibility',
        priority: 1,
        runner: () => this.runAccessibilityTestsOptimized(),
        quickWin: true
      },
      {
        name: 'I18n',
        priority: 2,
        runner: () => this.runI18nTestsOptimized(),
        quickWin: false
      },
      {
        name: 'Forms',
        priority: 2,
        runner: () => this.runFormTestsOptimized(),
        quickWin: true
      }
    ];

    // Sort by priority and quick wins if enabled
    const sortedTests = tests.sort((a, b) => {
      if (config.prioritizeQuickWins) {
        if (a.quickWin && !b.quickWin) return -1;
        if (!a.quickWin && b.quickWin) return 1;
      }
      return a.priority - b.priority;
    });

    const results = [];
    const timeLimit = Date.now() + config.maxExecutionTime;

    for (const test of sortedTests) {
      if (Date.now() > timeLimit) {
        console.warn(`⏱️ Time limit reached, skipping ${test.name} test`);
        break;
      }

      try {
        const result = await this.runWithTimeout(test.runner, 1000); // 1s per test max
        results.push({ name: test.name, ...result });
      } catch (error) {
        results.push({ 
          name: test.name, 
          score: 0, 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  private static async runWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), timeout)
      )
    ]);
  }

  private static async runMobileTestsOptimized() {
    const cacheKey = 'mobile-optimized';
    if (this.cache.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      return this.cache.get(cacheKey);
    }

    try {
      const { PerformanceOptimizedMobileInteractionTester } = await import('./PerformanceOptimizedMobileInteractionTester');
      const result = await PerformanceOptimizedMobileInteractionTester.runAsyncTestSuite();
      
      const testResult = {
        score: result.overallScore,
        status: result.overallScore >= 80 ? 'passed' : 'failed',
        criticalIssues: result.criticalIssues.length,
        executionTime: result.performanceMetrics?.totalExecutionTime || 0
      };

      this.cache.set(cacheKey, testResult);
      return testResult;
    } catch (error) {
      return { score: 0, status: 'error', criticalIssues: 1, executionTime: 0 };
    }
  }

  private static async runAccessibilityTestsOptimized() {
    const cacheKey = 'accessibility-optimized';
    if (this.cache.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      return this.cache.get(cacheKey);
    }

    try {
      const { EnhancedAccessibilityTester } = await import('./EnhancedAccessibilityTester');
      const result = await EnhancedAccessibilityTester.runAccessibilityTests('AA');
      
      const testResult = {
        score: result.overallScore,
        status: result.overallScore >= 85 ? 'passed' : 'failed',
        criticalIssues: result.criticalIssues.length,
        executionTime: result.performanceMetrics?.executionTime || 0
      };

      this.cache.set(cacheKey, testResult);
      return testResult;
    } catch (error) {
      return { score: 0, status: 'error', criticalIssues: 1, executionTime: 0 };
    }
  }

  private static async runI18nTestsOptimized() {
    const cacheKey = 'i18n-optimized';
    if (this.cache.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      return this.cache.get(cacheKey);
    }

    try {
      const { SmartInternationalizationTester } = await import('./SmartInternationalizationTester');
      const result = await SmartInternationalizationTester.runInternationalizationTests();
      
      const testResult = {
        score: result.score,
        status: result.score >= 75 ? 'passed' : 'failed',
        criticalIssues: result.criticalIssues.length,
        executionTime: result.performanceMetrics?.executionTime || 0
      };

      this.cache.set(cacheKey, testResult);
      return testResult;
    } catch (error) {
      return { score: 0, status: 'error', criticalIssues: 1, executionTime: 0 };
    }
  }

  private static async runFormTestsOptimized() {
    const cacheKey = 'forms-optimized';
    if (this.cache.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      return this.cache.get(cacheKey);
    }

    try {
      const { OptimizedUserInfoFormTester } = await import('./OptimizedUserInfoFormTester');
      const result = await OptimizedUserInfoFormTester.runUserInfoFormTests();
      
      const testResult = {
        score: result.score,
        status: result.score >= 70 ? 'passed' : 'failed',
        criticalIssues: result.issues.filter(i => i.severity === 'critical').length,
        executionTime: result.performanceMetrics?.executionTime || 0
      };

      this.cache.set(cacheKey, testResult);
      return testResult;
    } catch (error) {
      return { score: 0, status: 'error', criticalIssues: 1, executionTime: 0 };
    }
  }

  private static generateCompactSummary(results: any[]): string {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const errors = results.filter(r => r.status === 'error').length;
    const totalCritical = results.reduce((sum, r) => sum + (r.criticalIssues || 0), 0);
    
    let summary = `${passed}✅`;
    
    if (failed > 0) summary += ` ${failed}❌`;
    if (errors > 0) summary += ` ${errors}🔥`;
    if (totalCritical > 0) summary += ` ⚠️${totalCritical}`;

    // Add specific scores for failed tests
    const failedTests = results.filter(r => r.status === 'failed' || r.status === 'error');
    if (failedTests.length > 0 && failedTests.length <= 2) {
      const failedScores = failedTests.map(t => `${t.name}:${t.score || 0}%`).join(' ');
      summary += ` (${failedScores})`;
    }

    return summary;
  }

  private static async getDetailedResults(): Promise<TestSuiteResult | undefined> {
    // This would run the full comprehensive test suite if detailed results are needed
    // For now, return undefined to maintain performance
    return undefined;
  }

  // Utility method to clear cache if needed
  static clearCache(): void {
    this.cache.clear();
    console.log('🧹 Test cache cleared');
  }

  // Method to get performance insights
  static getPerformanceInsights(): string {
    const { totalExecutionTime, testsRun, cacheHits, memoryUsage } = this.performanceMetrics;
    
    let insights = `⚡ Performance: ${totalExecutionTime.toFixed(1)}ms`;
    
    if (testsRun > 0) {
      insights += ` (${(totalExecutionTime / testsRun).toFixed(1)}ms/test)`;
    }
    
    if (cacheHits > 0) {
      insights += ` 💾${cacheHits} cached`;
    }
    
    if (memoryUsage > 0) {
      const memoryMB = memoryUsage / (1024 * 1024);
      if (memoryMB > 1) {
        insights += ` 🧠${memoryMB.toFixed(1)}MB`;
      }
    }
    
    return insights;
  }
}