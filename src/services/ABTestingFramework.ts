/**
 * A/B Testing Framework for Prompt Strategies
 * Phase 7: Testing & Validation Framework Implementation
 */

import { DebugLogger } from '@/services/DebugLogger';

interface TestVariant {
  id: string;
  name: string;
  description: string;
  promptModifications: {
    culturalEnhancement?: string;
    qualityParameters?: Record<string, any>;
    negativePromptChanges?: string;
    styleFrameworkOverrides?: Record<string, any>;
  };
  weight: number; // 0-100, percentage of traffic
  isActive: boolean;
}

interface TestResult {
  variantId: string;
  userId: string;
  sessionId: string;
  generationTime: number;
  biasScore: number;
  qualityScore: number;
  userFeedback?: 'positive' | 'negative' | 'neutral';
  culturalAccuracy: number;
  timestamp: number;
  metadata: {
    culturalProfile: string;
    difficultyLevel: string;
    generationAttempt: number;
  };
}

interface TestConfig {
  id: string;
  name: string;
  description: string;
  variants: TestVariant[];
  targetMetric: 'bias_score' | 'quality_score' | 'generation_time' | 'user_satisfaction';
  minimumSampleSize: number;
  significanceLevel: number; // 0.05 for 95% confidence
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

interface StatisticalResult {
  isSignificant: boolean;
  pValue: number;
  confidenceLevel: number;
  winningVariant?: string;
  improvementPercentage: number;
  recommendation: string;
}

export class ABTestingFramework {
  private activeTests = new Map<string, TestConfig>();
  private testResults: TestResult[] = [];
  private readonly MAX_RESULTS = 10000; // Keep last 10k results

  /**
   * Phase 7.1: Create A/B Test for Prompt Strategies
   */
  createTest(config: Omit<TestConfig, 'id'>): string {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate test configuration
    this.validateTestConfig(config);
    
    const fullConfig: TestConfig = {
      ...config,
      id: testId
    };
    
    this.activeTests.set(testId, fullConfig);
    
    DebugLogger.log('performance', `Created A/B test: ${config.name} (${testId})`);
    return testId;
  }

  /**
   * Get assigned variant for user/session
   */
  getVariantForUser(testId: string, userId: string, sessionId: string): TestVariant | null {
    const test = this.activeTests.get(testId);
    if (!test || !test.isActive) return null;
    
    // Use deterministic assignment based on user+session for consistency
    const hash = this.hashUserSession(userId, sessionId, testId);
    const assignment = hash % 100;
    
    let cumulative = 0;
    for (const variant of test.variants) {
      if (!variant.isActive) continue;
      
      cumulative += variant.weight;
      if (assignment < cumulative) {
        DebugLogger.log('performance', `User ${userId} assigned to variant ${variant.id} for test ${testId}`);
        return variant;
      }
    }
    
    // Fallback to control variant
    return test.variants.find(v => v.isActive) || null;
  }

  /**
   * Record test result for analysis
   */
  recordResult(result: Omit<TestResult, 'timestamp'>): void {
    const fullResult: TestResult = {
      ...result,
      timestamp: Date.now()
    };
    
    this.testResults.push(fullResult);
    
    // Trim old results to maintain performance
    if (this.testResults.length > this.MAX_RESULTS) {
      this.testResults = this.testResults.slice(-this.MAX_RESULTS);
    }
    
    DebugLogger.log('performance', `Recorded test result for variant ${result.variantId}`);
  }

