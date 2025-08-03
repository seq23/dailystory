// Enhanced story templates with intelligent user input distribution
export const ENHANCED_STORY_TEMPLATES = {
  easy: [
    // Template set 1: Adventure progression (3-6 words per page - complete thoughts)
    [
      "{name} wakes up early",
      "{pronoun} sees a {animal}",
      "The {animal} looks {color}",
      "{name} says hello nicely",
      "They become good friends",
      "{name} and {animal} play together",
      "They find some {food}",
      "{name} shares the {food}",
      "The {animal} is happy",
      "{name} smiles very happily"
    ],
    
    // Template set 2: Discovery story (3-6 words per page - complete thoughts)
    [
      "{name} goes to {setting}",
      "{pronoun} sees many things",
      "A {animal} runs by",
      "{name} follows the {animal}",
      "They find a {object}",
      "The {object} is {color}",
      "{name} picks it up",
      "The {animal} wants to play",
      "They play together happily",
      "{name} has lots of fun"
    ],
    
    // Template set 3: Helping story (3-6 words per page - complete thoughts)
    [
      "{name} meets a {primary_animal}",
      "The {primary_animal} looks sad",
      "It lost its {primary_food}",
      "{name} wants to help",
      "They look around everywhere",
      "{name} finds the {primary_food}",
      "It was under something",
      "{name} gives it back",
      "The {primary_animal} is happy",
      "They are good friends"
    ],
    
    // Template set 4: Sharing story (3-6 words per page - complete thoughts)
    [
      "{name} has a {primary_object}",
      "It is {pronoun_possessive} favorite toy",
      "A {friend_animal} wants to play",
      "{name} shares the {primary_object}",
      "They play together nicely",
      "The {friend_animal} is happy",
      "{name} feels very good",
      "Sharing makes good friends",
      "They play all day",
      "Both friends are very happy"
    ]
  ],
  
  medium: [
    // Template set 1: Magical adventure (5-9 words per page - complete thoughts)
    [
      "{name} discovers a magical {setting} today",
      "A wise {animal} lives there happily",
      "The {animal} can talk to {name}",
      "It tells {name} some secret words",
      "A hidden {object} waits for discovery",
      "It has very special magical powers",
      "{name} must find it very quickly",
      "They search through the {color} forest",
      "Together they overcome all the challenges",
      "This magical adventure teaches {name} about friendship"
    ],
    
    // Template set 2: Problem solving (5-9 words per page - complete thoughts)
    [
      "The {setting} has a very big problem",
      "All the {primary_animal}s are missing their {primary_food}",
      "{name} decides to help them right away",
      "{pronoun} meets a very helpful {secondary_animal}",
      "They work together as a great team",
      "The {secondary_animal} shows {name} a secret path",
      "They find where the {primary_food} is hidden",
      "A mischievous {friend_animal} took it for fun",
      "{name} explains why sharing is very important",
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