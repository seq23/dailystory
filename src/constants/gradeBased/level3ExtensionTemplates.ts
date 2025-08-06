// Level 3 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 8-9, 3rd-4th grade reading level
// Vocabulary: Complex sentences with advanced vocabulary and longer narratives
// Now enhanced with Purple/Silver/Blue author voice patterns

export const LEVEL_3_EXTENSIONS: string[][] = [
  // Extension 1: Neighborhood Cleanup Campaign (Purple Pattern - Adventure)
  [
    "If you give {userName} a neighborhood cleanup opportunity...",
    "That will remind them of their love for community and solving litter problems.",
    "So they will want to create colorful posters and distribute them everywhere enthusiastically.",
    "Which means they will need to organize dozens of neighbors working together.",
    "And chances are, they will want another community project - which will remind them how this all started."
  ],
  
  // Extension 2: Injured Bird Rescue (Silver Pattern - Growing Up)
  [
    "{userName} was not quite ready for wildlife rescue, but the injured bird needed help.",
    "But slowly, things began to change as they carefully wrapped the bird and called professionals.",
    "Sometimes the best things happen when you wait weeks for rehabilitation and recovery.",
    "That's when {userName} realized releasing the healthy bird felt like watching freedom soar.",
    "And {userName} knew everything would be okay - helping wildlife happens one rescue at a time."
  ],
  
  // Extension 3: Photography Hobby (Blue Pattern - Circularity)
  [
    "One day, {userName} was thinking about art, and that's when photography became fascinating.",
    "So {userName} explored different techniques like lighting and composition with patience.",
    "Naturally, the camera captured amazing details that eyes often miss completely.",
    "Before long, a sunrise mountain photo won the school contest beautifully.",
    "And wouldn't you know it - that photography hobby proved practice creates beautiful art."
  ],
  
  // Extension 4: Handmade Crafts Business (Purple Pattern - Adventure)
  [
    "If you give {userName} a small business opportunity...",
    "That will remind them of their creativity with friendship bracelets and painted bookmarks.",
    "So they will want to calculate costs, set prices, and manage inventory carefully.",
    "Which means they will need to appreciate quality and donate profits to charities.",
    "And chances are, they will want another business venture - which will remind them how this all started."
  ],
  
  // Extension 5: Astronomy and Stargazing (Silver Pattern - Growing Up)
  [
    "{userName} was not quite ready for complex science, but astronomy fascination was calling.",
    "But slowly, things began to change as they learned constellation names and planetary movements.",
    "Sometimes the best things happen when you witness unforgettable meteor shower spectacles.",
    "That's when {userName} realized the telescope reveals countless invisible stars above.",
    "And {userName} knew everything would be okay - dreams of space exploration grow one star at a time."
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