  /**
   * Phase 7.2: Statistical Analysis of Test Results
   */
  analyzeTest(testId: string): {
    status: 'running' | 'complete' | 'insufficient_data';
    variants: Array<{
      id: string;
      name: string;
      sampleSize: number;
      metrics: {
        avgBiasScore: number;
        avgQualityScore: number;
        avgGenerationTime: number;
        userSatisfaction: number;
      };
    }>;
    statisticalResult: StatisticalResult;
    recommendation: string;
  } {
    const test = this.activeTests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    // Get results for this test
    const testResults = this.testResults.filter(r => 
      test.variants.some(v => v.id === r.variantId)
    );

    // Calculate metrics per variant
    const variantAnalysis = test.variants.map(variant => {
      const variantResults = testResults.filter(r => r.variantId === variant.id);
      
      return {
        id: variant.id,
        name: variant.name,
        sampleSize: variantResults.length,
        metrics: this.calculateVariantMetrics(variantResults)
      };
    });

    // Perform statistical significance test
    const statisticalResult = this.performSignificanceTest(
      variantAnalysis,
      test.targetMetric,
      test.significanceLevel
    );

    // Determine test status
    const minSampleReached = variantAnalysis.every(v => 
      v.sampleSize >= test.minimumSampleSize
    );
    
    const isExpired = test.endDate && test.endDate < new Date();
    
    let status: 'running' | 'complete' | 'insufficient_data' = 'running';
    if (!minSampleReached) {
      status = 'insufficient_data';
    } else if (statisticalResult.isSignificant || isExpired) {
      status = 'complete';
    }

    return {
      status,
      variants: variantAnalysis,
      statisticalResult,
      recommendation: this.generateRecommendation(statisticalResult, variantAnalysis, test.targetMetric)
    };
  }

  /**
   * Phase 7.3: User Feedback Collection Integration
   */
  recordUserFeedback(
    sessionId: string, 
    feedback: 'positive' | 'negative' | 'neutral',
    culturalAccuracy?: number
  ): void {
    // Find the most recent result for this session
    const recentResult = this.testResults
      .filter(r => r.sessionId === sessionId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (recentResult) {
      recentResult.userFeedback = feedback;
      if (culturalAccuracy !== undefined) {
        recentResult.culturalAccuracy = culturalAccuracy;
      }
      
      DebugLogger.log('performance', `Recorded user feedback: ${feedback} for session ${sessionId}`);
    }
  }

  /**
   * Get all active tests
   */
  getActiveTests(): TestConfig[] {
    return Array.from(this.activeTests.values()).filter(test => test.isActive);
  }

  /**
   * Deactivate test
   */
  deactivateTest(testId: string): void {
    const test = this.activeTests.get(testId);
    if (test) {
      test.isActive = false;
      DebugLogger.log('performance', `Deactivated test: ${test.name}`);
    }
  }

  // Private helper methods

  private validateTestConfig(config: Omit<TestConfig, 'id'>): void {
    if (config.variants.length < 2) {
      throw new Error('Test must have at least 2 variants');
    }
    
    const totalWeight = config.variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.1) {
      throw new Error('Variant weights must sum to 100');
    }
    
    if (config.minimumSampleSize < 10) {
      throw new Error('Minimum sample size must be at least 10');
    }
  }

  private hashUserSession(userId: string, sessionId: string, testId: string): number {
    const input = `${userId}-${sessionId}-${testId}`;
    let hash = 0;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
  }

  private calculateVariantMetrics(results: TestResult[]): {
    avgBiasScore: number;
    avgQualityScore: number;
    avgGenerationTime: number;
    userSatisfaction: number;
  } {
    if (results.length === 0) {
      return {
        avgBiasScore: 0,
        avgQualityScore: 0,
        avgGenerationTime: 0,
        userSatisfaction: 0
      };
    }

    const feedbackToScore = (feedback: string | undefined): number => {
      switch (feedback) {
        case 'positive': return 1;
        case 'neutral': return 0.5;
        case 'negative': return 0;
        default: return 0.5; // No feedback counts as neutral
      }
    };

    return {
      avgBiasScore: results.reduce((sum, r) => sum + r.biasScore, 0) / results.length,
      avgQualityScore: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length,
      avgGenerationTime: results.reduce((sum, r) => sum + r.generationTime, 0) / results.length,
      userSatisfaction: results.reduce((sum, r) => sum + feedbackToScore(r.userFeedback), 0) / results.length
    };
  }

