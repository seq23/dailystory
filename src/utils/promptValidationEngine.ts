// Phase 4: Validation & Error Handling System
// Pre-generation validation, fallback mechanisms, and monitoring

import type { UserInfo, DifficultyLevel } from '@/types';
import { PromptLengthManager } from './promptLengthManager';
import { AdvancedContentPrioritizer, type UserOptimizationPreference } from './advancedContentPrioritizer';

export interface ValidationResult {
  isValid: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  issues: ValidationIssue[];
  recommendations: string[];
  fallbackSuggested: boolean;
  estimatedLength: number;
}

export interface ValidationIssue {
  type: 'length' | 'complexity' | 'content' | 'compatibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
  autoFixAvailable: boolean;
}

export interface PromptValidationConfig {
  maxLength: number;
  warnLength: number;
  complexityThreshold: number;
  enableFallback: boolean;
  allowAutoOptimization: boolean;
}

export interface GenerationMonitoringData {
  promptLength: number;
  optimizationApplied: boolean;
  strategy: string;
  fallbackUsed: boolean;
  generationTime: number;
  success: boolean;
  errorType?: string;
  timestamp: Date;
}

export class PromptValidationEngine {
  private static readonly DEFAULT_CONFIG: PromptValidationConfig = {
    maxLength: 2800,
    warnLength: 2500,
    complexityThreshold: 0.8,
    enableFallback: true,
    allowAutoOptimization: true
  };

  private static monitoringData: GenerationMonitoringData[] = [];
  
  /**
   * Pre-generation validation with comprehensive analysis
   */
  static validatePromptBeforeGeneration(
    promptText: string,
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel,
    config: Partial<PromptValidationConfig> = {}
  ): ValidationResult {
    const validationConfig = { ...this.DEFAULT_CONFIG, ...config };
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    
    console.log(`🔍 Pre-validation analysis for ${promptText.length}-char prompt`);
    
    // Length validation
    const lengthValidation = this.validatePromptLength(promptText, validationConfig);
    if (lengthValidation.issues.length > 0) {
      issues.push(...lengthValidation.issues);
      recommendations.push(...lengthValidation.recommendations);
    }
    
    // Content complexity validation
    const complexityValidation = this.validateContentComplexity(promptText, userInfo, difficultyLevel, validationConfig);
    if (complexityValidation.issues.length > 0) {
      issues.push(...complexityValidation.issues);
      recommendations.push(...complexityValidation.recommendations);
    }
    
    // Content appropriateness validation
    const contentValidation = this.validateContentAppropriateness(promptText, difficultyLevel);
    if (contentValidation.issues.length > 0) {
      issues.push(...contentValidation.issues);
      recommendations.push(...contentValidation.recommendations);
    }
    
    // API compatibility validation
    const compatibilityValidation = this.validateAPICompatibility(promptText);
    if (compatibilityValidation.issues.length > 0) {
      issues.push(...compatibilityValidation.issues);
      recommendations.push(...compatibilityValidation.recommendations);
    }
    
    // Determine overall severity and fallback suggestion
    const severity = this.determineSeverity(issues);
    const fallbackSuggested = this.shouldSuggestFallback(issues, validationConfig);
    
    const result: ValidationResult = {
      isValid: severity !== 'critical' && severity !== 'error',
      severity,
      issues,
      recommendations: this.deduplicateRecommendations(recommendations),
      fallbackSuggested,
      estimatedLength: promptText.length
    };
    
    console.log(`✅ Pre-validation complete: ${result.isValid ? 'VALID' : 'INVALID'} (${severity})`);
    if (result.issues.length > 0) {
      console.log(`⚠️ Found ${result.issues.length} issues:`, result.issues.map(i => i.type));
    }
    
    return result;
  }
  
