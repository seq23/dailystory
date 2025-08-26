/**
 * Extended Level 2 Templates - Ages 7-9
 * 5 templates × 8 scenes each = 40 pages
 * 40-70 words per scene, more complex sentences
 */

export const EXTENDED_LEVEL2_TEMPLATES = [
  // Template 1: Space & Sci-Fi Theme (Extended to 8 scenes)
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
          text: "{userName} found a {favoriteColor} telescope in their grandmother's attic. When they looked through it at the stars, something amazing happened - the stars began to spell out messages!",
          alternatives: [
            "{userName} discovered a magical {favoriteColor} telescope hidden away. The moment they peered through it, the stars started moving to form words in the sky!",
            "In the dusty attic, {userName} stumbled upon a special {favoriteColor} telescope. As they gazed at the night sky, the stars danced and formed letters!"
          ],
          optionalDetails: ["The telescope hummed softly.", "Stardust sparkled around the lens.", "The attic felt magical suddenly."]
        }
      },
      {
        text: "\"My name is Zara, and I live on Planet {favoriteColor}!\" the space friend explained. \"We love {hobbies} here, just like you do on Earth! Would you like to visit our planet and share your {favoriteFood} recipes with us?\" A {favoriteAnimal} astronaut appeared on the telescope screen, waving hello.",
        pause: true,
        hook: "Should {userName} accept the invitation to visit Planet {favoriteColor}?",
        microVariants: {
          text: "\"My name is Zara, and I live on Planet {favoriteColor}!\" the space friend explained. \"We love {hobbies} here, just like you do on Earth!\"",
          alternatives: [
            "\"I'm Zara from the beautiful Planet {favoriteColor}!\" the voice said excitedly. \"We enjoy {hobbies} activities throughout our world!\""
          ],
          optionalDetails: ["The planet looked friendly and bright.", "Space music played softly.", "Adventure sparkled in the air."]
        }
      },
      {
        text: "{userName} decided to accept the incredible invitation! Suddenly, a gentle beam of {favoriteColor} light surrounded them, and they felt themselves floating upward through their bedroom ceiling. The {favoriteAnimal} astronaut guided them safely through the stars, pointing out different constellations and sharing fascinating space facts during their journey.",
        pause: true,
        hook: "What amazing sights will they see on the way to Planet {favoriteColor}?",
        microVariants: {
          text: "{userName} accepted the invitation and was surrounded by a gentle {favoriteColor} light beam. They floated safely upward through space, guided by their new {favoriteAnimal} friend.",
          alternatives: [
            "The adventure began as {userName} was lifted gently by magical {favoriteColor} light! Their {favoriteAnimal} guide showed them the wonders of space travel."
          ],
          optionalDetails: ["Stars twinkled like diamonds.", "The journey felt like flying in a dream.", "Space was more beautiful than any picture."]
        }
      },
      {
        text: "Planet {favoriteColor} was even more wonderful than {userName} had imagined! The trees grew {favoriteFood}, the rivers flowed with sparkling water, and friendly creatures who loved {hobbies} welcomed them with a big celebration. Zara introduced {userName} to her family and showed them the amazing space gardens where they grew food for their community.",
        pause: true,
        hook: "What special skills will {userName} teach the inhabitants of Planet {favoriteColor}?",
        microVariants: {
          text: "Planet {favoriteColor} was amazing! Trees grew {favoriteFood}, rivers sparkled, and friendly creatures welcomed {userName} with celebration.",
          alternatives: [
            "The planet exceeded all expectations with {favoriteFood} trees, crystal rivers, and inhabitants who shared {userName}'s love of {hobbies}!"
          ],
          optionalDetails: ["Everything glowed with soft, warm light.", "The air smelled like fresh flowers.", "Music seemed to come from the planet itself."]
        }
      },
      {
        text: "{userName} spent the day teaching the space friends how to make their favorite Earth {favoriteFood} recipes. In return, the aliens showed {userName} how to create glowing {favoriteColor} art that could float in the air! They also learned special space games that involved jumping incredibly high in the low gravity.",
        pause: true,
        hook: "What amazing gift will the space friends give {userName} before they return home?",
        microVariants: {
          text: "{userName} taught space cooking while learning to make floating {favoriteColor} art and play amazing low-gravity games.",
          alternatives: [
            "Cooking lessons were exchanged for art magic and gravity-defying games that made everyone laugh with joy!"
          ],
          optionalDetails: ["The floating art was breathtaking.", "Jumping felt like flying.", "Laughter echoed across the planet."]
        }
      },
      {
        text: "As the visit came to an end, Zara presented {userName} with a special {favoriteColor} communicator crystal. \"Now we can talk whenever you want!\" she explained. \"Just hold the crystal up to the stars and speak our names.\" The entire planet gathered to wave goodbye as {userName} prepared for the journey home.",
        pause: true,
        hook: "How will {userName} return safely to Earth?",
        microVariants: {
          text: "Zara gave {userName} a {favoriteColor} crystal communicator to stay in touch across the stars. The whole planet gathered to say goodbye.",
          alternatives: [
            "A magical {favoriteColor} crystal would keep their friendship alive across the vastness of space. Everyone came to wish them well."
          ],
          optionalDetails: ["The crystal hummed with friendly energy.", "Goodbye songs filled the air.", "Friendship transcended the distance."]
        }
      },
      {
        text: "The return journey was filled with shooting stars that seemed to dance just for {userName}! The {favoriteAnimal} astronaut made sure they landed safely in their own backyard, right next to their favorite {hobbies} spot. The stars winked overhead as if to say \"See you soon, space friend!\"",
        pause: true,
        hook: "How will this space adventure change {userName}'s life?",
        microVariants: {
          text: "Dancing shooting stars guided {userName} home to their backyard, where familiar stars winked like old friends welcoming them back.",
          alternatives: [
            "The magical journey home was lit by shooting stars, ending in the comfort of {userName}'s own yard with twinkling star friends above."
          ],
          optionalDetails: ["The backyard felt different somehow.", "Even Earth's stars seemed friendlier.", "Adventure had changed everything."]
        }
      },
      {
        text: "Every night after that, {userName} used the {favoriteColor} crystal to chat with their space friends. They shared stories about Earth while learning about life on other planets. Sometimes Zara would project holographic images of new alien friends through the crystal, and {userName} even helped solve problems for other planets using their Earth knowledge and creativity.",
        pause: false,
        hook: "What wonderful friendships span across the galaxy!",
        microVariants: {
          text: "Nightly conversations through the {favoriteColor} crystal connected {userName} with space friends, sharing stories and solving galactic problems together.",
          alternatives: [
            "The crystal became a bridge between worlds, allowing {userName} to help friends across the galaxy with Earth wisdom and creative solutions."
          ],
          optionalDetails: ["The crystal glowed warmly each night.", "Holographic friends felt real.", "The universe became smaller and friendlier."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "That night, {userName} fell asleep holding the {favoriteColor} communicator. Gentle space lullabies from Planet {favoriteColor} filled their dreams, while the {favoriteAnimal} astronaut watched over them through the stars. \"Sweet cosmic dreams, Earth friend,\" whispered Zara's voice softly.",
        microVariants: [
          "Peaceful sleep came easily with the communicator close by. Soothing melodies from across the galaxy created the most wonderful dreams."
        ]
      },
      {
        type: 'silly',
        text: "The space friends tried to cook Earth food on their planet, but everything kept floating away! {userName} had to teach them about gravity through the crystal communicator while everyone giggled at the flying {favoriteFood}!",
        microVariants: [
          "Cooking disasters in zero gravity made everyone laugh as {favoriteFood} ingredients floated everywhere like a delicious blizzard!"
        ]
      },
      {
        type: 'triumphant',
        text: "\"I'm the first Earth ambassador to Planet {favoriteColor}!\" {userName} announced proudly. Their space adventure had created the most amazing friendship bridge between two worlds, and they felt like the bravest explorer in the universe!",
        microVariants: [
          "Champion of intergalactic friendship! {userName} had successfully connected Earth with the stars, creating bonds that would last forever!"
        ]
      },
      {
        type: 'reflective',
        text: "{userName} learned that friendship knows no boundaries - not even the vastness of space. Looking up at the stars each night, they felt connected to the entire universe and understood that kindness could travel any distance.",
        microVariants: [
          "Gazing at the stars, {userName} realized that friendship and kindness could bridge any distance, even the incredible vastness between planets."
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

  // Template 2: Mystery & Problem-Solving Theme (Extended to 8 scenes) 
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
          text: "{userName} woke up to find all the {favoriteFood} mysteriously gone! Their detective {favoriteAnimal} found strange {favoriteColor} footprints.",
          alternatives: [
            "The morning brought a puzzling mystery - every single piece of {favoriteFood} had vanished! Peculiar {favoriteColor} tracks led outside."
          ],
          optionalDetails: ["The footprints sparkled slightly.", "A faint sweet smell lingered.", "The house felt unusually quiet."]
        }
      },
      {
        text: "Following the mysterious trail, {userName} and their {favoriteAnimal} detective discovered that the footprints led to a hidden garden behind the old oak tree. In this secret garden, they found tiny {favoriteColor} creatures having a feast with all the missing {favoriteFood}! The creatures looked up with guilty expressions, crumbs still on their whiskers.",
        pause: true,
        hook: "How will {userName} handle this unexpected discovery?",
        microVariants: {
          text: "The trail led to a secret garden where tiny {favoriteColor} creatures were feasting on the missing {favoriteFood}, looking guilty with crumb-covered whiskers.",
          alternatives: [
            "Behind the oak tree, a hidden garden revealed the culprits: adorable {favoriteColor} creatures caught red-handed with {userName}'s {favoriteFood}!"
          ],
          optionalDetails: ["The creatures were surprisingly cute.", "They seemed embarrassed to be caught.", "The garden was magical and hidden."]
        }
      },
      {
        text: "Instead of being angry, {userName} felt curious about these magical little beings. The largest creature, who wore a tiny {favoriteColor} hat, stepped forward nervously. \"Please don't be mad,\" squeaked the creature. \"We're the Garden Guardians, and we were so hungry after working all night to make your yard beautiful. We didn't mean to take everything!\"",
        pause: true,
        hook: "What amazing work have the Garden Guardians been doing?",
        microVariants: {
          text: "The lead creature in a {favoriteColor} hat explained they were Garden Guardians who got hungry after working all night to beautify {userName}'s yard.",
          alternatives: [
            "A tiny hat-wearing spokesperson revealed they were magical Garden Guardians who had worked tirelessly to improve the yard and got desperately hungry."
          ],
          optionalDetails: ["The creature's voice was like tiny bells.", "They seemed genuinely sorry.", "Magic sparkled around them."]
        }
      },
      {
        text: "{userName} looked around the backyard with amazement! Overnight, the Garden Guardians had planted beautiful {favoriteColor} flowers, fixed the broken fence, organized the tool shed, and even created a charming little pond with lily pads. \"You did all this while we were sleeping?\" {userName} asked in wonder.",
        pause: true,
        hook: "What agreement will {userName} make with these helpful creatures?",
        microVariants: {
          text: "The backyard had been transformed overnight with {favoriteColor} flowers, a repaired fence, organized shed, and a new pond with lily pads!",
          alternatives: [
            "Amazing improvements everywhere: blooming {favoriteColor} gardens, fixed fences, tidy sheds, and a magical new pond created by tiny workers!"
          ],
          optionalDetails: ["Everything looked perfect and beautiful.", "The work was incredibly detailed.", "Magic had improved everything."]
        }
      },
      {
        text: "\"We love to help gardens grow and homes become beautiful,\" explained the Garden Guardian leader, \"but our work makes us incredibly hungry, and we especially love {favoriteFood}!\" {userName} had a brilliant idea. \"What if we make a deal? You can have some of our {favoriteFood} every day, and in return, you help keep our garden magical!\"",
        pause: true,
        hook: "How will this partnership benefit everyone?",
        microVariants: {
          text: "{userName} proposed a fair deal: daily {favoriteFood} sharing in exchange for the creatures' magical garden help.",
          alternatives: [
            "The perfect solution emerged: a partnership where {favoriteFood} would be shared daily for continued magical garden maintenance!"
          ],
          optionalDetails: ["The creatures' eyes lit up with joy.", "The deal seemed perfect for everyone.", "Cooperation would solve everything."]
        }
      },
      {
        text: "The Garden Guardians were thrilled with this arrangement! They immediately showed {userName} and their {favoriteAnimal} how they used tiny {favoriteColor} tools to tend the plants, how they sang special growing songs to help flowers bloom, and how they painted morning dewdrops to make everything sparkle in the sunrise.",
        pause: true,
        hook: "What magical secrets will the guardians teach {userName}?",
        microVariants: {
          text: "Excited guardians demonstrated their tiny {favoriteColor} tools, growing songs, and dewdrop painting that made everything sparkle.",
          alternatives: [
            "The delighted creatures revealed their magical methods: miniature tools, melody-powered growth songs, and artistic dewdrop decoration!"
          ],
          optionalDetails: ["The tools were incredibly detailed.", "The songs were hauntingly beautiful.", "Everything they touched became more beautiful."]
        }
      },
      {
        text: "Over the following days, {userName} learned to help the Garden Guardians with their work. They discovered how to mix special {favoriteFood} treats that gave the creatures extra energy, how to sing along with the growing songs (even though their voice was much bigger!), and how to spot which plants needed the most care and attention.",
        pause: true,
        hook: "What wonderful skills is {userName} developing?",
        microVariants: {
          text: "{userName} learned to make energy-giving {favoriteFood} treats, sing growing songs, and identify plants needing special care.",
          alternatives: [
            "New skills emerged as {userName} mastered creature nutrition, harmonized with growth melodies, and developed plant empathy!"
          ],
          optionalDetails: ["The creatures were excellent teachers.", "Each day brought new discoveries.", "The garden grew more magical."]
        }
      },
      {
        text: "Soon, their backyard became famous in the neighborhood for being the most beautiful garden anyone had ever seen! Neighbors came to visit and ask for gardening advice, never suspecting that magical Garden Guardians were the secret. {userName} became known as an amazing young gardener, and the {favoriteAnimal} detective was celebrated for solving the mystery of the missing {favoriteFood}.",
        pause: false,
        hook: "What a perfect solution to the mystery!",
        microVariants: {
          text: "The backyard became the neighborhood's most admired garden, making {userName} famous as a gardener while the {favoriteAnimal} was celebrated for detective work.",
          alternatives: [
            "Neighborhood fame followed as their magical garden impressed everyone, establishing {userName} as a gardening expert and the {favoriteAnimal} as a master detective!"
          ],
          optionalDetails: ["Visitors came daily to admire the garden.", "The secret remained safe.", "Success brought everyone together."]
        }
      }
    ],
    endings: [
      {
        type: 'silly',
        text: "The investigation celebration got wonderfully chaotic when all the recovered {favoriteFood} started dancing! The magical creatures had enchanted everything to be extra happy, so the {favoriteFood} bounced around the kitchen while everyone laughed! \"Mystery solved with maximum fun!\" {userName} giggled.",
        microVariants: [
          "Victory became hilariously messy when the enchanted {favoriteFood} refused to stay still! Everything bounced and giggled while the magical creatures apologized."
        ]
      },
      {
        type: 'triumphant',
        text: "\"I solved the mystery AND made magical friends!\" {userName} announced proudly. Their detective skills had not only found the missing {favoriteFood} but had created the most wonderful partnership that made their garden the envy of the entire neighborhood!",
        microVariants: [
          "Champion detective work led to the perfect outcome: mystery solved, friendships formed, and the most amazing garden partnership ever created!"
        ]
      },
      {
        type: 'cozy',
        text: "Every evening, {userName} and their {favoriteAnimal} would sit in the garden, sharing {favoriteFood} with their tiny friends while watching the sunset. The Garden Guardians would tell stories of other magical places they'd helped, making bedtime feel like the end of a fairy tale.",
        microVariants: [
          "Peaceful evenings were spent sharing treats and stories with magical friends, turning every sunset into a perfect ending to wonderful days."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} learned that sometimes what seems like a problem can become the beginning of something even more wonderful. The missing {favoriteFood} mystery had led to magical friendships and the most beautiful garden anyone could imagine.",
        microVariants: [
          "The mystery taught {userName} that apparent problems could transform into amazing opportunities for friendship and beauty beyond imagination."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "mystery_items": ["cookies", "treats", "snacks", "goodies", "sweets"],
        "clues": ["footprints", "crumbs", "sounds", "smells", "traces"],
        "suspects": ["magical creatures", "mischievous sprites", "hungry animals", "playful fairies", "sneaky elves"]
      },
      weatherVariants: ["mysterious morning", "puzzling afternoon", "investigative evening", "discovery time"],
      settingVariants: ["around the house", "in the neighborhood", "through the garden", "in the forest", "by the creek"]
    }
  },

  // Template 3: Adventure & Exploration Theme (New - 8 scenes)
  {
    title: "The Secret Cave Behind the Waterfall",
    theme: "Adventure & Exploration",
    level: "Level 2 (Ages 7-9)",
    scenes: [
      {
        text: "During a family hiking trip, {userName} noticed something unusual about the waterfall they were visiting. While everyone else was taking pictures, {userName} observed that there seemed to be a hidden space behind the cascading water. Their adventurous {favoriteAnimal} companion also seemed drawn to the area, pawing at the rocks near the water's edge.",
        pause: true,
        hook: "Should {userName} investigate the mysterious space behind the waterfall?",
        microVariants: {
          text: "On a family hike, {userName} spotted something unusual about the waterfall - a hidden space behind the water that caught their attention.",
          alternatives: [
            "While others took photos, {userName} discovered that the waterfall seemed to hide a secret space that beckoned mysteriously."
          ],
          optionalDetails: ["The water sparkled in an unusual way.", "Their {favoriteAnimal} seemed excited.", "Something felt different about this waterfall."]
        }
      },
      {
        text: "With careful steps, {userName} and their {favoriteAnimal} made their way behind the waterfall, discovering a hidden cave entrance! The cave was dry and filled with fascinating rock formations that glittered with {favoriteColor} crystals. Ancient drawings covered the walls, showing pictures of people and animals from long, long ago.",
        pause: true,
        hook: "What secrets do the ancient cave drawings reveal?",
        microVariants: {
          text: "Behind the waterfall, they found a crystal-filled cave with ancient drawings of people and animals from the distant past.",
          alternatives: [
            "The secret cave held glittering {favoriteColor} crystals and mysterious wall drawings that told stories from ancient times."
          ],
          optionalDetails: ["The crystals cast rainbow patterns.", "The drawings seemed to move in the light.", "History whispered from the walls."]
        }
      },
      {
        text: "As {userName} studied the drawings more closely, they realized the ancient pictures told the story of a hidden treasure that was supposedly buried somewhere in the cave system. The drawings showed people celebrating around a {favoriteColor} chest, with symbols pointing deeper into the cave where more tunnels branched off in different directions.",
        pause: true,
        hook: "Which tunnel should {userName} choose to continue the treasure hunt?",
        microVariants: {
          text: "The cave drawings revealed a treasure story with symbols pointing toward deeper tunnels that branched in different directions.",
          alternatives: [
            "Ancient artwork told of a {favoriteColor} treasure chest hidden deeper in the cave, with directional symbols marking the way forward."
          ],
          optionalDetails: ["Multiple tunnels led into darkness.", "The symbols seemed like a puzzle.", "Adventure called from the depths."]
        }
      },
      {
        text: "Following their instincts and the ancient clues, {userName} chose the tunnel marked with symbols that looked like their {favoriteAnimal}. As they walked deeper, their flashlight revealed more crystal formations and, amazingly, the tunnel opened into a huge underground chamber with a natural skylight that let sunbeams stream down from high above.",
        pause: true,
        hook: "What amazing discoveries await in the underground chamber?",
        microVariants: {
          text: "The {favoriteAnimal}-marked tunnel led to a massive underground chamber with crystal formations and natural sunlight streaming from above.",
          alternatives: [
            "Following {favoriteAnimal} symbols, they entered a spectacular cavern where sunbeams created a natural spotlight on the crystal walls."
          ],
          optionalDetails: ["The chamber was breathtakingly beautiful.", "Sunlight created magical effects.", "Nature had built a secret cathedral."]
        }
      },
      {
        text: "In the center of the chamber, exactly where the sunbeam touched the ground, {userName} discovered an ancient {favoriteColor} chest! But instead of gold or jewels, the chest contained something even more precious: dozens of beautifully preserved books, scrolls, and maps that documented the history and natural wonders of their entire region.",
        pause: true,
        hook: "What amazing stories and secrets will these ancient documents reveal?",
        microVariants: {
          text: "The {favoriteColor} chest held precious books, scrolls, and maps documenting the region's history and natural wonders.",
          alternatives: [
            "Instead of typical treasure, the ancient chest contained the most valuable discovery: historical documents that revealed regional secrets and stories."
          ],
          optionalDetails: ["The books were perfectly preserved.", "Maps showed forgotten places.", "History came alive in their hands."]
        }
      },
      {
        text: "Spending hours in the chamber, {userName} learned incredible things about their hometown and the surrounding wilderness. The documents revealed secret hiking trails, hidden natural pools, forgotten historical sites, and even stories about the families who had lived in the area hundreds of years ago - including ancestors of people they knew today!",
        pause: true,
        hook: "How will {userName} share these amazing discoveries with others?",
        microVariants: {
          text: "The documents revealed secret trails, hidden pools, historical sites, and stories about ancestors of people {userName} knew today.",
          alternatives: [
            "Hours of reading uncovered amazing local secrets: forgotten trails, natural pools, historic sites, and ancestral connections to current neighbors!"
          ],
          optionalDetails: ["Each document held new surprises.", "Local history became personal.", "The past connected to the present."]
        }
      },
      {
        text: "Carefully documenting their discovery with photos and notes, {userName} made sure to leave the ancient chamber exactly as they found it, taking only memories and the knowledge they had gained. They marked the location so they could return with proper archaeologists and historians to study the site officially and preserve it for future generations.",
        pause: true,
        hook: "What impact will this discovery have on their community?",
        microVariants: {
          text: "{userName} carefully documented everything while preserving the site, planning to return with experts for official study and preservation.",
          alternatives: [
            "Responsible exploration meant recording the discovery while leaving it untouched, planning for proper archaeological study and community preservation."
          ],
          optionalDetails: ["Every detail was carefully recorded.", "Preservation was the highest priority.", "Future generations would benefit."]
        }
      },
      {
        text: "When {userName} shared their discovery with the family and later with local historians, it sparked the creation of a community heritage project! The cave became an official historical site, guided tours were organized to share the region's hidden history, and {userName} was recognized as the young explorer who had helped their entire community connect with their fascinating past.",
        pause: false,
        hook: "What an amazing legacy from one curious adventure!",
        microVariants: {
          text: "The discovery sparked a community heritage project, making the cave an official historical site with tours that connected everyone to their past.",
          alternatives: [
            "Community excitement led to an official heritage site, educational tours, and recognition for {userName} as the explorer who connected everyone to their history!"
          ],
          optionalDetails: ["The whole community benefited.", "Education and tourism flourished.", "One discovery changed everything."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "\"I discovered a piece of history that belongs to everyone!\" {userName} announced proudly at the community celebration. Their curiosity and careful exploration had created something wonderful that would benefit generations of visitors and residents alike!",
        microVariants: [
          "At the community celebration, {userName} was honored as the young historian whose discovery had created lasting benefits for everyone!"
        ]
      },
      {
        type: 'reflective',
        text: "{userName} learned that the greatest adventures often lead to discoveries that can be shared with others. Their exploration had not only satisfied their own curiosity but had given their entire community a deeper connection to their shared history and natural heritage.",
        microVariants: [
          "The adventure taught {userName} that exploration becomes most meaningful when discoveries are shared, connecting communities to their heritage."
        ]
      },
      {
        type: 'cozy',
        text: "Every weekend, {userName} returned to the cave as a junior guide, helping families discover the same wonder they had felt. The {favoriteAnimal} became the unofficial mascot of the tours, leading visitors to all the best crystal formations and photo spots.",
        microVariants: [
          "Weekend tours became a family tradition as {userName} and their {favoriteAnimal} shared the magic of discovery with visitors from near and far."
        ]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} became so famous as the 'cave discovery assistant' that they started wearing a tiny explorer's hat during tours! Visitors loved taking photos with the 'professional cave dog' who wagged at all the best crystal displays!",
        microVariants: [
          "Tour fame went to the {favoriteAnimal}'s head as they proudly wore explorer gear and posed professionally at every crystal formation!"
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "waterfall": ["stream", "creek", "river", "spring", "cascade"],
        "cave": ["cavern", "grotto", "chamber", "tunnel system", "underground space"],
        "crystals": ["gems", "minerals", "stones", "formations", "geodes"]
      },
      weatherVariants: ["exploration day", "discovery time", "adventure weather", "perfect hiking conditions"],
      settingVariants: ["in the wilderness", "near the water", "in the mountains", "by the forest", "in nature"]
    }
  },

  // Template 4: Friendship & Community Theme (New - 8 scenes)
  {
    title: "The New Student Welcome Project",
    theme: "Friendship & Community",
    level: "Level 2 (Ages 7-9)",
    scenes: [
      {
        text: "{userName} noticed that the new student, Alex, was sitting alone during lunch again. Alex had moved from far away and seemed shy about joining conversations or activities. {userName} remembered how hard it was to feel left out and decided that something needed to be done to help Alex feel welcome and included in their school community.",
        pause: true,
        hook: "What creative plan will {userName} develop to help Alex feel included?",
        microVariants: {
          text: "{userName} noticed Alex sitting alone again and remembered how hard it felt to be left out, deciding to help Alex feel welcome.",
          alternatives: [
            "Seeing Alex's loneliness during lunch, {userName} empathized with being new and decided to create a welcoming plan for their classmate."
          ],
          optionalDetails: ["Alex looked uncomfortable and uncertain.", "Other students seemed too busy to notice.", "The lunch room felt especially large and lonely."]
        }
      },
      {
        text: "Instead of simply walking over to talk, {userName} came up with a bigger idea: creating a \"Welcome Buddy\" program for their entire class! They approached their teacher, Ms. Johnson, with a proposal to make sure every new student would have multiple friends and helpers, not just one person trying to do everything alone.",
        pause: true,
        hook: "How will Ms. Johnson and the class respond to this inclusive idea?",
        microVariants: {
          text: "{userName} proposed a 'Welcome Buddy' program to Ms. Johnson, ensuring every new student would have multiple friends and helpers.",
          alternatives: [
            "Rather than helping alone, {userName} created a systematic approach: a Welcome Buddy program that would support all new students with team friendship."
          ],
          optionalDetails: ["Ms. Johnson listened thoughtfully.", "The idea felt bigger than just Alex.", "Systematic kindness could help everyone."]
        }
      },
      {
        text: "Ms. Johnson loved the idea and helped {userName} organize a class meeting to discuss the Welcome Buddy program. The students brainstormed ways to help new classmates: lunch buddies, playground partners, homework helpers, and even special guides to show new students the best spots in school like the library's cozy reading corner and the art room's supply closet.",
        pause: true,
        hook: "What creative welcome activities will the class design together?",
        microVariants: {
          text: "The class meeting generated ideas for lunch buddies, playground partners, homework helpers, and special school guides for new students.",
          alternatives: [
            "Brainstorming session produced multiple support roles: meal companions, play partners, study helpers, and school tour guides for comprehensive welcome support."
          ],
          optionalDetails: ["Everyone contributed enthusiastic ideas.", "The list grew longer and more creative.", "Collaboration made everything better."]
        }
      },
      {
        text: "To make Alex feel extra special, the class decided to create a personalized welcome package that included a hand-drawn map of the school (with everyone's favorite spots marked), a collection of favorite {favoriteFood} recipes from different families, and a class book where each student wrote something interesting about themselves and drew a picture.",
        pause: true,
        hook: "How will Alex react to this thoughtful and collaborative welcome?",
        microVariants: {
          text: "The welcome package included a hand-drawn school map, favorite {favoriteFood} recipes, and a class book with personal stories and drawings.",
          alternatives: [
            "Personal touches made the welcome special: custom school maps, family {favoriteFood} recipes, and individual student introductions through art and writing."
          ],
          optionalDetails: ["Every map annotation showed care.", "Recipes represented family traditions.", "The book revealed everyone's personality."]
        }
      },
      {
        text: "When the class presented the welcome package to Alex, their face absolutely lit up with surprise and happiness! Alex shared that they had been worried about making friends and fitting in, but now they felt like they were already part of something special. \"I've never had an entire class work together to make me feel welcome!\" Alex said with genuine amazement.",
        pause: true,
        hook: "What new friendships and connections will grow from this welcoming start?",
        microVariants: {
          text: "Alex's face lit up with surprise and happiness, expressing amazement that an entire class had worked together for their welcome.",
          alternatives: [
            "Genuine surprise and joy filled Alex's reaction to the collaborative welcome, feeling immediately included in something special and caring."
          ],
          optionalDetails: ["Alex's smile was contagious.", "The whole class felt proud.", "Kindness created instant connection."]
        }
      },
      {
        text: "Over the following weeks, the Welcome Buddy program worked amazingly well! Alex made friends with multiple classmates, discovered they shared a love of {hobbies} with several students, and even taught the class some interesting games from their previous school. The program became so successful that other teachers asked to implement it in their classrooms too.",
        pause: true,
        hook: "How will this program continue to grow and help other students?",
        microVariants: {
          text: "The program's success led to Alex making multiple friends, sharing {hobbies} interests, and teaching games while other teachers adopted the system.",
          alternatives: [
            "Amazing results followed: Alex formed diverse friendships, shared {hobbies} connections, contributed new games, and inspired other classrooms to adopt the program."
          ],
          optionalDetails: ["Friendships multiplied quickly.", "Shared interests created strong bonds.", "The program spread throughout the school."]
        }
      },
      {
        text: "As the program expanded, {userName} was invited to help train students in other grades to become Welcome Buddy coordinators. They learned how to organize inclusive activities, facilitate introductions between shy students, and create welcoming environments where everyone could feel valued and included regardless of their background or interests.",
        pause: true,
        hook: "What leadership skills is {userName} developing through this experience?",
        microVariants: {
          text: "{userName} trained other students as coordinators, learning to organize activities, facilitate introductions, and create inclusive environments.",
          alternatives: [
            "Leadership development occurred as {userName} taught others to coordinate activities, connect shy students, and build welcoming communities for all backgrounds."
          ],
          optionalDetails: ["Training others felt rewarding.", "Leadership skills grew naturally.", "Impact multiplied through teaching."]
        }
      },
      {
        text: "By the end of the school year, their Welcome Buddy program had helped dozens of new students feel included and had created lasting friendships throughout the school. {userName} realized that their simple observation about Alex sitting alone had grown into something that changed their entire school culture, making it a more caring and inclusive place for everyone.",
        pause: false,
        hook: "What a powerful example of how one person's kindness can transform a community!",
        microVariants: {
          text: "The program helped dozens of students and created lasting friendships, transforming school culture into something more caring and inclusive.",
          alternatives: [
            "Year-end success showed dozens of helped students, lasting friendships, and a completely transformed school culture built on inclusion and care."
          ],
          optionalDetails: ["The impact exceeded all expectations.", "Culture change was visible everywhere.", "Kindness had become contagious."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "\"We created a kindness revolution!\" {userName} announced at the year-end school assembly. Their Welcome Buddy program had not only helped Alex but had made their entire school famous for being the most welcoming and inclusive community in the district!",
        microVariants: [
          "At the school assembly, {userName} celebrated their 'kindness revolution' that had made their school the most welcoming community in the district!"
        ]
      },
      {
        type: 'reflective',
        text: "{userName} learned that small acts of noticing and caring can grow into powerful changes that affect entire communities. One person's loneliness had become everyone's opportunity to practice kindness and create belonging.",
        microVariants: [
          "The experience taught {userName} that noticing others' needs and responding with care could transform entire communities through collaborative kindness."
        ]
      },
      {
        type: 'cozy',
        text: "Every lunch period, {userName} looked around the cafeteria with satisfaction, seeing students from the Welcome Buddy program laughing and sharing meals together. Alex had become one of the program's most enthusiastic coordinators, helping even newer students feel at home.",
        microVariants: [
          "Lunch periods became a daily reminder of success as {userName} watched Welcome Buddy friendships flourish, with Alex now helping newer students."
        ]
      },
      {
        type: 'silly',
        text: "The Welcome Buddy program became so popular that students started creating elaborate welcome performances! Alex choreographed a dance that included everyone's {hobbies}, and even the principal learned the moves to welcome visiting students from other schools!",
        microVariants: [
          "Welcome celebrations got wonderfully elaborate with Alex's choreographed {hobbies} dance that even the principal performed for visiting students!"
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "new student": ["transfer student", "newcomer", "recent arrival", "new classmate", "fresh face"],
        "welcome activities": ["buddy systems", "friendship circles", "inclusion games", "team building", "community projects"],
        "school spaces": ["cafeteria", "playground", "library", "art room", "music room"]
      },
      weatherVariants: ["welcoming day", "friendship time", "community building", "inclusive moment"],
      settingVariants: ["at school", "in the classroom", "during lunch", "on the playground", "in the community"]
    }
  },

  // Template 5: Nature & Environment Theme (New - 8 scenes)
  {
    title: "The Backyard Wildlife Habitat Project",
    theme: "Nature & Environment", 
    level: "Level 2 (Ages 7-9)",
    scenes: [
      {
        text: "{userName} had always loved watching birds and insects in their backyard, but lately they noticed that fewer creatures were visiting their outdoor space. After doing some research online and at the library, {userName} learned that many animals need specific types of food, water, and shelter to thrive, and they wondered if their yard could be improved to welcome more wildlife.",
        pause: true,
        hook: "What changes can {userName} make to create a better habitat for wildlife?",
        microVariants: {
          text: "{userName} noticed fewer creatures visiting their yard and researched how to create better habitats with proper food, water, and shelter.",
          alternatives: [
            "Declining wildlife visits prompted {userName} to research habitat needs, discovering that animals require specific food, water, and shelter arrangements."
          ],
          optionalDetails: ["The yard felt quieter than before.", "Research revealed many habitat requirements.", "Improvement possibilities seemed endless."]
        }
      },
      {
        text: "With their parents' permission and help, {userName} began transforming different areas of their backyard into mini-habitats. They planted {favoriteColor} flowers that attract butterflies and bees, created a small shallow dish for bird baths, and built a simple brush pile where small creatures could find shelter during storms or cold weather.",
        pause: true,
        hook: "What wildlife will be the first to discover these new habitat features?",
        microVariants: {
          text: "With parental help, {userName} planted butterfly-attracting {favoriteColor} flowers, created bird baths, and built shelter brush piles.",
          alternatives: [
            "Family collaboration led to habitat creation: {favoriteColor} pollinator flowers, shallow water features, and protective brush pile shelters."
          ],
          optionalDetails: ["Each area served a specific purpose.", "The work was surprisingly satisfying.", "Changes were visible immediately."]
        }
      },
      {
        text: "Within just a few days, the results were amazing! Beautiful butterflies began visiting the {favoriteColor} flowers, birds discovered the water dish and splashed happily during their baths, and {userName} even spotted a family of small creatures using the brush pile shelter. Their {favoriteAnimal} companion enjoyed watching all the new visitors from a respectful distance.",
        pause: true,
        hook: "What other habitat improvements will attract even more diverse wildlife?",
        microVariants: {
          text: "Quick results followed: butterflies visited {favoriteColor} flowers, birds used the water dish, and small creatures found shelter while {userName}'s {favoriteAnimal} watched respectfully.",
          alternatives: [
            "Immediate success brought butterflies to flowers, birds to water, shelter-seeking creatures to brush piles, and respectful observation from the {favoriteAnimal}."
          ],
          optionalDetails: ["Wildlife arrived faster than expected.", "Each species had different preferences.", "The {favoriteAnimal} was surprisingly gentle."]
        }
      },
      {
        text: "Encouraged by the success, {userName} decided to expand the project by adding native plants that produce seeds and berries for different types of birds. They also created a small compost area where decomposing leaves would attract beneficial insects, and installed a simple rain collection system to keep the water features filled naturally.",
        pause: true,
        hook: "How will these additions create an even more complete ecosystem?",
        microVariants: {
          text: "{userName} expanded with native seed plants, a compost area for beneficial insects, and rain collection for sustainable water features.",
          alternatives: [
            "Project expansion included native berry plants, insect-attracting compost areas, and sustainable rain collection systems for complete ecosystem support."
          ],
          optionalDetails: ["Native plants required less maintenance.", "Composting created natural fertilizer.", "Rain collection felt environmentally smart."]
        }
      },
      {
        text: "As the habitat project grew, {userName} began keeping a detailed nature journal, documenting all the different species they observed, noting their favorite foods and behaviors, and tracking seasonal changes in their backyard ecosystem. They discovered that their yard was now home to over twenty different types of creatures they had never noticed before!",
        pause: true,
        hook: "What surprising discoveries will the nature journal reveal about backyard biodiversity?",
        microVariants: {
          text: "A detailed nature journal documented over twenty species, recording their foods, behaviors, and seasonal patterns in the transformed ecosystem.",
          alternatives: [
            "Scientific observation through journaling revealed amazing biodiversity: twenty-plus species with documented feeding patterns, behaviors, and seasonal habitat use."
          ],
          optionalDetails: ["Each entry revealed new details.", "Patterns became visible over time.", "The yard was more diverse than imagined."]
        }
      },
      {
        text: "Word about {userName}'s wildlife habitat spread throughout the neighborhood, and soon other families were asking for advice about creating their own backyard sanctuaries. {userName} organized informal workshops where they shared their research, demonstrated habitat-building techniques, and even gave away seeds and cuttings from their successful native plants.",
        pause: true,
        hook: "How will this knowledge-sharing expand wildlife conservation efforts?",
        microVariants: {
          text: "Neighborhood interest led to workshops where {userName} shared research, demonstrated techniques, and distributed seeds from successful native plants.",
          alternatives: [
            "Community expansion occurred through workshops where {userName} taught habitat research, building methods, and shared successful plant materials with neighbors."
          ],
          optionalDetails: ["Neighbors were eager to learn.", "Teaching felt surprisingly natural.", "Impact multiplied through education."]
        }
      },
      {
        text: "The habitat project became so successful that {userName} was invited to present their work at the local environmental center's youth showcase. They created a presentation showing before-and-after photos of their yard, sharing their research process, and explaining how other young people could start similar projects in their own communities.",
        pause: true,
        hook: "What impact will {userName}'s presentation have on other young environmentalists?",
        microVariants: {
          text: "{userName} presented at the environmental center's showcase with before-and-after photos, research process, and guidance for other young conservationists.",
          alternatives: [
            "Environmental center recognition came through a youth showcase presentation featuring transformation photos, research methods, and actionable guidance for peers."
          ],
          optionalDetails: ["The presentation felt important.", "Photos showed dramatic changes.", "Other youth seemed inspired."]
        }
      },
      {
        text: "A year after starting the project, {userName}'s backyard had become a certified wildlife habitat that hosted seasonal migration stops, supported year-round resident species, and served as a model for sustainable backyard conservation. Their nature journal had grown into a valuable community resource that local schools used to teach students about urban ecology and environmental stewardship.",
        pause: false,
        hook: "What an amazing transformation from curiosity to community conservation leadership!",
        microVariants: {
          text: "One year later, the certified wildlife habitat supported migrations and residents while the nature journal became a community educational resource.",
          alternatives: [
            "Annual success included certified habitat status, migration support, resident species care, and educational resource development for community schools."
          ],
          optionalDetails: ["Certification felt like official recognition.", "Migration stops were seasonal highlights.", "Educational impact reached many students."]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "{userName} learned that caring for the environment starts with small, thoughtful actions in your own space. By creating habitat for wildlife, they had discovered how individual efforts can contribute to larger conservation goals while bringing daily joy through nature observation.",
        microVariants: [
          "Environmental stewardship began with small local actions, teaching {userName} how individual habitat creation contributes to conservation while providing daily nature joy."
        ]
      },
      {
        type: 'triumphant',
        text: "\"I turned our backyard into a wildlife sanctuary!\" {userName} announced proudly at the environmental center celebration. Their habitat project had not only supported dozens of species but had inspired an entire neighborhood to become more environmentally conscious!",
        microVariants: [
          "At the celebration, {userName} proudly claimed creation of a wildlife sanctuary that supported species diversity and inspired neighborhood environmental consciousness!"
        ]
      },
      {
        type: 'cozy',
        text: "Every morning, {userName} enjoyed quiet time in their habitat with a cup of hot chocolate, watching the daily wildlife routine unfold. Their {favoriteAnimal} had learned to sit perfectly still during bird-watching sessions, becoming an excellent conservation companion.",
        microVariants: [
          "Peaceful morning observations with hot chocolate became routine as {userName} and their perfectly still {favoriteAnimal} enjoyed daily wildlife watching together."
        ]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} became so interested in the wildlife habitat that they tried to help by 'organizing' the brush pile every day! {userName} had to gently explain that messy piles were actually better for the small creatures who needed hiding spaces!",
        microVariants: [
          "Helpful {favoriteAnimal} intentions backfired when daily brush pile 'organization' required gentle lessons about why creatures preferred messy shelter arrangements!"
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "wildlife": ["birds", "butterflies", "bees", "small mammals", "beneficial insects"],
        "habitat features": ["flowers", "water sources", "shelter areas", "food plants", "nesting sites"],
        "conservation activities": ["planting", "observing", "documenting", "protecting", "educating"]
      },
      weatherVariants: ["habitat building day", "wildlife watching time", "conservation work", "nature study period"],
      settingVariants: ["in the backyard", "throughout the neighborhood", "at the environmental center", "in the community garden"]
    }
  }
];