/**
 * Level 1 Templates (Ages 5-7) - Complete Fallback Story Library
 * 5 templates with 5-8 scenes each, 20-40 words per scene
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_1_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Animals & Nature Theme
  {
    title: "The Rainbow Puppy Adventure",
    theme: "Animals & Nature",
    level: "Level 1 (Ages 5-7)",
    scenes: [
      {
        text: "{userName} put on a {favoriteColor} hat. Outside, a {favoriteAnimal} wagged its tail.",
        pause: true,
        hook: "Where shall we go today?",
        microVariants: {
          text: "{userName} put on a {favoriteColor} hat. Outside, a {favoriteAnimal} wagged its tail.",
          alternatives: [
            "{userName} wore a bright {favoriteColor} cap. A friendly {favoriteAnimal} waited outside.",
            "{userName} grabbed their {favoriteColor} hat. The {favoriteAnimal} was excited to play."
          ],
          optionalDetails: ["The sun was shining bright.", "Birds sang in the trees.", "The grass smelled fresh."]
        }
      },
      {
        text: "In the garden, flowers smelled like {favoriteFood}. The {favoriteAnimal} hopped between tall stems.",
        pause: true,
        hook: "Should they chase the butterflies or water the plants?",
        microVariants: {
          text: "In the garden, flowers smelled like {favoriteFood}. The {favoriteAnimal} hopped between tall stems.",
          alternatives: [
            "The garden had flowers that reminded them of {favoriteFood}. Their {favoriteAnimal} friend jumped happily.",
            "Sweet flowers filled the air like {favoriteFood}. The {favoriteAnimal} danced through the plants."
          ],
          optionalDetails: ["Butterflies danced in the air.", "Shiny drops clung to petals.", "Bees hummed softly."]
        }
      },
      {
        text: "At the park, swings moved with the wind. {userName} laughed and jumped high.",
        pause: true,
        hook: "Should they slide down or climb the jungle gym?",
        microVariants: {
          text: "At the park, swings moved with the wind. {userName} laughed and jumped high.",
          alternatives: [
            "The park had swings that danced in the breeze. {userName} giggled with joy.",
            "Wind pushed the swings back and forth. {userName} felt so happy."
          ],
          optionalDetails: ["The wind whooshed under their feet.", "Other children played nearby.", "The sky was {favoriteColor} blue."]
        }
      },
      {
        text: "A big puddle sparkled like a mirror. Splash! {userName} and the {favoriteAnimal} jumped in.",
        pause: true,
        hook: "Should they look for a rainbow or splash again?",
        microVariants: {
          text: "A big puddle sparkled like a mirror. Splash! {userName} and the {favoriteAnimal} jumped in.",
          alternatives: [
            "They found a shiny puddle perfect for splashing. Both friends jumped together!",
            "The water looked like glass until they splashed. What fun they had!"
          ],
          optionalDetails: ["Water drops made rainbow bubbles.", "The puddle rippled like magic.", "Their clothes got wet and fun."]
        }
      },
      {
        text: "Suddenly, a rainbow stretched across the sky. The {favoriteAnimal} wagged its tail twice.",
        pause: true,
        hook: "Should they race to the rainbow or rest under a tree?",
        microVariants: {
          text: "Suddenly, a rainbow stretched across the sky. The {favoriteAnimal} wagged its tail twice.",
          alternatives: [
            "Look! A beautiful rainbow appeared above them. Their {favoriteAnimal} friend was so excited!",
            "The most amazing rainbow painted the sky. The {favoriteAnimal} knew something magical was happening."
          ],
          optionalDetails: ["The rainbow shimmered brighter.", "Colors danced like ribbons.", "Magic filled the air around them."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "They rested under a soft blanket. The rainbow faded slowly, like a lullaby. \"Tomorrow will bring new adventures,\" whispered the {favoriteAnimal}.",
        microVariants: [
          "They snuggled together as the rainbow disappeared. \"More fun tomorrow,\" said the {favoriteAnimal} softly.",
          "Under their warm blanket, they watched the colors fade. \"Sleep tight,\" said their friend."
        ]
      },
      {
        type: 'silly',
        text: "The rainbow sneezed glitter on their heads! Both laughed until their bellies hurt. \"Best adventure ever!\" {userName} said.",
        microVariants: [
          "Achoo! The rainbow sprinkled sparkles everywhere! They giggled and giggled together.",
          "The rainbow made them both sparkly and giggly. What a funny end to their day!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the rainbow's end, they found a golden ball. Together they held it high. \"Nothing can stop us!\" cheered {userName}.",
        microVariants: [
          "They discovered treasure at the rainbow's end! \"We did it together!\" they celebrated.",
          "A magical golden prize waited for them. \"We're the best team ever!\" {userName} smiled."
        ]
      },
      {
        type: 'reflective',
        text: "The rainbow faded into the clouds. {userName} smiled at the {favoriteAnimal}. \"Even when colors go, friendship stays.\"",
        microVariants: [
          "As the rainbow disappeared, they realized something important. \"Friends are better than rainbows,\" said {userName}.",
          "The colors left but their friendship remained. \"This was perfect,\" {userName} thought happily."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "{favoriteAnimal}": ["cat", "bunny", "turtle", "bird", "hamster"],
        "puddle": ["sandbox", "fountain", "stream", "pond"],
        "park": ["garden", "backyard", "playground", "forest"]
      },
      weatherVariants: ["sunny", "cloudy", "windy", "warm", "breezy"],
      settingVariants: ["morning", "afternoon", "after lunch", "before dinner"]
    }
  },

  // Template 2: Friendship & Teamwork Theme
  {
    title: "The Helper Friends",
    theme: "Friendship & Teamwork", 
    level: "Level 1 (Ages 5-7)",
    scenes: [
      {
        text: "{userName} saw a friend who looked sad. The friend had dropped their {favoriteFood}.",
        pause: true,
        hook: "What should {userName} do to help?",
        microVariants: {
          text: "{userName} saw a friend who looked sad. The friend had dropped their {favoriteFood}.",
          alternatives: [
            "{userName} noticed someone crying. Their {favoriteFood} was on the ground.",
            "A friend needed help. Their {favoriteFood} had fallen down."
          ],
          optionalDetails: ["The friend wiped their eyes.", "Other kids walked by.", "The {favoriteFood} looked tasty."]
        }
      },
      {
        text: "\"{userName} will help!\" they said with a {favoriteColor} smile. Together they picked up the {favoriteFood}.",
        pause: true,
        hook: "Where can they find more {favoriteFood}?",
        microVariants: {
          text: "\"{userName} will help!\" they said with a {favoriteColor} smile. Together they picked up the {favoriteFood}.",
          alternatives: [
            "\"Don't worry!\" {userName} said kindly. They helped clean up the mess together.",
            "\"I'll help you!\" {userName} offered. Both friends worked as a team."
          ],
          optionalDetails: ["They worked quickly.", "The friend smiled a little.", "Teamwork felt good."]
        }
      },
      {
        text: "They found a {favoriteAnimal} who knew where to get more {favoriteFood}. The {favoriteAnimal} wanted to help too!",
        pause: true,
        hook: "What will the three friends do together?",
        microVariants: {
          text: "They found a {favoriteAnimal} who knew where to get more {favoriteFood}. The {favoriteAnimal} wanted to help too!",
          alternatives: [
            "A helpful {favoriteAnimal} offered to show them where to find {favoriteFood}. Now they were three friends!",
            "Look! A {favoriteAnimal} appeared with good news about {favoriteFood}. What a helpful friend!"
          ],
          optionalDetails: ["The {favoriteAnimal} wagged happily.", "They all became fast friends.", "Helping felt wonderful."]
        }
      },
      {
        text: "All three friends shared {favoriteFood} together. They played games and told jokes about {hobbies}.",
        pause: true,
        hook: "What game should they play next?",
        microVariants: {
          text: "All three friends shared {favoriteFood} together. They played games and told jokes about {hobbies}.",
          alternatives: [
            "The three friends enjoyed {favoriteFood} and fun games. They laughed about {hobbies} together.",
            "Sharing {favoriteFood} made everything better. They played and talked about {hobbies}."
          ],
          optionalDetails: ["Everyone was happy now.", "The jokes were very funny.", "Friendship tasted sweet."]
        }
      },
      {
        text: "{userName} learned that helping friends feels good. The three friends planned to meet tomorrow.",
        pause: true,
        hook: "What adventure will they plan together?",
        microVariants: {
          text: "{userName} learned that helping friends feels good. The three friends planned to meet tomorrow.",
          alternatives: [
            "{userName} felt proud of being helpful. Tomorrow they would all play together again.",
            "Being kind made {userName} happy inside. The friends made plans for more fun."
          ],
          optionalDetails: ["They hugged goodbye.", "Tomorrow would be amazing.", "Helping friends is the best."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "They all hugged goodnight. \"Friends help friends,\" they said softly. Sweet dreams came easily to all three.",
        microVariants: [
          "Gentle hugs and sleepy smiles. \"We're the best helpers,\" they whispered.",
          "Cozy goodbyes and happy hearts. \"Helping is caring,\" they said peacefully."
        ]
      },
      {
        type: 'silly', 
        text: "They did a funny helping dance! \"Helper wiggle, helper giggle!\" The {favoriteAnimal} copied their moves!",
        microVariants: [
          "Dance time! \"Wiggle for helping, giggle for friends!\" Everyone joined the silly dance.",
          "The {favoriteAnimal} made them all laugh with funny helping moves. What a giggle fest!"
        ]
      },
      {
        type: 'triumphant',
        text: "\"We're the Super Helper Team!\" they cheered. Everyone in the neighborhood knew they could help.",
        microVariants: [
          "\"Super helpers save the day!\" They felt proud of their teamwork.",
          "\"The best helper friends ever!\" they announced to the world."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} smiled at their friends. \"Helping makes my heart feel {favoriteColor} and warm.\"",
        microVariants: [
          "\"My heart feels happy when I help,\" {userName} realized with a smile.",
          "\"Helping friends is like sunshine in my heart,\" {userName} thought peacefully."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "{favoriteFood}": ["apple", "cookie", "sandwich", "juice box", "crackers"],
        "games": ["tag", "hide and seek", "hopscotch", "catch", "puzzles"],
        "help": ["cleaning", "sharing", "fixing", "finding", "carrying"]
      },
      weatherVariants: ["sunny", "warm", "pleasant", "nice", "cheerful"],
      settingVariants: ["at school", "in the park", "at home", "outside", "in the yard"]
    }
  },

  // Template 3: Magic & Fantasy Theme
  {
    title: "The Magic Seeds",
    theme: "Magic & Fantasy",
    level: "Level 1 (Ages 5-7)",
    scenes: [
      {
        text: "{userName} found three {favoriteColor} seeds in their pocket. Where did they come from?",
        pause: true,
        hook: "Should they plant the mysterious seeds?",
        microVariants: {
          text: "{userName} found three {favoriteColor} seeds in their pocket. Where did they come from?",
          alternatives: [
            "{userName} discovered magical {favoriteColor} seeds. How did they get there?",
            "Look! Three special {favoriteColor} seeds appeared in {userName}'s pocket. So mysterious!"
          ],
          optionalDetails: ["The seeds sparkled softly.", "They felt warm to touch.", "Magic was in the air."]
        }
      },
      {
        text: "They planted one seed near their favorite {favoriteAnimal}. Suddenly, a {favoriteColor} flower grew!",
        pause: true,
        hook: "What will happen with the other two seeds?",
        microVariants: {
          text: "They planted one seed near their favorite {favoriteAnimal}. Suddenly, a {favoriteColor} flower grew!",
          alternatives: [
            "One seed went into the ground by the {favoriteAnimal}. Pop! A beautiful {favoriteColor} flower appeared!",
            "Near the {favoriteAnimal}, they planted a seed. Magic happened - a {favoriteColor} flower bloomed!"
          ],
          optionalDetails: ["The flower smelled like {favoriteFood}.", "The {favoriteAnimal} smiled.", "Sparkles danced around them."]
        }
      },
      {
        text: "The second seed grew into a tree full of {favoriteFood}! The {favoriteAnimal} was so happy.",
        pause: true,
        hook: "What magical thing will the last seed do?",
        microVariants: {
          text: "The second seed grew into a tree full of {favoriteFood}! The {favoriteAnimal} was so happy.",
          alternatives: [
            "Seed number two became a {favoriteFood} tree! Their {favoriteAnimal} friend danced with joy.",
            "The second seed made a magical {favoriteFood} tree appear. How exciting!"
          ],
          optionalDetails: ["The tree grew very tall.", "The {favoriteFood} looked delicious.", "Magic sparkled everywhere."]
        }
      },
      {
        text: "For the last seed, {userName} made a wish about {hobbies}. It granted the wish!",
        pause: true,
        hook: "What amazing wish came true?",
        microVariants: {
          text: "For the last seed, {userName} made a wish about {hobbies}. It granted the wish!",
          alternatives: [
            "{userName} whispered a {hobbies} wish to the final seed. The wish came true instantly!",
            "The third seed listened to {userName}'s {hobbies} wish. Magic made it happen!"
          ],
          optionalDetails: ["The wish was perfect.", "Dreams really do come true.", "Magic is real!"]
        }
      },
      {
        text: "{userName} and {favoriteAnimal} enjoyed their magical garden. More seeds appeared in their pocket!",
        pause: true,
        hook: "Where will they plant the new magical seeds?", 
        microVariants: {
          text: "{userName} and {favoriteAnimal} enjoyed their magical garden. More seeds appeared in their pocket!",
          alternatives: [
            "The magical garden made them both happy. Look - more seeds for tomorrow!",
            "Their special garden was perfect. New magic seeds were ready for more adventures!"
          ],
          optionalDetails: ["The garden glowed softly.", "New adventures awaited.", "Magic never ends!"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "They fell asleep under the magical tree. The {favoriteAnimal} kept the garden safe all night long.",
        microVariants: [
          "Peaceful dreams came under the magic tree. The {favoriteAnimal} watched over them lovingly.",
          "Soft sleep in their magical garden. Sweet dreams and {favoriteAnimal} cuddles all night."
        ]
      },
      {
        type: 'silly',
        text: "The magical tree started giggling! \"Hee hee hoo!\" it laughed. {userName} and {favoriteAnimal} giggled too!",
        microVariants: [
          "\"Tickle trees are the best!\" The magical tree made everyone laugh and laugh.",
          "The giggling tree made funny faces! What a silly magical garden they had!"
        ]
      },
      {
        type: 'triumphant',
        text: "\"{userName} is the best gardener ever!\" cheered the {favoriteAnimal}. Magic flowers bloomed everywhere!",
        microVariants: [
          "\"Champion magical gardener!\" the {favoriteAnimal} announced proudly. Success everywhere!",
          "\"The greatest magic garden maker!\" they celebrated together with joy."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} looked at their garden. \"Magic happens when you plant kindness,\" they realized.",
        microVariants: [
          "\"Kindness grows the best magic,\" {userName} understood while looking at their garden.",
          "\"The real magic was caring for things,\" {userName} thought with a peaceful smile."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "seeds": ["stones", "buttons", "shells", "acorns", "crystals"],
        "flower": ["mushroom", "vine", "bush", "herb", "grass"],
        "tree": ["fountain", "castle", "bridge", "tower", "cave"]
      },
      weatherVariants: ["magical", "sparkly", "glowing", "shimmery", "dreamy"],
      settingVariants: ["in the garden", "by the house", "in the forest", "by the pond", "near the fence"]
    }
  },

  // Template 4: Adventure Journeys Theme
  {
    title: "The Treasure Map",
    theme: "Adventure Journeys",
    level: "Level 1 (Ages 5-7)",
    scenes: [
      {
        text: "{userName} found an old map in a {favoriteColor} box. X marked a special spot!",
        pause: true,
        hook: "Where does the treasure map lead?",
        microVariants: {
          text: "{userName} found an old map in a {favoriteColor} box. X marked a special spot!",
          alternatives: [
            "{userName} discovered a treasure map inside a {favoriteColor} container. The X looked exciting!",
            "Look! A real treasure map was hidden in the {favoriteColor} box. Adventure time!"
          ],
          optionalDetails: ["The map looked very old.", "The X was big and bold.", "Adventure was calling!"]
        }
      },
      {
        text: "Following the map, they walked past three {favoriteColor} rocks and found a {favoriteAnimal}.",
        pause: true,
        hook: "Will the {favoriteAnimal} help find the treasure?",
        microVariants: {
          text: "Following the map, they walked past three {favoriteColor} rocks and found a {favoriteAnimal}.",
          alternatives: [
            "The map led past three big {favoriteColor} stones. There waited a friendly {favoriteAnimal}!",
            "Three {favoriteColor} rocks showed the way. A helpful {favoriteAnimal} appeared!"
          ],
          optionalDetails: ["The rocks were smooth and round.", "The {favoriteAnimal} looked wise.", "The path continued ahead."]
        }
      },
      {
        text: "\"I know where the treasure is!\" said the {favoriteAnimal}. \"Follow me to the secret place!\"",
        pause: true,
        hook: "What secret place will they discover?",
        microVariants: {
          text: "\"I know where the treasure is!\" said the {favoriteAnimal}. \"Follow me to the secret place!\"",
          alternatives: [
            "\"This way to treasure!\" the {favoriteAnimal} announced. \"I'll show you the secret spot!\"",
            "\"Come with me!\" said the {favoriteAnimal} excitedly. \"The treasure waits ahead!\""
          ],
          optionalDetails: ["The {favoriteAnimal} wagged happily.", "Excitement filled the air.", "Adventure was near!"]
        }
      },
      {
        text: "Behind a big tree, they found a chest full of {favoriteFood} and {hobbies} supplies!",
        pause: true,
        hook: "What else is hidden in the treasure chest?",
        microVariants: {
          text: "Behind a big tree, they found a chest full of {favoriteFood} and {hobbies} supplies!",
          alternatives: [
            "The secret tree hid a wonderful chest! Inside: {favoriteFood} and {hobbies} treasures!",
            "Behind the tree waited the best treasure ever - {favoriteFood} and {hobbies} goodies!"
          ],
          optionalDetails: ["The chest sparkled in the sun.", "Everything looked perfect.", "Dreams came true!"]
        }
      },
      {
        text: "{userName} and {favoriteAnimal} shared the treasure. They made a new map for tomorrow's adventure!",
        pause: true,
        hook: "What new adventure will tomorrow's map show?",
        microVariants: {
          text: "{userName} and {favoriteAnimal} shared the treasure. They made a new map for tomorrow's adventure!",
          alternatives: [
            "Sharing treasure felt wonderful. Time to draw a new map for more adventures!",
            "The best treasure was friendship. Now they could plan tomorrow's quest!"
          ],
          optionalDetails: ["They drew carefully.", "Tomorrow would be amazing.", "New treasures awaited!"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "They hid the new map safely. \"Tomorrow we'll find more treasures,\" they whispered sleepily.",
        microVariants: [
          "Safe and sound, they tucked away their map. \"More adventures in dreams,\" they said softly.",
          "The new map waited for tomorrow. \"Sweet treasure dreams,\" they wished each other."
        ]
      },
      {
        type: 'silly',
        text: "They did a treasure dance! \"Wiggle for gold, giggle for {favoriteFood}!\" The {favoriteAnimal} spun in circles!",
        microVariants: [
          "\"Treasure wiggle, treasure giggle!\" They danced around with their {favoriteAnimal} friend!",
          "The silliest treasure dance ever! The {favoriteAnimal} made everyone laugh with funny moves!"
        ]
      },
      {
        type: 'triumphant', 
        text: "\"We're the best treasure hunters ever!\" they cheered. \"No treasure can hide from us!\"",
        microVariants: [
          "\"Champion treasure finders!\" they celebrated together. \"We found everything!\"",
          "\"The greatest adventurers in the world!\" they announced with pride."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} looked at their friend. \"The real treasure was finding each other.\"",
        microVariants: [
          "\"Friendship is better than any treasure,\" {userName} realized with a warm smile.",
          "\"The best treasure is having a friend like you,\" {userName} said peacefully."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "map": ["letter", "note", "picture", "scroll", "book"],
        "rocks": ["trees", "flowers", "signs", "posts", "bushes"], 
        "chest": ["box", "bag", "basket", "jar", "pouch"]
      },
      weatherVariants: ["sunny", "bright", "clear", "perfect", "beautiful"],
      settingVariants: ["in the woods", "by the creek", "near the playground", "in the park", "by the garden"]
    }
  },

  // Template 5: Cozy Bedtime Theme
  {
    title: "The Sleepy Star",
    theme: "Cozy Bedtime",
    level: "Level 1 (Ages 5-7)",
    scenes: [
      {
        text: "{userName} saw a {favoriteColor} star yawning in the sky. \"I'm too tired to twinkle,\" it said softly.",
        pause: true,
        hook: "How can {userName} help the sleepy star?",
        microVariants: {
          text: "{userName} saw a {favoriteColor} star yawning in the sky. \"I'm too tired to twinkle,\" it said softly.",
          alternatives: [
            "A {favoriteColor} star looked very sleepy above. \"I can't twinkle anymore,\" it whispered.",
            "{userName} noticed a tired {favoriteColor} star. \"Help me shine,\" it asked gently."
          ],
          optionalDetails: ["The star dimmed and brightened.", "Other stars watched quietly.", "Night was peaceful and calm."]
        }
      },
      {
        text: "\"{userName} will help!\" They sang a {hobbies} lullaby to the star with their {favoriteAnimal}.",
        pause: true,
        hook: "Will the lullaby help the star feel better?",
        microVariants: {
          text: "\"{userName} will help!\" They sang a {hobbies} lullaby to the star with their {favoriteAnimal}.",
          alternatives: [
            "\"We'll sing for you!\" {userName} and {favoriteAnimal} made gentle {hobbies} music.",
            "\"Let us help you sleep,\" they offered, singing soft {hobbies} songs together."
          ],
          optionalDetails: ["Their voices were sweet.", "The song was peaceful.", "Love filled the air."]
        }
      },
      {
        text: "The star smiled and gave them some {favoriteColor} stardust. \"Thank you for caring,\" it whispered.",
        pause: true,
        hook: "What magical thing will the stardust do?",
        microVariants: {
          text: "The star smiled and gave them some {favoriteColor} stardust. \"Thank you for caring,\" it whispered.",
          alternatives: [
            "\"Here's a gift for your kindness,\" the star said, sprinkling {favoriteColor} stardust down.",
            "Grateful, the star shared magical {favoriteColor} dust. \"You're so thoughtful,\" it said softly."
          ],
          optionalDetails: ["Stardust sparkled gently.", "Magic filled the night.", "Kindness was rewarded."]
        }
      },
      {
        text: "The stardust made their {favoriteFood} taste like dreams. Everything felt warm and cozy.",
        pause: true,
        hook: "What other magical things will happen?",
        microVariants: {
          text: "The stardust made their {favoriteFood} taste like dreams. Everything felt warm and cozy.",
          alternatives: [
            "Their {favoriteFood} became magical and dreamy. Coziness wrapped around them like a blanket.",
            "Dream-flavored {favoriteFood} and magical warmth. Perfect comfort for the night."
          ],
          optionalDetails: ["Warmth spread through them.", "Everything felt perfect.", "Peace filled their hearts."]
        }
      },
      {
        text: "{userName} and {favoriteAnimal} tucked the star into a cloud blanket. \"Sleep well, friend.\"",
        pause: true,
        hook: "What sweet dreams will they all have?",
        microVariants: {
          text: "{userName} and {favoriteAnimal} tucked the star into a cloud blanket. \"Sleep well, friend.\"",
          alternatives: [
            "Gently, they helped the star get cozy in soft clouds. \"Good night, dear star.\"",
            "The star snuggled into fluffy cloud covers. \"Sweet dreams,\" they whispered kindly."
          ],
          optionalDetails: ["Clouds were soft and puffy.", "Stars twinkled sleepily.", "Everyone was ready for dreams."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "They all fell asleep under the starry sky. The grateful star watched over their peaceful dreams.",
        microVariants: [
          "Peaceful sleep came naturally. Their star friend kept watch all night long.",
          "Under twinkling stars they slept. Sweet dreams and gentle star light all night."
        ]
      },
      {
        type: 'silly',
        text: "The star started snoring little twinkles! \"Snore-twinkle, snore-twinkle!\" Everyone giggled softly.",
        microVariants: [
          "\"Twinkle-snores are so funny!\" they whispered, trying not to wake the silly star.",
          "The snoring star made the sweetest sounds. Gentle giggles and sleepy smiles."
        ]
      },
      {
        type: 'triumphant',
        text: "\"We helped a real star!\" they whispered proudly. \"We're the best star helpers ever!\"",
        microVariants: [
          "\"Star helpers save the night!\" they celebrated quietly with joy.",
          "\"The greatest star friends ever!\" they said with proud, sleepy smiles."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} looked up at their star friend. \"Helping others helps my heart feel happy.\"",
        microVariants: [
          "\"My heart feels full when I help,\" {userName} realized peacefully.",
          "\"Kindness makes the best bedtime feeling,\" {userName} thought with a gentle smile."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "star": ["moon", "cloud", "firefly", "night bird", "dream"],
        "lullaby": ["poem", "story", "song", "whisper", "humming"],
        "stardust": ["moonbeams", "dewdrops", "flower petals", "firefly light", "dream sparkles"]
      },
      weatherVariants: ["peaceful", "calm", "gentle", "quiet", "serene"],
      settingVariants: ["at bedtime", "in the evening", "under the stars", "by the window", "in the cozy room"]
    }
  }
];

export function getLevel1FallbackTemplate(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_1_FALLBACK_TEMPLATES.length) {
    return LEVEL_1_FALLBACK_TEMPLATES[templateIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * LEVEL_1_FALLBACK_TEMPLATES.length);
  return LEVEL_1_FALLBACK_TEMPLATES[randomIndex];
}

export function getLevel1FallbackTemplateCount(): number {
  return LEVEL_1_FALLBACK_TEMPLATES.length;
}