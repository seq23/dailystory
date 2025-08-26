// Level 1 Templates - Enhanced with proper word counts
// 2-3 sentences per page (40-60 words per scene)
// For ages 5-7, 1st-2nd grade reading level

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_1_TEMPLATES: StoryTemplate[] = [
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
        text: "A tiny fairy appears from behind a rose bush. She waves her wand and makes the butterflies dance around {userName}.",
        pause: true,
        hook: "What will the fairy show {userName} next?",
        microVariants: {
          text: "A tiny fairy appears from behind a rose bush. She waves her wand and makes the butterflies dance around {userName}.",
          alternatives: ["From the roses, a small fairy emerges with a sparkling wand.", "A magical fairy greets {userName} from her flower home."],
          optionalDetails: ["her wings shimmer like diamonds", "she speaks in a musical voice"]
        }
      },
      {
        text: "{userName} follows the fairy deeper into the garden. They find a crystal fountain with water that tastes like {favoriteFood}.",
        pause: true,
        hook: "What other magical surprises await in the garden?",
        microVariants: {
          text: "{userName} follows the fairy deeper into the garden. They find a crystal fountain with water that tastes like {favoriteFood}.",
          alternatives: ["The fairy leads {userName} to a magical crystal fountain.", "Together they discover a fountain of sweet, magical water."],
          optionalDetails: ["the fountain sparkles in the sunlight", "rainbow fish swim in the crystal water"]
        }
      },
      {
        text: "The fairy shows {userName} how to make flower crowns. Together they create beautiful crowns from the magical blooms.",
        pause: true,
        hook: "What special gift will the fairy give {userName}?",
        microVariants: {
          text: "The fairy shows {userName} how to make flower crowns. Together they create beautiful crowns from the magical blooms.",
          alternatives: ["They weave flowers into beautiful, magical crowns.", "The fairy teaches {userName} to craft crowns from enchanted petals."],
          optionalDetails: ["the crowns glow with soft light", "each flower has a different magical power"]
        }
      },
      {
        text: "{userName} promises to visit the fairy garden every day. The fairy gives them a special seed to plant at home.",
        pause: false,
        hook: "What will grow from this magical seed?",
        microVariants: {
          text: "{userName} promises to visit the fairy garden every day. The fairy gives them a special seed to plant at home.",
          alternatives: ["The fairy gifts {userName} a magical seed before they leave.", "With a promise to return, {userName} receives a special growing gift."],
          optionalDetails: ["the seed glows with inner light", "it feels warm and tingly in their hand"]
        }
      },
      {
        text: "At home, {userName} carefully plants the magical seed in a special spot in their garden. They water it every day and tell it stories about their fairy friend. One morning, a tiny {favoriteColor} sprout appears, and {userName} knows their magical adventures are just beginning.",
        pause: false,
        hook: "What wonderful plant will grow from this magical seed?",
        microVariants: {
          text: "At home, {userName} carefully plants the magical seed in a special spot in their garden. They water it every day and tell it stories about their fairy friend. One morning, a tiny {favoriteColor} sprout appears, and {userName} knows their magical adventures are just beginning.",
          alternatives: ["The magical seed finds a perfect home in {userName}'s garden, where daily care and stories help it begin to grow.", "With gentle care and fairy stories, {userName} watches as the magical seed starts its amazing transformation."],
          optionalDetails: ["the sprout sparkles in the morning sunlight", "butterflies are drawn to the growing plant", "the soil around the seed glows softly"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} plants the magical seed in their own garden and watches it grow into something wonderful.",
        microVariants: ["The seed grows into a bridge between the two gardens.", "A new fairy home sprouts from the magical seed."]
      },
      {
        type: 'triumphant',
        text: "{userName} becomes the garden's official human helper, protecting all the magical creatures.",
        microVariants: ["The fairy declares {userName} the guardian of garden magic.", "{userName} earns their own set of magical gardening tools."]
      }
    ],
    reuse: {
      swappableElements: {
        "fairy": ["pixie", "sprite", "nature spirit", "garden guardian"],
        "fountain": ["pond", "stream", "waterfall", "spring"],
        "crown": ["necklace", "bracelet", "ring", "headband"]
      },
      weatherVariants: ["on a sunny morning", "during a gentle rain", "at golden sunset", "under starlight"],
      settingVariants: ["backyard", "school garden", "park", "grandmother's house"]
    }
  },
  {
    title: "The Brave Little Explorer",
    theme: "Adventure Journeys",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} packs a small backpack for their first camping trip. They put in a flashlight, snacks, and their favorite {favoriteColor} water bottle.",
        pause: true,
        hook: "What adventures will {userName} find in the forest?",
        microVariants: {
          text: "{userName} packs a small backpack for their first camping trip. They put in a flashlight, snacks, and their favorite {favoriteColor} water bottle.",
          alternatives: ["Getting ready for camping, {userName} fills their backpack with supplies.", "For the big adventure, {userName} packs everything they need."],
          optionalDetails: ["the backpack has fun patches", "they pack extra snacks to share"]
        }
      },
      {
        text: "At the campsite, {userName} helps set up the tent. They collect sticks and leaves to make a cozy campfire area.",
        pause: true,
        hook: "What will {userName} discover around the campfire?",
        microVariants: {
          text: "At the campsite, {userName} helps set up the tent. They collect sticks and leaves to make a cozy campfire area.",
          alternatives: ["Working together, {userName} helps build their outdoor home.", "The campsite becomes special when {userName} adds their touches."],
          optionalDetails: ["friendly squirrels watch from the trees", "the tent is bright and cheerful"]
        }
      },
      {
        text: "Around the campfire, {userName} roasts marshmallows and tells stories. The stars come out and shine like diamonds in the sky.",
        pause: true,
        hook: "What special nighttime adventure awaits {userName}?",
        microVariants: {
          text: "Around the campfire, {userName} roasts marshmallows and tells stories. The stars come out and shine like diamonds in the sky.",
          alternatives: ["The evening brings marshmallows, stories, and sparkling stars.", "Under the starry sky, {userName} enjoys the perfect camping night."],
          optionalDetails: ["owls hoot softly in the distance", "the fire crackles happily"]
        }
      },
      {
        text: "{userName} hears a gentle rustling in the bushes. A friendly {favoriteAnimal} appears and sits by the warm fire.",
        pause: true,
        hook: "Will the animal become {userName}'s camping friend?",
        microVariants: {
          text: "{userName} hears a gentle rustling in the bushes. A friendly {favoriteAnimal} appears and sits by the warm fire.",
          alternatives: ["A soft sound leads to a wonderful surprise visitor.", "The forest sends {userName} a special furry friend."],
          optionalDetails: ["the animal has gentle, curious eyes", "it seems to enjoy the warmth"]
        }
      },
      {
        text: "In the morning, {userName} waves goodbye to their new animal friend. They pack up camp and promise to return next summer.",
        pause: false,
        hook: "What memories will {userName} treasure from this adventure?",
        microVariants: {
          text: "In the morning, {userName} waves goodbye to their new animal friend. They pack up camp and promise to return next summer.",
          alternatives: ["The camping adventure ends with new friendships and happy memories.", "Saying goodbye is hard, but {userName} knows they'll be back."],
          optionalDetails: ["the sunrise paints the sky in beautiful colors", "birds sing a cheerful morning song"]
        }
      },
      {
        text: "When {userName} gets home, they create a special camping journal with pictures and stories from their adventure. They plan their next camping trip and promise to teach other kids about respecting nature and making friends with animals.",
        pause: false,
        hook: "What new camping adventures will {userName} discover?",
        microVariants: {
          text: "When {userName} gets home, they create a special camping journal with pictures and stories from their adventure. They plan their next camping trip and promise to teach other kids about respecting nature and making friends with animals.",
          alternatives: ["The camping memories become a treasured journal that inspires {userName} to plan more outdoor adventures.", "Home again, {userName} documents their camping story and dreams of sharing nature's wonders with friends."],
          optionalDetails: ["the journal has pressed leaves and flowers", "they draw maps of their camping spots", "family members love hearing the adventure stories"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} dreams about camping every night and draws pictures of their forest friend.",
        microVariants: ["The adventure lives on in drawings and happy dreams.", "Every picture tells the story of their camping friendship."]
      },
      {
        type: 'triumphant',
        text: "{userName} becomes the best young camper in their family and teaches others about nature.",
        microVariants: ["Their camping skills help them become a nature guide.", "Other kids ask {userName} to teach them about outdoor adventures."]
      }
    ],
    reuse: {
      swappableElements: {
        "camping gear": ["tent", "sleeping bag", "lantern", "compass"],
        "forest sounds": ["owls hooting", "leaves rustling", "crickets singing", "wind whooshing"],
        "activities": ["hiking", "exploring", "stargazing", "storytelling"]
      },
      weatherVariants: ["on a clear night", "under a full moon", "during gentle weather", "on a warm evening"],
      settingVariants: ["mountain campsite", "forest clearing", "by a lake", "in a meadow"]
    }
  },
  {
    title: "The Helpful Friend",
    theme: "Friendship & Teamwork", 
    level: "Level 1",
    scenes: [
      {
        text: "{userName} sees their friend Sarah looking sad on the playground. Her favorite toy is stuck high up in the big oak tree.",
        pause: true,
        hook: "How will {userName} help their friend feel better?",
        microVariants: {
          text: "{userName} sees their friend Sarah looking sad on the playground. Her favorite toy is stuck high up in the big oak tree.",
          alternatives: ["Sarah's toy is stuck, and {userName} wants to help.", "A friend needs help, and {userName} is ready to find a solution."],
          optionalDetails: ["the toy is a small {favoriteColor} bear", "other kids gather to watch"]
        }
      },
      {
        text: "{userName} gets a long stick and carefully tries to reach the toy. They work together with other friends to make a plan.",
        pause: true,
        hook: "Will their teamwork plan succeed?",
        microVariants: {
          text: "{userName} gets a long stick and carefully tries to reach the toy. They work together with other friends to make a plan.",
          alternatives: ["Working as a team, the friends try different ideas.", "Everyone helps {userName} think of the best solution."],
          optionalDetails: ["they stack safe boxes to reach higher", "a teacher watches to keep everyone safe"]
        }
      },
      {
        text: "Success! The toy falls safely into {userName}'s hands. Sarah smiles and gives {userName} a big thank-you hug.",
        pause: true,
        hook: "How will this act of kindness make everyone feel?",
        microVariants: {
          text: "Success! The toy falls safely into {userName}'s hands. Sarah smiles and gives {userName} a big thank-you hug.",
          alternatives: ["The rescue works perfectly, and everyone cheers!", "Friendship wins when the toy comes down safely."],
          optionalDetails: ["all the friends cheer happily", "Sarah hugs her toy tight"]
        }
      },
      {
        text: "All the friends decide to play together for the rest of recess. They share their snacks and play {userName}'s favorite game.",
        pause: true,
        hook: "What new friendships will grow from this kindness?",
        microVariants: {
          text: "All the friends decide to play together for the rest of recess. They share their snacks and play {userName}'s favorite game.",
          alternatives: ["The rescue brings everyone together for fun games.", "Helping others creates new friendships and joy."],
          optionalDetails: ["they play on the swings together", "everyone shares their {favoriteFood} snacks"]
        }
      },
      {
        text: "From that day on, {userName} and Sarah became the best of friends. They always help each other and have the most fun together.",
        pause: false,
        hook: "What adventures will these best friends share next?",
        microVariants: {
          text: "From that day on, {userName} and Sarah became the best of friends. They always help each other and have the most fun together.",
          alternatives: ["A simple act of kindness grew into a wonderful friendship.", "Helping others brought {userName} their very best friend."],
          optionalDetails: ["they sit together at lunch every day", "they plan fun activities together"]
        }
      },
      {
        text: "Every day at school, {userName} and Sarah sit together at lunch and plan fun activities. They help other kids solve playground problems and share their snacks with anyone who feels sad or lonely.",
        pause: false,
        hook: "What other friends will join their kindness club?",
        microVariants: {
          text: "Every day at school, {userName} and Sarah sit together at lunch and plan fun activities. They help other kids solve playground problems and share their snacks with anyone who feels sad or lonely.",
          alternatives: ["Daily lunch meetings between {userName} and Sarah become planning sessions for spreading kindness throughout the school.", "The best friends create a tradition of lunch-time kindness planning and snack sharing with lonely classmates."],
          optionalDetails: ["they make friendship bracelets for new kids", "their kindness activities include playground games", "teachers notice how much happier the playground becomes"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and Sarah have sleepovers and share all their favorite stories and dreams.",
        microVariants: ["Best friends share everything and create the sweetest memories.", "Their friendship grows stronger with every shared adventure."]
      },
      {
        type: 'silly',
        text: "Sarah's toy becomes the mascot for their friendship club, where helping others is the most important rule!",
        microVariants: ["The rescued toy becomes a symbol of their helpful friendship club.", "Every rescue mission makes their friendship club grow!"]
      }
    ],
    reuse: {
      swappableElements: {
        "problem": ["lost toy", "dropped book", "stuck ball", "fallen hat"],
        "solution": ["teamwork", "creative thinking", "asking adults", "using tools"],
        "playground": ["swings", "slide", "monkey bars", "sandbox"]
      },
      weatherVariants: ["on a sunny day", "during afternoon recess", "on a warm morning", "after lunch time"],
      settingVariants: ["school playground", "park", "backyard", "community center"]
    }
  },
  {
    title: "The Baby Animal Rescue",
    theme: "Animals & Nature",
    level: "Level 1", 
    scenes: [
      {
        text: "{userName} finds a tiny baby bird that has fallen from its nest. The little bird chirps softly and looks scared and alone.",
        pause: true,
        hook: "How will {userName} help the baby bird get back to safety?",
        microVariants: {
          text: "{userName} finds a tiny baby bird that has fallen from its nest. The little bird chirps softly and looks scared and alone.",
          alternatives: ["A small, scared baby bird needs {userName}'s help.", "The tiny bird chirps for help, and {userName} listens carefully."],
          optionalDetails: ["the bird has soft {favoriteColor} feathers", "it fits perfectly in {userName}'s gentle hands"]
        }
      },
      {
        text: "{userName} carefully picks up the baby bird and looks up to find its nest in the tall tree. They ask their mom for help.",
        pause: true,
        hook: "What will Mom and {userName} do to return the bird safely?",
        microVariants: {
          text: "{userName} carefully picks up the baby bird and looks up to find its nest in the tall tree. They ask their mom for help.",
          alternatives: ["Gentle hands hold the bird while {userName} searches for its home.", "Finding the nest high above, {userName} knows they need help."],
          optionalDetails: ["Mom brings a soft towel for the bird", "they can hear other baby birds in the nest"]
        }
      },
      {
        text: "Mom gets a ladder while {userName} keeps the baby bird warm and safe. Together they climb up and return the bird to its family.",
        pause: true,
        hook: "How will the bird family react to having their baby back?",
        microVariants: {
          text: "Mom gets a ladder while {userName} keeps the baby bird warm and safe. Together they climb up and return the bird to its family.",
          alternatives: ["Working together, they safely return the bird to its nest.", "The rescue mission succeeds with teamwork and gentle care."],
          optionalDetails: ["the parent birds chirp thank you", "the baby bird snuggles with its siblings"]
        }
      },
      {
        text: "The mama and papa birds sing beautiful songs to thank {userName} for their kindness. The whole bird family is happy again.",
        pause: true,
        hook: "What will {userName} learn from this act of kindness?",
        microVariants: {
          text: "The mama and papa birds sing beautiful songs to thank {userName} for their kindness. The whole bird family is happy again.",
          alternatives: ["Sweet bird songs fill the air as a thank you.", "The happy bird family sings their gratitude to {userName}."],
          optionalDetails: ["other birds join in the thank you song", "the melody sounds like {favoriteFood} tastes - sweet"]
        }
      },
      {
        text: "Every day after that, {userName} visits the tree to check on their bird friends. The baby bird always chirps hello with joy.",
        pause: false,
        hook: "What other animals might {userName} help in the future?",
        microVariants: {
          text: "Every day after that, {userName} visits the tree to check on their bird friends. The baby bird always chirps hello with joy.",
          alternatives: ["Daily visits create a special friendship with the bird family.", "The rescued bird becomes {userName}'s special feathered friend."],
          optionalDetails: ["the bird recognizes {userName}'s voice", "sometimes the bird brings small gifts like pretty leaves"]
        }
      },
      {
        text: "Each week, {userName} brings special treats for their bird friends and spends time watching them play and learn to fly better. Other kids from the neighborhood start joining {userName} to watch the birds and learn about helping animals.",
        pause: false,
        hook: "How many more animals might {userName} help in their neighborhood?",
        microVariants: {
          text: "Each week, {userName} brings special treats for their bird friends and spends time watching them play and learn to fly better. Other kids from the neighborhood start joining {userName} to watch the birds and learn about helping animals.",
          alternatives: ["Weekly bird visits become neighborhood learning sessions as other children join {userName} in animal care education.", "The bird friendship grows into a community activity where kids learn about wildlife care from {userName}'s example."],
          optionalDetails: ["the birds perform special flight shows for the children", "kids bring their own healthy bird treats", "a teacher joins to help identify different bird species"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} becomes known as the neighborhood's best animal helper, and creatures come to them when they need care.",
        microVariants: ["Animals throughout the neighborhood learn to trust {userName}'s gentle heart.", "Word spreads among animals that {userName} is always ready to help."]
      },
      {
        type: 'triumphant',
        text: "{userName} starts a junior animal rescue club with friends, and they save many animals together.",
        microVariants: ["The bird rescue inspires {userName} to create an animal helping team.", "Friends join {userName} in becoming neighborhood animal heroes."]
      }
    ],
    reuse: {
      swappableElements: {
        "baby animal": ["bird", "kitten", "puppy", "bunny", "squirrel"],
        "rescue method": ["ladder", "gentle hands", "soft basket", "careful climbing"],
        "animal home": ["nest", "burrow", "den", "tree hole", "garden bed"]
      },
      weatherVariants: ["on a calm day", "during gentle weather", "on a quiet morning", "in the afternoon"],
      settingVariants: ["backyard", "neighborhood park", "school garden", "front yard"]
    }
  },
  {
    title: "The Space Explorer Dream",
    theme: "Space & Sci-Fi",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} builds a rocket ship from cardboard boxes in their backyard. They paint it {favoriteColor} and add silver buttons and lights.",
        pause: true,
        hook: "Where will {userName}'s imagination rocket take them?",
        microVariants: {
          text: "{userName} builds a rocket ship from cardboard boxes in their backyard. They paint it {favoriteColor} and add silver buttons and lights.",
          alternatives: ["A cardboard rocket becomes {userName}'s spaceship to the stars.", "Building their dream rocket, {userName} prepares for space adventure."],
          optionalDetails: ["the control panel has fun beeping sounds", "windows are drawn with crayon stars"]
        }
      },
      {
        text: "Inside the rocket, {userName} puts on their astronaut helmet and counts down. Three, two, one, blast off to space!",
        pause: true,
        hook: "What amazing sights will {userName} see in space?",
        microVariants: {
          text: "Inside the rocket, {userName} puts on their astronaut helmet and counts down. Three, two, one, blast off to space!",
          alternatives: ["The countdown begins {userName}'s amazing space adventure.", "Astronaut {userName} launches into an imaginary journey among the stars."],
          optionalDetails: ["the helmet is made from a shiny bowl", "they pack space snacks of {favoriteFood}"]
        }
      },
      {
        text: "{userName} flies past the moon and waves to the friendly aliens living there. The aliens wave back with their green hands.",
        pause: true,
        hook: "What will the friendly aliens show {userName}?",
        microVariants: {
          text: "{userName} flies past the moon and waves to the friendly aliens living there. The aliens wave back with their green hands.",
          alternatives: ["Friendly moon aliens greet {userName} with happy waves.", "The space journey leads to wonderful alien friendships."],
          optionalDetails: ["the aliens have kind, sparkly eyes", "they live in crystal moon houses"]
        }
      },
      {
        text: "The aliens invite {userName} to visit their space playground. They play zero-gravity tag and eat moon ice cream together.",
        pause: true,
        hook: "What games will {userName} play with their new space friends?",
        microVariants: {
          text: "The aliens invite {userName} to visit their space playground. They play zero-gravity tag and eat moon ice cream together.",
          alternatives: ["Space friends share their amazing floating playground.", "Playing in zero gravity makes every game feel magical."],
          optionalDetails: ["the ice cream floats in fun bubbles", "they slide down shooting star slides"]
        }
      },
      {
        text: "When it's time to go home, {userName} promises to visit again soon. They blast off and land safely in their backyard.",
        pause: false,
        hook: "What space adventures will {userName} dream about tonight?",
        microVariants: {
          text: "When it's time to go home, {userName} promises to visit again soon. They blast off and land safely in their backyard.",
          alternatives: ["The space adventure ends with promises of return visits.", "Landing safely, {userName} carries space memories in their heart."],
          optionalDetails: ["the aliens give them a small moon rock", "they plan tomorrow's space mission"]
        }
      },
      {
        text: "At the end of their space adventure, {userName} promises the alien children they will return someday. They wave goodbye as Earth appears in their spaceship window, knowing they will always remember their cosmic friends and the wonders of space exploration.",
        pause: false,
        hook: "What other planets might {userName} explore in the future?",
        microVariants: {
          text: "At the end of their space adventure, {userName} promises the alien children they will return someday. They wave goodbye as Earth appears in their spaceship window, knowing they will always remember their cosmic friends and the wonders of space exploration.",
          alternatives: ["The space adventure concludes with promises of return visits as {userName} waves goodbye to their alien friends.", "Heading home to Earth, {userName} carries memories of cosmic friendship and dreams of future space exploration."],
          optionalDetails: ["the alien children wave from their planet's surface", "Earth looks beautiful and {favoriteColor} from space", "the spaceship plays gentle music for the journey home"]
        }
      }
    ],
    endings: [
      {
        type: 'silly',
        text: "That night, {userName} dreams they're teaching Earth animals how to play alien games, and even the {favoriteAnimal} learns to float!",
        microVariants: ["Dreams mix Earth and space in the most wonderful, silly ways.", "Space adventures continue in dreams where anything is possible."]
      },
      {
        type: 'cozy',
        text: "{userName} falls asleep in their rocket ship, dreaming of floating among the stars with their new alien friends.",
        microVariants: ["Sweet space dreams fill the cardboard rocket all night long.", "The backyard rocket becomes a cozy spaceship for dreaming."]
      }
    ],
    reuse: {
      swappableElements: {
        "space vehicle": ["rocket", "spaceship", "space shuttle", "flying saucer"],
        "alien friends": ["moon aliens", "star creatures", "space animals", "planet visitors"],
        "space activities": ["floating games", "star racing", "planet hopping", "meteor surfing"]
      },
      weatherVariants: ["under a starry sky", "on a clear night", "during a bright day", "when the moon is full"],
      settingVariants: ["backyard", "garage", "bedroom", "playroom"]
    }
  }
];

export function getLevel1Template(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_1_TEMPLATES.length) {
    return LEVEL_1_TEMPLATES[templateIndex];
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_1_TEMPLATES.length);
  return LEVEL_1_TEMPLATES[randomIndex];
}

export function getLevel1TemplateCount(): number {
  return LEVEL_1_TEMPLATES.length;
}