interface TestAnalyticsData {
  timestamp: number;
  testSuiteId: string;
  testRunId: string;
  environment: string;
  version: string;
  overallResults: {
    successRate: number;
    totalTests: number;
    duration: number;
    categories: Record<string, CategoryAnalytics>;
  };
  performance: PerformanceAnalytics;
  trends: TrendAnalytics;
  insights: TestInsight[];
}

interface CategoryAnalytics {
  passed: number;
  failed: number;
  total: number;
  successRate: number;
  avgDuration: number;
  criticalFailures: number;
  trends: {
    successRateChange: number;
    durationChange: number;
    stabilityScore: number;
  };
}

interface PerformanceAnalytics {
  loadTesting: {
    maxConcurrentUsers: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
    bottlenecks: string[];
  };
  browserPerformance: {
    avgLoadTime: number;
    avgRenderTime: number;
    memoryUsage: number;
    compatibilityScore: number;
  };
  regressions: PerformanceRegression[];
}

interface TrendAnalytics {
  weeklyTrends: {
    successRates: number[];
    durations: number[];
    failurePatterns: Record<string, number>;
  };
  monthlyTrends: {
    stability: number;
    improvement: number;
    regression: number;
  };
  predictive: {
    nextWeekSuccessRate: number;
    riskFactors: string[];
    recommendations: string[];
  };
}

interface TestInsight {
  type: 'warning' | 'improvement' | 'regression' | 'achievement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  metrics: Record<string, number>;
}

interface PerformanceRegression {
  metric: string;
  previousValue: number;
  currentValue: number;
  changePercent: number;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  affectedTests: string[];
}

export class TestAnalyticsCollector {
  private analyticsData: TestAnalyticsData[] = [];
  private currentSession: Partial<TestAnalyticsData> = {};

  startAnalyticsSession(environment: string = 'development'): string {
    const testRunId = this.generateTestRunId();
    
    this.currentSession = {
      timestamp: Date.now(),
      testSuiteId: 'comprehensive-test-suite',
      testRunId,
      environment,
      version: this.getAppVersion(),
      overallResults: {
        successRate: 0,
        totalTests: 0,
        duration: 0,
        categories: {}
      },
      performance: {
        loadTesting: {
          maxConcurrentUsers: 0,
          avgResponseTime: 0,
          errorRate: 0,
          throughput: 0,
          bottlenecks: []
        },
        browserPerformance: {
          avgLoadTime: 0,
          avgRenderTime: 0,
          memoryUsage: 0,
          compatibilityScore: 0
        },
        regressions: []
      },
      trends: {
        weeklyTrends: {
          successRates: [],
          durations: [],
          failurePatterns: {}
        },
        monthlyTrends: {
          stability: 0,
          improvement: 0,
          regression: 0
        },
        predictive: {
          nextWeekSuccessRate: 0,
          riskFactors: [],
          recommendations: []
        }
      },
      insights: []
    };

    console.log(`📊 Analytics session started: ${testRunId}`);
    return testRunId;
  }

  collectTestResults(results: any): void {
    if (!this.currentSession.overallResults) return;

    // Update overall results
    this.currentSession.overallResults.successRate = (results.passed / results.total) * 100;
    this.currentSession.overallResults.totalTests = results.total;
    this.currentSession.overallResults.duration = results.duration;

    // Collect category analytics
    if (results.categories) {
      for (const [categoryName, categoryData] of Object.entries(results.categories as any)) {
        this.currentSession.overallResults.categories[categoryName] = this.analyzeCategoryData(categoryName, categoryData);
      }
    }

    // Generate insights
    this.generateInsights(results);
  }

  collectPerformanceData(performanceResults: any): void {
    if (!this.currentSession.performance) return;

    // Collect load testing data
    if (performanceResults.loadTesting) {
      const loadData = performanceResults.loadTesting;
      this.currentSession.performance.loadTesting = {
        maxConcurrentUsers: loadData.maxUsers || 0,
        avgResponseTime: loadData.avgResponseTime || 0,
        errorRate: loadData.errorRate || 0,
        throughput: loadData.throughput || 0,
        bottlenecks: loadData.bottlenecks || []
      };
    }

    // Collect browser performance data
    if (performanceResults.browserCompatibility) {
      const browserData = performanceResults.browserCompatibility;
      this.currentSession.performance.browserPerformance = {
        avgLoadTime: this.calculateAverage(browserData.details?.map((d: any) => d.performance?.loadTime) || []),
        avgRenderTime: this.calculateAverage(browserData.details?.map((d: any) => d.performance?.renderTime) || []),
        memoryUsage: this.calculateAverage(browserData.details?.map((d: any) => d.performance?.memoryUsage) || []),
        compatibilityScore: (browserData.passed / browserData.total) * 100
      };
    }

    // Detect performance regressions
    this.detectPerformanceRegressions();
  }

