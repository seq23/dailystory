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
  
  // Main processing pipeline: Translation → Spelling → Grammar → Selection
  static async processUserInput(
    input: string,
    fieldName: string,
    userInfo: UserInfo
  ): Promise<ProcessedUserInput> {
    try {
      // Step 1: Translation Layer - Auto-detect and translate non-English inputs
      const translationResult = await this.translateIfNeeded(input, userInfo.nativeLanguage);
      
      // Step 2: Spelling Correction Layer
      const correctedInput = await this.correctSpelling(
        translationResult.translatedText, 
        userInfo.grade
      );
      
      // Step 3: Grammar Processing Layer - Handle translated comma-separated values
      const grammarProcessedInput = await this.processGrammar(correctedInput);
      
      // Step 4: Selection Layer - Intelligent picking from processed inputs
      const finalInput = await this.intelligentSelection(
        grammarProcessedInput,
        fieldName,
        userInfo
      );

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

  // Enhanced Spelling Correction Layer with multilingual fuzzy matching
  private static async correctSpelling(input: string, grade: string): Promise<string> {
    // Check if we have cached spelling corrections
    const cachedCorrection = spellingCache.get(input);
    if (cachedCorrection) {
      return cachedCorrection;
    }

    try {
      // First try enhanced fuzzy matching for known contexts
      const contextualMatch = this.tryContextualCorrection(input);
      if (contextualMatch) {
        spellingCache.set(input, contextualMatch);
        return contextualMatch;
      }

      // Fallback to OpenAI-based correction
      const { data, error } = await supabase.functions.invoke('correct-spelling', {
        body: {
          text: input,
          gradeLevel: grade,
          context: 'user_form_input'
        }
      });

      if (error) throw error;

      // Cache the correction
      if (data.correctedText !== input) {
        spellingCache.set(input, data.correctedText);
      }

      return data.correctedText;
    } catch (error) {
      console.error('Spelling correction failed:', error);
      return input;
    }
  }

  // Try contextual correction using enhanced linguistic processor
  private static tryContextualCorrection(input: string): string | null {
    // This is a simplified approach - in practice, we'd need userInfo context
    const words = input.split(/[,\s]+/);
    const correctedWords: string[] = [];
    let hasCorrections = false;

    for (const word of words) {
      if (!word.trim()) continue;
      
      // Try fuzzy matching for animals, foods, hobbies
      const contexts: Array<'animals' | 'foods' | 'hobbies'> = ['animals', 'foods', 'hobbies'];
      let corrected = false;
      
      for (const context of contexts) {
        const match = EnhancedSpellingCorrector.fuzzyMatch(word, 'en', context);
        if (match && match.confidence > 0.8) {
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

    return hasCorrections ? correctedWords.join(' ') : null;
  }

  // Enhanced Grammar Processing Layer with advanced linguistic rules
  private static async processGrammar(input: string): Promise<string> {
    // Use the advanced grammar processor
    const processed = AdvancedGrammarProcessor.processTranslatedText(input, 'en');
    return processed;
  }

  // Selection Layer - Intelligent picking
  private static async intelligentSelection(
    input: string,
    fieldName: string,
    userInfo: UserInfo
  ): Promise<string> {
    // Apply field-specific intelligence
    switch (fieldName) {
      case 'hobbies':
      case 'interests':
        return this.processHobbiesAndInterests(input);
      case 'favoriteAnimal':
        return this.processFavoriteAnimal(input);
      case 'favoriteFood':
        return this.processFavoriteFood(input);
      case 'specialRequest':
        return this.processSpecialRequest(input, userInfo);
      default:
        return input;
    }
  }

  // Helper methods for specific field processing
  private static processHobbiesAndInterests(input: string): string {
    // Handle multiple hobbies/interests
    const items = input.split(/[,;]/).map(item => item.trim().toLowerCase());
    const uniqueItems = [...new Set(items)].filter(item => item.length > 0);
    
    // Limit to reasonable number for story generation
    const maxItems = 5;
    return uniqueItems.slice(0, maxItems).join(', ');
  }

  private static processFavoriteAnimal(input: string): string {
    // Extract the first animal mentioned
    const animals = input.split(/[,;]/).map(item => item.trim());
    return animals[0] || input;
  }

  private static processFavoriteFood(input: string): string {
    // Extract the first food mentioned
    const foods = input.split(/[,;]/).map(item => item.trim());
    return foods[0] || input;
  }

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