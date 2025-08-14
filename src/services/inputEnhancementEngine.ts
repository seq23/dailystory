import type { UserInfo, DifficultyLevel, LanguageCode } from '../types';
import { validateTheme } from '@/utils/themeValidation';

interface EnhancedInput {
  originalInput: string;
  enhancedTraits: string[];
  characterElements: CharacterElement[];
  storyElements: StoryElement[];
  thematicConnections: string[];
}

interface CharacterElement {
  type: 'appearance' | 'personality' | 'skill' | 'preference' | 'background';
  description: string;
  storyIntegration: string;
}

interface StoryElement {
  type: 'setting' | 'object' | 'activity' | 'conflict' | 'resolution';
  description: string;
  narrativeHook: string;
}

export class InputEnhancementEngine {
  private static enhancementCache = new Map<string, EnhancedInput>();

  static enhanceUserInputs(userInfo: UserInfo): EnhancedInput {
    const cacheKey = this.generateCacheKey(userInfo);
    
    if (this.enhancementCache.has(cacheKey)) {
      return this.enhancementCache.get(cacheKey)!;
    }

    const enhanced = this.processAllInputs(userInfo);
    this.enhancementCache.set(cacheKey, enhanced);
    return enhanced;
  }

  private static generateCacheKey(userInfo: UserInfo): string {
    return `${userInfo.favoriteColor}-${userInfo.favoriteAnimal}-${userInfo.hobbies}-${userInfo.favoriteFood}-${userInfo.specialRequest}`.toLowerCase();
  }

  private static processAllInputs(userInfo: UserInfo): EnhancedInput {
    const colorElements = this.enhanceColorInput(userInfo.favoriteColor, userInfo);
    const animalElements = this.enhanceAnimalInput(userInfo.favoriteAnimal, userInfo);
    const hobbyElements = this.enhanceHobbyInput(userInfo.hobbies, userInfo);
    const foodElements = this.enhanceFoodInput(userInfo.favoriteFood, userInfo);
    const specialElements = this.enhanceSpecialRequest(userInfo.specialRequest, userInfo);

    // Combine all elements
    const characterElements: CharacterElement[] = [
      ...colorElements.characterElements,
      ...animalElements.characterElements,
      ...hobbyElements.characterElements,
      ...foodElements.characterElements,
      ...specialElements.characterElements
    ];

    const storyElements: StoryElement[] = [
      ...colorElements.storyElements,
      ...animalElements.storyElements,
      ...hobbyElements.storyElements,
      ...foodElements.storyElements,
      ...specialElements.storyElements
    ];

    // Create thematic connections between inputs
    const thematicConnections = this.generateThematicConnections(userInfo);

    // Generate enhanced traits
    const enhancedTraits = this.generateEnhancedTraits(characterElements, userInfo);

    return {
      originalInput: `${userInfo.favoriteColor}, ${userInfo.favoriteAnimal}, ${userInfo.hobbies}, ${userInfo.favoriteFood}`,
      enhancedTraits,
      characterElements,
      storyElements,
      thematicConnections
    };
  }

  private static enhanceColorInput(color: string, userInfo: UserInfo): { characterElements: CharacterElement[]; storyElements: StoryElement[] } {
    const colors = [color.toLowerCase().trim()];
    const characterElements: CharacterElement[] = [];
    const storyElements: StoryElement[] = [];

    colors.forEach(colorName => {
      // Character appearance based on color
      characterElements.push({
        type: 'appearance',
        description: `${userInfo.name} loves wearing ${colorName} clothes`,
        storyIntegration: `${userInfo.name} always chooses ${colorName} things`
      });

      // Personality trait based on color psychology
      const personality = this.getColorPersonality(colorName);
      if (personality) {
        characterElements.push({
          type: 'personality',
          description: personality.trait,
          storyIntegration: personality.storyHook
        });
      }

      // Story elements based on color
      storyElements.push({
        type: 'setting',
        description: `A magical ${colorName} garden`,
        narrativeHook: `Where everything sparkles in shades of ${colorName}`
      });

      storyElements.push({
        type: 'object',
        description: `A special ${colorName} treasure`,
        narrativeHook: `That glows with ${colorName} light when touched`
      });
    });

    return { characterElements, storyElements };
  }

