// Story quality checker to ensure consistent quality standards
// Grammar validation removed - now handled by edge functions using sophisticated validateAndEnhanceGrammar system

interface QualityIssue {
  type: 'grammar' | 'flow' | 'structure' | 'readability';
  severity: 'error' | 'warning' | 'info';
  message: string;
  pageIndex?: number;
  suggestion?: string;
}

export class StoryQualityChecker {
  
  /**
   * Comprehensive quality check for story pages (grammar validation moved to edge functions)
   */
  static checkStoryQuality(pages: string[], difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'): {
    isValid: boolean;
    issues: QualityIssue[];
    score: number;
  } {
    const issues: QualityIssue[] = [];
    
    // 1. Grammar validation moved to edge functions for consistency
    
    // 2. Story flow validation
    const flowIssues = this.checkStoryFlow(pages);
    issues.push(...flowIssues);
    
    // 3. Reading level appropriateness
    const readabilityIssues = this.checkReadabilityLevel(pages, difficulty);
    issues.push(...readabilityIssues);
    
    // 4. Structural validation
    const structureIssues = this.checkStoryStructure(pages);
    issues.push(...structureIssues);
    
    // Calculate quality score (0-100)
    const score = this.calculateQualityScore(issues);
    
    return {
      isValid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      score
    };
  }
  
