// Level 1 Template: Perfect Beach Day
export const template = {
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
      hook: "How will the sand feel on their feet?",
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
      hook: "What will the waves bring to shore?",
      microVariants: {
        text: "The waves come close but don't wash it away.",
        alternatives: ["The ocean waves dance nearby but leave the castle standing."],
        optionalDetails: ["The waves are just the right size.", "Water makes pretty patterns.", "The castle is built perfectly."]
      }
    },
    {
      text: "{userName} finds beautiful shells and smooth rocks.",
      pause: false,
      hook: "What treasures will {userName} discover?",
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
};