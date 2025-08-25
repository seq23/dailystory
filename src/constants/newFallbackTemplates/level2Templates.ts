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
  },

  // Template 3: Magic & Fantasy Theme
  {
    title: "The Enchanted {favoriteColor} Garden",
    theme: "Magic & Fantasy",
    level: "Level 2 (Ages 7-9)",
    scenes: [
      {
        text: "Behind {userName}'s house, they discovered a gate that sparkled with {favoriteColor} light. Their curious {favoriteAnimal} companion sniffed at the magical barrier and wagged its tail excitedly. \"I wonder what's on the other side?\" {userName} whispered, reaching out to touch the shimmering surface. The moment their finger made contact, the gate opened with a melodic chime, revealing a garden where flowers sang lullabies and trees grew {favoriteFood} instead of regular fruit.",
        pause: true,
        hook: "What magical creatures will {userName} meet in this enchanted garden?",
        microVariants: {
          text: "Behind {userName}'s house, they discovered a gate that sparkled with {favoriteColor} light. Their curious {favoriteAnimal} companion sniffed at the magical barrier and wagged its tail excitedly. \"I wonder what's on the other side?\" {userName} whispered, reaching out to touch the shimmering surface. The moment their finger made contact, the gate opened with a melodic chime, revealing a garden where flowers sang lullabies and trees grew {favoriteFood} instead of regular fruit.",
          alternatives: [
            "A mysterious {favoriteColor} glowing portal appeared in {userName}'s backyard, catching the attention of their adventurous {favoriteAnimal} friend who began investigating the magical phenomenon with great enthusiasm. \"This looks like something from a fairy tale!\" {userName} exclaimed softly, extending their hand toward the luminous gateway. As soon as they touched the enchanted surface, it opened with beautiful musical tones, unveiling a wondrous garden where blooming plants created harmonious melodies and fruit trees offered delicious {favoriteFood} treats.",
            "In the space behind their home, {userName} stumbled upon a radiant {favoriteColor} doorway that pulsed with mystical energy, immediately drawing the curiosity of their faithful {favoriteAnimal} partner who approached the magical entrance with tail-wagging excitement. \"Could this be a real magic portal?\" {userName} wondered aloud, carefully reaching toward the glowing threshold. Upon making contact with the ethereal barrier, it dissolved with enchanting musical notes, revealing an extraordinary garden where flowering plants performed melodic concerts and orchard trees produced wonderful {favoriteFood} delicacies."
          ],
          optionalDetails: ["Butterflies made of starlight danced around them.", "The air smelled like vanilla and adventure.", "Magic sparkled in every dewdrop."]
        }
      },
      {
        text: "A group of friendly garden sprites welcomed {userName} and their {favoriteAnimal} with tiny {favoriteColor} umbrellas and flower crowns. \"Welcome to the Growing Garden!\" chirped the smallest sprite. \"Here, everything you plant with kindness grows into something magical!\" The sprites showed them special seed packets that glowed softly. \"Plant a wish and watch it bloom,\" they explained, leading {userName} to a patch of rainbow soil that sparkled like gems.",
        pause: true,
        hook: "What kind wish will {userName} plant in the magical soil?",
        microVariants: {
          text: "A group of friendly garden sprites welcomed {userName} and their {favoriteAnimal} with tiny {favoriteColor} umbrellas and flower crowns. \"Welcome to the Growing Garden!\" chirped the smallest sprite. \"Here, everything you plant with kindness grows into something magical!\" The sprites showed them special seed packets that glowed softly. \"Plant a wish and watch it bloom,\" they explained, leading {userName} to a patch of rainbow soil that sparkled like gems.",
          alternatives: [
            "An assembly of delightful garden fairies greeted {userName} and their {favoriteAnimal} companion by offering miniature {favoriteColor} parasols and beautiful blossom garlands. \"Welcome to our Wonderful Wishing Garden!\" sang the tiniest fairy with joy. \"In this special place, anything planted with love and good intentions transforms into pure magic!\" The fairies presented them with luminous seed collections that pulsed with gentle light. \"Sow your dreams and watch them flourish,\" they instructed, guiding {userName} toward an area of prismatic earth that shimmered like precious stones.",
            "A collection of charming garden pixies received {userName} and their {favoriteAnimal} friend by providing petite {favoriteColor} sunshades and elaborate floral headpieces. \"Welcome to the Magical Growing Space!\" announced the most diminutive pixie with enthusiasm. \"Within our enchanted realm, every seed planted with pure intentions blossoms into extraordinary magic!\" The pixies revealed radiant seed containers that emanated soft illumination. \"Cultivate your hopes and witness their transformation,\" they advised, escorting {userName} to a section of iridescent ground that gleamed like polished gemstones."
          ],
          optionalDetails: ["The sprites giggled like tiny wind chimes.", "Flower petals danced in the breeze around them.", "Everything smelled like sunshine and happiness."]
        }
      },
      {
        text: "{userName} closed their eyes and planted a seed while wishing for more friends who loved {hobbies} just like they did. Immediately, the seed sprouted into a {favoriteColor} tree filled with friendly {favoriteAnimal} creatures who all enjoyed the same activities! \"We've been waiting for someone like you!\" they called out happily. The tree house they lived in had swings, slides, and special areas designed perfectly for {hobbies}, while the branches grew snacks that tasted exactly like {favoriteFood}.",
        pause: true,
        hook: "What fun adventures will {userName} have with their new friends?",
        microVariants: {
          text: "{userName} closed their eyes and planted a seed while wishing for more friends who loved {hobbies} just like they did. Immediately, the seed sprouted into a {favoriteColor} tree filled with friendly {favoriteAnimal} creatures who all enjoyed the same activities! \"We've been waiting for someone like you!\" they called out happily. The tree house they lived in had swings, slides, and special areas designed perfectly for {hobbies}, while the branches grew snacks that tasted exactly like {favoriteFood}.",
          alternatives: [
            "{userName} concentrated deeply and planted their magical seed while making a heartfelt wish for companions who shared their passion for {hobbies} activities. Instantly, the seed transformed into a magnificent {favoriteColor} tree inhabited by cheerful {favoriteAnimal} friends who all shared identical interests! \"We've been hoping to meet someone just like you!\" they exclaimed with delight. Their arboreal dwelling featured playground equipment, recreational slides, and customized spaces perfectly suited for {hobbies} enjoyment, while the living branches produced treats with the exact flavor of {favoriteFood}.",
            "{userName} focused intently and buried their enchanted seed while expressing a sincere desire for friendship with others who appreciated {hobbies} as much as they did. Without delay, the seed developed into a spectacular {favoriteColor} tree populated by joyful {favoriteAnimal} companions who possessed matching recreational preferences! \"We've been eagerly anticipating someone exactly like you!\" they declared with enthusiasm. Their elevated tree residence included recreational amenities, entertainment slides, and specialized zones ideally configured for {hobbies} activities, while the organic branches yielded refreshments that perfectly replicated the taste of {favoriteFood}."
          ],
          optionalDetails: ["The tree house glowed with warm, welcoming light.", "Laughter echoed through every branch.", "Adventure beckoned from every corner."]
        }
      },
      {
        text: "Together, {userName} and their new tree friends created the most amazing playground in the magical garden. They built {favoriteColor} obstacle courses for {hobbies}, organized friendly competitions, and shared stories about their favorite adventures. The garden sprites joined in too, using their magic to make everything even more fun - slides that never ended, swings that could reach the clouds, and a magical picnic area where {favoriteFood} appeared whenever anyone was hungry. Everyone agreed it was the most perfect play day ever!",
        pause: true,
        hook: "What other magical surprises does this garden hold?",
        microVariants: {
          text: "Together, {userName} and their new tree friends created the most amazing playground in the magical garden. They built {favoriteColor} obstacle courses for {hobbies}, organized friendly competitions, and shared stories about their favorite adventures. The garden sprites joined in too, using their magic to make everything even more fun - slides that never ended, swings that could reach the clouds, and a magical picnic area where {favoriteFood} appeared whenever anyone was hungry. Everyone agreed it was the most perfect play day ever!",
          alternatives: [
            "In collaboration, {userName} and their newly discovered arboreal companions constructed the most extraordinary recreational facility within the enchanted garden space. They designed {favoriteColor} adventure courses specifically for {hobbies} activities, established amicable competitive events, and exchanged narratives about their most memorable experiences. The garden fairies participated enthusiastically as well, employing their mystical abilities to enhance the entertainment value through infinite slides, cloud-reaching swings, and an enchanted dining area where {favoriteFood} materialized whenever refreshment was desired. The consensus was unanimous that this represented the ultimate recreational experience!",
            "Working together harmoniously, {userName} and their recently befriended tree inhabitants developed the most remarkable entertainment complex throughout the magical garden environment. They constructed {favoriteColor} challenge circuits tailored for {hobbies} pursuits, coordinated pleasant competitive activities, and shared tales of their most treasured adventures. The garden pixies actively contributed as well, utilizing their supernatural powers to amplify the enjoyment through endless recreational slides, sky-high swinging apparatus, and a mystical refreshment zone where {favoriteFood} spontaneously appeared whenever nourishment was required. Universal agreement declared this the most exceptional play experience imaginable!"
          ],
          optionalDetails: ["Music seemed to play from the very air itself.", "Colors were brighter and more vivid than anywhere else.", "Time felt like it moved slower, making fun last longer."]
        }
      },
      {
        text: "As the sun began to set, the garden sprites taught {userName} the secret of returning anytime they wanted. \"Hold your {favoriteColor} flower crown and think of friendship,\" they explained, placing a special crown made of living flowers on {userName}'s head. \"The garden will always be here when you need friends and fun!\" The {favoriteAnimal} friends from the tree gave them a magical acorn that would glow whenever new adventures were waiting. Walking back through the sparkling gate, {userName} felt grateful for discovering that magic really does exist when you believe in friendship.",
        pause: true,
        hook: "What new magical adventures will the glowing acorn reveal tomorrow?",
        microVariants: {
          text: "As the sun began to set, the garden sprites taught {userName} the secret of returning anytime they wanted. \"Hold your {favoriteColor} flower crown and think of friendship,\" they explained, placing a special crown made of living flowers on {userName}'s head. \"The garden will always be here when you need friends and fun!\" The {favoriteAnimal} friends from the tree gave them a magical acorn that would glow whenever new adventures were waiting. Walking back through the sparkling gate, {userName} felt grateful for discovering that magic really does exist when you believe in friendship.",
          alternatives: [
            "As twilight approached, the garden fairies revealed to {userName} the method for returning whenever desired. \"Grasp your {favoriteColor} blossom circlet and focus on friendship,\" they instructed, adorning {userName} with a unique crown crafted from animated flowers. \"Our garden remains eternally accessible when you seek companionship and enjoyment!\" The {favoriteAnimal} companions from their arboreal home presented them with an enchanted seed that would illuminate whenever fresh adventures awaited discovery. Departing through the luminous portal, {userName} experienced deep appreciation for learning that genuine magic manifests when one embraces the power of friendship.",
            "As evening descended, the garden pixies shared with {userName} the technique for accessing their realm at any time. \"Clasp your {favoriteColor} floral diadem and contemplate friendship,\" they directed, bestowing upon {userName} an exceptional crown constructed from living botanical specimens. \"This garden exists perpetually for those who value friendship and recreation!\" The {favoriteAnimal} allies from their tree dwelling gifted them with a mystical nut that would radiate light whenever new adventures became available. Returning through the shimmering gateway, {userName} felt profound gratitude for understanding that authentic magic emerges when one truly believes in the transformative power of friendship."
          ],
          optionalDetails: ["The flower crown felt warm and alive against their head.", "Starlight began to twinkle in the magical garden.", "The promise of return filled their heart with joy."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "That night, {userName} fell asleep wearing their magical flower crown, dreaming of swinging on cloud-swings with their {favoriteAnimal} friends. The garden sprites sang gentle lullabies through the {favoriteColor} petals, while the glowing acorn pulsed softly on their nightstand, promising more magical tomorrows filled with friendship and wonder.",
        microVariants: [
          "Peaceful slumber came easily with the enchanted crown resting gently on their pillow, carrying {userName} into dreams of endless playground adventures with their beloved {favoriteAnimal} companions. Soft melodies from the garden fairies drifted through the {favoriteColor} blossoms, while the luminous acorn glowed tenderly beside their bed, ensuring sweet dreams of future magical experiences.",
          "Sleep arrived wrapped in the comfort of living flowers, transporting {userName} to dream-adventures of cloud-touching swings and tree-house games with their dear {favoriteAnimal} friends. Whispered songs from the garden pixies flowed through the {favoriteColor} petals, while the radiant acorn cast gentle light across their room, guaranteeing dreams filled with friendship and magic."
        ]
      },
      {
        type: 'silly',
        text: "The magical {favoriteFood} from the garden followed {userName} home and started a conga line in their kitchen! \"Conga food, conga food!\" sang the dancing treats while the {favoriteColor} flower crown giggled on {userName}'s head. Even the glowing acorn joined in by flashing in rhythm like the world's tiniest disco ball!",
        microVariants: [
          "\"Dancing dinner party!\" announced the enchanted {favoriteFood} as they formed a ridiculous parade around the house! The {favoriteColor} flower crown couldn't stop giggling at the silly spectacle, while the magical acorn transformed into a miniature light show, creating the most absurd kitchen celebration ever!",
          "The magical {favoriteFood} refused to stay in the garden and insisted on hosting an impromptu dance party in {userName}'s home! \"Follow the food parade!\" they chanted while marching in formation, as the {favoriteColor} flower crown shook with laughter and the glowing acorn provided disco lighting for the silliest culinary celebration!"
        ]
      },
      {
        type: 'triumphant',
        text: "\"Champion of Friendship Magic!\" declared the garden sprites as they appeared in {userName}'s room for a special ceremony. \"You've proven that the greatest magic comes from believing in friendship!\" They presented {userName} with a Golden {favoriteColor} Medal of Magical Friendship, while their {favoriteAnimal} tree friends cheered through the glowing acorn communication system.",
        microVariants: [
          "\"Master of Garden Magic!\" proclaimed the fairies during their surprise visit to honor {userName}. \"Your heart has shown that true magic lives in friendship and kindness!\" They awarded {userName} the prestigious Crystal {favoriteColor} Award of Friendship Excellence, as their {favoriteAnimal} companions celebrated through the magical acorn's communication network.",
          "\"Supreme Friendship Magician!\" announced the pixies as they materialized for a grand recognition ceremony. \"You've discovered that the most powerful magic is the magic of caring friendships!\" They bestowed upon {userName} the legendary Diamond {favoriteColor} Trophy of Magical Friendship Mastery, while their {favoriteAnimal} allies applauded through the enchanted acorn's mystical connection."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} looked at their magical flower crown and glowing acorn, understanding something wonderful about friendship. \"The best adventures happen when we're open to making new friends,\" they realized peacefully. \"Magic isn't just in gardens - it's in every friendship we make and every kindness we share.\" The warm glow of the acorn seemed to agree.",
        microVariants: [
          "Holding their enchanted gifts gently, {userName} gained deep insight about the nature of connection and wonder. \"True magic lives in the friendships we create and the joy we share with others,\" they understood with quiet wisdom. \"Every act of friendship opens a door to new adventures and possibilities.\" The acorn's gentle light confirmed this beautiful truth.",
          "Gazing thoughtfully at their magical treasures, {userName} experienced a profound understanding about life and relationships. \"The greatest magic isn't something we find - it's something we create through friendship and caring,\" they comprehended with peaceful clarity. \"When we open our hearts to others, we open ourselves to endless magical possibilities.\" The acorn pulsed warmly in agreement."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "garden sprites": ["flower fairies", "tree pixies", "rainbow elves", "garden angels", "magic butterflies"],
        "Growing Garden": ["Friendship Garden", "Wishing Garden", "Magic Playground", "Wonder Garden", "Dream Garden"],
        "tree house": ["flower castle", "rainbow fort", "cloud palace", "magic treehouse", "friendship clubhouse"]
      },
      weatherVariants: ["magical", "enchanting", "glowing", "sparkling", "wondrous"],
      settingVariants: ["in the afternoon", "during playtime", "on a weekend", "after school", "during summer"]
    }
  },

  // Template 4: Adventure Journeys Theme
  {
    title: "The Pirate Ship in the Clouds",
    theme: "Adventure Journeys",
    level: "Level 2 (Ages 7-9)",
    scenes: [
      {
        text: "While flying a {favoriteColor} kite in the park, {userName} noticed something extraordinary - their kite string was pulling them gently upward! Their loyal {favoriteAnimal} companion barked excitedly and jumped up to grab the kite string too. Together, they were lifted high above the trees and into the fluffy white clouds, where they discovered an amazing pirate ship floating in the sky, with friendly pirates who were searching for crew members who knew about {hobbies} and loved sharing {favoriteFood} with new friends.",
        pause: true,
        hook: "What adventures await {userName} aboard the cloud pirate ship?",
        microVariants: {
          text: "While flying a {favoriteColor} kite in the park, {userName} noticed something extraordinary - their kite string was pulling them gently upward! Their loyal {favoriteAnimal} companion barked excitedly and jumped up to grab the kite string too. Together, they were lifted high above the trees and into the fluffy white clouds, where they discovered an amazing pirate ship floating in the sky, with friendly pirates who were searching for crew members who knew about {hobbies} and loved sharing {favoriteFood} with new friends.",
          alternatives: [
            "During their {favoriteColor} kite-flying adventure in the neighborhood park, {userName} experienced something truly remarkable - the kite began gently pulling them skyward with magical force! Their faithful {favoriteAnimal} friend noticed the unusual occurrence and enthusiastically grabbed onto the kite string to join the adventure. Both companions found themselves carefully lifted above the treetops and into the billowing cloud formations, where they encountered a magnificent pirate vessel sailing through the sky, crewed by cheerful buccaneers seeking adventurous individuals with knowledge of {hobbies} and a willingness to share {favoriteFood} with fellow travelers.",
            "While enjoying their {favoriteColor} kite during an afternoon at the local park, {userName} witnessed an incredible phenomenon - the kite string was mysteriously drawing them upward into the atmosphere! Their devoted {favoriteAnimal} partner observed this amazing event and eagerly latched onto the string to participate in the extraordinary journey. Together they were gently transported above the forest canopy and into the soft white cloud layers, where they discovered a spectacular pirate ship navigating the celestial waters, staffed by kind-hearted pirates actively recruiting crew members who possessed expertise in {hobbies} and enjoyed distributing {favoriteFood} among their new companions."
          ],
          optionalDetails: ["The clouds felt like soft cotton candy.", "Seagulls flew alongside them in the sky.", "The wind carried the sound of sea shanties."]
        }
      },
      {
        text: "Captain Cloudbeard welcomed {userName} and their {favoriteAnimal} aboard with a hearty laugh and a {favoriteColor} bandana for each of them. \"Ahoy, new crew members!\" he boomed cheerfully. \"We sail the sky seas searching for Cloud Treasure - magical crystals that bring happiness to children all over the world!\" The pirate crew showed them the ship's special features: sails made of rainbow fabric, a crow's nest that could see through clouds, and a galley kitchen where they cooked the most delicious {favoriteFood} recipes from every country on Earth.",
        pause: true,
        hook: "Where will the sky pirates sail to search for the magical Cloud Treasure?",
        microVariants: {
          text: "Captain Cloudbeard welcomed {userName} and their {favoriteAnimal} aboard with a hearty laugh and a {favoriteColor} bandana for each of them. \"Ahoy, new crew members!\" he boomed cheerfully. \"We sail the sky seas searching for Cloud Treasure - magical crystals that bring happiness to children all over the world!\" The pirate crew showed them the ship's special features: sails made of rainbow fabric, a crow's nest that could see through clouds, and a galley kitchen where they cooked the most delicious {favoriteFood} recipes from every country on Earth.",
          alternatives: [
            "Captain Skybeard greeted {userName} and their {favoriteAnimal} companion with enthusiastic laughter and presented each with a distinctive {favoriteColor} head covering. \"Welcome aboard, fellow adventurers!\" he declared with tremendous joy. \"Our mission involves navigating the celestial ocean waters while seeking Cloud Treasure - enchanted gemstones that deliver joy and wonder to young people throughout the entire planet!\" The experienced pirate team demonstrated the vessel's remarkable capabilities: wind-catchers constructed from prismatic materials, an observation platform capable of penetrating cloud formations, and a culinary center where they prepared extraordinarily tasty {favoriteFood} dishes representing every nation across the globe.",
            "Captain Stormbeard received {userName} and their {favoriteAnimal} friend with boisterous merriment and provided each with a special {favoriteColor} headpiece. \"Greetings, brave new sailors!\" he announced with infectious enthusiasm. \"We traverse the atmospheric seas in pursuit of Cloud Treasure - mystical stones that generate happiness and excitement for children across every continent!\" The skilled pirate crew revealed the ship's amazing attributes: wind-capturing devices fashioned from spectrum-colored fabric, a lookout position designed to pierce through cloud barriers, and a cooking facility where they created incredibly flavorful {favoriteFood} specialties representing culinary traditions from around the world."
          ],
          optionalDetails: ["The ship's bell rang with musical chimes.", "Flags of every color fluttered in the wind.", "The deck sparkled with stardust and sea spray."]
        }
      },
      {
        text: "Their first stop was Cumulus Island, a floating cloud formation shaped like a giant {favoriteAnimal}, where they met the Cloud Guardians who protected the treasure. \"To earn Cloud Treasure, you must prove your skills in {hobbies} and show you can work as a team,\" explained the wisest Guardian. {userName} and the pirates worked together, using their {hobbies} knowledge to solve cloud puzzles and navigate through sky mazes. When they succeeded, the Guardians rewarded them with glowing {favoriteColor} crystals that made everyone feel incredibly happy and proud of their teamwork.",
        pause: true,
        hook: "What other sky islands and challenges will the crew discover?",
        microVariants: {
          text: "Their first stop was Cumulus Island, a floating cloud formation shaped like a giant {favoriteAnimal}, where they met the Cloud Guardians who protected the treasure. \"To earn Cloud Treasure, you must prove your skills in {hobbies} and show you can work as a team,\" explained the wisest Guardian. {userName} and the pirates worked together, using their {hobbies} knowledge to solve cloud puzzles and navigate through sky mazes. When they succeeded, the Guardians rewarded them with glowing {favoriteColor} crystals that made everyone feel incredibly happy and proud of their teamwork.",
          alternatives: [
            "Their initial destination was Nimbus Isle, an elevated cloud structure resembling an enormous {favoriteAnimal}, where they encountered the Cloud Protectors who safeguarded the mystical treasures. \"To obtain Cloud Treasure, you must demonstrate your expertise in {hobbies} while proving your ability to collaborate effectively as a unified group,\" instructed the most experienced Protector. {userName} and their pirate companions collaborated harmoniously, applying their {hobbies} understanding to resolve atmospheric riddles and successfully traverse celestial labyrinth challenges. Upon achieving success, the Protectors presented them with luminous {favoriteColor} gems that filled everyone with extraordinary joy and tremendous pride in their collaborative achievements.",
            "Their primary location was Stratus Territory, a suspended cloud mass configured in the shape of a massive {favoriteAnimal}, where they discovered the Cloud Keepers who maintained custody of the precious treasures. \"To acquire Cloud Treasure, you must establish your competency in {hobbies} activities while demonstrating your capacity for effective team cooperation,\" declared the most knowledgeable Keeper. {userName} and the pirate crew functioned as a cohesive unit, utilizing their {hobbies} expertise to decipher cloud-based challenges and successfully complete sky-high maze navigation tasks. Following their triumphant completion, the Keepers bestowed upon them radiant {favoriteColor} crystals that generated feelings of exceptional happiness and immense satisfaction in their collective accomplishments."
          ],
          optionalDetails: ["The island glowed with soft, welcoming light.", "Gentle cloud creatures danced around them.", "Success tasted sweeter than any candy."]
        }
      },
      {
        text: "Next, they sailed to Thunder Cloud Castle, where the Storm King challenged them to a friendly competition of {hobbies} skills. \"I love meeting young adventurers!\" boomed the Storm King with a voice like gentle thunder. \"Show me your best {hobbies} techniques, and I'll share my storm treasures!\" {userName} performed amazingly, and the pirates cheered loudly. The Storm King was so impressed that he gave them lightning-powered {favoriteColor} crystals and taught them how to make thunder sound effects by clapping their hands in special rhythms, which made everyone laugh with delight.",
        pause: true,
        hook: "What final sky adventure awaits before they return home?",
        microVariants: {
          text: "Next, they sailed to Thunder Cloud Castle, where the Storm King challenged them to a friendly competition of {hobbies} skills. \"I love meeting young adventurers!\" boomed the Storm King with a voice like gentle thunder. \"Show me your best {hobbies} techniques, and I'll share my storm treasures!\" {userName} performed amazingly, and the pirates cheered loudly. The Storm King was so impressed that he gave them lightning-powered {favoriteColor} crystals and taught them how to make thunder sound effects by clapping their hands in special rhythms, which made everyone laugh with delight.",
          alternatives: [
            "Subsequently, they navigated toward Lightning Cloud Fortress, where the Thunder Monarch issued them a cordial challenge involving {hobbies} demonstrations. \"I thoroughly enjoy encountering youthful explorers!\" declared the Thunder Monarch with vocal tones resembling pleasant atmospheric disturbances. \"Display your finest {hobbies} abilities, and I shall distribute my meteorological treasures among you!\" {userName} executed their skills with remarkable proficiency, prompting enthusiastic celebration from their pirate companions. The Thunder Monarch was so thoroughly impressed by their performance that he presented them with electrically-charged {favoriteColor} gems and provided instruction in creating atmospheric sound effects through specialized hand-clapping sequences, generating universal amusement and joy.",
            "Following their previous success, they steered toward Storm Cloud Palace, where the Weather Emperor presented them with an amicable contest focused on {hobbies} expertise. \"I find great pleasure in meeting adventurous young individuals!\" proclaimed the Weather Emperor with a voice reminiscent of soothing thunder rumbles. \"Demonstrate your most accomplished {hobbies} methods, and I will bestow my atmospheric treasures upon your crew!\" {userName} executed their skills with exceptional excellence, eliciting tremendous applause from their pirate allies. The Weather Emperor was so genuinely amazed by their capabilities that he awarded them storm-charged {favoriteColor} crystals and educated them in producing thunder-like sounds through specific rhythmic hand gestures, creating widespread entertainment and happiness throughout the group."
          ],
          optionalDetails: ["Lightning danced harmlessly around the castle.", "Thunder rolled like distant drums.", "The Storm King's crown sparkled with contained lightning."]
        }
      },
      {
        text: "For their final adventure, Captain Cloudbeard surprised everyone by organizing a grand sky feast to celebrate their successful treasure hunt. Pirates from other cloud ships joined them, bringing {favoriteFood} specialties from their travels around the world. {userName} taught everyone their favorite {hobbies} games while their {favoriteAnimal} became the ship's official mascot. As sunset painted the clouds in {favoriteColor} hues, they realized it was time to return home, but Captain Cloudbeard gave them a special cloud compass that would guide them back to the sky seas whenever they wanted more adventures.",
        pause: true,
        hook: "How will {userName} use their magical cloud compass for future sky adventures?",
        microVariants: {
          text: "For their final adventure, Captain Cloudbeard surprised everyone by organizing a grand sky feast to celebrate their successful treasure hunt. Pirates from other cloud ships joined them, bringing {favoriteFood} specialties from their travels around the world. {userName} taught everyone their favorite {hobbies} games while their {favoriteAnimal} became the ship's official mascot. As sunset painted the clouds in {favoriteColor} hues, they realized it was time to return home, but Captain Cloudbeard gave them a special cloud compass that would guide them back to the sky seas whenever they wanted more adventures.",
          alternatives: [
            "As their ultimate experience, Captain Skybeard orchestrated an elaborate aerial celebration to commemorate their triumphant treasure acquisition expedition. Buccaneers from additional cloud vessels participated in the festivities, contributing {favoriteFood} delicacies collected during their global voyages. {userName} instructed the entire gathering in their preferred {hobbies} recreational activities while their {favoriteAnimal} companion earned the prestigious position of official ship representative. When the evening sun transformed the cloud formations into brilliant {favoriteColor} displays, they recognized the moment for homeward departure had arrived, yet Captain Skybeard presented them with an enchanted atmospheric navigation device that would facilitate their return to the celestial waters during future adventure-seeking expeditions.",
            "To conclude their remarkable journey, Captain Stormbeard coordinated a magnificent atmospheric banquet honoring their successful treasure recovery mission. Fellow pirates from neighboring cloud fleets attended the celebration, offering {favoriteFood} specialties gathered throughout their worldwide expeditions. {userName} shared their beloved {hobbies} entertainment activities with the assembled crowd while their {favoriteAnimal} partner achieved the honored status of ceremonial ship symbol. As the descending sun bathed the surrounding clouds in spectacular {favoriteColor} illumination, they acknowledged that departure time had approached, however Captain Stormbeard bestowed upon them a mystical cloud navigation instrument that would enable their return to the sky ocean realm whenever they desired additional adventure experiences."
          ],
          optionalDetails: ["The feast table stretched across three cloud formations.", "Music from a dozen different cultures filled the air.", "Stars began twinkling like tiny lanterns above."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "That night, {userName} drifted off to sleep holding their magical cloud compass while their {favoriteAnimal} curled up beside them, both dreaming of floating through soft clouds and singing sea shanties with their new pirate friends. The {favoriteColor} crystals glowed gently on their nightstand, filling the room with peaceful light and the sound of distant ocean waves that promised more sky adventures in their dreams.",
        microVariants: [
          "Sleep came wrapped in the comfort of their cloud compass while their {favoriteAnimal} snuggled close, both entering dreams filled with gentle sky sailing and harmonious songs shared with their beloved pirate crew. The luminous {favoriteColor} gems cast tranquil illumination throughout their room, accompanied by soothing sounds of faraway sea breezes that guaranteed continued aerial adventures within their slumber.",
          "Peaceful rest arrived as {userName} clutched their enchanted navigation device with their {favoriteAnimal} companion nestled nearby, both experiencing dreams of serene cloud journeys and melodic sea chanties performed alongside their cherished pirate friends. The radiant {favoriteColor} crystals provided calm lighting across their bedroom, enhanced by comforting echoes of distant maritime winds that ensured ongoing sky adventures throughout their sleep."
        ]
      },
      {
        type: 'silly',
        text: "The magical {favoriteColor} crystals started hiccupping rainbow bubbles all over {userName}'s room! \"Hic-rainbow-hic!\" they giggled while bouncing off the walls like tiny disco balls. The cloud compass began spinning so fast it played \"Yo Ho Ho\" like a music box, while their {favoriteAnimal} tried to catch the giggling bubbles, creating the most wonderfully chaotic pirate party bedroom ever!",
        microVariants: [
          "\"Pirate bubble invasion!\" announced the {favoriteColor} crystals as they erupted in uncontrollable rainbow hiccups throughout the room! The compass transformed into a spinning musical instrument playing sea shanties at triple speed, while their {favoriteAnimal} attempted an elaborate bubble-catching dance routine, resulting in the most delightfully ridiculous maritime bedroom celebration!",
          "The enchanted {favoriteColor} gems developed a case of the musical hiccups, producing rainbow bubble explosions with every \"hic-hic-hooray!\" The magical compass spun like a tiny tornado while singing pirate songs, as their {favoriteAnimal} performed amazing acrobatic bubble-popping maneuvers, creating the ultimate silly sky pirate bedroom spectacular!"
        ]
      },
      {
        type: 'triumphant',
        text: "\"Honorary Sky Pirate Captain!\" declared Captain Cloudbeard's voice through the magical compass as {userName} received their official pirate certificate in the mail the next morning. \"The bravest and most skilled crew member we've ever had!\" The entire neighborhood gathered as {userName} showed off their {favoriteColor} crystals and demonstrated their thunder-clapping techniques, proving that some children are destined for legendary sky adventures.",
        microVariants: [
          "\"Supreme Commander of Cloud Adventures!\" proclaimed the compass as {userName} discovered their official sky pirate credentials delivered by a cloud-mail seagull. \"The most courageous and talented navigator in celestial history!\" The whole community assembled to witness {userName} display their {favoriteColor} treasure collection and perform their atmospheric sound effects, confirming that certain young adventurers are meant for extraordinary aerial legends.",
          "\"Master of Sky Seas Navigation!\" announced Captain Cloudbeard through their magical device as {userName} found their prestigious pirate diploma floating down from the clouds. \"The most fearless and accomplished crew member to ever sail the atmosphere!\" Everyone in town came to observe {userName} exhibit their {favoriteColor} crystal collection and demonstrate their storm-summoning abilities, establishing that exceptional children are destined for magnificent sky-bound adventures."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} sat quietly by their window, watching real clouds drift by while holding their compass and crystals. \"Adventure isn't just about treasure,\" they realized thoughtfully. \"It's about the friends you make and the courage you discover inside yourself.\" Their {favoriteAnimal} wagged its tail in agreement, and {userName} smiled, knowing that the greatest treasures are the memories and friendships that last forever.",
        microVariants: [
          "Gazing peacefully at the passing sky formations while cradling their magical gifts, {userName} gained profound insight about the nature of adventure and discovery. \"True treasure exists in the relationships we build and the bravery we find within our hearts,\" they understood with quiet wisdom. Their {favoriteAnimal} companion showed agreement through gentle tail movements, and {userName} experienced deep contentment knowing that the most valuable treasures are lasting connections and cherished experiences.",
          "Observing the natural cloud movements through their window while holding their enchanted treasures, {userName} developed a deeper understanding of adventure's true meaning. \"Real wealth comes from the companions we meet along our journey and the inner strength we develop,\" they comprehended with peaceful clarity. Their {favoriteAnimal} partner demonstrated approval through happy tail wagging, and {userName} felt profound satisfaction recognizing that life's greatest treasures are enduring friendships and unforgettable memories."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "Captain Cloudbeard": ["Captain Skywind", "Captain Stormbeard", "Captain Moonbeard", "Captain Starwhisker", "Captain Thunderstorm"],
        "Cloud Treasure": ["Sky Gems", "Storm Crystals", "Wind Jewels", "Thunder Stones", "Star Pearls"],
        "cloud compass": ["sky map", "wind whistle", "storm medallion", "thunder token", "star compass"]
      },
      weatherVariants: ["breezy", "windy", "cloudy", "clear", "sunny"],
      settingVariants: ["at the park", "in the backyard", "on the playground", "at school", "during recess"]
    }
  },

  // Template 5: Friendship & Teamwork Theme
  {
    title: "The Community Garden Heroes", 
    theme: "Friendship & Teamwork",
    level: "Level 2 (Ages 7-9)",
    scenes: [
      {
        text: "{userName} noticed that their neighborhood's community garden looked sad and neglected, with wilted plants and broken fences. Their helpful {favoriteAnimal} companion whimpered sadly at the sight. \"We should do something to help!\" {userName} decided, remembering how much everyone used to enjoy the fresh {favoriteFood} that grew there. They made a {favoriteColor} poster asking for volunteers to help restore the garden, and to their surprise, children and adults from all over the neighborhood responded, eager to work together and bring their community space back to life.",
        pause: true,
        hook: "What will the community volunteers accomplish when they work as a team?",
        microVariants: {
          text: "{userName} noticed that their neighborhood's community garden looked sad and neglected, with wilted plants and broken fences. Their helpful {favoriteAnimal} companion whimpered sadly at the sight. \"We should do something to help!\" {userName} decided, remembering how much everyone used to enjoy the fresh {favoriteFood} that grew there. They made a {favoriteColor} poster asking for volunteers to help restore the garden, and to their surprise, children and adults from all over the neighborhood responded, eager to work together and bring their community space back to life.",
          alternatives: [
            "{userName} observed that their local community garden appeared forlorn and abandoned, featuring deteriorating vegetation and damaged protective barriers. Their compassionate {favoriteAnimal} friend expressed distress through sorrowful sounds upon witnessing the unfortunate condition. \"We must take action to assist this important space!\" {userName} resolved, recalling the community's previous enjoyment of the healthy {favoriteFood} crops that once flourished there. They created an eye-catching {favoriteColor} announcement seeking volunteer assistance for garden restoration efforts, and were pleasantly amazed when residents of all ages from throughout the neighborhood enthusiastically responded, demonstrating their collective desire to collaborate in revitalizing their shared community resource.",
            "{userName} recognized that their area's shared garden space had become dispirited and uncared for, displaying withering plant life and deteriorated boundary structures. Their empathetic {favoriteAnimal} partner vocalized sadness when confronted with this unfortunate scene. \"We need to organize help for this valuable community asset!\" {userName} determined, remembering the widespread appreciation residents once had for the nutritious {favoriteFood} produce that previously grew abundantly there. They designed an attractive {favoriteColor} volunteer recruitment notice for garden rehabilitation activities, and were delightfully surprised when community members spanning all age groups from across the entire neighborhood eagerly volunteered, showing their unified commitment to cooperating in the restoration of their precious shared community facility."
          ],
          optionalDetails: ["Butterflies still visited the few remaining flowers.", "The garden tools were rusty but still usable.", "Hope seemed to shimmer in the morning dew."]
        }
      },
      {
        text: "The first day of restoration was amazing! Mrs. Chen brought her expertise in growing {favoriteFood}, while teenager Marcus taught everyone about composting using his knowledge from {hobbies} class. Little Sophie contributed by organizing all the tools with {favoriteColor} labels, and {userName}'s {favoriteAnimal} became the official garden mascot, entertaining everyone with playful antics. Working together, they cleared weeds, repaired the fence, and planted new seeds, with each person contributing their unique skills and everyone learning something new from their neighbors.",
        pause: true,
        hook: "What wonderful changes will appear as the garden grows?",
        microVariants: {
          text: "The first day of restoration was amazing! Mrs. Chen brought her expertise in growing {favoriteFood}, while teenager Marcus taught everyone about composting using his knowledge from {hobbies} class. Little Sophie contributed by organizing all the tools with {favoriteColor} labels, and {userName}'s {favoriteAnimal} became the official garden mascot, entertaining everyone with playful antics. Working together, they cleared weeds, repaired the fence, and planted new seeds, with each person contributing their unique skills and everyone learning something new from their neighbors.",
          alternatives: [
            "The inaugural restoration session proved extraordinarily successful! Mrs. Chen shared her specialized knowledge of {favoriteFood} cultivation techniques, while adolescent Marcus provided educational instruction regarding composting methods derived from his {hobbies} academic experience. Young Sophie made valuable contributions through systematic tool organization utilizing {favoriteColor} identification systems, and {userName}'s {favoriteAnimal} companion assumed the prestigious role of official garden representative, providing entertainment through amusing behavioral displays. Through collaborative effort, they eliminated invasive vegetation, restored protective barriers, and established new plant growth, with each individual providing distinctive capabilities while gaining fresh knowledge from their community associates.",
            "The initial rehabilitation day achieved remarkable success! Mrs. Chen contributed her advanced understanding of {favoriteFood} agricultural practices, while teenage Marcus delivered comprehensive education about organic waste processing utilizing expertise from his {hobbies} curriculum. Little Sophie offered significant assistance by systematically arranging equipment with {favoriteColor} organizational markers, and {userName}'s {favoriteAnimal} partner earned the distinguished position of ceremonial garden symbol, offering amusement through delightful performance activities. Working as a unified team, they removed unwanted plant growth, reconstructed boundary structures, and initiated new vegetation establishment, with every participant supplying specialized talents while acquiring additional knowledge from their neighborhood community members."
          ],
          optionalDetails: ["The sound of laughter mixed with the sound of working tools.", "Each person discovered hidden talents they didn't know they had.", "Teamwork made even hard work feel like fun."]
        }
      },
      {
        text: "As weeks passed, the garden transformed into a beautiful community hub where neighbors gathered daily to tend plants and share stories. The {favoriteFood} grew bigger and tastier than ever before, and {userName} organized weekly {favoriteColor} picnics where everyone brought dishes made from their garden harvest. Children learned about gardening from adults, while adults learned new {hobbies} skills from the kids. The {favoriteAnimal} mascot had its own special doghouse in the garden where it could greet visitors and keep watch over the growing plants, creating a sense of belonging for everyone in the neighborhood.",
        pause: true,
        hook: "What special community traditions will develop around their thriving garden?",
        microVariants: {
          text: "As weeks passed, the garden transformed into a beautiful community hub where neighbors gathered daily to tend plants and share stories. The {favoriteFood} grew bigger and tastier than ever before, and {userName} organized weekly {favoriteColor} picnics where everyone brought dishes made from their garden harvest. Children learned about gardening from adults, while adults learned new {hobbies} skills from the kids. The {favoriteAnimal} mascot had its own special doghouse in the garden where it could greet visitors and keep watch over the growing plants, creating a sense of belonging for everyone in the neighborhood.",
          alternatives: [
            "Throughout the following weeks, the garden evolved into a magnificent community center where residents assembled regularly to care for vegetation and exchange personal narratives. The {favoriteFood} developed with increased size and enhanced flavor beyond previous expectations, and {userName} coordinated regular {favoriteColor} outdoor dining events where participants contributed meals prepared using their garden's agricultural output. Younger community members gained horticultural knowledge from experienced adults, while mature residents acquired fresh {hobbies} expertise from the children. The {favoriteAnimal} representative maintained its own designated shelter within the garden space where it could welcome guests and monitor the developing plant life, fostering a strong sense of community identity among all neighborhood inhabitants.",
            "During subsequent weeks, the garden metamorphosed into an exceptional community focal point where local residents convened consistently to nurture plant growth and share life experiences. The {favoriteFood} production achieved superior dimensions and taste quality compared to all previous harvests, and {userName} established recurring {favoriteColor} community feast gatherings where attendees provided culinary creations utilizing their garden's fresh produce. Youth participants received agricultural education from knowledgeable adults, while adult community members learned innovative {hobbies} techniques from younger participants. The {favoriteAnimal} ambassador enjoyed its own custom-built residence within the garden facility where it could receive visitors and supervise the flourishing vegetation, generating a profound sense of community connection among every neighborhood resident."
          ],
          optionalDetails: ["The garden attracted beneficial insects and birds.", "Seasons brought new varieties of vegetables to enjoy.", "Friendships bloomed as beautifully as the flowers."]
        }
      },
      {
        text: "The garden's success inspired other neighborhoods to start their own community projects. {userName} became known as the \"Community Garden Champion\" and was invited to speak at schools about teamwork and environmental stewardship. Their {favoriteAnimal} companion became famous too, appearing in newspaper articles about community cooperation. The mayor even visited to see their amazing transformation and declared it an official \"Neighborhood Pride Garden,\" presenting {userName} with a special {favoriteColor} certificate recognizing their leadership in bringing people together through gardening.",
        pause: true,
        hook: "How will {userName} continue to inspire community cooperation and environmental care?",
        microVariants: {
          text: "The garden's success inspired other neighborhoods to start their own community projects. {userName} became known as the \"Community Garden Champion\" and was invited to speak at schools about teamwork and environmental stewardship. Their {favoriteAnimal} companion became famous too, appearing in newspaper articles about community cooperation. The mayor even visited to see their amazing transformation and declared it an official \"Neighborhood Pride Garden,\" presenting {userName} with a special {favoriteColor} certificate recognizing their leadership in bringing people together through gardening.",
          alternatives: [
            "The garden's remarkable achievements motivated additional residential areas to initiate their own collaborative community enhancement projects. {userName} earned recognition as the \"Community Agricultural Leadership Ambassador\" and received invitations to address educational institutions regarding collaborative teamwork and environmental responsibility principles. Their {favoriteAnimal} partner achieved celebrity status as well, featuring prominently in media publications documenting successful community collaboration initiatives. The municipal leader personally conducted a visit to observe their extraordinary transformation results and officially designated the space as a certified \"Community Excellence Garden,\" awarding {userName} with a distinguished {favoriteColor} recognition document acknowledging their exceptional leadership in uniting diverse community members through agricultural collaboration.",
            "The garden's outstanding success encouraged neighboring residential districts to establish their own cooperative community development initiatives. {userName} gained prominence as the \"Community Horticulture Coordination Specialist\" and was requested to present at academic facilities concerning team collaboration methodologies and ecological stewardship practices. Their {favoriteAnimal} associate attained recognition status as well, being featured in journalistic publications highlighting effective community partnership programs. The city's chief administrator personally attended to witness their remarkable rehabilitation achievement and formally proclaimed the location as an accredited \"Community Achievement Garden,\" bestowing upon {userName} a prestigious {favoriteColor} commendation certificate honoring their superior leadership abilities in connecting various community stakeholders through shared gardening experiences."
          ],
          optionalDetails: ["The certificate was framed and displayed in the garden's tool shed.", "Television news crews came to document their success.", "Other cities sent delegations to learn from their model."]
        }
      },
      {
        text: "One year later, {userName} stood in the middle of their thriving garden during the annual Harvest Festival, surrounded by friends old and new, watching children play while adults shared recipes and gardening tips. The {favoriteFood} plants had produced the most abundant harvest ever, and the {favoriteColor} flowers created a rainbow of beauty throughout the space. Their faithful {favoriteAnimal} wore a special festival collar and helped distribute seed packets to visitors who wanted to start gardens in their own neighborhoods, continuing the cycle of community building and environmental care that {userName} had started with one simple act of noticing and caring.",
        pause: true,
        hook: "What new community gardens and friendships will grow from the seeds {userName} has shared?",
        microVariants: {
          text: "One year later, {userName} stood in the middle of their thriving garden during the annual Harvest Festival, surrounded by friends old and new, watching children play while adults shared recipes and gardening tips. The {favoriteFood} plants had produced the most abundant harvest ever, and the {favoriteColor} flowers created a rainbow of beauty throughout the space. Their faithful {favoriteAnimal} wore a special festival collar and helped distribute seed packets to visitors who wanted to start gardens in their own neighborhoods, continuing the cycle of community building and environmental care that {userName} had started with one simple act of noticing and caring.",
          alternatives: [
            "Twelve months afterward, {userName} positioned themselves within the center of their flourishing agricultural space during the yearly Harvest Celebration event, encompassed by established and recently formed friendships, observing children engaging in recreational activities while mature community members exchanged culinary formulas and horticultural guidance. The {favoriteFood} vegetation had generated the most productive yield in the garden's history, and the {favoriteColor} flowering plants established a spectrum of aesthetic beauty throughout the entire area. Their devoted {favoriteAnimal} companion displayed a ceremonial celebration accessory and assisted in providing seed distribution packages to guests who aspired to establish agricultural spaces within their own residential communities, perpetuating the continuous process of community development and environmental stewardship that {userName} had initiated through one fundamental action of observation and compassionate concern.",
            "Following a complete annual cycle, {userName} found themselves positioned centrally within their prosperous garden facility during the traditional Harvest Festival celebration, surrounded by both longstanding and newly developed friendships, witnessing youth recreational engagement while adult participants shared culinary preparation methods and agricultural cultivation advice. The {favoriteFood} crops had achieved the most successful production outcome ever recorded, and the {favoriteColor} ornamental plants generated a comprehensive display of visual splendor across the complete garden space. Their loyal {favoriteAnimal} partner wore distinctive festival attire and contributed to seed packet distribution activities for visitors interested in creating agricultural projects within their respective neighborhood locations, maintaining the ongoing cycle of community enhancement and ecological responsibility that {userName} had established through one simple gesture of attentive awareness and caring action."
          ],
          optionalDetails: ["Music from a local band filled the air with celebration.", "The festival became an annual tradition for the whole city.", "Seeds of change were literally being planted across the region."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "That evening, as the festival lights twinkled like stars among the garden plants, {userName} sat peacefully with their {favoriteAnimal} on their favorite garden bench, watching fireflies dance among the {favoriteColor} flowers. \"Sometimes the smallest act of caring can grow into something beautiful,\" they reflected quietly. The gentle sounds of the community garden - leaves rustling, water trickling, and distant laughter - created the perfect lullaby for dreams filled with growing things and growing friendships.",
        microVariants: [
          "As twilight settled over the celebration, {userName} found tranquility beside their {favoriteAnimal} companion on their cherished garden seating, observing lightning bugs perform graceful movements among the {favoriteColor} blossoms. \"Often the most modest gesture of compassion can develop into something magnificent,\" they contemplated peacefully. The soothing sounds of their community space - foliage whispers, water flow, and gentle voices - formed an ideal symphony for sleep filled with visions of flourishing plants and developing relationships.",
          "During the quiet evening hours following the festivities, {userName} experienced serenity alongside their {favoriteAnimal} friend on their beloved garden rest area, watching luminescent insects create elegant displays among the {favoriteColor} flowering plants. \"Frequently the tiniest expression of kindness can transform into something wonderful,\" they pondered with contentment. The calming audio of their shared garden environment - plant movement, liquid sounds, and soft conversation - provided perfect background music for dreams containing images of thriving vegetation and expanding community bonds."
        ]
      },
      {
        type: 'silly',
        text: "The {favoriteFood} from the garden decided to throw their own surprise party! \"Conga vegetables, conga vegetables!\" they chanted while forming a dancing line through the festival crowd. The {favoriteColor} flowers started giggling and spinning like tiny ballerinas, while {userName}'s {favoriteAnimal} tried to conduct the vegetable orchestra with its tail, creating the most wonderfully ridiculous harvest celebration ever!",
        microVariants: [
          "\"Dancing harvest parade!\" announced the {favoriteFood} as they organized an impromptu celebration march throughout the festival grounds! The {favoriteColor} blossoms erupted in uncontrollable laughter while performing spinning performances like miniature dancers, as {userName}'s {favoriteAnimal} attempted to direct the produce symphony using tail movements, resulting in the most delightfully absurd agricultural festival in history!",
          "The garden's {favoriteFood} crops initiated their own spontaneous entertainment spectacular! \"Follow the veggie conga line!\" they declared while creating an elaborate dance procession among the celebrating crowd. The {favoriteColor} flowers couldn't stop chuckling as they twirled like professional performers, while {userName}'s {favoriteAnimal} served as the official conductor for the produce musical ensemble, generating the ultimate silly harvest celebration experience!"
        ]
      },
      {
        type: 'triumphant',
        text: "\"Community Garden Superhero!\" proclaimed the mayor as she presented {userName} with the city's highest honor for community service. \"You've shown that one person's caring action can transform an entire neighborhood!\" The crowd of hundreds cheered as {userName} held up their {favoriteColor} medal while their proud {favoriteAnimal} wore a matching ribbon. \"No challenge is too big when communities work together!\" {userName} declared, inspiring everyone to start their own positive changes.",
        microVariants: [
          "\"Champion of Community Transformation!\" declared the municipal leader while bestowing {userName} with the city's most prestigious recognition for civic contribution. \"You've demonstrated that individual compassionate initiative can revolutionize an entire residential district!\" Hundreds of assembled community members applauded as {userName} displayed their {favoriteColor} honor medal while their beaming {favoriteAnimal} companion wore a coordinating ceremonial decoration. \"No obstacle proves insurmountable when communities unite in collaborative effort!\" {userName} announced, motivating everyone to initiate their own beneficial community improvements.",
          "\"Master of Neighborhood Development!\" announced the city official during the presentation of the municipality's supreme award for community leadership to {userName}. \"You've proven that single acts of caring dedication can completely transform residential communities!\" The assembled crowd of community supporters celebrated enthusiastically as {userName} raised their {favoriteColor} achievement medal while their prideful {favoriteAnimal} partner displayed a matching ceremonial ornament. \"No challenge exceeds our capabilities when neighborhoods collaborate through teamwork!\" {userName} proclaimed, inspiring all attendees to begin their own positive community transformation initiatives."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} walked quietly through their garden as evening settled, listening to the peaceful sounds of their community space and reflecting on the journey from neglected plot to thriving hub of friendship. \"Real growth happens when we care for each other and our environment,\" they understood deeply. \"Every person has the power to plant seeds of positive change, and when we work together, those seeds can grow into something more beautiful than we ever imagined.\" Their {favoriteAnimal} nuzzled their hand in agreement, and {userName} smiled, knowing that the most important gardens are the ones we grow in our hearts and communities.",
        microVariants: [
          "As {userName} strolled thoughtfully through their transformed garden during the tranquil evening hours, absorbing the harmonious sounds of their community sanctuary and contemplating the evolution from abandoned space to flourishing center of connection, they gained profound insight. \"Authentic development occurs when we nurture both interpersonal relationships and environmental stewardship,\" they comprehended with deep wisdom. \"Every individual possesses the capacity to initiate positive transformation, and through collaborative effort, these initiatives can mature into outcomes far more magnificent than originally envisioned.\" Their {favoriteAnimal} companion provided gentle affirmation through physical contact, and {userName} experienced contentment knowing that life's most significant gardens are those cultivated within hearts and communities.",
          "During {userName}'s contemplative evening journey through their revitalized garden space, listening to the serene ambiance of their community environment and reflecting upon the transformation from neglected area to vibrant friendship epicenter, they achieved meaningful understanding. \"True progress emerges when we simultaneously care for human connections and ecological systems,\" they realized with profound clarity. \"Each person holds the ability to establish foundations for beneficial change, and when we unite in collaborative action, these foundations can develop into results exceeding our greatest expectations.\" Their {favoriteAnimal} friend offered supportive acknowledgment through gentle physical expression, and {userName} felt deep satisfaction recognizing that existence's most valuable gardens are those nurtured within individual hearts and collective communities."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "community garden": ["neighborhood park", "school garden", "community center", "local playground", "shared space"],
        "Mrs. Chen": ["Mr. Rodriguez", "Ms. Johnson", "Dr. Patel", "Mrs. Thompson", "Mr. Williams"],
        "Harvest Festival": ["Garden Party", "Community Celebration", "Neighborhood Fair", "Growing Festival", "Unity Gathering"]
      },
      weatherVariants: ["sunny", "pleasant", "perfect", "beautiful", "ideal"],
      settingVariants: ["in their neighborhood", "in their community", "near their home", "in their area", "close to where they lived"]
    }
  }
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