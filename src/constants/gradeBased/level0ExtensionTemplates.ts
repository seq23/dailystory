// Level 0 Extension Templates - For Page Extensions Beyond Base Template
// Separated into Free (Dolch) and Premium (Enhanced) vocabulary tiers

// Free user extensions - strict Dolch Pre-Primer vocabulary (40 words)
// Each extension is a complete 5-page story template
export const LEVEL_0_FREE_EXTENSIONS: string[][] = [
  [
    "I see a big red ball.",
    "The ball can jump up and down.",
    "We play with the funny ball.",
    "Look where it will go.",
    "I run to find my ball."
  ],
  [
    "Here is a little blue bird.",
    "The bird can fly up high.",
    "It will come down to me.",
    "I help the bird find food.",
    "We are happy together."
  ],
  [
    "The funny dog is big.",
    "It can run and jump.",
    "I play with my dog.",
    "We go up the hill.",
    "My dog and I have fun."
  ],
  [
    "Look at the yellow sun.",
    "It is big and bright.",
    "The sun will help us see.",
    "We can play in the sun.",
    "I like the warm sun."
  ],
  [
    "I have three red apples.",
    "The apples are big and good.",
    "I can make apple pie.",
    "We will eat and be happy.",
    "Apples help us grow big."
  ]
];

// Premium user extensions - enhanced 75+ word vocabulary
// Each extension is a complete 5-page story template
export const LEVEL_0_PREMIUM_EXTENSIONS: string[][] = [
  [
    "I love to learn new words every day.",
    "Good books have nice stories for me.",
    "Reading helps me understand the world.",
    "Each page brings exciting knowledge.",
    "Learning makes me feel very proud."
  ],
  [
    "We work together as a happy family.",
    "This old house has many good things.",
    "Everyone helps with important tasks.",
    "Sharing love makes us feel warm.",
    "Our home is full of kindness."
  ],
  [
    "Time with friends makes me very happy.",
    "We laugh and play interesting games.",
    "Sometimes we explore new places.",
    "Friendship teaches us about caring.",
    "Good friends stay close forever."
  ],
  [
    "Some water is nice to drink today.",
    "Clean water keeps our bodies healthy.",
    "Plants need water to grow tall.",
    "Animals come to drink fresh water.",
    "Water is precious for all life."
  ],
  [
    "New and old toys are fun to play.",
    "Creative games help us learn skills.",
    "Building blocks teach us about shapes.",
    "Imagination makes simple toys exciting.",
    "Playing together brings us closer."
  ]
];

export function getLevel0Extension(isPremium: boolean = false): string[] {
  const extensions = isPremium ? LEVEL_0_PREMIUM_EXTENSIONS : LEVEL_0_FREE_EXTENSIONS;
  const randomIndex = Math.floor(Math.random() * extensions.length);
  return extensions[randomIndex];
}

export function getLevel0ExtensionCount(isPremium: boolean = false): number {
  return isPremium ? LEVEL_0_PREMIUM_EXTENSIONS.length : LEVEL_0_FREE_EXTENSIONS.length;
}