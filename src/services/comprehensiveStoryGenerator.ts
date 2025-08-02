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
    maxWordsPerPage: 6, // Strict 6-word limit for easiest level
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
  
  // Ages 3-6 appropriate - Very simple words and concepts
  private static createEasyAuthorStyle(
    name: string, 
    userElements: any,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    // Simple 3-6 year old vocabulary only
    const simpleAnimals = this.simplifyAnimalsForAge3to6(userElements.favoriteAnimals);
    const simpleColors = this.simplifyColorsForAge3to6(userElements.favoriteColors);
    const simpleFoods = this.simplifyFoodsForAge3to6(userElements.favoriteFoods);
    const simpleActions = this.simplifyActionsForAge3to6(userElements.hobbies);
    
    // Very simple story patterns for ages 3-6
    const storyVariations = [
      // Basic "see and play" story  
      () => {
        const animal = this.selectRandomElement(simpleAnimals);
        const color = this.selectRandomElement(simpleColors);
        return `${name} sees ${this.getSimpleAnimal(animal)}. The ${animal} is ${color}. ${name} says "Hi ${animal}!" The ${animal} is happy. They play together. ${name} likes the ${animal}. The end.`;
      },
      
      // Simple food sharing story
      () => {
        const animal = this.selectRandomElement(simpleAnimals);
        const food = this.selectRandomElement(simpleFoods);
        const color = this.selectRandomElement(simpleColors);
        return `${name} has ${food}. ${name} sees ${this.getSimpleAnimal(animal)}. The ${animal} is ${color}. ${name} shares the ${food}. The ${animal} is happy. ${name} is happy too. Good friends!`;
      },
      
      // Basic action story
      () => {
        const animal = this.selectRandomElement(simpleAnimals);
        const action = this.selectRandomElement(simpleActions);
        const color = this.selectRandomElement(simpleColors);
        return `${name} likes to ${action}. ${name} sees ${this.getSimpleAnimal(animal)}. The ${animal} is ${color}. They ${action} together. Fun! ${name} and ${animal} are friends. Happy day!`;
      }
    ];
    
    // Select random story variation for natural variety
    const randomIndex = Math.floor(Math.random() * storyVariations.length);
    const selectedStory = storyVariations[randomIndex];
    return selectedStory();
  }
  
  // Kevin Henkes inspired - Gentle character-driven stories with intelligent element distribution
  private static createMediumAuthorStyle(
    name: string,
    userElements: any,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'neighborhood park';
    const animals = userElements.favoriteAnimals;
    const foods = userElements.favoriteFoods;
    const hobbies = userElements.hobbies;
    const colors = userElements.favoriteColors;
    
    // Sophisticated story structures that weave elements naturally
    const narrativeStructures = [
      // Character journey with organic encounters
      () => {
        const hobby = this.selectRandomElement(hobbies);
        const animal1 = this.selectRandomElement(animals);
        const food1 = this.selectRandomElement(foods);
        const animal2 = animals.length > 1 ? this.selectDifferentElement(animals, animal1) : null;
        const color = this.selectRandomElement(colors);
        
        let story = `${name} had always loved ${hobby} more than anything else. Every morning, ${name} would visit the ${setting} to practice. One peaceful day, while ${hobby}, ${name} noticed something moving behind the ${color} flowers.`;
        
        story += ` It was ${this.getAnimalForStory(animal1, 'with-article')}, and it looked hungry! ${name} quickly shared some ${food1} from the lunch bag.`;
        
        if (animal2) {
          const food2 = foods.length > 1 ? this.selectDifferentElement(foods, food1) : food1;
          story += ` The next week, while ${hobby} again, ${name} found ${this.getAnimalForStory(animal2, 'with-article')} who loved ${food2} even more than ${food1}!`;
        }
        
        story += ` From that day forward, ${name} learned that the best part of ${hobby} wasn't the activity itself, but the friends who joined along the way. Every adventure was better when shared with others.`;
        
        return story;
      },
      
      // Problem-solving story with natural element integration
      () => {
        const animal = this.selectRandomElement(animals);
        const hobby = this.selectRandomElement(hobbies);
        const food = this.selectRandomElement(foods);
        const color = this.selectRandomElement(colors);
        
        return `${name} was worried. The annual ${setting} festival was coming, but something was missing. While ${hobby} to clear their mind, ${name} spotted ${this.getAnimalForStory(animal, 'with-article')} sitting sadly by a ${color} bench. "What's wrong?" asked ${name}. The ${this.getSingularForm(animal)} explained that all the festival ${food} was gone! Together, ${name} and the ${this.getSingularForm(animal)} worked to solve the problem. They discovered that sharing and teamwork made everything possible. The festival was saved, and ${name} had made a lifelong friend.`;
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * narrativeStructures.length);
    const selectedStructure = narrativeStructures[randomIndex];
    return selectedStructure();
  }
  
  // Roald Dahl inspired - Whimsical stories with sophisticated element weaving
  private static createHardAuthorStyle(
    name: string,
    userElements: any,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    const setting = culturalElements.setting || 'mysterious forest';
    const celebration = culturalElements.celebration || 'special festival';
    const animals = userElements.favoriteAnimals;
    const foods = userElements.favoriteFoods;
    const hobbies = userElements.hobbies;
    const colors = userElements.favoriteColors;
    const specialElement = userElements.specialRequest || 'magical ability';
    
    // Complex narrative structures with multiple story arcs
    const complexNarratives = [
      // Mystery/adventure with layered reveals
      () => {
        const hobby = this.selectRandomElement(hobbies);
        const color1 = this.selectRandomElement(colors);
        const color2 = colors.length > 1 ? this.selectDifferentElement(colors, color1) : color1;
        const animal1 = this.selectRandomElement(animals);
        const food = this.selectRandomElement(foods);
        
        let story = `${name} had always been different from other children. While others enjoyed ordinary activities, ${name} found magic in ${hobby}. During the annual ${celebration}, strange ${color1} lights began appearing in the ${setting}.`;
        
        story += ` As ${name} investigated, a mysterious ${color2} pathway revealed itself, leading to an ancient clearing where ${this.getAnimalForStory(animal1, 'with-article')} sat waiting. "I've been expecting you," said the ${this.getSingularForm(animal1)}. "You possess ${specialElement} that our world desperately needs."`;
        
        if (animals.length > 1) {
          const animal2 = this.selectDifferentElement(animals, animal1);
          story += ` Together, they journeyed deeper, where they met ${this.getAnimalForStory(animal2, 'with-article')} who had been guarding the secret of the ${food} that could heal the land.`;
        }
        
        story += ` Through three challenging trials that tested not just ${name}'s ${specialElement}, but also kindness, courage, and wisdom, ${name} discovered that the greatest magic comes from believing in yourself and caring for others. The ${setting} was saved, and ${name} had unlocked a power that would change everything.`;
        
        return story;
      },
      
      // Transformation story with organic character development
      () => {
        const hobby = this.selectRandomElement(hobbies);
        const animal = this.selectRandomElement(animals);
        const food = this.selectRandomElement(foods);
        const color = this.selectRandomElement(colors);
        
        return `${name} lived in a world where ${hobby} was considered impossible for children. But ${name} dreamed of proving everyone wrong. One extraordinary night, while practicing secretly in the ${setting}, ${name} encountered ${this.getAnimalForStory(animal, 'with-article')} unlike any other. This ${this.getSingularForm(animal)} glowed ${color} and spoke in riddles about ${food} that could grant wishes. Through a series of whimsical challenges involving ${specialElement}, ${name} learned that the real magic wasn't in the ${food} or the wishes, but in the courage to pursue your dreams despite what others say. By the end, ${name} had not only mastered ${hobby} but had also inspired an entire community to believe in the impossible.`;
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * complexNarratives.length);
    const selectedNarrative = complexNarratives[randomIndex];
    return selectedNarrative();
  }
  
  // Kate DiCamillo inspired - Literary depth with sophisticated element integration
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
    const animals = userElements.favoriteAnimals;
    const foods = userElements.favoriteFoods;
    const hobbies = userElements.hobbies;
    const colors = userElements.favoriteColors;
    const specialElement = userElements.specialRequest || 'ancient gift';
    
    // Sophisticated literary structures with deep thematic integration
    const literaryNarratives = [
      // Coming-of-age with cultural depth
      () => {
        const hobby = this.selectRandomElement(hobbies);
        const animal = this.selectRandomElement(animals);
        const food = this.selectRandomElement(foods);
        const color = this.selectRandomElement(colors);
        
        let story = `In the heart of ${culturalContext.region}, where stories were woven into the very fabric of daily life, ${name} carried within them an extraordinary ${specialElement} passed down through generations. Their grandmother had always said that ${hobby} was not merely an activity, but a bridge between worlds.`;
        
        story += ` On the eve of the ${celebration}, when the whole community gathered to honor their traditions, ${name} felt the weight of expectation. While walking through the sacred ${setting}, ${name} encountered ${this.getAnimalForStory(animal, 'with-article')} whose eyes held the wisdom of centuries.`;
        
        story += ` This guardian of ${value} had been waiting for someone who truly understood that every act of ${hobby} was actually a prayer, a celebration of life, and a promise to future generations. Together, they shared traditional ${food} prepared according to ancient customs, the ${color} garnish representing hope for the future.`;
        
        if (animals.length > 1 || foods.length > 1) {
          const secondAnimal = animals.length > 1 ? this.selectDifferentElement(animals, animal) : null;
          const secondFood = foods.length > 1 ? this.selectDifferentElement(foods, food) : null;
          
          if (secondAnimal) {
            story += ` Along their spiritual journey, they met ${this.getAnimalForStory(secondAnimal, 'with-article')} who taught ${name} that strength comes not from individual achievement, but from understanding one's place within the continuous story of their people.`;
          }
          if (secondFood) {
            story += ` During the ceremony, ${name} prepared ${secondFood} for the community, each ingredient representing a different aspect of ${value}.`;
          }
        }
        
        story += ` Through trials that tested not just skill but character, wisdom, and commitment to community values, ${name} discovered that the greatest adventures are those that connect us more deeply to who we are meant to become. The ${specialElement} was not just a gift, but a responsibility to preserve the stories, traditions, and hopes of all who came before and all who would come after.`;
        
        return story;
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * literaryNarratives.length);
    const selectedNarrative = literaryNarratives[randomIndex];
    return selectedNarrative();
  }
  
  // Age 3-6 vocabulary simplification methods
  private static simplifyAnimalsForAge3to6(animals: string[]): string[] {
    const simpleAnimals = ['cat', 'dog', 'bird', 'fish', 'bear', 'rabbit', 'frog', 'duck', 'cow', 'pig'];
    return animals.map(animal => {
      const simple = animal.toLowerCase().trim();
      // Map complex animals to simple ones
      if (simple.includes('kitten') || simple.includes('cat')) return 'cat';
      if (simple.includes('puppy') || simple.includes('dog')) return 'dog';
      if (simple.includes('bunny') || simple.includes('rabbit')) return 'rabbit';
      if (simple.includes('duck') || simple.includes('goose')) return 'duck';
      if (simple.includes('cow') || simple.includes('bull')) return 'cow';
      
      // Use original if already simple, otherwise default to cat
      return simpleAnimals.includes(simple) ? simple : 'cat';
    });
  }
  
  private static simplifyColorsForAge3to6(colors: string[]): string[] {
    const simpleColors = ['red', 'blue', 'green', 'yellow', 'pink', 'white', 'black', 'brown', 'orange', 'purple'];
    return colors.map(color => {
      const simple = color.toLowerCase().trim();
      return simpleColors.includes(simple) ? simple : 'blue';
    });
  }
  
  private static simplifyFoodsForAge3to6(foods: string[]): string[] {
    const simpleFoods = ['apple', 'bread', 'milk', 'cookie', 'banana', 'cheese', 'egg', 'cake', 'rice', 'soup'];
    return foods.map(food => {
      const simple = food.toLowerCase().trim();
      // Map complex foods to simple ones
      if (simple.includes('pizza')) return 'bread';
      if (simple.includes('sandwich')) return 'bread';
      if (simple.includes('cereal')) return 'milk';
      if (simple.includes('fruit')) return 'apple';
      
      // Use original if already simple, otherwise default to apple
      return simpleFoods.includes(simple) ? simple : 'apple';
    });
  }
  
  private static simplifyActionsForAge3to6(actions: string[]): string[] {
    const simpleActions = ['play', 'run', 'jump', 'walk', 'sit', 'eat', 'sleep', 'sing', 'dance', 'read'];
    return actions.map(action => {
      const simple = action.toLowerCase().trim();
      // Map complex actions to simple ones
      if (simple.includes('playing') || simple.includes('play')) return 'play';
      if (simple.includes('running') || simple.includes('run')) return 'run';
      if (simple.includes('jumping') || simple.includes('jump')) return 'jump';
      if (simple.includes('walking') || simple.includes('walk')) return 'walk';
      if (simple.includes('reading') || simple.includes('read')) return 'read';
      if (simple.includes('singing') || simple.includes('sing')) return 'sing';
      if (simple.includes('dancing') || simple.includes('dance')) return 'dance';
      
      // Use original if already simple, otherwise default to play
      return simpleActions.includes(simple) ? simple : 'play';
    });
  }
  
  private static getSimpleAnimal(animal: string): string {
    const simple = animal.toLowerCase().trim();
    // Always add "a" for 3-6 year olds (simple grammar)
    const vowelStart = /^[aeiou]/.test(simple);
    return vowelStart ? `an ${simple}` : `a ${simple}`;
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

  // Parse and clean user input intelligently - handle "and", commas, etc. with robust validation
  private static parseAndCleanUserInput(input: string | undefined): string[] {
    if (!input || typeof input !== 'string') return [];
    
    const cleaned = input.toLowerCase().trim();
    if (cleaned.length === 0) return [];
    
    return cleaned
      .split(/[,;]|\s+and\s+|\s*&\s*|\s*\+\s*/)  // Split on various separators
      .map(item => item.trim())
      .filter(item => item.length > 0 && item.length < 50) // Reasonable length limits
      .slice(0, 10) // Limit to prevent performance issues
      .map(item => {
        // Remove articles if they were accidentally added by previous processing
        return item.replace(/^(a|an|the)\s+/i, '').trim();
      })
      .filter(item => item.length > 0); // Remove empty strings after cleaning
  }

  // Enhanced method to intelligently use animals in stories with proper grammar and validation
  private static getAnimalForStory(animal: string, context: 'singular' | 'plural' | 'with-article' = 'with-article'): string {
    if (!animal || typeof animal !== 'string') return 'friend';
    
    const cleanAnimal = animal.replace(/^(a|an|the)\s+/i, '').trim();
    if (!cleanAnimal) return 'friend';
    
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
          return cleanAnimal; // No article for plurals like "cats"
        } else {
          // Add "a" or "an" for singular animals with better vowel detection
          const startsWithVowelSound = /^[aeiou]/i.test(cleanAnimal) || 
                                      /^(hour|honest|honor|heir)/i.test(cleanAnimal);
          return startsWithVowelSound ? `an ${cleanAnimal}` : `a ${cleanAnimal}`;
        }
      default:
        return cleanAnimal;
    }
  }

  // Helper to determine if a word is plural with enhanced patterns
  private static isPlural(word: string): boolean {
    if (!word || typeof word !== 'string') return false;
    
    const cleanWord = word.toLowerCase().trim();
    const pluralPatterns = [/s$/, /ies$/, /ves$/, /es$/, /children$/, /feet$/, /teeth$/, /men$/, /mice$/, /geese$/];
    const singularOnlyWords = ['fish', 'sheep', 'deer', 'moose', 'species', 'series'];
    const alwaysPlural = ['pants', 'glasses', 'scissors', 'clothes'];
    
    if (singularOnlyWords.includes(cleanWord)) return false;
    if (alwaysPlural.includes(cleanWord)) return true;
    return pluralPatterns.some(pattern => pattern.test(cleanWord));
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