  /**
   * Automatic fallback system with intelligent decision making
   */
  static async generateWithFallback(
    storyText: string,
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel,
    userPreferences?: Partial<UserOptimizationPreference>
  ): Promise<{
    success: boolean;
    result?: any;
    fallbackUsed: boolean;
    strategy: string;
    error?: string;
    validationResult: ValidationResult;
    monitoringId: string;
  }> {
    
    const monitoringId = crypto.randomUUID();
    const startTime = Date.now();
    
    try {
      // Step 1: Try AI-enhanced generation with validation
      console.log(`🚀 Attempting AI-enhanced generation...`);
      
      const aiEnhancedResult = await this.tryAIEnhancedGeneration(
        storyText, userInfo, difficultyLevel, userPreferences
      );
      
      if (aiEnhancedResult.success) {
        this.recordMonitoring(monitoringId, {
          promptLength: aiEnhancedResult.promptLength,
          optimizationApplied: aiEnhancedResult.optimizationApplied,
          strategy: 'ai-enhanced',
          fallbackUsed: false,
          generationTime: Date.now() - startTime,
          success: true,
          timestamp: new Date()
        });
        
        return {
          success: true,
          result: aiEnhancedResult.result,
          fallbackUsed: false,
          strategy: 'ai-enhanced',
          validationResult: aiEnhancedResult.validationResult,
          monitoringId
        };
      }
      
      // Step 2: Try optimized AI generation
      console.log(`🔄 AI-enhanced failed, trying optimized AI generation...`);
      
      const optimizedAIResult = await this.tryOptimizedAIGeneration(
        storyText, userInfo, difficultyLevel, userPreferences
      );
      
      if (optimizedAIResult.success) {
        this.recordMonitoring(monitoringId, {
          promptLength: optimizedAIResult.promptLength,
          optimizationApplied: true,
          strategy: 'optimized-ai',
          fallbackUsed: true,
          generationTime: Date.now() - startTime,
          success: true,
          timestamp: new Date()
        });
        
        return {
          success: true,
          result: optimizedAIResult.result,
          fallbackUsed: true,
          strategy: 'optimized-ai',
          validationResult: optimizedAIResult.validationResult,
          monitoringId
        };
      }
      
      // Step 3: Fallback to simple system
      console.log(`🔄 Optimized AI failed, falling back to simple system...`);
      
      const simpleResult = await this.trySimpleGeneration(
        storyText, userInfo, difficultyLevel
      );
      
      this.recordMonitoring(monitoringId, {
        promptLength: simpleResult.promptLength,
        optimizationApplied: false,
        strategy: 'simple-fallback',
        fallbackUsed: true,
        generationTime: Date.now() - startTime,
        success: simpleResult.success,
        errorType: simpleResult.success ? undefined : 'fallback-failed',
        timestamp: new Date()
      });
      
      return {
        success: simpleResult.success,
        result: simpleResult.result,
        fallbackUsed: true,
        strategy: 'simple-fallback',
        error: simpleResult.error,
        validationResult: simpleResult.validationResult,
        monitoringId
      };
      
    } catch (error) {
      console.error(`❌ Generation completely failed:`, error);
      
      this.recordMonitoring(monitoringId, {
        promptLength: 0,
        optimizationApplied: false,
        strategy: 'failed',
        fallbackUsed: false,
        generationTime: Date.now() - startTime,
        success: false,
        errorType: 'complete-failure',
        timestamp: new Date()
      });
      
      return {
        success: false,
        fallbackUsed: false,
        strategy: 'failed',
        error: error.message,
        validationResult: {
          isValid: false,
          severity: 'critical',
          issues: [{
            type: 'compatibility',
            severity: 'critical',
            message: 'Complete generation failure',
            suggestion: 'Try again or contact support',
            autoFixAvailable: false
          }],
          recommendations: ['Try refreshing the page', 'Check your internet connection'],
          fallbackSuggested: false,
          estimatedLength: 0
        },
        monitoringId
      };
    }
  }
  
