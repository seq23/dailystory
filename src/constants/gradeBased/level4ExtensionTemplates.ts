// Level 4 Extension Templates - Universal access for both free trial and premium users
// Grade Level: Ages 9-10, 4th-5th grade reading level
// Vocabulary: Advanced sentences with sophisticated vocabulary and complex narratives

export const LEVEL_4_EXTENSIONS: string[][] = [
  [
    "{userName} investigates mysterious disappearances of books from the library.",
    "The librarian mentions that rare historical texts have been vanishing systematically.",
    "{userName} discovers hidden passages behind the reference section's shelves.",
    "A secret underground archive reveals centuries-old manuscripts and documents.",
    "{userName} helps establish a proper preservation system for protecting cultural heritage."
  ],
  [
    "{userName} develops an innovative solution for reducing plastic waste.",
    "The environmental crisis requires creative thinking and sustainable alternatives.",
    "{userName} designs biodegradable containers using agricultural byproducts.",
    "Local businesses express enthusiasm about implementing these eco-friendly products.",
    "{userName}'s invention receives recognition from environmental organizations worldwide."
  ],
  [
    "{userName} uncovers evidence of historical significance in the basement.",
    "Archaeological artifacts suggest indigenous settlements existed here centuries ago.",
    "{userName} collaborates with university researchers to document the findings.",
    "The discovery challenges previously accepted theories about regional history.",
    "{userName} contributes to scholarship that honors indigenous cultural contributions."
  ],
  [
    "{userName} establishes a mentorship program connecting students across generations.",
    "Elderly community members share wisdom while learning modern technology.",
    "{userName} facilitates meaningful relationships that benefit everyone involved.",
    "The intergenerational exchange creates understanding and mutual respect.",
    "{userName}'s program becomes a model for communities throughout the region."
  ],
  [
    "{userName} pioneers sustainable agriculture techniques in urban environments.",
    "Vertical gardens and hydroponic systems maximize food production efficiency.",
    "{userName} teaches neighbors about soil conservation and organic farming methods.",
    "The initiative provides fresh vegetables while reducing transportation costs.",
    "{userName} demonstrates that innovation can address food security challenges."
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