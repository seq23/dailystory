// Advanced Content Priority Analysis System
// Phase 3: Dynamic content prioritization and user preference optimization

import type { UserInfo, DifficultyLevel } from '@/types';

export interface ContentAnalysis {
  coreElements: string[];          // Essential story elements (characters, main action)
  contextElements: string[];       // Supporting elements (setting, mood)
  styleElements: string[];         // Visual style descriptors
  characterElements: string[];     // Character-specific details
  qualityElements: string[];       // Quality/brand suffixes
}

export interface UserOptimizationPreference {
  prioritizeCharacterConsistency: boolean;  // User wants consistent characters
  preferDetailedStyle: boolean;             // User prefers detailed artistic style
  optimizeForSpeed: boolean;                // User prefers faster generation
  allowStyleReduction: boolean;             // Allow reducing style for length
  maxPromptComplexity: 'minimal' | 'balanced' | 'detailed';
}

export interface OptimizationStrategy {
  targetLength: number;
  priorityWeights: Record<string, number>;
  compressionRules: CompressionRule[];
  fallbackTiers: string[];
}

export interface CompressionRule {
  elementType: keyof ContentAnalysis;
  reductionRatio: number;           // How much to reduce (0-1)
  preserveKeywords: string[];       // Keywords to always keep
  compressionMethod: 'truncate' | 'simplify' | 'remove_adjectives' | 'keep_essentials';
}

export class AdvancedContentPrioritizer {
  
  /**
   * Analyzes content and creates prioritized segments based on importance
   */
  static analyzeContentPriority(
    prompt: string, 
    userInfo: UserInfo, 
    difficultyLevel: DifficultyLevel
  ): ContentAnalysis {
    
    // Extract different types of content using sophisticated analysis
    const coreElements = this.extractCoreElements(prompt, userInfo);
    const contextElements = this.extractContextElements(prompt);
    const styleElements = this.extractStyleElements(prompt, difficultyLevel);
    const characterElements = this.extractCharacterElements(prompt, userInfo);
    const qualityElements = this.extractQualityElements(prompt);
    
    console.log(`🎯 Content analysis complete:`, {
      core: coreElements.length,
      context: contextElements.length, 
      style: styleElements.length,
      character: characterElements.length,
      quality: qualityElements.length
    });
    
    return {
      coreElements,
      contextElements,
      styleElements,
      characterElements,
      qualityElements
    };
  }
  
  /**
   * Creates user-specific optimization strategy
   */
  static createOptimizationStrategy(
    userPreferences: Partial<UserOptimizationPreference>,
    difficultyLevel: DifficultyLevel,
    contentComplexity: number
  ): OptimizationStrategy {
    
    const preferences: UserOptimizationPreference = {
      prioritizeCharacterConsistency: true,
      preferDetailedStyle: difficultyLevel === 'expert' || difficultyLevel === 'hard',
      optimizeForSpeed: false,
      allowStyleReduction: true,
      maxPromptComplexity: 'balanced',
      ...userPreferences
    };
    
    // Determine target length based on user preferences and content complexity
    let targetLength = 2400; // Conservative default
    
    if (preferences.optimizeForSpeed) {
      targetLength = 1800; // Shorter for speed
    } else if (preferences.preferDetailedStyle && contentComplexity < 0.7) {
      targetLength = 2600; // Allow more detail if content isn't complex
    }
    
    // Create priority weights based on user preferences
    const priorityWeights = {
      coreElements: 1.0,                                                    // Always highest priority
      characterElements: preferences.prioritizeCharacterConsistency ? 0.9 : 0.6,
      contextElements: 0.7,
      styleElements: preferences.preferDetailedStyle ? 0.8 : 0.5,
      qualityElements: preferences.optimizeForSpeed ? 0.3 : 0.6
    };
    
    // Create compression rules based on preferences
    const compressionRules: CompressionRule[] = [
      {
        elementType: 'styleElements',
        reductionRatio: preferences.allowStyleReduction ? 0.6 : 0.8,
        preserveKeywords: ['children\'s book', 'illustration', 'safe', 'inclusive'],
        compressionMethod: 'remove_adjectives'
      },
      {
        elementType: 'qualityElements', 
        reductionRatio: 0.4,
        preserveKeywords: ['high quality', 'children\'s book', 'safe'],
        compressionMethod: 'keep_essentials'
      },
      {
        elementType: 'contextElements',
        reductionRatio: 0.7,
        preserveKeywords: ['lighting', 'atmosphere'],
        compressionMethod: 'simplify'
      }
    ];
    
    // Fallback tiers based on user tolerance for quality reduction
    const fallbackTiers = preferences.optimizeForSpeed 
      ? ['minimal', 'core_only']
      : preferences.preferDetailedStyle
      ? ['detailed', 'standard', 'minimal']
      : ['standard', 'minimal'];
    
    console.log(`⚙️ Optimization strategy created:`, {
      targetLength,
      speedOptimized: preferences.optimizeForSpeed,
      characterPriority: preferences.prioritizeCharacterConsistency,
      styleDetailed: preferences.preferDetailedStyle
    });
    
    return {
      targetLength,
      priorityWeights,
      compressionRules,
      fallbackTiers
    };
  }
  
