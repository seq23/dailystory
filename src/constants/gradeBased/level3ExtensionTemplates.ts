// Level 3 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 8-9, 3rd-4th grade reading level
// Vocabulary: Complex sentences with advanced vocabulary and longer narratives
// Now enhanced with Purple/Silver/Blue author voice patterns

export const LEVEL_3_EXTENSIONS: string[][] = [
  // Extension 1: Neighborhood Cleanup Campaign (Purple Pattern - Adventure)
  [
    "If you give {userName} a neighborhood cleanup opportunity...",
    "That will remind them of their love for community and solving environmental problems.",
    "So they will want to create {favoriteColor} posters featuring {favoriteAnimal} and distribute them enthusiastically.",
    "Which means they will need to organize dozens of neighbors working together for change.",
    "And chances are, they will want another community project - but what environmental challenge will they tackle next?"
  ],
  
  // Extension 2: Injured Animal Rescue (Silver Pattern - Growing Up)
  [
    "{userName} was not quite ready for wildlife rescue, but the injured {favoriteAnimal} needed help.",
    "But slowly, things began to change as they carefully provided {favoriteFood} and called professionals.",
    "Sometimes the best things happen when you wait weeks for rehabilitation and recovery.",
    "That's when {userName} realized releasing the healthy {favoriteAnimal} felt like watching freedom soar.",
    "And {userName} knew everything would be okay - helping wildlife happens one rescue at a time. Which creature will need help next?"
  ],
  
  // Extension 3: Photography Hobby (Blue Pattern - Circularity)
  [
    "One day, {userName} was thinking about capturing {favoriteColor} sunsets, and that's when photography became fascinating.",
    "So {userName} explored different techniques for photographing {favoriteAnimal} in their natural habitat with patience.",
    "Naturally, the camera captured amazing details of {favoriteAnimal} behavior that eyes often miss completely.",
    "Before long, a {favoriteColor} sunrise photo featuring a {favoriteAnimal} won the school contest beautifully.",
    "And wouldn't you know it - that photography hobby proved practice creates beautiful art. What stunning scene will they capture next?"
  ],
  
  // Extension 4: Handmade Crafts Business (Purple Pattern - Adventure)
  [
    "If you give {userName} a small business opportunity involving {favoriteColor} crafts...",
    "That will remind them of their creativity with {favoriteAnimal}-themed friendship bracelets and painted bookmarks.",
    "So they will want to calculate costs, set prices, and manage inventory of {favoriteFood}-scented candles carefully.",
    "Which means they will need to appreciate quality while creating {specialRequest} inspired products for charities.",
    "And chances are, they will want another business venture - but what creative products will they design next?"
  ],
  
  // Extension 5: Astronomy and Stargazing (Silver Pattern - Growing Up)
  [
    "{userName} was not quite ready for complex science, but fascination with {favoriteColor} nebulae was calling.",
    "But slowly, things began to change as they learned constellation names and imagined {favoriteAnimal} shapes in star patterns.",
    "Sometimes the best things happen when you witness unforgettable meteor shower spectacles while eating {favoriteFood}.",
    "That's when {userName} realized the telescope reveals countless invisible stars above their {hobbies} dreams.",
    "And {userName} knew everything would be okay - dreams of space exploration grow one star at a time. What cosmic mystery will they explore next?"
  ],
  
  // Extension 6: Environmental Science Project
  [
    "When {userName} decided to study how {favoriteColor} pollution affects {favoriteAnimal} habitats...",
    "The research revealed that protecting wildlife requires understanding complex environmental systems.",
    "Through careful observation and data collection about {favoriteAnimal} behavior patterns...",
    "Their findings about {favoriteFood} waste impact on ecosystems impressed the science fair judges.",
    "This experience taught {userName} that environmental protection starts with individual responsibility. What conservation project will they lead next?"
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