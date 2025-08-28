// Level 1 Template: Beautiful Garden
export const template = {
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
      hook: "How will the water help the seeds grow?",
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
      hook: "What colors will brighten the garden?",
      microVariants: {
        text: "The plants get bigger and turn {favoriteColor} each week.",
        alternatives: ["Each week the plants grow taller and show {favoriteColor} colors."],
        optionalDetails: ["The flowers are beautiful.", "Bees visit the plants.", "Butterflies like the flowers."]
      }
    },
    {
      text: "{userName} is proud of the beautiful flowers.",
      pause: false,
      hook: "How will the flowers make everyone feel?",
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
};