// Enhanced comprehensive story generator that incorporates all requirements
import type { UserInfo, DifficultyLevel } from "@/types";
import CulturalAdaptationService from "./culturalAdaptationService";
import { ContentSecurity } from "@/utils/security";
import GrammarValidator from "@/utils/grammarValidator";

// Author-inspired writing styles for authentic story creation
const AUTHOR_STYLES = {
  easy: {
    authors: ["Mo Willems", "Eric Carle", "Dr. Seuss"],
    patterns: [
      "Simple repetition with rhythm",
      "Cause and effect storytelling", 
      "Playful word sounds",
      "Clear emotional expressions"
    ],
    maxWordsPerPage: 6,
    voiceStyle: "playful and encouraging"
  },
  medium: {
    authors: ["Kevin Henkes", "Jan Brett", "Ezra Jack Keats"],
    patterns: [
      "Character-driven gentle adventures",
      "Emotional growth and discovery",
      "Rich sensory descriptions",
      "Clear beginning-middle-end structure"
    ],
    maxWordsPerPage: 12,
    voiceStyle: "warm and nurturing"
  },
  hard: {
    authors: ["Roald Dahl", "Beverly Cleary", "Katherine Paterson"],
    patterns: [
      "Complex character relationships",
      "Multiple plot threads",
      "Humor and heart combined", 
      "Character development through challenges"
    ],
    maxWordsPerPage: 20,
    voiceStyle: "engaging and sophisticated"
  },
  expert: {
    authors: ["Kate DiCamillo", "Kwame Alexander", "Jason Reynolds"],
    patterns: [
      "Nuanced themes and moral complexity",
      "Literary devices and symbolism",
      "Cultural authenticity and representation",
      "Advanced emotional intelligence"
    ],
    maxWordsPerPage: 35,
    voiceStyle: "literary and thought-provoking"
  }
};

interface StoryElement {
  content: string;
  culturalContext: any;
  usageCount: number;
  category: 'character' | 'setting' | 'action' | 'object' | 'emotion';
}

export class ComprehensiveStoryGenerator {
  
  static generateStory(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number = 10): {
    pages: string[];
    config: any;
    authorStyle: string;
    culturalElements: any;
  } {
    // Get cultural context for authentic representation
    const culturalContext = CulturalAdaptationService.getCulturalContext(userInfo.nativeLanguage || 'en');
    const culturalElements = CulturalAdaptationService.getCulturalElements(userInfo);
    
    // Get author style for this difficulty level
    const authorInfo = AUTHOR_STYLES[difficulty];
    
    // Create story with anti-repetition tracking
    const storyTracker = new StoryElementTracker();
    
    // Generate culturally appropriate story
    const story = this.createAuthorInspiredStory(
      userInfo, 
      difficulty, 
      pageCount, 
      culturalContext, 
      culturalElements,
      authorInfo,
      storyTracker
    );
    
    // Validate story content for safety
    const validatedStory = this.validateAndSanitizeStory(story, userInfo.grade, userInfo.nativeLanguage);
    
    // Split into appropriate page lengths
    const pages = this.splitIntoPages(validatedStory, authorInfo.maxWordsPerPage, pageCount);
    
    const config = {
      maxWordsPerPage: authorInfo.maxWordsPerPage,
      fontSize: this.getFontSizeForDifficulty(difficulty),
      lineHeight: 'leading-relaxed',
      spacing: 'space-y-4'
    };
    
    return {
      pages,
      config,
      authorStyle: `Inspired by ${authorInfo.authors.join(', ')}`,
      culturalElements
    };
  }
  
