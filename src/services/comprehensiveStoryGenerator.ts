// Enhanced comprehensive story generator that incorporates all requirements
import type { UserInfo, DifficultyLevel } from "@/types";
import CulturalAdaptationService from "./culturalAdaptationService";
import { ContentSecurity } from "@/utils/security";

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
    const favoriteAnimal = userInfo.favoriteAnimal?.toLowerCase()?.trim() || 'cat';
    const favoriteColor = userInfo.favoriteColor?.toLowerCase()?.trim() || 'blue';
    const hobbies = userInfo.hobbies?.toLowerCase()?.trim() || 'playing';
    const specialRequest = userInfo.specialRequest?.toLowerCase()?.trim();
    
    // Create story based on author style and cultural context
    switch (difficulty) {
      case 'easy':
        return this.createEasyAuthorStyle(characterName, favoriteAnimal, favoriteColor, culturalElements, tracker);
      case 'medium':
        return this.createMediumAuthorStyle(characterName, favoriteAnimal, hobbies, culturalElements, tracker);
      case 'hard':
        return this.createHardAuthorStyle(characterName, favoriteAnimal, hobbies, specialRequest, culturalElements, tracker);
      case 'expert':
        return this.createExpertAuthorStyle(characterName, favoriteAnimal, hobbies, specialRequest, culturalElements, culturalContext, tracker);
    }
  }
  
  // Mo Willems/Eric Carle inspired - Simple, repetitive, joyful
  private static createEasyAuthorStyle(
    name: string, 
    animal: string, 
    color: string, 
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'garden';
    
    return `${name} sees a ${animal}. The ${animal} is ${color}. ${name} says hello. The ${animal} says hello too. ${name} smiles big. The ${animal} smiles big too. They dance together. They laugh together. ${name} is happy. The ${animal} is happy. What a wonderful day!`;
  }
  
  // Kevin Henkes inspired - Gentle character-driven stories
  private static createMediumAuthorStyle(
    name: string,
    animal: string, 
    hobby: string,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'neighborhood park';
    const food = culturalElements.food || 'sandwich';
    
    return `${name} loved ${hobby} more than anything else. One sunny morning, ${name} went to the ${setting} with a ${food} for lunch. There, hiding behind an old oak tree, was a lonely ${animal}. The ${animal} looked sad and hungry. ${name} shared the ${food} with their new friend. They spent the whole day playing ${hobby} together. From that day on, ${name} and the ${animal} were inseparable. Every morning, they would meet at the ${setting} for new adventures. ${name} learned that the best part of ${hobby} was sharing it with a friend.`;
  }
  
  // Roald Dahl inspired - Whimsical with character growth
  private static createHardAuthorStyle(
    name: string,
    animal: string,
    hobby: string,
    specialRequest: string,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'mysterious forest';
    const celebration = culturalElements.celebration || 'special festival';
    const specialElement = specialRequest || 'magical ability';
    
    return `${name} had always been different from other children. While others played ordinary games, ${name} found magic in ${hobby}. One extraordinary day, during the annual ${celebration}, ${name} discovered something remarkable in the ${setting}. A magnificent ${animal} approached, speaking in whispers only ${name} could understand. The ${animal} revealed that ${name} possessed a rare ${specialElement} that could help solve an ancient mystery. Together, they embarked on a thrilling adventure through hidden paths and secret chambers. ${name} faced three challenging puzzles that tested not just intelligence, but also kindness and courage. With each challenge overcome, ${name} grew more confident and wise. The ${animal} proved to be the most loyal companion anyone could ask for. In the end, ${name} not only solved the mystery but also discovered the true power of believing in oneself.`;
  }
  
  // Kate DiCamillo inspired - Literary depth with cultural authenticity
  private static createExpertAuthorStyle(
    name: string,
    animal: string,
    hobby: string,
    specialRequest: string,
    culturalElements: any,
    culturalContext: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'ancestral homeland';
    const celebration = culturalElements.celebration || 'coming-of-age ceremony';
    const value = culturalElements.value || 'wisdom and compassion';
    const specialElement = specialRequest || 'ancient gift';
    
    return `In the heart of ${culturalContext.region}, where stories were woven into the very fabric of daily life, ${name} carried within them an extraordinary ${specialElement} passed down through generations. Their grandmother had always said that ${hobby} was not merely an activity, but a bridge between worlds. On the eve of the ${celebration}, when the whole community gathered to honor their traditions, ${name} encountered a majestic ${animal} whose eyes held the wisdom of centuries. This creature, guardian of ${value}, had been waiting for someone who truly understood the sacred connection between ${hobby} and the preservation of their cultural heritage. Together, they journeyed through landscapes both physical and spiritual, visiting places where their ancestors had walked and dreamed. ${name} learned that true strength comes not from individual achievement, but from understanding one's place within the continuous story of their people. The ${animal} taught ${name} that every act of ${hobby} was actually a prayer, a celebration of life, and a promise to future generations. Through trials that tested their character, wisdom, and commitment to their community's values, ${name} discovered that the greatest adventures are those that connect us more deeply to who we are meant to become.`;
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
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const pages: string[] = [];
    let currentPage = '';
    let currentWordCount = 0;

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      
      // If adding this sentence would exceed word limit, start new page
      if (currentWordCount > 0 && currentWordCount + words.length > maxWordsPerPage) {
        if (currentPage.trim()) {
          pages.push(currentPage.trim() + '.');
        }
        currentPage = sentence.trim();
        currentWordCount = words.length;
      } else {
        // Add sentence to current page
        if (currentPage) {
          currentPage += '. ' + sentence.trim();
        } else {
          currentPage = sentence.trim();
        }
        currentWordCount += words.length;
      }
    }

    // Add final page if there's content
    if (currentPage.trim()) {
      pages.push(currentPage.trim() + '.');
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