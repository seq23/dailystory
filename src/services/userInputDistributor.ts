// Intelligent user input distribution system for natural story flow
import { UserInfo, DifficultyLevel } from "@/types";
import { NameFormatter } from "@/utils/nameFormatter";
import { validateTheme } from "@/utils/themeValidation";

export interface DistributionContext {
  pageIndex: number;
  totalPages: number;
  difficulty: DifficultyLevel;
  usedInputs: Set<string>;
}

import { DebugLogger } from './DebugLogger';

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
   * Get next available element from a category with context-aware distribution
   */
  static getNextElement(category: string, context: DistributionContext): string {
    const pool = this.userElementsPool.get(category) || [];
    const used = this.usedElements.get(category) || new Set();

    if (pool.length === 0) {
      return this.getDefaultElement(category);
    }

    // Level 0 (beginner) gets prioritized user input distribution
    if (context.difficulty === 'beginner') {
      const unused = pool.filter(item => !used.has(item));
      
      if (unused.length > 0) {
        // For Level 0, prioritize exact user input especially for animals
        const selected = category === 'animals' ? 
          unused[0] : // First animal = user's exact input
          unused[Math.floor(Math.random() * unused.length)];
        used.add(selected);
        DebugLogger.log('story', `Level 0 Page ${context.pageIndex + 1}: Using ${category} "${selected}"`);
        return selected;
      }
    }

    // Standard distribution for Level 1+ - natural story flow
    const unused = pool.filter(item => !used.has(item));
    
    if (unused.length > 0) {
      const selected = unused[Math.floor(Math.random() * unused.length)];
      used.add(selected);
      DebugLogger.log('story', `Page ${context.pageIndex + 1}: Using ${category} "${selected}"`);
      return selected;
    }

    // Reset only after each element used 3+ times for never-ending stories
    if (used.size >= pool.length * 3) {
      used.clear();
      const selected = pool[Math.floor(Math.random() * pool.length)];
      used.add(selected);
      DebugLogger.log('story', `Page ${context.pageIndex + 1}: Reset ${category} after 3+ uses, using "${selected}"`);
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
    
    // Only use user preferences if they actually provided them
    
    DebugLogger.log('story', `Generating template variables for page ${context.pageIndex + 1}/${context.totalPages}`);
    DebugLogger.log('story', `UserInfo: animal=${userInfo.favoriteAnimal || 'none'}, food=${userInfo.favoriteFood || 'none'}, color=${userInfo.favoriteColor || 'none'}, hobby=${userInfo.hobbies || 'none'}`);
    
    // Get pronouns
    const pronouns = this.getPronouns(userInfo);
    
    const allVariables = {
      // Basic user info - ALWAYS provide fallbacks
      '{userName}': name,
      '{age}': userInfo.age?.toString() || '6',
      
      // Primary elements (most important - used early) - honest approach
      '{primary_animal}': this.getNextElement('animals', context) || (userInfo.favoriteAnimal || this.getGenericAnimal()),
      '{animal}': userInfo.favoriteAnimal || this.getNextElement('animals', context) || this.getGenericAnimal(),
      '{primary_food}': this.getNextElement('foods', context) || (userInfo.favoriteFood || this.getGenericFood()),
      '{food}': userInfo.favoriteFood || this.getNextElement('foods', context) || this.getGenericFood(),
      '{primary_color}': this.getNextElement('colors', context) || (userInfo.favoriteColor || this.getGenericColor()),
      '{color}': userInfo.favoriteColor || this.getNextElement('colors', context) || this.getGenericColor(),
      '{primary_object}': this.getNextElement('objects', context) || 'treasure',
      '{object}': this.getNextElement('objects', context) || 'treasure',
      
      // Secondary elements (used mid-story) - honest approach
      '{secondary_animal}': this.getSecondaryAnimal(userInfo.favoriteAnimal || this.getGenericAnimal()),
      '{secondary_food}': this.getSecondaryFood(userInfo.favoriteFood || this.getGenericFood()),
      '{secondary_color}': this.getSecondaryColor(userInfo.favoriteColor || this.getGenericColor()),
      
      // Friend/companion elements (used for relationships) - honest approach
      '{friend_animal}': this.getFriendAnimal(userInfo.favoriteAnimal || this.getGenericAnimal()),
      '{friend_object}': this.getNextElement('objects', context) || 'toy',
      
      // Activity elements - honest approach
      '{favorite_activity}': this.getNextElement('activities', context) || (userInfo.hobbies || this.getGenericActivity()),
      '{favorite_activity_1}': this.getNextElement('activities', context) || this.getGenericActivity(),
      '{favorite_activity_2}': this.getNextElement('activities', context) || this.getGenericActivity(),
      '{hobby}': userInfo.hobbies || this.getGenericActivity(),
      '{hobbies}': userInfo.hobbies || this.getGenericActivity(),
      
      // Pronouns based on avatar - ALWAYS provide fallbacks
      '{pronoun}': pronouns.subject,
      '{pronoun_subject}': pronouns.subject,
      '{pronoun_object}': pronouns.object,
      '{pronoun_possessive}': pronouns.possessive,
      
      // Contextual elements - with fallbacks
      '{setting}': this.getContextualSetting(context),
      '{time_of_day}': this.getTimeOfDay(context),
      '{action}': this.getContextualAction(context),
      
      // Additional common template variables
      '{skill}': this.getRandomSkill(context.difficulty),
      '{antagonist}': this.getRandomAntagonist(context.difficulty)
    };
    
    DebugLogger.log('story', 'Generated template variables', allVariables);
    return allVariables;
  }

  /**
   * Get generic animal description when user hasn't provided one
   */
  private static getGenericAnimal(): string {
    const options = ['friendly animal', 'woodland creature', 'forest friend', 'magical creature'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get generic color description when user hasn't provided one
   */
  private static getGenericColor(): string {
    const options = ['bright color', 'beautiful shade', 'lovely hue', 'vibrant color'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get generic food description when user hasn't provided one
   */
  private static getGenericFood(): string {
    const options = ['delicious treat', 'tasty snack', 'yummy food', 'favorite meal'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get generic activity description when user hasn't provided one
   */
  private static getGenericActivity(): string {
    const options = ['fun activity', 'favorite pastime', 'enjoyable hobby', 'special interest'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Extract animals from user input with intelligent multi-tag parsing - PRIORITIZE EXACT USER INPUT
   */
  private static async extractAnimals(userInfo: UserInfo): Promise<string[]> {
    const animals = new Set<string>();
    
    // PRIORITY: User's exact favorite animal input comes first
    if (userInfo.favoriteAnimal) {
      const exactInput = userInfo.favoriteAnimal.toLowerCase().trim();
      DebugLogger.log('story', `Adding user's exact animal input: "${exactInput}"`);
      animals.add(exactInput); // Add exact input FIRST
      
      try {
        const animalTags = userInfo.favoriteAnimal.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
        if (animalTags.length > 1) {
          // Multiple animals detected - validate and add each
          animalTags.forEach(tag => {
            const validation = validateTheme(tag.trim());
            if (validation.valid && this.isAnimalWord(validation.sanitized)) {
              animals.add(validation.sanitized.toLowerCase());
            }
          });
        }
      } catch (error) {
        DebugLogger.warn('story', 'Smart parsing failed, but exact input already added', error);
      }
    }
    
    // Extract from hobbies/interests for additional variety (secondary priority)
    if (userInfo.hobbies) {
      const hobbyTags = userInfo.hobbies.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
      hobbyTags.forEach(tag => {
        if (this.isAnimalWord(tag.toLowerCase())) {
          animals.add(tag.toLowerCase());
        }
      });
    }
    
    // Add fallback animals only if needed, maintaining exact input priority
    const animalList = Array.from(animals);
    if (animalList.length < 2) {
      const defaults = ['dog', 'cat', 'bird'];
      defaults.forEach(animal => {
        if (!animalList.includes(animal) && animalList.length < 4) {
          animalList.push(animal);
        }
      });
    }
    
    DebugLogger.log('story', `Final animal pool`, animalList);
    return animalList.slice(0, 4); // Max 4 for manageability, with user input prioritized
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
    
    // Parse favorite food input with validation
    if (userInfo.favoriteFood) {
      try {
        const foodTags = userInfo.favoriteFood.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
        if (foodTags.length > 1) {
          // Multiple foods detected - validate and add each
          foodTags.forEach(tag => {
            const validation = validateTheme(tag.trim());
            if (validation.valid && this.isFoodWord(validation.sanitized)) {
              foods.add(validation.sanitized.toLowerCase());
            }
          });
        } else {
          // Single food
          foods.add(userInfo.favoriteFood.toLowerCase().trim());
        }
      } catch (error) {
        DebugLogger.warn('story', 'Smart food parsing failed, using fallback', error);
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
    
    DebugLogger.log('story', `Getting pronoun for avatar type: "${avatarType}" (type: ${type})`);
    
    const pronouns = {
      boy: { subject: 'he', object: 'him', possessive: 'his' },
      girl: { subject: 'she', object: 'her', possessive: 'her' },
      default: { subject: 'they', object: 'them', possessive: 'their' }
    };
    
    const selected = pronouns[avatarType as keyof typeof pronouns] || pronouns.default;
    DebugLogger.log('story', `Selected pronouns for "${avatarType}"`, selected);
    return selected[type];
  }

  /**
   * Get pronouns object for easy access
   */
  private static getPronouns(userInfo: UserInfo): { subject: string; object: string; possessive: string } {
    const avatarType = userInfo.avatar?.type || 'neutral';
    
    DebugLogger.log('story', 'getPronouns called for avatar', userInfo.avatar);
    DebugLogger.log('story', `Avatar type resolved as: "${avatarType}"`);
    
    if (avatarType === 'boy') {
      DebugLogger.log('story', 'Using boy pronouns: he/him/his');
      return { subject: 'he', object: 'him', possessive: 'his' };
    } else if (avatarType === 'girl') {
      DebugLogger.log('story', 'Using girl pronouns: she/her/her');
      return { subject: 'she', object: 'her', possessive: 'her' };
    }
    
    // Default to gender-neutral
    DebugLogger.log('story', 'Using neutral pronouns: they/them/their');
    return { subject: 'they', object: 'them', possessive: 'their' };
  }

  /**
   * Get secondary animal for variety
   */
  private static getSecondaryAnimal(primaryAnimal: string): string {
    const animalPairs = {
      cat: 'bird',
      dog: 'rabbit',
      bird: 'cat',
      rabbit: 'dog',
      elephant: 'mouse',
      mouse: 'elephant',
      lion: 'zebra',
      fish: 'octopus'
    };
    
    return animalPairs[primaryAnimal.toLowerCase()] || 'friend';
  }

  /**
   * Get friend animal for variety
   */
  private static getFriendAnimal(primaryAnimal: string): string {
    const friendAnimals = ['puppy', 'kitten', 'bunny', 'duckling', 'bear cub', 'owl'];
    const filtered = friendAnimals.filter(animal => !animal.includes(primaryAnimal.toLowerCase()));
    return filtered[Math.floor(Math.random() * filtered.length)] || 'friend';
  }

  /**
   * Get secondary food for variety
   */
  private static getSecondaryFood(primaryFood: string): string {
    const foodPairs = {
      apple: 'banana',
      banana: 'apple',
      cookie: 'cake',
      cake: 'cookie',
      pizza: 'sandwich',
      sandwich: 'pizza'
    };
    
    return foodPairs[primaryFood.toLowerCase()] || 'treats';
  }

  /**
   * Get secondary color for variety
   */
  private static getSecondaryColor(primaryColor: string): string {
    const colorPairs = {
      blue: 'green',
      green: 'blue',
      red: 'yellow',
      yellow: 'red',
      purple: 'pink',
      pink: 'purple'
    };
    
    return colorPairs[primaryColor.toLowerCase()] || 'rainbow';
  }

  /**
   * Get random skill based on difficulty - age-appropriate vocabulary
   */
  private static getRandomSkill(difficulty: DifficultyLevel): string {
    const skills = {
      easy: ['being nice', 'sharing', 'helping'],
      medium: ['being brave', 'being smart', 'being kind'],
      hard: ['courage', 'wisdom', 'creativity'],
      expert: ['leadership', 'determination', 'innovation']
    };
    
    const options = skills[difficulty] || skills.easy;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get random antagonist based on difficulty
   */
  private static getRandomAntagonist(difficulty: DifficultyLevel): string {
    const antagonists = {
      easy: ['grumpy', 'messy', 'forgetful'],
      medium: ['mischievous', 'sneaky', 'troublesome'],
      hard: ['mysterious', 'cunning', 'powerful'],
      expert: ['ancient', 'formidable', 'legendary']
    };
    
    const options = antagonists[difficulty] || antagonists.easy;
    return options[Math.floor(Math.random() * options.length)];
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
   * Get contextual action based on difficulty and progress - age-appropriate vocabulary
   */
  private static getContextualAction(context: DistributionContext): string {
    const actions = {
      easy: ['plays', 'walks', 'runs', 'sits', 'eats', 'sleeps'],
      medium: ['looks', 'finds', 'helps', 'learns', 'makes'],
      hard: ['explores', 'discovers', 'solves', 'creates', 'masters'],
      expert: ['investigates', 'transcends', 'realizes', 'transforms', 'achieves']
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