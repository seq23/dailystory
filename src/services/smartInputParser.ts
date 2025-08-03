import { supabase } from "@/integrations/supabase/client";

export interface ParsedTag {
  original: string;
  corrected: string;
  confidence: number;
  isPlural: boolean;
  category?: 'animal' | 'food' | 'object' | 'person' | 'place' | 'other';
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
  private static categoryCache = new Map<string, string>();

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
        tag => tag.confidence >= 0.8
      ).length;

    } catch (error) {
      console.error('Smart parsing error:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown parsing error');
      
      // Fallback: return original tags with minimal processing
      result.parsedTags = tags.map(tag => ({
        original: tag,
        corrected: tag,
        confidence: 0.5,
        isPlural: tag.endsWith('s'),
        category: 'other'
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
      let confidence = 1.0;

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
      const category = await this.categorizeWord(corrected);

      return {
        original: tag,
        corrected,
        confidence,
        isPlural,
        category
      };

    } catch (error) {
      console.error(`Error parsing tag "${tag}":`, error);
      
      // Return with minimal processing on error
      return {
        original: tag,
        corrected: cleanTag,
        confidence: 0.3,
        isPlural: cleanTag.endsWith('s'),
        category: 'other'
      };
    }
  }

  /**
   * Correct spelling of a single tag using Supabase function
   */
  private static async correctTagSpelling(
    tag: string,
    userInfo?: any
  ): Promise<{ corrected: string; confidence: number }> {
    try {
      // Fix API parameter mismatch - use correct parameters that match the function
      const { data, error } = await supabase.functions.invoke('correct-spelling', {
        body: {
          text: tag,
          gradeLevel: userInfo?.grade || userInfo?.gradeLevel || 'K',
          context: 'user_form_input'
        }
      });

      if (error) {
        console.warn('Spelling correction failed:', error);
        // Implement fallback spelling correction using local dictionary
        return this.fallbackSpellingCorrection(tag);
      }

      // Add confidence threshold to prevent over-correction
      const confidence = data?.confidence || 0.8;
      const correctedText = data?.correctedText || tag;
      
      // Only use correction if confidence is high enough and correction makes sense
      if (confidence < 0.6 || correctedText.length < tag.length * 0.5) {
        return { corrected: tag, confidence: 0.5 };
      }

      return {
        corrected: correctedText,
        confidence: confidence
      };

    } catch (error) {
      console.warn('Spelling correction error:', error);
      return this.fallbackSpellingCorrection(tag);
    }
  }

  /**
   * Fallback spelling correction using local dictionary
   */
  private static fallbackSpellingCorrection(tag: string): { corrected: string; confidence: number } {
    const commonCorrections: Record<string, string> = {
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
      'intresting': 'interesting'
    };
    
    const lowercaseTag = tag.toLowerCase();
    if (commonCorrections[lowercaseTag]) {
      return { corrected: commonCorrections[lowercaseTag], confidence: 0.9 };
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
   * Categorize a word into common story element types
   */
  private static async categorizeWord(
    word: string
  ): Promise<ParsedTag['category']> {
    // Check cache first
    const cached = this.categoryCache.get(word);
    if (cached) {
      return cached as ParsedTag['category'];
    }

    try {
      // Use simple categorization patterns
      const categories = {
        animal: [
          'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'lion', 'tiger', 
          'elephant', 'bear', 'wolf', 'fox', 'rabbit', 'mouse', 'duck', 'chicken',
          'dogs', 'cats', 'birds', 'fish', 'horses', 'cows', 'pigs', 'sheep', 'lions', 'tigers'
        ],
        food: [
          'apple', 'banana', 'bread', 'milk', 'cheese', 'pizza', 'cake', 'cookie',
          'chocolate', 'candy', 'ice cream', 'juice', 'water', 'sandwich',
          'apples', 'bananas', 'cookies', 'candies'
        ],
        person: [
          'mom', 'dad', 'sister', 'brother', 'friend', 'teacher', 'doctor', 'nurse',
          'firefighter', 'police', 'chef', 'farmer', 'pilot', 'princess', 'prince',
          'parents', 'friends', 'teachers', 'doctors'
        ],
        place: [
          'home', 'school', 'park', 'beach', 'forest', 'mountain', 'city', 'farm',
          'library', 'store', 'hospital', 'restaurant', 'playground',
          'homes', 'schools', 'parks', 'beaches', 'forests', 'mountains', 'cities', 'farms'
        ],
        object: [
          'ball', 'toy', 'book', 'car', 'bike', 'boat', 'plane', 'train',
          'computer', 'phone', 'chair', 'table', 'bed', 'door', 'window',
          'balls', 'toys', 'books', 'cars', 'bikes', 'boats', 'planes', 'trains'
        ]
      };

      for (const [category, words] of Object.entries(categories)) {
        if (words.includes(word.toLowerCase())) {
          // Cache the result
          if (this.categoryCache.size >= this.CACHE_SIZE) {
            const firstKey = this.categoryCache.keys().next().value;
            this.categoryCache.delete(firstKey);
          }
          this.categoryCache.set(word, category);
          return category as ParsedTag['category'];
        }
      }

      return 'other';

    } catch (error) {
      console.warn('Word categorization error:', error);
      return 'other';
    }
  }

  /**
   * Extract story elements for generation
   */
  static extractStoryElements(parsedTags: ParsedTag[]): {
    characters: string[];
    objects: string[];
    settings: string[];
    themes: string[];
  } {
    const characters: string[] = [];
    const objects: string[] = [];
    const settings: string[] = [];
    const themes: string[] = [];

    parsedTags.forEach(tag => {
      const word = tag.corrected;
      
      switch (tag.category) {
        case 'animal':
        case 'person':
          characters.push(word);
          break;
        case 'place':
          settings.push(word);
          break;
        case 'object':
        case 'food':
          objects.push(word);
          break;
        default:
          themes.push(word);
      }
    });

    return { characters, objects, settings, themes };
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
      report += `- ${tag.original}${correctionNote} (${tag.category}, confidence: ${tag.confidence.toFixed(2)})\n`;
    });

    return report;
  }
}