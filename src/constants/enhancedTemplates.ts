// Enhanced template system with variations for anti-repetition
import type { DifficultyLevel, UserInfo } from "@/types";

// Template variation system
interface TemplateVariation {
  base: string;
  characters?: string[];
  settings?: string[];
  objects?: string[];
  actions?: string[];
}

// Character variations
const CHARACTERS = {
  animals: ['cat', 'dog', 'rabbit', 'bird', 'turtle', 'fish', 'hamster', 'frog'],
  fantasy: ['dragon', 'unicorn', 'fairy', 'wizard', 'knight', 'princess'],
  friends: ['friend', 'neighbor', 'classmate', 'teacher', 'cousin']
};

const SETTINGS = {
  nature: ['forest', 'garden', 'beach', 'mountain', 'river', 'meadow'],
  places: ['library', 'school', 'park', 'market', 'home', 'village'],
  magical: ['castle', 'cave', 'tower', 'palace', 'kingdom']
};

const OBJECTS = {
  treasures: ['treasure', 'gem', 'coin', 'key', 'map', 'book'],
  toys: ['ball', 'kite', 'puzzle', 'game', 'blocks'],
  magical: ['wand', 'crystal', 'potion', 'spell', 'charm']
};

const ACTIONS = {
  movement: ['runs', 'walks', 'jumps', 'climbs', 'flies', 'swims'],
  social: ['plays', 'talks', 'helps', 'shares', 'laughs', 'sings'],
  discovery: ['finds', 'discovers', 'explores', 'searches', 'learns']
};

