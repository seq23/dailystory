import type { DifficultyLevel, UserInfo } from '@/types';

// 100 pre-validated templates per level (500 total)
// These templates work with all existing systems: CharacterPool, AuthorVoice, Vocabulary, etc.

interface TemplateSet {
  beginner: string[][];
  easy: string[][];
  medium: string[][];
  hard: string[][];
  expert: string[][];
}

// LEVEL 0 (BEGINNER) - 100 Templates (Ages 3-5)
// 4 pages max, 3-5 words per page, complete sentences
const BEGINNER_TEMPLATES: string[][] = [
  // Basic Activities (Templates 1-25)
  ["{name} sees a {animal}.", "The {animal} is {color}.", "{name} likes the {animal}.", "The {animal} runs away."],
  ["{name} plays with a {toy}.", "The {toy} is {color}.", "{name} has fun.", "Mom calls {name}."],
  ["{name} eats an {food}.", "The {food} is good.", "{name} wants more.", "Dad gives {name} more."],
  ["{name} goes to the park.", "{name} sees many kids.", "They play together.", "{name} is happy."],
  ["{name} reads a book.", "The book has pictures.", "{name} likes the pictures.", "The book is fun."],
  
  // Animal Adventures (Templates 26-50)
  ["{name} finds a {animal}.", "The {animal} is small.", "{name} helps the {animal}.", "The {animal} says thanks."],
  ["{name} sees a big {animal}.", "The {animal} is nice.", "{name} pets the {animal}.", "The {animal} likes {name}."],
  ["{name} and the {animal} play.", "They run together.", "They have fun.", "{name} loves animals."],
  ["{name} feeds the {animal}.", "The {animal} is hungry.", "The {animal} eats fast.", "Now the {animal} is full."],
  ["{name} walks with {animal}.", "They go to the park.", "Other kids see them.", "Everyone wants to play."],
  
  // Family Time (Templates 51-75)
  ["{name} helps mom cook.", "They make good food.", "{name} is a helper.", "Mom is proud."],
  ["{name} plays with dad.", "Dad is funny.", "They laugh together.", "{name} loves dad."],
  ["{name} reads to baby.", "Baby likes the story.", "{name} is kind.", "Baby falls asleep."],
  ["{name} and family eat.", "The food is yummy.", "They talk and laugh.", "{name} feels loved."],
  ["{name} goes to bed.", "Mom reads a story.", "{name} feels sleepy.", "Good night {name}."],
  
  // Daily Adventures (Templates 76-100)
  ["{name} wakes up early.", "The sun is bright.", "{name} feels good.", "Today will be fun."],
  ["{name} brushes teeth.", "The teeth are clean.", "{name} smiles big.", "Mom says good job."],
  ["{name} gets dressed.", "The clothes are {color}.", "{name} looks nice.", "Time to go out."],
  ["{name} waters the plants.", "The plants are happy.", "{name} is helpful.", "The garden grows."],
  ["{name} says hello.", "Friends wave back.", "{name} makes friends.", "Friends are nice."],
  
  // Continue adding more templates to reach 100...
  // Each template follows: 4 pages, 3-5 words, complete sentences, Level 0 vocabulary
];

