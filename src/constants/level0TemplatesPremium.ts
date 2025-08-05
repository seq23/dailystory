// Level 0 Premium Templates - Smart Template Mixing System
// Uses 60% first-person ("I") and 40% third-person with {userName} markers
// Enhanced 75+ Word Vocabulary: Dolch Pre-Primer + Fry's First 25 + Common Core + Head Start words
// Premium vocabulary: a, an, and, are, as, at, away, be, big, blue, can, come, 
// do, down, find, for, funny, get, go, has, have, he, help, here, i, in, is, it, 
// jump, little, look, make, me, my, new, not, of, old, on, one, play, red, run, 
// said, see, some, the, they, this, three, to, two, up, was, we, where, with, 
// yellow, you, book, good, house, love, nice, time, want, water, work, words

export const LEVEL_0_PREMIUM_TEMPLATES = [
  // Template 1 - Books with mixed perspective
  [
    "I have a new book.",
    "Books are good!",
    "{userName} loves books.",
    "I read books.",
    "Books make me happy."
  ],
  
  // Template 2 - Time with "I" emphasis
  [
    "I have time.",
    "Time to play!",
    "I love time to run.",
    "{userName} has good time.",
    "Time is nice."
  ],
  
  // Template 3 - House theme with personal connection
  [
    "I love my house.",
    "Nice house!",
    "I live in a house.",
    "{userName} has a good house.",
    "My house is nice."
  ],
  
  // Template 4 - Water with "I" focus
  [
    "I want water.",
    "Good water!",
    "I love water.",
    "{userName} drinks water.",
    "Water is good."
  ],
  
  // Template 5 - Work theme with personal touch
  [
    "I do work.",
    "Good work!",
    "I love to work.",
    "{userName} does good work.",
    "Work is nice."
  ],
  
  // Template 6 - Love and family with mixed perspective
  [
    "I love my family.",
    "Love is good!",
    "I have love.",
    "{userName} loves family.",
    "Love makes me happy."
  ],
  
  // Template 7 - Getting things with "I" emphasis
  [
    "I want to get books.",
    "Get water!",
    "I can get things.",
    "{userName} gets nice things.",
    "I get good books."
  ],
  
  // Template 8 - Being good with personal connection
  [
    "I want to be good.",
    "Be nice!",
    "I am good.",
    "{userName} is very good.",
    "Being good is nice."
  ],
  
  // Template 9 - Having things with mixed perspective
  [
    "I have some books.",
    "Have fun!",
    "I have good time.",
    "{userName} has nice toys.",
    "I have water."
  ],
  
  // Template 10 - This and that with "I" focus
  [
    "I like this book.",
    "This is nice!",
    "I see this.",
    "{userName} wants this toy.",
    "This is for me."
  ],
  
  // Template 11 - Places with mixed perspective
  [
    "I am at home.",
    "Look at!",
    "I play on grass.",
    "{userName} sits on chair.",
    "I am on the bed."
  ],
  
  // Template 12 - With friends with "I" emphasis
  [
    "I play with friends.",
    "Come with!",
    "I work with you.",
    "{userName} plays with toys.",
    "I read with family."
  ],
  
  // Template 13 - Past experiences with mixed perspective
  [
    "I was happy.",
    "Good time!",
    "I was playing.",
    "{userName} was at home.",
    "It was nice."
  ],
  
  // Template 14 - Articles with "I" focus
  [
    "I see an apple.",
    "An old book!",
    "I want an orange.",
    "{userName} has an elephant toy.",
    "I have an idea."
  ],
  
  // Template 15 - Some things with mixed perspective
  [
    "I want some water.",
    "Some books!",
    "I have some toys.",
    "{userName} reads some words.",
    "Some time is nice."
  ],
  
  // Template 16 - Actions with "I" emphasis
  [
    "I can do things.",
    "Do this!",
    "I do my work.",
    "{userName} does good things.",
    "I do what I love."
  ],
  
  // Template 17 - As concepts with mixed perspective
  [
    "I grow as I play.",
    "As we go!",
    "I learn as I read.",
    "{userName} runs as fast.",
    "As good as can be."
  ],
  
  // Template 18 - He stories with "I" focus
  [
    "I see he has books.",
    "He is nice!",
    "I play with him.",
    "{userName} knows he is good.",
    "He and I are friends."
  ],
  
  // Template 19 - Where questions with mixed perspective
  [
    "I ask where books are.",
    "Where is it?",
    "I see where to go.",
    "{userName} knows where home is.",
    "Where can I play?"
  ],
  
  // Template 20 - They stories with "I" emphasis
  [
    "I see they are good.",
    "They play!",
    "I work with them.",
    "{userName} helps they learn.",
    "They and I have fun."
  ]
];

export function getLevel0PremiumTemplate(templateIndex?: number): string[] {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_0_PREMIUM_TEMPLATES.length) {
    return [...LEVEL_0_PREMIUM_TEMPLATES[templateIndex]];
  }
  
  const randomIndex = Math.floor(Math.random() * LEVEL_0_PREMIUM_TEMPLATES.length);
  return [...LEVEL_0_PREMIUM_TEMPLATES[randomIndex]];
}

export function getLevel0PremiumTemplateCount(): number {
  return LEVEL_0_PREMIUM_TEMPLATES.length;
}

export function getLevel0PremiumTotalPages(): number {
  return LEVEL_0_PREMIUM_TEMPLATES.length * 5;
}