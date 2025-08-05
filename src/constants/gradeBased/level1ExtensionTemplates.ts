// Level 1 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 6-7, 1st-2nd grade reading level
// Vocabulary: Simple sentences with sight words and basic phonics

export const LEVEL_1_EXTENSIONS: string[][] = [
  [
    "{userName} finds a magic hat in the attic.",
    "The hat can make things appear and disappear.",
    "{userName} tries the hat and makes a rabbit appear.",
    "The rabbit hops around and makes {userName} laugh.",
    "Now {userName} and the rabbit are best friends."
  ],
  [
    "{userName} plants seeds in the garden with Mom.",
    "Every day {userName} waters the seeds carefully.",
    "Soon tiny green plants start to grow.",
    "The plants get bigger and bigger each week.",
    "{userName} is proud of the beautiful flowers."
  ],
  [
    "{userName} goes to the beach with the family.",
    "The sand is warm between {userName}'s toes.",
    "{userName} builds a tall castle with shells.",
    "The waves come close but don't wash it away.",
    "{userName} has the best day at the beach."
  ],
  [
    "{userName} learns to ride a bike today.",
    "Dad holds the back while {userName} pedals.",
    "Slowly Dad lets go and {userName} keeps going.",
    "{userName} rides all the way down the street.",
    "Everyone cheers for {userName}'s success."
  ],
  [
    "{userName} finds a lost kitten in the park.",
    "The kitten is small and looks very scared.",
    "{userName} gives the kitten some milk and food.",
    "They put up signs to find the kitten's home.",
    "The owner comes and thanks {userName} for being kind."
  ]
];

export function getLevel1Extension(): string[] {
  const randomIndex = Math.floor(Math.random() * LEVEL_1_EXTENSIONS.length);
  return [...LEVEL_1_EXTENSIONS[randomIndex]];
}

export function getLevel1ExtensionCount(): number {
  return LEVEL_1_EXTENSIONS.length;
}

export function getAllLevel1Extensions(): string[][] {
  return LEVEL_1_EXTENSIONS.map(template => [...template]);
}