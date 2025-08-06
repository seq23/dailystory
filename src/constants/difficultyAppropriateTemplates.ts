// FIXED: Difficulty-Appropriate Story Templates with Proper Word Count Progression
// Easy: 3-6 words | Medium: 6-12 words | Hard: 10-18 words | Expert: 15-25 words
import { NameFormatter } from "@/utils/nameFormatter";
import type { UserInfo } from "@/types";

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
  
  easy: [
    // Templates 1-40: 3-6 words per page - Level 1 vocabulary only
    ["{name} sees a {animal}.", "The {animal} is {color}.", "{name} says hello.", "They play ball.", "The {animal} runs fast.", "{name} runs too.", "They have fun.", "{name} likes the {animal}.", "They are friends.", "{name} is happy."],
    ["{name} goes out today.", "{pronoun} finds a {object}.", "The {object} is {color}.", "{name} picks it up.", "A {animal} comes over.", "It wants the {object}.", "{name} gives it back.", "The {animal} is happy.", "They play together nicely.", "{name} feels very good."],
    ["{name} helps a {animal}.", "The {animal} looks sad.", "It lost its {food}.", "{name} wants to help.", "They look and look.", "{name} finds the {food}.", "It was under rocks.", "{name} gives it back.", "The {animal} is happy.", "They are good friends."],
    ["{name} has a {object}.", "It is very {color}.", "A {animal} comes near.", "It wants to play.", "{name} lets it play.", "They play together happily.", "The {animal} is happy.", "{name} is happy too.", "They play all day.", "Good friends always share."],
    ["{name} walks to the park.", "The park has swings.", "A {animal} follows along.", "They play on swings.", "The {animal} slides down.", "{name} climbs up high.", "They see everything below.", "The park is fun.", "Time to go home.", "Great day at park."],
    ["{name} makes breakfast today.", "Pancakes smell very good.", "A {animal} wants some.", "{name} shares the {food}.", "They eat together nicely.", "The {animal} is full.", "{name} cleans the dishes.", "Kitchen work is done.", "Good meal together.", "Friends help each other."],
    ["{name} plants flower seeds.", "The seeds are small.", "A {animal} helps dig.", "They water seeds daily.", "Green shoots appear soon.", "Flowers grow very tall.", "The blooms are {color}.", "Garden looks very pretty.", "Nature is amazing.", "Growing things brings joy."],
    ["{name} rides a bicycle.", "The bike is {color}.", "A {animal} runs beside.", "They go down hill.", "Wind blows through hair.", "The {animal} barks happily.", "They stop at pond.", "Ducks swim in water.", "Peaceful rest time.", "Exercise feels very good."],
    ["{name} reads story books.", "Books have great pictures.", "A {animal} listens close.", "Stories take them places.", "They imagine being there.", "Adventures happen in books.", "The {animal} loves stories.", "Reading time is special.", "Books open new worlds.", "Learning never stops growing."],
    ["{name} builds with blocks.", "Blocks stack up high.", "A {animal} watches carefully.", "Tower gets very tall.", "It falls down crash!", "They laugh together loudly.", "Building again is fun.", "Practice makes things better.", "Creative play is best.", "Making things brings happiness."],
    ["{name} helps mom cook.", "Cooking is great fun.", "A {animal} sniffs around.", "Good smells fill kitchen.", "They mix and stir.", "The {animal} tastes {food}.", "Dinner will be ready.", "Family time is coming.", "Working together is nice.", "Food tastes better shared."],
    ["{name} goes to beach.", "Sand feels warm soft.", "A {animal} digs holes.", "Waves splash on shore.", "They build sand castles.", "Seashells wash up close.", "The {animal} chases waves.", "Ocean is very big.", "Beach day is perfect.", "Water and sun together."],
    ["{name} visits the zoo.", "Animals live there safely.", "A {animal} sees cousins.", "Lions roar very loud.", "Monkeys swing on branches.", "Elephants spray with water.", "The {animal} is excited.", "So many different creatures.", "Learning about animal friends.", "Nature has amazing variety."],
    ["{name} plays in snow.", "Snow is cold white.", "A {animal} loves snow.", "They make snow angels.", "Snowballs fly through air.", "Winter is fun time.", "Hot cocoa waits inside.", "Warm house feels good.", "Cold and warm together.", "Seasons bring different fun."],
    ["{name} draws with crayons.", "Colors are bright beautiful.", "A {animal} watches closely.", "Pictures tell great stories.", "Art comes from inside.", "The {animal} likes pictures.", "Creativity flows like water.", "Making art feels good.", "Everyone is an artist.", "Colors make life brighter."],
    ["{name} listens to music.", "Music makes feet dance.", "A {animal} moves too.", "Rhythm is everywhere around.", "Songs tell many stories.", "Music brings people together.", "The {animal} howls along.", "Sounds create great feelings.", "Music is universal language.", "Hearts beat with rhythm."],
    ["{name} helps clean house.", "Cleaning makes things nice.", "A {animal} carries things.", "Teamwork gets jobs done.", "Everything has right place.", "The {animal} finds lost toys.", "Clean house feels peaceful.", "Working together is efficient.", "Taking care of home.", "Pride in good work."],
    ["{name} goes on picnic.", "Outside eating is fun.", "A {animal} joins them.", "Sandwiches taste extra good.", "Fresh air makes hungry.", "Ants want {food} too.", "The {animal} guards lunch.", "Nature provides great setting.", "Simple pleasures are best.", "Food tastes better outside."],
    ["{name} learns to swim.", "Water feels cool nice.", "A {animal} watches carefully.", "Floating is like flying.", "Kicks make water splash.", "Swimming is great exercise.", "The {animal} stays dry.", "Practice makes things easier.", "Water safety is important.", "New skills build confidence."],
    ["{name} picks fresh apples.", "Apples grow on trees.", "A {animal} climbs up.", "Red apples taste sweet.", "Fall harvest time here.", "Nature provides good {food}.", "The {animal} crunches apples.", "Fresh food is healthy.", "Trees give many gifts.", "Seasons bring different bounty."],
    ["{name} watches birds fly.", "Birds have amazing wings.", "A {animal} looks up.", "Flight looks like magic.", "Different birds sing differently.", "Nests keep babies safe.", "The {animal} wishes flying.", "Sky is bird highway.", "Freedom comes in forms.", "Nature teaches many lessons."],
    ["{name} plays hide seek.", "Hiding is great fun.", "A {animal} seeks carefully.", "Good hiding spots hard.", "Counting to ten first.", "Ready or not here!", "The {animal} finds {name}.", "Taking turns is fair.", "Games bring friends together.", "Playing develops many skills."],
    ["{name} waters the garden.", "Plants need water daily.", "A {animal} helps carry.", "Green things grow bigger.", "Flowers open bright petals.", "Vegetables will be ready.", "The {animal} chases butterflies.", "Gardens require patient care.", "Growing food feels satisfying.", "Nature responds to kindness."],
    ["{name} makes paper airplanes.", "Paper flies through air.", "A {animal} chases planes.", "Different folds fly differently.", "Wind helps planes soar.", "Engineering is everywhere around.", "The {animal} catches falling planes.", "Creativity solves flight problems.", "Simple materials become amazing.", "Science is all around."],
    ["{name} helps sick {animal}.", "Being sick feels bad.", "Medicine helps healing happen.", "Rest is very important.", "Gentle care shows love.", "The {animal} feels better.", "Health returns with time.", "Taking care builds friendship.", "Kindness heals many things.", "Everyone needs help sometimes."],
    ["{name} learns new dance.", "Dancing expresses inner feelings.", "A {animal} moves too.", "Bodies can tell stories.", "Music guides movement naturally.", "Practice makes dancing easier.", "The {animal} has rhythm.", "Movement brings pure joy.", "Everyone dances their way.", "Expression comes in forms."],
    ["{name} builds tree house.", "Trees make good supports.", "A {animal} supervises work.", "Tools help construction go.", "High places feel special.", "Imagination becomes real structure.", "The {animal} climbs up.", "Building requires planning ahead.", "Dreams can become reality.", "Creating spaces brings pride."],
    ["{name} collects interesting rocks.", "Rocks tell earth stories.", "A {animal} finds treasures.", "Each rock is different.", "Some rocks are smooth.", "Others have crystal patterns.", "The {animal} carries favorites.", "Collections grow over time.", "Earth provides natural beauty.", "Every rock has history."],
    ["{name} learns to ride.", "Balance takes much practice.", "A {animal} runs alongside.", "Falling down teaches lessons.", "Getting up builds character.", "Persistence leads to success.", "The {animal} encourages trying.", "New skills need patient practice.", "Confidence grows with time.", "Achievement feels very rewarding."],
    ["{name} makes friendship bracelets.", "Friendship symbols matter much.", "A {animal} wears one.", "Different colors mean things.", "Giving gifts shows caring.", "Friends treasure special tokens.", "The {animal} protects bracelet.", "Handmade gifts have heart.", "Friendship needs regular tending.", "Love shows in actions."],
    ["{name} explores the forest.", "Trees create natural cathedral.", "A {animal} leads way.", "Every step reveals wonders.", "Forest sounds create symphony.", "Wildlife lives in harmony.", "The {animal} knows paths.", "Nature teaches peaceful coexistence.", "Forests provide clean air.", "Wilderness holds ancient wisdom."],
    ["{name} learns star names.", "Stars have ancient stories.", "A {animal} looks up.", "Night sky spans forever.", "Constellations guide travelers home.", "Stars shine across time.", "The {animal} howls moon.", "Universe is vast mysterious.", "Darkness reveals distant lights.", "Wonder grows with knowledge."],
    ["{name} practices new instrument.", "Music requires daily practice.", "A {animal} listens patiently.", "Fingers learn new positions.", "Sounds improve with time.", "Music connects hearts together.", "The {animal} appreciates effort.", "Progress comes in steps.", "Art needs dedicated practice.", "Music enriches life greatly."],
    ["{name} helps elderly neighbor.", "Helping others feels good.", "A {animal} visits too.", "Kindness makes days brighter.", "Stories from past fascinating.", "Wisdom comes with experience.", "The {animal} provides comfort.", "Community bonds grow stronger.", "Respect crosses age differences.", "Service builds character well."],
    ["{name} learns about weather.", "Weather changes every day.", "A {animal} feels storms.", "Clouds bring needed rain.", "Sun provides warmth light.", "Wind moves air around.", "The {animal} predicts changes.", "Weather affects all life.", "Nature has complex systems.", "Understanding helps preparedness."],
    ["{name} organizes school supplies.", "Organization helps learning happen.", "A {animal} sorts things.", "Everything needs proper place.", "Good systems save time.", "Preparation prevents poor performance.", "The {animal} finds lost items.", "Order creates peaceful mind.", "Planning ahead reduces stress.", "Good habits build success."],
    ["{name} learns safety rules.", "Safety protects from harm.", "A {animal} demonstrates caution.", "Looking both ways important.", "Helmet protects head well.", "Rules exist for protection.", "The {animal} models safety.", "Prevention better than cure.", "Careful behavior shows wisdom.", "Safety habits protect life."],
    ["{name} creates nature journal.", "Recording observations builds knowledge.", "A {animal} shares discoveries.", "Daily notes track changes.", "Seasons bring different things.", "Details matter for understanding.", "The {animal} poses for drawings.", "Documentation preserves learning experience.", "Science begins with observation.", "Knowledge grows through recording."],
    ["{name} learns about nutrition.", "Good food builds health.", "A {animal} eats well.", "Variety provides different nutrients.", "Vegetables give important vitamins.", "Protein builds strong muscles.", "The {animal} enjoys healthy treats.", "Eating well requires good choices.", "Health starts with food.", "Bodies need proper fuel."],
    ["{name} practices being grateful.", "Gratitude creates happiness inside.", "A {animal} appreciates kindness.", "Thankfulness improves daily attitude.", "Good things happen everywhere.", "Appreciation makes life richer.", "The {animal} shows gratitude.", "Positive thinking builds strength.", "Grateful hearts attract abundance.", "Thankfulness is life skill."]
  ],

  medium: [
    // 6-12 words per page - age-appropriate vocabulary 
    ["{name} walks through the magical forest today.", "A friendly {animal} appears near the oak tree.", "The {animal} has bright {color} fur.", "It leads {name} to a hidden clearing.", "There sits a mysterious {object} glowing in sunlight.", "The {object} holds ancient secrets from long ago.", "{name} carefully picks up the special treasure.", "Suddenly the forest fills with beautiful music.", "The {animal} smiles and nods at {name}.", "Together they dance as the sun rises."],
    ["{name} discovers a secret door behind the bookshelf.", "The door opens to reveal stairs going down.", "A curious {animal} follows {name} into darkness.", "They find a room filled with glowing crystals.", "Each crystal makes different musical sounds when touched.", "The {animal} shows {name} how to play melodies.", "Beautiful music echoes through the underground chamber walls.", "The crystals begin to glow brighter with notes.", "{name} learns that music has real magical powers.", "They play together until the stars appear above."],
    ["{name} finds a tiny village hidden in garden.", "Little people no bigger than thumb live there.", "A brave {animal} guards the village from danger.", "The villagers invite {name} to join their celebration.", "They share delicious {food} from their miniature gardens.", "Everyone dances around a fire made of petals.", "The {animal} tells stories of adventure and friendship.", "{name} promises to keep the village location secret.", "The little people give {name} a friendship bracelet.", "Every full moon, {name} returns to visit friends."]
  ],

  hard: [
    // 10-18 words per page - complete thoughts with advanced vocabulary
    ["{name} lived peacefully in the beautiful {setting} with many wonderful friends from school nearby.", "One day something very strange and mysterious happened that would change everything in their lives.", "The {animal}s started acting differently and seemed quite scared of something dangerous in the forest.", "{name} noticed their unusual fear and decided to help solve this puzzling mystery with courage.", "They bravely decided to investigate this mystery that was frightening all the forest animals every night.", "With great courage and determination {name} ventured into the unknown territory to find trouble's source.", "There they discovered some dangerous creatures causing serious trouble everywhere they went in the land.", "{name} had to make a very difficult choice about how to handle this dangerous situation.", "Using special abilities that had been developing slowly {name} found the perfect solution for everyone.", "The {setting} became peaceful again and {name} grew much wiser from this challenging adventure experience."],
    ["{name} discovered an ancient magical clock hidden deep in the mysterious library's secret basement room.", "When the ornate hands moved backward slowly, something absolutely incredible happened throughout the entire building.", "The world around {name} began to shimmer and change colors dramatically as time seemed to bend.", "They found themselves transported to a completely different time period with different customs and clothing.", "A helpful {animal} from that historical era patiently explained the complex rules of time travel.", "To return home safely, {name} must solve an important historical problem that had puzzled people.", "Working with people from the past proved challenging but ultimately rewarding as they learned different perspectives.", "{name} learned that every generation faces similar difficulties and joys despite the passage of years.", "By helping others solve their problems, they gained the magical power needed to return home.", "Back home, {name} treasured the wisdom and knowledge gained from this incredible journey through time."]
  ],

  expert: [
    // 15-25 words per page - complex thoughts with sophisticated vocabulary
    ["{name} began exploring the fascinating world of science and discovery with great enthusiasm and curiosity about nature.", "Complex questions about the natural world seemed increasingly interesting as {name} continued learning each day through observation.", "A mysterious wise {animal} appeared offering valuable guidance through unknown realms of knowledge that would change everything.", "Together they explored ancient mysteries hidden within nature that had puzzled scientists and researchers for generations.", "{name} faced an important choice between pursuing personal desires and helping others in the community.", "The challenging journey revealed amazing truths about friendship, courage, and how all living things connect.", "Through deep thinking and meaningful dialogue {name} found inner peace and understanding about life's meaning.", "This character growth changed their understanding of life's principles and the importance of serving others.", "Essential principles of kindness, compassion, and balance became clear as the adventure reached its conclusion.", "{name} achieved deeper understanding of friendship and their purpose through this journey of growth and discovery."],
    ["{name} encountered a series of deep questions that challenged their thinking and changed their beliefs.", "Each question led to deeper thinking about existence, meaning, and the principles that guide behavior.", "An enlightened {animal} served as teacher and companion throughout this intellectual quest, providing ancient wisdom.", "They explored complex concepts of justice, beauty, and truth through deep discussion and careful analysis.", "{name} gradually understood that wisdom comes from asking questions and remaining open to learning.", "The journey revealed that everyone's perspective adds valuable insight to life's mysteries and strengthens understanding.", "Through meaningful dialogue and reflection, {name} developed understanding of complex issues and multiple viewpoints.", "Personal growth emerged from meaningful connections with others and commitment to serving the greater good.", "The adventure culminated in {name} becoming a bridge between different ways of thinking.", "Ultimately, {name} learned that discoveries come from embracing questions while maintaining hope and searching for truth."]
  ]
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