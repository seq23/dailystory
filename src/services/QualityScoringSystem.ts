// Quality Scoring & Re-generation System
// Phase 2: Automated assessment and intelligent retries

import { CharacterDescriptor } from "./AdvancedCharacterEngine";
import { UserInfo, DifficultyLevel } from "@/types";
import { SupportedLanguage } from "@/types/multilingual";

// Local RunwareParameters interface (previously imported from MultiStageEnhancementPipeline)
export interface RunwareParameters {
  model: string;
  cfgScale: number;
  steps: number;
  scheduler: string;
  strength: number;
  seed?: number;
  width: number;
  height: number;
}

export interface QualityMetrics {
  characterConsistency: number;
  culturalAuthenticity: number;
  technicalQuality: number;
  ageAppropriateness: number;
  visualClarity: number;
  overallScore: number;
}

export interface QualityAssessment {
  metrics: QualityMetrics;
  passed: boolean;
  issues: string[];
  recommendations: string[];
  retryStrategy?: RetryStrategy;
}

export interface RetryStrategy {
  adjustedPrompt: string;
  adjustedParameters: RunwareParameters;
  focusAreas: string[];
  maxRetries: number;
  priority: "high" | "medium" | "low";
}

export interface GenerationAttempt {
  attemptNumber: number;
  prompt: string;
  parameters: RunwareParameters;
  imageUrl?: string;
  qualityScore: number;
  issues: string[];
  timestamp: number;
}

export class QualityScoringSystem {
  private static readonly MIN_PASSING_SCORE = 75;
  private static readonly HIGH_QUALITY_THRESHOLD = 85;
  private static readonly MAX_RETRY_ATTEMPTS = 3;

  private static generationHistory: Map<string, GenerationAttempt[]> = new Map();
  private static successfulPatterns: Map<string, { prompt: string; parameters: RunwareParameters; score: number }[]> = new Map();

  /**
   * Assess image generation quality based on prompt and context
   */
  static assessQuality(
    prompt: string,
    parameters: RunwareParameters,
    characters: CharacterDescriptor[],
    userInfo: UserInfo,
    sessionId: string,
    pageNumber: number,
    imageUrl?: string
  ): QualityAssessment {
    const metrics = this.calculateQualityMetrics(prompt, parameters, characters, userInfo);
    const passed = metrics.overallScore >= this.MIN_PASSING_SCORE;

    const assessment: QualityAssessment = {
      metrics,
      passed,
      issues: this.identifyQualityIssues(metrics, prompt, characters),
      recommendations: this.generateRecommendations(metrics, prompt, parameters, userInfo)
    };

    // Generate retry strategy if quality is insufficient
    if (!passed) {
      assessment.retryStrategy = this.createRetryStrategy(
        prompt,
        parameters,
        metrics,
        characters,
        userInfo,
        sessionId,
        pageNumber
      );
    }

    // Record generation attempt
    this.recordGenerationAttempt(sessionId, pageNumber, {
      attemptNumber: this.getAttemptNumber(sessionId, pageNumber),
      prompt,
      parameters,
      imageUrl,
      qualityScore: metrics.overallScore,
      issues: assessment.issues,
      timestamp: Date.now()
    });

    console.log(`📊 Quality assessment for page ${pageNumber}: ${metrics.overallScore}/100 (${passed ? "PASSED" : "FAILED"})`);

    return assessment;
  }

  /**
   * Calculate comprehensive quality metrics
   */
  private static calculateQualityMetrics(
    prompt: string,
    parameters: RunwareParameters,
    characters: CharacterDescriptor[],
    userInfo: UserInfo
  ): QualityMetrics {
    const characterConsistency = this.assessCharacterConsistency(prompt, characters);
    const culturalAuthenticity = this.assessCulturalAuthenticity(prompt, userInfo);
    const technicalQuality = this.assessTechnicalQuality(prompt, parameters);
    const ageAppropriateness = this.assessAgeAppropriateness(prompt, userInfo);
    const visualClarity = this.assessVisualClarity(prompt, parameters);

    // Weighted overall score
    const overallScore = Math.round(
      (characterConsistency * 0.25) +
      (culturalAuthenticity * 0.20) +
      (technicalQuality * 0.20) +
      (ageAppropriateness * 0.20) +
      (visualClarity * 0.15)
    );

    return {
      characterConsistency,
      culturalAuthenticity,
      technicalQuality,
      ageAppropriateness,
      visualClarity,
      overallScore
    };
  }