  /**
   * Real-time monitoring dashboard data
   */
  static getMonitoringDashboard(): {
    recentGenerations: GenerationMonitoringData[];
    statistics: {
      totalGenerations: number;
      successRate: number;
      averagePromptLength: number;
      fallbackRate: number;
      averageGenerationTime: number;
      commonErrorTypes: Record<string, number>;
      strategyDistribution: Record<string, number>;
    };
    trends: {
      promptLengthTrend: number[];
      successRateTrend: number[];
      fallbackRateTrend: number[];
    };
  } {
    const recent = this.monitoringData.slice(-50); // Last 50 generations
    const last24h = this.monitoringData.filter(d => 
      Date.now() - d.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    
    const statistics = {
      totalGenerations: this.monitoringData.length,
      successRate: last24h.length > 0 ? last24h.filter(d => d.success).length / last24h.length : 0,
      averagePromptLength: last24h.length > 0 ? last24h.reduce((sum, d) => sum + d.promptLength, 0) / last24h.length : 0,
      fallbackRate: last24h.length > 0 ? last24h.filter(d => d.fallbackUsed).length / last24h.length : 0,
      averageGenerationTime: last24h.length > 0 ? last24h.reduce((sum, d) => sum + d.generationTime, 0) / last24h.length : 0,
      commonErrorTypes: this.aggregateErrorTypes(last24h),
      strategyDistribution: this.aggregateStrategies(last24h)
    };
    
    const trends = {
      promptLengthTrend: this.calculateTrend(recent, 'promptLength'),
      successRateTrend: this.calculateSuccessTrend(recent),
      fallbackRateTrend: this.calculateFallbackTrend(recent)
    };
    
    return {
      recentGenerations: recent,
      statistics,
      trends
    };
  }
  
  // Private validation methods
  
  private static validatePromptLength(
    prompt: string, 
    config: PromptValidationConfig
  ): { issues: ValidationIssue[]; recommendations: string[] } {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    
    if (prompt.length > config.maxLength) {
      issues.push({
        type: 'length',
        severity: 'critical',
        message: `Prompt too long: ${prompt.length} chars (max: ${config.maxLength})`,
        suggestion: 'Use advanced optimization or enable automatic fallback',
        autoFixAvailable: true
      });
      recommendations.push('Enable automatic optimization');
      recommendations.push('Use simple generation mode for faster results');
    } else if (prompt.length > config.warnLength) {
      issues.push({
        type: 'length',
        severity: 'medium',
        message: `Prompt approaching limit: ${prompt.length} chars (warn: ${config.warnLength})`,
        suggestion: 'Consider using optimization to reduce length',
        autoFixAvailable: true
      });
      recommendations.push('Apply prompt optimization');
    }
    
    return { issues, recommendations };
  }
  
  private static validateContentComplexity(
    prompt: string,
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel,
    config: PromptValidationConfig
  ): { issues: ValidationIssue[]; recommendations: string[] } {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    
    const analysis = AdvancedContentPrioritizer.analyzeContentPriority(prompt, userInfo, difficultyLevel);
    const complexity = this.calculateComplexityScore(analysis);
    
    if (complexity > config.complexityThreshold) {
      issues.push({
        type: 'complexity',
        severity: 'high',
        message: `High content complexity: ${Math.round(complexity * 100)}% (threshold: ${Math.round(config.complexityThreshold * 100)}%)`,
        suggestion: 'Consider using simple generation mode or enabling style reduction',
        autoFixAvailable: true
      });
      recommendations.push('Enable style reduction');
      recommendations.push('Use speed-optimized preferences');
    }
    
    return { issues, recommendations };
  }
  
  private static validateContentAppropriateness(
    prompt: string,
    difficultyLevel: DifficultyLevel
  ): { issues: ValidationIssue[]; recommendations: string[] } {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    
    // Check for inappropriate content patterns
    const inappropriatePatterns = [
      /\b(scary|frightening|violent|dangerous|weapon|fight|hurt|pain|sad|cry|angry|mad)\b/gi,
      /\b(adult|mature|inappropriate|unsafe)\b/gi
    ];
    
    inappropriatePatterns.forEach(pattern => {
      const matches = prompt.match(pattern);
      if (matches && matches.length > 0) {
        issues.push({
          type: 'content',
          severity: 'medium',
          message: `Potentially inappropriate content detected: ${matches.join(', ')}`,
          suggestion: 'Review content for age-appropriateness',
          autoFixAvailable: false
        });
        recommendations.push('Review story content for children\'s safety');
      }
    });
    
    return { issues, recommendations };
  }
  
  private static validateAPICompatibility(
    prompt: string
  ): { issues: ValidationIssue[]; recommendations: string[] } {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    
    // Check for problematic characters or formatting
    if (prompt.includes('\n\n\n')) {
      issues.push({
        type: 'compatibility',
        severity: 'low',
        message: 'Multiple line breaks detected',
        suggestion: 'Clean up formatting for better API compatibility',
        autoFixAvailable: true
      });
      recommendations.push('Enable automatic formatting cleanup');
    }
    
    return { issues, recommendations };
  }
  
  private static determineSeverity(issues: ValidationIssue[]): 'info' | 'warning' | 'error' | 'critical' {
    if (issues.some(i => i.severity === 'critical')) return 'critical';
    if (issues.some(i => i.severity === 'high')) return 'error';
    if (issues.some(i => i.severity === 'medium')) return 'warning';
    return 'info';
  }
  
  private static shouldSuggestFallback(issues: ValidationIssue[], config: PromptValidationConfig): boolean {
    return config.enableFallback && issues.some(i => 
      i.severity === 'critical' || (i.severity === 'high' && i.type === 'length')
    );
  }
  
  private static deduplicateRecommendations(recommendations: string[]): string[] {
    return [...new Set(recommendations)];
  }
  
  private static calculateComplexityScore(analysis: any): number {
    const totalElements = 
      analysis.coreElements.length +
      analysis.contextElements.length + 
      analysis.styleElements.length +
      analysis.characterElements.length +
      analysis.qualityElements.length;
    
    return Math.min(totalElements / 50, 1.0);
  }
  
  private static recordMonitoring(id: string, data: GenerationMonitoringData): void {
    this.monitoringData.push(data);
    
    // Keep only last 1000 entries to prevent memory issues
    if (this.monitoringData.length > 1000) {
      this.monitoringData = this.monitoringData.slice(-1000);
    }
    
    console.log(`📊 Monitoring recorded: ${data.strategy} (${data.success ? 'success' : 'failed'})`);
  }
  
  // Helper methods for monitoring dashboard
  private static aggregateErrorTypes(data: GenerationMonitoringData[]): Record<string, number> {
    const errorTypes: Record<string, number> = {};
    data.filter(d => !d.success && d.errorType).forEach(d => {
      errorTypes[d.errorType!] = (errorTypes[d.errorType!] || 0) + 1;
    });
    return errorTypes;
  }
  
  private static aggregateStrategies(data: GenerationMonitoringData[]): Record<string, number> {
    const strategies: Record<string, number> = {};
    data.forEach(d => {
      strategies[d.strategy] = (strategies[d.strategy] || 0) + 1;
    });
    return strategies;
  }
  
  private static calculateTrend(data: GenerationMonitoringData[], field: keyof GenerationMonitoringData): number[] {
    return data.map(d => d[field] as number).slice(-20); // Last 20 data points
  }
  
  private static calculateSuccessTrend(data: GenerationMonitoringData[]): number[] {
    const windowSize = 5;
    const trend: number[] = [];
    
    for (let i = windowSize; i <= data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const successRate = window.filter(d => d.success).length / windowSize;
      trend.push(successRate);
    }
    
    return trend.slice(-20);
  }
  
  private static calculateFallbackTrend(data: GenerationMonitoringData[]): number[] {
    const windowSize = 5;
    const trend: number[] = [];
    
    for (let i = windowSize; i <= data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const fallbackRate = window.filter(d => d.fallbackUsed).length / windowSize;
      trend.push(fallbackRate);
    }
    
    return trend.slice(-20);
  }
  
  // Placeholder methods for generation attempts (to be integrated with existing services)
  private static async tryAIEnhancedGeneration(
    storyText: string,
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel,
    userPreferences?: Partial<UserOptimizationPreference>
  ): Promise<{
    success: boolean;
    result?: any;
    promptLength: number;
    optimizationApplied: boolean;
    validationResult: ValidationResult;
    error?: string;
  }> {
    // This would integrate with AdvancedStoryAnalyzer
    // For now, return a placeholder
    return {
      success: false,
      promptLength: 0,
      optimizationApplied: false,
      validationResult: {
        isValid: false,
        severity: 'info',
        issues: [],
        recommendations: [],
        fallbackSuggested: false,
        estimatedLength: 0
      },
      error: 'Integration pending'
    };
  }
  
  private static async tryOptimizedAIGeneration(
    storyText: string,
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel,
    userPreferences?: Partial<UserOptimizationPreference>
  ): Promise<{
    success: boolean;
    result?: any;
    promptLength: number;
    optimizationApplied: boolean;
    validationResult: ValidationResult;
    error?: string;
  }> {
    // This would integrate with optimized AdvancedStoryAnalyzer
    return {
      success: false,
      promptLength: 0,
      optimizationApplied: true,
      validationResult: {
        isValid: false,
        severity: 'info',
        issues: [],
        recommendations: [],
        fallbackSuggested: false,
        estimatedLength: 0
      },
      error: 'Integration pending'
    };
  }
  
  private static async trySimpleGeneration(
    storyText: string,
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel
  ): Promise<{
    success: boolean;
    result?: any;
    promptLength: number;
    validationResult: ValidationResult;
    error?: string;
  }> {
    // This would integrate with SimpleImageService
    return {
      success: true,
      promptLength: 200,
      validationResult: {
        isValid: true,
        severity: 'info',
        issues: [],
        recommendations: [],
        fallbackSuggested: false,
        estimatedLength: 200
      }
    };
  }
}
