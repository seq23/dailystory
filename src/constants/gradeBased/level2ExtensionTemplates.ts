// Level 2 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 7-8, 2nd-3rd grade reading level
// Vocabulary: More complex sentences with compound words and descriptive language
// Now enhanced with Blue/Green/Orange author voice patterns

export const LEVEL_2_EXTENSIONS: string[][] = [
  // Extension 1: Treasure Map Adventure (Blue Pattern - Circularity)
  [
    "One day, {userName} was thinking about the basement, and that's when the old treasure map appeared.",
    "So {userName} followed the path through the neighborhood park with careful attention.",
    "Naturally, the clues led to a hidden cave filled with beautiful sparkling crystals.",
    "Before long, sharing the treasure with friends became the most exciting part.",
    "And wouldn't you know it - that treasure hunt created the best friendship memories."
  ],
  
  // Extension 2: Science Fair Project (Green Pattern - Nature/Growth)  
  [
    "It all started when {userName} wondered how plants grow in different conditions.",
    "Day by day, measuring and recording data became a daily routine.",
    "Little by little, the experiment showed that music helps plants grow faster.",
    "Step by step, the project developed into something truly special.",
    "In the end, {userName} won second place and felt very accomplished about growing knowledge."
  ],
  
  // Extension 3: Drama Club Adventure (Orange Pattern - Enthusiasm)
  [
    "Suddenly, {userName} discovered the drama club and everything became exciting!",
    "Amazingly, the play about brave knights and magical kingdoms sparked imagination!",
    "Surprisingly, practicing lines and learning stage movements felt natural and fun!",
    "Incredibly, opening night arrived and {userName} performed without forgetting anything!",
    "Wonderfully, the audience applauded loudly and {userName} felt proud and accomplished!"
  ],
  
  // Extension 4: Cooking with Grandmother (Blue Pattern - Circularity)
  [
    "One day, {userName} was thinking about baking, and that's when Grandmother offered cooking lessons.",
    "So {userName} learned to make homemade bread from scratch together.",
    "Naturally, kneading dough and shaping loaves became a wonderful shared activity.",
    "Before long, the kitchen smelled wonderful as fresh bread baked perfectly.",
    "And wouldn't you know it - that bread brought the whole family together for dinner."
  ],
  
  // Extension 5: Animal Shelter Helper (Green Pattern - Nature/Growth)
  [
    "It all started when {userName} wanted to help animals at the local shelter.",
    "Day by day, feeding, watering, and giving attention became important work.",
    "Little by little, playing with puppies and brushing cats gently brought joy.",
    "Step by step, one shy dog became friendly after {userName}'s patient care.",
    "In the end, {userName} felt happy knowing the animals were loved and cared for."
  ]
];

export function getLevel2Extension(): string[] {
  const randomIndex = Math.floor(Math.random() * LEVEL_2_EXTENSIONS.length);
  return [...LEVEL_2_EXTENSIONS[randomIndex]];
}

export function getLevel2ExtensionCount(): number {
  return LEVEL_2_EXTENSIONS.length;
}

export function getAllLevel2Extensions(): string[][] {
  return LEVEL_2_EXTENSIONS.map(template => [...template]);
}