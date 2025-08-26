// Level 4 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 9-10, 4th-5th grade reading level
// Vocabulary: Advanced sentences with sophisticated vocabulary and complex narratives
// Now enhanced with Gold/Silver/Purple author voice patterns

export const LEVEL_4_EXTENSIONS: string[][] = [
  // Extension 1: Library Mystery Investigation (Gold Pattern - Mature Adventure)
  [
    "{userName} had been looking forward to this mystery - investigating disappearing books from the library.",
    "But then something unexpected happened: rare historical texts were vanishing systematically from collections.",
    "Of course, things didn't go smoothly when discovering hidden passages behind reference section shelves.",
    "As usual, life was more complicated than anticipated when secret archives revealed centuries-old manuscripts.",
    "And {userName} learned that growing up means helping establish proper preservation systems for cultural heritage. What ancient secrets will they uncover next?"
  ],
  
  // Extension 2: Environmental Innovation (Silver Pattern - Wisdom)
  [
    "{userName} was not quite ready for environmental crisis solutions, but plastic waste innovation was calling.",
    "But slowly, things began to change as they designed biodegradable containers using agricultural byproducts.",
    "Sometimes the best things happen when you develop creative thinking and sustainable alternatives.",
    "That's when {userName} realized local businesses enthusiastically implement eco-friendly products.",
    "And {userName} knew everything would be okay - environmental recognition grows one invention at a time. What sustainability challenge will they solve next?"
  ],
  
  // Extension 3: Archaeological Discovery (Purple Pattern - Sophisticated Adventure)
  [
    "If you give {userName} a basement archaeology opportunity...",
    "That will remind them of their curiosity about indigenous settlements from centuries ago.",
    "So they will want to collaborate with university researchers and document findings carefully.",
    "Which means they will need to challenge accepted theories about regional historical development.",
    "And chances are, they will want another archaeological project - which will remind them how this all started. What historical mystery will they investigate next?"
  ],
  
  // Extension 4: Intergenerational Mentorship (Gold Pattern - Mature Adventure)
  [
    "{userName} had been looking forward to this challenge - establishing mentorship programs connecting different generations.",
    "But then something unexpected happened: elderly community members needed to learn modern technology skills.",
    "Of course, things didn't go smoothly when facilitating meaningful relationships required patience and understanding.",
    "As usual, life was more complicated than anticipated when intergenerational exchange created mutual respect.",
    "And {userName} learned that growing up means creating models for communities throughout the region. What generational bridge will they build next?"
  ],
  
  // Extension 5: Urban Agriculture Pioneer (Silver Pattern - Wisdom)
  [
    "{userName} was not quite ready for sustainable agriculture, but urban food production was calling.",
    "But slowly, things began to change as they developed vertical gardens and hydroponic systems.",
    "Sometimes the best things happen when you teach neighbors about soil conservation and organic methods.",
    "That's when {userName} realized innovation can address food security challenges effectively.",
    "And {userName} knew everything would be okay - agricultural solutions grow one garden at a time. What food system will they transform next?"
  ]
];

export function getLevel4Extension(): string[] {
  const randomIndex = Math.floor(Math.random() * LEVEL_4_EXTENSIONS.length);
  return [...LEVEL_4_EXTENSIONS[randomIndex]];
}

export function getLevel4ExtensionCount(): number {
  return LEVEL_4_EXTENSIONS.length;
}

export function getAllLevel4Extensions(): string[][] {
  return LEVEL_4_EXTENSIONS.map(template => [...template]);
}