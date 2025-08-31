// Creative Story Seeds Generator
// Transforms user inputs into story possibilities

import type { UserInfo } from '../types';

export interface CreativeStorySeed {
  input: string;
  inputType: 'color' | 'animal' | 'hobby' | 'food';
  storyPossibilities: string[];
}

export function generateCreativeSeeds(userInfo: UserInfo): CreativeStorySeed[] {
  const seeds: CreativeStorySeed[] = [];

  // Color Integration (4 possibilities each)
  if (userInfo.favoriteColor) {
    seeds.push({
      input: userInfo.favoriteColor,
      inputType: 'color',
      storyPossibilities: generateColorPossibilities(userInfo.favoriteColor)
    });
  }

  // Animal Integration
  if (userInfo.favoriteAnimal) {
    seeds.push({
      input: userInfo.favoriteAnimal,
      inputType: 'animal',
      storyPossibilities: generateAnimalPossibilities(userInfo.favoriteAnimal)
    });
  }

  // Hobby Integration
  if (userInfo.hobbies) {
    seeds.push({
      input: userInfo.hobbies,
      inputType: 'hobby',
      storyPossibilities: generateHobbyPossibilities(userInfo.hobbies)
    });
  }

  // Food Integration
  if (userInfo.favoriteFood) {
    seeds.push({
      input: userInfo.favoriteFood,
      inputType: 'food',
      storyPossibilities: generateFoodPossibilities(userInfo.favoriteFood)
    });
  }

  return seeds;
}

function generateColorPossibilities(color: string): string[] {
  const normalizedColor = color.toLowerCase().trim();
  
  // Color-specific story elements (4 per color)
  const colorMappings: Record<string, string[]> = {
    red: [
      "a magical red cloak that gives confidence",
      "red roses that whisper secrets",
      "a red dragon who loves to paint",
      "red autumn leaves that dance and play"
    ],
    blue: [
      "a blue crystal that shows the truth",
      "blue ocean waves with hidden treasures",
      "a blue bird who carries messages of hope",
      "blue skies that open magical doorways"
    ],
    green: [
      "a green forest where trees tell stories",
      "green gems that glow with friendship",
      "a green meadow where dreams come true",
      "green vines that connect distant places"
    ],
    yellow: [
      "a yellow sun that speaks in riddles",
      "yellow flowers that sing morning songs",
      "a golden key that unlocks any door",
      "yellow butterflies that grant wishes"
    ],
    purple: [
      "a purple potion that reveals hidden talents",
      "purple mountains where wise creatures live",
      "a purple book that writes its own stories",
      "purple stars that guide lost travelers"
    ],
    pink: [
      "a pink cloud that carries dreams",
      "pink pearls that show kindness' power",
      "a pink castle where laughter echoes",
      "pink winds that bring messages of love"
    ],
    orange: [
      "an orange sunset that paints new worlds",
      "orange flames that warm cold hearts",
      "an orange path that leads to adventure",
      "orange stones that hold ancient wisdom"
    ]
  };

  return colorMappings[normalizedColor] || [
    `a ${color} light that guides the way`,
    `${color} elements that bring magic`,
    `a ${color} world full of wonder`,
    `${color} powers that help others`
  ];
}

function generateAnimalPossibilities(animal: string): string[] {
  const normalizedAnimal = animal.toLowerCase().trim();
  
  return [
    `befriend a wise ${animal} who becomes their guide`,
    `discover they can speak with ${animal}s`,
    `find a magical ${animal} who needs their help`,
    `learn important lessons from a gentle ${animal}`
  ];
}

function generateHobbyPossibilities(hobbies: string): string[] {
  const hobby = hobbies.toLowerCase().trim();
  
  // Map common hobbies to story elements
  if (hobby.includes('read')) {
    return [
      "discover a book that comes to life",
      "find a library with magical stories",
      "meet characters who step out of books",
      "use reading skills to solve mysteries"
    ];
  }
  
  if (hobby.includes('draw') || hobby.includes('art')) {
    return [
      "create drawings that become real",
      "use art to communicate with magical beings",
      "paint doorways to other worlds",
      "solve problems through creative expression"
    ];
  }
  
  if (hobby.includes('music') || hobby.includes('sing')) {
    return [
      "discover songs that cast helpful spells",
      "use music to tame wild creatures",
      "find instruments that play themselves",
      "bring harmony to discordant places"
    ];
  }
  
  if (hobby.includes('sport') || hobby.includes('run') || hobby.includes('play')) {
    return [
      "use athletic skills in magical competitions",
      "discover that movement unlocks hidden paths",
      "teach games that bring communities together",
      "find that play is the key to solving puzzles"
    ];
  }
  
  // Generic hobby possibilities
  return [
    `use their love of ${hobby} to solve problems`,
    `discover that ${hobby} has magical properties`,
    `teach others about ${hobby} and make new friends`,
    `find that ${hobby} connects them to adventure`
  ];
}

function generateFoodPossibilities(food: string): string[] {
  const normalizedFood = food.toLowerCase().trim();
  
  return [
    `discover a magical bakery that makes ${food} with wishes baked in`,
    `find that sharing ${food} creates unbreakable friendships`,
    `learn to cook ${food} with ingredients from enchanted gardens`,
    `use ${food} to bring comfort to those who need it most`
  ];
}

// Legacy compatibility - deprecated
export class InputEnhancementEngine {
  static enhanceUserInputs(userInfo: UserInfo) {
    console.warn('⚠️ InputEnhancementEngine.enhanceUserInputs is deprecated. Use generateCreativeSeeds instead.');
    
    const seeds = generateCreativeSeeds(userInfo);
    
    // Convert to legacy format for compatibility
    return {
      originalInput: `${userInfo.favoriteColor}, ${userInfo.favoriteAnimal}, ${userInfo.hobbies}, ${userInfo.favoriteFood}`,
      enhancedTraits: seeds.map(s => s.storyPossibilities[0]).filter(Boolean),
      characterElements: [{
        type: 'appearance' as const,
        description: `${userInfo.name} loves ${userInfo.favoriteColor}`,
        storyIntegration: seeds.find(s => s.inputType === 'color')?.storyPossibilities[0] || `${userInfo.name} always chooses ${userInfo.favoriteColor} things`
      }],
      storyElements: [{
        type: 'activity' as const,
        description: userInfo.hobbies || 'adventures',
        narrativeHook: seeds.find(s => s.inputType === 'animal')?.storyPossibilities[0] || `Let's go on an adventure with ${userInfo.favoriteAnimal || 'friends'}!`
      }],
      thematicConnections: [
        `${userInfo.favoriteColor} and ${userInfo.favoriteAnimal} adventures`
      ]
    };
  }

  static clearCache(): void {
    // No-op for compatibility
  }
}