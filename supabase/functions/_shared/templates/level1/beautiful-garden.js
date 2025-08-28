/**
 * Level 1 Template: The Beautiful Garden Adventure
 * Early reader story about discovering a magical garden
 */

export const template = {
  title: "The Beautiful Garden Adventure",
  theme: "nature exploration and wonder",
  level: "level1",
  scenes: [
    {
      text: "[userName] loved to [hobbies] in their backyard every morning. One day, they noticed a small [favoriteColor] gate hidden behind the old apple tree that they had never seen before.",
      pause: true,
      hook: "What could be behind the mysterious gate?",
      microVariants: {
        text: "[userName] loved to [hobbies] in their backyard every morning. One day, they noticed a small [favoriteColor] gate hidden behind the old apple tree that they had never seen before.",
        alternatives: [
          "[userName] was [hobbies] when they spotted something unusual - a tiny [favoriteColor] gate tucked behind the apple tree.",
          "During their morning [hobbies], [userName] discovered a secret [favoriteColor] gate they'd never noticed."
        ],
        optionalDetails: [
          "The gate sparkled slightly in the morning sunlight.",
          "Vines had grown around the gate, making it almost invisible.",
          "The gate had a small brass handle shaped like a [favoriteAnimal]."
        ]
      }
    }
  ],
  endings: [
    {
      type: "cozy",
      text: "From that day on, [userName] visited the beautiful garden every morning, sharing [favoriteFood] with their new [favoriteAnimal] friend and helping care for all the wonderful plants and creatures who lived there.",
      microVariants: [
        "Every morning became a new adventure in the magical garden with [userName]'s loyal [favoriteAnimal] companion."
      ]
    }
  ],
  reuse: {
    swappableElements: {
      "[userName]": ["the child", "little one", "the young explorer", "the kind helper"],
      "[favoriteAnimal]": ["bunny", "squirrel", "bird", "butterfly", "hedgehog", "mouse"],
      "[favoriteColor]": ["golden", "silver", "purple", "pink", "blue", "green"],
      "[favoriteFood]": ["berries", "magical fruits", "sweet treats", "honeyed nuts", "garden vegetables"],
      "[hobbies]": ["playing", "exploring", "reading", "drawing", "singing", "dancing"]
    },
    weatherVariants: ["The morning sun made everything sparkle"],
    settingVariants: ["hidden behind flowering bushes"]
  }
};

export default template;