  analyzeTrends(): void {
    if (!this.currentSession.trends) return;

    const historicalData = this.getHistoricalData();
    
    // Analyze weekly trends
    this.currentSession.trends.weeklyTrends = this.analyzeWeeklyTrends(historicalData);
    
    // Analyze monthly trends
    this.currentSession.trends.monthlyTrends = this.analyzeMonthlyTrends(historicalData);
    
    // Generate predictive analytics
    this.currentSession.trends.predictive = this.generatePredictiveAnalytics(historicalData);
  }

  finishAnalyticsSession(): TestAnalyticsData {
    if (!this.currentSession.timestamp) {
      throw new Error('No active analytics session');
    }

    const completedSession = this.currentSession as TestAnalyticsData;
    this.analyticsData.push(completedSession);
    
    // Store in localStorage for persistence
    this.persistAnalyticsData(completedSession);
    
    console.log(`📊 Analytics session completed: ${completedSession.testRunId}`);
    return completedSession;
  }

  generateAnalyticsReport(): string {
    const latest = this.getLatestAnalytics();
    if (!latest) return "No analytics data available";

    let report = "# 📊 Test Analytics Report\n\n";

    // Executive Summary
    report += "## Executive Summary\n";
    report += `- **Overall Success Rate:** ${latest.overallResults.successRate.toFixed(1)}%\n`;
    report += `- **Total Tests:** ${latest.overallResults.totalTests}\n`;
    report += `- **Test Duration:** ${this.formatDuration(latest.overallResults.duration)}\n`;
    report += `- **Environment:** ${latest.environment}\n`;
    report += `- **Timestamp:** ${new Date(latest.timestamp).toLocaleString()}\n\n`;

    // Category Performance
    report += "## Category Performance\n";
    for (const [category, data] of Object.entries(latest.overallResults.categories)) {
      const trend = data.trends.successRateChange > 0 ? "📈" : 
                   data.trends.successRateChange < 0 ? "📉" : "➡️";
      report += `- **${category}:** ${data.successRate.toFixed(1)}% (${data.passed}/${data.total}) ${trend}\n`;
    }
    report += "\n";

    // Performance Insights
    report += "## Performance Insights\n";
    report += `- **Load Testing:** ${latest.performance.loadTesting.maxConcurrentUsers} max users, `;
    report += `${latest.performance.loadTesting.avgResponseTime}ms avg response\n`;
    report += `- **Browser Compatibility:** ${latest.performance.browserPerformance.compatibilityScore.toFixed(1)}% compatible\n`;
    report += `- **Performance Regressions:** ${latest.performance.regressions.length} detected\n\n`;

    // Key Insights
    report += "## Key Insights\n";
    const criticalInsights = latest.insights.filter(i => i.priority === 'critical' || i.priority === 'high');
    if (criticalInsights.length > 0) {
      criticalInsights.forEach(insight => {
        const icon = insight.type === 'warning' ? "⚠️" : 
                    insight.type === 'regression' ? "📉" : 
                    insight.type === 'improvement' ? "📈" : "🏆";
        report += `${icon} **${insight.title}**\n`;
        report += `   ${insight.description}\n`;
        report += `   *Recommendation: ${insight.recommendation}*\n\n`;
      });
    } else {
      report += "✅ No critical issues detected\n\n";
    }

    // Trends
    report += "## Trends & Predictions\n";
    report += `- **Predicted Next Week Success Rate:** ${latest.trends.predictive.nextWeekSuccessRate.toFixed(1)}%\n`;
    report += `- **Stability Score:** ${latest.trends.monthlyTrends.stability.toFixed(1)}/100\n`;
    if (latest.trends.predictive.riskFactors.length > 0) {
      report += `- **Risk Factors:** ${latest.trends.predictive.riskFactors.join(', ')}\n`;
    }
    report += "\n";

    // Recommendations
    report += "## Recommendations\n";
    const recommendations = latest.trends.predictive.recommendations;
    if (recommendations.length > 0) {
      recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    } else {
      report += "🎉 System is performing well - continue current practices\n";
    }

    return report;
  }

