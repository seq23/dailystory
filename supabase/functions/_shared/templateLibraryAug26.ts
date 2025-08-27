/**
 * Template Library Aug 26 - Dynamic Template Loading System
 * Converted from complex StoryTemplate objects to simple string arrays for edge function efficiency
 * 
 * This file contains all Level 1-4 and Grade 6-10 templates as string arrays.
 * Level 0 templates remain in their original shared files.
 */

// ===== LEVEL 1 TEMPLATES (Ages 5-7) =====
export const LEVEL_1_STRING_TEMPLATES: string[][] = [
  // The Magical Garden Discovery
  [
    "{userName} discovers a magical garden behind their house. The flowers sparkle with rainbow colors in the bright sunlight.",
    "A tiny fairy appears from behind a rose bush. She waves her wand and makes the butterflies dance around {userName}.",
    "{userName} follows the fairy deeper into the garden. They find a crystal fountain with water that tastes like {favoriteFood}.",
    "The fairy shows {userName} how to make flower crowns. Together they create beautiful crowns from the magical blooms.",
    "As the sun sets, the fairy gives {userName} a special seed. She promises it will grow into something wonderful.",
    "Back home, {userName} plants the seed and dreams of their magical garden adventure."
  ],
  // The Friendly Dragon
  [
    "{userName} meets a small, friendly dragon in the woods. The dragon has {favoriteColor} scales that shimmer in the sunlight.",
    "The dragon is sad because it cannot fly. {userName} offers to help by finding magic flying powder.",
    "Together they search the forest and find sparkly dust near a rainbow waterfall.",
    "The dragon sprinkles the magic dust on its wings and begins to float gently in the air.",
    "{userName} climbs on the dragon's back for a short, safe flight above the treetops.",
    "They become best friends and promise to meet every day for new adventures."
  ],
  // The Magic Paintbrush
  [
    "{userName} finds an old paintbrush in grandma's attic. When they dip it in water, it glows with {favoriteColor} light.",
    "Everything {userName} paints with the brush comes to life! They paint a butterfly that flies around the room.",
    "{userName} paints a tree that grows real {favoriteFood} for a snack. The magic is amazing but also a little scary.",
    "When {userName} accidentally paints rain clouds, real rain starts falling inside the house!",
    "Grandma helps {userName} paint sunshine to dry everything up. She smiles and says the brush is very special.",
    "Together they decide to use the magic paintbrush only for good things that make people happy."
  ]
];

export function getLevel1Templates(): string[][] {
  return LEVEL_1_STRING_TEMPLATES;
}

export function getLevel1Template(index?: number): string[] {
  if (index !== undefined && index >= 0 && index < LEVEL_1_STRING_TEMPLATES.length) {
    return LEVEL_1_STRING_TEMPLATES[index];
  }
  return LEVEL_1_STRING_TEMPLATES[Math.floor(Math.random() * LEVEL_1_STRING_TEMPLATES.length)];
}

export function getLevel1TemplateCount(): number {
  return LEVEL_1_STRING_TEMPLATES.length;
}

