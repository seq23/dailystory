// Level 3 Simplifier - Updated for Grade-Based Vocabulary
import { isLevel3Word, validateLevel3Sentence } from '@/constants/gradeBased/level3Vocabulary';

export class Level3Simplifier {
  static simplifyForLevel3(text: string, userName: string) {
    const validation = validateLevel3Sentence(text, userName);
    return {
      text: validation.isValid ? text : this.attemptSimplification(text),
      wasSimplified: !validation.isValid,
      strategyUsed: validation.isValid ? 'none' : 'word-replacement',
      gradeLevel: 3
    };
  }

  private static attemptSimplification(text: string): string {
    return text
      .replace(/sophisticated/gi, 'advanced')
      .replace(/comprehensive/gi, 'complete')
      .replace(/extraordinary/gi, 'amazing');
  }
}