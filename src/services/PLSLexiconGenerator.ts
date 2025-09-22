// PLS Lexicon Generator - Creates comprehensive ElevenLabs-compatible pronunciation lexicons
// Generates large-scale PLS XML files with all vocabulary pronunciations

import { ComprehensiveVocabularyCollector } from './ComprehensiveVocabularyCollector';
import { SmartPhoneticMapper, type PhoneticMapping } from './SmartPhoneticMapper';
import { DebugLogger } from '@/services/DebugLogger';

export interface PLSGenerationOptions {
  includeLevel?: number[]; // Which reading levels to include (default: all)
  maxWords?: number; // Maximum words in lexicon (default: unlimited)
  minConfidence?: 'low' | 'medium' | 'high'; // Minimum pronunciation confidence
  contextualVariants?: boolean; // Include learning-specific variants
}

export interface PLSGenerationResult {
  plsXml: string;
  wordCount: number;
  statistics: {
    byLevel: Record<number, number>;
    bySource: Record<string, number>;
    byConfidence: Record<string, number>;
  };
  metadata: {
    generatedAt: string;
    options: PLSGenerationOptions;
    version: string;
  };
}

export class PLSLexiconGenerator {
  private static readonly PLS_VERSION = "1.0";
  private static readonly LEXICON_NAME = "Charlotte's Comprehensive Learning Lexicon";

  /**
   * Generates a comprehensive PLS lexicon XML
   */
  static async generateComprehensiveLexicon(
    options: PLSGenerationOptions = {}
  ): Promise<PLSGenerationResult> {
    const startTime = Date.now();
    DebugLogger.log('performance', 'Starting comprehensive PLS lexicon generation...');

    // Set defaults
    const opts: Required<PLSGenerationOptions> = {
      includeLevel: options.includeLevel || [0, 1, 2, 3, 4],
      maxWords: options.maxWords || Infinity,
      minConfidence: options.minConfidence || 'low',
      contextualVariants: options.contextualVariants ?? true
    };

    // Get vocabulary entries
    const vocabularyEntries = ComprehensiveVocabularyCollector.getVocabularyEntries();
    
    // Filter by level
    const relevantWords = Array.from(vocabularyEntries.values())
      .filter(entry => opts.includeLevel.includes(entry.level))
      .map(entry => entry.word)
      .slice(0, opts.maxWords);

    DebugLogger.log('performance', `Processing ${relevantWords.length} words for PLS generation`);

    // Generate phonetic mappings
    const phoneticMappings = await SmartPhoneticMapper.batchGeneratePhonetics(relevantWords);

    // Filter by confidence
    const filteredMappings = this.filterByConfidence(phoneticMappings, opts.minConfidence);

    DebugLogger.log('performance', `Generating PLS XML for ${filteredMappings.length} words`);

    // Generate PLS XML
    const plsXml = this.generatePLSXML(filteredMappings, opts);

    // Calculate statistics
    const statistics = this.calculateStatistics(filteredMappings, vocabularyEntries);

    const generationTime = Date.now() - startTime;
    DebugLogger.log('performance', `PLS lexicon generation completed in ${generationTime}ms`);

    return {
      plsXml,
      wordCount: filteredMappings.length,
      statistics,
      metadata: {
        generatedAt: new Date().toISOString(),
        options: opts,
        version: this.PLS_VERSION
      }
    };
  }

