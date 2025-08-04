// Level 1 Simplification Service
// Transforms rich content to Level 1 vocabulary using cascading strategies

export interface SimplificationResult {
  text: string;
  wasSimplified: boolean;
  strategyUsed: 'none' | 'word-replacement' | 'sentence-restructuring' | 'context-relaxation';
  originalInvalidWords?: string[];
}

export class Level1Simplifier {
  // Word replacement dictionary focused on common T4 system outputs
  private static readonly WORD_REPLACEMENTS = new Map([
    // Adventures and actions
    ['adventure', ['trip', 'walk', 'game']],
    ['discovered', ['found', 'saw', 'got']],
    ['wonderful', ['good', 'nice', 'pretty']],
    ['amazing', ['great', 'good', 'nice']],
    ['beautiful', ['pretty', 'nice', 'good']],
    ['excellent', ['great', 'good', 'nice']],
    ['fantastic', ['great', 'fun', 'good']],
    ['magnificent', ['big', 'pretty', 'good']],
    ['marvelous', ['good', 'nice', 'fun']],
    ['spectacular', ['big', 'good', 'pretty']],
    
    // Emotions and feelings
    ['excited', ['happy', 'glad']],
    ['delighted', ['happy', 'glad']],
    ['thrilled', ['happy', 'glad']],
    ['surprised', ['happy', 'sad']],
    ['curious', ['wants to know']],
    ['worried', ['sad', 'scared']],
    ['nervous', ['scared', 'sad']],
    
    // Actions and verbs
    ['explored', ['looked', 'walked', 'went']],
    ['investigated', ['looked', 'found', 'saw']],
    ['observed', ['looked', 'saw', 'watched']],
    ['encountered', ['met', 'saw', 'found']],
    ['approached', ['went to', 'walked to']],
    ['decided', ['picked', 'wanted']],
    ['realized', ['saw', 'knew', 'found']],
    ['remembered', ['knew', 'thought']],
    
    // Objects and places
    ['treasure', ['gift', 'toy', 'gold']],
    ['mystery', ['game', 'fun', 'puzzle']],
    ['journey', ['trip', 'walk', 'game']],
    ['forest', ['trees', 'woods', 'park']],
    ['mountain', ['hill', 'rock', 'high']],
    ['castle', ['big house', 'tall house']],
    ['village', ['town', 'homes', 'place']],
    
    // Descriptive words
    ['enormous', ['big', 'very big']],
    ['tiny', ['small', 'little']],
    ['ancient', ['old', 'very old']],
    ['magical', ['fun', 'special', 'nice']],
    ['mysterious', ['fun', 'new', 'different']],
    ['dangerous', ['bad', 'scary']],
    ['peaceful', ['quiet', 'nice', 'calm']],
    ['comfortable', ['nice', 'good', 'soft']]
  ]);

  /**
   * Main simplification method with cascading strategies
   */
  static simplifyForLevel1(text: string, userName: string): SimplificationResult {
    // Strategy 1: Try direct word replacement
    const wordReplacementResult = this.attemptWordReplacement(text);
    if (this.validateLevel1Text(wordReplacementResult, userName)) {
      return {
        text: wordReplacementResult,
        wasSimplified: wordReplacementResult !== text,
        strategyUsed: wordReplacementResult !== text ? 'word-replacement' : 'none'
      };
    }

    // Strategy 2: Try sentence restructuring
    const restructuredResult = this.restructureSentence(wordReplacementResult);
    if (this.validateLevel1Text(restructuredResult, userName)) {
      return {
        text: restructuredResult,
        wasSimplified: true,
        strategyUsed: 'sentence-restructuring'
      };
    }

    // Strategy 3: Context-aware relaxation (allow 1-2 story words)
    const relaxedResult = this.applyContextRelaxation(restructuredResult, userName);
    if (relaxedResult.isValid) {
      return {
        text: relaxedResult.text,
        wasSimplified: true,
        strategyUsed: 'context-relaxation',
        originalInvalidWords: relaxedResult.allowedWords
      };
    }

    // All strategies failed - return original with failure info
    return {
      text: text,
      wasSimplified: false,
      strategyUsed: 'none',
      originalInvalidWords: this.getInvalidWords(text, userName)
    };
  }

