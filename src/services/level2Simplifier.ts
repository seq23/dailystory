// Level 2 Simplifier - Updated for Grade-Based Vocabulary
import { isLevel2Word, validateLevel2Sentence } from '@/constants/gradeBased/level2Vocabulary';

export class Level2Simplifier {
  static simplifyForLevel2(text: string, userName: string) {
    const validation = validateLevel2Sentence(text, userName);
    return {
      text: validation.isValid ? text : this.attemptSimplification(text),
      wasSimplified: !validation.isValid,
      strategyUsed: validation.isValid ? 'none' : 'word-replacement',
      gradeLevel: 2
    };
  }

  private static attemptSimplification(text: string): string {
    return text
      .replace(/extraordinary/gi, 'amazing')
      .replace(/magnificent/gi, 'beautiful')
      .replace(/tremendous/gi, 'very big')
      .replace(/investigate/gi, 'look into')
      .replace(/discover/gi, 'find');
  }
}