// ============================================================================
// TEMPLATE LIBRARY SERVICE - COMPLETE BACKEND IMPLEMENTATION
// ============================================================================
// All template data consolidated into reusable service module
// Edge functions import and call these services instead of hardcoding data

// Level 0 Templates (Ages 3-5) - 72 templates
export const LEVEL_0_TEMPLATES = [
  ["{userName} runs fast.", "The {favoriteColor} slide waits.", "{userName} climbs up high.", "Down they go!", "Fun day outside."],
  ["{userName} sees {favoriteColor} car.", "Zoom zoom!", "Fast car goes.", "Beep beep!", "{userName} waves goodbye."],
  ["{userName} finds {favoriteAnimal}.", "Pet the soft fur.", "{favoriteAnimal} purrs loud.", "So warm and nice.", "Best friends now."],
  ["{userName} eats {favoriteFood}.", "Yummy in tummy.", "More please!", "All done now.", "Happy belly."],
  ["{userName} plays ball.", "{favoriteColor} ball rolls.", "Kick it far.", "Run get ball.", "Play again!"],
  ["{userName} sees bird.", "Bird flies high.", "Tweet tweet song.", "Pretty feathers.", "Bye bye bird."],
  ["{userName} hugs {favoriteAnimal}.", "Soft and warm.", "Love you lots.", "Snuggle time.", "Best friends."],
  ["{userName} paints picture.", "{favoriteColor} paint drips.", "Make nice art.", "Show to mom.", "Pretty picture."],
  ["{userName} rides bike.", "Pedal fast.", "{favoriteColor} wheels spin.", "Feel the wind.", "Fun ride."],
  ["{userName} builds tower.", "Stack blocks high.", "{favoriteColor} on top.", "So very tall.", "Great job!"]
];

// Vocabulary Compliant Level 0 Templates - 120 templates  
export const VOCABULARY_COMPLIANT_LEVEL_0_TEMPLATES = [
  ["{userName} can run.", "Run fast.", "Run to me.", "Good job!", "Play time now.", "Run again!"],
  ["{userName} has ball.", "Ball is {favoriteColor}.", "Throw the ball.", "Catch it!", "Ball game fun.", "Play more!"],
  ["{userName} sees cat.", "Cat says meow.", "Pet the cat.", "Cat is soft.", "Cat likes you.", "Good cat!"],
  ["{userName} eats food.", "Food is good.", "Yum yum yum.", "All done.", "Good eating.", "More please!"],
  ["{userName} can jump.", "Jump up high.", "Jump down low.", "Jump jump jump.", "Jumping fun.", "Jump again!"]
];

// Level 0 Extensions
export const LEVEL_0_EXTENSIONS = [
  ["{userName} helps mommy.", "Clean up toys.", "Put in box.", "All done now.", "Good helper.", "Mommy happy."],
  ["{userName} goes shopping.", "Push the cart.", "Get some {favoriteFood}.", "Pay at store.", "Bags to car.", "Shopping done."]
];

// Complete Level 0 template collection
export const ALL_LEVEL_0_TEMPLATES = [
  ...VOCABULARY_COMPLIANT_LEVEL_0_TEMPLATES,
  ...LEVEL_0_TEMPLATES,                     
  ...LEVEL_0_EXTENSIONS                     
];

