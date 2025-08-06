// Level 4 Simplifier - Context-Aware Validation for Advanced Users
import { isLevel4Word, validateLevel4Sentence } from '@/constants/gradeBased/level4Vocabulary';

export class Level4Simplifier {
  // Author voice and story-enhancing words that are allowed even if not in vocabulary
  private static AUTHOR_VOICE_ALLOWLIST = new Set([
    // Creative storytelling terms
    'extraordinary', 'magnificent', 'sophisticated', 'tremendous', 'fascinating',
    'spectacular', 'incredible', 'exceptional', 'remarkable', 'outstanding',
    // Narrative flow words
    'meanwhile', 'consequently', 'furthermore', 'nevertheless', 'therefore',
    'however', 'moreover', 'subsequently', 'alternatively', 'ultimately',
    // Character development terms
    'personality', 'characteristics', 'determination', 'perseverance', 'resilience',
    'confidence', 'enthusiasm', 'dedication', 'creativity', 'imagination',
    // Advanced descriptive words
    'atmosphere', 'environment', 'circumstances', 'opportunities', 'experiences',
    'adventures', 'challenges', 'discoveries', 'investigations', 'explorations'
  ]);

  static simplifyForLevel4(text: string, userName: string) {
    const relaxedValidation = this.validateWithContextRelaxation(text, userName);
    return {
      text: relaxedValidation.isValid ? text : this.attemptSimplification(text),
      wasSimplified: !relaxedValidation.isValid,
      strategyUsed: relaxedValidation.isValid ? 'context-relaxed' : 'word-replacement',
      gradeLevel: 4,
      contextAllowed: relaxedValidation.contextAllowedWords
    };
  }

  private static validateWithContextRelaxation(sentence: string, userName?: string): { 
    isValid: boolean; 
    invalidWords: string[];
    contextAllowedWords: string[];
  } {
    const words = sentence.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const userNameLower = userName?.toLowerCase();
    const contextAllowedWords: string[] = [];
    
    const invalidWords = words.filter(word => {
      // Allow user's name
      if (userNameLower && word === userNameLower) {
        return false;
      }
      
      // Check standard vocabulary
      if (isLevel4Word(word)) {
        return false;
      }
      
      // Allow author voice and story-enhancing words
      if (this.AUTHOR_VOICE_ALLOWLIST.has(word)) {
        contextAllowedWords.push(word);
        return false;
      }
      
      return true;
    });
    
    // Allow up to 5 context-enhanced words per sentence for Level 4
    const maxContextWords = 5;
    const remainingInvalidWords = invalidWords.slice(maxContextWords);
    const additionalContextWords = invalidWords.slice(0, maxContextWords);
    
    contextAllowedWords.push(...additionalContextWords);
    
    return {
      isValid: remainingInvalidWords.length === 0,
      invalidWords: remainingInvalidWords,
      contextAllowedWords
    };
  }

  private static attemptSimplification(text: string): string {
    return text
      .replace(/extraordinary/gi, 'amazing')
      .replace(/magnificent/gi, 'wonderful')
      .replace(/tremendous/gi, 'very large')
      .replace(/sophisticated/gi, 'advanced')
      .replace(/consequently/gi, 'as a result')
      .replace(/nevertheless/gi, 'however')
      .replace(/furthermore/gi, 'also')
      .replace(/subsequently/gi, 'then')
      .replace(/alternatively/gi, 'instead')
      .replace(/ultimately/gi, 'in the end');
  }
}