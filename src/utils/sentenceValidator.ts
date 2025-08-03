import { DifficultyLevel } from "@/types";

export interface SentenceValidationResult {
  isValid: boolean;
  wordCount: number;
  maxWords: number;
  reconstructedSentence?: string;
}

export class SentenceValidator {
  private static readonly WORD_LIMITS: Record<DifficultyLevel, number> = {
    easy: 12,      // K-1, ESL Beginner: 8-12 words per sentence
    medium: 18,    // Grades 2-3, ESL Intermediate: 12-18 words per sentence
    hard: 25,      // Grades 4-5, ESL Advanced: 18-25 words per sentence
    expert: Infinity // Grade 6+, ESL Proficient: No limit
  };

  /**
   * Validates if a sentence meets the word count requirements for a difficulty level
   */
  static validateSentence(sentence: string, difficulty: DifficultyLevel): SentenceValidationResult {
    const words = sentence.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const maxWords = this.WORD_LIMITS[difficulty];

    if (wordCount <= maxWords) {
      return {
        isValid: true,
        wordCount,
        maxWords
      };
    }

    // For easy level, reconstruct the sentence to fit
    if (difficulty === 'easy') {
      const reconstructed = this.reconstructShortSentence(sentence, maxWords);
      return {
        isValid: false,
        wordCount,
        maxWords,
        reconstructedSentence: reconstructed
      };
    }

    return {
      isValid: false,
      wordCount,
      maxWords
    };
  }

  /**
   * Reconstructs a sentence to fit within word limits while maintaining meaning
   */
  private static reconstructShortSentence(sentence: string, maxWords: number): string {
    const words = sentence.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length <= maxWords) {
      return sentence;
    }

    // Remove adjectives and adverbs first
    const essentialWords = words.filter(word => 
      !this.isAdjective(word) && !this.isAdverb(word)
    );

    if (essentialWords.length <= maxWords) {
      let result = essentialWords.join(' ');
      // Ensure proper sentence ending
      if (!result.match(/[.!?]$/)) {
        result += '.';
      }
      return result;
    }

    // If still too long, take the first maxWords words
    let result = words.slice(0, maxWords).join(' ');
    // Ensure proper sentence ending
    if (!result.match(/[.!?]$/)) {
      result = result.replace(/[,;:]$/, '') + '.';
    }
    
    return result;
  }

  /**
   * Simple adjective detection
   */
  private static isAdjective(word: string): boolean {
    const adjectives = [
      'beautiful', 'special', 'wonderful', 'amazing', 'great', 'big', 'small',
      'happy', 'sad', 'funny', 'silly', 'brave', 'kind', 'nice', 'good',
      'bad', 'old', 'new', 'young', 'tall', 'short', 'fast', 'slow'
    ];
    return adjectives.includes(word.toLowerCase());
  }

  /**
   * Simple adverb detection
   */
  private static isAdverb(word: string): boolean {
    return word.toLowerCase().endsWith('ly') || 
           ['very', 'really', 'quite', 'always', 'never', 'often', 'sometimes'].includes(word.toLowerCase());
  }

  /**
   * Validates multiple sentences at once
   */
  static validateSentences(sentences: string[], difficulty: DifficultyLevel): SentenceValidationResult[] {
    return sentences.map(sentence => this.validateSentence(sentence, difficulty));
  }

  /**
   * Gets the word limit for a difficulty level
   */
  static getWordLimit(difficulty: DifficultyLevel): number {
    return this.WORD_LIMITS[difficulty];
  }
}