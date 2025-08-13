import { supabase } from "@/integrations/supabase/client";

export interface ParsedTag {
  original: string;
  corrected: string;
  confidence: number;
  isPlural: boolean;
}

export interface SmartParsingResult {
  originalTags: string[];
  parsedTags: ParsedTag[];
  processingTime: number;
  errors: string[];
  summary: {
    totalTags: number;
    correctedTags: number;
    highConfidenceTags: number;
  };
}

export class SmartInputParser {
  private static readonly CACHE_SIZE = 100;
  private static spellCache = new Map<string, string>();

  /**
   * Parse an array of user input tags, correcting spelling and extracting context
   */
  static async parseTaggedInput(
    tags: string[],
    userInfo?: any,
    mobileOptimized: boolean = true
  ): Promise<SmartParsingResult> {
    const startTime = Date.now();
    const result: SmartParsingResult = {
      originalTags: [...tags],
      parsedTags: [],
      processingTime: 0,
      errors: [],
      summary: {
        totalTags: tags.length,
        correctedTags: 0,
        highConfidenceTags: 0
      }
    };

    try {
      // Process tags in parallel for mobile optimization
      const parsedTags = await Promise.all(
        tags.map(tag => this.parseIndividualTag(tag, userInfo))
      );

      result.parsedTags = parsedTags.filter(Boolean) as ParsedTag[];
      
      // Calculate summary
      result.summary.correctedTags = result.parsedTags.filter(
        tag => tag.original !== tag.corrected
      ).length;
      
      result.summary.highConfidenceTags = result.parsedTags.filter(
        tag => tag.confidence >= 0.9
      ).length;

    } catch (error) {
      console.error('Smart parsing error:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown parsing error');
      
      // Fallback: return original tags with minimal processing
      result.parsedTags = tags.map(tag => ({
        original: tag,
        corrected: tag,
        confidence: 0.5,
        isPlural: tag.endsWith('s')
      }));
    }

    result.processingTime = Date.now() - startTime;
    return result;
  }

  /**
   * Parse and correct a single tag
   */
  private static async parseIndividualTag(
    tag: string,
    userInfo?: any
  ): Promise<ParsedTag | null> {
    if (!tag?.trim()) return null;

    const cleanTag = tag.trim().toLowerCase();
    
    try {
      // Check cache first
      const cachedCorrection = this.spellCache.get(cleanTag);
      
      let corrected = cleanTag;
      let confidence = 0.9;

      if (cachedCorrection) {
        corrected = cachedCorrection;
        confidence = 0.9; // Slightly lower confidence for cached results
      } else {
        // Attempt spelling correction
        const correctionResult = await this.correctTagSpelling(cleanTag, userInfo);
        corrected = correctionResult.corrected;
        confidence = correctionResult.confidence;
        
        // Cache the result
        if (this.spellCache.size >= this.CACHE_SIZE) {
          const firstKey = this.spellCache.keys().next().value;
          this.spellCache.delete(firstKey);
        }
        this.spellCache.set(cleanTag, corrected);
      }

      // Analyze word properties
      const isPlural = this.detectPlural(corrected);

      return {
        original: tag,
        corrected,
        confidence,
        isPlural
      };

    } catch (error) {
      console.error(`Error parsing tag "${tag}":`, error);
      
      // Return with minimal processing on error
      return {
        original: tag,
        corrected: cleanTag,
        confidence: 0.5,
        isPlural: cleanTag.endsWith('s')
      };
    }
  }

