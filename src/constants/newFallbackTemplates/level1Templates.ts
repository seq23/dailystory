// Level 1 Templates - Enhanced with proper word counts
// 2-3 sentences per page (40-60 words per scene)
// For ages 5-7, 1st-2nd grade reading level

export const LEVEL_1_TEMPLATES: string[][] = [
  [
    "{userName} discovers a magical garden behind their house. The flowers sparkle with rainbow colors in the bright sunlight.",
    "A tiny fairy appears from behind a rose bush. She waves her wand and makes the butterflies dance around {userName}.",
    "{userName} follows the fairy deeper into the garden. They find a crystal fountain with water that tastes like {favoriteFood}.",
    "The fairy shows {userName} how to make flower crowns. Together they create beautiful crowns from the magical blooms.",
    "{userName} promises to visit the fairy garden every day. The fairy gives them a special seed to plant at home."
  ],
  [
    "{userName} finds a treasure map in their attic. The map shows pictures of their neighborhood with X marks everywhere.",
    "Following the first clue, {userName} goes to the big oak tree. Hidden beneath the roots, they discover a small wooden box.",
    "Inside the box is a {favoriteColor} compass and another clue. The compass points toward the playground across the street.",
    "At the playground, {userName} digs near the swings. They find a bag of shiny marbles and chocolate coins wrapped in gold.",
    "{userName} realizes the real treasure was the fun adventure. They decide to make their own treasure hunt for friends."
  ],
  [
    "{userName} adopts a puppy from the animal shelter. The little {favoriteAnimal} has soft fur and loves to play fetch.",
    "Every morning, {userName} teaches the puppy new tricks. The puppy learns to sit, stay, and roll over for treats.",
    "During their daily walks, the puppy makes friends with other dogs. {userName} meets new neighbors who also love animals.",
    "The puppy gets into mischief by chewing shoes and digging holes. But {userName} loves their furry friend anyway.",
    "{userName} and the puppy become best friends forever. They have adventures together every single day."
  ],
  [
    "{userName} builds a fort in their backyard using old blankets. The fort has windows cut out and a special entrance flap.",
    "Inside the fort, {userName} creates a reading corner with pillows. They bring their favorite books and a flashlight for stories.",
    "Friends come over to see the amazing blanket fort. They all squeeze inside and tell spooky stories together.",
    "When it starts to rain, the fort keeps everyone dry. They make hot chocolate and watch the raindrops fall outside.",
    "{userName} decides to keep the fort up all summer. It becomes their special outdoor hideaway for quiet time."
  ],
  [
    "{userName} plants a small garden with their grandmother. They choose seeds for carrots, tomatoes, and pretty {favoriteColor} flowers.",
    "Every day, {userName} waters the garden with a small watering can. They watch for the first tiny green shoots to appear.",
    "Weeks pass and the plants grow tall and strong. The tomatoes turn red and the carrots grow big underground.",
    "{userName} harvests vegetables for a special family dinner. Grandmother helps them cook {favoriteFood} with fresh ingredients.",
    "The garden teaches {userName} about patience and care. They plan to grow an even bigger garden next year."
  ]
];

export function getLevel1Template(templateIndex?: number): string[] {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_1_TEMPLATES.length) {
    return [...LEVEL_1_TEMPLATES[templateIndex]];
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_1_TEMPLATES.length);
  return [...LEVEL_1_TEMPLATES[randomIndex]];
}

export function getLevel1TemplateCount(): number {
  return LEVEL_1_TEMPLATES.length;
}