// Enhanced story templates with Level 1 vocabulary for 3-5 year olds
export const ENHANCED_STORY_TEMPLATES = {
  easy: [
    // Template set 1: Simple play story (3-4 words per page - Level 1 vocabulary only)
    [
      "{name} sees a {animal}",
      "The {animal} is {color}",
      "{name} says hello",
      "They play ball",
      "The {animal} runs fast",
      "{name} runs too",
      "They have fun",
      "{name} likes the {animal}",
      "They are friends",
      "{name} is happy"
    ],
    
    // Template set 2: Finding story (3-4 words per page - Level 1 vocabulary only)
    [
      "{name} goes out",
      "{pronoun} finds a {object}",
      "The {object} is {color}",
      "{name} picks it up",
      "A {animal} comes",
      "It wants the {object}",
      "{name} gives it",
      "The {animal} is happy",
      "They play together",
      "{name} feels good"
    ],
    
    // Template set 3: Help story (3-4 words per page - Level 1 vocabulary only)  
    [
      "{name} sees a {animal}",
      "The {animal} looks sad",
      "It lost its {food}",
      "{name} wants to help",
      "They look and look",
      "{name} finds the {food}",
      "It was under rocks",
      "{name} gives it back",
      "The {animal} is happy",
      "They are good friends"
    ],
    
    // Template set 4: Share story (3-4 words per page - Level 1 vocabulary only)
    [
      "{name} has a {object}",
      "It is {color}",
      "A {animal} comes",
      "It wants to play",
      "{name} lets it play",
      "They play together",
      "The {animal} is happy", 
      "{name} is happy too",
      "They play all day",
      "Good friends share"
    ]
  ],
  
  medium: [
    // Template set 1: Simple adventure (5-9 words per page - age-appropriate vocabulary)
    [
      "{name} finds a special {setting} today",
      "A nice {animal} lives there happily",
      "The {animal} can talk to {name}",
      "It tells {name} some fun stories",
      "A pretty {object} waits for them",
      "It has some special magic powers",
      "{name} must find it very soon",
      "They look through the big forest",
      "Together they help solve the problem",
      "This fun trip teaches {name} about friendship"
    ],
    
    // Template set 2: Problem solving (5-9 words per page - simple vocabulary)
    [
      "The {setting} has a big problem today",
      "All the {primary_animal}s lost their {primary_food}",
      "{name} wants to help them right away",
      "{pronoun} meets a very helpful {secondary_animal}",
      "They work together as a good team",
      "The {secondary_animal} shows {name} a secret path",
      "They find where the {primary_food} is hiding",
      "A silly {friend_animal} took it for fun",
      "{name} tells why sharing is very important",
      "Everyone learns the lesson and becomes friends"
    ]
  ],
  
  hard: [
    // Template set 1: Hero's journey (7-13 words per page - complete thoughts)
    [
      "{name} lived peacefully in the beautiful {setting} with many friends",
      "One day something very strange and mysterious happened there",
      "The {animal}s started acting differently and seemed quite scared",
      "{name} noticed their fear and decided to help them",
      "{pronoun} bravely decided to investigate this very puzzling mystery",
      "With great courage {name} ventured into the unknown territory",
      "There {pronoun} discovered some {antagonist} creatures causing trouble everywhere",
      "{name} had to make a very difficult and important choice",
      "Using special {skill} abilities {name} found the perfect solution",
      "The {setting} became peaceful again and {name} grew much wiser"
    ]
  ],
  
  expert: [
    // Template set 1: Complex adventure (9-16 words per page - complete thoughts)
    [
      "{name} began exploring the fascinating world of science and discovery",
      "Complex questions about nature and the universe seemed increasingly interesting and important",
      "A mysterious wise {animal} appeared unexpectedly offering guidance through unknown realms",
      "Together they carefully explored ancient mysteries hidden within the natural world",
      "{name} faced an important choice between personal desires and helping others",
      "The long challenging journey gradually revealed amazing truths about friendship and courage",
      "Through deep thinking and reflection {name} finally found lasting inner peace",
      "This transformative character growth completely changed {pronoun_possessive} understanding of life's principles",
      "Essential principles of kindness and balance became crystal clear to {name}",
      "{name} achieved a deeper understanding of friendship and {pronoun_possessive} purpose in life"
    ]
  ]
};

export const getEnhancedTemplate = (difficulty: string, templateIndex?: number): string[] => {
  const templates = ENHANCED_STORY_TEMPLATES[difficulty as keyof typeof ENHANCED_STORY_TEMPLATES] || ENHANCED_STORY_TEMPLATES.easy;
  
  if (templateIndex !== undefined && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  
  return templates[Math.floor(Math.random() * templates.length)];
};