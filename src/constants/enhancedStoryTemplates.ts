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
    // Template set 1: Magical adventure (4-8 words per micro-page for TTS)
    [
      "{name} discovers magical {setting} today",
      "Wise {animal} lives there happily",
      "{animal} can talk to {name}",
      "{pronoun} tells {name} secret words",
      "Hidden {object} waits for discovery",
      "It has very special powers",
      "{name} must find it quickly",
      "They search through {color} forest",
      "Together they overcome all challenges",
      "Magical adventure teaches {name} about friendship"
    ],
    
    // Template set 2: Problem solving
    [
      "The {setting} has a big problem.",
      "All the {primary_animal}s are missing their {primary_food}.",
      "{name} decides to help.",
      "{pronoun} meets a helpful {secondary_animal}.",
      "They work together as a team.",
      "The {secondary_animal} shows {name} a secret path.",
      "They find where the {primary_food} is hidden.",
      "A mischievous {friend_animal} took it for fun.",
      "{name} explains why sharing is important.",
      "Everyone learns and becomes friends."
    ]
  ],
  
  hard: [
    // Template set 1: Hero's journey (6-12 words per micro-page for TTS)
    [
      "{name} lived peacefully in beautiful {setting} with friends",
      "One day something very strange and mysterious happened",
      "{animal}s started acting differently and seemed quite scared",
      "{name} noticed their fear and decided to help",
      "{pronoun} bravely decided to investigate this puzzling mystery",
      "With great courage {name} ventured into unknown territory",
      "There {pronoun} discovered {antagonist} creatures causing trouble everywhere",
      "{name} had to make a very difficult choice",
      "Using special {skill} abilities {name} found perfect solution",
      "{setting} became peaceful again and {name} grew wiser"
    ]
  ],
  
  expert: [
    // Template set 1: Philosophical journey (8-15 words per micro-page for TTS)
    [
      "{name} began questioning the fundamental nature of reality and existence",
      "Complex concepts about consciousness and time seemed increasingly unclear and puzzling",
      "Mysterious wise {animal} appeared unexpectedly offering guidance through unknown realms",
      "Together they carefully explored ancient mysteries hidden within cosmic dimensions",
      "{name} faced impossible choice between personal desires and universal responsibility",
      "Long challenging journey gradually revealed profound truths about interconnected consciousness",
      "Through deep self-discovery and reflection {name} finally found lasting inner peace",
      "Transformative character growth completely changed {pronoun_possessive} understanding of universal principles",
      "Essential principles of harmony and balance became crystal clear to {name}",
      "{name} achieved transcendent understanding of existence and cosmic purpose in life"
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