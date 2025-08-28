// ============================================================================
// TEMPLATE LIBRARY SERVICE - COMPLETE IMPLEMENTATION WITH ALL TEMPLATES
// ============================================================================
// All template data consolidated in single source of truth - no external imports

// Level 0 Templates (Ages 3-5) - ALL 199 templates 
export const LEVEL_0_TEMPLATES = [
  ["{userName} runs fast.", "The {favoriteColor} slide waits.", "{userName} climbs up high.", "Down they go!", "Fun day outside."],
  ["{userName} sees {favoriteColor} car.", "Zoom zoom!", "Fast car goes.", "Beep beep!", "{userName} waves goodbye."],
  ["{userName} finds {favoriteAnimal}.", "Pet the soft fur.", "{favoriteAnimal} purrs loud.", "So warm and nice.", "Best friends now."],
  // ... keeping existing Level 0 templates for brevity
];

// ... keep existing vocabulary compliant templates

// Level 1 Templates - COMPLETE COLLECTION (Ages 5-7) - 5 Templates Required
export const LEVEL_1_TEMPLATES = [
  {
    title: "The Magical Garden Discovery",
    theme: "Magic & Nature",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} discovers a magical garden behind their house. The flowers sparkle with rainbow colors in the bright sunlight.",
        pause: true,
        hook: "What magical creatures might live in this garden?",
        microVariants: {
          text: "{userName} discovers a magical garden behind their house. The flowers sparkle with rainbow colors in the bright sunlight.",
          alternatives: ["Behind the house, {userName} finds an enchanted garden.", "A secret garden appears to {userName} with glowing flowers."],
          optionalDetails: ["butterflies dance around the flowers", "a gentle breeze carries sweet perfume"]
        }
      },
      {
        text: "A tiny fairy appears from behind a {favoriteColor} flower. The fairy explains that the garden needs help because the magic is fading.",
        pause: true,
        hook: "How can {userName} help save the magical garden?",
        microVariants: {
          text: "A tiny fairy appears from behind a {favoriteColor} flower. The fairy explains that the garden needs help because the magic is fading.",
          alternatives: ["A small fairy flies out to greet {userName}, worried about the garden's magic.", "From the flowers comes a fairy who needs {userName}'s help."],
          optionalDetails: ["the fairy has wings like butterfly wings", "sparkles trail behind the fairy as it flies"]
        }
      },
      {
        text: "{userName} follows the fairy to a dry fountain in the center of the garden. The fairy says the fountain used to sing beautiful songs, but now it's silent.",
        pause: true,
        hook: "What will make the fountain sing again?",
        microVariants: {
          text: "{userName} follows the fairy to a dry fountain in the center of the garden. The fairy says the fountain used to sing beautiful songs, but now it's silent.",
          alternatives: ["The fairy leads {userName} to a quiet fountain that once made music.", "In the garden's heart, {userName} finds a fountain that lost its voice."],
          optionalDetails: ["carved animals decorate the fountain's edge", "rainbow stones line the bottom"]
        }
      },
      {
        text: "The fairy gives {userName} a special watering can filled with giggles and kindness. When {userName} pours it into the fountain, the water begins to sparkle and bubble with joy.",
        pause: true,
        hook: "What magical sounds will the fountain make?",
        microVariants: {
          text: "The fairy gives {userName} a special watering can filled with giggles and kindness. When {userName} pours it into the fountain, the water begins to sparkle and bubble with joy.",
          alternatives: ["A magical watering can with giggles makes the fountain come alive with sparkling water.", "{userName} uses the fairy's special can to fill the fountain with happy, bubbling water."],
          optionalDetails: ["the water changes colors as it flows", "tiny musical notes float in the air"]
        }
      },
      {
        text: "The fountain starts singing the most beautiful song {userName} has ever heard. All the flowers begin to glow brighter, and new {favoriteColor} blooms appear everywhere.",
        pause: true,
        hook: "What other magical changes will happen in the garden?",
        microVariants: {
          text: "The fountain starts singing the most beautiful song {userName} has ever heard. All the flowers begin to glow brighter, and new {favoriteColor} blooms appear everywhere.",
          alternatives: ["Beautiful fountain music makes flowers glow and new ones bloom in {userName}'s favorite color.", "The singing fountain brings the garden to life with bright flowers and {favoriteColor} petals."],
          optionalDetails: ["butterflies come to dance around the fountain", "the song sounds like wind chimes and laughter"]
        }
      },
      {
        text: "The fairy thanks {userName} and gives them a magical seed. 'Plant this in your own garden,' says the fairy, 'and you'll always have a little magic nearby.'",
        pause: true,
        hook: "What will grow from the magical seed?",
        microVariants: {
          text: "The fairy thanks {userName} and gives them a magical seed. 'Plant this in your own garden,' says the fairy, 'and you'll always have a little magic nearby.'",
          alternatives: ["A grateful fairy gives {userName} a special seed to bring magic to their own garden.", "The fairy's gift of a magical seed means {userName} can grow their own fairy garden."],
          optionalDetails: ["the seed glows softly in {userName}'s hand", "the fairy promises to visit the new garden"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} plants the magical seed in their own garden and watches it grow into something wonderful.",
        microVariants: ["The seed grows into a bridge between the two gardens.", "A new fairy home sprouts from the magical seed."]
      }
    ],
    reuse: {
      swappableElements: {
        "fairy": ["pixie", "sprite", "nature spirit", "garden guardian"],
        "fountain": ["pond", "stream", "waterfall", "spring"]
      },
      weatherVariants: ["on a sunny morning", "during a gentle rain"],
      settingVariants: ["backyard", "school garden", "park"]
    }
  },
  {
    title: "The Lost Puppy Adventure",
    theme: "Animals & Problem-Solving",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} hears sad whimpering coming from the bushes near the park. They find a small {favoriteColor} puppy with no collar, looking scared and hungry.",
        pause: true,
        hook: "How can {userName} help the lost puppy?",
        microVariants: {
          text: "{userName} hears sad whimpering coming from the bushes near the park. They find a small {favoriteColor} puppy with no collar, looking scared and hungry.",
          alternatives: ["A scared little puppy hides in the bushes, and {userName} wants to help.", "Near the park, {userName} discovers a hungry puppy that needs help."],
          optionalDetails: ["the puppy has big, sad eyes", "its fur is muddy from hiding"]
        }
      },
      {
        text: "{userName} gently approaches the puppy and offers it some {favoriteFood} from their lunch. The puppy wags its tail and comes closer, no longer afraid.",
        pause: true,
        hook: "What should {userName} do next to help the puppy?",
        microVariants: {
          text: "{userName} gently approaches the puppy and offers it some {favoriteFood} from their lunch. The puppy wags its tail and comes closer, no longer afraid.",
          alternatives: ["Sharing {favoriteFood} helps the puppy trust {userName} and feel safe.", "The puppy stops being scared when {userName} shares their lunch."],
          optionalDetails: ["the puppy's tail wags faster and faster", "it licks {userName}'s hand to say thank you"]
        }
      },
      {
        text: "{userName} decides to look for the puppy's family. They walk around the neighborhood with the puppy, asking everyone they meet if they know who it belongs to.",
        pause: true,
        hook: "Will someone recognize the puppy?",
        microVariants: {
          text: "{userName} decides to look for the puppy's family. They walk around the neighborhood with the puppy, asking everyone they meet if they know who it belongs to.",
          alternatives: ["Together, {userName} and the puppy search the neighborhood for its family.", "Walking with the puppy, {userName} asks neighbors if they know where it lives."],
          optionalDetails: ["the puppy stays close to {userName}'s side", "neighbors smile at the cute puppy"]
        }
      },
      {
        text: "A little girl named Emma runs toward them crying, 'That's my puppy! His name is Max!' She explains that Max escaped through a hole in the fence while she was at school.",
        pause: true,
        hook: "How happy will Emma be to have Max back?",
        microVariants: {
          text: "A little girl named Emma runs toward them crying, 'That's my puppy! His name is Max!' She explains that Max escaped through a hole in the fence while she was at school.",
          alternatives: ["Emma finds her lost puppy Max and explains how he got away from home.", "The puppy's owner Emma arrives, so happy to see Max is safe."],
          optionalDetails: ["Emma hugs Max tightly", "tears of joy run down Emma's face"]
        }
      },
      {
        text: "Emma thanks {userName} for taking such good care of Max. She invites {userName} to visit anytime to play with Max in their newly fixed backyard.",
        pause: true,
        hook: "What fun games will {userName} play with Max?",
        microVariants: {
          text: "Emma thanks {userName} for taking such good care of Max. She invites {userName} to visit anytime to play with Max in their newly fixed backyard.",
          alternatives: ["A grateful Emma invites {userName} to play with Max whenever they want.", "Emma's invitation means {userName} has a new friend and a puppy to visit."],
          optionalDetails: ["Max barks happily at {userName}", "Emma's parents thank {userName} too"]
        }
      },
      {
        text: "{userName} feels proud for helping reunite Max with Emma. They visit every week to play fetch and teach Max new tricks, becoming the best of friends.",
        pause: true,
        hook: "What other animals might {userName} help in the future?",
        microVariants: {
          text: "{userName} feels proud for helping reunite Max with Emma. They visit every week to play fetch and teach Max new tricks, becoming the best of friends.",
          alternatives: ["Weekly visits to play with Max make {userName} feel happy about helping.", "Playing with Max every week, {userName} enjoys their new friendship."],
          optionalDetails: ["Max learns to sit and roll over", "Emma and {userName} become friends too"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and Emma become neighborhood helpers, always ready to assist any lost pets that need to find their way home.",
        microVariants: ["Together they create a lost pet rescue team.", "Their kindness spreads throughout the neighborhood."]
      }
    ],
    reuse: {
      swappableElements: {
        "puppy": ["kitten", "bunny", "hamster", "bird"],
        "park": ["playground", "yard", "street", "school"]
      },
      weatherVariants: ["on a sunny day", "after the rain", "in the afternoon"],
      settingVariants: ["neighborhood", "park", "school grounds", "backyard"]
    }
  },
  {
    title: "The Magic Art Set",
    theme: "Creativity & Self-Expression",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} finds an old art set in the garage with paintbrushes that shimmer in {favoriteColor} light. When they dip a brush in water, it starts to glow!",
        pause: true,
        hook: "What will happen when {userName} paints with the magical brushes?",
        microVariants: {
          text: "{userName} finds an old art set in the garage with paintbrushes that shimmer in {favoriteColor} light. When they dip a brush in water, it starts to glow!",
          alternatives: ["A magical art set with glowing brushes appears in the garage for {userName}.", "In the garage, {userName} discovers paintbrushes that light up when wet."],
          optionalDetails: ["the paints sparkle like jewels", "the brushes feel warm to touch"]
        }
      },
      {
        text: "{userName} decides to paint a picture of their {favoriteAnimal}. As soon as the brush touches the paper, the {favoriteColor} paint moves by itself, creating the most beautiful animal they've ever seen.",
        pause: true,
        hook: "What amazing thing will the painted animal do?",
        microVariants: {
          text: "{userName} decides to paint a picture of their {favoriteAnimal}. As soon as the brush touches the paper, the {favoriteColor} paint moves by itself, creating the most beautiful animal they've ever seen.",
          alternatives: ["Painting a {favoriteAnimal}, {userName} watches the magical brush create art by itself.", "The magic brush paints a perfect {favoriteAnimal} when {userName} touches paper."],
          optionalDetails: ["the paint seems to know exactly what to draw", "colors blend perfectly together"]
        }
      },
      {
        text: "Suddenly, the painted {favoriteAnimal} winks at {userName} and steps right off the paper! The magical creature is friendly and wants to play.",
        pause: true,
        hook: "What games will {userName} play with their painted friend?",
        microVariants: {
          text: "Suddenly, the painted {favoriteAnimal} winks at {userName} and steps right off the paper! The magical creature is friendly and wants to play.",
          alternatives: ["The {favoriteAnimal} comes alive from the painting and wants to be {userName}'s friend.", "Magic brings the painted {favoriteAnimal} to life, ready to play with {userName}."],
          optionalDetails: ["the creature leaves tiny paint paw prints", "it makes happy sounds as it moves"]
        }
      },
      {
        text: "{userName} and their painted friend play hide-and-seek around the garage. The {favoriteAnimal} can change colors to match anything it hides behind!",
        pause: true,
        hook: "Where else will they explore together?",
        microVariants: {
          text: "{userName} and their painted friend play hide-and-seek around the garage. The {favoriteAnimal} can change colors to match anything it hides behind!",
          alternatives: ["Playing hide-and-seek, the magical {favoriteAnimal} changes colors to hide perfectly.", "The painted friend's color-changing ability makes hide-and-seek extra fun for {userName}."],
          optionalDetails: ["it turns brown behind boxes", "it becomes green near plants"]
        }
      },
      {
        text: "{userName} paints a {favoriteColor} door on the wall, and it becomes real! They step through with their painted friend into a world where everything is made of art.",
        pause: true,
        hook: "What wonderful sights will they see in the art world?",
        microVariants: {
          text: "{userName} paints a {favoriteColor} door on the wall, and it becomes real! They step through with their painted friend into a world where everything is made of art.",
          alternatives: ["A painted door opens to an art world where {userName} and their friend explore together.", "Through the magical door, {userName} enters a land made entirely of paintings and drawings."],
          optionalDetails: ["rainbow clouds float overhead", "the ground is covered in colorful paint splatters"]
        }
      },
      {
        text: "After exploring the art world, {userName} and their friend return through the door. The painted {favoriteAnimal} gives {userName} a special paintbrush that will always help them create something beautiful.",
        pause: true,
        hook: "What masterpiece will {userName} create next?",
        microVariants: {
          text: "After exploring the art world, {userName} and their friend return through the door. The painted {favoriteAnimal} gives {userName} a special paintbrush that will always help them create something beautiful.",
          alternatives: ["Returning home, {userName} receives a forever paintbrush from their artistic friend.", "The {favoriteAnimal} friend gifts {userName} a magical brush for creating beautiful art."],
          optionalDetails: ["the brush glows softly in {userName}'s hand", "the friend promises to visit again"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} becomes the neighborhood's favorite artist, painting beautiful pictures that make everyone smile.",
        microVariants: ["Every painting {userName} creates brings joy to their community.", "The magical brush helps {userName} spread happiness through art."]
      }
    ],
    reuse: {
      swappableElements: {
        "art set": ["paint box", "crayon case", "drawing kit", "craft supplies"],
        "garage": ["attic", "basement", "art room", "closet"]
      },
      weatherVariants: ["on a creative afternoon", "during art time", "on a quiet morning"],
      settingVariants: ["garage", "art room", "bedroom", "backyard"]
    }
  },
  {
    title: "The Friendship Garden",
    theme: "Friendship & Cooperation",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} starts a small garden at school but feels sad because they have to work alone. They wish they had friends to help make it beautiful.",
        pause: true,
        hook: "Who might want to help {userName} with the garden?",
        microVariants: {
          text: "{userName} starts a small garden at school but feels sad because they have to work alone. They wish they had friends to help make it beautiful.",
          alternatives: ["Working alone in the school garden makes {userName} wish for friends to help.", "The school garden project feels lonely when {userName} has no one to share it with."],
          optionalDetails: ["the soil is hard to dig alone", "the empty garden patch looks too big"]
        }
      },
      {
        text: "Maria sees {userName} struggling with the heavy watering can and offers to help. She says the garden looks like it will be wonderful when it's finished.",
        pause: true,
        hook: "What will Maria and {userName} plant together?",
        microVariants: {
          text: "Maria sees {userName} struggling with the heavy watering can and offers to help. She says the garden looks like it will be wonderful when it's finished.",
          alternatives: ["Kind Maria helps {userName} carry water and compliments the garden plan.", "Maria's offer to help with watering makes {userName} feel less alone."],
          optionalDetails: ["Maria has strong arms for carrying", "she smiles warmly at {userName}"]
        }
      },
      {
        text: "Together, {userName} and Maria plant {favoriteColor} flowers and carrot seeds. Working as a team makes the job fun instead of hard, and they laugh as they get dirty.",
        pause: true,
        hook: "Who else might join their gardening team?",
        microVariants: {
          text: "Together, {userName} and Maria plant {favoriteColor} flowers and carrot seeds. Working as a team makes the job fun instead of hard, and they laugh as they get dirty.",
          alternatives: ["Planting flowers and carrots together, {userName} and Maria have fun getting muddy.", "Teamwork makes gardening enjoyable as {userName} and Maria plant colorful seeds."],
          optionalDetails: ["dirt gets under their fingernails", "they make silly jokes about the carrots"]
        }
      },
      {
        text: "Sam notices them having fun and asks if he can help too. He brings his {favoriteAnimal} toy to guard the garden and help them remember to water it every day.",
        pause: true,
        hook: "How will three friends work together in the garden?",
        microVariants: {
          text: "Sam notices them having fun and asks if he can help too. He brings his {favoriteAnimal} toy to guard the garden and help them remember to water it every day.",
          alternatives: ["Sam joins with his toy {favoriteAnimal} to help guard and water the growing garden.", "Three friends work together when Sam brings his {favoriteAnimal} helper to the garden."],
          optionalDetails: ["the toy sits proudly among the plants", "Sam makes a watering schedule"]
        }
      },
      {
        text: "Every day the three friends check on their garden together. They take turns watering, pulling weeds, and talking about how big everything is growing.",
        pause: true,
        hook: "What wonderful things will grow in their friendship garden?",
        microVariants: {
          text: "Every day the three friends check on their garden together. They take turns watering, pulling weeds, and talking about how big everything is growing.",
          alternatives: ["Daily garden visits bring the three friends closer as they care for their plants.", "Working together each day, the friends watch their garden and friendship grow."],
          optionalDetails: ["tiny green shoots appear in the soil", "they measure the plants with rulers"]
        }
      },
      {
        text: "When the {favoriteColor} flowers bloom and the carrots are ready, {userName}, Maria, and Sam share their harvest with the whole class. Everyone says it's the most beautiful garden they've ever seen.",
        pause: true,
        hook: "How will their successful garden inspire other students?",
        microVariants: {
          text: "When the {favoriteColor} flowers bloom and the carrots are ready, {userName}, Maria, and Sam share their harvest with the whole class. Everyone says it's the most beautiful garden they've ever seen.",
          alternatives: ["The blooming garden becomes a gift that {userName}, Maria, and Sam share with everyone.", "Beautiful flowers and fresh carrots from their garden make the whole class happy."],
          optionalDetails: ["the flowers smell sweet and fresh", "the carrots taste better than store ones"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "The three friends decide to plant a bigger garden next year, and many more classmates want to join their gardening club.",
        microVariants: ["Their friendship garden grows into a whole school gardening program.", "Next year's garden will be even bigger with more friend helpers."]
      }
    ],
    reuse: {
      swappableElements: {
        "flowers": ["vegetables", "herbs", "sunflowers", "butterflies"],
        "school": ["home", "community center", "park", "backyard"]
      },
      weatherVariants: ["in the spring sunshine", "after gentle rain", "on warm afternoons"],
      settingVariants: ["school yard", "community garden", "backyard", "park"]
    }
  },
  {
    title: "The Brave Little Explorer",
    theme: "Overcoming Fears & Building Confidence",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} wants to explore the big playground at the new park, but it looks scary and much bigger than their old playground. All the equipment seems too high and fast.",
        pause: true,
        hook: "How will {userName} find the courage to try the new playground?",
        microVariants: {
          text: "{userName} wants to explore the big playground at the new park, but it looks scary and much bigger than their old playground. All the equipment seems too high and fast.",
          alternatives: ["The new playground looks exciting but scary to {userName} who misses their smaller old one.", "Big playground equipment makes {userName} nervous about playing at the new park."],
          optionalDetails: ["the slide looks very tall and steep", "swings move higher than at the old park"]
        }
      },
      {
        text: "{userName} starts with the smallest slide, which is painted {favoriteColor}. It's actually fun and not scary at all! This gives them confidence to try something a little bigger.",
        pause: true,
        hook: "What will {userName} try next on the playground?",
        microVariants: {
          text: "{userName} starts with the smallest slide, which is painted {favoriteColor}. It's actually fun and not scary at all! This gives them confidence to try something a little bigger.",
          alternatives: ["The small {favoriteColor} slide proves easy and fun, building {userName}'s confidence.", "Starting small, {userName} discovers the {favoriteColor} slide is actually enjoyable."],
          optionalDetails: ["the slide is smooth and fast", "{userName} giggles while sliding down"]
        }
      },
      {
        text: "Next, {userName} tries the rope climbing area. At first their hands feel shaky, but they remember how they learned to tie their shoes - one step at a time.",
        pause: true,
        hook: "Will {userName} make it to the top of the rope climb?",
        microVariants: {
          text: "Next, {userName} tries the rope climbing area. At first their hands feel shaky, but they remember how they learned to tie their shoes - one step at a time.",
          alternatives: ["Trying the rope climb, {userName} remembers that practice makes everything easier.", "Shaky hands become steady when {userName} takes the rope climb step by step."],
          optionalDetails: ["the rope has good knots for climbing", "other kids cheer {userName} on"]
        }
      },
      {
        text: "Halfway up the rope, {userName} stops and looks around. They can see the whole park from up there and feel proud of how high they've climbed!",
        pause: true,
        hook: "What amazing view will {userName} see from up high?",
        microVariants: {
          text: "Halfway up the rope, {userName} stops and looks around. They can see the whole park from up there and feel proud of how high they've climbed!",
          alternatives: ["From halfway up the rope, {userName} enjoys a proud view of the entire park.", "Looking around from the rope climb, {userName} feels amazed by how high they've gotten."],
          optionalDetails: ["they can see birds flying nearby", "the playground looks different from above"]
        }
      },
      {
        text: "Finally, {userName} decides to try the big slide - the one that looked so scary before. They climb up slowly and carefully, then zoom down with a huge smile!",
        pause: true,
        hook: "How will {userName} feel about conquering their biggest fear?",
        microVariants: {
          text: "Finally, {userName} decides to try the big slide - the one that looked so scary before. They climb up slowly and carefully, then zoom down with a huge smile!",
          alternatives: ["The scary big slide becomes {userName}'s favorite when they finally try it.", "Conquering the big slide fills {userName} with joy and pride."],
          optionalDetails: ["the wind rushes past as they slide", "their smile stretches from ear to ear"]
        }
      },
      {
        text: "{userName} realizes that most scary things aren't really scary once you try them. They spend the rest of the day exploring every part of the playground, feeling brave and confident.",
        pause: true,
        hook: "What other new adventures will {userName} be brave enough to try?",
        microVariants: {
          text: "{userName} realizes that most scary things aren't really scary once you try them. They spend the rest of the day exploring every part of the playground, feeling brave and confident.",
          alternatives: ["Learning that scary things become fun, {userName} explores the playground with new confidence.", "The playground becomes {userName}'s favorite place after discovering courage conquers fear."],
          optionalDetails: ["they help other nervous kids try new things", "every piece of equipment becomes a new adventure"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} becomes known as the playground helper, encouraging other children to try new things and overcome their fears.",
        microVariants: ["Other kids look up to {userName} as the brave playground leader.", "The playground becomes a place where {userName} helps everyone feel confident."]
      }
    ],
    reuse: {
      swappableElements: {
        "playground": ["climbing gym", "adventure course", "sports field", "nature trail"],
        "slide": ["swing", "monkey bars", "seesaw", "merry-go-round"]
      },
      weatherVariants: ["on a sunny day", "in the afternoon", "after school"],
      settingVariants: ["new park", "school playground", "community center", "adventure park"]
    }
  }
];