  private static createAuthorInspiredStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageCount: number,
    culturalContext: any,
    culturalElements: any,
    authorInfo: any,
    tracker: StoryElementTracker
  ): string {
    const characterName = userInfo.name?.trim() || 'Alex';
    
    // Parse user inputs and prepare for intelligent story integration
    const favoriteAnimals = this.parseAndCleanUserInput(userInfo.favoriteAnimal) || ['cat'];
    const favoriteColors = this.parseAndCleanUserInput(userInfo.favoriteColor) || ['blue']; 
    const favoriteFoods = this.parseAndCleanUserInput(userInfo.favoriteFood) || ['pizza'];
    const hobbies = this.parseAndCleanUserInput(userInfo.hobbies) || ['playing'];
    const specialRequest = userInfo.specialRequest?.toLowerCase()?.trim();
    
    // Create user elements object for intelligent distribution
    const userElements = {
      favoriteAnimals,
      favoriteColors, 
      favoriteFoods,
      hobbies,
      specialRequest
    };
    
    // Create story based on author style and cultural context
    switch (difficulty) {
      case 'easy':
        return this.createEasyAuthorStyle(characterName, userElements, culturalElements, tracker);
      case 'medium':
        return this.createMediumAuthorStyle(characterName, userElements, culturalElements, tracker);
      case 'hard':
        return this.createHardAuthorStyle(characterName, userElements, culturalElements, tracker);
      case 'expert':
        return this.createExpertAuthorStyle(characterName, userElements, culturalElements, culturalContext, tracker);
    }
  }
  
  // Mo Willems/Eric Carle inspired - Simple, repetitive, joyful
  private static createEasyAuthorStyle(
    name: string, 
    userElements: any,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'garden';
    const animal = this.selectRandomElement(userElements.favoriteAnimals);
    const color = this.selectRandomElement(userElements.favoriteColors);
    
    // Use intelligent animal processing for proper grammar
    const animalWithArticle = this.getAnimalForStory(animal, 'with-article');
    const singularAnimal = this.getAnimalForStory(animal, 'singular');
    
    return `${name} sees ${animalWithArticle}. The ${singularAnimal} is ${color}. ${name} says hello. The ${singularAnimal} says hello too. ${name} smiles big. The ${singularAnimal} smiles big too. They dance together. They laugh together. ${name} is happy. The ${singularAnimal} is happy. What a wonderful day!`;
  }
  
  // Kevin Henkes inspired - Gentle character-driven stories
  private static createMediumAuthorStyle(
    name: string,
    userElements: any,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'neighborhood park';
    const defaultFood = culturalElements.food || 'sandwich';
    
    // Use multiple elements throughout the story for variety
    const animal1 = this.selectRandomElement(userElements.favoriteAnimals);
    const animal2 = userElements.favoriteAnimals.length > 1 ? 
      this.selectDifferentElement(userElements.favoriteAnimals, animal1) : animal1;
    const hobby = this.selectRandomElement(userElements.hobbies);
    const food1 = userElements.favoriteFoods.length > 0 ? this.selectRandomElement(userElements.favoriteFoods) : defaultFood;
    const food2 = userElements.favoriteFoods.length > 1 ? 
      this.selectDifferentElement(userElements.favoriteFoods, food1) : food1;
    
    // Intelligent animal processing for proper grammar
    const animal1WithArticle = this.getAnimalForStory(animal1, 'with-article');
    const animal1Singular = this.getAnimalForStory(animal1, 'singular');
    const animal2WithArticle = this.getAnimalForStory(animal2, 'with-article');
    
    return `${name} loved ${hobby} more than anything else. One sunny morning, ${name} went to the ${setting} with some ${food1} for lunch. There, hiding behind an old oak tree, was ${animal1WithArticle.includes('lonely') ? animal1WithArticle : `a lonely ${this.getSingularForm(animal1)}`}. The ${animal1Singular} looked sad and hungry. ${name} shared the ${food1} with their new friend. They spent the whole day enjoying ${hobby} together. The next day, they met ${animal2WithArticle.includes('friendly') ? animal2WithArticle : `a friendly ${this.getSingularForm(animal2)}`} who loved ${food2} just as much as they did. From that day on, ${name} and the animals were inseparable. Every morning, they would meet at the ${setting} for new adventures. ${name} learned that the best part of ${hobby} was sharing it with friends.`;
  }
  
  // Roald Dahl inspired - Whimsical with character growth
  private static createHardAuthorStyle(
    name: string,
    userElements: any,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'mysterious forest';
    const celebration = culturalElements.celebration || 'special festival';
    const specialElement = userElements.specialRequest || 'magical ability';
    
    // Distribute multiple elements throughout the story
    const animal1 = this.selectRandomElement(userElements.favoriteAnimals);
    const animal2 = userElements.favoriteAnimals.length > 1 ? 
      this.selectDifferentElement(userElements.favoriteAnimals, animal1) : animal1;
    const hobby = this.selectRandomElement(userElements.hobbies);
    const food1 = this.selectRandomElement(userElements.favoriteFoods);
    const food2 = userElements.favoriteFoods.length > 1 ? 
      this.selectDifferentElement(userElements.favoriteFoods, food1) : food1;
    
    return `${name} had always been different from other children. While others played ordinary games, ${name} found magic in ${hobby}. One extraordinary day, during the annual ${celebration}, ${name} discovered something remarkable in the ${setting}. A magnificent ${animal1} approached, speaking in whispers only ${name} could understand. The ${animal1} revealed that ${name} possessed a rare ${specialElement} that could help solve an ancient mystery. Together, they embarked on a thrilling adventure through hidden paths and secret chambers. During their journey, they shared ${food1} by a magical stream. Later, they met ${GrammarValidator.createNounPhrase('wise', animal2)} who offered them ${food2} from an enchanted garden. ${name} faced three challenging puzzles that tested not just intelligence, but also kindness and courage. With each challenge overcome, ${name} grew more confident and wise. Both animal friends proved to be the most loyal companions anyone could ask for. In the end, ${name} not only solved the mystery but also discovered the true power of believing in oneself.`;
  }
  
  // Kate DiCamillo inspired - Literary depth with cultural authenticity
  private static createExpertAuthorStyle(
    name: string,
    userElements: any,
    culturalElements: any,
    culturalContext: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'ancestral homeland';
    const celebration = culturalElements.celebration || 'coming-of-age ceremony';
    const value = culturalElements.value || 'wisdom and compassion';
    const specialElement = userElements.specialRequest || 'ancient gift';
    const animal = this.selectRandomElement(userElements.favoriteAnimals);
    const hobby = this.selectRandomElement(userElements.hobbies);
    const food = this.selectRandomElement(userElements.favoriteFoods);
    
    return `In the heart of ${culturalContext.region}, where stories were woven into the very fabric of daily life, ${name} carried within them an extraordinary ${specialElement} passed down through generations. Their grandmother had always said that ${hobby} was not merely an activity, but a bridge between worlds. On the eve of the ${celebration}, when the whole community gathered to honor their traditions, ${name} encountered a majestic ${animal} whose eyes held the wisdom of centuries. This creature, guardian of ${value}, had been waiting for someone who truly understood the sacred connection between ${hobby} and the preservation of their cultural heritage. Together, they journeyed through landscapes both physical and spiritual, visiting places where their ancestors had walked and dreamed. Along the way, they shared traditional ${food} prepared according to ancient customs. ${name} learned that true strength comes not from individual achievement, but from understanding one's place within the continuous story of their people. The ${animal} taught ${name} that every act of ${hobby} was actually a prayer, a celebration of life, and a promise to future generations. Through trials that tested their character, wisdom, and commitment to their community's values, ${name} discovered that the greatest adventures are those that connect us more deeply to who we are meant to become.`;
  }
  
  // Helper method to randomly select an element from an array
  private static selectRandomElement(array: string[]): string {
    if (!array || array.length === 0) return 'something';
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // Helper method to select a different element from the same array
  private static selectDifferentElement(array: string[], exclude: string): string {
    if (!array || array.length <= 1) return exclude;
    const filtered = array.filter(item => item !== exclude);
    return filtered.length > 0 ? this.selectRandomElement(filtered) : exclude;
  }

  // Parse and clean user input intelligently
  private static parseAndCleanUserInput(input: string | undefined): string[] {
    if (!input) return [];
    
    return input.toLowerCase().trim()
      .split(/[,;]/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => {
        // Remove articles if they were accidentally added by previous processing
        return item.replace(/^(a|an|the)\s+/i, '').trim();
      });
  }

  // Enhanced method to intelligently use animals in stories with proper grammar
  private static getAnimalForStory(animal: string, context: 'singular' | 'plural' | 'with-article' = 'with-article'): string {
    const cleanAnimal = animal.replace(/^(a|an|the)\s+/i, '').trim();
    
    switch (context) {
      case 'singular':
        // Remove plural endings to get singular form
        return this.getSingularForm(cleanAnimal);
      case 'plural':
        // Ensure plural form
        return this.getPluralForm(cleanAnimal);
      case 'with-article':
        // Add appropriate article based on whether it's already plural
        const isPlural = this.isPlural(cleanAnimal);
        if (isPlural) {
          return cleanAnimal; // No article for plurals
        } else {
          return GrammarValidator.createNounPhrase('', cleanAnimal);
        }
      default:
        return cleanAnimal;
    }
  }

  // Helper to determine if a word is plural
  private static isPlural(word: string): boolean {
    const pluralPatterns = [/s$/, /ies$/, /ves$/, /es$/];
    const singularOnlyWords = ['fish', 'sheep', 'deer'];
    
    if (singularOnlyWords.includes(word.toLowerCase())) return false;
    return pluralPatterns.some(pattern => pattern.test(word));
  }

  // Helper to get singular form
  private static getSingularForm(word: string): string {
    if (!this.isPlural(word)) return word;
    
    // Handle common plural patterns
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.endsWith('ves')) return word.slice(0, -3) + 'f';
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    
    return word;
  }

  // Helper to get plural form
  private static getPluralForm(word: string): string {
    if (this.isPlural(word)) return word;
    
    // Handle common singular to plural patterns
    if (word.endsWith('y') && !/[aeiou]y$/.test(word)) return word.slice(0, -1) + 'ies';
    if (word.endsWith('f')) return word.slice(0, -1) + 'ves';
    if (word.endsWith('fe')) return word.slice(0, -2) + 'ves';
    if (/[sxz]$|ch$|sh$/.test(word)) return word + 'es';
    
    return word + 's';
  }
  
  private static validateAndSanitizeStory(story: string, grade?: string, language?: string): string {
    // Validate content appropriateness
    const validation = ContentSecurity.isContentAppropriate(story, grade, language);
    
    if (!validation.appropriate) {
      console.warn('Story content flagged, sanitizing:', validation.reason);
      // Create safe fallback story
      return "A child goes on a wonderful adventure. They meet a friendly animal. Together they explore and play. They have lots of fun. The child learns something new. They become best friends. It's a perfect day for adventure. Everyone is happy and safe.";
    }
    
    // Additional content sanitization
    return ContentSecurity.sanitizeInput(story);
  }
  
  private static splitIntoPages(text: string, maxWordsPerPage: number, targetPageCount: number): string[] {
    // Split by sentence boundaries while preserving punctuation
    const sentences = text.match(/[^.!?]*[.!?]+/g) || [text];
    const pages: string[] = [];
    let currentPage = '';
    let currentWordCount = 0;

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      
      // If adding this sentence would exceed word limit, start new page
      if (currentWordCount > 0 && currentWordCount + words.length > maxWordsPerPage) {
        if (currentPage.trim()) {
          pages.push(currentPage.trim());
        }
        currentPage = sentence.trim();
        currentWordCount = words.length;
      } else {
        // Add sentence to current page
        if (currentPage) {
          currentPage += ' ' + sentence.trim();
        } else {
          currentPage = sentence.trim();
        }
        currentWordCount += words.length;
      }
    }

    // Add final page if there's content
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }

    // Ensure we have exactly the target page count
    if (pages.length < targetPageCount) {
      // If we have fewer pages than requested, duplicate and extend the story
      const originalPages = [...pages];
      while (pages.length < targetPageCount) {
        const sourceIndex = (pages.length - originalPages.length) % originalPages.length;
        const extension = originalPages[sourceIndex];
        pages.push(extension);
      }
    }

    return pages.slice(0, targetPageCount);
  }
  
  private static getFontSizeForDifficulty(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case 'easy': return 'text-4xl md:text-5xl lg:text-6xl';
      case 'medium': return 'text-3xl md:text-4xl lg:text-5xl';
      case 'hard': return 'text-2xl md:text-3xl lg:text-4xl';
      case 'expert': return 'text-xl md:text-2xl lg:text-3xl';
    }
  }
}

// Anti-repetition tracking system
class StoryElementTracker {
  private usedElements = new Map<string, number>();
  private usedPhrases = new Set<string>();
  
  useElement(element: string, category: string): boolean {
    const key = `${category}:${element}`;
    const usage = this.usedElements.get(key) || 0;
    
    // Allow limited reuse but prevent excessive repetition
    if (usage < 2) {
      this.usedElements.set(key, usage + 1);
      return true;
    }
    
    return false;
  }
  
  usePhrase(phrase: string): boolean {
    if (this.usedPhrases.has(phrase)) {
      return false;
    }
    
    this.usedPhrases.add(phrase);
    return true;
  }
  
  getAlternative(element: string, alternatives: string[]): string {
    for (const alt of alternatives) {
      if (!this.usedPhrases.has(alt)) {
        this.usedPhrases.add(alt);
        return alt;
      }
    }
    
    // If all alternatives used, return the original
    return element;
  }
}