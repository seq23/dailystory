// Advanced Quality Enhancement Engine - Phase 4 & 5 Implementation
// One-click optimization for children's books and advanced user experience

export interface QualityEnhancementResult {
  enhancedPrompt: string;
  qualityScore: number;
  optimizations: string[];
  suggestedParameters: {
    cfgScale: number;
    steps: number;
    model: string;
    scheduler: string;
  };
  visualConsistencyImprovements: string[];
}

export interface BatchOptimizationRequest {
  prompts: string[];
  sessionId: string;
  pageNumbers: number[];
  userInfo: any;
}

export interface BatchOptimizationResult {
  results: QualityEnhancementResult[];
  overallQualityScore: number;
  consistencyReport: string;
  recommendations: string[];
}

export class AdvancedQualityEngine {
  private static readonly CHILDREN_BOOK_OPTIMAL_PARAMS = {
    cfgScale: 3,
    steps: 8,
    model: "runware:100@1",
    scheduler: "FlowMatchEulerDiscreteScheduler",
    outputFormat: "WEBP"
  };

  private static readonly QUALITY_ENHANCEMENT_PATTERNS = [
    {
      name: "Character Description Enhancement",
      pattern: /\b(child|boy|girl|person|character)\b/gi,
      enhancement: (match: string, context: string) => {
        // Add specific character details for better consistency
        const enhancements = [
          "with expressive bright eyes",
          "with a warm friendly smile",
          "with natural-looking features"
        ];
        return `${match} ${enhancements[Math.floor(Math.random() * enhancements.length)]}`;
      }
    },
    {
      name: "Scene Atmosphere Enhancement", 
      pattern: /\bin\s+(the\s+)?(garden|park|room|house|school)/gi,
      enhancement: (match: string, context: string) => {
        return `${match} with soft natural lighting and warm atmosphere`;
      }
    },
    {
      name: "Color Vibrancy Enhancement",
      pattern: /\b(red|blue|green|yellow|orange|purple|pink)\b/gi,
      enhancement: (match: string, context: string) => {
        return `vibrant ${match}`;
      }
    }
  ];

  static optimizeForChildrensBooks(
    prompt: string, 
    sessionId?: string, 
    pageNumber?: number,
    userInfo?: any
  ): QualityEnhancementResult {
    let enhancedPrompt = prompt;
    const optimizations: string[] = [];
    const visualConsistencyImprovements: string[] = [];

    // 1. Apply children's book specific enhancements
    for (const pattern of this.QUALITY_ENHANCEMENT_PATTERNS) {
      const matches = prompt.matchAll(pattern.pattern);
      for (const match of matches) {
        if (match[0] && match.index !== undefined) {
          const enhanced = pattern.enhancement(match[0], prompt);
          enhancedPrompt = enhancedPrompt.replace(match[0], enhanced);
          optimizations.push(`Applied ${pattern.name}: ${match[0]} → ${enhanced}`);
        }
      }
    }

    // 2. Add professional children's book illustration suffix
    const professionalSuffix = ", professional children's book illustration, warm earth tones and soft natural lighting, diverse inclusive characters with expressive faces, contemporary storybook art style, safe wholesome content, high quality digital artwork, soft painterly texture, appealing composition";
    
    if (!enhancedPrompt.includes("professional children's book illustration")) {
      enhancedPrompt += professionalSuffix;
      optimizations.push("Added professional children's book illustration styling");
    }

    // 3. Visual consistency improvements
    if (sessionId && pageNumber) {
      const consistencyContext = this.getVisualConsistencyContext(sessionId, pageNumber);
      if (consistencyContext) {
        enhancedPrompt += consistencyContext;
        visualConsistencyImprovements.push("Added visual consistency context from previous pages");
      }
    }

    // 4. Character consistency improvements
    if (sessionId) {
      const characterContext = this.getCharacterConsistencyContext(sessionId);
      if (characterContext) {
        enhancedPrompt = `${characterContext} ${enhancedPrompt}`;
        visualConsistencyImprovements.push("Added character consistency context");
      }
    }

    // 5. Calculate quality score
    const qualityScore = this.calculateQualityScore(enhancedPrompt, optimizations.length);

    return {
      enhancedPrompt,
      qualityScore,
      optimizations,
      suggestedParameters: this.CHILDREN_BOOK_OPTIMAL_PARAMS,
      visualConsistencyImprovements
    };
  }

  static batchOptimizePrompts(request: BatchOptimizationRequest): BatchOptimizationResult {
    const results: QualityEnhancementResult[] = [];
    
    for (let i = 0; i < request.prompts.length; i++) {
      const result = this.optimizeForChildrensBooks(
        request.prompts[i],
        request.sessionId,
        request.pageNumbers[i],
        request.userInfo
      );
      results.push(result);
    }

    // Calculate overall quality score
    const overallQualityScore = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;

    // Generate consistency report
    const consistencyReport = this.generateConsistencyReport(results, request.sessionId);

    // Generate recommendations
    const recommendations = this.generateOptimizationRecommendations(results);

    return {
      results,
      overallQualityScore,
      consistencyReport,
      recommendations
    };
  }