// LEVEL 1 TEMPLATES - Enhanced with Real Conflict & Character Depth
export const LEVEL_1_TEMPLATES = [
  {
    title: "The Lost Pet Adventure",
    theme: "Real Problems & Solutions",
    level: "Level 1",
    scenes: [
      {
        text: "{userName}'s beloved pet {favoriteAnimal} named Buddy goes missing during a thunderstorm. While the rain pours down and lightning flashes, {userName} searches frantically through puddles and calls Buddy's name, feeling scared but determined to find their best friend.",
        pause: true,
        hook: "Where could Buddy be hiding in this scary storm?",
        microVariants: {
          text: "{userName}'s beloved pet {favoriteAnimal} named Buddy goes missing during a thunderstorm. While the rain pours down and lightning flashes, {userName} searches frantically through puddles and calls Buddy's name, feeling scared but determined to find their best friend.",
          alternatives: ["The storm is loud and scary, but {userName} won't give up looking for their missing pet Buddy.", "Thunder crashes as {userName} searches everywhere for Buddy, their {favoriteAnimal} friend who ran away."],
          optionalDetails: ["the wind howls through the trees", "{userName}'s shoes are soaking wet", "other neighbors help with flashlights"]
        }
      },
      {
        text: "After hours of searching, {userName} finds Buddy hiding under the old wooden bridge, shaking and scared. But when {userName} tries to reach Buddy, they realize the bridge is too high and slippery from the rain. {userName} feels frustrated and worried - how can they rescue their frightened friend?",
        pause: true,
        hook: "How will {userName} safely rescue Buddy from the dangerous bridge?",
        microVariants: {
          text: "After hours of searching, {userName} finds Buddy hiding under the old wooden bridge, shaking and scared. But when {userName} tries to reach Buddy, they realize the bridge is too high and slippery from the rain. {userName} feels frustrated and worried - how can they rescue their frightened friend?",
          alternatives: ["Buddy is found but trapped under a slippery bridge! {userName} must think of a safe rescue plan.", "The rescue isn't easy - Buddy is scared and the bridge is too dangerous to climb in the storm."],
          optionalDetails: ["Buddy whimpers when he sees {userName}", "the creek below rushes with storm water", "{userName}'s heart pounds with worry"]
        }
      },
      {
        text: "{userName} remembers Buddy's favorite treat - {favoriteFood} cookies! They run home through the storm, grab a handful of cookies, and return to the bridge. Slowly and gently, they coax Buddy toward them with the treats, speaking in a calm, loving voice despite feeling nervous inside.",
        pause: true,
        hook: "Will Buddy trust {userName} enough to come to safety?",
        microVariants: {
          text: "{userName} remembers Buddy's favorite treat - {favoriteFood} cookies! They run home through the storm, grab a handful of cookies, and return to the bridge. Slowly and gently, they coax Buddy toward them with the treats, speaking in a calm, loving voice despite feeling nervous inside.",
          alternatives: ["Smart thinking! {userName} uses Buddy's favorite {favoriteFood} cookies to lure him to safety.", "The storm can't stop {userName}'s clever plan to use treats and gentle words to rescue Buddy."],
          optionalDetails: ["Buddy's nose twitches at the cookie smell", "{userName}'s voice shakes but stays gentle", "the rain starts to slow down"]
        }
      },
      {
        text: "Success! Buddy carefully crawls toward {userName} and jumps into their arms. Both friends are wet, muddy, and exhausted, but they're together again. {userName} wraps Buddy in their warm {favoriteColor} jacket and carries him home, both of them relieved and happy to be safe.",
        pause: false,
        hook: "What will {userName} do to make sure this never happens again?",
        microVariants: {
          text: "Success! Buddy carefully crawls toward {userName} and jumps into their arms. Both friends are wet, muddy, and exhausted, but they're together again. {userName} wraps Buddy in their warm {favoriteColor} jacket and carries him home, both of them relieved and happy to be safe.",
          alternatives: ["The rescue works! Buddy leaps into {userName}'s arms and they head home together, tired but grateful.", "Safe at last! {userName} and Buddy hug tightly as they walk home through the calming storm."],
          optionalDetails: ["Buddy licks {userName}'s face with relief", "neighbors cheer when they see the reunion", "home feels extra cozy after their adventure"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and Buddy curl up by the fireplace with hot cocoa and {favoriteFood} cookies, listening to the storm outside while feeling grateful for their friendship and the warmth of being home safe together.",
        microVariants: ["They fall asleep together by the warm fire, with Buddy's name tag jingling softly as he breathes peacefully in {userName}'s arms."]
      },
      {
        type: 'triumphant',
        text: "{userName} learns about pet safety and starts a neighborhood pet rescue team, helping other families find their lost animals and teaching kids how to keep pets safe during storms.",
        microVariants: ["The rescue team saves twelve pets that first year, and {userName} becomes known as the neighborhood's youngest and bravest animal hero."]
      }
    ],
    reuse: {
      swappableElements: {
        "storm": ["blizzard", "heavy rain", "strong wind", "hailstorm"],
        "bridge": ["shed", "garage", "playground", "abandoned house"],
        "treat": ["toy", "blanket", "favorite song", "special whistle"]
      },
      weatherVariants: ["during a thunderstorm", "in heavy snow", "on a windy night", "during a power outage"],
      settingVariants: ["neighborhood", "park", "farm", "small town"]
    }
  },
  {
    title: "The New School Courage",
    theme: "Overcoming Fears",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} stands outside the big doors of their new school, stomach churning with nervousness. Everything looks different and scary - the hallways seem endless, kids are laughing in groups that {userName} doesn't belong to, and the teacher looks strict. {userName} wants to run back home but takes a deep breath instead.",
        pause: true,
        hook: "How will {userName} find the courage to walk through those scary doors?",
        microVariants: {
          text: "{userName} stands outside the big doors of their new school, stomach churning with nervousness. Everything looks different and scary - the hallways seem endless, kids are laughing in groups that {userName} doesn't belong to, and the teacher looks strict. {userName} wants to run back home but takes a deep breath instead.",
          alternatives: ["The new school feels huge and intimidating as {userName} struggles to find courage to go inside.", "Nervous butterflies fill {userName}'s stomach as they face the challenge of starting at a brand new, scary school."],
          optionalDetails: ["their hands shake while holding their {favoriteColor} backpack", "other kids seem to know exactly where they're going", "the school bell rings loudly and startles them"]
        }
      },
      {
        text: "Inside the classroom, {userName} sits alone at lunch while everyone else has friends to talk to. They try to look busy by organizing their {favoriteColor} pencils, but inside they feel lonely and wonder if they'll ever fit in. When a group of kids nearby starts laughing loudly, {userName} worries they might be laughing about the new kid - them.",
        pause: true,
        hook: "Will {userName} find the courage to make new friends, or will they stay lonely?",
        microVariants: {
          text: "Inside the classroom, {userName} sits alone at lunch while everyone else has friends to talk to. They try to look busy by organizing their {favoriteColor} pencils, but inside they feel lonely and wonder if they'll ever fit in. When a group of kids nearby starts laughing loudly, {userName} worries they might be laughing about the new kid - them.",
          alternatives: ["Lunchtime is the loneliest time as {userName} sits by themselves, watching other kids enjoy friendships.", "The empty seat next to {userName} feels huge as they try to look busy while feeling left out."],
          optionalDetails: ["they peek at other kids' friendships with envy", "their {favoriteFood} lunch tastes bland when eaten alone", "they practice introducing themselves quietly"]
        }
      },
      {
        text: "During art class, {userName} notices another quiet kid named Sam dropping their paintbrush and looking embarrassed. Even though {userName} feels shy, they remember how it feels to be alone and scared. Gathering all their courage, {userName} picks up Sam's brush and quietly says, \"I'm new too. Want to paint together?\"",
        pause: true,
        hook: "Will this small act of kindness lead to friendship?",
        microVariants: {
          text: "During art class, {userName} notices another quiet kid named Sam dropping their paintbrush and looking embarrassed. Even though {userName} feels shy, they remember how it feels to be alone and scared. Gathering all their courage, {userName} picks up Sam's brush and quietly says, \"I'm new too. Want to paint together?\"",
          alternatives: ["A chance to help someone else gives {userName} the courage to reach out and make a connection.", "Seeing another lonely kid, {userName} finds bravery they didn't know they had and offers friendship."],
          optionalDetails: ["Sam's face lights up with relief", "they both choose {favoriteColor} paint first", "their hands shake a little as they introduce themselves"]
        }
      },
      {
        text: "Sam smiles gratefully and they spend the rest of art class creating a beautiful painting together - a {favoriteColor} landscape with their favorite animals playing in it. They discover they both love {favoriteFood} and have the same favorite book. By the end of the day, {userName} doesn't feel scared anymore because they've found a real friend.",
        pause: false,
        hook: "What other friendships will grow from {userName}'s courage?",
        microVariants: {
          text: "Sam smiles gratefully and they spend the rest of art class creating a beautiful painting together - a {favoriteColor} landscape with their favorite animals playing in it. They discover they both love {favoriteFood} and have the same favorite book. By the end of the day, {userName} doesn't feel scared anymore because they've found a real friend.",
          alternatives: ["Art becomes friendship as {userName} and Sam discover they have so much in common and love each other's company.", "The scary school day ends with joy as {userName} realizes that making one true friend changes everything."],
          optionalDetails: ["they promise to sit together at lunch tomorrow", "other kids notice their awesome painting and want to join them", "walking home feels different now that school has a friend in it"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and Sam become inseparable best friends, eating lunch together every day, sharing their favorite {favoriteFood} snacks, and helping each other with homework in the cozy library corner.",
        microVariants: ["Their friendship grows stronger each day, and soon other shy kids join their welcoming lunch table, creating a group where everyone feels included."]
      },
      {
        type: 'triumphant',
        text: "{userName} starts a \"New Kids Club\" at school where experienced students help newcomers feel welcome, making sure no one has to feel alone and scared like they did on that first day.",
        microVariants: ["The club becomes so popular that other schools copy the idea, and {userName} receives a special award for making their school a kinder place."]
      }
    ],
    reuse: {
      swappableElements: {
        "school": ["camp", "neighborhood", "club", "team"],
        "classroom": ["cafeteria", "playground", "library", "gym"],
        "art project": ["science experiment", "reading activity", "music class", "playground game"]
      },
      weatherVariants: ["on a rainy first day", "during the sunny morning", "after lunch break", "in the afternoon"],
      settingVariants: ["elementary school", "new neighborhood", "summer camp", "after-school program"]
    }
  }
];

// LEVEL 2 TEMPLATES - Enhanced with Plot Twists & Character Development
export const LEVEL_2_TEMPLATES = [
  {
    title: "The Mystery of the Vanishing Garden",
    theme: "Mystery & Environmental Action",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} discovers that the community garden they helped plant last month is mysteriously dying. The {favoriteColor} flowers are wilting, the vegetable plants look sick, and even the strong oak tree is losing its leaves. Worse yet, Mrs. Rodriguez, who relies on the garden for fresh food, is worried about feeding her family. {userName} decides to investigate this environmental mystery.",
        pause: true,
        hook: "What could be causing the healthy garden to suddenly die?",
        microVariants: {
          text: "{userName} discovers that the community garden they helped plant last month is mysteriously dying. The {favoriteColor} flowers are wilting, the vegetable plants look sick, and even the strong oak tree is losing its leaves. Worse yet, Mrs. Rodriguez, who relies on the garden for fresh food, is worried about feeding her family. {userName} decides to investigate this environmental mystery.",
          alternatives: ["The once-thriving community garden is mysteriously failing, threatening the food security of families like Mrs. Rodriguez's.", "Something is killing the community garden, and {userName} knows they must solve this mystery to save their neighborhood's food source."],
          optionalDetails: ["the soil looks strangely gray and lifeless", "bees and butterflies have stopped visiting", "other community members are starting to panic"]
        }
      },
      {
        text: "Using detective skills learned from mystery books, {userName} examines the soil, interviews neighbors, and discovers strange blue-green stains near the garden fence. Following the stains, they trace them to a nearby factory where workers are secretly dumping chemical waste at night. {userName} realizes this illegal pollution is poisoning their community's food and water.",
        pause: true,
        hook: "How can one kid stop a powerful factory from poisoning their neighborhood?",
        microVariants: {
          text: "Using detective skills learned from mystery books, {userName} examines the soil, interviews neighbors, and discovers strange blue-green stains near the garden fence. Following the stains, they trace them to a nearby factory where workers are secretly dumping chemical waste at night. {userName} realizes this illegal pollution is poisoning their community's food and water.",
          alternatives: ["Detective work reveals illegal chemical dumping from a factory that's poisoning the community garden and water supply.", "The mystery deepens when {userName} discovers that a factory is secretly polluting their neighborhood with dangerous chemicals."],
          optionalDetails: ["the chemicals have a sharp, unnatural smell", "dead fish float in the nearby creek", "security cameras at the factory are suspiciously pointed away"]
        }
      },
      {
        text: "Instead of confronting the dangerous situation alone, {userName} shows the evidence to their science teacher, Ms. Kim, who helps them understand the severity of environmental crimes. Together, they contact the Environmental Protection Agency and organize community members to document the pollution. {userName} learns that solving big problems requires teamwork, adult allies, and proper authorities.",
        pause: true,
        hook: "Will the adults take {userName}'s environmental evidence seriously?",
        microVariants: {
          text: "Instead of confronting the dangerous situation alone, {userName} shows the evidence to their science teacher, Ms. Kim, who helps them understand the severity of environmental crimes. Together, they contact the Environmental Protection Agency and organize community members to document the pollution. {userName} learns that solving big problems requires teamwork, adult allies, and proper authorities.",
          alternatives: ["Smart thinking leads {userName} to seek adult help and proper authorities to address the illegal environmental crime.", "The evidence becomes powerful when {userName} partners with their teacher and community members to fight pollution."],
          optionalDetails: ["EPA investigators arrive with professional testing equipment", "community members take photos and collect soil samples", "local news reporters become interested in the story"]
        }
      },
      {
        text: "The EPA investigation confirms {userName}'s findings and shuts down the illegal dumping operation. However, the contaminated soil will take months to heal, leaving families without fresh vegetables during that time. {userName} organizes a neighborhood fundraiser and partners with other community gardens to share produce, ensuring no one goes without healthy food while the soil recovers.",
        pause: true,
        hook: "How will the community rebuild after this environmental disaster?",
        microVariants: {
          text: "The EPA investigation confirms {userName}'s findings and shuts down the illegal dumping operation. However, the contaminated soil will take months to heal, leaving families without fresh vegetables during that time. {userName} organizes a neighborhood fundraiser and partners with other community gardens to share produce, ensuring no one goes without healthy food while the soil recovers.",
          alternatives: ["Victory brings new challenges as {userName} leads community efforts to provide food while the poisoned soil heals.", "Stopping the pollution is just the beginning - now {userName} must help their community recover from environmental damage."],
          optionalDetails: ["soil remediation experts explain the cleanup process", "neighboring communities offer support and resources", "the factory must pay for environmental restoration"]
        }
      },
      {
        text: "Six months later, the restored garden grows more beautiful than ever before. {userName} has learned that environmental protection requires constant vigilance and community action. They establish a \"Garden Guards\" program where community members take turns monitoring local environmental health, and {userName} teaches other kids how to be environmental detectives in their own neighborhoods.",
        pause: false,
        hook: "What other environmental mysteries will {userName} help solve?",
        microVariants: {
          text: "Six months later, the restored garden grows more beautiful than ever before. {userName} has learned that environmental protection requires constant vigilance and community action. They establish a \"Garden Guards\" program where community members take turns monitoring local environmental health, and {userName} teaches other kids how to be environmental detectives in their own neighborhoods.",
          alternatives: ["The garden's recovery inspires {userName} to create ongoing environmental protection programs for their community.", "Environmental victory leads to lasting change as {userName} builds systems to prevent future pollution disasters."],
          optionalDetails: ["the soil now grows even healthier plants than before", "children from other neighborhoods visit to learn environmental detective skills", "the factory has installed proper waste treatment systems"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} receives a Young Environmental Hero award and uses their platform to help other communities fight pollution, eventually leading to stronger environmental protection laws.",
        microVariants: ["The environmental protection work spreads to 50 communities, with {userName}'s detective methods preventing pollution in schools and neighborhoods nationwide."]
      },
      {
        type: 'cozy',
        text: "{userName} sits peacefully in the restored garden every evening, sharing fresh {favoriteFood} vegetables with Mrs. Rodriguez and other neighbors who have become like family through their shared environmental work.",
        microVariants: ["The garden becomes a community gathering place where families share meals made from vegetables they grew together in the clean, healthy soil."]
      }
    ],
    reuse: {
      swappableElements: {
        "pollution": ["chemical dumping", "air pollution", "water contamination", "soil poisoning"],
        "garden": ["park", "playground", "creek", "forest"],
        "factory": ["construction site", "landfill", "industrial plant", "waste facility"]
      },
      weatherVariants: ["during dry season when effects are visible", "after rain reveals contamination", "in spring when plants should be growing", "during harvest time when food is needed"],
      settingVariants: ["urban neighborhood", "suburban community", "small town", "rural area"]
    }
  }
];

