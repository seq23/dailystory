// Simplified Creative Elements Processor
// Focuses ONLY on direct user input processing - no complex creative generation

import type { UserInfo } from "@/types";

export interface CreativeBundle {
  characterTraits: string[];      // Direct from user inputs
  storyElements: string[];        // Basic setting/activity elements
  vocabularyWords: string[];      // User-specified words only
  culturalElements: string[];     // Simple cultural mappings
}

export class CreativeElementsProcessor {
  /**
   * Process user inputs into simple creative elements
   * NO complex generation - only direct mapping of user preferences
   */
  static processUserInputs(userInfo: UserInfo): CreativeBundle {
    const characterTraits = this.extractCharacterTraits(userInfo);
    const storyElements = this.extractStoryElements(userInfo);
    const vocabularyWords = this.extractVocabularyWords(userInfo);
    const culturalElements = this.extractCulturalElements(userInfo);

    return {
      characterTraits,
      storyElements,
      vocabularyWords,
      culturalElements
    };
  }

  /**
   * Extract character traits from color and animal preferences
   */
  private static extractCharacterTraits(userInfo: UserInfo): string[] {
    const traits: string[] = [];

    // Color → personality traits (simple mapping)
    if (userInfo.favoriteColor) {
      const colorTraits = this.getColorTraits(userInfo.favoriteColor);
      traits.push(...colorTraits);
    }

    // Animal → character skills (simple mapping)
    if (userInfo.favoriteAnimal) {
      const animalTraits = this.getAnimalTraits(userInfo.favoriteAnimal);
      traits.push(...animalTraits);
    }

    return Array.from(new Set(traits)).slice(0, 4);
  }

  /**
   * Extract story elements from food and hobbies
   */
  private static extractStoryElements(userInfo: UserInfo): string[] {
    const elements: string[] = [];

    // Food → cultural/setting elements
    if (userInfo.favoriteFood) {
      const foodElements = this.getFoodElements(userInfo.favoriteFood);
      elements.push(...foodElements);
    }

    // Hobbies → activity preferences
    if (userInfo.hobbies) {
      const hobbyElements = this.getHobbyElements(userInfo.hobbies);
      elements.push(...hobbyElements);
    }

    return Array.from(new Set(elements)).slice(0, 4);
  }

  /**
   * Extract vocabulary words from targetVocabulary and special requests
   */
  private static extractVocabularyWords(userInfo: UserInfo): string[] {
    const words: string[] = [];

    // Direct vocabulary input
    if (userInfo.targetVocabulary) {
      const vocabWords = userInfo.targetVocabulary
        .split(/[,\s]+/)
        .map(word => word.trim().toLowerCase())
        .filter(Boolean);
      words.push(...vocabWords);
    }

    // Special request vocabulary parsing
    if (userInfo.specialRequest) {
      const vocabMatch = userInfo.specialRequest.toLowerCase().match(/target vocabulary\s*:\s*([^\n;]+)/);
      if (vocabMatch) {
        const specialWords = vocabMatch[1]
          .split(/[,/]/)
          .map(word => word.trim().toLowerCase())
          .filter(Boolean);
        words.push(...specialWords);
      }
    }

    return Array.from(new Set(words)).slice(0, 10);
  }

  /**
   * Extract simple cultural elements from native language
   */
  private static extractCulturalElements(userInfo: UserInfo): string[] {
    if (!userInfo.nativeLanguage || userInfo.nativeLanguage === 'en') {
      return [];
    }

    const culturalMap: Record<string, string[]> = {
      'es': ['family celebrations', 'colorful festivals'],
      'ar': ['desert adventures', 'ancient stories'],
      'zh': ['lunar celebrations', 'nature harmony'],
      'hi': ['vibrant colors', 'festival joy'],
      'pt': ['ocean adventures', 'musical stories'],
      'fr': ['artistic beauty', 'culinary delights']
    };

    return culturalMap[userInfo.nativeLanguage] || [];
  }

  /**
   * Simple color → trait mapping
   */
  private static getColorTraits(color: string): string[] {
    const colorMap: Record<string, string[]> = {
      'red': ['brave', 'energetic'],
      'blue': ['calm', 'thoughtful'],
      'green': ['kind', 'growing'],
      'yellow': ['cheerful', 'bright'],
      'purple': ['creative', 'wise'],
      'orange': ['friendly', 'warm'],
      'pink': ['imaginative', 'caring']
    };

    // Handle hex colors
    if (color?.startsWith('#')) {
      const hexMap: Record<string, string> = {
        '#EF4444': 'red',
        '#3B82F6': 'blue', 
        '#10B981': 'green',
        '#F59E0B': 'yellow',
        '#8B5CF6': 'purple',
        '#F97316': 'orange',
        '#EC4899': 'pink'
      };
      color = hexMap[color] || 'blue';
    }

    return colorMap[color?.toLowerCase()] || ['curious'];
  }

  /**
   * Simple animal → trait mapping
   */
  private static getAnimalTraits(animal: string): string[] {
    const animalMap: Record<string, string[]> = {
      'cat': ['curious', 'independent'],
      'dog': ['loyal', 'playful'],
      'bird': ['free', 'musical'],
      'fish': ['peaceful', 'flowing'],
      'rabbit': ['quick', 'gentle'],
      'lion': ['brave', 'strong'],
      'elephant': ['wise', 'remembering'],
      'butterfly': ['transforming', 'colorful']
    };

    const normalizedAnimal = animal?.toLowerCase();
    for (const [key, traits] of Object.entries(animalMap)) {
      if (normalizedAnimal?.includes(key)) {
        return traits;
      }
    }

    return ['adventurous'];
  }

  /**
   * Simple food → setting mapping
   */
  private static getFoodElements(food: string): string[] {
    const foodMap: Record<string, string[]> = {
      'pizza': ['kitchen adventures', 'sharing meals'],
      'cookies': ['baking magic', 'sweet treats'],
      'ice cream': ['summer fun', 'cold treats'],
      'pasta': ['family dinners', 'twirling fun'],
      'fruit': ['garden picking', 'healthy choices'],
      'vegetables': ['garden growing', 'colorful plates']
    };

    const normalizedFood = food?.toLowerCase();
    for (const [key, elements] of Object.entries(foodMap)) {
      if (normalizedFood?.includes(key)) {
        return elements;
      }
    }

    return ['meal time adventures'];
  }

  /**
   * Simple hobby → activity mapping
   */
  private static getHobbyElements(hobbies: string): string[] {
    const hobbyMap: Record<string, string[]> = {
      'reading': ['book adventures', 'story time'],
      'drawing': ['art creation', 'colorful pictures'],
      'sports': ['active play', 'team games'],
      'music': ['singing time', 'rhythm fun'],
      'dancing': ['movement joy', 'rhythm play'],
      'outdoor': ['nature exploration', 'fresh air fun'],
      'cooking': ['kitchen magic', 'recipe adventures'],
      'building': ['construction play', 'creative building']
    };

    const elements: string[] = [];
    const normalizedHobbies = hobbies?.toLowerCase() || '';

    for (const [key, hobbyElements] of Object.entries(hobbyMap)) {
      if (normalizedHobbies.includes(key)) {
        elements.push(...hobbyElements);
      }
    }

    return elements.length > 0 ? elements : ['playing adventures'];
  }
}