  /**
   * Dynamically compresses content based on optimization strategy
   */
  static optimizeContentWithStrategy(
    analysis: ContentAnalysis,
    strategy: OptimizationStrategy,
    currentLength: number
  ): { optimizedContent: ContentAnalysis; reductionApplied: string[] } {
    
    if (currentLength <= strategy.targetLength) {
      return { optimizedContent: analysis, reductionApplied: [] };
    }
    
    const reductionApplied: string[] = [];
    const optimizedContent = { ...analysis };
    
    // Apply compression rules in order of priority (lowest priority first)
    const sortedRules = strategy.compressionRules.sort((a, b) => 
      strategy.priorityWeights[a.elementType] - strategy.priorityWeights[b.elementType]
    );
    
    for (const rule of sortedRules) {
      const elements = optimizedContent[rule.elementType];
      if (elements.length === 0) continue;
      
      const compressed = this.compressElements(elements, rule);
      optimizedContent[rule.elementType] = compressed;
      
      const newLength = this.calculateContentLength(optimizedContent);
      reductionApplied.push(`${rule.elementType}: ${rule.compressionMethod}`);
      
      console.log(`🗜️ Applied ${rule.compressionMethod} to ${rule.elementType}: ${currentLength} → ${newLength} chars`);
      
      if (newLength <= strategy.targetLength) {
        break;
      }
    }
    
    return { optimizedContent, reductionApplied };
  }
  
  // Private helper methods
  
  private static extractCoreElements(prompt: string, userInfo: UserInfo): string[] {
    const coreKeywords = [
      // Character names and basic identity
      userInfo.name || 'character',
      userInfo.avatar.type || 'child',
      
      // Action verbs (essential for scene understanding)
      ...this.extractActionWords(prompt),
      
      // Main subjects/objects that define the scene
      ...this.extractMainSubjects(prompt)
    ];
    
    return coreKeywords.filter(Boolean);
  }
  
  private static extractContextElements(prompt: string): string[] {
    const contextPatterns = [
      /\b(in|at|during|near|under|over|through)\s+[\w\s]+/gi,  // Location/time phrases
      /\b(bright|dark|sunny|cloudy|warm|cold)\s+[\w\s]+/gi,    // Atmospheric conditions
      /\b(morning|afternoon|evening|night|day|time)\b/gi       // Time indicators
    ];
    
    const elements: string[] = [];
    contextPatterns.forEach(pattern => {
      const matches = prompt.match(pattern) || [];
      elements.push(...matches);
    });
    
    return elements;
  }
  
  private static extractStyleElements(prompt: string, difficultyLevel: DifficultyLevel): string[] {
    // Style framework now handled server-side - extract from existing prompt
    const styleKeywords = prompt.match(/\b(illustration|digital|painting|artistic|sophisticated|simple|colorful|vibrant|detailed|complex|children|book)\w*/gi) || [];
    
    // Add default style elements based on difficulty level
    const defaultStyles = {
      'beginner': ['simple', 'colorful', 'children'],
      'easy': ['bright', 'cheerful', 'illustration'],
      'medium': ['detailed', 'artistic', 'book'],
      'hard': ['sophisticated', 'complex', 'digital'],
      'expert': ['masterful', 'intricate', 'painting']
    };
    
    return [...styleKeywords, ...(defaultStyles[difficultyLevel] || [])];
  }
  