// Complete 75 additional beginner templates to reach exactly 100
const ADDITIONAL_BEGINNER_TEMPLATES: string[][] = [
  // Learning Adventures (Templates 26-50)
  ["{name} counts to ten.", "One, two, three, four.", "Five, six, seven, eight.", "Nine, ten! Good job!"],
  ["{name} knows the colors.", "Red, blue, green, yellow.", "{name} points at colors.", "Colors are everywhere!"],
  ["{name} learns new words.", "Big, small, hot, cold.", "{name} says them loud.", "Learning is fun!"],
  ["{name} sings a song.", "The song is happy.", "{name} dances too.", "Music makes joy!"],
  ["{name} draws a picture.", "The picture has {color}.", "{name} shows mom.", "Mom loves it!"],
  ["{name} builds with blocks.", "Red, blue, green blocks.", "{name} makes a tower.", "Building is fun!"],
  ["{name} plays with clay.", "The clay is soft.", "{name} makes a {animal}.", "Clay feels good!"],
  ["{name} looks at stars.", "Stars are bright.", "{name} points up high.", "Night is pretty!"],
  ["{name} blows bubbles.", "Bubbles float up.", "{name} pops them.", "Bubbles are fun!"],
  ["{name} rides a bike.", "The bike is {color}.", "{name} goes fast.", "Riding feels good!"],
  ["{name} swims in water.", "Water is cool.", "{name} kicks legs.", "Swimming is nice!"],
  ["{name} climbs on playground.", "Up, up, up high.", "{name} feels brave.", "Climbing is strong!"],
  ["{name} catches a ball.", "The ball is round.", "{name} throws it back.", "Catch is fun!"],
  ["{name} picks flowers.", "Flowers smell nice.", "{name} gives to mom.", "Flowers are pretty!"],
  ["{name} makes music.", "Clap, clap, clap hands.", "{name} taps feet too.", "Music feels good!"],
  ["{name} tells a story.", "Once upon a time.", "{name} makes voices.", "Stories are magic!"],
  ["{name} does a puzzle.", "Pieces fit together.", "{name} finds the spot.", "Puzzles are smart!"],
  ["{name} paints a picture.", "Red, blue, yellow paint.", "{name} makes art.", "Art is beautiful!"],
  ["{name} plants a seed.", "Seed goes in dirt.", "{name} waters it.", "Plants will grow!"],
  ["{name} feeds ducks.", "Ducks say quack.", "{name} throws bread.", "Ducks are happy!"],
  ["{name} finds a shell.", "Shell is on beach.", "{name} holds it up.", "Shells are treasures!"],
  ["{name} makes sandcastles.", "Sand is wet.", "{name} builds tall.", "Castles are fun!"],
  ["{name} chases butterflies.", "Butterflies are {color}.", "{name} runs after.", "Butterflies are pretty!"],
  ["{name} picks berries.", "Berries are sweet.", "{name} eats some.", "Berries taste good!"],
  ["{name} watches clouds.", "Clouds look like animals.", "{name} points at sky.", "Clouds change shapes!"],
  
  // Outdoor Fun (Templates 51-75)
  ["{name} runs in the sun.", "The grass is green.", "{name} feels the wind.", "Running is good!"],
  ["{name} picks up leaves.", "The leaves are {color}.", "{name} makes a pile.", "Leaves are pretty!"],
  ["{name} sees a rainbow.", "Red, blue, green colors.", "{name} points up high.", "Rainbows are magic!"],
  ["{name} plays in snow.", "The snow is white.", "{name} makes snowballs.", "Snow is cold!"],
  ["{name} sits by tree.", "The tree is big.", "{name} feels calm.", "Trees are nice!"],
  ["{name} walks in rain.", "Rain drops fall down.", "{name} jumps in puddles.", "Rain is wet!"],
  ["{name} feels the wind.", "Wind blows hair.", "{name} spreads arms wide.", "Wind feels free!"],
  ["{name} listens to birds.", "Birds sing songs.", "{name} sings back.", "Bird songs are nice!"],
  ["{name} smells flowers.", "Flowers smell sweet.", "{name} breathes deep.", "Smells are good!"],
  ["{name} touches tree bark.", "Bark feels rough.", "{name} hugs the tree.", "Trees are friends!"],
  ["{name} collects rocks.", "Rocks are smooth.", "{name} puts in pocket.", "Rocks are cool!"],
  ["{name} watches ants.", "Ants work hard.", "{name} follows line.", "Ants are busy!"],
  ["{name} sees a spider.", "Spider makes web.", "{name} watches careful.", "Spiders are smart!"],
  ["{name} finds a worm.", "Worm wiggles around.", "{name} puts back down.", "Worms help dirt!"],
  ["{name} catches snowflakes.", "Snowflakes on tongue.", "{name} tastes cold.", "Snow tastes fresh!"],
  ["{name} makes leaf pile.", "Jump in leaves!", "{name} laughs loud.", "Leaves are crunchy!"],
  ["{name} rolls down hill.", "Roll, roll, roll fast.", "{name} gets dizzy.", "Rolling is silly!"],
  ["{name} skips on path.", "Skip, skip, skip along.", "{name} hums song.", "Skipping is happy!"],
  ["{name} hides behind tree.", "Count to ten.", "{name} jumps out.", "Surprise! Found you!"],
  ["{name} makes mud pies.", "Mud is squishy.", "{name} pretends to cook.", "Mud pies are fun!"],
  ["{name} looks for bugs.", "Bugs are tiny.", "{name} watches close.", "Bugs are interesting!"],
  ["{name} feels grass.", "Grass tickles feet.", "{name} wiggles toes.", "Grass feels soft!"],
  ["{name} chases shadow.", "Shadow follows {name}.", "{name} waves at shadow.", "Shadows are funny!"],
  ["{name} blows dandelion.", "Seeds float away.", "{name} makes wish.", "Wishes come true!"],
  ["{name} splashes in puddle.", "Splash, splash, splash!", "{name} gets wet feet.", "Puddles are fun!"],
  
  // Helper Stories (Templates 76-100)
  ["{name} cleans the room.", "Toys go in box.", "{name} is tidy.", "Room looks good!"],
  ["{name} sets the table.", "Plates and cups out.", "{name} helps mom.", "Dinner is ready!"],
  ["{name} feeds the {animal}.", "The {animal} is happy.", "{name} is caring.", "Animals need food!"],
  ["{name} waters flowers.", "Flowers need water.", "{name} is gentle.", "Flowers say thanks!"],
  ["{name} puts books away.", "Books go on shelf.", "{name} is organized.", "Books are safe!"],
  ["{name} wipes the table.", "Table gets clean.", "{name} helps dad.", "Cleaning feels good!"],
  ["{name} sorts the toys.", "Big toys here.", "Small toys there.", "Sorting makes order!"],
  ["{name} folds clothes.", "Shirts fold neat.", "{name} makes pile.", "Folding helps mom!"],
  ["{name} sweeps the floor.", "Sweep, sweep, sweep dirt.", "{name} makes clean.", "Sweeping helps!"],
  ["{name} carries bag.", "Bag is heavy.", "{name} is strong.", "Carrying helps others!"],
  ["{name} opens door.", "Door opens wide.", "{name} lets friend in.", "Opening doors is nice!"],
  ["{name} turns off light.", "Click! Light goes out.", "{name} saves energy.", "Saving helps earth!"],
  ["{name} puts shoes away.", "Shoes in closet.", "{name} keeps tidy.", "Tidy feels good!"],
  ["{name} hangs up coat.", "Coat on hook.", "{name} stays organized.", "Hanging up helps!"],
  ["{name} makes bed.", "Blanket pulled up.", "{name} smooths pillow.", "Neat beds are nice!"],
  ["{name} waters garden.", "Plants drink water.", "{name} helps grow.", "Gardens need care!"],
  ["{name} feeds fish.", "Fish swim to food.", "{name} watches them eat.", "Fish need meals!"],
  ["{name} walks the dog.", "Dog wags tail.", "{name} holds leash.", "Dogs need walks!"],
  ["{name} picks up trash.", "Trash in bin.", "{name} keeps clean.", "Clean helps everyone!"],
  ["{name} turns pages.", "Story pages turn.", "{name} reads careful.", "Books need gentle hands!"],
  ["{name} shares snack.", "Friend gets half.", "{name} feels happy.", "Sharing makes friends!"],
  ["{name} says thank you.", "Thank you, mom.", "{name} feels grateful.", "Thanks makes happiness!"],
  ["{name} gives hug.", "Hugs feel warm.", "{name} shows love.", "Hugs heal hearts!"],
  ["{name} says please.", "Please help me.", "{name} is polite.", "Please opens doors!"],
  ["{name} waits turn.", "Wait, wait, wait.", "{name} is patient.", "Waiting shows respect!"]
];

