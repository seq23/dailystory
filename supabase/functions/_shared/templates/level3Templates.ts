/**
 * Level 3 Templates (Ages 9-11) - Complete Fallback Story Library  
 * 5 templates with 10 scenes each, 70-100 words per scene
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from './storyTemplateTypes.ts';

export const LEVEL_3_FALLBACK_TEMPLATES: StoryTemplate[] = [
  {
    title: "The Magical Treehouse Adventure",
    theme: "Magic & Fantasy",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} and their best friend {friend} stumbled upon an ancient-looking treehouse deep in the {forestType} forest. As they climbed inside, they discovered a dusty old book with strange symbols. Suddenly, the treehouse began to shake, and they realized it was lifting off the ground!",
        pause: true,
        hook: "Where will the magical treehouse take them?",
        microVariants: {
          text: "{userName} and {friend}, while exploring the {forestType} forest, found a hidden treehouse. Inside, a mysterious book with glowing symbols caused the treehouse to magically float into the sky!",
          alternatives: [
            "{userName} and {friend} were playing in the {forestType} woods when they discovered a secret treehouse. A magical book inside made the treehouse fly!"
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
        text: "In the Land of Talking Animals, they met a {animalType} who told them about a hidden treasure that could grant any wish. The {animalType} warned them that the treasure was guarded by a grumpy {monsterType} who loved riddles. {userName} and {friend} accepted the challenge and set off to find the treasure.",
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
        text: "Following the map through enchanted forests and across rainbow bridges, {userName} and {friend} encountered three magical creatures who each offered helpful gifts. A wise owl gave them a compass that always points toward truth, a friendly dragon shared a protective shield made of {favoriteColor} scales, and a magical butterfly whispered the secret to understanding any language. Armed with these gifts, they felt ready to face the riddle-loving monster and solve whatever challenges awaited them at the treasure's location.",
        pause: true,
        hook: "What riddles will the monster ask, and how will their gifts help?",
        microVariants: {
          text: "Three magical creatures offered gifts: a truth compass from an owl, a {favoriteColor} shield from a dragon, and language understanding from a butterfly.",
          alternatives: [
            "An owl, dragon, and butterfly each gave {userName} and {friend} magical gifts to help with their treasure quest."
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
        text: "The treasure turned out to be something even more valuable than gold or jewels: a magical library containing every story ever told and every story yet to be written. The {monsterType} explained that the real treasure was the knowledge and imagination contained in these infinite stories. {userName} and {friend} realized they could make any wish come true by reading and learning from these tales, and they invited their new monster friend to join them in exploring the endless adventures contained within the magical books.",
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
        text: "When it was time to return to the treehouse, {userName} and {friend} realized they could visit the magical library anytime through their friendship with the {monsterType}, who gave them each a special bookmark that would transport them back whenever they wanted to share a new story. The treehouse gently carried them home, but now their adventures felt infinite because they had discovered that friendship, imagination, and shared stories could take them anywhere they wanted to go, creating new magical experiences every single day.",
        pause: true,
        hook: "Where will their next storytelling adventure take them?",
        microVariants: {
          text: "With special bookmarks from their {monsterType} friend, {userName} and {friend} could return to the magical library anytime to share new story adventures.",
          alternatives: [
            "The treehouse brought them home, but the {monsterType} friend and magical bookmarks meant their story adventures could continue forever."
          ],
          optionalDetails: ["The bookmarks shimmered with the same magic as the library.", "Each bookmark could hold one favorite story.", "The {monsterType} promised to find new stories while they were away."]
        }
      },
      {
        text: "Back home, {userName} and {friend} started a storytelling club at school where kids could share their favorite books and create new stories together. They used the magical bookmarks to bring some of the library's stories to life for their classmates, inspiring everyone to love reading and use their imagination. The club became so popular that other schools wanted to start their own storytelling groups.",
        pause: true,
        hook: "How will their storytelling movement spread to help other children discover the magic of books?",
        microVariants: {
          text: "A school storytelling club founded by {userName} and {friend} used magical bookmarks to inspire reading and imagination, spreading to other schools.",
          alternatives: [
            "The storytelling club with magical elements inspired widespread love of reading and imagination among students across multiple schools."
          ],
          optionalDetails: ["Children wrote and illustrated their own story books.", "Teachers noticed improved reading skills and creativity.", "Libraries reported increased book checkouts."]
        }
      },
      {
        text: "Years later, {userName} and {friend} became professional storytellers and children's book authors, traveling the world to share the magic of stories with children everywhere. They never forgot their {monsterType} friend in the magical library, and sometimes, late at night when they were creating new stories, they could swear they heard familiar laughter and encouragement coming from their old magical bookmarks, reminding them that the greatest adventures always begin with friendship and imagination.",
        pause: false,
        hook: "What new generations of children will discover the magic of storytelling through their work?",
        microVariants: {
          text: "Professional storytellers {userName} and {friend} traveled worldwide sharing story magic, never forgetting their {monsterType} friend and the power of imagination.",
          alternatives: [
            "Their careers as storytellers and authors spread the library's magic globally, with the {monsterType} friend's spirit inspiring their creative work forever."
          ],
          optionalDetails: ["Their books were translated into dozens of languages.", "Children sent them stories inspired by their storytelling.", "The magical bookmarks still worked after all those years."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Back in their own backyard, {userName} and {friend} built a small library for their neighborhood, filled with books from their adventure. They often read stories to the younger children, sharing the magic of reading and the importance of education.",
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
        text: "{userName} and {friend} started a global campaign for education, inspiring people around the world to donate books and support schools. They received awards and recognition, but their greatest reward was seeing children everywhere learning and growing.",
        microVariants: [
          "They started a global education campaign, inspiring people to donate books and support schools. Their reward was seeing children learning and growing."
        ]
      },
      {
        type: 'reflective',
        text: "Looking back on their adventure, {userName} and {friend} realized that the greatest magic wasn't in the treehouse or the treasure, but in the power of knowledge and the ability to make a positive impact on the world. They continued to explore, learn, and share their discoveries with others.",
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
        text: "{userName} was excited about the upcoming science fair. They wanted to create an experiment that would amaze everyone. After brainstorming with their friend {friend}, they decided to build a robot that could clean up the school playground.",
        pause: true,
        hook: "Will their robot be a success at the science fair?",
        microVariants: {
          text: "{userName} and {friend} decided to build a robot for the science fair that could clean the school playground.",
          alternatives: [
            "{userName} wanted to impress at the science fair and, with {friend}'s help, planned to build a robot to clean the playground."
          ],
          optionalDetails: ["They spent weeks planning.", "Their teacher was very supportive.", "They gathered recycled materials."]
        }
      },
      {
        text: "They gathered recycled materials like cardboard boxes, plastic bottles, and old wires. {userName} focused on the robot's design, while {friend} worked on the programming. They faced many challenges, but they never gave up.",
        pause: true,
        hook: "What challenges will they face while building the robot?",
        microVariants: {
          text: "Using recycled materials, {userName} designed the robot, and {friend} programmed it. They faced challenges but persevered.",
          alternatives: [
            "They collected cardboard, bottles, and wires. {userName} designed, {friend} programmed, and they kept going despite problems."
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
        text: "The judges were impressed by CleanBot's functionality and creativity. They awarded {userName} and {friend} first place in the science fair. Their project inspired other students to think about ways to help the environment.",
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
        text: "{userName} and {friend} continued to improve CleanBot, adding new features and making it more efficient. They shared their knowledge with other students, helping them build their own robots to solve problems in their community.",
        pause: true,
        hook: "How will they continue to make a difference in their community?",
        microVariants: {
          text: "They improved CleanBot and shared their knowledge, helping others build robots to solve community problems.",
          alternatives: [
            "They made CleanBot better and taught others to build robots to help their community."
          ],
          optionalDetails: ["They started a robotics club.", "They organized a community cleanup day.", "They felt proud of their accomplishments."]
        }
      },
      {
        text: "As weeks passed, {userName} and {friend} discovered that CleanBot's success had attracted attention from environmental organizations and tech companies. They received invitations to demonstrate their robot at regional science competitions and environmental conferences. The experience taught them about presenting complex ideas to diverse audiences and the importance of clear communication in science.",
        pause: true,
        hook: "How will presenting to experts help them improve their robot?",
        microVariants: {
          text: "CleanBot's success brought invitations to present at competitions and conferences, teaching {userName} and {friend} about scientific communication.",
          alternatives: [
            "Environmental groups and tech companies wanted to see CleanBot, giving {userName} and {friend} chances to present to experts."
          ],
          optionalDetails: ["They practiced their presentation every day", "The conferences were held in big cities", "Famous scientists attended these events"]
        }
      },
      {
        text: "During one presentation, a scientist suggested that CleanBot could be modified to work in different environments like beaches or parks. This sparked {userName} and {friend}'s imagination about creating a whole family of cleaning robots. They began researching how to adapt their design for different surfaces and weather conditions, learning about engineering principles and environmental science.",
        pause: true,
        hook: "What new challenges will they face designing robots for different environments?",
        microVariants: {
          text: "A scientist suggested adapting CleanBot for beaches and parks, inspiring {userName} and {friend} to research environmental engineering.",
          alternatives: [
            "Ideas for beach-cleaning and park-cleaning robots inspired {userName} and {friend} to study environmental engineering principles."
          ],
          optionalDetails: ["They studied sand cleaning mechanisms", "Waterproof designs became important", "Different trash types required different approaches"]
        }
      },
      {
        text: "Their research led them to collaborate with marine biology students on a robot that can clean plastic from ocean shores. {userName} focused on the mechanical design while {friend} worked on programming the robot to identify and safely collect different types of marine debris. This interdisciplinary project taught them how science, technology, engineering, and environmental conservation work together.",
        pause: true,
        hook: "Will their ocean-cleaning robot be successful in protecting marine life?",
        microVariants: {
          text: "Collaborating with marine biology students, {userName} and {friend} designed an ocean shore cleaning robot that identifies marine debris.",
          alternatives: [
            "Marine biology collaboration helped {userName} and {friend} create a robot that safely removes ocean plastic while protecting sea life."
          ],
          optionalDetails: ["They learned about microplastics and their dangers", "The robot can distinguish trash from natural materials", "Marine biologists tested the robot's safety"]
        }
      },
      {
        text: "Testing their new robot at a local beach, {userName} and {friend} witnessed firsthand the environmental impact of plastic pollution on marine ecosystems. They documented how their robot successfully removed harmful debris while leaving natural materials undisturbed. The experience deepened their commitment to environmental protection and their understanding of how technology can address global challenges.",
        pause: true,
        hook: "How will their success inspire others to join environmental protection efforts?",
        microVariants: {
          text: "Beach testing showed how their robot removes pollution while protecting ecosystems, deepening {userName} and {friend}'s environmental commitment.",
          alternatives: [
            "Successful beach testing demonstrated their robot's environmental benefits, inspiring {userName} and {friend} to expand their conservation work."
          ],
          optionalDetails: ["Local news covered their beach cleanup", "Other students wanted to help with testing", "Marine life returned to cleaned areas"]
        }
      },
      {
        text: "Inspired by their success, {userName} and {friend} established a youth environmental technology club at their school, teaching other students to build simple robots for environmental cleanup projects. They developed curriculum that combined hands-on engineering with environmental science education. Their club grew to include students from other schools, creating a network of young environmental advocates using technology for conservation.",
        pause: false,
        hook: "What global impact will their environmental technology movement achieve?",
        microVariants: {
          text: "Their success led to establishing a youth environmental technology club that teaches others and grows into a network of young advocates.",
          alternatives: [
            "An environmental technology club founded by {userName} and {friend} spreads to other schools, creating young environmental advocates."
          ],
          optionalDetails: ["The club builds robots for local parks", "They organize community cleanup events", "Other cities request help starting similar clubs"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Years later, {userName} and {friend} became engineers, designing sustainable solutions for communities around the world. They never forgot their first science fair project and the importance of teamwork and creativity.",
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
        text: "{userName} and {friend} received a national award for their contributions to environmental science. They used their platform to advocate for STEM education and inspire young people to pursue their dreams.",
        microVariants: [
          "They received an award for their contributions to environmental science, advocating for STEM education and inspiring young people."
        ]
      },
      {
        type: 'reflective',
        text: "Looking back on their science fair project, {userName} and {friend} realized that even small actions can make a big difference. They continued to use their skills and knowledge to create a better world for future generations.",
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
        pause: true,
        hook: "What will {userName} investigate next?",
        microVariants: {
          text: "{userName} convinces the club to return Patches, who is welcomed back with a celebration. {userName} is a hero.",
          alternatives: [
            "The club agrees to return Patches after {userName} explains how much he's missed. A celebration welcomes him back."
          ],
          optionalDetails: ["The whole school attended the celebration.", "Patches was given a special medal.", "{userName} was featured in the school newspaper."]
        }
      },
      {
        text: "Weeks later, {userName} discovers that the club has been secretly helping the school by organizing cleanup days and tutoring younger students. They realize that despite the initial misunderstanding about Patches, the club members have good hearts and want to contribute positively to the school community. This discovery makes {userName} think about how misunderstandings can be resolved through communication and finding common ground.",
        pause: true,
        hook: "How will {userName} help bridge the gap between the school and the club?",
        microVariants: {
          text: "Weeks later, {userName} learns the club has been helping the school with cleanups and tutoring, realizing they have good intentions despite the Patches incident.",
          alternatives: [
            "The club's secret good deeds are discovered by {userName}, showing their positive intentions beyond the Patches misunderstanding."
          ],
          optionalDetails: ["They planted flowers in the school garden", "Club members tutored struggling students for free", "They organized a successful recycling program"]
        }
      },
      {
        text: "Inspired by this revelation, {userName} proposes to the principal that the two schools collaborate on joint projects instead of competing. They suggest that Patches could be a shared mascot for special events, symbolizing cooperation between the schools. The principal is impressed by {userName}'s mature thinking and diplomatic approach to solving conflicts through understanding and compromise.",
        pause: true,
        hook: "Will the schools agree to work together instead of competing?",
        microVariants: {
          text: "{userName} proposes school collaboration and sharing Patches as a symbol of cooperation, impressing the principal with diplomatic thinking.",
          alternatives: [
            "A collaboration proposal from {userName} suggests sharing Patches and working together, showing mature conflict resolution skills."
          ],
          optionalDetails: ["Both principals agreed to meet and discuss the idea", "Students from both schools supported the cooperation plan", "Patches seemed to enjoy having friends from both schools"]
        }
      },
      {
        text: "The collaboration begins with a joint science fair where students from both schools work together on environmental projects. {userName} helps organize teams that include members from both schools, ensuring everyone feels included and valued. Patches becomes the official mascot for all collaborative events, and his story becomes a symbol of how differences can be resolved through understanding and communication.",
        pause: true,
        hook: "What other collaborative projects will the schools create together?",
        microVariants: {
          text: "A joint science fair launches the collaboration, with {userName} organizing mixed teams and Patches as the official mascot for cooperative events.",
          alternatives: [
            "The school collaboration starts with environmental projects, mixed teams organized by {userName}, and Patches as the cooperation mascot."
          ],
          optionalDetails: ["The science fair featured projects on recycling and renewable energy", "Students discovered they had more in common than they thought", "Teachers from both schools shared resources and expertise"]
        }
      },
      {
        text: "As the collaborative programs expand to include art exchanges, music concerts, and athletic tournaments, {userName} takes on a leadership role as student coordinator between the schools. They learn valuable skills in diplomacy, event planning, and conflict resolution while helping to create lasting friendships across school boundaries. The success of these programs attracts attention from other schools in the district.",
        pause: true,
        hook: "How will {userName}'s leadership experience influence their future goals?",
        microVariants: {
          text: "Expanding programs include arts and sports, with {userName} as student coordinator learning diplomacy and leadership while building inter-school friendships.",
          alternatives: [
            "Leadership as student coordinator teaches {userName} diplomacy and planning skills while expanding collaborative arts, music, and sports programs."
          ],
          optionalDetails: ["Art students created a mural celebrating friendship", "Music concerts featured combined choirs from both schools", "Athletic tournaments focused on fun and friendship rather than just winning"]
        }
      },
      {
        text: "By the end of the school year, {userName} realizes that their detective work to find Patches had led to something much more valuable than solving a simple mystery. They had helped create a model for how schools and communities can work together to solve problems and build stronger relationships. The experience teaches them that sometimes the most important discoveries happen when you're looking for something else entirely.",
        pause: false,
        hook: "What other communities might benefit from {userName}'s collaboration model?",
        microVariants: {
          text: "By year's end, {userName} realizes that finding Patches led to creating a collaboration model that builds stronger community relationships and solves problems.",
          alternatives: [
            "The school year ends with {userName} understanding that detective work created something bigger: a community collaboration model for problem-solving."
          ],
          optionalDetails: ["Other districts visited to learn about the collaboration program", "The model was featured in educational magazines", "Both schools received awards for innovative community building"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and Patches became best friends, with Patches often visiting {userName}'s classroom to help with school projects and bring joy to students who were having difficult days.",
        microVariants: [
          "Patches and {userName} became best friends, with the mascot helping in the classroom and cheering up students."
        ]
      },
      {
        type: 'silly',
        text: "Patches learned to solve mysteries too and became {userName}'s detective partner, wearing a tiny detective hat and helping to find lost items around the school.",
        microVariants: [
          "Patches became a detective partner, wearing a tiny hat and helping {userName} solve school mysteries."
        ]
      },
      {
        type: 'triumphant',
        text: "{userName} was offered a position as the school's official Student Ambassador, helping to solve conflicts and build bridges between different groups within the school community.",
        microVariants: [
          "{userName} became the official Student Ambassador, solving conflicts and building bridges between school groups."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} learned that the best detectives don't just solve mysteries—they help people understand each other and work together to make their communities stronger and more caring.",
        microVariants: [
          "{userName} learned that great detectives help people understand each other and build stronger, more caring communities."
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
        pause: true,
        hook: "What will they discover on their next space adventure?",
        microVariants: {
          text: "The scientists return to Earth, and {userName}'s crew explores Mars, discovering new life and information. They return as heroes.",
          alternatives: [
            "After the scientists return, {userName}'s crew explores Mars, finds new life, and returns to Earth as heroes."
          ],
          optionalDetails: ["They found underground rivers.", "They discovered ancient ruins.", "They planted a flag on Mars."]
        }
      },
      {
        text: "Months after returning to Earth, {userName} and the crew receive a transmission from Mars containing detailed scientific data and photographs from the rescued scientists who stayed behind to continue research. The data reveals groundbreaking discoveries about Mars' potential for supporting life and its geological history. This information becomes crucial for planning future Mars colonization missions and advances humanity's understanding of planetary science.",
        pause: true,
        hook: "How will these discoveries change future space exploration plans?",
        microVariants: {
          text: "A Mars transmission reveals groundbreaking discoveries from the scientists, advancing planetary science and colonization planning.",
          alternatives: [
            "The rescued scientists send breakthrough research from Mars, providing crucial data for future colonization and planetary science."
          ],
          optionalDetails: ["Underground water sources were mapped comprehensively", "Ancient microbial life forms were discovered in rock samples", "Mineral deposits valuable for construction were located"]
        }
      },
      {
        text: "Based on the new scientific findings, {userName} leads a team to design the next generation of Mars exploration equipment that can establish permanent research stations. They work with international space agencies to develop sustainable life support systems, advanced communication networks, and efficient resource extraction technologies. The project becomes a global collaboration involving scientists, engineers, and researchers from multiple countries.",
        pause: true,
        hook: "What challenges will arise in establishing permanent Mars research stations?",
        microVariants: {
          text: "{userName} leads designing next-generation Mars equipment for permanent stations, collaborating internationally on sustainable technologies.",
          alternatives: [
            "Leading international collaboration, {userName} develops sustainable Mars technologies for permanent research stations and resource extraction."
          ],
          optionalDetails: ["Solar panel efficiency was improved by 300% for Mars conditions", "Atmospheric processors were designed to create breathable air", "Hydroponic systems were adapted for Martian soil conditions"]
        }
      },
      {
        text: "During equipment testing on Earth, {userName} discovers that the Martian robot they rescued has been upgraded by Earth scientists with artificial intelligence capabilities that could revolutionize space exploration. The robot, now called MARS-1, can independently conduct scientific experiments, navigate treacherous terrain, and communicate complex data back to Earth. This breakthrough makes future unmanned missions more effective and safer.",
        pause: true,
        hook: "How will MARS-1's capabilities transform space exploration missions?",
        microVariants: {
          text: "The rescued Martian robot, upgraded with AI as MARS-1, can independently conduct experiments and navigate, revolutionizing space exploration.",
          alternatives: [
            "MARS-1, the upgraded Martian robot with AI capabilities, transforms space exploration through independent research and navigation abilities."
          ],
          optionalDetails: ["The robot could predict weather patterns on Mars accurately", "It developed its own efficient routes through dangerous terrain", "MARS-1 could repair itself using available materials"]
        }
      },
      {
        text: "As commander of the next Mars mission, {userName} leads a diverse international crew including the scientists they previously rescued, creating a powerful team with both Earth training and Mars experience. The mission's goal is to establish humanity's first permanent research colony on Mars, using all the knowledge and technology developed from their previous adventures. The launch attracts global attention as a historic step toward interplanetary civilization.",
        pause: true,
        hook: "Will the permanent Mars colony successfully support human life long-term?",
        microVariants: {
          text: "Commander {userName} leads an international crew including rescued scientists to establish Mars' first permanent human research colony.",
          alternatives: [
            "Leading a global crew and rescued scientists, {userName} commands the mission to create humanity's first permanent Mars colony."
          ],
          optionalDetails: ["The colony could support 50 researchers initially", "Advanced greenhouses provided fresh food and oxygen", "Communication delays with Earth required autonomous decision-making"]
        }
      },
      {
        text: "The successful establishment of the Mars research colony becomes a turning point in human history, proving that interplanetary colonization is possible and sustainable. {userName} serves as the colony's first director, overseeing scientific research that leads to breakthroughs in medicine, agriculture, and environmental science that benefit both Mars and Earth. The experience teaches humanity valuable lessons about cooperation, sustainability, and the endless possibilities that exist when people work together toward common goals.",
        pause: false,
        hook: "What other planets will humanity explore next with the knowledge gained from Mars?",
        microVariants: {
          text: "The successful Mars colony proves interplanetary colonization possible, with director {userName} overseeing research benefiting both planets.",
          alternatives: [
            "Mars colony success under director {userName} demonstrates sustainable interplanetary living and produces research benefiting all humanity."
          ],
          optionalDetails: ["Medical research on Mars helped cure diseases on Earth", "Agricultural techniques from Mars improved Earth farming", "The colony became a model for future space settlements"]
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
      settingVariants: ["spaceship", "Mars surface", "underground base", "research station"]
    }
  },
  {
    title: "The Student Council Environmental Initiative",
    theme: "Environment & Community",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} runs for student council with a platform focused on making their school more environmentally friendly. They notice that the school produces a lot of waste and uses too much energy. During their campaign speech, they propose creating a comprehensive environmental program.",
        pause: true,
        hook: "Will the students vote for {userName}'s environmental platform?",
        microVariants: {
          text: "{userName} campaigns for student council with environmental plans, noticing the school's waste and energy problems.",
          alternatives: [
            "Running for student council, {userName} proposes environmental improvements after observing school waste and energy use."
          ],
          optionalDetails: ["The cafeteria throws away tons of food daily", "Lights stay on in empty classrooms", "Recycling bins are rarely used properly"]
        }
      },
      {
        text: "After winning the election, {userName} starts by organizing a school-wide environmental audit with help from science teachers and parent volunteers. They measure energy consumption, waste production, and water usage throughout the school. The results are eye-opening: the school could reduce its environmental impact by 40% with simple changes.",
        pause: true,
        hook: "What changes will {userName} implement first?",
        microVariants: {
          text: "Winning the election, {userName} organizes an environmental audit revealing the school could reduce its impact by 40% with simple changes.",
          alternatives: [
            "As elected representative, {userName} conducts a comprehensive environmental audit showing major improvement potential."
          ],
          optionalDetails: ["Energy costs were 60% higher than necessary", "Food waste filled three dumpsters weekly", "Water leaks wasted thousands of gallons monthly"]
        }
      },
      {
        text: "{userName} launches the \"Green School Challenge\" with different classrooms competing to reduce waste, save energy, and increase recycling. They create colorful charts tracking each class's progress and offer prizes for the most improved environmental practices. The friendly competition motivates students to become more conscious of their environmental choices.",
        pause: true,
        hook: "How will the competition change student behavior throughout the school?",
        microVariants: {
          text: "The \"Green School Challenge\" creates classroom competition for waste reduction, energy savings, and recycling with tracking charts and prizes.",
          alternatives: [
            "Classroom competitions in the Green School Challenge motivate students through progress tracking and environmental improvement prizes."
          ],
          optionalDetails: ["Fifth grade reduced waste by 70% in the first month", "Kindergarten students became recycling experts", "Energy savings paid for new playground equipment"]
        }
      },
      {
        text: "Working with the cafeteria staff, {userName} helps establish a composting program that turns food scraps into nutrient-rich soil for a new school garden. Students learn about the composting process while growing vegetables that are later used in school meals. This creates a complete cycle from waste to food production that demonstrates sustainable living principles.",
        pause: true,
        hook: "What will students learn from growing their own food at school?",
        microVariants: {
          text: "A composting program with cafeteria staff creates soil for a school garden where students grow vegetables for school meals.",
          alternatives: [
            "Food scraps become compost for a student garden that provides vegetables for school meals, creating a sustainable cycle."
          ],
          optionalDetails: ["The garden produces enough salad ingredients for 200 students daily", "Compost bins are maintained by rotating student teams", "Cooking classes use fresh garden vegetables in recipes"]
        }
      },
      {
        text: "{userName} organizes \"Energy Detective\" teams of students who monitor and report on energy waste throughout the school. They check for lights left on, computers not shut down properly, and heating or cooling inefficiencies. These teams become so effective that the school's energy bill decreases by 25% within three months.",
        pause: true,
        hook: "How will the energy savings benefit the entire school community?",
        microVariants: {
          text: "Energy Detective teams monitor school energy waste, leading to 25% energy bill reduction within three months.",
          alternatives: [
            "Student Energy Detective teams effectively reduce the school's energy consumption by 25% through waste monitoring and reporting."
          ],
          optionalDetails: ["Saved money funded new library books and science equipment", "Students created energy-saving reminder posters", "The principal praised the teams at monthly assemblies"]
        }
      },
      {
        text: "The success of the environmental program attracts attention from other schools in the district, and {userName} is invited to present their initiatives at a regional student leadership conference. They share detailed data about their programs' success and provide practical advice for implementing similar initiatives. Their presentation inspires students from dozens of other schools to start their own environmental programs.",
        pause: true,
        hook: "How will {userName}'s ideas spread to create district-wide environmental improvements?",
        microVariants: {
          text: "Regional conference presentation by {userName} shares program success data and inspires dozens of other schools to start environmental initiatives.",
          alternatives: [
            "Success attracts regional attention as {userName} presents to student leaders, inspiring district-wide environmental program adoption."
          ],
          optionalDetails: ["Fifteen schools implemented similar programs within six months", "The district created an environmental excellence award", "Local newspapers featured the student-led environmental movement"]
        }
      },
      {
        text: "As the environmental program expands, {userName} collaborates with local environmental organizations and city officials to connect school initiatives with community-wide sustainability efforts. Students participate in city-wide recycling drives, park cleanup events, and renewable energy awareness campaigns. This partnership helps students understand that environmental responsibility extends beyond school walls.",
        pause: true,
        hook: "What lasting impact will these community partnerships create?",
        microVariants: {  
          text: "Community partnerships with environmental organizations and city officials connect school programs to city-wide sustainability efforts.",
          alternatives: [
            "Collaboration with local groups extends environmental education beyond school through community sustainability partnerships."
          ],
          optionalDetails: ["Students helped plant 500 trees in city parks", "The mayor commended the school's environmental leadership", "Community recycling increased 40% with student volunteer help"]
        }
      },
      {
        text: "By the end of the school year, {userName} helps establish an Environmental Club that will continue the initiatives with future student leaders. They create detailed handbooks and training materials so that incoming students can maintain and expand the programs. The club receives official recognition from the school board and becomes a permanent part of the school's structure.",
        pause: true,  
        hook: "How will future students continue building on these environmental achievements?",
        microVariants: {
          text: "An Environmental Club with handbooks and training materials ensures program continuity, receiving official school board recognition.",
          alternatives: [
            "Program sustainability is secured through an official Environmental Club with training resources and school board recognition."
          ],
          optionalDetails: ["The club received annual funding for environmental projects", "New students eagerly join the popular Environmental Club", "The handbook is shared with schools nationwide"]
        }
      },
      {
        text: "The environmental program's success leads to the school receiving state recognition as a \"Green School of Excellence,\" with {userName} representing the school at the state award ceremony. They realize that student leadership can create meaningful change when combined with dedication, collaboration, and practical problem-solving. The experience teaches them that young people have the power to address serious environmental challenges.",
        pause: true,
        hook: "What environmental challenges will {userName} tackle next as a recognized student leader?",
        microVariants: {
          text: "State recognition as a 'Green School of Excellence' demonstrates how student leadership creates meaningful environmental change.",
          alternatives: [
            "The 'Green School of Excellence' award validates {userName}'s belief that students can effectively address environmental challenges."
          ],
          optionalDetails: ["The governor personally congratulated {userName} at the ceremony", "Other state schools requested consulting help", "Environmental organizations offered internships"]
        }
      },
      {
        text: "Years later, {userName} reflects on how their student council environmental initiative became the foundation for a lifelong commitment to sustainability and environmental advocacy. The skills they developed in project management, community organizing, and environmental science led to a career dedicated to creating positive environmental change. They never forgot that meaningful environmental action often starts with young people who care enough to take the first step.",
        pause: false,
        hook: "What global environmental challenges might {userName} help solve in their future career?",
        microVariants: {
          text: "The student council initiative becomes the foundation for {userName}'s lifelong environmental advocacy career and commitment to sustainability.",
          alternatives: [
            "Environmental advocacy career roots trace back to {userName}'s transformative student council experience with school sustainability programs."
          ],
          optionalDetails: ["They became an environmental engineer designing renewable energy systems", "Their consulting firm helps schools worldwide become sustainable", "The original school program still operates successfully after many years"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} continues to visit their old school every Earth Day to help new students plant trees and learn about environmental stewardship, watching with pride as each new generation carries forward the tradition of environmental responsibility.",
        microVariants: [
          "Annual Earth Day visits to plant trees with new students continue the environmental stewardship tradition {userName} started."
        ]
      },
      {
        type: 'silly',
        text: "The school's original compost bins become legendary \"historical artifacts\" that new students visit like a monument, with {userName}'s photo displayed proudly as the \"Great Compost Pioneer\" of the school.",
        microVariants: [
          "The original compost bins become school monuments with {userName} honored as the legendary 'Great Compost Pioneer'."
        ]
      },
      {
        type: 'triumphant',
        text: "{userName} receives a national environmental leadership award and uses their platform to advocate for environmental education in schools across the country, inspiring thousands of students to become environmental leaders.",
        microVariants: [
          "National environmental leadership recognition helps {userName} inspire thousands of students nationwide to become environmental advocates."
        ]
      },
      {
        type: 'reflective',
        text: "{userName} learns that true leadership means empowering others to continue important work long after you've moved on, and that environmental protection requires sustained commitment from every generation.",
        microVariants: [
          "True leadership means empowering others to continue environmental work, requiring sustained commitment from every generation."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "environmentalFocus": ["waste reduction", "energy conservation", "water saving", "sustainable gardening"],
        "schoolAreas": ["cafeteria", "classrooms", "gymnasium", "library"],
        "measurementTools": ["energy meters", "waste scales", "water monitors", "recycling trackers"]
      },
      weatherVariants: ["during Earth Week", "in spring semester", "throughout the school year", "during environmental awareness month"],
      settingVariants: ["elementary school", "middle school", "community school", "charter school"]
    }
  }
];

export function getLevel3FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (LEVEL_3_FALLBACK_TEMPLATES.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_3_FALLBACK_TEMPLATES.length) {
    return LEVEL_3_FALLBACK_TEMPLATES[templateIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * LEVEL_3_FALLBACK_TEMPLATES.length);
  return LEVEL_3_FALLBACK_TEMPLATES[randomIndex];
}

export function getLevel3FallbackTemplateCount(): number {
  return LEVEL_3_FALLBACK_TEMPLATES.length;
}