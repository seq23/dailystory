/**
 * Level 1 Template: The Big Bike Adventure
 * Story about overcoming challenges and building confidence
 */

export const template = {
  title: "The Big Bike Adventure",
  theme: "perseverance and building confidence",
  level: "level1",
  scenes: [
    {
      text: "[userName] had been wanting to learn to ride a big bike for months. Today was finally the day! They put on their [favoriteColor] helmet and wheeled the shiny bike to the park where they loved to [hobbies].",
      pause: true,
      hook: "Would today be the day [userName] finally learned to ride?",
      microVariants: {
        text: "[userName] had been wanting to learn to ride a big bike for months. Today was finally the day! They put on their [favoriteColor] helmet and wheeled the shiny bike to the park where they loved to [hobbies].",
        alternatives: [],
        optionalDetails: []
      }
    }
  ],
  endings: [
    {
      type: "triumphant",
      text: "[userName] had learned that with determination, helpful friends, and the right advice, they could accomplish anything they set their mind to. The bike was just the beginning of many great adventures.",
      microVariants: []
    }
  ],
  reuse: {
    swappableElements: {
      "[userName]": ["the child", "little one", "the determined learner", "the brave rider"],
      "[favoriteAnimal]": ["bunny", "squirrel", "bird", "butterfly", "cat", "dog"],
      "[favoriteColor]": ["bright red", "sunny yellow", "ocean blue", "forest green", "royal purple", "sunset orange"],
      "[favoriteFood]": ["energy bars", "fruit snacks", "sandwiches", "crackers", "juice boxes"],
      "[hobbies]": ["playing games", "drawing pictures", "flying kites", "reading books", "building sandcastles"]
    },
    weatherVariants: ["The perfect sunny day made everything bright and cheerful"],
    settingVariants: ["on the smooth park pathways"]
  }
};

export default template;