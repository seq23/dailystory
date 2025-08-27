// Level 0 Extension Templates - Universal Access for All Users
// Enhanced templates following the improved Level 0 prompt specifications

// Universal Level 0 extension templates using enhanced prompt features:
// - Full personalization: {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies}, {specialRequest}
// - Varied sentence lengths: 2-4 words per sentence
// - Picture book focus with vivid imagery
// - 70% Enhanced Level 0 vocabulary compliance
// Each extension is a complete 5-page story template
export const LEVEL_0_EXTENSIONS: string[][] = [
  [
    "{userName} finds {favoriteColor} blocks.",
    "Big blocks everywhere!",
    "Stack them up high.",
    "Tower falls down!",
    "{userName} builds again. What will {userName} build next?"
  ],
  [
    "{userName} sees little {favoriteAnimal}.",
    "It runs fast.",
    "Come here, little friend!",
    "Pet the little fur.",
    "{userName} loves animals so. Who else will {userName} meet?"
  ],
  [
    "{userName} makes good {favoriteFood}.",
    "Mix and stir.",
    "Taste it now!",
    "So good!",
    "{userName} shares with friends. What will they eat next?"
  ],
  [
    "{userName} plays with water.",
    "Splash, splash, splash!",
    "Water is cool.",
    "Make big waves.",
    "{userName} loves water play. Where will {userName} play next?"
  ],
  [
    "{userName} reads picture books.",
    "Look at colors!",
    "Point to {favoriteAnimal}.",
    "Turn the page.",
    "{userName} loves story time. What story comes next?"
  ],
  [
    "{userName} finds {favoriteColor} toy.",
    "Pick it up!",
    "Play with toy.",
    "So much fun!",
    "{userName} wants more toys. What toy will appear?"
  ],
  [
    "{userName} hears {favoriteAnimal} sound.",
    "Look around!",
    "There it is!",
    "Wave hello!",
    "{userName} makes new friend. Who else is hiding?"
  ]
];

export function getLevel0Extension(): string[] {
  const randomIndex = Math.floor(Math.random() * LEVEL_0_EXTENSIONS.length);
  return LEVEL_0_EXTENSIONS[randomIndex];
}

export function getLevel0ExtensionCount(): number {
  return LEVEL_0_EXTENSIONS.length;
}

export function getAllLevel0Extensions(): string[][] {
  return LEVEL_0_EXTENSIONS;
}