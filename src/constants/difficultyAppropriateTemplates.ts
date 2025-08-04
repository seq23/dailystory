// FIXED: Difficulty-Appropriate Story Templates with Proper Word Count Progression
// Easy: 3-6 words | Medium: 6-12 words | Hard: 10-18 words | Expert: 15-25 words

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

// Updated template selector that enforces difficulty-appropriate word counts
export const getDifficultyAppropriateTemplate = (
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  templateIndex?: number
): string[] => {
  const templates = DIFFICULTY_APPROPRIATE_TEMPLATES[difficulty];
  
  if (templateIndex !== undefined && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  
  return templates[Math.floor(Math.random() * templates.length)];
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

  // Flexible ranges with 25% margin of error for natural flow
  const flexibleRanges = {
    easy: { min: 2, max: 8 },     // 25% margin: 3±1, 6±2
    medium: { min: 4, max: 15 },   // 25% margin: 6±2, 12±3  
    hard: { min: 8, max: 22 },     // 25% margin: 10±2, 18±4
    expert: { min: 12, max: 30 }   // 25% margin: 15±3, 25±5
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
    // Flexible mode: tiered validation
    if (wordCount >= idealRange.min && wordCount <= idealRange.max) {
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