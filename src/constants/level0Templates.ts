// Ultra-simple templates for Reading Level 0 (ages 3-5)
// Maximum 6 words per page, complete sentences only

export const LEVEL_0_TEMPLATES = [
  // Template 1: Basic animal observation
  [
    "I see a cat.",
    "The cat is red.",
    "I like the cat.", 
    "We play together."
  ],
  
  // Template 2: Family activities
  [
    "Mom and I go.",
    "We see a dog.",
    "The dog runs fast.",
    "I run too."
  ],
  
  // Template 3: Simple play
  [
    "I play with ball.",
    "The ball is blue.",
    "It goes up high.",
    "I get the ball."
  ],
  
  // Template 4: Basic exploration
  [
    "I go to tree.",
    "A bird sits here.",
    "The bird is small.",
    "I say hello bird."
  ],
  
  // Template 5: Food and eating
  [
    "I eat an apple.",
    "The apple is good.",
    "Mom gives me milk.",
    "I say thank you."
  ],
  
  // Template 6: Simple emotions
  [
    "I am very happy.",
    "The sun is big.",
    "We play all day.",
    "Fun time together!"
  ],
  
  // Template 7: Basic helping
  [
    "Dad and I help.",
    "We see a cat.",
    "The cat looks sad.",
    "We give it food."
  ],
  
  // Template 8: Simple adventure
  [
    "I go see fish.",
    "The fish is blue.",
    "It swims very fast.",
    "I like the fish."
  ],
  
  // Template 9: Bedtime routine
  [
    "I get my book.",
    "Mom sits with me.",
    "We look at pictures.",
    "Good night, sleep well."
  ],
  
  // Template 10: Morning activities
  [
    "The sun comes up.",
    "I wake up happy.",
    "Dad gives me food.",
    "We start good day."
  ],
  
  // Template 11: Simple discovery
  [
    "I find a toy.",
    "The toy is yellow.",
    "It makes nice sounds.",
    "I play with it."
  ],
  
  // Template 12: Basic sharing
  [
    "I have two balls.",
    "You can have one.",
    "We play together nicely.",
    "Sharing is very good."
  ],
  
  // Template 13: Weather observation
  [
    "I look at sky.",
    "The sky is blue.",
    "Birds fly up high.",
    "Very nice day today."
  ],
  
  // Template 14: Simple transport
  [
    "I see a car.",
    "The car is red.",
    "It goes very fast.",
    "Cars help us go."
  ],
  
  // Template 15: Basic care
  [
    "Baby bird falls down.",
    "I help the bird.",
    "Mom shows me how.",
    "Bird flies away happy."
  ],
  
  // Template 16: Simple counting
  [
    "I see one duck.",
    "Here comes one more.",
    "Now I see two.",
    "Ducks swim together happily."
  ],
  
  // Template 17: Basic friendship
  [
    "I meet new friend.",
    "We say hi hello.",
    "We play with toys.",
    "Friends are very nice."
  ],
  
  // Template 18: Simple learning
  [
    "I look at book.",
    "Pictures are very pretty.",
    "Mom reads to me.",
    "Books help me learn."
  ],
  
  // Template 19: Basic garden
  [
    "I see pretty flowers.",
    "Flowers are many colors.",
    "Bee comes to flower.",
    "Bee is very busy."
  ],
  
  // Template 20: Simple celebration
  [
    "Today is good day.",
    "I am very happy.",
    "We eat yummy cake.",
    "Fun time with family."
  ]
];

export function getLevel0Template(templateIndex?: number): string[] {
  if (templateIndex !== undefined && templateIndex < LEVEL_0_TEMPLATES.length) {
    return LEVEL_0_TEMPLATES[templateIndex];
  }
  return LEVEL_0_TEMPLATES[Math.floor(Math.random() * LEVEL_0_TEMPLATES.length)];
}