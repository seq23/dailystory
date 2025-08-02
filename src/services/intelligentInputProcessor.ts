import { UserInfo, LanguageCode } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedSpellingCorrector, AdvancedGrammarProcessor } from "./enhancedLinguisticProcessor";

export interface ProcessedUserInput {
  originalInput: string;
  translatedInput: string;
  correctedInput: string;
  processedInput: string;
  detectedLanguage: LanguageCode;
  needsTranslation: boolean;
  confidence: number;
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage: LanguageCode;
  confidence: number;
}

// Enhanced caches with size limits to prevent memory issues
const MAX_CACHE_SIZE = 1000;
const translationCache = new Map<string, TranslationResult>();
const spellingCache = new Map<string, string>();

// Cache cleanup function
const cleanupCache = (cache: Map<string, any>) => {
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries());
    cache.clear();
    // Keep the most recent 50% of entries
    entries.slice(-Math.floor(MAX_CACHE_SIZE / 2)).forEach(([k, v]) => cache.set(k, v));
  }
};

export class IntelligentInputProcessor {
  
  // Simplified processing pipeline: Translation (if needed) → Spelling Correction (only)
  static async processUserInput(
    input: string,
    fieldName: string,
    userInfo: UserInfo
  ): Promise<ProcessedUserInput> {
    // Input validation and sanitization
    if (!input || typeof input !== 'string') {
      return this.createEmptyResult(input || '');
    }

    const trimmedInput = input.trim();
    if (trimmedInput.length === 0) {
      return this.createEmptyResult(input);
    }

    // Prevent extremely long inputs that could cause performance issues
    if (trimmedInput.length > 500) {
      return this.createEmptyResult(trimmedInput.slice(0, 500));
    }

    try {
      // Step 1: Translation Layer - Only translate if truly non-English
      const translationResult = await this.translateIfNeeded(trimmedInput, userInfo.nativeLanguage);
      
      // Step 2: Spelling Correction Layer - Enhanced for common animal/food misspellings
      const correctedInput = await this.correctSpelling(
        translationResult.translatedText, 
        fieldName,
        userInfo
      );
      
      // Return processed input without grammar processing or article addition
      const finalInput = correctedInput.trim();

      // Cache the translation if it was needed with cleanup
      if (translationResult.translatedText !== trimmedInput) {
        cleanupCache(translationCache);
        translationCache.set(trimmedInput, translationResult);
      }

      return {
        originalInput: input,
        translatedInput: translationResult.translatedText,
        correctedInput,
        processedInput: finalInput,
        detectedLanguage: translationResult.detectedLanguage,
        needsTranslation: translationResult.translatedText !== input,
        confidence: translationResult.confidence
      };

    } catch (error) {
      console.error('Error processing user input:', error);
      // Graceful fallback - return cleaned original input
      return this.createEmptyResult(trimmedInput);
    }
  }

  // Helper to create consistent empty/fallback results
  private static createEmptyResult(input: string): ProcessedUserInput {
    return {
      originalInput: input,
      translatedInput: input,
      correctedInput: input,
      processedInput: this.cleanBasicInput(input),
      detectedLanguage: 'en',
      needsTranslation: false,
      confidence: 0
    };
  }

  // Translation Layer Implementation with improved language detection
  private static async translateIfNeeded(
    input: string,
    userNativeLanguage: LanguageCode
  ): Promise<TranslationResult> {
    // If user's native language is English, skip translation
    if (userNativeLanguage === 'en') {
      return {
        translatedText: input,
        detectedLanguage: 'en',
        confidence: 1.0
      };
    }

    // Enhanced English detection for better accuracy
    if (await this.isLikelyEnglish(input)) {
      return {
        translatedText: input,
        detectedLanguage: 'en',
        confidence: 0.95
      };
    }

    // Check cache first
    const cachedTranslation = translationCache.get(input);
    if (cachedTranslation) {
      return cachedTranslation;
    }

    // Call enhanced translation service
    try {
      const { data, error } = await supabase.functions.invoke('translate-batch', {
        body: {
          texts: [input],
          targetLanguage: 'en',
          sourceLanguage: userNativeLanguage,
          context: 'user_form_input'
        }
      });

      if (error) throw error;

      const translation = data.translations[0];
      return {
        translatedText: translation.translatedText,
        detectedLanguage: translation.detectedLanguage,
        confidence: translation.confidence
      };

    } catch (error) {
      console.error('Translation failed, using original:', error);
      return {
        translatedText: input,
        detectedLanguage: userNativeLanguage,
        confidence: 0.1
      };
    }
  }