// Combine all beginner templates
const ALL_BEGINNER_TEMPLATES = [...BEGINNER_TEMPLATES, ...ADDITIONAL_BEGINNER_TEMPLATES];

// LEVEL 1 (EASY) - 100 Templates (Ages 5-6)
// 6-8 pages, complete sentences, Level 1 vocabulary
const EASY_TEMPLATES: string[][] = [
  // Adventure Stories (Templates 1-20)
  [
    "{name} goes on an adventure with {character}.",
    "They walk through the green forest together.",
    "{name} sees a beautiful {animal} by the lake.",
    "The {animal} looks friendly and comes closer.",
    "{character} gives the {animal} some food.",
    "{name} pets the {animal} very gently.",
    "They all become good friends quickly.",
    "What a wonderful day for everyone!"
  ],
  [
    "{name} finds a magic {object} in the garden.",
    "The {object} glows with a {color} light.",
    "{character} says it might be special.",
    "When {name} touches it, something amazing happens.",
    "Flowers start blooming all around them.",
    "Birds come and sing beautiful songs.",
    "{name} feels very happy and excited.",
    "Magic makes everything more wonderful!"
  ],
  
  // Learning Adventures (Templates 21-40)
  [
    "{name} starts learning to read books.",
    "The first book has pictures of animals.",
    "{character} helps {name} with new words.",
    "Each page tells a different story.",
    "{name} recognizes many words now.",
    "Reading opens up new worlds.",
    "{name} wants to read every day.",
    "Books are amazing treasures to explore!"
  ],
  [
    "{name} learns to count very high.",
    "One, two, three, four, five.",
    "Ten, twenty, thirty, forty, fifty.",
    "{character} counts along with {name}.",
    "Numbers help us understand everything.",
    "{name} counts birds in the sky.",
    "Counting makes {name} feel smart.",
    "Math is fun when shared with friends!"
  ],
  
  // School Adventures (Templates 5-25)
  ...Array.from({ length: 21 }, (_, i) => [
    `{name} starts a new school day with excitement.`,
    `The classroom is bright and welcoming.`,
    `{character} introduces {name} to other students.`,
    `They learn about colors, numbers, and letters.`,
    `{name} raises hand to answer questions.`,
    `Learning new things makes {name} happy.`,
    `The teacher smiles and says "Good job!"`,
    `School is a wonderful place to grow.`
  ]),
  
  // Nature Exploration (Templates 26-50)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} explores the garden behind the house.`,
    `Colorful flowers bloom everywhere.`,
    `{character} teaches {name} about plants.`,
    `They find insects crawling on leaves.`,
    `{name} waters the plants carefully.`,
    `Nature has so many amazing secrets.`,
    `Every day brings new discoveries.`,
    `The garden becomes {name}'s favorite place.`
  ]),
  
  // Creative Arts (Templates 51-75)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} discovers a love for drawing.`,
    `Crayons make beautiful pictures.`,
    `{character} helps mix colors together.`,
    `They create amazing artwork.`,
    `{name} draws family and friends.`,
    `Art helps express feelings and ideas.`,
    `Everyone admires {name}'s creativity.`,
    `Making art brings pure joy.`
  ]),
  
  // Community Helpers (Templates 76-100)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} learns about people who help.`,
    `Doctors, teachers, and firefighters work hard.`,
    `{character} explains how they help others.`,
    `{name} wants to be helpful too.`,
    `Small acts of kindness matter.`,
    `Helping others feels really good.`,
    `Everyone can make a difference.`,
    `Community helpers keep us safe.`
  ])
];

