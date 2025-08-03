// Enhanced story templates with intelligent user input distribution
export const ENHANCED_STORY_TEMPLATES = {
  easy: [
    // Template set 1: Adventure progression
    [
      "{name} wakes up {time_of_day}.",
      "{pronoun} sees a {primary_animal}.",
      "The {primary_animal} looks {primary_color}.",
      "{name} says hello.",
      "They become friends.",
      "{name} and the {primary_animal} play.",
      "They find a {primary_food}.",
      "{name} shares the {primary_food}.",
      "The {primary_animal} is happy.",
      "{name} smiles. The end."
    ],
    
    // Template set 2: Discovery story
    [
      "{name} goes to the {setting}.",
      "{pronoun} sees many things.",
      "A {secondary_animal} runs by.",
      "{name} follows {pronoun_object}.",
      "They find a {primary_object}.",
      "The {primary_object} is {secondary_color}.",
      "{name} picks it up.",
      "The {friend_animal} wants to play.",
      "They all play together.",
      "{name} has fun. The end."
    ],
    
    // Template set 3: Helping story
    [
      "{name} meets a {primary_animal}.",
      "The {primary_animal} looks sad.",
      "{pronoun} lost {pronoun_possessive} {primary_food}.",
      "{name} wants to help.",
      "They look around the {setting}.",
      "{name} finds the {primary_food}.",
      "It is under a {secondary_color} box.",
      "{name} gives it back.",
      "The {primary_animal} is happy.",
      "They are good friends now."
    ],
    
    // Template set 4: Sharing story  
    [
      "{name} has a {primary_object}.",
      "It is {pronoun_possessive} favorite toy.",
      "A {friend_animal} wants to play.",
      "{name} shares the {primary_object}.",
      "They play together.",
      "The {friend_animal} is very happy.",
      "{name} feels good inside.",
      "Sharing makes friends.",
      "They play all day.",
      "Both friends are happy."
    ]
  ],
  
  medium: [
    // Template set 1: Magical adventure
    [
      "{name} discovers a magical {setting}.",
      "A wise {primary_animal} lives there.",
      "The {primary_animal} can talk!",
      "{pronoun} tells {name} a secret.",
      "There is a hidden {primary_object}.",
      "It has special powers.",
      "{name} must find it.",
      "They search through the {secondary_color} forest.",
      "Together they overcome challenges.",
      "The magical adventure teaches {name} about {theme}."
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
    // Template set 1: Hero's journey
    [
      "{name} lived in a peaceful {setting}.",
      "One day, something strange happened.",
      "The {primary_animal}s started acting differently.",
      "{name} noticed they seemed scared.",
      "{pronoun} decided to investigate the mystery.",
      "With courage, {name} ventured into unknown territory.",
      "There, {pronoun} discovered the {antagonists} were causing trouble.",
      "{name} had to make a difficult choice.",
      "Using {pronoun_possessive} {skills}, {name} found a solution.",
      "The {setting} was peaceful again, and {name} had grown wiser."
    ]
  ],
  
  expert: [
    // Template set 1: Philosophical journey
    [
      "{name} began to question {belief_system}.",
      "The nature of {complex_concept} seemed unclear.",
      "A mysterious {primary_animal} appeared as a guide.",
      "Together, they explored {mysterious_element}.",
      "{name} faced {difficult_choice_1} versus {difficult_choice_2}.",
      "The journey revealed {profound_truth}.",
      "Through {self_discovery}, {name} found inner peace.",
      "{character_growth} transformed {pronoun_possessive} understanding.",
      "The {principle} became clear to {name}.",
      "{name} achieved {transcendent_understanding} of existence."
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