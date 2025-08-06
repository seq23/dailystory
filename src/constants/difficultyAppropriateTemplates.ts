// FIXED: Difficulty-Appropriate Story Templates with Proper Word Count Progression
// Easy: 3-6 words | Medium: 6-12 words | Hard: 10-18 words | Expert: 15-25 words
import { NameFormatter } from "@/utils/nameFormatter";
import type { UserInfo } from "@/types";
import { LEVEL_1_TEMPLATES } from "@/constants/gradeBased/level1Templates";
import { LEVEL_2_TEMPLATES } from "@/constants/gradeBased/level2Templates";
import { LEVEL_3_TEMPLATES } from "@/constants/gradeBased/level3Templates";
import { LEVEL_4_TEMPLATES } from "@/constants/gradeBased/level4Templates";

export const DIFFICULTY_APPROPRIATE_TEMPLATES = {
  beginner: [
    // Templates 1-40: 1-6 words per page - Level 0 vocabulary only (ages 3-5)
    ["{name} sees a {animal}.", "The {animal} is {color}.", "{name} likes it.", "They are friends."],
    ["{name} goes out.", "A {animal} comes.", "It wants to play.", "{name} plays too."],
    ["{name} finds a {object}.", "The {object} is {color}.", "{name} picks it up.", "Very nice {object}!"],
    ["{name} helps {animal}.", "The {animal} is sad.", "{name} gives it {food}.", "Now it is happy."],
    ["{name} runs fast.", "A {color} {animal} runs too.", "They race together.", "Fun times ahead!"],
    ["{name} eats {food}.", "It tastes very good.", "The {animal} wants some.", "{name} shares nicely."],
    ["{name} has a hat.", "The hat is {color}.", "A {animal} likes it.", "They play dress up."],
    ["{name} goes to bed.", "The moon is bright.", "A {animal} says goodnight.", "Sweet dreams {name}."],
    ["{name} plants a seed.", "The seed grows big.", "A {color} flower blooms.", "Very pretty flower!"],
    ["{name} rides a bike.", "The bike is {color}.", "A {animal} runs beside.", "They go fast together."],
    ["{name} draws a picture.", "The picture shows {animal}.", "It has {color} spots.", "Art is fun!"],
    ["{name} sings a song.", "The song is happy.", "A {animal} dances along.", "Music makes joy."],
    ["{name} builds with blocks.", "The tower grows tall.", "A {animal} helps too.", "Teamwork is best."],
    ["{name} reads a book.", "The book has pictures.", "A {animal} listens close.", "Stories are magic."],
    ["{name} plays in water.", "The water is cool.", "A {animal} splashes too.", "Summer fun time."],
    ["{name} picks up toys.", "The room gets clean.", "A {animal} helps organize.", "Good helpers everywhere."],
    ["{name} counts to ten.", "Numbers are everywhere.", "A {animal} counts too.", "Math is fun."],
    ["{name} makes a sandwich.", "It has good {food}.", "A {animal} wants some.", "Sharing is caring."],
    ["{name} waters flowers.", "The flowers are {color}.", "A {animal} watches close.", "Gardens grow beautiful."],
    ["{name} flies a kite.", "The kite is {color}.", "A {animal} chases shadows.", "Wind makes magic."],
    ["{name} hugs {animal}.", "Hugs feel very nice.", "They sit together close.", "Friends forever always."],
    ["{name} jumps high up.", "Jumping is so fun.", "A {animal} jumps too.", "Up and down!"],
    ["{name} looks at stars.", "Stars shine so bright.", "A {animal} looks up.", "Night sky magic."],
    ["{name} makes music.", "Music sounds very nice.", "A {animal} claps along.", "Rhythm is everywhere."],
    ["{name} climbs a tree.", "The tree is tall.", "A {animal} climbs too.", "High up adventure."],
    ["{name} finds a shell.", "The shell is {color}.", "A {animal} likes it.", "Beach treasures found."],
    ["{name} dances around.", "Dancing feels so good.", "A {animal} spins too.", "Movement brings joy."],
    ["{name} helps mom cook.", "Cooking smells very good.", "A {animal} watches close.", "Kitchen helpers busy."],
    ["{name} blows bubbles.", "Bubbles float up high.", "A {animal} pops them.", "Pop pop fun!"],
    ["{name} plays with clay.", "Clay feels soft nice.", "A {animal} helps shape.", "Art hands busy."],
    ["{name} watches clouds.", "Clouds have funny shapes.", "A {animal} sees them.", "Sky pictures change."],
    ["{name} picks berries.", "Berries taste so sweet.", "A {animal} eats some.", "Nature gives food."],
    ["{name} swings high up.", "Swinging feels like flying.", "A {animal} pushes swing.", "Friends help friends."],
    ["{name} makes a fort.", "The fort is cozy.", "A {animal} comes inside.", "Safe spaces together."],
    ["{name} throws a ball.", "The ball bounces high.", "A {animal} catches it.", "Games are fun."],
    ["{name} feeds the birds.", "Birds say thank you.", "A {animal} watches close.", "Kindness spreads joy."],
    ["{name} brushes teeth clean.", "Clean teeth feel nice.", "A {animal} brushes too.", "Healthy habits matter."],
    ["{name} puts on shoes.", "Shoes keep feet safe.", "A {animal} has paws.", "Ready for adventure."],
    ["{name} waves hello.", "Saying hello is nice.", "A {animal} waves back.", "Greetings bring smiles."],
    ["{name} goes to sleep.", "Sleep feels very nice.", "A {animal} sleeps too.", "Rest makes strength."]
  ],
  
  easy: LEVEL_1_TEMPLATES.map(template => 
    template.map(page => page.replace(/\{userName\}/g, "{name}"))
  ),
  medium: LEVEL_2_TEMPLATES.map(template => 
    template.map(page => page.replace(/\{userName\}/g, "{name}"))
  ),

  hard: LEVEL_3_TEMPLATES.map(template => 
    template.map(page => page.replace(/\{userName\}/g, "{name}"))
  ),

  expert: LEVEL_4_TEMPLATES.map(template => 
    template.map(page => page.replace(/\{userName\}/g, "{name}"))
  )
}
};

