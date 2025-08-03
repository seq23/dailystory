// Intelligent user input distribution system for natural story flow
import { UserInfo, DifficultyLevel } from "@/types";
import { NameFormatter } from "@/utils/nameFormatter";
import { SmartInputParser } from "@/services/smartInputParser";

interface DistributionContext {
  pageIndex: number;
  totalPages: number;
  difficulty: DifficultyLevel;
  usedInputs: Set<string>;
}

export class UserInputDistributor {
  private static userElementsPool: Map<string, string[]> = new Map();
  private static usedElements: Map<string, Set<string>> = new Map();

  /**
   * Initialize the distribution system with user inputs
   */
  static async initialize(userInfo: UserInfo): Promise<void> {
    this.userElementsPool.clear();
    this.usedElements.clear();

    // Extract and organize user inputs with intelligent parsing
    const animals = await this.extractAnimals(userInfo);
    const foods = await this.extractFoods(userInfo);
    const colors = this.extractColors(userInfo);
    const objects = this.extractObjects(userInfo);
    const activities = this.extractActivities(userInfo);

    this.userElementsPool.set('animals', animals);
    this.userElementsPool.set('foods', foods);
    this.userElementsPool.set('colors', colors);
    this.userElementsPool.set('objects', objects);
    this.userElementsPool.set('activities', activities);

    // Initialize usage tracking
    ['animals', 'foods', 'colors', 'objects', 'activities'].forEach(category => {
      this.usedElements.set(category, new Set());
    });
  }

