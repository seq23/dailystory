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
    ["{name} discovers something special in the garden today.", "A friendly {animal} lives there and waves hello.", "The {animal} can talk to {name} in simple words.", "It tells {name} some fun stories about forest adventures.", "A pretty {object} waits for them to find together.", "It has some special magic powers hidden inside it.", "{name} must find it very soon before the sunset.", "They look through the big green forest very carefully.", "Together they help solve the mystery of lost friendship.", "This fun trip teaches {name} about helping others always."],
    ["{name} finds an old treasure map in the attic.", "It shows a path to something very special.", "A wise {animal} explains the map's secret meaning carefully.", "The treasure isn't gold or silver coins at all.", "It's something much more valuable than any money.", "The journey teaches lessons about being brave and kind.", "Each challenge helps {name} grow stronger inside every day.", "The {animal} guides through difficult moments very carefully indeed.", "At the end, {name} discovers the real treasure of friendship.", "The treasure was the friendship made along the way."],
    ["{name} starts a neighborhood book club for all kids.", "Every week they meet under the big oak tree.", "A scholarly {animal} joins their reading group every time.", "They read stories from many countries around the world.", "Each book teaches about different cultures and interesting places.", "The {animal} shares stories from its travels around everywhere.", "{name} learns that books connect all people together always.", "Reading together makes stories even more special and fun.", "The club grows as more friends join every week.", "Books build bridges between different kinds of people everywhere."]
  ],

  hard: [
    // 10-18 words per page - complete thoughts with advanced vocabulary
    ["{name} lived peacefully in the beautiful {setting} with many wonderful friends from the local school nearby.", "One day something very strange and mysterious happened there that would change everything in their lives completely.", "The {animal}s started acting differently and seemed quite scared of something dangerous hiding in the dark forest.", "{name} noticed their unusual fear and decided to help them solve this very puzzling mystery together with courage.", "{pronoun} bravely decided to investigate this very puzzling mystery that was frightening all the forest animals every night.", "With great courage and determination {name} ventured into the unknown territory to find the source of all trouble.", "There {pronoun} discovered some dangerous {antagonist} creatures causing serious trouble everywhere they went in the peaceful land.", "{name} had to make a very difficult and important choice about how to handle this dangerous situation wisely.", "Using special {skill} abilities that had been developing slowly {name} found the perfect solution that would help everyone.", "The {setting} became peaceful again and {name} grew much wiser from this challenging and transformative adventure experience."],
    ["{name} discovered an ancient magical clock hidden deep in the mysterious library's secret basement room.", "When the ornate hands moved backward slowly, something absolutely incredible happened immediately throughout the entire building and beyond.", "The world around {name} began to shimmer and change colors dramatically as time itself seemed to bend and twist.", "{pronoun} found themselves transported to a completely different time period with different customs and strange clothing styles.", "A helpful {animal} from that historical era patiently explained the complex rules of time travel and its consequences.", "To return home safely, {name} must solve an important historical problem that had puzzled people for centuries.", "Working with people from the past proved challenging but ultimately rewarding as they learned about different perspectives.", "{name} learned that every generation faces similar difficulties and joys despite the passage of many years and centuries.", "By helping others solve their problems, {pronoun} gained the magical power needed to return to the present time.", "Back home, {name} treasured the wisdom and knowledge gained from this incredible journey through time and history."]
  ],

  expert: [
    // 15-25 words per page - complex thoughts with sophisticated vocabulary
    ["{name} began exploring the fascinating and complex world of science and discovery with tremendous enthusiasm and intellectual curiosity about natural phenomena.", "Complex questions about nature and the universe seemed increasingly interesting and important as {name} continued to learn more each day through careful observation.", "A mysterious wise {animal} appeared unexpectedly offering valuable guidance through unknown realms of knowledge and understanding that would fundamentally change everything about life.", "Together they carefully explored ancient mysteries hidden within the natural world that had puzzled scientists, researchers, and philosophers for many generations before them.", "{name} faced an extremely important choice between pursuing personal desires and dedicating time to helping others in the community who desperately needed assistance.", "The long and challenging journey gradually revealed amazing truths about friendship, courage, and the interconnectedness of all living things in the universe.", "Through deep thinking, careful reflection, and meaningful dialogue {name} finally found lasting inner peace and a profound understanding about life's true meaning.", "This transformative character growth and personal development completely changed {pronoun_possessive} understanding of life's fundamental principles and the importance of serving others in need.", "Essential principles of kindness, compassion, and balance became crystal clear to {name} as the adventure reached its most important and meaningful conclusion.", "{name} achieved a deeper understanding of friendship and {pronoun_possessive} true purpose in life through this remarkable journey of personal growth, discovery, and transformation."],
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