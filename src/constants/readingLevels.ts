/**
 * Educational Reading Level Standards
 * Based on early childhood literacy research and child educator best practices
 */

export interface ReadingLevelConfig {
  level: string;
  name: string;
  maxWordsPerPage: number;
  description: string;
  fontSize: string;
  lineHeight: string;
  spacing: string;
  targetAge: string;
  educationalGoals: string[];
}

export const READING_LEVEL_STANDARDS: Record<string, ReadingLevelConfig> = {
  easy: {
    level: 'easy',
    name: 'Emergent Reader',
    maxWordsPerPage: 6,
    description: 'Simple words, basic sentences, high-frequency sight words',
    fontSize: 'text-4xl md:text-5xl lg:text-6xl',
    lineHeight: 'leading-loose',
    spacing: 'space-y-8',
    targetAge: 'PreK-1st Grade (Ages 4-6)',
    educationalGoals: [
      'Letter recognition',
      'Basic phonics',
      'Sight word development',
      'Left-to-right reading pattern'
    ]
  },
  medium: {
    level: 'medium',
    name: 'Early Reader',
    maxWordsPerPage: 8,
    description: 'Short sentences, familiar vocabulary, simple storylines',
    fontSize: 'text-3xl md:text-4xl lg:text-5xl',
    lineHeight: 'leading-relaxed',
    spacing: 'space-y-6',
    targetAge: '1st-2nd Grade (Ages 6-7)',
    educationalGoals: [
      'Phonetic decoding',
      'Fluency building',
      'Basic comprehension',
      'Vocabulary expansion'
    ]
  },
  hard: {
    level: 'hard',
    name: 'Developing Reader',
    maxWordsPerPage: 12,
    description: 'Longer sentences, expanded vocabulary, complex storylines',
    fontSize: 'text-2xl md:text-3xl lg:text-4xl',
    lineHeight: 'leading-relaxed',
    spacing: 'space-y-4',
    targetAge: '2nd-3rd Grade (Ages 7-8)',
    educationalGoals: [
      'Reading comprehension',
      'Context clues usage',
      'Multi-syllable words',
      'Story structure understanding'
    ]
  },
  expert: {
    level: 'expert',
    name: 'Fluent Reader',
    maxWordsPerPage: 15,
    description: 'Complex sentences, advanced vocabulary, sophisticated themes',
    fontSize: 'text-xl md:text-2xl lg:text-3xl',
    lineHeight: 'leading-normal',
    spacing: 'space-y-4',
    targetAge: '3rd-4th Grade (Ages 8-9)',
    educationalGoals: [
      'Advanced comprehension',
      'Critical thinking',
      'Inference skills',
      'Independent reading'
    ]
  }
};

/**
 * Get reading level configuration by difficulty
 */
export function getReadingLevelConfig(difficulty: string): ReadingLevelConfig {
  return READING_LEVEL_STANDARDS[difficulty] || READING_LEVEL_STANDARDS.easy;
}

/**
 * Validate that text meets word count requirements for reading level
 */
export function validateWordCount(text: string, difficulty: string): boolean {
  const config = getReadingLevelConfig(difficulty);
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  return wordCount <= config.maxWordsPerPage;
}

/**
 * Split text to meet word count requirements
 */
export function enforceWordLimit(text: string, difficulty: string): string {
  const config = getReadingLevelConfig(difficulty);
  const words = text.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length <= config.maxWordsPerPage) {
    return text;
  }
  
  return words.slice(0, config.maxWordsPerPage).join(' ') + '.';
}