  private performSignificanceTest(
    variants: any[],
    targetMetric: string,
    significanceLevel: number
  ): StatisticalResult {
    if (variants.length !== 2) {
      // For simplicity, only handle 2-variant tests for now
      return {
        isSignificant: false,
        pValue: 1.0,
        confidenceLevel: 0,
        improvementPercentage: 0,
        recommendation: 'Multi-variant testing requires advanced statistical analysis'
      };
    }

    const [control, treatment] = variants;
    const metricKey = this.getMetricKey(targetMetric);
    
    const controlValue = control.metrics[metricKey];
    const treatmentValue = treatment.metrics[metricKey];
    
    // Simplified t-test approximation
    const pooledStdDev = this.estimateStandardDeviation(control.sampleSize, treatment.sampleSize);
    const standardError = pooledStdDev * Math.sqrt(1/control.sampleSize + 1/treatment.sampleSize);
    
    const tStatistic = Math.abs(treatmentValue - controlValue) / standardError;
    const degreesOfFreedom = control.sampleSize + treatment.sampleSize - 2;
    
    // Simplified p-value calculation (this would use t-distribution in production)
    const pValue = this.approximatePValue(tStatistic, degreesOfFreedom);
    
    const isSignificant = pValue < significanceLevel;
    const improvementPercentage = ((treatmentValue - controlValue) / controlValue) * 100;
    
    return {
      isSignificant,
      pValue,
      confidenceLevel: (1 - significanceLevel) * 100,
      winningVariant: treatmentValue > controlValue ? treatment.id : control.id,
      improvementPercentage: Math.abs(improvementPercentage),
      recommendation: isSignificant ? 
        `${treatmentValue > controlValue ? 'Treatment' : 'Control'} variant shows significant improvement` :
        'No significant difference detected, continue testing'
    };
  }

  private getMetricKey(targetMetric: string): string {
    const mapping: Record<string, string> = {
      'bias_score': 'avgBiasScore',
      'quality_score': 'avgQualityScore',
      'generation_time': 'avgGenerationTime',
      'user_satisfaction': 'userSatisfaction'
    };
    
    return mapping[targetMetric] || 'avgQualityScore';
  }

  private estimateStandardDeviation(n1: number, n2: number): number {
    // Rough estimation based on sample sizes
    // In production, this would be calculated from actual data variance
    return Math.sqrt((n1 + n2) / 2) * 0.1;
  }

  private approximatePValue(tStatistic: number, degreesOfFreedom: number): number {
    // Simplified p-value approximation
    // In production, this would use proper t-distribution calculation
    if (tStatistic < 1.96) return 0.1;
    if (tStatistic < 2.58) return 0.01;
    return 0.001;
  }

  private generateRecommendation(
    result: StatisticalResult,
    variants: any[],
    targetMetric: string
  ): string {
    if (!result.isSignificant) {
      return `Continue testing - need more data to detect significant differences in ${targetMetric}`;
    }
    
    const winner = variants.find(v => v.id === result.winningVariant);
    return `Implement ${winner?.name || 'winning variant'} - shows ${result.improvementPercentage.toFixed(1)}% improvement in ${targetMetric}`;
  }
}

// Global instance for consistent A/B testing
export const abTestingFramework = new ABTestingFramework();

// Predefined test templates for common scenarios
export const TEST_TEMPLATES = {
  CULTURAL_ENHANCEMENT: {
    name: 'Cultural Enhancement Comparison',
    description: 'Test enhanced cultural descriptions vs baseline',
    variants: [
      {
        id: 'control',
        name: 'Standard Cultural Prompts',
        description: 'Current cultural enhancement system',
        promptModifications: {},
        weight: 50,
        isActive: true
      },
      {
        id: 'enhanced',
        name: 'Enhanced Cultural Prompts',
        description: 'More detailed cultural descriptions',
        promptModifications: {
          culturalEnhancement: 'Add 50% more cultural detail and context'
        },
        weight: 50,
        isActive: true
      }
    ],
    targetMetric: 'bias_score' as const,
    minimumSampleSize: 100,
    significanceLevel: 0.05
  },
  
  QUALITY_OPTIMIZATION: {
    name: 'Quality Parameter Optimization',
    description: 'Test different quality settings for generation',
    variants: [
      {
        id: 'standard',
        name: 'Standard Quality',
        description: 'Current quality parameters',
        promptModifications: {},
        weight: 50,
        isActive: true
      },
      {
        id: 'high_quality',
        name: 'High Quality',
        description: 'Increased steps and CFG scale',
        promptModifications: {
          qualityParameters: { steps: 16, cfgScale: 5.0 }
        },
        weight: 50,
        isActive: true
      }
    ],
    targetMetric: 'quality_score' as const,
    minimumSampleSize: 75,
    significanceLevel: 0.05
  }
};