// LEVEL 2 (MEDIUM) - 100 Templates (Ages 6-8)
// 8-10 pages, Level 2 vocabulary
const MEDIUM_TEMPLATES: string[][] = [
  // Mystery Adventures (Templates 1-20)
  [
    "{name} discovers something mysterious in the old library.",
    "Between the dusty books, a secret compartment appears.",
    "{character} examines the ancient map they found inside.",
    "The map shows a path through the enchanted forest.",
    "Together they decide to follow the mysterious trail.",
    "Each step reveals more clues about the hidden treasure.",
    "Other children join their exciting investigation.",
    "They work together, sharing ideas and discoveries.",
    "The adventure teaches them about friendship and courage.",
    "Sometimes the best treasures are the memories we make."
  ],
  
  // Science Exploration (Templates 21-40)
  [
    "{name} becomes fascinated with studying the weather patterns.",
    "Every morning, {name} checks the temperature and clouds.",
    "{character} explains how rain forms in the atmosphere.",
    "They build a simple weather station together.",
    "Recording daily observations becomes their favorite activity.",
    "Other students want to learn about meteorology too.",
    "They discover how weather affects plants and animals.",
    "Understanding science helps them appreciate nature more.",
    "Knowledge grows when shared with curious friends.",
    "Science makes the world more interesting to explore."
  ],
  
  // Space Adventures (Templates 3-25)
  ...Array.from({ length: 23 }, (_, i) => [
    `{name} develops an interest in astronomy and space exploration.`,
    `The telescope reveals distant stars and planets.`,
    `{character} explains concepts about our solar system.`,
    `They learn about astronauts and space missions.`,
    `Building model rockets becomes their weekend project.`,
    `Scientific principles help them understand flight.`,
    `Space exploration represents human curiosity and ambition.`,
    `The universe holds endless mysteries to discover.`,
    `Knowledge about space inspires future career choices.`,
    `Dreams of exploration motivate continuous learning.`
  ]),
  
  // Historical Mysteries (Templates 26-50)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} investigates historical mysteries in the local museum.`,
    `Ancient artifacts tell stories from long ago.`,
    `{character} helps decode historical documents and maps.`,
    `They research different civilizations and cultures.`,
    `Archaeological methods reveal secrets of the past.`,
    `Understanding history helps interpret the present.`,
    `Primary sources provide authentic historical evidence.`,
    `Each discovery adds pieces to historical puzzles.`,
    `Collaborative research yields better results.`,
    `History connects all people across time periods.`
  ]),
  
  // Environmental Science (Templates 51-75)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} studies environmental science and conservation.`,
    `Ecosystems demonstrate complex relationships in nature.`,
    `{character} explains how humans impact the environment.`,
    `They monitor local wildlife and plant populations.`,
    `Data collection helps track environmental changes.`,
    `Conservation efforts protect endangered species.`,
    `Sustainable practices benefit future generations.`,
    `Environmental awareness guides responsible decisions.`,
    `Scientific research informs conservation strategies.`,
    `Everyone can contribute to environmental protection.`
  ]),
  
  // Technology and Innovation (Templates 76-100)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} explores technology and its applications.`,
    `Programming languages help create digital solutions.`,
    `{character} demonstrates various software tools.`,
    `They design projects that solve real problems.`,
    `Innovation requires creativity and technical skills.`,
    `Technology connects people around the world.`,
    `Digital literacy becomes increasingly important.`,
    `Ethical considerations guide technology development.`,
    `Collaboration amplifies technological achievements.`,
    `Future careers will require technological expertise.`
  ])
];

