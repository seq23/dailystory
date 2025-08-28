// Level 3 Template: Time Travel Detective
export const template = {
  title: "The Time Travel Detective",
  theme: "Mystery & Historical Exploration",
  level: "Level 3",
  scenes: [
    {
      text: "{userName} discovers an old pocket watch in their grandmother's attic that glows {favoriteColor} when touched. Suddenly, the room spins around them and they find themselves in Ancient Egypt, wearing clothes from that time period! A young Egyptian girl named Kira approaches, speaking in a language {userName} somehow understands.",
      pause: true,
      hook: "What mystery awaits {userName} in Ancient Egypt?",
      microVariants: {
        text: "{userName} finds a magical pocket watch that transports them to Ancient Egypt where they meet Kira.",
        alternatives: ["A mysterious {favoriteColor} watch in the attic sends {userName} back to Ancient Egypt."],
        optionalDetails: ["hieroglyphs glow on nearby walls", "the air smells of incense and sand"]
      }
    },
    {
      text: "Kira explains that someone has been stealing precious artifacts from the pyramid, and the pharaoh is furious. The thief seems to appear and disappear like magic, just like {userName} did! Kira believes {userName} might be the key to solving this mystery because they both have 'time magic.' Together, they sneak toward the Great Pyramid.",
      pause: true,
      hook: "Could the thief be another time traveler like {userName}?",
      microVariants: {
        text: "Kira reveals that a mysterious thief is stealing artifacts, and {userName}'s time magic might help solve the case.",
        alternatives: ["The pyramid thief has magical disappearing powers just like {userName}'s time travel ability."],
        optionalDetails: ["guards patrol with spears and shields", "the pyramid casts enormous shadows"]
      }
    },
    {
      text: "Inside the pyramid, {userName} and Kira discover strange footprints that seem to fade and reappear in different locations. Using their knowledge of {hobbies}, {userName} notices the footprints follow a pattern that leads to a hidden chamber. There, they find Marcus, a boy from the Roman Empire who also has a time-travel device!",
      pause: true,
      hook: "Why is Marcus stealing artifacts from different time periods?",
      microVariants: {
        text: "{userName} uses their {hobbies} skills to track mysterious footprints leading to Marcus, a Roman time traveler.",
        alternatives: ["Detective skills help {userName} and Kira discover Marcus, who has his own time-travel powers."],
        optionalDetails: ["torches flicker in the chamber walls", "ancient paintings tell stories of the past"]
      }
    },
    {
      text: "Marcus explains he's not really stealing - he's trying to return artifacts that were taken from their proper time periods by adult time thieves! He shows them a {favoriteColor} crystal that reveals when objects don't belong in their correct time. The pyramid artifacts were stolen from the future and planted here to confuse historians.",
      pause: true,
      hook: "Can three kids from different time periods work together to fix history?",
      microVariants: {
        text: "Marcus reveals he's actually trying to return stolen artifacts to their proper time periods using a magical crystal.",
        alternatives: ["The Roman boy is fighting adult time thieves who plant artifacts in wrong time periods."],
        optionalDetails: ["the crystal shows swirling colors around displaced objects", "each artifact glows when out of place"]
      }
    },
    {
      text: "The three young time travelers decide to work together, each using their unique skills. Kira knows secret passages in Egyptian buildings, {userName} understands modern technology mixed with ancient mysteries, and Marcus has military strategy knowledge from Rome. They discover the adult thieves are using a time machine hidden in the desert.",
      pause: true,
      hook: "How can three children outsmart adult criminals with advanced technology?",
      microVariants: {
        text: "The three friends combine their different time period skills to track down the adult time thieves.",
        alternatives: ["Each child brings unique knowledge from their era to solve the time crime mystery."],
        optionalDetails: ["the time machine looks like a metal pyramid", "guards from all time periods protect it"]
      }
    },
    {
      text: "Working together brilliantly, the three friends create an elaborate plan combining ancient Egyptian engineering, Roman military tactics, and {userName}'s knowledge of modern technology. They successfully disable the time machine and trap the adult thieves, returning all stolen artifacts to their proper historical periods and ensuring that history remains accurate for future generations to study.",
      pause: true,
      hook: "What will happen to the three young heroes now that they've saved history?",
      microVariants: {
        text: "Their combined skills from different eras create the perfect plan to stop the time thieves and preserve historical accuracy.",
        alternatives: ["Ancient wisdom, military strategy, and modern knowledge unite to protect history from criminal manipulation."],
        optionalDetails: ["historians around the world notice mysterious improvements in artifact authenticity", "the time thieves are sent to a special temporal prison"]
      }
    },
    {
      text: "After successfully completing their mission, the three friends discover their time-travel devices have been enhanced by their collaboration. They can now communicate across centuries and coordinate efforts to protect historical artifacts. {userName} learns that their watch can detect temporal disturbances anywhere in history, making them an essential member of the newly formed Time Guardian Alliance.",
      pause: true,
      hook: "What other historical periods might need their protection?",
      microVariants: {
        text: "Enhanced time-travel abilities allow the three friends to communicate across centuries and coordinate historical protection efforts.",
        alternatives: ["Successful teamwork upgrades their temporal powers, creating opportunities for ongoing historical preservation missions."],
        optionalDetails: ["the devices glow with {favoriteColor} energy when history is threatened", "they establish secret communication codes using ancient languages"]
      }
    },
    {
      text: "Their first official mission as Time Guardians takes them to Medieval England, where someone is trying to prevent the signing of the Magna Carta. {userName} uses their {hobbies} skills to blend in with the time period, while Kira's knowledge of ancient civilizations helps them understand the political situation, and Marcus applies his Roman strategic thinking to outmaneuver the saboteurs.",
      pause: true,
      hook: "How will they preserve one of history's most important documents?",
      microVariants: {
        text: "Medieval England becomes their testing ground as Time Guardians work to protect the historic Magna Carta from temporal saboteurs.",
        alternatives: ["Their diverse historical knowledge combines perfectly to address complex threats against fundamental democratic documents."],
        optionalDetails: ["they wear period-appropriate disguises made from {favoriteColor} fabrics", "the saboteurs use anachronistic technology that seems familiar"]
      }
    },
    {
      text: "Through their investigation, the three friends discover that the adult time thieves they captured were part of a larger organization trying to rewrite history for personal profit. The Medieval mission becomes their opportunity to gather evidence and build alliances with historical figures who can help them protect the timeline from future threats while maintaining secrecy about their true identities.",
      pause: true,
      hook: "What powerful allies will help them in their ongoing mission to protect history?",
      microVariants: {
        text: "Uncovering a larger conspiracy, the Time Guardians must build historical alliances while gathering evidence against temporal criminals.",
        alternatives: ["The Medieval investigation reveals a network of time criminals that requires careful historical detective work to defeat."],
        optionalDetails: ["they meet surprisingly familiar faces in different time periods", "historical figures prove more perceptive than expected about temporal anomalies"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName}, Kira, and Marcus successfully stop the time thieves and return all artifacts to their proper places in history. They become the secret Time Guardians, protecting history from those who would change it for personal gain.",
      microVariants: ["The three friends become legendary Time Guardians protecting history from manipulation.", "Their victory creates a secret organization dedicated to preserving historical truth."]
    },
    {
      type: 'cozy',
      text: "{userName} returns home with amazing memories and two best friends they can visit across time. They meet regularly in different time periods to share adventures and protect history together.",
      microVariants: ["Friendship across time periods creates endless opportunities for historical adventures.", "The three friends maintain their bond despite living in different centuries."]
    },
    {
      type: 'reflective',
      text: "{userName} learns that understanding history helps us make better decisions in the present. Their time-travel adventures teach them that every generation faces similar challenges and that learning from the past creates wisdom for the future.",
      microVariants: ["Time travel teaches {userName} that historical knowledge provides wisdom for present-day decision-making.", "Understanding different time periods helps {userName} appreciate how past experiences guide future choices."]
    },
    {
      type: 'silly',
      text: "The three friends become time-traveling tour guides, taking {favoriteAnimal} pets on historical adventures! They specialize in {favoriteColor} costume tours where visitors experience history while dressed in the most ridiculous but historically accurate outfits from each era.",
      microVariants: ["Time-traveling pet tours become the most entertaining way to learn history while wearing silly period costumes.", "Historical education becomes wonderfully absurd when combined with animal companions and outrageous authentic clothing."]
    }
  ],
  reuse: {
    swappableElements: {
      "time_periods": ["Ancient Egypt", "Roman Empire", "Medieval times", "Renaissance"],
      "artifacts": ["statues", "scrolls", "jewelry", "tools"],
      "historical_figures": ["pharaohs", "emperors", "scholars", "artists"]
    },
    weatherVariants: ["under desert sun", "by torch light", "during sandstorms", "under starry skies"],
    settingVariants: ["pyramids", "temples", "ancient cities", "hidden chambers"]
  }
};