  /**
   * Check story flow and transitions between pages
   */
  private static checkStoryFlow(pages: string[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    for (let i = 0; i < pages.length - 1; i++) {
      const currentPage = pages[i];
      const nextPage = pages[i + 1];
      
      // Check for abrupt topic changes
      if (this.hasAbruptTransition(currentPage, nextPage)) {
        issues.push({
          type: 'flow',
          severity: 'warning',
          message: `Abrupt transition between pages ${i + 1} and ${i + 2}`,
          pageIndex: i + 1,
          suggestion: 'Add transitional phrases or connecting ideas'
        });
      }
      
      // Check for repetitive content
      if (this.hasRepetitiveContent(currentPage, nextPage)) {
        issues.push({
          type: 'flow',
          severity: 'warning',
          message: `Repetitive content between pages ${i + 1} and ${i + 2}`,
          pageIndex: i + 1,
          suggestion: 'Vary sentence structure and vocabulary'
        });
      }
    }

    // Check narrative flow
    const narrativeIssues = this.checkNarrativeFlow(pages);
    issues.push(...narrativeIssues);
    
    return issues;
  }

  /**
   * Check for proper narrative flow and children's book patterns
   */
  private static checkNarrativeFlow(pages: string[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    // Check for story arc progression
    const hasSetup = pages.slice(0, Math.ceil(pages.length * 0.3));
    const hasDevelopment = pages.slice(Math.ceil(pages.length * 0.3), Math.ceil(pages.length * 0.8));
    const hasResolution = pages.slice(Math.ceil(pages.length * 0.8));
    
    // Check for character consistency throughout story
    const allCharacters = new Set<string>();
    pages.forEach(page => {
      const characters = this.extractCharacterNames(page);
      characters.forEach(char => allCharacters.add(char));
    });
    
    if (allCharacters.size === 0) {
      issues.push({
        type: 'flow',
        severity: 'warning',
        message: 'Story lacks clear character development',
        suggestion: 'Ensure main character is consistently present and referenced'
      });
    }
    
    // Check for children's book patterns (predictability, repetition)
    const hasRepetitiveStructure = this.hasChildrensBookPattern(pages);
    if (!hasRepetitiveStructure) {
      issues.push({
        type: 'flow',
        severity: 'info',
        message: 'Story could benefit from more predictable children\'s book patterns',
        suggestion: 'Consider adding repetitive phrases or structures that children enjoy'
      });
    }
    
    return issues;
  }

  /**
   * Check if story follows children's book patterns
   */
  private static hasChildrensBookPattern(pages: string[]): boolean {
    // Look for repetitive patterns children love
    const patterns = [];
    
    pages.forEach(page => {
      // Extract sentence structure patterns
      const words = page.toLowerCase().split(/\s+/);
      if (words.length > 0) {
        patterns.push(words[0]); // First word of each page
      }
    });
    
    // Check if there's some repetitive structure
    const patternCounts: Record<string, number> = {};
    patterns.forEach(pattern => {
      patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    });
    
    // Good children's books often have some repetitive elements
    return Object.values(patternCounts).some(count => count >= 2);
  }
  
  /**
   * Check if content is appropriate for the reading level
   */
  private static checkReadabilityLevel(pages: string[], difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    // Upper-end target word count ranges (what we aim for)
    const idealWordCounts = {
      beginner: { min: 5, max: 6 }, // 1 sentence × 2-6 words = target 6 words
      easy: { min: 20, max: 24 },   // 1-2 sentences × 4-12 words = target 24 words
      medium: { min: 40, max: 45 }, // 2-3 sentences × 5-15 words = target 45 words
      hard: { min: 75, max: 80 },   // 3-4 sentences × variable = target 80 words
      expert: { min: 95, max: 100 } // 4-5 sentences × advanced = target 100+ words
    };
    
    // Flexible ranges with margin of error for natural flow
    const flexibleWordCounts = {
      beginner: { min: 2, max: 8 },     // Strict for learning (2-8 words)
      easy: { min: 18, max: 30 },       // Keep current with hard limit
      medium: { min: 45, max: 80 },     // Allow 50-70 + creative flexibility
      hard: { min: 70, max: 130 },      // Allow 80-120 + creative flexibility
      expert: { min: 110, max: 220 }    // Allow 120-200 + creative flexibility
    };
    
    const ideal = idealWordCounts[difficulty] || idealWordCounts.easy;
    const flexible = flexibleWordCounts[difficulty] || flexibleWordCounts.easy;
    
    pages.forEach((page, index) => {
      const wordCount = page.split(/\s+/).length;
      
      // Only flag as problematic if outside flexible range
      if (wordCount < flexible.min) {
        issues.push({
          type: 'readability',
          severity: 'warning',
          message: `Page ${index + 1} has only ${wordCount} words (too short for ${difficulty} level, minimum ${flexible.min})`,
          pageIndex: index + 1,
          suggestion: 'Add more content appropriate for the reading level'
        });
      } else if (wordCount > flexible.max) {
        issues.push({
          type: 'readability', 
          severity: 'warning',
          message: `Page ${index + 1} has ${wordCount} words (too long for ${difficulty} level, maximum ${flexible.max})`,
          pageIndex: index + 1,
          suggestion: 'Consider breaking into multiple pages or simplifying'
        });
      } else if (wordCount < ideal.min || wordCount > ideal.max) {
        // Within flexible range but outside ideal - minor issue
        issues.push({
          type: 'readability',
          severity: 'info', // Reduced severity for natural flow
          message: `Page ${index + 1} has ${wordCount} words (acceptable but outside ideal ${ideal.min}-${ideal.max} range)`,
          pageIndex: index + 1,
          suggestion: 'Consider minor adjustments for optimal reading level'
        });
      }
    });
    
    return issues;
  }
  
  /**
   * Check basic story structure
   */
  private static checkStoryStructure(pages: string[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    if (pages.length === 0) {
      issues.push({
        type: 'structure',
        severity: 'error',
        message: 'Story has no pages',
        suggestion: 'Generate story content'
      });
      return issues;
    }
    
    // Check for proper story ending
    const lastPage = pages[pages.length - 1];
    if (!this.hasProperEnding(lastPage)) {
      issues.push({
        type: 'structure',
        severity: 'info',
        message: 'Story may need a more conclusive ending',
        pageIndex: pages.length,
        suggestion: 'Consider adding a clear resolution or conclusion'
      });
    }
    
    // Check for character consistency
    const characterConsistencyIssues = this.checkCharacterConsistency(pages);
    issues.push(...characterConsistencyIssues);
    
    return issues;
  }
  
  /**
   * Detect abrupt transitions between pages
   */
  private static hasAbruptTransition(page1: string, page2: string): boolean {
    // Simple heuristic: check if there are common connecting words or themes
    const transitionWords = ['then', 'next', 'after', 'later', 'suddenly', 'meanwhile', 'soon', 'finally'];
    const page2Lower = page2.toLowerCase();
    
    // Extract key nouns from page 1
    const page1Nouns = this.extractKeyNouns(page1);
    const page2Nouns = this.extractKeyNouns(page2);
    
    // Check if there's any continuity
    const hasTransitionWord = transitionWords.some(word => page2Lower.includes(word));
    const hasSharedNouns = page1Nouns.some(noun => page2Nouns.includes(noun));
    
    return !hasTransitionWord && !hasSharedNouns && page1Nouns.length > 0;
  }
  
  /**
   * Check for repetitive content
   */
  private static hasRepetitiveContent(page1: string, page2: string): boolean {
    const words1 = page1.toLowerCase().split(/\s+/);
    const words2 = page2.toLowerCase().split(/\s+/);
    
    // Check for high overlap in content words (excluding common words)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const contentWords1 = words1.filter(word => !commonWords.includes(word) && word.length > 2);
    const contentWords2 = words2.filter(word => !commonWords.includes(word) && word.length > 2);
    
    if (contentWords1.length === 0 || contentWords2.length === 0) return false;
    
    const overlap = contentWords1.filter(word => contentWords2.includes(word)).length;
    const overlapRatio = overlap / Math.min(contentWords1.length, contentWords2.length);
    
    return overlapRatio > 0.6; // More than 60% overlap suggests repetition
  }
  
  /**
   * Check if story has a proper ending
   */
  private static hasProperEnding(lastPage: string): boolean {
    const endingPhrases = ['the end', 'happily ever after', 'lived happily', 'forever friends', 'best day ever', 'perfect day', 'wonderful day'];
    const lastPageLower = lastPage.toLowerCase();
    
    return endingPhrases.some(phrase => lastPageLower.includes(phrase)) || 
           lastPageLower.includes('end') ||
           !!lastPageLower.match(/\.$/); // At least ends with a period
  }
  
  /**
   * Extract key nouns for continuity checking
   */
  private static extractKeyNouns(text: string): string[] {
    // Simple noun extraction - look for capitalized words and common noun patterns
    const words = text.split(/\s+/);
    const nouns: string[] = [];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      // Add capitalized words (likely proper nouns) and common story nouns
      if (word.match(/^[A-Z][a-z]+/) || this.isCommonStoryNoun(cleanWord)) {
        nouns.push(cleanWord);
      }
    });
    
    return [...new Set(nouns)]; // Remove duplicates
  }
  
  /**
   * Check if word is a common story noun
   */
  private static isCommonStoryNoun(word: string): boolean {
    const storyNouns = ['cat', 'dog', 'animal', 'friend', 'house', 'garden', 'forest', 'adventure', 'treasure', 'magic', 'mystery', 'journey', 'home', 'family', 'school', 'park', 'playground'];
    return storyNouns.includes(word);
  }
  
  /**
   * Check character consistency throughout the story
   */
  private static checkCharacterConsistency(pages: string[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    // Extract character names from first page
    const allText = pages.join(' ');
    const characterNames = this.extractCharacterNames(allText);
    
    if (characterNames.length === 0) {
      issues.push({
        type: 'structure',
        severity: 'warning',
        message: 'No clear character names detected',
        suggestion: 'Ensure main character is clearly named and referenced consistently'
      });
    }
    
    return issues;
  }
  
  /**
   * Extract character names from text
   */
  private static extractCharacterNames(text: string): string[] {
    const words = text.split(/\s+/);
    const names: string[] = [];
    
    words.forEach(word => {
      // Look for capitalized words that appear multiple times (likely character names)
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.match(/^[A-Z][a-z]+$/) && cleanWord.length > 2) {
        names.push(cleanWord);
      }
    });
    
    // Count occurrences and return names that appear more than once
    const nameCounts = {};
    names.forEach(name => {
      nameCounts[name] = (nameCounts[name] || 0) + 1;
    });
    
    return Object.keys(nameCounts).filter(name => nameCounts[name] > 1);
  }
  
  /**
   * Calculate overall quality score
   */
  private static calculateQualityScore(issues: QualityIssue[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 25;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'info':
          score -= 2;
          break;
      }
    });
    
    return Math.max(0, score);
  }
}

export default StoryQualityChecker;