// Enhanced template variations for each difficulty
export const ENHANCED_TEMPLATES: Record<DifficultyLevel, TemplateVariation[]> = {
  easy: [
    // Simple, repetitive, nature-focused patterns
    { base: "{name} sees a little {animal}.", characters: CHARACTERS.animals },
    { base: "The {animal} is very hungry.", characters: CHARACTERS.animals },
    { base: "{name} gives it some {food}.", },
    { base: "The {animal} eats and grows.", characters: CHARACTERS.animals },
    { base: "Now it feels much better.", },
    { base: "{name} and {animal} smile together.", characters: CHARACTERS.animals },
    
    // Gentle, soothing patterns
    { base: "In the quiet {setting}...", settings: SETTINGS.nature },
    { base: "Goodnight little {animal}, goodnight moon.", characters: CHARACTERS.animals },
    { base: "{name} whispers softly now.", },
    { base: "All is peaceful here.", },
    { base: "Sleep comes gently tonight.", },
    
    // Simple friendship patterns
    { base: "{name} meets a friend today.", },
    { base: "They play with a {object}.", objects: OBJECTS.toys },
    { base: "Sharing makes everyone happy.", },
    { base: "Friends help each other always.", },
    { base: "What a wonderful day together.", },
  ],

  medium: [
    // Cause and effect chain patterns
    { base: "If you give {name} a {object}, {pronoun} will want more.", objects: OBJECTS.toys },
    { base: "That will remind {name} of the time {pronoun} visited {setting}.", settings: SETTINGS.places },
    { base: "When {pronoun} thinks about {setting}, {pronoun} will want to go.", settings: SETTINGS.places },
    { base: "So {name} will pack a {object} for the journey.", objects: OBJECTS.treasures },
    { base: "On the way, {pronoun} will meet a friendly {animal}.", characters: CHARACTERS.animals },
    { base: "The {animal} will want to come along too.", characters: CHARACTERS.animals },
    { base: "Together they will discover something wonderful and magical.", },
    { base: "That discovery will remind them why friendships matter most.", },
    { base: "And chances are, it will all start again tomorrow.", },
    
    // Emotional, conversational patterns
    { base: "{name} was having a really difficult day today.", },
    { base: "'I do NOT want to!' {pronoun} said loudly.", },
    { base: "But then {animal} had a wonderful idea.", characters: CHARACTERS.animals },
    { base: "'What if we try it together?' asked {animal}.", characters: CHARACTERS.animals },
    { base: "{name} thought about it for a long moment.", },
    { base: "Sometimes trying new things is scary but fun.", },
    { base: "'OK, let's do it!' {name} said with excitement.", },
    { base: "And they both laughed until their sides hurt.", },
    { base: "That is what true friends do together.", },
  ],

  hard: [
    // Character-driven patterns with real emotions
    { base: "{name} loved living in the friendly neighborhood near {setting} where everyone knew each other.", settings: SETTINGS.places },
    { base: "Sometimes growing up meant facing problems that seemed too big to solve alone.", },
    { base: "When the neighborhood {animal} went missing, everyone was worried and searched everywhere.", characters: CHARACTERS.animals },
    { base: "{name} remembered seeing something important that others might have missed during the search.", },
    { base: "Speaking up required courage, especially when adults might not listen to a young person.", },
    { base: "But {name} knew that every voice matters when someone needs help finding their way.", },
    { base: "The search led to new friendships and showed how communities work together.", },
    { base: "Sometimes the best solutions come from unexpected places and unlikely heroes.", },
    { base: "{name} learned that being brave doesn't mean not feeling scared at all.", },
    { base: "True courage means doing the right thing even when your heart is beating fast.", },
    
    // Adventure with deeper themes
    { base: "The ancient {setting} held secrets that {name} had always wondered about completely.", settings: SETTINGS.magical },
    { base: "Local stories passed down through generations spoke of hidden wisdom waiting to be discovered.", },
    { base: "When {name} finally found the entrance, it required solving a puzzle about friendship.", },
    { base: "Inside, a wise {animal} guardian tested not knowledge but character and kindness.", characters: CHARACTERS.fantasy },
    { base: "Each challenge revealed that true wisdom comes from understanding others, not just facts.", },
    { base: "The greatest treasure wasn't gold or jewels but learning to see through others' eyes.", },
    { base: "Returning home, {name} realized that real adventures change how you see the world.", },
    { base: "Sharing these lessons with friends made the experience even more meaningful and special.", },
    { base: "From that day forward, {name} approached every person with curiosity and kindness.", },
    { base: "The adventure had transformed a curious young person into a wise and compassionate friend." }
  ],

  expert: [
    // Rich storytelling patterns with deeper themes
    { base: "{name} lived in a world where magical things happened to those who believed deeply enough.", },
    { base: "The old {setting} held stories within its walls, stories that whispered to those who listened carefully.", settings: SETTINGS.magical },
    { base: "On this particular day, when sunlight filtered through ancient windows, everything would change forever.", },
    { base: "A remarkable {animal} appeared, one who had been waiting decades for someone exactly like {name}.", characters: CHARACTERS.fantasy },
    { base: "Together they embarked on a journey that would test not just courage but the very meaning of compassion.", },
    { base: "Each step revealed that the most powerful magic comes from opening your heart to others.", },
    { base: "The adventure taught {name} that true heroes are those who choose love over fear consistently.", },
    { base: "Through trials and discoveries, {name} learned that every person carries their own unique light.", },
    { base: "The greatest transformation happened not in the magical realm but within {name}'s own heart.", },
    { base: "Returning home, {name} carried the wisdom that ordinary moments contain extraordinary possibilities when approached with wonder.", },
    
    // Complex character development
    { base: "The philosophical questions that had always puzzled {name} began to find answers through lived experience.", },
    { base: "Understanding others required not just intelligence but the willingness to see beyond surface appearances completely.", },
    { base: "When {name} encountered someone completely different, the first instinct was to judge rather than understand.", },
    { base: "But the wise {animal} companion gently showed that everyone carries invisible struggles and hidden strengths.", characters: CHARACTERS.animals },
    { base: "Learning to listen with both heart and mind opened doors to connections {name} never thought possible.", },
    { base: "The most profound lessons came not from books but from genuine relationships built with patience and care.", },
    { base: "Through helping others find their own path, {name} discovered that teaching and learning are inseparable gifts.", },
    { base: "The journey revealed that wisdom isn't about having answers but about asking better questions with humility.", },
    { base: "By story's end, {name} understood that the most important adventures happen in the space between hearts.", },
    { base: "True leadership emerged from serving others and creating space for everyone to shine their brightest light." }
  ]
};

/**
 * Generate template variations for maximum content diversity
 */
export function generateTemplateVariations(
  baseTemplates: TemplateVariation[],
  userInfo: UserInfo
): string[] {
  const variations = new Set<string>(); // Use Set to prevent duplicates
  
  baseTemplates.forEach(template => {
    // Base template
    variations.add(template.base);
    
    // Generate variations based on available options
    if (template.characters) {
      template.characters.forEach(character => {
        variations.add(template.base.replace(/{animal}/g, character));
      });
    }
    
    if (template.settings) {
      template.settings.forEach(setting => {
        variations.add(template.base.replace(/{setting}/g, setting));
      });
    }
    
    if (template.objects) {
      template.objects.forEach(object => {
        variations.add(template.base.replace(/{object}/g, object));
      });
    }
    
    if (template.actions) {
      template.actions.forEach(action => {
        variations.add(template.base.replace(/{action}/g, action));
      });
    }
  });
  
  return Array.from(variations);
}

/**
 * Get enhanced template pool for a difficulty level
 */
export function getEnhancedTemplatePool(
  difficulty: DifficultyLevel,
  userInfo: UserInfo
): string[] {
  const baseTemplates = ENHANCED_TEMPLATES[difficulty];
  const variations = generateTemplateVariations(baseTemplates, userInfo);
  
  console.log(`🎨 Generated ${variations.length} template variations for ${difficulty} level`);
  
  return variations;
}