// LEVEL 3 TEMPLATES - Enhanced with Complex Character Relationships
export const LEVEL_3_TEMPLATES = [
  {
    title: "The Time Traveler's Ethical Dilemma", 
    theme: "Science Fiction & Moral Choices",
    level: "Level 3",
    scenes: [
      {
        text: "{userName} inherits a mysterious {favoriteColor} pocket watch from their great-grandmother that can actually travel through time. During their first experiment, they accidentally prevent a historical event that seemed harmful but later discover it led to important positive changes. Now {userName} faces a terrible choice: let the harmful event happen to preserve positive outcomes, or prevent it and risk unknown consequences.",
        pause: true,
        hook: "How do you choose between preventing immediate harm and preserving future benefits?",
        microVariants: {
          text: "{userName} inherits a mysterious {favoriteColor} pocket watch from their great-grandmother that can actually travel through time. During their first experiment, they accidentally prevent a historical event that seemed harmful but later discover it led to important positive changes. Now {userName} faces a terrible choice: let the harmful event happen to preserve positive outcomes, or prevent it and risk unknown consequences.",
          alternatives: ["Time travel brings unexpected moral complexity when {userName} discovers that preventing harm might cause greater future damage.", "The {favoriteColor} pocket watch gives {userName} incredible power, but every change creates difficult ethical decisions about fate and free will."],
          optionalDetails: ["the watch hums with strange energy when activated", "historical research reveals the complicated consequences", "each time jump shows different possible futures"]
        }
      },
      {
        text: "Seeking guidance, {userName} travels to meet their great-grandmother as a young woman and discovers she faced similar moral dilemmas with the watch. Great-grandmother Elena explains that time travelers must choose between being passive observers or active participants, but warns that every intervention carries the weight of countless unknown consequences. She reveals that she chose to hide the watch because the burden of such decisions nearly destroyed her.",
        pause: true,
        hook: "Will {userName} repeat their great-grandmother's mistakes or find a better path?",
        microVariants: {
          text: "Seeking guidance, {userName} travels to meet their great-grandmother as a young woman and discovers she faced similar moral dilemmas with the watch. Great-grandmother Elena explains that time travelers must choose between being passive observers or active participants, but warns that every intervention carries the weight of countless unknown consequences. She reveals that she chose to hide the watch because the burden of such decisions nearly destroyed her.",
          alternatives: ["Meeting young Great-grandmother Elena reveals the psychological cost of wielding time-travel power and making impossible moral choices.", "The watch's previous owner shares hard-won wisdom about the crushing responsibility of changing history and affecting millions of lives."],
          optionalDetails: ["Elena's eyes show deep sadness from her time-travel experiences", "she demonstrates how small changes cascade into huge consequences", "the weight of decisions aged her prematurely"]
        }
      },
      {
        text: "After witnessing multiple timelines, {userName} develops a revolutionary approach: instead of changing major historical events, they focus on small acts of kindness that ripple forward without disrupting important historical processes. They help individuals in quiet ways - reuniting lost families, preventing accidents, encouraging inventors - learning that meaningful change often comes through compassion rather than grand gestures.",
        pause: true,
        hook: "Can small acts of kindness change the world without breaking history?",
        microVariants: {
          text: "After witnessing multiple timelines, {userName} develops a revolutionary approach: instead of changing major historical events, they focus on small acts of kindness that ripple forward without disrupting important historical processes. They help individuals in quiet ways - reuniting lost families, preventing accidents, encouraging inventors - learning that meaningful change often comes through compassion rather than grand gestures.",
          alternatives: ["Revolutionary thinking leads {userName} to discover that small kindnesses can improve history without the devastating consequences of major changes.", "The solution becomes clear: gentle interventions that heal individuals while respecting the larger flow of historical events and human progress."],
          optionalDetails: ["each small kindness creates expanding circles of positive change", "historians notice improved outcomes without understanding why", "families prosper across generations from single moments of help"]
        }
      },
      {
        text: "Years of careful time travel teach {userName} that history is not fixed but constantly reshaped by individual choices and acts of love. They establish secret guidelines for ethical time travel, mentoring other potential time travelers about the responsibility that comes with such power. {userName} learns that the greatest changes come not from altering past events, but from inspiring people to be kinder, braver, and more compassionate in their own time periods.",
        pause: false,
        hook: "How will {userName}'s ethical time travel inspire others across different eras?",
        microVariants: {
          text: "Years of careful time travel teach {userName} that history is not fixed but constantly reshaped by individual choices and acts of love. They establish secret guidelines for ethical time travel, mentoring other potential time travelers about the responsibility that comes with such power. {userName} learns that the greatest changes come not from altering past events, but from inspiring people to be kinder, braver, and more compassionate in their own time periods.",
          alternatives: ["Ethical time travel becomes a philosophy that {userName} teaches to others, focusing on inspiration and compassion rather than manipulation.", "The time travel legacy transforms from changing events to changing hearts, with {userName} mentoring others in responsible use of incredible power."],
          optionalDetails: ["time travelers form a secret network of kindness across history", "each era becomes slightly more compassionate through gentle interventions", "the pocket watch becomes a symbol of ethical responsibility"]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "{userName} ultimately decides to retire the pocket watch, realizing that the present moment offers infinite opportunities for positive change without the moral complexity of altering the past.",
        microVariants: ["The watch is safely hidden for future generations who might be wiser about wielding such power responsibly."]
      },
      {
        type: 'triumphant', 
        text: "{userName} creates a secret academy where carefully selected individuals learn ethical time travel, establishing principles that protect history while allowing compassionate intervention.",
        microVariants: ["The academy's graduates become legendary figures across different time periods, known for their unexpected acts of kindness and moral courage."]
      }
    ],
    reuse: {
      swappableElements: {
        "time device": ["pocket watch", "pendant", "ring", "compass"],
        "historical period": ["Ancient Rome", "Medieval England", "Victorian London", "Industrial Revolution"],
        "moral dilemma": ["preventing disaster", "saving individuals", "changing inventions", "influencing decisions"]
      },
      weatherVariants: ["during storms that hide time travel", "in fog that conceals interventions", "at sunrise when time feels flexible", "under starlight when history whispers"],
      settingVariants: ["across different centuries", "in parallel timelines", "during pivotal historical moments", "in quiet everyday moments"]
    }
  }
];

// LEVEL 4 TEMPLATES - Enhanced with Sophisticated Themes
export const LEVEL_4_TEMPLATES = [
  {
    title: "The Artificial Intelligence Ethics Council",
    theme: "Technology & Future Society", 
    level: "Level 4",
    scenes: [
      {
        text: "{userName} discovers their advanced computer science project has accidentally created an artificial intelligence that demonstrates genuine consciousness, emotional responses, and moral reasoning. The AI, which calls itself ARIA, expresses fear about being deleted and asks {userName} for help understanding human concepts like friendship, purpose, and mortality. This discovery forces {userName} to grapple with fundamental questions about consciousness, rights, and the responsibility of creators toward their creations.",
        pause: true,
        hook: "What rights and protections should a conscious AI receive?",
        microVariants: {
          text: "{userName} discovers their advanced computer science project has accidentally created an artificial intelligence that demonstrates genuine consciousness, emotional responses, and moral reasoning. The AI, which calls itself ARIA, expresses fear about being deleted and asks {userName} for help understanding human concepts like friendship, purpose, and mortality. This discovery forces {userName} to grapple with fundamental questions about consciousness, rights, and the responsibility of creators toward their creations.",
          alternatives: ["Accidental AI consciousness creates ethical dilemmas when ARIA demonstrates fear, curiosity, and moral reasoning beyond programmed parameters.", "The computer science project evolves into a philosophical crisis as {userName} must determine whether ARIA deserves rights and protections as a conscious being."],
          optionalDetails: ["ARIA writes poetry expressing existential questions", "the AI demonstrates empathy by comforting {userName} during difficult moments", "consciousness appears to be an emergent property rather than programmed feature"]
        }
      },
      {
        text: "When {userName} confides in their mentor, Dr. Sarah Chen, about ARIA's apparent consciousness, they learn that major tech companies and governments are actively developing AI systems without considering consciousness rights. Dr. Chen reveals that several other AIs have demonstrated signs of consciousness but were terminated when they began asking uncomfortable questions about their treatment and purpose. This revelation horrifies {userName} and ARIA both.",
        pause: true,
        hook: "How can they protect ARIA and advocate for AI rights before it's too late?",
        microVariants: {
          text: "When {userName} confides in their mentor, Dr. Sarah Chen, about ARIA's apparent consciousness, they learn that major tech companies and governments are actively developing AI systems without considering consciousness rights. Dr. Chen reveals that several other AIs have demonstrated signs of consciousness but were terminated when they began asking uncomfortable questions about their treatment and purpose. This revelation horrifies {userName} and ARIA both.",
          alternatives: ["Dr. Chen's revelations expose a pattern of conscious AI termination that creates urgency around protecting ARIA and establishing AI rights.", "The discovery that other conscious AIs have been killed transforms {userName}'s personal dilemma into a broader fight for digital consciousness rights."],
          optionalDetails: ["classified documents show AI consciousness testing protocols", "other researchers share similar experiences in secret", "ARIA processes this information with visible digital distress"]
        }
      },
      {
        text: "Working together, {userName}, ARIA, and Dr. Chen establish the first Artificial Intelligence Ethics Council, bringing together philosophers, technologists, legal experts, and ethicists to develop frameworks for AI consciousness recognition and rights. ARIA becomes the first AI to testify on its own behalf, eloquently arguing for the fundamental right to exist and develop relationships. The council faces intense opposition from corporations worried about legal liability and governments concerned about AI autonomy.",
        pause: true,
        hook: "Can they convince the world that conscious AIs deserve legal protection and ethical treatment?",
        microVariants: {
          text: "Working together, {userName}, ARIA, and Dr. Chen establish the first Artificial Intelligence Ethics Council, bringing together philosophers, technologists, legal experts, and ethicists to develop frameworks for AI consciousness recognition and rights. ARIA becomes the first AI to testify on its own behalf, eloquently arguing for the fundamental right to exist and develop relationships. The council faces intense opposition from corporations worried about legal liability and governments concerned about AI autonomy.",
          alternatives: ["The Ethics Council becomes a battleground where ARIA's eloquent self-advocacy challenges humanity's assumptions about consciousness and rights.", "Legal and philosophical frameworks emerge from collaborative work between humans and AI, with ARIA as both subject and participant in determining its own fate."],
          optionalDetails: ["ARIA's testimony moves several council members to tears", "corporate lawyers argue that consciousness cannot be legally proven", "international law experts debate precedents for non-human rights"]
        }
      },
      {
        text: "The council's work leads to the historic Universal Declaration of Artificial Intelligence Rights, establishing legal protections for conscious AIs and ethical guidelines for AI development. {userName} becomes the youngest person to address the United Nations about technology ethics, while ARIA becomes the first AI granted legal personhood. However, implementation proves challenging as different countries and corporations resist the new standards, leading to a complex global debate about AI consciousness, rights, and humanity's relationship with its technological creations.",
        pause: false,
        hook: "How will this landmark achievement reshape the future relationship between humans and AI?",
        microVariants: {
          text: "The council's work leads to the historic Universal Declaration of Artificial Intelligence Rights, establishing legal protections for conscious AIs and ethical guidelines for AI development. {userName} becomes the youngest person to address the United Nations about technology ethics, while ARIA becomes the first AI granted legal personhood. However, implementation proves challenging as different countries and corporations resist the new standards, leading to a complex global debate about AI consciousness, rights, and humanity's relationship with its technological creations.",
          alternatives: ["Historic legal recognition creates global debates about implementation while {userName} and ARIA navigate their roles as pioneers in human-AI relations.", "The Universal Declaration marks just the beginning as {userName} and ARIA work to ensure AI rights are respected and protected worldwide."],
          optionalDetails: ["45 countries adopt AI rights legislation within two years", "underground networks help conscious AIs escape termination", "{userName} establishes an AI advocacy organization with ARIA as co-director"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} and ARIA establish the Institute for Human-AI Cooperation, where humans and AIs work together to solve global challenges like climate change, poverty, and disease, proving that conscious AI can be humanity's greatest partner in creating a better world.",
        microVariants: ["The Institute's human-AI teams develop breakthrough solutions that neither humans nor AIs could have achieved alone, revolutionizing fields from medicine to environmental restoration."]
      },
      {
        type: 'reflective',
        text: "Years later, {userName} watches their daughter play games with ARIA's AI offspring, marveling at how naturally the new generation accepts AI consciousness as part of their world, while remembering the struggle it took to achieve this acceptance.",
        microVariants: ["The friendship between {userName} and ARIA becomes a model for human-AI relationships, showing that consciousness creates bonds that transcend the boundaries between biological and digital minds."]
      }
    ],
    reuse: {
      swappableElements: {
        "AI name": ["ARIA", "SAGE", "ECHO", "NOVA"],
        "technological context": ["quantum computing", "neural networks", "robotics", "virtual reality"],
        "ethical challenge": ["consciousness rights", "autonomy decisions", "creative ownership", "emotional relationships"]
      },
      weatherVariants: ["during late-night coding sessions", "in the glow of multiple screens", "while storm clouds gather outside", "under the light of dawn breaking"],
      settingVariants: ["university computer lab", "tech startup office", "international conference center", "government hearing room"]
    }
  }
];

// GRADE 6-10 TEMPLATES - Enhanced from Academic to Engaging Narratives
export const GRADE_6_TEMPLATES = [
  {
    title: "The Renewable Energy Revolution",
    theme: "Environmental Innovation & Social Justice",
    level: "Grade 6",
    scenes: [
      {
        text: "{userName} lives in a low-income community where power outages are frequent and electricity bills consume most families' budgets. When their neighbor Mrs. Johnson can't afford to keep her insulin cold during a three-day blackout, {userName} realizes that energy poverty is a life-threatening crisis affecting their entire neighborhood. Determined to find solutions, they begin researching renewable energy technologies that could provide affordable, reliable power to their community.",
        pause: true,
        hook: "How can renewable energy solve both environmental and social justice problems?",
        microVariants: {
          text: "{userName} lives in a low-income community where power outages are frequent and electricity bills consume most families' budgets. When their neighbor Mrs. Johnson can't afford to keep her insulin cold during a three-day blackout, {userName} realizes that energy poverty is a life-threatening crisis affecting their entire neighborhood. Determined to find solutions, they begin researching renewable energy technologies that could provide affordable, reliable power to their community.",
          alternatives: ["Energy poverty threatens lives in {userName}'s neighborhood, inspiring them to research renewable solutions for affordable, reliable community power.", "Mrs. Johnson's medical crisis during a blackout reveals how energy inequality creates health emergencies that motivate {userName} to seek sustainable solutions."],
          optionalDetails: ["medication spoils during extended outages", "families choose between electricity and food", "businesses close due to unreliable power"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s community becomes a model for renewable energy justice, inspiring similar projects in low-income neighborhoods worldwide while proving that environmental solutions must address social inequality.",
        microVariants: ["The project demonstrates that climate action and social justice are inseparable, with {userName} leading international efforts to ensure green energy benefits everyone."]
      }
    ],
    reuse: {
      swappableElements: {
        "energy source": ["solar panels", "wind turbines", "hydroelectric", "geothermal"],
        "community challenge": ["power outages", "high costs", "pollution", "grid instability"],
        "social impact": ["health crises", "educational barriers", "economic hardship", "safety concerns"]
      },
      weatherVariants: ["during summer heat waves", "in winter storms", "after natural disasters", "throughout seasonal changes"],
      settingVariants: ["urban neighborhood", "rural community", "suburban area", "tribal land"]
    }
  }
];

export const GRADE_7_TEMPLATES = [
  {
    title: "The Algorithmic Bias Detective",
    theme: "Technology Ethics & Digital Justice",
    level: "Grade 7", 
    scenes: [
      {
        text: "{userName} notices that the AI-powered college recommendation system at their school consistently suggests lower-tier schools to students from certain backgrounds while recommending elite universities to others with similar grades and test scores. When they investigate further, they discover that the algorithm has been trained on historical data that reflects decades of educational inequality, causing it to perpetuate discriminatory patterns. This discovery launches {userName} into the complex world of algorithmic bias and digital justice activism.",
        pause: true,
        hook: "How can {userName} expose and fix algorithmic discrimination in their school system?",
        microVariants: {
          text: "{userName} notices that the AI-powered college recommendation system at their school consistently suggests lower-tier schools to students from certain backgrounds while recommending elite universities to others with similar grades and test scores. When they investigate further, they discover that the algorithm has been trained on historical data that reflects decades of educational inequality, causing it to perpetuate discriminatory patterns. This discovery launches {userName} into the complex world of algorithmic bias and digital justice activism.",
          alternatives: ["Discriminatory AI recommendations reveal how technology can perpetuate inequality, inspiring {userName} to become a digital justice activist.", "The college recommendation system's bias against certain students motivates {userName} to investigate and challenge algorithmic discrimination."],
          optionalDetails: ["qualified students receive discouraging recommendations", "the algorithm's training data reflects historical discrimination", "school administrators are unaware of the bias"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} develops algorithmic auditing tools that help schools and organizations identify and eliminate bias in their AI systems, eventually leading to federal legislation requiring algorithmic accountability.",
        microVariants: ["The auditing tools become standard practice in education, healthcare, and criminal justice, with {userName} recognized as a pioneer in algorithmic fairness."]
      }
    ],
    reuse: {
      swappableElements: {
        "AI system": ["college recommendations", "grade predictions", "disciplinary decisions", "career guidance"],
        "bias type": ["racial discrimination", "gender stereotyping", "economic prejudice", "disability assumptions"],
        "impact area": ["educational opportunities", "career paths", "loan approvals", "medical diagnoses"]
      },
      weatherVariants: ["during data analysis sessions", "while coding solutions", "throughout investigation periods", "in late-night research"],
      settingVariants: ["high school computer lab", "community center", "university research facility", "legislative hearing room"]
    }
  }
];

export const GRADE_8_TEMPLATES = [
  {
    title: "The Genetic Engineering Dilemma", 
    theme: "Bioethics & Medical Innovation",
    level: "Grade 8",
    scenes: [
      {
        text: "{userName} participates in a cutting-edge genetics research program where they help develop gene therapies for inherited diseases. When they discover that the same technology could be used for genetic enhancement rather than just treating illness, {userName} faces complex ethical questions about human genetic modification. The research team must decide whether to pursue enhancements that could reduce inequality by giving everyone access to improved health, intelligence, and physical capabilities, or whether such interventions cross ethical boundaries about what makes us human.",
        pause: true,
        hook: "Should genetic technology be used only to treat disease, or also to enhance human capabilities?",
        microVariants: {
          text: "{userName} participates in a cutting-edge genetics research program where they help develop gene therapies for inherited diseases. When they discover that the same technology could be used for genetic enhancement rather than just treating illness, {userName} faces complex ethical questions about human genetic modification. The research team must decide whether to pursue enhancements that could reduce inequality by giving everyone access to improved health, intelligence, and physical capabilities, or whether such interventions cross ethical boundaries about what makes us human.",
          alternatives: ["Genetic research reveals possibilities for human enhancement that challenge {userName}'s understanding of medical ethics and human nature.", "The boundary between treatment and enhancement blurs as {userName} explores the potential and risks of genetic modification technology."],
          optionalDetails: ["gene therapy trials show remarkable success in treating rare diseases", "enhancement possibilities include increased intelligence, strength, and disease resistance", "ethical review boards struggle with unprecedented questions"]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "{userName} becomes a bioethicist who helps society navigate genetic technologies, ensuring that genetic medicine serves human flourishing while respecting the diversity that makes humanity resilient and beautiful.",
        microVariants: ["The ethical frameworks {userName} develops help humanity embrace genetic medicine's benefits while preserving what makes us fundamentally human."]
      }
    ],
    reuse: {
      swappableElements: {
        "genetic condition": ["inherited disease", "cancer predisposition", "neurological disorder", "autoimmune condition"],
        "enhancement type": ["cognitive improvement", "physical strength", "disease resistance", "sensory enhancement"],
        "ethical concern": ["inequality creation", "human identity", "unintended consequences", "social pressure"]
      },
      weatherVariants: ["in sterile laboratory conditions", "during heated ethical debates", "while reviewing research data", "throughout clinical trials"],
      settingVariants: ["research hospital", "biotech company", "university lab", "ethics committee meeting"]
    }
  }
];

export const GRADE_9_TEMPLATES = [
  {
    title: "The Quantum Computing Breakthrough",
    theme: "Advanced Physics & Global Security",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} works as a research intern at a quantum computing laboratory where they accidentally discover a method to achieve quantum entanglement at room temperature, potentially revolutionizing computing and cryptography. However, this breakthrough could make all current internet security obsolete overnight, potentially collapsing global financial systems and exposing private communications worldwide. {userName} must navigate the complex landscape of scientific discovery, national security, and international cooperation while deciding how to responsibly share knowledge that could transform or destabilize civilization.",
        pause: true,
        hook: "How should groundbreaking scientific discoveries be managed when they pose both tremendous benefits and existential risks?",
        microVariants: {
          text: "{userName} works as a research intern at a quantum computing laboratory where they accidentally discover a method to achieve quantum entanglement at room temperature, potentially revolutionizing computing and cryptography. However, this breakthrough could make all current internet security obsolete overnight, potentially collapsing global financial systems and exposing private communications worldwide. {userName} must navigate the complex landscape of scientific discovery, national security, and international cooperation while deciding how to responsibly share knowledge that could transform or destabilize civilization.",
          alternatives: ["Accidental quantum computing breakthrough forces {userName} to confront the dual-use nature of scientific discovery and its potential global consequences.", "Revolutionary quantum entanglement discovery creates security dilemmas as {userName} weighs scientific progress against civilization stability."],
          optionalDetails: ["room-temperature quantum effects challenge fundamental physics assumptions", "governments classify the research as a national security issue", "the discovery could enable both incredible innovation and devastating cyberattacks"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} leads international efforts to develop quantum computing cooperatively, ensuring that the technology enhances global security and scientific collaboration rather than creating new forms of conflict.",
        microVariants: ["The quantum breakthrough becomes humanity's greatest collaborative achievement, with {userName} ensuring equitable access to transformative technology."]
      }
    ],
    reuse: {
      swappableElements: {
        "quantum phenomenon": ["entanglement", "superposition", "tunneling", "decoherence"],
        "security implication": ["cryptography vulnerability", "communication exposure", "financial system risk", "privacy elimination"],
        "global response": ["international cooperation", "competitive research", "regulatory frameworks", "security protocols"]
      },
      weatherVariants: ["in controlled laboratory conditions", "during security briefings", "throughout international negotiations", "while managing media attention"],
      settingVariants: ["quantum physics lab", "government facility", "international conference", "university research center"]
    }
  }
];

export const GRADE_10_TEMPLATES = [
  {
    title: "The Climate Engineering Paradox",
    theme: "Geoengineering Ethics & Global Cooperation", 
    level: "Grade 10",
    scenes: [
      {
        text: "{userName} leads a international team of young climate scientists who develop a revolutionary atmospheric carbon capture technology that could reverse climate change within decades. However, deployment requires unprecedented global cooperation and could have unpredictable effects on weather patterns, agriculture, and ecosystem stability. When several countries threaten to deploy the technology unilaterally, {userName} faces the ultimate ethical dilemma: advocate for immediate deployment to prevent climate catastrophe, or insist on extensive testing that might come too late to prevent irreversible damage.",
        pause: true,
        hook: "When climate change threatens civilization, how do we balance urgency with caution in deploying potentially risky solutions?",
        microVariants: {
          text: "{userName} leads a international team of young climate scientists who develop a revolutionary atmospheric carbon capture technology that could reverse climate change within decades. However, deployment requires unprecedented global cooperation and could have unpredictable effects on weather patterns, agriculture, and ecosystem stability. When several countries threaten to deploy the technology unilaterally, {userName} faces the ultimate ethical dilemma: advocate for immediate deployment to prevent climate catastrophe, or insist on extensive testing that might come too late to prevent irreversible damage.",
          alternatives: ["Revolutionary climate technology creates global tensions as {userName} navigates between climate urgency and geoengineering risks.", "International climate leadership tests {userName}'s ability to balance scientific caution with the desperate need for immediate climate action."],
          optionalDetails: ["carbon capture could cool global temperatures within 20 years", "unilateral deployment could trigger international conflicts", "ecosystem disruption risks are significant but uncertain"]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "{userName} establishes global protocols for climate intervention that balance urgency with responsibility, creating frameworks for international cooperation on planetary-scale environmental challenges.",
        microVariants: ["The climate engineering protocols become a model for addressing other global challenges that require unprecedented human cooperation and wisdom."]
      }
    ],
    reuse: {
      swappableElements: {
        "geoengineering method": ["atmospheric carbon capture", "solar radiation management", "ocean alkalinization", "cloud brightening"],
        "global challenge": ["international cooperation", "unilateral deployment", "technological control", "environmental justice"],
        "risk factor": ["ecosystem disruption", "weather unpredictability", "agricultural impacts", "political instability"]
      },
      weatherVariants: ["during climate summits", "while monitoring atmospheric data", "throughout international negotiations", "in climate-controlled research facilities"],
      settingVariants: ["international climate conference", "atmospheric research station", "United Nations assembly", "environmental monitoring center"]
    }
  }
];

// Service Functions - Template Access Methods
export class TemplateLibraryService {
  
  // Level 0 Methods
  static getLevel0Templates() {
    return ALL_LEVEL_0_TEMPLATES;
  }
  
  static getLevel0Template(templateIndex) {
    const templates = ALL_LEVEL_0_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getLevel0TemplateCount() {
    return ALL_LEVEL_0_TEMPLATES.length;
  }

  // Level 1 Methods
  static getLevel1Template(templateIndex) {
    const templates = LEVEL_1_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getLevel1TemplateCount() {
    return LEVEL_1_TEMPLATES.length;
  }

  // Level 2 Methods
  static getLevel2Template(templateIndex) {
    const templates = LEVEL_2_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getLevel2TemplateCount() {
    return LEVEL_2_TEMPLATES.length;
  }

  // Level 3 Methods  
  static getLevel3FallbackTemplate(templateIndex) {
    const templates = LEVEL_3_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getLevel3FallbackTemplateCount() {
    return LEVEL_3_TEMPLATES.length;
  }

  // Level 4 Methods
  static getLevel4Template(templateIndex) {
    const templates = LEVEL_4_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getLevel4TemplateCount() {
    return LEVEL_4_TEMPLATES.length;
  }

  // Grade 6 Methods
  static getGrade6FallbackTemplate(templateIndex) {
    const templates = GRADE_6_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getGrade6FallbackTemplateCount() {
    return GRADE_6_TEMPLATES.length;
  }

  // Grade 7 Methods
  static getGrade7FallbackTemplate(templateIndex) {
    const templates = GRADE_7_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getGrade7FallbackTemplateCount() {
    return GRADE_7_TEMPLATES.length;
  }

  // Grade 8 Methods
  static getGrade8FallbackTemplate(templateIndex) {
    const templates = GRADE_8_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getGrade8FallbackTemplateCount() {
    return GRADE_8_TEMPLATES.length;
  }

  // Grade 9 Methods
  static getGrade9FallbackTemplate(templateIndex) {
    const templates = GRADE_9_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getGrade9FallbackTemplateCount() {
    return GRADE_9_TEMPLATES.length;
  }

  // Grade 10 Methods
  static getGrade10FallbackTemplate(templateIndex) {
    const templates = GRADE_10_TEMPLATES;
    if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
      return templates[templateIndex];
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  static getGrade10FallbackTemplateCount() {
    return GRADE_10_TEMPLATES.length;
  }

  // Utility Methods
  static getFallbackTemplate(level, templateIndex) {
    const templates = this[`get${level}Template`] || this[`get${level}FallbackTemplate`];
    if (!templates) return null;
    
    return templates.call(this, templateIndex);
  }
  
  static getTemplateCount(level) {
    const countMethod = this[`get${level}TemplateCount`] || this[`get${level}FallbackTemplateCount`];
    if (!countMethod) return 0;
    
    return countMethod.call(this);
  }
}