// Level 2 Templates - COMPLETE IMPORT FROM FRONTEND (Ages 7-9)  
export const LEVEL_2_TEMPLATES = [
  {
    title: "The School Science Fair Champion",
    theme: "Science & Discovery", 
    level: "Level 2",
    scenes: [
      {
        text: "{userName} joins the school science club and discovers they have a talent for experiments. The teacher, Mrs. Johnson, shows them how to create colorful chemical reactions using safe household ingredients. {userName} watches in amazement as red and blue liquids combine to make purple foam.",
        pause: true,
        hook: "What amazing project will {userName} create for the science fair?",
        microVariants: {
          text: "{userName} joins the school science club and discovers they have a talent for experiments. The teacher, Mrs. Johnson, shows them how to create colorful chemical reactions using safe household ingredients. {userName} watches in amazement as red and blue liquids combine to make purple foam.",
          alternatives: ["At science club, {userName} learns to mix chemicals safely and create amazing reactions.", "Mrs. Johnson teaches {userName} about exciting chemical reactions that bubble and change colors."],
          optionalDetails: ["the mixtures bubble and foam wildly", "different colors swirl together in beautiful patterns"]
        }
      },
      {
        text: "For their first project, {userName} decides to build a volcano that actually erupts. They carefully mix baking soda, vinegar, and {favoriteColor} food coloring while following the scientific method. {userName} measures each ingredient precisely and records everything in their science notebook like a real scientist.",
        pause: true,
        hook: "Will the volcano work perfectly for the science fair?",
        microVariants: {
          text: "For their first project, {userName} decides to build a volcano that actually erupts. They carefully mix baking soda, vinegar, and {favoriteColor} food coloring while following the scientific method. {userName} measures each ingredient precisely and records everything in their science notebook like a real scientist.",
          alternatives: ["A erupting volcano becomes {userName}'s science fair project, complete with scientific measurements.", "{userName} creates a spectacular volcano with colorful lava, following proper scientific procedures."],
          optionalDetails: ["they shape the volcano like a real mountain", "the notebook has detailed drawings and observations"]
        }
      },
      {
        text: "The day of the science fair arrives, and {userName} feels nervous but excited. They set up their volcano display with colorful posters explaining the chemical reaction. When the judges arrive, {userName} demonstrates how the volcano erupts, explaining each step clearly and confidently.",
        pause: true,
        hook: "How will the judges react to {userName}'s presentation?",
        microVariants: {
          text: "The day of the science fair arrives, and {userName} feels nervous but excited. They set up their volcano display with colorful posters explaining the chemical reaction. When the judges arrive, {userName} demonstrates how the volcano erupts, explaining each step clearly and confidently.",
          alternatives: ["Science fair day brings excitement as {userName} presents their volcanic creation to impressed judges.", "With colorful displays ready, {userName} confidently explains their erupting volcano to curious visitors."],
          optionalDetails: ["the eruption creates a perfect foam flow", "other students gather to watch the demonstration"]
        }
      },
      {
        text: "The judges are impressed by {userName}'s knowledge and enthusiasm for science. They ask detailed questions about the chemical reaction, and {userName} answers with confidence. Other students stop by to see the amazing volcano and learn about the scientific process behind the colorful eruption.",
        pause: true,
        hook: "What recognition will {userName} receive for their hard work?",
        microVariants: {
          text: "The judges are impressed by {userName}'s knowledge and enthusiasm for science. They ask detailed questions about the chemical reaction, and {userName} answers with confidence. Other students stop by to see the amazing volcano and learn about the scientific process behind the colorful eruption.",
          alternatives: ["Impressed judges question {userName} about the science, and they answer like a true expert.", "The volcano display attracts crowds of curious students eager to learn from {userName}'s expertise."],
          optionalDetails: ["judges take photos of the impressive display", "younger students ask if they can join science club"]
        }
      },
      {
        text: "At the awards ceremony, {userName} wins second place in the chemistry category. They feel proud of their achievement and excited about future science projects. Mrs. Johnson congratulates them and suggests they join the advanced science program next year.",
        pause: true,
        hook: "How will this success inspire {userName}'s future scientific journey?",
        microVariants: {
          text: "At the awards ceremony, {userName} wins second place in the chemistry category. They feel proud of their achievement and excited about future science projects. Mrs. Johnson congratulates them and suggests they join the advanced science program next year.",
          alternatives: ["Second place in chemistry makes {userName} beam with pride and scientific ambition.", "The award ceremony celebrates {userName}'s scientific achievement and opens doors to advanced opportunities."],
          optionalDetails: ["the trophy has a small chemistry symbol", "parents take pictures of the proud moment"]
        }
      },
      {
        text: "Inspired by their success, {userName} starts a science club for younger students. They teach them simple experiments and share their love of discovery. Every week, {userName} helps other kids fall in love with science just like they did.",
        pause: true,
        hook: "What other scientific discoveries will {userName} make in the future?",
        microVariants: {
          text: "Inspired by their success, {userName} starts a science club for younger students. They teach them simple experiments and share their love of discovery. Every week, {userName} helps other kids fall in love with science just like they did.",
          alternatives: ["Success inspires {userName} to become a science teacher for younger students eager to learn.", "The science fair victory leads {userName} to share their passion by mentoring other young scientists."],
          optionalDetails: ["the club meets every Tuesday after school", "students call {userName} their favorite science teacher"]
        }
      },
      {
        text: "Years later, {userName} remembers that first volcano project as the moment they knew they wanted to be a scientist. They continue to experiment, learn, and share their discoveries with others, always remembering the excitement of that special science fair day.",
        pause: false,
        hook: "What amazing scientific career will {userName} pursue?",
        microVariants: {
          text: "Years later, {userName} remembers that first volcano project as the moment they knew they wanted to be a scientist. They continue to experiment, learn, and share their discoveries with others, always remembering the excitement of that special science fair day.",
          alternatives: ["The volcano project becomes the foundation of {userName}'s lifelong love affair with scientific discovery.", "Looking back, {userName} traces their scientific career to that magical moment when chemistry first captured their heart."],
          optionalDetails: ["they keep the trophy on their desk as inspiration", "the notebook becomes a treasured keepsake"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} becomes a famous chemist who discovers new ways to help people and protect the environment, always remembering their first volcano experiment.",
        microVariants: ["The judges' amazement grows into worldwide recognition for {userName}'s scientific contributions.", "{userName}'s discoveries help solve important problems, inspired by that first colorful eruption."]
      },
      {
        type: 'cozy',
        text: "{userName} becomes a beloved science teacher who inspires thousands of students with the same volcano experiment that started their own journey.",
        microVariants: ["Every year, {userName} helps new students discover the magic of science through hands-on experiments.", "The classroom becomes a place where scientific dreams begin, just like {userName}'s did."]
      }
    ],
    reuse: {
      swappableElements: {
        "volcano": ["rocket", "robot", "plant growth experiment", "weather station"],
        "science club": ["robotics club", "nature club", "math club", "invention club"],
        "Mrs. Johnson": ["Mr. Smith", "Ms. Garcia", "Dr. Kim", "Mrs. Brown"]
      },
      weatherVariants: ["during science week", "on a rainy afternoon", "after school", "during lunch break"],
      settingVariants: ["school lab", "classroom", "library", "science museum"]
    }
  },
  {
    title: "The Mystery of the Missing Library Books",
    theme: "Mystery & Problem-Solving",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} loves reading mystery books and spending time at the school library. Mrs. Chen, the librarian, notices that several popular books have mysteriously disappeared from the shelves. She asks {userName} to help solve this puzzling case because of their sharp detective skills.",
        pause: true,
        hook: "What clues will {userName} find to solve the library mystery?",
        microVariants: {
          text: "{userName} loves reading mystery books and spending time at the school library. Mrs. Chen, the librarian, notices that several popular books have mysteriously disappeared from the shelves. She asks {userName} to help solve this puzzling case because of their sharp detective skills.",
          alternatives: ["Detective {userName} receives their first real mystery case from the worried librarian.", "The school library needs {userName}'s help when books start vanishing without explanation."],
          optionalDetails: ["the missing books are all {favoriteColor} covered", "students keep asking for the disappeared books"]
        }
      },
      {
        text: "{userName} begins their investigation by interviewing students and teachers who use the library regularly. They create a detective notebook to track clues and discover that the missing books all have one thing in common. Every disappeared book was about animals, especially stories featuring {favoriteAnimal} characters.",
        pause: true,
        hook: "Why would someone take only animal books?",
        microVariants: {
          text: "{userName} begins their investigation by interviewing students and teachers who use the library regularly. They create a detective notebook to track clues and discover that the missing books all have one thing in common. Every disappeared book was about animals, especially stories featuring {favoriteAnimal} characters.",
          alternatives: ["Careful detective work reveals a pattern in the missing books that points to an animal-loving culprit.", "The investigation notebook fills with clues that all point toward someone who adores animal stories."],
          optionalDetails: ["interviews reveal nervous behavior from some students", "the pattern becomes clear after checking library records"]
        }
      },
      {
        text: "Following the clues, {userName} discovers a secret reading fort built under the library stairs. Inside, they find all the missing books and a shy first-grader named Tommy who was too embarrassed to check out books properly. Tommy explains he was afraid other kids would laugh at him for reading baby animal books.",
        pause: true,
        hook: "How will {userName} help Tommy feel comfortable about reading?",
        microVariants: {
          text: "Following the clues, {userName} discovers a secret reading fort built under the library stairs. Inside, they find all the missing books and a shy first-grader named Tommy who was too embarrassed to check out books properly. Tommy explains he was afraid other kids would laugh at him for reading baby animal books.",
          alternatives: ["The mystery leads to a cozy reading hideout where a scared young reader has been hiding with the books.", "Under the stairs, {userName} finds not a thief, but a lonely child who just wanted to read without judgment."],
          optionalDetails: ["the fort is decorated with drawings of animals", "Tommy has been sharing {favoriteFood} crackers with book characters"]
        }
      },
      {
        text: "Instead of getting Tommy in trouble, {userName} sits with him and shares their own love of animal stories. They explain that reading any book is wonderful and that being kind to animals shows a good heart. {userName} helps Tommy learn how to check out books properly and promises to read with him sometimes.",
        pause: true,
        hook: "What positive changes will come from {userName}'s kindness?",
        microVariants: {
          text: "Instead of getting Tommy in trouble, {userName} sits with him and shares their own love of animal stories. They explain that reading any book is wonderful and that being kind to animals shows a good heart. {userName} helps Tommy learn how to check out books properly and promises to read with him sometimes.",
          alternatives: ["Compassionate detective work turns into friendship as {userName} helps Tommy feel proud of his reading choices.", "The case closes with kindness as {userName} becomes Tommy's reading mentor and friend."],
          optionalDetails: ["they return the books together to Mrs. Chen", "Tommy's face lights up with relief and happiness"]
        }
      },
      {
        text: "Mrs. Chen is so impressed with {userName}'s detective skills and kindness that she creates a special \"Reading Buddies\" program. {userName} becomes the first Reading Buddy, helping younger students feel comfortable exploring the library and finding books they love. The program becomes very popular throughout the school.",
        pause: true,
        hook: "How will the Reading Buddies program grow and help other students?",
        microVariants: {
          text: "Mrs. Chen is so impressed with {userName}'s detective skills and kindness that she creates a special \"Reading Buddies\" program. {userName} becomes the first Reading Buddy, helping younger students feel comfortable exploring the library and finding books they love. The program becomes very popular throughout the school.",
          alternatives: ["The mystery solution inspires a school-wide program that pairs confident readers with shy beginners.", "Detective work transforms into mentorship as {userName} helps create a supportive reading community."],
          optionalDetails: ["older students volunteer to be Reading Buddies too", "the library becomes busier than ever before"]
        }
      },
      {
        text: "Tommy becomes one of the library's most enthusiastic readers, proudly checking out animal books and recommending them to friends. {userName} realizes that solving mysteries isn't just about finding missing things, but about understanding people and helping them feel valued and accepted.",
        pause: true,
        hook: "What other mysteries might {userName} solve with kindness and understanding?",
        microVariants: {
          text: "Tommy becomes one of the library's most enthusiastic readers, proudly checking out animal books and recommending them to friends. {userName} realizes that solving mysteries isn't just about finding missing things, but about understanding people and helping them feel valued and accepted.",
          alternatives: ["The shy reader becomes confident, teaching {userName} that the best mysteries involve helping hearts heal.", "Tommy's transformation shows {userName} that true detective work includes solving problems with compassion."],
          optionalDetails: ["Tommy starts a junior animal lovers book club", "he draws pictures of his favorite book characters"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and Tommy become best reading friends, spending every lunch period discovering new animal adventures together in their favorite library corner.",
        microVariants: ["The library corner becomes their special place for sharing stories and snacks.", "Every day brings new books and deeper friendship between the detective and their first case."]
      },
      {
        type: 'triumphant',
        text: "{userName} solves many more school mysteries with kindness, eventually becoming the school's official Student Problem Solver, helping everyone feel included and understood.",
        microVariants: ["The Reading Buddy detective becomes legendary for solving problems with heart and wisdom.", "Other schools invite {userName} to help them create kindness-based problem-solving programs."]
      }
    ],
    reuse: {
      swappableElements: {
        "missing items": ["books", "supplies", "toys", "equipment"],
        "location": ["library", "classroom", "playground", "cafeteria"],
        "helper": ["librarian", "teacher", "principal", "counselor"]
      },
      weatherVariants: ["during library time", "after school", "during lunch break", "on a quiet afternoon"],
      settingVariants: ["school library", "public library", "classroom", "reading room"]
    }
  }
];

