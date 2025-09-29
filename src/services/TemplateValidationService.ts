// Minimal template validation stub - real validation handled by unified edge function
import type { UserInfo } from '@/types';

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  unresolvedPlaceholders: string[];
  wordCount: number;
  readabilityScore: number;
  validationMetrics: {
    placeholderResolutionRate: number;
    contentQuality: number;
    structuralIntegrity: number;
  };
}

export interface TemplateTestScenario {
  name: string;
  userInfo: Partial<UserInfo>;
  expectedPasses: boolean;
  pageText?: string;
}

// Enhanced template validation service with real validation logic
export class TemplateValidationService {
  private static validationHistory: Array<{
    timestamp: number;
    success: boolean;
    score: number;
    errors: string[];
  }> = [];

  static validateTemplate(
    template: string,
    userInfo: UserInfo,
    pageText?: string
  ): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const unresolvedPlaceholders: string[] = [];
    
    // Count words
    const wordCount = template.split(/\s+/).filter(word => word.length > 0).length;
    
    // Check for basic template structure issues
    if (wordCount < 10) {
      errors.push('Template is too short (minimum 10 words)');
    }
    
    if (wordCount > 1000) {
      warnings.push('Template is very long (over 1000 words)');
    }

    // Find unresolved placeholders
    const placeholderRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = placeholderRegex.exec(template)) !== null) {
      unresolvedPlaceholders.push(match[1]);
    }

    if (unresolvedPlaceholders.length > 0) {
      errors.push(`Unresolved placeholders: ${unresolvedPlaceholders.join(', ')}`);
    }

    // Check readability (simple word length based score)
    const words = template.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const sentenceCount = (template.match(/[.!?]+/g) || []).length;
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;
    
    let readabilityScore = 100;
    if (avgWordLength > 6) readabilityScore -= 10;
    if (avgSentenceLength > 20) readabilityScore -= 15;
    if (avgWordLength < 3) readabilityScore -= 5;

    // Calculate validation metrics
    const placeholderResolutionRate = unresolvedPlaceholders.length === 0 ? 1.0 : 
      Math.max(0, 1 - (unresolvedPlaceholders.length * 0.1));
    
    const contentQuality = Math.min(1.0, wordCount / 100) * 
      (readabilityScore / 100) * 
      (errors.length === 0 ? 1.0 : 0.5);
    
    const structuralIntegrity = errors.length === 0 ? 1.0 : Math.max(0, 1 - (errors.length * 0.2));

    const isValid = errors.length === 0;
    const overallScore = (placeholderResolutionRate + contentQuality + structuralIntegrity) / 3;

    // Record validation history
    this.validationHistory.push({
      timestamp: Date.now(),
      success: isValid,
      score: overallScore,
      errors: [...errors]
    });

    // Keep only last 100 validations
    if (this.validationHistory.length > 100) {
      this.validationHistory = this.validationHistory.slice(-100);
    }

    return {
      isValid,
      errors,
      warnings,
      unresolvedPlaceholders,
      wordCount,
      readabilityScore: Math.max(0, readabilityScore),
      validationMetrics: {
        placeholderResolutionRate,
        contentQuality,
        structuralIntegrity
      }
    };
  }

  static getValidationMetrics() {
    if (this.validationHistory.length === 0) {
      return {
        totalValidations: 0,
        successRate: 1.0,
        averageScore: 1.0,
        commonIssues: []
      };
    }

    const recentValidations = this.validationHistory.slice(-50); // Last 50 validations
    const successCount = recentValidations.filter(v => v.success).length;
    const successRate = successCount / recentValidations.length;
    const averageScore = recentValidations.reduce((sum, v) => sum + v.score, 0) / recentValidations.length;

    // Analyze common errors
    const errorCounts: Record<string, number> = {};
    recentValidations.forEach(validation => {
      validation.errors.forEach(error => {
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });
    });

    const commonIssues = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalValidations: this.validationHistory.length,
      successRate,
      averageScore,
      commonIssues
    };
  }

  static validateEndingGeneration(template: string, userInfo: UserInfo) {
    const hasEndingKeywords = /\b(end|final|conclusion|finished|complete)\b/i.test(template);
    const wordCount = template.split(/\s+/).filter(word => word.length > 0).length;
    
    const endingQuality = hasEndingKeywords ? 
      Math.min(1.0, wordCount / 50) : 
      Math.max(0.3, wordCount / 100);

    const recommendations: string[] = [];
    if (!hasEndingKeywords) {
      recommendations.push('Consider adding clear ending indicators');
    }
    if (wordCount < 20) {
      recommendations.push('Ending might be too short');
    }
    if (endingQuality >= 0.8) {
      recommendations.push('Excellent ending quality');
    }

    return {
      hasEnding: hasEndingKeywords,
      endingQuality,
      recommendations
    };
  }

  static clearValidationHistory() {
    this.validationHistory = [];
  }
}