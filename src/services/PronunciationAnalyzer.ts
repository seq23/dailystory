import { SmartPhoneticMapper } from './SmartPhoneticMapper';
import phonicsMiniDict from '@/data/phonicsMiniDict';
import { DebugLogger } from '@/services/DebugLogger';

interface PronunciationResult {
  accuracy: number;
  mispronounced: string[];
  phonemeErrors: { word: string; expected: string; actual: string }[];
  overallFeedback: string;
  syllableFeedback: { word: string; syllables: string[]; feedback: string }[];
}

interface WordConfidence {
  word: string;
  confidence: number;
  start?: number;
  end?: number;
}

interface WordAnalysis {
  word: string;
  expected: string[];
  actual: string;
  phonemeAccuracy: number;
  syllableIssues: string[];
  confidence?: number;
  confidenceIssue?: boolean;
}

export class PronunciationAnalyzer {
  /**
   * Analyzes pronunciation by comparing expected vs actual phonetic patterns
   * Now with ultra-strict detection using ASR confidence data
   */
  static async analyzePronunciation(
    referenceText: string,
    spokenText: string,
    confidence: number = 0.8,
    wordConfidences: WordConfidence[] = []
  ): Promise<PronunciationResult> {
    const cleanRef = this.cleanText(referenceText);
    const cleanSpoken = this.cleanText(spokenText);
    
    const refWords = cleanRef.split(/\s+/).filter(Boolean);
    const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);

    // Get phonetic analysis for each word with confidence data
    const wordAnalyses = await this.analyzeWords(refWords, spokenWords, wordConfidences);
    
    // Calculate overall accuracy
    const accuracy = this.calculateAccuracy(wordAnalyses, confidence);
    
    // ULTRA-STRICT: Extract mispronounced words - 99% accuracy required OR confidence < 85%
    const mispronounced = wordAnalyses
      .filter(analysis => 
        analysis.phonemeAccuracy < 0.99 || // Ultra-strict text-based threshold
        analysis.confidenceIssue || // Low ASR confidence flag
        analysis.syllableIssues.length > 0 // Any syllable issues
      )
      .map(analysis => analysis.word);

    // Generate phoneme-level feedback
    const phonemeErrors = wordAnalyses
      .filter(analysis => analysis.syllableIssues.length > 0)
      .map(analysis => ({
        word: analysis.word,
        expected: analysis.expected.join('-'),
        actual: analysis.actual,
        syllableIssues: analysis.syllableIssues
      }))
      .map(error => ({
        word: error.word,
        expected: error.expected,
        actual: `Issues with: ${error.syllableIssues.join(', ')}`
      }));

    // Generate syllable-specific feedback
    const syllableFeedback = await this.generateSyllableFeedback(wordAnalyses);

    const overallFeedback = this.generateOverallFeedback(accuracy, mispronounced);

