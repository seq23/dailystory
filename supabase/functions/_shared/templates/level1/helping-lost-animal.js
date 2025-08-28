/**
 * Level 1 Template: Helping the Lost Animal
 * Story about kindness, empathy, and helping others in need
 */

export const template = {
  title: "Helping the Lost Animal",
  theme: "kindness and helping others in need",
  level: "level1",
  scenes: [
    {
      text: "While [userName] was [hobbies] in their front yard, they heard a soft crying sound coming from the bushes. Curious and concerned, they followed the sound and discovered a small [favoriteAnimal] who looked very scared and lost.",
      pause: true,
      hook: "What would [userName] do to help the frightened little creature?",
      microVariants: {
        text: "While [userName] was [hobbies] in their front yard, they heard a soft crying sound coming from the bushes. Curious and concerned, they followed the sound and discovered a small [favoriteAnimal] who looked very scared and lost.",
        alternatives: [],
        optionalDetails: []
      }
    }
  ],
  endings: [
    {
      type: "cozy",
      text: "The grateful family invited [userName] to visit their [favoriteAnimal] anytime. Now [userName] has wonderful new friends and knows that helping others always brings the best rewards.",
      microVariants: []
    }
  ],
  reuse: {
    swappableElements: {
      "[userName]": ["the child", "little one", "the kind helper", "the caring rescuer"],
      "[favoriteAnimal]": ["puppy", "kitten", "bunny", "duckling", "hamster", "bird"],
      "[favoriteColor]": ["bright blue", "warm golden", "soft pink", "deep purple", "forest green", "sunset red"],
      "[favoriteFood]": ["crackers", "fruit pieces", "small treats", "bread crumbs", "berries"],
      "[hobbies]": ["playing with toys", "drawing pictures", "reading stories", "building blocks", "singing songs"]
    },
    weatherVariants: ["The late afternoon sun cast long, gentle shadows"],
    settingVariants: ["among the colorful flower beds"]
  }
};

export default template;