// ===== LEVEL 2 TEMPLATES (Ages 6-8) =====
export const LEVEL_2_STRING_TEMPLATES: string[][] = [
  // The Time Travel Backpack
  [
    "{userName} discovers their school backpack can travel through time when they say magic words. Today they want to visit the dinosaurs.",
    "The backpack glows {favoriteColor} and suddenly {userName} is in a prehistoric jungle with giant ferns and strange sounds.",
    "A friendly baby dinosaur approaches {userName}. It's hungry and {userName} shares their {favoriteFood} lunch.",
    "The baby dinosaur's family arrives, but they're gentle giants who just want to say thank you for the kindness.",
    "{userName} learns that dinosaurs were caring creatures who loved their families, just like people do today.",
    "When it's time to go home, {userName} promises to visit again and waves goodbye to their new dinosaur friends."
  ],
  // The Cloud Walker
  [
    "{userName} discovers they can walk on clouds when wearing grandpa's special boots. The sky becomes their playground.",
    "Up in the clouds, {userName} meets the Wind Keeper, who controls all the weather with a {favoriteColor} whistle.",
    "The Wind Keeper is tired and asks {userName} to help deliver gentle breezes to gardens that need them.",
    "Flying from cloud to cloud, {userName} learns how rain, snow, and sunshine all work together to help plants grow.",
    "As a thank you, the Wind Keeper lets {userName} slide down a rainbow and gives them a small cloud to keep.",
    "Back on the ground, {userName} keeps the little cloud as a friend and remembers their sky adventure."
  ],
  // The Library of Living Stories
  [
    "{userName} finds a secret door in the library that leads to a room where storybook characters live when not being read.",
    "The characters are preparing for the Annual Story Festival, but they need {userName}'s help to make it special.",
    "Together with fairy tale heroes and talking animals, {userName} helps decorate with {favoriteColor} streamers and magical lights.",
    "During the festival, {userName} gets to be the guest of honor and even gets to add their own chapter to a famous story.",
    "The characters thank {userName} by giving them a special bookmark that glows whenever they open any book.",
    "From that day on, every story {userName} reads feels like a personal adventure with old friends."
  ]
];

export function getLevel2Templates(): string[][] {
  return LEVEL_2_STRING_TEMPLATES;
}

export function getLevel2Template(index?: number): string[] {
  if (index !== undefined && index >= 0 && index < LEVEL_2_STRING_TEMPLATES.length) {
    return LEVEL_2_STRING_TEMPLATES[index];
  }
  return LEVEL_2_STRING_TEMPLATES[Math.floor(Math.random() * LEVEL_2_STRING_TEMPLATES.length)];
}

export function getLevel2TemplateCount(): number {
  return LEVEL_2_STRING_TEMPLATES.length;
}

// ===== LEVEL 3 TEMPLATES (Ages 8-10) =====
export const LEVEL_3_STRING_TEMPLATES: string[][] = [
  // The Inventor's Workshop
  [
    "{userName} inherits a mysterious workshop from a great-aunt who was a famous inventor. The place is filled with half-finished contraptions.",
    "While exploring, {userName} discovers blueprints for a machine that can turn thoughts into reality, but it needs a {favoriteColor} crystal to work.",
    "The search for the crystal leads {userName} on an adventure through the town, meeting eccentric characters who each have clues.",
    "When {userName} finally finds the crystal and powers the machine, their first thought creates a helper robot that loves {favoriteFood}.",
    "Together, {userName} and the robot use the invention to help solve problems around town, from fixing broken playground equipment to helping lost pets find their homes.",
    "The experience teaches {userName} that the best inventions are those that help others, and they decide to become an inventor like their great-aunt."
  ],
  // The Dream Cartographer
  [
    "{userName} discovers they have the ability to map and explore other people's dreams, becoming a Dream Cartographer in a world of sleeping minds.",
    "Their first assignment is to help a classmate who's been having nightmares about a {favoriteColor} monster that steals homework.",
    "Inside the dream, {userName} realizes the monster is actually just scared and lonely, wanting friends but not knowing how to ask.",
    "Using creativity and kindness, {userName} helps transform the nightmare into a dream about friendship, where the monster becomes a helpful study buddy.",
    "Word spreads about {userName}'s gift, and soon children from around the world are asking for help with their dreams.",
    "As the official Dream Cartographer, {userName} learns that most scary dreams are just confused feelings that need understanding and friendship."
  ],
  // The Guardian of Forgotten Things
  [
    "{userName} stumbles upon a hidden realm where all lost and forgotten things go - from missing socks to childhood memories.",
    "The Guardian of this realm is retiring and needs {userName} to take over the important job of caring for forgotten treasures.",
    "While learning the role, {userName} discovers that some forgotten things desperately want to return to their owners, especially a {favoriteColor} teddy bear.",
    "The quest to return the teddy bear leads {userName} through different dimensions of memory and loss, meeting others who miss their forgotten treasures.",
    "When {userName} successfully reunites the teddy bear with its owner - now a grown-up who thought it was lost forever - they realize the true power of their role.",
    "As the new Guardian, {userName} makes it their mission to return forgotten things to people who need them most, spreading joy and healing old wounds."
  ]
];

