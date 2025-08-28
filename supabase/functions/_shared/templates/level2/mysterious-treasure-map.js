// Level 2 Template: Mysterious Treasure Map
export const template = {
  title: "The Mysterious Treasure Map",
  theme: "Adventure & Discovery",
  level: "Level 2",
  scenes: [
    {
      text: "One day, {userName} was thinking about adventure, and that's when the old treasure map appeared in Grandpa's desk drawer.",
      pause: true,
      hook: "What secrets does the treasure map hold?",
      microVariants: {
        text: "One day, {userName} was thinking about adventure, and that's when the old treasure map appeared in Grandpa's desk drawer.",
        alternatives: ["While searching for adventure stories, {userName} discovered an ancient treasure map hidden in Grandpa's old wooden desk."],
        optionalDetails: ["The map was yellowed with age and had mysterious symbols.", "Grandpa's desk smelled like old books and adventures.", "The drawer creaked when {userName} opened it slowly."]
      }
    },
    {
      text: "So {userName} followed the path through the neighborhood park with careful attention to every detail marked on the weathered paper.",
      pause: false,
      hook: "",
      microVariants: {
        text: "So {userName} followed the path through the neighborhood park with careful attention to every detail marked on the weathered paper.",
        alternatives: ["{userName} carefully studied each marking on the old map while walking through the familiar neighborhood park paths."],
        optionalDetails: ["The map showed trees, rocks, and hidden pathways.", "Other children were playing nearby but didn't notice the treasure hunt.", "The afternoon sun made perfect shadows that matched the map."]
      }
    },
    {
      text: "Naturally, the clues led to a hidden cave behind the waterfall filled with beautiful {favoriteColor} crystals that sparkled like magic gems.",
      pause: true,
      hook: "What treasure lies deeper in the cave?",
      microVariants: {
        text: "Naturally, the clues led to a hidden cave behind the waterfall filled with beautiful {favoriteColor} crystals that sparkled like magic gems.",
        alternatives: ["Following the map perfectly, {userName} discovered a secret cave behind rushing water, where {favoriteColor} crystals gleamed like precious jewels."],
        optionalDetails: ["The waterfall created a misty rainbow in the sunlight.", "The crystals were smooth and cool to touch.", "The cave felt ancient and mysterious."]
      }
    },
    {
      text: "Before long, sharing the treasure with friends became the most exciting part of the entire adventure and discovery.",
      pause: false,
      hook: "",
      microVariants: {
        text: "Before long, sharing the treasure with friends became the most exciting part of the entire adventure and discovery.",
        alternatives: ["Soon {userName} realized that the joy of sharing this amazing discovery with friends was better than keeping the treasure alone."],
        optionalDetails: ["Friends gasped with wonder at the beautiful crystals.", "Everyone wanted to help explore the cave safely.", "The treasure felt more special when shared with others."]
      }
    },
    {
      text: "The friends worked together to carefully document their amazing find with drawings and notes about the magical crystal cave.",
      pause: false,
      hook: "",
      microVariants: {
        text: "The friends worked together to carefully document their amazing find with drawings and notes about the magical crystal cave.",
        alternatives: ["Working as a team, the friends created detailed records of their discovery through careful drawings and written observations."],
        optionalDetails: ["They used {favoriteColor} pencils to draw the crystals.", "Each friend wrote something different about the cave.", "They made a special treasure book together."]
      }
    },
    {
      text: "They decided to keep the cave location secret while creating a special club for young explorers and treasure hunters.",
      pause: true,
      hook: "What adventures will the explorer club have?",
      microVariants: {
        text: "They decided to keep the cave location secret while creating a special club for young explorers and treasure hunters.",
        alternatives: ["The friends agreed to protect their secret cave while starting an exclusive club dedicated to exploration and adventure."],
        optionalDetails: ["They designed club badges with {favoriteColor} crystals.", "Each member got a special explorer handbook.", "They planned weekly adventure meetings."]
      }
    },
    {
      text: "Every weekend, the explorer club met to plan new adventures and share {favoriteFood} while telling stories about their discoveries.",
      pause: false,
      hook: "",
      microVariants: {
        text: "Every weekend, the explorer club met to plan new adventures and share {favoriteFood} while telling stories about their discoveries.",
        alternatives: ["Each weekend brought exciting club meetings where friends enjoyed {favoriteFood} and shared tales of their exploration adventures."],
        optionalDetails: ["The meetings were held in {userName}'s backyard treehouse.", "They kept a journal of all their adventures.", "New members had to find three interesting rocks to join."]
      }
    },
    {
      text: "And wouldn't you know it - that treasure hunt created the best friendship memories that would last forever in their hearts.",
      pause: true,
      hook: "What mystery will they solve next?",
      microVariants: {
        text: "And wouldn't you know it - that treasure hunt created the best friendship memories that would last forever in their hearts.",
        alternatives: ["The treasure hunting adventure had given them precious memories and friendships that would remain special throughout their entire lives."],
        optionalDetails: ["They promised to be friends forever.", "The crystal cave became their special secret place.", "Every adventure brought them closer together as friends."]
      }
    }
  ],
  endings: [
    {
      type: 'cozy',
      text: "Years later, {userName} and their friends still visit the secret crystal cave during quiet afternoons. They sit surrounded by the beautiful {favoriteColor} crystals, sharing {favoriteFood} and remembering their first great adventure together. The cave remains their special place of friendship and wonder.",
      microVariants: ["Years later, the friends still cherish quiet afternoons in their secret crystal cave, sharing {favoriteFood} and remembering their precious first adventure."]
    },
    {
      type: 'silly',
      text: "The crystal cave becomes so popular with friendly animals that {userName} and friends have to make tiny explorer badges for squirrels, rabbits, and even a curious {favoriteAnimal} who keeps trying to join their club meetings! What a wonderfully silly situation!",
      microVariants: ["The cave attracts so many friendly animals that the friends create tiny explorer badges for squirrels, rabbits, and a persistent {favoriteAnimal} who wants to join!"]
    },
    {
      type: 'triumphant',
      text: "{userName}'s explorer club becomes famous throughout the school and community. They lead nature walks, teach other children about geology, and help create a new science program focused on local exploration and discovery.",
      microVariants: ["{userName}'s explorer club gains school-wide fame, leading nature walks and helping establish a new local exploration science program."]
    },
    {
      type: 'reflective',
      text: "{userName} realizes that the greatest treasures aren't crystals or maps, but the friendships formed through shared adventures. True treasure lies in the bonds we create when we explore the world together with people we care about.",
      microVariants: ["{userName} discovers that friendship and shared adventures are life's greatest treasures, more valuable than any crystals or hidden riches."]
    }
  ],
  reuse: {
    swappableElements: {
      "treasure_items": ["crystals", "coins", "jewels", "artifacts", "fossils"],
      "exploration_tools": ["maps", "compasses", "magnifying glasses", "notebooks", "flashlights"],
      "adventure_locations": ["caves", "forests", "mountains", "islands", "ruins"]
    },
    weatherVariants: ["sunny exploration day", "perfect adventure weather", "misty morning discovery", "golden afternoon hunt"],
    settingVariants: ["neighborhood park", "forest trail", "rocky hillside", "hidden valley"]
  }
};