  // Enhanced Spelling Correction Layer with improved fuzzy matching for animals/foods
  private static async correctSpelling(input: string, fieldName: string, userInfo: UserInfo): Promise<string> {
    // Check if we have cached spelling corrections
    const cachedCorrection = spellingCache.get(input);
    if (cachedCorrection) {
      return cachedCorrection;
    }

    try {
      // Enhanced contextual correction with lower thresholds for animals and foods
      const contextualMatch = this.tryContextualCorrection(input, fieldName);
      if (contextualMatch) {
        cleanupCache(spellingCache);
        spellingCache.set(input, contextualMatch);
        return contextualMatch;
      }

      // Only use OpenAI correction for non-animal/food fields or persistent misspellings
      if (!['favoriteAnimal', 'favoriteFood'].includes(fieldName)) {
        const { data, error } = await supabase.functions.invoke('correct-spelling', {
          body: {
            text: input,
            gradeLevel: userInfo.grade,
            context: 'user_form_input'
          }
        });

        if (!error && data.correctedText !== input) {
          cleanupCache(spellingCache);
          spellingCache.set(input, data.correctedText);
          return data.correctedText;
        }
      }

      return input;
    } catch (error) {
      console.error('Spelling correction failed:', error);
      return input;
    }
  }

  // Enhanced contextual correction with field-specific logic and lower thresholds
  private static tryContextualCorrection(input: string, fieldName: string): string | null {
    const words = input.split(/[,\s]+/);
    const correctedWords: string[] = [];
    let hasCorrections = false;

    for (const word of words) {
      if (!word.trim()) continue;
      
      // Field-specific fuzzy matching with appropriate contexts
      let contexts: Array<'animals' | 'foods' | 'hobbies'> = [];
      let confidenceThreshold = 0.6; // Lower threshold for better correction
      
      switch (fieldName) {
        case 'favoriteAnimal':
          contexts = ['animals'];
          confidenceThreshold = 0.5; // Even lower for animals
          break;
        case 'favoriteFood':
          contexts = ['foods'];
          confidenceThreshold = 0.5; // Even lower for foods
          break;
        case 'hobbies':
          contexts = ['hobbies'];
          break;
        default:
          contexts = ['animals', 'foods', 'hobbies'];
      }
      
      let corrected = false;
      for (const context of contexts) {
        const match = EnhancedSpellingCorrector.fuzzyMatch(word, 'en', context);
        if (match && match.confidence > confidenceThreshold) {
          correctedWords.push(match.suggestion);
          hasCorrections = true;
          corrected = true;
          break;
        }
      }
      
      if (!corrected) {
        correctedWords.push(word);
      }
    }

    return hasCorrections ? correctedWords.join(', ') : null;
  }

  // Helper method for basic processing only
  private static processSpecialRequest(input: string, userInfo: UserInfo): string {
    // Ensure special requests are appropriate for age group
    const ageAppropriate = this.filterAgeAppropriateContent(input, userInfo.age);
    return ageAppropriate.slice(0, 200); // Reasonable length limit
  }

  // Enhanced language detection with better accuracy
  private static async isLikelyEnglish(text: string): Promise<boolean> {
    if (!text || text.length < 2) return true; // Assume short text is English
    
    // Enhanced English detection patterns
    const englishWords = ['the', 'and', 'or', 'is', 'are', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by'];
    const englishPatterns = [
      /^[a-zA-Z\s.,!?'-]+$/, // Only contains English characters and punctuation
      /\b(this|that|these|those|when|where|what|how|why)\b/i, // Common English question words
      /\b(cat|dog|house|tree|book|water|food|play|run|jump)\b/i // Common English nouns/verbs
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    const englishWordRatio = englishWordCount / words.length;
    
    // Check if text matches English patterns
    const matchesPatterns = englishPatterns.some(pattern => pattern.test(text));
    
    // Consider it English if:
    // - More than 30% are common English words, OR
    // - Text matches English patterns and has some English words
    return englishWordRatio > 0.3 || (matchesPatterns && englishWordRatio > 0.1);
  }

  // Content filtering
  private static filterAgeAppropriateContent(content: string, age: number): string {
    // Basic content filtering based on age
    const inappropriateWords = ['violence', 'scary', 'frightening'];
    
    if (age < 8) {
      // Extra filtering for younger children
      let filtered = content;
      inappropriateWords.forEach(word => {
        filtered = filtered.replace(new RegExp(word, 'gi'), 'adventure');
      });
      return filtered;
    }
    
    return content;
  }

  // Basic cleanup fallback
  private static cleanBasicInput(input: string): string {
    return input
      .trim()
      .replace(/[^\w\s,.-]/g, '') // Remove special characters except basic punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .slice(0, 100); // Reasonable length limit
  }
}