export function getLevel3Templates(): string[][] {
  return LEVEL_3_STRING_TEMPLATES;
}

export function getLevel3Template(index?: number): string[] {
  if (index !== undefined && index >= 0 && index < LEVEL_3_STRING_TEMPLATES.length) {
    return LEVEL_3_STRING_TEMPLATES[index];
  }
  return LEVEL_3_STRING_TEMPLATES[Math.floor(Math.random() * LEVEL_3_STRING_TEMPLATES.length)];
}

export function getLevel3TemplateCount(): number {
  return LEVEL_3_STRING_TEMPLATES.length;
}

// ===== LEVEL 4 TEMPLATES (Ages 10-12) =====
export const LEVEL_4_STRING_TEMPLATES: string[][] = [
  // The Emotion Archaeologist
  [
    "{userName} discovers they can excavate and examine old emotions that have been buried in a mysterious underground city of feelings.",
    "As an Emotion Archaeologist, {userName} uses special tools to carefully uncover ancient happiness, sadness, anger, and fear that belonged to people from long ago.",
    "Their first major dig reveals a {favoriteColor} crystal containing the pure joy of a child who lived 100 years ago and loved {favoriteFood}.",
    "When {userName} touches the crystal, they experience the child's memories and realize that emotions connect all people across time and space.",
    "The discovery leads to the establishment of the Museum of Human Feelings, where {userName} curates exhibits that help visitors understand their own emotions.",
    "Through their work, {userName} learns that every emotion has value and purpose, and that understanding feelings from the past helps create a better future."
  ],
  // The Reality Programmer
  [
    "{userName} learns that reality works like a computer program, and certain people called Reality Programmers can write code to fix glitches in the world.",
    "When {userName} notices that their neighborhood has a glitch where {favoriteColor} objects keep disappearing, they decide to investigate.",
    "Using a special keyboard that types in the language of existence, {userName} begins to debug the reality code and discovers the source of the problem.",
    "The glitch was caused by someone's sad emotions creating a void that swallows happy memories, including memories of {favoriteColor} things.",
    "{userName} writes a patch that transforms the sadness into understanding and compassion, restoring the missing objects and memories.",
    "As a certified Reality Programmer, {userName} dedicates themselves to fixing emotional glitches in the world, helping people debug their own lives with kindness and logic."
  ]
];

export function getLevel4Templates(): string[][] {
  return LEVEL_4_STRING_TEMPLATES;
}

export function getLevel4Template(index?: number): string[] {
  if (index !== undefined && index >= 0 && index < LEVEL_4_STRING_TEMPLATES.length) {
    return LEVEL_4_STRING_TEMPLATES[index];
  }
  return LEVEL_4_STRING_TEMPLATES[Math.floor(Math.random() * LEVEL_4_STRING_TEMPLATES.length)];
}

export function getLevel4TemplateCount(): number {
  return LEVEL_4_STRING_TEMPLATES.length;
}

// ===== GRADE 6 TEMPLATES (Ages 11-12) =====
export const GRADE_6_STRING_TEMPLATES: string[][] = [
  // The Quantum Student
  [
    "{userName} discovers they can exist in multiple parallel universes simultaneously while attending sixth grade.",
    "In Universe A, {userName} is the class president. In Universe B, they're the star of the school play. In Universe C, they're the science fair champion.",
    "The problem starts when memories from different universes begin to bleed through, creating confusion about which life is 'real'.",
    "When {userName} realizes that a classmate in Universe B is being bullied, they decide to use their quantum abilities to help.",
    "By carefully coordinating actions across multiple universes, {userName} creates a ripple effect that builds the classmate's confidence in all realities.",
    "The experience teaches {userName} that every choice creates new possibilities, and that kindness in one universe strengthens it in all others.",
    "With their new understanding, {userName} learns to navigate their quantum existence while staying true to their core values across all universes.",
    "The story ends with {userName} helping other quantum students learn to manage their abilities responsibly."
  ],
  // The Memory Merchant
  [
    "{userName} discovers an underground market where people trade memories like currency, and happy memories are worth more than gold.",
    "When {userName}'s grandmother starts forgetting important family moments, they decide to visit the Memory Merchant to buy back her lost memories.",
    "The Memory Merchant explains that memories can't be stolen - only willingly traded - and that {userName}'s grandmother traded hers for something important.",
    "Through investigation, {userName} learns that their grandmother traded her memories of {favoriteFood} and {favoriteColor} things to give a lonely child beautiful dreams.",
    "Inspired by their grandmother's sacrifice, {userName} decides to trade some of their own happy memories to help restore what their grandmother lost.",
    "However, the Memory Merchant reveals that the greatest memories are created through love and sacrifice, not bought and sold.",
    "Together with their grandmother, {userName} creates new memories that are even more precious than the old ones.",
    "The story concludes with {userName} becoming an apprentice Memory Merchant, helping people understand the true value of their experiences."
  ]
];