  /**
   * Generates PLS XML from phonetic mappings
   */
  private static generatePLSXML(
    mappings: PhoneticMapping[],
    options: Required<PLSGenerationOptions>
  ): string {
    const lexemes = mappings.map(mapping => this.createLexeme(mapping, options)).join('\n    ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<lexicon version="1.0"
         xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.w3.org/2005/01/pronunciation-lexicon
         http://www.w3.org/TR/2007/REC-pronunciation-lexicon-20071211/pls.xsd"
         alphabet="ipa" xml:lang="en-US">
    
    <!-- ${this.LEXICON_NAME} -->
    <!-- Generated: ${new Date().toISOString()} -->
    <!-- Word Count: ${mappings.length} -->
    <!-- Confidence Filter: ${options.minConfidence}+ -->
    
    ${lexemes}
    
</lexicon>`;
  }

  /**
   * Creates a lexeme entry for PLS XML
   */
  private static createLexeme(mapping: PhoneticMapping, options: Required<PLSGenerationOptions>): string {
    const baseEntry = `<lexeme>
        <grapheme>${this.escapeXML(mapping.word)}</grapheme>
        <phoneme>${this.escapeXML(mapping.pronunciation)}</phoneme>
    </lexeme>`;

    // Add contextual variants for learning mode
    if (options.contextualVariants && mapping.confidence === 'high') {
      const learningVariant = this.createLearningVariant(mapping);
      return baseEntry + '\n    ' + learningVariant;
    }

    return baseEntry;
  }

  /**
   * Creates learning-specific pronunciation variant
   */
  private static createLearningVariant(mapping: PhoneticMapping): string {
    // Create slower, more deliberate pronunciation for learning context
    const syllables = mapping.pronunciation.split('.');
    const learningPronunciation = syllables.join(' . '); // Add pauses between syllables

    return `<lexeme>
        <grapheme>${this.escapeXML(mapping.word)}_learning</grapheme>
        <phoneme>${this.escapeXML(learningPronunciation)}</phoneme>
    </lexeme>`;
  }

  /**
   * Filters mappings by confidence level
   */
  private static filterByConfidence(
    mappings: PhoneticMapping[],
    minConfidence: 'low' | 'medium' | 'high'
  ): PhoneticMapping[] {
    const confidenceOrder = { 'low': 0, 'medium': 1, 'high': 2 };
    const minLevel = confidenceOrder[minConfidence];

    return mappings.filter(mapping => 
      confidenceOrder[mapping.confidence] >= minLevel
    );
  }

  /**
   * Calculates generation statistics
   */
  private static calculateStatistics(
    mappings: PhoneticMapping[],
    vocabularyEntries: Map<string, any>
  ) {
    const stats = {
      byLevel: {} as Record<number, number>,
      bySource: {} as Record<string, number>,
      byConfidence: {} as Record<string, number>
    };

    mappings.forEach(mapping => {
      // Source statistics
      stats.bySource[mapping.source] = (stats.bySource[mapping.source] || 0) + 1;
      
      // Confidence statistics
      stats.byConfidence[mapping.confidence] = (stats.byConfidence[mapping.confidence] || 0) + 1;
      
      // Level statistics
      const entry = vocabularyEntries.get(mapping.word);
      if (entry) {
        const level = entry.level;
        stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Escapes XML special characters
   */
  private static escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generates a smaller focused lexicon for specific reading levels
   */
  static async generateLevelSpecificLexicon(levels: number[]): Promise<PLSGenerationResult> {
    return this.generateComprehensiveLexicon({
      includeLevel: levels,
      minConfidence: 'medium',
      contextualVariants: true
    });
  }

  /**
   * Generates a learning-optimized lexicon (high confidence, contextual variants)
   */
  static async generateLearningLexicon(): Promise<PLSGenerationResult> {
    return this.generateComprehensiveLexicon({
      includeLevel: [0, 1, 2], // Focus on early reading levels
      minConfidence: 'high',
      contextualVariants: true,
      maxWords: 500 // Reasonable size for reliable performance
    });
  }

  /**
   * Generates a conversation-optimized lexicon (all levels, natural pronunciation)
   */
  static async generateConversationLexicon(): Promise<PLSGenerationResult> {
    return this.generateComprehensiveLexicon({
      includeLevel: [0, 1, 2, 3, 4],
      minConfidence: 'medium',
      contextualVariants: false, // Natural pronunciation only
      maxWords: 1000
    });
  }
}