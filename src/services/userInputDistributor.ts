// Intelligent user input distribution system for natural story flow
import { UserInfo, DifficultyLevel } from "@/types";
import { NameFormatter } from "@/utils/nameFormatter";

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
  static initialize(userInfo: UserInfo): void {
    this.userElementsPool.clear();
    this.usedElements.clear();

    // Extract and organize user inputs
    const animals = this.extractAnimals(userInfo);
    const foods = this.extractFoods(userInfo);
    const colors = this.extractColors(userInfo);
    const objects = this.extractObjects(userInfo);

    this.userElementsPool.set('animals', animals);
    this.userElementsPool.set('foods', foods);
    this.userElementsPool.set('colors', colors);
    this.userElementsPool.set('objects', objects);

    // Initialize usage tracking
    ['animals', 'foods', 'colors', 'objects'].forEach(category => {
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
      '{favorite_activity}': userInfo.hobbies || 'playing',
      
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
   * Extract animals from user input with smart parsing
   */
  private static extractAnimals(userInfo: UserInfo): string[] {
    const animals = new Set<string>();
    
    // Add favorite animal
    if (userInfo.favoriteAnimal) {
      animals.add(userInfo.favoriteAnimal.toLowerCase());
    }
    
    // Extract from hobbies/interests
    const animalWords = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'horse', 'lion', 'tiger', 'bear', 'elephant', 'giraffe', 'monkey', 'dolphin', 'whale', 'penguin', 'owl', 'fox', 'deer', 'butterfly'];
    const text = (userInfo.hobbies || '').toLowerCase();
    
    animalWords.forEach(animal => {
      if (text.includes(animal)) {
        animals.add(animal);
      }
    });
    
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
   * Extract foods from user input
   */
  private static extractFoods(userInfo: UserInfo): string[] {
    const foods = new Set<string>();
    
    if (userInfo.favoriteFood) {
      foods.add(userInfo.favoriteFood.toLowerCase());
    }
    
    // Add some variety
    const foodOptions = ['apple', 'cookie', 'pizza', 'sandwich', 'cake', 'ice cream', 'banana', 'carrot'];
    foodOptions.forEach(food => {
      if ((userInfo.favoriteFood || '').toLowerCase().includes(food)) {
        foods.add(food);
      }
    });
    
    const foodList = Array.from(foods);
    if (foodList.length < 2) {
      foodList.push('apple', 'cookie');
    }
    
    return foodList.slice(0, 3);
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
   * Get default element when user input is insufficient
   */
  private static getDefaultElement(category: string): string {
    const defaults = {
      animals: 'cat',
      foods: 'apple',
      colors: 'blue',
      objects: 'toy'
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