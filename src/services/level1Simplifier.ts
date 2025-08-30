// Enhanced Level 1 Simplifier - Updated for New Grade-Based Vocabulary System
// Uses the new grade-based vocabulary from @/constants/gradeBased

import { 
  isLevel1Word, 
  validateLevel1Sentence 
} from '@/constants/gradeBased';

export interface SimplificationResult {
  text: string;
  wasSimplified: boolean;
  strategyUsed: 'none' | 'word-replacement' | 'sentence-restructuring' | 'context-relaxation';
  originalInvalidWords?: string[];
  gradeLevel: 1;
}

export class Level1Simplifier {
  // Enhanced word replacement dictionary for Level 1 (1st-2nd grade)
  private static readonly WORD_REPLACEMENTS = new Map([
    // Complex words to Level 1 vocabulary
    ['adventure', ['trip', 'walk', 'game']],
    ['discovered', ['found', 'saw', 'got']],
    ['wonderful', ['good', 'nice', 'great']],
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
    ['surprised', ['happy', 'wondered']],
    ['curious', ['wanted to know']],
    ['worried', ['sad', 'scared']],
    ['nervous', ['scared', 'worried']],
    ['frightened', ['scared', 'afraid']],
    
    // Actions and verbs
    ['explored', ['looked', 'walked', 'went']],
    ['investigated', ['looked', 'found', 'saw']],
    ['observed', ['looked', 'saw', 'watched']],
    ['encountered', ['met', 'saw', 'found']],
    ['approached', ['went to', 'walked to']],
    ['decided', ['picked', 'wanted', 'chose']],
    ['realized', ['saw', 'knew', 'found']],
    ['remembered', ['knew', 'thought about']],
    ['participated', ['joined', 'helped', 'played']],
    ['accomplished', ['did', 'finished', 'made']],
    
    // Objects and places
    ['treasure', ['gold', 'special thing', 'prize']],
    ['mystery', ['puzzle', 'secret', 'game']],
    ['journey', ['trip', 'walk', 'travel']],
    ['forest', ['woods', 'trees', 'park']],
    ['mountain', ['hill', 'rock', 'high place']],
    ['castle', ['big house', 'tall building']],
    ['village', ['town', 'place', 'neighborhood']],
    ['garden', ['yard', 'place with plants']],
    ['library', ['place with books']],
    
    // Descriptive words
    ['enormous', ['very big', 'huge']],
    ['gigantic', ['very big', 'huge']],
    ['tiny', ['very small', 'little']],
    ['ancient', ['very old', 'old']],
    ['modern', ['new', 'today']],
    ['magical', ['special', 'amazing']],
    ['mysterious', ['secret', 'strange']],
    ['dangerous', ['not safe', 'scary']],
    ['peaceful', ['quiet', 'calm']],
    ['comfortable', ['nice', 'good', 'cozy']],
    ['difficult', ['hard', 'not easy']],
    ['simple', ['easy', 'not hard']],
    
    // Academic/complex words
    ['knowledge', ['what you know']],
    ['experience', ['what happened']],
    ['understand', ['know', 'get it']],
    ['important', ['big', 'special']],
    ['interesting', ['fun', 'cool']],
    ['necessary', ['need', 'must have']],
    ['possible', ['can happen', 'maybe']],
    ['probably', ['maybe', 'might']],
    ['definitely', ['for sure', 'yes']],
    ['especially', ['very', 'most of all']]
  ]);

  /**
   * Main simplification method using new grade-based vocabulary
   */
  static simplifyForLevel1(text: string, userName: string): SimplificationResult {
    // Strategy 1: Try direct word replacement
    const wordReplacementResult = this.attemptWordReplacement(text);
    if (this.validateLevel1Text(wordReplacementResult, userName)) {
      return {
        text: wordReplacementResult,
        wasSimplified: wordReplacementResult !== text,
        strategyUsed: wordReplacementResult !== text ? 'word-replacement' : 'none',
        gradeLevel: 1
      };
    }

    // Strategy 2: Try sentence restructuring
    const restructuredResult = this.restructureSentence(wordReplacementResult);
    if (this.validateLevel1Text(restructuredResult, userName)) {
      return {
        text: restructuredResult,
        wasSimplified: true,
        strategyUsed: 'sentence-restructuring',
        gradeLevel: 1
      };
    }

    // Strategy 3: Context-aware relaxation (allow 1-2 story words)
    const relaxedResult = this.applyContextRelaxation(restructuredResult, userName);
    if (relaxedResult.isValid) {
      return {
        text: relaxedResult.text,
        wasSimplified: true,
        strategyUsed: 'context-relaxation',
        originalInvalidWords: relaxedResult.allowedWords,
        gradeLevel: 1
      };
    }

    // All strategies failed - return original with failure info
    return {
      text: text,
      wasSimplified: false,
      strategyUsed: 'none',
      originalInvalidWords: this.getInvalidWords(text, userName),
      gradeLevel: 1
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
    // Break long sentences with "and" into separate sentences
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
      .replace(/All of a sudden/gi, 'Then')
      .replace(/A lot of/gi, 'Many')
      .replace(/Very much/gi, 'A lot')
      .replace(/Right now/gi, 'Now')
      .replace(/Over there/gi, 'There');
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
      return !isLevel1Word(word);
    });

    // Allow up to 2 story-enhancing words that are appropriate for Level 1
    if (invalidWords.length <= 2) {
      const storyWords = [
        'adventure', 'magic', 'treasure', 'forest', 'castle', 'journey',
        'discover', 'explore', 'wonderful', 'amazing', 'special', 'secret'
      ];
      
      const allowedInvalid = invalidWords.filter(word => 
        storyWords.includes(word) || 
        (word.length <= 8 && !word.includes('tion') && !word.includes('sion'))
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
   * Validate text against Level 1 vocabulary using new grade-based system
   */
  private static validateLevel1Text(text: string, userName: string): boolean {
    const validation = validateLevel1Sentence(text, userName);
    return validation.isValid;
  }

  /**
   * Get list of invalid words for debugging
   */
  private static getInvalidWords(text: string, userName: string): string[] {
    const validation = validateLevel1Sentence(text, userName);
    return validation.invalidWords;
  }

  /**
   * Get simplified vocabulary stats
   */
  static getVocabularyStats(): {
    gradeLevel: number;
    totalWords: number;
    replacementRules: number;
  } {
    return {
      gradeLevel: 1,
      totalWords: 120, // Approximate Level 1 vocabulary size
      replacementRules: this.WORD_REPLACEMENTS.size
    };
  }

  /**
   * Test if simplification is working properly
   */
  static testSimplification(testCases: { input: string; expected: string; userName?: string }[]): {
    passed: number;
    failed: number;
    details: Array<{ input: string; output: string; expected: string; passed: boolean }>;
  } {
    let passed = 0;
    let failed = 0;
    const details: Array<{ input: string; output: string; expected: string; passed: boolean }> = [];

    for (const testCase of testCases) {
      const result = this.simplifyForLevel1(testCase.input, testCase.userName || 'TestUser');
      const isPassed = result.text === testCase.expected;
      
      if (isPassed) {
        passed++;
      } else {
        failed++;
      }

      details.push({
        input: testCase.input,
        output: result.text,
        expected: testCase.expected,
        passed: isPassed
      });
    }

    return { passed, failed, details };
  }
}