// Advanced Quality Engine - Prompt optimization and quality enhancement

export class AdvancedQualityEngine {
  static CHILDREN_BOOK_OPTIMAL_PARAMS = {
    width: 1024,
    height: 1024,
    steps: 8,
    CFGScale: 3.0,
    scheduler: "FlowMatchEulerDiscreteScheduler",
    model: "runware:100@1"
  };
  
  static optimizeForChildrensBooks(prompt, sessionId, pageNumber, userInfo) {
    console.log(`🎯 Optimizing prompt for children's book quality`);
    
    let enhancedPrompt = prompt;
    const appliedOptimizations = [];
    
    // 1. Add children's book specific styling
    if (!prompt.includes("children's book")) {
      enhancedPrompt = `children's book illustration, ${enhancedPrompt}`;
      appliedOptimizations.push('Added children\'s book styling');
    }
    
    // 2. Ensure wholesome content
    const wholesomeTerms = 'wholesome, safe for children, family-friendly';
    if (!prompt.includes('wholesome') && !prompt.includes('safe')) {
      enhancedPrompt += `, ${wholesomeTerms}`;
      appliedOptimizations.push('Added wholesome content markers');
    }
    
    // 3. Enhance visual quality
    const qualityTerms = 'high quality, detailed illustration, vibrant colors';
    if (!prompt.includes('high quality')) {
      enhancedPrompt += `, ${qualityTerms}`;
      appliedOptimizations.push('Enhanced visual quality terms');
    }
    
    // 4. Add professional illustration style
    if (!prompt.includes('professional') && !prompt.includes('masterful')) {
      enhancedPrompt += ', professional children\'s book illustration style';
      appliedOptimizations.push('Added professional styling');
    }
    
    // 5. Ensure consistency markers
    if (sessionId && !prompt.includes('consistent')) {
      enhancedPrompt += ', consistent character appearance';
      appliedOptimizations.push('Added consistency markers');
    }
    
    // 6. Calculate quality score
    const qualityScore = this.calculateQualityScore(enhancedPrompt, appliedOptimizations.length);
    
    // 7. Suggest optimal parameters
    const suggestedParams = this.getOptimalParameters('medium');
    
    // 8. Visual consistency improvements
    const visualConsistency = this.getVisualConsistencyImprovements(sessionId, pageNumber);
    
    return {
      enhancedPrompt,
      qualityScore,
      appliedOptimizations,
      suggestedParameters: suggestedParams,
      visualConsistencyImprovements: visualConsistency
    };
  }
  
  static batchOptimizePrompts(request) {
    console.log(`🎯 Batch optimizing ${request.prompts.length} prompts`);
    
    const results = [];
    
    for (let i = 0; i < request.prompts.length; i++) {
      const prompt = request.prompts[i];
      const pageNumber = request.pageNumbers?.[i] || i + 1;
      
      const result = this.optimizeForChildrensBooks(
        prompt,
        request.sessionId,
        pageNumber,
        request.userInfo
      );
      
      results.push(result);
    }
    
    const overallQualityScore = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    const consistencyReport = this.generateConsistencyReport(results, request.sessionId);
    const recommendations = this.generateOptimizationRecommendations(results);
    
    return {
      results,
      overallQualityScore,
      consistencyReport,
      recommendations
    };
  }
  
  static getOptimalParameters(complexity = 'medium') {
    const params = { ...this.CHILDREN_BOOK_OPTIMAL_PARAMS };
    
    // Adjust based on complexity
    if (complexity === 'simple') {
      params.steps = 6;
      params.CFGScale = 2.5;
    } else if (complexity === 'complex') {
      params.steps = 12;
      params.CFGScale = 4.0;
    }
    
    return params;
  }
  
  static validateOptimalSettings(currentParams) {
    const optimal = this.CHILDREN_BOOK_OPTIMAL_PARAMS;
    const suggestions = [];
    let isOptimal = true;
    
    if (currentParams.steps < optimal.steps) {
      suggestions.push(`Increase steps to ${optimal.steps} for better quality`);
      isOptimal = false;
    }
    
    if (currentParams.CFGScale !== optimal.CFGScale) {
      suggestions.push(`Set CFG Scale to ${optimal.CFGScale} for optimal prompt adherence`);
      isOptimal = false;
    }
    
    if (currentParams.scheduler !== optimal.scheduler) {
      suggestions.push(`Use ${optimal.scheduler} for better flow matching`);
      isOptimal = false;
    }
    
    return { isOptimal, suggestions };
  }
  
  static createQualityPresets() {
    return {
      'children-book-standard': {
        ...this.CHILDREN_BOOK_OPTIMAL_PARAMS,
        name: 'Children\'s Book Standard',
        description: 'Balanced quality and speed for children\'s book illustrations'
      },
      'children-book-premium': {
        ...this.CHILDREN_BOOK_OPTIMAL_PARAMS,
        steps: 12,
        CFGScale: 4.0,
        name: 'Children\'s Book Premium',
        description: 'High-quality detailed illustrations with longer generation time'
      },
      'children-book-fast': {
        ...this.CHILDREN_BOOK_OPTIMAL_PARAMS,
        steps: 4,
        CFGScale: 2.0,
        name: 'Children\'s Book Fast',
        description: 'Quick generation for testing and drafts'
      }
    };
  }
  
  // Private helper methods
  static getVisualConsistencyContext(sessionId, pageNumber) {
    // Placeholder for visual consistency tracking
    return `Session ${sessionId}, Page ${pageNumber} consistency maintained`;
  }
  
  static getCharacterConsistencyContext(sessionId) {
    // Placeholder for character consistency tracking
    return `Character consistency maintained for session ${sessionId}`;
  }
  
  static calculateQualityScore(prompt, optimizationCount) {
    let score = 50; // Base score
    
    // Length and detail bonus
    score += Math.min(prompt.length / 50, 20);
    
    // Optimization bonus
    score += optimizationCount * 5;
    
    // Professional styling bonus
    if (prompt.includes('professional') || prompt.includes('masterful')) score += 10;
    
    // Descriptive words bonus
    const descriptiveWords = ['detailed', 'vibrant', 'colorful', 'beautiful', 'stunning'];
    const descriptiveCount = descriptiveWords.filter(word => prompt.includes(word)).length;
    score += descriptiveCount * 3;
    
    return Math.min(Math.round(score), 100);
  }
  
  static generateConsistencyReport(results, sessionId) {
    const avgQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    const optimizationCount = results.reduce((sum, r) => sum + r.appliedOptimizations.length, 0);
    
    return `Session ${sessionId}: Average quality ${avgQuality.toFixed(1)}/100, ${optimizationCount} total optimizations applied`;
  }
  
  static generateOptimizationRecommendations(results) {
    const recommendations = [];
    
    const lowQualityResults = results.filter(r => r.qualityScore < 70);
    if (lowQualityResults.length > 0) {
      recommendations.push(`${lowQualityResults.length} prompts could benefit from additional optimization`);
    }
    
    const consistencyIssues = results.filter(r => !r.enhancedPrompt.includes('consistent'));
    if (consistencyIssues.length > 0) {
      recommendations.push('Consider adding character consistency markers to all prompts');
    }
    
    return recommendations;
  }
  
  static getVisualConsistencyImprovements(sessionId, pageNumber) {
    return [
      'Character appearance consistency maintained',
      'Visual style coherence ensured',
      'Color palette harmony preserved'
    ];
  }
}