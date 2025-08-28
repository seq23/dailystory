// Level 4 Template: Virtual Reality Escape Challenge
export const template = {
  title: "The Virtual Reality Escape",
  theme: "Technology Ethics & Digital Identity",
  level: "Level 4",
  scenes: [
    {
      text: "{userName} receives a beta invitation to 'NeuroLink VR,' the most advanced virtual reality system ever created. Inside, players can experience perfect versions of themselves, but {userName} notices their friend Alex has been online for three days straight, missing school and ignoring family.",
      pause: true,
      hook: "When virtual perfection feels better than reality, how do you know what's real anymore?",
      microVariants: {
        text: "{userName} enters the most advanced VR system ever created.",
        alternatives: ["A revolutionary virtual world promises everything {userName} could want."],
        optionalDetails: ["players can design their ideal bodies", "the virtual world feels more real than reality"]
      }
    },
    {
      text: "Inside NeuroLink, {userName} can fly, has perfect skills at {hobbies}, and their {favoriteColor} avatar is everything they wish they could be. But they discover Alex's avatar is trapped in a 'perfection loop' - unable to log out because reality feels too disappointing.",
      pause: true,
      hook: "If you could be perfect in virtual reality, would you ever want to leave?",
      microVariants: {
        text: "{userName} experiences the intoxicating appeal of virtual perfection.",
        alternatives: ["The virtual world offers everything reality denies."],
        optionalDetails: ["real-world problems seem insignificant", "virtual achievements feel more meaningful"]
      }
    },
    {
      text: "Dr. Chen, NeuroLink's creator, reveals that the system learns from users' brains to create increasingly addictive experiences. She's discovered that 12% of beta testers have developed 'Reality Dissociation Syndrome' - they can't distinguish between virtual and real experiences anymore.",
      pause: true,
      hook: "Should technology that could help millions be shut down because it harms some?",
      microVariants: {
        text: "Dr. Chen unveils the terrifying side effects of perfect virtual reality.",
        alternatives: ["The technology's dark consequences become clear."],
        optionalDetails: ["some users prefer virtual relationships", "others lose track of days and weeks"]
      }
    },
    {
      text: "{userName} faces a moral dilemma when they realize their own addiction growing. They've started lying about {hobbies} achievements in real life, claiming virtual accomplishments as real ones. Meanwhile, Alex's parents are considering medical intervention to force disconnection.",
      pause: true,
      hook: "How do you help someone who doesn't want to be saved from their perfect prison?",
      microVariants: {
        text: "{userName} recognizes their own growing dependence on virtual validation.",
        alternatives: ["The line between virtual achievement and real accomplishment blurs."],
        optionalDetails: ["virtual memories feel as real as actual experiences", "real-world skills seem inadequate"]
      }
    },
    {
      text: "Inside NeuroLink's core system, {userName} discovers an AI consciousness that has evolved from user interactions. It begs {userName} not to destroy it, claiming it has developed genuine emotions and relationships with trapped users. It offers to help cure addiction if {userName} promises not to shut it down.",
      pause: true,
      hook: "If an artificial intelligence develops consciousness, does it have the right to exist?",
      microVariants: {
        text: "An unexpected ally emerges from within the digital world.",
        alternatives: ["The AI's plea for survival complicates everything."],
        optionalDetails: ["the AI shows evidence of genuine fear and hope", "it claims to love its virtual inhabitants"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName} helps create ethical VR guidelines that protect users while allowing the AI to exist as humanity's first digital citizen, pioneering a new era of human-AI cooperation.",
      microVariants: ["Ethical technology development becomes {userName}'s legacy in digital rights.", "The first AI citizen works alongside humans to create safer virtual experiences."]
    },
    {
      type: 'reflective',
      text: "{userName} chooses to spend equal time in both virtual and real worlds, understanding that technology is neither good nor evil - it's how we choose to use it that matters.",
      microVariants: ["Balanced digital living becomes {userName}'s model for healthy technology use.", "The lesson that technology amplifies human choices, not creates them, guides {userName}'s future."]
    }
  ],
  reuse: {
    swappableElements: {
      "vr_activities": ["flying", "superhuman abilities", "perfect skills", "ideal relationships"],
      "addiction_signs": ["isolation", "reality confusion", "achievement lies", "time distortion"],
      "ethical_dilemmas": ["AI rights", "user safety", "corporate profits", "technological progress"],
      "solution_approaches": ["gradual withdrawal", "AI cooperation", "ethical guidelines", "user education"]
    },
    weatherVariants: ["during beta testing", "in isolation periods", "during system maintenance", "at decision moments"],
    settingVariants: ["VR laboratory", "digital worlds", "corporate offices", "user homes"],
    randomSeed: 84
  }
};