  private static extractCharacterElements(prompt: string, userInfo: UserInfo): string[] {
    const characterPatterns = [
      new RegExp(`\\b${userInfo.name || 'character'}\\b`, 'gi'),
      /\b(boy|girl|child|character)\b/gi,
      /\b(skin tone|complexion|features|appearance)\b/gi,
      /\b(consistent|same|throughout)\b/gi
    ];
    
    const elements: string[] = [];
    characterPatterns.forEach(pattern => {
      const matches = prompt.match(pattern) || [];
      elements.push(...matches);
    });
    
    return elements;
  }
  
  private static extractQualityElements(prompt: string): string[] {
    const qualityPatterns = [
      /\b(high quality|professional|award[- ]winning|masterful|museum[- ]quality)\b/gi,
      /\b(children\'s book|illustration|artwork|art style)\b/gi,
      /\b(safe|wholesome|appropriate|inclusive|diverse)\b/gi
    ];
    
    const elements: string[] = [];
    qualityPatterns.forEach(pattern => {
      const matches = prompt.match(pattern) || [];
      elements.push(...matches);
    });
    
    return elements;
  }
  
  private static extractActionWords(prompt: string): string[] {
    const actionPattern = /\b(showing|playing|reading|running|jumping|sitting|standing|walking|exploring|discovering|learning|creating|building|helping|sharing)\b/gi;
    return prompt.match(actionPattern) || [];
  }
  
  private static extractMainSubjects(prompt: string): string[] {
    const subjectPattern = /\b(cat|dog|bear|rabbit|bird|dragon|monster|robot|princess|prince|wizard|teacher|parent|friend|toy|book|ball|tree|house|car|bike)\b/gi;
    return prompt.match(subjectPattern) || [];
  }
  
  private static compressElements(elements: string[], rule: CompressionRule): string[] {
    switch (rule.compressionMethod) {
      case 'remove_adjectives':
        return elements.map(el => this.removeAdjectives(el, rule.preserveKeywords));
        
      case 'keep_essentials':
        return elements.filter(el => 
          rule.preserveKeywords.some(keyword => 
            el.toLowerCase().includes(keyword.toLowerCase())
          )
        );
        
      case 'simplify':
        return elements.map(el => this.simplifyElement(el)).slice(0, Math.floor(elements.length * rule.reductionRatio));
        
      case 'truncate':
        return elements.slice(0, Math.floor(elements.length * rule.reductionRatio));
        
      default:
        return elements;
    }
  }
  
  private static removeAdjectives(text: string, preserveKeywords: string[]): string {
    // Remove excessive adjectives while preserving essential keywords
    const words = text.split(' ');
    const essential = words.filter(word => 
      preserveKeywords.some(keyword => 
        word.toLowerCase().includes(keyword.toLowerCase())
      ) || 
      this.isEssentialWord(word)
    );
    
    return essential.join(' ');
  }
  
  private static simplifyElement(element: string): string {
    // Simplify complex phrases to essential meaning
    return element
      .replace(/\b(extremely|incredibly|absolutely|completely|totally|very|quite|rather|highly|exceptionally)\s+/gi, '')
      .replace(/\b(beautiful|gorgeous|stunning|amazing|fantastic|wonderful|excellent|perfect|masterful)\b/gi, 'quality')
      .trim();
  }
  
  private static isEssentialWord(word: string): boolean {
    const essentialWords = ['children', 'book', 'illustration', 'safe', 'character', 'quality', 'art', 'style'];
    return essentialWords.some(essential => word.toLowerCase().includes(essential));
  }
  
  private static calculateContentLength(analysis: ContentAnalysis): number {
    const allElements = [
      ...analysis.coreElements,
      ...analysis.contextElements,
      ...analysis.styleElements,
      ...analysis.characterElements,
      ...analysis.qualityElements
    ];
    
    return allElements.join(' ').length;
  }
}