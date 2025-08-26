/**
 * Extended Level 1 Templates - Ages 5-7
 * 5 templates × 6-7 scenes each = 30-35 pages
 * 20-40 words per scene, 2-3 sentences
 */

export const EXTENDED_LEVEL1_TEMPLATES = [
  // Template 1: Friendship & Kindness Theme (Extended to 6 scenes)
  {
    title: "Helping a Friend",
    theme: "Friendship & Kindness",
    level: "Level 1 (Ages 5-7)",
    scenes: [
      {
        text: "{userName} saw a friend who looked sad. The friend had dropped their {favoriteFood}.",
        pause: true,
        hook: "How can {userName} help their sad friend?",
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
        text: "{userName} and their friend went to the store. They found more {favoriteFood}!",
        pause: true,
        hook: "What will they do with the extra {favoriteFood}?",
        microVariants: {
          text: "{userName} and their friend went to the store. They found more {favoriteFood}!",
          alternatives: [
            "At the store, they bought new {favoriteFood}. Success!",
            "The store had lots of {favoriteFood}. Perfect!"
          ],
          optionalDetails: ["The store was friendly.", "They had enough money.", "Sharing felt good."]
        }
      },
      {
        text: "They shared the {favoriteFood} with everyone. All friends smiled big smiles!",
        pause: true,
        hook: "How will they celebrate their kindness?",
        microVariants: {
          text: "They shared the {favoriteFood} with everyone. All friends smiled big smiles!",
          alternatives: [
            "Everyone got some {favoriteFood}. Happy faces everywhere!",
            "Sharing made everyone cheerful. Such good friends!"
          ],
          optionalDetails: ["Everyone said thank you.", "Happiness filled the air.", "Kindness spread around."]
        }
      },
      {
        text: "{userName} and friends played together. The {favoriteAnimal} joined the fun too!",
        pause: true,
        hook: "What game will they play next?",
        microVariants: {
          text: "{userName} and friends played together. The {favoriteAnimal} joined the fun too!",
          alternatives: [
            "Fun games with friends and the {favoriteAnimal}. Joy everywhere!",
            "Playing together made the day special. The {favoriteAnimal} loved it!"
          ],
          optionalDetails: ["Laughter filled the air.", "Everyone played nicely.", "The {favoriteAnimal} wagged happily."]
        }
      },
      {
        text: "Time for lunch! They ate {favoriteFood} together in the sunshine.",
        pause: false,
        hook: "What a perfect day with friends!",
        microVariants: {
          text: "Time for lunch! They ate {favoriteFood} together in the sunshine.",
          alternatives: [
            "Lunch time was special with {favoriteFood} and friends.",
            "Sharing {favoriteFood} in the warm sun felt perfect."
          ],
          optionalDetails: ["The sun was warm.", "Birds sang songs.", "Friendship felt wonderful."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "They all hugged goodnight. \"Friends help friends,\" they said softly. Sweet dreams came easily to all three.",
        microVariants: [
          "Gentle hugs and sleepy smiles. \"We're the best helpers,\" they whispered."
        ]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} tried to give hugs too! Everyone giggled as furry paws tickled their faces.",
        microVariants: [
          "Tickle hugs from the {favoriteAnimal} made everyone laugh until their tummies hurt!"
        ]
      },
      {
        type: 'triumphant',
        text: "\"We're the kindness team!\" they cheered. Their helping made the whole day shine bright!",
        microVariants: [
          "Victory hugs all around! \"Helping friends is our superpower!\" they announced proudly."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} felt warm inside. \"Helping others feels really good,\" they thought with a smile.",
        microVariants: [
          "A peaceful feeling filled {userName}'s heart. \"Kindness makes everything better,\" they realized."
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

  // Template 2: Magic & Fantasy Theme (Extended to 6 scenes)
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
        text: "The second seed made a magic tree! It grew {favoriteFood} for everyone.",
        pause: true,
        hook: "What amazing thing will the third seed do?",
        microVariants: {
          text: "The second seed made a magic tree! It grew {favoriteFood} for everyone.",
          alternatives: [
            "Seed two became a wonderful tree with lots of {favoriteFood}!",
            "The magic tree had {favoriteFood} hanging like ornaments!"
          ],
          optionalDetails: ["The tree sparkled.", "Birds came to visit.", "Sweet smells filled the air."]
        }
      },
      {
        text: "The third seed created a {favoriteColor} rainbow! It touched the sky.",
        pause: true,
        hook: "Where will the rainbow lead them?",
        microVariants: {
          text: "The third seed created a {favoriteColor} rainbow! It touched the sky.",
          alternatives: [
            "Up went a beautiful {favoriteColor} rainbow from the last seed!",
            "The final seed painted a {favoriteColor} rainbow across the sky!"
          ],
          optionalDetails: ["Colors danced everywhere.", "The rainbow hummed softly.", "Magic filled the world."]
        }
      },
      {
        text: "{userName} and {favoriteAnimal} walked on the rainbow bridge. What adventure awaited?",
        pause: true,
        hook: "What magical place will they discover?",
        microVariants: {
          text: "{userName} and {favoriteAnimal} walked on the rainbow bridge. What adventure awaited?",
          alternatives: [
            "Step by step, they climbed the rainbow path to adventure!",
            "The rainbow became a bridge to somewhere magical!"
          ],
          optionalDetails: ["Clouds felt soft.", "Stars winked at them.", "Wonder filled their hearts."]
        }
      },
      {
        text: "They found a cloud castle with {favoriteColor} towers. A fairy welcomed them!",
        pause: false,
        hook: "What gifts will the fairy share with them?",
        microVariants: {
          text: "They found a cloud castle with {favoriteColor} towers. A fairy welcomed them!",
          alternatives: [
            "A magical castle made of clouds had {favoriteColor} flags flying!",
            "In the sky, a castle waited with a kind fairy friend!"
          ],
          optionalDetails: ["The fairy sparkled.", "Castle bells rang sweetly.", "Dreams came true here."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "\"{userName} is the best gardener ever!\" cheered the {favoriteAnimal}. Magic flowers bloomed everywhere!",
        microVariants: [
          "\"Champion magical gardener!\" the {favoriteAnimal} announced proudly. Success everywhere!"
        ]
      },
      {
        type: 'cozy',
        text: "Back home, {userName} fell asleep holding a magic flower. Dreams of rainbows filled the night.",
        microVariants: [
          "Peaceful dreams came with the fairy's blessing. Magic seeds, magic dreams."
        ]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} tried to eat the {favoriteFood} tree! \"Too much magic!\" they laughed together.",
        microVariants: [
          "Giggles filled the air as the {favoriteAnimal} got tangled in magical vines!"
        ]
      },
      {
        type: 'reflective',
        text: "{userName} learned that small things can make big magic. Even tiny seeds have big dreams.",
        microVariants: [
          "\"Magic lives in everything small,\" {userName} realized with wonder and joy."
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

  // Template 3: Adventure Journeys Theme (Extended to 6 scenes)
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
            "{userName} discovered a treasure map in a {favoriteColor} chest. The X looked exciting!",
            "Look! A map with an X was hidden in a {favoriteColor} container!"
          ],
          optionalDetails: ["The map was very old.", "The X sparkled a little.", "Adventure was calling!"]
        }
      },
      {
        text: "{userName} packed {favoriteFood} for the journey. The {favoriteAnimal} wanted to help!",
        pause: true,
        hook: "What will they need for the adventure?",
        microVariants: {
          text: "{userName} packed {favoriteFood} for the journey. The {favoriteAnimal} wanted to help!",
          alternatives: [
            "Adventure snacks of {favoriteFood} went into the bag. The {favoriteAnimal} was ready!",
            "With {favoriteFood} packed, they were set. The {favoriteAnimal} jumped with excitement!"
          ],
          optionalDetails: ["The bag felt heavy.", "The {favoriteAnimal} wagged happily.", "Excitement filled the air."]
        }
      },
      {
        text: "They walked through the sunny park. The map led to a big tree!",
        pause: true,
        hook: "What treasure waits by the tree?",
        microVariants: {
          text: "They walked through the sunny park. The map led to a big tree!",
          alternatives: [
            "Step by step through the park, following the map to a giant tree!",
            "The treasure map pointed to the biggest tree in the whole park!"
          ],
          optionalDetails: ["Birds sang above.", "Flowers bloomed nearby.", "The tree was very old."]
        }
      },
      {
        text: "Under the tree was a {favoriteColor} rock. They moved it together!",
        pause: true,
        hook: "What surprise hides under the rock?",
        microVariants: {
          text: "Under the tree was a {favoriteColor} rock. They moved it together!",
          alternatives: [
            "A special {favoriteColor} stone waited. Working together, they lifted it!",
            "The {favoriteColor} rock looked important. Teamwork made it move!"
          ],
          optionalDetails: ["The rock was smooth.", "It felt warm to touch.", "Something was underneath!"]
        }
      },
      {
        text: "A small door appeared! It led to a cozy underground room.",
        pause: true,
        hook: "What treasures fill the secret room?",
        microVariants: {
          text: "A small door appeared! It led to a cozy underground room.",
          alternatives: [
            "Magic! A tiny door opened to show a secret room below!",
            "The hidden door revealed a warm, welcoming space underground!"
          ],
          optionalDetails: ["Light glowed softly inside.", "It smelled like cookies.", "Wonder filled their hearts."]
        }
      },
      {
        text: "Inside were books, toys, and more {favoriteFood}! The best treasure room ever!",
        pause: false,
        hook: "What will they do with their amazing discovery?",
        microVariants: {
          text: "Inside were books, toys, and more {favoriteFood}! The best treasure room ever!",
          alternatives: [
            "Books, games, and endless {favoriteFood} filled the magical space!",
            "Every favorite thing was there - books, toys, and plenty of {favoriteFood}!"
          ],
          optionalDetails: ["Everything sparkled.", "The {favoriteAnimal} explored excitedly.", "Dreams came true here."]
        }
      }
    ],
    endings: [
      {
        type: 'silly',
        text: "The treasure was a box of {favoriteFood}! \"Best treasure ever!\" {userName} laughed. The {favoriteAnimal} agreed completely!",
        microVariants: [
          "\"Food treasure is the best treasure!\" they giggled together while sharing {favoriteFood}."
        ]
      },
      {
        type: 'cozy',
        text: "They made the secret room their special reading place. Stories and snacks together forever!",
        microVariants: [
          "The underground room became their cozy hideaway for books and {favoriteFood}."
        ]
      },
      {
        type: 'triumphant',
        text: "\"We're the best treasure hunters!\" they cheered. Adventure made them brave and smart!",
        microVariants: [
          "Victory dance in the secret room! \"Greatest adventurers ever!\" they celebrated."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} learned that the best treasures are shared with friends. The {favoriteAnimal} purred in agreement.",
        microVariants: [
          "\"Sharing treasure makes it more special,\" {userName} realized with a warm smile."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "map": ["scroll", "picture", "drawing", "guide", "chart"],
        "treasure": ["prize", "gift", "surprise", "secret", "find"],
        "journey": ["walk", "adventure", "trip", "exploration", "quest"]
      },
      weatherVariants: ["adventurous", "exciting", "perfect", "wonderful", "amazing"],
      settingVariants: ["in the yard", "at the park", "in the woods", "by the creek", "near the house"]
    }
  },

  // Template 4: School & Everyday Life Theme (Extended to 6 scenes)
  {
    title: "The Special Show and Tell",
    theme: "School & Everyday Life",
    level: "Level 1 (Ages 5-7)",
    scenes: [
      {
        text: "{userName} needed something special for show and tell. Their {favoriteAnimal} pet had a {favoriteColor} collar.",
        pause: true,
        hook: "What special trick will they share?",
        microVariants: {
          text: "{userName} needed something special for show and tell. Their {favoriteAnimal} pet had a {favoriteColor} collar.",
          alternatives: [
            "{userName} wanted to wow everyone at show and tell. Their {favoriteAnimal} wore a pretty {favoriteColor} collar.",
            "For show and tell, {userName} had an idea! Their {favoriteAnimal} friend had a {favoriteColor} collar."
          ],
          optionalDetails: ["The collar had a little bell.", "The {favoriteAnimal} was very smart.", "Everyone would be impressed."]
        }
      },
      {
        text: "At school, {userName} felt nervous. But the {favoriteAnimal} gave gentle kisses for courage!",
        pause: true,
        hook: "How will the presentation begin?",
        microVariants: {
          text: "At school, {userName} felt nervous. But the {favoriteAnimal} gave gentle kisses for courage!",
          alternatives: [
            "School time made {userName} worry. The {favoriteAnimal} nuzzled them with love!",
            "Butterflies in the tummy! The {favoriteAnimal} shared calm, happy energy."
          ],
          optionalDetails: ["Friends smiled at them.", "The teacher was kind.", "The {favoriteAnimal} stayed close."]
        }
      },
      {
        text: "\"This is my best friend!\" {userName} said proudly. The {favoriteAnimal} did a trick!",
        pause: true,
        hook: "What amazing trick will everyone see?",
        microVariants: {
          text: "\"This is my best friend!\" {userName} said proudly. The {favoriteAnimal} did a trick!",
          alternatives: [
            "With pride, {userName} introduced their pal. Amazing tricks followed!",
            "\"Meet my special friend!\" The {favoriteAnimal} showed off perfectly!"
          ],
          optionalDetails: ["Everyone watched closely.", "The trick was perfect.", "Applause filled the room."]
        }
      },
      {
        text: "The class cheered! Everyone wanted to pet the gentle {favoriteAnimal}.",
        pause: true,
        hook: "How will they share their pet safely?",
        microVariants: {
          text: "The class cheered! Everyone wanted to pet the gentle {favoriteAnimal}.",
          alternatives: [
            "Hooray from the class! The sweet {favoriteAnimal} made everyone happy!",
            "Excited friends gathered around. The {favoriteAnimal} was so friendly!"
          ],
          optionalDetails: ["Hands raised everywhere.", "The {favoriteAnimal} wagged happily.", "Joy filled the classroom."]
        }
      },
      {
        text: "{userName} showed friends how to be gentle. The {favoriteAnimal} loved all the attention!",
        pause: true,
        hook: "What lesson will everyone learn?",
        microVariants: {
          text: "{userName} showed friends how to be gentle. The {favoriteAnimal} loved all the attention!",
          alternatives: [
            "Teaching kindness to animals, {userName} helped everyone learn. So much love!",
            "Gentle touches and soft voices. The {favoriteAnimal} purred with happiness!"
          ],
          optionalDetails: ["Everyone learned quickly.", "The {favoriteAnimal} trusted them.", "Hearts were full of love."]
        }
      },
      {
        text: "Story time with the {favoriteAnimal}! Everyone sat in a cozy circle together.",
        pause: false,
        hook: "What perfect ending to show and tell day!",
        microVariants: {
          text: "Story time with the {favoriteAnimal}! Everyone sat in a cozy circle together.",
          alternatives: [
            "Reading together made the day perfect. The {favoriteAnimal} listened too!",
            "Circle time was magical with their furry friend joining the stories!"
          ],
          optionalDetails: ["The story was wonderful.", "Everyone felt happy.", "The {favoriteAnimal} was the star."]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "{userName} learned that being yourself is the best show and tell of all. The {favoriteAnimal} purred with agreement.",
        microVariants: [
          "\"Being real is the best thing to share,\" {userName} realized. The {favoriteAnimal} agreed warmly."
        ]
      },
      {
        type: 'cozy',
        text: "At home, {userName} and the {favoriteAnimal} snuggled. \"We're a great team,\" they whispered.",
        microVariants: [
          "Cozy cuddles at home. \"Best partners ever,\" {userName} said with sleepy happiness."
        ]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} tried to do homework! Paws on pencils made everyone giggle all evening.",
        microVariants: [
          "Homework help from furry paws created the funniest scribbles and lots of laughter!"
        ]
      },
      {
        type: 'triumphant',
        text: "\"We're the best show and tell team ever!\" {userName} cheered. Success felt wonderful!",
        microVariants: [
          "Champion presentation team! \"We did amazing together!\" they celebrated with pride."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "show and tell": ["sharing time", "presentation", "story time", "circle time", "class sharing"],
        "classroom": ["circle", "group", "friends", "class", "everyone"],
        "teacher": ["teacher", "grown-up", "adult", "helper", "guide"]
      },
      weatherVariants: ["school day", "learning time", "sharing time", "friend time", "happy time"],
      settingVariants: ["at school", "in class", "with friends", "in the circle", "during sharing"]
    }
  },

  // Template 5: Animals & Nature Theme (Extended to 7 scenes)
  {
    title: "The Lost {favoriteAnimal}",
    theme: "Animals & Nature",
    level: "Level 1 (Ages 5-7)",
    scenes: [
      {
        text: "{userName} heard a small cry in the garden. A baby {favoriteAnimal} was lost!",
        pause: true,
        hook: "How can {userName} help the lost baby?",
        microVariants: {
          text: "{userName} heard a small cry in the garden. A baby {favoriteAnimal} was lost!",
          alternatives: [
            "Soft cries came from the flowers. A tiny {favoriteAnimal} needed help!",
            "In the garden, {userName} found a scared little {favoriteAnimal} all alone!"
          ],
          optionalDetails: ["The cry was very soft.", "The baby looked scared.", "Help was needed right away."]
        }
      },
      {
        text: "\"Don't worry, little one,\" {userName} said gently. They offered some {favoriteFood}.",
        pause: true,
        hook: "Will the baby {favoriteAnimal} trust {userName}?",
        microVariants: {
          text: "\"Don't worry, little one,\" {userName} said gently. They offered some {favoriteFood}.",
          alternatives: [
            "Kind words and {favoriteFood} showed the baby {favoriteAnimal} it was safe.",
            "\"I'll help you,\" {userName} promised, sharing {favoriteFood} with love."
          ],
          optionalDetails: ["The baby sniffed carefully.", "Trust grew slowly.", "Kindness filled the air."]
        }
      },
      {
        text: "The baby {favoriteAnimal} ate a little {favoriteFood}. It felt safer now!",
        pause: true,
        hook: "Where could the mama {favoriteAnimal} be?",
        microVariants: {
          text: "The baby {favoriteAnimal} ate a little {favoriteFood}. It felt safer now!",
          alternatives: [
            "Tiny bites of {favoriteFood} helped. The {favoriteAnimal} began to trust!",
            "Food and kindness worked magic. The baby felt less afraid!"
          ],
          optionalDetails: ["The eating was careful.", "Eyes looked less scared.", "Hope grew stronger."]
        }
      },
      {
        text: "Together they searched the garden. Under a {favoriteColor} bush, they heard another cry!",
        pause: true,
        hook: "What will they find under the bush?",
        microVariants: {
          text: "Together they searched the garden. Under a {favoriteColor} bush, they heard another cry!",
          alternatives: [
            "Exploring every corner, they listened. The {favoriteColor} bush held a secret!",
            "Step by step through the garden until sounds from the {favoriteColor} bushes!"
          ],
          optionalDetails: ["The bush rustled softly.", "More cries were heard.", "Family was close by."]
        }
      },
      {
        text: "Mama {favoriteAnimal} was there with more babies! The family was reunited!",
        pause: true,
        hook: "How will they celebrate being together again?",
        microVariants: {
          text: "Mama {favoriteAnimal} was there with more babies! The family was reunited!",
          alternatives: [
            "The whole {favoriteAnimal} family was found! Happy reunions all around!",
            "Mama and siblings welcomed the lost baby back with joy and nuzzles!"
          ],
          optionalDetails: ["Happy squeaks filled the air.", "The family cuddled close.", "Love was everywhere."]
        }
      },
      {
        text: "{userName} built a safe shelter with {favoriteColor} blankets. The family felt cozy and warm!",
        pause: true,
        hook: "What thoughtful care will {userName} provide?",
        microVariants: {
          text: "{userName} built a safe shelter with {favoriteColor} blankets. The family felt cozy and warm!",
          alternatives: [
            "Soft {favoriteColor} blankets made the perfect home. Everyone was comfortable!",
            "A cozy nest from {favoriteColor} fabric kept the {favoriteAnimal} family safe!"
          ],
          optionalDetails: ["The blankets were soft.", "Everyone snuggled together.", "Safety felt wonderful."]
        }
      },
      {
        text: "Every day, {userName} visited with {favoriteFood}. The {favoriteAnimal} family grew strong and happy!",
        pause: false,
        hook: "What beautiful friendship has grown!",
        microVariants: {
          text: "Every day, {userName} visited with {favoriteFood}. The {favoriteAnimal} family grew strong and happy!",
          alternatives: [
            "Daily visits with {favoriteFood} helped the family thrive and grow!",
            "Regular care and {favoriteFood} made the {favoriteAnimal} family healthy and joyful!"
          ],
          optionalDetails: ["The babies grew bigger.", "Trust became love.", "Friendship bloomed forever."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} fell asleep watching the {favoriteAnimal} family. Dreams of caring for others filled the night.",
        microVariants: [
          "Peaceful sleep came while watching over friends. Dreams of kindness and care."
        ]
      },
      {
        type: 'triumphant',
        text: "\"I'm the best animal helper!\" {userName} cheered. Saving the family felt amazing!",
        microVariants: [
          "Hero of the garden! \"Greatest animal rescuer ever!\" they celebrated with pride."
        ]
      },
      {
        type: 'silly',
        text: "The baby {favoriteAnimal} tried to share its {favoriteFood} with {userName}! Tiny paws everywhere!",
        microVariants: [
          "Food sharing went hilariously wrong when little paws made the biggest mess!"
        ]
      },
      {
        type: 'reflective',
        text: "{userName} learned that caring for others makes your heart grow bigger. Love multiplies when shared.",
        microVariants: [
          "\"Helping others makes me feel bigger inside,\" {userName} realized with a full heart."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "garden": ["yard", "park", "forest", "field", "meadow"],
        "shelter": ["home", "nest", "den", "house", "safe place"],
        "care": ["help", "love", "kindness", "protection", "comfort"]
      },
      weatherVariants: ["garden day", "rescue time", "caring moment", "helper day", "loving afternoon"],
      settingVariants: ["in the garden", "by the flowers", "under the trees", "in the yard", "among the plants"]
    }
  }
];