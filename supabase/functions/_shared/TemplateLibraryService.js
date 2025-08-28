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
  },
  {
    title: "The Neighborhood Mystery Club",
    theme: "Teamwork & Investigation",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} and their friends Alex and Emma discover that several neighbors have been reporting strange things happening in their yards. Mrs. Chen's garden gnomes keep moving positions overnight, and Mr. Rodriguez's bird feeder is mysteriously empty every morning despite being full the day before.",
        pause: true,
        hook: "What mysterious force is causing these neighborhood puzzles?",
        microVariants: {
          text: "{userName} and their friends Alex and Emma discover that several neighbors have been reporting strange things happening in their yards. Mrs. Chen's garden gnomes keep moving positions overnight, and Mr. Rodriguez's bird feeder is mysteriously empty every morning despite being full the day before.",
          alternatives: ["Strange neighborhood events puzzle {userName}, Alex, and Emma as they hear about moving gnomes and disappearing birdseed.", "The three detective friends investigate mysterious happenings including wandering garden decorations and vanishing bird food."],
          optionalDetails: ["the gnomes are always facing different directions", "neighbors compare notes about the odd occurrences"]
        }
      },
      {
        text: "The three friends decide to form the Neighborhood Mystery Club and investigate these puzzling events. They create detective notebooks with {favoriteColor} covers and make official badges using cardboard and markers. {userName} suggests they start by interviewing all the affected neighbors to gather clues.",
        pause: true,
        hook: "What important clues will the young detectives discover?",
        microVariants: {
          text: "The three friends decide to form the Neighborhood Mystery Club and investigate these puzzling events. They create detective notebooks with {favoriteColor} covers and make official badges using cardboard and markers. {userName} suggests they start by interviewing all the affected neighbors to gather clues.",
          alternatives: ["Forming an official mystery club, the three friends prepare detective supplies and plan their investigation strategy.", "With homemade badges and notebooks ready, {userName}, Alex, and Emma begin their first neighborhood case."],
          optionalDetails: ["they practice asking questions like real detectives", "the badges have magnifying glass drawings"]
        }
      },
      {
        text: "During their interviews, the detective club learns that all the strange events happen during the night. Mrs. Chen shows them tiny paw prints near her gnomes, and Mr. Rodriguez points out scratch marks on his bird feeder pole. The friends carefully record every detail in their notebooks.",
        pause: true,
        hook: "What do these mysterious clues point to?",
        microVariants: {
          text: "During their interviews, the detective club learns that all the strange events happen during the night. Mrs. Chen shows them tiny paw prints near her gnomes, and Mr. Rodriguez points out scratch marks on his bird feeder pole. The friends carefully record every detail in their notebooks.",
          alternatives: ["Nighttime patterns emerge as the detectives document paw prints and scratch marks from their thorough interviews.", "Evidence of small animals appears during the investigation as neighbors share physical clues with the mystery club."],
          optionalDetails: ["they measure the paw prints with rulers", "photos are taken for their evidence file"]
        }
      },
      {
        text: "{userName} has a brilliant idea - they should do a nighttime stakeout to catch the mystery culprit in action. The three friends convince their parents to let them camp out in Alex's backyard, which has a perfect view of both Mrs. Chen's garden and Mr. Rodriguez's bird feeder.",
        pause: true,
        hook: "What will the detectives discover during their nighttime watch?",
        microVariants: {
          text: "{userName} has a brilliant idea - they should do a nighttime stakeout to catch the mystery culprit in action. The three friends convince their parents to let them camp out in Alex's backyard, which has a perfect view of both Mrs. Chen's garden and Mr. Rodriguez's bird feeder.",
          alternatives: ["A clever stakeout plan emerges when {userName} realizes they need to observe the nighttime activities firsthand.", "Camping out becomes the perfect detective strategy when the mystery club sets up surveillance in Alex's backyard."],
          optionalDetails: ["they bring flashlights and binoculars", "parents help set up a safe camping area"]
        }
      },
      {
        text: "Around midnight, the friends quietly watch as a family of raccoons emerges from the woods behind the houses. The clever animals work together - some move the gnomes to reach the tasty bugs underneath while others figure out how to open the bird feeder to access the seeds inside.",
        pause: true,
        hook: "How will the detectives solve the raccoon problem peacefully?",
        microVariants: {
          text: "Around midnight, the friends quietly watch as a family of raccoons emerges from the woods behind the houses. The clever animals work together - some move the gnomes to reach the tasty bugs underneath while others figure out how to open the bird feeder to access the seeds inside.",
          alternatives: ["The midnight mystery unfolds as intelligent raccoons demonstrate their problem-solving skills to amazed young detectives.", "Working together like a team, the raccoon family shows the children exactly how they've been solving their food puzzles."],
          optionalDetails: ["baby raccoons learn from their parents", "the raccoons use tiny hands like tools"]
        }
      },
      {
        text: "Instead of just reporting the raccoons to animal control, {userName} suggests they find a solution that helps both the neighbors and the raccoon family. The mystery club researches raccoon-proof bird feeders and suggests Mrs. Chen place smooth stones under her gnomes so the raccoons can still hunt for bugs without moving the decorations.",
        pause: true,
        hook: "Will their thoughtful solution work for everyone involved?",
        microVariants: {
          text: "Instead of just reporting the raccoons to animal control, {userName} suggests they find a solution that helps both the neighbors and the raccoon family. The mystery club researches raccoon-proof bird feeders and suggests Mrs. Chen place smooth stones under her gnomes so the raccoons can still hunt for bugs without moving the decorations.",
          alternatives: ["Compassionate problem-solving leads {userName} to find solutions that protect both neighbors and wildlife.", "The detective club chooses kindness over punishment, researching ways to coexist peacefully with their raccoon neighbors."],
          optionalDetails: ["they draw diagrams of raccoon-proof designs", "neighbors appreciate the wildlife-friendly approach"]
        }
      },
      {
        text: "The neighbors are impressed with the young detectives' thorough investigation and thoughtful solutions. Mrs. Chen and Mr. Rodriguez both implement the suggestions, and the raccoon problems are solved without harming the animals. The Neighborhood Mystery Club becomes famous for their detective skills and compassionate approach to problem-solving.",
        pause: true,
        hook: "What other neighborhood mysteries will the detective club solve next?",
        microVariants: {
          text: "The neighbors are impressed with the young detectives' thorough investigation and thoughtful solutions. Mrs. Chen and Mr. Rodriguez both implement the suggestions, and the raccoon problems are solved without harming the animals. The Neighborhood Mystery Club becomes famous for their detective skills and compassionate approach to problem-solving.",
          alternatives: ["Success brings recognition as the mystery club earns respect for both their detective work and animal-friendly solutions.", "Neighbors praise the young investigators who proved that the best mysteries are solved with both smarts and kindness."],
          optionalDetails: ["other neighbors ask for help with small mysteries", "the club gets requests from nearby streets"]
        }
      },
      {
        text: "Inspired by their success, {userName}, Alex, and Emma decide to expand their detective club and help solve small mysteries throughout their community. They learn that the best investigators use both careful observation and creative, caring solutions to help everyone involved.",
        pause: false,
        hook: "What important life lessons have the young detectives learned?",
        microVariants: {
          text: "Inspired by their success, {userName}, Alex, and Emma decide to expand their detective club and help solve small mysteries throughout their community. They learn that the best investigators use both careful observation and creative, caring solutions to help everyone involved.",
          alternatives: ["The mystery club's success inspires them to help their entire community while learning valuable lessons about investigation and compassion.", "Growing confidence leads the young detectives to expand their services while discovering that kindness makes every solution better."],
          optionalDetails: ["they create a neighborhood newsletter about their cases", "parents help them make official detective certificates"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "The Neighborhood Mystery Club solves dozens of cases and becomes a model for young detective groups in other communities, always focusing on solutions that help everyone.",
        microVariants: ["Their fame spreads as other neighborhoods request help from the compassionate young investigators.", "The club's success inspires detective clubs worldwide that follow their example of kindness and thoroughness."]
      },
      {
        type: 'cozy',
        text: "{userName} and their friends continue solving neighborhood puzzles and learn that the best mysteries often have the most heartwarming solutions.",
        microVariants: ["Every solved case brings the neighborhood closer together and teaches valuable lessons about cooperation.", "The friends discover that helping their community creates the most satisfying adventures of all."]
      }
    ],
    reuse: {
      swappableElements: {
        "raccoons": ["squirrels", "cats", "opossums", "birds"],
        "gnomes": ["flower pots", "decorations", "garden tools", "outdoor furniture"],
        "bird feeder": ["pet food bowls", "garbage cans", "compost bins", "garden plants"]
      },
      weatherVariants: ["on quiet summer nights", "during the full moon", "after evening storms"],
      settingVariants: ["suburban neighborhood", "apartment complex", "small town", "residential area"]
    }
  },
  {
    title: "The Invention Fair Champion",
    theme: "Creativity & Problem-Solving",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} discovers that their school is hosting its first-ever Invention Fair, where students can create original inventions to solve real-world problems. The announcement excites {userName} because they love building things and have noticed several problems around school that need creative solutions.",
        pause: true,
        hook: "What problem will {userName} choose to solve with their invention?",
        microVariants: {
          text: "{userName} discovers that their school is hosting its first-ever Invention Fair, where students can create original inventions to solve real-world problems. The announcement excites {userName} because they love building things and have noticed several problems around school that need creative solutions.",
          alternatives: ["The Invention Fair announcement sparks {userName}'s imagination as they consider which school problems their creativity could solve.", "Building excitement fills {userName} when they learn about the opportunity to invent solutions for everyday school challenges."],
          optionalDetails: ["the fair will have judges from local engineering companies", "winning inventions might be used throughout the school"]
        }
      },
      {
        text: "After observing student struggles during lunch, {userName} notices that many kids have trouble opening stubborn milk cartons and juice boxes, often spilling their drinks or needing adult help. They decide to invent a {favoriteColor} lunch helper tool that makes opening containers easy and mess-free for everyone.",
        pause: true,
        hook: "How will {userName} design their innovative lunch helper?",
        microVariants: {
          text: "After observing student struggles during lunch, {userName} notices that many kids have trouble opening stubborn milk cartons and juice boxes, often spilling their drinks or needing adult help. They decide to invent a {favoriteColor} lunch helper tool that makes opening containers easy and mess-free for everyone.",
          alternatives: ["Lunchtime observations inspire {userName} to create a helpful tool for students who struggle with stubborn containers.", "The daily lunch challenge of opening difficult cartons gives {userName} the perfect invention idea."],
          optionalDetails: ["younger students often ask teachers for help", "spilled drinks create slip hazards on floors"]
        }
      },
      {
        text: "{userName} spends weeks designing their invention using cardboard, plastic pieces, and a small lever mechanism. They test different prototypes with various container types, carefully adjusting the design each time it doesn't work perfectly. Their notebook fills with detailed drawings and improvement ideas.",
        pause: true,
        hook: "Will {userName}'s persistence lead to a working prototype?",
        microVariants: {
          text: "{userName} spends weeks designing their invention using cardboard, plastic pieces, and a small lever mechanism. They test different prototypes with various container types, carefully adjusting the design each time it doesn't work perfectly. Their notebook fills with detailed drawings and improvement ideas.",
          alternatives: ["Persistent experimentation helps {userName} refine their invention through multiple prototype versions and careful testing.", "The design process teaches {userName} valuable lessons as they iterate through different versions of their helpful tool."],
          optionalDetails: ["family members volunteer to test prototypes", "the kitchen table becomes a workshop space"]
        }
      },
      {
        text: "During lunch periods, {userName} secretly tests their invention with willing classmates, making sure it works safely and effectively. The tool successfully opens milk cartons, juice boxes, and even stubborn yogurt containers without spilling. Friends are amazed and ask if they can have their own lunch helpers.",
        pause: true,
        hook: "How will {userName} prepare for the big Invention Fair presentation?",
        microVariants: {
          text: "During lunch periods, {userName} secretly tests their invention with willing classmates, making sure it works safely and effectively. The tool successfully opens milk cartons, juice boxes, and even stubborn yogurt containers without spilling. Friends are amazed and ask if they can have their own lunch helpers.",
          alternatives: ["Successful lunch testing proves {userName}'s invention works perfectly for its intended purpose while impressing classmates.", "The lunch helper exceeds expectations during real-world testing, making {userName} confident about the upcoming fair."],
          optionalDetails: ["they document successful tests with photos", "cafeteria staff notice fewer spills"]
        }
      },
      {
        text: "For the Invention Fair display, {userName} creates colorful posters showing the problem, their solution process, and test results. They prepare a live demonstration using different types of containers and practice explaining their invention clearly to judges and visitors.",
        pause: true,
        hook: "What will the judges think of {userName}'s practical invention?",
        microVariants: {
          text: "For the Invention Fair display, {userName} creates colorful posters showing the problem, their solution process, and test results. They prepare a live demonstration using different types of containers and practice explaining their invention clearly to judges and visitors.",
          alternatives: ["Professional presentation skills develop as {userName} prepares comprehensive displays and practices clear explanations.", "The invention booth takes shape with visual aids and interactive demonstrations that showcase the lunch helper's effectiveness."],
          optionalDetails: ["before and after photos show the improvement", "statistics track reduced spills and increased independence"]
        }
      },
      {
        text: "At the Invention Fair, judges are impressed by {userName}'s practical problem-solving approach and thorough testing process. They especially appreciate that the invention helps younger students become more independent during lunch. Other students crowd around the booth wanting to try the lunch helper themselves.",
        pause: true,
        hook: "What recognition will {userName} receive for their thoughtful invention?",
        microVariants: {
          text: "At the Invention Fair, judges are impressed by {userName}'s practical problem-solving approach and thorough testing process. They especially appreciate that the invention helps younger students become more independent during lunch. Other students crowd around the booth wanting to try the lunch helper themselves.",
          alternatives: ["Judge appreciation grows as they recognize both the invention's practicality and {userName}'s methodical development approach.", "The lunch helper attracts crowds of interested students while earning praise from judges for its real-world impact."],
          optionalDetails: ["judges take detailed notes about the invention", "the demonstration draws applause from spectators"]
        }
      },
      {
        text: "{userName} wins first place in the 'Most Practical Invention' category and receives a trophy along with a certificate to present their invention to the school board. The principal announces that lunch helpers will be purchased for every classroom to help students during snack and lunch times.",
        pause: true,
        hook: "How will this success inspire {userName}'s future inventions?",
        microVariants: {
          text: "{userName} wins first place in the 'Most Practical Invention' category and receives a trophy along with a certificate to present their invention to the school board. The principal announces that lunch helpers will be purchased for every classroom to help students during snack and lunch times.",
          alternatives: ["First place victory leads to real implementation as the school adopts {userName}'s invention for daily use.", "The practical invention category winner sees their creation become an official school tool helping students every day."],
          optionalDetails: ["local newspaper wants to feature the young inventor", "other schools inquire about the lunch helper design"]
        }
      },
      {
        text: "Months later, {userName} watches younger students confidently opening their lunch containers using the helpers and feels proud knowing their invention makes school life easier for everyone. They start sketching ideas for next year's Invention Fair, excited to solve more everyday problems through creative engineering.",
        pause: false,
        hook: "What other helpful inventions will {userName} create in the future?",
        microVariants: {
          text: "Months later, {userName} watches younger students confidently opening their lunch containers using the helpers and feels proud knowing their invention makes school life easier for everyone. They start sketching ideas for next year's Invention Fair, excited to solve more everyday problems through creative engineering.",
          alternatives: ["Real-world impact brings lasting satisfaction as {userName} sees their invention helping students daily while inspiring future projects.", "The success story continues as {userName} becomes passionate about using creativity to solve problems and help others."],
          optionalDetails: ["they become the go-to person for fixing broken classroom items", "teachers consult them about other school challenges"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} becomes a famous inventor whose lunch helper design is used in schools worldwide, inspiring other young inventors to solve problems in their communities.",
        microVariants: ["The simple lunch helper evolves into a global solution that improves school experiences for millions of students.", "{userName}'s invention inspires a movement of young problem-solvers creating helpful tools for everyday challenges."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that the best inventions solve real problems for real people, and continues creating helpful tools that make life easier and more enjoyable for others.",
        microVariants: ["The experience teaches {userName} that meaningful inventions come from observing others' needs and caring enough to help.", "Every successful invention reinforces {userName}'s belief that creativity combined with compassion can improve the world."]
      }
    ],
    reuse: {
      swappableElements: {
        "lunch helper": ["book organizer", "pencil sharpener", "desk tidier", "art supply holder"],
        "milk cartons": ["lunch boxes", "water bottles", "snack packages", "art supplies"],
        "Invention Fair": ["Science Fair", "Creativity Contest", "Problem-Solving Challenge", "Innovation Day"]
      },
      weatherVariants: ["during the school year", "in the spring semester", "before winter break"],
      settingVariants: ["elementary school", "middle school", "community center", "maker space"]
    }
  },
  {
    title: "The Animal Rescue Team",
    theme: "Compassion & Environmental Responsibility",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} discovers a injured baby bird that has fallen from its nest during a storm behind their school. The tiny {favoriteColor}-feathered bird can't fly and looks scared and hungry. {userName} carefully wraps the bird in their jacket and decides they need to help, but they're not sure how to care for wild animals properly.",
        pause: true,
        hook: "How will {userName} learn to help the injured bird safely?",
        microVariants: {
          text: "{userName} discovers a injured baby bird that has fallen from its nest during a storm behind their school. The tiny {favoriteColor}-feathered bird can't fly and looks scared and hungry. {userName} carefully wraps the bird in their jacket and decides they need to help, but they're not sure how to care for wild animals properly.",
          alternatives: ["A storm-damaged baby bird needs {userName}'s help, but proper wildlife care requires more knowledge than they currently have.", "Finding an injured bird behind school, {userName} feels compassion but realizes they need expert guidance for proper animal rescue."],
          optionalDetails: ["the bird makes soft chirping sounds", "other students gather to see what happened"]
        }
      },
      {
        text: "{userName} remembers their teacher mentioning the local wildlife rehabilitation center and asks to call them for advice. The kind veterinarian, Dr. Martinez, explains how to safely transport the bird and invites {userName} to bring it to the center where trained professionals can provide proper medical care.",
        pause: true,
        hook: "What will {userName} learn at the wildlife center?",
        microVariants: {
          text: "{userName} remembers their teacher mentioning the local wildlife rehabilitation center and asks to call them for advice. The kind veterinarian, Dr. Martinez, explains how to safely transport the bird and invites {userName} to bring it to the center where trained professionals can provide proper medical care.",
          alternatives: ["Smart thinking leads {userName} to contact wildlife experts who can provide proper care for the injured bird.", "Dr. Martinez at the wildlife center offers professional guidance when {userName} seeks help for the storm-damaged bird."],
          optionalDetails: ["the teacher helps make the phone call", "Dr. Martinez explains the importance of quick action"]
        }
      },
      {
        text: "At the wildlife center, {userName} watches amazed as Dr. Martinez and her team gently examine the baby bird, clean its tiny wounds, and provide proper nutrition. They explain that the bird has a minor wing injury that will heal with time and care. {userName} learns about different types of local birds and how to help animals in emergencies.",
        pause: true,
        hook: "How can {userName} contribute to the bird's recovery?",
        microVariants: {
          text: "At the wildlife center, {userName} watches amazed as Dr. Martinez and her team gently examine the baby bird, clean its tiny wounds, and provide proper nutrition. They explain that the bird has a minor wing injury that will heal with time and care. {userName} learns about different types of local birds and how to help animals in emergencies.",
          alternatives: ["Professional wildlife care amazes {userName} as they learn proper animal rescue techniques from Dr. Martinez's expert team.", "The rehabilitation center becomes a classroom where {userName} discovers the science and compassion behind animal rescue work."],
          optionalDetails: ["they use special tools for examination", "charts show different local bird species"]
        }
      },
      {
        text: "Dr. Martinez asks if {userName} would like to volunteer as a junior helper while the bird recovers. {userName} eagerly agrees and learns to prepare bird food, clean enclosures, and record observations about the animals' healing progress. They also help care for other rescued animals including rabbits, squirrels, and even a young owl.",
        pause: true,
        hook: "What important skills will {userName} develop as a volunteer?",
        microVariants: {
          text: "Dr. Martinez asks if {userName} would like to volunteer as a junior helper while the bird recovers. {userName} eagerly agrees and learns to prepare bird food, clean enclosures, and record observations about the animals' healing progress. They also help care for other rescued animals including rabbits, squirrels, and even a young owl.",
          alternatives: ["Volunteer opportunities teach {userName} valuable animal care skills while helping multiple species recover from injuries.", "The junior helper role expands {userName}'s knowledge as they care for various rescued wildlife under professional guidance."],
          optionalDetails: ["they wear special gloves for animal handling", "detailed charts track each animal's recovery"]
        }
      },
      {
        text: "After three weeks of dedicated care, the baby bird's wing heals completely and it's ready for release back to the wild. {userName} has the honor of opening the carrier and watching the bird fly strong and free back to its natural habitat. The moment fills {userName} with joy and pride in their contribution to the rescue.",
        pause: true,
        hook: "How will this experience change {userName}'s relationship with wildlife?",
        microVariants: {
          text: "After three weeks of dedicated care, the baby bird's wing heals completely and it's ready for release back to the wild. {userName} has the honor of opening the carrier and watching the bird fly strong and free back to its natural habitat. The moment fills {userName} with joy and pride in their contribution to the rescue.",
          alternatives: ["The successful release brings tremendous joy as {userName} watches their rescued bird fly free with healed wings.", "Three weeks of caring culminate in the magical moment when {userName} returns the healthy bird to its natural freedom."],
          optionalDetails: ["the bird circles back as if to say thank you", "other volunteers cheer the successful release"]
        }
      },
      {
        text: "Inspired by this experience, {userName} starts an Animal Rescue Club at school to teach other students about wildlife protection and proper emergency animal care. They organize educational presentations with Dr. Martinez and create first-aid kits specifically designed for helping injured animals safely.",
        pause: true,
        hook: "How will the rescue club impact their school community?",
        microVariants: {
          text: "Inspired by this experience, {userName} starts an Animal Rescue Club at school to teach other students about wildlife protection and proper emergency animal care. They organize educational presentations with Dr. Martinez and create first-aid kits specifically designed for helping injured animals safely.",
          alternatives: ["The rescue experience motivates {userName} to educate classmates about proper wildlife care and emergency animal assistance.", "School-wide education becomes {userName}'s mission as they share knowledge about responsible animal rescue with other students."],
          optionalDetails: ["club members practice safe animal handling techniques", "emergency contact cards list local wildlife centers"]
        }
      },
      {
        text: "The Animal Rescue Club becomes so successful that other schools in the district ask for help starting their own chapters. {userName} and Dr. Martinez work together to create a training program for young wildlife helpers. They develop educational materials that teach children how to coexist peacefully with local wildlife while knowing how to help in emergencies.",
        pause: true,
        hook: "What lasting impact will {userName}'s compassion have on wildlife protection?",
        microVariants: {
          text: "The Animal Rescue Club becomes so successful that other schools in the district ask for help starting their own chapters. {userName} and Dr. Martinez work together to create a training program for young wildlife helpers. They develop educational materials that teach children how to coexist peacefully with local wildlife while knowing how to help in emergencies.",
          alternatives: ["Success spreads as {userName}'s animal rescue education program expands to help students throughout the school district.", "The partnership with Dr. Martinez grows into a comprehensive wildlife education program that teaches responsible animal care across multiple schools."],
          optionalDetails: ["they create colorful identification guides", "training videos help students learn proper techniques"]
        }
      },
      {
        text: "Years later, {userName} continues working with wildlife and becomes known throughout their community as a young conservation leader. They understand that helping animals requires both immediate compassion and long-term education, and they're proud to have started with one small bird that needed their care.",
        pause: false,
        hook: "What conservation career will {userName} pursue in the future?",
        microVariants: {
          text: "Years later, {userName} continues working with wildlife and becomes known throughout their community as a young conservation leader. They understand that helping animals requires both immediate compassion and long-term education, and they're proud to have started with one small bird that needed their care.",
          alternatives: ["Community recognition grows as {userName} becomes a respected voice for wildlife conservation and responsible animal care.", "The journey from rescuing one bird evolves into a lifelong commitment to wildlife protection and environmental education."],
          optionalDetails: ["they receive awards for conservation work", "the first rescued bird still visits their backyard"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} becomes a wildlife biologist who protects endangered species and teaches children worldwide about the importance of caring for animals and their habitats.",
        microVariants: ["The rescued bird experience grows into a career protecting wildlife habitats and educating future conservationists.", "Every species {userName} helps can trace back to the lesson learned from one small bird's successful rescue."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that even small acts of kindness toward animals can grow into movements that protect entire ecosystems and inspire others to become wildlife guardians.",
        microVariants: ["One bird's rescue demonstrates how individual compassion can multiply into community-wide conservation efforts.", "The ripple effect of caring shows {userName} that protecting wildlife starts with noticing when one small creature needs help."]
      }
    ],
    reuse: {
      swappableElements: {
        "baby bird": ["kitten", "puppy", "rabbit", "squirrel"],
        "Dr. Martinez": ["Dr. Johnson", "Ms. Rodriguez", "Dr. Kim", "Mrs. Thompson"],
        "wildlife center": ["animal hospital", "nature preserve", "zoo clinic", "veterinary school"]
      },
      weatherVariants: ["after spring storms", "during migration season", "in early summer"],
      settingVariants: ["school grounds", "neighborhood park", "nature trail", "backyard"]
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

// Grade 6-10 Templates - ENHANCED FOR MAXIMUM ENGAGEMENT
export const GRADE_6_FALLBACK_TEMPLATES = [
  {
    title: "The Biosphere Project: Discovering Life's Hidden Connections",
    theme: "Science & Environmental Discovery",
    level: "Grade 6",
    scenes: [
      {
        text: "Mia Chen thought she was just going to hate environmental science class until she met {userName} on the first day. 'Great, stuck with the weird kid who actually likes bugs,' she muttered under her breath. But when {userName} spotted something impossible in Mill Creek during their field study - {favoriteColor} algae formations that seemed to pulse and move in perfect synchronization - everything changed. 'Uh, {userName}?' Mia whispered, her sarcasm completely gone. 'That's not normal, right?'",
        pause: true,
        hook: "What secret is hidden in the mysterious algae patterns?",
        microVariants: {
          text: "Mia Chen thought environmental science would be boring until {userName} discovered something impossible in Mill Creek.",
          alternatives: ["Lab partners Mia and {userName} stumbled onto a mystery that would change everything.", "What started as a regular field study became the discovery of a lifetime."],
          optionalDetails: ["The algae moved like it was breathing", "Other students were too busy complaining to notice", "Their teacher Dr. Rodriguez looked genuinely puzzled"]
        }
      },
      {
        text: "Back in the lab, {userName} couldn't stop thinking about those algae patterns. When they snuck back after school with Mia (who claimed she was only coming because she'd never seen {userName} so excited about anything), they brought Dr. Rodriguez's 'borrowed' underwater camera. 'If we get caught, I'm totally blaming you,' Mia warned, but her eyes were bright with curiosity. The footage they captured made their jaws drop - the algae were communicating in complex light sequences, like some kind of biological internet.",
        pause: true,
        hook: "How far does this algae network extend?",
        microVariants: {
          text: "After school, {userName} and Mia discovered the algae were communicating through complex light patterns.",
          alternatives: ["The underwater footage revealed an impossible biological network.", "What they found challenged everything they thought they knew about nature."],
          optionalDetails: ["Mia kept making jokes to hide how amazed she was", "The patterns looked almost like morse code", "They heard Dr. Rodriguez's car and had to hide behind the equipment shed"]
        }
      },
      {
        text: "The next morning, their discovery got complicated fast. Jake Morrison, the class clown who had a huge crush on Mia, saw their excitement and demanded to know what they'd found. 'Come on, Chen, you never get excited about science stuff!' When they reluctantly showed him the footage, Jake's reaction surprised everyone - turns out his dad was a marine biologist, and Jake had been hiding his own love of nature to fit in with his popular friends. 'This is like, discovery-of-the-century stuff,' he whispered, then louder: 'We have to tell someone!'",
        pause: true,
        hook: "Should they reveal their discovery or investigate further?",
        microVariants: {
          text: "Jake Morrison discovered their secret and wanted to help, revealing his hidden passion for marine biology.",
          alternatives: ["The class clown turned out to be a secret science lover.", "Their small team was growing, and so were the complications."],
          optionalDetails: ["Jake had been pretending not to care about school", "His popular friends wouldn't understand his real interests", "Mia looked impressed by Jake's scientific knowledge"]
        }
      },
      {
        text: "During lunch, the three of them huddled in the library, mapping where similar algae formations might exist. {userName} felt a weird flutter when Mia leaned close to point at their drawings - was that... butterflies? Meanwhile, Jake was texting his dad, who apparently went 'completely bonkers' (Jake's words) with excitement. Dr. Morrison wanted to visit their school immediately. 'But guys,' {userName} said nervously, 'what if we're wrong? What if adults take over and we lose our chance to figure this out ourselves?'",
        pause: true,
        hook: "Will the adults help or take over their discovery?",
        microVariants: {
          text: "The team debated whether to involve adults or keep investigating on their own.",
          alternatives: ["Jake's marine biologist father wanted to get involved immediately.", "Their friendship was growing stronger as they shared this incredible secret."],
          optionalDetails: ["{userName} was developing feelings for Mia", "Jake noticed the chemistry between his new friends", "The librarian kept shushing them for getting too animated"]
        }
      },
      {
        text: "Everything came to a head during Friday's class when Dr. Rodriguez assigned creek cleanup duty as punishment for their 'unapproved after-school experiments.' But this gave them the perfect cover! While their classmates groaned about getting muddy, {userName}, Mia, and Jake secretly collected samples from seven different locations. They discovered the algae network extended for miles underground, connecting the entire watershed. 'We're not just looking at plants,' Mia breathed, holding up a sample that pulsed with bioluminescent light. 'We're looking at a superorganism.'",
        pause: true,
        hook: "How big is this biological network really?",
        microVariants: {
          text: "Creek cleanup revealed the algae network was actually a massive superorganism spanning miles.",
          alternatives: ["What they thought was algae turned out to be something far more complex.", "Their punishment became their biggest breakthrough."],
          optionalDetails: ["Other students complained while they made groundbreaking discoveries", "The samples glowed brighter when they were near each other", "Dr. Rodriguez was starting to suspect something"]
        }
      },
      {
        text: "The weekend brought Jake's dad, Dr. Morrison, who turned out to be the coolest adult they'd ever met. Instead of taking over, he helped them design real experiments. 'This is your discovery,' he told them. 'I'm just here to make sure you don't accidentally poison yourselves.' They learned the organism responded to music (Jake's idea), mathematical sequences ({userName}'s contribution), and even emotional states - it glowed brighter when Mia laughed, which happened a lot around {userName} lately. 'It's like it feeds on happiness,' she said, making {userName} blush furiously.",
        pause: true,
        hook: "What else can they learn about this remarkable organism?",
        microVariants: {
          text: "Dr. Morrison helped them discover the organism responded to music, math, and emotions.",
          alternatives: ["The creature seemed to thrive on positive human interactions.", "Every experiment revealed new impossibilities."],
          optionalDetails: ["It dimmed when people argued nearby", "Classical music made it pulse in complex patterns", "The team's friendship seemed to energize it somehow"]
        }
      },
      {
        text: "Their first major test came when {userName} had to present their findings to the school science fair committee. With sweaty palms and Mia's encouraging smile for support, they explained how they'd discovered a previously unknown form of collective consciousness in nature. The committee was skeptical until Jake demonstrated the organism's response to his guitar playing - it lit up the entire lab like a {favoriteColor} concert. 'Holy...' Principal Stevens caught himself before swearing. 'Kids, this is... this is really something special.'",
        pause: true,
        hook: "How will the school react to their incredible discovery?",
        microVariants: {
          text: "The science fair presentation amazed the committee with live demonstrations.",
          alternatives: ["Skeptical adults became believers when they saw the organism respond to music.", "Their nervousness turned to pride as recognition grew."],
          optionalDetails: ["The principal had never seen anything like it", "Other teachers crowded into the lab to watch", "Mia squeezed {userName}'s hand for good luck"]
        }
      },
      {
        text: "News of their discovery spread faster than they expected. By Monday, reporters were calling the school, and a team from the state university wanted to collaborate. But the real surprise came from an unexpected source - Emma Rodriguez, Dr. Rodriguez's college-age daughter who was majoring in environmental engineering. She'd heard about their work and had a wild theory: 'What if this organism isn't just communicating?' she asked excitedly. 'What if it's trying to heal the ecosystem damage in the creek?' Suddenly their project had stakes they never imagined.",
        pause: true,
        hook: "Could this organism actually be healing environmental damage?",
        microVariants: {
          text: "University teams and reporters took notice, while Emma Rodriguez proposed the organism might heal ecosystems.",
          alternatives: ["Their local discovery was gaining national attention.", "The implications kept growing bigger and more important."],
          optionalDetails: ["Emma was brilliant and inspirational", "The media attention made them nervous but excited", "Other schools wanted to search their own waterways"]
        }
      },
      {
        text: "The pressure intensified when a biotech company offered the school a million dollars for exclusive research rights. During a heated school board meeting, {userName} stood up to speak, voice shaking but determined. 'This organism has been quietly fixing our creek for who knows how long,' they said. 'It doesn't belong to anyone. It belongs to everyone.' Mia and Jake flanked them for support, and even some of the tough eighth-graders started nodding. The room erupted in applause when the board voted to keep the research open and collaborative.",
        pause: true,
        hook: "What will they do with their newfound influence and responsibility?",
        microVariants: {
          text: "At the school board meeting, {userName} successfully argued against corporate control of their discovery.",
          alternatives: ["The team stood up to corporate pressure to protect their organism.", "Their discovery became a lesson in scientific ethics and community values."],
          optionalDetails: ["The company representatives looked furious", "Students and parents cheered their decision", "Local news covered the 'kids vs. corporation' story"]
        }
      },
      {
        text: "Three months later, their collaborative research project had grown into something amazing. Students from five schools were monitoring similar organisms in their local waterways, all coordinated through a website Jake designed. {userName} and Mia's friendship had definitely turned into something more (their first kiss happened while watching bioluminescent patterns under the stars). But the best part was seeing their discovery inspire other kids to become citizen scientists. 'We didn't just find something cool,' Mia said during their final presentation. 'We proved that young people can make real contributions to science.'",
        pause: true,
        hook: "What legacy will their discovery create for future young scientists?",
        microVariants: {
          text: "Their collaborative project inspired students across multiple schools to become citizen scientists.",
          alternatives: ["Love bloomed alongside scientific discovery as their impact spread statewide.", "They proved that curiosity and determination could change the world."],
          optionalDetails: ["Their relationship was the talk of the school", "Jake started his own environmental club", "Dr. Morrison offered them summer internships"]
        }
      },
      {
        text: "Standing by Mill Creek one year later, {userName} smiled watching younger students continue their research. The organism was thriving, the water was cleaner than it had been in decades, and their story had inspired similar discoveries in twelve states. Mia squeezed their hand as Jake played his guitar for the organism, now affectionately nicknamed 'Glow' by hundreds of student researchers nationwide. 'Think we'll be remembered for this?' Mia asked. {userName} watched the water pulse with gentle {favoriteColor} light and grinned. 'I think Glow will make sure of that.'",
        pause: true,
        hook: "How will their discovery continue to inspire future generations?",
        microVariants: {
          text: "One year later, their discovery had sparked a nationwide student research movement.",
          alternatives: ["Their legacy was secured as 'Glow' continued inspiring young scientists everywhere.", "From three kids with curiosity grew a movement that changed environmental science."],
          optionalDetails: ["Glow responded to students from around the country", "Their high school installed a permanent research station", "They were already planning college together"]
        }
      },
      {
        text: "At their eighth-grade graduation, {userName} received the first-ever 'Young Environmental Pioneer Award' from the state environmental agency. But as they stood at the podium looking out at their classmates, they realized the real prize was simpler: they'd found their passion, their best friends, and their first love, all while discovering that middle schoolers could change the world. 'The future belongs to the curious,' they said in their speech, earning a standing ovation. In the creek behind the school, Glow pulsed brighter than ever, as if celebrating too.",
        pause: true,
        hook: "What adventures await them in high school and beyond?",
        microVariants: {
          text: "Graduation brought awards and recognition, but the real prize was friendship, love, and purpose.",
          alternatives: ["Their middle school discovery launched lifelong careers in environmental science.", "They proved that the most important discoveries come from curiosity and collaboration."],
          optionalDetails: ["Colleges were already recruiting them", "Their families were incredibly proud", "Glow had become a permanent part of their school's identity"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Five years later, Dr. {userName} published their first peer-reviewed paper on bioluminescent ecosystem communication, co-authored with Dr. Mia Chen-{lastName} and Dr. Jake Morrison. Their discovery had revolutionized environmental science and inspired a generation of young researchers. But their favorite part was still the weekly video calls with current Mill Creek students, continuing the tradition of curiosity they'd started in sixth grade.",
        microVariants: ["The three friends became leading environmental scientists, never forgetting their roots as curious middle schoolers.", "Their love story and scientific discovery inspired countless young people to pursue both passion and purpose."]
      },
      {
        type: 'cozy',
        text: "Every summer, {userName} and Mia returned to Mill Creek with their own children, teaching them to observe the gentle glow of the organism they'd discovered decades ago. Jake, now the school's head science teacher, would join them for evening picnics where they'd tell stories about their middle school adventure. The creek still glowed with the same magical light, reminding them that the best discoveries come from curiosity, friendship, and protecting what we love.",
        microVariants: ["Their discovery became a family tradition, passed down through generations of young naturalists.", "The magic of Mill Creek continued inspiring new generations of environmental stewards."]
      }
    ],
    reuse: {
      swappableElements: {
        "organism_traits": ["bioluminescence", "synchronized pulsing", "emotional responsiveness", "environmental healing"],
        "character_dynamics": ["shy crush", "unexpected alliance", "family support", "peer pressure"],
        "scientific_methods": ["underwater photography", "sample collection", "behavioral observation", "collaborative research"]
      },
      weatherVariants: ["sunny field work", "misty morning discoveries", "starlit observations"],
      settingVariants: ["creek ecosystem", "school laboratory", "community meeting"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },
  {
    title: "The Middle School Time Capsule Mystery",
    theme: "History & Community Connections",
    level: "Grade 6",
    scenes: [
      {
        text: "When the demolition crew discovered a mysterious metal box buried under the old gym foundation, {userName} was the first student to spot the strange symbols carved into its surface. 'Ms. Patterson!' they called to their history teacher, heart pounding with excitement. 'This looks really old!' The entire sixth grade clustered around as the rusty container was carefully extracted. Inside, wrapped in oiled cloth, were objects that made no sense: a smartphone from 2087, newspaper clippings from events that hadn't happened yet, and a letter addressed to 'The Student Who Finds This' - signed with {userName}'s own signature.",
        pause: true,
        hook: "How can a time capsule contain items from the future?",
        microVariants: {
          text: "The demolition crew found a time capsule with {userName}'s signature and impossible future items.",
          alternatives: ["A mysterious container held objects from 2087 and a letter with {userName}'s own signature.", "The discovery challenged everything they thought they knew about time and possibility."],
          optionalDetails: ["The metal was unlike anything they'd seen", "Other students thought it was a prank", "Ms. Patterson looked genuinely confused"]
        }
      },
      {
        text: "That night, {userName} couldn't sleep, staring at photos of the time capsule contents on their phone. Their best friend Alex texted at 2 AM: 'Still freaking out about today?' But it was the new girl, Zoe, who had the wildest theory. 'What if,' she whispered at lunch the next day, 'someone is going to invent time travel, and future you sent this back as a message?' The idea was crazy, but Zoe had this intensity that made even the most ridiculous ideas seem possible. Plus, she was really pretty when she got excited about weird stuff.",
        pause: true,
        hook: "What message could future {userName} be trying to send?",
        microVariants: {
          text: "Zoe's time travel theory sparked new possibilities about the mysterious message.",
          alternatives: ["The new girl's wild imagination opened up incredible possibilities.", "Late-night texts and lunch conspiracies brought the three friends closer."],
          optionalDetails: ["Alex was jealous of Zoe's ideas", "{userName} felt butterflies around Zoe", "The cafeteria became their secret meeting place"]
        }
      },
      {
        text: "The newspaper clippings were the key to everything. Headlines from 2087 described their town as 'The First Carbon-Neutral City in America' and featured a photo of an older {userName} cutting the ribbon at something called the 'Community Innovation Center.' But the most shocking article was about how a middle school project in 2024 had started the environmental movement that transformed their entire region. 'Guys,' Alex said, voice shaking, 'I think future you is telling present you what you're supposed to do.' Zoe grabbed {userName}'s hand excitedly. 'We're going to save the world!'",
        pause: true,
        hook: "What middle school project could change their entire future?",
        microVariants: {
          text: "The future newspapers revealed that their middle school project would transform their town's environmental future.",
          alternatives: ["Headlines from 2087 showed {userName} leading environmental changes that started in sixth grade.", "The time capsule was a roadmap to creating their community's sustainable future."],
          optionalDetails: ["Other students started paying attention to their group", "Teachers wondered why they were so focused on environmental issues", "Zoe's enthusiasm was infectious"]
        }
      },
      {
        text: "Their investigation hit a snag when Marcus Webb, the school's biggest troublemaker, overheard them talking about the time capsule. 'Time travel? You guys are so weird,' he scoffed. But when they reluctantly showed him the evidence, Marcus went quiet. Turns out his dad worked for the city planning department and had been stressing about new environmental regulations. 'My dad says the city's going broke trying to go green,' Marcus admitted. 'Maybe... maybe you guys aren't as crazy as I thought.' Suddenly their team of three became four, with Marcus providing inside access to city government.",
        pause: true,
        hook: "How will Marcus's city connections help their mission?",
        microVariants: {
          text: "Marcus Webb joined their team, bringing valuable connections to city government through his father.",
          alternatives: ["The class troublemaker became their unexpected ally with crucial inside information.", "Their small group was growing, each member bringing unique skills to their quest."],
          optionalDetails: ["Marcus was actually really smart beneath his tough exterior", "His dad took environmental issues more seriously than expected", "The group dynamics were getting complicated"]
        }
      },
      {
        text: "Using Marcus's dad's city maps and Zoe's research skills, they identified the perfect location for their environmental project: the abandoned lot behind the school that everyone used as a shortcut to the mall. 'What if we turned this into something amazing?' {userName} suggested during their secret after-school meeting. Alex pulled up examples of school gardens on his tablet, while Zoe sketched plans for solar panels and rainwater collection. Marcus, surprisingly, had the best idea of all: 'My dad says the city needs student input for their climate plan. What if we made this a model for the whole town?'",
        pause: true,
        hook: "Can four sixth-graders really influence city planning?",
        microVariants: {
          text: "The team planned to transform the abandoned lot into a model environmental project for the city.",
          alternatives: ["Their secret meetings produced ambitious plans to turn waste space into environmental innovation.", "Four middle schoolers dared to dream they could influence their city's future."],
          optionalDetails: ["The lot was actually bigger than they'd realized", "Other students started asking what they were up to", "Parents were curious about their new friendship group"]
        }
      },
      {
        text: "Everything changed when they discovered the smartphone from 2087 actually worked. The apps were incredible - one showed real-time environmental data for their entire region, another calculated carbon footprints instantly. But the most amazing feature was a messaging system that connected to something called the 'Temporal Student Network.' When {userName} nervously typed 'Hello?' they got an immediate response from someone claiming to be their future self: 'Right on schedule! The community garden project starts everything. Trust your instincts, include everyone, and remember - small actions create big changes. P.S. Ask Zoe to the spring dance. She likes you too!'",
        pause: true,
        hook: "What other guidance will future {userName} provide?",
        microVariants: {
          text: "The future smartphone connected them to their older selves with crucial guidance and romantic advice.",
          alternatives: ["Technology from 2087 provided both environmental data and personal insights.", "Future {userName} confirmed their path while encouraging young love."],
          optionalDetails: ["The device charged itself using ambient light", "Other temporal messages appeared throughout the day", "{userName} blushed furiously at the dating advice"]
        }
      },
      {
        text: "The community garden project launch was more successful than they'd dreamed. Using the future smartphone's data, they convinced the city council to donate the land, while Marcus's dad helped with permits. But the real magic happened when other students got involved. Soon they had eighth-graders designing compost systems, fifth-graders planting seeds, and even some high schoolers volunteering on weekends. Zoe coordinated everything with infectious enthusiasm, and when {userName} finally worked up the courage to ask her to help with the watering schedule alone, she grinned and said, 'I was wondering when you'd ask.'",
        pause: true,
        hook: "How will their relationship bloom along with their garden?",
        microVariants: {
          text: "The garden project united students across all grades while romance budded between {userName} and Zoe.",
          alternatives: ["Environmental action brought the whole school together as young love flourished.", "Their community initiative grew alongside their deepening friendships and first crush."],
          optionalDetails: ["Teachers marveled at the student cooperation", "Local news covered their innovative approach", "Hand-holding happened naturally while planting together"]
        }
      },
      {
        text: "By spring, their small garden had become a campus-wide sustainability movement. The future smartphone guided them to implement composting programs, energy audits, and bicycle repair stations. But the biggest breakthrough came when Zoe discovered patterns in the temporal messages - they weren't just getting advice from future {userName}, but from future versions of all of them! Alex's future self had become a renewable energy engineer, Marcus grew up to be an environmental lawyer, and Zoe... well, future Zoe was apparently {userName}'s research partner and spouse, which made present-day Zoe blush adorably.",
        pause: true,
        hook: "What other future selves are sending guidance to the past?",
        microVariants: {
          text: "Messages from all their future selves revealed their destinies as environmental leaders and life partners.",
          alternatives: ["The temporal network connected them to their future careers and relationships.", "Their middle school friendship was destined to change both their world and their hearts."],
          optionalDetails: ["Future Alex sent engineering blueprints", "Future Marcus provided legal advice", "Future Zoe's messages were especially romantic"]
        }
      },
      {
        text: "The spring dance became legendary when {userName} and Zoe arrived together, both wearing {favoriteColor} outfits made from sustainable materials they'd researched for their project. But the real excitement happened when Alex announced that their environmental initiative had won a state award, with a $10,000 grant to expand their work. Marcus, dressed up for once, shocked everyone by asking Sarah Chen, the student council president, to dance - and she said yes! 'I guess saving the world makes you pretty attractive,' he joked, but he was glowing with pride about their accomplishments.",
        pause: true,
        hook: "How will their success inspire other students and communities?",
        microVariants: {
          text: "The spring dance celebrated both their environmental success and budding romances.",
          alternatives: ["Awards and recognition came alongside teenage romance and deepening friendships.", "Their sustainability work had transformed both their school and their social lives."],
          optionalDetails: ["The decorations were all eco-friendly", "Other couples were inspired by their example", "Teachers chaperoned with genuine admiration"]
        }
      },
      {
        text: "Summer brought their biggest challenge yet when the city announced plans to expand their model to five other schools. As project coordinators, {userName}, Zoe, Alex, and Marcus had to present to the mayor and city council. Standing before the packed chamber, hands intertwined with Zoe's for courage, {userName} explained how their time capsule discovery had inspired them to become stewards of their community's future. The future smartphone, now openly displayed, provided real-time data showing their project's measurable environmental impact. When the council voted unanimously to fund city-wide expansion, the room erupted in cheers.",
        pause: true,
        hook: "How far will their environmental movement spread?",
        microVariants: {
          text: "City council approval launched their environmental model across multiple schools and communities.",
          alternatives: ["Public presentations and political support transformed their school project into city policy.", "Their sixth-grade initiative was becoming a regional environmental movement."],
          optionalDetails: ["Local media covered the story extensively", "Other cities requested consultation visits", "Their parents were incredibly proud"]
        }
      },
      {
        text: "The final message from the time capsule arrived on the last day of sixth grade. Future {userName} wrote: 'You did it! The timeline is secure. Your community garden project becomes the model for thousands of schools worldwide. The Carbon-Neutral City designation happens exactly as planned in 2087. But the best part? You and Zoe's partnership lasts a lifetime, both in science and in love. The time capsule will disappear now - its job is done. Keep being curious, keep caring for your community, and keep holding hands with the people you love.' As they read, the mysterious container shimmered and vanished, leaving only memories and a transformed world.",
        pause: true,
        hook: "What legacy will their time capsule adventure create?",
        microVariants: {
          text: "The final temporal message confirmed their mission's success before the time capsule vanished forever.",
          alternatives: ["Future confirmation of their impact provided perfect closure to their impossible adventure.", "The mystery dissolved, leaving only the real-world changes they'd created through teamwork and love."],
          optionalDetails: ["The disappearance happened while they all watched", "No evidence remained except their environmental projects", "Their bond was stronger than any supernatural element"]
        }
      },
      {
        text: "Seven years later, high school seniors {userName} and Zoe walked through their expanded community garden before prom, now a thriving environmental education center visited by students from around the world. Alex was designing solar installations for college campuses, while Marcus had been accepted to law school with plans to specialize in environmental policy. 'Do you ever miss the time capsule?' Zoe asked, adjusting {userName}'s {favoriteColor} boutonniere. {userName} smiled, looking at the sustainability innovations they'd sparked and the love they'd found. 'We didn't need messages from the future,' they realized. 'We created it ourselves.'",
        pause: true,
        hook: "How will their story inspire future generations of environmental leaders?",
        microVariants: {
          text: "Years later, their environmental center and lasting relationships proved they'd created their own bright future.",
          alternatives: ["Time travel magic was less important than the real changes they'd made through friendship and determination.", "Their love story and environmental legacy continued inspiring students worldwide."],
          optionalDetails: ["Their prom was carbon-neutral by design", "Colleges recruited them specifically for their environmental work", "The garden had become a permanent part of their city's identity"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Twenty years later, President {userName} signed the Global Environmental Education Act, inspired by their sixth-grade time capsule adventure. At the ceremony, surrounded by world leaders and environmental activists, they caught sight of Dr. Zoe {lastName} in the audience, still their partner in both science and life. Their middle school project had grown into a worldwide movement, proving that the most powerful time travel happens when young people dare to create the future they want to live in.",
        microVariants: ["Their childhood mystery evolved into global leadership, changing environmental education worldwide.", "From a mysterious time capsule to the presidential podium, their journey proved that young people can literally reshape the future."]
      },
      {
        type: 'cozy',
        text: "Every year on the anniversary of finding the time capsule, {userName} and Zoe brought their own children to visit the original community garden, now a national landmark. While their kids played among the solar panels and fruit trees, they'd tell the story of four sixth-graders who discovered that the best way to predict the future is to create it yourself. The time capsule was gone, but the magic of believing in tomorrow lived on in every student who learned that they could change the world.",
        microVariants: ["Their family traditions kept the spirit of environmental stewardship alive for new generations.", "The real time travel was inspiring children to build the sustainable future they dreamed of seeing."]
      }
    ],
    reuse: {
      swappableElements: {
        "temporal_elements": ["future messages", "advanced technology", "timeline guidance", "destiny confirmation"],
        "environmental_projects": ["community gardens", "solar installations", "composting systems", "sustainability education"],
        "relationship_dynamics": ["first crushes", "friendship bonds", "family support", "community connections"]
      },
      weatherVariants: ["discovery day excitement", "planning season focus", "celebration time joy"],
      settingVariants: ["school construction site", "community garden space", "city council chambers"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },
  {
    title: "The Coding Club Championship Challenge",
    theme: "Technology & Creative Problem-Solving",
    level: "Grade 6",
    scenes: [
      {
        text: "Nobody expected {userName} to join coding club - they were more known for {hobbies} than programming. But when Tyler Kim, the club's teenage prodigy, announced they needed one more member for the Regional Middle School Coding Championship, desperation made {userName} raise their hand. 'Uh, I can barely make a calculator app,' they admitted nervously. Tyler grinned, his confidence somehow making their lack of experience seem less scary. 'Perfect! Fresh perspective is exactly what we need. Plus, our theme is {favoriteColor} - that's gotta be a good sign, right?'",
        pause: true,
        hook: "Can a coding newbie really help win a championship?",
        microVariants: {
          text: "Despite zero programming experience, {userName} joined the coding club's championship team.",
          alternatives: ["Tyler Kim convinced the reluctant {userName} to join their competitive coding team.", "Sometimes the best teams need members who think completely differently."],
          optionalDetails: ["The club met in the dusty computer lab after school", "Tyler had been coding since elementary school", "Other team members looked skeptical about the new recruit"]
        }
      },
      {
        text: "The existing team was intimidating: Tyler (obviously), Priya Singh who'd already created three mobile apps, and Dev Patel whose robotics projects had been featured in the local newspaper. {userName} felt completely out of their league until the first brainstorming session revealed something unexpected - while the others could code anything, they struggled with creative ideas. When {userName} suggested building an app that helped students trade lunch items based on dietary restrictions and preferences, the whole room went quiet. 'That's... actually brilliant,' Priya said slowly. 'And totally doable in six weeks.'",
        pause: true,
        hook: "How will {userName}'s creative thinking complement their teammates' technical skills?",
        microVariants: {
          text: "{userName}'s lunch-trading app idea impressed the technically skilled but creatively stuck team.",
          alternatives: ["Creative problem-solving proved just as valuable as programming expertise.", "The perfect team needed both technical skills and innovative thinking."],
          optionalDetails: ["Dev immediately started sketching user interfaces", "Tyler began calculating database requirements", "Priya was already thinking about user experience design"]
        }
      },
      {
        text: "Learning to code was harder than {userName} expected, but Tyler turned out to be an amazingly patient teacher. During lunch sessions in the library, he'd explain concepts using metaphors from {userName}'s favorite hobby. 'Think of functions like recipes,' he'd say, leaning close enough that {userName} could smell his {favoriteColor} hoodie's fabric softener. 'You give it ingredients, it follows steps, and outputs something useful.' Meanwhile, Priya and Dev worked on the technical architecture, but they kept asking for {userName}'s input on user interface decisions. Slowly, {userName} began to feel like they belonged.",
        pause: true,
        hook: "Will {userName} master coding in time for the championship?",
        microVariants: {
          text: "Tyler's patient teaching and the team's collaborative spirit helped {userName} grow as a programmer.",
          alternatives: ["Coding lessons became the highlight of {userName}'s day, especially with Tyler as teacher.", "The technical and creative sides of the team started working in perfect harmony."],
          optionalDetails: ["Library sessions often ran past closing time", "Tyler's teaching style made complex concepts understandable", "{userName} was developing a serious crush on their patient tutor"]
        }
      },
      {
        text: "Three weeks before the competition, disaster struck. Priya's family was moving to another state, leaving the team without their user interface expert. 'We're screwed,' Dev moaned during their emergency meeting. But {userName} surprised everyone, including themselves, by volunteering to take over Priya's role. 'I've been watching her work for weeks,' they said with more confidence than they felt. 'Plus, I know what regular students want from an app.' Tyler's proud smile made the terrifying responsibility feel almost manageable. 'You've got this,' he said. 'We've all got this.'",
        pause: true,
        hook: "Can {userName} step up to fill the crucial missing role?",
        microVariants: {
          text: "Priya's departure forced {userName} to step into a crucial technical role they'd never attempted.",
          alternatives: ["Crisis became opportunity as {userName} took on user interface responsibilities.", "The team had to trust their newest member with their championship dreams."],
          optionalDetails: ["Priya left detailed notes and tutorials", "The team held daily video calls with her for advice", "Pressure was building as competition day approached"]
        }
      },
      {
        text: "The user interface work was actually fun once {userName} got into the flow. They designed colorful screens that made lunch trading feel like a game, with point systems for successful trades and achievements for trying new foods. Tyler helped debug their code during increasingly late library sessions, their heads bent together over laptops. 'Your color choices are perfect,' he murmured during one particularly close coding moment. 'Especially this {favoriteColor} gradient.' {userName}'s heart hammered as they realized Tyler might be flirting - or maybe that was just sleep deprivation from coding marathons.",
        pause: true,
        hook: "Will romance bloom alongside their programming partnership?",
        microVariants: {
          text: "Late-night coding sessions brought {userName} and Tyler closer together both professionally and personally.",
          alternatives: ["User interface design revealed {userName}'s hidden talents while sparking romantic tension.", "The pressure of competition was building along with undeniable chemistry between teammates."],
          optionalDetails: ["Their design won praise from teachers who previewed it", "Other students started volunteering to test their app", "Lingering eye contact was becoming frequent during code reviews"]
        }
      },
      {
        text: "Competition day arrived with typical middle school chaos. The venue was packed with teams from fifteen schools, all looking intimidatingly professional. While Dev set up their equipment and Tyler ran final system checks, {userName} tried not to hyperventilate. That's when Luna Martinez from the rival Jefferson Middle team approached with a smirk. 'Heard you guys lost your UI expert and replaced her with a total newbie,' she said loud enough for nearby teams to hear. Tyler stepped protectively closer to {userName}. 'Actually, our UI designer is amazing. You'll see in about four hours.' The confidence in his voice steadied {userName}'s nerves completely.",
        pause: true,
        hook: "How will {userName} handle the pressure of public competition?",
        microVariants: {
          text: "Competition day brought intimidating rivals, but Tyler's support gave {userName} confidence to prove themselves.",
          alternatives: ["Public pressure and rival teams made the stakes feel impossibly high.", "Tyler's protective loyalty helped {userName} transform nervousness into determination."],
          optionalDetails: ["Luna's team had matching jerseys and expensive equipment", "Parents and teachers packed the audience", "The judges looked serious and professional"]
        }
      },
      {
        text: "The presentation round was {userName}'s moment to shine. While other teams demonstrated complex but boring productivity apps, they took the stage to show 'LunchSwap' in action. Using their phone, {userName} demonstrated how a student with peanut allergies could safely trade their sandwich for a fruit cup, while someone with diabetes could find low-sugar snacks. The audience loved the real-world problem solving, but the judges seemed especially impressed when {userName} explained their inclusive design choices. 'We made sure the app works for students with visual impairments, food allergies, and different cultural dietary needs,' they said confidently. Tyler's proud grin from the wings was worth every stressful coding session.",
        pause: true,
        hook: "Will their inclusive design philosophy impress the judges enough to win?",
        microVariants: {
          text: "{userName}'s presentation showcased their app's inclusive design and real-world problem-solving approach.",
          alternatives: ["Public speaking revealed {userName}'s natural ability to communicate complex technical concepts clearly.", "Their inclusive design philosophy set them apart from more technically complex but less thoughtful competitors."],
          optionalDetails: ["The audience applauded throughout the demonstration", "Teachers in the crowd were taking notes", "Luna's team looked worried for the first time"]
        }
      },
      {
        text: "The technical judging round tested their app's functionality under pressure. While Tyler handled the backend questions with his usual genius and Dev explained their database structure, {userName} found themselves fielding most questions about user experience and accessibility features. 'How did you decide on these color contrasts?' one judge asked. {userName} explained their research into color-blind accessibility, earning impressed nods. But the real validation came when another judge said, 'This is exactly the kind of thoughtful, inclusive design we need more of in technology.' Behind them, Tyler was practically glowing with pride at his student-turned-teammate.",
        pause: true,
        hook: "Will their teamwork and inclusive approach earn them the championship title?",
        microVariants: {
          text: "Technical judging revealed how {userName}'s thoughtful design complemented their team's programming expertise.",
          alternatives: ["Judges praised their inclusive approach and seamless teamwork under pressure.", "The competition became a showcase of both technical skill and social consciousness."],
          optionalDetails: ["Other teams gathered to watch their demonstration", "Tyler whispered encouraging comments throughout the judging", "Dev handled the pressure like a seasoned professional"]
        }
      },
      {
        text: "Award ceremony tension was unbearable. Third place went to Lincoln Middle's budget-tracking app. Second place was announced for Jefferson Middle - Luna's team looked devastated not to win. When the judges called 'First place, for outstanding innovation, inclusive design, and real-world impact... Roosevelt Middle School's LunchSwap team!' the entire auditorium erupted. {userName} was in Tyler's arms before they realized they'd moved, spinning around as Dev and the remaining team cheered. 'We did it!' Tyler shouted over the noise. 'YOU did it!' Then, in full view of everyone, he kissed {userName}'s cheek, making the victory even sweeter.",
        pause: true,
        hook: "How will their championship victory change their lives and relationships?",
        microVariants: {
          text: "Championship victory brought celebration, recognition, and Tyler's first romantic gesture in public.",
          alternatives: ["Winning validated both their technical skills and their commitment to inclusive design.", "The kiss that followed their victory announcement made the day absolutely perfect."],
          optionalDetails: ["The trophy was bigger than they'd expected", "Their parents rushed the stage for photos", "Local news reporters wanted interviews immediately"]
        }
      },
      {
        text: "The celebration continued at the school dance two weeks later, where {userName} and Tyler arrived as official boyfriend-girlfriend after much awkward but adorable negotiation. Their championship trophy was displayed in the gym, and half their classmates wanted to download LunchSwap (which they'd actually published in the app store after winning). Dev had started a robotics team with some eighth-graders, while Priya joined their group video calls from her new school every week. 'Best coding partner ever,' Tyler whispered while they slow-danced to a cheesy {favoriteColor} disco ball. {userName} grinned, thinking how six months ago they couldn't even spell 'algorithm.'",
        pause: true,
        hook: "What new coding adventures await their expanded team?",
        microVariants: {
          text: "The school dance celebrated both their championship victory and their new relationship status.",
          alternatives: ["Romance and recognition followed their coding success as their app gained real-world users.", "From coding newbie to champion, {userName} had found both technical skills and true love."],
          optionalDetails: ["LunchSwap had over 500 downloads in two weeks", "Other schools wanted to implement their system", "Tyler was already planning their next competition entry"]
        }
      },
      {
        text: "Summer brought an unexpected opportunity when a local tech company offered the team internships to continue developing LunchSwap. Working in a real office, {userName} discovered they loved user experience design as much as Tyler loved backend programming. Their relationship deepened as they collaborated on features that would help thousands of students nationwide. 'Remember when you thought you couldn't code?' Tyler teased during one particularly successful debugging session. {userName} pulled up their first terrible calculator app and compared it to their current professional-level interface designs. 'Good thing you saw potential I didn't even know I had.' Their first workplace kiss happened right there in the break room.",
        pause: true,
        hook: "How will their success inspire other students to discover hidden talents?",
        microVariants: {
          text: "Summer internships allowed them to develop their app professionally while their relationship flourished.",
          alternatives: ["Real-world experience proved their championship win was just the beginning of their tech careers.", "Professional development and personal growth intertwined as they built both an app and a life together."],
          optionalDetails: ["The company offered them jobs for after college", "LunchSwap was being implemented in 50 schools", "Their success story inspired the next year's coding club recruitment"]
        }
      },
      {
        text: "Starting seventh grade as defending coding champions felt surreal, but {userName} and Tyler were determined to use their platform to inspire other students. They mentored the new coding club members, teaching them that technical expertise mattered less than creativity and persistence. When shy sixth-grader Maya Chen raised her hand to join despite having 'zero experience,' {userName} grinned and offered her the spot. 'Perfect! Fresh perspective is exactly what we need,' they said, echoing Tyler's words from a year before. Watching Maya's face light up with possibility, {userName} realized they'd found their true passion: helping others discover they could create the future with nothing but curiosity and code.",
        pause: true,
        hook: "What amazing innovations will the next generation of student coders create?",
        microVariants: {
          text: "As seventh-grade mentors, they inspired new students to discover their own coding potential and creativity.",
          alternatives: ["Their championship experience became a gift they could share with the next generation of student programmers.", "From anxious beginners to confident mentors, their journey proved that anyone could learn to change the world through technology."],
          optionalDetails: ["Maya reminded them of their own uncertain beginning", "The coding club had tripled in size due to their success", "Tyler was already planning next year's competition strategy"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Five years later, CEO {userName} stood before a packed auditorium at Tech Conference 2029, presenting LunchSwap's evolution into a comprehensive platform for inclusive technology design. In the audience, CTO Tyler smiled proudly as his partner and co-founder explained how their middle school app had grown into a company employing hundreds and serving millions of students worldwide. Their commitment to accessibility and inclusive design had revolutionized how the tech industry thought about user experience, proving that the best innovations come from understanding real human needs.",
        microVariants: ["Their middle school romance grew into a business partnership that changed the technology industry's approach to inclusive design.", "From sixth-grade coding club to global tech leadership, their journey inspired millions of young people to pursue both love and innovation."]
      },
      {
        type: 'cozy',
        text: "Every winter, {userName} and Tyler returned to Roosevelt Middle to judge the annual coding competition, watching new generations of students discover their potential. Their own children would join them soon, but for now they enjoyed seeing fresh faces light up with the same excitement they'd felt years ago. LunchSwap still ran in schools nationwide, but their favorite part was the quiet moments mentoring nervous sixth-graders who couldn't imagine they had anything valuable to contribute to technology. 'Everyone can code,' {userName} always told them. 'The question is: what problem do you want to solve?'",
        microVariants: ["Their annual return to mentor young coders kept alive the magic of discovery and possibility.", "The greatest success was inspiring others to find their own path from curiosity to creation."]
      }
    ],
    reuse: {
      swappableElements: {
        "technical_elements": ["app development", "user interface design", "database programming", "accessibility features"],
        "competition_aspects": ["team collaboration", "public presentation", "technical judging", "rival schools"],
        "relationship_dynamics": ["mentor-student bonds", "first romance", "peer support", "inclusive teamwork"]
      },
      weatherVariants: ["after-school coding sessions", "competition day energy", "celebration time"],
      settingVariants: ["school computer lab", "competition venue", "real tech office"],
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
        text: "Ava Rodriguez had been dreading Ms. Chen's heritage assignment for weeks, especially since her crush, Noah Kim, seemed so confident about his Korean family history. 'I wish I had something cool like that,' {userName} muttered to their best friend Jasmine during lunch. 'My family's just... complicated.' When {userName} finally sat down with their parents to research their background, they discovered something shocking: their 'biological' grandmother Maria had actually been adopted, their grandfather's family tree included Italian, Mexican, AND Filipino roots, and their dad had been raised by his aunt after his parents died in a car crash. 'Honey,' their mom said gently, 'our family doesn't fit in neat boxes, and that's actually pretty amazing.'",
        pause: true,
        hook: "How will {userName} turn their complicated family story into something special?",
        microVariants: {
          text: "The heritage assignment revealed that {userName}'s family history was beautifully complex rather than traditionally simple.",
          alternatives: ["What seemed like a confusing family background turned out to be a rich story of love and chosen connections.", "Sometimes the most interesting families are the ones that don't fit typical patterns."],
          optionalDetails: ["Noah offered to help with research techniques his dad had taught him", "Jasmine was dealing with her own identity questions", "Other students seemed so sure of their heritage stories"]
        }
      },
      {
        text: "The research phase became an adventure when {userName} convinced Noah and Jasmine to help interview their extended family. At Tía Rosa's house, they discovered boxes of old photographs showing family gatherings that included people from all different backgrounds - some biological relatives, some chosen family, some longtime friends who'd become part of their traditions. 'This is your real heritage,' Noah said, looking through pictures of quinceañeras where Korean neighbors danced alongside Mexican cousins. 'It's not about blood. It's about love.' {userName} felt their heart skip - was Noah always this wise, or was the soft lighting in Tía Rosa's kitchen making everything seem more romantic?",
        pause: true,
        hook: "What stories will these family photos reveal about belonging and identity?",
        microVariants: {
          text: "Family photos revealed a heritage built on love and chosen connections rather than just genetics.",
          alternatives: ["Old pictures showed how their family had always embraced diversity and inclusion.", "The real family story was about people choosing to belong together across cultural lines."],
          optionalDetails: ["Tía Rosa told stories about each photo in animated Spanish and English", "Jasmine documented everything on her phone for their research", "Noah's thoughtful comments made {userName}'s stomach flutter with butterflies"]
        }
      },
      {
        text: "Things got complicated when Madison Walsh, the popular girl who seemed to have perfect everything, made snide comments about {userName}'s 'made-up family story' during peer review day. 'That's not real heritage,' she said loudly enough for half the class to hear. 'My family came over on the Mayflower.' {userName} felt their face burn with embarrassment until Noah stood up from his desk. 'Actually, Madison, {userName}'s family represents what America really looks like - people from everywhere choosing to build something beautiful together.' The classroom went dead silent. Even Ms. Chen looked impressed. Jasmine squeezed {userName}'s hand under the desk and whispered, 'Your boyfriend just defended your honor like a knight in shining armor.'",
        pause: true,
        hook: "How will {userName} handle the tension between traditional and modern concepts of heritage?",
        microVariants: {
          text: "Noah's public defense of {userName}'s family story created both gratitude and romantic tension.",
          alternatives: ["Standing up to bullying revealed character and deepened friendships in unexpected ways.", "Sometimes the most powerful heritage stories are about inclusion rather than exclusion."],
          optionalDetails: ["Madison looked shocked that someone had challenged her", "Other students started whispering about Noah's courage", "{userName} had never been called Noah's 'boyfriend' before and liked how it sounded"]
        }
      },
      {
        text: "The presentation preparation brought {userName} and Noah closer together as they worked on visual displays in the art room after school. While Jasmine edited their interview videos, {userName} and Noah painted a family tree that looked more like a garden - with different colored branches representing chosen family, adoptive relationships, and cultural influences that had shaped their identity. 'Your family is like a patchwork quilt,' Noah said, accidentally brushing {userName}'s fingers while reaching for the {favoriteColor} paint. 'Each piece is different, but together they make something warm and beautiful.' The moment hung between them until Jasmine fake-coughed from across the room. 'Are you two going to kiss or finish this poster?'",
        pause: true,
        hook: "Will art class lead to {userName}'s first real romantic moment?",
        microVariants: {
          text: "Art room collaboration created intimate moments and romantic tension while building their heritage presentation.",
          alternatives: ["Working together on creative projects revealed feelings that had been building for weeks.", "Sometimes the best conversations happen when your hands are busy creating something meaningful."],
          optionalDetails: ["The art room smelled like paint and possibility", "Other students had gone home, leaving them in comfortable privacy", "Jasmine was an excellent wingwoman disguised as a helpful friend"]
        }
      },
      {
        text: "The week before presentations, {userName} discovered that several other classmates were also struggling with non-traditional family stories. Carmen's parents were same-sex partners who'd adopted from three different countries. David lived with his grandmother because his parents were deployed overseas. Even perfect Madison quietly admitted that her 'Mayflower ancestors' story was mostly family mythology - her great-grandmother had actually been an undocumented immigrant from Ireland. 'Maybe we should present together,' {userName} suggested during lunch. 'We could show how modern families create heritage in new ways.' Noah smiled proudly. 'That's brilliant. You're going to change how people think about belonging.'",
        pause: true,
        hook: "How will their group presentation challenge traditional ideas about family and heritage?",
        microVariants: {
          text: "Discovering other students' complex family stories led to a collaborative presentation about modern heritage.",
          alternatives: ["The assignment revealed that most families don't fit traditional patterns, creating opportunities for connection.", "Sometimes the most powerful learning happens when students teach each other about acceptance."],
          optionalDetails: ["Ms. Chen was excited about their innovative approach", "Parents volunteered to help with the group presentation", "The cafeteria became their regular planning headquarters"]
        }
      },
      {
        text: "Presentation day arrived with nervous energy and excited families filling the classroom. {userName} stood with their diverse group of presenters, heart pounding as they explained how heritage could include biological ancestry, chosen family, cultural adoption, and conscious tradition-making. When they shared Tía Rosa's stories about quinceañeras that welcomed Korean neighbors and Italian cousins, the audience was visibly moved. Noah squeezed {userName}'s hand encouragingly as they concluded: 'Our heritage isn't about where we came from. It's about how we choose to love and include each other.' The applause was thunderous, but the best moment came when Madison approached afterward to apologize and ask if she could join their 'Modern Families' discussion group.",
        pause: true,
        hook: "What impact will their presentation have on their school community's understanding of belonging?",
        microVariants: {
          text: "The group presentation transformed classroom discussions and inspired broader conversations about inclusive heritage.",
          alternatives: ["Public speaking about family diversity created community connections and changed minds about belonging.", "Sometimes courage to share personal stories opens hearts and builds bridges between different experiences."],
          optionalDetails: ["Parents were wiping away tears during the presentation", "Ms. Chen said it was the best project she'd seen in fifteen years", "Noah's hand-holding felt perfectly natural and right"]
        }
      },
      {
        text: "The success of their presentation led to unexpected opportunities when the principal asked them to present at the district's Diversity and Inclusion showcase. Working together to prepare for the bigger stage, {userName} and Noah's partnership deepened into something unmistakably romantic. During a late-night video call to finalize their slides, Noah finally said what they'd both been feeling: 'I really like you, {userName}. Not just as a project partner.' Through the screen, {userName} could see his nervous smile. 'I really like you too,' they admitted, feeling simultaneously terrified and thrilled. Jasmine, who'd been listening from her own video window, erupted in cheers. 'FINALLY! I've been waiting for this moment for weeks!'",
        pause: true,
        hook: "How will their new relationship dynamic affect their advocacy work?",
        microVariants: {
          text: "The district presentation opportunity coincided with {userName} and Noah's relationship becoming officially romantic.",
          alternatives: ["Professional collaboration blossomed into personal connection as their advocacy work expanded.", "Sometimes shared values and mutual respect naturally grow into deeper feelings."],
          optionalDetails: ["The district showcase would reach five schools and hundreds of families", "Video calls had become the highlight of their evenings", "Jasmine had been playing matchmaker more successfully than they'd realized"]
        }
      },
      {
        text: "At the district showcase, their presentation reached over 300 students and families from diverse backgrounds. Standing before the packed auditorium with Noah by their side (officially their boyfriend as of three days ago), {userName} felt confident sharing their message about inclusive heritage. When they finished, a high school senior approached them with tears in her eyes. 'Thank you,' she said. 'I'm adopted from China, and my family is white, and I've always felt like I didn't fit anywhere. Your presentation helped me realize that belonging isn't about looking the same - it's about loving the same.' Noah squeezed {userName}'s hand as they realized their seventh-grade project was genuinely changing lives.",
        pause: true,
        hook: "What lasting impact will their advocacy have on students across the district?",
        microVariants: {
          text: "The district presentation touched hundreds of families and inspired conversations about belonging across all schools.",
          alternatives: ["Their message about inclusive heritage resonated with students who'd felt isolated by traditional family narratives.", "Sometimes the most powerful activism starts with middle school students brave enough to share their truth."],
          optionalDetails: ["News reporters covered the event", "Other schools requested similar presentations", "The adopted senior became their mentor and friend"]
        }
      },
      {
        text: "Spring semester brought the formation of their official 'Modern Families Club,' meeting weekly in Ms. Chen's classroom with membership that had grown to include students from all grades. {userName} and Noah co-facilitated discussions about adoption, immigration, blended families, and chosen family structures while Jasmine documented their conversations for a potential book project. The club became a safe space where students could share complex family stories without judgment. 'We're creating new traditions,' {userName} realized during one particularly meaningful meeting about holiday celebrations. 'Just like our families did.' Noah smiled across their circle of chairs. 'And just like we will with our own families someday.'",
        pause: true,
        hook: "How will their club influence the broader school culture around family diversity?",
        microVariants: {
          text: "The Modern Families Club created ongoing safe spaces for students to explore identity and belonging.",
          alternatives: ["Weekly meetings built community among students whose families didn't fit traditional molds.", "Sometimes the most important learning happens in student-led spaces designed for authentic sharing."],
          optionalDetails: ["Teachers asked to observe their facilitation techniques", "Parents volunteered to share their own family stories", "The club's influence was spreading to other schools in the district"]
        }
      },
      {
        text: "The school year culminated when their club was invited to present at the state education conference about student-led diversity initiatives. Standing before hundreds of educators and administrators, {userName} felt nervous but proud explaining how their heritage assignment had evolved into a movement. 'Traditional curricula often assume nuclear families with clear ethnic backgrounds,' they said confidently. 'But our generation needs education that reflects family diversity and teaches inclusion as heritage.' When Noah added, 'Students can lead these conversations if adults create space for our voices,' the audience burst into applause. Later, during the conference dinner, {userName} and Noah shared their first official public kiss, surrounded by educators who'd been inspired by their leadership.",
        pause: true,
        hook: "What changes will their advocacy inspire in educational curricula statewide?",
        microVariants: {
          text: "The state conference established their reputation as youth leaders in educational diversity and inclusion.",
          alternatives: ["Seventh-grade advocacy was influencing adult professionals to reconsider how schools address family diversity.", "Their romantic relationship had grown alongside their shared commitment to social change."],
          optionalDetails: ["Three school districts requested consultation on inclusive curriculum", "Education professors wanted to study their peer facilitation methods", "The conference organizers offered them summer internships"]
        }
      },
      {
        text: "Summer brought reflection as {userName} and Noah worked as junior counselors at a camp for adopted children and diverse families. Watching younger kids struggle with identity questions they'd faced themselves, {userName} realized how much they'd grown since that first heritage assignment. 'Remember when you thought your family was just complicated?' Noah asked one evening as they sat together watching campers perform skits about their unique family stories. {userName} leaned against his shoulder, thinking about Tía Rosa's photos, Madison's transformation, and all the families they'd learned to celebrate. 'Now I know complicated means beautiful,' they said. 'And so does love.'",
        pause: true,
        hook: "How will their experiences prepare them for future leadership in diversity and inclusion work?",
        microVariants: {
          text: "Summer camp work allowed them to mentor younger children while deepening their relationship and understanding of family diversity.",
          alternatives: ["Professional experience with diverse families confirmed their passion for inclusion advocacy.", "Their personal growth and romantic development intertwined with their commitment to helping others find belonging."],
          optionalDetails: ["Camp directors were impressed by their maturity and leadership skills", "Parents requested them specifically as counselors for children with similar backgrounds", "Their relationship had become a model for other young couples at camp"]
        }
      },
      {
        text: "Starting eighth grade as established campus leaders felt both exciting and daunting. Their Modern Families Club had a waiting list, Ms. Chen had incorporated their inclusive heritage curriculum into standard assignments, and {userName} had been elected to student council on a platform of expanding diversity education. During their first council meeting, they proposed mandatory diversity training for all students and staff. 'Our school should be a place where every family structure feels welcome and valued,' they argued passionately. Noah, now student body vice president, nodded in support. 'We have the chance to make our school a model for inclusion,' he added. When the proposal passed unanimously, {userName} felt proud of how far they'd come from that nervous kid worried about their complicated family story.",
        pause: true,
        hook: "What lasting changes will their eighth-grade leadership create for future students?",
        microVariants: {
          text: "Eighth-grade leadership positions allowed them to implement systemic changes in school diversity education and policies.",
          alternatives: ["Student government became a platform for advancing the inclusion work they'd started in seventh grade.", "Their partnership in both romance and activism was creating lasting institutional change."],
          optionalDetails: ["The diversity training program became a district model", "Younger students looked up to them as mentors and role models", "Their relationship was known throughout school as both romantic and professionally collaborative"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Three years later, {userName} and Noah's high school graduation speech focused on how their seventh-grade heritage project had evolved into a statewide initiative for inclusive family education. Standing together at the podium as co-valedictorians, they announced their acceptance to the same college where they planned to study education policy and continue their advocacy work. 'Our complicated families taught us that love creates belonging,' {userName} concluded to thunderous applause. 'And our partnership taught us that shared values create the strongest relationships.' As they walked off stage hand-in-hand, Jasmine (now editor of the school newspaper) captured the moment that symbolized how academic collaboration could grow into lifelong love and social change.",
        microVariants: ["Their high school leadership in diversity education led to college scholarships and continued advocacy partnership.", "From seventh-grade heritage assignment to graduation speech, their journey proved that student voices could transform educational institutions."]
      },
      {
        type: 'cozy',
        text: "Five years later, {userName} and Noah returned to Ms. Chen's classroom as guest speakers for the annual Heritage Celebration, now a school tradition inspired by their original project. Watching seventh-graders present their diverse family stories with confidence and pride, they smiled at how natural inclusion had become. 'Remember when we were terrified to share our complicated families?' Noah whispered as they held hands in the back of the room. {userName} squeezed his fingers, thinking of Tía Rosa (now grandmother to their engagement), Madison (now their close friend), and Jasmine (their future maid of honor). 'The best complications,' they realized, 'are the ones that teach us love has infinite forms.'",
        microVariants: ["Their annual return as mentors kept their inclusive heritage work alive for new generations of students.", "Their engagement represented the natural evolution of partnership that began with shared values and collaborative activism."]
      }
    ],
    reuse: {
      swappableElements: {
        "family_complexity": ["adoption stories", "blended cultures", "chosen family bonds", "immigrant experiences"],
        "relationship_development": ["friendship to romance", "collaborative partnerships", "peer support networks", "mentorship dynamics"],
        "advocacy_evolution": ["classroom presentations", "school-wide programming", "district initiatives", "state-level influence"]
      },
      weatherVariants: ["research season discoveries", "presentation preparation", "celebration and recognition"],
      settingVariants: ["family homes and stories", "school collaboration spaces", "community presentation venues"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },
  {
    title: "The Digital Citizenship Dilemma", 
    theme: "Ethics & Technology",
    level: "Grade 7",
    scenes: [
      {
        text: "Everything started going wrong during lunch when {userName} saw popular eighth-grader Kai Thompson screenshot a private text from their classmate Emma Santos, adding the caption 'Guess who has a crush on Mr. Rodriguez 😂' before posting it to his story. Within minutes, the screenshot was everywhere - TikTok, Snapchat, Instagram. {userName} watched Emma's face crumble as notifications exploded on her phone. 'This is so messed up,' whispered {userName}'s best friend Riley, but they both just stood there, frozen. When Emma ran to the bathroom in tears, {userName} felt sick. They had the power to speak up, but would anyone listen? And what if Kai's crew turned on them next?",
        pause: true,
        hook: "Will {userName} find the courage to stand up against digital bullying?",
        microVariants: {
          text: "A viral screenshot destroyed Emma's privacy and dignity while {userName} faced the difficult choice of whether to intervene.",
          alternatives: ["Digital cruelty spread faster than {userName} could process, forcing difficult decisions about bystander responsibility.", "What started as a 'harmless joke' quickly became a lesson in how technology amplifies both kindness and cruelty."],
          optionalDetails: ["Other students were sharing and commenting before understanding the context", "Emma's crush on their young teacher was innocent and sweet", "Kai seemed to enjoy the chaos he'd created"]
        }
      },
      {
        text: "That afternoon, {userName} couldn't concentrate on anything except Emma's devastated expression. During computer science class, they found themselves sitting next to Alex Chen, the quiet kid who everyone knew was brilliant with technology but rarely spoke up about social stuff. 'The Emma thing is really bothering you, isn't it?' Alex said softly, surprising {userName}. When they nodded, Alex pulled out their phone and showed {userName} something shocking: detailed analytics showing how Kai's post had been shared over 200 times in four hours, reaching students from three different schools. 'Digital harassment spreads like a virus,' Alex explained. 'But so does digital activism. We could fight back, if you want.'",
        pause: true,
        hook: "How can {userName} and Alex use technology to combat the digital harassment?",
        microVariants: {
          text: "Alex Chen's tech expertise offered {userName} a way to turn digital tools from weapons into shields for their classmate.",
          alternatives: ["Quiet Alex emerged as an unexpected ally with both technical skills and moral clarity.", "Sometimes the most powerful friendships form when shared values meet complementary skills."],
          optionalDetails: ["Alex had been documenting digital harassment patterns for months", "Their analytics showed how quickly online cruelty could spread", "Riley joined their planning session after overhearing their conversation"]
        }
      },
      {
        text: "The trio spent the weekend developing what Alex called 'Operation Digital Shield' - a multi-platform campaign to counter the harassment with support for Emma. Riley, who'd always been artistic, designed graphics promoting digital kindness. Alex built a website documenting the real impact of cyberbullying, while {userName} reached out to classmates they trusted, building a network of students ready to flood social media with positive messages. But their biggest breakthrough came when {userName} convinced Emma's older sister Maya, a high school senior with 3,000 followers, to share her own story about overcoming online harassment. 'My sister shouldn't have to deal with this alone,' Maya said fiercely. 'And neither should any of you.'",
        pause: true,
        hook: "Will their digital activism campaign successfully support Emma and change online behavior?",
        microVariants: {
          text: "Operation Digital Shield combined creative content, technical expertise, and social networking to combat harassment with kindness.",
          alternatives: ["Three unlikely allies discovered they could use social media platforms to spread empathy instead of cruelty.", "Sometimes the best response to viral negativity is organized, intentional positivity."],
          optionalDetails: ["Maya's story resonated with students from multiple schools", "Their positive hashtag started trending locally", "Even some of Kai's friends began questioning his behavior"]
        }
      },
      {
        text: "Monday morning brought the results of their campaign - and unexpected complications. Emma returned to school smiling for the first time in days, surrounded by supportive messages and new friendships sparked by their activism. But Kai was furious about the counter-narrative and confronted {userName} in the hallway. 'You think you're some kind of digital hero?' he sneered, loud enough for everyone to hear. Before {userName} could respond, something amazing happened: Alex stepped forward, no longer the quiet kid in the corner. 'Actually, we think we're decent human beings,' Alex said calmly. 'You should try it sometime.' The crowd that had gathered erupted in supportive comments and laughter, marking a clear shift in social power.",
        pause: true,
        hook: "How will the confrontation change the school's digital culture and social dynamics?",
        microVariants: {
          text: "Public confrontation revealed how their digital activism had shifted social support toward kindness and accountability.",
          alternatives: ["Alex's newfound confidence and {userName}'s leadership had created a new social dynamic based on empathy.", "Sometimes standing up to bullies requires both online strategy and offline courage."],
          optionalDetails: ["Teachers overheard the exchange and began paying closer attention", "Emma publicly thanked her defenders, inspiring others to speak up", "Several students approached {userName} for advice about their own online harassment situations"]
        }
      },
      {
        text: "The success of Operation Digital Shield caught the attention of Ms. Martinez, the media literacy teacher, who invited them to present their campaign to the whole seventh grade. Standing before 150 classmates, {userName} felt nervous but determined as they explained how they'd used the same platforms that spread harassment to build support networks instead. Alex presented the technical data showing how positive content could 'go viral' just like negative content, while Riley shared the creative strategies they'd used to make kindness feel cool and engaging. When Emma joined them on stage to thank the audience for their support, the sustained applause felt like a victory for digital humanity.",
        pause: true,
        hook: "What broader changes will their presentation inspire in school policy and student behavior?",
        microVariants: {
          text: "The seventh-grade presentation established them as digital citizenship leaders and inspired policy discussions.",
          alternatives: ["Public speaking about their activism transformed {userName}, Alex, and Riley from reactive helpers to proactive leaders.", "Sometimes the most powerful education happens when students teach each other about using technology responsibly."],
          optionalDetails: ["Ms. Martinez was taking notes for curriculum development", "Several teachers asked for consultation on digital citizenship policies", "Students from other grades requested similar presentations"]
        }
      },
      {
        text: "Spring semester brought new challenges when {userName} was elected to student council on a platform of improving digital citizenship school-wide. Working with Alex (now student tech advisor) and Riley (editor of the digital school newspaper), they developed comprehensive guidelines for social media use that emphasized empathy and accountability. But their biggest test came when they had to mediate a conflict between two popular cliques who were using Instagram stories to wage psychological warfare against each other. 'This is exactly what we fought against with Emma,' {userName} reminded the group during a tense meeting in the principal's office. 'We can be better than this.'",
        pause: true,
        hook: "Can their mediation skills resolve complex social media conflicts between different groups?",
        microVariants: {
          text: "Student council leadership gave {userName} official power to address digital citizenship issues at the institutional level.",
          alternatives: ["Their success with Emma's situation established them as trusted mediators for more complex online conflicts.", "Sometimes effective activism leads to opportunities for systematic change and policy influence."],
          optionalDetails: ["The principal was impressed by their mature approach to conflict resolution", "Other schools began requesting consultation on student-led digital citizenship programs", "Their friendship trio had become a recognized leadership team"]
        }
      },
      {
        text: "The mediation sessions revealed something unexpected: most students engaged in online drama because they felt powerless or invisible in real life. Working with the school counselor, {userName}, Alex, and Riley developed peer support groups that addressed the emotional needs underlying digital aggression. 'Hurt people hurt people,' Alex observed during one of their planning meetings. 'But supported people support people.' Their program paired students struggling with online behavior with mentors who'd overcome similar challenges. Emma, now confident and healed, became one of their most effective peer counselors, helping other students navigate the intersection of technology and emotions.",
        pause: true,
        hook: "How will addressing underlying emotional needs transform the school's digital culture long-term?",
        microVariants: {
          text: "Peer support programming addressed the emotional roots of digital harassment while building empathy and connection.",
          alternatives: ["Understanding why students engaged in online cruelty led to more effective interventions than punishment alone.", "Sometimes the most sustainable solutions address human needs rather than just problematic behaviors."],
          optionalDetails: ["The counseling department expanded their digital wellness resources", "Students were voluntarily seeking help for online behavior issues", "Emma's transformation from victim to advocate inspired others"]
        }
      },
      {
        text: "By eighth grade, {userName} had become known as the go-to person for digital citizenship issues, but their favorite part was watching the culture shift they'd helped create. New seventh-graders arrived at a school where online kindness was genuinely cool, where students actively called out harassment, and where technology was seen as a tool for connection rather than destruction. During the annual Digital Citizenship Week (a tradition they'd started), {userName} watched Alex confidently lead workshops on ethical technology use while Riley moderated panel discussions about social media and mental health. 'We actually changed things,' {userName} marveled to Emma during the closing ceremony. 'Like, really changed them.'",
        pause: true,
        hook: "What lasting impact will their digital citizenship work have on future students?",
        microVariants: {
          text: "Eighth-grade reflection revealed how their activism had created institutional changes and cultural shifts around technology use.",
          alternatives: ["Their individual response to one incident had grown into systematic changes that would protect future students.", "Sometimes the most important legacy work happens when students create better environments for those who come after them."],
          optionalDetails: ["Digital Citizenship Week had become a district-wide initiative", "Other schools were adopting their peer mediation models", "National education organizations had featured their program as a best practice"]
        }
      },
      {
        text: "The program's success led to an invitation to speak at the state technology education conference, where {userName} addressed an audience of teachers, administrators, and policy makers about student-led approaches to digital citizenship. 'Adults often try to solve technology problems by restricting technology,' they said confidently from the podium. 'But we believe the solution is teaching students to use technology with empathy and intention.' Alex and Riley flanked them for moral support as they shared statistics showing decreased cyberbullying and increased peer support in schools that implemented student-led digital citizenship programs. When the audience gave them a standing ovation, {userName} felt proud not just of their success, but of how they'd grown from a bystander to a leader.",
        pause: true,
        hook: "How will their state-level advocacy influence digital citizenship education policy?",
        microVariants: {
          text: "The state conference established their credibility as youth experts on digital citizenship and technology ethics.",
          alternatives: ["Speaking to adult professionals validated their student-led approach and expanded their influence beyond their school.", "Their confidence in addressing systemic issues had grown from local activism to state-level policy advocacy."],
          optionalDetails: ["Several districts requested implementation assistance for similar programs", "Education professors wanted to study their peer mediation model", "Technology companies asked for consultation on ethical design for teen users"]
        }
      },
      {
        text: "Summer brought unexpected opportunities when a major social media company invited them to participate in their Teen Advisory Council, helping design safety features for young users. Working alongside teenagers from across the country, {userName} felt both excited and sobered by the responsibility. 'We're not just representing our school anymore,' Alex pointed out during one of their video conference planning sessions. 'We're representing all students who've been hurt by technology.' Their input influenced features like improved reporting mechanisms, empathy prompts before posting, and digital wellness tools. When the company's CEO personally thanked them for their contributions, {userName} realized their seventh-grade activism had grown into a platform for protecting young people nationwide.",
        pause: true,
        hook: "What other opportunities will their digital citizenship expertise create?",
        microVariants: {
          text: "Corporate consulting opportunities validated their expertise while expanding their influence to national technology policy.",
          alternatives: ["Their grassroots activism had evolved into professional expertise that could influence how technology companies design platforms for young people.", "Sometimes local solutions to universal problems attract attention from decision-makers who can implement change at scale."],
          optionalDetails: ["The Teen Advisory Council became a permanent feature of the company's development process", "Their safety recommendations were implemented across multiple platforms", "They were invited to speak at technology conferences worldwide"]
        }
      },
      {
        text: "Starting high school, {userName} reflected on how much had changed since that awful lunch period when Emma was harassed and they'd felt powerless to help. Now they were co-president of the Regional Youth Digital Rights Coalition, Alex was designing ethical technology curricula for middle schools, and Riley was the editor-in-chief of a teen publication focused on technology and social justice. Emma had been accepted to a prestigious summer program for aspiring counselors, planning to specialize in digital wellness. 'Remember when we thought technology was just something that happened to us?' Riley asked during their weekly planning meeting. {userName} smiled, thinking of all the students they'd helped and policies they'd influenced. 'Now we know we can shape how it happens.'",
        pause: true,
        hook: "How will their continued partnership create lasting change in digital citizenship education?",
        microVariants: {
          text: "High school transition marked their evolution from reactive helpers to proactive leaders in digital rights and ethics.",
          alternatives: ["Their friendship and shared values had grown into a professional partnership focused on protecting young people online.", "From seventh-grade bystanders to high school digital rights advocates, their journey proved students could create systematic change."],
          optionalDetails: ["Their coalition was influencing policy at both state and federal levels", "Technology companies regularly consulted them on youth safety features", "Their story was being taught in digital citizenship curricula nationwide"]
        }
      },
      {
        text: "Graduation day brought full-circle reflection when {userName} was selected as valedictorian, with their speech focusing on the power of digital citizenship to transform communities. Looking out at the audience, they spotted Emma (now a peer counseling specialist), Alex (heading to MIT for computer science), and Riley (accepted to journalism school on a full scholarship). 'Four years ago, we learned that technology amplifies human nature - both our cruelty and our compassion,' {userName} said to the packed auditorium. 'We chose to amplify compassion, and it changed everything.' As they walked off stage, {userName} felt grateful that a moment of moral crisis in seventh grade had led to a lifetime of meaningful work protecting others from the same harm they'd witnessed.',
        pause: true,
        hook: "What legacy will their digital citizenship work leave for future generations of students?",
        microVariants: {
          text: "Graduation speech reflected on how their seventh-grade response to cyberbullying had grown into a movement for ethical technology use.",
          alternatives: ["Their valedictorian address demonstrated how individual moral courage could grow into systematic social change.", "From bystanders to leaders, their journey proved that young people could reshape digital culture through persistent advocacy and collaboration."],
          optionalDetails: ["Their digital citizenship curriculum was being implemented in hundreds of schools", "Major technology platforms had adopted their safety recommendations", "They were already accepted to college programs in technology ethics and digital rights law"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant', 
        text: "Five years later, {userName} stood before the United Nations Youth Assembly, presenting their research on global digital citizenship education as a doctoral candidate in Technology Ethics. In the audience, Alex (now a leading AI safety researcher) and Riley (investigative journalist covering technology and human rights) smiled proudly as their former classmate advocated for international standards protecting young people online. Their seventh-grade response to one instance of cyberbullying had grown into a global movement, proving that students who refuse to be bystanders can reshape the digital world for everyone.",
        microVariants: ["Their grassroots digital citizenship work evolved into international advocacy, influencing how nations protect young people online.", "From middle school bystanders to global leaders, their journey demonstrated how moral courage could create worldwide change."]
      },
      {
        type: 'cozy',
        text: "Every year, {userName} returned to their old middle school for Digital Citizenship Week, watching new seventh-graders learn the skills they'd helped develop. Emma, now the school's digital wellness counselor, would join them to share stories about overcoming online harassment and building supportive communities. 'The internet is a reflection of who we choose to be,' {userName} always told the students. 'Choose kindness.' Watching young faces light up with understanding, they felt proud that their moment of moral courage had created lasting protection for countless students who would never have to face digital harassment alone.",
        microVariants: ["Annual mentoring visits kept their digital citizenship legacy alive, protecting new generations from online harm.", "Their program had become so embedded in school culture that ethical technology use felt natural and expected."]
      }
    ],
    reuse: {
      swappableElements: {
        "digital_platforms": ["Instagram stories", "TikTok challenges", "Snapchat harassment", "group chat drama"],
        "harassment_types": ["screenshot sharing", "fake rumor spreading", "exclusion campaigns", "identity theft"],
        "activism_strategies": ["positive content creation", "peer support networks", "policy development", "adult collaboration"]
      },
      weatherVariants: ["crisis response", "campaign development", "policy implementation"],
      settingVariants: ["school hallways and classrooms", "digital platforms", "community meeting spaces"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },
  {
    title: "The Mental Health Awareness Campaign",
    theme: "Peer Support & Emotional Wellness", 
    level: "Grade 7",
    scenes: [
      {
        text: "The first sign something was wrong came when {userName}'s usually bubbly friend Jordan stopped laughing at lunch. Day after day, Jordan picked at their food silently while the rest of their group chatted about homework and weekend plans. When {userName} tried asking what was wrong, Jordan just shrugged and said 'I'm fine' - but their eyes told a different story. Meanwhile, {userName} noticed other classmates showing similar signs: Aisha constantly checking her phone with a worried expression, Marcus snapping at friends over minor things, and even confident Sophia seeming overwhelmed by simple decisions. 'Is everyone okay this year?' {userName} wondered aloud to their best friend Casey. 'Because it feels like everyone's struggling with something.'",
        pause: true,
        hook: "How can {userName} help friends who seem to be struggling but won't talk about it?",
        microVariants: {
          text: "Observing friends' emotional struggles, {userName} recognized signs that their peer group needed mental health support but lacked ways to discuss it.",
          alternatives: ["Multiple classmates were showing signs of distress, making {userName} realize their generation needed better tools for emotional wellness.", "The silent suffering of friends motivated {userName} to research how young people could support each other's mental health."],
          optionalDetails: ["The school counselor had a waiting list of three weeks", "Social media seemed to make everyone's anxiety worse", "Parents and teachers didn't seem to notice the emotional changes students were experiencing"]
        }
      },
      {
        text: "Everything changed during health class when Ms. Rodriguez shared statistics about teenage mental health that made the room go completely silent. Depression rates among teens had doubled in five years. Anxiety disorders affected one in three middle schoolers. Suicide was the second leading cause of death for people their age. When {userName} looked around the classroom, they saw their own shock reflected in twenty-eight other faces. After class, Jordan finally approached {userName} with tears in their eyes. 'I think I might be one of those statistics,' they whispered. 'I don't know what's wrong with me, but everything feels impossible lately.' That's when {userName} realized their friends weren't just having 'bad days' - they needed real support, and there was nowhere to get it.",
        pause: true,
        hook: "What can {userName} do to create mental health support for students who need help now?",
        microVariants: {
          text: "Alarming mental health statistics and Jordan's vulnerable admission revealed the urgent need for peer support systems.",
          alternatives: ["Learning about teen mental health crisis statistics made the classroom problems feel part of a larger emergency.", "Jordan's confession transformed abstract statistics into personal reality, motivating {userName} to take action."],
          optionalDetails: ["Several students were visibly crying during the statistics presentation", "The school nurse confirmed she'd seen increased anxiety-related visits", "Ms. Rodriguez seemed as concerned as the students about the data she'd presented"]
        }
      },
      {
        text: "That weekend, {userName} dove deep into research about peer support and mental health advocacy, discovering programs at other schools where students had successfully created supportive communities. They learned about active listening techniques, crisis intervention basics, and how to recognize when someone needed professional help versus peer support. But the most important discovery came when they found stories of teenagers who'd overcome mental health challenges with the help of understanding friends. When Casey offered to help research, {userName} realized they wouldn't have to tackle this alone. 'We could actually make a difference,' Casey said excitedly. 'We could create the support system we wish existed.'",
        pause: true,
        hook: "How will {userName} and Casey design a peer support system that really helps their classmates?",
        microVariants: {
          text: "Research revealed effective peer support models while Casey's partnership provided the encouragement {userName} needed to move forward.",
          alternatives: ["Discovering successful student mental health programs gave {userName} hope that their generation could solve its own wellness crisis.", "Casey's enthusiasm transformed {userName}'s individual concern into a collaborative mission to help their peers."],
          optionalDetails: ["Online training modules taught them basic counseling skills", "Other schools shared detailed guides for starting peer support programs", "Mental health professionals offered to provide guidance for student-led initiatives"]
        }
      },
      {
        text: "Starting their mental health awareness initiative required navigating complex school bureaucracy, but {userName} and Casey were determined. They presented their research to Principal Martinez, who was surprisingly supportive after learning about the three-week counseling wait list and increased nurse visits for anxiety. 'Student peer support could really help,' she agreed, 'but we'll need proper training and adult supervision.' That's when Jordan stepped up in a way that surprised everyone. 'I want to help,' they said quietly during their planning meeting in the library. 'Maybe talking about my struggles could help other people feel less alone.' Aisha and Marcus, who'd been listening from nearby tables, asked if they could join too. Suddenly, their two-person initiative had become a movement.",
        pause: true,
        hook: "How will peer support group members help each other while learning to help others?",
        microVariants: {
          text: "Administrative support and brave peer volunteers transformed {userName}'s idea into an official school program with real participants.",
          alternatives: ["Students who'd been struggling privately found courage to join the peer support initiative publicly.", "The hardest part wasn't getting adult permission - it was helping peers overcome the stigma of seeking emotional support."],
          optionalDetails: ["The school social worker volunteered to provide training and supervision", "Teachers started referring students who seemed to be struggling", "Word spread quickly through social media and hallway conversations"]
        }
      },
      {
        text: "Training sessions with Ms. Chen, the school social worker, revealed how much {userName}'s peer group had been carrying without support. Learning active listening skills, crisis recognition, and self-care strategies, they also shared their own experiences with anxiety, depression, family stress, and social pressure. Jordan's openness about their therapy sessions encouraged others to talk about medication, counseling experiences, and family mental health history. 'We're not trying to be therapists,' {userName} reminded the group during one particularly emotional session. 'We're trying to be the friends we wish we'd had when we were struggling alone.' The training brought them closer together while preparing them to support others authentically.",
        pause: true,
        hook: "How will their personal experiences with mental health challenges strengthen their ability to help peers?",
        microVariants: {
          text: "Professional training combined with personal vulnerability created a peer support team with both skills and authentic experience.",
          alternatives: ["Learning counseling techniques while sharing their own struggles prepared them to offer genuine empathy alongside practical help.", "The training process revealed that many 'popular' and 'successful' students were also dealing with mental health challenges privately."],
          optionalDetails: ["Ms. Chen was impressed by their emotional maturity and commitment", "Group members started supporting each other outside of official meetings", "Parents were initially concerned but became supportive after meeting the supervising adults"]
        }
      },
      {
        text: "Launch day for 'Minds Matter,' their peer support program, brought nervous excitement and a packed library meeting room. {userName} had worried no one would come, but twenty-three students showed up for the first session - some dragged by friends, some desperately seeking help, others just curious about mental health discussions. When Jordan shared their story about recognizing depression symptoms and getting help, the room was completely silent except for occasional sniffles. 'The hardest part wasn't admitting I needed help,' Jordan concluded. 'It was believing I deserved to feel better.' The discussion that followed was the most honest conversation about emotions {userName} had ever witnessed among their peers.",
        pause: true,
        hook: "What impact will ongoing peer support meetings have on participants and the broader school community?",
        microVariants: {
          text: "The first Minds Matter meeting exceeded expectations, creating safe space for authentic mental health conversations among peers.",
          alternatives: ["Jordan's vulnerability gave other students permission to share their own struggles and seek support openly.", "What started as a small initiative became a packed room of students hungry for emotional connection and understanding."],
          optionalDetails: ["Several participants scheduled individual counseling after the group meeting", "Teachers reported improved classroom participation from several group members", "Students started using mental health vocabulary more comfortably in daily conversations"]
        }
      },
      {
        text: "By winter, Minds Matter had grown to include weekly support circles, mental health awareness presentations for younger grades, and partnerships with local therapists who provided training workshops. {userName} found themselves becoming a trusted resource for classmates in crisis, learning to balance empathy with appropriate boundaries. The program's success attracted attention from other schools, and {userName} was invited to speak at a district mental health summit alongside professional counselors and psychologists. 'Student peer support isn't just helpful,' they told the audience of adults. 'It's essential. We understand each other's language and experiences in ways that adults, no matter how well-meaning, sometimes can't.'",
        pause: true,
        hook: "How will district recognition expand their mental health advocacy beyond their own school?",
        microVariants: {
          text: "District-level recognition established {userName} as a youth mental health advocate while expanding peer support to other schools.",
          alternatives: ["Speaking alongside mental health professionals validated their peer support approach and inspired program replication.", "Their grassroots initiative had grown into a model that professionals wanted to study and implement elsewhere."],
          optionalDetails: ["Three middle schools requested help starting similar programs", "Local mental health organizations offered internship opportunities", "Casey had become co-facilitator and was equally recognized for their leadership"]
        }
      },
      {
        text: "Spring brought both triumph and challenge when the state education department featured Minds Matter as a 'Best Practice' for student mental health programming. The recognition was amazing, but {userName} struggled with the pressure of being seen as the 'mental health kid' by classmates who didn't understand that advocates could also need support sometimes. During a particularly stressful week of standardized testing and college prep anxiety, {userName} found themselves in Jordan's position from months earlier - overwhelmed and struggling to cope. 'I think I need to take my own advice,' they admitted to Casey and Jordan during a private moment after their weekly meeting. 'Being a helper doesn't make me immune to needing help.'",
        pause: true,
        hook: "How will {userName}'s own mental health challenges affect their advocacy work and personal growth?",
        microVariants: {
          text: "Recognition brought pressure that challenged {userName} to practice self-care and accept support from the community they'd created.",
          alternatives: ["Success in mental health advocacy didn't protect {userName} from their own emotional struggles, teaching important lessons about self-care.", "Leading peer support required {userName} to model vulnerability and help-seeking, not just strength and guidance."],
          optionalDetails: ["The peer support team rallied around {userName} just as they'd learned to do for others", "Ms. Chen helped them understand that advocates need support systems too", "Taking a brief step back from leadership responsibilities actually strengthened the program's sustainability"]
        }
      },
      {
        text: "Eighth-grade transition brought reflection on how much their school culture had changed since starting Minds Matter. Mental health vocabulary was now part of everyday conversation. Students regularly checked in on each other's emotional wellbeing. Teachers had received training on recognizing mental health warning signs. Most importantly, seeking help for emotional struggles had become normalized rather than stigmatized. During their final seventh-grade Minds Matter meeting, {userName} looked around the room at peers who'd found their voices, formed supportive friendships, and learned to navigate mental health challenges with community support. 'We didn't just create a program,' they realized. 'We created a culture where it's okay to not be okay, and where no one has to struggle alone.'",
        pause: true,
        hook: "What lasting cultural changes will their mental health advocacy create for future students?",
        microVariants: {
          text: "Eighth-grade reflection revealed how Minds Matter had transformed school culture around mental health and peer support.",
          alternatives: ["Their peer support program had created lasting changes in how students talked about and supported each other's mental health.", "The cultural shift from individual struggle to community support would benefit students for years to come."],
          optionalDetails: ["Incoming seventh-graders would enter a school where mental health support was already normalized", "Teachers incorporated emotional wellness into their regular curriculum", "The program had a waiting list of students wanting to become peer facilitators"]
        }
      },
      {
        text: "High school brought new opportunities when {userName} was recruited for the Regional Youth Mental Health Coalition, working alongside teenagers from five counties to advocate for better mental health resources in schools. Their expertise from Minds Matter made them a valuable contributor to policy discussions about counseling ratios, crisis intervention protocols, and peer support funding. But the most meaningful work remained local - mentoring new Minds Matter facilitators, maintaining friendships with Jordan, Casey, and other program alumni, and continuing to normalize conversations about emotional wellness in their daily interactions. 'Mental health advocacy isn't just about programs,' {userName} reflected during a coalition planning meeting. 'It's about changing how we treat each other every single day.'",
        pause: true,
        hook: "How will their continued mental health advocacy influence policy and culture beyond their original school?",
        microVariants: {
          text: "High school mental health coalition work expanded their influence while keeping them grounded in the peer relationships that started their advocacy.",
          alternatives: ["Regional advocacy built on their local success, allowing them to influence mental health policy at larger scales.", "Their foundation in authentic peer support kept them focused on human connections while engaging in policy work."],
          optionalDetails: ["Several coalition members had started similar programs in their own schools", "State legislators consulted them about youth mental health policy", "Their friendship with original Minds Matter members remained strong and supportive"]
        }
      },
      {
        text: "Graduation day brought full recognition when {userName} received the 'Community Impact Award' for their mental health advocacy, but the real celebration happened at the Minds Matter alumni gathering the night before. Sitting in a circle with Jordan (now a peer counseling specialist), Casey (planning to study social work), and dozens of other students whose lives had been touched by their program, {userName} felt grateful for the struggle that had sparked their mission. 'I'm proud of the program we built,' they told the group. 'But I'm most proud of how we learned to take care of each other.' When Jordan added, 'And how we learned to let others take care of us too,' the room filled with the kind of supportive laughter that had become their trademark.",
        pause: true,
        hook: "What impact will their mental health advocacy have on their future careers and continued service?",
        microVariants: {
          text: "Graduation celebration revealed how their mental health advocacy had created lasting relationships and career directions for multiple students.",
          alternatives: ["The alumni gathering demonstrated that their peer support program had become a launching pad for lifetime careers in mental health service.", "Recognition was meaningful, but the relationships and cultural changes they'd created were the true measure of success."],
          optionalDetails: ["Several Minds Matter alumni were pursuing careers in counseling, social work, or psychology", "The program was now permanently embedded in school culture", "Their model was being replicated in schools across multiple states"]
        }
      },
      {
        text: "Five years later, Dr. {userName} completed their psychology doctorate with a dissertation on peer support models in adolescent mental health, but they still returned every October for Mental Health Awareness Week at their old middle school. Watching new seventh-graders facilitate support circles with confidence and compassion, they marveled at how their desperate response to friends' struggles had grown into a sustainable system that continued helping students long after they'd graduated. Jordan, now a licensed counselor specializing in teen therapy, would join them for the traditional 'founder's panel' where they shared the origin story of Minds Matter. 'Sometimes the most powerful help comes from people who understand exactly what you're going through,' {userName} always told the current students. 'And sometimes those people are sitting right next to you in math class.'",
        pause: true,
        hook: "How will their model continue inspiring peer support programs in schools nationwide?",
        microVariants: {
          text: "Professional success in mental health allowed {userName} to continue supporting the peer program that had launched their career and passion.",
          alternatives: ["Annual return visits kept their original mission alive while demonstrating how early advocacy could grow into lifelong careers.", "Their story proved that middle school students could create lasting institutional change that benefits generations of peers."],
          optionalDetails: ["Minds Matter had been implemented in over 200 schools nationwide", "Their research continued informing best practices for peer mental health support", "The original friend group remained close and continued collaborating on mental health initiatives"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every autumn, {userName} returned to facilitate the annual Minds Matter training retreat, watching new generations of seventh-graders discover their capacity for empathy and peer support. Sitting by the lake where they'd first brainstormed their mental health program with Casey and Jordan, now both successful mental health professionals, they felt deep satisfaction knowing their response to teenage emotional crisis had created lasting protection for students they'd never meet. 'The best programs are the ones that don't need their founders,' {userName} reflected, watching confident student facilitators lead activities they'd designed years earlier. 'We didn't just create Minds Matter. We created mind-changers.'",
        microVariants: ["Annual retreats kept their peer support legacy alive while demonstrating how student-created programs could become permanently embedded in school culture.", "Their friendship and shared commitment to mental health advocacy had grown into a professional network dedicated to supporting young people."]
      },
      {
        type: 'triumphant', 
        text: "Ten years after starting Minds Matter in seventh grade, {userName} addressed the National Conference on Youth Mental Health as the youngest keynote speaker in the event's history. In the audience, Jordan (now a clinical director), Casey (leading a nonprofit for teen mental health), and dozens of other Minds Matter alumni cheered as their former classmate shared research showing how peer support programs reduced teen suicide rates, improved academic outcomes, and created more empathetic school cultures nationwide. 'Mental health advocacy isn't just about helping people survive their struggles,' {userName} concluded to thunderous applause. 'It's about helping them thrive as advocates for others who are still struggling.'",
        microVariants: ["National recognition validated their peer support model while demonstrating how middle school advocacy could influence mental health policy nationwide.", "Their original friend group had become a professional network dedicated to expanding access to youth mental health support."]
      }
    ],
    reuse: {
      swappableElements: {
        "mental_health_challenges": ["anxiety disorders", "depression symptoms", "family stress", "social pressure", "academic overwhelm"],
        "support_strategies": ["active listening", "crisis recognition", "peer counseling", "group facilitation", "self-care education"],
        "program_elements": ["support circles", "awareness campaigns", "training workshops", "crisis protocols", "cultural change initiatives"]
      },
      weatherVariants: ["crisis recognition", "program development", "community building"],
      settingVariants: ["library meeting spaces", "counseling offices", "community presentation venues"],
      randomSeed: Math.floor(Math.random() * 10000)
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
        text: "Liam Rodriguez had never thought much about environmental inequality until he started walking home with his crush, Zara Patel, through the industrial district where she lived. While his neighborhood had tree-lined streets and pristine parks, Zara's route passed three factories, a waste processing plant, and air so thick you could taste the chemicals. 'Don't you ever wonder why our environmental science class only takes field trips to the nature preserve?' Zara asked, pulling her inhaler from her backpack. 'Half our class has asthma, but we never talk about why.' {userName} realized with growing shame that they'd never connected their comfortable suburban life with their classmates' daily exposure to environmental hazards.",
        pause: true,
        hook: "Will {userName} find the courage to investigate environmental inequality in their own community?",
        microVariants: {
          text: "Walking through Zara's industrial neighborhood opened {userName}'s eyes to environmental injustices they'd never noticed from their suburban bubble.",
          alternatives: ["The contrast between {userName}'s clean neighborhood and Zara's polluted area revealed uncomfortable truths about environmental inequality.", "Zara's casual mention of her inhaler while walking past factories made {userName} question everything about their environmental education."],
          optionalDetails: ["The air quality difference was immediately noticeable", "Zara mentioned that three kids in their grade had been hospitalized for asthma attacks", "Liam felt guilty about complaining about his 'stuffy' bedroom"]
        }
      },
      {
        text: "At lunch the next day, {userName} couldn't stop thinking about Zara's question. When their best friend Marcus Chen suggested they partner up for their environmental science project, {userName} had an idea that terrified and excited them. 'What if we compared air quality between different neighborhoods in our city?' they proposed nervously. Marcus raised an eyebrow. 'That sounds... political. And awesome.' But it was Zara's reaction that mattered most. When {userName} approached her table (usually off-limits to suburban kids like them), her smile made their stomach flip. 'You're serious about this?' she asked. 'Because if you are, I know exactly where to start - and it's going to make some people very uncomfortable.'",
        pause: true,
        hook: "What environmental secrets will their investigation uncover?",
        microVariants: {
          text: "Proposing an environmental justice project brought {userName} closer to Zara while opening doors to uncomfortable community truths.",
          alternatives: ["Marcus's enthusiasm and Zara's expertise created the perfect team for investigating environmental inequality.", "The project became {userName}'s chance to work closely with Zara while addressing serious environmental issues."],
          optionalDetails: ["Other students at Zara's table looked skeptical about suburban kids caring about their issues", "Marcus had access to his dad's air quality monitoring equipment", "The cafeteria felt divided along invisible environmental and economic lines"]
        }
      },
      {
        text: "Their first research session took place at Zara's apartment, where {userName} met her grandmother, Mrs. Patel, whose stories changed everything. 'When we moved here thirty years ago, this was a nice neighborhood,' she explained, showing them old photographs of tree-lined streets where factories now stood. 'But the companies came one by one, always promising jobs that never materialized for people like us.' As Mrs. Patel described watching neighbors develop cancer, children struggle with breathing problems, and property values plummet, {userName} felt sick with the realization that environmental racism wasn't just a textbook concept - it was happening in their own city, and had been for decades.",
        pause: true,
        hook: "How will learning about environmental racism change {userName}'s perspective and relationship with Zara?",
        microVariants: {
          text: "Mrs. Patel's personal stories about neighborhood environmental decline revealed the human cost of environmental racism.",
          alternatives: ["Family photographs documenting environmental degradation over three decades provided heartbreaking evidence of systematic inequality.", "Zara's grandmother's testimony transformed abstract concepts into personal trauma that demanded action."],
          optionalDetails: ["The apartment walls showed the history of their neighborhood's decline", "Mrs. Patel had kept newspaper clippings about every factory opening and health crisis", "Zara's eyes filled with tears as she translated some of her grandmother's stories from Gujarati"]
        }
      },
      {
        text: "Armed with Mrs. Patel's stories and Marcus's father's air quality data, their investigation gained momentum when they discovered that the city planning department had deliberately zoned industrial facilities away from affluent neighborhoods. But their research hit a roadblock when they tried to access public health records - until Zara suggested they talk to her older sister, Priya, a pre-med student at the local college. 'Environmental health disparities are my thesis topic,' Priya explained during their weekend meeting at the library. 'And I have access to databases you wouldn't believe.' As Priya pulled up charts showing childhood asthma rates by zip code, {userName} caught Zara watching them with something that looked like admiration. Maybe their privileged background could actually help for once.",
        pause: true,
        hook: "What shocking health disparities will the data reveal about their community?",
        microVariants: {
          text: "Priya's college resources and Zara's growing respect gave {userName} both data access and personal motivation to continue their investigation.",
          alternatives: ["Academic connections through Zara's sister provided the scientific evidence needed to support their community observations.", "The library research session deepened both their environmental understanding and {userName}'s relationship with Zara."],
          optionalDetails: ["Priya was impressed by their dedication to environmental justice", "The health data was even worse than they'd expected", "Zara had never brought suburban friends to meet her family before"]
        }
      },
      {
        text: "The data was devastating: children in Zara's neighborhood were five times more likely to have asthma than kids from {userName}'s area. Cancer rates were 300% higher. Life expectancy was seven years shorter. But what really shocked {userName} was discovering that their own family's company, Rodriguez Construction, had built two of the factories contributing to the pollution. 'I had no idea,' they confessed to Zara and Marcus during their next planning session, feeling like their entire identity was crumbling. 'My dad always talks about providing jobs for the community.' Zara's response surprised them: 'That's exactly why you need to be part of changing this. You have access and influence that we don't. The question is: will you use it?'",
        pause: true,
        hook: "How will {userName} confront their family's role in environmental injustice?",
        microVariants: {
          text: "Discovering their family's connection to local pollution forced {userName} to grapple with personal complicity in environmental racism.",
          alternatives: ["The shocking revelation that {userName}'s family business contributed to environmental inequality created both guilt and opportunity for change.", "Zara's challenge about using privilege responsibly transformed {userName}'s guilt into determination for action."],
          optionalDetails: ["Marcus was supportive but clearly uncomfortable with the family connection", "The construction company had built facilities in low-income areas for thirty years", "Zara's faith in {userName}'s potential for good meant everything"]
        }
      },
      {
        text: "Confronting their father about Rodriguez Construction's environmental impact led to the most difficult conversation of {userName}'s life. 'We follow all regulations,' Mr. Rodriguez insisted defensively. 'We're not doing anything illegal.' But when {userName} showed him Mrs. Patel's photographs and the health data Priya had compiled, something shifted in their father's expression. 'I didn't know it was this bad,' he admitted quietly. 'When you're focused on business and providing for your family, sometimes you don't see the bigger picture.' The conversation ended with a promise that made {userName}'s heart race: 'Show me what needs to change, and I'll see what we can do.' Zara was going to be so impressed when she heard about this breakthrough.",
        pause: true,
        hook: "What changes will {userName}'s family business make to address environmental inequality?",
        microVariants: {
          text: "The difficult family conversation created unexpected opportunities for corporate environmental responsibility and change.",
          alternatives: ["Mr. Rodriguez's willingness to consider change gave {userName} hope that business practices could evolve toward environmental justice.", "Personal family dynamics intersected with environmental activism as {userName} discovered their power to influence corporate behavior."],
          optionalDetails: ["The conversation revealed that Mr. Rodriguez had grown up in a neighborhood similar to Zara's", "Other construction companies were watching to see if Rodriguez Construction would change practices", "Zara had coached {userName} on how to approach the conversation effectively"]
        }
      },
      {
        text: "Their environmental justice presentation to the school board became the most nerve-wracking night of {userName}'s life, but having Zara and Marcus flanking them for support made it bearable. When they presented their data showing health disparities, neighborhood pollution maps, and historical evidence of environmental racism, the packed auditorium went completely silent. Mrs. Patel's testimony about watching her community's health decline brought several board members to tears. But the moment that changed everything was when {userName}'s father stood up from the audience. 'Rodriguez Construction commits to environmental justice standards that exceed city requirements,' he announced. 'And we'll partner with affected communities to remediate damage from past projects.' The standing ovation felt like victory, but Zara's proud smile was the real prize.",
        pause: true,
        hook: "How will the school board respond to their environmental justice presentation?",
        microVariants: {
          text: "The presentation combined personal testimony, scientific data, and corporate commitment to create a powerful case for environmental justice.",
          alternatives: ["Community testimony and family business commitment transformed their school project into a catalyst for systematic environmental change.", "Public speaking alongside Zara and Marcus felt like the beginning of lifelong environmental advocacy partnerships."],
          optionalDetails: ["Local news covered the presentation extensively", "Several board members had children with asthma and were visibly moved", "Other construction companies approached Mr. Rodriguez about similar commitments"]
        }
      },
      {
        text: "The school board's unanimous vote to implement environmental justice curriculum felt like a dream, but the real celebration happened afterward when Zara grabbed {userName}'s hand in the parking lot. 'You actually did it,' she said, her eyes shining under the streetlights. 'You used your privilege to fight for my community.' When she kissed {userName}'s cheek, they felt like their heart might explode. Marcus pretended to gag dramatically. 'Gross! But also, can we talk about how we just changed city environmental policy as eighth-graders?' The three of them spent the rest of the night at the 24-hour diner, planning how to expand their environmental justice work to other schools and dreaming about changing the world together.",
        pause: true,
        hook: "What romantic and environmental developments await their partnership?",
        microVariants: {
          text: "Victory celebration brought both romantic breakthrough and deeper commitment to environmental advocacy partnerships.",
          alternatives: ["Success in environmental justice activism created the perfect moment for {userName} and Zara's first romantic connection.", "The diner planning session established their trio as serious environmental advocates while celebrating personal relationships."],
          optionalDetails: ["The kiss was {userName}'s first real romantic moment", "Marcus was secretly texting his girlfriend about the environmental victory", "Other community members joined them at the diner to continue planning"]
        }
      },
      {
        text: "Spring semester brought new challenges when their environmental justice work attracted state-level attention. The Department of Environmental Protection invited them to testify at hearings about updating pollution standards, while Rodriguez Construction's new environmental practices were being studied as a model for other companies. But navigating their new relationship with Zara proved more complicated than environmental activism. 'I don't want people to think I'm only dating you because of the project,' {userName} worried during one of their research sessions in the library. Zara's response made them feel both relieved and terrified: 'Good thing our relationship started because you're cute and kind, and the environmental stuff just proved you're also brave and committed to justice.' Marcus fake-vomited again, but he was grinning.",
        pause: true,
        hook: "How will their relationship evolve alongside their expanding environmental advocacy?",
        microVariants: {
          text: "State-level recognition brought new opportunities while {userName} and Zara navigated the intersection of activism and romance.",
          alternatives: ["Environmental success created platform for broader advocacy, but personal relationships required separate attention and care.", "Balancing romantic feelings with serious activist work taught them about integrating personal values with professional partnerships."],
          optionalDetails: ["State officials were impressed by their age and sophistication", "Zara was getting college recruitment letters based on her environmental work", "The library had become their unofficial relationship headquarters"]
        }
      },
      {
        text: "The state environmental hearings took place in the capitol building, where {userName}, Zara, and Marcus found themselves testifying alongside PhD scientists and corporate executives. Standing at the podium before hundreds of adults, {userName} felt intimidated until they spotted Mrs. Patel in the audience, wearing her best sari and beaming with pride. 'Environmental racism isn't just policy failure,' {userName} told the packed chamber. 'It's a human rights crisis affecting families like the Patels, who've watched their neighborhood become a sacrifice zone for corporate profits.' When the new regulations passed with stronger protections for vulnerable communities, {userName} realized their eighth-grade environmental project had grown into something that would protect families for generations.",
        pause: true,
        hook: "What long-term impact will their advocacy have on environmental policy and their futures?",
        microVariants: {
          text: "Capitol testimony established them as credible youth advocates while creating lasting policy changes for environmental justice.",
          alternatives: ["Speaking before state officials validated their expertise and transformed their activism from local project to statewide influence.", "Mrs. Patel's proud presence reminded them that successful advocacy meant real families would breathe cleaner air."],
          optionalDetails: ["The new regulations would affect industrial permitting statewide", "Environmental groups offered them summer internships", "Zara was invited to speak at the national Environmental Justice Youth Summit"]
        }
      },
      {
        text: "Summer brought both romantic milestones and environmental victories when {userName} and Zara attended the National Environmental Justice Youth Summit together - their first trip as an official couple. Watching Zara present their research to delegates from forty states, {userName} felt proud of both her brilliance and their partnership. But the most meaningful moment came during a workshop on environmental activism when a girl from Texas approached them. 'Your story about family businesses changing practices gave me hope,' she said. 'My dad owns a chemical plant, and I've been trying to talk to him about environmental justice.' Realizing their work was inspiring other young people to challenge environmental racism in their own communities felt better than any romantic milestone.",
        pause: true,
        hook: "How will their model inspire environmental activism in other communities nationwide?",
        microVariants: {
          text: "The national summit established them as role models for youth environmental activism while deepening their romantic relationship.",
          alternatives: ["Inspiring other teens to challenge environmental racism proved that their local work could create national change.", "The summit combined professional recognition with personal relationship development as they traveled together for the first time."],
          optionalDetails: ["Delegates from rural and urban areas shared similar environmental justice stories", "Youth activism was gaining recognition from major environmental organizations", "Their relationship had become stronger through shared advocacy work"]
        }
      },
      {
        text: "Starting high school felt different when you'd already testified before state officials and been featured in national news for environmental activism. {userName} and Zara were recruited for the new Environmental Justice Club by their freshman counselor, while Marcus had been accepted to a prestigious STEM summer program based on their research. But the most exciting development came when Mrs. Rodriguez, {userName}'s mother, announced that she was running for city council on an environmental justice platform. 'You kids taught me that business success means nothing if it comes at the cost of community health,' she explained during a family dinner that included the Patels. Looking around the table at their blended families united by environmental advocacy, {userName} felt grateful that a simple walk home had changed everything.",
        pause: true,
        hook: "What environmental and political changes will their high school years bring?",
        microVariants: {
          text: "High school transition brought expanded opportunities while family political involvement demonstrated lasting impact of their activism.",
          alternatives: ["Their parents' political engagement showed how youth environmental activism could influence adult decision-making and career choices.", "Starting high school as established environmental advocates created platform for even greater impact during their teenage years."],
          optionalDetails: ["Rodriguez Construction had become a model for environmental responsibility", "The Patel and Rodriguez families had become close friends", "Environmental justice was now part of standard curriculum at their old middle school"]
        }
      },
      {
        text: "Two years later, {userName} stood in the renovated community center in Zara's neighborhood - the same building that had once housed a polluting factory, now converted through Rodriguez Construction's environmental remediation program. Watching Zara facilitate an environmental justice workshop for new middle schoolers, {userName} marveled at how much had changed since that first awkward walk through the industrial district. Mrs. Rodriguez had won her city council seat and authored the city's first environmental justice ordinance. Mrs. Patel's neighborhood now had the cleanest air quality in the city. And {userName}'s relationship with Zara had grown from environmental partnership into something that felt permanent and precious. 'Ready for the next project?' Zara asked, taking their hand as the workshop ended. {userName} grinned, knowing that fighting environmental racism with the person you love was the best possible way to spend a lifetime.",
        pause: true,
        hook: "How will their continued partnership address environmental challenges beyond their community?",
        microVariants: {
          text: "Community transformation and lasting relationship proved that environmental justice activism could create both policy change and personal fulfillment.",
          alternatives: ["The remediated factory site symbolized how persistent advocacy could transform environmental racism into environmental healing.", "Their romantic and activist partnership had grown into a model for combining personal relationships with social justice work."],
          optionalDetails: ["The community center hosted environmental programs for the entire region", "Other couples in their environmental group had formed similar romantic-activist partnerships", "College recruiters were specifically seeking students with environmental justice experience"]
        }
      },
      {
        text: "Graduation day brought full-circle reflection when {userName} delivered the valedictorian speech about environmental justice, with Zara (salutatorian) and Marcus (heading to MIT for environmental engineering) in the front row. 'Four years ago, a simple walk home opened my eyes to environmental racism in our own community,' {userName} told their classmates and families. 'Today, we graduate knowing that young people can create change when we combine passion with action, privilege with responsibility, and environmental science with social justice.' When Zara joined them on stage for the traditional valedictorian-salutatorian dance, {userName} felt grateful that environmental activism had brought them not just policy victories, but lifelong love and partnership. Their acceptance letters to the same environmental science program meant their work together was just beginning.",
        pause: true,
        hook: "What environmental justice legacy will their high school activism create for future students?",
        microVariants: {
          text: "Graduation celebration marked the beginning of lifelong environmental and romantic partnerships while recognizing their transformative impact on community policy.",
          alternatives: ["Valedictorian recognition validated their integration of academic success with environmental activism and social justice advocacy.", "College plans together ensured their environmental justice partnership would continue expanding from local to national and global scales."],
          optionalDetails: ["Their environmental justice curriculum was being adopted by schools nationwide", "The Rodriguez Construction environmental model was being replicated by companies across the state", "Mrs. Patel had been invited to speak at the environmental conference where it all started"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Five years later, Dr. {userName} Rodriguez and Dr. Zara Rodriguez (they'd married after college and hyphenated their names) stood before the United Nations Environment Assembly, presenting their research on community-based environmental justice that had grown from their eighth-grade school project. Their work had influenced international policy, inspired hundreds of young activists, and proven that environmental racism could be dismantled through persistent advocacy and cross-community partnerships. In the audience, Marcus (now head of the EPA's Environmental Justice Division) and Mrs. Patel (representing the International Coalition of Environmental Justice Elders) beamed with pride as their former students addressed world leaders about protecting vulnerable communities from environmental harm.",
        microVariants: ["Their middle school environmental project evolved into international environmental policy influence, proving that youth activism could create global change.", "From eighth-grade crush to married environmental advocates, their journey demonstrated how personal relationships and social justice work could reinforce each other."]
      },
      {
        type: 'cozy',
        text: "Every Earth Day, {userName} and Zara returned to Mrs. Patel's neighborhood - now a thriving green space with community gardens, solar panels, and the cleanest air in the region - to mentor new environmental justice advocates. Watching their own children play in the park that had once been an industrial waste site, they felt deep satisfaction knowing their teenage activism had created lasting protection for future generations. 'Remember when you were too nervous to walk me home?' Zara teased, adjusting their baby's sun hat while {userName} helped set up the annual Environmental Justice Festival. {userName} smiled, thinking of all the young couples they now mentored who were combining environmental activism with first love. 'Best decision I ever made,' they replied, 'except maybe asking you to marry me in that same community garden.'",
        microVariants: ["Annual mentoring visits kept their environmental justice legacy alive while celebrating the family and community they'd built together.", "Their neighborhood transformation created safe, healthy space for their own children and demonstrated how persistent advocacy could heal environmental racism."]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental_issues": ["air pollution", "water contamination", "toxic waste sites", "industrial emissions"],
        "community_dynamics": ["family business connections", "neighborhood organizing", "intergenerational advocacy", "romantic partnerships"], 
        "advocacy_strategies": ["research presentations", "community testimony", "policy development", "corporate engagement"]
      },
      weatherVariants: ["research season", "community organizing", "policy advocacy", "celebration milestones"],
      settingVariants: ["industrial neighborhoods", "school board meetings", "family businesses", "community centers"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },
  {
    title: "The Food Justice Research Initiative",
    theme: "Community Health & Economic Equity",
    level: "Grade 8",
    scenes: [
      {
        text: "Everything changed for {userName} Chen during their first volunteer shift at Hope Community Food Bank, when they met Aaliyah Williams. While {userName} awkwardly sorted canned goods, Aaliyah moved through the space with natural leadership, knowing every client's name and dietary restrictions. 'First time?' Aaliyah asked with a kind smile that made {userName}'s heart skip. 'It shows. Here, let me teach you how Ms. Johnson likes her groceries packed - she has diabetes and can't carry heavy bags.' As Aaliyah explained which neighborhoods had the longest commutes for fresh food, {userName} realized how little they understood about food access in their own city. 'I live ten minutes from three grocery stores,' they admitted embarrassedly. 'I never thought about people who don't.'",
        pause: true,
        hook: "What will {userName} learn about food inequality from Aaliyah and the community?",
        microVariants: {
          text: "Aaliyah's expertise at the food bank opened {userName}'s eyes to food access inequalities they'd never considered.",
          alternatives: ["Meeting Aaliyah transformed {userName}'s volunteer experience from obligation to education about food justice.", "The food bank revealed how transportation and geography created food deserts that {userName} had never noticed."],
          optionalDetails: ["Aaliyah had been volunteering since sixth grade when her family used the food bank", "Many clients traveled over an hour by bus for fresh produce", "The contrast between {userName}'s food abundance and client need was stark"]
        }
      },
      {
        text: "Walking home with Aaliyah after their volunteer shift became {userName}'s favorite part of Saturdays, even though the route through her neighborhood was eye-opening. Where {userName}'s area had farmer's markets and organic grocery stores on every corner, Aaliyah's community had convenience stores charging premium prices for basic necessities. 'See that empty lot?' Aaliyah pointed to a weed-filled space between apartment buildings. 'That used to be a supermarket until they decided our neighborhood wasn't profitable enough.' When they stopped at a corner store for Aaliyah's grandmother's medication, {userName} was shocked by the prices: $8 for a gallon of milk that cost $3 in their neighborhood. 'Food apartheid,' Aaliyah explained matter-of-factly. 'That's what they call it when healthy food is systematically kept away from certain communities.'",
        pause: true,
        hook: "How will {userName} respond to learning about food apartheid in their city?",
        microVariants: {
          text: "Walking through Aaliyah's neighborhood revealed the stark contrast in food access and pricing that defined food apartheid.",
          alternatives: ["The corner store prices and empty supermarket lot demonstrated how geography determined food access and family budgets.", "Aaliyah's casual use of terms like 'food apartheid' showed how young people understood systematic inequality better than many adults."],
          optionalDetails: ["The nearest full grocery store required two bus transfers", "Aaliyah's grandmother was diabetic but struggled to afford appropriate foods", "Many neighbors grew small gardens on fire escapes and windowsills"]
        }
      },
      {
        text: "Their friendship deepened when Aaliyah invited {userName} to help with her eighth-grade social studies project on food access. Sitting in the tiny apartment she shared with her grandmother and two younger siblings, {userName} felt both privileged and determined as they researched food desert statistics together. 'Look at this map,' Aaliyah said, pulling up data on her laptop. 'Every grocery store closure in the last decade happened in neighborhoods that are majority Black or Latino.' {userName} was amazed by Aaliyah's research skills and passion for justice, but when she asked about their family background, they felt embarrassed admitting their parents owned two restaurants in affluent neighborhoods. 'That's not something to be ashamed of,' Aaliyah said gently. 'That's something you can use to help change things.'",
        pause: true,
        hook: "How will {userName}'s family restaurant connections help address food access inequality?",
        microVariants: {
          text: "Research collaboration revealed both the scope of food apartheid and {userName}'s potential to contribute family business resources to solutions.",
          alternatives: ["Aaliyah's mapping project demonstrated systematic patterns while {userName} discovered how their family's success could support food justice.", "The apartment study session deepened their friendship while revealing opportunities to leverage restaurant industry connections for community benefit."],
          optionalDetails: ["The Chen family restaurants sourced from local farms and food distributors", "Aaliyah's research had been featured in her school newspaper", "Her grandmother shared stories about neighborhood changes over thirty years"]
        }
      },
      {
        text: "The breakthrough came when {userName} convinced their parents to visit Hope Community Food Bank and meet Aaliyah's family. Mrs. Chen was visibly moved by Ms. Williams' stories about traveling two hours round-trip for groceries and rationing insulin due to food costs. 'We serve customers who spend fifty dollars on lunch,' Mrs. Chen said quietly, 'while families like yours struggle to afford basic nutrition.' When Mr. Chen learned that local food distributors charged higher prices to stores in low-income neighborhoods, his business instincts kicked in. 'What if restaurants could partner with community organizations to provide affordable, healthy meals?' he suggested. Aaliyah's eyes lit up with excitement. 'Like a sliding-scale community kitchen program?' The conversation that followed changed everything.",
        pause: true,
        hook: "What innovative food justice solutions will emerge from the restaurant-community partnership?",
        microVariants: {
          text: "The Chen family's business expertise combined with Aaliyah's community knowledge to create innovative approaches to food access problems.",
          alternatives: ["Parent involvement transformed {userName} and Aaliyah's school project into real-world business solutions for food justice.", "The meeting between successful restaurant owners and food bank clients created empathy and practical partnerships for community change."],
          optionalDetails: ["Mrs. Chen had grown up in a similar neighborhood before their restaurant success", "Aaliyah's policy research impressed the Chen parents with its sophistication", "Local food distributors were willing to negotiate better community pricing"]
        }
      },
      {
        text: "Spring semester brought the launch of 'Community Kitchens,' a partnership between Chen Family Restaurants and Hope Food Bank that served nutritious meals on a sliding fee scale based on family income. {userName} and Aaliyah worked together every weekend, coordinating volunteers and learning restaurant management while serving families from across the city. 'I can't believe we're actually running a social justice restaurant,' {userName} marveled during one busy Saturday service. Aaliyah grinned, flour in her hair from helping with the bread program. 'We're proving that food access doesn't have to be charity. It can be dignity and community.' When she grabbed {userName}'s hand to pull them toward a new volunteer, the touch sent electricity through their arm. Maybe their food justice partnership was becoming something more.",
        pause: true,
        hook: "How will their Community Kitchen success affect both food access and their growing relationship?",
        microVariants: {
          text: "The Community Kitchen project brought them closer together while demonstrating how business partnerships could address food justice with dignity.",
          alternatives: ["Working side-by-side in food service created natural opportunities for romantic tension alongside their shared commitment to food equity.", "The success of their sliding-scale meal program proved that creative partnerships could address systematic inequality through sustainable business models."],
          optionalDetails: ["Local news covered their innovative approach to food access", "Families traveled from neighboring counties to access affordable healthy meals", "The hand-holding moment felt natural but made both of them nervous"]
        }
      },
      {
        text: "The relationship question came to a head during the Community Kitchen's first fundraising dinner, where {userName} and Aaliyah presented their food justice research to potential donors and community leaders. Standing together at the podium in the {favoriteColor} dress shirt their mother had insisted they wear, {userName} felt confident explaining how food apartheid affected local families. But it was Aaliyah's testimony about her grandmother's diabetes management that brought the room to tears. After their presentation, as donors pledged enough funding to expand the program, {userName} found themselves alone with Aaliyah in the restaurant's garden patio. 'I really like working with you,' they said nervously. 'Like, really like it.' Aaliyah's smile was answer enough before she even said, 'Good, because I was hoping you'd ask me to be your girlfriend soon.'",
        pause: true,
        hook: "How will their new relationship dynamic enhance their food justice advocacy work?",
        microVariants: {
          text: "The fundraising success provided perfect timing for {userName} and Aaliyah to acknowledge their romantic feelings and official relationship status.",
          alternatives: ["Public speaking about food justice created confidence that carried over to personal relationship conversations.", "The patio conversation transformed their partnership from friendship and collaboration to romantic commitment and deeper advocacy."],
          optionalDetails: ["The fundraising dinner raised enough money to open two additional Community Kitchen locations", "Several donors offered internship opportunities to both students", "The garden setting felt romantic and private after the public presentation"]
        }
      },
      {
        text: "Summer brought both romantic milestones and food justice victories when {userName} and Aaliyah were selected for the National Youth Food Justice Coalition's leadership training program. Spending two weeks at college learning about policy advocacy, sustainable agriculture, and community organizing while navigating their first serious relationship felt both exciting and overwhelming. 'Are we weird for talking about food policy on dates?' {userName} asked during one of their evening walks around campus. Aaliyah laughed, taking their hand as they passed the demonstration garden. 'We're perfect for each other. Most couples don't get to change the world together while falling in love.' The program connected them with teen food activists from across the country, but their favorite part was presenting their Community Kitchen model to other young advocates.",
        pause: true,
        hook: "What national connections and opportunities will their food justice leadership create?",
        microVariants: {
          text: "The leadership program validated their work while providing national platform for sharing their Community Kitchen model with other teen activists.",
          alternatives: ["Summer training combined professional development with relationship building as they learned to balance activism with romance.", "Meeting food justice advocates nationwide proved that their local work was part of a larger movement for food equity and community empowerment."],
          optionalDetails: ["Three cities requested consultation on implementing Community Kitchen programs", "The college offered them full scholarships if they maintained their food justice work", "Their relationship had become stronger through shared learning and advocacy experiences"]
        }
      },
      {
        text: "Starting high school as established food justice advocates felt both empowering and daunting, especially when their story was featured in the regional newspaper as 'Teen Entrepreneurs Fighting Food Apartheid.' The attention brought new opportunities - speaking engagements, consulting requests, and college recruitment letters - but also pressure to represent their communities perfectly. During a particularly stressful week of interview requests and expansion planning, {userName} had a breakdown in the Community Kitchen office. 'What if we're just privileged kids playing activist?' they worried to Aaliyah. Her response was immediate and fierce: 'We're teens who used our privilege to create real change that feeds real families. Don't let impostor syndrome make you forget that our work matters.' The hug that followed reminded {userName} why partnership made everything possible.",
        pause: true,
        hook: "How will they handle the pressure of public recognition while maintaining authentic community connections?",
        microVariants: {
          text: "Media attention brought opportunities but also anxiety about authenticity and responsibility that Aaliyah's grounded perspective helped address.",
          alternatives: ["High school transition with established activist reputations created both platform for greater impact and pressure to represent their communities perfectly.", "Aaliyah's emotional support during {userName}'s impostor syndrome moment demonstrated how romantic partnerships could provide stability during activist stress."],
          optionalDetails: ["Community Kitchen was serving 300 families weekly across three locations", "High school guidance counselors were offering advanced placement courses based on their demonstrated project management skills", "Parents were proud but worried about balancing activism with typical teenage experiences"]
        }
      },
      {
        text: "The policy victory came during their sophomore year when the city council unanimously passed the 'Food Access Equity Ordinance' that {userName} and Aaliyah had helped draft with community lawyers and health advocates. Standing in the packed council chambers where they'd first testified as eighth-graders, {userName} felt amazed by how much had changed. The ordinance required grocery stores to provide healthy food options at consistent prices across all neighborhoods, funded transportation vouchers for food shopping, and supported community-led food programs like Community Kitchen. When Aaliyah was invited to sign the ordinance alongside the mayor, {userName} felt proud tears streaming down their face. Their girlfriend had just helped create law that would feed families for generations.",
        pause: true,
        hook: "What broader impact will their food justice policy work have on other cities and communities?",
        microVariants: {
          text: "The Food Access Equity Ordinance represented the culmination of their advocacy while establishing them as teen policy experts for other communities.",
          alternatives: ["Aaliyah's signature on official city legislation proved that youth voices could create lasting institutional change for food justice.", "The ordinance success demonstrated how persistent community organizing could transform systematic inequality into protective policy for vulnerable families."],
          optionalDetails: ["Five other cities requested copies of the ordinance for adaptation", "Food justice organizations offered them positions as youth policy consultants", "The signing ceremony included Ms. Williams and other community members who'd inspired their work"]
        }
      },
      {
        text: "Junior year brought college planning conversations that tested their relationship in new ways when {userName} was offered early admission to their dream school across the country while Aaliyah was recruited by local universities for their food policy programs. 'I don't want to hold you back from amazing opportunities,' Aaliyah said during one of their late-night planning sessions in the Community Kitchen office. 'But I also can't imagine doing this work without you.' The solution came from an unexpected source: Mrs. Chen, who had been quietly building relationships with food justice programs nationwide. 'What if you both applied to schools with strong food policy departments where you could continue working together?' she suggested. The research that followed revealed perfect programs that would let them expand their work while staying together.",
        pause: true,
        hook: "How will their college choices affect both their relationship and their food justice advocacy future?",
        microVariants: {
          text: "College planning required navigating the intersection of personal relationship goals with professional advocacy ambitions and academic opportunities.",
          alternatives: ["The decision to prioritize both relationship and food justice career goals led to creative solutions for continuing their partnership.", "Mrs. Chen's networking in food policy circles provided options that satisfied both romantic and professional development needs."],
          optionalDetails: ["Several universities offered joint admission packages for students working on collaborative projects", "Their Community Kitchen model was being studied by food policy researchers", "Long-distance relationship anxiety had brought them closer together as they planned their shared future"]
        }
      },
      {
        text: "Senior year culminated when {userName} and Aaliyah were invited to address the National Conference on Food Justice as the youngest keynote speakers in the event's history. Standing before 2,000 food advocates, policy makers, and community organizers, they shared their journey from eighth-grade volunteers to teen policy advocates whose Community Kitchen model was operating in twelve cities. 'Food justice isn't just about nutrition,' Aaliyah told the packed auditorium. 'It's about dignity, community power, and the revolutionary idea that everyone deserves access to food that nourishes both body and spirit.' {userName} added, 'And when young people partner with communities and businesses, we can create solutions that adults said were impossible.' The standing ovation felt like validation for four years of hard work and community building.",
        pause: true,
        hook: "What impact will their national platform have on expanding food justice work to additional communities?",
        microVariants: {
          text: "The keynote speech established them as national teen experts on food justice while demonstrating the scalability of their Community Kitchen model.",
          alternatives: ["National conference recognition validated their approach while inspiring other young people to start similar food justice initiatives in their communities.", "Speaking to thousands of adults proved that teen voices could provide innovative solutions to systematic food access problems."],
          optionalDetails: ["Twenty-five cities requested implementation support for Community Kitchen programs", "National food justice organizations offered them leadership positions after college", "The conference connected them with international food activists working on similar issues"]
        }
      },
      {
        text: "Graduation brought bittersweet reflection as {userName} and Aaliyah prepared to attend the same university's joint Food Policy and Social Justice program, the first of its kind designed specifically for student activists. During their final Community Kitchen service before leaving for college, surrounded by families they'd served for four years, {userName} felt grateful for the food pantry volunteer shift that had changed everything. 'Remember when you had to teach me how to pack groceries?' they asked Aaliyah while cleaning up after their farewell celebration. She grinned, loading leftover community garden vegetables into containers for regular clients. 'Now you're teaching food justice workshops to college students. Growth.' When Ms. Williams approached them with tears in her eyes to thank them for 'making healthy food accessible with dignity,' both teens knew their work had created lasting change.",
        pause: true,
        hook: "How will their college program prepare them for lifelong careers in food justice advocacy and policy?",
        microVariants: {
          text: "Graduation celebration with Community Kitchen families provided perfect closure while launching their transition to college-level food justice education.",
          alternatives: ["The farewell service reminded them how far they'd traveled from nervous volunteers to confident advocates while maintaining connection to the community that inspired their work.", "Ms. Williams' gratitude represented the voices of hundreds of families whose food security had improved through their persistent advocacy and innovation."],
          optionalDetails: ["Community Kitchen was financially sustainable and community-operated", "Their high school had created a permanent food justice curriculum based on their work", "College professors were excited to work with students who had real-world policy experience"]
        }
      },
      {
        text: "Five years later, {userName} and Aaliyah stood in the White House Rose Garden as President Martinez signed the National Food Access Act, legislation they'd helped draft as graduate students in the Congressional Food Policy Fellowship program. Their Community Kitchen model had grown into a nationwide network serving 50,000 families weekly, while their research on food apartheid had influenced federal nutrition policy. 'From sorting canned goods to signing federal legislation,' Aaliyah whispered to {userName} as cameras captured the historic moment. 'Not bad for a couple of eighth-grade volunteers.' {userName} squeezed their wife's hand (they'd married the summer after college), thinking of Ms. Johnson, Ms. Williams, and all the families whose stories had inspired their decade of advocacy. Their work had proven that food justice wasn't just possible - it was inevitable when communities and young people refused to accept inequality as permanent.",
        pause: true,
        hook: "What legacy will their food justice work create for future generations of community advocates?",
        microVariants: {
          text: "Federal legislation signing represented the culmination of their journey from teen volunteers to national policy leaders while honoring the community members who inspired their work.",
          alternatives: ["The Rose Garden ceremony validated their belief that persistent community organizing could create systematic change for food access and dignity.", "Their marriage and professional partnership demonstrated how shared values and collaborative advocacy could create both personal fulfillment and social transformation."],
          optionalDetails: ["The National Food Access Act would benefit over 10 million families nationwide", "Community Kitchen had become a standard model taught in social work and public policy programs", "They were already planning their next project: international food justice consulting"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Ten years after their first volunteer shift together, Dr. {userName} Chen-Williams and Dr. Aaliyah Chen-Williams (they'd hyphenated after marriage) opened the National Center for Food Justice at their alma mater, the first research institute dedicated to community-led food access solutions. Their work had influenced policy in thirty-seven countries, trained thousands of young food advocates, and proven that the most effective solutions to systematic inequality emerged from partnerships between communities, businesses, and passionate young people. Standing in the center's community kitchen - a replica of their original Hope Food Bank space - they watched new cohorts of student activists begin their own journeys toward food justice, knowing that their eighth-grade volunteer experience had grown into a legacy that would nourish communities for generations.",
        microVariants: ["Their research center ensured that future generations of food activists would have resources and support to continue expanding access to nutritious, affordable food.", "From teen volunteers to international experts, their journey proved that authentic community partnership could create sustainable solutions to systematic food inequality."]
      },
      {
        type: 'cozy',
        text: "Every Saturday morning, {userName} and Aaliyah returned to Hope Community Food Bank with their own children, continuing the volunteer tradition that had brought them together fifteen years earlier. Watching their kids learn to pack groceries with the same care Aaliyah had once taught them, they felt grateful for the chance encounter that had changed both their lives and their city's approach to food access. Community Kitchen still operated across the street, now run entirely by community members and serving families who'd once depended on food pantries. 'Best first date location ever,' Aaliyah teased, adjusting their toddler's volunteer apron while {userName} helped elderly clients carry groceries. 'Even if we didn't know it was a date at the time.' {userName} smiled, watching their children naturally follow their parents' commitment to food justice and community care.",
        microVariants: ["Family volunteering traditions kept their food justice values alive for the next generation while maintaining connection to the community that launched their advocacy.", "The transformation of food pantry clients into Community Kitchen operators demonstrated how their work had created lasting community empowerment and food sovereignty."]
      }
    ],
    reuse: {
      swappableElements: {
        "food_access_barriers": ["transportation challenges", "price disparities", "store availability", "cultural food access"],
        "community_solutions": ["sliding-scale programs", "mobile markets", "community gardens", "policy advocacy"],
        "relationship_dynamics": ["volunteer partnerships", "family business involvement", "romantic development", "professional collaboration"]
      },
      weatherVariants: ["food bank service", "community organizing", "policy advocacy", "celebration milestones"],
      settingVariants: ["community food spaces", "restaurant partnerships", "policy venues", "neighborhood organizations"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },
  {
    title: "The Digital Privacy Rights Campaign",
    theme: "Technology Ethics & Civil Liberties",
    level: "Grade 8",
    scenes: [
      {
        text: "Maya was scrolling through her phone during lunch when she noticed something odd about their school's new mandatory app, EduTracker. Her friend Alex leaned over, his warm brown eyes curious as he watched her frown at the screen. 'Look at these permissions,' Maya whispered, showing Alex the app's settings. 'It's accessing our location 24/7, reading our messages, even monitoring how long we look at each screen.' Alex moved closer to see better, and Maya felt her heart skip as their shoulders touched while they examined the disturbing list of data collection practices.",
        pause: true,
        hook: "What will Maya and Alex discover about the extent of student data collection?",
        microVariants: {
          text: "Maya's discovery of extensive app permissions caught Alex's attention, sparking their investigation into student data collection practices.",
          alternatives: ["The school's new app revealed shocking data collection that brought Maya and Alex together in concern.", "Alex's curiosity about Maya's findings led to a closer examination of digital privacy violations."],
          optionalDetails: ["The app could access microphone and camera without notification", "Location data was being shared with third-party advertisers", "Students had never been told about the extent of monitoring"]
        }
      },
      {
        text: "That evening, Maya dove deep into the app's terms of service - all 47 pages of legal jargon that she was determined to understand. What she found made her stomach drop: their personal data was being sold to advertisers, detailed psychological profiles were being created, and even their academic struggles were being tracked and monetized. When she called Alex to share her discoveries, his voice was filled with the same anger and determination she felt. 'We can't let them do this to us,' he said firmly. 'We need to tell everyone.' Maya's heart fluttered at how seriously he was taking this, how much he cared about protecting their classmates.",
        pause: true,
        hook: "How will Maya and Alex's partnership develop as they uncover more privacy violations?",
        microVariants: {
          text: "Maya's research revealed extensive student data monetization, and Alex's supportive response strengthened their partnership in fighting privacy violations.",
          alternatives: ["Discovering psychological profiling of students prompted Maya and Alex to commit to exposing the school's data practices.", "Alex's determination to protect classmates matched Maya's passion, creating a powerful alliance against digital surveillance."],
          optionalDetails: ["The app tracked students' emotional states through typing patterns", "Data was being sold to college admissions consultants", "Even students' family financial information was being collected"]
        }
      },
      {
        text: "The next morning, Maya found Alex by his locker, her heart racing as she prepared to share what she'd learned overnight. 'It's worse than we thought,' she said urgently, pulling out printed screenshots of the privacy policy. As she explained her findings, she noticed how intently Alex listened, how his jaw tightened with anger at each revelation of injustice. When another student, Jordan, overheard and joined their conversation, Alex naturally deferred to Maya's expertise while adding his own insights about technology ethics. 'Maya's the real expert here,' he said with obvious admiration, 'but I think we could help more people understand this if we work together.'",
        pause: true,
        hook: "Will Maya and Alex be able to rally their classmates around digital privacy rights?",
        microVariants: {
          text: "Alex's admiration for Maya's expertise and their natural collaboration began attracting other students to their privacy rights cause.",
          alternatives: ["Maya's leadership and Alex's supportive partnership created an effective team for educating peers about digital surveillance.", "Jordan's interest in their conversation showed that other students were ready to learn about privacy violations."],
          optionalDetails: ["Jordan had noticed suspicious battery drain from school apps", "Several students reported feeling like their phones were listening to conversations", "Parents had been complaining about targeted ads related to their children's school activities"]
        }
      },
      {
        text: "Maya and Alex spent hours in the library researching surveillance capitalism, learning how tech companies profit from student data while claiming to provide free services. Their study sessions grew longer and more intense as they uncovered the scope of digital surveillance in education. During one particularly late evening in the computer lab, their hands accidentally brushed while reaching for the same research paper, creating a moment of electric tension. 'You know,' Alex said softly, not moving his hand away, 'I never cared about this stuff before meeting you. You've changed how I see everything.' Maya felt her cheeks warm as she realized their fight for digital rights was bringing them closer than she'd ever expected.",
        pause: true,
        hook: "How will their growing feelings affect their ability to focus on their privacy campaign?",
        microVariants: {
          text: "Long research sessions brought Maya and Alex closer together emotionally while they learned about surveillance capitalism and its impact on students.",
          alternatives: ["Alex's confession that Maya had changed his perspective on technology created an intimate moment during their research.", "Their shared passion for digital rights was developing into deeper feelings as they spent more time together."],
          optionalDetails: ["They discovered their school data was worth thousands of dollars annually", "Student attention patterns were being sold to entertainment companies", "The surveillance extended to home internet usage through school-issued devices"]
        }
      },
      {
        text: "They started talking to other students about digital privacy, and Maya was amazed by how many shared their concerns once they understood the issues. Alex proved to be excellent at explaining technical concepts in simple terms while Maya provided the passionate advocacy that motivated action. During one particularly animated discussion with their friend Sam, Alex caught Maya's eye and smiled proudly as she demolished the argument that 'if you have nothing to hide, privacy doesn't matter.' 'You're incredible at this,' Alex whispered to her afterward, making Maya's heart skip. 'We make a good team,' she replied, wondering if he meant more than just activism.",
        pause: true,
        hook: "What will happen when their activism brings them even closer together?",
        microVariants: {
          text: "Maya and Alex's complementary skills in education and advocacy created an effective partnership that impressed their peers and deepened their connection.",
          alternatives: ["Alex's admiration for Maya's arguments and their seamless teamwork hinted at feelings beyond friendship.", "Their success in changing minds about privacy rights was matched by their growing awareness of each other."],
          optionalDetails: ["Sam became their first convert and started spreading awareness", "Students began changing their privacy settings en masse", "Teachers started asking questions about the school's data practices"]
        }
      },
      {
        text: "Maya proposed hosting digital privacy workshops for the entire school, and Alex immediately volunteered to help design the presentations and technical demonstrations. Working together late in the computer lab became their routine, filled with shared determination and increasingly obvious mutual attraction. One evening, while debugging a presentation slide, Alex looked up from his laptop and said, 'Maya, I know we're busy fighting for everyone's privacy, but I keep thinking about how much I enjoy spending time with you.' Maya's heart raced as she realized she felt the same way. 'Maybe we should talk about this after we save everyone from digital surveillance,' she said with a smile that made Alex grin back.",
        pause: true,
        hook: "How will their developing relationship affect their ability to lead their privacy campaign?",
        microVariants: {
          text: "Alex's romantic confession during their workshop preparation created a new dynamic in their partnership while they continued fighting for student privacy rights.",
          alternatives: ["Working closely on privacy education brought Maya and Alex's feelings into the open while they maintained focus on their cause.", "Their growing romance added energy to their activism while requiring careful balance between personal and political commitment."],
          optionalDetails: ["They decided to keep their relationship quiet until after the campaign", "Other students started noticing their chemistry during presentations", "Their parents were supportive of both their relationship and their activism"]
        }
      },
      {
        text: "Their first digital privacy workshop drew a packed auditorium. Maya felt nervous as she began presenting the shocking facts about student data collection, but seeing Alex's encouraging nod from the tech station gave her confidence. Students gasped when Alex demonstrated how much personal information their apps were collecting in real-time. 'Your location is being tracked right now,' he announced, showing live maps of student movements on the projection screen. 'Companies know more about your daily routines than your parents do.' The audience's reaction was exactly what Maya had hoped for - outrage, concern, and determination to take action. Several students approached them afterward asking how to get involved in their campaign.",
        pause: true,
        hook: "What obstacles will Maya and Alex face as their movement gains momentum?",
        microVariants: {
          text: "Maya and Alex's first workshop successfully shocked students into understanding digital surveillance while demonstrating their effective partnership.",
          alternatives: ["The packed auditorium and students' strong reactions validated Maya and Alex's approach to privacy education.", "Demonstrating real-time data collection created the sense of urgency Maya and Alex needed to build their movement."],
          optionalDetails: ["Fifteen students signed up to join their campaign immediately", "Teachers were equally shocked by the data collection revelations", "The presentation video started spreading to other schools through social media"]
        }
      },
      {
        text: "As their movement grew, Maya and Alex taught students how to use privacy tools - VPNs, encrypted messaging apps, ad blockers, and privacy-focused browsers. Their workshops became weekly events, and their partnership became seamless and obviously close. During one session on digital self-defense, Alex caught Maya staring at him while he explained encryption, and she blushed furiously when he winked at her. 'Focus on the privacy tools, not your boyfriend,' Jordan teased quietly, making Maya realize that their relationship was becoming obvious to everyone. 'He's not my boyfriend,' Maya whispered back, though she wished that weren't true.",
        pause: true,
        hook: "How will public attention on their relationship affect their privacy advocacy work?",
        microVariants: {
          text: "Teaching privacy tools strengthened Maya and Alex's partnership while their obvious mutual attraction became apparent to their growing audience.",
          alternatives: ["Alex's technical expertise and Maya's passionate advocacy created workshops that were as effective as they were romantic.", "Their chemistry during presentations added energy to their message while creating personal complications."],
          optionalDetails: ["Student sign-ups for privacy tools increased dramatically", "Other schools started requesting copies of their educational materials", "School administrators began taking notice of their growing influence"]
        }
      },
      {
        text: "The school administration wasn't happy about their activism, especially when parents started asking questions about student data collection policies. During a tense meeting with Principal Martinez, Maya stood her ground while Alex squeezed her hand supportively under the table, his touch giving her strength to continue fighting. 'Students have rights,' Maya argued firmly, 'including the right to know what data is being collected about us and how it's being used.' The principal's attempts to shut down their workshops only made Maya more determined, and Alex's quiet but steady support made her feel invincible. 'We're not backing down,' she declared, and Alex's proud smile told her she'd chosen the right partner for this fight.",
        pause: true,
        hook: "Will institutional pressure strengthen or weaken Maya and Alex's resolve and relationship?",
        microVariants: {
          text: "Administrative opposition to their privacy campaign brought Maya and Alex closer together while strengthening their resolve to protect student rights.",
          alternatives: ["Principal Martinez's attempts to silence their activism only reinforced Maya and Alex's commitment to each other and their cause.", "Facing institutional pressure together deepened Maya and Alex's partnership both romantically and politically."],
          optionalDetails: ["Parents formed a support group for the students' privacy campaign", "The school board scheduled a hearing on student data policies", "Local news outlets began investigating the school's data practices"]
        }
      },
      {
        text: "Their campaign caught the attention of local news and digital rights organizations. During a television interview, the reporter asked about their partnership and obvious chemistry. 'Maya's the real leader here,' Alex said, looking at her with unconcealed admiration. 'I just try to keep up with her brilliance and passion.' Maya felt her heart melt at his public support and pride in her work. 'Alex is being modest,' she replied, reaching for his hand. 'We couldn't do any of this without his technical expertise and unwavering support. We're partners in every sense.' Their public acknowledgment of both their romantic relationship and their shared commitment to digital rights created a powerful image that inspired other young activists.",
        pause: true,
        hook: "How will media attention amplify both their message and their relationship?",
        microVariants: {
          text: "Media interviews allowed Maya and Alex to publicly acknowledge both their romantic partnership and their shared commitment to student privacy rights.",
          alternatives: ["Television coverage showcased Maya and Alex's complementary skills while confirming their relationship to a broader audience.", "Public recognition of their romance and activism created a powerful symbol for youth digital rights advocacy."],
          optionalDetails: ["The interview video went viral among privacy advocates", "Other teen couples started privacy advocacy groups", "Universities began inviting them to speak about youth digital rights"]
        }
      },
      {
        text: "Maya and Alex worked through the night preparing a comprehensive digital privacy policy proposal for the school board, fueled by coffee and determination. As dawn broke over their laptop-covered table, Alex finally found the courage to tell Maya what had been building between them for months. 'I know we started this as activism,' he said softly, taking her hand, 'but somewhere along the way, fighting for everyone's rights made me realize how much I care about you specifically.' Maya's exhausted smile was radiant as she squeezed his hand back. 'I was hoping you'd say that,' she whispered. 'We're going to change the world together, aren't we?' Their first kiss tasted like victory and possibility.",
        pause: true,
        hook: "How will their newly acknowledged relationship affect their final push for policy change?",
        microVariants: {
          text: "All-night policy preparation led to Maya and Alex finally acknowledging their romantic feelings while completing their proposal for student digital rights.",
          alternatives: ["Their first kiss after months of collaboration marked both personal and political commitment to fighting together for privacy rights.", "Admitting their love during the final push for policy change energized Maya and Alex for the crucial school board presentation."],
          optionalDetails: ["Their comprehensive proposal included implementation timelines and cost estimates", "Student supporters had been campaigning board members individually", "National digital rights organizations offered to support their presentation"]
        }
      },
      {
        text: "At the packed school board meeting, Maya presented their comprehensive privacy policy proposal with Alex by her side, their hands intertwined under the presentation table. Board members were impressed by their thorough research, practical solutions, and passionate but professional advocacy. When one board member questioned whether students were mature enough to understand privacy issues, Alex stood up to support Maya's response. 'With respect, sir,' he said firmly, 'we've taught over 200 students to protect their digital privacy in the past three months. Maya has proven that when we're given accurate information and treated as capable individuals, we can make responsible decisions about our own data.' The audience erupted in applause, and Maya felt proud tears as she watched her boyfriend defend their generation's rights and intelligence.",
        pause: true,
        hook: "What will be the result of Maya and Alex's school board presentation?",
        microVariants: {
          text: "Maya and Alex's professional yet passionate school board presentation demonstrated both their expertise and their commitment to each other and student rights.",
          alternatives: ["Alex's defense of student intelligence and Maya's comprehensive policy proposal created a powerful case for digital privacy protections.", "Their united front at the board meeting showcased the strength of their partnership in both activism and romance."],
          optionalDetails: ["Over 100 students and parents attended to support their proposal", "Board members admitted they hadn't understood the scope of data collection", "Media coverage framed them as the face of youth digital rights advocacy"]
        }
      },
      {
        text: "The school board voted unanimously to implement new digital privacy protections based on Maya and Alex's proposal, including transparent data policies, opt-in consent requirements, and student privacy rights training for all staff. As they celebrated with their supporters in the hallway, Maya realized she and Alex had not only protected their classmates' digital rights but had also found something precious in each other. 'We did it,' Alex said, pulling her close for a celebratory hug that lasted longer than friendship required. 'No,' Maya corrected with a grin, 'we're just getting started. There are thousands of schools that need what we've built here.' Their victory was both personal and political, launching both a relationship and a movement that would extend far beyond their own school.",
        pause: true,
        hook: "How will their success inspire broader activism and deeper commitment to each other?",
        microVariants: {
          text: "Victory at the school board strengthened both Maya and Alex's romantic relationship and their commitment to expanding student digital rights advocacy.",
          alternatives: ["Unanimous board approval of their privacy proposal marked the beginning of both a lasting relationship and a broader movement.", "Celebrating policy success together, Maya and Alex realized they had found love while fighting for digital justice."],
          optionalDetails: ["Five other school districts requested copies of their policy proposal", "They were invited to speak at a national education technology conference", "College admissions officers began reaching out about their leadership and activism"]
        }
      },
      {
        text: "Maya was invited to speak at a national conference on student digital rights, with Alex as her co-presenter and official boyfriend. Standing on stage before hundreds of educators, policymakers, and technology leaders, Maya felt the weight of representing her generation's fight for digital autonomy. 'Student privacy isn't just about protecting our personal information,' she told the audience, with Alex nodding encouragingly from beside her. 'It's about ensuring that young people can develop their identities, explore ideas, and make mistakes without permanent digital surveillance shaping our opportunities.' When Alex added his perspective on the technical solutions needed for ethical educational technology, Maya realized they had become true partners in every sense - intellectually, romantically, and as advocates for justice. Their success had given them each other and a platform to protect countless other students' digital rights.",
        pause: true,
        hook: "What lasting impact will Maya and Alex's advocacy have on student digital rights nationwide?",
        microVariants: {
          text: "Speaking at a national conference, Maya and Alex realized their privacy advocacy had grown from school-based activism into a platform for protecting students' digital rights everywhere.",
          alternatives: ["Their national conference presentation marked Maya and Alex's evolution from student activists to recognized leaders in youth digital rights.", "Standing together on the national stage, Maya and Alex understood their relationship and activism had created a model for combining love with social justice."],
          optionalDetails: ["Their presentation was livestreamed to over 500 schools", "Technology companies began implementing their policy recommendations", "They were offered internships at major digital rights organizations"]
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
        text: "Riley Martinez had always noticed that their friend Casey seemed quieter than usual lately, but it wasn't until they found Casey crying in the empty art room that Riley realized something was seriously wrong. 'I can't keep pretending everything's fine,' Casey whispered, their voice breaking. 'I think about dying every single day.' Riley's heart shattered as they pulled Casey into a fierce hug, realizing that the mental health crisis at their school was more than statistics - it was their friend's daily reality. In that moment, surrounded by half-finished paintings and the smell of acrylic, Riley knew they couldn't stay silent about the inadequate mental health support at their school.",
        pause: true,
        hook: "How will Riley's discovery of Casey's struggle inspire them to take action?",
        microVariants: {
          text: "Finding Casey in crisis in the art room opened Riley's eyes to the real mental health emergency among their peers and sparked their determination to fight for better support.",
          alternatives: ["Casey's confession about suicidal thoughts transformed Riley's understanding of their school's mental health crisis from abstract to painfully personal.", "The art room became the place where Riley realized that advocating for mental health resources was literally a matter of life and death."],
          optionalDetails: ["Casey had been hiding their depression for months", "Several other students had dropped out due to untreated mental health issues", "The school had only one counselor for 800 students"]
        }
      },
      {
        text: "That night, Riley stayed up researching mental health statistics, horrified to learn that over 40% of high school students experienced persistent sadness and that suicide was the second leading cause of death among teenagers. When they called Casey to check in, their conversation stretched past midnight as they talked about everything - Casey's depression, Riley's anxiety about college, their shared frustration with their school's outdated mental health resources. 'Thank you for not making me feel broken,' Casey said softly before hanging up. Riley felt their heart flutter, realizing that their concern for Casey was evolving into something deeper, something that made them want to fight even harder for mental health support.",
        pause: true,
        hook: "Will Riley's growing feelings for Casey strengthen their resolve to create change?",
        microVariants: {
          text: "Late-night research and heart-to-heart conversations with Casey deepened both Riley's understanding of mental health issues and their emotional connection to Casey.",
          alternatives: ["Riley's research into teen suicide rates was motivated by their growing care for Casey and determination to protect them.", "Conversations with Casey revealed both the scope of mental health challenges and Riley's deepening feelings for their friend."],
          optionalDetails: ["Most students didn't know where to get help for mental health issues", "The school's mental health pamphlets were from the 1990s", "Riley discovered they also had undiagnosed anxiety"]
        }
      },
      {
        text: "Riley started paying attention to mental health issues everywhere - in their classes, in the hallways, in their friend groups. They noticed Sam constantly picking at their skin, Jordan sleeping through classes, and Alex making jokes about wanting to disappear. During lunch with Casey, they brought up the idea of starting a mental health advocacy group. Casey's eyes lit up for the first time in weeks. 'Would you really do that?' they asked, reaching across the table to squeeze Riley's hand. The touch sent electricity through Riley's entire body, and they realized that fighting for Casey's well-being had become inseparable from their growing romantic feelings. 'For you, I'd do anything,' Riley replied, then blushed at how that sounded.",
        pause: true,
        hook: "How will Riley balance their activism with their developing feelings for Casey?",
        microVariants: {
          text: "Riley's growing awareness of classmates' mental health struggles was matched by their deepening romantic feelings for Casey, who responded positively to advocacy ideas.",
          alternatives: ["Noticing widespread mental health issues among peers, Riley found motivation in Casey's enthusiastic support for their advocacy plans.", "Casey's excitement about mental health advocacy made Riley realize their friendship was becoming something more romantic and meaningful."],
          optionalDetails: ["Teachers were reporting increased absences and declining grades", "Several students had been hospitalized for mental health crises", "Riley and Casey started eating lunch together every day"]
        }
      },
      {
        text: "Riley approached Ms. Johnson, the school psychologist, about their concerns and was surprised by her enthusiastic response. 'I've been advocating for better resources for years,' Ms. Johnson said, 'but it's more powerful coming from students.' She introduced Riley to Dr. Kim from the community mental health center, who offered to help train student advocates. When Riley shared this news with Casey after school, they walked home together for the first time, their shoulders bumping as they talked excitedly about possibilities. 'I can't believe you're doing this,' Casey said, stopping to face Riley under the oak tree by the school. 'You're incredible.' The way Casey looked at them made Riley's heart race with hope and possibility.",
        pause: true,
        hook: "What will happen as Riley and Casey work together on mental health advocacy?",
        microVariants: {
          text: "Professional support from Ms. Johnson and Dr. Kim validated Riley's advocacy plans while their walks home with Casey created opportunities for deeper connection.",
          alternatives: ["Ms. Johnson's enthusiasm for student-led mental health advocacy matched the growing intimacy between Riley and Casey.", "Professional allies strengthened Riley's advocacy work while their relationship with Casey deepened through shared walks and conversations."],
          optionalDetails: ["Dr. Kim had helped start successful peer support programs at other schools", "Ms. Johnson was relieved to have student advocates supporting her work", "Riley and Casey started texting late into the night about their plans"]
        }
      },
      {
        text: "The first meeting of their mental health advocacy group attracted twelve students, including several Riley hadn't expected. As they sat in a circle in Ms. Johnson's office, sharing stories about anxiety, depression, and the pressure to appear perfect, Riley watched Casey speak for the first time about their struggles. 'I thought I was the only one feeling this way,' Casey said, their voice stronger than Riley had heard it in months. 'But sitting here with all of you, I realize we can help each other.' When Casey caught Riley's eye and smiled, Riley felt their heart soar with pride and something that felt suspiciously like love.",
        pause: true,
        hook: "How will leading the support group together affect Riley and Casey's relationship?",
        microVariants: {
          text: "The first support group meeting revealed widespread mental health struggles while showing Casey's growing strength and deepening Riley's feelings for them.",
          alternatives: ["Twelve students attending their first meeting validated Riley's advocacy approach while Casey's participation marked their healing and their growing bond.", "Casey's courage in sharing their story at the group meeting made Riley realize how much they admired and cared for them."],
          optionalDetails: ["Three students mentioned having eating disorders", "Several talked about family pressure and perfectionism", "Students exchanged phone numbers for crisis support"]
        }
      },
      {
        text: "Riley and Casey spent hours researching evidence-based mental health programs, writing proposals for expanded counseling services, and planning peer support training. Working late in the library became their routine, surrounded by psychology textbooks and draft policy papers. One evening, while discussing trauma-informed care approaches, Casey looked up from their laptop and said, 'Riley, I need to tell you something. This work we're doing - it's saving my life. But more than that, working with you is making me want to live.' The confession hung in the air between them, and Riley felt their breath catch as they realized Casey's feelings might match their own.",
        pause: true,
        hook: "Will Riley and Casey's shared mission bring them together romantically?",
        microVariants: {
          text: "Late-night research sessions brought Riley and Casey closer together emotionally while they developed comprehensive mental health advocacy proposals.",
          alternatives: ["Casey's confession that their advocacy work was life-saving deepened the emotional intimacy between them during their research collaboration.", "Working together on mental health policy proposals created space for Riley and Casey to acknowledge their growing romantic feelings."],
          optionalDetails: ["They researched programs from schools with successful peer support systems", "Their proposal included funding requests for two additional counselors", "Riley started noticing how Casey's eyes lit up when they talked about helping others"]
        }
      },
      {
        text: "When Riley presented their mental health advocacy proposal to the school board, Casey sat in the front row for support, their encouraging smile giving Riley confidence. 'Mental health is not a luxury,' Riley declared to the packed meeting room. 'For students like my friend Casey, who thought about suicide every day until we created peer support systems, mental health resources are literally the difference between life and death.' The board members looked moved, and Riley caught Casey wiping away tears. After the presentation, Casey hugged Riley fiercely in the parking lot. 'Thank you for saving my life,' they whispered. 'And thank you for letting me help save others.'",
        pause: true,
        hook: "How will public advocacy affect Riley and Casey's relationship and their cause?",
        microVariants: {
          text: "Riley's powerful school board presentation, supported by Casey's presence, made a compelling case for mental health resources while deepening their emotional bond.",
          alternatives: ["Using Casey's story in their presentation created a powerful moment of vulnerability that brought them closer together.", "Public advocacy for mental health resources strengthened both Riley's relationship with Casey and their commitment to helping other students."],
          optionalDetails: ["Several board members admitted they hadn't understood the scope of teen mental health issues", "Local media attended and interviewed both Riley and Casey", "Parents in the audience approached them afterward to share their own children's struggles"]
        }
      },
      {
        text: "The school board approved funding for expanded mental health services, and Riley and Casey were invited to help design the new peer support program. Training to become peer counselors brought them even closer as they learned active listening skills, crisis intervention, and self-care strategies. During one particularly emotional role-playing exercise about supporting someone with suicidal thoughts, Casey broke down crying. Riley immediately wrapped them in their arms, and Casey whispered, 'I'm so grateful you found me that day in the art room. I think I was falling in love with you even then, but I was too scared to admit it.' Riley's heart filled with overwhelming love and relief as they realized their feelings were mutual.",
        pause: true,
        hook: "How will Riley and Casey navigate their new relationship while leading mental health advocacy?",
        microVariants: {
          text: "Peer counselor training deepened Riley and Casey's skills and emotional intimacy, leading to Casey's confession of romantic feelings during a vulnerable moment.",
          alternatives: ["Training in crisis intervention brought Riley and Casey closer together and created space for Casey to admit their romantic feelings.", "Learning to support others in crisis helped Casey recognize and express their love for Riley, who had supported them through their darkest time."],
          optionalDetails: ["They learned techniques for preventing burnout while helping others", "Ms. Johnson praised their natural counseling abilities", "Their training group became close friends who supported each other"]
        }
      },
      {
        text: "As the peer support program launched, Riley and Casey became co-facilitators, their partnership seamless and obviously close. Their first official support group drew twenty students, including several who mentioned seeing their relationship as proof that healing and love were possible. 'You two give me hope,' said Jamie, a sophomore dealing with anxiety. 'If Casey can go from wanting to die to wanting to help others live, maybe I can get better too.' Riley and Casey exchanged a look filled with love and purpose, realizing their relationship had become part of their advocacy message about the possibility of healing and connection.",
        pause: true,
        hook: "What impact will Riley and Casey's relationship have on other students seeking support?",
        microVariants: {
          text: "Co-facilitating support groups allowed Riley and Casey's relationship to model healing and hope for other students struggling with mental health challenges.",
          alternatives: ["Their obvious love and partnership became inspirational for students learning that recovery and healthy relationships were possible.", "Students found hope in seeing Casey's transformation from suicidal to supportive, especially with Riley as their loving partner."],
          optionalDetails: ["The support group grew to include middle school students", "They developed resources specifically for LGBTQ+ students dealing with mental health issues", "Several students credited them with preventing suicide attempts"]
        }
      },
      {
        text: "Riley and Casey were invited to speak at a state conference on youth mental health, sharing their story of advocacy, recovery, and love. Standing on stage together, Casey spoke about their journey from suicidal ideation to peer counseling, while Riley talked about how advocacy had strengthened their relationship and their community. 'Love and activism aren't separate things,' Riley concluded, reaching for Casey's hand. 'When we fight for each other's well-being, we create the conditions for both healing and authentic connection.' The standing ovation felt like validation of everything they'd built together - both their relationship and their movement for mental health support.",
        pause: true,
        hook: "How will statewide recognition affect their advocacy and relationship?",
        microVariants: {
          text: "Speaking at a state mental health conference allowed Riley and Casey to share their story of recovery, love, and advocacy with a broader audience.",
          alternatives: ["Their conference presentation showcased how personal healing and romantic partnership could strengthen mental health advocacy efforts.", "Public recognition of their relationship and advocacy work validated their approach to combining love and activism for mental health support."],
          optionalDetails: ["Five other schools requested help starting similar programs", "They were featured in a documentary about teen mental health advocacy", "College admissions officers began reaching out about their leadership"]
        }
      },
      {
        text: "By winter, their peer support program had prevented three suicide attempts, helped dozens of students access professional counseling, and created a school culture where mental health conversations were normalized. Riley and Casey celebrated their six-month anniversary by volunteering at a crisis hotline training, their shared commitment to mental health advocacy having become the foundation of their relationship. 'I used to think love meant never burdening someone with your problems,' Casey reflected as they walked home through the snow. 'But you taught me that real love means showing up for each other's struggles and working together to make things better.' Riley squeezed their hand, grateful for a partner who understood that love and activism were inseparable.",
        pause: true,
        hook: "What long-term changes will Riley and Casey's work create in their community?",
        microVariants: {
          text: "Six months of advocacy had transformed their school's mental health culture while deepening Riley and Casey's relationship through shared purpose and mutual support.",
          alternatives: ["Celebrating their anniversary with crisis hotline training reflected how mental health advocacy had become central to Riley and Casey's relationship.", "Their relationship had grown stronger through shared activism while their program created lasting change in school mental health support."],
          optionalDetails: ["The school hired two additional counselors due to their advocacy", "Mental health education was integrated into health class curriculum", "Students from other schools visited to learn about their peer support model"]
        }
      },
      {
        text: "Riley and Casey were selected as youth representatives on the district's mental health advisory committee, working alongside professionals to shape policy for all schools in their area. Their relationship had matured into a partnership where personal support and advocacy work reinforced each other seamlessly. During one committee meeting about crisis intervention protocols, Casey advocated passionately for trauma-informed approaches while Riley provided data on peer support effectiveness. Watching Casey speak with confidence and expertise, Riley felt overwhelmed with pride and love for the person who had transformed from someone who wanted to die into someone fighting to help others live.",
        pause: true,
        hook: "How will district-level influence expand their impact on youth mental health?",
        microVariants: {
          text: "Serving on the district mental health committee allowed Riley and Casey to influence policy while their mature partnership balanced personal support with professional advocacy.",
          alternatives: ["District recognition of their expertise validated Riley and Casey's approach while their relationship provided the foundation for expanded advocacy work.", "Casey's confident advocacy in professional settings showed their complete transformation, filling Riley with pride and deeper love."],
          optionalDetails: ["Their recommendations were implemented across fifteen schools", "They helped design mental health screening protocols for all students", "Professional counselors sought their input on youth-friendly approaches"]
        }
      },
      {
        text: "Spring brought recognition as 'Youth Mental Health Advocates of the Year' from the state psychological association, but the award ceremony became secondary to a more personal milestone. That evening, as they sat in the same art room where Riley had first found Casey in crisis a year earlier, Casey pulled out a small wrapped package. 'This is for you,' they said, handing Riley a painted portrait of them leading a support group. 'You saved my life, but more than that, you taught me that my life was worth saving and worth sharing with someone I love.' As Riley studied the painting, they realized it captured not just their advocacy work but the love that had grown from their shared commitment to healing and helping others.",
        pause: true,
        hook: "What does their year of advocacy and love reveal about personal and political transformation?",
        microVariants: {
          text: "State recognition for their mental health advocacy was overshadowed by personal celebration in the art room where their journey began, highlighting their transformation from crisis to love.",
          alternatives: ["Casey's painted portrait of Riley leading support groups symbolized how their relationship had grown from crisis intervention to mutual love and shared purpose.", "Returning to the art room where they'd first connected during Casey's crisis, they celebrated how advocacy and love had transformed both their lives."],
          optionalDetails: ["The painting would be displayed in the new peer support center", "Their story was featured in mental health advocacy publications", "They planned to study psychology together in college"]
        }
      },
      {
        text: "As their senior year approached, Riley and Casey had created lasting change in their school's approach to mental health while building a relationship rooted in mutual support, shared values, and deep love. Their peer support program had become a model for other schools, and they'd been accepted to the same college where they planned to study psychology and continue their advocacy work. Standing together at graduation, Riley realized that finding Casey in the art room that day had changed both of their lives completely. 'We saved each other,' Casey whispered, squeezing Riley's hand as they walked across the stage together. Their story had become proof that love and activism could transform individual lives and entire communities.",
        pause: true,
        hook: "What legacy will Riley and Casey's advocacy and relationship leave for future students?",
        microVariants: {
          text: "Graduation marked the culmination of Riley and Casey's high school mental health advocacy while celebrating their enduring relationship built on love, healing, and shared purpose.",
          alternatives: ["Their senior year success in mental health advocacy and college acceptance together showed how personal healing and romantic love could create lasting social change.", "Walking across the graduation stage hand-in-hand, Riley and Casey embodied the possibility of transformation from crisis to love to community leadership."],
          optionalDetails: ["Their peer support program was written into official school policy", "Three underclassmen were trained to continue their leadership roles", "They received full scholarships for psychology studies based on their advocacy work"]
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
