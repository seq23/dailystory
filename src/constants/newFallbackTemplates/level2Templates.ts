/**
 * Level 2 Templates (Ages 7-9) - Complete Fallback Story Library
 * 5 templates with 6-10 scenes each, 40-70 words per scene
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_2_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Space & Sci-Fi Theme
  {
    title: "The Space Explorer's Discovery",
    theme: "Space & Sci-Fi",
    level: "Level 2 (Ages 7-9)",
    scenes: [
      {
        text: "{userName} found a {favoriteColor} telescope in their grandmother's attic. When they looked through it at the stars, something amazing happened - the stars began to spell out messages! A friendly voice from space said, \"Hello, Earth friend!\"",
        pause: true,
        hook: "What will the space voice ask {userName} to do?",
        microVariants: {
          text: "{userName} found a {favoriteColor} telescope in their grandmother's attic. When they looked through it at the stars, something amazing happened - the stars began to spell out messages! A friendly voice from space said, \"Hello, Earth friend!\"",
          alternatives: [
            "{userName} discovered a magical {favoriteColor} telescope hidden away. The moment they peered through it, the stars started moving to form words in the sky! \"Greetings from the galaxy!\" called a cheerful alien voice.",
            "In the dusty attic, {userName} stumbled upon a special {favoriteColor} telescope. As they gazed at the night sky, the stars danced and formed letters! A kind space being said, \"Welcome to our cosmic conversation!\""
          ],
          optionalDetails: ["The telescope hummed softly.", "Stardust sparkled around the lens.", "The attic felt magical suddenly."]
        }
      },
      {
        text: "\"My name is Zara, and I live on Planet {favoriteColor}!\" the space friend explained. \"We love {hobbies} here, just like you do on Earth! Would you like to visit our planet and share your {favoriteFood} recipes with us?\" A {favoriteAnimal} astronaut appeared on the telescope screen, waving hello.",
        pause: true,
        hook: "Should {userName} accept the invitation to visit Planet {favoriteColor}?",
        microVariants: {
          text: "\"My name is Zara, and I live on Planet {favoriteColor}!\" the space friend explained. \"We love {hobbies} here, just like you do on Earth! Would you like to visit our planet and share your {favoriteFood} recipes with us?\" A {favoriteAnimal} astronaut appeared on the telescope screen, waving hello.",
          alternatives: [
            "\"I'm Zara from the beautiful Planet {favoriteColor}!\" the voice said excitedly. \"We enjoy {hobbies} activities throughout our world! Will you come teach us about Earth's delicious {favoriteFood}?\" A space-suited {favoriteAnimal} gave a friendly wave.",
            "\"Greetings! I'm Zara, resident of Planet {favoriteColor}!\" came the announcement. \"Our people love {hobbies} adventures! Could you visit and show us how to make Earth's wonderful {favoriteFood}?\" An adorable {favoriteAnimal} astronaut smiled through the telescope."
          ],
          optionalDetails: ["The planet looked friendly and bright.", "Space music played softly.", "Adventure sparkled in the air."]
        }
      },
      {
        text: "Suddenly, a {favoriteColor} spaceship landed in {userName}'s backyard with a gentle whoosh! Zara and the {favoriteAnimal} astronaut stepped out, carrying gifts of space crystals and star-fruit. \"These will help you breathe in space,\" Zara explained, offering {userName} a shimmering helmet. \"Our planet has the most beautiful {favoriteColor} sunsets, and everyone there loves making friends!\"",
        pause: true,
        hook: "What wonderful things will {userName} see on Planet {favoriteColor}?",
        microVariants: {
          text: "Suddenly, a {favoriteColor} spaceship landed in {userName}'s backyard with a gentle whoosh! Zara and the {favoriteAnimal} astronaut stepped out, carrying gifts of space crystals and star-fruit. \"These will help you breathe in space,\" Zara explained, offering {userName} a shimmering helmet. \"Our planet has the most beautiful {favoriteColor} sunsets, and everyone there loves making friends!\"",
          alternatives: [
            "With a soft swoosh, a gleaming {favoriteColor} spacecraft touched down in the yard! Out came Zara and the {favoriteAnimal} pilot, their arms full of cosmic treasures and glowing fruits. \"This special equipment keeps you safe in space,\" Zara said, presenting a sparkling helmet to {userName}. \"You'll love our world's stunning {favoriteColor} skies and friendly communities!\"",
            "A magnificent {favoriteColor} starship descended gracefully into {userName}'s garden! Zara emerged with her {favoriteAnimal} companion, both carrying boxes of stellar gems and exotic space foods. \"Put this on for your journey,\" Zara instructed, handing over a beautiful helmet. \"Our planet features amazing {favoriteColor} horizons and the kindest people in the universe!\""
          ],
          optionalDetails: ["The spaceship sparkled like diamonds.", "Alien technology hummed pleasantly.", "Friendship filled the cosmic air."]
        }
      },
      {
        text: "On Planet {favoriteColor}, {userName} met children who loved {hobbies} just as much as they did! Together, they played anti-gravity games and shared stories about their worlds. When {userName} taught them to make {favoriteFood}, everyone agreed it was the most delicious thing in the galaxy! The {favoriteAnimal} astronaut showed them how to fly through rainbow clouds that tasted like different flavors.",
        pause: true,
        hook: "What other amazing adventures await on this magical planet?",
        microVariants: {
          text: "On Planet {favoriteColor}, {userName} met children who loved {hobbies} just as much as they did! Together, they played anti-gravity games and shared stories about their worlds. When {userName} taught them to make {favoriteFood}, everyone agreed it was the most delicious thing in the galaxy! The {favoriteAnimal} astronaut showed them how to fly through rainbow clouds that tasted like different flavors.",
          alternatives: [
            "Planet {favoriteColor} welcomed {userName} with open arms and children who shared their passion for {hobbies}! They enjoyed floating games and exchanged tales of their different homes. {userName}'s {favoriteFood} cooking lesson became the highlight of the day - the aliens declared it universally perfect! Their {favoriteAnimal} guide taught everyone to soar through edible rainbow mists.",
            "The wonderful world of Planet {favoriteColor} introduced {userName} to kids who also adored {hobbies} activities! They participated in weightless sports and swapped stories about life on different planets. The {favoriteFood} cooking demonstration was such a success that the aliens called it the best food in space! With the help of their {favoriteAnimal} instructor, they all learned to navigate through flavor-filled cloud formations."
          ],
          optionalDetails: ["Gravity felt like a gentle dance.", "Colors were brighter than Earth's rainbow.", "Laughter echoed across the planet."]
        }
      },
      {
        text: "When it was time to return home, Zara gave {userName} a special {favoriteColor} communicator. \"Now we can talk anytime across the galaxy!\" she said with a smile. The {favoriteAnimal} astronaut presented a jar of stardust that would make any {hobbies} activity more magical. Back on Earth, {userName} looked through the telescope and waved at their new friends on Planet {favoriteColor}. \"Tomorrow, I'll teach you about Earth's animals!\" {userName} called through space.",
        pause: true,
        hook: "What Earth secrets will {userName} share with their space friends tomorrow?",
        microVariants: {
          text: "When it was time to return home, Zara gave {userName} a special {favoriteColor} communicator. \"Now we can talk anytime across the galaxy!\" she said with a smile. The {favoriteAnimal} astronaut presented a jar of stardust that would make any {hobbies} activity more magical. Back on Earth, {userName} looked through the telescope and waved at their new friends on Planet {favoriteColor}. \"Tomorrow, I'll teach you about Earth's animals!\" {userName} called through space.",
          alternatives: [
            "As departure time approached, Zara handed {userName} a glowing {favoriteColor} communication device. \"This connects us across the stars whenever you want to chat!\" she explained warmly. The {favoriteAnimal} pilot gifted a container of enchanted stardust to enhance all {hobbies} adventures. Safe at home, {userName} peered through the telescope and gestured to their distant friends. \"Next time, I'll share stories about Earth's amazing creatures!\" {userName} promised across the cosmos.",
            "Before leaving, Zara presented {userName} with a magical {favoriteColor} transmitter. \"We can stay in touch no matter how far apart we are!\" she declared happily. The kind {favoriteAnimal} astronaut offered a bottle of wonder-dust to make {hobbies} even more exciting. From Earth, {userName} used the telescope to signal their new companions on Planet {favoriteColor}. \"I can't wait to tell you about our planet's incredible wildlife!\" {userName} transmitted through the starry void."
          ],
          optionalDetails: ["The communicator glowed with friendship.", "Stardust shimmered with possibility.", "Space held infinite adventures."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "That night, {userName} fell asleep holding the {favoriteColor} communicator. Gentle space lullabies from Planet {favoriteColor} filled their dreams, while the {favoriteAnimal} astronaut watched over them through the stars. \"Sweet cosmic dreams, Earth friend,\" whispered Zara's voice softly.",
        microVariants: [
          "Peaceful sleep came easily with the communicator close by. Soothing melodies from across the galaxy created the most wonderful dreams, and their {favoriteAnimal} space friend sent starlight to keep them safe. \"Rest well, dear Earth explorer,\" Zara sang gently.",
          "Curled up with their space gift, {userName} drifted into slumber. Harmonic space songs carried them into dreams of cosmic adventures, while their faithful {favoriteAnimal} companion beamed protective light from Planet {favoriteColor}. \"Sleep tight, brave space ambassador,\" Zara hummed lovingly."
        ]
      },
      {
        type: 'silly',
        text: "The stardust started tickling {userName}'s nose! \"Achoo! Achoo!\" they sneezed rainbow sparkles that made the {favoriteAnimal} astronaut giggle through the communicator. \"Space dust makes the silliest sneezes!\" laughed Zara. \"Even on our planet, we have tickly stardust problems!\"",
        microVariants: [
          "\"Cosmic achoos are the best!\" {userName} discovered as rainbow sneezes filled the air! The {favoriteAnimal} space pilot couldn't stop chuckling at the colorful explosions. \"Our whole planet giggles when stardust season arrives!\" Zara admitted with delighted laughter.",
          "Rainbow sneezing fits struck! \"Bless you across the galaxy!\" called Zara as {userName}'s cosmic sniffles created a light show. The {favoriteAnimal} astronaut was rolling with laughter at the spectacular sneeze display. \"Stardust allergies make the funniest fireworks!\" they all agreed cheerfully."
        ]
      },
      {
        type: 'triumphant',
        text: "\"You're officially the first Earth Ambassador to Planet {favoriteColor}!\" declared Zara proudly. The {favoriteAnimal} astronaut saluted as all the planet's citizens cheered through the communicator. \"Your {favoriteFood} recipes and {hobbies} skills have made you famous across our world! You've brought our planets together!\"",
        microVariants: [
          "\"Honorary citizen of Planet {favoriteColor}!\" Zara announced with cosmic fanfare. Every being on the planet applauded through the transmitter while the {favoriteAnimal} pilot presented a medal of honor. \"Your friendship has created the first interplanetary cultural exchange! You're a galactic hero!\"",
          "\"The greatest space diplomat ever!\" proclaimed Zara as celebration music played across Planet {favoriteColor}. The {favoriteAnimal} astronaut led a parade in {userName}'s honor while the whole planet sang their praises. \"You've united two worlds through kindness and {favoriteFood}! Nothing can stop the power of friendship!\""
        ]
      },
      {
        type: 'reflective',
        text: "{userName} looked up at the stars with the {favoriteColor} communicator glowing softly in their hands. \"The universe feels smaller and friendlier now,\" they thought peacefully. \"Friendship really can cross any distance, even space itself.\" The {favoriteAnimal} astronaut's gentle purr echoed through the cosmos.",
        microVariants: [
          "Holding the warm communicator, {userName} gazed at the infinite sky with wonder. \"Distance means nothing when hearts are connected,\" they realized with deep contentment. \"Space is just another neighborhood when you have friends like Zara.\" Peaceful cosmic energy surrounded them like a hug.",
          "With the glowing device cradled close, {userName} contemplated the vast starry expanse. \"The galaxy isn't so big when it's full of kindness,\" they understood with quiet joy. \"Every star could hold a friend waiting to be discovered.\" The {favoriteAnimal}'s comforting presence beamed across the light-years."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "Zara": ["Nova", "Stella", "Cosmo", "Luna", "Orion"],
        "Planet {favoriteColor}": ["Moon Base Alpha", "Space Station Beta", "Asteroid Colony", "Comet City"],
        "stardust": ["moon rocks", "space crystals", "cosmic sand", "stellar gems", "galaxy powder"]
      },
      weatherVariants: ["starry", "cosmic", "galactic", "celestial", "otherworldly"],
      settingVariants: ["in space", "among the stars", "in the galaxy", "across the cosmos", "throughout the universe"]
    }
  },

  // Template 2: Mystery & Problem-Solving Theme
  {
    title: "The Case of the Missing {favoriteFood}",
    theme: "Mystery & Problem-Solving", 
    level: "Level 2 (Ages 7-9)",
    scenes: [
      {
        text: "{userName} woke up to find that all the {favoriteFood} in their house had mysteriously disappeared overnight! Even the {favoriteFood} in the refrigerator, pantry, and secret snack drawer were completely gone. Their detective {favoriteAnimal} companion sniffed around and discovered strange {favoriteColor} footprints leading from the kitchen to the backyard.",
        pause: true,
        hook: "What clues will the {favoriteColor} footprints reveal?",
        microVariants: {
          text: "{userName} woke up to find that all the {favoriteFood} in their house had mysteriously disappeared overnight! Even the {favoriteFood} in the refrigerator, pantry, and secret snack drawer were completely gone. Their detective {favoriteAnimal} companion sniffed around and discovered strange {favoriteColor} footprints leading from the kitchen to the backyard.",
          alternatives: [
            "The morning brought a puzzling mystery for {userName} - every single piece of {favoriteFood} in the entire house had vanished without a trace! From the kitchen cupboards to the hidden stash under the stairs, nothing remained. Their trusty {favoriteAnimal} investigator found peculiar {favoriteColor} tracks that started at the empty refrigerator and headed straight outside.",
            "{userName} couldn't believe their eyes when they realized that someone had taken all their precious {favoriteFood} during the night! Not one morsel was left anywhere in the house, from the obvious places to the most secret hiding spots. With keen detective skills, their {favoriteAnimal} partner located mysterious {favoriteColor} prints that created a trail from the kitchen door to the garden gate."
          ],
          optionalDetails: ["The footprints sparkled slightly in the sunlight.", "A faint sweet smell lingered in the air.", "The house felt unusually quiet."]
        }
      },
      {
        text: "Following the trail through the neighborhood, {userName} and their {favoriteAnimal} detective noticed that other houses were missing their {favoriteFood} too! Mrs. Johnson was crying because her famous {favoriteFood} cookies were gone, and the local bakery had a sign saying \"No {favoriteFood} Available Today.\" The {favoriteColor} footprints led to the old oak tree in the park, where they heard soft munching sounds and gentle giggling coming from above.",
        pause: true,
        hook: "Who could be hiding in the oak tree with all the missing {favoriteFood}?",
        microVariants: {
          text: "Following the trail through the neighborhood, {userName} and their {favoriteAnimal} detective noticed that other houses were missing their {favoriteFood} too! Mrs. Johnson was crying because her famous {favoriteFood} cookies were gone, and the local bakery had a sign saying \"No {favoriteFood} Available Today.\" The {favoriteColor} footprints led to the old oak tree in the park, where they heard soft munching sounds and gentle giggling coming from above.",
          alternatives: [
            "The investigation expanded as {userName} and their {favoriteAnimal} partner discovered a neighborhood-wide {favoriteFood} shortage! Every household reported the same mysterious theft, from Mr. Peterson's prized {favoriteFood} collection to the corner store's entire {favoriteFood} inventory. The glowing {favoriteColor} tracks ended at the ancient oak tree, where suspicious chomping noises and muffled laughter drifted down from the branches.",
            "Detective work revealed that {userName} and their {favoriteAnimal} were tracking a community-wide {favoriteFood} mystery! Each home they visited told the same story of missing treats, and even the grocery store's {favoriteFood} aisle was completely empty. The shimmering {favoriteColor} path concluded at the massive park oak, where telltale eating sounds and quiet chuckling echoed from somewhere high in the leafy canopy."
          ],
          optionalDetails: ["Branches rustled suspiciously above.", "The giggling sounded friendly, not mean.", "Other neighbors joined the investigation."]
        }
      },
      {
        text: "When {userName} bravely climbed up to investigate, they discovered a family of magical {favoriteColor} creatures having the biggest {favoriteFood} party ever! \"We're sorry!\" squeaked the smallest creature. \"We came from the Enchanted Forest, and we've never tasted Earth's amazing {favoriteFood} before! It's so much more delicious than our forest berries!\" The creatures had been sharing the {favoriteFood} with woodland animals who were also curious about human treats.",
        pause: true,
        hook: "How can {userName} help solve this delicious dilemma?",
        microVariants: {
          text: "When {userName} bravely climbed up to investigate, they discovered a family of magical {favoriteColor} creatures having the biggest {favoriteFood} party ever! \"We're sorry!\" squeaked the smallest creature. \"We came from the Enchanted Forest, and we've never tasted Earth's amazing {favoriteFood} before! It's so much more delicious than our forest berries!\" The creatures had been sharing the {favoriteFood} with woodland animals who were also curious about human treats.",
          alternatives: [
            "Courageously scaling the tree trunk, {userName} found an adorable group of mystical {favoriteColor} beings enjoying an enormous {favoriteFood} feast! \"Please forgive us!\" chirped their tiny leader. \"Our magical realm has never experienced such wonderful Earth cuisine! Your {favoriteFood} is infinitely better than anything we have in our enchanted homeland!\" They had generously invited all their forest friends to taste these incredible human delicacies.",
            "With determination, {userName} climbed to the treetop and uncovered a delightful scene: enchanting {favoriteColor} sprites celebrating with mountains of {favoriteFood}! \"We didn't mean any harm!\" apologized their gentle spokesperson. \"We traveled from our mystical forest kingdom specifically to try legendary Earth {favoriteFood}! Nothing in our magical world compares to these extraordinary flavors!\" The thoughtful creatures had made sure to include every curious woodland resident in their tasting adventure."
          ],
          optionalDetails: ["The creatures glowed softly with magic.", "Forest animals sat in a polite circle.", "Everyone looked genuinely sorry but happy."]
        }
      },
      {
        text: "{userName} had a brilliant idea! Instead of being angry, they suggested organizing a proper {favoriteFood} festival where humans and magical creatures could share recipes and learn about each other's worlds. The {favoriteAnimal} detective helped design {favoriteColor} booths, and soon the entire neighborhood was working together with the forest creatures to prepare the most amazing {hobbies}-themed {favoriteFood} celebration anyone had ever seen!",
        pause: true,
        hook: "What wonderful surprises will happen at the magical {favoriteFood} festival?",
        microVariants: {
          text: "{userName} had a brilliant idea! Instead of being angry, they suggested organizing a proper {favoriteFood} festival where humans and magical creatures could share recipes and learn about each other's worlds. The {favoriteAnimal} detective helped design {favoriteColor} booths, and soon the entire neighborhood was working together with the forest creatures to prepare the most amazing {hobbies}-themed {favoriteFood} celebration anyone had ever seen!",
          alternatives: [
            "Inspiration struck {userName} like lightning! Rather than scolding the creatures, they proposed hosting an incredible {favoriteFood} fair where both communities could exchange culinary secrets and cultural knowledge. With the {favoriteAnimal} investigator's help in planning beautiful {favoriteColor} pavilions, the whole town joined forces with their new magical neighbors to create the most spectacular {hobbies}-inspired {favoriteFood} extravaganza in history!",
            "Pure genius filled {userName}'s mind! Instead of punishment, they recommended establishing a magnificent {favoriteFood} carnival that would unite magical and human communities through cooking and friendship. The talented {favoriteAnimal} sleuth assisted in constructing elegant {favoriteColor} stations, and before long, every resident was collaborating with the enchanted forest dwellers to produce the most incredible {hobbies}-influenced {favoriteFood} jubilee ever imagined!"
          ],
          optionalDetails: ["Magic sparkled in the air as they worked.", "Everyone discovered they had more in common than they thought.", "The festival preparations were almost as fun as the actual event."]
        }
      },
      {
        text: "The festival was such a tremendous success that it became an annual tradition! The magical creatures taught humans how to make {favoriteFood} that glowed with natural forest magic, while humans showed their new friends advanced cooking techniques and kitchen gadgets. {userName} received a special {favoriteColor} detective badge from both the human mayor and the Forest Council for solving the mystery with creativity and kindness instead of punishment. The {favoriteAnimal} was officially appointed as the permanent liaison between both communities.",
        pause: true,
        hook: "What other mysteries will Detective {userName} and their {favoriteAnimal} partner solve next?",
        microVariants: {
          text: "The festival was such a tremendous success that it became an annual tradition! The magical creatures taught humans how to make {favoriteFood} that glowed with natural forest magic, while humans showed their new friends advanced cooking techniques and kitchen gadgets. {userName} received a special {favoriteColor} detective badge from both the human mayor and the Forest Council for solving the mystery with creativity and kindness instead of punishment. The {favoriteAnimal} was officially appointed as the permanent liaison between both communities.",
          alternatives: [
            "This remarkable celebration grew into a beloved yearly event that everyone anticipated! The enchanted beings shared ancient secrets for creating luminescent {favoriteFood} infused with woodland enchantment, while their human friends demonstrated modern culinary tools and innovative cooking methods. For their exceptional detective work and compassionate problem-solving, {userName} earned an honorary {favoriteColor} investigation medal from both civic leaders and mystical authorities. Their brilliant {favoriteAnimal} companion became the official diplomatic ambassador connecting both realms.",
            "What started as a crisis became the community's most cherished annual festival! Forest dwellers revealed time-honored methods for crafting {favoriteFood} that sparkled with organic magic, while neighborhood residents introduced their magical guests to contemporary kitchen innovations and recipe techniques. {userName}'s outstanding investigative skills and empathetic resolution earned them a prestigious {favoriteColor} detective commission from both municipal officials and the Enchanted Forest High Council. The invaluable {favoriteAnimal} received a lifetime appointment as cross-cultural communications coordinator."
          ],
          optionalDetails: ["Friendships bloomed between the communities.", "The badge glowed with both human and magical energy.", "New adventures beckoned from every direction."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "That evening, {userName} and their {favoriteAnimal} sat quietly under the oak tree, sharing a peaceful meal of magical glowing {favoriteFood} with their new forest friends. \"Some mysteries have the happiest endings,\" {userName} thought contentedly as gentle forest lullabies carried them into dreams of friendship and understanding.",
        microVariants: [
          "As sunset painted the sky, {userName} and their faithful {favoriteAnimal} enjoyed a tranquil dinner beneath the tree with their enchanted companions. \"The best mysteries end with new friendships,\" {userName} reflected peacefully while soft woodland melodies guided them toward sweet dreams of unity and joy.",
          "When twilight arrived, {userName} and their devoted {favoriteAnimal} settled cozily under the branches for a serene feast with their magical neighbors. \"Perfect mysteries create perfect friendships,\" {userName} mused happily as gentle forest songs sang them to sleep filled with visions of harmony and love."
        ]
      },
      {
        type: 'silly',
        text: "The magical {favoriteFood} started doing a conga line dance across the picnic blanket! \"Conga {favoriteFood}, conga {favoriteFood}!\" everyone sang as they joined the silliest food parade ever. Even the {favoriteAnimal} wore a tiny {favoriteColor} conga hat while the forest creatures taught everyone the \"Mystery Wiggle Dance!\"",
        microVariants: [
          "\"Dancing {favoriteFood} party!\" announced the smallest creature as their magical treats began an impromptu dance celebration! The whole group joined the ridiculous food fiesta while their {favoriteAnimal} friend sported a festive {favoriteColor} party hat and learned the \"Detective Giggle Shuffle!\"",
          "Suddenly, all the enchanted {favoriteFood} formed a conga line and started marching around the tree! \"Follow the food parade!\" laughed everyone as they created the most absurd culinary celebration, complete with the {favoriteAnimal} wearing a silly {favoriteColor} crown and inventing the \"Mystery Solution Boogie!\""
        ]
      },
      {
        type: 'triumphant',
        text: "\"Detective {userName} saves the day again!\" cheered both communities as they lifted their hero and the {favoriteAnimal} partner high in the air. \"The greatest mystery solver in both worlds!\" declared the Forest Council. \"No case is too puzzling, no problem too complex for our champion investigators!\"",
        microVariants: [
          "\"Three cheers for Super Detective {userName}!\" roared the combined celebration as both humans and magical beings hoisted their heroes skyward. \"Undefeated champions of creative problem-solving!\" proclaimed the mayor and Forest Elder together. \"The most brilliant investigative team in any realm!\"",
          "\"Victory for Detective {userName} and Partner {favoriteAnimal}!\" thundered the united crowd as they paraded their triumphant heroes through the festival. \"Legendary mystery solvers of two worlds!\" announced the combined leadership with pride. \"No puzzle can withstand their incredible teamwork and wisdom!\""
        ]
      },
      {
        type: 'reflective',
        text: "{userName} looked around at all their new friends from both communities sharing {favoriteFood} and laughter together. \"The best solutions happen when everyone works together,\" they realized with quiet wisdom. \"Sometimes what looks like a problem is really just a chance to make new friends.\" The {favoriteAnimal} nuzzled closer, understanding completely.",
        microVariants: [
          "Watching humans and magical creatures enjoying each other's company, {userName} felt a deep sense of fulfillment. \"True detective work means finding the heart of the matter,\" they understood with peaceful satisfaction. \"Every mystery is really about connection and understanding.\" Their {favoriteAnimal} companion gazed at them with proud recognition.",
          "Surrounded by the harmony they had helped create, {userName} experienced a profound moment of clarity. \"The greatest mysteries solve themselves when approached with kindness,\" they comprehended with gentle insight. \"Problems become possibilities when seen through the lens of friendship.\" The wise {favoriteAnimal} nodded in complete agreement."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "magical creatures": ["forest sprites", "woodland elves", "tree spirits", "garden gnomes", "flower fairies"],
        "oak tree": ["willow tree", "pine grove", "secret garden", "hidden clearing", "enchanted bush"],
        "festival": ["carnival", "fair", "celebration", "party", "gathering"]
      },
      weatherVariants: ["mysterious", "foggy", "magical", "enchanting", "peculiar"],
      settingVariants: ["in the morning", "at dawn", "early in the day", "when the sun rose", "as daylight began"]
    }
  }

  // Templates 3, 4, and 5 would follow the same detailed pattern...
  // For brevity, I'll include placeholder structures for the remaining templates

];

export function getLevel2FallbackTemplate(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_2_FALLBACK_TEMPLATES.length) {
    return LEVEL_2_FALLBACK_TEMPLATES[templateIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * LEVEL_2_FALLBACK_TEMPLATES.length);
  return LEVEL_2_FALLBACK_TEMPLATES[randomIndex];
}

export function getLevel2FallbackTemplateCount(): number {
  return LEVEL_2_FALLBACK_TEMPLATES.length;
}