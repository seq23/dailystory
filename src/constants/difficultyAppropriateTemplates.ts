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
    ["{name} began exploring the fascinating and complex world of science and discovery with tremendous enthusiasm and intellectual curiosity about natural phenomena.", "Complex questions about nature and the universe seemed increasingly interesting and important as {name} continued to learn more each day through observation.", "A mysterious wise {animal} appeared unexpectedly offering valuable guidance through unknown realms of knowledge and understanding that would fundamentally change everything about life.", "Together they carefully explored ancient mysteries hidden within the natural world that had puzzled scientists, researchers, and philosophers for many generations before them.", "{name} faced an extremely important choice between pursuing personal desires and dedicating time to helping others in the community who desperately needed assistance.", "The long and challenging journey gradually revealed amazing truths about friendship, courage, and the interconnectedness of all living things in the universe.", "Through deep thinking, careful reflection, and meaningful dialogue {name} finally found lasting inner peace and a profound understanding about life's true meaning.", "This transformative character growth and personal development completely changed their understanding of life's fundamental principles and the importance of serving others in need.", "Essential principles of kindness, compassion, and balance became crystal clear to {name} as the adventure reached its most important and meaningful conclusion.", "{name} achieved a deeper understanding of friendship and their true purpose in life through this remarkable journey of personal growth, discovery, and transformation."],
    ["{name} encountered a series of profound philosophical questions that challenged conventional thinking and forced a complete reevaluation of previously held beliefs and assumptions.", "Each question led to deeper contemplation about the nature of existence, meaning, purpose, and the fundamental principles that govern human behavior and relationships.", "An enlightened {animal} served as both teacher and companion throughout this intensive intellectual quest, providing wisdom gained through centuries of careful observation.", "They explored complex concepts of justice, beauty, truth, and the intricate interconnectedness of all things in the universe through deep discussion and analysis.", "{name} gradually understood that true wisdom comes not from having all the answers but from asking the right questions and remaining open to learning.", "The journey revealed that every person's unique perspective adds valuable insight to life's greatest mysteries and that diversity of thought strengthens understanding.", "Through meaningful dialogue and careful reflection, {name} developed a more nuanced understanding of complex issues and the importance of considering multiple viewpoints.", "Personal growth emerged not from isolation and self-focus but from meaningful connections with others and a commitment to serving the greater good.", "The adventure culminated in {name} becoming a bridge between different ways of thinking and helping others find common ground despite their differences.", "Ultimately, {name} learned that the greatest discoveries come from embracing both questions and uncertainty while maintaining hope and continuing to search for truth."]
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

// Validate that content matches difficulty expectations
export const validateDifficultyCompliance = (
  content: string,
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
): { isValid: boolean; wordCount: number; expectedRange: { min: number; max: number } } => {
  const wordCount = content.split(/\s+/).filter(w => w.trim()).length;
  
  const ranges = {
    easy: { min: 3, max: 6 },
    medium: { min: 6, max: 12 },
    hard: { min: 10, max: 18 },
    expert: { min: 15, max: 25 }
  };
  
  const expectedRange = ranges[difficulty];
  const isValid = wordCount >= expectedRange.min && wordCount <= expectedRange.max;
  
  return {
    isValid,
    wordCount,
    expectedRange
  };
};