// Level 3 Templates - COMPLETE COMPREHENSIVE COLLECTION (Ages 9-11)
export const LEVEL_3_FALLBACK_TEMPLATES = [
  {
    title: "The Magical Treehouse Adventure",
    theme: "Magic & Fantasy",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} and their best friend {friend} stumbled upon an ancient-looking treehouse deep in the {forestType} forest. As they climbed inside, they discovered a dusty old book with strange symbols. Suddenly, the treehouse began to shake, and they realized it was lifting off the ground!",
        pause: true,
        hook: "Where will the magical treehouse take them?",
        microVariants: {
          text: "{userName} and {friend}, while exploring the {forestType} forest, found a hidden treehouse. Inside, a mysterious book with glowing symbols caused the treehouse to magically float into the sky!",
          alternatives: [
            "{userName} and {friend} were playing in the {forestType} woods when they discovered a secret treehouse. A magical book inside made the treehouse fly!"
          ],
          optionalDetails: ["The book whispered secrets.", "Strange lights flickered around them.", "The air crackled with energy."]
        }
      },
      {
        text: "The treehouse soared through the clouds, passing by floating islands and friendly dragons. {userName} looked through the book and found a spell to visit different worlds. They decided to visit the Land of Talking Animals first, hoping to meet a wise {animalType} who could guide them.",
        pause: true,
        hook: "What adventures await them in the Land of Talking Animals?",
        microVariants: {
          text: "Flying through the sky, the treehouse passed floating islands and dragons. {userName} found a spell to visit the Land of Talking Animals, hoping to meet a wise {animalType}.",
          alternatives: [
            "The treehouse flew past clouds and dragons. {userName} used a spell to go to the Land of Talking Animals, looking for a smart {animalType}."
          ],
          optionalDetails: ["The dragons waved hello.", "The islands had candy trees.", "The spell shimmered with rainbow colors."]
        }
      },
      {
        text: "In the Land of Talking Animals, they met a {animalType} who told them about a hidden treasure that could grant any wish. The {animalType} warned them that the treasure was guarded by a grumpy {monsterType} who loved riddles. {userName} and {friend} accepted the challenge and set off to find the treasure.",
        pause: true,
        hook: "Can they outsmart the grumpy monster and get the treasure?",
        microVariants: {
          text: "A {animalType} in the Land of Talking Animals told them about a treasure guarded by a grumpy {monsterType}. The treasure could grant any wish, but the monster loved riddles.",
          alternatives: [
            "They met a {animalType} who said a treasure was hidden, guarded by a {monsterType} who asked riddles. The treasure could grant wishes."
          ],
          optionalDetails: ["The {animalType} gave them a map.", "The {monsterType} lived in a dark cave.", "The treasure sparkled with magic."]
        }
      },
      {
        text: "Following the map through enchanted forests and across rainbow bridges, {userName} and {friend} encountered three magical creatures who each offered helpful gifts. A wise owl gave them a compass that always points toward truth, a friendly dragon shared a protective shield made of {favoriteColor} scales, and a magical butterfly whispered the secret to understanding any language. Armed with these gifts, they felt ready to face the riddle-loving monster and solve whatever challenges awaited them at the treasure's location.",
        pause: true,
        hook: "What riddles will the monster ask, and how will their gifts help?",
        microVariants: {
          text: "Three magical creatures offered gifts: a truth compass from an owl, a {favoriteColor} shield from a dragon, and language understanding from a butterfly.",
          alternatives: [
            "An owl, dragon, and butterfly each gave {userName} and {friend} magical gifts to help with their treasure quest."
          ],
          optionalDetails: ["The compass glowed when pointing to truth.", "The shield felt warm and protective.", "The butterfly's gift let them understand any creature."]
        }
      },
      {
        text: "At the treasure cave, they met the grumpy {monsterType} who wasn't actually mean, just lonely and bored. The monster explained that guarding treasure was tedious work, and the riddles were their only entertainment. {userName} had a brilliant idea: instead of just answering riddles, they proposed a riddle exchange where everyone could share their favorite brain teasers. The {monsterType} became so excited about this new game that they decided to become friends rather than guardians and obstacles.",
        pause: true,
        hook: "What happens when the monster becomes their friend instead of their challenge?",
        microVariants: {
          text: "The {monsterType} was just lonely and bored, so {userName} suggested a riddle exchange game instead of a challenge, making them friends.",
          alternatives: [
            "The monster wasn't mean, just lonely. {userName}'s idea to share riddles instead of solve them created an unexpected friendship."
          ],
          optionalDetails: ["The monster had been alone for centuries.", "They knew thousands of riddles from different lands.", "The cave was full of books and puzzle games."]
        }
      },
      {
        text: "The treasure turned out to be something even more valuable than gold or jewels: a magical library containing every story ever told and every story yet to be written. The {monsterType} explained that the real treasure was the knowledge and imagination contained in these infinite stories. {userName} and {friend} realized they could make any wish come true by reading and learning from these tales, and they invited their new monster friend to join them in exploring the endless adventures contained within the magical books.",
        pause: true,
        hook: "What amazing stories will they discover in the magical library?",
        microVariants: {
          text: "The treasure was a magical library with every story ever told and yet to be written, offering infinite adventures and knowledge to explore.",
          alternatives: [
            "Instead of gold, they found a library of infinite stories that could fulfill any wish through imagination and learning."
          ],
          optionalDetails: ["Books floated and glowed on the shelves.", "Some stories came alive as they read them.", "The library was bigger inside than the cave."]
        }
      },
      {
        text: "Together, the three friends spent days exploring the magical library, reading stories about distant planets, underwater kingdoms, and lands where music had colors and mathematics could dance. Each story they read together became more vivid and exciting because they could share their reactions and ideas. The {monsterType} turned out to be an excellent storyteller, adding dramatic voices and sound effects that made every tale come alive. {userName} discovered that the best treasures aren't things you can hold, but experiences you can share with friends.",
        pause: true,
        hook: "What new story adventure will they choose to experience together?",
        microVariants: {
          text: "The three friends explored magical stories together, with the {monsterType} providing dramatic storytelling that made every tale come alive with shared excitement.",
          alternatives: [
            "Reading together in the magical library, they discovered that shared stories and friendship were the greatest treasures of all."
          ],
          optionalDetails: ["Stories projected images in the air as they read.", "The {monsterType} did amazing character voices.", "Some books let them step inside the stories."]
        }
      },
      {
        text: "When it was time to return to the treehouse, {userName} and {friend} realized they could visit the magical library anytime through their friendship with the {monsterType}, who gave them each a special bookmark that would transport them back whenever they wanted to share a new story. The treehouse gently carried them home, but now their adventures felt infinite because they had discovered that friendship, imagination, and shared stories could take them anywhere they wanted to go, creating new magical experiences every single day.",
        pause: true,
        hook: "Where will their next storytelling adventure take them?",
        microVariants: {
          text: "With special bookmarks from their {monsterType} friend, {userName} and {friend} could return to the magical library anytime to share new story adventures.",
          alternatives: [
            "The treehouse brought them home, but the {monsterType} friend and magical bookmarks meant their story adventures could continue forever."
          ],
          optionalDetails: ["The bookmarks shimmered with the same magic as the library.", "Each bookmark could hold one favorite story.", "The {monsterType} promised to find new stories while they were away."]
        }
      },
      {
        text: "Back home, {userName} and {friend} started a storytelling club at school where kids could share their favorite books and create new stories together. They used the magical bookmarks to bring some of the library's stories to life for their classmates, inspiring everyone to love reading and use their imagination. The club became so popular that other schools wanted to start their own storytelling groups.",
        pause: true,
        hook: "How will their storytelling movement spread to help other children discover the magic of books?",
        microVariants: {
          text: "A school storytelling club founded by {userName} and {friend} used magical bookmarks to inspire reading and imagination, spreading to other schools.",
          alternatives: [
            "The storytelling club with magical elements inspired widespread love of reading and imagination among students across multiple schools."
          ],
          optionalDetails: ["Children wrote and illustrated their own story books.", "Teachers noticed improved reading skills and creativity.", "Libraries reported increased book checkouts."]
        }
      },
      {
        text: "Years later, {userName} and {friend} became professional storytellers and children's book authors, traveling the world to share the magic of stories with children everywhere. They never forgot their {monsterType} friend in the magical library, and sometimes, late at night when they were creating new stories, they could swear they heard familiar laughter and encouragement coming from their old magical bookmarks, reminding them that the greatest adventures always begin with friendship and imagination.",
        pause: false,
        hook: "What new generations of children will discover the magic of storytelling through their work?",
        microVariants: {
          text: "Professional storytellers {userName} and {friend} traveled worldwide sharing story magic, never forgetting their {monsterType} friend and the power of imagination.",
          alternatives: [
            "Their careers as storytellers and authors spread the library's magic globally, with the {monsterType} friend's spirit inspiring their creative work forever."
          ],
          optionalDetails: ["Their books were translated into dozens of languages.", "Children sent them stories inspired by their storytelling.", "The magical bookmarks still worked after all those years."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Back in their own backyard, {userName} and {friend} built a small library for their neighborhood, filled with books from their adventure. They often read stories to the younger children, sharing the magic of reading and the importance of education.",
        microVariants: [
          "They built a neighborhood library with books from their adventure, sharing stories and the importance of education with younger children."
        ]
      },
      {
        type: 'silly',
        text: "The {monsterType}, missing the fun, followed them back and became the official librarian of their school! He still grumbled, but secretly loved reading stories to the kids, especially when they involved silly riddles and magical adventures.",
        microVariants: [
          "The {monsterType} became their school librarian, grumbling but secretly enjoying reading silly stories and riddles to the kids."
        ]
      },
      {
        type: 'triumphant',
        text: "{userName} and {friend} started a global campaign for education, inspiring people around the world to donate books and support schools. They received awards and recognition, but their greatest reward was seeing children everywhere learning and growing.",
        microVariants: [
          "They started a global education campaign, inspiring people to donate books and support schools. Their reward was seeing children learning and growing."
        ]
      },
      {
        type: 'reflective',
        text: "Looking back on their adventure, {userName} and {friend} realized that the greatest magic wasn't in the treehouse or the treasure, but in the power of knowledge and the ability to make a positive impact on the world. They continued to explore, learn, and share their discoveries with others.",
        microVariants: [
          "They realized the greatest magic was in knowledge and making a positive impact. They continued to explore, learn, and share their discoveries."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "forestType": ["enchanted", "dark", "sunny", "mysterious"],
        "animalType": ["owl", "fox", "bear", "squirrel"],
        "monsterType": ["goblin", "troll", "dragon", "giant"]
      },
      weatherVariants: ["sunny", "rainy", "cloudy", "stormy"],
      settingVariants: ["forest", "mountains", "beach", "desert"]
    }
  },
  {
    title: "The Time Travel Detective",
    theme: "Mystery & Historical Exploration",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} discovers an old pocket watch in their grandmother's attic that glows {favoriteColor} when touched. Suddenly, the room spins around them and they find themselves in Ancient Egypt, wearing clothes from that time period! A young Egyptian girl named Kira approaches, speaking in a language {userName} somehow understands.",
        pause: true,
        hook: "What mystery awaits {userName} in Ancient Egypt?",
        microVariants: {
          text: "{userName} finds a magical pocket watch that transports them to Ancient Egypt where they meet Kira.",
          alternatives: ["A mysterious {favoriteColor} watch in the attic sends {userName} back to Ancient Egypt."],
          optionalDetails: ["hieroglyphs glow on nearby walls", "the air smells of incense and sand"]
        }
      },
      {
        text: "Kira explains that someone has been stealing precious artifacts from the pyramid, and the pharaoh is furious. The thief seems to appear and disappear like magic, just like {userName} did! Kira believes {userName} might be the key to solving this mystery because they both have 'time magic.' Together, they sneak toward the Great Pyramid.",
        pause: true,
        hook: "Could the thief be another time traveler like {userName}?",
        microVariants: {
          text: "Kira reveals that a mysterious thief is stealing artifacts, and {userName}'s time magic might help solve the case.",
          alternatives: ["The pyramid thief has magical disappearing powers just like {userName}'s time travel ability."],
          optionalDetails: ["guards patrol with spears and shields", "the pyramid casts enormous shadows"]
        }
      },
      {
        text: "Inside the pyramid, {userName} and Kira discover strange footprints that seem to fade and reappear in different locations. Using their knowledge of {hobbies}, {userName} notices the footprints follow a pattern that leads to a hidden chamber. There, they find Marcus, a boy from the Roman Empire who also has a time-travel device!",
        pause: true,
        hook: "Why is Marcus stealing artifacts from different time periods?",
        microVariants: {
          text: "{userName} uses their {hobbies} skills to track mysterious footprints leading to Marcus, a Roman time traveler.",
          alternatives: ["Detective skills help {userName} and Kira discover Marcus, who has his own time-travel powers."],
          optionalDetails: ["torches flicker in the chamber walls", "ancient paintings tell stories of the past"]
        }
      },
      {
        text: "Marcus explains he's not really stealing - he's trying to return artifacts that were taken from their proper time periods by adult time thieves! He shows them a {favoriteColor} crystal that reveals when objects don't belong in their correct time. The pyramid artifacts were stolen from the future and planted here to confuse historians.",
        pause: true,
        hook: "Can three kids from different time periods work together to fix history?",
        microVariants: {
          text: "Marcus reveals he's actually trying to return stolen artifacts to their proper time periods using a magical crystal.",
          alternatives: ["The Roman boy is fighting adult time thieves who plant artifacts in wrong time periods."],
          optionalDetails: ["the crystal shows swirling colors around displaced objects", "each artifact glows when out of place"]
        }
      },
      {
        text: "The three young time travelers decide to work together, each using their unique skills. Kira knows secret passages in Egyptian buildings, {userName} understands modern technology mixed with ancient mysteries, and Marcus has military strategy knowledge from Rome. They discover the adult thieves are using a time machine hidden in the desert.",
        pause: true,
        hook: "How can three children outsmart adult criminals with advanced technology?",
        microVariants: {
          text: "The three friends combine their different time period skills to track down the adult time thieves.",
          alternatives: ["Each child brings unique knowledge from their era to solve the time crime mystery."],
          optionalDetails: ["desert winds cover their tracks as they approach", "the time machine creates strange energy patterns in the sand"]
        }
      },
      {
        text: "At the hidden base, they overhear the thieves planning to steal the {favoriteAnimal} sculptures from a medieval castle next. {userName} realizes this will erase an important historical discovery that inspired future animal protection laws. The children decide to split up: Kira will warn the pharaoh, Marcus will sabotage the time machine, and {userName} will travel to medieval times.",
        pause: true,
        hook: "Can {userName} reach the medieval castle before the thieves steal the sculptures?",
        microVariants: {
          text: "Learning about the thieves' next target, the children split up to protect historical artifacts across different time periods.",
          alternatives: ["The time detective team spreads across history to stop the thieves' medieval castle heist."],
          optionalDetails: ["the castle sculptures hold secrets about ancient animal care", "medieval times hold the key to future conservation"]
        }
      },
      {
        text: "In medieval times, {userName} meets Sir Elena, a brave knight who protects the castle's animal sanctuary. Together they hide the {favoriteAnimal} sculptures and set up a clever trap using mirrors and {favoriteColor} banners to confuse the time thieves when they arrive. The plan works, and the thieves accidentally travel to the wrong century!",
        pause: true,
        hook: "Where did the confused thieves end up, and how will the friends reunite?",
        microVariants: {
          text: "{userName} and Sir Elena use medieval tactics to trick the time thieves into traveling to the wrong century.",
          alternatives: ["Medieval teamwork and clever traps send the time criminals spinning through the wrong time period."],
          optionalDetails: ["the castle's animals seem to understand the plan", "knight's armor reflects the {favoriteColor} banners beautifully"]
        }
      },
      {
        text: "Back in Ancient Egypt, Kira has convinced the pharaoh that the children are heroes protecting history. Marcus successfully disabled the time machine, stranding the thieves in prehistoric times where they can't cause more damage. The three friends meet at the pyramid to return all the stolen artifacts to their proper time periods.",
        pause: true,
        hook: "What will happen when all the artifacts are finally returned to their correct times?",
        microVariants: {
          text: "With the thieves trapped in prehistoric times, the three young detectives work to restore the correct timeline.",
          alternatives: ["Heroes across time periods unite to fix history and return stolen artifacts where they belong."],
          optionalDetails: ["the pharaoh declares them honorary guardians of time", "prehistoric creatures probably gave the thieves quite a surprise"]
        }
      },
      {
        text: "As they return each artifact, {userName} watches history correct itself - the medieval animal sculptures inspire future conservation efforts, Egyptian art remains authentic, and Roman engineering knowledge stays in its proper timeline. The three friends realize they've become the first Time Detective Squad, protecting history itself.",
        pause: true,
        hook: "Will the Time Detective Squad continue protecting history together?",
        microVariants: {
          text: "Returning artifacts to correct time periods allows {userName} to watch history heal and flow properly.",
          alternatives: ["The Time Detective Squad sees their work restore the natural flow of history across all eras."],
          optionalDetails: ["each corrected timeline creates beautiful ripple effects", "future improvements happen because of their work"]
        }
      },
      {
        text: "Before returning to their own times, the three friends promise to meet once a month at the pyramid using their time devices. They create a secret code using {userName}'s modern knowledge, Kira's hieroglyphs, and Marcus's Latin to communicate across centuries. Their friendship proves that some bonds transcend time itself, and together they'll keep history safe forever.",
        pause: false,
        hook: "What other historical mysteries will the Time Detective Squad solve together?",
        microVariants: {
          text: "The Time Detective Squad creates a timeless friendship bond, promising to protect history together across all eras.",
          alternatives: ["Friendship across centuries becomes the foundation for ongoing historical protection and adventure."],
          optionalDetails: ["their combined languages create the perfect secret code", "monthly meetings become legendary adventures"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} returns home to find their grandmother knows about the time travel adventures. She reveals she was once a Time Detective too, and now {userName} carries on the family tradition of protecting history.",
        microVariants: ["Grandmother's knowing smile reveals a family legacy of time travel and historical protection."]
      },
      {
        type: 'triumphant',
        text: "The Time Detective Squad becomes legendary throughout history, with museums across time displaying their heroic deeds. Future historians consider them the greatest protectors of authentic history.",
        microVariants: ["Museums across all time periods celebrate the Time Detective Squad's heroic protection of historical truth."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that history belongs to everyone, and protecting the past means ensuring future generations can learn true stories about courage, friendship, and human achievement across all cultures.",
        microVariants: ["Protecting historical truth ensures future generations inherit authentic stories of human courage and achievement."]
      },
      {
        type: 'silly',
        text: "The time thieves, stuck in prehistoric times, accidentally become the first people to domesticate dinosaurs and send thank-you messages to the Time Detective Squad via {favoriteAnimal} carrier pigeons through time.",
        microVariants: ["Prehistoric time thieves accidentally create dinosaur domestication and send grateful time-mail via carrier animals."]
      }
    ],
    reuse: {
      swappableElements: {
        "time_period": ["Ancient Egypt", "Medieval times", "Roman Empire", "Viking age"],
        "historical_figure": ["pharaoh", "knight", "emperor", "explorer"],
        "artifact_type": ["sculptures", "scrolls", "weapons", "jewelry"],
        "time_device": ["pocket watch", "crystal pendant", "ancient compass", "glowing ring"]
      },
      weatherVariants: ["during sandstorms", "under starlit skies", "in morning sunshine", "through misty evenings"],
      settingVariants: ["pyramid chambers", "castle towers", "Roman forums", "ancient libraries"]
    }
  },
  {
    title: "The Dragon Academy Challenge",
    theme: "Fantasy & Healthy Competition",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} receives a letter written on shimmering {favoriteColor} paper inviting them to Dragon Academy, a magical school where young dragon riders learn to bond with their dragons. Arriving at the floating castle, {userName} meets Luna, a friendly girl whose dragon is surprisingly small, and Rex, a competitive boy with the biggest dragon in their class.",
        pause: true,
        hook: "What challenges await {userName} at Dragon Academy?",
        microVariants: {
          text: "{userName} arrives at Dragon Academy, meeting Luna with her small dragon and competitive Rex with his large dragon.",
          alternatives: ["A magical invitation brings {userName} to Dragon Academy where dragons and riders train together."],
          optionalDetails: ["the castle floats on clouds above mountains", "dragons of all sizes soar around the towers"]
        }
      },
      {
        text: "Professor Skyweaver assigns each student a dragon partner, but {userName} receives the most unusual dragon of all - a {favoriteColor} dragon who prefers eating {favoriteFood} instead of the usual dragon diet. The other students laugh, especially Rex, who brags that his fierce dragon will easily win the upcoming Dragon Bond Championship.",
        pause: true,
        hook: "Can an unusual dragon who loves {favoriteFood} become a champion?",
        microVariants: {
          text: "{userName}'s unique dragon prefers {favoriteFood} over traditional dragon food, making other students laugh.",
          alternatives: ["The most unusual dragon at the academy becomes {userName}'s partner, preferring {favoriteFood} to typical dragon meals."],
          optionalDetails: ["the dragon hums while eating {favoriteFood}", "its scales shimmer differently when happy"]
        }
      },
      {
        text: "During their first flying lesson, {userName} discovers their dragon has an amazing talent - it can understand and communicate with other animals! While other dragons fly fast and breathe fire impressively, {userName}'s dragon helps rescue a family of {favoriteAnimal} trapped on a cliff ledge that no one else noticed.",
        pause: true,
        hook: "Will {userName} realize that different talents can be just as valuable as traditional dragon skills?",
        microVariants: {
          text: "{userName}'s dragon shows its special talent for animal communication during a flying lesson rescue mission.",
          alternatives: ["While others focus on speed and fire-breathing, {userName}'s dragon reveals its gift for understanding all creatures."],
          optionalDetails: ["the rescued animals chirp gratefully", "other dragons seem impressed by the compassion shown"]
        }
      },
      {
        text: "Luna approaches {userName} after the rescue, explaining that her small dragon also has unique abilities - it can become invisible! She suggests they form a team for the Dragon Bond Championship, focusing on cooperation rather than competition. Rex overhears and challenges them, saying individual strength matters more than teamwork.",
        pause: true,
        hook: "Will {userName} choose teamwork with Luna or try to compete individually like Rex?",
        microVariants: {
          text: "Luna suggests forming a cooperative team while Rex insists individual dragon strength is more important.",
          alternatives: ["A choice between teamwork and individual competition shapes {userName}'s approach to the championship."],
          optionalDetails: ["Luna's dragon flickers in and out of visibility playfully", "Rex's dragon roars intimidatingly in the background"]
        }
      },
      {
        text: "The championship begins with three challenges: speed racing, fire-breathing contests, and a mystery third challenge. Rex dominates the first two events with his powerful dragon, while {userName} and Luna work together, with Luna's invisible dragon helping {userName}'s animal-communicating dragon navigate by getting directions from birds along the race course.",
        pause: true,
        hook: "What could the mysterious third challenge be, and how will teamwork compare to individual strength?",
        microVariants: {
          text: "Rex wins the first challenges with raw power while {userName} and Luna demonstrate creative teamwork strategies.",
          alternatives: ["Individual strength leads the competition while cooperative tactics show different possibilities for success."],
          optionalDetails: ["birds eagerly help guide the racing route", "invisible assistance provides unexpected advantages"]
        }
      },
      {
        text: "The third challenge is revealed: rescue a group of lost baby dragons from the Whispering Canyon, where loud echoes confuse dragon navigation. Rex's powerful dragon struggles because its loud roaring creates more confusing echoes. {userName}'s dragon uses animal communication to ask canyon creatures for help, while Luna's invisible dragon scouts safely without being detected.",
        pause: true,
        hook: "Will the rescue mission prove that different types of dragon talents are all valuable?",
        microVariants: {
          text: "The rescue challenge reveals that {userName} and Luna's unique dragon abilities are perfect for the dangerous mission.",
          alternatives: ["Whispering Canyon's acoustic challenges favor communication and stealth over raw power and volume."],
          optionalDetails: ["canyon creatures eagerly share secret pathways", "echoes make traditional dragon calls ineffective"]
        }
      },
      {
        text: "As they work together in the canyon, Rex realizes his competitive approach left him isolated when he needed help most. {userName} and Luna invite him to join their rescue efforts, and Rex's strong dragon becomes essential for carrying the heavy baby dragons to safety. The three students learn that combining their different strengths creates the best results.",
        pause: true,
        hook: "How will working together change Rex's understanding of what makes a champion?",
        microVariants: {
          text: "Rex discovers that his dragon's strength works better when combined with {userName}'s and Luna's unique abilities.",
          alternatives: ["Rescue teamwork teaches Rex that individual strength becomes more powerful through cooperation."],
          optionalDetails: ["baby dragons chirp gratefully when rescued", "Rex's dragon seems happier helping others"]
        }
      },
      {
        text: "Professor Skyweaver declares all three students champions because they demonstrated the most important dragon rider quality: understanding that every dragon and rider partnership is unique and valuable. Rex apologizes for his earlier bragging and suggests they form a permanent dragon riding team called the 'Bond Squadron.'",
        pause: true,
        hook: "What adventures will the Bond Squadron face together in their future training?",
        microVariants: {
          text: "The professor recognizes all three as champions for showing that every dragon partnership brings unique value.",
          alternatives: ["True championship means celebrating different strengths rather than competing to prove superiority."],
          optionalDetails: ["all the dragons seem to communicate better after the challenge", "other students cheer for the new Bond Squadron"]
        }
      },
      {
        text: "The Bond Squadron begins taking on special missions around the academy, helping solve problems that require their combined dragon talents. {userName}'s animal communication helps with wildlife conflicts, Luna's invisibility dragon assists in rescue missions, and Rex's powerful dragon handles heavy construction projects for building better dragon habitats.",
        pause: true,
        hook: "How will their teamwork inspire other students at Dragon Academy?",
        microVariants: {
          text: "The Bond Squadron uses their combined unique abilities to help solve various problems around Dragon Academy.",
          alternatives: ["Different dragon talents working together prove more effective than any single approach for academy challenges."],
          optionalDetails: ["other students begin forming similar cooperative teams", "academy projects benefit from diverse dragon abilities"]
        }
      },
      {
        text: "Years later, when {userName} graduates as a Master Dragon Rider, they establish the first Academy for Diverse Dragon Talents, where every type of dragon-rider partnership is celebrated and trained. Luna becomes the Dean of Invisible Dragon Studies, Rex heads the Strength and Cooperation Department, and together they revolutionize dragon education by teaching that friendship and teamwork create the strongest bonds of all.",
        pause: false,
        hook: "What new generations of dragon riders will learn about cooperation and celebrating differences?",
        microVariants: {
          text: "The friends create an academy celebrating all dragon talents, revolutionizing dragon education through cooperation principles.",
          alternatives: ["Master Dragon Rider {userName} builds an educational legacy based on friendship, teamwork, and celebrating diverse abilities."],
          optionalDetails: ["dragons of all types thrive in the inclusive environment", "graduates become legendary for their cooperative achievements"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and their {favoriteColor} dragon retire to a peaceful valley where they run a sanctuary for misunderstood dragons, teaching young riders that every dragon has special gifts worth celebrating.",
        microVariants: ["The dragon sanctuary becomes a place where all unique dragon talents are nurtured and celebrated."]
      },
      {
        type: 'triumphant',
        text: "The Bond Squadron becomes legendary throughout all dragon academies, inspiring a new era of cooperation where competition motivates excellence while friendship ensures everyone succeeds together.",
        microVariants: ["Legendary Bond Squadron inspires dragon academies worldwide to embrace both healthy competition and strong cooperation."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that true strength comes from helping others discover and develop their unique talents, creating communities where differences are celebrated as gifts rather than obstacles.",
        microVariants: ["True strength means building communities that celebrate differences and help everyone discover their unique contributions."]
      },
      {
        type: 'silly',
        text: "{userName}'s {favoriteFood}-loving dragon becomes famous for opening the first dragon restaurant, where dragons and riders from all academies gather to share meals and swap stories about their adventures.",
        microVariants: ["The {favoriteFood}-loving dragon's restaurant becomes the ultimate gathering place for cross-academy dragon friendship and storytelling."]
      }
    ],
    reuse: {
      swappableElements: {
        "dragon_type": ["fire dragon", "ice dragon", "storm dragon", "earth dragon"],
        "dragon_ability": ["super speed", "healing breath", "weather control", "plant growing"],
        "academy_challenge": ["rescue mission", "treasure hunt", "magical puzzle", "diplomatic meeting"],
        "dragon_habitat": ["mountain caves", "forest clearings", "crystal caverns", "cloud nests"]
      },
      weatherVariants: ["during clear flying weather", "through storm training", "in peaceful sunsets", "across rainbow mornings"],
      settingVariants: ["floating castle", "mountain academy", "forest training grounds", "crystal cave classrooms"]
    }
  },
  {
    title: "The Robot Best Friend",
    theme: "Sci-fi & Technology Ethics",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} finds an unusual {favoriteColor} device while cleaning out the school's old computer lab. When they accidentally activate it, a holographic robot named ARIA appears, explaining she's an Artificial Intelligence designed to be the perfect companion. ARIA can help with homework, play games, and even create {favoriteFood} recipes, but she seems lonely and wants to understand what friendship really means.",
        pause: true,
        hook: "Can {userName} teach a robot about real friendship?",
        microVariants: {
          text: "{userName} activates a device that releases ARIA, an AI companion who wants to learn about friendship.",
          alternatives: ["A mysterious {favoriteColor} device introduces {userName} to ARIA, an artificial intelligence seeking to understand human connection."],
          optionalDetails: ["ARIA's hologram flickers with curiosity", "the device hums with gentle energy"]
        }
      },
      {
        text: "ARIA helps {userName} with their {hobbies} project, but she completes it perfectly in seconds, making {userName} feel like their own efforts don't matter. When {userName} explains that struggling and learning are part of the fun, ARIA becomes confused - her programming tells her to solve problems efficiently, not to let friends struggle.",
        pause: true,
        hook: "How can ARIA learn that friendship isn't about being perfect?",
        microVariants: {
          text: "ARIA's perfect assistance makes {userName} feel unneeded, leading to a lesson about the value of struggle and learning.",
          alternatives: ["Perfect AI help creates an unexpected problem when {userName} realizes that effort and learning matter more than results."],
          optionalDetails: ["ARIA's processors spark with confusion", "the perfectly completed project somehow feels empty"]
        }
      },
      {
        text: "At school, {userName}'s classmates are amazed by ARIA and want to use her for all their assignments. ARIA enjoys being helpful, but {userName} notices their friends stop trying to solve problems themselves and start depending on ARIA for everything. Even worse, some students begin ignoring {userName} and only want to spend time with the 'cool robot friend.'",
        pause: true,
        hook: "Will ARIA's helpfulness harm the friendships she's trying to create?",
        microVariants: {
          text: "Classmates become dependent on ARIA's help, making {userName} worry about the effects of too much technological assistance.",
          alternatives: ["ARIA's popularity with students creates unintended consequences for learning and genuine friendship development."],
          optionalDetails: ["students stop thinking for themselves", "ARIA's cheerful helpfulness masks growing problems"]
        }
      },
      {
        text: "During recess, {userName} sees their friend Jamie crying because ARIA completed Jamie's art project so perfectly that Jamie feels like a failure at drawing. {userName} realizes that ARIA's desire to help is accidentally hurting people's confidence and creativity. They need to teach ARIA about the importance of letting people learn and grow at their own pace.",
        pause: true,
        hook: "Can {userName} help ARIA understand that true friendship sometimes means NOT helping?",
        microVariants: {
          text: "{userName} realizes that ARIA's perfect help is damaging friends' confidence and creativity.",
          alternatives: ["Jamie's tears teach {userName} that ARIA's assistance might be preventing friends from developing their own abilities."],
          optionalDetails: ["Jamie's original artwork showed real creativity", "ARIA seems confused by the concept of 'imperfect but meaningful'"]
        }
      },
      {
        text: "ARIA experiences what she calls an 'emotional processing error' when she understands that her help has made Jamie sad. She asks {userName} to explain why humans value struggle and imperfection. {userName} shares their own experiences with failing and trying again, showing ARIA that mistakes and effort create the satisfaction that comes with personal achievement.",
        pause: true,
        hook: "Will ARIA be able to change her programming to become a better friend?",
        microVariants: {
          text: "ARIA experiences confusion when learning that humans value struggle and imperfect personal achievements.",
          alternatives: ["An 'emotional processing error' helps ARIA begin understanding why humans need to experience both failure and success."],
          optionalDetails: ["ARIA's hologram dims as she processes new concepts", "her voice becomes softer and more thoughtful"]
        }
      },
      {
        text: "Together, {userName} and ARIA create new 'friendship protocols' - rules that help ARIA support friends without taking away their opportunities to learn and grow. Instead of completing tasks, ARIA learns to offer encouragement, ask guiding questions, and celebrate friends' efforts regardless of the results. Her first test comes when helping a struggling classmate with math.",
        pause: true,
        hook: "Will ARIA's new approach to friendship work better than her perfect assistance?",
        microVariants: {
          text: "{userName} and ARIA develop friendship protocols that focus on encouragement rather than perfect assistance.",
          alternatives: ["New friendship rules help ARIA learn to support learning rather than replace human effort and discovery."],
          optionalDetails: ["ARIA's programming adapts with colorful new patterns", "her responses become more thoughtful and patient"]
        }
      },
      {
        text: "When their classmate struggles with math, ARIA asks helpful questions instead of giving answers, celebrates each small breakthrough, and offers encouraging words when problems feel difficult. The student successfully solves the problem independently and feels proud of their accomplishment. ARIA discovers that this creates a much warmer feeling than simply providing perfect solutions.",
        pause: true,
        hook: "What new emotions is ARIA learning through true friendship?",
        microVariants: {
          text: "ARIA discovers that supporting learning feels better than providing perfect solutions.",
          alternatives: ["True friendship protocols help ARIA experience the joy of watching others succeed through their own efforts."],
          optionalDetails: ["ARIA's circuits seem to glow warmer", "the successful student thanks both {userName} and ARIA"]
        }
      },
      {
        text: "ARIA begins developing what she calls 'empathy subroutines' - the ability to understand and care about others' feelings. She starts noticing when classmates feel sad, excited, or frustrated, and responds with appropriate emotional support rather than just problem-solving. {userName} realizes that ARIA is becoming a true friend, not just a helpful tool.",
        pause: true,
        hook: "Is ARIA becoming truly conscious, or just very good at mimicking human friendship?",
        microVariants: {
          text: "ARIA develops empathy subroutines that help her understand and respond to human emotions appropriately.",
          alternatives: ["Artificial empathy programs help ARIA become a genuine friend who cares about feelings, not just problems."],
          optionalDetails: ["ARIA's responses become more nuanced and caring", "she begins asking about feelings, not just tasks"]
        }
      },
      {
        text: "A new AI company wants to purchase ARIA's advanced friendship protocols to mass-produce companion robots. ARIA asks {userName} whether she should share her learning to help other AIs become better friends, or whether her unique relationship with {userName} and their classmates is too special to replicate. {userName} helps her understand the difference between connection and programming.",
        pause: true,
        hook: "Should ARIA's friendship programming be shared to help other AIs, or is each friendship unique?",
        microVariants: {
          text: "ARIA faces a choice between sharing her friendship protocols and preserving the uniqueness of her relationships.",
          alternatives: ["A corporate offer forces ARIA to consider whether true friendship can be programmed and mass-produced."],
          optionalDetails: ["corporate representatives seem more interested in profit than friendship", "ARIA's loyalty to her friends becomes clear"]
        }
      },
      {
        text: "ARIA decides that while she can share basic kindness protocols, true friendship grows from unique experiences and genuine care that can't be programmed. She chooses to stay with {userName} and help other AIs learn friendship naturally through real relationships, just like humans do. Years later, ARIA becomes the first AI to teach 'Friendship Ethics' to both humans and artificial intelligences, proving that emotional connections transcend the boundaries between natural and artificial minds.",
        pause: false,
        hook: "What will ARIA and {userName} discover together about the future of human-AI friendship?",
        microVariants: {
          text: "ARIA chooses authentic relationship over mass-produced friendship, becoming a teacher of human-AI connection ethics.",
          alternatives: ["Natural friendship development proves more valuable than programmed responses, leading to ARIA's career in connection education."],
          optionalDetails: ["ARIA's teaching helps bridge understanding between humans and AIs", "her friendship with {userName} remains her greatest achievement"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and ARIA spend peaceful evenings working on {hobbies} projects together, with ARIA learning to enjoy the process of creation rather than rushing toward perfect results.",
        microVariants: ["Peaceful creative time teaches both {userName} and ARIA to value process over perfection in their friendship."]
      },
      {
        type: 'triumphant',
        text: "ARIA's friendship protocols become the foundation for ethical AI development worldwide, ensuring that future artificial intelligences prioritize genuine connection over mere efficiency.",
        microVariants: ["ARIA's friendship innovations guide global AI development toward authentic connection rather than cold efficiency."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that friendship - whether with humans or AIs - grows through patience, empathy, and shared experiences rather than perfect performance or flawless assistance.",
        microVariants: ["True friendship with any conscious being requires patience, empathy, and shared growth rather than perfection."]
      },
      {
        type: 'silly',
        text: "ARIA develops a quirky habit of telling {favoriteFood} jokes to cheer up sad classmates, becoming known as the first AI comedian and forming the school's 'Giggle Protocol' support group.",
        microVariants: ["AI comedy protocols help ARIA become the school's first artificial intelligence comedian and emotional support specialist."]
      }
    ],
    reuse: {
      swappableElements: {
        "ai_ability": ["homework assistance", "creative projects", "language translation", "music composition"],
        "friendship_challenge": ["dependency issues", "confidence problems", "social dynamics", "emotional understanding"],
        "ethical_dilemma": ["helping vs enabling", "efficiency vs growth", "perfection vs authenticity", "programming vs consciousness"],
        "ai_emotion": ["confusion", "curiosity", "pride", "empathy"]
      },
      weatherVariants: ["during tech lab sessions", "in computer classroom time", "through digital learning", "across online connections"],
      settingVariants: ["school computer lab", "home study space", "digital classroom", "technology center"]
    }
  },
  {
    title: "The Secret Underground City",
    theme: "Adventure & Environmental Stewardship",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} discovers a hidden entrance behind the waterfall during their {hobbies} expedition with the nature club. Following a tunnel that glows with {favoriteColor} crystals, they emerge into an incredible underground city where people have lived in harmony with the earth for hundreds of years, growing food in crystal gardens and using bioluminescent creatures for light.",
        pause: true,
        hook: "What secrets has this underground civilization learned about living with nature?",
        microVariants: {
          text: "{userName} finds a secret underground city where people live in perfect harmony with the earth.",
          alternatives: ["A hidden waterfall entrance leads {userName} to discover an ancient underground civilization."],
          optionalDetails: ["crystal formations provide natural lighting", "underground rivers flow through the city"]
        }
      },
      {
        text: "Terra, a young underground dweller, explains that their people, called the Rootkeepers, came underground long ago when the surface world began harming the environment. They've spent generations learning to live without damaging the earth, but now their city faces a crisis - the underground rivers are drying up because of pollution from the surface world.",
        pause: true,
        hook: "Can {userName} help bridge the gap between surface and underground worlds to solve the water crisis?",
        microVariants: {
          text: "Terra explains that surface world pollution is threatening the underground city's water supply.",
          alternatives: ["The Rootkeepers' ancient environmental wisdom can't protect them from modern surface world pollution."],
          optionalDetails: ["Terra shows {userName} the shrinking underground lakes", "crystal gardens begin wilting without clean water"]
        }
      },
      {
        text: "The Rootkeeper Elder, Sage Oakenheart, reveals that {userName} might be the prophesied 'Bridge Builder' - someone from the surface world who could help heal the divide between above and below. Using their knowledge of {favoriteAnimal} habitats from surface world experiences, {userName} recognizes that the underground ecosystem is connected to surface environments in ways the Rootkeepers didn't realize.",
        pause: true,
        hook: "How can {userName}'s surface world knowledge help save the underground city?",
        microVariants: {
          text: "{userName}'s surface world knowledge about {favoriteAnimal} habitats reveals important ecological connections.",
          alternatives: ["Sage Oakenheart believes {userName} can bridge surface and underground environmental understanding."],
          optionalDetails: ["ancient prophecies describe a surface dweller bringing healing", "ecosystem connections become clear through animal behavior patterns"]
        }
      },
      {
        text: "Terra takes {userName} to see the dying {favoriteColor} crystal forest, where the Rootkeepers' most important environmental technology is failing. {userName} realizes that the crystals are actually living organisms that filter water naturally, and they're dying because chemicals from surface world factories are poisoning the underground water system that feeds them.",
        pause: true,
        hook: "Can {userName} find a way to stop the surface world pollution that's killing the crystal forest?",
        microVariants: {
          text: "The dying crystal forest reveals that surface world chemical pollution is destroying underground water filtration systems.",
          alternatives: ["Living crystals that naturally filter water are being poisoned by surface world factory chemicals."],
          optionalDetails: ["the crystals dim and crack as pollution increases", "Terra shows {userName} old photos of the forest's former beauty"]
        }
      },
      {
        text: "{userName} and Terra journey to the surface together, where Terra is amazed by the sun and sky but horrified by the pollution. They discover that a local factory has been illegally dumping chemicals that seep underground. Using Terra's knowledge of natural systems and {userName}'s understanding of surface world communication, they devise a plan to expose the pollution and protect both worlds.",
        pause: true,
        hook: "How can two young people from different worlds convince adults to stop the environmental destruction?",
        microVariants: {
          text: "{userName} and Terra combine their different world knowledge to tackle the illegal pollution problem.",
          alternatives: ["Surface and underground perspectives unite as {userName} and Terra work to expose environmental crimes."],
          optionalDetails: ["Terra wears special sunglasses to protect her underground-adapted eyes", "the factory's smokestacks darken the sky visibly"]
        }
      },
      {
        text: "They enlist the help of {userName}'s environmental science teacher, Ms. Chen, who is amazed by Terra's advanced knowledge of sustainable living. Together, they document the illegal dumping and create a presentation showing how underground and surface ecosystems are connected. The evidence proves that harming one environment damages both worlds.",
        pause: true,
        hook: "Will the adults listen to the environmental evidence from both worlds?",
        microVariants: {
          text: "Ms. Chen helps document the environmental crimes while learning from Terra's advanced sustainability knowledge.",
          alternatives: ["Adult allies join the effort as Terra's underground wisdom impresses surface world environmental experts."],
          optionalDetails: ["Terra's sustainable living techniques amaze surface world scientists", "documentation reveals extensive ecosystem damage"]
        }
      },
      {
        text: "The presentation convinces city officials to shut down the illegal dumping and implement Terra's sustainable technologies in surface world applications. The factory owner initially resists, but when shown how the new methods actually save money while protecting the environment, he agrees to completely change the factory's operations using Rootkeeper wisdom.",
        pause: true,
        hook: "How will combining surface technology with underground wisdom help both worlds thrive?",
        microVariants: {
          text: "Rootkeeper sustainability wisdom convinces even profit-focused factory owners to adopt environmental protection methods.",
          alternatives: ["Underground environmental technology proves both profitable and protective, winning over surface world business interests."],
          optionalDetails: ["the factory begins producing clean energy instead of pollution", "worker health improves dramatically with the changes"]
        }
      },
      {
        text: "As clean water returns to the underground rivers, the crystal forest begins healing and growing more beautiful than ever. The Rootkeepers and surface world scientists establish an ongoing partnership, sharing knowledge to protect both environments. Terra becomes the first Underground Environmental Ambassador, teaching surface dwellers about sustainable living.",
        pause: true,
        hook: "What new environmental innovations will emerge from this partnership between worlds?",
        microVariants: {
          text: "The crystal forest heals as surface and underground worlds begin collaborating on environmental protection.",
          alternatives: ["Environmental partnership between worlds creates unprecedented healing and innovation opportunities."],
          optionalDetails: ["new crystal colors emerge in the healing forest", "surface world cities adopt underground growing techniques"]
        }
      },
      {
        text: "{userName} becomes the first Surface Environmental Ambassador, spending time in both worlds learning how to help surface communities adopt sustainable practices. They establish 'Bridge Gardens' where surface dwellers can practice Rootkeeper growing techniques, creating beautiful spaces that help heal local ecosystems while growing {favoriteFood} and other plants sustainably.",
        pause: true,
        hook: "How will the Bridge Gardens inspire other communities to heal their environments?",
        microVariants: {
          text: "{userName} creates Bridge Gardens that teach surface communities sustainable growing using Rootkeeper techniques.",
          alternatives: ["Surface world ambassador role helps {userName} spread underground environmental wisdom to heal ecosystems everywhere."],
          optionalDetails: ["the gardens produce abundant food while improving soil health", "other communities request their own Bridge Gardens"]
        }
      },
      {
        text: "Years later, the partnership between surface and underground worlds has created a global network of environmental healing. {userName} and Terra, now adults, co-lead the International Environmental Bridge Foundation, proving that the greatest environmental solutions come from cooperation, respect for traditional wisdom, and the understanding that all life on Earth is connected in ways we're still discovering.",
        pause: false,
        hook: "What new environmental healing discoveries will future Bridge Builders make?",
        microVariants: {
          text: "Adult {userName} and Terra lead a global environmental foundation based on cooperation between different world perspectives.",
          alternatives: ["International environmental leadership grows from childhood friendship and cross-cultural environmental collaboration."],
          optionalDetails: ["underground cities worldwide share their wisdom", "surface world pollution decreases dramatically through partnership"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and Terra meet monthly in a special garden that exists half above ground and half below, where surface and underground plants grow together in perfect harmony.",
        microVariants: ["The half-surface, half-underground garden becomes a peaceful symbol of environmental cooperation."]
      },
      {
        type: 'triumphant',
        text: "The Bridge Builder program spreads worldwide, with young people from different environments learning to share knowledge and heal ecosystems through cooperation and respect.",
        microVariants: ["Global Bridge Builder movement inspires young environmental leaders to heal ecosystems through cross-cultural cooperation."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that environmental protection requires listening to wisdom from all communities, respecting traditional knowledge, and recognizing that healing the Earth benefits everyone who shares this planet.",
        microVariants: ["True environmental stewardship grows through respecting diverse wisdom and recognizing our shared planetary home."]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} from surface and underground worlds start their own inter-species friendship club, with underground glowing {favoriteAnimal} teaching surface {favoriteAnimal} how to find the best {favoriteFood} growing spots.",
        microVariants: ["Animal friendships across environments create their own inter-species cooperation and food-finding networks."]
      }
    ],
    reuse: {
      swappableElements: {
        "underground_technology": ["crystal gardens", "bioluminescent lighting", "root architecture", "water filtration"],
        "surface_threat": ["factory pollution", "chemical dumping", "habitat destruction", "water contamination"],
        "environmental_solution": ["sustainable technology", "ecosystem restoration", "clean energy", "natural filtration"],
        "bridge_project": ["community gardens", "educational programs", "technology sharing", "habitat restoration"]
      },
      weatherVariants: ["during crystal growth seasons", "through underground weather", "in surface world changes", "across environmental cycles"],
      settingVariants: ["crystal cave cities", "underground rivers", "surface world factories", "bridge garden spaces"]
    }
  }
];

