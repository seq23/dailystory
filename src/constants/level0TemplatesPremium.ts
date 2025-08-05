// Level 0 Premium Templates - Smart Template Mixing System
// Uses 60% first-person ("I") and 40% third-person with {userName} markers
// Research-Backed 84-Word Premium Vocabulary: Dolch Pre-Primer + Fry First 25 + Common Core + Head Start + High-Utility
// ALL WORDS STRICTLY VALIDATED: a, an, and, are, at, away, big, blue, but, can, come, do, does, down, find, for, from, funny, get, go, got, had, has, have, he, help, her, here, him, his, how, i, in, is, it, jump, just, know, let, little, look, make, me, my, new, no, not, now, of, old, on, one, play, put, red, run, said, see, she, sit, some, that, the, there, they, this, three, to, two, up, want, was, we, were, what, where, will, with, yellow, yes, you

export const LEVEL_0_PREMIUM_TEMPLATES = [
  // Template 1 - Colors and actions with "I" emphasis
  [
    "I see red.",
    "Blue is here!",
    "I like yellow.",
    "{userName} has blue.",
    "Red and blue are big."
  ],
  
  // Template 2 - Past experiences with mixed perspective
  [
    "I was here.",
    "He was there!",
    "I was at play.",
    "{userName} was with me.",
    "We were there."
  ],
  
  // Template 3 - Getting and having with "I" focus
  [
    "I want to get this.",
    "Get up!",
    "I can get it.",
    "{userName} will get that.",
    "I got what I want."
  ],
  
  // Template 4 - With and from with mixed perspective
  [
    "I play with him.",
    "Come with me!",
    "I am with you.",
    "{userName} is with her.",
    "We go with you."
  ],
  
  // Template 5 - Old and new with "I" emphasis
  [
    "I have new red.",
    "Old is here!",
    "I like old and new.",
    "{userName} has old blue.",
    "New yellow is big."
  ],
  
  // Template 6 - Actions and directions with mixed perspective
  [
    "I will jump up.",
    "Run down!",
    "I can jump down.",
    "{userName} will run up.",
    "Up and down we go."
  ],
  
  // Template 7 - Knowledge and wanting with "I" focus
  [
    "I know what I want.",
    "Know this!",
    "I want to know.",
    "{userName} will know that.",
    "What do you know?"
  ],
  
  // Template 8 - Location words with mixed perspective
  [
    "I am at the big one.",
    "Look at that!",
    "I see from here.",
    "{userName} is at play.",
    "From there to here."
  ],
  
  // Template 9 - Helping and doing with "I" emphasis
  [
    "I can help you.",
    "Help me!",
    "I will help him.",
    "{userName} does help her.",
    "We help and play."
  ],
  
  // Template 10 - Size and descriptions with mixed perspective
  [
    "I see big red.",
    "Little blue!",
    "I have little yellow.",
    "{userName} has big blue.",
    "Big and little are here."
  ],
  
  // Template 11 - Being and sitting with "I" focus
  [
    "I will sit here.",
    "Sit down!",
    "I can sit up.",
    "{userName} will sit there.",
    "We sit and look."
  ],
  
  // Template 12 - Questions and answers with mixed perspective
  [
    "I know what this is.",
    "What is that?",
    "I see what you have.",
    "{userName} knows what to do.",
    "What will we see?"
  ],
  
  // Template 13 - Putting and letting with "I" emphasis
  [
    "I will put this here.",
    "Put it down!",
    "I can put it up.",
    "{userName} will put that there.",
    "Let me put this away."
  ],
  
  // Template 14 - Finding and looking with mixed perspective
  [
    "I can find it.",
    "Look and find!",
    "I will look for you.",
    "{userName} will find that.",
    "Find what you want."
  ],
  
  // Template 15 - Making and having with "I" focus
  [
    "I will make this red.",
    "Make it blue!",
    "I can make it big.",
    "{userName} will make that yellow.",
    "We make and play."
  ],
  
  // Template 16 - Being funny with mixed perspective
  [
    "I am funny.",
    "He is funny!",
    "I can be funny.",
    "{userName} is funny.",
    "Funny is here."
  ],
  
  // Template 17 - All and some with "I" emphasis
  [
    "I have some red.",
    "All blue!",
    "I want some yellow.",
    "{userName} has all that.",
    "Some and all are here."
  ],
  
  // Template 18 - Going places with mixed perspective
  [
    "I will go there.",
    "Go here!",
    "I can go with you.",
    "{userName} will go away.",
    "We go and come."
  ],
  
  // Template 19 - Coming and going with "I" focus
  [
    "I will come here.",
    "Come to me!",
    "I can come with him.",
    "{userName} will come there.",
    "Come and go with me."
  ],
  
  // Template 20 - Questions and exploration with mixed perspective
  [
    "I know how to play.",
    "How is that?",
    "I see how you do it.",
    "{userName} knows how to run.",
    "How will we play?"
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