  static getOptimalParameters(complexity: 'simple' | 'medium' | 'complex' = 'medium'): typeof AdvancedQualityEngine.CHILDREN_BOOK_OPTIMAL_PARAMS {
    const baseParams = { ...this.CHILDREN_BOOK_OPTIMAL_PARAMS };
    
    switch (complexity) {
      case 'simple':
        return { ...baseParams, cfgScale: 3, steps: 8 };
      case 'complex':
        return { ...baseParams, cfgScale: 4, steps: 12 };
      default:
        return baseParams;
    }
  }

  static validateOptimalSettings(currentParams: any): { isOptimal: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    let isOptimal = true;

    if (currentParams.cfgScale < 3 || currentParams.cfgScale > 4) {
      suggestions.push(`CFG Scale should be 3-4 for story matching (current: ${currentParams.cfgScale})`);
      isOptimal = false;
    }

    if (currentParams.steps < 8 || currentParams.steps > 12) {
      suggestions.push(`Steps should be 8-12 for fast story generation (current: ${currentParams.steps})`);
      isOptimal = false;
    }

    if (currentParams.model !== "runware:100@1") {
      suggestions.push(`Model should be runware:100@1 for optimal quality (current: ${currentParams.model})`);
      isOptimal = false;
    }

    if (currentParams.outputFormat !== "WEBP") {
      suggestions.push(`Output format should be WEBP for quality/size balance (current: ${currentParams.outputFormat})`);
      isOptimal = false;
    }

    return { isOptimal, suggestions };
  }

  static createQualityPresets(): Record<string, any> {
    return {
      "optimal_characters": {
        ...this.CHILDREN_BOOK_OPTIMAL_PARAMS,
        cfgScale: 3,
        steps: 10,
        description: "Optimal for character consistency and facial features"
      },
      "best_scenes": {
        ...this.CHILDREN_BOOK_OPTIMAL_PARAMS,
        cfgScale: 4,
        steps: 12,
        description: "Best for detailed scene composition and atmosphere"
      },
      "maximum_quality": {
        ...this.CHILDREN_BOOK_OPTIMAL_PARAMS,
        cfgScale: 4,
        steps: 12,
        description: "Maximum quality for final publication-ready images"
      },
      "fast_preview": {
        ...this.CHILDREN_BOOK_OPTIMAL_PARAMS,
        cfgScale: 3,
        steps: 8,
        description: "Fast generation for previews and iteration"
      }
    };
  }

  // Private helper methods
  private static getVisualConsistencyContext(sessionId: string, pageNumber: number): string {
    // This would integrate with the StoryVisualStateManager
    // For now, return a placeholder that shows the integration point
    return `, maintaining visual consistency from previous pages`;
  }

  private static getCharacterConsistencyContext(sessionId: string): string {
    // This would integrate with character state management
    return "Consistent character appearance:";
  }

  private static calculateQualityScore(prompt: string, optimizationCount: number): number {
    let score = 0.6; // Base score
    
    // Length bonus (optimal prompts are detailed but not too long)
    const promptLength = prompt.length;
    if (promptLength > 100 && promptLength < 2800) {
      score += 0.2;
    }

    // Enhancement bonus
    score += Math.min(optimizationCount * 0.05, 0.3);

    // Professional styling bonus
    if (prompt.includes("professional children's book illustration")) {
      score += 0.1;
    }

    // Descriptive detail bonus
    const descriptiveWords = (prompt.match(/\b(vibrant|soft|warm|bright|expressive|natural|cozy|magical)\b/gi) || []).length;
    score += Math.min(descriptiveWords * 0.02, 0.1);

    return Math.min(score, 1.0);
  }

  private static generateConsistencyReport(results: QualityEnhancementResult[], sessionId: string): string {
    const totalOptimizations = results.reduce((sum, r) => sum + r.optimizations.length, 0);
    const avgQualityScore = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    
    return `Batch optimization completed: ${results.length} prompts processed, ${totalOptimizations} total optimizations applied, average quality score: ${avgQualityScore.toFixed(2)}`;
  }

  private static generateOptimizationRecommendations(results: QualityEnhancementResult[]): string[] {
    const recommendations: string[] = [];
    
    const lowQualityResults = results.filter(r => r.qualityScore < 0.7);
    if (lowQualityResults.length > 0) {
      recommendations.push(`${lowQualityResults.length} prompts could benefit from additional descriptive details`);
    }

    const consistencyIssues = results.filter(r => r.visualConsistencyImprovements.length === 0);
    if (consistencyIssues.length > 0) {
      recommendations.push(`${consistencyIssues.length} prompts lack visual consistency context`);
    }

    if (results.every(r => r.qualityScore > 0.8)) {
      recommendations.push("All prompts are well-optimized for children's book illustration");
    }

    return recommendations;
  }

  // Integration methods for existing systems
  static integrateWithPromptStudio(studioInstance: any): void {
    // Add quality enhancement methods to prompt studio
    if (studioInstance && typeof studioInstance.addEnhancementMethod === 'function') {
      studioInstance.addEnhancementMethod('optimizeForChildrensBooks', this.optimizeForChildrensBooks);
      studioInstance.addEnhancementMethod('validateOptimalSettings', this.validateOptimalSettings);
    }
  }

  // Note: RunwareService integration removed as it's no longer used
}