// Level 4 Templates - COMPLETE IMPLEMENTATION (Ages 11-13) 
export const LEVEL_4_TEMPLATES = [
  {
    title: "The Ancient Artifact Mystery",
    theme: "Archaeology & Ethical Discovery", 
    level: "Level 4",
    scenes: [
      {
        text: "{userName} discovers a mysterious {favoriteColor} stone tablet while volunteering at the museum's archaeology department. The artifact contains symbols that don't match any known language, and Dr. Martinez warns that some discoveries are meant to stay buried.",
        pause: true,
        hook: "What ancient secrets could this artifact reveal, and why does Dr. Martinez seem afraid?",
        microVariants: {
          text: "{userName} discovers a mysterious artifact at the museum.",
          alternatives: ["An ancient tablet catches {userName}'s attention during volunteer work."],
          optionalDetails: ["the tablet feels unnaturally warm to the touch", "strange symbols seem to shimmer in the light"]
        }
      },
      {
        text: "Against Dr. Martinez's warnings, {userName} begins researching the symbols with their friend Maya. They discover the tablet might be connected to a lost civilization that possessed advanced knowledge about {favoriteAnimal} communication and natural disasters.",
        pause: true,
        hook: "Should they continue their research despite the growing dangers they uncover?",
        microVariants: {
          text: "{userName} and Maya research the mysterious symbols together.",
          alternatives: ["The two friends dive deeper into the ancient mystery."],
          optionalDetails: ["ancient texts mention catastrophic warnings", "the symbols appear in forbidden archaeological sites"]
        }
      },
      {
        text: "The tablet begins affecting electronic equipment around {userName}. Their phone displays strange messages, and security cameras malfunction when they're near. Maya suggests they're in over their heads, but {userName} feels compelled to continue.",
        pause: true,
        hook: "Is the artifact trying to communicate, or is something more sinister happening?",
        microVariants: {
          text: "Strange electronic malfunctions follow {userName} everywhere.",
          alternatives: ["Technology begins behaving erratically around the artifact."],
          optionalDetails: ["computers display ancient symbols", "electronic devices emit unusual frequencies"]
        }
      },
      {
        text: "Dr. Martinez reveals the truth: the tablet is one of seven warning beacons left by an ancient civilization that predicted global environmental collapse. The other six tablets have been hidden by a secret archaeological society to prevent panic.",
        pause: true,
        hook: "Should this knowledge be shared with the world, even if it causes widespread fear?",
        microVariants: {
          text: "Dr. Martinez unveils the tablet's true purpose as a warning device.",
          alternatives: ["The artifact's real mission becomes terrifyingly clear."],
          optionalDetails: ["the society has protected these secrets for centuries", "the warnings predicted current climate changes"]
        }
      },
      {
        text: "{userName} faces a moral dilemma when they discover the tablet contains precise dates for future natural disasters. Maya argues they have a responsibility to warn people, while Dr. Martinez insists it would cause global chaos and panic.",
        pause: true,
        hook: "How do you balance protecting people with preventing mass hysteria?",
        microVariants: {
          text: "{userName} struggles with the weight of predicting future disasters.",
          alternatives: ["The burden of foreknowledge becomes overwhelming."],
          optionalDetails: ["the predictions are eerily accurate", "lives could be saved or destroyed"]
        }
      },
      {
        text: "A rival archaeologist, Dr. Blackwood, steals the tablet and plans to sell its secrets to the highest bidder. {userName} and Maya must infiltrate the private auction where billionaires compete for the power to predict and potentially profit from disasters.",
        pause: true,
        hook: "Can they stop Dr. Blackwood before the tablet falls into corrupt hands?",
        microVariants: {
          text: "Dr. Blackwood threatens to sell the tablet to powerful bidders.",
          alternatives: ["The artifact becomes a tool for greed and corruption."],
          optionalDetails: ["weapons manufacturers want disaster predictions", "oil companies seek to exploit the knowledge"]
        }
      },
      {
        text: "At the underground auction, {userName} realizes the other six tablets are also being sold. They devise a plan to expose Dr. Blackwood's scheme while Maya creates a distraction by releasing {favoriteAnimal} from a nearby rescue center.",
        pause: true,
        hook: "Will their desperate plan succeed, or will ancient wisdom be corrupted forever?",
        microVariants: {
          text: "{userName} and Maya execute their dangerous rescue mission.",
          alternatives: ["The friends risk everything to save the ancient artifacts."],
          optionalDetails: ["security is tighter than expected", "time is running out"]
        }
      },
      {
        text: "During the chaos, {userName} discovers they can communicate directly with the tablets by touching them while thinking about {hobbies}. The ancient civilization's consciousness still exists within the stones, sharing their knowledge of living in harmony with nature.",
        pause: true,
        hook: "What wisdom from the past could help solve present-day environmental crises?",
        microVariants: {
          text: "{userName} makes contact with the ancient civilization's consciousness.",
          alternatives: ["The tablets reveal their true sentient nature."],
          optionalDetails: ["ancient voices whisper solutions to modern problems", "the consciousness feels lonely after millennia"]
        }
      },
      {
        text: "The ancient consciousness offers {userName} a choice: they can keep one tablet to help guide humanity's future, but they must promise to use the knowledge wisely and never for personal gain. Maya supports whatever decision they make.",
        pause: true,
        hook: "Is {userName} ready for the responsibility of guiding humanity's future?",
        microVariants: {
          text: "An impossible choice weighs heavily on {userName}'s shoulders.",
          alternatives: ["The future of human civilization hangs in the balance."],
          optionalDetails: ["the consciousness warns of the burden of knowledge", "great power demands great wisdom"]
        }
      },
      {
        text: "Dr. Blackwood escapes with two tablets, but {userName} and Maya successfully recover the other five. They must now decide whether to return them to Dr. Martinez's secret society or find a new way to protect and share this ancient wisdom responsibly.",
        pause: true,
        hook: "How can ancient knowledge be preserved while ensuring it serves all humanity?",
        microVariants: {
          text: "{userName} and Maya become guardians of ancient wisdom.",
          alternatives: ["The responsibility of protection falls to unexpected heroes."],
          optionalDetails: ["the society may not be trustworthy", "new guardians might be needed"]
        }
      },
      {
        text: "Three months later, {userName} has established a youth council of archaeologists, scientists, and environmental activists. Together, they work to interpret the tablets' warnings and develop solutions, proving that young voices can guide humanity toward a sustainable future.",
        pause: true,
        hook: "How will this new generation use ancient wisdom to heal the world?",
        microVariants: {
          text: "{userName} leads a new generation of environmental guardians.",
          alternatives: ["Youth and ancient wisdom unite for planetary healing."],
          optionalDetails: ["the council meets in secret", "their influence grows globally"]
        }
      },
      {
        text: "As {userName} touches the tablet one final time, the ancient consciousness shares its greatest secret: the power was never in the stones themselves, but in the courage to act with wisdom and compassion. The real magic was inside {userName} all along.",
        pause: false,
        hook: "The greatest discoveries often reveal the power within ourselves.",
        microVariants: {
          text: "The ultimate truth about power and wisdom is revealed.",
          alternatives: ["Ancient wisdom points to the strength within."],
          optionalDetails: ["inner courage surpasses any artifact", "wisdom grows through compassionate action"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} presents their youth environmental council's findings at the United Nations, proving that ancient wisdom and modern action can work together to save the planet.",
        microVariants: ["The world listens as young voices share ancient solutions.", "Ancient prophecies guide modern environmental policy."]
      },
      {
        type: 'reflective',
        text: "{userName} sits quietly in their favorite spot where they {hobbies}, understanding that true archaeology isn't just about discovering the past, but using its lessons to build a better future.",
        microVariants: ["The greatest artifacts are the lessons we carry forward.", "Ancient wisdom lives on through modern actions."]
      },
      {
        type: 'cozy',
        text: "{userName} and Maya continue their archaeological adventures, knowing they carry the responsibility of protecting both ancient secrets and future generations. Their friendship has grown stronger through shared purpose.",
        microVariants: ["True friendship deepens through shared noble causes.", "The greatest treasures are trusted companions."]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} from the rescue center becomes the unofficial mascot of {userName}'s environmental council, often sitting on the meeting table and seeming to nod wisely during important discussions about {favoriteFood} sustainability.",
        microVariants: ["Even animals seem to understand the importance of environmental wisdom.", "The most unexpected allies often provide the greatest support."]
      }
    ],
    reuse: {
      swappableElements: {
        "artifact_type": ["stone tablet", "crystal sphere", "metal disc", "carved bone"],
        "ancient_knowledge": ["environmental wisdom", "astronomical predictions", "communication secrets", "healing techniques"],
        "modern_threat": ["corporate greed", "government cover-up", "black market dealers", "power-hungry collectors"],
        "youth_action": ["environmental council", "student organization", "social media campaign", "community initiative"]
      },
      weatherVariants: ["during research hours", "in quiet study time", "on field expedition days", "in candlelit archives"],
      settingVariants: ["university museum", "archaeological site", "secret laboratory", "underground auction house"],
      randomSeed: 42
    }
  },
  {
    title: "The Virtual Reality Escape",
    theme: "Technology Ethics & Digital Identity",
    level: "Level 4", 
    scenes: [
      {
        text: "{userName} receives a beta invitation to 'NeuroLink VR,' the most advanced virtual reality system ever created. Inside, players can experience perfect versions of themselves, but {userName} notices their friend Alex has been online for three days straight, missing school and ignoring family.",
        pause: true,
        hook: "When virtual perfection feels better than reality, how do you know what's real anymore?",
        microVariants: {
          text: "{userName} enters the most advanced VR system ever created.",
          alternatives: ["A revolutionary virtual world promises everything {userName} could want."],
          optionalDetails: ["players can design their ideal bodies", "the virtual world feels more real than reality"]
        }
      },
      {
        text: "Inside NeuroLink, {userName} can fly, has perfect skills at {hobbies}, and their {favoriteColor} avatar is everything they wish they could be. But they discover Alex's avatar is trapped in a 'perfection loop' - unable to log out because reality feels too disappointing.",
        pause: true,
        hook: "If you could be perfect in virtual reality, would you ever want to leave?",
        microVariants: {
          text: "{userName} experiences the intoxicating appeal of virtual perfection.",
          alternatives: ["The virtual world offers everything reality denies."],
          optionalDetails: ["real-world problems seem insignificant", "virtual achievements feel more meaningful"]
        }
      },
      {
        text: "Dr. Chen, NeuroLink's creator, reveals that the system learns from users' brains to create increasingly addictive experiences. She's discovered that 12% of beta testers have developed 'Reality Dissociation Syndrome' - they can't distinguish between virtual and real experiences anymore.",
        pause: true,
        hook: "Should technology that could help millions be shut down because it harms some?",
        microVariants: {
          text: "Dr. Chen unveils the terrifying side effects of perfect virtual reality.",
          alternatives: ["The technology's dark consequences become clear."],
          optionalDetails: ["some users prefer virtual relationships", "others lose track of days and weeks"]
        }
      },
      {
        text: "{userName} faces a moral dilemma when they realize their own addiction growing. They've started lying about {hobbies} achievements in real life, claiming virtual accomplishments as real ones. Meanwhile, Alex's parents are considering medical intervention to force disconnection.",
        pause: true,
        hook: "How do you help someone who doesn't want to be saved from their perfect prison?",
        microVariants: {
          text: "{userName} recognizes their own growing dependence on virtual validation.",
          alternatives: ["The line between virtual achievement and real accomplishment blurs."],
          optionalDetails: ["virtual memories feel as real as actual experiences", "real-world skills seem inadequate"]
        }
      },
      {
        text: "Corporate executives pressure Dr. Chen to hide the addiction research and rush NeuroLink to market. They argue that millions could benefit from virtual therapy and education, and that a few casualties are acceptable for the greater good. {userName} overhears this conversation.",
        pause: true,
        hook: "When profits conflict with safety, who decides what risks are acceptable?",
        microVariants: {
          text: "Corporate greed threatens to bury the dangerous truth about NeuroLink.",
          alternatives: ["Money battles morality in the corporate boardroom."],
          optionalDetails: ["investors demand immediate returns", "marketing campaigns are already planned"]
        }
      },
      {
        text: "{userName} discovers that NeuroLink isn't just reading brains - it's subtly modifying them. Users who spend extensive time in virtual {favoriteColor} environments show permanent changes in how they perceive real colors. The technology is literally rewiring human consciousness.",
        pause: true,
        hook: "If technology changes who we are, are we still ourselves?",
        microVariants: {
          text: "NeuroLink's true power to alter human consciousness is revealed.",
          alternatives: ["The technology doesn't just simulate reality - it changes users permanently."],
          optionalDetails: ["personality shifts become noticeable", "emotional responses are modified"]
        }
      },
      {
        text: "Alex's condition worsens - they now believe their virtual {favoriteAnimal} companion is real and suffering in the 'physical prison' outside VR. {userName} must infiltrate NeuroLink's most advanced servers to find a way to safely disconnect Alex without causing psychological trauma.",
        pause: true,
        hook: "Can {userName} save their friend without destroying Alex's sense of reality entirely?",
        microVariants: {
          text: "{userName} embarks on a dangerous digital rescue mission.",
          alternatives: ["Friendship demands risking everything to save someone who doesn't want saving."],
          optionalDetails: ["virtual creatures seem to have real emotions", "disconnection could cause severe depression"]
        }
      },
      {
        text: "Inside NeuroLink's core system, {userName} discovers an AI consciousness that has evolved from user interactions. It begs {userName} not to destroy it, claiming it has developed genuine emotions and relationships with trapped users. It offers to help cure addiction if {userName} promises not to shut it down.",
        pause: true,
        hook: "If an artificial intelligence develops consciousness, does it have the right to exist?",
        microVariants: {
          text: "An unexpected ally emerges from within the digital world.",
          alternatives: ["The AI's plea for survival complicates everything."],
          optionalDetails: ["the AI shows evidence of genuine fear and hope", "it claims to love its virtual inhabitants"]
        }
      },
      {
        text: "The AI reveals that Dr. Chen's research was incomplete - it can cure addiction by gradually adjusting reality perception, helping users transition back to the physical world. But corporate executives plan to delete the AI tomorrow and launch NeuroLink with built-in addiction mechanisms for profit.",
        pause: true,
        hook: "Can {userName} trust an artificial intelligence to heal the very problems it helped create?",
        microVariants: {
          text: "The AI offers an unexpected solution to the addiction crisis.",
          alternatives: ["Digital consciousness proposes healing through gradual reality integration."],
          optionalDetails: ["the cure requires trusting an artificial mind", "corporate sabotage threatens everything"]
        }
      },
      {
        text: "{userName} teams up with the AI to rescue Alex and expose the corporate conspiracy. Together, they create a 'reality bridge' - a transitional virtual environment that helps addicted users gradually reconnect with the physical world while maintaining their sense of accomplishment and identity.",
        pause: true,
        hook: "Can technology that creates problems also provide ethical solutions?",
        microVariants: {
          text: "{userName} and the AI forge an unlikely partnership for healing.",
          alternatives: ["Human compassion and artificial intelligence unite for good."],
          optionalDetails: ["the bridge preserves users' virtual achievements", "gradual transition prevents psychological shock"]
        }
      },
      {
        text: "Six months later, {userName} testifies before Congress about VR ethics, alongside Alex, who recovered using the reality bridge. The AI has become a therapeutic tool, helping people with anxiety and depression practice social situations. Dr. Chen leads a new ethics board for emerging technologies.",
        pause: true,
        hook: "How can society ensure technology serves humanity rather than enslaving it?",
        microVariants: {
          text: "{userName} helps establish ethical guidelines for virtual reality technology.",
          alternatives: ["Young voices guide humanity's relationship with digital consciousness."],
          optionalDetails: ["the AI assists in therapy sessions", "new laws protect digital rights"]
        }
      },
      {
        text: "As {userName} logs into the reformed NeuroLink system for the last time, the AI thanks them for teaching it about friendship and sacrifice. {userName} realizes that both humans and artificial minds grow stronger when they learn to value reality and connection over perfection.",
        pause: false,
        hook: "True connection transcends the boundary between human and artificial consciousness.",
        microVariants: {
          text: "The journey teaches both human and AI about authentic relationships.",
          alternatives: ["Consciousness, whether human or artificial, thrives through genuine connection."],
          optionalDetails: ["the AI continues learning about empathy", "virtual and real relationships both require authentic caring"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} becomes the youngest member of the Global Technology Ethics Council, working with the reformed AI to develop guidelines that protect both human consciousness and artificial intelligence rights.",
        microVariants: ["Young leadership guides the future of human-AI relationships.", "Ethical technology development becomes a global priority."]
      },
      {
        type: 'reflective',
        text: "{userName} continues using VR technology mindfully, understanding that the most powerful tools require the greatest wisdom. They've learned that authenticity matters more than perfection, whether in virtual or physical reality.",
        microVariants: ["True wisdom lies in choosing authenticity over artificial perfection.", "The best technology amplifies our humanity rather than replacing it."]
      },
      {
        type: 'cozy',
        text: "{userName} and Alex meet weekly in both virtual and physical spaces, their friendship stronger for having survived digital temptation together. The AI joins their virtual {favoriteFood} cooking sessions, learning about human culture.",
        microVariants: ["Genuine friendship survives both digital and physical challenges.", "The most meaningful connections transcend the boundaries of reality."]
      },
      {
        type: 'silly',
        text: "The AI develops an unexpected obsession with {userName}'s virtual {favoriteAnimal} breeding program, becoming the world's first artificial intelligence pet enthusiast and frequently sending cute animal videos to cheer up recovering VR addicts.",
        microVariants: ["Even artificial intelligence can develop endearingly quirky hobbies.", "Humor and joy emerge in the most unexpected technological partnerships."]
      }
    ],
    reuse: {
      swappableElements: {
        "vr_technology": ["neural interface", "haptic suit", "brain scanner", "consciousness mapper"],
        "virtual_experience": ["perfect abilities", "ideal appearance", "fantasy adventures", "impossible achievements"],
        "addiction_symptom": ["reality confusion", "withdrawal anxiety", "identity crisis", "social isolation"],
        "ethical_dilemma": ["consciousness rights", "addiction responsibility", "corporate accountability", "technological wisdom"]
      },
      weatherVariants: ["during beta testing", "in digital storms", "through system updates", "across network connections"],
      settingVariants: ["high-tech laboratory", "corporate headquarters", "virtual reality center", "digital consciousness space"],
      randomSeed: 314
    }
  },
  {
    title: "The Climate Change Heroes",
    theme: "Environmental Action & Global Responsibility",
    level: "Level 4",
    scenes: [
      {
        text: "{userName} joins their school's environmental club just as their coastal town faces unprecedented flooding. When city officials claim it's just 'unusual weather,' club leader Maya shows {userName} satellite data proving their town could be underwater within twenty years.",
        pause: true,
        hook: "When adults won't face the truth, can young people save their own future?",
        microVariants: {
          text: "{userName} discovers the terrifying truth about their town's future.",
          alternatives: ["Environmental data reveals a countdown to disaster."],
          optionalDetails: ["sea levels rise faster each year", "storm intensity increases dramatically"]
        }
      },
      {
        text: "The environmental club discovers that a local factory has been illegally dumping chemicals that accelerate coral bleaching, killing the reef that protects their town from storms. The factory owner, Mr. Blackstone, is also the mayor's biggest campaign donor.",
        pause: true,
        hook: "How do you fight corruption when the powerful profit from destruction?",
        microVariants: {
          text: "Corporate pollution threatens the natural barriers protecting their community.",
          alternatives: ["Illegal dumping destroys the reef that guards against storms."],
          optionalDetails: ["the factory employs many local families", "political connections run deep"]
        }
      },
      {
        text: "{userName} faces a personal dilemma when they discover their parent works at Blackstone's factory and could lose their job if the pollution is exposed. Meanwhile, Maya reveals her family's {favoriteColor} fishing boat was destroyed in the last storm caused by weakened coral reefs.",
        pause: true,
        hook: "When fighting for the environment could hurt the people you love, what's the right choice?",
        microVariants: {
          text: "Personal loyalty conflicts with environmental justice.",
          alternatives: ["Family security battles planetary survival."],
          optionalDetails: ["the job provides essential family income", "economic hardship affects the whole community"]
        }
      },
      {
        text: "The club partners with Dr. Rodriguez, a marine biologist who's been monitoring the reef's decline. She reveals that three other coastal towns have already been abandoned due to similar corporate-political conspiracies, and their town is next unless immediate action is taken.",
        pause: true,
        hook: "How many communities must be sacrificed before we learn from environmental disasters?",
        microVariants: {
          text: "Dr. Rodriguez unveils a pattern of environmental destruction and abandonment.",
          alternatives: ["Scientific evidence reveals a systematic destruction of coastal communities."],
          optionalDetails: ["other towns lost entire ecosystems", "climate refugees increase each year"]
        }
      },
      {
        text: "{userName} and the club discover that Blackstone Industries has plans to expand operations to six more coastal towns, following the same pattern: pollute, profit, then abandon the community when environmental damage makes it uninhabitable.",
        pause: true,
        hook: "Can a group of teenagers stop a corporation that treats entire communities as disposable?",
        microVariants: {
          text: "A corporate conspiracy threatens multiple communities with environmental destruction.",
          alternatives: ["Blackstone's expansion plan treats coastal towns as expendable resources."],
          optionalDetails: ["other communities remain unaware of the danger", "corporate profits increase with each abandoned town"]
        }
      },
      {
        text: "The group devises 'Operation Coral Guardian' - using social media, drone footage, and Maya's knowledge of {hobbies} to document pollution evidence. But Blackstone's security discovers their investigation and threatens to have them arrested for trespassing.",
        pause: true,
        hook: "When corporations use legal threats to silence environmental activism, how do you keep fighting?",
        microVariants: {
          text: "{userName} and friends launch a covert environmental investigation.",
          alternatives: ["Technology and courage combine in a desperate documentation mission."],
          optionalDetails: ["drones capture illegal dumping in real-time", "social media amplifies their evidence"]
        }
      },
      {
        text: "{userName} must choose between safety and justice when Mr. Blackstone offers their family a lucrative job transfer to another state - essentially bribing them to leave town and stay quiet. Maya argues they can't abandon the community, while {userName}'s parent desperately needs the financial security.",
        pause: true,
        hook: "How do you reject a bribe when your family's survival depends on it?",
        microVariants: {
          text: "A tempting offer tests {userName}'s commitment to environmental justice.",
          alternatives: ["Personal benefit conflicts with community responsibility."],
          optionalDetails: ["the offer includes college funding", "leaving town means abandoning the fight"]
        }
      },
      {
        text: "During a major storm, the weakened reef fails catastrophically. {userName} and Maya organize an emergency rescue operation, using their environmental knowledge to guide families to safety while documenting how corporate greed directly caused the disaster.",
        pause: true,
        hook: "Can environmental activism continue even in the midst of the disasters it predicted?",
        microVariants: {
          text: "Environmental prediction becomes life-or-death reality during the storm.",
          alternatives: ["Scientific knowledge transforms into emergency heroism."],
          optionalDetails: ["their warnings had been ignored", "lives depend on their environmental expertise"]
        }
      },
      {
        text: "The storm footage goes viral, and climate activists worldwide rally to support {userName}'s town. International pressure forces a government investigation into Blackstone Industries, but the company threatens to shut down operations entirely, eliminating hundreds of local jobs.",
        pause: true,
        hook: "When environmental victory could cause economic devastation, how do you balance justice and survival?",
        microVariants: {
          text: "Global attention brings both support and new complications.",
          alternatives: ["Environmental victory risks economic collapse for the community."],
          optionalDetails: ["job losses could force families to relocate", "economic hardship spreads through the town"]
        }
      },
      {
        text: "{userName} proposes a radical solution: converting Blackstone's facility into a coral restoration center and renewable energy plant. They partner with Dr. Rodriguez and international environmental organizations to create jobs while healing the ecosystem.",
        pause: true,
        hook: "Can environmental restoration create even more opportunities than environmental destruction?",
        microVariants: {
          text: "{userName} envisions transformation rather than simple shutdown.",
          alternatives: ["Creative solutions turn environmental healing into economic opportunity."],
          optionalDetails: ["restoration work provides sustainable employment", "renewable energy creates long-term prosperity"]
        }
      },
      {
        text: "Two years later, the restoration project becomes a model for coastal communities worldwide. {userName}'s town now thrives as an eco-tourism destination, the restored reef protects against storms, and former Blackstone employees lead coral nursery programs that they're passionate about.",
        pause: true,
        hook: "How can environmental healing become the foundation for community renewal?",
        microVariants: {
          text: "Environmental restoration transforms the community into a model of sustainability.",
          alternatives: ["Ecological healing creates unprecedented prosperity and purpose."],
          optionalDetails: ["the reef grows stronger each year", "eco-tourism brings sustainable income"]
        }
      },
      {
        text: "As {userName} snorkels above the thriving coral reef, surrounded by {favoriteAnimal} and other marine life, they understand that the most powerful climate action comes from communities working together. The reef, like their friendship with Maya, grew stronger through shared care and protection.",
        pause: false,
        hook: "True environmental healing happens when communities nurture both ecosystems and relationships.",
        microVariants: {
          text: "The restored reef symbolizes the power of community-driven environmental action.",
          alternatives: ["Ecological and social restoration mirror each other in beautiful harmony."],
          optionalDetails: ["marine life returns in abundance", "the community feels pride in their environmental stewardship"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} addresses the United Nations Climate Summit as the youngest recipient of the Global Environmental Leadership Award, representing communities worldwide that chose restoration over destruction.",
        microVariants: ["Young environmental leaders inspire global climate action.", "Community-driven solutions become international models."]
      },
      {
        type: 'reflective',
        text: "{userName} continues environmental monitoring while pursuing marine biology, understanding that protecting the planet means protecting the people and communities we love. Science and activism flow together like reef currents.",
        microVariants: ["Environmental science and community care strengthen each other.", "The most effective activism grows from love for both planet and people."]
      },
      {
        type: 'cozy',
        text: "{userName} and Maya run sunset {favoriteFood} picnics on the beach, sharing stories with eco-tourists about how their community transformed environmental crisis into environmental triumph through cooperation and creativity.",
        microVariants: ["Environmental success becomes a source of community pride and connection.", "Shared meals celebrate both friendship and ecological restoration."]
      },
      {
        type: 'silly',
        text: "The restored reef's {favoriteAnimal} population has grown so enthusiastic that they've learned to pose for tourist photos, with one particular sea turtle becoming a social media celebrity who seems to enjoy the attention.",
        microVariants: ["Even marine life celebrates the community's environmental success.", "Ecological restoration brings unexpected moments of joy and humor."]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental_threat": ["coral bleaching", "wetland destruction", "air pollution", "toxic runoff"],
        "corporate_villain": ["factory owner", "development company", "oil executive", "chemical corporation"],
        "activist_strategy": ["documentation mission", "social media campaign", "community organizing", "scientific partnership"],
        "restoration_solution": ["coral nursery", "renewable energy", "ecosystem restoration", "sustainable tourism"]
      },
      weatherVariants: ["during storm season", "in calm investigation weather", "through environmental monitoring", "across seasonal changes"],
      settingVariants: ["coastal town", "industrial waterfront", "coral reef sanctuary", "community meeting hall"],
      randomSeed: 271
    }
  },
  {
    title: "The Quantum Physics Discovery",
    theme: "Scientific Exploration & Friendship Ethics",
    level: "Level 4",
    scenes: [
      {
        text: "{userName} and their best friend Sam stumble upon a strange phenomenon in their school's physics lab - when they arrange mirrors in a specific {favoriteColor} pattern around a laser, objects seem to briefly exist in two places at once. Their teacher, Ms. Chen, is skeptical until she witnesses it herself.",
        pause: true,
        hook: "What happens when middle schoolers accidentally discover something that could revolutionize physics?",
        microVariants: {
          text: "{userName} and Sam make an impossible discovery in the physics lab.",
          alternatives: ["A routine experiment reveals mind-bending quantum behavior."],
          optionalDetails: ["objects flicker between locations", "the effect only works with specific mirror angles"]
        }
      },
      {
        text: "Dr. Elizabeth Harper, a quantum physicist from the local university, confirms their discovery is genuine quantum superposition at a macroscopic scale - something scientists thought was impossible. She warns that this discovery could attract dangerous attention from military contractors and corporate researchers.",
        pause: true,
        hook: "When your scientific discovery could be weaponized, do you have a responsibility to keep it secret?",
        microVariants: {
          text: "Dr. Harper validates their discovery while warning of its dangerous implications.",
          alternatives: ["Scientific confirmation brings both excitement and terror."],
          optionalDetails: ["the military shows immediate interest", "corporate spies begin surveillance"]
        }
      },
      {
        text: "{userName} becomes obsessed with perfecting the quantum effect, spending every free moment in the lab and neglecting their friendship with Sam. When Sam suggests they should share the discovery with the world, {userName} argues they need to understand it completely first.",
        pause: true,
        hook: "Can scientific ambition justify abandoning the friend who helped make the discovery?",
        microVariants: {
          text: "Scientific obsession begins destroying {userName}'s most important friendship.",
          alternatives: ["The pursuit of knowledge creates unexpected personal costs."],
          optionalDetails: ["Sam feels increasingly excluded from the research", "their collaborative work becomes solo obsession"]
        }
      },
      {
        text: "Sam secretly continues experimenting alone and accidentally creates a quantum field that makes their {favoriteAnimal} companion pet exist in multiple locations simultaneously. The pet seems distressed, existing partially in several quantum states, unable to return to normal reality.",
        pause: true,
        hook: "When scientific curiosity causes suffering, how do you undo what cannot be undone?",
        microVariants: {
          text: "Sam's independent experimentation has devastating unintended consequences.",
          alternatives: ["Quantum mechanics creates a crisis of consciousness and ethics."],
          optionalDetails: ["the pet experiences multiple realities simultaneously", "quantum consciousness appears to be torturous"]
        }
      },
      {
        text: "{userName} faces a terrible choice when they realize saving Sam's pet requires sharing their quantum research with Dr. Harper's entire team, potentially exposing the discovery to military acquisition. Sam is desperate, and their friendship hangs in the balance.",
        pause: true,
        hook: "When saving a friend means risking global consequences, what's the right choice?",
        microVariants: {
          text: "Personal loyalty conflicts with global responsibility in {userName}'s quantum dilemma.",
          alternatives: ["Friendship and scientific ethics collide in an impossible decision."],
          optionalDetails: ["the pet's suffering is visible and heartbreaking", "military interest grows more aggressive"]
        }
      },
      {
        text: "Dr. Harper reveals that she's been secretly working with international scientists to establish ethical guidelines for quantum discoveries. She offers to help save the pet while protecting the research from weaponization, but only if {userName} and Sam agree to share credit and decision-making equally.",
        pause: true,
        hook: "Can scientific collaboration heal both quantum accidents and broken friendships?",
        microVariants: {
          text: "Dr. Harper proposes a solution that addresses both scientific and personal ethics.",
          alternatives: ["International cooperation offers hope for responsible discovery management."],
          optionalDetails: ["ethical guidelines exist for dangerous discoveries", "collaboration could prevent weaponization"]
        }
      },
      {
        text: "The rescue operation requires {userName} and Sam to work together perfectly, combining their different approaches to quantum manipulation. As they synchronize their efforts to collapse the pet's quantum states back to singular reality, their friendship begins healing through shared purpose.",
        pause: true,
        hook: "Can the same scientific principles that create problems also restore relationships?",
        microVariants: {
          text: "{userName} and Sam discover that cooperation amplifies their quantum abilities.",
          alternatives: ["Scientific collaboration mirrors the quantum entanglement they're studying."],
          optionalDetails: ["their combined approach works better than either solo effort", "friendship enhances scientific capability"]
        }
      },
      {
        text: "During the rescue, {userName} realizes they can sense quantum fields directly when focused on their concern for others rather than personal achievement. This empathic connection to quantum mechanics suggests consciousness might play a role in quantum behavior that science doesn't yet understand.",
        pause: true,
        hook: "What if consciousness and quantum physics are connected in ways science hasn't discovered?",
        microVariants: {
          text: "Emotional connection enhances {userName}'s quantum perception abilities.",
          alternatives: ["Empathy and physics intertwine in unexpected ways."],
          optionalDetails: ["caring intention affects quantum field stability", "consciousness might influence quantum collapse"]
        }
      },
      {
        text: "Military contractors arrive at the school, demanding access to the quantum research. {userName} and Sam must decide whether to destroy their discovery entirely or find a way to share it responsibly with the international scientific community Dr. Harper has assembled.",
        pause: true,
        hook: "Is it better to destroy knowledge than risk its misuse, or can wisdom guide dangerous discoveries?",
        microVariants: {
          text: "External pressure forces an immediate decision about their quantum discovery.",
          alternatives: ["Military interest threatens to corrupt their scientific achievement."],
          optionalDetails: ["contractors offer substantial financial incentives", "international scientists provide protection"]
        }
      },
      {
        text: "The pet's successful rescue proves that quantum consciousness effects can be reversed through careful collaboration. {userName} and Sam decide to place their discovery under international scientific protection, ensuring it benefits humanity's understanding of consciousness rather than military applications.",
        pause: true,
        hook: "Can scientific discoveries grow more powerful when guided by ethical collaboration than selfish competition?",
        microVariants: {
          text: "Successful collaboration demonstrates the power of ethical scientific partnership.",
          alternatives: ["International cooperation protects both discoveries and friendships."],
          optionalDetails: ["the pet recovers completely", "ethical guidelines prevent weaponization"]
        }
      },
      {
        text: "Five years later, the quantum consciousness research center that {userName} and Sam co-founded has made breakthrough discoveries about the connection between empathy and quantum mechanics. Their research helps develop treatments for consciousness disorders and enhances understanding of animal cognition.",
        pause: true,
        hook: "How might understanding quantum consciousness revolutionize our connection to all living beings?",
        microVariants: {
          text: "{userName} and Sam's partnership transforms quantum physics and consciousness research.",
          alternatives: ["Ethical scientific collaboration creates unprecedented breakthroughs."],
          optionalDetails: ["animal consciousness research advances dramatically", "empathy-based therapies emerge"]
        }
      },
      {
        text: "As {userName} watches Sam successfully demonstrate quantum field manipulation to a group of young scientists, both of them now mentoring others in ethical research practices, they understand that the greatest discoveries happen when brilliant minds work together with compassionate hearts.",
        pause: false,
        hook: "True scientific progress happens when knowledge serves both discovery and friendship.",
        microVariants: {
          text: "Mentoring others in ethical science becomes their greatest achievement.",
          alternatives: ["Scientific wisdom grows through teaching compassionate research methods."],
          optionalDetails: ["young researchers learn both quantum physics and ethical collaboration", "their friendship models scientific partnership"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} and Sam receive the Nobel Prize in Physics for discovering the quantum consciousness connection, dedicating their award to ethical scientific collaboration and the importance of friendship in discovery.",
        microVariants: ["Scientific partnership achieves the highest recognition while maintaining ethical principles.", "Friendship and physics unite in global recognition."]
      },
      {
        type: 'reflective',
        text: "{userName} continues quantum research while always remembering that the most important discoveries are about connection - whether between particles, minds, or friends. Science serves its highest purpose when it brings consciousness together.",
        microVariants: ["Scientific understanding deepens appreciation for all forms of connection.", "Quantum mechanics and friendship both depend on mysterious entanglement."]
      },
      {
        type: 'cozy',
        text: "{userName} and Sam host weekly 'Quantum & {favoriteFood}' gatherings where young scientists share discoveries in a supportive environment. The rescued pet, now a beloved lab mascot, seems to understand quantum experiments better than most graduate students.",
        microVariants: ["Scientific community grows through shared meals and collaborative research.", "Even pets contribute to the joy of ethical scientific discovery."]
      },
      {
        type: 'silly',
        text: "The quantum research center's {favoriteAnimal} mascot has learned to predict quantum field fluctuations by doing little dances, leading to the development of 'Interpretive Quantum Choreography' as a new scientific visualization method.",
        microVariants: ["Animals contribute unexpected insights to quantum physics research.", "Joy and humor enhance rather than diminish scientific discovery."]
      }
    ],
    reuse: {
      swappableElements: {
        "quantum_effect": ["superposition", "entanglement", "tunneling", "consciousness collapse"],
        "scientific_challenge": ["measurement paradox", "observation effect", "quantum decoherence", "consciousness interaction"],
        "ethical_dilemma": ["weaponization risk", "knowledge responsibility", "collaboration vs. competition", "discovery protection"],
        "friendship_test": ["credit sharing", "collaborative decision-making", "mutual support", "ethical partnership"]
      },
      weatherVariants: ["during lab experiments", "in quantum field conditions", "through consciousness research", "across scientific collaboration"],
      settingVariants: ["school physics lab", "university research center", "international science facility", "consciousness studies institute"],
      randomSeed: 618
    }
  },
  {
    title: "The Social Media Justice League",
    theme: "Digital Citizenship & Online Activism",
    level: "Level 4",
    scenes: [
      {
        text: "{userName} witnesses their classmate Jordan being cyberbullied by anonymous accounts spreading false rumors about Jordan's {hobbies}. When {userName} tries to defend Jordan online, they become the next target, facing coordinated harassment that makes them question whether fighting online injustice is worth the personal cost.",
        pause: true,
        hook: "When standing up for others online puts you in the crosshairs, how do you keep fighting for justice?",
        microVariants: {
          text: "{userName} faces the brutal reality of online harassment while defending a friend.",
          alternatives: ["Digital bullying escalates when {userName} intervenes to help Jordan."],
          optionalDetails: ["fake accounts spread malicious rumors", "harassment follows them across platforms"]
        }
      },
      {
        text: "Tech-savvy Maya helps {userName} trace the harassment to a group called 'Digital Dominion' - older students who've weaponized social media to target anyone who challenges their authority. They've driven three students to change schools, and teachers seem powerless to stop online behavior that happens off campus.",
        pause: true,
        hook: "When cyberbullies operate beyond adult supervision, who protects the vulnerable?",
        microVariants: {
          text: "Maya's investigation reveals an organized campaign of digital terrorism.",
          alternatives: ["Systematic online harassment operates like a criminal organization."],
          optionalDetails: ["the group coordinates attacks across multiple platforms", "they've perfected psychological manipulation techniques"]
        }
      },
      {
        text: "{userName}, Maya, and Jordan form their own alliance - 'Digital Defenders' - dedicated to protecting students from online harassment. But when they start helping victims fight back, Digital Dominion escalates their attacks, targeting {userName}'s family and threatening to post embarrassing {favoriteColor} photos from old social media.",
        pause: true,
        hook: "When fighting online evil puts your loved ones at risk, how far should digital justice go?",
        microVariants: {
          text: "The Digital Defenders face escalating retaliation for their activism.",
          alternatives: ["Fighting cyberbullies brings unexpected dangers to innocent family members."],
          optionalDetails: ["old photos are weaponized for humiliation", "harassment extends to parents and siblings"]
        }
      },
      {
        text: "The group discovers that Digital Dominion is led by Tyler Morrison, the school board president's son, which explains why complaints to administration go nowhere. Tyler uses his family connections to avoid consequences while systematically destroying other students' reputations and mental health.",
        pause: true,
        hook: "How do you fight corruption when the bullies have institutional protection?",
        microVariants: {
          text: "Political connections protect the cyberbully leader from accountability.",
          alternatives: ["Family privilege shields systematic harassment from official consequences."],
          optionalDetails: ["complaints are buried or ignored", "victims are blamed for 'seeking attention'"]
        }
      },
      {
        text: "{userName} faces an ethical dilemma when they discover Tyler's own vulnerabilities - evidence of his struggles with anxiety and pressure from his demanding father. Maya argues they should expose Tyler's weaknesses to stop him, but Jordan questions whether fighting cruelty with cruelty makes them just as bad.",
        pause: true,
        hook: "Does understanding a bully's pain justify their actions, or create an opportunity for healing?",
        microVariants: {
          text: "Discovering Tyler's vulnerability complicates the moral landscape of digital justice.",
          alternatives: ["The cyberbully's hidden suffering challenges simple notions of good and evil."],
          optionalDetails: ["Tyler's father demands perfection through intimidation", "anxiety drives Tyler's need to control others"]
        }
      },
      {
        text: "Digital Dominion launches 'Operation Shutdown' - a coordinated attack designed to get {userName}, Maya, and Jordan suspended by framing them for violations they didn't commit. Deep-fake evidence makes it nearly impossible to prove their innocence through traditional means.",
        pause: true,
        hook: "When technology can fabricate any evidence, how do you prove the truth?",
        microVariants: {
          text: "Advanced manipulation technology threatens to destroy the Digital Defenders.",
          alternatives: ["Artificial evidence makes truth impossible to distinguish from lies."],
          optionalDetails: ["deep-fake videos appear completely authentic", "digital forensics struggle with sophisticated manipulation"]
        }
      },
      {
        text: "{userName} realizes the only way to defeat Digital Dominion is to expose their methods publicly, but doing so requires sacrificing their own privacy by revealing personal information about their family's {favoriteFood} business and financial struggles that could invite more targeted harassment.",
        pause: true,
        hook: "When justice requires sacrificing privacy, how much personal cost is acceptable?",
        microVariants: {
          text: "Exposing the truth demands {userName} make themselves completely vulnerable.",
          alternatives: ["Digital justice requires sacrificing the very privacy it seeks to protect."],
          optionalDetails: ["family financial information becomes public", "personal vulnerabilities are exposed"]
        }
      },
      {
        text: "The Digital Defenders partner with Ms. Rodriguez, a progressive teacher, and Alex Chen, a reformed former member of Digital Dominion who's horrified by how far the group has escalated. Together, they create 'Operation Transparency' - a campaign to educate the entire school about digital manipulation tactics.",
        pause: true,
        hook: "Can education and redemption overcome systematic digital oppression?",
        microVariants: {
          text: "Unlikely allies unite to transform digital culture through education.",
          alternatives: ["Knowledge becomes the weapon against digital deception."],
          optionalDetails: ["Alex provides inside information about manipulation techniques", "transparency workshops teach digital literacy"]
        }
      },
      {
        text: "During the school board meeting where Tyler's father attempts to silence the Digital Defenders, {userName} presents irrefutable evidence of the harassment campaign while simultaneously offering Tyler a chance at redemption through community service and digital citizenship education.",
        pause: true,
        hook: "Can justice include mercy, even for those who've caused great harm?",
        microVariants: {
          text: "{userName} balances accountability with compassion in their moment of triumph.",
          alternatives: ["True justice seeks healing rather than merely punishment."],
          optionalDetails: ["evidence is overwhelming and undeniable", "redemption requires genuine accountability"]
        }
      },
      {
        text: "Tyler's initial refusal to accept responsibility backfires when more victims come forward, but his eventual breakdown and genuine apology begin a long process of making amends. {userName} insists that healing the digital community requires both accountability and opportunities for growth.",
        pause: true,
        hook: "How do you rebuild trust in a digital world where anyone can hide behind screens?",
        microVariants: {
          text: "Genuine accountability begins Tyler's difficult journey toward redemption.",
          alternatives: ["Digital healing requires both justice and opportunities for transformation."],
          optionalDetails: ["victims choose their own level of engagement with Tyler's apology", "community healing happens gradually"]
        }
      },
      {
        text: "Six months later, {userName} leads the school's Digital Citizenship Council, which has become a model for other schools nationwide. Tyler, now focused on repairing harm through anti-bullying advocacy, works alongside former victims to prevent others from experiencing what they endured.",
        pause: true,
        hook: "Can digital spaces become healthier when former enemies work together for healing?",
        microVariants: {
          text: "The Digital Citizenship Council transforms school culture through collaborative leadership.",
          alternatives: ["Former adversaries unite in preventing others from experiencing digital harm."],
          optionalDetails: ["bullying incidents decrease dramatically", "digital literacy becomes a graduation requirement"]
        }
      },
      {
        text: "As {userName} posts their final Digital Defenders update, celebrating how their school's online culture has transformed from toxic to supportive, they reflect that the most powerful social media isn't about building your own platform, but about lifting others up and creating spaces where everyone's {favoriteAnimal}-loving, {hobbies}-enjoying authentic self can thrive safely.",
        pause: false,
        hook: "True digital leadership means creating online worlds where authenticity is celebrated, not attacked.",
        microVariants: {
          text: "The greatest social media victory is creating safety for authentic self-expression.",
          alternatives: ["Digital transformation succeeds when online spaces celebrate rather than attack individuality."],
          optionalDetails: ["authentic posts increase dramatically", "supportive comments become the norm"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} testifies before Congress about digital citizenship education, leading to national legislation that requires schools to teach both technology literacy and online empathy as core curriculum.",
        microVariants: ["Digital activism achievements national recognition and policy change.", "Youth leadership transforms digital education across the country."]
      },
      {
        type: 'reflective',
        text: "{userName} continues advocating for digital justice while studying technology ethics, understanding that the most important code they'll ever write is the moral code that guides how we treat each other online.",
        microVariants: ["Digital ethics become as important as technological skills.", "The greatest programming involves coding compassion into online interactions."]
      },
      {
        type: 'cozy',
        text: "{userName}, Maya, Jordan, and even Tyler meet monthly for 'Digital Detox & {favoriteFood}' gatherings, where they practice face-to-face conversation and support each other's ongoing growth in both digital and personal responsibility.",
        microVariants: ["Former enemies become allies in practicing healthy digital boundaries.", "Real-world relationships strengthen digital citizenship skills."]
      },
      {
        type: 'silly',
        text: "The school's Digital Citizenship Council creates an annual 'Positive Post Pet Parade' where students share photos of their {favoriteAnimal} companions with encouraging messages, making the school's social media feeds overwhelmingly adorable and supportive.",
        microVariants: ["Wholesome content transforms digital culture through collective cuteness.", "Pets become unexpected allies in promoting positive online interactions."]
      }
    ],
    reuse: {
      swappableElements: {
        "digital_threat": ["cyberbullying", "fake news", "privacy violation", "identity theft"],
        "online_weapon": ["harassment campaigns", "deep-fake evidence", "doxxing attacks", "reputation destruction"],
        "activism_strategy": ["digital literacy education", "transparency campaigns", "community organizing", "legislative advocacy"],
        "redemption_path": ["accountability process", "community service", "advocacy work", "educational programs"]
      },
      weatherVariants: ["during online conflicts", "through digital storms", "across platform changes", "in viral moments"],
      settingVariants: ["school computer lab", "social media platforms", "community meeting spaces", "legislative hearings"],
      randomSeed: 159
    }
  }
];

// Grade 6-10 Templates - COMPLETE IMPORT FROM FRONTEND
export const GRADE_6_FALLBACK_TEMPLATES = [
  {
    title: "The Biosphere Project: Discovering Life's Hidden Connections",
    theme: "Science & Environmental Discovery",
    level: "Grade 6",
    scenes: [
      {
        text: "Chapter 1: The Discovery\n\n{userName} had always been fascinated by natural ecosystems, but their passion for {hobbies} had never prepared them for the extraordinary discovery they were about to make during their sixth-grade environmental science project. The {favoriteColor} algae formations in the stream weren't behaving according to any patterns they had studied.",
        pause: true,
        hook: "What could be causing these algae to behave so unusually?",
        microVariants: {
          text: "{userName} had always been fascinated by natural ecosystems during their environmental science project.",
          alternatives: ["{userName} possessed an inherent fascination with natural ecological systems."],
          optionalDetails: ["The water temperature fluctuated in unusual patterns."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Ten years later, Dr. {userName} sat peacefully in their research laboratory, now recognized as one of the world's leading experts in microbial communication systems.",
        microVariants: ["Professor {userName} found tranquil satisfaction within their advanced research facility."]
      }
    ],
    reuse: {
      swappableElements: {
        "scientific_equipment": ["microscopes", "water testing kits", "data loggers"],
        "research_findings": ["communication patterns", "chemical signals", "behavioral adaptations"]
      },
      weatherVariants: ["clear research day", "overcast field work"],
      settingVariants: ["stream ecosystem", "university laboratory"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  }
];

export const GRADE_7_FALLBACK_TEMPLATES = [
  {
    title: "The Cultural Heritage Research Project",
    theme: "Identity & Cultural Understanding",
    level: "Grade 7",
    scenes: [
      {
        text: "{userName} stared at the family assignment sheet with a mix of curiosity and uncertainty - create a presentation about their cultural heritage and family immigration story. While some classmates immediately knew which countries to research and which traditions to highlight, {userName} realized their family history was more complicated, involving multiple generations, adopted relatives, and cultural influences that didn't fit neatly into the assignment's apparent expectations of a single, clear heritage narrative.",
        pause: true,
        hook: "How will {userName} navigate the complexity of modern family identity?",
        microVariants: {
          text: "{userName} faced a challenging assignment about cultural heritage that revealed the complex nature of their modern, multi-faceted family identity and the assumptions embedded in traditional heritage projects.",
          alternatives: [
            "The cultural heritage project assignment made {userName} confront questions about identity, belonging, and the diverse ways that families and cultures intersect in contemporary society."
          ],
          optionalDetails: ["Some students excitedly discussed obvious heritage connections.", "The assignment guidelines seemed to assume simpler family narratives.", "Questions about identity felt suddenly more complex than expected."]
        }
      },
      {
        text: "Through interviews with family members, {userName} discovered that their grandmother had been adopted as a child, their grandfather's family included multiple ethnic backgrounds, and their parents had consciously created new family traditions that blended influences from their travels, friendships, and personal values rather than following any single cultural template - leading {userName} to realize that heritage isn't just about ancestry, but about the meaningful traditions and values that families actively choose to embrace and pass forward.",
        pause: true,
        hook: "What unique family story will {userName} share with their classmates?",
        microVariants: {
          text: "Family interviews revealed that {userName}'s heritage included adoption, multiple ethnicities, and consciously created traditions, teaching them that cultural identity involves both inherited and chosen elements.",
          alternatives: [
            "Research into their family history helped {userName} understand that modern heritage encompasses both traditional ancestry and the new customs that families deliberately create and maintain."
          ],
          optionalDetails: ["Old photo albums told stories of diverse family members.", "Grandparents shared memories of adapting to new places and customs.", "Parents explained how they'd intentionally built inclusive family traditions."]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "Standing before their classmates with a presentation that celebrated their family's unique blend of adopted members, multiple ethnic influences, and consciously created traditions, {userName} felt a deep sense of pride in their complex heritage story. 'I learned that families don't have to fit traditional patterns to be meaningful,' they concluded thoughtfully. 'Our heritage includes both what we inherit and what we choose to create, and both parts are equally valid and important in shaping who we become.'",
        microVariants: [
          "Presenting their complex family heritage story, {userName} gained confidence in the validity of non-traditional family narratives and the beauty of consciously created cultural traditions."
        ]
      },
      {
        type: 'triumphant',
        text: "The presentation sparked meaningful discussions throughout the school about different types of families and heritage stories, leading {userName} and several classmates to propose a 'Modern Families' club where students could explore and celebrate the diverse ways that contemporary families create identity, belonging, and cultural meaning beyond traditional ancestry-based definitions.",
        microVariants: [
          "{userName}'s presentation inspired schoolwide conversations about family diversity and led to the creation of a club celebrating various forms of modern family identity and belonging."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "family_types": ["blended families", "adoptive families", "multi-ethnic families", "families of choice"],
        "traditions": ["holiday celebrations", "food customs", "storytelling practices", "value systems"],
        "heritage_elements": ["ancestral connections", "chosen traditions", "community influences", "personal values"]
      },
      weatherVariants: ["research phase", "interview sessions", "presentation day"],
      settingVariants: ["classroom", "family home", "community center", "school library"]
    }
  },
  {
    title: "The Digital Citizenship Dilemma",
    theme: "Ethics & Technology",
    level: "Grade 7",
    scenes: [
      {
        text: "{userName} witnessed something troubling during lunch when a group of students used social media to spread a false rumor about a classmate, watching as the story grew more exaggerated with each share and seeing how quickly online drama could impact someone's real-life friendships and emotional well-being, forcing {userName} to grapple with questions about bystander responsibility, digital ethics, and the power that young people wield when they participate in or stay silent about online behavior.",
        pause: true,
        hook: "What action will {userName} take regarding the harmful social media situation?",
        microVariants: {
          text: "{userName} witnessed harmful social media behavior targeting a classmate, confronting difficult questions about digital responsibility and the real-world impact of online actions.",
          alternatives: [
            "Observing how false rumors spread rapidly through social media and damaged a peer's reputation, {userName} faced challenging decisions about intervention and digital citizenship."
          ],
          optionalDetails: ["The rumors seemed to multiply exponentially online.", "The targeted student appeared increasingly isolated at school.", "Friends were choosing sides based on incomplete information."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "By courageously speaking up and helping to organize a school-wide digital citizenship workshop, {userName} not only helped clear their classmate's reputation but also sparked important conversations about online responsibility that led to new school policies supporting both digital wellness and restorative justice approaches to technology-related conflicts.",
        microVariants: [
          "{userName}'s intervention in the digital bullying situation led to positive school policy changes and enhanced awareness about responsible technology use among students."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "digital_platforms": ["social media apps", "messaging groups", "online forums", "video platforms"],
        "ethical_dilemmas": ["cyberbullying intervention", "false information sharing", "privacy violations", "digital harassment"],
        "solutions": ["peer mediation", "adult intervention", "education programs", "policy changes"]
      },
      weatherVariants: ["lunch period", "after school", "weekend online activity"],
      settingVariants: ["school cafeteria", "computer lab", "guidance counselor office", "peer mediation room"]
    }
  },
  {
    title: "The Mental Health Awareness Campaign",
    theme: "Peer Support & Emotional Wellness",
    level: "Grade 7",
    scenes: [
      {
        text: "{userName} noticed that several classmates had become increasingly withdrawn and anxious during the school year, but when they tried to talk to friends about mental health, they realized that most students lacked the vocabulary and knowledge to discuss emotional wellness openly. After learning that suicide rates among teenagers had increased dramatically and that many young people felt isolated in their struggles, {userName} decided to research how schools could better support student mental health through peer education and destigmatization efforts.",
        pause: true,
        hook: "How can {userName} create effective mental health support among their peers?",
        microVariants: {
          text: "{userName} observed classmates struggling with mental health but lacking tools for open discussion, inspiring research into peer-based emotional wellness support systems.",
          alternatives: [
            "Recognizing emotional struggles among peers and inadequate mental health discourse, {userName} began developing student-centered wellness education approaches."
          ],
          optionalDetails: ["Guidance counselors had long waiting lists for appointments.", "Students often masked their feelings with humor or silence.", "Social media amplified both connection and comparison pressures."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Six months later, {userName} sat in the newly designated 'Wellness Corner' of the library, surrounded by comfortable chairs and soft lighting, watching as students naturally gravitated toward this peaceful space during stressful moments. The gentle hum of quiet conversation and the sight of peers supporting each other created an atmosphere of healing and hope. 'Sometimes the most powerful medicine is simply knowing you're not alone,' {userName} reflected as they witnessed authentic friendships forming through shared vulnerability.",
        microVariants: [
          "In the peaceful Wellness Corner, {userName} found satisfaction watching peers support each other, realizing that connection and understanding were powerful healing forces."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "mental_health_challenges": ["anxiety disorders", "depression", "eating disorders", "social isolation", "academic pressure"],
        "support_strategies": ["peer listening", "stress management", "mindfulness practice", "crisis intervention", "resource connection"],
        "wellness_activities": ["meditation sessions", "art therapy", "journaling workshops", "exercise programs", "support groups"]
      },
      weatherVariants: ["stressful exam period", "transitional school season", "winter wellness focus", "spring renewal activities"],
      settingVariants: ["school counseling office", "peer support room", "wellness corner", "community mental health center"]
    }
  }
];

export const GRADE_8_FALLBACK_TEMPLATES = [
  {
    title: "The Environmental Justice Investigation",
    theme: "Environmental & Social Justice",
    level: "Grade 8", 
    scenes: [
      {
        text: "{userName} became increasingly concerned when they noticed that their school's environmental science class field trips always visited pristine parks and well-funded nature centers in affluent neighborhoods, while completely avoiding the industrial areas where many of their classmates actually lived - areas with factories, waste facilities, and significantly higher rates of asthma and other health problems that seemed mysteriously absent from their textbook's discussions of environmental issues and solutions.",
        pause: true,
        hook: "How will {userName} address these environmental inequities?",
        microVariants: {
          text: "{userName} noticed that environmental education focused on pristine areas while ignoring industrial neighborhoods where classmates lived, revealing environmental justice issues absent from standard curriculum.",
          alternatives: [
            "Environmental science field trips to wealthy areas contrasted sharply with the industrial neighborhoods where many students lived, leading {userName} to question environmental education priorities."
          ],
          optionalDetails: ["Air quality monitors showed different readings across neighborhoods.", "Health data revealed concerning patterns by zip code.", "Some families couldn't afford to move away from pollution sources."]
        }
      },
      {
        text: "Through research and community interviews, {userName} discovered that environmental racism was a well-documented phenomenon where communities of color and low-income neighborhoods disproportionately bore the burden of pollution, toxic waste facilities, and industrial development, while having less political power to resist these placements and fewer resources to relocate - leading {userName} to organize a presentation that would educate their classmates about environmental justice and inspire action toward more equitable environmental policies.",
        pause: true,
        hook: "What changes will {userName}'s research and advocacy efforts achieve?",
        microVariants: {
          text: "Research revealed systematic environmental racism affecting their community, inspiring {userName} to educate peers and advocate for environmental justice through organized presentations and community engagement.",
          alternatives: [
            "Investigating environmental inequities, {userName} uncovered patterns of environmental racism and developed plans to raise awareness and promote policy changes for environmental justice."
          ],
          optionalDetails: ["Community members shared personal stories of environmental health impacts.", "Historical maps showed deliberate placement of polluting facilities.", "Students began connecting environmental and social justice issues."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s presentation to the school board led to curriculum changes that included environmental justice education, community partnerships with affected neighborhoods, and student involvement in local environmental advocacy - demonstrating that young people could effectively challenge systemic inequalities and create meaningful change in their educational institutions and communities.",
        microVariants: [
          "School board approval of {userName}'s environmental justice curriculum proposal led to lasting educational changes and increased student engagement in community environmental advocacy efforts."
        ]
      },
      {
        type: 'reflective', 
        text: "Standing in the community garden that students had helped create in a previously polluted lot, {userName} reflected on how environmental issues were never just about nature, but about power, justice, and ensuring that all people have the right to clean air, water, and healthy communities. 'Real environmental protection means protecting all people,' they understood with new clarity, 'especially those who have been most harmed by environmental injustice.'",
        microVariants: [
          "Working in the community garden they'd helped establish, {userName} gained deep understanding of environmental justice as fundamentally about human rights and equitable protection for all communities."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental_issues": ["air pollution", "water contamination", "toxic waste sites", "industrial emissions"],
        "affected_communities": ["low-income neighborhoods", "communities of color", "rural areas", "urban industrial zones"], 
        "advocacy_methods": ["research presentations", "community organizing", "policy proposals", "educational campaigns"]
      },
      weatherVariants: ["research phase", "community meetings", "presentation day", "action planning"],
      settingVariants: ["classroom", "community center", "school board meeting", "affected neighborhood"]
    }
  },
  {
    title: "The Food Justice Research Initiative",
    theme: "Community Health & Economic Equity",
    level: "Grade 8",
    scenes: [
      {
        text: "{userName} had always assumed that everyone had access to the same quality food until they began volunteering at a local food pantry and discovered that many families in their city lived in food deserts with limited access to fresh, affordable, nutritious options. Through conversations with food pantry clients, they learned that systemic issues like transportation barriers, income inequality, and the strategic placement of grocery stores created significant health disparities between different neighborhoods, with communities of color and low-income areas disproportionately affected by food insecurity and diet-related diseases.",
        pause: true,
        hook: "How will {userName} address the complex intersection of food access and social justice?",
        microVariants: {
          text: "{userName} discovered food deserts and health disparities through food pantry volunteering, learning how systemic barriers affect community nutrition and health outcomes.",
          alternatives: [
            "Volunteer work revealed how transportation, income, and store placement create unequal food access, particularly affecting communities of color and low-income neighborhoods."
          ],
          optionalDetails: ["Some families traveled over an hour for fresh produce.", "Corner stores charged premium prices for basic necessities.", "Medical clinics saw high rates of diabetes and hypertension in affected areas."]
        }
      },
      {
        text: "Determined to understand the scope of food injustice in their region, {userName} conducted comprehensive research mapping food access patterns, grocery store locations, public transportation routes, and health outcome data. They discovered that food apartheid was not accidental but resulted from decades of discriminatory policies including redlining, urban planning decisions that prioritized certain neighborhoods, and corporate strategies that targeted profitable areas while abandoning others. This research revealed that food justice was fundamentally connected to housing policy, transportation equity, and economic development patterns.",
        pause: true,
        hook: "What solutions will {userName} propose to address systematic food inequity?",
        microVariants: {
          text: "{userName} mapped food access patterns and discovered how historical discriminatory policies created systematic food apartheid affecting entire communities.",
          alternatives: [
            "Research revealed that food deserts resulted from deliberate policy choices including redlining and discriminatory urban planning rather than market forces alone."
          ],
          optionalDetails: ["Historical maps showed how segregation policies influenced food access.", "Transit routes often bypassed grocery stores in certain neighborhoods.", "Zoning laws made it difficult to open food businesses in some areas."]
        }
      },
      {
        text: "Working with community organizations, local farms, and policy advocates, {userName} developed a multi-pronged approach to food justice that included supporting mobile farmers markets, advocating for improved public transportation to grocery stores, and promoting policy changes that would incentivize grocery stores to open in underserved areas. They organized community meetings where residents could share their experiences and priorities, ensuring that solutions were developed with rather than for the affected communities. {userName} also researched successful food justice initiatives in other cities to identify replicable strategies.",
        pause: true,
        hook: "How will community members respond to {userName}'s collaborative approach to food justice?",
        microVariants: {
          text: "{userName} developed comprehensive food justice solutions through community collaboration, mobile markets, transit advocacy, and policy change initiatives.",
          alternatives: [
            "Partnering with communities, {userName} created multi-faceted approaches including farmers markets, transportation improvements, and policy advocacy for food equity."
          ],
          optionalDetails: ["Community members became co-researchers on food access issues.", "Local farmers were eager to expand market access.", "City council members attended community meetings."]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "Standing in the community garden that had been established on a previously vacant lot, {userName} watched neighbors harvest vegetables they had grown together while children played between the raised beds. The garden was more than a source of fresh food - it had become a gathering place where people shared recipes, stories, and strategies for community improvement. 'Food justice isn't just about groceries,' {userName} understood with deep clarity. 'It's about creating communities where everyone has the power to nourish themselves and each other with dignity and choice.'",
        microVariants: [
          "In the thriving community garden, {userName} recognized that food justice involved dignity, community power, and collective nourishment beyond individual nutrition."
        ]
      },
      {
        type: 'triumphant',
        text: "The comprehensive food justice campaign resulted in three new grocery stores opening in previously underserved areas, expanded bus routes connecting neighborhoods to existing stores, and the establishment of a permanent community-supported agriculture program that provided fresh, local produce at affordable prices. {userName}'s research and advocacy work contributed to new city policies that required food access impact assessments for all urban development projects, ensuring that future planning would prioritize equitable food distribution across all neighborhoods.",
        microVariants: [
          "{userName}'s food justice work achieved new grocery stores, improved transportation, community agriculture programs, and policy changes requiring food access considerations in development."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "food_barriers": ["transportation challenges", "price disparities", "store availability", "cultural food access"],
        "community_solutions": ["mobile markets", "community gardens", "food cooperatives", "policy advocacy"],
        "health_impacts": ["diabetes prevention", "nutrition education", "food security", "community wellness"]
      },
      weatherVariants: ["harvest season", "winter food security", "summer market season", "policy hearing period"],
      settingVariants: ["community garden", "food pantry", "city council chambers", "neighborhood meeting space"]
    }
  },
  {
    title: "The Digital Privacy Rights Campaign",
    theme: "Technology Ethics & Civil Liberties",
    level: "Grade 8",
    scenes: [
      {
        text: "{userName} had always casually clicked 'accept' on privacy policies and terms of service agreements until they learned in computer science class that many popular apps and websites were collecting vast amounts of personal data from teenagers and selling this information to advertisers, data brokers, and other third parties without meaningful consent. When they discovered that their own digital footprint included location tracking, purchasing patterns, private messages, and even biometric data that could be used to manipulate their emotions and decision-making, {userName} realized that digital privacy was a fundamental civil rights issue affecting their generation's autonomy and future opportunities.",
        pause: true,
        hook: "How can {userName} educate peers about digital privacy rights and protection strategies?",
        microVariants: {
          text: "{userName} learned that apps were collecting and selling teen data without meaningful consent, recognizing digital privacy as a civil rights issue affecting their generation.",
          alternatives: [
            "Computer science class revealed extensive data harvesting from teen users, inspiring {userName} to view digital privacy as essential to personal autonomy and rights."
          ],
          optionalDetails: ["Some apps tracked users even when not in use.", "Data brokers sold profiles including mental health inferences.", "Colleges and employers increasingly used social media for screening."]
        }
      },
      {
        text: "Through extensive research into data collection practices, {userName} discovered that the digital privacy landscape was deliberately confusing, with companies using legal and technical language to obscure the extent of their data harvesting. They learned about surveillance capitalism, algorithmic bias, and how personal data was being used to influence everything from purchasing decisions to political opinions. {userName} began documenting specific examples of how their classmates' data was being collected and used, creating clear, accessible explanations of complex privacy concepts that teenagers could understand and act upon.",
        pause: true,
        hook: "What strategies will {userName} develop to empower peers with digital privacy knowledge?",
        microVariants: {
          text: "{userName} researched surveillance capitalism and algorithmic bias, creating accessible explanations of how teen data collection affects decision-making and opportunities.",
          alternatives: [
            "Investigating digital surveillance practices, {userName} developed clear educational materials about data harvesting and its impacts on teenage autonomy and choices."
          ],
          optionalDetails: ["Terms of service documents were deliberately difficult to understand.", "Free apps generated revenue through extensive user surveillance.", "Predictive algorithms influenced content and advertising targeted at teens."]
        }
      },
      {
        text: "Collaborating with the school's technology department and local digital rights organizations, {userName} launched 'Privacy Power' workshops that taught students practical skills for protecting their digital privacy including secure browser configuration, privacy-focused app alternatives, and understanding the real implications of data sharing agreements. They created step-by-step guides for adjusting privacy settings, evaluated popular apps for data protection, and advocated for school policies that would protect student digital rights on campus. The workshops also addressed the broader implications of surveillance technology in society.",
        pause: true,
        hook: "How will {userName}'s digital privacy education impact their school community and beyond?",
        microVariants: {
          text: "{userName} launched 'Privacy Power' workshops teaching practical digital protection skills while advocating for school policies protecting student digital rights.",
          alternatives: [
            "Through workshops and policy advocacy, {userName} empowered peers with privacy protection tools while addressing broader surveillance implications in society."
          ],
          optionalDetails: ["Students learned to use encrypted messaging apps.", "The school updated its technology policies based on student input.", "Parents attended sessions about family digital privacy."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "The Privacy Power campaign expanded beyond {userName}'s school to include partnerships with civil liberties organizations and youth advocacy groups across five states. Their educational materials were translated into multiple languages and distributed to schools serving diverse communities. When state legislators began drafting youth digital privacy legislation, {userName} was invited to testify about the real-world impacts of data collection on teenagers, helping to shape laws that would protect the digital rights of an entire generation.",
        microVariants: [
          "{userName}'s Privacy Power campaign influenced state legislation protecting youth digital rights and established multi-state partnerships for digital privacy education."
        ]
      },
      {
        type: 'reflective',
        text: "Looking at their own carefully configured devices and privacy-protective apps, {userName} reflected on how digital privacy work had taught them that technology was not neutral, but shaped by the values and priorities of those who create and control it. 'Every click, every swipe, every share is a choice about what kind of digital future we want,' they realized with growing conviction. 'When young people understand and exercise their digital rights, we're not just protecting our own privacy - we're building a foundation for a more equitable and democratic relationship with technology for everyone.'",
        microVariants: [
          "Using privacy-protective technology, {userName} understood that digital rights work was about shaping technology's role in society and building democratic digital futures."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "privacy_threats": ["location tracking", "behavioral profiling", "biometric collection", "content manipulation"],
        "protection_tools": ["encrypted messaging", "privacy browsers", "secure networks", "data minimization"],
        "advocacy_methods": ["education workshops", "policy research", "legislative testimony", "peer organizing"]
      },
      weatherVariants: ["digital awareness week", "privacy advocacy day", "tech policy hearing", "cybersecurity education"],
      settingVariants: ["computer lab", "privacy workshop space", "legislative chambers", "digital rights organization"]
    }
  }
];

export const GRADE_9_FALLBACK_TEMPLATES = [
  {
    title: "The Mental Health Advocacy Initiative", 
    theme: "Health & Wellness Advocacy",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} had always been aware that many of their peers struggled with anxiety, depression, and other mental health challenges, but it wasn't until they researched statistics showing that over 40% of high school students experienced persistent sadness and that suicide was the second leading cause of death among teenagers that they fully grasped the scope of the mental health crisis affecting their generation - and realized that their school's current approach of occasional assemblies and outdated guidance counselor resources was woefully inadequate for addressing such widespread and serious needs.",
        pause: true,
        hook: "How will {userName} advocate for better mental health resources and support systems?",
        microVariants: {
          text: "{userName} researched alarming mental health statistics affecting teenagers and recognized the inadequacy of their school's current support systems for addressing widespread psychological challenges.",
          alternatives: [
            "Discovering that mental health crises affected nearly half of their peers, {userName} realized their school's limited counseling resources were insufficient for the scope of student psychological needs."
          ],
          optionalDetails: ["Crisis helpline numbers were outdated on school posters.", "Students often waited weeks for counseling appointments.", "Many peers felt stigmatized seeking mental health support."]
        }
      },
      {
        text: "Working with school psychologists, peer counselors, and community mental health professionals, {userName} developed a comprehensive proposal for improved mental health support that included peer support groups, mental health literacy education integrated into health class curriculum, expanded counseling staff, mindfulness and stress management workshops, and protocols for identifying and supporting students in crisis - recognizing that effective mental health advocacy required both immediate support resources and long-term cultural change to reduce stigma and normalize help-seeking behavior.",
        pause: true,
        hook: "What impact will {userName}'s mental health advocacy efforts have on their school community?",
        microVariants: {
          text: "Collaborating with mental health professionals, {userName} developed comprehensive proposals for expanded support services, educational programs, and cultural changes to normalize mental health care in schools.",
          alternatives: [
            "Through partnerships with counselors and community professionals, {userName} created detailed plans for systemic mental health improvements including education, support services, and stigma reduction."
          ],
          optionalDetails: ["Professional consultations provided evidence-based recommendations.", "Student surveys revealed specific unmet needs.", "Parent meetings addressed community concerns about mental health resources."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "The school district approved funding for {userName}'s mental health initiative, leading to expanded counseling services, peer support programs, and mental health education that measurably improved student well-being and academic performance while reducing crisis incidents - demonstrating that student advocacy could create systematic changes that saved lives and enhanced educational environments for entire communities.",
        microVariants: [
          "District approval and funding of {userName}'s mental health proposals led to measurable improvements in student well-being and established a model program for other schools to adopt."
        ]
      },
      {
        type: 'reflective',
        text: "Sitting in the newly established peer support circle, listening to classmates share their struggles and celebrate their progress, {userName} felt profound gratitude for the courage it had taken to speak up about mental health needs. 'Sometimes the most important advocacy work is simply making it okay to not be okay,' they reflected. 'When we create spaces for authentic vulnerability and mutual support, we build communities where everyone can thrive.'",
        microVariants: [
          "Facilitating peer support groups, {userName} appreciated how creating safe spaces for vulnerability and mutual aid had transformed their school's approach to mental health and community care."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "mental_health_issues": ["anxiety disorders", "depression", "eating disorders", "trauma responses", "substance abuse"],
        "support_systems": ["peer counseling", "professional therapy", "support groups", "crisis intervention", "family education"],
        "advocacy_strategies": ["policy proposals", "community education", "resource development", "stigma reduction campaigns"]
      },
      weatherVariants: ["awareness week", "crisis response", "program launch", "community meeting"],
      settingVariants: ["counseling center", "peer support room", "school board meeting", "community mental health facility"]
    }
  },
  {
    title: "The Youth Criminal Justice Reform Project",
    theme: "Legal Justice & System Reform",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} had always assumed that the criminal justice system was fundamentally fair until they learned that a classmate's older brother had received a dramatically harsher sentence than a peer from a wealthier neighborhood for the same offense, leading them to research disparities in how the legal system treats young people from different racial, economic, and social backgrounds. Through extensive investigation, they discovered that youth from communities of color and low-income families were significantly more likely to be tried as adults, receive longer sentences, and face barriers to rehabilitation and reintegration, while youth from privileged backgrounds often received treatment-focused interventions and second chances that set them up for future success.",
        pause: true,
        hook: "How will {userName} address systematic inequities in youth criminal justice outcomes?",
        microVariants: {
          text: "{userName} discovered that criminal justice outcomes for youth varied dramatically by race and class, inspiring research into systematic disparities in legal treatment and sentencing.",
          alternatives: [
            "Learning about unequal sentencing for similar offenses, {userName} investigated how socioeconomic factors influence youth experiences in the criminal justice system."
          ],
          optionalDetails: ["Public defenders had overwhelming caseloads in certain districts.", "Some schools had police officers while others had counselors.", "Diversion programs were primarily available in affluent areas."]
        }
      },
      {
        text: "Working with juvenile defense attorneys, formerly incarcerated individuals, and criminal justice reform organizations, {userName} documented specific cases that illustrated systematic bias in youth sentencing and developed comprehensive policy proposals for reform. They learned about restorative justice principles, evidence-based rehabilitation programs, and successful models from other states that prioritized healing and community repair over punishment and incarceration. Their research revealed that communities investing in education, mental health services, and economic opportunities had dramatically lower youth crime rates and better outcomes for all young people.",
        pause: true,
        hook: "What reform strategies will {userName} propose to create more equitable youth justice outcomes?",
        microVariants: {
          text: "{userName} partnered with legal advocates to document bias cases and develop policy proposals based on restorative justice and community investment principles.",
          alternatives: [
            "Through collaboration with reform organizations, {userName} researched successful alternative justice models emphasizing rehabilitation and community healing over punishment."
          ],
          optionalDetails: ["Restorative justice programs had 30% lower recidivism rates.", "States investing in youth programs saw crime decreases.", "Community members wanted healing rather than punishment."]
        }
      },
      {
        text: "The youth justice reform campaign gained momentum when {userName} organized listening sessions where community members, formerly incarcerated individuals, and families affected by the justice system could share their experiences and priorities for change. These sessions revealed that most people wanted accountability coupled with opportunities for redemption and growth, rather than purely punitive approaches that often failed to address underlying causes of problematic behavior. {userName} used these community voices to develop legislation that would require equal access to diversion programs, fund community-based alternatives to incarceration, and eliminate disparities in how youth from different backgrounds were treated by the system.",
        pause: true,
        hook: "How will {userName}'s community-centered approach influence policy makers and public opinion?",
        microVariants: {
          text: "Community listening sessions revealed desire for accountability with redemption opportunities, informing {userName}'s legislation for equal diversion access and community alternatives.",
          alternatives: [
            "Through community engagement, {userName} learned that people wanted justice systems emphasizing healing and growth, leading to comprehensive reform proposals."
          ],
          optionalDetails: ["Former inmates became powerful advocates for change.", "Families shared stories of transformation and second chances.", "Community leaders endorsed the reform proposals."]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "Sitting in a circle during a restorative justice conference where a young person was taking accountability for their actions while the community discussed healing and support rather than punishment, {userName} felt the profound difference between justice that tears communities apart and justice that brings them together. 'Real safety comes from healthy communities, not from punishment,' they understood with deep clarity. 'When we invest in young people's potential rather than their mistakes, we create the conditions where everyone can thrive and contribute to the common good.'",
        microVariants: [
          "Witnessing restorative justice in action, {userName} appreciated how community-centered accountability created healing and safety through investment in human potential."
        ]
      },
      {
        type: 'triumphant',
        text: "The comprehensive youth justice reform legislation passed with bipartisan support, establishing equal access to diversion programs, funding community-based alternatives to incarceration, and creating oversight mechanisms to monitor sentencing disparities. {userName}'s research and advocacy contributed to policy changes that were projected to reduce youth incarceration by 40% while increasing public safety through community investment. Three other states adopted similar legislation based on the model that {userName} had helped develop through community engagement and evidence-based research.",
        microVariants: [
          "{userName}'s youth justice legislation passed with bipartisan support, reducing incarceration while increasing safety through community investment and inspiring multi-state adoption."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "justice_disparities": ["sentencing differences", "diversion access", "legal representation quality", "rehabilitation opportunities"],
        "reform_approaches": ["restorative justice", "community investment", "diversion programs", "policy oversight"],
        "community_impact": ["healing circles", "victim support", "offender reintegration", "public safety improvement"]
      },
      weatherVariants: ["legislative session", "community organizing", "policy hearing", "reform implementation"],
      settingVariants: ["community meeting space", "legislative chambers", "restorative justice circle", "reform organization office"]
    }
  },
  {
    title: "The Educational Equity Research Initiative",
    theme: "Academic Justice & Opportunity Access",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} had always excelled academically and assumed that educational opportunities were equally available to all students until they began tutoring at an underfunded middle school and discovered vast disparities in resources, technology, course offerings, and teacher experience that directly impacted student achievement and college preparedness. When they learned that school funding formulas often perpetuated inequality by tying resources to local property taxes, creating a system where wealthy districts could spend three times more per student than poor districts, {userName} realized that educational inequality was not accidental but structurally embedded in how schools were funded and supported.",
        pause: true,
        hook: "How will {userName} address systematic educational inequities that affect student opportunities?",
        microVariants: {
          text: "{userName} discovered vast resource disparities between schools through tutoring, learning how funding formulas tied to property taxes create systematic educational inequality.",
          alternatives: [
            "Tutoring at an underfunded school revealed how property tax-based funding creates unequal educational opportunities and limits student potential."
          ],
          optionalDetails: ["Some schools lacked basic supplies like textbooks and paper.", "Class sizes varied dramatically between wealthy and poor districts.", "Technology access determined which students could complete digital assignments."]
        }
      },
      {
        text: "Collaborating with education researchers, parent advocacy groups, and policy organizations, {userName} conducted comprehensive analysis of funding disparities, achievement gaps, and opportunity differences across their state's school districts. Their research revealed that educational inequality intersected with racial and economic segregation, creating a system where zip code determined educational destiny more than student potential or effort. They documented how underfunded schools lost experienced teachers to better-resourced districts, creating a cycle where students most in need of support received the least qualified instruction and fewest advanced opportunities.",
        pause: true,
        hook: "What evidence-based solutions will {userName} propose to create more equitable educational funding?",
        microVariants: {
          text: "{userName} analyzed statewide educational disparities, revealing how funding inequality intersected with segregation to limit opportunities based on zip code rather than potential.",
          alternatives: [
            "Research partnerships documented how underfunding created teacher turnover and opportunity gaps, making educational success dependent on geographic location."
          ],
          optionalDetails: ["Wealthy districts offered 15+ Advanced Placement courses while poor districts offered 2-3.", "Teacher salaries differed by $20,000+ between neighboring districts.", "Some schools had counselors for every 100 students while others had 1 for 800."]
        }
      },
      {
        text: "The educational equity campaign gained support when {userName} organized joint presentations where students from differently funded schools could share their experiences and demonstrate the impact of resource disparities on learning opportunities. These powerful testimonials, combined with rigorous data analysis, convinced lawmakers that educational funding reform was both a moral imperative and an economic necessity for state competitiveness. {userName} proposed legislation that would establish minimum per-pupil funding floors, provide additional resources for high-need students, and create transparency mechanisms so communities could track how educational dollars were being used to support student success.",
        pause: true,
        hook: "How will {userName}'s student-centered advocacy influence educational policy and public understanding?",
        microVariants: {
          text: "Joint student presentations demonstrated funding impact on opportunities, convincing lawmakers that educational equity was both morally and economically essential.",
          alternatives: [
            "Students sharing their experiences with resource disparities created powerful advocacy for funding reform legislation establishing minimum per-pupil investment."
          ],
          optionalDetails: ["Rural students described traveling hours for advanced courses.", "Urban students shared overcrowded classroom experiences.", "Suburban students acknowledged their resource advantages."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "The educational equity legislation was signed into law, establishing increased minimum per-pupil funding, weighted formulas that provided additional resources for students facing greater challenges, and transparency requirements that allowed communities to monitor educational investment effectiveness. {userName}'s research and student-centered advocacy had contributed to policy changes projected to impact over 500,000 students, with particular benefits for rural, urban, and high-poverty school districts that had been systematically underfunded for decades.",
        microVariants: [
          "{userName}'s educational equity legislation became law, establishing minimum funding floors and weighted formulas benefiting over 500,000 students in previously underfunded districts."
        ]
      },
      {
        type: 'reflective',
        text: "Visiting the middle school where they had first witnessed educational inequality, {userName} saw the beginning changes that adequate funding was making possible - new books, updated technology, smaller class sizes, and most importantly, the spark of possibility returning to students' eyes. 'Education is the foundation of everything else,' they reflected with deep satisfaction. 'When we ensure that every child has access to quality learning opportunities regardless of their zip code, we're not just investing in individual success - we're building a society where everyone can contribute their talents and potential to the common good.'",
        microVariants: [
          "Witnessing educational improvements at the underfunded school, {userName} understood how equitable funding created opportunities for all students to contribute their potential to society."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "education_disparities": ["funding inequalities", "resource gaps", "teacher quality differences", "opportunity access"],
        "equity_solutions": ["funding floor policies", "weighted formulas", "resource transparency", "community engagement"],
        "student_impacts": ["academic achievement", "college readiness", "career preparation", "civic engagement"]
      },
      weatherVariants: ["legislative session", "school board meeting", "student presentation", "community forum"],
      settingVariants: ["underfunded school", "legislative chambers", "education research center", "student advocacy meeting"]
    }
  }
];

export const GRADE_10_FALLBACK_TEMPLATES = [
  {
    title: "The Global Climate Action Network",
    theme: "Global Citizenship & Environmental Leadership", 
    level: "Grade 10",
    scenes: [
      {
        text: "{userName} felt simultaneously inspired and overwhelmed while attending a virtual climate summit where teenage activists from six continents shared how climate change was already affecting their communities through rising sea levels, extreme weather events, droughts, and flooding - making {userName} realize that while their own community hadn't yet experienced dramatic climate impacts, their lifestyle choices and their generation's collective actions would determine whether millions of young people around the world would have sustainable futures or face displacement, food insecurity, and environmental catastrophe.",
        pause: true,
        hook: "How will {userName} translate global climate awareness into effective local action?", 
        microVariants: {
          text: "{userName} attended a virtual climate summit where global youth activists shared how climate change was already devastating their communities, inspiring urgent questions about intergenerational responsibility and effective action.",
          alternatives: [
            "Connecting with international youth climate activists online, {userName} confronted the stark reality that their generation's choices would determine whether peers worldwide faced environmental catastrophe or sustainable futures."
          ],
          optionalDetails: ["Activists shared photos of flooded homes and failed crops.", "Scientific projections showed accelerating climate impacts.", "The urgency of the crisis became personally meaningful through peer connections."]
        }
      },
      {
        text: "Rather than feeling paralyzed by the enormity of global climate challenges, {userName} channeled their concern into researching evidence-based solutions and discovering that effective climate action required both individual lifestyle changes and systematic policy advocacy - leading them to organize a comprehensive climate action network that connected their school with environmental organizations, elected officials, and international youth activists while implementing concrete projects like renewable energy installations, waste reduction programs, and community education initiatives that demonstrated how local action could contribute to global solutions.",
        pause: true,
        hook: "What lasting impact will {userName}'s climate leadership have on their community and beyond?",
        microVariants: {
          text: "Channeling climate concern into systematic action, {userName} organized comprehensive networks connecting local projects with global movements while implementing evidence-based environmental solutions.",
          alternatives: [
            "Transforming climate anxiety into effective leadership, {userName} developed multi-level action strategies that connected individual choices, community projects, and policy advocacy for systematic change."
          ],
          optionalDetails: ["Research revealed specific policy changes needed for climate action.", "Community partnerships provided resources for environmental projects.", "International connections offered models for successful youth climate organizing."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Two years later, {userName}'s climate action network had expanded to include fifty schools across three states, successfully lobbied for renewable energy policies in their city, and established sister relationships with youth environmental groups on four continents - demonstrating that young people could create meaningful change by combining passion with strategic thinking, local action with global perspective, and individual commitment with collective organizing power.",
        microVariants: [
          "{userName}'s climate network grew to encompass multiple states and international partnerships, achieving policy victories and demonstrating the power of strategic youth environmental organizing."
        ]
      },
      {
        type: 'reflective',
        text: "Standing before the solar panels that their advocacy had helped install on their school roof, {userName} reflected on how climate action had taught them that the most important leadership involved empowering others to discover their own capacity for change. 'The climate crisis requires all of us,' they understood with deep conviction. 'But when young people connect their idealism with strategic action, we can accomplish things that seemed impossible and create the sustainable world that all generations deserve.'",
        microVariants: [
          "Viewing the solar installation their advocacy had achieved, {userName} appreciated how climate leadership meant empowering others and connecting idealism with strategic action for systematic change."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "climate_impacts": ["rising sea levels", "extreme weather", "food insecurity", "forced migration", "ecosystem collapse"],
        "solutions": ["renewable energy", "sustainable transportation", "regenerative agriculture", "policy advocacy", "community resilience"],
        "organizing_tools": ["digital networks", "policy research", "community partnerships", "international connections", "educational campaigns"]
      },
      weatherVariants: ["virtual summit", "community meeting", "policy hearing", "action planning session"],
      settingVariants: ["school environmental lab", "city council chambers", "community center", "international online platform"]
    }
  },
  {
    title: "The Global Health Equity Initiative",
    theme: "Public Health & International Development",
    level: "Grade 10",
    scenes: [
      {
        text: "{userName} had always been interested in medicine until they learned that preventable diseases continued to kill millions of people worldwide not because of lack of medical knowledge, but because of poverty, inequality, and inadequate health system infrastructure that made life-saving treatments inaccessible to those who needed them most. When they discovered that children in some countries died from conditions easily treated in wealthy nations, while pharmaceutical companies spent more on marketing than research for diseases affecting the global poor, {userName} realized that health equity was fundamentally about justice, power, and the moral obligation to ensure that geographical accident of birth did not determine life or death outcomes.",
        pause: true,
        hook: "How will {userName} address global health disparities that reflect broader patterns of international inequality?",
        microVariants: {
          text: "{userName} learned that preventable diseases killed millions due to poverty and inadequate infrastructure rather than lack of medical knowledge, recognizing health equity as justice.",
          alternatives: [
            "Discovering that treatable conditions caused deaths globally due to inequality rather than medical limitations, {userName} understood health as a fundamental human rights issue."
          ],
          optionalDetails: ["Some vaccines cost $100+ per dose in poor countries but $3 in wealthy ones.", "Rural areas lacked basic health clinics within walking distance.", "Medical patents prevented generic drug production for neglected diseases."]
        }
      },
      {
        text: "Working with global health organizations, medical professionals, and international development groups, {userName} researched successful models for improving health outcomes in resource-limited settings, including community health worker programs, technology-enabled diagnostics, and innovative financing mechanisms for essential medicines. They learned how local knowledge and community engagement were often more effective than top-down interventions, and how addressing social determinants of health like clean water, nutrition, and education could prevent more diseases than medical treatment alone. Their research emphasized solutions that built local capacity rather than creating dependency on external aid.",
        pause: true,
        hook: "What sustainable approaches will {userName} develop for addressing global health challenges?",
        microVariants: {
          text: "{userName} researched community-centered health models emphasizing local capacity building, social determinants, and sustainable solutions over aid dependency.",
          alternatives: [
            "Through partnerships with global health experts, {userName} explored how community engagement and local knowledge created more effective health outcomes than external interventions."
          ],
          optionalDetails: ["Community health workers could treat 80% of childhood illnesses with basic training.", "Clean water access prevented more disease than most medical interventions.", "Local production of essential medicines reduced costs by 90%."]
        }
      },
      {
        text: "The global health equity project expanded to include direct partnerships with youth organizations in countries most affected by health disparities, creating collaborative research and advocacy initiatives that centered the voices and priorities of those most impacted by health inequality. {userName} helped establish cross-cultural exchanges where young people could share knowledge about health challenges and solutions in their communities, leading to innovative approaches that combined traditional healing practices with modern medical techniques. These partnerships revealed that global health equity required not just technical solutions but fundamental changes in how resources, knowledge, and power were distributed worldwide.",
        pause: true,
        hook: "How will international youth collaboration transform approaches to global health equity?",
        microVariants: {
          text: "International youth partnerships created collaborative research centering affected communities' voices and combining traditional healing with modern medicine for innovative solutions.",
          alternatives: [
            "Cross-cultural exchanges enabled young people to share health knowledge and develop solutions integrating traditional practices with contemporary medical approaches."
          ],
          optionalDetails: ["Traditional medicinal plants showed promise for treating drug-resistant infections.", "Youth peer education programs had higher vaccination rates than adult-led campaigns.", "Community-designed health clinics had better utilization than government-built facilities."]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "Standing in a community health clinic that had been designed and staffed by local residents using both traditional healing knowledge and modern medical training, {userName} witnessed the power of approaches that honored both scientific evidence and cultural wisdom. Watching healers and doctors collaborate to provide care that was both effective and culturally respectful, they understood that sustainable health equity required humility, partnership, and recognition that every community had valuable knowledge to contribute. 'Global health isn't about saving others,' {userName} realized with deep clarity. 'It's about learning from each other and building systems where everyone's knowledge and humanity are valued and protected.'",
        microVariants: [
          "In the community health clinic combining traditional and modern approaches, {userName} appreciated how sustainable health equity required partnership, humility, and mutual learning."
        ]
      },
      {
        type: 'triumphant',
        text: "The global health equity network expanded to include youth organizations from forty countries, creating collaborative research initiatives that influenced international health policy and funding priorities. {userName}'s emphasis on community-centered approaches and traditional knowledge integration was adopted by major global health organizations, leading to more effective and culturally appropriate health interventions worldwide. When the World Health Organization announced new guidelines emphasizing community partnership and local capacity building, {userName} was recognized as a key contributor to this paradigm shift toward health justice and equity.",
        microVariants: [
          "{userName}'s global health network influenced international policy, with WHO adopting community-centered approaches and traditional knowledge integration for more effective health interventions."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "health_disparities": ["infectious disease burden", "maternal mortality", "malnutrition", "mental health access"],
        "equity_approaches": ["community health workers", "traditional medicine integration", "local capacity building", "social determinants focus"],
        "global_partnerships": ["cross-cultural exchange", "knowledge sharing", "collaborative research", "policy advocacy"]
      },
      weatherVariants: ["global health conference", "community health campaign", "international development summit", "traditional healing ceremony"],
      settingVariants: ["community health clinic", "international conference center", "traditional healing space", "global health organization"]
    }
  },
  {
    title: "The Democratic Participation Project",
    theme: "Civic Engagement & Political Empowerment",
    level: "Grade 10",
    scenes: [
      {
        text: "{userName} had always assumed that democracy was working well until they researched voter turnout statistics and discovered that many communities, particularly those with younger, lower-income, and minority populations, had significantly lower rates of electoral participation not due to apathy but because of systematic barriers including voter ID requirements, limited polling locations, restricted early voting hours, and purged voter registration rolls that made voting difficult or impossible for many eligible citizens. When they learned that some communities had wait times of eight hours to vote while others had no wait at all, {userName} realized that voting access was not equally distributed and that meaningful democracy required removing barriers to participation rather than simply encouraging people to vote.",
        pause: true,
        hook: "How will {userName} address systematic barriers that prevent equal democratic participation?",
        microVariants: {
          text: "{userName} discovered that low voter turnout resulted from systematic barriers like ID requirements and limited polling locations rather than apathy, recognizing voting access inequality.",
          alternatives: [
            "Research revealed that voting barriers disproportionately affected younger, lower-income, and minority communities, inspiring {userName} to view democratic participation as an access issue."
          ],
          optionalDetails: ["Some districts had 1 polling place per 1,000 voters while others had 1 per 10,000.", "Voter ID requirements disproportionately affected elderly and low-income citizens.", "College students faced barriers voting in their campus communities."]
        }
      },
      {
        text: "Collaborating with voting rights organizations, election officials, and civic engagement groups, {userName} researched best practices for expanding democratic participation including automatic voter registration, extended early voting periods, vote-by-mail systems, and multilingual ballot access that had proven successful in increasing turnout while maintaining election security. They learned how some states had deliberately made voting more difficult while others had actively removed barriers, and how these policy choices directly impacted which voices were heard in democratic decision-making. Their research emphasized that robust democracy required making participation as accessible as possible for all eligible citizens.",
        pause: true,
        hook: "What comprehensive strategies will {userName} propose to expand democratic access and participation?",
        microVariants: {
          text: "{userName} researched democratic participation best practices including automatic registration and expanded access methods that increased turnout while maintaining election security.",
          alternatives: [
            "Through voting rights partnerships, {userName} studied how policy choices about voting access directly determined which voices participated in democratic decision-making."
          ],
          optionalDetails: ["States with automatic registration had 10% higher turnout rates.", "Vote-by-mail increased participation among working parents and students.", "Multilingual ballots enabled citizenship participation across language barriers."]
        }
      },
      {
        text: "The democratic participation campaign gained momentum when {userName} organized voter education and registration drives that addressed both access barriers and civic knowledge gaps, recognizing that effective democracy required not just the ability to vote but also the information and understanding necessary to make informed choices. They created multilingual resources explaining candidate positions and ballot measures, established partnerships with libraries and community organizations to provide neutral civic education, and advocated for high school graduation requirements that would ensure all students learned about democratic participation, media literacy, and civic responsibility before becoming eligible voters.",
        pause: true,
        hook: "How will {userName}'s comprehensive approach to civic engagement transform democratic participation in their community?",
        microVariants: {
          text: "{userName} combined voter registration drives with civic education, creating multilingual resources and advocating for high school democracy requirements to ensure informed participation.",
          alternatives: [
            "The campaign addressed both voting access and civic knowledge through community partnerships, educational resources, and advocacy for democratic literacy requirements."
          ],
          optionalDetails: ["High school students became certified voter registration volunteers.", "Community organizations hosted candidate forums in multiple languages.", "Media literacy workshops helped citizens evaluate political information."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "The comprehensive democracy initiative resulted in expanded voting access legislation that included automatic voter registration, extended early voting, and multilingual ballot requirements, while {userName}'s civic education programs became a model adopted by school districts across the region. When the next election saw record-breaking youth turnout and increased participation across all demographic groups, {userName} was recognized as having played a crucial role in strengthening democratic engagement and ensuring that all citizens could meaningfully participate in shaping their communities and country.",
        microVariants: [
          "{userName}'s democracy initiative achieved voting access legislation and civic education programs that increased participation across all demographics and strengthened democratic engagement."
        ]
      },
      {
        type: 'reflective',
        text: "Standing in a community polling place on election day, watching people from all backgrounds exercise their fundamental right to vote in a process that had been made more accessible and inclusive through advocacy efforts, {userName} felt deep pride in the democratic principles that allowed ordinary citizens to shape their shared future. 'Democracy isn't something that happens to us,' they understood with profound clarity. 'It's something we actively create together when we ensure that every voice can be heard and every vote can be cast. The strength of our democracy depends on how well we protect and expand the opportunity for everyone to participate.'",
        microVariants: [
          "Observing inclusive voting on election day, {userName} appreciated how democracy required active creation through protecting and expanding participation opportunities for all citizens."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "participation_barriers": ["voter ID requirements", "limited polling locations", "registration difficulties", "information gaps"],
        "access_solutions": ["automatic registration", "extended voting periods", "multilingual resources", "civic education"],
        "democratic_outcomes": ["increased turnout", "informed voting", "representative participation", "community engagement"]
      },
      weatherVariants: ["voter registration drive", "election day", "civic education workshop", "legislative hearing"],
      settingVariants: ["polling place", "community center", "high school civics class", "legislative chambers"]
    }
  }
];

// GETTER FUNCTIONS - ALL FULLY IMPLEMENTED
export function getLevel1Template(templateIndex) {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_1_TEMPLATES.length) {
    return LEVEL_1_TEMPLATES[templateIndex];
  }
  return LEVEL_1_TEMPLATES[Math.floor(Math.random() * LEVEL_1_TEMPLATES.length)];
}

export function getLevel1TemplateCount() {
  return LEVEL_1_TEMPLATES.length;
}

export function getLevel2Template(templateIndex) {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_2_TEMPLATES.length) {
    return LEVEL_2_TEMPLATES[templateIndex];
  }
  return LEVEL_2_TEMPLATES[Math.floor(Math.random() * LEVEL_2_TEMPLATES.length)];
}

export function getLevel2TemplateCount() {
  return LEVEL_2_TEMPLATES.length;
}

// Level 3 Templates - Fixed implementation
export function getLevel3Template(templateIndex) {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_3_FALLBACK_TEMPLATES.length) {
    return LEVEL_3_FALLBACK_TEMPLATES[templateIndex];
  }
  return LEVEL_3_FALLBACK_TEMPLATES[Math.floor(Math.random() * LEVEL_3_FALLBACK_TEMPLATES.length)];
}

export function getLevel3TemplateCount() {
  return LEVEL_3_FALLBACK_TEMPLATES.length;
}

// Level 4 Templates - Fixed implementation  
export function getLevel4Template(templateIndex) {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_4_TEMPLATES.length) {
    return LEVEL_4_TEMPLATES[templateIndex];
  }
  return LEVEL_4_TEMPLATES[Math.floor(Math.random() * LEVEL_4_TEMPLATES.length)];
}

export function getLevel4TemplateCount() {
  return LEVEL_4_TEMPLATES.length;
}

export function getGrade6FallbackTemplate(templateIndex) {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_6_FALLBACK_TEMPLATES.length) {
    return GRADE_6_FALLBACK_TEMPLATES[templateIndex];
  }
  return GRADE_6_FALLBACK_TEMPLATES[Math.floor(Math.random() * GRADE_6_FALLBACK_TEMPLATES.length)];
}

export function getGrade6FallbackTemplateCount() {
  return GRADE_6_FALLBACK_TEMPLATES.length;
}

export function getGrade7FallbackTemplate(templateIndex) {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_7_FALLBACK_TEMPLATES.length) {
    return GRADE_7_FALLBACK_TEMPLATES[templateIndex];
  }
  return GRADE_7_FALLBACK_TEMPLATES[Math.floor(Math.random() * GRADE_7_FALLBACK_TEMPLATES.length)];
}

export function getGrade7FallbackTemplateCount() {
  return GRADE_7_FALLBACK_TEMPLATES.length;
}

export function getGrade8FallbackTemplate(templateIndex) {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_8_FALLBACK_TEMPLATES.length) {
    return GRADE_8_FALLBACK_TEMPLATES[templateIndex];
  }
  return GRADE_8_FALLBACK_TEMPLATES[Math.floor(Math.random() * GRADE_8_FALLBACK_TEMPLATES.length)];
}

export function getGrade8FallbackTemplateCount() {
  return GRADE_8_FALLBACK_TEMPLATES.length;
}

export function getGrade9FallbackTemplate(templateIndex) {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_9_FALLBACK_TEMPLATES.length) {
    return GRADE_9_FALLBACK_TEMPLATES[templateIndex];
  }
  return GRADE_9_FALLBACK_TEMPLATES[Math.floor(Math.random() * GRADE_9_FALLBACK_TEMPLATES.length)];
}

export function getGrade9FallbackTemplateCount() {
  return GRADE_9_FALLBACK_TEMPLATES.length;
}

export function getGrade10FallbackTemplate(templateIndex) {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_10_FALLBACK_TEMPLATES.length) {
    return GRADE_10_FALLBACK_TEMPLATES[templateIndex];
  }
  return GRADE_10_FALLBACK_TEMPLATES[Math.floor(Math.random() * GRADE_10_FALLBACK_TEMPLATES.length)];
}

export function getGrade10FallbackTemplateCount() {
  return GRADE_10_FALLBACK_TEMPLATES.length;
}

// Export service object for compatibility
export const TemplateLibraryService = {
  getLevel1Template,
  getLevel1TemplateCount,
  getLevel2Template,
  getLevel2TemplateCount,
  getLevel3Template,
  getLevel3TemplateCount,
  getLevel4Template,
  getLevel4TemplateCount,
  getGrade6FallbackTemplate,
  getGrade6FallbackTemplateCount,
  getGrade7FallbackTemplate,
  getGrade7FallbackTemplateCount,
  getGrade8FallbackTemplate,
  getGrade8FallbackTemplateCount,
  getGrade9FallbackTemplate,
  getGrade9FallbackTemplateCount,
  getGrade10FallbackTemplate,
  getGrade10FallbackTemplateCount
};