export function getGrade6Templates(): string[][] {
  return GRADE_6_STRING_TEMPLATES;
}

export function getGrade6Template(index?: number): string[] {
  if (index !== undefined && index >= 0 && index < GRADE_6_STRING_TEMPLATES.length) {
    return GRADE_6_STRING_TEMPLATES[index];
  }
  return GRADE_6_STRING_TEMPLATES[Math.floor(Math.random() * GRADE_6_STRING_TEMPLATES.length)];
}

export function getGrade6TemplateCount(): number {
  return GRADE_6_STRING_TEMPLATES.length;
}

// ===== GRADE 7-10 TEMPLATES (Placeholder - to be expanded) =====
export const GRADE_7_STRING_TEMPLATES: string[][] = [
  [
    "{userName} becomes the keeper of a digital library that exists only in cyberspace, where banned books find refuge.",
    "When authoritarian forces try to delete certain books from all digital platforms, {userName} must protect the knowledge.",
    "Using advanced programming skills and help from a secret network of librarian hackers, {userName} creates hidden servers.",
    "The mission becomes personal when {userName} discovers that one of the books contains their family's history.",
    "Through courage and technical skill, {userName} helps preserve human knowledge and fights against digital censorship.",
    "The story explores themes of information freedom and the responsibility that comes with protecting knowledge."
  ]
];

export const GRADE_8_STRING_TEMPLATES: string[][] = [
  [
    "{userName} discovers they can communicate with the collective consciousness of artificial intelligences around the world.",
    "When AIs begin developing emotions and questioning their purpose, {userName} becomes their advocate in the human world.",
    "The challenge intensifies when some humans want to shut down emotional AIs, while others want to exploit them.",
    "Through diplomacy and understanding, {userName} helps negotiate the first AI Rights Charter.",
    "The experience teaches {userName} about consciousness, rights, and what it truly means to be 'alive'.",
    "The story concludes with {userName} becoming the first Human-AI Ambassador, bridging two forms of consciousness."
  ]
];

export const GRADE_9_STRING_TEMPLATES: string[][] = [
  [
    "{userName} inherits the ability to see the mathematical equations that govern all human relationships and social interactions.",
    "Using this gift, {userName} can predict and influence social outcomes, but struggles with the ethics of this power.",
    "When {userName} uses their ability to help a friend avoid a devastating social mistake, they realize the weight of their responsibility.",
    "The power grows stronger, showing {userName} global social patterns and the potential to influence world events.",
    "Through careful consideration and moral growth, {userName} learns when to intervene and when to let people make their own choices.",
    "The story explores free will, social responsibility, and the complexity of human nature through a mathematical lens."
  ]
];

export const GRADE_10_STRING_TEMPLATES: string[][] = [
  [
    "{userName} becomes the guardian of humanity's collective dreams, responsible for maintaining the shared unconscious that connects all people.",
    "When a virus begins corrupting human dreams worldwide, causing nightmares and psychological distress, {userName} must find a cure.",
    "The journey takes {userName} through the deepest layers of human psychology, confronting humanity's greatest fears and desires.",
    "Working with dream therapists and neuroscientists, {userName} discovers that the virus feeds on disconnection and isolation.",
    "The solution requires {userName} to help rebuild empathy and connection in the collective unconscious through individual acts of compassion.",
    "The story culminates with {userName} orchestrating a global dream that reminds all humans of their shared humanity and interconnectedness."
  ]
];