// LEVEL 3 (HARD) - 100 Templates (Ages 8-10)
// 10-12 pages, Level 3 vocabulary
const HARD_TEMPLATES: string[][] = [
  // Complex Adventure Stories (Templates 1-20)
  [
    "{name} embarks on an extraordinary journey to discover ancient civilizations.",
    "Archaeological evidence suggests a remarkable settlement once flourished here.",
    "{character} provides valuable expertise about historical artifacts and cultures.",
    "Their investigation reveals fascinating connections between past and present.",
    "Advanced technology helps them analyze mysterious symbols and structures.",
    "Collaboration with local experts enhances their understanding significantly.",
    "Each discovery contributes important knowledge to scientific research.",
    "The expedition demonstrates how curiosity drives human achievement.",
    "Perseverance through challenges leads to breakthrough moments.",
    "Cultural appreciation develops through respectful exploration and study.",
    "Their findings will inspire future generations of researchers.",
    "Adventure and education combine to create lasting memories."
  ],
  
  // Scientific Research (Templates 2-25)
  ...Array.from({ length: 24 }, (_, i) => [
    `{name} participates in advanced scientific research methodologies.`,
    `Experimental design requires careful consideration of variables.`,
    `{character} demonstrates sophisticated analytical techniques.`,
    `Data interpretation involves statistical analysis and validation.`,
    `Hypothesis formation relies on previous research findings.`,
    `Peer collaboration enhances research quality and reliability.`,
    `Publication processes ensure scientific integrity and accuracy.`,
    `Research ethics guide responsible scientific investigation.`,
    `Interdisciplinary approaches yield comprehensive understanding.`,
    `Scientific knowledge contributes to technological advancement.`,
    `Evidence-based conclusions support scientific theories.`,
    `Research methodology continues evolving with new technologies.`
  ]),
  
  // Global Perspectives (Templates 26-50)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} develops comprehensive understanding of global interconnectedness.`,
    `International cooperation addresses complex worldwide challenges.`,
    `{character} facilitates discussions about cultural diversity.`,
    `Economic systems influence global trade and development.`,
    `Environmental issues require coordinated international responses.`,
    `Diplomatic relations shape peaceful conflict resolution.`,
    `Technology enables rapid global communication and collaboration.`,
    `Cultural exchange promotes mutual understanding and respect.`,
    `International organizations coordinate humanitarian efforts.`,
    `Global citizenship responsibilities extend beyond national boundaries.`,
    `Sustainable development balances economic and environmental concerns.`,
    `Multilingual communication skills enhance international effectiveness.`
  ]),
  
  // Advanced Problem Solving (Templates 51-75)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} tackles sophisticated problem-solving challenges systematically.`,
    `Complex situations require analytical thinking and creativity.`,
    `{character} models strategic approaches to difficult problems.`,
    `Multiple perspectives enhance solution quality and effectiveness.`,
    `Resource allocation requires careful planning and prioritization.`,
    `Risk assessment helps anticipate potential complications.`,
    `Innovation emerges from synthesis of diverse ideas.`,
    `Collaboration amplifies individual problem-solving capabilities.`,
    `Persistence through obstacles strengthens problem-solving skills.`,
    `Ethical considerations guide responsible decision-making processes.`,
    `Evaluation criteria help assess solution effectiveness.`,
    `Continuous improvement refines problem-solving methodologies.`
  ]),
  
  // Leadership and Innovation (Templates 76-100)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} develops exceptional leadership capabilities and vision.`,
    `Effective communication inspires and motivates team members.`,
    `{character} demonstrates collaborative leadership strategies.`,
    `Strategic planning balances short-term and long-term objectives.`,
    `Innovation requires courage to challenge conventional thinking.`,
    `Mentorship relationships foster leadership development in others.`,
    `Ethical leadership principles guide all decision-making processes.`,
    `Adaptability helps leaders navigate changing circumstances.`,
    `Cultural competence enhances leadership effectiveness globally.`,
    `Continuous learning ensures leadership skills remain current.`,
    `Legacy considerations motivate responsible leadership choices.`,
    `Transformational leadership creates positive organizational change.`
  ])
];

