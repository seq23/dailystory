// Level 4 Template: Ancient Artifact Mystery
export const template = {
  title: "The Ancient Artifact Mystery",
  theme: "Archaeology & Ethical Discovery",
  level: "Level 4",
  scenes: [
    {
      text: "{userName} discovers a mysterious {favoriteColor} stone tablet while volunteering at the museum's archaeology department. The artifact contains symbols that don't match any known language, and Dr. Martinez warns that some discoveries are meant to stay buried.",
      pause: true,
      hook: "The tablet grows warm at {userName}'s touch and ancient symbols begin glowing ominously in the dark storage room!",
      microVariants: {
        text: "{userName} discovers a mysterious artifact at the museum.",
        alternatives: ["An ancient tablet catches {userName}'s attention during volunteer work."],
        optionalDetails: ["the tablet feels unnaturally warm to the touch and emits a subtle humming sound that seems to resonate with {userName}'s heartbeat, creating an unsettling connection", "strange symbols seem to shimmer and change in the light, appearing to rearrange themselves when no one is looking directly at them, suggesting some form of active intelligence"]
      }
    },
    {
      text: "Against Dr. Martinez's warnings, {userName} begins researching the symbols with their friend Maya. They discover the tablet might be connected to a lost civilization that possessed advanced knowledge about {favoriteAnimal} communication and natural disasters.",
      pause: true,
      hook: "Late at night in the library, {userName} and Maya hear strange sounds coming from the ancient artifact locked in {userName}'s backpack!",
      microVariants: {
        text: "{userName} and Maya research the mysterious symbols together.",
        alternatives: ["The two friends dive deeper into the ancient mystery."],
        optionalDetails: ["ancient texts mention catastrophic warnings written in blood-red ink that matches the tablet's glowing symbols, suggesting a connection to apocalyptic predictions", "the symbols appear in forbidden archaeological sites around the world, but every expedition that found them has mysteriously disappeared without explanation, leaving only cryptic journal entries"]
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
    },
    {
      text: "After extensive ethical deliberation, {userName} and Maya propose establishing a youth environmental council that can interpret the ancient warnings through modern scientific methodology. They discover that incorporating {hobbies} principles helps bridge ancient wisdom with contemporary environmental science, creating actionable climate adaptation strategies.",
      pause: true,
      hook: "Can young voices transform ancient prophecies into modern environmental solutions?",
      microVariants: {
        text: "Youth environmental leadership emerges as {userName} and Maya develop innovative approaches combining ancient wisdom with scientific methodology.",
        alternatives: ["Creative integration of traditional knowledge and modern science creates new possibilities for environmental action."],
        optionalDetails: ["the council attracts international attention from climate scientists", "other ancient artifacts surface with similar environmental messages"]
      }
    },
    {
      text: "The archaeological society reveals they've been secretly working with indigenous communities worldwide to preserve traditional environmental knowledge that parallels the tablet's warnings. {userName} learns that the ancient civilization wasn't lost - their descendants have been maintaining environmental wisdom for millennia, but their voices have been systematically ignored by mainstream science.",
      pause: true,
      hook: "How should modern society integrate traditional ecological knowledge that has been preserved for thousands of years?",
      microVariants: {
        text: "Hidden connections between ancient artifacts and living indigenous knowledge challenge {userName}'s understanding of archaeological preservation and environmental science.",
        alternatives: ["The discovery reveals ongoing traditional knowledge systems that have been protecting environmental wisdom while mainstream science overlooked indigenous expertise."],
        optionalDetails: ["indigenous elders confirm the tablet's authenticity using traditional methods", "similar environmental warnings exist in oral traditions worldwide"]
      }
    },
    {
      text: "Corporate interests attempt to acquire the tablet through legal manipulation, claiming that any potentially profitable discoveries belong to shareholders rather than humanity. {userName} and Maya must navigate intellectual property laws while working with indigenous communities and environmental activists to protect both ancient artifacts and traditional knowledge from commercialization.",
      pause: true,
      hook: "Who owns ancient wisdom, and how can it be protected from exploitation while remaining accessible to those who need it?",
      microVariants: {
        text: "Legal battles over ownership of ancient environmental knowledge force {userName} to grapple with questions about intellectual property, cultural heritage, and environmental justice.",
        alternatives: ["Corporate attempts to monetize ancient wisdom create conflicts that require understanding complex relationships between cultural preservation and environmental action."],
        optionalDetails: ["lawyers argue that discoveries made in public institutions belong to private investors", "indigenous communities assert their ancestral rights to traditional knowledge"]
      }
    },
    {
      text: "Working with Dr. Martinez and indigenous knowledge keepers, {userName} helps establish protocols for ethical archaeological research that honors traditional communities while advancing environmental science. They discover that the tablet is part of a global network of ancient environmental monitoring systems that could revolutionize climate prediction when combined with modern technology.",
      pause: true,
      hook: "How can ancient technologies enhance modern environmental science while respecting the communities that preserved this knowledge?",
      microVariants: {
        text: "Collaborative research protocols emerge as {userName} helps bridge archaeological science, indigenous knowledge, and modern environmental technology.",
        alternatives: ["Ethical research frameworks demonstrate how respecting traditional communities enhances rather than restricts scientific discovery."],
        optionalDetails: ["ancient monitoring systems show sophisticated understanding of climate patterns", "traditional communities possess calibration knowledge essential for interpreting the data"]
      }
    },
    {
      text: "The youth environmental council's presentation combining ancient predictions with modern climate data convinces international environmental organizations to fund a global traditional knowledge preservation project. {userName} realizes that their role has evolved from archaeology student to environmental justice advocate, using their platform to amplify voices that have been protecting the planet for millennia.",
      pause: true,
      hook: "What responsibilities come with being a bridge between ancient wisdom and modern environmental action?",
      microVariants: {
        text: "Global recognition of the traditional knowledge project establishes {userName} as an advocate for environmental justice and cultural preservation.",
        alternatives: ["Success brings new responsibilities as {userName} becomes a spokesperson for integrating traditional ecological knowledge into modern environmental policy."],
        optionalDetails: ["funding supports indigenous communities in documenting their environmental knowledge", "universities begin incorporating traditional knowledge into environmental science curricula"]
      }
    },
    {
      text: "As the global project expands, {userName} faces the challenge of maintaining authentic relationships with traditional communities while managing international attention and funding. They learn that environmental activism requires not just scientific knowledge but cultural humility, recognizing that the most advanced environmental technologies have always existed in traditional ecological practices.",
      pause: true,
      hook: "How do environmental advocates ensure that amplifying traditional voices doesn't accidentally appropriate or overshadow the communities they're trying to support?",
      microVariants: {
        text: "Managing international environmental projects teaches {userName} about cultural humility and the importance of centering traditional voices in environmental advocacy.",
        alternatives: ["The complexities of environmental justice require {userName} to understand how authentic allyship supports rather than overshadows traditional communities."],
        optionalDetails: ["traditional communities lead the project while {userName} provides administrative and advocacy support", "indigenous environmental technologies prove more sophisticated than modern alternatives"]
      }
    },
    {
      text: "Five years after their initial artifact discovery, {userName} stands before an international assembly of indigenous knowledge keepers, scientists, and policy makers as they help ratify the Global Traditional Knowledge Protection Treaty. This groundbreaking agreement ensures that traditional communities maintain ownership and control over their environmental wisdom while benefiting from any applications of their knowledge. {userName} realizes their role has evolved from curious student to bridge-builder between ancient wisdom and modern environmental policy, helping create a more equitable future where all forms of knowledge are valued and protected.",
      pause: true,
      hook: "What lasting impact will this treaty have on protecting both cultural heritage and environmental wisdom for future generations?",
      microVariants: {
        text: "The Global Traditional Knowledge Protection Treaty represents the culmination of {userName}'s journey from archaeological discovery to environmental justice advocacy.",
        alternatives: ["International recognition of traditional knowledge rights establishes {userName}'s lasting legacy in protecting cultural heritage and environmental wisdom."],
        optionalDetails: ["the treaty becomes a model for other international agreements protecting indigenous rights", "traditional communities worldwide celebrate this recognition of their environmental expertise"]
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
    },
    {
      type: 'cozy',
      text: "{userName} continues working with Dr. Martinez and indigenous communities, helping translate ancient environmental wisdom into practical solutions for local communities while building lasting relationships across cultures and generations.",
      microVariants: ["Daily collaboration between ancient wisdom and modern science creates sustainable community solutions.", "Cross-cultural partnerships demonstrate how environmental stewardship connects all generations."]
    },
    {
      type: 'silly',
      text: "The ancient tablet becomes famous for predicting that {favoriteAnimal} populations will thrive if humans learn to communicate with them using {favoriteColor} signals! {userName} becomes the world's first official Human-Animal Environmental Coordinator, making conservation wonderfully ridiculous and effective.",
      microVariants: ["Ancient predictions about animal communication lead to surprisingly successful conservation programs involving {favoriteAnimal} environmental consultants.", "The most effective environmental solutions combine serious science with joyfully absurd interspecies cooperation."]
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