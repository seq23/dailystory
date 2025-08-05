// Level 0 Simplifier for ultra-simple pre-reading vocabulary (ages 3-5)
import { validateLevel0SentenceByUserType, FREE_LEVEL_0_VOCABULARY } from '@/constants/dolchPrePrimer';

interface SimplificationResult {
  simplifiedText: string;
  wasSimplified: boolean;
  strategy: 'level0-vocabulary' | 'ultra-simple-replacement' | 'context-relaxation' | 'none';
  originalInvalidWords?: string[];
}

export class Level0Simplifier {
  // Ultra-simple word replacements for Level 0
  private static WORD_REPLACEMENTS: Record<string, string> = {
    // Complex to ultra-simple
    'beautiful': 'nice',
    'wonderful': 'good',
    'exciting': 'fun',
    'adventure': 'fun time',
    'discover': 'find',
    'explore': 'look',
    'journey': 'go',
    'magical': 'nice',
    'mysterious': 'funny',
    'amazing': 'good',
    'incredible': 'very good',
    'fantastic': 'fun',
    'extraordinary': 'very nice',
    'magnificent': 'big',
    'delicious': 'good',
    'enormous': 'very big',
    'tiny': 'small',
    'gigantic': 'very big',
    'colossal': 'big',
    'miniature': 'small',
    
    // Actions to simple present tense
    'walked': 'goes',
    'running': 'runs',
    'jumping': 'jumps',
    'playing': 'plays',
    'eating': 'eats',
    'sleeping': 'sleeps',
    'looking': 'looks',
    'finding': 'finds',
    'helping': 'helps',
    'giving': 'gives',
    
    // Feelings to basic emotions
    'excited': 'happy',
    'joyful': 'happy',
    'content': 'happy',
    'pleased': 'happy',
    'worried': 'sad',
    'concerned': 'sad',
    'upset': 'sad',
    'angry': 'mad',
    'frustrated': 'mad',
    
    // Objects to simple equivalents
    'vehicle': 'car',
    'dwelling': 'home',
    'residence': 'house',
    'playground': 'park',
    'garden': 'yard',
    'forest': 'trees',
    'ocean': 'water',
    'mountain': 'hill',
    
    // Colors to basic
    'crimson': 'red',
    'scarlet': 'red',
    'azure': 'blue',
    'emerald': 'green',
    'golden': 'yellow',
    'violet': 'purple',
    'orange': 'orange', // Keep orange as is
    
    // Time and quantity
    'several': 'some',
    'numerous': 'many',
    'multiple': 'many',
    'various': 'many',
    'different': 'many',
    'soon': 'now',
    'later': 'then',
    'eventually': 'then',
    'immediately': 'now',
    'quickly': 'fast',
    'slowly': 'slow',
    'carefully': 'nice'
  };

  static simplifyForLevel0(text: string, userName: string): SimplificationResult {
    console.log(`🎯 Level 0 Simplification for: "${text}"`);
    
    // Strategy 1: Direct word replacement
    const wordReplacementResult = this.attemptWordReplacement(text);
    const wordValidation = validateLevel0SentenceByUserType(wordReplacementResult, 'free', userName);
    
    if (wordValidation.isValid) {
      console.log(`✅ Level 0 word replacement successful: "${wordReplacementResult}"`);
      return {
        simplifiedText: wordReplacementResult,
        wasSimplified: wordReplacementResult !== text,
        strategy: 'level0-vocabulary'
      };
    }

    // Strategy 2: Ultra-simple sentence restructuring
    const restructuredResult = this.restructureToUltraSimple(text);
    const restructureValidation = validateLevel0SentenceByUserType(restructuredResult, 'free', userName);
    
    if (restructureValidation.isValid) {
      console.log(`✅ Level 0 restructuring successful: "${restructuredResult}"`);
      return {
        simplifiedText: restructuredResult,
        wasSimplified: true,
        strategy: 'ultra-simple-replacement'
      };
    }

    // Strategy 3: Context relaxation with very limited allowances
    const relaxationResult = this.applyLevel0ContextRelaxation(text, userName);
    if (relaxationResult.isValid) {
      console.log(`✅ Level 0 context relaxation successful: "${relaxationResult.text}"`);
      return {
        simplifiedText: relaxationResult.text,
        wasSimplified: true,
        strategy: 'context-relaxation',
        originalInvalidWords: relaxationResult.allowedWords
      };
    }

    // If all strategies fail, return ultra-simplified fallback
    console.warn(`⚠️ Level 0 simplification failed, using fallback for: "${text}"`);
    const fallback = this.createUltraSimpleFallback(userName);
    return {
      simplifiedText: fallback,
      wasSimplified: true,
      strategy: 'ultra-simple-replacement'
    };
  }