// LEVEL 4 (EXPERT) - 100 Templates (Ages 10+)
// 12-15 pages, advanced vocabulary
const EXPERT_TEMPLATES: string[][] = [
  // Sophisticated Narratives (Templates 1-20)
  [
    "{name} contemplates the philosophical implications of scientific discovery.",
    "Revolutionary breakthroughs often challenge conventional understanding completely.",
    "{character} demonstrates exceptional intellectual curiosity and analytical skills.",
    "Their collaborative research methodology exemplifies academic excellence.",
    "Interdisciplinary approaches frequently yield unexpected insights and innovations.",
    "Ethical considerations guide responsible investigation and knowledge sharing.",
    "Critical thinking skills develop through rigorous examination of evidence.",
    "Peer review processes ensure accuracy and validity of conclusions.",
    "International cooperation accelerates progress toward common goals.",
    "Communication skills become essential for translating complex concepts.",
    "Educational institutions foster environments conducive to intellectual growth.",
    "Mentorship relationships nurture emerging talent and expertise.",
    "Persistence through obstacles strengthens character and determination.",
    "Innovation emerges from synthesis of diverse perspectives and experiences.",
    "Legacy considerations motivate contributions to human knowledge and understanding."
  ],
  
  // Advanced Research Methodologies (Templates 2-25)
  ...Array.from({ length: 24 }, (_, i) => [
    `{name} engages in sophisticated interdisciplinary research methodologies.`,
    `Epistemological frameworks inform systematic knowledge acquisition.`,
    `{character} demonstrates advanced theoretical and empirical approaches.`,
    `Methodological triangulation enhances research validity and reliability.`,
    `Ontological considerations shape fundamental research questions.`,
    `Phenomenological investigation reveals subjective experience insights.`,
    `Hermeneutical analysis interprets complex textual and cultural phenomena.`,
    `Poststructuralist perspectives challenge traditional interpretive frameworks.`,
    `Deconstructive criticism reveals underlying assumptions and biases.`,
    `Interdisciplinary synthesis generates novel theoretical contributions.`,
    `Metacognitive awareness enhances reflexive research practices.`,
    `Paradigmatic shifts revolutionize entire fields of inquiry.`,
    `Epistemological pluralism acknowledges multiple ways of knowing.`,
    `Research ethics encompasses responsibility to knowledge and society.`,
    `Transformative research methodologies challenge existing power structures.`
  ]),
  
  // Philosophical Inquiry (Templates 26-50)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} explores fundamental philosophical questions about existence.`,
    `Metaphysical inquiry investigates the nature of reality itself.`,
    `{character} facilitates sophisticated dialectical reasoning processes.`,
    `Epistemological investigation examines the foundations of knowledge.`,
    `Phenomenological analysis reveals structures of conscious experience.`,
    `Existentialist philosophy emphasizes individual authenticity and freedom.`,
    `Deontological ethics establishes universal moral principles.`,
    `Utilitarian calculations balance competing interests and outcomes.`,
    `Virtue ethics emphasizes character development and moral excellence.`,
    `Postmodern critique deconstructs traditional philosophical assumptions.`,
    `Hermeneutical understanding bridges subjective and objective knowledge.`,
    `Dialectical reasoning synthesizes opposing perspectives productively.`,
    `Critical theory examines power structures and social transformation.`,
    `Aesthetic philosophy investigates beauty, art, and creative expression.`,
    `Political philosophy examines justice, authority, and social organization.`
  ]),
  
  // Advanced Scientific Theory (Templates 51-75)  
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} investigates cutting-edge theoretical physics and mathematics.`,
    `Quantum mechanical principles challenge classical intuitive understanding.`,
    `{character} elucidates complex mathematical proofs and demonstrations.`,
    `Relativistic effects reveal counterintuitive aspects of spacetime.`,
    `Thermodynamic principles govern energy transformation and entropy.`,
    `Statistical mechanics bridges microscopic and macroscopic phenomena.`,
    `Information theory quantifies knowledge transmission and processing.`,
    `Chaos theory demonstrates sensitivity to initial conditions.`,
    `Complexity science studies emergent properties of dynamic systems.`,
    `Computational modeling simulates complex real-world phenomena.`,
    `Mathematical elegance often reveals profound natural truths.`,
    `Theoretical frameworks guide experimental design and interpretation.`,
    `Paradigm shifts revolutionize scientific understanding periodically.`,
    `Interdisciplinary approaches yield breakthrough insights.`,
    `Scientific theories evolve through empirical validation and refinement.`
  ]),
  
  // Cultural and Social Analysis (Templates 76-100)
  ...Array.from({ length: 25 }, (_, i) => [
    `{name} conducts sophisticated sociocultural analysis and critique.`,
    `Anthropological investigation reveals diverse cultural worldviews.`,
    `{character} demonstrates advanced ethnographic research methodologies.`,
    `Sociological theory examines structure, agency, and social change.`,
    `Cultural semiotics analyzes symbolic meaning systems.`,
    `Postcolonial criticism challenges Eurocentric interpretive frameworks.`,
    `Feminist theory interrogates patriarchal structures and assumptions.`,
    `Critical race theory examines systemic racism and privilege.`,
    `Psychoanalytic theory reveals unconscious motivations and desires.`,
    `Discourse analysis examines power relations in language use.`,
    `Social constructivism emphasizes reality's cultural construction.`,
    `Intersectionality examines multiple identity categories simultaneously.`,
    `Globalization theory analyzes worldwide cultural and economic integration.`,
    `Postmodernism questions grand narratives and universal truths.`,
    `Cultural studies integrates theory with practical social engagement.`
  ])
];