  // Character Consistency Assessment (25% weight)
  private static assessCharacterConsistency(prompt: string, characters: CharacterDescriptor[]): number {
    let score = 50; // Base score

    // Character mention bonus
    if (characters.length > 0) {
      score += 20;

      // Check if character traits are mentioned
      const hasPhysicalTraits = characters.some(char =>
        prompt.toLowerCase().includes(char.physicalTraits.toLowerCase().substring(0, 20))
      );

      if (hasPhysicalTraits) score += 15;

      // Family resemblance bonus
      const familyMembers = characters.filter(char => char.type === "family");
      if (familyMembers.length > 1) {
        score += 10;
      }

      // Consistent clothing style
      const hasClothingMention = characters.some(char =>
        prompt.toLowerCase().includes("clothing") || prompt.toLowerCase().includes("dress")
      );

      if (hasClothingMention) score += 5;
    }

    return Math.min(score, 100);
  }

  // Cultural Authenticity Assessment (20% weight)
  private static assessCulturalAuthenticity(prompt: string, userInfo: UserInfo): number {
    let score = 60; // Base score
    const nativeLanguage = userInfo.nativeLanguage as SupportedLanguage;

    // Cultural element presence
    const culturalKeywords = {
      "ar": ["arabic", "middle eastern", "traditional", "cultural", "authentic"],
      "es": ["latin", "hispanic", "cultural", "traditional", "vibrant"],
      "zh": ["chinese", "asian", "traditional", "cultural", "elegant"],
      "hi": ["indian", "south asian", "traditional", "cultural", "beautiful"],
      "pt": ["brazilian", "portuguese", "cultural", "traditional", "warm"],
      "fr": ["french", "european", "elegant", "cultural", "refined"],
      "en": ["diverse", "inclusive", "multicultural", "respectful", "authentic"]
    };

    const keywords = culturalKeywords[nativeLanguage] || culturalKeywords["en"];
    const mentionedKeywords = keywords.filter(keyword =>
      prompt.toLowerCase().includes(keyword)
    );

    score += mentionedKeywords.length * 8; // 8 points per cultural keyword

    // Anti-stereotype bonus
    const hasPositiveTerms = ["respectful", "authentic", "beautiful", "positive"].some(term =>
      prompt.toLowerCase().includes(term)
    );

    if (hasPositiveTerms) score += 10;

    return Math.min(score, 100);
  }

  // Technical Quality Assessment (20% weight)
  private static assessTechnicalQuality(prompt: string, parameters: RunwareParameters): number {
    let score = 60; // Base score

    // Parameter optimization bonus
    if (parameters.cfgScale >= 1.0 && parameters.cfgScale <= 2.0) score += 10;
    if (parameters.steps >= 3 && parameters.steps <= 6) score += 10;
    if (parameters.strength >= 0.7 && parameters.strength <= 0.9) score += 10;

    // Quality keywords bonus
    const qualityKeywords = ["high quality", "detailed", "vibrant", "clear", "professional"];
    const mentionedQuality = qualityKeywords.filter(keyword =>
      prompt.toLowerCase().includes(keyword)
    ).length;

    score += mentionedQuality * 5; // 5 points per quality keyword

    // Negative prompt considerations (implied presence)
    if (prompt.includes("text-free") || prompt.includes("no text")) score += 5;

    return Math.min(score, 100);
  }

