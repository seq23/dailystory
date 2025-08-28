// Level 3 Template: Underwater Kingdom Adventure  
export const template = {
  title: "The Secret Underwater Kingdom",
  theme: "Ocean Adventure & Environmental Awareness", 
  level: "Level 3",
  scenes: [
    {
      text: "{userName} discovers a mysterious {favoriteColor} seashell while exploring tide pools during a family beach vacation. When they hold it up to their ear, instead of hearing ocean sounds, they hear a faint voice calling for help! Suddenly, the shell begins to glow and the waves around {userName} start to sparkle with magical light.",
      pause: true,
      hook: "What ocean adventure will the magical seashell lead {userName} to?",
      microVariants: {
        text: "{userName} finds a glowing seashell that calls for help during their tide pool exploration.",
        alternatives: ["A mysterious voice from inside a {favoriteColor} seashell draws {userName} into an ocean mystery."],
        optionalDetails: ["the tide pools shimmer with unusual colors", "small fish seem to watch {userName} curiously"]
      }
    },
    {
      text: "As {userName} wades deeper into the sparkling water, they discover they can breathe underwater! A friendly {favoriteAnimal}-shaped sea creature named Marina swims up to greet them. Marina explains that the shell belongs to the Coral Kingdom, where the ocean animals need help because pollution from the surface world is making their home sick.",
      pause: true,
      hook: "How can {userName} help heal the underwater kingdom?",
      microVariants: {
        text: "Breathing underwater, {userName} meets Marina, who explains how surface pollution is harming the Coral Kingdom.",
        alternatives: ["Marina the sea creature reveals that ocean pollution is threatening their underwater world."],
        optionalDetails: ["colorful coral reefs are turning gray and lifeless", "fish are getting sick from plastic waste"]
      }
    },
    {
      text: "Marina guides {userName} through the Coral Kingdom, showing them beautiful underwater cities made of living coral and kelp forests where {favoriteAnimal} families live peacefully. But {userName} also sees the damage - plastic bags floating like ghosts, oil slicks coating the sea floor, and coral reefs bleached white from warming waters. The kingdom's ruler, King Neptune, is too sick from the pollution to use his powers to protect the ocean.",
      pause: true,
      hook: "What can one child do to save an entire underwater kingdom?",
      microVariants: {
        text: "The tour reveals both the kingdom's beauty and the devastating effects of surface-world pollution on sea life.",
        alternatives: ["Beautiful underwater cities contrast sharply with the pollution damage that's making everyone sick."],
        optionalDetails: ["sea turtles are caught in plastic nets", "once-bright coral homes are now empty shells"]
      }
    },
    {
      text: "{userName} learns that the magical seashell is actually a communication device that can connect the underwater kingdom with people on land. Using their knowledge of {hobbies}, {userName} helps Marina and the sea creatures organize a plan to send messages to humans about ocean conservation. They decide to work together to create a bridge between the two worlds.",
      pause: true,
      hook: "How will {userName} convince people on land to help save the ocean?",
      microVariants: {
        text: "The seashell becomes a tool for {userName} to help sea creatures communicate their conservation message to humans.",
        alternatives: ["Using {hobbies} skills, {userName} helps organize a communication plan between land and sea."],
        optionalDetails: ["dolphins volunteer to carry messages to fishing boats", "whales agree to sing warning songs to ships"]
      }
    },
    {
      text: "Back on the surface, {userName} starts an ocean protection campaign at school and in their community. They organize beach cleanups, teach others about marine life, and even convince their {favoriteFood} restaurant to stop using plastic straws. Every time they help the ocean, the magical seashell glows brighter, showing that their actions are making a difference in the underwater kingdom.",
      pause: true,
      hook: "What changes will {userName} see when they return to visit their ocean friends?",
      microVariants: {
        text: "{userName}'s surface-world conservation efforts make the magical seashell glow brighter, indicating positive changes below.",
        alternatives: ["Beach cleanups and conservation education create visible improvements that the seashell reflects through its magical glow."],
        optionalDetails: ["classmates become excited about ocean protection", "local businesses start using eco-friendly materials"]
      }
    },
    {
      text: "When {userName} returns to the underwater kingdom, they discover remarkable improvements everywhere. The coral reefs show new growth in brilliant colors, fish families are healthier and more numerous, and King Neptune has recovered enough strength to begin healing the ocean's damaged areas. Marina and the sea creatures celebrate {userName}'s conservation work, explaining how surface-world changes create positive impacts throughout the marine ecosystem.",
      pause: true,
      hook: "How will {userName} continue bridging the worlds of land and sea?",
      microVariants: {
        text: "Return visits reveal dramatic ocean improvements directly connected to {userName}'s surface-world environmental advocacy and education efforts.",
        alternatives: ["The underwater kingdom's recovery demonstrates the powerful connection between land-based conservation and marine ecosystem health."],
        optionalDetails: ["new species of colorful fish have returned to the reefs", "the water is so clear that sunlight reaches the deepest coral gardens"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "Thanks to {userName}'s conservation work, the Coral Kingdom begins to heal. King Neptune recovers his strength and grants {userName} the title of 'Guardian of Two Worlds,' allowing them to visit the underwater kingdom whenever they want to help protect the ocean.",
      microVariants: ["The healed Coral Kingdom honors {userName} as a guardian who can travel between land and sea.", "{userName} becomes a permanent bridge between human and marine worlds, continuing their conservation mission."]
    },
    {
      type: 'cozy',
      text: "{userName} continues their regular visits to Marina and the sea creatures, helping with small conservation projects and learning about ocean science. The magical seashell becomes their constant reminder that even small actions can make big differences for the environment.",
      microVariants: ["Regular underwater visits keep {userName} connected to marine conservation while building lasting friendships.", "The seashell reminds {userName} daily that individual actions create collective environmental healing."]
    },
    {
      type: 'reflective',
      text: "{userName} realizes that protecting the environment isn't just about helping animals and plants - it's about understanding that everything in nature is connected. Their ocean adventure teaches them that caring for the Earth means caring for all living things, including themselves.",
      microVariants: ["Ocean conservation teaches {userName} about environmental interconnectedness and the importance of caring for all living things.", "Understanding marine ecosystem connections helps {userName} appreciate how environmental stewardship benefits everyone."]
    },
    {
      type: 'silly',
      text: "The Coral Kingdom becomes so healthy that Marina starts an underwater {favoriteColor} {favoriteAnimal} postal service! {userName} receives daily seashell messages with ocean news, marine jokes, and invitations to the most ridiculous underwater dance parties celebrating environmental protection.",
      microVariants: ["An underwater postal service delivers daily marine news and silly ocean-themed party invitations to {userName}.", "The healthiest ocean kingdom in history celebrates with wonderfully absurd underwater festivities and constant communication with their surface friend."]
    }
  ],
  reuse: {
    swappableElements: {
      "sea_creatures": ["dolphins", "whales", "sea turtles", "tropical fish"],
      "ocean_problems": ["plastic pollution", "oil spills", "coral bleaching", "overfishing"],
      "conservation_actions": ["beach cleanups", "recycling programs", "education campaigns", "policy changes"]
    },
    weatherVariants: ["during summer vacation", "at low tide", "on calm ocean days", "after storm cleanup"],
    settingVariants: ["coral reefs", "kelp forests", "deep ocean trenches", "coastal tide pools"]
  }
};