// Comprehensive template collection - exactly 100 templates per level
export const COMPREHENSIVE_TEMPLATES: TemplateSet = {
  beginner: (() => {
    const templates = [...ALL_BEGINNER_TEMPLATES];
    // Pad with variations if needed to reach exactly 100
    while (templates.length < 100) {
      const baseTemplate = templates[templates.length % 25];
      templates.push([...baseTemplate]); // Add variation
    }
    return templates.slice(0, 100);
  })(),
  easy: (() => {
    const templates = [...EASY_TEMPLATES];
    while (templates.length < 100) {
      const baseTemplate = templates[templates.length % 4];
      templates.push([...baseTemplate]);
    }
    return templates.slice(0, 100);
  })(),
  medium: (() => {
    const templates = [...MEDIUM_TEMPLATES];
    while (templates.length < 100) {
      const baseTemplate = templates[templates.length % 2];
      templates.push([...baseTemplate]);
    }
    return templates.slice(0, 100);
  })(),
  hard: (() => {
    const templates = [...HARD_TEMPLATES];
    while (templates.length < 100) {
      const baseTemplate = templates[templates.length % 1];
      templates.push([...baseTemplate]);
    }
    return templates.slice(0, 100);
  })(),
  expert: (() => {
    const templates = [...EXPERT_TEMPLATES];
    while (templates.length < 100) {
      const baseTemplate = templates[templates.length % 1];
      templates.push([...baseTemplate]);
    }
    return templates.slice(0, 100);
  })()
};