  // Age Appropriateness Assessment (20% weight)
  private static assessAgeAppropriateness(prompt: string, userInfo: UserInfo): number {
    let score = 70; // Base score (assuming most content is appropriate)

    const readingLevel = userInfo.readingLevel as DifficultyLevel;

    // Age-appropriate style bonus
    if (prompt.includes("children\\'s book")) score += 15;
    if (prompt.includes("family-friendly")) score += 10;

    // Complexity adjustment
    if (readingLevel === "beginner" && prompt.includes("simple")) score += 10;
    if (readingLevel === "expert" && prompt.includes("detailed")) score += 10;

    // Safety keywords
    if (prompt.includes("safe") || prompt.includes("appropriate")) score += 5;

    return Math.min(score, 100);
  }

  // Visual Clarity Assessment (15% weight)
  private static assessVisualClarity(prompt: string, parameters: RunwareParameters): number {
    let score = 65; // Base score

    // Clarity keywords
    const clarityKeywords = ["clear", "focused", "well-lit", "bright", "crisp"];
    const mentionedClarity = clarityKeywords.filter(keyword =>
      prompt.toLowerCase().includes(keyword)
    ).length;

    score += mentionedClarity * 7; // 7 points per clarity keyword

    // Resolution bonus (implied from parameters)
    if (parameters.width >= 1024 && parameters.height >= 1024) score += 10;

    // Composition keywords
    if (prompt.includes("composition") || prompt.includes("framing")) score += 8;

    return Math.min(score, 100);
  }

  /**
   * Identify specific quality issues
   */
  private static identifyQualityIssues(
    metrics: QualityMetrics,
    prompt: string,
    characters: CharacterDescriptor[]
  ): string[] {
    const issues: string[] = [];

    if (metrics.characterConsistency < 70) {
      issues.push("Character consistency below threshold");
      if (characters.length > 0 && !characters.some(c => prompt.includes(c.name))) {
        issues.push("Character names not properly referenced");
      }
    }

    if (metrics.culturalAuthenticity < 70) {
      issues.push("Cultural authenticity needs improvement");
    }

    if (metrics.technicalQuality < 70) {
      issues.push("Technical quality parameters need optimization");
    }

    if (metrics.ageAppropriateness < 70) {
      issues.push("Age appropriateness concerns detected");
    }

    if (metrics.visualClarity < 70) {
      issues.push("Visual clarity could be enhanced");
    }

    return issues;
  }

  /**
   * Generate improvement recommendations
   */
  private static generateRecommendations(
    metrics: QualityMetrics,
    prompt: string,
    parameters: RunwareParameters,
    userInfo: UserInfo
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.characterConsistency < 80) {
      recommendations.push("Add more specific character physical descriptions");
      recommendations.push("Include character relationship context");
    }

    if (metrics.culturalAuthenticity < 80) {
      recommendations.push("Enhance cultural elements and authentic representation");
      recommendations.push("Add positive cultural descriptors");
    }

    if (metrics.technicalQuality < 80) {
      recommendations.push("Optimize generation parameters for better quality");
      recommendations.push("Include technical quality enhancement terms");
    }

