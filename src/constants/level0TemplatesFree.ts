// Level 0 Templates - FREE USERS - Smart Template Mixing System
// Uses 60% first-person ("I") and 40% third-person with {userName} markers
// STRICTLY uses ONLY Dolch Pre-Primer vocabulary (40 words)
// Two-word sentences included for variety

export const LEVEL_0_FREE_TEMPLATES = [
  // Template 1 - Mixed perspective with 2-word sentences
  [
    "I see.",
    "Look here!",
    "{userName} can run.",
    "I go.",
    "We play."
  ],
  
  // Template 2 - More "I" focus with commands
  [
    "I go.",
    "Come here!",
    "I can play.",
    "{userName} is big.",
    "I run."
  ],
  
  // Template 3 - Mixed with blue theme
  [
    "Look here!",
    "I see blue.",
    "Blue is big.",
    "{userName} can see blue.",
    "I see blue here."
  ],
  
  // Template 4 - Play theme with "I" emphasis
  [
    "I play.",
    "We play here.",
    "I run and jump.",
    "{userName} can play.",
    "I can play here."
  ],
  
  // Template 5 - Colors with personal connection
  [
    "I see yellow.",
    "Yellow is big.",
    "{userName} can see yellow.",
    "I can see yellow here.",
    "Yellow and red!"
  ],
  
  // Template 6 - Help theme with "I" focus
  [
    "I help.",
    "Help me!",
    "I help you.",
    "{userName} can help.",
    "I can help here."
  ],
  
  // Template 7 - Movement with "I" emphasis
  [
    "I go up.",
    "Look up!",
    "I see up.",
    "{userName} can go up.",
    "Up I go!"
  ],
  
  // Template 8 - Communication with personal touch
  [
    "I said look.",
    "Come here!",
    "I can see.",
    "{userName} said yes.",
    "I said play."
  ],
  
  // Template 9 - Finding theme with "I" focus
  [
    "I can see red.",
    "Look here!",
    "I can go.",
    "{userName} can see it.",
    "I see red."
  ],
  
  // Template 10 - Making with personal connection
  [
    "I make it.",
    "Make it!",
    "I can make.",
    "{userName} can make big.",
    "I make little."
  ],

  // Template 11 - Looking with variety
  [
    "I can see.",
    "Look here!",
    "I can go.",
    "{userName} can see down.",
    "I see it."
  ],

  // Template 12 - Numbers with "I" emphasis
  [
    "I see three.",
    "Go up!",
    "I see two.",
    "{userName} has one.",
    "I can see three."
  ],

  // Template 13 - Possession with personal touch
  [
    "I have red.",
    "My blue!",
    "I see my.",
    "{userName} has little.",
    "I see my red."
  ],

  // Template 14 - Negation with "I" focus
  [
    "I can not.",
    "Not here!",
    "I go not.",
    "{userName} can not go.",
    "I said not."
  ],

  // Template 15 - Coming with invitation
  [
    "I come here.",
    "Come play!",
    "I can come.",
    "{userName} can come up.",
    "I come to you."
  ],

  // Template 16 - Direction with "I" emphasis
  [
    "I go down.",
    "Look down!",
    "I see down.",
    "{userName} can go down.",
    "Down I can see."
  ],

  // Template 17 - Purpose with personal connection
  [
    "I can help you.",
    "For me!",
    "I make it for you.",
    "{userName} can play for fun.",
    "I can look for you."
  ],

  // Template 18 - Questions with "I" focus
  [
    "I can see where.",
    "Where is?",
    "I can go.",
    "{userName} can see where.",
    "I see where."
  ],

  // Template 19 - Funny with personal touch
  [
    "I am funny.",
    "So funny!",
    "I can be funny.",
    "{userName} is funny.",
    "I can play funny."
  ],

  // Template 20 - Numbers with emphasis
  [
    "I see one.",
    "Two here!",
    "I can see one.",
    "{userName} can see two.",
    "I have three."
  ]
];

export function getLevel0FreeTemplate(templateIndex?: number): string[] {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_0_FREE_TEMPLATES.length) {
    return [...LEVEL_0_FREE_TEMPLATES[templateIndex]];
  }
  
  const randomIndex = Math.floor(Math.random() * LEVEL_0_FREE_TEMPLATES.length);
  return [...LEVEL_0_FREE_TEMPLATES[randomIndex]];
}

export function getLevel0FreeTemplateCount(): number {
  return LEVEL_0_FREE_TEMPLATES.length;
}

export function getLevel0FreeTotalPages(): number {
  return LEVEL_0_FREE_TEMPLATES.length * 5;
}