    return {
      accuracy,
      mispronounced,
      phonemeErrors,
      overallFeedback,
      syllableFeedback
    };
  }

  /**
   * Analyzes individual words for phonetic accuracy with confidence data
   */
  private static async analyzeWords(
    referenceWords: string[], 
    spokenWords: string[],
    wordConfidences: WordConfidence[] = []
  ): Promise<WordAnalysis[]> {
    const analyses: WordAnalysis[] = [];
    
    // Create word mapping with confidence data
    const wordPairs = this.alignWords(referenceWords, spokenWords);
    
    for (const [refWord, spokenWord] of wordPairs) {
      if (!refWord) continue;
      
      try {
        // Get expected phonetic breakdown
        const cleanWord = refWord.toLowerCase().replace(/[^a-z]/g, '');
        const expectedSyllables = phonicsMiniDict[cleanWord] || [refWord];
        const phonemeAccuracy = spokenWord ? 
          this.calculatePhonemeDistance(refWord, spokenWord) : 0;
        
        // Find confidence data for this word
        const confidenceData = wordConfidences.find(wc => 
          wc.word.toLowerCase() === refWord.toLowerCase() ||
          wc.word.toLowerCase() === spokenWord?.toLowerCase()
        );
        const wordConfidence = confidenceData?.confidence || 1.0;
        
        // Flag low confidence words (< 85% confidence = mispronunciation indicator)
        const confidenceIssue = wordConfidence < 0.85;
        
        // Identify syllable issues
        const syllableIssues = await this.identifySyllableIssues(refWord, spokenWord, expectedSyllables);
        
        analyses.push({
          word: refWord,
          expected: expectedSyllables,
          actual: spokenWord || '',
          phonemeAccuracy,
          syllableIssues,
          confidence: wordConfidence,
          confidenceIssue
        });
      } catch (error) {
        DebugLogger.warn('audio', `Failed to analyze word "${refWord}"`, { error });
        analyses.push({
          word: refWord,
          expected: [refWord],
          actual: spokenWord || '',
          phonemeAccuracy: spokenWord ? 0.5 : 0,
          syllableIssues: [],
          confidence: 0.5,
          confidenceIssue: true
        });
      }
    }
    
    return analyses;
  }

  /**
   * Enhanced word alignment to detect substitutions like "hidden" → "hide in"
   */
  private static alignWords(refWords: string[], spokenWords: string[]): Array<[string, string | null]> {
    const pairs: Array<[string, string | null]> = [];
    const spokenSet = new Set(spokenWords.map(w => w.toLowerCase()));
    const usedSpoken = new Set<number>();
    
    for (const refWord of refWords) {
      let bestMatch: string | null = null;
      let bestScore = 0;
      let bestIndex = -1;
      
      // Check each spoken word for the best match
      spokenWords.forEach((spokenWord, index) => {
        if (usedSpoken.has(index)) return;
        
        const exactMatch = spokenWord.toLowerCase() === refWord.toLowerCase();
        const phoneticScore = exactMatch ? 1.0 : this.calculatePhonemeDistance(refWord, spokenWord);
        
        // Check for compound word substitutions (e.g., "hidden" vs "hide in")
        if (!exactMatch && phoneticScore < 0.7) {
          // Try combining this word with the next one
          if (index + 1 < spokenWords.length && !usedSpoken.has(index + 1)) {
            const combinedSpoken = spokenWord + spokenWords[index + 1];
            const combinedScore = this.calculatePhonemeDistance(refWord, combinedSpoken);
            if (combinedScore > phoneticScore && combinedScore > bestScore) {
              bestMatch = spokenWord + " " + spokenWords[index + 1];
              bestScore = combinedScore;
              bestIndex = index;
            }
          }
        }
        
        if (phoneticScore > bestScore) {
          bestMatch = spokenWord;
          bestScore = phoneticScore;
          bestIndex = index;
        }
      });
      
      // ULTRA-STRICT: Use higher threshold for word matching (70% vs 40%)
      if (bestIndex >= 0 && bestScore > 0.7) {
        usedSpoken.add(bestIndex);
        // If it's a compound match, mark the next word as used too
        if (bestMatch && bestMatch.includes(" ")) {
          usedSpoken.add(bestIndex + 1);
        }
      }
      
      pairs.push([refWord, bestMatch && bestScore > 0.7 ? bestMatch : null]);
    }
    
    return pairs;
  }

  /**
   * Check if two words are phonetically similar
   */
  private static isPhoneticMatch(word1: string, word2: string): boolean {
    const distance = this.calculatePhonemeDistance(word1, word2);
    return distance > 0.7; // Improved 70% similarity threshold for better detection
  }

  /**
   * Calculate phonetic distance between two words
   */
  private static calculatePhonemeDistance(word1: string, word2: string): number {
    if (!word1 || !word2) return 0;
    
    const clean1 = word1.toLowerCase().replace(/[^a-z]/g, '');
    const clean2 = word2.toLowerCase().replace(/[^a-z]/g, '');
    
    if (clean1 === clean2) return 1.0;
    
    // Simple phonetic similarity based on character patterns
    const maxLen = Math.max(clean1.length, clean2.length);
    let matches = 0;
    
    for (let i = 0; i < Math.min(clean1.length, clean2.length); i++) {
      if (clean1[i] === clean2[i]) {
        matches++;
      } else if (this.areSimilarSounds(clean1[i], clean2[i])) {
        matches += 0.5;
      }
    }
    
    return matches / maxLen;
  }

  /**
   * Check if two characters represent similar sounds
   */
  private static areSimilarSounds(char1: string, char2: string): boolean {
    const similarPairs = [
      ['b', 'p'], ['d', 't'], ['g', 'k'], ['v', 'f'], ['z', 's'],
      ['i', 'e'], ['o', 'u'], ['c', 'k'], ['c', 's']
    ];
    
    return similarPairs.some(([a, b]) => 
      (char1 === a && char2 === b) || (char1 === b && char2 === a)
    );
  }

  /**
   * Identify specific syllable pronunciation issues
   */
  private static async identifySyllableIssues(
    expectedWord: string, 
    actualWord: string | null, 
    expectedSyllables: string[]
  ): Promise<string[]> {
    if (!actualWord) return ['Word not pronounced'];
    
    const issues: string[] = [];
    
    // Check for common mispronunciation patterns
    const expectedStr = expectedSyllables.join('');
    const actualStr = actualWord.toLowerCase().replace(/[^a-z]/g, '');
    
    // Check for missing sounds
    if (actualStr.length < expectedStr.length * 0.7) {
      issues.push('Some sounds missing');
    }
    
    // Check for added sounds
    if (actualStr.length > expectedStr.length * 1.3) {
      issues.push('Extra sounds added');
    }
    
    // Check for specific syllable patterns
    for (const syllable of expectedSyllables) {
      if (!this.containsSyllablePattern(actualStr, syllable)) {
        issues.push(`"${syllable}" sound`);
      }
    }
    
    return issues;
  }

  /**
   * Check if actual pronunciation contains expected syllable pattern
   */
  private static containsSyllablePattern(actual: string, expectedSyllable: string): boolean {
    const pattern = expectedSyllable.toLowerCase().replace(/[^a-z]/g, '');
    
    // Look for the syllable pattern in the actual pronunciation
    if (actual.includes(pattern)) return true;
    
    // Check for phonetic variants
    const variants = this.generatePhoneticVariants(pattern);
    return variants.some(variant => actual.includes(variant));
  }

  /**
   * Generate phonetic variants of a syllable
   */
  private static generatePhoneticVariants(syllable: string): string[] {
    const variants = [syllable];
    
    // Common sound substitutions
    const substitutions = [
      ['ph', 'f'], ['ck', 'k'], ['qu', 'kw'], ['x', 'ks'],
      ['ee', 'i'], ['oo', 'u'], ['ay', 'a'], ['ey', 'e']
    ];
    
    let current = syllable;
    for (const [from, to] of substitutions) {
      if (current.includes(from)) {
        variants.push(current.replace(from, to));
      }
    }
    
    return variants;
  }

  /**
   * Calculate overall pronunciation accuracy
   */
  private static calculateAccuracy(analyses: WordAnalysis[], confidence: number): number {
    if (analyses.length === 0) return 0;
    
    const avgAccuracy = analyses.reduce((sum, analysis) => 
      sum + analysis.phonemeAccuracy, 0) / analyses.length;
    
    // Factor in speech recognition confidence
    const confidenceAdjusted = avgAccuracy * (0.7 + confidence * 0.3);
    
    return Math.round(confidenceAdjusted * 100);
  }

  /**
   * Generate syllable-specific feedback for problematic words
   */
  private static async generateSyllableFeedback(analyses: WordAnalysis[]): Promise<Array<{word: string; syllables: string[]; feedback: string}>> {
    const feedback: Array<{word: string; syllables: string[]; feedback: string}> = [];
    
    for (const analysis of analyses) {
      if (analysis.phonemeAccuracy < 0.99 && analysis.syllableIssues.length > 0) {
        const feedbackText = `Try breaking it down: ${analysis.expected.join('-')}. ${
          analysis.syllableIssues.length > 0 ? 
          `Focus on: ${analysis.syllableIssues.slice(0, 2).join(', ')}` : 
          'Practice the syllable sounds'
        }`;
        
        feedback.push({
          word: analysis.word,
          syllables: analysis.expected,
          feedback: feedbackText
        });
      }
    }
    
    return feedback; // ULTRA-STRICT: Show ALL words that need practice (removed 3-word cap)
  }

  /**
   * Generate overall feedback message
   */
  private static generateOverallFeedback(accuracy: number, mispronounced: string[]): string {
    if (accuracy >= 85) {
      return "Excellent pronunciation! You're speaking very clearly.";
    } else if (accuracy >= 70) {
      return `Good job! Try focusing on: ${mispronounced.slice(0, 2).join(', ')}`;
    } else if (accuracy >= 50) {
      return `Getting there! Let's work on these sounds: ${mispronounced.slice(0, 3).join(', ')}`;
    } else {
      return "Let's break it down word by word. Take your time with each sound.";
    }
  }

  /**
   * Clean text for analysis
   */
  private static cleanText(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z\s']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}