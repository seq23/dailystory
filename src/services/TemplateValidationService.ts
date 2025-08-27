/**
 * Template Validation Service - Runtime validation and monitoring
 * Ensures templates are correctly formatted and all placeholders can be resolved
 */

import { UserInfo } from "@/types";
import { resolveAllPlaceholders } from "@/utils/placeholderResolver";

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

export class TemplateValidationService {
  private static validationLog: Array<{
    timestamp: Date;
    template: string;
    result: TemplateValidationResult;
    userInfo?: Partial<UserInfo>;
  }> = [];

  /**
   * Validate a single template with comprehensive checks
   */
  static validateTemplate(
    template: string,
    userInfo: UserInfo,
    pageText?: string
  ): TemplateValidationResult {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!template || template.trim().length === 0) {
      errors.push("Template is empty or null");
      return this.createFailedResult(errors, warnings);
    }

    // Extract placeholders before resolution
    const originalPlaceholders = this.extractPlaceholders(template);
    
    try {
      // Resolve placeholders
      const resolvedText = resolveAllPlaceholders(template, { 
        userInfo, 
        pageText 
      });

      // Check for unresolved placeholders
      const unresolvedPlaceholders = this.extractPlaceholders(resolvedText);
      
      // Word count analysis
      const wordCount = resolvedText.split(/\s+/).filter(word => word.length > 0).length;
      
      if (wordCount < 10) {
        warnings.push(`Template produces very short content (${wordCount} words)`);
      }

      // Structural integrity checks
      const structuralIssues = this.checkStructuralIntegrity(resolvedText);
      warnings.push(...structuralIssues);

      // Content quality checks
      const qualityIssues = this.checkContentQuality(resolvedText);
      warnings.push(...qualityIssues);

      // Calculate metrics
      const placeholderResolutionRate = originalPlaceholders.length === 0 
        ? 1 
        : (originalPlaceholders.length - unresolvedPlaceholders.length) / originalPlaceholders.length;
      
      const contentQuality = this.calculateContentQuality(resolvedText);
      const structuralIntegrity = this.calculateStructuralIntegrity(resolvedText);
      const readabilityScore = this.calculateReadabilityScore(resolvedText);

      const result: TemplateValidationResult = {
        isValid: errors.length === 0 && unresolvedPlaceholders.length === 0,
        errors,
        warnings,
        unresolvedPlaceholders,
        wordCount,
        readabilityScore,
        validationMetrics: {
          placeholderResolutionRate,
          contentQuality,
          structuralIntegrity
        }
      };

      // Log validation result
      this.logValidation(template, result, userInfo);

      // Performance monitoring
      const processingTime = Date.now() - startTime;
      if (processingTime > 100) {
        console.warn(`⚠️ [VALIDATION] Slow template validation: ${processingTime}ms`);
      }

      return result;

    } catch (error) {
      console.error('❌ [VALIDATION] Template validation error:', error);
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return this.createFailedResult(errors, warnings);
    }
  }

  /**
   * Test template with multiple user scenarios
   */
  static testTemplateScenarios(
    template: string,
    scenarios: TemplateTestScenario[]
  ): Array<{
    scenario: string;
    passed: boolean;
    result: TemplateValidationResult;
  }> {
    return scenarios.map(scenario => {
      const mockUserInfo = this.createMockUserInfo(scenario.userInfo);
      const result = this.validateTemplate(template, mockUserInfo, scenario.pageText);
      
      const passed = scenario.expectedPasses 
        ? result.isValid && result.errors.length === 0
        : !result.isValid || result.errors.length > 0;

      return {
        scenario: scenario.name,
        passed,
        result
      };
    });
  }

  /**
   * Validate ending generation for templates
   */
  static validateEndingGeneration(template: string, userInfo: UserInfo): {
    hasEnding: boolean;
    endingQuality: number;
    recommendations: string[];
  } {
    const resolvedText = resolveAllPlaceholders(template, { userInfo });
    const recommendations: string[] = [];

    // Check for ending indicators
    const endingIndicators = [
      /\bthe end\b/i,
      /\bendeed\b/i,
      /\bfinally\b/i,
      /\bin the end\b/i,
      /\bevermore\b/i,
      /\bhappily ever after\b/i,
      /\bwhat.*next\b/i,
      /\banother.*adventure\b/i,
      /\bnew.*story\b/i
    ];

    const hasEndingIndicator = endingIndicators.some(pattern => pattern.test(resolvedText));
    
    // Check for never-ending story hooks
    const neverEndingHooks = [
      /what.*adventure.*next/i,
      /what.*happens.*next/i,
      /where.*will.*go/i,
      /what.*will.*discover/i
    ];

    const hasNeverEndingHook = neverEndingHooks.some(pattern => pattern.test(resolvedText));

    let endingQuality = 0;
    
    if (hasEndingIndicator || hasNeverEndingHook) {
      endingQuality = 0.8;
      if (hasNeverEndingHook) {
        endingQuality = 1.0; // Never-ending hooks are ideal
        recommendations.push("✅ Template includes never-ending story hook");
      }
    } else {
      recommendations.push("Consider adding an ending or continuation hook");
    }

    return {
      hasEnding: hasEndingIndicator || hasNeverEndingHook,
      endingQuality,
      recommendations
    };
  }

  /**
   * Get validation statistics and monitoring data
   */
  static getValidationMetrics(): {
    totalValidations: number;
    successRate: number;
    commonErrors: Array<{ error: string; count: number }>;
    averageProcessingTime: number;
    unresolvedPlaceholderFrequency: Record<string, number>;
  } {
    const totalValidations = this.validationLog.length;
    const successfulValidations = this.validationLog.filter(log => log.result.isValid).length;
    const successRate = totalValidations > 0 ? successfulValidations / totalValidations : 0;

    // Aggregate common errors
    const errorCounts: Record<string, number> = {};
    const unresolvedPlaceholders: Record<string, number> = {};

    this.validationLog.forEach(log => {
      log.result.errors.forEach(error => {
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });

      log.result.unresolvedPlaceholders.forEach(placeholder => {
        unresolvedPlaceholders[placeholder] = (unresolvedPlaceholders[placeholder] || 0) + 1;
      });
    });

    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalValidations,
      successRate,
      commonErrors,
      averageProcessingTime: 0, // Would need timing data
      unresolvedPlaceholderFrequency: unresolvedPlaceholders
    };
  }

  /**
   * Clear validation logs (for testing)
   */
  static clearValidationLogs(): void {
    this.validationLog = [];
  }

  // Private helper methods

  private static extractPlaceholders(text: string): string[] {
    const matches = text.match(/\{([^}]+)\}/g) || [];
    return matches.map(match => match.slice(1, -1));
  }

  private static checkStructuralIntegrity(text: string): string[] {
    const issues: string[] = [];
    
    // Check for double spaces
    if (/\s{2,}/.test(text)) {
      issues.push("Contains multiple consecutive spaces");
    }

    // Check for missing spaces after punctuation
    if (/[.!?][A-Z]/.test(text)) {
      issues.push("Missing spaces after sentence punctuation");
    }

    // Check for orphaned punctuation
    if (/\s[.!?:;,]/.test(text)) {
      issues.push("Contains orphaned punctuation");
    }

    return issues;
  }

  private static checkContentQuality(text: string): string[] {
    const issues: string[] = [];
    
    // Check for repetitive content
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Only check meaningful words
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    const repetitiveWords = Object.entries(wordCounts)
      .filter(([, count]) => count > 3)
      .map(([word]) => word);

    if (repetitiveWords.length > 0) {
      issues.push(`Repetitive words detected: ${repetitiveWords.join(', ')}`);
    }

    return issues;
  }

  private static calculateContentQuality(text: string): number {
    let score = 1.0;
    
    // Penalize very short content
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 20) {
      score -= 0.3;
    }

    // Penalize repetitive content
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const uniqueness = uniqueWords.size / words.length;
    
    if (uniqueness < 0.7) {
      score -= 0.2;
    }

    return Math.max(0, score);
  }

  private static calculateStructuralIntegrity(text: string): number {
    let score = 1.0;

    // Check for structural issues
    if (/\s{2,}/.test(text)) score -= 0.1;
    if (/[.!?][A-Z]/.test(text)) score -= 0.2;
    if (/\s[.!?:;,]/.test(text)) score -= 0.2;

    return Math.max(0, score);
  }

  private static calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = words.reduce((sum, word) => {
      return sum + this.countSyllables(word);
    }, 0) / words.length;

    // Simple Flesch-Kincaid approximation
    return Math.max(0, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord));
  }

  private static countSyllables(word: string): number {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleaned.length <= 3) return 1;
    
    const vowels = cleaned.match(/[aeiouy]/g);
    return Math.max(1, vowels ? vowels.length : 1);
  }

  private static createFailedResult(errors: string[], warnings: string[]): TemplateValidationResult {
    return {
      isValid: false,
      errors,
      warnings,
      unresolvedPlaceholders: [],
      wordCount: 0,
      readabilityScore: 0,
      validationMetrics: {
        placeholderResolutionRate: 0,
        contentQuality: 0,
        structuralIntegrity: 0
      }
    };
  }

  private static logValidation(
    template: string, 
    result: TemplateValidationResult, 
    userInfo?: UserInfo
  ): void {
    this.validationLog.push({
      timestamp: new Date(),
      template: template.substring(0, 100) + (template.length > 100 ? '...' : ''),
      result,
      userInfo: userInfo ? {
        name: userInfo.name,
        favoriteColor: userInfo.favoriteColor,
        favoriteAnimal: userInfo.favoriteAnimal
      } : undefined
    });

    // Keep log size manageable
    if (this.validationLog.length > 1000) {
      this.validationLog = this.validationLog.slice(-500);
    }
  }

  private static createMockUserInfo(partial: Partial<UserInfo>): UserInfo {
    return {
      name: 'Test Child',
      age: 8,
      grade: '3rd',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
      favoriteColor: 'blue',
      favoriteAnimal: 'cat',
      hobbies: 'drawing',
      favoriteFood: 'pizza',
      specialRequest: 'adventure',
      ...partial
    };
  }
}
