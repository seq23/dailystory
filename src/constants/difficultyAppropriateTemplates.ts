// FIXED: Difficulty-Appropriate Story Templates with Proper Word Count Progression
// Easy: 3-6 words | Medium: 6-12 words | Hard: 10-18 words | Expert: 15-25 words
import { NameFormatter } from "@/utils/nameFormatter";
import type { UserInfo } from "@/types";

export const DIFFICULTY_APPROPRIATE_TEMPLATES = {
  easy: [
    // 3-6 words per page - Level 1 vocabulary only
    ["{name} sees a {animal}.", "The {animal} is {color}.", "{name} says hello.", "They play ball.", "The {animal} runs fast.", "{name} runs too.", "They have fun.", "{name} likes the {animal}.", "They are friends.", "{name} is happy."],
    ["{name} goes out today.", "{pronoun} finds a {object}.", "The {object} is {color}.", "{name} picks it up.", "A {animal} comes over.", "It wants the {object}.", "{name} gives it back.", "The {animal} is happy.", "They play together nicely.", "{name} feels very good."],
    ["{name} helps a {animal}.", "The {animal} looks sad.", "It lost its {food}.", "{name} wants to help.", "They look and look.", "{name} finds the {food}.", "It was under rocks.", "{name} gives it back.", "The {animal} is happy.", "They are good friends."],
    ["{name} has a {object}.", "It is very {color}.", "A {animal} comes near.", "It wants to play.", "{name} lets it play.", "They play together happily.", "The {animal} is happy.", "{name} is happy too.", "They play all day.", "Good friends always share."]
  ],

  medium: [
    // 6-12 words per page - age-appropriate vocabulary 
    ["{name} walks through the magical forest today.", "A friendly {animal} appears near the oak tree.", "The {animal} has bright {color} fur.", "It leads {name} to a hidden clearing.", "There sits a mysterious {object} glowing in sunlight.", "The {object} holds ancient secrets from long ago.", "{name} carefully picks up the special treasure.", "Suddenly the forest fills with beautiful music.", "The {animal} smiles and nods at {name}.", "Together they dance as the sun rises."],
    ["{name} discovers a secret door behind the bookshelf.", "The door opens to reveal stairs going down.", "A curious {animal} follows {name} into darkness.", "They find a room filled with glowing crystals.", "Each crystal makes different musical sounds when touched.", "The {animal} shows {name} how to play melodies.", "Beautiful music echoes through the underground chamber walls.", "The crystals begin to glow brighter with notes.", "{name} learns that music has real magical powers.", "They play together until the stars appear above."],
    ["{name} finds a tiny village hidden in garden.", "Little people no bigger than thumb live there.", "A brave {animal} guards the village from danger.", "The villagers invite {name} to join their celebration.", "They share delicious {food} from their miniature gardens.", "Everyone dances around a fire made of petals.", "The {animal} tells stories of adventure and friendship.", "{name} promises to keep the village location secret.", "The little people give {name} a friendship bracelet.", "Every full moon, {name} returns to visit friends."]
  ],

  hard: [
    // 10-18 words per page - complete thoughts with advanced vocabulary
    ["{name} lived peacefully in the beautiful {setting} with many wonderful friends from school nearby.", "One day something very strange and mysterious happened that would change everything in their lives.", "The {animal}s started acting differently and seemed quite scared of something dangerous in the forest.", "{name} noticed their unusual fear and decided to help solve this puzzling mystery with courage.", "They bravely decided to investigate this mystery that was frightening all the forest animals every night.", "With great courage and determination {name} ventured into the unknown territory to find trouble's source.", "There they discovered some dangerous creatures causing serious trouble everywhere they went in the land.", "{name} had to make a very difficult choice about how to handle this dangerous situation.", "Using special abilities that had been developing slowly {name} found the perfect solution for everyone.", "The {setting} became peaceful again and {name} grew much wiser from this challenging adventure experience."],
    ["{name} discovered an ancient magical clock hidden deep in the mysterious library's secret basement room.", "When the ornate hands moved backward slowly, something absolutely incredible happened throughout the entire building.", "The world around {name} began to shimmer and change colors dramatically as time seemed to bend.", "They found themselves transported to a completely different time period with different customs and clothing.", "A helpful {animal} from that historical era patiently explained the complex rules of time travel.", "To return home safely, {name} must solve an important historical problem that had puzzled people.", "Working with people from the past proved challenging but ultimately rewarding as they learned different perspectives.", "{name} learned that every generation faces similar difficulties and joys despite the passage of years.", "By helping others solve their problems, they gained the magical power needed to return home.", "Back home, {name} treasured the wisdom and knowledge gained from this incredible journey through time."]
  ],

  expert: [
    // 15-25 words per page - complex thoughts with sophisticated vocabulary
    ["{name} began exploring the fascinating world of science and discovery with great enthusiasm and curiosity about nature.", "Complex questions about the natural world seemed increasingly interesting as {name} continued learning each day through observation.", "A mysterious wise {animal} appeared offering valuable guidance through unknown realms of knowledge that would change everything.", "Together they explored ancient mysteries hidden within nature that had puzzled scientists and researchers for generations.", "{name} faced an important choice between pursuing personal desires and helping others in the community.", "The challenging journey revealed amazing truths about friendship, courage, and how all living things connect.", "Through deep thinking and meaningful dialogue {name} found inner peace and understanding about life's meaning.", "This character growth changed their understanding of life's principles and the importance of serving others.", "Essential principles of kindness, compassion, and balance became clear as the adventure reached its conclusion.", "{name} achieved deeper understanding of friendship and their purpose through this journey of growth and discovery."],
    ["{name} encountered a series of deep questions that challenged their thinking and changed their beliefs.", "Each question led to deeper thinking about existence, meaning, and the principles that guide behavior.", "An enlightened {animal} served as teacher and companion throughout this intellectual quest, providing ancient wisdom.", "They explored complex concepts of justice, beauty, and truth through deep discussion and careful analysis.", "{name} gradually understood that wisdom comes from asking questions and remaining open to learning.", "The journey revealed that everyone's perspective adds valuable insight to life's mysteries and strengthens understanding.", "Through meaningful dialogue and reflection, {name} developed understanding of complex issues and multiple viewpoints.", "Personal growth emerged from meaningful connections with others and commitment to serving the greater good.", "The adventure culminated in {name} becoming a bridge between different ways of thinking.", "Ultimately, {name} learned that discoveries come from embracing questions while maintaining hope and searching for truth."]
  ]
};

