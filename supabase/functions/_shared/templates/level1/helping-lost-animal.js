// Level 1 Template: Helping Lost Animal
export const template = {
  title: "Helping the Lost Puppy",
  theme: "Kindness & Helping Others",
  level: "Level 1",
  scenes: [
    {
      text: "{userName} finds a lost {favoriteAnimal} in the park.",
      pause: true,
      hook: "How can {userName} help?",
      microVariants: {
        text: "{userName} finds a lost {favoriteAnimal} in the park.",
        alternatives: ["{userName} discovers a lonely {favoriteAnimal} wandering in the park."],
        optionalDetails: ["The {favoriteAnimal} looks scared and hungry.", "It has {favoriteColor} fur.", "No one else is around to help."]
      }
    },
    {
      text: "The {favoriteAnimal} is hungry and thirsty.",
      pause: false,
      hook: "",
      microVariants: {
        text: "The {favoriteAnimal} is hungry and thirsty.",
        alternatives: ["The poor {favoriteAnimal} needs food and water badly."],
        optionalDetails: ["It hasn't eaten in a long time.", "Its water bowl is empty.", "The {favoriteAnimal} looks very tired."]
      }
    },
    {
      text: "{userName} shares their {favoriteFood} with the {favoriteAnimal}.",
      pause: true,
      hook: "Will the {favoriteAnimal} trust {userName}?",
      microVariants: {
        text: "{userName} shares their {favoriteFood} with the {favoriteAnimal}.",
        alternatives: ["{userName} kindly offers their {favoriteFood} to the hungry {favoriteAnimal}."],
        optionalDetails: ["The {favoriteAnimal} eats very carefully.", "It wags its tail a little.", "Trust starts to grow between them."]
      }
    },
    {
      text: "The {favoriteAnimal} feels better and follows {userName}.",
      pause: false,
      hook: "",
      microVariants: {
        text: "The {favoriteAnimal} feels better and follows {userName}.",
        alternatives: ["After eating, the {favoriteAnimal} begins to trust {userName}."],
        optionalDetails: ["They walk slowly together.", "The {favoriteAnimal} stays close by.", "It seems much happier now."]
      }
    },
    {
      text: "{userName} helps find the {favoriteAnimal}'s family.",
      pause: false,
      hook: "",
      microVariants: {
        text: "{userName} helps find the {favoriteAnimal}'s family.",
        alternatives: ["{userName} works hard to reunite the {favoriteAnimal} with its owners."],
        optionalDetails: ["They look for 'lost pet' signs.", "Neighbors help with the search.", "Everyone wants to help."]
      }
    },
    {
      text: "The family is so happy to have their pet back.",
      pause: true,
      hook: "How will they thank {userName}?",
      microVariants: {
        text: "The family is so happy to have their pet back.",
        alternatives: ["The owners are overjoyed to be reunited with their beloved {favoriteAnimal}."],
        optionalDetails: ["They had been looking everywhere.", "Tears of joy fill their eyes.", "The {favoriteAnimal} runs to them excitedly."]
      }
    }
  ],
  endings: [
    {
      type: 'cozy',
      text: "{userName} visits the {favoriteAnimal} every week, and they become the best of friends. The family always welcomes {userName} with warm hugs and {favoriteFood}. Kindness created a wonderful friendship.",
      microVariants: ["Weekly visits to the {favoriteAnimal} create lasting friendship, with the grateful family always welcoming {userName} warmly."]
    },
    {
      type: 'silly',
      text: "The {favoriteAnimal} loves {userName} so much that it tries to follow them home every day! Now {userName} has to sneak out the back door to avoid a parade of {favoriteAnimal}s. What a funny problem to have!",
      microVariants: ["The {favoriteAnimal} follows {userName} everywhere, creating a silly daily parade that requires creative sneaking techniques!"]
    },
    {
      type: 'triumphant',
      text: "{userName} becomes the neighborhood's official pet helper. Whenever an animal is lost, everyone calls {userName} for help. They have saved dozens of pets and made many families happy.",
      microVariants: ["{userName} becomes the community's go-to pet rescuer, successfully reuniting dozens of lost animals with their grateful families."]
    },
    {
      type: 'reflective',
      text: "{userName} learns that helping others, even small animals, makes the world a better place. When we show kindness to those who need help, we create connections that make everyone happier.",
      microVariants: ["{userName} discovers that acts of kindness toward those in need create meaningful connections and make the world brighter for everyone."]
    }
  ],
  reuse: {
    swappableElements: {
      "lost_animals": ["puppy", "kitten", "rabbit", "bird", "hamster"],
      "help_methods": ["sharing food", "providing water", "offering comfort", "finding owners"],
      "locations": ["park", "neighborhood", "school yard", "street corner"]
    },
    weatherVariants: ["sunny day", "cloudy afternoon", "gentle morning", "peaceful evening"],
    settingVariants: ["local park", "neighborhood street", "school playground", "community center"]
  }
};