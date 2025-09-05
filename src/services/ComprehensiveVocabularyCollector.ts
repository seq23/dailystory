// Comprehensive Vocabulary Collector - Educational Standards Migration
// Now uses educational compliance instead of static vocabulary imports
// Aligns with backend educational standards approach

import { 
  LEVEL_0_VOCABULARY, 
  LEVEL_1_VOCABULARY, 
  type GradeLevel
} from '@/constants/gradeBased';
import { 
  isEducationallyAppropriate,
  calculateEducationalCompliance,
  getEducationalLevelInfo
} from '@/constants/educationalStandards';
import { phoneticDictionary } from '@/utils/phoneticDictionary';
import autoPhonicsFromVocab from '@/data/autoPhonicsFromVocab';
import phonicsMiniDict from '@/data/phonicsMiniDict';

export interface VocabularyEntry {
  word: string;
  level: number;
  hasPhoneticSpelling: boolean;
  hasSyllableBreakdown: boolean;
  source: string[];
  isEducationallyAppropriate: boolean;
  educationalLevel?: GradeLevel;
}

export class ComprehensiveVocabularyCollector {
  private static vocabularyCache: Map<string, VocabularyEntry> | null = null;
  private static allWordsCache: Set<string> | null = null;

  /**
   * Gets all unique words from all vocabulary sources (Educational Standards approach)
   */
  static getAllWords(): Set<string> {
    if (this.allWordsCache) {
      return this.allWordsCache;
    }

    const allWords = new Set<string>();
    
    // Add core educational vocabulary (replaces static vocabulary imports)
    for (const word of LEVEL_0_VOCABULARY) allWords.add(String(word).toLowerCase());
    for (const word of LEVEL_1_VOCABULARY) allWords.add(String(word).toLowerCase());
    
    // Add phonetic dictionary words
    Object.keys(phoneticDictionary).forEach(word => allWords.add(word.toLowerCase()));
    
    // Add auto-generated phonics words
    Object.keys(autoPhonicsFromVocab).forEach(word => allWords.add(word.toLowerCase()));
    
    // Add curated phonics words
    Object.keys(phonicsMiniDict).forEach(word => allWords.add(word.toLowerCase()));

    this.allWordsCache = allWords;
    console.log(`Collected ${allWords.size} unique words from educational standards + phonetic sources`);
    
    return allWords;
  }

  /**
   * Gets detailed vocabulary entries with educational compliance metadata
   */
  static getVocabularyEntries(): Map<string, VocabularyEntry> {
    if (this.vocabularyCache) {
      return this.vocabularyCache;
    }

    const entries = new Map<string, VocabularyEntry>();
    
    // Helper to add word with educational level tracking
    const addWord = (word: string, level: number, source: string, educationalLevel?: GradeLevel) => {
      const normalized = String(word).toLowerCase();
      if (!normalized) return;
      
      const existing = entries.get(normalized);
      if (existing) {
        // Keep lowest level (most basic) and merge sources
        existing.level = Math.min(existing.level, level);
        if (!existing.source.includes(source)) {
          existing.source.push(source);
        }
        // Update educational appropriateness if not already set
        if (!existing.isEducationallyAppropriate && educationalLevel !== undefined) {
          existing.isEducationallyAppropriate = isEducationallyAppropriate(normalized, educationalLevel);
          existing.educationalLevel = educationalLevel;
        }
      } else {
        entries.set(normalized, {
          word: normalized,
          level,
          hasPhoneticSpelling: normalized in phoneticDictionary,
          hasSyllableBreakdown: normalized in autoPhonicsFromVocab || normalized in phonicsMiniDict,
          source: [source],
          isEducationallyAppropriate: educationalLevel !== undefined ? 
            isEducationallyAppropriate(normalized, educationalLevel) : false,
          educationalLevel
        });
      }
    };

    // Add educational vocabulary (replaces static vocabulary lists)
    LEVEL_0_VOCABULARY.forEach(word => addWord(String(word), 0, 'educational-level-0', 0));
    LEVEL_1_VOCABULARY.forEach(word => addWord(String(word), 1, 'educational-level-1', 1));
    
    // Add phonetic dictionary entries
    Object.keys(phoneticDictionary).forEach(word => {
      const normalized = word.toLowerCase();
      const existing = entries.get(normalized);
      if (existing) {
        existing.hasPhoneticSpelling = true;
        if (!existing.source.includes('phonetic')) {
          existing.source.push('phonetic');
        }
      } else {
        entries.set(normalized, {
          word: normalized,
          level: 99, // Unknown level
          hasPhoneticSpelling: true,
          hasSyllableBreakdown: false,
          source: ['phonetic'],
          isEducationallyAppropriate: false,
          educationalLevel: undefined
        });
      }
    });

    this.vocabularyCache = entries;
    console.log(`Created ${entries.size} vocabulary entries with educational compliance metadata`);
    
    return entries;
  }

  /**
   * Gets vocabulary statistics
   */
  static getStatistics() {
    const entries = this.getVocabularyEntries();
    const stats = {
      totalWords: entries.size,
      byLevel: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, unknown: 0 },
      withPhoneticSpelling: 0,
      withSyllableBreakdown: 0,
      readyForPLS: 0 // Has either phonetic spelling or syllable breakdown
    };

    entries.forEach(entry => {
      stats.byLevel[entry.level as keyof typeof stats.byLevel] = (stats.byLevel[entry.level as keyof typeof stats.byLevel] || 0) + 1;
      
      if (entry.hasPhoneticSpelling) stats.withPhoneticSpelling++;
      if (entry.hasSyllableBreakdown) stats.withSyllableBreakdown++;
      if (entry.hasPhoneticSpelling || entry.hasSyllableBreakdown) stats.readyForPLS++;
    });

    return stats;
  }

  /**
   * Gets words that need phonetic generation (no existing pronunciation data)
   */
  static getWordsNeedingPhonetics(): string[] {
    const entries = this.getVocabularyEntries();
    const needingPhonetics: string[] = [];

    entries.forEach(entry => {
      if (!entry.hasPhoneticSpelling && !entry.hasSyllableBreakdown) {
        needingPhonetics.push(entry.word);
      }
    });

    return needingPhonetics.sort();
  }

  /**
   * Clears cache (useful for testing or forced refresh)
   */
  static clearCache(): void {
    this.vocabularyCache = null;
    this.allWordsCache = null;
  }

  /**
   * Gets words by reading level
   */
  static getWordsByLevel(level: number): string[] {
    const entries = this.getVocabularyEntries();
    const words: string[] = [];

    entries.forEach(entry => {
      if (entry.level === level) {
        words.push(entry.word);
      }
    });

    return words.sort();
  }
}
