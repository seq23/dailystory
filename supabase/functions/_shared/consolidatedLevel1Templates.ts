// Consolidated Level 1 Templates - Ages 6-7, 1st-2nd grade reading level
// Word count: 20-40 words per scene, 6-7 scenes per template
// Combines existing base templates with extension templates converted to StoryTemplate format

export interface StoryTemplate {
  title: string;
  theme: string;
  level: string;
  scenes: StoryScene[];
  endings: AttachableEnding[];
  reuse: {
    swappableElements: Record<string, string[]>;
    weatherVariants: string[];
    settingVariants: string[];
  };
}

export interface StoryScene {
  text: string;
  pause: boolean;
  hook: string;
  microVariants: {
    text: string;
    alternatives: string[];
    optionalDetails: string[];
  };
}

export interface AttachableEnding {
  type: 'cozy' | 'silly' | 'triumphant' | 'reflective';
  text: string;
  microVariants: string[];
}

export const CONSOLIDATED_LEVEL_1_TEMPLATES: StoryTemplate[] = [
  // Template 1: Magic Hat Adventure (from extensions)
  {
    title: "The Magic Hat Discovery",
    theme: "Magic & Friendship",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} finds a magic hat in the attic.",
        pause: true,
        hook: "What will the magic hat do?",
        microVariants: {
          text: "{userName} finds a magic hat in the attic.",
          alternatives: ["{userName} discovers a magical hat hidden in the dusty attic."],
          optionalDetails: ["The hat was covered in sparkly dust.", "Old boxes surrounded the special hat.", "Sunlight made the hat shimmer."]
        }
      },
      {
        text: "The hat can make things appear and disappear.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The hat can make things appear and disappear.",
          alternatives: ["The magical hat makes objects vanish and appear again."],
          optionalDetails: ["The hat glows when it works.", "Magic sparkles dance around it.", "It makes a soft humming sound."]
        }
      },
      {
        text: "{userName} tries the hat and makes a {favoriteAnimal} appear.",
        pause: true,
        hook: "What will happen with the {favoriteAnimal}?",
        microVariants: {
          text: "{userName} tries the hat and makes a {favoriteAnimal} appear.",
          alternatives: ["{userName} puts on the hat and a {favoriteAnimal} appears magically."],
          optionalDetails: ["The {favoriteAnimal} looks very friendly.", "It has {favoriteColor} fur.", "The {favoriteAnimal} seems very happy."]
        }
      },
      {
        text: "The {favoriteAnimal} hops around and makes {userName} laugh.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The {favoriteAnimal} hops around and makes {userName} laugh.",
          alternatives: ["The playful {favoriteAnimal} jumps around, making {userName} giggle."],
          optionalDetails: ["The {favoriteAnimal} does funny tricks.", "It wags its tail happily.", "It wants to play games."]
        }
      },
      {
        text: "Now {userName} and the {favoriteAnimal} are best friends.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Now {userName} and the {favoriteAnimal} are best friends.",
          alternatives: ["{userName} and the {favoriteAnimal} become wonderful friends."],
          optionalDetails: ["They share {favoriteFood} together.", "They play in the {favoriteColor} garden.", "They have so much fun."]
        }
      },
      {
        text: "They play together every day with the magic hat.",
        pause: true,
        hook: "What magic will happen next?",
        microVariants: {
          text: "They play together every day with the magic hat.",
          alternatives: ["Every day they enjoy playing with the magical hat together."],
          optionalDetails: ["They make new animal friends.", "The magic gets stronger.", "Other kids want to join."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} keeps the magic hat safe in a special box. Every afternoon, they and their {favoriteAnimal} friend have wonderful adventures. The magic hat brings joy and friendship every single day.",
        microVariants: ["{userName} treasures the magic hat and enjoys daily adventures with their {favoriteAnimal} friend."]
      },
      {
        type: 'silly',
        text: "One day the magic hat makes too many {favoriteAnimal}s appear! {userName}'s house is full of fluffy friends eating {favoriteFood} everywhere. What a wonderfully silly mess!",
        microVariants: ["The magic hat creates a house full of {favoriteAnimal}s who love {favoriteFood} - what a fun chaos!"]
      },
      {
        type: 'triumphant',
        text: "{userName} learns to control the magic hat perfectly. They help everyone in the neighborhood by making lost pets appear and bringing happiness to all the children.",
        microVariants: ["{userName} masters the magic hat and uses it to help neighbors and bring joy to children everywhere."]
      },
      {
        type: 'reflective',
        text: "{userName} realizes the best magic isn't in the hat - it's in the friendship with their {favoriteAnimal}. True magic comes from caring and sharing with friends.",
        microVariants: ["{userName} discovers that real magic lies in friendship and caring, not in magical objects."]
      }
    ],
    reuse: {
      swappableElements: {
        "magic_items": ["hat", "wand", "book", "box", "ring"],
        "actions": ["appear", "disappear", "fly", "dance", "sing"],
        "locations": ["attic", "basement", "garden", "closet", "shed"]
      },
      weatherVariants: ["sunny morning", "rainy afternoon", "snowy day", "windy evening"],
      settingVariants: ["attic", "backyard", "playground", "bedroom"]
    }
  },
  
  // Template 2: Garden Growing (from extensions)
  {
    title: "The Beautiful Garden",
    theme: "Nature & Growth",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} plants seeds in the garden with Mom.",
        pause: true,
        hook: "What will grow from the seeds?",
        microVariants: {
          text: "{userName} plants seeds in the garden with Mom.",
          alternatives: ["{userName} and Mom plant tiny seeds in the soft dirt."],
          optionalDetails: ["The seeds are very small.", "Mom shows how to dig holes.", "The soil feels cool and soft."]
        }
      },
      {
        text: "Every day {userName} waters the seeds carefully.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Every day {userName} waters the seeds carefully.",
          alternatives: ["{userName} gives the seeds fresh water each morning."],
          optionalDetails: ["The watering can is {favoriteColor}.", "Water makes the dirt dark.", "The seeds need lots of water."]
        }
      },
      {
        text: "Soon tiny green plants start to grow.",
        pause: true,
        hook: "How big will the plants get?",
        microVariants: {
          text: "Soon tiny green plants start to grow.",
          alternatives: ["Little green shoots begin to appear from the soil."],
          optionalDetails: ["The leaves are bright green.", "They grow a little each day.", "The plants look very healthy."]
        }
      },
      {
        text: "The plants get bigger and turn {favoriteColor} each week.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The plants get bigger and turn {favoriteColor} each week.",
          alternatives: ["Each week the plants grow taller and show {favoriteColor} colors."],
          optionalDetails: ["The flowers are beautiful.", "Bees visit the plants.", "Butterflies like the flowers."]
        }
      },
      {
        text: "{userName} is proud of the beautiful flowers.",
        pause: false,
        hook: "",
        microVariants: {
          text: "{userName} is proud of the beautiful flowers.",
          alternatives: ["{userName} feels very happy about the lovely garden."],
          optionalDetails: ["The flowers smell wonderful.", "Neighbors come to see them.", "Mom is very proud too."]
        }
      },
      {
        text: "The garden becomes a special place for the whole family.",
        pause: true,
        hook: "What will grow next season?",
        microVariants: {
          text: "The garden becomes a special place for the whole family.",
          alternatives: ["The beautiful garden brings the whole family together."],
          optionalDetails: ["They eat {favoriteFood} in the garden.", "A {favoriteAnimal} visits sometimes.", "They read books outside."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every evening, {userName} and their family sit in the beautiful garden. They watch the {favoriteColor} flowers dance in the breeze while eating {favoriteFood} together. The garden is full of love and happiness.",
        microVariants: ["The family enjoys peaceful evenings in their beautiful garden, surrounded by {favoriteColor} flowers and sharing {favoriteFood}."]
      },
      {
        type: 'silly',
        text: "The flowers grow so big they reach the clouds! {userName} has to use a ladder to water them. A friendly {favoriteAnimal} helps by flying around the giant flowers. What a silly, wonderful garden!",
        microVariants: ["The flowers grow giant-sized, reaching the sky, and {userName} needs a ladder while a {favoriteAnimal} helps with the tall plants!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s garden wins first prize at the neighborhood flower show. Everyone loves the beautiful {favoriteColor} flowers. {userName} teaches other children how to grow their own gardens too.",
        microVariants: ["{userName}'s prize-winning garden inspires them to teach other children about growing beautiful flowers."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that gardens teach patience and care. Just like friendships, flowers need love and attention every day to grow strong and beautiful.",
        microVariants: ["{userName} discovers that gardens, like friendships, grow beautiful with daily love and care."]
      }
    ],
    reuse: {
      swappableElements: {
        "plants": ["flowers", "vegetables", "herbs", "sunflowers", "roses"],
        "garden_tools": ["watering can", "shovel", "rake", "gloves", "hose"],
        "garden_visitors": ["bees", "butterflies", "birds", "rabbits", "ladybugs"]
      },
      weatherVariants: ["sunny morning", "gentle rain", "warm afternoon", "cool evening"],
      settingVariants: ["backyard garden", "community garden", "school garden", "front yard"]
    }
  },

  // Template 3: Beach Adventure (from extensions)
  {
    title: "The Perfect Beach Day",
    theme: "Family & Adventure",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} goes to the beach with the family.",
        pause: true,
        hook: "What will they find at the beach?",
        microVariants: {
          text: "{userName} goes to the beach with the family.",
          alternatives: ["{userName} and their family travel to the sandy beach together."],
          optionalDetails: ["They pack a big picnic basket.", "The car ride is fun and exciting.", "Everyone is happy and excited."]
        }
      },
      {
        text: "The sand is warm between {userName}'s toes.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The sand is warm between {userName}'s toes.",
          alternatives: ["The soft, warm sand feels wonderful under {userName}'s feet."],
          optionalDetails: ["The sand is {favoriteColor} in the sunlight.", "Seashells are scattered everywhere.", "The ocean waves make peaceful sounds."]
        }
      },
      {
        text: "{userName} builds a tall {favoriteColor} castle with shells.",
        pause: true,
        hook: "Will the castle stay safe?",
        microVariants: {
          text: "{userName} builds a tall {favoriteColor} castle with shells.",
          alternatives: ["{userName} creates a magnificent sand castle decorated with pretty shells."],
          optionalDetails: ["The shells sparkle in the sun.", "Dad helps make it even taller.", "It has towers and walls."]
        }
      },
      {
        text: "The waves come close but don't wash it away.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The waves come close but don't wash it away.",
          alternatives: ["The ocean waves dance nearby but leave the castle standing."],
          optionalDetails: ["The waves are just the right size.", "Water makes pretty patterns.", "The castle is built perfectly."]
        }
      },
      {
        text: "{userName} finds beautiful shells and smooth rocks.",
        pause: false,
        hook: "",
        microVariants: {
          text: "{userName} finds beautiful shells and smooth rocks.",
          alternatives: ["{userName} discovers lovely shells and perfectly smooth stones."],
          optionalDetails: ["Some shells are {favoriteColor}.", "The rocks feel cool and smooth.", "Each treasure is special."]
        }
      },
      {
        text: "The family shares {favoriteFood} while watching the sunset.",
        pause: true,
        hook: "What adventure awaits tomorrow?",
        microVariants: {
          text: "The family shares {favoriteFood} while watching the sunset.",
          alternatives: ["Everyone enjoys {favoriteFood} together as the sun sets over the ocean."],
          optionalDetails: ["The sky turns beautiful colors.", "A {favoriteAnimal} walks by.", "The beach feels magical."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "As stars begin to twinkle, {userName} snuggles with their family on the warm sand. They listen to gentle waves and feel grateful for this perfect beach day filled with love and beautiful memories.",
        microVariants: ["Under the twinkling stars, {userName} enjoys a cozy moment with family, listening to waves and treasuring perfect beach memories."]
      },
      {
        type: 'silly',
        text: "A friendly {favoriteAnimal} steals their {favoriteFood} and runs along the beach! {userName} and the family chase it, laughing as the silly animal leads them on a fun adventure. What a goofy beach day!",
        microVariants: ["A playful {favoriteAnimal} steals their {favoriteFood}, leading the laughing family on a silly beach chase adventure!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s sand castle becomes famous! Other families come to admire it and ask for building tips. {userName} proudly teaches everyone how to make amazing sand castles.",
        microVariants: ["{userName}'s impressive sand castle attracts admiring families, and they proudly share their building expertise with everyone."]
      },
      {
        type: 'reflective',
        text: "{userName} realizes that the best treasures aren't the shells or rocks, but the special time spent with family. Happy memories are the most precious treasures of all.",
        microVariants: ["{userName} understands that family time and happy memories are life's most precious treasures, not shells or rocks."]
      }
    ],
    reuse: {
      swappableElements: {
        "beach_activities": ["building castles", "collecting shells", "swimming", "flying kites", "digging holes"],
        "ocean_treasures": ["shells", "rocks", "sea glass", "driftwood", "starfish"],
        "beach_weather": ["sunny", "breezy", "warm", "perfect", "beautiful"]
      },
      weatherVariants: ["sunny morning", "perfect afternoon", "golden sunset", "starry evening"],
      settingVariants: ["sandy beach", "rocky shore", "quiet cove", "busy boardwalk"]
    }
  },

  // Template 4: Learning to Ride (from extensions)
  {
    title: "The Big Bike Adventure",
    theme: "Learning & Achievement",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} learns to ride a bike today.",
        pause: true,
        hook: "Will {userName} be able to ride?",
        microVariants: {
          text: "{userName} learns to ride a bike today.",
          alternatives: ["{userName} is ready to learn bicycle riding today."],
          optionalDetails: ["The bike is {favoriteColor} and shiny.", "Dad puts on {userName}'s helmet.", "The training wheels come off."]
        }
      },
      {
        text: "Dad holds the back while {userName} pedals.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Dad holds the back while {userName} pedals.",
          alternatives: ["Dad keeps the bike steady as {userName} starts pedaling."],
          optionalDetails: ["Dad runs alongside the bike.", "His hands keep {userName} safe.", "The pedals feel smooth."]
        }
      },
      {
        text: "Slowly Dad lets go and {userName} keeps going.",
        pause: true,
        hook: "What will happen next?",
        microVariants: {
          text: "Slowly Dad lets go and {userName} keeps going.",
          alternatives: ["Dad carefully releases his grip, and {userName} continues riding."],
          optionalDetails: ["{userName} doesn't even notice at first.", "The bike stays balanced perfectly.", "Dad cheers from behind."]
        }
      },
      {
        text: "{userName} rides all the way down the street.",
        pause: false,
        hook: "",
        microVariants: {
          text: "{userName} rides all the way down the street.",
          alternatives: ["{userName} pedals successfully down the entire street."],
          optionalDetails: ["Neighbors come out to watch.", "The {favoriteColor} bike goes fast.", "Wind blows through {userName}'s hair."]
        }
      },
      {
        text: "Everyone cheers for {userName}'s success.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Everyone cheers for {userName}'s success.",
          alternatives: ["The whole family celebrates {userName}'s amazing accomplishment."],
          optionalDetails: ["Mom claps her hands happily.", "Dad gives a big thumbs up.", "A {favoriteAnimal} barks with excitement."]
        }
      },
      {
        text: "{userName} feels proud and wants to ride more.",
        pause: true,
        hook: "Where will {userName} ride next?",
        microVariants: {
          text: "{userName} feels proud and wants to ride more.",
          alternatives: ["{userName} beams with pride and eager to continue riding."],
          optionalDetails: ["The bike feels like flying.", "Riding is so much fun.", "Tomorrow will bring new adventures."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every evening after dinner, {userName} rides their {favoriteColor} bike around the neighborhood. The gentle breeze and proud feeling make each ride a peaceful, happy adventure.",
        microVariants: ["Each evening, {userName} enjoys peaceful bike rides around the neighborhood, feeling proud and happy with the gentle breeze."]
      },
      {
        type: 'silly',
        text: "The bike goes so fast it starts flying! {userName} rides through the clouds with a {favoriteAnimal} sitting in the basket. They fly to the moon and back for {favoriteFood}! What a silly adventure!",
        microVariants: ["The bike magically flies through clouds with a {favoriteAnimal} passenger, soaring to the moon for {favoriteFood} in a wonderfully silly adventure!"]
      },
      {
        type: 'triumphant',
        text: "{userName} becomes the best bike rider in the neighborhood. They teach other children how to ride and lead fun bike parades down the street every weekend.",
        microVariants: ["{userName} becomes the neighborhood's expert bike rider, teaching others and organizing joyful weekend bike parades."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that trying new things can be scary at first, but with practice and family support, anything is possible. Courage and determination make dreams come true.",
        microVariants: ["{userName} discovers that courage, practice, and family support can make any scary challenge become an achievable dream."]
      }
    ],
    reuse: {
      swappableElements: {
        "learning_activities": ["riding bikes", "swimming", "skating", "climbing", "jumping"],
        "support_people": ["Dad", "Mom", "Grandpa", "sister", "brother"],
        "celebration_actions": ["cheering", "clapping", "hugging", "high-fiving", "smiling"]
      },
      weatherVariants: ["perfect morning", "sunny afternoon", "cool evening", "gentle breeze"],
      settingVariants: ["neighborhood street", "park path", "quiet road", "bike trail"]
    }
  },

  // Template 5: Helping Lost Animal (from extensions)
  {
    title: "The Kind Helper",
    theme: "Kindness & Helping",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} finds a lost {favoriteAnimal} in the park.",
        pause: true,
        hook: "How will {userName} help?",
        microVariants: {
          text: "{userName} finds a lost {favoriteAnimal} in the park.",
          alternatives: ["{userName} discovers a small, lost {favoriteAnimal} in the neighborhood park."],
          optionalDetails: ["The {favoriteAnimal} looks very scared.", "It's hiding under a {favoriteColor} bush.", "No owner is anywhere nearby."]
        }
      },
      {
        text: "The {favoriteAnimal} is small and looks very scared.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The {favoriteAnimal} is small and looks very scared.",
          alternatives: ["The little {favoriteAnimal} appears frightened and alone."],
          optionalDetails: ["It shivers a little bit.", "Its eyes look worried.", "It stays very still."]
        }
      },
      {
        text: "{userName} gives the {favoriteAnimal} some {favoriteFood} and water.",
        pause: true,
        hook: "Will the {favoriteAnimal} feel better?",
        microVariants: {
          text: "{userName} gives the {favoriteAnimal} some {favoriteFood} and water.",
          alternatives: ["{userName} gently offers {favoriteFood} and fresh water to the hungry animal."],
          optionalDetails: ["The {favoriteAnimal} eats very carefully.", "It drinks the water slowly.", "Its tail starts to wag a little."]
        }
      },
      {
        text: "They put up signs to find the {favoriteAnimal}'s home.",
        pause: false,
        hook: "",
        microVariants: {
          text: "They put up signs to find the {favoriteAnimal}'s home.",
          alternatives: ["{userName} and their family create signs to help find the animal's family."],
          optionalDetails: ["The signs are {favoriteColor} and bright.", "They put pictures on the signs.", "Mom helps tape them up."]
        }
      },
      {
        text: "The owner comes and thanks {userName} for being kind.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The owner comes and thanks {userName} for being kind.",
          alternatives: ["The grateful owner arrives and appreciates {userName}'s wonderful kindness."],
          optionalDetails: ["The owner was very worried.", "The {favoriteAnimal} runs to them happily.", "Everyone smiles with relief."]
        }
      },
      {
        text: "{userName} feels happy about helping someone in need.",
        pause: true,
        hook: "Who else needs help?",
        microVariants: {
          text: "{userName} feels happy about helping someone in need.",
          alternatives: ["{userName} experiences the joy that comes from helping others."],
          optionalDetails: ["Helping feels really good.", "The {favoriteAnimal} looks so happy.", "Mom and Dad are very proud."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Now {userName} always keeps {favoriteFood} in their backpack when visiting the park. They became known as the helpful friend who cares for all the animals and people in the neighborhood.",
        microVariants: ["{userName} becomes the neighborhood's caring helper, always ready with {favoriteFood} and kindness for animals and people."]
      },
      {
        type: 'silly',
        text: "So many lost animals come to {userName} for help that their house becomes a funny animal hotel! Dogs, cats, and even a {favoriteAnimal} have sleepovers while waiting for their families. What a silly, wonderful place!",
        microVariants: ["{userName}'s house becomes a hilarious animal hotel with dogs, cats, and {favoriteAnimal}s having sleepovers while awaiting their families!"]
      },
      {
        type: 'triumphant',
        text: "{userName} starts an official animal helping club at school. They teach other children how to care for lost pets and help dozens of animals find their way home safely.",
        microVariants: ["{userName} creates a school animal helping club, teaching children to care for lost pets and helping dozens find their homes."]
      },
      {
        type: 'reflective',
        text: "{userName} realizes that even small acts of kindness make a big difference. Taking care of others - both animals and people - makes the whole world a better, happier place.",
        microVariants: ["{userName} learns that small acts of kindness create big differences, making the world better and happier for everyone."]
      }
    ],
    reuse: {
      swappableElements: {
        "helpful_actions": ["feeding", "giving water", "making signs", "calling owners", "providing shelter"],
        "lost_things": ["animals", "toys", "books", "keys", "bikes"],
        "kind_feelings": ["happy", "proud", "caring", "helpful", "loving"]
      },
      weatherVariants: ["sunny morning", "quiet afternoon", "gentle evening", "perfect day"],
      settingVariants: ["neighborhood park", "street corner", "school playground", "community center"]
    }
  }
];