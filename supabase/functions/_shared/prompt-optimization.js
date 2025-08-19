
// Phase 3: Prompt Overhaul System
// Smart deduplication and token budget management

export class PromptOptimizationEngine {
  // Token limits by difficulty level
  static TOKEN_LIMITS = {
    beginner: 150,
    easy: 200,
    medium: 250,
    hard: 300,
    expert: 350
  };

  // Essential quality keywords that should never be removed
  static PROTECTED_KEYWORDS = [
    'children', 'book', 'illustration', 'vibrant', 'friendly', 
    'safe', 'educational', 'colorful', 'bright', 'clear'
  ];

  /**
   * Remove duplicate phrases and redundant descriptors
   */
  static deduplicatePrompt(prompt) {
    // Split into segments for analysis
    const segments = prompt.split(/[,;\.]\s*/);
    const seen = new Set();
    const deduplicated = [];

    for (const segment of segments) {
      const normalized = segment.toLowerCase().trim();
      
      // Skip empty segments
      if (!normalized) continue;
      
      // Check for duplicates or very similar phrases
      const isDuplicate = Array.from(seen).some(existing => {
        return this.calculateSimilarity(normalized, existing) > 0.8;
      });

      if (!isDuplicate) {
        seen.add(normalized);
        deduplicated.push(segment.trim());
      }
    }

    return deduplicated.join(', ');
  }

  /**
   * Calculate similarity between two text segments
   */
  static calculateSimilarity(text1, text2) {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Estimate token count (rough approximation)
   */
  static estimateTokenCount(text) {
    // Rough estimation: 1 token ≈ 0.75 words for English
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount * 0.75);
  }

  /**
   * Optimize prompt within token budget
   */
  static optimizeForTokenBudget(prompt, difficulty = 'medium') {
    const maxTokens = this.TOKEN_LIMITS[difficulty] || this.TOKEN_LIMITS.medium;
    let optimized = this.deduplicatePrompt(prompt);
    
    // If still over budget, trim non-essential parts
    if (this.estimateTokenCount(optimized) > maxTokens) {
      optimized = this.trimToTokenBudget(optimized, maxTokens);
    }

    return optimized;
  }

  /**
   * Trim prompt to fit token budget while preserving essential elements
   */
  static trimToTokenBudget(prompt, maxTokens) {
    const segments = prompt.split(/,\s*/);
    const essential = [];
    const optional = [];

    // Categorize segments by importance
    for (const segment of segments) {
      const isEssential = this.PROTECTED_KEYWORDS.some(keyword => 
        segment.toLowerCase().includes(keyword)
      ) || segment.includes(':') || // Character descriptions
         segment.match(/\b(girl|boy|child|character)\b/i);

      if (isEssential) {
        essential.push(segment);
      } else {
        optional.push(segment);
      }
    }

    // Start with essential segments
    let result = essential.join(', ');
    
    // Add optional segments until we hit the budget
    for (const segment of optional) {
      const candidate = result + ', ' + segment;
      if (this.estimateTokenCount(candidate) <= maxTokens) {
        result = candidate;
      } else {
        break;
      }
    }

    return result;
  }

  /**
   * Smart keyword prioritization based on context
   */
  static prioritizeKeywords(prompt, context = {}) {
    const priorityMap = {
      character: ['friendly', 'expressive', 'clear features', 'detailed face'],
      scene: ['vibrant', 'detailed background', 'clear composition'],
      emotion: ['happy', 'joyful', 'warm', 'inviting'],
      quality: ['high quality', 'professional', 'crisp', 'detailed']
    };

    let enhanced = prompt;
    
    // Add priority keywords based on context
    if (context.hasCharacter && !enhanced.includes('friendly')) {
      enhanced = 'friendly character, ' + enhanced;
    }
    
    if (context.isActionScene && !enhanced.includes('dynamic')) {
      enhanced = enhanced + ', dynamic composition';
    }

    return enhanced;
  }

  /**
   * Validate prompt quality and completeness
   */
  static validatePrompt(prompt, requirements = {}) {
    const validation = {
      isValid: true,
      warnings: [],
      suggestions: []
    };

    // Check for essential elements
    if (requirements.needsCharacter && !prompt.match(/\b(girl|boy|child|character)\b/i)) {
      validation.warnings.push('Missing character description');
    }

    if (requirements.needsSetting && !prompt.match(/\b(forest|park|home|school|garden)\b/i)) {
      validation.warnings.push('Missing setting information');
    }

    // Check for negative terms in positive prompt
    const negativeTerms = ['not', 'no ', 'without', 'avoid', 'exclude'];
    if (negativeTerms.some(term => prompt.toLowerCase().includes(term))) {
      validation.warnings.push('Contains negative terms in positive prompt');
      validation.suggestions.push('Move negative terms to negative prompt');
    }

    // Check token count
    const tokenCount = this.estimateTokenCount(prompt);
    if (tokenCount > 300) {
      validation.warnings.push(`Prompt may be too long (${tokenCount} estimated tokens)`);
      validation.suggestions.push('Consider using prompt optimization');
    }

    return validation;
  }
}
