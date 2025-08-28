// Level 4 Template: Ancient Artifact Mystery
export const template = {
  title: "The Ancient Artifact Mystery",
  theme: "Archaeology & Ethical Discovery",
  level: "Level 4",
  scenes: [
    {
      text: "{userName} discovers a mysterious {favoriteColor} stone tablet while volunteering at the museum's archaeology department. The artifact contains symbols that don't match any known language, and Dr. Martinez warns that some discoveries are meant to stay buried.",
      pause: true,
      hook: "What ancient secrets could this artifact reveal, and why does Dr. Martinez seem afraid?",
      microVariants: {
        text: "{userName} discovers a mysterious artifact at the museum.",
        alternatives: ["An ancient tablet catches {userName}'s attention during volunteer work."],
        optionalDetails: ["the tablet feels unnaturally warm to the touch", "strange symbols seem to shimmer in the light"]
      }
    },
    {
      text: "Against Dr. Martinez's warnings, {userName} begins researching the symbols with their friend Maya. They discover the tablet might be connected to a lost civilization that possessed advanced knowledge about {favoriteAnimal} communication and natural disasters.",
      pause: true,
      hook: "Should they continue their research despite the growing dangers they uncover?",
      microVariants: {
        text: "{userName} and Maya research the mysterious symbols together.",
        alternatives: ["The two friends dive deeper into the ancient mystery."],
        optionalDetails: ["ancient texts mention catastrophic warnings", "the symbols appear in forbidden archaeological sites"]
      }
    },
    {
      text: "The tablet begins affecting electronic equipment around {userName}. Their phone displays strange messages, and security cameras malfunction when they're near. Maya suggests they're in over their heads, but {userName} feels compelled to continue.",
      pause: true,
      hook: "Is the artifact trying to communicate, or is something more sinister happening?",
      microVariants: {
        text: "Strange electronic malfunctions follow {userName} everywhere.",
        alternatives: ["Technology begins behaving erratically around the artifact."],
        optionalDetails: ["computers display ancient symbols", "electronic devices emit unusual frequencies"]
      }
    },
    {
      text: "Dr. Martinez reveals the truth: the tablet is one of seven warning beacons left by an ancient civilization that predicted global environmental collapse. The other six tablets have been hidden by a secret archaeological society to prevent panic.",
      pause: true,
      hook: "Should this knowledge be shared with the world, even if it causes widespread fear?",
      microVariants: {
        text: "Dr. Martinez unveils the tablet's true purpose as a warning device.",
        alternatives: ["The artifact's real mission becomes terrifyingly clear."],
        optionalDetails: ["the society has protected these secrets for centuries", "the warnings predicted current climate changes"]
      }
    },
    {
      text: "{userName} faces a moral dilemma when they discover the tablet contains precise dates for future natural disasters. Maya argues they have a responsibility to warn people, while Dr. Martinez insists it would cause global chaos and panic.",
      pause: true,
      hook: "How do you balance protecting people with preventing mass hysteria?",
      microVariants: {
        text: "{userName} struggles with the weight of predicting future disasters.",
        alternatives: ["The burden of foreknowledge becomes overwhelming."],
        optionalDetails: ["the predictions are eerily accurate", "lives could be saved or destroyed"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName} presents their youth environmental council's findings at the United Nations, proving that ancient wisdom and modern action can work together to save the planet.",
      microVariants: ["The world listens as young voices share ancient solutions.", "Ancient prophecies guide modern environmental policy."]
    },
    {
      type: 'reflective',
      text: "{userName} sits quietly in their favorite spot where they {hobbies}, understanding that true archaeology isn't just about discovering the past, but using its lessons to build a better future.",
      microVariants: ["The greatest artifacts are the lessons we carry forward.", "Ancient wisdom lives on through modern actions."]
    }
  ],
  reuse: {
    swappableElements: {
      "artifact_type": ["stone tablet", "crystal sphere", "metal disc", "carved bone"],
      "ancient_knowledge": ["environmental wisdom", "astronomical predictions", "communication secrets", "healing techniques"],
      "modern_threat": ["corporate greed", "government cover-up", "black market dealers", "power-hungry collectors"],
      "youth_action": ["environmental council", "student organization", "social media campaign", "community initiative"]
    },
    weatherVariants: ["during research hours", "in quiet study time", "on field expedition days", "in candlelit archives"],
    settingVariants: ["university museum", "archaeological site", "secret laboratory", "underground auction house"],
    randomSeed: 42
  }
};