  /**
   * Get next available element from a category, ensuring variety
   */
  static getNextElement(category: string, context: DistributionContext): string {
    const pool = this.userElementsPool.get(category) || [];
    const used = this.usedElements.get(category) || new Set();

    if (pool.length === 0) {
      return this.getDefaultElement(category);
    }

    // Find unused elements first
    const unused = pool.filter(item => !used.has(item));
    
    if (unused.length > 0) {
      const selected = unused[Math.floor(Math.random() * unused.length)];
      used.add(selected);
      return selected;
    }

    // If all used, reset and pick again for longer stories
    if (context.pageIndex > pool.length) {
      used.clear();
      const selected = pool[Math.floor(Math.random() * pool.length)];
      used.add(selected);
      return selected;
    }

    // Fallback to any available element
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Get processed template variables for intelligent distribution
   */
  static getTemplateVariables(userInfo: UserInfo, context: DistributionContext): Record<string, string> {
    const name = NameFormatter.capitalize(userInfo.name || 'Alex');
    
    return {
      // Basic user info
      '{name}': name,
      '{age}': userInfo.age?.toString() || '6',
      
      // Primary elements (most important - used early)
      '{primary_animal}': this.getNextElement('animals', context),
      '{primary_food}': this.getNextElement('foods', context),
      '{primary_color}': this.getNextElement('colors', context),
      '{primary_object}': this.getNextElement('objects', context),
      
      // Secondary elements (used mid-story)
      '{secondary_animal}': this.getNextElement('animals', context),
      '{secondary_food}': this.getNextElement('foods', context),
      '{secondary_color}': this.getNextElement('colors', context),
      
      // Friend/companion elements (used for relationships)
      '{friend_animal}': this.getNextElement('animals', context),
      '{friend_object}': this.getNextElement('objects', context),
      
      // Activity elements
      '{favorite_activity}': this.getNextElement('activities', context),
      '{favorite_activity_1}': this.getNextElement('activities', context),
      '{favorite_activity_2}': this.getNextElement('activities', context),
      
      // Pronouns based on avatar
      '{pronoun}': this.getPronoun(userInfo, 'subject'),
      '{pronoun_object}': this.getPronoun(userInfo, 'object'),
      '{pronoun_possessive}': this.getPronoun(userInfo, 'possessive'),
      
      // Contextual elements
      '{setting}': this.getContextualSetting(context),
      '{time_of_day}': this.getTimeOfDay(context),
      '{action}': this.getContextualAction(context),
    };
  }

  /**
   * Extract animals from user input with intelligent multi-tag parsing
   */
  private static async extractAnimals(userInfo: UserInfo): Promise<string[]> {
    const animals = new Set<string>();
    
    // Parse favorite animal input using SmartInputParser
    if (userInfo.favoriteAnimal) {
      try {
        const animalTags = userInfo.favoriteAnimal.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
        if (animalTags.length > 1) {
          // Multiple animals detected - use smart parsing
          const parseResult = await SmartInputParser.parseTaggedInput(animalTags, userInfo);
          parseResult.parsedTags.forEach(tag => {
            if (tag.category === 'animal' || this.isAnimalWord(tag.corrected)) {
              animals.add(tag.corrected.toLowerCase());
            }
          });
        } else {
          // Single animal
          animals.add(userInfo.favoriteAnimal.toLowerCase().trim());
        }
      } catch (error) {
        console.warn('Smart parsing failed, using fallback:', error);
        animals.add(userInfo.favoriteAnimal.toLowerCase().trim());
      }
    }
    
    // Extract from hobbies/interests with parsing
    if (userInfo.hobbies) {
      const hobbyTags = userInfo.hobbies.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
      hobbyTags.forEach(tag => {
        if (this.isAnimalWord(tag.toLowerCase())) {
          animals.add(tag.toLowerCase());
        }
      });
    }
    
    // Ensure we have at least 2-3 animals for variety
    const animalList = Array.from(animals);
    if (animalList.length < 2) {
      const defaults = ['dog', 'cat', 'bird'];
      defaults.forEach(animal => {
        if (!animalList.includes(animal)) {
          animalList.push(animal);
        }
      });
    }
    
    return animalList.slice(0, 4); // Max 4 for manageability
  }

  /**
   * Check if a word is an animal
   */
  private static isAnimalWord(word: string): boolean {
    const animalWords = [
      'dog', 'dogs', 'cat', 'cats', 'bird', 'birds', 'fish', 'fishes', 'rabbit', 'rabbits', 
      'hamster', 'hamsters', 'horse', 'horses', 'lion', 'lions', 'tiger', 'tigers', 
      'bear', 'bears', 'elephant', 'elephants', 'giraffe', 'giraffes', 'monkey', 'monkeys', 
      'dolphin', 'dolphins', 'whale', 'whales', 'penguin', 'penguins', 'owl', 'owls', 
      'fox', 'foxes', 'deer', 'butterfly', 'butterflies', 'pig', 'pigs', 'cow', 'cows',
      'sheep', 'wolf', 'wolves', 'duck', 'ducks', 'chicken', 'chickens'
    ];
    return animalWords.includes(word.toLowerCase());
  }

  /**
   * Extract foods from user input with intelligent multi-tag parsing
   */
  private static async extractFoods(userInfo: UserInfo): Promise<string[]> {
    const foods = new Set<string>();
    
    // Parse favorite food input using SmartInputParser  
    if (userInfo.favoriteFood) {
      try {
        const foodTags = userInfo.favoriteFood.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
        if (foodTags.length > 1) {
          // Multiple foods detected - use smart parsing
          const parseResult = await SmartInputParser.parseTaggedInput(foodTags, userInfo);
          parseResult.parsedTags.forEach(tag => {
            if (tag.category === 'food' || this.isFoodWord(tag.corrected)) {
              foods.add(tag.corrected.toLowerCase());
            }
          });
        } else {
          // Single food
          foods.add(userInfo.favoriteFood.toLowerCase().trim());
        }
      } catch (error) {
        console.warn('Smart food parsing failed, using fallback:', error);
        foods.add(userInfo.favoriteFood.toLowerCase().trim());
      }
    }
    
    // Extract from hobbies/special requests with parsing
    const additionalSources = [userInfo.hobbies, userInfo.specialRequest].filter(Boolean);
    for (const source of additionalSources) {
      const tags = source!.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
      tags.forEach(tag => {
        if (this.isFoodWord(tag.toLowerCase())) {
          foods.add(tag.toLowerCase());
        }
      });
    }
    
    const foodList = Array.from(foods);
    if (foodList.length < 2) {
      foodList.push('apple', 'cookie');
    }
    
    return foodList.slice(0, 3);
  }

  /**
   * Check if a word is food-related
   */
  private static isFoodWord(word: string): boolean {
    const foodWords = [
      'apple', 'apples', 'cookie', 'cookies', 'pizza', 'pizzas', 'sandwich', 'sandwiches',
      'cake', 'cakes', 'ice cream', 'banana', 'bananas', 'carrot', 'carrots', 'burger',
      'burgers', 'pasta', 'bread', 'cheese', 'chocolate', 'candy', 'fruit', 'fruits',
      'vegetable', 'vegetables', 'milk', 'juice', 'water', 'soup', 'salad', 'fish',
      'chicken', 'meat', 'rice', 'noodles', 'cereal', 'yogurt', 'berry', 'berries'
    ];
    return foodWords.includes(word.toLowerCase());
  }

  /**
   * Extract colors with fallbacks
   */
  private static extractColors(userInfo: UserInfo): string[] {
    const colors = new Set<string>();
    
    if (userInfo.favoriteColor) {
      colors.add(userInfo.favoriteColor.toLowerCase());
    }
    
    const colorList = Array.from(colors);
    if (colorList.length < 2) {
      const defaults = ['blue', 'red', 'green', 'yellow'];
      defaults.forEach(color => {
        if (!colorList.includes(color)) {
          colorList.push(color);
        }
      });
    }
    
    return colorList.slice(0, 3);
  }

  /**
   * Extract objects from various inputs
   */
  private static extractObjects(userInfo: UserInfo): string[] {
    const objects = ['ball', 'toy', 'book', 'cup', 'box', 'bag'];
    return objects.slice(0, 3);
  }

  /**
   * Extract activities from user hobbies and special requests
   */
  private static extractActivities(userInfo: UserInfo): string[] {
    const activities = new Set<string>();
    
    // Parse hobbies for activities
    if (userInfo.hobbies) {
      const hobbyTags = userInfo.hobbies.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
      hobbyTags.forEach(tag => {
        if (this.isActivityWord(tag.toLowerCase())) {
          activities.add(tag.toLowerCase());
        }
      });
    }
    
    // Parse special requests for activities
    if (userInfo.specialRequest) {
      const requestTags = userInfo.specialRequest.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
      requestTags.forEach(tag => {
        if (this.isActivityWord(tag.toLowerCase())) {
          activities.add(tag.toLowerCase());
        }
      });
    }
    
    const activityList = Array.from(activities);
    if (activityList.length < 2) {
      const defaults = ['playing', 'reading', 'exploring'];
      defaults.forEach(activity => {
        if (!activityList.includes(activity)) {
          activityList.push(activity);
        }
      });
    }
    
    return activityList.slice(0, 3);
  }

  /**
   * Check if a word is activity-related
   */
  private static isActivityWord(word: string): boolean {
    const activityWords = [
      'playing', 'reading', 'drawing', 'painting', 'dancing', 'singing', 'running',
      'jumping', 'swimming', 'biking', 'cooking', 'gardening', 'exploring', 'hiking',
      'climbing', 'soccer', 'football', 'basketball', 'tennis', 'baseball', 'music',
      'art', 'crafts', 'building', 'writing', 'storytelling', 'acting', 'theater'
    ];
    return activityWords.includes(word.toLowerCase());
  }

  /**
   * Get default element when user input is insufficient
   */
  private static getDefaultElement(category: string): string {
    const defaults = {
      animals: 'cat',
      foods: 'apple',
      colors: 'blue',
      objects: 'toy',
      activities: 'playing'
    };
    
    return defaults[category as keyof typeof defaults] || 'thing';
  }

  /**
   * Get pronouns based on user avatar
   */
  private static getPronoun(userInfo: UserInfo, type: 'subject' | 'object' | 'possessive'): string {
    const avatarType = userInfo.avatar?.type;
    
    const pronouns = {
      boy: { subject: 'he', object: 'him', possessive: 'his' },
      girl: { subject: 'she', object: 'her', possessive: 'her' },
      default: { subject: 'they', object: 'them', possessive: 'their' }
    };
    
    const selected = pronouns[avatarType as keyof typeof pronouns] || pronouns.default;
    return selected[type];
  }

  /**
   * Get contextual setting based on story progress
   */
  private static getContextualSetting(context: DistributionContext): string {
    const progress = context.pageIndex / context.totalPages;
    
    if (progress < 0.3) {
      return context.difficulty === 'easy' ? 'home' : 'garden';
    } else if (progress < 0.7) {
      return context.difficulty === 'easy' ? 'park' : 'forest';
    } else {
      return context.difficulty === 'easy' ? 'playground' : 'magical place';
    }
  }

  /**
   * Get time of day based on story progress
   */
  private static getTimeOfDay(context: DistributionContext): string {
    const progress = context.pageIndex / context.totalPages;
    
    if (progress < 0.3) return 'morning';
    if (progress < 0.7) return 'afternoon';
    return 'evening';
  }

  /**
   * Get contextual action based on difficulty and progress
   */
  private static getContextualAction(context: DistributionContext): string {
    const actions = {
      easy: ['plays', 'walks', 'runs', 'sits', 'eats', 'sleeps'],
      medium: ['explores', 'discovers', 'helps', 'learns', 'creates'],
      hard: ['investigates', 'solves', 'overcomes', 'masters'],
      expert: ['transcends', 'realizes', 'transforms', 'achieves']
    };
    
    const options = actions[context.difficulty] || actions.easy;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Reset usage tracking for new story
   */
  static reset(): void {
    this.usedElements.forEach(set => set.clear());
  }
}