  /**
   * Strategy 1: Replace complex words with Level 1 alternatives
   */
  private static attemptWordReplacement(text: string): string {
    let result = text;
    
    for (const [complex, simpleOptions] of this.WORD_REPLACEMENTS) {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      if (regex.test(result)) {
        // Choose the first (most appropriate) replacement
        const replacement = simpleOptions[0];
        result = result.replace(regex, replacement);
      }
    }
    
    return result;
  }

  /**
   * Strategy 2: Break complex sentences into simpler ones
   */
  private static restructureSentence(text: string): string {
    // Break sentences with "and" into separate sentences
    if (text.includes(' and ')) {
      const parts = text.split(' and ');
      if (parts.length === 2) {
        const firstPart = parts[0].trim();
        const secondPart = parts[1].trim();
        
        // Make sure both parts are complete sentences
        const firstSentence = firstPart.endsWith('.') ? firstPart : `${firstPart}.`;
        const secondSentence = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
        const finalSecond = secondSentence.endsWith('.') ? secondSentence : `${secondSentence}.`;
        
        return `${firstSentence} ${finalSecond}`;
      }
    }

    // Replace complex phrases with simpler ones
    return text
      .replace(/In order to/gi, 'To')
      .replace(/As soon as/gi, 'When')
      .replace(/Even though/gi, 'But')
      .replace(/Because of/gi, 'Because')
      .replace(/All of a sudden/gi, 'Then');
  }

  /**
   * Strategy 3: Allow 1-2 story-specific words that enhance narrative
   */
  private static applyContextRelaxation(text: string, userName: string): { isValid: boolean; text: string; allowedWords: string[] } {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const userNameLower = userName?.toLowerCase();
    const invalidWords = words.filter(word => {
      if (userNameLower && word === userNameLower) return false;
      return !this.isLevel1Word(word);
    });

    // Allow up to 2 story-enhancing words
    if (invalidWords.length <= 2) {
      const storyWords = ['adventure', 'magical', 'treasure', 'forest', 'castle', 'journey'];
      const allowedInvalid = invalidWords.filter(word => 
        storyWords.includes(word) || word.length <= 8 // Short words are usually okay
      );

      if (allowedInvalid.length === invalidWords.length) {
        return {
          isValid: true,
          text: text,
          allowedWords: allowedInvalid
        };
      }
    }

    return { isValid: false, text: text, allowedWords: [] };
  }

  /**
   * Validate text against Level 1 vocabulary
   */
  private static validateLevel1Text(text: string, userName: string): boolean {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const userNameLower = userName?.toLowerCase();
    
    return words.every(word => {
      if (userNameLower && word === userNameLower) return true;
      return this.isLevel1Word(word);
    });
  }

  /**
   * Get list of invalid words for debugging
   */
  private static getInvalidWords(text: string, userName: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const userNameLower = userName?.toLowerCase();
    
    return words.filter(word => {
      if (userNameLower && word === userNameLower) return false;
      return !this.isLevel1Word(word);
    });
  }

  /**
   * Check if a word is in Level 1 vocabulary (simplified check)
   */
  private static isLevel1Word(word: string): boolean {
    // Use dynamic import for better compatibility
    import('@/constants/level1Vocabulary').then(module => {
      return module.LEVEL_1_VOCABULARY.has(word.toLowerCase());
    });
    
    // Fallback: inline check for critical words to ensure cross-device compatibility
    const basicLevel1Words = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
      'go', 'see', 'run', 'play', 'eat', 'get', 'give', 'look', 'find', 'help', 'come', 'want', 'like', 'make', 'take', 'walk', 'jump', 'sit', 'put', 'stop',
      'cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'hen', 'bee', 'bug', 'bear', 'fox', 'frog', 'mouse', 'horse',
      'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown', 'orange', 'purple',
      'ball', 'book', 'box', 'car', 'cup', 'door', 'egg', 'hat', 'home', 'house', 'key', 'milk', 'pan', 'pen', 'pot', 'sun', 'toy', 'tree',
      'big', 'small', 'good', 'bad', 'hot', 'cold', 'old', 'new', 'fast', 'slow', 'happy', 'sad', 'nice', 'pretty', 'fun',
      'i', 'me', 'my', 'you', 'your', 'we', 'us', 'they', 'them', 'this', 'that', 'here', 'there', 'now', 'yes', 'no'
    ]);
    
    return basicLevel1Words.has(word.toLowerCase());
  }
}