  private static enhanceAnimalInput(animal: string, userInfo: UserInfo): { characterElements: CharacterElement[]; storyElements: StoryElement[] } {
    const animals = [animal.toLowerCase().trim()];
    const characterElements: CharacterElement[] = [];
    const storyElements: StoryElement[] = [];

    animals.forEach(animalName => {
      // Create animal companion character
      characterElements.push({
        type: 'preference',
        description: `${userInfo.name} has a special connection with ${animalName}s`,
        storyIntegration: `${userInfo.name} can understand what ${animalName}s are thinking`
      });

      // Animal-inspired skills
      const skill = this.getAnimalSkill(animalName);
      if (skill) {
        characterElements.push({
          type: 'skill',
          description: skill.ability,
          storyIntegration: skill.storyUse
        });
      }

      // Story elements featuring the animal
      storyElements.push({
        type: 'activity',
        description: `Adventures with ${animalName} friends`,
        narrativeHook: `Meeting wise ${animalName}s who share ancient secrets`
      });

      storyElements.push({
        type: 'setting',
        description: `The ${animalName} kingdom`,
        narrativeHook: `A magical place where ${animalName}s live in harmony`
      });
    });

    return { characterElements, storyElements };
  }

  private static enhanceHobbyInput(hobbies: string, userInfo: UserInfo): { characterElements: CharacterElement[]; storyElements: StoryElement[] } {
    const activities = [hobbies.toLowerCase().trim()];
    const characterElements: CharacterElement[] = [];
    const storyElements: StoryElement[] = [];

    activities.forEach(activity => {
      // Skills based on hobbies
      characterElements.push({
        type: 'skill',
        description: `${userInfo.name} is talented at ${activity}`,
        storyIntegration: `${userInfo.name} uses ${activity} skills to solve problems`
      });

      // Background based on hobbies
      characterElements.push({
        type: 'background',
        description: `${userInfo.name} learned ${activity} from a special teacher`,
        storyIntegration: `This knowledge becomes important in the adventure`
      });

      // Activities as story elements
      storyElements.push({
        type: 'activity',
        description: `A ${activity} challenge`,
        narrativeHook: `Where ${userInfo.name}'s ${activity} skills save the day`
      });

      // Settings related to hobbies
      const setting = this.getHobbySettring(activity);
      if (setting) {
        storyElements.push({
          type: 'setting',
          description: setting.place,
          narrativeHook: setting.storyHook
        });
      }
    });

    return { characterElements, storyElements };
  }

  private static enhanceFoodInput(food: string, userInfo: UserInfo): { characterElements: CharacterElement[]; storyElements: StoryElement[] } {
    const foods = [food.toLowerCase().trim()];
    const characterElements: CharacterElement[] = [];
    const storyElements: StoryElement[] = [];

    foods.forEach(foodName => {
      // Food preferences as character traits
      characterElements.push({
        type: 'preference',
        description: `${userInfo.name} loves sharing ${foodName} with friends`,
        storyIntegration: `${userInfo.name} always packs ${foodName} for adventures`
      });

      // Food-based story elements
      storyElements.push({
        type: 'object',
        description: `Magical ${foodName} that grants special powers`,
        narrativeHook: `Each bite gives ${userInfo.name} new abilities`
      });

      storyElements.push({
        type: 'activity',
        description: `Cooking ${foodName} together`,
        narrativeHook: `Teaching friends how to make the perfect ${foodName}`
      });

      // Cultural connections
      const culture = this.getFoodCulture(foodName);
      if (culture) {
        storyElements.push({
          type: 'setting',
          description: culture.setting,
          narrativeHook: culture.narrativeHook
        });
      }
    });

    return { characterElements, storyElements };
  }