  exportAnalyticsData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportAsCSV();
    }
    return JSON.stringify(this.analyticsData, null, 2);
  }

  private analyzeCategoryData(categoryName: string, categoryData: any): CategoryAnalytics {
    const historical = this.getHistoricalCategoryData(categoryName);
    
    return {
      passed: categoryData.passed || 0,
      failed: categoryData.failed || 0,
      total: categoryData.total || 0,
      successRate: categoryData.total > 0 ? (categoryData.passed / categoryData.total) * 100 : 0,
      avgDuration: categoryData.avgDuration || 0,
      criticalFailures: this.countCriticalFailures(categoryData.details || []),
      trends: {
        successRateChange: this.calculateSuccessRateChange(historical),
        durationChange: this.calculateDurationChange(historical),
        stabilityScore: this.calculateStabilityScore(historical)
      }
    };
  }

  private generateInsights(results: any): void {
    const insights: TestInsight[] = [];

    // Success rate insights
    const successRate = (results.passed / results.total) * 100;
    if (successRate < 70) {
      insights.push({
        type: 'warning',
        priority: 'critical',
        category: 'Overall',
        title: 'Low Success Rate Detected',
        description: `Test success rate of ${successRate.toFixed(1)}% is below acceptable threshold`,
        impact: 'High risk of production issues',
        recommendation: 'Investigate failing tests and fix critical issues immediately',
        metrics: { successRate, threshold: 70 }
      });
    } else if (successRate > 95) {
      insights.push({
        type: 'achievement',
        priority: 'low',
        category: 'Overall',
        title: 'Excellent Test Performance',
        description: `Outstanding success rate of ${successRate.toFixed(1)}%`,
        impact: 'High confidence in system stability',
        recommendation: 'Maintain current quality practices',
        metrics: { successRate }
      });
    }

    // Duration insights
    if (results.duration > 300000) { // 5 minutes
      insights.push({
        type: 'warning',
        priority: 'medium',
        category: 'Performance',
        title: 'Long Test Duration',
        description: `Test suite took ${this.formatDuration(results.duration)} to complete`,
        impact: 'Slower feedback cycles',
        recommendation: 'Consider parallelizing tests or optimizing slow test cases',
        metrics: { duration: results.duration }
      });
    }

    // Category-specific insights
    if (results.categories) {
      for (const [categoryName, categoryData] of Object.entries(results.categories as any)) {
        this.generateCategoryInsights(categoryName, categoryData, insights);
      }
    }

    if (this.currentSession.insights) {
      this.currentSession.insights = insights;
    }
  }

  private generateCategoryInsights(categoryName: string, categoryData: any, insights: TestInsight[]): void {
    const successRate = (categoryData.passed / categoryData.total) * 100;
    
    if (successRate === 0 && categoryData.total > 0) {
      insights.push({
        type: 'regression',
        priority: 'critical',
        category: categoryName,
        title: `Complete ${categoryName} Failure`,
        description: `All ${categoryData.total} tests in ${categoryName} category failed`,
        impact: 'Category completely non-functional',
        recommendation: `Immediate investigation required for ${categoryName} functionality`,
        metrics: { successRate: 0, totalTests: categoryData.total }
      });
    } else if (successRate < 50 && categoryData.total > 0) {
      insights.push({
        type: 'warning',
        priority: 'high',
        category: categoryName,
        title: `${categoryName} Instability`,
        description: `${categoryName} success rate of ${successRate.toFixed(1)}% indicates instability`,
        impact: 'Significant functionality impairment',
        recommendation: `Focus testing and debugging efforts on ${categoryName}`,
        metrics: { successRate, totalTests: categoryData.total }
      });
    }
  }

  private detectPerformanceRegressions(): void {
    const historical = this.getHistoricalPerformanceData();
    const current = this.currentSession.performance;
    
    if (!current || historical.length === 0) return;

    const regressions: PerformanceRegression[] = [];

    // Check load testing regressions
    if (historical.some(h => h.loadTesting)) {
      const avgHistoricalResponseTime = this.calculateAverage(
        historical.map(h => h.loadTesting?.avgResponseTime || 0).filter(v => v > 0)
      );
      
      if (current.loadTesting.avgResponseTime > avgHistoricalResponseTime * 1.2) {
        regressions.push({
          metric: 'Average Response Time',
          previousValue: avgHistoricalResponseTime,
          currentValue: current.loadTesting.avgResponseTime,
          changePercent: ((current.loadTesting.avgResponseTime - avgHistoricalResponseTime) / avgHistoricalResponseTime) * 100,
          severity: current.loadTesting.avgResponseTime > avgHistoricalResponseTime * 1.5 ? 'major' : 'moderate',
          affectedTests: ['Load Testing']
        });
      }
    }

    // Check browser performance regressions
    if (historical.some(h => h.browserPerformance)) {
      const avgHistoricalLoadTime = this.calculateAverage(
        historical.map(h => h.browserPerformance?.avgLoadTime || 0).filter(v => v > 0)
      );
      
      if (current.browserPerformance.avgLoadTime > avgHistoricalLoadTime * 1.3) {
        regressions.push({
          metric: 'Browser Load Time',
          previousValue: avgHistoricalLoadTime,
          currentValue: current.browserPerformance.avgLoadTime,
          changePercent: ((current.browserPerformance.avgLoadTime - avgHistoricalLoadTime) / avgHistoricalLoadTime) * 100,
          severity: current.browserPerformance.avgLoadTime > avgHistoricalLoadTime * 1.5 ? 'major' : 'moderate',
          affectedTests: ['Browser Compatibility']
        });
      }
    }

    if (current.regressions) {
      current.regressions = regressions;
    }
  }

  private analyzeWeeklyTrends(historicalData: TestAnalyticsData[]) {
    const lastWeek = historicalData.filter(d => 
      Date.now() - d.timestamp < 7 * 24 * 60 * 60 * 1000
    );

    return {
      successRates: lastWeek.map(d => d.overallResults.successRate),
      durations: lastWeek.map(d => d.overallResults.duration),
      failurePatterns: this.analyzeFailurePatterns(lastWeek)
    };
  }

  private analyzeMonthlyTrends(historicalData: TestAnalyticsData[]) {
    const lastMonth = historicalData.filter(d => 
      Date.now() - d.timestamp < 30 * 24 * 60 * 60 * 1000
    );

    const stability = this.calculateStabilityScore(lastMonth);
    const improvement = this.calculateImprovementScore(lastMonth);
    const regression = this.calculateRegressionScore(lastMonth);

    return { stability, improvement, regression };
  }

  private generatePredictiveAnalytics(historicalData: TestAnalyticsData[]) {
    const recentData = historicalData.slice(-10); // Last 10 runs
    
    const avgSuccessRate = this.calculateAverage(recentData.map(d => d.overallResults.successRate));
    const trend = this.calculateTrend(recentData.map(d => d.overallResults.successRate));
    
    return {
      nextWeekSuccessRate: Math.max(0, Math.min(100, avgSuccessRate + trend)),
      riskFactors: this.identifyRiskFactors(recentData),
      recommendations: this.generateRecommendations(recentData)
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);
    
    return secondAvg - firstAvg;
  }

  private identifyRiskFactors(data: TestAnalyticsData[]): string[] {
    const riskFactors: string[] = [];
    
    const avgSuccessRate = this.calculateAverage(data.map(d => d.overallResults.successRate));
    if (avgSuccessRate < 80) {
      riskFactors.push('Low success rate trend');
    }
    
    const avgDuration = this.calculateAverage(data.map(d => d.overallResults.duration));
    if (avgDuration > 300000) {
      riskFactors.push('Increasing test duration');
    }
    
    const regressionsCount = data.reduce((sum, d) => sum + d.performance.regressions.length, 0);
    if (regressionsCount > 3) {
      riskFactors.push('Multiple performance regressions');
    }
    
    return riskFactors;
  }

  private generateRecommendations(data: TestAnalyticsData[]): string[] {
    const recommendations: string[] = [];
    
    const avgSuccessRate = this.calculateAverage(data.map(d => d.overallResults.successRate));
    if (avgSuccessRate < 85) {
      recommendations.push('Focus on stabilizing failing tests');
    }
    
    const avgDuration = this.calculateAverage(data.map(d => d.overallResults.duration));
    if (avgDuration > 240000) {
      recommendations.push('Optimize test execution time');
    }
    
    const hasPerformanceIssues = data.some(d => d.performance.regressions.length > 0);
    if (hasPerformanceIssues) {
      recommendations.push('Address performance regressions');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue current quality practices');
    }
    
    return recommendations;
  }

  private getHistoricalData(): TestAnalyticsData[] {
    return this.analyticsData.slice(-30); // Last 30 runs
  }

  private getHistoricalCategoryData(categoryName: string): any[] {
    return this.analyticsData
      .map(d => d.overallResults.categories[categoryName])
      .filter(Boolean)
      .slice(-10);
  }

  private getHistoricalPerformanceData(): PerformanceAnalytics[] {
    return this.analyticsData
      .map(d => d.performance)
      .filter(Boolean)
      .slice(-10);
  }

  private getLatestAnalytics(): TestAnalyticsData | null {
    return this.analyticsData.length > 0 ? this.analyticsData[this.analyticsData.length - 1] : null;
  }

  private countCriticalFailures(details: any[]): number {
    return details.filter(d => 
      d.severity === 'critical' || 
      d.impact === 'critical' || 
      d.priority === 'critical'
    ).length;
  }

  private calculateSuccessRateChange(historical: any[]): number {
    if (historical.length < 2) return 0;
    const recent = historical.slice(-2);
    return recent[1].successRate - recent[0].successRate;
  }

  private calculateDurationChange(historical: any[]): number {
    if (historical.length < 2) return 0;
    const recent = historical.slice(-2);
    return recent[1].avgDuration - recent[0].avgDuration;
  }

  private calculateStabilityScore(data: any[]): number {
    if (data.length < 3) return 100;
    
    const values = data.map(d => d.overallResults?.successRate || d.successRate || 0);
    const variance = this.calculateVariance(values);
    
    return Math.max(0, 100 - variance);
  }

  private calculateImprovementScore(data: TestAnalyticsData[]): number {
    if (data.length < 2) return 0;
    
    const trend = this.calculateTrend(data.map(d => d.overallResults.successRate));
    return Math.max(0, trend);
  }

  private calculateRegressionScore(data: TestAnalyticsData[]): number {
    if (data.length < 2) return 0;
    
    const trend = this.calculateTrend(data.map(d => d.overallResults.successRate));
    return Math.max(0, -trend);
  }

  private calculateVariance(values: number[]): number {
    const mean = this.calculateAverage(values);
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return this.calculateAverage(squaredDiffs);
  }

  private analyzeFailurePatterns(data: TestAnalyticsData[]): Record<string, number> {
    const patterns: Record<string, number> = {};
    
    for (const run of data) {
      for (const [category, categoryData] of Object.entries(run.overallResults.categories)) {
        if (categoryData.failed > 0) {
          patterns[category] = (patterns[category] || 0) + categoryData.failed;
        }
      }
    }
    
    return patterns;
  }

  private generateTestRunId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAppVersion(): string {
    return '1.0.0'; // Would get from package.json in real implementation
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  private persistAnalyticsData(data: TestAnalyticsData): void {
    try {
      const existingData = localStorage.getItem('test-analytics');
      const analytics = existingData ? JSON.parse(existingData) : [];
      
      analytics.push(data);
      
      // Keep only last 100 entries
      if (analytics.length > 100) {
        analytics.splice(0, analytics.length - 100);
      }
      
      localStorage.setItem('test-analytics', JSON.stringify(analytics));
    } catch (error) {
      console.warn('Failed to persist analytics data:', error);
    }
  }

  private exportAsCSV(): string {
    const headers = [
      'Timestamp', 'TestRunId', 'Environment', 'SuccessRate', 'TotalTests', 
      'Duration', 'LoadTestUsers', 'AvgResponseTime', 'BrowserCompatibility'
    ];
    
    const rows = this.analyticsData.map(data => [
      new Date(data.timestamp).toISOString(),
      data.testRunId,
      data.environment,
      data.overallResults.successRate.toFixed(1),
      data.overallResults.totalTests,
      data.overallResults.duration,
      data.performance.loadTesting.maxConcurrentUsers,
      data.performance.loadTesting.avgResponseTime,
      data.performance.browserPerformance.compatibilityScore.toFixed(1)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
