// Level 0 Extension Templates - For Page Extensions Beyond Base Template
// Separated into Free (Dolch) and Premium (Enhanced) vocabulary tiers

// Enhanced Level 0 vocabulary extensions following the beginner template prompt
// Each extension is a complete 5-page story template
export const LEVEL_0_FREE_EXTENSIONS: string[][] = [
  [
    "{userName} finds a big {favoriteColor} truck.",
    "The truck can carry many things.",
    "{userName} loads toys in the truck.",
    "Vroom, vroom goes the truck!",
    "{userName} drives the truck around town."
  ],
  [
    "{userName} sees a little fish swimming.",
    "The fish lives in clean water.",
    "Fish swim fast in the pond.",
    "{userName} watches fish swim by.",
    "Fish are fun animals to watch."
  ],
  [
    "{userName} can make a tall tower.",
    "The tower is made of blocks.",
    "{userName} puts blocks up high.",
    "Building towers takes good thinking.",
    "Look at {userName}'s amazing tower!"
  ],
  [
    "{userName} likes to hop like {favoriteAnimal}.",
    "Hopping is fun exercise to do.",
    "Hop, hop, hop around the yard.",
    "{userName} hops fast and slow.",
    "Hopping makes {userName} giggle loudly."
  ],
  [
    "{userName} helps cook yummy {favoriteFood}.",
    "Cooking together is lots of fun.",
    "{userName} stirs and mixes carefully.",
    "Good food makes everyone happy.",
    "{userName} is a great little helper."
  ]
];

// Enhanced Level 0 premium extensions with richer vocabulary
// Each extension is a complete 5-page story template  
export const LEVEL_0_PREMIUM_EXTENSIONS: string[][] = [
  [
    "{userName} discovers a magical {favoriteColor} garden.",
    "The garden has beautiful flowers everywhere.",
    "{userName} explores each wonderful path.",
    "Butterflies dance around pretty flowers.",
    "{userName} feels amazed by nature's beauty."
  ],
  [
    "{userName} creates art with bright colors.",
    "Painting pictures brings {userName} great joy.",
    "{userName} uses brushes to make shapes.",
    "Each artwork tells a special story.",
    "{userName} feels proud of creative work."
  ],
  [
    "{userName} learns about caring for animals.",
    "Animals need love and gentle treatment.",
    "{userName} feeds the hungry {favoriteAnimal}.",
    "Being kind to animals feels wonderful.",
    "{userName} becomes an animal's best friend."
  ],
  [
    "{userName} enjoys preparing healthy {favoriteFood}.",
    "Cooking teaches important life skills.",
    "{userName} measures ingredients very carefully.",
    "Sharing meals brings families together.",
    "{userName} feels accomplished after cooking successfully."
  ],
  [
    "{userName} explores the fascinating outdoor world.",
    "Nature offers countless learning opportunities.",
    "{userName} observes insects and small creatures.",
    "Every adventure teaches something new.",
    "{userName} develops curiosity about everything."
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