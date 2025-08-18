// Smart Phonetic Mapper - Generates phonetic pronunciations for comprehensive dictionary
// Prioritizes existing data sources and generates IPA for missing words

import { phoneticDictionary } from '@/utils/phoneticDictionary';
import autoPhonicsFromVocab from '@/data/autoPhonicsFromVocab';
import phonicsMiniDict from '@/data/phonicsMiniDict';
import { phoneticRulesEngine } from '@/services/phoneticRulesEngine';

export interface PhoneticMapping {
  word: string;
  pronunciation: string;
  source: 'phonetic-dict' | 'syllable-breakdown' | 'curated-override' | 'generated-ipa';
  confidence: 'high' | 'medium' | 'low';
}

export class SmartPhoneticMapper {
  private static phoneticCache: Map<string, PhoneticMapping> = new Map();
  
  // Clear cache on initialization to ensure context-aware caching works properly
  static {
    this.phoneticCache.clear();
  }

  /**
   * Gets the best available phonetic mapping for a word
   * @param word - The word to get phonetic mapping for
   * @param context - 'learning' for syllable emphasis or 'conversation' for natural speech
   */
  static async getPhoneticMapping(word: string, context: 'learning' | 'conversation' = 'learning'): Promise<PhoneticMapping> {
    const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
    
    // Check cache first - use context-aware cache key
    const cacheKey = `${normalized}-${context}`;
    if (this.phoneticCache.has(cacheKey)) {
      return this.phoneticCache.get(cacheKey)!;
    }

    let mapping: PhoneticMapping;

    // Priority 1: Curated overrides (highest confidence) - SKIP for conversation context
    if (context === 'learning' && normalized in phonicsMiniDict) {
      const syllables = phonicsMiniDict[normalized];
      mapping = {
        word: normalized,
        pronunciation: this.syllablesToIPA(syllables),
        source: 'curated-override',
        confidence: 'high'
      };
    }
    // Priority 2: Existing phonetic dictionary
    else if (normalized in phoneticDictionary) {
      mapping = {
        word: normalized,
        pronunciation: this.phoneticSpellingToIPA(phoneticDictionary[normalized]),
        source: 'phonetic-dict',
        confidence: 'high'
      };
    }
    // Priority 3: Auto-generated syllable breakdowns - SKIP for conversation context
    else if (context === 'learning' && normalized in autoPhonicsFromVocab) {
      const syllables = autoPhonicsFromVocab[normalized];
      mapping = {
        word: normalized,
        pronunciation: this.syllablesToIPA(syllables),
        source: 'syllable-breakdown',
        confidence: 'medium'
      };
    }
    // Priority 4: Generate using phonetic rules engine
    else {
      try {
        const syllables = await phoneticRulesEngine.breakIntoSyllablesAsync(normalized);
        mapping = {
          word: normalized,
          pronunciation: this.syllablesToIPA(syllables),
          source: 'generated-ipa',
          confidence: 'medium'
        };
      } catch (error) {
        console.warn(`Failed to generate phonetics for "${normalized}":`, error);
        // Fallback to basic pronunciation guess
        mapping = {
          word: normalized,
          pronunciation: this.basicPhoneticGuess(normalized),
          source: 'generated-ipa',
          confidence: 'low'
        };
      }
    }

    // Cache the result with context-aware key
    this.phoneticCache.set(cacheKey, mapping);
    return mapping;
  }

  /**
   * Converts kid-friendly phonetic spelling to IPA notation
   */
  private static phoneticSpellingToIPA(phoneticSpelling: string): string {
    // Map common phonetic spellings to IPA symbols
    const phoneticToIPA: Record<string, string> = {
      // Vowels
      'ay': 'eɪ',
      'ee': 'iː',
      'eye': 'aɪ',
      'oh': 'oʊ',
      'oo': 'uː',
      'ow': 'aʊ',
      'oy': 'ɔɪ',
      'er': 'ɜr',
      'ar': 'ɑr',
      'or': 'ɔr',
      'ur': 'ɜr',
      'ir': 'ɪr',
      
      // Consonants
      'ch': 'tʃ',
      'sh': 'ʃ',
      'th': 'θ',
      'wh': 'w',
      'ng': 'ŋ',
      'nk': 'ŋk',
      
      // Single letters
      'a': 'æ',
      'e': 'ɛ',
      'i': 'ɪ',
      'o': 'ɑ',
      'u': 'ʌ',
      'y': 'j'
    };

    let ipa = phoneticSpelling.toLowerCase();
    
    // Replace multi-character patterns first (longer matches take priority)
    const sortedPatterns = Object.keys(phoneticToIPA).sort((a, b) => b.length - a.length);
    
    for (const pattern of sortedPatterns) {
      ipa = ipa.replace(new RegExp(pattern, 'g'), phoneticToIPA[pattern]);
    }

    return ipa;
  }

  /**
   * Converts syllable array to IPA notation
   */
  private static syllablesToIPA(syllables: string[]): string {
    return syllables.map(syllable => this.phoneticSpellingToIPA(syllable)).join('.');
  }

  /**
   * Basic phonetic guess for words without any existing data
   */
  private static basicPhoneticGuess(word: string): string {
    // Simple letter-to-sound mapping for emergency fallback
    const basicMap: Record<string, string> = {
      'a': 'æ', 'b': 'b', 'c': 'k', 'd': 'd', 'e': 'ɛ',
      'f': 'f', 'g': 'g', 'h': 'h', 'i': 'ɪ', 'j': 'dʒ',
      'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'ɑ',
      'p': 'p', 'q': 'kw', 'r': 'r', 's': 's', 't': 't',
      'u': 'ʌ', 'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j', 'z': 'z'
    };

    return word.split('').map(char => basicMap[char] || char).join('');
  }

  /**
   * Generates mappings for a batch of words
   */
  static async batchGeneratePhonetics(words: string[], context: 'learning' | 'conversation' = 'learning'): Promise<PhoneticMapping[]> {
    const mappings: PhoneticMapping[] = [];
    
    console.log(`Generating phonetic mappings for ${words.length} words...`);
    
    // Process in smaller batches to avoid overwhelming the system
    const batchSize = 50;
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const batchPromises = batch.map(word => this.getPhoneticMapping(word, context));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        mappings.push(...batchResults);
        
        if (i + batchSize < words.length) {
          // Small delay between batches to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing batch ${i}-${i + batchSize}:`, error);
        // Continue with individual processing for this batch
        for (const word of batch) {
          try {
            const mapping = await this.getPhoneticMapping(word, context);
            mappings.push(mapping);
          } catch (wordError) {
            console.error(`Failed to process word "${word}":`, wordError);
          }
        }
      }
    }

    console.log(`Generated ${mappings.length} phonetic mappings`);
    return mappings;
  }

  /**
   * Gets statistics about phonetic mapping coverage
   */
  static getPhoneticStatistics(): {
    totalCached: number;
    bySource: Record<string, number>;
    byConfidence: Record<string, number>;
  } {
    const stats = {
      totalCached: this.phoneticCache.size,
      bySource: {} as Record<string, number>,
      byConfidence: {} as Record<string, number>
    };

    this.phoneticCache.forEach(mapping => {
      stats.bySource[mapping.source] = (stats.bySource[mapping.source] || 0) + 1;
      stats.byConfidence[mapping.confidence] = (stats.byConfidence[mapping.confidence] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clears the phonetic cache
   */
  static clearCache(): void {
    this.phoneticCache.clear();
  }
}