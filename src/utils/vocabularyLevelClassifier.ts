/**
 * Enhanced vocabulary level classifier for better reading level progression
 */

export interface WordDifficultyLevel {
  level: 1 | 2 | 3 | 4 | 5;
  shouldHighlight: boolean;
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export class VocabularyLevelClassifier {
  
  // Pre-K to 1st grade sight words (Level 1)
  private static level1Words = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'he', 'in', 'is', 'it', 'of', 'on', 'or', 'she', 'the', 'to', 'up', 'we', 'all', 'but', 'can', 'had', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'cat', 'dog', 'fun', 'get', 'got', 'her', 'let', 'man', 'mom', 'not', 'out', 'red', 'run', 'saw', 'say', 'sit', 'sun', 'ten', 'top', 'try', 'use', 'was', 'win', 'yes', 'you', 'big', 'car', 'day', 'end', 'far', 'good', 'home', 'like', 'look', 'make', 'play', 'want', 'come', 'go', 'here', 'this', 'that', 'what', 'when', 'where'
  ]);

  // 2nd grade words (Level 2)
  private static level2Words = new Set([
    'about', 'after', 'again', 'air', 'also', 'any', 'back', 'because', 'before', 'best', 'black', 'book', 'both', 'box', 'bring', 'call', 'came', 'color', 'could', 'did', 'do', 'does', 'don', 'door', 'down', 'each', 'end', 'even', 'every', 'find', 'first', 'five', 'found', 'four', 'friend', 'girl', 'give', 'great', 'green', 'hand', 'help', 'here', 'house', 'just', 'keep', 'kind', 'know', 'last', 'left', 'line', 'little', 'live', 'long', 'made', 'many', 'most', 'move', 'much', 'must', 'name', 'never', 'next', 'night', 'only', 'open', 'other', 'over', 'own', 'people', 'place', 'put', 'read', 'right', 'said', 'same', 'school', 'seem', 'show', 'small', 'such', 'take', 'than', 'them', 'these', 'they', 'thing', 'think', 'those', 'three', 'through', 'time', 'today', 'together', 'took', 'turn', 'under', 'until', 'very', 'water', 'well', 'went', 'were', 'while', 'white', 'with', 'work', 'world', 'would', 'write', 'year', 'your'
  ]);

  // 3rd grade words (Level 3)
  private static level3Words = new Set([
    'always', 'around', 'away', 'beautiful', 'being', 'believe', 'between', 'buy', 'family', 'few', 'friends', 'happy', 'important', 'learn', 'listen', 'money', 'morning', 'perhaps', 'picture', 'piece', 'pretty', 'probably', 'question', 'quite', 'really', 'remember', 'should', 'something', 'sometimes', 'soon', 'story', 'thought', 'tonight', 'too', 'tried', 'trouble', 'trying', 'walk', 'watch', 'without', 'wonder', 'young', 'animal', 'another', 'anything', 'birthday', 'brother', 'child', 'children', 'different', 'enough', 'everyone', 'everything', 'father', 'getting', 'heard', 'however', 'outside', 'person', 'sound', 'special', 'started', 'still', 'stopped', 'surprised', 'walking', 'wanted', 'wearing', 'whole', 'yourself'
  ]);

  // 4th-5th grade words (Level 4)
  private static level4Words = new Set([
    'although', 'another', 'beginning', 'caught', 'certainly', 'especially', 'everything', 'exercise', 'experience', 'favorite', 'finally', 'frightened', 'happened', 'immediately', 'interesting', 'knowledge', 'language', 'library', 'minutes', 'nothing', 'once', 'opportunity', 'perfect', 'positive', 'possible', 'problem', 'quickly', 'recognize', 'remember', 'science', 'serious', 'several', 'strange', 'suddenly', 'terrible', 'therefore', 'understand', 'unusual', 'vacation', 'wonderful', 'adventure', 'beautiful', 'calendar', 'dangerous', 'elephant', 'festival', 'government', 'hospital', 'important', 'jealous', 'kindness', 'lightning', 'mountain', 'neighbor', 'opposite', 'peaceful', 'question', 'resource', 'strength', 'treasure', 'umbrella', 'valuable', 'whisper', 'exciting', 'yesterday', 'zebra'
  ]);

  /**
   * Determine if a word should be highlighted based on difficulty level
   */
  static getWordDifficulty(word: string, userLevel: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'): WordDifficultyLevel {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    
    // Determine word's inherent level
    let wordLevel: 1 | 2 | 3 | 4 | 5;
    
    if (this.level1Words.has(cleanWord)) {
      wordLevel = 1;
    } else if (this.level2Words.has(cleanWord)) {
      wordLevel = 2;
    } else if (this.level3Words.has(cleanWord)) {
      wordLevel = 3;
    } else if (this.level4Words.has(cleanWord)) {
      wordLevel = 4;
    } else {
      // Advanced/unknown words
      wordLevel = this.calculateWordComplexity(cleanWord);
    }
    
    // Determine if word should be highlighted based on user level
    const shouldHighlight = this.shouldHighlightWord(wordLevel, userLevel);
    
    // Determine complexity description
    const complexity = this.getComplexityDescription(wordLevel);
    
    return {
      level: wordLevel,
      shouldHighlight,
      complexity
    };
  }
  
  /**
   * Calculate word complexity for unknown words
   */
  private static calculateWordComplexity(word: string): 1 | 2 | 3 | 4 | 5 {
    const length = word.length;
    const syllableCount = this.estimateSyllables(word);
    
    // Simple heuristic based on length and estimated syllables
    if (length <= 3 && syllableCount <= 1) return 1;
    if (length <= 5 && syllableCount <= 2) return 2;
    if (length <= 7 && syllableCount <= 3) return 3;
    if (length <= 10 && syllableCount <= 4) return 4;
    return 5;
  }
  
  /**
   * Estimate syllable count for complexity calculation
   */
  private static estimateSyllables(word: string): number {
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      const isVowel = vowels.includes(char);
      
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent 'e'
    if (word.endsWith('e') && syllableCount > 1) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  }
  
  /**
   * LEAN Progressive Thresholds - Interactive Word Rules Overhaul
   * Educational progression: More interaction for beginners, selective for advanced
   */
  private static shouldHighlightWord(wordLevel: number, userLevel: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'): boolean {
    switch (userLevel) {
      case 'beginner':
        // 100% interactive - all words are learning opportunities
        return true;
        
      case 'easy':
        // 60% interactive - level 1.5+ (most words except easiest sight words)
        return wordLevel >= 2;
        
      case 'medium':
        // 40% interactive - level 2.5+ (focus on intermediate+ vocabulary)
        return wordLevel >= 3;
        
      case 'hard':
        // 25% interactive - level 3.5+ (advanced vocabulary only)
        return wordLevel >= 4;
        
      case 'expert':
        // 15% interactive - level 4.5+ (expert vocabulary only)
        return wordLevel >= 5;
        
      default:
        // Conservative fallback
        return wordLevel >= 3;
    }
  }
  
  /**
   * Get complexity description for word
   */
  private static getComplexityDescription(level: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    switch (level) {
      case 1:
      case 2:
        return 'beginner';
      case 3:
        return 'intermediate';
      case 4:
        return 'advanced';
      case 5:
      default:
        return 'expert';
    }
  }
  
  /**
   * Get recommended vocabulary complexity for reading level
   * Enhanced for progressive difficulty stepping
   */
  static getRecommendedComplexity(userLevel: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'): {
    primary: number[];
    secondary: number[];
    avoid: number[];
  } {
    switch (userLevel) {
      case 'beginner':
        return {
          primary: [1], // Ultra-simple sight words only (95%+)
          secondary: [], // No secondary words
          avoid: [2, 3, 4, 5] // Avoid everything above level 1
        };
        
      case 'easy':
        return {
          primary: [1], // Mostly sight words (85-90%)
          secondary: [], // No secondary words for pure beginners
          avoid: [3, 4, 5] // Avoid anything above level 2
        };
        
      case 'medium':
        return {
          primary: [1], // Foundation sight words (70-75%)
          secondary: [2], // Gradual introduction of 2nd grade words (20-25%)
          avoid: [4, 5] // Avoid advanced words completely
        };
        
      case 'hard':
        return {
          primary: [1, 2], // Strong foundation (60-70%)
          secondary: [3], // Building 3rd grade vocabulary (25-30%)
          avoid: [5] // Avoid expert level only
        };
        
      case 'expert':
        return {
          primary: [1, 2, 3], // Comprehensive foundation (50-60%)
          secondary: [4], // Advanced vocabulary (30-40%)
          avoid: [] // No restrictions, can handle level 5
        };
        
      default:
        return {
          primary: [1],
          secondary: [2],
          avoid: [4, 5]
        };
    }
  }

  /**
   * Check if vocabulary distribution is appropriate for reading level
   */
  static validateVocabularyDistribution(
    words: string[], 
    userLevel: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'
  ): {
    isValid: boolean;
    issues: string[];
    distribution: Record<number, number>;
  } {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const issues: string[] = [];
    
    // Analyze each word
    words.forEach(word => {
      const difficulty = this.getWordDifficulty(word, userLevel);
      distribution[difficulty.level]++;
    });
    
    const totalWords = words.length;
    const recommendations = this.getRecommendedComplexity(userLevel);
    
    // Calculate percentages
    const level2Plus = (distribution[2] + distribution[3] + distribution[4] + distribution[5]) / totalWords;
    const level3Plus = (distribution[3] + distribution[4] + distribution[5]) / totalWords;
    const level4Plus = (distribution[4] + distribution[5]) / totalWords;
    
    // Validate based on reading level
    switch (userLevel) {
      case 'beginner':
        if (level2Plus > 0.05) {
          issues.push(`Too many level 2+ words (${(level2Plus * 100).toFixed(1)}%) for beginner pre-reading`);
        }
        break;
        
      case 'easy':
        if (level2Plus > 0.15) {
          issues.push(`Too many level 2+ words (${(level2Plus * 100).toFixed(1)}%) for easy reading`);
        }
        break;
        
      case 'medium':
        if (level3Plus > 0.15) {
          issues.push(`Too many level 3+ words (${(level3Plus * 100).toFixed(1)}%) for medium reading transition`);
        }
        break;
        
      case 'hard':
        if (level4Plus > 0.25) {
          issues.push(`Too many level 4+ words (${(level4Plus * 100).toFixed(1)}%) for hard reading`);
        }
        break;
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      distribution
    };
  }
}