// Updated template selector that processes variables and enforces difficulty-appropriate word counts
export const getDifficultyAppropriateTemplate = (
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert',
  templateIndex?: number,
  userInfo?: UserInfo
): string[] => {
  const templates = DIFFICULTY_APPROPRIATE_TEMPLATES[difficulty];
  
  let selectedTemplate: string[];
  if (templateIndex !== undefined && templateIndex < templates.length) {
    selectedTemplate = templates[templateIndex];
  } else {
    selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  }
  
  // Process templates to replace variables if userInfo is provided
  if (userInfo) {
    return selectedTemplate.map(template => processTemplate(template, userInfo, difficulty));
  }
  
  return selectedTemplate;
};

// Template processing function that replaces all variables
const processTemplate = (template: string, userInfo: UserInfo, difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'): string => {
  let processed = template;
  
  // Replace user placeholders with properly capitalized name
  processed = processed.replace(/{name}/g, NameFormatter.capitalize(userInfo.name || 'Alex'));
  processed = processed.replace(/{pronoun}/g, 'they');
  processed = processed.replace(/{pronoun_possessive}/g, 'their');
  
  // Replace story elements with vocabulary appropriate for each difficulty level
  const animals = difficulty === 'beginner'
    ? ['cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'bee', 'bear', 'frog']
    : difficulty === 'easy'
    ? ['cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'hen', 'bee', 'bear', 'fox', 'frog']
    : difficulty === 'medium'
    ? ['cat', 'rabbit', 'owl', 'deer', 'fox', 'turtle', 'butterfly', 'bird', 'squirrel', 'mouse']
    : difficulty === 'hard'
    ? ['wolf', 'eagle', 'panther', 'raven', 'falcon', 'lynx', 'phoenix', 'dragon', 'griffin', 'sphinx']
    : ['phoenix', 'dragon', 'sphinx', 'leviathan', 'chimera', 'pegasus', 'unicorn', 'basilisk'];
    
  const colors = difficulty === 'beginner'
    ? ['red', 'blue', 'green', 'yellow']
    : difficulty === 'easy'
    ? ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown']
    : difficulty === 'medium'
    ? ['golden', 'silver', 'emerald', 'sapphire', 'crimson', 'violet', 'amber', 'turquoise']
    : difficulty === 'hard'
    ? ['iridescent', 'luminescent', 'opalescent', 'prismatic', 'chromatic', 'incandescent']
    : ['transcendent', 'ethereal', 'celestial', 'cosmic', 'infinite', 'multidimensional'];
    
  const objects = difficulty === 'beginner'
    ? ['ball', 'toy', 'book', 'car', 'cup', 'hat']
    : difficulty === 'easy'
    ? ['ball', 'book', 'toy', 'cake', 'hat', 'cup']
    : difficulty === 'medium'
    ? ['key', 'book', 'gem', 'flower', 'stone', 'shell', 'treasure', 'crown']
    : difficulty === 'hard'
    ? ['ancient relic', 'mystical artifact', 'enchanted scroll', 'crystal orb', 'magic amulet', 'sacred tome']
    : ['philosophical codex', 'temporal device', 'consciousness matrix', 'wisdom catalyst', 'enlightenment key'];
    
  const foods = difficulty === 'beginner'
    ? ['apple', 'milk', 'cake', 'food']
    : difficulty === 'easy'
    ? ['apple', 'bread', 'milk', 'cake', 'fish', 'meat']
    : difficulty === 'medium'
    ? ['berries', 'honey', 'nuts', 'fruits', 'vegetables', 'grain']
    : difficulty === 'hard'
    ? ['ambrosia', 'nectar', 'exotic fruits', 'mystical herbs', 'enchanted berries', 'magical essence']
    : ['ethereal nourishment', 'cosmic energy', 'spiritual sustenance', 'enlightenment food', 'transcendent nutrition'];
  
  // Use user preferences when available, otherwise random
  const animal = userInfo.favoriteAnimal || animals[Math.floor(Math.random() * animals.length)];
  const color = userInfo.favoriteColor || colors[Math.floor(Math.random() * colors.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];
  const food = userInfo.favoriteFood || foods[Math.floor(Math.random() * foods.length)];
  
  processed = processed.replace(/{animal}/g, animal);
  processed = processed.replace(/{color}/g, color);
  processed = processed.replace(/{object}/g, object);
  processed = processed.replace(/{food}/g, food);
  
  return processed;
};

// Flexible validation with margin of error to preserve natural story flow
export const validateDifficultyCompliance = (
  content: string,
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert',
  strictMode: boolean = false
): { 
  isValid: boolean; 
  wordCount: number; 
  expectedRange: { min: number; max: number };
  zone: 'green' | 'yellow' | 'red';
  marginOfError?: { min: number; max: number };
} => {
  const wordCount = content.split(/\s+/).filter(w => w.trim()).length;
  
  // Ideal ranges for each difficulty level
  const idealRanges = {
    beginner: { min: 1, max: 6 },
    easy: { min: 3, max: 6 },
    medium: { min: 6, max: 12 },
    hard: { min: 10, max: 18 },
    expert: { min: 15, max: 25 }
  };

  // Flexible ranges - sentence-based for levels 0-2, no limits for levels 3-4
  const flexibleRanges = {
    beginner: { min: 1, max: 6 },  // Strict for pre-readers - no flexibility
    easy: { min: 2, max: 12 },     // Expanded for complete sentences
    medium: { min: 4, max: 20 },   // Expanded for complete sentences  
    hard: { min: 0, max: 9999 },   // No validation - allow natural page breaks
    expert: { min: 0, max: 9999 }  // No validation - allow natural page breaks
  };
  
  const idealRange = idealRanges[difficulty];
  const flexibleRange = flexibleRanges[difficulty];
  
  // Determine validation zone
  let zone: 'green' | 'yellow' | 'red';
  let isValid: boolean;
  
  if (strictMode) {
    // Strict mode: only ideal range is valid
    isValid = wordCount >= idealRange.min && wordCount <= idealRange.max;
    zone = isValid ? 'green' : 'red';
  } else {
    // Flexible mode: tiered validation (sentence-based for beginner/easy/medium, no validation for hard/expert)
    if (difficulty === 'hard' || difficulty === 'expert') {
      // No word count validation for advanced levels
      zone = 'green';
      isValid = true;
    } else if (wordCount >= idealRange.min && wordCount <= idealRange.max) {
      zone = 'green';  // Perfect - within ideal range
      isValid = true;
    } else if (wordCount >= flexibleRange.min && wordCount <= flexibleRange.max) {
      zone = 'yellow'; // Acceptable with margin of error
      isValid = true;  // Still valid, just not ideal
    } else {
      zone = 'red';    // Too far outside acceptable range
      isValid = false;
    }
  }
  
  return {
    isValid,
    wordCount,
    expectedRange: idealRange,
    zone,
    marginOfError: strictMode ? undefined : flexibleRange
  };
};