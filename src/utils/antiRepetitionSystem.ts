// Advanced anti-repetition system for story generation
export class AntiRepetitionSystem {
  private static usedSentences = new Set<string>();
  private static pageContent: string[] = [];
  
  /**
   * Clears all cached content for new story generation
   */
  static clearCache(): void {
    this.usedSentences.clear();
    this.pageContent = [];
  }
  
  /**
   * Checks if content is too similar to previously generated content
   */
  static isDuplicate(content: string, minimumSimilarity: number = 0.5): boolean {
    const normalized = this.normalizeContent(content);
    
    // Check against all used sentences
    for (const existing of this.usedSentences) {
      const similarity = this.calculateSimilarity(normalized, existing);
      if (similarity >= minimumSimilarity) {
        console.log(`Duplicate detected: "${content}" similar to "${existing}" (${similarity.toFixed(2)})`);
        return true;
      }
    }
    
    // Check for exact matches in recent page content (more strict)
    for (let i = Math.max(0, this.pageContent.length - 3); i < this.pageContent.length; i++) {
      const recentNormalized = this.normalizeContent(this.pageContent[i]);
      if (normalized === recentNormalized) {
        console.log(`Exact duplicate detected in recent pages: "${content}"`);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Adds content to the tracking system
   */
  static addContent(content: string): void {
    const normalized = this.normalizeContent(content);
    this.usedSentences.add(normalized);
    this.pageContent.push(content);
  }
  
  /**
   * Generates variations of a sentence to avoid repetition
   */
  static generateVariations(sentence: string, userElements: Record<string, any>): string[] {
    const variations: string[] = [];
    
    // Enhanced synonym replacements
    const synonymMap = {
      'happy': ['joyful', 'cheerful', 'delighted', 'glad', 'excited'],
      'sad': ['unhappy', 'upset', 'disappointed', 'gloomy'],
      'big': ['large', 'huge', 'enormous', 'giant', 'massive'],
      'small': ['tiny', 'little', 'miniature', 'petite'],
      'beautiful': ['lovely', 'gorgeous', 'wonderful', 'amazing', 'pretty'],
      'fun': ['exciting', 'enjoyable', 'entertaining', 'delightful'],
      'went': ['traveled', 'journeyed', 'walked', 'moved', 'headed'],
      'found': ['discovered', 'spotted', 'saw', 'came across', 'noticed'],
      'said': ['spoke', 'told', 'mentioned', 'announced', 'whispered'],
      'play': ['have fun', 'enjoy', 'spend time', 'engage'],
      'see': ['notice', 'spot', 'observe', 'watch', 'look at'],
      'run': ['dash', 'hurry', 'race', 'sprint'],
      'walk': ['stroll', 'wander', 'move', 'go']
    };
    
    // Create more sophisticated variations
    let baseVariation = sentence;
    
    // Try different synonym combinations
    Object.entries(synonymMap).forEach(([word, synonyms]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(baseVariation)) {
        synonyms.forEach((synonym, index) => {
          // Only create a few variations to avoid overwhelming
          if (index < 2) {
            variations.push(baseVariation.replace(regex, synonym));
          }
        });
      }
    });
    
    // Structure variations
    const restructured = this.restructureSentence(sentence);
    if (restructured !== sentence) {
      variations.push(restructured);
    }
    
    // Context-aware variations using user elements
    if (userElements.name) {
      variations.push(sentence.replace(new RegExp(`\\b${userElements.name}\\b`, 'gi'), 'our friend'));
    }
    
    return variations.filter(v => v !== sentence && v.length > 0).slice(0, 5); // Limit to 5 best variations
  }
  
  /**
   * Calculates content diversity score between pages
   */
  static calculateDiversityScore(newContent: string): number {
    if (this.pageContent.length === 0) return 1.0;
    
    let totalSimilarity = 0;
    for (const existingContent of this.pageContent) {
      totalSimilarity += this.calculateSimilarity(
        this.normalizeContent(newContent),
        this.normalizeContent(existingContent)
      );
    }
    
    const averageSimilarity = totalSimilarity / this.pageContent.length;
    return 1.0 - averageSimilarity; // Higher score = more diverse
  }
  
  /**
   * Normalizes content for comparison
   */
  private static normalizeContent(content: string): string {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Calculates similarity between two strings using Jaccard similarity
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Attempts to restructure a sentence while preserving meaning
   */
  private static restructureSentence(sentence: string): string {
    // Simple restructuring patterns
    const patterns = [
      {
        match: /^(.+) was (.+)\.$/,
        replace: 'There was $2 $1.'
      },
      {
        match: /^(.+) went to (.+)\.$/,
        replace: 'To $2 went $1.'
      },
      {
        match: /^(.+) found (.+)\.$/,
        replace: '$2 was found by $1.'
      }
    ];
    
    for (const pattern of patterns) {
      if (pattern.match.test(sentence)) {
        return sentence.replace(pattern.match, pattern.replace);
      }
    }
    
    return sentence;
  }
}