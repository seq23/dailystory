import { PersistentAntiRepetitionService } from "@/services/persistentAntiRepetitionService";

// Advanced anti-repetition system for story generation with persistence
export class AntiRepetitionSystem {
  private static usedSentences = new Set<string>();
  private static pageContent: string[] = [];
  private static persistentSignatures = new Set<string>();
  private static isInitialized = false;
  
  /**
   * Initializes the anti-repetition system with persistent data
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.persistentSignatures = await PersistentAntiRepetitionService.loadContentSignatures();
      this.isInitialized = true;
      console.log(`Loaded ${this.persistentSignatures.size} content signatures from database`);
    } catch (error) {
      console.error('Error initializing anti-repetition system:', error);
      this.isInitialized = true; // Mark as initialized even on error to prevent repeated attempts
    }
  }

  /**
   * Clears session cache but preserves persistent signatures unless force cleared
   */
  static clearCache(preservePersistent: boolean = true): void {
    this.usedSentences.clear();
    this.pageContent = [];
    
    if (!preservePersistent) {
      this.persistentSignatures.clear();
      this.isInitialized = false;
    }
  }
  
  /**
   * Checks if content is too similar to previously generated content (includes persistent storage)
   */
  static async isDuplicate(content: string, minimumSimilarity: number = 0.5): Promise<boolean> {
    await this.initialize(); // Ensure persistent data is loaded
    
    const normalized = this.normalizeContent(content);
    const contentSignature = PersistentAntiRepetitionService.generateContentSignature(content);
    
    // Check against persistent signatures first (database stored)
    if (this.persistentSignatures.has(contentSignature)) {
      console.log(`Persistent duplicate detected: "${content}"`);
      return true;
    }
    
    // Check against all used sentences in current session
    for (const existing of this.usedSentences) {
      const similarity = this.calculateSimilarity(normalized, existing);
      if (similarity >= minimumSimilarity) {
        console.log(`Session duplicate detected: "${content}" similar to "${existing}" (${similarity.toFixed(2)})`);
        return true;
      }
    }
    
    // Check for exact matches in recent page content (more strict)
    for (let i = Math.max(0, this.pageContent.length - 3); i < this.pageContent.length; i++) {
      const recentNormalized = this.normalizeContent(this.pageContent[i]);
      if (normalized === recentNormalized) {
        console.log(`Recent page duplicate detected: "${content}"`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Synchronous version for backward compatibility
   */
  static isDuplicateSync(content: string, minimumSimilarity: number = 0.5): boolean {
    const normalized = this.normalizeContent(content);
    const contentSignature = PersistentAntiRepetitionService.generateContentSignature(content);
    
    // Check against loaded persistent signatures
    if (this.persistentSignatures.has(contentSignature)) {
      console.log(`Persistent duplicate detected (sync): "${content}"`);
      return true;
    }
    
    // Check against session content
    for (const existing of this.usedSentences) {
      const similarity = this.calculateSimilarity(normalized, existing);
      if (similarity >= minimumSimilarity) {
        console.log(`Session duplicate detected (sync): "${content}" similar to "${existing}" (${similarity.toFixed(2)})`);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Adds content to the tracking system (both session and persistent storage)
   */
  static async addContent(content: string, sessionNumber?: number): Promise<void> {
    const normalized = this.normalizeContent(content);
    const contentSignature = PersistentAntiRepetitionService.generateContentSignature(content);
    
    // Add to session storage
    this.usedSentences.add(normalized);
    this.pageContent.push(content);
    
    // Add to persistent storage
    this.persistentSignatures.add(contentSignature);
    
    try {
      const currentSession = sessionNumber || await PersistentAntiRepetitionService.getCurrentSessionNumber();
      await PersistentAntiRepetitionService.saveContentSignature(contentSignature, currentSession);
      
      // Cleanup old signatures periodically (every 50 additions)
      if (this.persistentSignatures.size % 50 === 0) {
        await PersistentAntiRepetitionService.cleanupOldSignatures();
      }
    } catch (error) {
      console.error('Error saving content to persistent storage:', error);
    }
  }

  /**
   * Synchronous version for backward compatibility
   */
  static addContentSync(content: string): void {
    const normalized = this.normalizeContent(content);
    const contentSignature = PersistentAntiRepetitionService.generateContentSignature(content);
    
    // Add to session storage
    this.usedSentences.add(normalized);
    this.pageContent.push(content);
    
    // Add to in-memory persistent signatures
    this.persistentSignatures.add(contentSignature);
    
    // Save to database asynchronously without blocking
    PersistentAntiRepetitionService.getCurrentSessionNumber()
      .then(sessionNumber => 
        PersistentAntiRepetitionService.saveContentSignature(contentSignature, sessionNumber)
      )
      .catch(error => console.error('Error saving content to persistent storage:', error));
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