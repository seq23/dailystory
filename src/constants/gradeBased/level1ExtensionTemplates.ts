// Level 1 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 6-7, 1st-2nd grade reading level
// Vocabulary: Simple sentences with sight words and basic phonics

export const LEVEL_1_EXTENSIONS: string[][] = [
  [
    "{userName} finds a magic hat in the attic.",
    "The hat can make things appear and disappear.",
    "{userName} tries the hat and makes a {favoriteAnimal} appear.",
    "The {favoriteAnimal} hops around and makes {userName} laugh.",
    "Now {userName} and the {favoriteAnimal} are best friends. What magic will happen next?"
  ],
  [
    "{userName} plants seeds in the garden with Mom.",
    "Every day {userName} waters the seeds carefully.",
    "Soon tiny green plants start to grow.",
    "The plants get bigger and turn {favoriteColor} each week.",
    "{userName} is proud of the beautiful flowers. What will grow next season?"
  ],
  [
    "{userName} goes to the beach with the family.",
    "The sand is warm between {userName}'s toes.",
    "{userName} builds a tall {favoriteColor} castle with shells.",
    "The waves come close but don't wash it away.",
    "{userName} has the best day at the beach. What adventure awaits tomorrow?"
  ],
  [
    "{userName} learns to ride a bike today.",
    "Dad holds the back while {userName} pedals.",
    "Slowly Dad lets go and {userName} keeps going.",
    "{userName} rides all the way down the street.",
    "Everyone cheers for {userName}'s success. Where will {userName} ride next?"
  ],
  [
    "{userName} finds a lost {favoriteAnimal} in the park.",
    "The {favoriteAnimal} is small and looks very scared.",
    "{userName} gives the {favoriteAnimal} some {favoriteFood} and water.",
    "They put up signs to find the {favoriteAnimal}'s home.",
    "The owner comes and thanks {userName} for being kind. Who else needs help?"
  ],
  [
    "{userName} discovers a {favoriteColor} butterfly in the garden.",
    "The butterfly lands right on {userName}'s hand.",
    "{userName} follows it to a field of flowers.",
    "Many butterflies dance around {userName} happily.",
    "{userName} learns about nature's beauty. What other creatures will visit?"
  ],
  [
    "{userName} bakes {favoriteFood} with Grandma today.",
    "They mix and stir the ingredients together.",
    "The kitchen smells wonderful while it bakes.",
    "When it's ready, they share with the neighbors.",
    "{userName} feels proud of helping others. What will they cook next?"
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