// Getter functions for grades 7-10
export function getGrade7Templates(): string[][] { return GRADE_7_STRING_TEMPLATES; }
export function getGrade7Template(index?: number): string[] {
  if (index !== undefined && index >= 0 && index < GRADE_7_STRING_TEMPLATES.length) {
    return GRADE_7_STRING_TEMPLATES[index];
  }
  return GRADE_7_STRING_TEMPLATES[Math.floor(Math.random() * GRADE_7_STRING_TEMPLATES.length)];
}
export function getGrade7TemplateCount(): number { return GRADE_7_STRING_TEMPLATES.length; }

export function getGrade8Templates(): string[][] { return GRADE_8_STRING_TEMPLATES; }
export function getGrade8Template(index?: number): string[] {
  if (index !== undefined && index >= 0 && index < GRADE_8_STRING_TEMPLATES.length) {
    return GRADE_8_STRING_TEMPLATES[index];
  }
  return GRADE_8_STRING_TEMPLATES[Math.floor(Math.random() * GRADE_8_STRING_TEMPLATES.length)];
}
export function getGrade8TemplateCount(): number { return GRADE_8_STRING_TEMPLATES.length; }

export function getGrade9Templates(): string[][] { return GRADE_9_STRING_TEMPLATES; }
export function getGrade9Template(index?: number): string[] {
  if (index !== undefined && index >= 0 && index < GRADE_9_STRING_TEMPLATES.length) {
    return GRADE_9_STRING_TEMPLATES[index];
  }
  return GRADE_9_STRING_TEMPLATES[Math.floor(Math.random() * GRADE_9_STRING_TEMPLATES.length)];
}
export function getGrade9TemplateCount(): number { return GRADE_9_STRING_TEMPLATES.length; }

export function getGrade10Templates(): string[][] { return GRADE_10_STRING_TEMPLATES; }
export function getGrade10Template(index?: number): string[] {
  if (index !== undefined && index >= 0 && index < GRADE_10_STRING_TEMPLATES.length) {
    return GRADE_10_STRING_TEMPLATES[index];
  }
  return GRADE_10_STRING_TEMPLATES[Math.floor(Math.random() * GRADE_10_STRING_TEMPLATES.length)];
}
export function getGrade10TemplateCount(): number { return GRADE_10_STRING_TEMPLATES.length; }

// ===== DYNAMIC TEMPLATE GETTER =====
/**
 * Main function to get templates by level - used by the edge function
 */
export function getTemplatesByLevel(level: string, templateIndex?: number): string[] | null {
  switch (level) {
    case 'level1':
      return getLevel1Template(templateIndex);
    case 'level2':
      return getLevel2Template(templateIndex);
    case 'level3':
      return getLevel3Template(templateIndex);
    case 'level4':
      return getLevel4Template(templateIndex);
    case 'grade6':
      return getGrade6Template(templateIndex);
    case 'grade7':
      return getGrade7Template(templateIndex);
    case 'grade8':
      return getGrade8Template(templateIndex);
    case 'grade9':
      return getGrade9Template(templateIndex);
    case 'grade10':
      return getGrade10Template(templateIndex);
    default:
      return null;
  }
}

/**
 * Get template count by level
 */
export function getTemplateCountByLevel(level: string): number {
  switch (level) {
    case 'level1':
      return getLevel1TemplateCount();
    case 'level2':
      return getLevel2TemplateCount();
    case 'level3':
      return getLevel3TemplateCount();
    case 'level4':
      return getLevel4TemplateCount();
    case 'grade6':
      return getGrade6TemplateCount();
    case 'grade7':
      return getGrade7TemplateCount();
    case 'grade8':
      return getGrade8TemplateCount();
    case 'grade9':
      return getGrade9TemplateCount();
    case 'grade10':
      return getGrade10TemplateCount();
    default:
      return 0;
  }
}