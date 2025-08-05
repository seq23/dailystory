// Level 2 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 7-8, 2nd-3rd grade reading level
// Vocabulary: More complex sentences with compound words and descriptive language

export const LEVEL_2_EXTENSIONS: string[][] = [
  [
    "{userName} discovers an old treasure map in the basement.",
    "The map shows a path through the neighborhood park.",
    "{userName} follows the clues and finds a hidden cave.",
    "Inside the cave is a chest filled with beautiful crystals.",
    "{userName} decides to share the treasure with friends."
  ],
  [
    "{userName} enters a science fair at school this year.",
    "The project is about how plants grow in different conditions.",
    "{userName} carefully measures and records data every day.",
    "The experiment shows that music helps plants grow faster.",
    "{userName} wins second place and feels very accomplished."
  ],
  [
    "{userName} joins the school's drama club for the first time.",
    "The play is about brave knights and magical kingdoms.",
    "{userName} practices lines and learns stage movements.",
    "On opening night, {userName} performs without forgetting anything.",
    "The audience applauds loudly and {userName} feels proud."
  ],
  [
    "{userName} starts learning to cook with Grandmother.",
    "They make homemade bread from scratch together.",
    "{userName} learns to knead the dough and shape the loaves.",
    "The kitchen smells wonderful as the bread bakes.",
    "{userName} shares the warm bread with the whole family."
  ],
  [
    "{userName} volunteers to help at the local animal shelter.",
    "The animals need food, water, and lots of attention.",
    "{userName} plays with puppies and brushes the cats gently.",
    "One shy dog becomes friendly after {userName}'s patience.",
    "{userName} feels happy knowing the animals are cared for."
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