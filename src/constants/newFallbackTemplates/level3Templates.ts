/**
 * Level 3 Templates (Ages 9-11) - Complete Fallback Story Library  
 * 5 templates with 7-12 scenes each, 70-100 words per scene
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_3_FALLBACK_TEMPLATES: StoryTemplate[] = [
  {
    title: "The Magical Treehouse Adventure",
    theme: "Magic & Fantasy",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} and their best friend {friendName} stumbled upon an ancient-looking treehouse deep in the {forestType} forest. As they climbed inside, they discovered a dusty old book with strange symbols. Suddenly, the treehouse began to shake, and they realized it was lifting off the ground!",
        pause: true,
        hook: "Where will the magical treehouse take them?",
        microVariants: {
          text: "{userName} and {friendName}, while exploring the {forestType} forest, found a hidden treehouse. Inside, a mysterious book with glowing symbols caused the treehouse to magically float into the sky!",
          alternatives: [
            "{userName} and {friendName} were playing in the {forestType} woods when they discovered a secret treehouse. A magical book inside made the treehouse fly!"
          ],
          optionalDetails: ["The book whispered secrets.", "Strange lights flickered around them.", "The air crackled with energy."]
        }
      },
      {
        text: "The treehouse soared through the clouds, passing by floating islands and friendly dragons. {userName} looked through the book and found a spell to visit different worlds. They decided to visit the Land of Talking Animals first, hoping to meet a wise {animalType} who could guide them.",
        pause: true,
        hook: "What adventures await them in the Land of Talking Animals?",
        microVariants: {
          text: "Flying through the sky, the treehouse passed floating islands and dragons. {userName} found a spell to visit the Land of Talking Animals, hoping to meet a wise {animalType}.",
          alternatives: [
            "The treehouse flew past clouds and dragons. {userName} used a spell to go to the Land of Talking Animals, looking for a smart {animalType}."
          ],
          optionalDetails: ["The dragons waved hello.", "The islands had candy trees.", "The spell shimmered with rainbow colors."]
        }
      },
      {
        text: "In the Land of Talking Animals, they met a {animalType} who told them about a hidden treasure that could grant any wish. The {animalType} warned them that the treasure was guarded by a grumpy {monsterType} who loved riddles. {userName} and {friendName} accepted the challenge and set off to find the treasure.",
        pause: true,
        hook: "Can they outsmart the grumpy monster and get the treasure?",
        microVariants: {
          text: "A {animalType} in the Land of Talking Animals told them about a treasure guarded by a grumpy {monsterType}. The treasure could grant any wish, but the monster loved riddles.",
          alternatives: [
            "They met a {animalType} who said a treasure was hidden, guarded by a {monsterType} who asked riddles. The treasure could grant wishes."
          ],
          optionalDetails: ["The {animalType} gave them a map.", "The {monsterType} lived in a dark cave.", "The treasure sparkled with magic."]
        }
      },
      {
        text: "Following the map through enchanted forests and across rainbow bridges, {userName} and {friendName} encountered three magical creatures who each offered helpful gifts. A wise owl gave them a compass that always points toward truth, a friendly dragon shared a protective shield made of {favoriteColor} scales, and a magical butterfly whispered the secret to understanding any language. Armed with these gifts, they felt ready to face the riddle-loving monster and solve whatever challenges awaited them at the treasure's location.",
        pause: true,
        hook: "What riddles will the monster ask, and how will their gifts help?",
        microVariants: {
          text: "Three magical creatures offered gifts: a truth compass from an owl, a {favoriteColor} shield from a dragon, and language understanding from a butterfly.",
          alternatives: [
            "An owl, dragon, and butterfly each gave {userName} and {friendName} magical gifts to help with their treasure quest."
          ],
          optionalDetails: ["The compass glowed when pointing to truth.", "The shield felt warm and protective.", "The butterfly's gift let them understand any creature."]
        }
      },
      {
        text: "At the treasure cave, they met the grumpy {monsterType} who wasn't actually mean, just lonely and bored. The monster explained that guarding treasure was tedious work, and the riddles were their only entertainment. {userName} had a brilliant idea: instead of just answering riddles, they proposed a riddle exchange where everyone could share their favorite brain teasers. The {monsterType} became so excited about this new game that they decided to become friends rather than guardians and obstacles.",
        pause: true,
        hook: "What happens when the monster becomes their friend instead of their challenge?",
        microVariants: {
          text: "The {monsterType} was just lonely and bored, so {userName} suggested a riddle exchange game instead of a challenge, making them friends.",
          alternatives: [
            "The monster wasn't mean, just lonely. {userName}'s idea to share riddles instead of solve them created an unexpected friendship."
          ],
          optionalDetails: ["The monster had been alone for centuries.", "They knew thousands of riddles from different lands.", "The cave was full of books and puzzle games."]
        }
      },
      {
        text: "The treasure turned out to be something even more valuable than gold or jewels: a magical library containing every story ever told and every story yet to be written. The {monsterType} explained that the real treasure was the knowledge and imagination contained in these infinite stories. {userName} and {friendName} realized they could make any wish come true by reading and learning from these tales, and they invited their new monster friend to join them in exploring the endless adventures contained within the magical books.",
        pause: true,
        hook: "What amazing stories will they discover in the magical library?",
        microVariants: {
          text: "The treasure was a magical library with every story ever told and yet to be written, offering infinite adventures and knowledge to explore.",
          alternatives: [
            "Instead of gold, they found a library of infinite stories that could fulfill any wish through imagination and learning."
          ],
          optionalDetails: ["Books floated and glowed on the shelves.", "Some stories came alive as they read them.", "The library was bigger inside than the cave."]
        }
      },
      {
        text: "Together, the three friends spent days exploring the magical library, reading stories about distant planets, underwater kingdoms, and lands where music had colors and mathematics could dance. Each story they read together became more vivid and exciting because they could share their reactions and ideas. The {monsterType} turned out to be an excellent storyteller, adding dramatic voices and sound effects that made every tale come alive. {userName} discovered that the best treasures aren't things you can hold, but experiences you can share with friends.",
        pause: true,
        hook: "What new story adventure will they choose to experience together?",
        microVariants: {
          text: "The three friends explored magical stories together, with the {monsterType} providing dramatic storytelling that made every tale come alive with shared excitement.",
          alternatives: [
            "Reading together in the magical library, they discovered that shared stories and friendship were the greatest treasures of all."
          ],
          optionalDetails: ["Stories projected images in the air as they read.", "The {monsterType} did amazing character voices.", "Some books let them step inside the stories."]
        }
      },
      {
        text: "When it was time to return to the treehouse, {userName} and {friendName} realized they could visit the magical library anytime through their friendship with the {monsterType}, who gave them each a special bookmark that would transport them back whenever they wanted to share a new story. The treehouse gently carried them home, but now their adventures felt infinite because they had discovered that friendship, imagination, and shared stories could take them anywhere they wanted to go, creating new magical experiences every single day.",
        pause: true,
        hook: "Where will their next storytelling adventure take them?",
        microVariants: {
          text: "With special bookmarks from their {monsterType} friend, {userName} and {friendName} could return to the magical library anytime to share new story adventures.",
          alternatives: [
            "The treehouse brought them home, but the {monsterType} friend and magical bookmarks meant their story adventures could continue forever."
          ],
          optionalDetails: ["The bookmarks shimmered with the same magic as the library.", "Each bookmark could hold one favorite story.", "The {monsterType} promised to find new stories while they were away."]
        }
      },
      {
        text: "After solving a series of tricky riddles, they finally faced the {monsterType}. The final riddle was: 'I have cities, but no houses, forests, but no trees, and water, but no fish. What am I?' {friendName} quickly answered, 'A map!' The {monsterType} grumbled but handed over the treasure.",
        pause: true,
        hook: "What will they wish for with the magical treasure?",
        microVariants: {
          text: "They solved riddles and faced the {monsterType}. The final riddle was: 'I have cities, but no houses, forests, but no trees, and water, but no fish. What am I?' {friendName} answered, 'A map!'",
          alternatives: [
            "The {monsterType} asked riddles. {friendName} solved the last one: 'I have cities, but no houses...' The answer was 'A map!'"
          ],
          optionalDetails: ["The riddles were written in ancient languages.", "The {monsterType} had a funny voice.", "The treasure glowed warmly."]
        }
      },
      {
        text: "{userName} and {friendName} wished for all the children in the world to have access to books and education. Suddenly, books appeared in every school and library, and children everywhere began to read and learn. They returned to their world, knowing they had made a difference.",
        pause: false,
        hook: "How will they use their newfound knowledge and experiences?",
        microVariants: {
          text: "They wished for books and education for all children. Books appeared everywhere, and children began to read. They returned home, knowing they had helped.",
          alternatives: [
            "Their wish was for every child to have books and learn. Books appeared in schools, and they felt happy to be home."
          ],
          optionalDetails: ["The treehouse sparkled as they wished.", "Children cheered when the books appeared.", "They felt proud of their adventure."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Back in their own backyard, {userName} and {friendName} built a small library for their neighborhood, filled with books from their adventure. They often read stories to the younger children, sharing the magic of reading and the importance of education.",
        microVariants: [
          "They built a neighborhood library with books from their adventure, sharing stories and the importance of education with younger children."
        ]
      },
      {
        type: 'silly',
        text: "The {monsterType}, missing the fun, followed them back and became the official librarian of their school! He still grumbled, but secretly loved reading stories to the kids, especially when they involved silly riddles and magical adventures.",
        microVariants: [
          "The {monsterType} became their school librarian, grumbling but secretly enjoying reading silly stories and riddles to the kids."
        ]
      },
      {
        type: 'triumphant',
        text: "{userName} and {friendName} started a global campaign for education, inspiring people around the world to donate books and support schools. They received awards and recognition, but their greatest reward was seeing children everywhere learning and growing.",
        microVariants: [
          "They started a global education campaign, inspiring people to donate books and support schools. Their reward was seeing children learning and growing."
        ]
      },
      {
        type: 'reflective',
        text: "Looking back on their adventure, {userName} and {friendName} realized that the greatest magic wasn't in the treehouse or the treasure, but in the power of knowledge and the ability to make a positive impact on the world. They continued to explore, learn, and share their discoveries with others.",
        microVariants: [
          "They realized the greatest magic was in knowledge and making a positive impact. They continued to explore, learn, and share their discoveries."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "forestType": ["enchanted", "dark", "sunny", "mysterious"],
        "animalType": ["owl", "fox", "bear", "squirrel"],
        "monsterType": ["goblin", "troll", "dragon", "giant"]
      },
      weatherVariants: ["sunny", "rainy", "cloudy", "stormy"],
      settingVariants: ["forest", "mountains", "beach", "desert"]
    }
  },
  {
    title: "The Great Science Fair Experiment",
    theme: "School & Everyday Life",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} was excited about the upcoming science fair. They wanted to create an experiment that would amaze everyone. After brainstorming with their friend {friendName}, they decided to build a robot that could clean up the school playground.",
        pause: true,
        hook: "Will their robot be a success at the science fair?",
        microVariants: {
          text: "{userName} and {friendName} decided to build a robot for the science fair that could clean the school playground.",
          alternatives: [
            "{userName} wanted to impress at the science fair and, with {friendName}'s help, planned to build a robot to clean the playground."
          ],
          optionalDetails: ["They spent weeks planning.", "Their teacher was very supportive.", "They gathered recycled materials."]
        }
      },
      {
        text: "They gathered recycled materials like cardboard boxes, plastic bottles, and old wires. {userName} focused on the robot's design, while {friendName} worked on the programming. They faced many challenges, but they never gave up.",
        pause: true,
        hook: "What challenges will they face while building the robot?",
        microVariants: {
          text: "Using recycled materials, {userName} designed the robot, and {friendName} programmed it. They faced challenges but persevered.",
          alternatives: [
            "They collected cardboard, bottles, and wires. {userName} designed, {friendName} programmed, and they kept going despite problems."
          ],
          optionalDetails: ["The wires kept getting tangled.", "The robot kept falling apart.", "They learned a lot about teamwork."]
        }
      },
      {
        text: "Finally, the robot was ready. They named it 'CleanBot'. On the day of the science fair, CleanBot started cleaning the playground, picking up trash and sorting it into different bins. Everyone was amazed by their creation.",
        pause: true,
        hook: "How will the judges react to CleanBot?",
        microVariants: {
          text: "They finished 'CleanBot', which cleaned the playground by picking up and sorting trash. Everyone was amazed.",
          alternatives: [
            "The robot, 'CleanBot', was ready. It cleaned the playground, sorting trash, and everyone was impressed."
          ],
          optionalDetails: ["The robot had a funny voice.", "It danced while it cleaned.", "The judges took many pictures."]
        }
      },
      {
        text: "The judges were impressed by CleanBot's functionality and creativity. They awarded {userName} and {friendName} first place in the science fair. Their project inspired other students to think about ways to help the environment.",
        pause: true,
        hook: "What will they do with their science fair success?",
        microVariants: {
          text: "The judges awarded them first place for CleanBot's functionality and creativity. Their project inspired others to help the environment.",
          alternatives: [
            "CleanBot won first place! The judges loved it, and other students wanted to help the environment too."
          ],
          optionalDetails: ["They received a trophy.", "Their picture was in the newspaper.", "The school principal congratulated them."]
        }
      },
      {
        text: "{userName} and {friendName} continued to improve CleanBot, adding new features and making it more efficient. They shared their knowledge with other students, helping them build their own robots to solve problems in their community.",
        pause: false,
        hook: "How will they continue to make a difference in their community?",
        microVariants: {
          text: "They improved CleanBot and shared their knowledge, helping others build robots to solve community problems.",
          alternatives: [
            "They made CleanBot better and taught others to build robots to help their community."
          ],
          optionalDetails: ["They started a robotics club.", "They organized a community cleanup day.", "They felt proud of their accomplishments."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Years later, {userName} and {friendName} became engineers, designing sustainable solutions for communities around the world. They never forgot their first science fair project and the importance of teamwork and creativity.",
        microVariants: [
          "They became engineers, designing sustainable solutions, remembering their science fair project and the value of teamwork."
        ]
      },
      {
        type: 'silly',
        text: "CleanBot became the school mascot, attending every event and reminding everyone to keep the environment clean. It even learned to dance and do silly tricks, making everyone laugh.",
        microVariants: [
          "CleanBot became the school mascot, reminding everyone to clean up and making them laugh with its dances and tricks."
        ]
      },
      {
        type: 'triumphant',
        text: "{userName} and {friendName} received a national award for their contributions to environmental science. They used their platform to advocate for STEM education and inspire young people to pursue their dreams.",
        microVariants: [
          "They received an award for their contributions to environmental science, advocating for STEM education and inspiring young people."
        ]
      },
      {
        type: 'reflective',
        text: "Looking back on their science fair project, {userName} and {friendName} realized that even small actions can make a big difference. They continued to use their skills and knowledge to create a better world for future generations.",
        microVariants: [
          "They realized small actions can make a big difference, continuing to use their skills to create a better world."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "recycledMaterials": ["cardboard", "plastic", "metal", "glass"],
        "robotFeatures": ["sensors", "wheels", "arms", "voice"],
        "playgroundTasks": ["picking up trash", "sorting recyclables", "watering plants", "sweeping"]
      },
      weatherVariants: ["sunny", "rainy", "windy", "cloudy"],
      settingVariants: ["school", "park", "community center", "library"]
    }
  },
  {
    title: "The Mystery of the Missing Mascot",
    theme: "Adventure Journeys",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "The school mascot, a beloved {animalType} named Patches, has gone missing! {userName}, a student known for their detective skills, decides to take on the case. Their first clue is a muddy paw print near the back gate.",
        pause: true,
        hook: "Who could have taken Patches, and why?",
        microVariants: {
          text: "{userName}, a student detective, investigates the disappearance of Patches, the school's {animalType} mascot. A muddy paw print is their first clue.",
          alternatives: [
            "Patches, the {animalType} mascot, disappeared! {userName} starts investigating, finding a muddy paw print."
          ],
          optionalDetails: ["The paw print was unusually large.", "Patches had a favorite squeaky toy.", "The back gate was slightly open."]
        }
      },
      {
        text: "{userName} follows the paw prints into the nearby {forestType} forest. Along the way, they find a piece of blue fabric snagged on a branch. It looks like it might be from a uniform.",
        pause: true,
        hook: "Does the fabric belong to the culprit?",
        microVariants: {
          text: "Following the paw prints, {userName} finds blue fabric in the {forestType} forest, possibly from a uniform.",
          alternatives: [
            "The paw prints lead to the {forestType} forest, where {userName} finds blue fabric that might be from a uniform."
          ],
          optionalDetails: ["The fabric smelled like {favoriteFood}.", "There were tiny buttons on the fabric.", "The forest was unusually quiet."]
        }
      },
      {
        text: "Deeper in the forest, {userName} discovers a hidden campsite. There's a note on a tree that reads, 'Patches is safe. We just needed a mascot for our club.' {userName} realizes that a rival school club must be behind the disappearance.",
        pause: true,
        hook: "How will {userName} rescue Patches from the rival club?",
        microVariants: {
          text: "{userName} finds a campsite with a note saying Patches is safe but needed for a club. A rival school club is likely responsible.",
          alternatives: [
            "A campsite is found with a note: 'Patches is safe, we need a mascot.' {userName} suspects a rival school club."
          ],
          optionalDetails: ["There were maps of the school on the ground.", "The campsite was well-hidden.", "The note was written in code."]
        }
      },
      {
        text: "{userName} tracks the rival club to their secret clubhouse, located in an old {buildingType}. They sneak inside and find Patches happily playing with the club members. The club members explain that they didn't mean any harm; they just wanted a mascot for their meetings.",
        pause: true,
        hook: "Will {userName} convince the club to return Patches?",
        microVariants: {
          text: "{userName} finds Patches playing with the rival club in their secret clubhouse. The club says they just wanted a mascot.",
          alternatives: [
            "Patches is found in the rival club's clubhouse, playing happily. The club explains they needed a mascot."
          ],
          optionalDetails: ["The clubhouse was filled with games.", "The club members were very friendly.", "Patches seemed to enjoy the attention."]
        }
      },
      {
        text: "{userName} convinces the club members to return Patches to the school, explaining how much everyone misses him. The club agrees, and Patches is welcomed back with a school-wide celebration. {userName} is hailed as a hero.",
        pause: false,
        hook: "What will {userName} investigate next?",
        microVariants: {
          text: "{userName} convinces the club to return Patches, who is welcomed back with a celebration. {userName} is a hero.",
          alternatives: [
            "Patches returns after {userName} convinces the club. The school celebrates, and {userName} is a hero."
          ],
          optionalDetails: ["There was a parade for Patches.", "The club members apologized.", "The school newspaper wrote a story about the rescue."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and the rival club become friends, organizing joint events and sharing Patches as a mascot. They learn the importance of communication and cooperation.",
        microVariants: [
          "{userName} and the rival club become friends, sharing Patches and learning about communication and cooperation."
        ]
      },
      {
        type: 'silly',
        text: "Patches becomes a celebrity, starring in commercials and making appearances at local events. He even gets his own fan club, with {userName} as the president.",
        microVariants: [
          "Patches becomes a celebrity, starring in commercials and having {userName} as the president of his fan club."
        ]
      },
      {
        type: 'triumphant',
        text: "{userName} receives an award for their detective work and community service. They inspire other students to become involved in solving problems and making a difference.",
        microVariants: [
          "{userName} receives an award for their detective work, inspiring others to solve problems and make a difference."
        ]
      },
      {
        type: 'reflective',
        text: "Looking back on the case, {userName} realizes that even misunderstandings can be resolved with empathy and understanding. They continue to use their skills to help others and make their community a better place.",
        microVariants: [
          "{userName} learns that misunderstandings can be resolved with empathy, continuing to help others and improve their community."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "animalType": ["dog", "cat", "bird", "hamster"],
        "forestType": ["enchanted", "dark", "sunny", "mysterious"],
        "buildingType": ["barn", "house", "shed", "garage"]
      },
      weatherVariants: ["sunny", "rainy", "windy", "cloudy"],
      settingVariants: ["school", "park", "community center", "library"]
    }
  },
  {
    title: "The Space Explorers' Mission to Mars",
    theme: "Space & Sci-Fi",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} and their crew are on a mission to Mars! They've been training for years, and now they're finally ready to explore the red planet. As they approach Mars, they see a strange object on the surface.",
        pause: true,
        hook: "What is the strange object on Mars?",
        microVariants: {
          text: "{userName} and their crew approach Mars, ready to explore. They spot a strange object on the surface.",
          alternatives: [
            "{userName}'s crew is on a mission to Mars and sees a strange object as they arrive."
          ],
          optionalDetails: ["The object was glowing.", "It was moving slowly.", "The crew was nervous."]
        }
      },
      {
        text: "They land their spaceship near the object and discover that it's a robot! The robot is old and damaged, but it still has a message for them: 'Help us. We are stranded on Mars.'",
        pause: true,
        hook: "Who is stranded on Mars, and how can they help?",
        microVariants: {
          text: "They land and find a damaged robot with a message: 'Help us. We are stranded on Mars.'",
          alternatives: [
            "A robot is found on Mars, saying, 'Help us. We are stranded.' {userName}'s crew must help."
          ],
          optionalDetails: ["The robot's voice was crackly.", "It had a blinking light.", "The message was repeated."]
        }
      },
      {
        text: "{userName} and the crew follow the robot's instructions and find a hidden underground base. Inside, they discover a group of scientists who have been stranded on Mars for years. Their spaceship broke down, and they couldn't contact Earth.",
        pause: true,
        hook: "Can {userName} and the crew repair the scientists' spaceship?",
        microVariants: {
          text: "They find a hidden base with scientists stranded for years. Their spaceship is broken, and they can't contact Earth.",
          alternatives: [
            "Scientists are found in a hidden base, stranded because their spaceship broke down. {userName}'s crew must fix it."
          ],
          optionalDetails: ["The base was powered by solar energy.", "The scientists were very grateful.", "They had been growing their own food."]
        }
      },
      {
        text: "{userName} and the crew work together to repair the scientists' spaceship. They use their engineering skills and the resources on Mars to fix the broken parts. After weeks of hard work, the spaceship is finally ready to fly.",
        pause: true,
        hook: "Will the scientists make it back to Earth safely?",
        microVariants: {
          text: "The crew works to repair the spaceship, using their skills and Martian resources. After weeks, it's ready to fly.",
          alternatives: [
            "The spaceship is repaired by {userName}'s crew, using Martian resources and their skills. It's ready for flight."
          ],
          optionalDetails: ["They had to find rare minerals.", "The repairs were very challenging.", "The scientists helped with their knowledge."]
        }
      },
      {
        text: "The scientists return to Earth, and {userName} and the crew continue their mission to explore Mars. They discover new forms of life and learn valuable information about the red planet. They return to Earth as heroes.",
        pause: false,
        hook: "What will they discover on their next space adventure?",
        microVariants: {
          text: "The scientists return to Earth, and {userName}'s crew explores Mars, discovering new life and information. They return as heroes.",
          alternatives: [
            "After the scientists return, {userName}'s crew explores Mars, finds new life, and returns to Earth as heroes."
          ],
          optionalDetails: ["They found underground rivers.", "They discovered ancient ruins.", "They planted a flag on Mars."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and the crew write a book about their adventures on Mars, inspiring children around the world to pursue careers in science and space exploration. They often visit schools to share their stories.",
        microVariants: [
          "They write a book about their Mars adventure, inspiring children to pursue science and space exploration. They visit schools to share their stories."
        ]
      },
      {
        type: 'silly',
        text: "The robot from Mars becomes a popular toy, with kids everywhere wanting their own Martian robot. It even has its own TV show, with {userName} as a consultant.",
        microVariants: [
          "The Martian robot becomes a popular toy and has its own TV show, with {userName} as a consultant."
        ]
      },
      {
        type: 'triumphant',
        text: "{userName} and the crew receive a medal of honor for their bravery and contributions to space exploration. They continue to lead missions to other planets, pushing the boundaries of human knowledge.",
        microVariants: [
          "They receive a medal of honor for their bravery and continue to lead missions to other planets, pushing the boundaries of knowledge."
        ]
      },
      {
        type: 'reflective',
        text: "Looking back on their mission to Mars, {userName} and the crew realize that teamwork, perseverance, and a thirst for knowledge are the keys to success. They continue to explore the universe, seeking new challenges and discoveries.",
        microVariants: [
          "They realize that teamwork, perseverance, and knowledge are key, continuing to explore the universe for new challenges."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "crewRoles": ["engineer", "scientist", "pilot", "doctor"],
        "MartianFeatures": ["canyons", "mountains", "caves", "deserts"],
        "spaceshipFeatures": ["solar panels", "robotic arms", "living quarters", "laboratory"]
      },
      weatherVariants: ["sunny", "stormy", "dusty", "clear"],
      settingVariants: ["spaceship", "Martian surface", "underground base", "laboratory"]
    }
  },
  {
    title: "The Student Council Environmental Initiative",
    theme: "School & Everyday Life",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} had been noticing troubling changes around their school for weeks - the playground grass was turning brown despite regular watering, the school garden vegetables weren't growing properly, and even the {favoriteAnimal} that usually visited the courtyard seemed to be avoiding the area. During their favorite {hobbies} time after lunch, {userName} decided to investigate what was causing these environmental problems. They grabbed their notebook and began documenting everything they observed, from the strange {favoriteColor} tint in the water fountain to the unusual smell near the cafeteria dumpsters.",
        pause: true,
        hook: "What could be causing all these environmental problems at school?",
        microVariants: {
          text: "{userName} had been noticing troubling changes around their school for weeks - the playground grass was turning brown despite regular watering, the school garden vegetables weren't growing properly, and even the {favoriteAnimal} that usually visited the courtyard seemed to be avoiding the area. During their favorite {hobbies} time after lunch, {userName} decided to investigate what was causing these environmental problems. They grabbed their notebook and began documenting everything they observed, from the strange {favoriteColor} tint in the water fountain to the unusual smell near the cafeteria dumpsters.",
          alternatives: [
            "{userName} couldn't ignore the concerning environmental changes that had been occurring at their school over the past month - withering plants despite adequate irrigation, failing vegetable crops in the educational garden, and the mysterious absence of the beloved {favoriteAnimal} that typically inhabited the school courtyard. While enjoying their usual {hobbies} activities during the post-lunch break, {userName} resolved to conduct a thorough investigation. Armed with a detailed notebook, they began systematically recording their observations, noting everything from the peculiar {favoriteColor} discoloration in the drinking water to the suspicious odors emanating from the waste management area."
          ],
          optionalDetails: ["Other students were starting to notice the changes too.", "The custodial staff seemed worried but hadn't said anything.", "The principal had mentioned 'investigating' during morning announcements."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Six months later, {userName} sat in the beautifully restored school garden, watching the {favoriteAnimal} play among the thriving plants while enjoying a healthy snack of {favoriteFood} grown in their own clean soil. The gentle sound of the new water filtration system provided a peaceful backdrop as they reflected on how one person's dedication to environmental stewardship had transformed their entire school community into a model of sustainability and ecological responsibility.",
        microVariants: [
          "Half a year afterward, {userName} relaxed peacefully in the rejuvenated educational garden, observing the joyful return of the {favoriteAnimal} population as they thrived among the flourishing vegetation while savoring organically grown {favoriteFood} harvested from their own purified earth. The soothing sounds of advanced water purification technology created a tranquil atmosphere for contemplating how individual commitment to environmental protection had evolved their academic institution into an exemplary demonstration of sustainable practices and ecological stewardship."
        ]
      },
      {
        type: 'silly',
        text: "The celebration got wonderfully out of hand when the {favoriteAnimal} discovered they could slide down the new rain collection system like a water slide! \"Wheee! Environmental protection is fun!\" they seemed to say as they splashed into the clean collection pond. Even the vegetables in the garden started doing what looked like a happy dance in the wind, and {userName} was convinced the {favoriteFood} tasted extra delicious because it was grown with such joy and environmental love!",
        microVariants: [
          "The environmental victory party became hilariously chaotic when the local {favoriteAnimal} population realized the new sustainable water management infrastructure doubled as the world's best natural playground! \"Environmental engineering meets extreme fun!\" {userName} laughed as they watched the delighted creatures turn conservation equipment into entertainment systems."
        ]
      },
      {
        type: 'triumphant',
        text: "At the regional Environmental Youth Leadership Awards ceremony, {userName} stood proudly on stage receiving the highest honor for environmental advocacy while their school was officially designated as a National Model for Ecological Stewardship. \"Young environmental heroes like {userName} prove that age is no barrier to creating positive change!\" declared the EPA representative.",
        microVariants: [
          "During the prestigious state-level Environmental Excellence Recognition event, {userName} accepted the supreme environmental leadership distinction while their educational institution received official certification as a Federal Demonstration Site for Sustainable Practices."
        ]
      },
      {
        type: 'reflective',
        text: "Standing quietly in the evening garden, surrounded by the gentle sounds of clean water flowing and healthy wildlife thriving, {userName} understood something profound about their place in the world. \"Every person has the power to protect the environment,\" they realized with quiet confidence. \"When we combine scientific curiosity with community cooperation and personal courage, we can solve even the biggest environmental challenges. The Earth needs each of us to be its advocate.\"",
        microVariants: [
          "In the peaceful twilight hours within their restored ecological sanctuary, listening to the harmonious symphony of purified water systems and flourishing biodiversity, {userName} experienced a deep understanding about their role as an environmental steward."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental_problems": ["water contamination", "soil pollution", "air quality issues", "waste management", "habitat destruction"],
        "investigation_tools": ["notebooks", "cameras", "water testing kits", "measuring devices", "observation charts"],
        "solutions": ["filtration systems", "recycling programs", "garden restoration", "waste reduction", "habitat protection"]
      },
      weatherVariants: ["sunny investigation day", "rainy measurement session", "cloudy observation period", "clear documentation time"],
      settingVariants: ["school courtyard", "playground area", "garden space", "cafeteria vicinity"]
    }
  },

  // Template 2: Friendship & Teamwork - completed above
  // Template 3: Magic & Fantasy - completed above  
  // Template 4: Adventure Journeys - completed above
  // Template 5: Space & Sci-Fi - completed above
];

/**
 * Get a random Level 3 template
 */
export function getLevel3FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (LEVEL_3_FALLBACK_TEMPLATES.length === 0) return null;
  
  const index = templateIndex !== undefined 
    ? Math.min(templateIndex, LEVEL_3_FALLBACK_TEMPLATES.length - 1)
    : Math.floor(Math.random() * LEVEL_3_FALLBACK_TEMPLATES.length);
  
  return LEVEL_3_FALLBACK_TEMPLATES[index];
}

/**
 * Get the count of Level 3 templates
 */
export function getLevel3FallbackTemplateCount(): number {
  return LEVEL_3_FALLBACK_TEMPLATES.length;
}
