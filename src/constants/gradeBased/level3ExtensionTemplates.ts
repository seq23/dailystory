// Level 3 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 8-9, 3rd-4th grade reading level
// Vocabulary: Complex sentences with advanced vocabulary and longer narratives

export const LEVEL_3_EXTENSIONS: string[][] = [
  [
    "{userName} organizes a neighborhood cleanup campaign this summer.",
    "The community has been struggling with litter problems lately.",
    "{userName} creates colorful posters and distributes them everywhere.",
    "Dozens of neighbors volunteer and work together enthusiastically.",
    "The neighborhood becomes beautiful again thanks to {userName}'s leadership."
  ],
  [
    "{userName} discovers an injured bird during morning walk.",
    "The bird's wing appears to be damaged from flying into something.",
    "{userName} carefully wraps the bird and calls wildlife rescue.",
    "After weeks of rehabilitation, the bird recovers completely.",
    "{userName} releases the healthy bird and watches it soar away."
  ],
  [
    "{userName} decides to learn photography as a new hobby.",
    "The camera captures amazing details that eyes often miss.",
    "{userName} explores different techniques like lighting and composition.",
    "A photo of sunrise over mountains wins the school contest.",
    "{userName} realizes that patience and practice create beautiful art."
  ],
  [
    "{userName} starts a small business selling handmade crafts.",
    "The products include friendship bracelets and painted bookmarks.",
    "{userName} calculates costs, sets prices, and manages inventory carefully.",
    "Customers appreciate the quality and creativity of each item.",
    "{userName} donates half the profits to local children's charities."
  ],
  [
    "{userName} becomes fascinated with astronomy and stargazing.",
    "The telescope reveals countless stars invisible to naked eyes.",
    "{userName} learns constellation names and planetary movements.",
    "A meteor shower provides an unforgettable nighttime spectacle.",
    "{userName} dreams of becoming an astronomer and exploring space."
  ]
];

export function getLevel3Extension(): string[] {
  const randomIndex = Math.floor(Math.random() * LEVEL_3_EXTENSIONS.length);
  return [...LEVEL_3_EXTENSIONS[randomIndex]];
}

export function getLevel3ExtensionCount(): number {
  return LEVEL_3_EXTENSIONS.length;
}

export function getAllLevel3Extensions(): string[][] {
  return LEVEL_3_EXTENSIONS.map(template => [...template]);
}