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
    // Core friendship templates
    { base: "{name} sees a {animal}.", characters: CHARACTERS.animals },
    { base: "The {animal} is {color}.", characters: CHARACTERS.animals },
    { base: "{name} says hello to {animal}.", characters: CHARACTERS.animals },
    { base: "They play with a {object}.", objects: OBJECTS.toys },
    { base: "The {animal} {action} fast.", characters: CHARACTERS.animals, actions: ACTIONS.movement },
    { base: "{name} {action} too.", actions: ACTIONS.movement },
    { base: "They have fun together.", },
    { base: "{name} likes the {animal}.", characters: CHARACTERS.animals },
    { base: "They are good friends.", },
    { base: "{name} feels happy.", },

    // Discovery templates
    { base: "{name} goes to the {setting}.", settings: SETTINGS.nature },
    { base: "{pronoun} finds a {object}.", objects: OBJECTS.treasures },
    { base: "The {object} is very {color}.", objects: OBJECTS.treasures },
    { base: "{name} picks it up carefully.", },
    { base: "A {animal} comes over.", characters: CHARACTERS.animals },
    { base: "It wants the {object} too.", objects: OBJECTS.treasures },
    { base: "{name} decides to share.", },
    { base: "The {animal} looks happy.", characters: CHARACTERS.animals },
    { base: "They become best friends.", },
    { base: "Sharing makes everyone smile.", },

    // Helping templates
    { base: "{name} sees a sad {animal}.", characters: CHARACTERS.animals },
    { base: "The {animal} lost its {object}.", characters: CHARACTERS.animals, objects: OBJECTS.toys },
    { base: "{name} wants to help.", },
    { base: "They look everywhere together.", },
    { base: "{name} checks the {setting}.", settings: SETTINGS.places },
    { base: "The {object} is there!", objects: OBJECTS.toys },
    { base: "{name} gives it back.", },
    { base: "The {animal} jumps for joy.", characters: CHARACTERS.animals },
    { base: "Good friends always help.", },
    { base: "Everyone feels good inside.", },

    // Adventure templates
    { base: "{name} goes on an adventure.", },
    { base: "A friendly {animal} joins {name}.", characters: CHARACTERS.animals },
    { base: "They walk to the {setting}.", settings: SETTINGS.nature },
    { base: "Everything looks so pretty.", },
    { base: "They see a {object} shining.", objects: OBJECTS.treasures },
    { base: "The {object} sparkles in sunlight.", objects: OBJECTS.treasures },
    { base: "{name} touches it gently.", },
    { base: "Magic happens right away.", },
    { base: "The {setting} becomes even prettier.", settings: SETTINGS.nature },
    { base: "{name} smiles at the {animal}.", characters: CHARACTERS.animals },

    // Daily life templates
    { base: "{name} wakes up early.", },
    { base: "The sun is shining bright.", },
    { base: "{name} eats yummy {food}.", },
    { base: "A {animal} knocks on door.", characters: CHARACTERS.animals },
    { base: "They want to play outside.", },
    { base: "{name} runs to the {setting}.", settings: SETTINGS.places },
    { base: "They play games all day.", },
    { base: "The {animal} teaches new games.", characters: CHARACTERS.animals },
    { base: "{name} learns very quickly.", },
    { base: "Playing together is the best.", },

    // Learning templates
    { base: "{name} learns something new today.", },
    { base: "A wise {animal} shows {name}.", characters: CHARACTERS.animals },
    { base: "The lesson is about {object}s.", objects: OBJECTS.toys },
    { base: "{name} listens very carefully.", },
    { base: "Learning can be really fun.", },
    { base: "The {animal} is a good teacher.", characters: CHARACTERS.animals },
    { base: "{name} practices every day.", },
    { base: "Practice makes things easier.", },
    { base: "{name} gets better and better.", },
    { base: "Knowledge is a great treasure.", }
  ],

  medium: [
    // Magical adventure templates
    { base: "{name} discovers a magical {setting} filled with wonder.", settings: SETTINGS.magical },
    { base: "A mysterious {animal} appears near the ancient oak tree.", characters: CHARACTERS.fantasy },
    { base: "The {animal} has bright {color} scales that shimmer beautifully.", characters: CHARACTERS.fantasy },
    { base: "It leads {name} through a hidden doorway to adventure.", },
    { base: "There sits a glowing {object} pulsing with soft light.", objects: OBJECTS.magical },
    { base: "The {object} contains powerful magic from long ago.", objects: OBJECTS.magical },
    { base: "{name} carefully approaches the mysterious artifact with wonder.", },
    { base: "Suddenly the {setting} fills with beautiful music and light.", settings: SETTINGS.magical },
    { base: "The {animal} nods approvingly at {name}'s courage and kindness.", characters: CHARACTERS.fantasy },
    { base: "Together they dance as magic swirls around them joyfully.", },

    // Secret world templates
    { base: "{name} finds a secret door hidden behind old books.", },
    { base: "The heavy door creaks open revealing stairs going down.", },
    { base: "A curious {animal} follows {name} into the mysterious darkness.", characters: CHARACTERS.animals },
    { base: "They discover a room filled with glowing crystals everywhere.", },
    { base: "Each crystal makes different musical sounds when touched gently.", },
    { base: "The {animal} shows {name} how to create simple melodies.", characters: CHARACTERS.animals },
    { base: "Beautiful music echoes through the underground chamber walls softly.", },
    { base: "The crystals begin glowing brighter with each musical note.", },
    { base: "{name} learns that music has real magical powers here.", },
    { base: "They play together until stars appear in the sky.", },

    // Miniature world templates
    { base: "{name} discovers a tiny village hidden in the {setting}.", settings: SETTINGS.nature },
    { base: "Little people no bigger than {name}'s thumb live there peacefully.", },
    { base: "A brave {animal} guards the village from any danger.", characters: CHARACTERS.animals },
    { base: "The villagers invite {name} to join their harvest celebration.", },
    { base: "They share delicious {food} from their miniature gardens below.", },
    { base: "Everyone dances around a fire made of colorful flower petals.", },
    { base: "The {animal} tells exciting stories of adventure and friendship.", characters: CHARACTERS.animals },
    { base: "{name} promises to keep the village location completely secret.", },
    { base: "The little people give {name} a special friendship bracelet.", },
    { base: "Every full moon {name} returns to visit these friends.", },

    // Time travel templates
    { base: "{name} finds an ancient clock in the {setting}.", settings: SETTINGS.places },
    { base: "When the ornate hands move backward something incredible happens.", },
    { base: "The world shimmers and changes colors as time bends.", },
    { base: "{name} travels to a completely different time period.", },
    { base: "A helpful {animal} explains the rules of time travel.", characters: CHARACTERS.animals },
    { base: "To return home {name} must solve an important mystery.", },
    { base: "Working with people from the past proves challenging.", },
    { base: "{name} learns that all generations face similar problems.", },
    { base: "By helping others {name} gains the power to return.", },
    { base: "Back home {name} treasures the wisdom gained from history.", },

    // Invention templates
    { base: "{name} creates an amazing invention in the {setting}.", settings: SETTINGS.places },
    { base: "The device can talk to any {animal} in the world.", characters: CHARACTERS.animals },
    { base: "A wise {animal} becomes {name}'s first conversation partner.", characters: CHARACTERS.animals },
    { base: "They discuss important topics like friendship and kindness together.", },
    { base: "The {animal} shares secrets about nature and the environment.", characters: CHARACTERS.animals },
    { base: "{name} learns that all creatures have important wisdom.", },
    { base: "Together they work to solve problems in their community.", },
    { base: "Communication brings different species closer than ever before.", },
    { base: "The invention helps create peace between humans and animals.", },
    { base: "{name} becomes known as the great animal communicator." }
  ],

  hard: [
    // Epic adventure templates
    { base: "{name} lived peacefully in the beautiful {setting} with many wonderful friends from school.", settings: SETTINGS.places },
    { base: "One mysterious day something very strange happened that would change everything completely.", },
    { base: "The local {animal}s started acting differently and seemed quite frightened of something dangerous.", characters: CHARACTERS.animals },
    { base: "{name} noticed their unusual behavior and decided to investigate this puzzling mystery with determination.", },
    { base: "With great courage {name} ventured into unknown territory to find the source of trouble.", },
    { base: "There {pronoun} discovered some dark creatures causing serious problems everywhere they went.", },
    { base: "{name} had to make a very difficult choice about how to handle this situation.", },
    { base: "Using special abilities that had been developing slowly {name} found the perfect solution.", },
    { base: "The {setting} became peaceful again and {name} grew much wiser from this experience.", settings: SETTINGS.places },
    { base: "This challenging adventure taught {name} about courage perseverance and the power of determination.", },

    // Scientific discovery templates
    { base: "{name} discovered an ancient laboratory hidden deep in the {setting}'s basement.", settings: SETTINGS.places },
    { base: "Strange scientific equipment covered every surface creating an atmosphere of mystery and wonder.", },
    { base: "A brilliant {animal} scientist had left detailed research notes about time and space.", characters: CHARACTERS.animals },
    { base: "The experiments revealed fascinating secrets about how the universe actually works.", },
    { base: "{name} carefully studied each formula and equation with growing excitement and understanding.", },
    { base: "One particular experiment promised to unlock the mysteries of interdimensional travel itself.", },
    { base: "Working methodically {name} reconstructed the complex apparatus following the detailed scientific instructions.", },
    { base: "The successful activation opened doorways to parallel worlds filled with amazing possibilities.", },
    { base: "Each dimension taught {name} valuable lessons about science friendship and the nature of reality.", },
    { base: "Returning home {name} became dedicated to using science for helping others and making discoveries.", },

    // Leadership adventure templates
    { base: "{name} was chosen to lead an important expedition to the mysterious {setting} region.", settings: SETTINGS.nature },
    { base: "A team of brave {animal}s volunteered to join this dangerous but necessary mission.", characters: CHARACTERS.animals },
    { base: "Their goal was to establish peaceful contact with an isolated civilization there.", },
    { base: "The journey required careful planning navigation skills and tremendous courage from everyone involved.", },
    { base: "{name} had to make difficult decisions that would affect the safety of the team.", },
    { base: "Through diplomacy and understanding they successfully established friendly relationships with the inhabitants.", },
    { base: "The isolated people shared their ancient wisdom about living in harmony with nature.", },
    { base: "{name} learned that true leadership means serving others and putting their needs first.", },
    { base: "The successful mission opened new trade routes and cultural exchange between civilizations.", },
    { base: "This experience transformed {name} into a respected leader known for wisdom and compassion." }
  ],

  expert: [
    // Philosophical adventure templates
    { base: "{name} began exploring the fascinating complex world of philosophy and human understanding with tremendous intellectual curiosity.", },
    { base: "Profound questions about existence meaning and purpose seemed increasingly important as {name} continued learning more each day.", },
    { base: "A wise ancient {animal} appeared offering valuable guidance through unknown realms of knowledge and understanding.", characters: CHARACTERS.animals },
    { base: "Together they explored deep mysteries that had puzzled philosophers scientists and researchers for countless generations.", },
    { base: "{name} faced an extremely important choice between pursuing personal desires and dedicating time to serving others.", },
    { base: "The challenging journey gradually revealed amazing truths about friendship courage and the interconnectedness of existence.", },
    { base: "Through careful reflection and meaningful dialogue {name} found lasting inner peace and profound understanding.", },
    { base: "This transformative growth completely changed {pronoun_possessive} understanding of life's fundamental principles and purpose.", },
    { base: "Essential principles of kindness compassion and balance became crystal clear as the adventure reached its conclusion.", },
    { base: "{name} achieved deeper understanding of friendship and {pronoun_possessive} true purpose through this remarkable journey.", },

    // Scientific revolution templates
    { base: "{name} encountered a series of groundbreaking scientific discoveries that challenged conventional thinking completely.", },
    { base: "Each discovery led to deeper understanding about the nature of reality physics and the universe itself.", },
    { base: "An enlightened {animal} mentor provided wisdom gained through centuries of careful observation and experimentation.", characters: CHARACTERS.animals },
    { base: "They explored complex concepts of energy matter time and the intricate relationships between all things.", },
    { base: "{name} gradually understood that true knowledge comes from asking the right questions and remaining humble.", },
    { base: "The research revealed that collaboration and diverse perspectives strengthen understanding and accelerate discovery significantly.", },
    { base: "Through systematic methodology and careful analysis {name} developed innovative solutions to complex global challenges.", },
    { base: "Scientific breakthrough emerged from combining traditional wisdom with cutting-edge research and technological advancement.", },
    { base: "The discoveries culminated in {name} establishing research that would benefit future generations of scientists.", },
    { base: "Ultimately {name} learned that the greatest scientific advances come from maintaining curiosity and ethical responsibility." }
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