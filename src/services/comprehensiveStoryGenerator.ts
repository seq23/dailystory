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
      "Simple adventures with clear lessons",
      "Friendship and problem-solving", 
      "Basic emotional understanding",
      "Sequential story structure"
    ],
    maxWordsPerPage: 12, // Ages 6-9 appropriate
    voiceStyle: "encouraging and gentle"
  },
  hard: {
    authors: ["Roald Dahl", "Beverly Cleary", "Katherine Paterson"],
    patterns: [
      "Character growth and challenges",
      "Multiple story elements",
      "Developing independence", 
      "Cause and effect relationships"
    ],
    maxWordsPerPage: 20, // Ages 9-13 appropriate
    voiceStyle: "engaging and adventurous"
  },
  expert: {
    authors: ["Kate DiCamillo", "Kwame Alexander", "Jason Reynolds"],
    patterns: [
      "Complex themes and relationships",
      "Advanced vocabulary and concepts",
      "Identity and self-discovery",
      "Sophisticated narrative structure"
    ],
    maxWordsPerPage: 35, // Ages 13-16+ appropriate
    voiceStyle: "mature and thought-provoking"
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
  
  // Ages 6-9 appropriate - Simple adventures with clear lessons
  private static createMediumAuthorStyle(
    name: string,
    userElements: any,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    // Age-appropriate vocabulary for 6-9 year olds
    const animals = userElements.favoriteAnimals;
    const foods = userElements.favoriteFoods;
    const hobbies = userElements.hobbies;
    const colors = userElements.favoriteColors;
    const setting = culturalElements.setting || 'park';
    
    // Simple story structures for ages 6-9
    const storyVariations = [
      // Friendship and sharing story
      () => {
        const animal = this.selectRandomElement(animals);
        const food = this.selectRandomElement(foods);
        const hobby = this.selectRandomElement(hobbies);
        const color = this.selectRandomElement(colors);
        
        return `${name} loved ${hobby} at the ${setting}. One day, ${name} met ${this.getAnimalForStory(animal, 'with-article')} who looked sad. The ${this.getSingularForm(animal)} was hungry and had no ${food}. ${name} shared lunch with the ${this.getSingularForm(animal)}. They became good friends. Now they meet every day to ${hobby} together. The ${this.getSingularForm(animal)} taught ${name} that helping others feels good. ${name} learned that friendship is the best gift.`;
      },
      
      // Problem-solving story
      () => {
        const animal = this.selectRandomElement(animals);
        const hobby = this.selectRandomElement(hobbies);
        const color = this.selectRandomElement(colors);
        
        return `${name} was excited to ${hobby} at the ${setting}. But there was a problem! ${name} could not find the way. A ${color} ${this.getSingularForm(animal)} appeared and offered to help. Together they looked for clues. They worked as a team. The ${this.getSingularForm(animal)} was very smart. They found the perfect spot for ${hobby}. ${name} thanked the helpful ${this.getSingularForm(animal)}. From that day on, ${name} always asked for help when needed.`;
      },
      
      // Adventure and discovery story
      () => {
        const animal1 = this.selectRandomElement(animals);
        const animal2 = animals.length > 1 ? this.selectDifferentElement(animals, animal1) : animal1;
        const color = this.selectRandomElement(colors);
        const hobby = this.selectRandomElement(hobbies);
        
        return `${name} went to the ${setting} to ${hobby}. Behind a ${color} tree, ${name} found ${this.getAnimalForStory(animal1, 'with-article')}. The ${this.getSingularForm(animal1)} was playing with ${this.getAnimalForStory(animal2, 'with-article')}! They invited ${name} to join their game. ${name} learned new ways to ${hobby} from the animals. They had so much fun together. ${name} realized that trying new things can be exciting. The animals became ${name}'s special friends.`;
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * storyVariations.length);
    const selectedStory = storyVariations[randomIndex];
    return selectedStory();
  }
  
  // Ages 9-13 appropriate - Character growth and developing independence
  private static createHardAuthorStyle(
    name: string,
    userElements: any,
    culturalElements: any,
    tracker: StoryElementTracker
  ): string {
    const animals = userElements.favoriteAnimals;
    const foods = userElements.favoriteFoods;
    const hobbies = userElements.hobbies;
    const colors = userElements.favoriteColors;
    const setting = culturalElements.setting || 'town';
    const specialElement = userElements.specialRequest || 'special talent';
    
    // Age-appropriate story structures for 9-13 year olds
    const storyVariations = [
      // Personal challenge and growth story
      () => {
        const hobby = this.selectRandomElement(hobbies);
        const animal = this.selectRandomElement(animals);
        const color = this.selectRandomElement(colors);
        const food = this.selectRandomElement(foods);
        
        return `${name} had been practicing ${hobby} for months, but something wasn't clicking. Everyone else seemed naturally good at it, while ${name} struggled with every attempt. One afternoon, feeling frustrated, ${name} decided to practice alone in the quiet ${setting}. That's when ${name} discovered ${this.getAnimalForStory(animal, 'with-article')} who seemed to understand exactly how ${name} felt. The ${this.getSingularForm(animal)} had a ${color} marking that reminded ${name} of something important - everyone learns differently. Together, they developed a new approach to ${hobby}. The ${this.getSingularForm(animal)} showed ${name} that patience and persistence matter more than natural talent. When ${name} shared ${food} with the ${this.getSingularForm(animal)}, they both realized that the best achievements come from never giving up. ${name} learned that ${specialElement} isn't about being perfect, but about growing through challenges.`;
      },
      
      // Friendship and loyalty story
      () => {
        const animal1 = this.selectRandomElement(animals);
        const animal2 = animals.length > 1 ? this.selectDifferentElement(animals, animal1) : animal1;
        const hobby = this.selectRandomElement(hobbies);
        const color = this.selectRandomElement(colors);
        
        return `${name} thought life in the ${setting} was pretty ordinary until meeting ${this.getAnimalForStory(animal1, 'with-article')} during a ${hobby} session. The ${this.getSingularForm(animal1)} was different from other animals - it had a ${color} patch and seemed to understand human emotions. When other kids didn't believe ${name} about the special friendship, ${name} felt torn between fitting in and staying loyal to a true friend. Things got complicated when ${this.getAnimalForStory(animal2, 'with-article')} appeared, creating a situation where ${name} had to choose between what was popular and what was right. Through this experience, ${name} discovered that real friendship means standing up for others, even when it's difficult. The animals taught ${name} that ${specialElement} means being true to yourself and the people who matter most. In the end, ${name} learned that authentic relationships are worth more than popularity.`;
      },
      
      // Discovery and responsibility story
      () => {
        const hobby = this.selectRandomElement(hobbies);
        const animal = this.selectRandomElement(animals);
        const food = this.selectRandomElement(foods);
        const color = this.selectRandomElement(colors);
        
        return `While exploring the old part of the ${setting}, ${name} stumbled upon something unexpected during a ${hobby} adventure. Hidden behind ${color} vines was ${this.getAnimalForStory(animal, 'with-article')} that clearly needed help. The ${this.getSingularForm(animal)} was injured and couldn't find ${food} on its own. ${name} faced a real dilemma - getting involved meant taking on responsibility that adults usually handled. But something about the ${this.getSingularForm(animal)}'s situation reminded ${name} of their own ${specialElement} and how it felt when no one understood. Making the choice to help meant learning about commitment, sacrifice, and what it really takes to make a difference. Through caring for the ${this.getSingularForm(animal)}, ${name} discovered that growing up isn't about age, but about choosing to do the right thing even when it's hard. The experience taught ${name} that real ${specialElement} comes from using your abilities to help others.`;
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * storyVariations.length);
    const selectedStory = storyVariations[randomIndex];
    return selectedStory();
  }
  
  // Ages 13-16+ appropriate - Identity, relationships, and sophisticated themes
  private static createExpertAuthorStyle(
    name: string,
    userElements: any,
    culturalElements: any,
    culturalContext: any,
    tracker: StoryElementTracker
  ): string {
    const animals = userElements.favoriteAnimals;
    const foods = userElements.favoriteFoods;
    const hobbies = userElements.hobbies;
    const colors = userElements.favoriteColors;
    const setting = culturalElements.setting || 'city';
    const specialElement = userElements.specialRequest || 'unique perspective';
    
    // Sophisticated story structures for teens
    const storyVariations = [
      // Identity and belonging story
      () => {
        const hobby = this.selectRandomElement(hobbies);
        const animal = this.selectRandomElement(animals);
        const color = this.selectRandomElement(colors);
        const food = this.selectRandomElement(foods);
        
        return `${name} had always felt like an outsider in the bustling ${setting}. While classmates seemed to navigate social dynamics effortlessly, ${name} found solace in ${hobby} - an activity that others often dismissed as childish or irrelevant. The pressure to conform weighed heavily, especially when it meant abandoning the things that truly mattered. During a particularly challenging week, ${name} encountered ${this.getAnimalForStory(animal, 'with-article')} in an unexpected place - a ${color} alley behind the school where students rarely ventured. This creature, clearly displaced from its natural habitat, seemed to mirror ${name}'s own sense of not belonging. As ${name} began sharing ${food} with the ${this.getSingularForm(animal)}, an unlikely friendship developed. Through patient observation and genuine care, ${name} learned that the ${this.getSingularForm(animal)} had its own ${specialElement} - a unique way of surviving in an environment that wasn't meant for it. This realization sparked something profound in ${name}. Perhaps being different wasn't about finding ways to fit in, but about discovering how your unique qualities could contribute something valuable to the world. The experience with the ${this.getSingularForm(animal)} taught ${name} that authenticity takes courage, but it's the foundation of meaningful connections and personal fulfillment.`;
      },
      
      // Social justice and empathy story
      () => {
        const hobby = this.selectRandomElement(hobbies);
        const animal1 = this.selectRandomElement(animals);
        const animal2 = animals.length > 1 ? this.selectDifferentElement(animals, animal1) : animal1;
        const food = this.selectRandomElement(foods);
        const color = this.selectRandomElement(colors);
        
        return `The inequality in ${name}'s ${setting} had always been obvious, but it wasn't until ${name} started volunteering that the true scope became clear. While pursuing ${hobby} at a community center, ${name} witnessed how resources were distributed unfairly - some neighborhoods had everything they needed, while others struggled with basic necessities. One evening, ${name} discovered ${this.getAnimalForStory(animal1, 'with-article')} and ${this.getAnimalForStory(animal2, 'with-article')} competing for scraps of ${food} behind a ${color} dumpster. The sight was jarring - these creatures, who in nature might coexist peacefully, were now forced into conflict by scarcity. This moment crystallized something ${name} had been feeling but couldn't articulate: systemic problems create unnecessary competition and suffering. Determined to make a difference, ${name} used ${hobby} as a platform to raise awareness about local inequities. The project started small, but ${name}'s ${specialElement} - the ability to see connections between seemingly unrelated issues - helped build a movement that brought together diverse community members. Through this experience, ${name} learned that social change doesn't require perfection or grand gestures; it requires persistence, empathy, and the willingness to use whatever talents you have in service of others. The two animals eventually became symbols of ${name}'s campaign, representing how cooperation and resource-sharing could replace competition and scarcity.`;
      },
      
      // Coming-of-age and responsibility story
      () => {
        const hobby = this.selectRandomElement(hobbies);
        const animal = this.selectRandomElement(animals);
        const food = this.selectRandomElement(foods);
        const color = this.selectRandomElement(colors);
        
        return `As ${name} approached graduation, the weight of impending adulthood felt overwhelming. College applications, career decisions, family expectations - everything seemed to demand immediate clarity about a future that felt impossibly uncertain. During this stressful period, ${name} found refuge in ${hobby}, an activity that had provided stability throughout the turbulent teenage years. One day, while practicing in a quiet corner of the ${setting}, ${name} noticed ${this.getAnimalForStory(animal, 'with-article')} that appeared to be injured or sick. The ${this.getSingularForm(animal)} had distinctive ${color} markings and seemed unable to find ${food} for itself. This situation presented ${name} with a choice that seemed to embody all the larger decisions looming ahead: ignore the problem and let someone else handle it, or step up and take responsibility despite feeling unprepared. Choosing to help meant research, learning about animal care, finding resources, and making a long-term commitment to the ${this.getSingularForm(animal)}'s recovery. Through this process, ${name} discovered that ${specialElement} wasn't about having all the answers, but about being willing to learn, adapt, and persist when faced with challenges. The months spent nursing the ${this.getSingularForm(animal)} back to health taught ${name} that adulthood isn't a destination you arrive at, but a series of choices to act with compassion, responsibility, and courage. When college acceptance letters arrived, ${name} felt ready - not because the future was clear, but because the confidence to handle uncertainty had been earned through real experience and meaningful action.`;
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * storyVariations.length);
    const selectedStory = storyVariations[randomIndex];
    return selectedStory();
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