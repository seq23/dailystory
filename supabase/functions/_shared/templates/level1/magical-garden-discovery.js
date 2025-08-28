/**
 * Level 1 Template: The Magical Garden Discovery  
 * Story about curiosity, wonder, and discovering nature's secrets
 */

export const template = {
  title: "The Magical Garden Discovery",
  theme: "curiosity and discovering nature's wonders",
  level: "level1",
  scenes: [
    {
      text: "[userName] was [hobbies] in their grandmother's old garden when they noticed something strange. One of the [favoriteColor] flowers was glowing softly, and it seemed to be humming a gentle tune that no other flower was making.",
      pause: true,
      hook: "What could make a flower glow and sing?",
      microVariants: {
        text: "[userName] was [hobbies] in their grandmother's old garden when they noticed something strange. One of the [favoriteColor] flowers was glowing softly, and it seemed to be humming a gentle tune that no other flower was making.",
        alternatives: [],
        optionalDetails: []
      }
    }
  ],
  endings: [
    {
      type: "reflective",
      text: "As the sun set each evening, [userName] sat among the softly glowing flowers and thought about how much magic exists in the world when we take time to really look and listen. Sometimes the most extraordinary things are hiding in the most ordinary places.",
      microVariants: []
    }
  ],
  reuse: {
    swappableElements: {
      "[userName]": ["the child", "little one", "the curious explorer", "the gentle storyteller"],
      "[favoriteAnimal]": ["butterfly", "ladybug", "hummingbird", "bunny", "squirrel", "cricket"],
      "[favoriteColor]": ["rainbow", "golden", "silver", "pearl white", "lavender", "rose pink"],
      "[favoriteFood]": ["magical berries", "honeyed fruits", "sparkling treats", "garden vegetables", "sweet nectar"],
      "[hobbies]": ["exploring quietly", "drawing flowers", "reading nature books", "collecting pretty stones", "listening to birds"]
    },
    weatherVariants: ["The gentle evening light made everything glow softly"],
    settingVariants: ["nestled between ancient rose bushes"]
  }
};

export default template;