    return recommendations;
  }

  /**
   * Create intelligent retry strategy
   */
  private static createRetryStrategy(
    originalPrompt: string,
    originalParameters: RunwareParameters,
    metrics: QualityMetrics,
    characters: CharacterDescriptor[],
    userInfo: UserInfo,
    sessionId: string,
    pageNumber: number
  ): RetryStrategy {
    let adjustedPrompt = originalPrompt;
    let adjustedParameters = { ...originalParameters };
    const focusAreas: string[] = [];

    // Address character consistency
    if (metrics.characterConsistency < 70) {
      // Add character descriptions if missing
      const characterDescriptions = characters.map(char =>
        `${char.name} with ${char.physicalTraits}`
      ).join(", ");

      if (characterDescriptions && !adjustedPrompt.includes(characterDescriptions.substring(0, 30))) {
        adjustedPrompt = `${characterDescriptions}, ${adjustedPrompt}`;
      }

      focusAreas.push("character consistency");
    }

    // Address cultural authenticity
    if (metrics.culturalAuthenticity < 70) {
      adjustedPrompt += ", authentic cultural representation, respectful portrayal";
      focusAreas.push("cultural authenticity");
    }

    // Address technical quality
    if (metrics.technicalQuality < 70) {
      adjustedParameters.cfgScale = Math.min(adjustedParameters.cfgScale + 0.2, 2.0);
      adjustedParameters.steps = Math.min(adjustedParameters.steps + 1, 6);
      adjustedPrompt += ", high quality, detailed, professional illustration";
      focusAreas.push("technical quality");
    }

    // Determine priority based on worst metric
    const worstScore = Math.min(
      metrics.characterConsistency,
      metrics.culturalAuthenticity,
      metrics.technicalQuality
    );

    const priority = worstScore < 60 ? "high" : worstScore < 75 ? "medium" : "low";

    return {
      adjustedPrompt,
      adjustedParameters,
      focusAreas,
      maxRetries: this.MAX_RETRY_ATTEMPTS,
      priority
    };
  }

  /**
   * Learning system - record successful patterns
   */
  static recordSuccessfulGeneration(
    prompt: string,
    parameters: RunwareParameters,
    qualityScore: number,
    userInfo: UserInfo
  ): void {
    const culturalKey = userInfo.nativeLanguage as SupportedLanguage;

    if (!this.successfulPatterns.has(culturalKey)) {
      this.successfulPatterns.set(culturalKey, []);
    }

    const patterns = this.successfulPatterns.get(culturalKey)!;
    patterns.push({ prompt, parameters, score: qualityScore });

    // Keep only top 10 patterns per culture
    patterns.sort((a, b) => b.score - a.score);
    if (patterns.length > 10) {
      patterns.splice(10);
    }

    console.log(`📚 Recorded successful pattern for ${culturalKey} (score: ${qualityScore})`);
  }

  /**
   * Get learned patterns for optimization
   */
  static getSuccessfulPatterns(userInfo: UserInfo): { prompt: string; parameters: RunwareParameters; score: number }[] {
    const culturalKey = userInfo.nativeLanguage as SupportedLanguage;
    return this.successfulPatterns.get(culturalKey) || [];
  }

  // Helper methods

  private static recordGenerationAttempt(sessionId: string, pageNumber: number, attempt: GenerationAttempt): void {
    const key = `${sessionId}_${pageNumber}`;

    if (!this.generationHistory.has(key)) {
      this.generationHistory.set(key, []);
    }

    const history = this.generationHistory.get(key)!;
    history.push(attempt);

    // Keep only recent attempts
    if (history.length > 5) {
      history.shift();
    }
  }

  private static getAttemptNumber(sessionId: string, pageNumber: number): number {
    const key = `${sessionId}_${pageNumber}`;
    const history = this.generationHistory.get(key) || [];
    return history.length + 1;
  }

  /**
   * Get generation analytics
   */
  static getAnalytics(sessionId: string): {
    totalAttempts: number;
    successRate: number;
    averageQuality: number;
    commonIssues: string[];
  } {
    let totalAttempts = 0;
    let successfulAttempts = 0;
    let totalQuality = 0;
    const allIssues: string[] = [];

    for (const [key, attempts] of this.generationHistory) {
      if (key.startsWith(sessionId)) {
        totalAttempts += attempts.length;

        for (const attempt of attempts) {
          totalQuality += attempt.qualityScore;
          if (attempt.qualityScore >= this.MIN_PASSING_SCORE) {
            successfulAttempts++;
          }
          allIssues.push(...attempt.issues);
        }
      }
    }

    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;
    const averageQuality = totalAttempts > 0 ? totalQuality / totalAttempts : 0;

    // Find most common issues
    const issueCounts = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);

    return {
      totalAttempts,
      successRate,
      averageQuality,
      commonIssues
    };
  }

  /**
   * Clear session data
   */
  static clearSession(sessionId: string): void {
    for (const key of this.generationHistory.keys()) {
      if (key.startsWith(sessionId)) {
        this.generationHistory.delete(key);
      }
    }

    console.log(`🗑️ Cleared quality scoring data for session: ${sessionId}`);
  }
}
