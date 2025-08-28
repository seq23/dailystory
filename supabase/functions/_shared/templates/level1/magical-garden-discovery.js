/**
 * Level 1 Template: The Magical Garden Discovery
 * Theme: Magic & Nature
 * Individual template file for on-demand loading
 */

export const template = {
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
};