  private static enhanceSpecialRequest(request: string, userInfo: UserInfo): { characterElements: CharacterElement[]; storyElements: StoryElement[] } {
    const characterElements: CharacterElement[] = [];
    const storyElements: StoryElement[] = [];

    if (!request || request.trim().length === 0) {
      return { characterElements, storyElements };
    }

    // Parse special request for themes
    const themes = this.parseSpecialRequestThemes(request);
    
    themes.forEach(theme => {
      characterElements.push({
        type: 'preference',
        description: `${userInfo.name} has a special interest in ${theme}`,
        storyIntegration: `This interest leads to exciting discoveries`
      });

      storyElements.push({
        type: 'conflict',
        description: `A challenge related to ${theme}`,
        narrativeHook: `That requires ${userInfo.name}'s unique knowledge`
      });
    });

    return { characterElements, storyElements };
  }

  private static generateThematicConnections(userInfo: UserInfo): string[] {
    const connections: string[] = [];

    // Color + Animal connections
    connections.push(`${userInfo.name}'s ${userInfo.favoriteColor} clothes help ${userInfo.favoriteAnimal} friends recognize them`);
    
    // Hobby + Food connections
    connections.push(`After ${userInfo.hobbies}, ${userInfo.name} enjoys eating ${userInfo.favoriteFood}`);
    
    // Animal + Food connections
    connections.push(`${userInfo.name} shares ${userInfo.favoriteFood} with their ${userInfo.favoriteAnimal} friends`);
    
    // Color + Hobby connections
    connections.push(`${userInfo.name} uses ${userInfo.favoriteColor} equipment for ${userInfo.hobbies}`);

    return connections;
  }

  private static generateEnhancedTraits(characterElements: CharacterElement[], userInfo: UserInfo): string[] {
    const traits: string[] = [];

    // Summarize character elements into traits
    const appearances = characterElements.filter(e => e.type === 'appearance');
    const personalities = characterElements.filter(e => e.type === 'personality');
    const skills = characterElements.filter(e => e.type === 'skill');
    const preferences = characterElements.filter(e => e.type === 'preference');

    if (appearances.length > 0) {
      traits.push(`${userInfo.name} has a distinctive ${userInfo.favoriteColor} style`);
    }

    if (personalities.length > 0) {
      traits.push(`${userInfo.name} is known for being creative and thoughtful`);
    }

    if (skills.length > 0) {
      traits.push(`${userInfo.name} has special talents that help in adventures`);
    }

    if (preferences.length > 0) {
      traits.push(`${userInfo.name} loves sharing favorite things with friends`);
    }

    return traits;
  }

  // Helper methods for specific enhancements
  private static getColorPersonality(color: string): { trait: string; storyHook: string } | null {
    const colorPersonalities: Record<string, { trait: string; storyHook: string }> = {
      'red': { trait: 'brave and energetic', storyHook: 'always ready for adventure' },
      'blue': { trait: 'calm and thoughtful', storyHook: 'thinks carefully before acting' },
      'green': { trait: 'nature-loving and peaceful', storyHook: 'has a special connection with plants' },
      'yellow': { trait: 'cheerful and optimistic', storyHook: 'brightens everyone\'s day' },
      'purple': { trait: 'creative and imaginative', storyHook: 'sees magic everywhere' },
      'orange': { trait: 'enthusiastic and friendly', storyHook: 'makes friends easily' },
      'pink': { trait: 'kind and caring', storyHook: 'always helps others feel better' },
      'brown': { trait: 'reliable and down-to-earth', storyHook: 'friends count on them' },
      'black': { trait: 'mysterious and strong', storyHook: 'has hidden depths' },
      'white': { trait: 'pure-hearted and honest', storyHook: 'always tells the truth' }
    };

    return colorPersonalities[color.toLowerCase()] || null;
  }

  private static getAnimalSkill(animal: string): { ability: string; storyUse: string } | null {
    const animalSkills: Record<string, { ability: string; storyUse: string }> = {
      'cat': { ability: 'moves silently and gracefully', storyUse: 'sneaking past sleeping dragons' },
      'dog': { ability: 'loyal and has super hearing', storyUse: 'detecting danger from far away' },
      'bird': { ability: 'sees everything from above', storyUse: 'spotting hidden paths' },
      'fish': { ability: 'swims like a champion', storyUse: 'exploring underwater treasures' },
      'rabbit': { ability: 'hops incredibly fast', storyUse: 'escaping from tricky situations' },
      'elephant': { ability: 'remembers everything important', storyUse: 'recalling ancient wisdom' },
      'owl': { ability: 'sees clearly in the dark', storyUse: 'navigating mysterious places' },
      'lion': { ability: 'brave and strong leader', storyUse: 'protecting friends from danger' }
    };

    return animalSkills[animal.toLowerCase()] || null;
  }