  /**
   * Correct spelling of a single tag using translation and spelling correction
   */
  private static async correctTagSpelling(
    tag: string,
    userInfo?: any
  ): Promise<{ corrected: string; confidence: number }> {
    try {
      // First, try to translate foreign words to English
      const userLanguage = userInfo?.nativeLanguage || userInfo?.language || 'en';
      
      console.log(`🔍 Processing input: "${tag}" | User language: ${userLanguage} | Grade: ${userInfo?.grade || 'K'}`);
      
      if (userLanguage !== 'en') {
        console.log(`🌍 Attempting translation for "${tag}" from ${userLanguage} to English`);
        
        const { data: translationData, error: translationError } = await supabase.functions.invoke('translate-to-english', {
          body: {
            text: tag,
            sourceLanguage: userLanguage,
            context: 'user_form_input',
            gradeLevel: userInfo?.grade || userInfo?.gradeLevel || 'K'
          }
        });

        if (!translationError && translationData?.success && translationData?.isTranslated) {
          console.log(`✅ Translation successful: "${tag}" → "${translationData.translatedText}"`);
          return {
            corrected: translationData.translatedText,
            confidence: 0.9
          };
        } else if (translationError) {
          console.warn(`❌ Translation failed for "${tag}":`, translationError);
        } else {
          console.log(`ℹ️ No translation needed for "${tag}" (already English or no changes)`);
        }
      }

      // If translation didn't work or user is English native, try spelling correction
      console.log(`🔤 Attempting spelling correction for "${tag}"`);
      const { data, error } = await supabase.functions.invoke('correct-spelling', {
        body: {
          text: tag,
          gradeLevel: userInfo?.grade || userInfo?.gradeLevel || 'K',
          context: 'user_form_input'
        }
      });

      if (error) {
        console.warn(`❌ Spelling correction failed for "${tag}":`, error);
        return this.fallbackSpellingCorrection(tag);
      }

      const correctedText = data?.correctedText || tag;
      
      if (data?.hadErrors) {
        console.log(`✅ Spelling correction: "${tag}" → "${correctedText}"`);
        return {
          corrected: correctedText,
          confidence: 0.9
        };
      } else {
        return { corrected: tag, confidence: 0.7 };
      }

    } catch (error) {
      console.warn('Tag processing error:', error);
      return this.fallbackSpellingCorrection(tag);
    }
  }

  /**
   * Fallback spelling correction using local dictionary with multilingual support
   */
  private static fallbackSpellingCorrection(tag: string): { corrected: string; confidence: number } {
    const commonCorrections: Record<string, string> = {
      // English spelling corrections
      'lionns': 'lions',
      'elefant': 'elephant',
      'colr': 'color',
      'favrite': 'favorite',
      'freind': 'friend',
      'animel': 'animal',
      'plaing': 'playing',
      'readng': 'reading',
      'writting': 'writing',
      'hapiness': 'happiness',
      'beutiful': 'beautiful',
      'intresting': 'interesting',
      
      // Common foreign word translations
      // Spanish
      'perro': 'dog',
      'gato': 'cat',
      'casa': 'house',
      'agua': 'water',
      'comida': 'food',
      
      // French  
      'chien': 'dog',
      'chat': 'cat',
      'glace': 'ice cream',
      'pomme': 'apple',
      'maison': 'house',
      'eau': 'water',
      
      // German
      'hund': 'dog',
      'katze': 'cat',
      'haus': 'house',
      'wasser': 'water',
      
      // Italian
      'cane': 'dog',
      'gatto': 'cat',
      'acqua': 'water'
    };
    
    const lowercaseTag = tag.toLowerCase();
    if (commonCorrections[lowercaseTag]) {
      return { corrected: commonCorrections[lowercaseTag], confidence: 0.7 };
    }
    
    return { corrected: tag, confidence: 0.5 };
  }

  /**
   * Detect if a word is plural
   */
  private static detectPlural(word: string): boolean {
    const singularIndicators = [
      // Common singular patterns
      /^(a|an|one)\s/i,
      // Words that end in 's' but are singular
      /^(glass|class|pass|mass|grass|dress)$/i,
      // Irregular singulars
      /^(mouse|child|foot|tooth|goose|person)$/i
    ];

    const pluralIndicators = [
      // Common plural patterns
      /s$/i,
      /ies$/i,
      /ves$/i,
      // Irregular plurals
      /^(children|feet|teeth|geese|people|mice)$/i
    ];

    // Check singular indicators first
    if (singularIndicators.some(pattern => pattern.test(word))) {
      return false;
    }

    // Check plural indicators
    return pluralIndicators.some(pattern => pattern.test(word));
  }


  /**
   * Generate processing report for debugging
   */
  static generateProcessingReport(result: SmartParsingResult): string {
    const { parsedTags, summary, processingTime, errors } = result;
    
    let report = `Smart Input Parsing Report\n`;
    report += `Processing Time: ${processingTime}ms\n`;
    report += `Total Tags: ${summary.totalTags}\n`;
    report += `Corrected Tags: ${summary.correctedTags}\n`;
    report += `High Confidence: ${summary.highConfidenceTags}\n\n`;

    if (errors.length > 0) {
      report += `Errors: ${errors.join(', ')}\n\n`;
    }

    report += `Tag Details:\n`;
    parsedTags.forEach(tag => {
      const correctionNote = tag.original !== tag.corrected ? ` → ${tag.corrected}` : '';
      report += `- ${tag.original}${correctionNote} (confidence: ${tag.confidence.toFixed(2)})\n`;
    });

    return report;
  }
}