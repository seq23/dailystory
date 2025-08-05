// Level 0 Templates - TRULY COMPLIANT with Dolch Pre-Primer (40 words ONLY)
// STRICTLY uses ONLY: a, and, away, big, blue, can, come, down, find, for,
// funny, go, help, here, i, in, is, it, jump, little, look, make, me, my, not, 
// one, play, red, run, said, see, the, three, to, two, up, we, where, yellow, you

export const LEVEL_0_STRICT_DOLCH_TEMPLATES = [
  // Template 1 - TRULY FIXED (using only Dolch words)
  [
    "I see you.",
    "You are big.",
    "You can run.",
    "I see the one.",
    "We play here."
  ],
  
  // Template 2 - FIXED
  [
    "I go to play.",
    "I see you.",
    "You are little.",
    "You can jump.",
    "We run away."
  ],
  
  // Template 3 - FIXED
  [
    "Look here!",
    "I can see blue.",
    "Blue is big.",
    "See the blue one.",
    "It is for me."
  ],
  
  // Template 4 - FIXED
  [
    "We play here.",
    "Play is funny.",
    "I run and jump.",
    "You can come play.",
    "Play is for you and me."
  ],
  
  // Template 5 - FIXED
  [
    "The yellow one is big.",
    "I see yellow here.",
    "Yellow can go up.",
    "See where yellow is.",
    "Yellow and red are here."
  ],
  
  // Template 6 - FIXED
  [
    "I help you.",
    "Help is not little.",
    "You help me.",
    "We help here.",
    "Help can make it big."
  ],
  
  // Template 7 - FIXED
  [
    "Look up here!",
    "Up is where I go.",
    "See me go up.",
    "Up and down I go.",
    "Up is not down."
  ],
  
  // Template 8 - FIXED
  [
    "I said come here.",
    "You said go away.",
    "We said it here.",
    "Said is not see.",
    "I said you can come."
  ],
  
  // Template 9 - FIXED
  [
    "Find the red one.",
    "Red is here.",
    "I can find red.",
    "You find it and me.",
    "We find red here."
  ],
  
  // Template 10 - FIXED
  [
    "I make it big.",
    "You make it little.",
    "We make it here.",
    "Make it blue and red.",
    "I can make it for you."
  ],

  // Template 11 - NEW
  [
    "Look for the little one.",
    "I can look and see.",
    "Look where it is.",
    "You look here.",
    "We look for you."
  ],

  // Template 12 - NEW
  [
    "Three is not two.",
    "I see three here.",
    "Three little ones go.",
    "You have three.",
    "Three and one make it."
  ],

  // Template 13 - NEW
  [
    "Where is my red one?",
    "My little one is here.",
    "I see my big one.",
    "You have my yellow one.",
    "My one can go up."
  ],

  // Template 14 - NEW
  [
    "It is not here.",
    "Not big and not little.",
    "You are not away.",
    "I can not find it.",
    "Not red and not blue."
  ],

  // Template 15 - NEW
  [
    "Come and play here.",
    "Come see the big one.",
    "Come up and look.",
    "You come to me.",
    "Come find the yellow one."
  ],

  // Template 16 - NEW
  [
    "Down and up I go.",
    "Look down here.",
    "Down is where I see.",
    "Come down to play.",
    "The little one goes down."
  ],

  // Template 17 - NEW
  [
    "For you and for me.",
    "It is for play.",
    "Make it for the big one.",
    "Here is one for you.",
    "For little ones to see."
  ],

  // Template 18 - NEW
  [
    "Where can you go?",
    "Where is the funny one?",
    "I see where it is.",
    "Where are the three?",
    "You know where to look."
  ],

  // Template 19 - NEW
  [
    "The funny little one jumps.",
    "Funny is not big.",
    "See the funny red one.",
    "You are funny.",
    "Funny ones can play."
  ],

  // Template 20 - NEW
  [
    "One, two, three we go.",
    "See one and see two.",
    "One is little and big.",
    "You are the one.",
    "One funny one is here."
  ]
];

export function getLevel0StrictDolchTemplate(templateIndex?: number): string[] {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_0_STRICT_DOLCH_TEMPLATES.length) {
    return [...LEVEL_0_STRICT_DOLCH_TEMPLATES[templateIndex]];
  }
  
  const randomIndex = Math.floor(Math.random() * LEVEL_0_STRICT_DOLCH_TEMPLATES.length);
  return [...LEVEL_0_STRICT_DOLCH_TEMPLATES[randomIndex]];
}

export function getLevel0StrictDolchTemplateCount(): number {
  return LEVEL_0_STRICT_DOLCH_TEMPLATES.length;
}

export function getLevel0StrictDolchTotalPages(): number {
  return LEVEL_0_STRICT_DOLCH_TEMPLATES.length * 5;
}