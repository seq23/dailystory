// Level 2 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 7-8, 2nd-3rd grade reading level
// Vocabulary: More complex sentences with compound words and descriptive language
// Now enhanced with Blue/Green/Orange author voice patterns

export const LEVEL_2_EXTENSIONS: string[][] = [
  // Extension 1: Treasure Map Adventure (Blue Pattern - Circularity)
  [
    "One day, {userName} was thinking about adventure, and that's when the old treasure map appeared.",
    "So {userName} followed the path through the neighborhood park with careful attention.",
    "Naturally, the clues led to a hidden cave filled with beautiful {favoriteColor} crystals.",
    "Before long, sharing the treasure with friends became the most exciting part.",
    "And wouldn't you know it - that treasure hunt created the best friendship memories. What mystery will they solve next?"
  ],
  
  // Extension 2: Science Fair Project (Green Pattern - Nature/Growth)  
  [
    "It all started when {userName} wondered how {favoriteAnimal} behave in different conditions.",
    "Day by day, measuring and recording data became a daily routine.",
    "Little by little, the experiment showed that {favoriteFood} affects animal behavior.",
    "Step by step, the project developed into something truly special.",
    "In the end, {userName} won second place and felt very accomplished about growing knowledge. What will they discover next?"
  ],
  
  // Extension 3: Drama Club Adventure (Orange Pattern - Enthusiasm)
  [
    "Suddenly, {userName} discovered the drama club and everything became exciting!",
    "Amazingly, the play about brave knights and {favoriteColor} kingdoms sparked imagination!",
    "Surprisingly, practicing lines about {favoriteAnimal} characters felt natural and fun!",
    "Incredibly, opening night arrived and {userName} performed without forgetting anything!",
    "Wonderfully, the audience applauded loudly and {userName} felt proud and accomplished! What role will they play next?"
  ],
  
  // Extension 4: Cooking with Grandmother (Blue Pattern - Circularity)
  [
    "One day, {userName} was thinking about {favoriteFood}, and that's when Grandmother offered cooking lessons.",
    "So {userName} learned to make homemade {favoriteFood} from scratch together.",
    "Naturally, kneading dough and shaping loaves became a wonderful shared activity.",
    "Before long, the kitchen smelled wonderful as fresh {favoriteFood} baked perfectly.",
    "And wouldn't you know it - that {favoriteFood} brought the whole family together for dinner. What will they bake next?"
  ],
  
  // Extension 5: Animal Shelter Helper (Green Pattern - Nature/Growth)
  [
    "It all started when {userName} wanted to help {favoriteAnimal} at the local shelter.",
    "Day by day, feeding {favoriteFood} and giving attention became important work.",
    "Little by little, playing with puppies and brushing cats gently brought joy.",
    "Step by step, one shy {favoriteAnimal} became friendly after {userName}'s patient care.",
    "In the end, {userName} felt happy knowing the animals were loved and cared for. Which animal will need help next?"
  ],
  
  // Extension 6: Art Club Project
  [
    "When {userName} joined the art club, creating {favoriteColor} paintings became a passion.",
    "Every week, they learned new techniques for drawing {favoriteAnimal} realistically.",
    "The art teacher showed how mixing colors creates beautiful {favoriteColor} shades.",
    "At the art show, {userName}'s painting of a {favoriteAnimal} won first prize.",
    "Everyone admired {userName}'s creativity and dedication to improving their skills. What masterpiece will they create next?"
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