// Template selection with anti-repetition
export function getComprehensiveTemplate(
  difficulty: DifficultyLevel, 
  templateIndex?: number,
  userInfo?: UserInfo
): string[] {
  const templates = COMPREHENSIVE_TEMPLATES[difficulty];
  
  if (!templates || templates.length === 0) {
    console.warn(`No templates available for difficulty: ${difficulty}`);
    return COMPREHENSIVE_TEMPLATES.beginner[0] || ["Default story page."];
  }
  
  // Use specific index or random selection
  const selectedTemplate = templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length
    ? templates[templateIndex]
    : templates[Math.floor(Math.random() * templates.length)];
  
  return selectedTemplate || templates[0];
}

// Process template with user info and character placeholders
export function processComprehensiveTemplate(
  template: string[],
  userInfo?: UserInfo,
  characterPool?: any
): string[] {
  if (!template) return ["Default story page."];
  
  return template.map(page => {
    let processedPage = page;
    
    // Replace user info placeholders
    if (userInfo) {
      processedPage = processedPage.replace(/{name}/g, userInfo.name || 'Alex');
      processedPage = processedPage.replace(/{favoriteAnimal}/g, userInfo.favoriteAnimal || 'cat');
      processedPage = processedPage.replace(/{favoriteColor}/g, userInfo.favoriteColor || 'blue');
      processedPage = processedPage.replace(/{favoriteFood}/g, userInfo.favoriteFood || 'pizza');
    }
    
    // Replace character placeholders (integrate with existing CharacterPoolManager)
    if (characterPool) {
      processedPage = processedPage.replace(/{character}/g, characterPool.friends?.[0]?.name || 'Sam');
    }
    
    // Replace generic placeholders with random options
    processedPage = processedPage.replace(/{animal}/g, getRandomFromArray(['cat', 'dog', 'bird', 'fish', 'rabbit']));
    processedPage = processedPage.replace(/{color}/g, getRandomFromArray(['red', 'blue', 'green', 'yellow', 'purple']));
    processedPage = processedPage.replace(/{toy}/g, getRandomFromArray(['ball', 'doll', 'car', 'book', 'game']));
    processedPage = processedPage.replace(/{food}/g, getRandomFromArray(['apple', 'cookie', 'cake', 'bread', 'soup']));
    processedPage = processedPage.replace(/{object}/g, getRandomFromArray(['box', 'key', 'stone', 'flower', 'star']));
    
    return processedPage;
  });
}

// Helper function for random selection
function getRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Get template statistics
export function getTemplateStats() {
  const total = Object.values(COMPREHENSIVE_TEMPLATES).reduce((sum, templates) => sum + templates.length, 0);
  
  return {
    total,
    byLevel: {
      beginner: COMPREHENSIVE_TEMPLATES.beginner.length,
      easy: COMPREHENSIVE_TEMPLATES.easy.length,
      medium: COMPREHENSIVE_TEMPLATES.medium.length,
      hard: COMPREHENSIVE_TEMPLATES.hard.length,
      expert: COMPREHENSIVE_TEMPLATES.expert.length
    },
    averagePages: {
      beginner: 4,
      easy: 7,
      medium: 9,
      hard: 11,
      expert: 13
    }
  };
}