  private static attemptWordReplacement(text: string): string {
    let simplified = text.toLowerCase();
    
    // Apply word replacements
    Object.entries(this.WORD_REPLACEMENTS).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    // Ensure proper capitalization
    simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1);
    
    return simplified;
  }

  private static restructureToUltraSimple(text: string): string {
    let simplified = text.toLowerCase();
    
    // Break down complex sentences
    simplified = simplified.replace(/\b(and|but|however|although|because|since|while)\b/g, '.');
    
    // Convert to present tense and simple structure
    simplified = simplified.replace(/\b(\w+)ed\b/g, (match, stem) => {
      // Simple past to present conversion
      if (stem.endsWith('e')) return stem + 's';
      return stem + 's';
    });
    
    // Remove complex modifiers
    simplified = simplified.replace(/\b(very|quite|extremely|incredibly|absolutely|totally|completely)\s+/g, '');
    
    // Simplify sentence structure to "subject verb object" pattern
    const sentences = simplified.split(/[.!?]+/).filter(s => s.trim());
    const ultraSimple = sentences.map(sentence => {
      const words = sentence.trim().split(/\s+/);
      if (words.length > 6) {
        // Take only first 6 words and ensure it makes sense
        return words.slice(0, 6).join(' ') + '.';
      }
      return sentence.trim() + '.';
    }).join(' ');
    
    // Ensure proper capitalization
    return ultraSimple.charAt(0).toUpperCase() + ultraSimple.slice(1);
  }

  private static applyLevel0ContextRelaxation(text: string, userName: string): { isValid: boolean; text: string; allowedWords: string[] } {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const userNameLower = userName?.toLowerCase();
    const invalidWords = words.filter(word => {
      if (userNameLower && word === userNameLower) return false;
      return !FREE_LEVEL_0_VOCABULARY.has(word.toLowerCase());
    });

    // For Level 0, allow maximum 1 "story-enhancing" word
    if (invalidWords.length <= 1) {
      const allowedWords = invalidWords.filter(word => this.isLevel0StoryEnhancing(word));
      if (allowedWords.length === invalidWords.length) {
        return {
          isValid: true,
          text: text,
          allowedWords
        };
      }
    }

    return { isValid: false, text: text, allowedWords: [] };
  }

  private static isLevel0StoryEnhancing(word: string): boolean {
    // Very limited set of words that might enhance Level 0 stories
    const storyWords = [
      'friend', 'friends', 'together', 'love', 'care', 'help', 'share',
      'today', 'day', 'time', 'now', 'here', 'there'
    ];
    return storyWords.includes(word.toLowerCase());
  }

  private static createUltraSimpleFallback(userName: string): string {
    const templates = [
      `${userName} sees a cat.`,
      `${userName} plays with dog.`,
      `${userName} likes the ball.`,
      `${userName} goes to tree.`,
      `${userName} is very happy.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate a simplified story for Level 0 fallback content
   */
  static async generateSimplifiedStory(userInfo?: any): Promise<{ pages: string[] }> {
    const userName = userInfo?.name || 'I';
    
    // Ultra-simple Level 0 fallback content using only Dolch Pre-Primer words
    const simplePages = [
      `${userName} sees a cat.`,
      `The cat is big.`,
      `${userName} likes the cat.`,
      `We play and run.`,
      `It is fun to play.`,
      `${userName} has a ball.`,
      `The ball is red.`,
      `We play with the ball.`,
      `${userName} can jump.`,
      `Jump is fun to do.`
    ];
    
    // Validate each page to ensure compliance
    const validPages = simplePages.filter(page => {
      const validation = validateLevel0SentenceByUserType(page, 'free', userName);
      return validation.isValid;
    });
    
    // If validation fails, use emergency ultra-simple content
    if (validPages.length < 5) {
      return {
        pages: [
          `${userName} sees cat.`,
          `Cat is big.`,
          `${userName} likes cat.`,
          `We play.`,
          `It is fun.`
        ]
      };
    }
    
    return { pages: validPages.slice(0, 10) };
  }

  // Validation helpers
  static validateLevel0Text(text: string, userName: string): boolean {
    const validation = validateLevel0SentenceByUserType(text, 'free', userName);
    return validation.isValid;
  }

  static getInvalidWords(text: string, userName: string): string[] {
    const validation = validateLevel0SentenceByUserType(text, 'free', userName);
    return validation.invalidWords;
  }
}