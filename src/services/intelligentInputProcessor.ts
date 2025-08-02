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

// Simple in-memory caches until database tables are available
const translationCache = new Map<string, TranslationResult>();
const spellingCache = new Map<string, string>();

export class IntelligentInputProcessor {
  
  // Simplified processing pipeline: Translation (if needed) → Spelling Correction (only)
  static async processUserInput(
    input: string,
    fieldName: string,
    userInfo: UserInfo
  ): Promise<ProcessedUserInput> {
    try {
      // Step 1: Translation Layer - Only translate if truly non-English
      const translationResult = await this.translateIfNeeded(input, userInfo.nativeLanguage);
      
      // Step 2: Spelling Correction Layer - Enhanced for common animal/food misspellings
      const correctedInput = await this.correctSpelling(
        translationResult.translatedText, 
        fieldName,
        userInfo
      );
      
      // Return processed input without grammar processing or article addition
      const finalInput = correctedInput.trim();

      // Cache the translation if it was needed
      if (translationResult.translatedText !== input) {
        translationCache.set(input, translationResult);
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
  }

  // Translation Layer Implementation
  private static async translateIfNeeded(
    input: string,
    userNativeLanguage: LanguageCode
  ): Promise<TranslationResult> {
    // Quick check if input is likely English
    if (await this.isLikelyEnglish(input)) {
      return {
        translatedText: input,
        detectedLanguage: 'en',
        confidence: 0.9
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

  // Language detection helpers
  private static async isLikelyEnglish(text: string): Promise<boolean> {
    // Simple heuristic for English detection
    const englishWords = ['the', 'and', 'or', 'is', 'are', 'a', 'an', 'to', 'of', 'in', 'on', 'at'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    
    // If more than 20% of words are common English words, consider it English
    return englishWordCount / words.length > 0.2;
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