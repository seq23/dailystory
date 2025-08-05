// Level 0 Extension Templates - For Page Extensions Beyond Base Template
// Separated into Free (Dolch) and Premium (Enhanced) vocabulary tiers

// Free user extensions - strict Dolch Pre-Primer vocabulary (40 words)
export const LEVEL_0_FREE_EXTENSIONS = [
  "I see the red bird.",
  "The ball is big and blue.",
  "We can play here together.",
  "Look at the funny dog.",
  "I go up to find it."
];

// Premium user extensions - enhanced 75+ word vocabulary
export const LEVEL_0_PREMIUM_EXTENSIONS = [
  "I love to learn new words every day.",
  "Good books have nice stories for me.",
  "We work together as a happy family.",
  "This old house has many good things.",
  "Time with friends makes me very happy.",
  "Some water is nice to drink today.",
  "They have books with interesting words.",
  "New and old toys are fun to play.",
  "We want to be good to others.",
  "Love and kindness make life better."
];

export function getLevel0Extension(isPremium: boolean = false): string {
  const extensions = isPremium ? LEVEL_0_PREMIUM_EXTENSIONS : LEVEL_0_FREE_EXTENSIONS;
  const randomIndex = Math.floor(Math.random() * extensions.length);
  return extensions[randomIndex];
}

export function getLevel0ExtensionCount(isPremium: boolean = false): number {
  return isPremium ? LEVEL_0_PREMIUM_EXTENSIONS.length : LEVEL_0_FREE_EXTENSIONS.length;
}