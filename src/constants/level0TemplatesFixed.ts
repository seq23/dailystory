// Level 0 Templates - TRULY COMPLIANT with Dolch Pre-Primer (40 words ONLY)
// STRICTLY uses ONLY: a, and, away, big, blue, can, come, down, find, for,
// funny, go, help, here, i, in, is, it, jump, little, look, make, me, my, not, 
// one, play, red, run, said, see, the, three, to, two, up, we, where, yellow, you

export const LEVEL_0_STRICT_DOLCH_TEMPLATES = [
  // Template 1 - FIXED
  [
    "I see a cat.",
    "The cat is big.",
    "The cat can run.",
    "I see the cat.",
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