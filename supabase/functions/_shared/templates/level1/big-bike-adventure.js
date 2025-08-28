// Level 1 Template: Big Bike Adventure
export const template = {
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
      hook: "How will Dad help {userName} learn?",
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
      hook: "What will {userName} discover while riding?",
      microVariants: {
        text: "{userName} rides all the way down the street.",
        alternatives: ["{userName} pedals successfully down the entire street."],
        optionalDetails: ["Neighbors come out to watch.", "The {favoriteColor} bike goes fast.", "Wind blows through {userName}'s hair."]
      }
    },
    {
      text: "Everyone cheers for {userName}'s success.",
      pause: false,
      hook: "How will this success change {userName}?",
      microVariants: {
        text: "Everyone cheers for {userName}'s success.",
        alternatives: ["The whole family celebrates {userName}'s achievement."],
        optionalDetails: ["Mom takes pictures of the big moment.", "Dad gives {userName} a big hug.", "The whole neighborhood is proud."]
      }
    },
    {
      text: "Now {userName} can ride bikes with friends every day.",
      pause: true,
      hook: "Where will they ride next?",
      microVariants: {
        text: "Now {userName} can ride bikes with friends every day.",
        alternatives: ["{userName} looks forward to daily bike rides with friends."],
        optionalDetails: ["They plan to ride to the park.", "Friends want to learn too.", "Every day brings new bike adventures."]
      }
    }
  ],
  endings: [
    {
      type: 'cozy',
      text: "Every evening, {userName} rides their {favoriteColor} bike around the neighborhood, feeling proud and happy. The bike rides become a special time for thinking and enjoying the world around them.",
      microVariants: ["Evening bike rides on the {favoriteColor} bike become {userName}'s favorite time for peaceful reflection and joy."]
    },
    {
      type: 'silly',
      text: "{userName} becomes such a good bike rider that they start doing tricks! They can ride with no hands while eating {favoriteFood}. Even a {favoriteAnimal} tries to ride along. What silly bike fun!",
      microVariants: ["{userName} masters bike tricks, riding hands-free while eating {favoriteFood}, with a {favoriteAnimal} trying to join the fun!"]
    },
    {
      type: 'triumphant',
      text: "{userName} teaches all their friends how to ride bikes too. Soon the whole neighborhood is full of children riding together. {userName} becomes known as the best bike teacher around.",
      microVariants: ["{userName} becomes the neighborhood's beloved bike teacher, helping all their friends learn to ride successfully."]
    },
    {
      type: 'reflective',
      text: "{userName} learns that trying new things can be scary, but practice and patience make everything possible. Learning to ride shows that they can do anything they set their mind to.",
      microVariants: ["{userName} discovers that persistence and courage lead to success, and learning to ride proves they can achieve any goal."]
    }
  ],
  reuse: {
    swappableElements: {
      "vehicles": ["bike", "scooter", "skateboard", "roller skates"],
      "helpers": ["Dad", "Mom", "older sibling", "friend"],
      "achievements": ["riding", "balancing", "steering", "stopping"]
    },
    weatherVariants: ["perfect learning day", "sunny afternoon", "calm morning", "gentle breeze"],
    settingVariants: ["quiet street", "park path", "driveway", "empty parking lot"]
  }
};