// Updated template selector that processes variables and enforces difficulty-appropriate word counts
export const getDifficultyAppropriateTemplate = (
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  templateIndex?: number,
  userInfo?: UserInfo
): string[] => {
  const templates = DIFFICULTY_APPROPRIATE_TEMPLATES[difficulty];
  
  let selectedTemplate: string[];
  if (templateIndex !== undefined && templateIndex < templates.length) {
    selectedTemplate = templates[templateIndex];
  } else {
    selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  }
  
  // Process templates to replace variables if userInfo is provided
  if (userInfo) {
    return selectedTemplate.map(template => processTemplate(template, userInfo, difficulty));
  }
  
  return selectedTemplate;
};

// Template processing function that replaces all variables
const processTemplate = (template: string, userInfo: UserInfo, difficulty: 'easy' | 'medium' | 'hard' | 'expert'): string => {
  let processed = template;
  
  // Replace user placeholders with properly capitalized name
  processed = processed.replace(/{name}/g, NameFormatter.capitalize(userInfo.name || 'Alex'));
  processed = processed.replace(/{pronoun}/g, 'they');
  processed = processed.replace(/{pronoun_possessive}/g, 'their');
  
  // Replace story elements with vocabulary appropriate for each difficulty level
  const animals = difficulty === 'easy' 
    ? ['cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'hen', 'bee', 'bear', 'fox', 'frog']
    : difficulty === 'medium'
    ? ['cat', 'rabbit', 'owl', 'deer', 'fox', 'turtle', 'butterfly', 'bird', 'squirrel', 'mouse']
    : difficulty === 'hard'
    ? ['wolf', 'eagle', 'panther', 'raven', 'falcon', 'lynx', 'phoenix', 'dragon', 'griffin', 'sphinx']
    : ['phoenix', 'dragon', 'sphinx', 'leviathan', 'chimera', 'pegasus', 'unicorn', 'basilisk'];
    
  const colors = difficulty === 'easy'
    ? ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown']
    : difficulty === 'medium'
    ? ['golden', 'silver', 'emerald', 'sapphire', 'crimson', 'violet', 'amber', 'turquoise']
    : difficulty === 'hard'
    ? ['iridescent', 'luminescent', 'opalescent', 'prismatic', 'chromatic', 'incandescent']
    : ['transcendent', 'ethereal', 'celestial', 'cosmic', 'infinite', 'multidimensional'];
    
  const objects = difficulty === 'easy'
    ? ['ball', 'book', 'toy', 'cake', 'hat', 'cup']
    : difficulty === 'medium'
    ? ['key', 'book', 'gem', 'flower', 'stone', 'shell', 'treasure', 'crown']
    : difficulty === 'hard'
    ? ['ancient relic', 'mystical artifact', 'enchanted scroll', 'crystal orb', 'magic amulet', 'sacred tome']
    : ['philosophical codex', 'temporal device', 'consciousness matrix', 'wisdom catalyst', 'enlightenment key'];
    
  const foods = difficulty === 'easy'
    ? ['apple', 'bread', 'milk', 'cake', 'fish', 'meat']
    : difficulty === 'medium'
    ? ['berries', 'honey', 'nuts', 'fruits', 'vegetables', 'grain']
    : difficulty === 'hard'
    ? ['ambrosia', 'nectar', 'exotic fruits', 'mystical herbs', 'enchanted berries', 'magical essence']
    : ['ethereal nourishment', 'cosmic energy', 'spiritual sustenance', 'enlightenment food', 'transcendent nutrition'];
  
  // Use user preferences when available, otherwise random
  const animal = userInfo.favoriteAnimal || animals[Math.floor(Math.random() * animals.length)];
  const color = userInfo.favoriteColor || colors[Math.floor(Math.random() * colors.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];
  const food = userInfo.favoriteFood || foods[Math.floor(Math.random() * foods.length)];
  
  processed = processed.replace(/{animal}/g, animal);
  processed = processed.replace(/{color}/g, color);
  processed = processed.replace(/{object}/g, object);
  processed = processed.replace(/{food}/g, food);
  
  return processed;
};

// Flexible validation with margin of error to preserve natural story flow
export const validateDifficultyCompliance = (
  content: string,
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  strictMode: boolean = false
): { 
  isValid: boolean; 
  wordCount: number; 
  expectedRange: { min: number; max: number };
  zone: 'green' | 'yellow' | 'red';
  marginOfError?: { min: number; max: number };
} => {
  const wordCount = content.split(/\s+/).filter(w => w.trim()).length;
  
  // Ideal ranges for each difficulty level
  const idealRanges = {
    easy: { min: 3, max: 6 },
    medium: { min: 6, max: 12 },
    hard: { min: 10, max: 18 },
    expert: { min: 15, max: 25 }
  };

  // Flexible ranges - sentence-based for levels 1-2, no limits for levels 3-4
  const flexibleRanges = {
    easy: { min: 2, max: 12 },     // Expanded for complete sentences
    medium: { min: 4, max: 20 },   // Expanded for complete sentences  
    hard: { min: 0, max: 9999 },   // No validation - allow natural page breaks
    expert: { min: 0, max: 9999 }  // No validation - allow natural page breaks
  };
  
  const idealRange = idealRanges[difficulty];
  const flexibleRange = flexibleRanges[difficulty];
  
  // Determine validation zone
  let zone: 'green' | 'yellow' | 'red';
  let isValid: boolean;
  
  if (strictMode) {
    // Strict mode: only ideal range is valid
    isValid = wordCount >= idealRange.min && wordCount <= idealRange.max;
    zone = isValid ? 'green' : 'red';
  } else {
    // Flexible mode: tiered validation (sentence-based for easy/medium, no validation for hard/expert)
    if (difficulty === 'hard' || difficulty === 'expert') {
      // No word count validation for advanced levels
      zone = 'green';
      isValid = true;
    } else if (wordCount >= idealRange.min && wordCount <= idealRange.max) {
      zone = 'green';  // Perfect - within ideal range
      isValid = true;
    } else if (wordCount >= flexibleRange.min && wordCount <= flexibleRange.max) {
      zone = 'yellow'; // Acceptable with margin of error
      isValid = true;  // Still valid, just not ideal
    } else {
      zone = 'red';    // Too far outside acceptable range
      isValid = false;
    }
  }
  
  return {
    isValid,
    wordCount,
    expectedRange: idealRange,
    zone,
    marginOfError: strictMode ? undefined : flexibleRange
  };
};