  private static getHobbySettring(hobby: string): { place: string; storyHook: string } | null {
    const hobbySettings: Record<string, { place: string; storyHook: string }> = {
      'reading': { place: 'The Great Library', storyHook: 'where books come to life' },
      'painting': { place: 'The Rainbow Valley', storyHook: 'where colors grow on trees' },
      'singing': { place: 'The Echo Mountains', storyHook: 'where songs have magical power' },
      'dancing': { place: 'The Rhythm Forest', storyHook: 'where trees dance to the wind' },
      'cooking': { place: 'The Flavor Kingdom', storyHook: 'where ingredients are treasures' },
      'gardening': { place: 'The Growing Meadows', storyHook: 'where plants grant wishes' },
      'building': { place: 'The Construction Clouds', storyHook: 'where buildings float in the sky' },
      'sports': { place: 'The Champion Fields', storyHook: 'where games decide the fate of kingdoms' }
    };

    return hobbySettings[hobby.toLowerCase()] || null;
  }

  private static getFoodCulture(food: string): { setting: string; narrativeHook: string } | null {
    const foodCultures: Record<string, { setting: string; narrativeHook: string }> = {
      'pizza': { setting: 'The Italian Countryside', narrativeHook: 'where pizza brings communities together' },
      'rice': { setting: 'The Golden Rice Fields', narrativeHook: 'where each grain tells a story' },
      'pasta': { setting: 'The Noodle Factory', narrativeHook: 'where pasta shapes create magic spells' },
      'bread': { setting: 'The Village Bakery', narrativeHook: 'where bread rises with hopes and dreams' },
      'fruit': { setting: 'The Orchard Paradise', narrativeHook: 'where fruits contain rainbow flavors' }
    };

    return foodCultures[food.toLowerCase()] || null;
  }

  private static parseSpecialRequestThemes(request: string): string[] {
    const themes: string[] = [];
    const lowerRequest = request.toLowerCase();

    // Look for common themes in special requests
    if (lowerRequest.includes('space') || lowerRequest.includes('astronaut') || lowerRequest.includes('rocket')) {
      themes.push('space exploration');
    }
    if (lowerRequest.includes('ocean') || lowerRequest.includes('sea') || lowerRequest.includes('underwater')) {
      themes.push('ocean adventures');
    }
    if (lowerRequest.includes('magic') || lowerRequest.includes('wizard') || lowerRequest.includes('fairy')) {
      themes.push('magical worlds');
    }
    if (lowerRequest.includes('dinosaur') || lowerRequest.includes('prehistoric')) {
      themes.push('dinosaur times');
    }
    if (lowerRequest.includes('robot') || lowerRequest.includes('future') || lowerRequest.includes('technology')) {
      themes.push('future technology');
    }

    // If no specific themes found, use general adventure theme
    if (themes.length === 0) {
      themes.push('exciting adventures');
    }

    return themes;
  }

  static getEnhancedInputsForDifficulty(userInfo: UserInfo, difficulty: DifficultyLevel): {
    characterTraits: string[];
    storyElements: string[];
    vocabularyConnections: string[];
  } {
    const enhanced = this.enhanceUserInputs(userInfo);

    if (difficulty === 'easy' || difficulty === 'medium') {
      // For themed sessions, focus on direct connections
      return {
        characterTraits: enhanced.enhancedTraits.slice(0, 2),
        storyElements: enhanced.storyElements.slice(0, 3).map(e => e.description),
        vocabularyConnections: enhanced.thematicConnections.slice(0, 2)
      };
    } else {
      // For progressive revelation, provide all elements
      return {
        characterTraits: enhanced.enhancedTraits,
        storyElements: enhanced.storyElements.map(e => e.description),
        vocabularyConnections: enhanced.thematicConnections
      };
    }
  }

  static clearCache(): void {
    this.enhancementCache.clear();
  }
}