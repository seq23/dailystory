// Level 2 Templates - Enhanced with proper word counts  
// 3-4 sentences per page (60-80 words per scene)
// For ages 7-9, 3rd-4th grade reading level

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_2_TEMPLATES: StoryTemplate[] = [
  {
    title: "The School Science Fair Champion",
    theme: "Science & Discovery", 
    level: "Level 2",
    scenes: [
      {
        text: "{userName} joins the school science club and discovers they have a talent for experiments. The teacher, Mrs. Johnson, shows them how to create colorful chemical reactions using safe household ingredients. {userName} watches in amazement as red and blue liquids combine to make purple foam.",
        pause: true,
        hook: "What amazing project will {userName} create for the science fair?",
        microVariants: {
          text: "{userName} joins the school science club and discovers they have a talent for experiments. The teacher, Mrs. Johnson, shows them how to create colorful chemical reactions using safe household ingredients. {userName} watches in amazement as red and blue liquids combine to make purple foam.",
          alternatives: ["At science club, {userName} learns to mix chemicals safely and create amazing reactions.", "Mrs. Johnson teaches {userName} about exciting chemical reactions that bubble and change colors."],
          optionalDetails: ["the mixtures bubble and foam wildly", "different colors swirl together in beautiful patterns"]
        }
      },
      {
        text: "For their first project, {userName} decides to build a volcano that actually erupts. They carefully mix baking soda, vinegar, and {favoriteColor} food coloring while following the scientific method. {userName} measures each ingredient precisely and records everything in their science notebook like a real scientist.",
        pause: true,
        hook: "Will the volcano work perfectly for the science fair?",
        microVariants: {
          text: "For their first project, {userName} decides to build a volcano that actually erupts. They carefully mix baking soda, vinegar, and {favoriteColor} food coloring while following the scientific method. {userName} measures each ingredient precisely and records everything in their science notebook like a real scientist.",
          alternatives: ["A erupting volcano becomes {userName}'s science fair project, complete with scientific measurements.", "{userName} creates a spectacular volcano with colorful lava, following proper scientific procedures."],
          optionalDetails: ["they shape the volcano like a real mountain", "the notebook has detailed drawings and observations"]
        }
      },
      {
        text: "The day of the science fair arrives, and {userName} feels nervous but excited. They set up their volcano display with colorful posters explaining the chemical reaction. When the judges arrive, {userName} demonstrates how the volcano erupts, explaining each step clearly and confidently.",
        pause: true,
        hook: "How will the judges react to {userName}'s presentation?",
        microVariants: {
          text: "The day of the science fair arrives, and {userName} feels nervous but excited. They set up their volcano display with colorful posters explaining the chemical reaction. When the judges arrive, {userName} demonstrates how the volcano erupts, explaining each step clearly and confidently.",
          alternatives: ["Science fair day brings excitement as {userName} presents their volcanic creation to impressed judges.", "With colorful displays ready, {userName} confidently explains their erupting volcano to curious visitors."],
          optionalDetails: ["the eruption creates a perfect foam flow", "other students gather to watch the demonstration"]
        }
      },
      {
        text: "The judges are impressed by {userName}'s knowledge and enthusiasm for science. They ask detailed questions about the chemical reaction, and {userName} answers with confidence. Other students stop by to see the amazing volcano and learn about the scientific process behind the colorful eruption.",
        pause: true,
        hook: "What recognition will {userName} receive for their hard work?",
        microVariants: {
          text: "The judges are impressed by {userName}'s knowledge and enthusiasm for science. They ask detailed questions about the chemical reaction, and {userName} answers with confidence. Other students stop by to see the amazing volcano and learn about the scientific process behind the colorful eruption.",
          alternatives: ["Impressed judges question {userName} about the science, and they answer like a true expert.", "The volcano display attracts crowds of curious students eager to learn from {userName}'s expertise."],
          optionalDetails: ["judges take photos of the impressive display", "younger students ask if they can join science club"]
        }
      },
      {
        text: "At the awards ceremony, {userName} wins second place in the chemistry category. They feel proud of their achievement and excited about future science projects. Mrs. Johnson congratulates them and suggests they join the advanced science program next year.",
        pause: true,
        hook: "How will this success inspire {userName}'s future scientific journey?",
        microVariants: {
          text: "At the awards ceremony, {userName} wins second place in the chemistry category. They feel proud of their achievement and excited about future science projects. Mrs. Johnson congratulates them and suggests they join the advanced science program next year.",
          alternatives: ["Second place in chemistry makes {userName} beam with pride and scientific ambition.", "The award ceremony celebrates {userName}'s scientific achievement and opens doors to advanced opportunities."],
          optionalDetails: ["the trophy has a small chemistry symbol", "parents take pictures of the proud moment"]
        }
      },
      {
        text: "Inspired by their success, {userName} starts a science club for younger students. They teach them simple experiments and share their love of discovery. Every week, {userName} helps other kids fall in love with science just like they did.",
        pause: true,
        hook: "What other scientific discoveries will {userName} make in the future?",
        microVariants: {
          text: "Inspired by their success, {userName} starts a science club for younger students. They teach them simple experiments and share their love of discovery. Every week, {userName} helps other kids fall in love with science just like they did.",
          alternatives: ["Success inspires {userName} to become a science teacher for younger students eager to learn.", "The science fair victory leads {userName} to share their passion by mentoring other young scientists."],
          optionalDetails: ["the club meets every Tuesday after school", "students call {userName} their favorite science teacher"]
        }
      },
      {
        text: "Years later, {userName} remembers that first volcano project as the moment they knew they wanted to be a scientist. They continue to experiment, learn, and share their discoveries with others, always remembering the excitement of that special science fair day.",
        pause: false,
        hook: "What amazing scientific career will {userName} pursue?",
        microVariants: {
          text: "Years later, {userName} remembers that first volcano project as the moment they knew they wanted to be a scientist. They continue to experiment, learn, and share their discoveries with others, always remembering the excitement of that special science fair day.",
          alternatives: ["The volcano project becomes the foundation of {userName}'s lifelong love affair with scientific discovery.", "Looking back, {userName} traces their scientific career to that magical moment when chemistry first captured their heart."],
          optionalDetails: ["they keep the trophy on their desk as inspiration", "the notebook becomes a treasured keepsake"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} becomes a famous chemist who discovers new ways to help people and protect the environment, always remembering their first volcano experiment.",
        microVariants: ["The judges' amazement grows into worldwide recognition for {userName}'s scientific contributions.", "{userName}'s discoveries help solve important problems, inspired by that first colorful eruption."]
      },
      {
        type: 'cozy',
        text: "{userName} becomes a beloved science teacher who inspires thousands of students with the same volcano experiment that started their own journey.",
        microVariants: ["Every year, {userName} helps new students discover the magic of science through hands-on experiments.", "The classroom becomes a place where scientific dreams begin, just like {userName}'s did."]
      }
    ],
    reuse: {
      swappableElements: {
        "volcano": ["rocket", "robot", "plant growth experiment", "weather station"],
        "science club": ["robotics club", "nature club", "math club", "invention club"],
        "Mrs. Johnson": ["Mr. Smith", "Ms. Garcia", "Dr. Kim", "Mrs. Brown"]
      },
      weatherVariants: ["during science week", "on a rainy afternoon", "after school", "during lunch break"],
      settingVariants: ["school lab", "classroom", "library", "science museum"]
    }
  },
  {
    title: "The Mystery of the Missing Library Books",
    theme: "Mystery & Problem-Solving",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} loves reading mystery books and spending time at the school library. Mrs. Chen, the librarian, notices that several popular books have mysteriously disappeared from the shelves. She asks {userName} to help solve this puzzling case because of their sharp detective skills.",
        pause: true,
        hook: "What clues will {userName} find to solve the library mystery?",
        microVariants: {
          text: "{userName} loves reading mystery books and spending time at the school library. Mrs. Chen, the librarian, notices that several popular books have mysteriously disappeared from the shelves. She asks {userName} to help solve this puzzling case because of their sharp detective skills.",
          alternatives: ["Detective {userName} receives their first real mystery case from the worried librarian.", "The school library needs {userName}'s help when books start vanishing without explanation."],
          optionalDetails: ["the missing books are all {favoriteColor} covered", "students keep asking for the disappeared books"]
        }
      },
      {
        text: "{userName} begins their investigation by interviewing students and teachers who use the library regularly. They create a detective notebook to track clues and discover that the missing books all have one thing in common. Every disappeared book was about animals, especially stories featuring {favoriteAnimal} characters.",
        pause: true,
        hook: "Why would someone take only animal books?",
        microVariants: {
          text: "{userName} begins their investigation by interviewing students and teachers who use the library regularly. They create a detective notebook to track clues and discover that the missing books all have one thing in common. Every disappeared book was about animals, especially stories featuring {favoriteAnimal} characters.",
          alternatives: ["Careful detective work reveals a pattern in the missing books that points to an animal-loving culprit.", "The investigation notebook fills with clues that all point toward someone who adores animal stories."],
          optionalDetails: ["interviews reveal nervous behavior from some students", "the pattern becomes clear after checking library records"]
        }
      },
      {
        text: "Following the clues, {userName} discovers a secret reading fort built under the library stairs. Inside, they find all the missing books and a shy first-grader named Tommy who was too embarrassed to check out books properly. Tommy explains he was afraid other kids would laugh at him for reading baby animal books.",
        pause: true,
        hook: "How will {userName} help Tommy feel comfortable about reading?",
        microVariants: {
          text: "Following the clues, {userName} discovers a secret reading fort built under the library stairs. Inside, they find all the missing books and a shy first-grader named Tommy who was too embarrassed to check out books properly. Tommy explains he was afraid other kids would laugh at him for reading baby animal books.",
          alternatives: ["The mystery leads to a cozy reading hideout where a scared young reader has been hiding with the books.", "Under the stairs, {userName} finds not a thief, but a lonely child who just wanted to read without judgment."],
          optionalDetails: ["the fort is decorated with drawings of animals", "Tommy has been sharing {favoriteFood} crackers with book characters"]
        }
      },
      {
        text: "Instead of getting Tommy in trouble, {userName} sits with him and shares their own love of animal stories. They explain that reading any book is wonderful and that being kind to animals shows a good heart. {userName} helps Tommy learn how to check out books properly and promises to read with him sometimes.",
        pause: true,
        hook: "What positive changes will come from {userName}'s kindness?",
        microVariants: {
          text: "Instead of getting Tommy in trouble, {userName} sits with him and shares their own love of animal stories. They explain that reading any book is wonderful and that being kind to animals shows a good heart. {userName} helps Tommy learn how to check out books properly and promises to read with him sometimes.",
          alternatives: ["Compassionate detective work turns into friendship as {userName} helps Tommy feel proud of his reading choices.", "The case closes with kindness as {userName} becomes Tommy's reading mentor and friend."],
          optionalDetails: ["they return the books together to Mrs. Chen", "Tommy's face lights up with relief and happiness"]
        }
      },
      {
        text: "Mrs. Chen is so impressed with {userName}'s detective skills and kindness that she creates a special \"Reading Buddies\" program. {userName} becomes the first Reading Buddy, helping younger students feel comfortable exploring the library and finding books they love. The program becomes very popular throughout the school.",
        pause: true,
        hook: "How will the Reading Buddies program grow and help other students?",
        microVariants: {
          text: "Mrs. Chen is so impressed with {userName}'s detective skills and kindness that she creates a special \"Reading Buddies\" program. {userName} becomes the first Reading Buddy, helping younger students feel comfortable exploring the library and finding books they love. The program becomes very popular throughout the school.",
          alternatives: ["The mystery solution inspires a school-wide program that pairs confident readers with shy beginners.", "Detective work transforms into mentorship as {userName} helps create a supportive reading community."],
          optionalDetails: ["older students volunteer to be Reading Buddies too", "the library becomes busier than ever before"]
        }
      },
      {
        text: "Tommy becomes one of the library's most enthusiastic readers, proudly checking out animal books and recommending them to friends. {userName} realizes that solving mysteries isn't just about finding missing things, but about understanding people and helping them feel valued and accepted.",
        pause: true,
        hook: "What other mysteries might {userName} solve with kindness and understanding?",
        microVariants: {
          text: "Tommy becomes one of the library's most enthusiastic readers, proudly checking out animal books and recommending them to friends. {userName} realizes that solving mysteries isn't just about finding missing things, but about understanding people and helping them feel valued and accepted.",
          alternatives: ["The shy reader becomes confident, teaching {userName} that the best mysteries involve helping hearts heal.", "Tommy's transformation shows {userName} that true detective work includes solving problems with compassion."],
          optionalDetails: ["Tommy starts a junior animal lovers book club", "he draws pictures of his favorite book characters"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} and Tommy become best reading friends, spending every lunch period discovering new animal adventures together in their favorite library corner.",
        microVariants: ["The library corner becomes their special place for sharing stories and snacks.", "Every day brings new books and deeper friendship between the detective and their first case."]
      },
      {
        type: 'triumphant',
        text: "{userName} solves many more school mysteries with kindness, eventually becoming the school's official Student Problem Solver, helping everyone feel included and understood.",
        microVariants: ["The Reading Buddy detective becomes legendary for solving problems with heart and wisdom.", "Other schools invite {userName} to help them create kindness-based problem-solving programs."]
      }
    ],
    reuse: {
      swappableElements: {
        "missing items": ["books", "supplies", "toys", "equipment"],
        "location": ["library", "classroom", "playground", "cafeteria"],
        "helper": ["librarian", "teacher", "principal", "counselor"]
      },
      weatherVariants: ["during library time", "after school", "during lunch break", "on a quiet afternoon"],
      settingVariants: ["school library", "public library", "classroom", "reading room"]
    }
  },
  {
    title: "The Community Garden Project",
    theme: "Animals & Nature",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} notices that their neighborhood has many empty lots filled with weeds and trash. During a family walk, they see how sad the area looks and wish there were more beautiful, green spaces where families could enjoy nature together. {userName} gets an idea to transform one of these lots into a community garden where everyone can grow vegetables and flowers.",
        pause: true,
        hook: "How will {userName} convince the community to support a garden project?",
        microVariants: {
          text: "{userName} notices that their neighborhood has many empty lots filled with weeds and trash. During a family walk, they see how sad the area looks and wish there were more beautiful, green spaces where families could enjoy nature together. {userName} gets an idea to transform one of these lots into a community garden where everyone can grow vegetables and flowers.",
          alternatives: ["Walking through the neighborhood, {userName} envisions transforming empty lots into thriving community gardens.", "The sight of neglected lots inspires {userName} to create something beautiful for their community."],
          optionalDetails: ["neighbors often complain about the ugly empty spaces", "children have nowhere safe to play outside"]
        }
      },
      {
        text: "{userName} presents their garden idea to the city council with a detailed plan and colorful drawings. They explain how the garden would provide fresh {favoriteFood} for families, create habitat for birds and butterflies, and give people a place to learn about plants and nature. The council members are impressed by {userName}'s research and enthusiasm for helping their community.",
        pause: true,
        hook: "What challenges will {userName} face while creating the garden?",
        microVariants: {
          text: "{userName} presents their garden idea to the city council with a detailed plan and colorful drawings. They explain how the garden would provide fresh {favoriteFood} for families, create habitat for birds and butterflies, and give people a place to learn about plants and nature. The council members are impressed by {userName}'s research and enthusiasm for helping their community.",
          alternatives: ["With detailed plans and passionate presentations, {userName} convinces city officials to support the garden project.", "The city council admires {userName}'s community vision and approves the transformative garden proposal."],
          optionalDetails: ["the presentation includes charts showing community benefits", "several neighbors attend to show support"]
        }
      },
      {
        text: "The city approves the project, and {userName} organizes volunteer days to clear the lot and prepare the soil. Families from the neighborhood bring tools, seeds, and enthusiasm to help build their shared garden space. {userName} learns about soil preparation, composting, and different types of plants while working alongside experienced gardeners from the community.",
        pause: true,
        hook: "What will grow in the community garden?",
        microVariants: {
          text: "The city approves the project, and {userName} organizes volunteer days to clear the lot and prepare the soil. Families from the neighborhood bring tools, seeds, and enthusiasm to help build their shared garden space. {userName} learns about soil preparation, composting, and different types of plants while working alongside experienced gardeners from the community.",
          alternatives: ["Community volunteer days transform the empty lot into fertile ground for the neighborhood garden.", "Working together, neighbors and {userName} create the foundation for a thriving community growing space."],
          optionalDetails: ["children enjoy pulling weeds and planting seeds", "an elderly neighbor teaches traditional gardening techniques"]
        }
      },
      {
        text: "Throughout the growing season, {userName} helps organize weekly garden parties where families tend their plots together. They create a special section for {favoriteColor} flowers that attract butterflies and bees, establishing a pollinator habitat that helps all the garden plants grow stronger. The garden becomes a place where neighbors meet, children learn, and the community feels more connected to nature and each other.",
        pause: true,
        hook: "How will the garden change the neighborhood?",
        microVariants: {
          text: "Throughout the growing season, {userName} helps organize weekly garden parties where families tend their plots together. They create a special section for {favoriteColor} flowers that attract butterflies and bees, establishing a pollinator habitat that helps all the garden plants grow stronger. The garden becomes a place where neighbors meet, children learn, and the community feels more connected to nature and each other.",
          alternatives: ["Weekly garden gatherings create lasting friendships while vegetables and flowers flourish together.", "The community garden becomes a vibrant hub where neighbors bond over shared growing experiences."],
          optionalDetails: ["harvest festivals celebrate the community's success", "recipe exchanges help families enjoy their fresh produce"]
        }
      },
      {
        text: "By the end of the season, the community garden has produced hundreds of pounds of fresh vegetables that families share with neighbors in need. {userName} realizes that the garden has grown more than just plants – it has cultivated friendships, taught valuable skills, and created a model for how communities can work together to improve their environment and quality of life.",
        pause: true,
        hook: "What other community improvements will {userName} inspire?",
        microVariants: {
          text: "By the end of the season, the community garden has produced hundreds of pounds of fresh vegetables that families share with neighbors in need. {userName} realizes that the garden has grown more than just plants – it has cultivated friendships, taught valuable skills, and created a model for how communities can work together to improve their environment and quality of life.",
          alternatives: ["The successful harvest demonstrates how community cooperation can create abundance for everyone.", "Beyond vegetables, the garden grows connections, knowledge, and hope for continued neighborhood improvement."],
          optionalDetails: ["local restaurants request garden produce for special dishes", "other neighborhoods ask for help starting their own gardens"]
        }
      },
      {
        text: "The community garden becomes so successful that other neighborhoods request {userName}'s help to start their own gardens. {userName} creates a guidebook with photos, tips, and step-by-step instructions for community garden development. Local schools invite them to speak about environmental stewardship and community organizing, inspiring other young people to take action in their own neighborhoods.",
        pause: true,
        hook: "How will {userName}'s environmental leadership continue to grow?",
        microVariants: {
          text: "The community garden becomes so successful that other neighborhoods request {userName}'s help to start their own gardens. {userName} creates a guidebook with photos, tips, and step-by-step instructions for community garden development. Local schools invite them to speak about environmental stewardship and community organizing, inspiring other young people to take action in their own neighborhoods.",
          alternatives: ["Success leads to citywide garden expansion as {userName} becomes a recognized community organizer.", "The garden project launches {userName}'s career in environmental education and community development."],
          optionalDetails: ["the guidebook is translated into multiple languages", "environmental organizations offer {userName} internship opportunities"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} establishes a city-wide network of community gardens and becomes the youngest recipient of the Mayor's Environmental Leadership Award.",
        microVariants: ["The garden network transforms neighborhoods throughout the city.", "{userName}'s environmental leadership inspires policy changes supporting urban agriculture."]
      },
      {
        type: 'cozy',
        text: "{userName} spends every summer tending the garden with neighbors, watching friendships bloom alongside the vegetables and flowers.",
        microVariants: ["The garden becomes a peaceful sanctuary where community connections flourish year after year.", "Every season brings new growth in both plants and neighborhood relationships."]
      }
    ],
    reuse: {
      swappableElements: {
        "garden type": ["vegetable garden", "flower garden", "herb garden", "butterfly garden"],
        "community space": ["empty lot", "unused park", "school yard", "church grounds"],
        "growing season": ["spring planting", "summer growth", "fall harvest", "winter planning"]
      },
      weatherVariants: ["during growing season", "on sunny planting days", "during harvest time", "throughout the seasons"],
      settingVariants: ["urban neighborhood", "suburban community", "school grounds", "apartment complex"]
    }
  },
  {
    title: "The School News Detective",
    theme: "Mystery & Problem-Solving",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} loves writing and decides to join the school newspaper as a junior reporter. Their first assignment is to investigate why the school's {favoriteColor} recycling bins keep disappearing from classrooms overnight. Other students have noticed the pattern too, but no one can figure out who is taking them or why they always reappear cleaned and empty the next morning.",
        pause: true,
        hook: "What clues will {userName} discover in their recycling bin mystery?",
        microVariants: {
          text: "{userName} loves writing and decides to join the school newspaper as a junior reporter. Their first assignment is to investigate why the school's {favoriteColor} recycling bins keep disappearing from classrooms overnight. Other students have noticed the pattern too, but no one can figure out who is taking them or why they always reappear cleaned and empty the next morning.",
          alternatives: ["Reporter {userName} takes on their first investigative assignment about mysterious disappearing recycling bins.", "The school newspaper assigns {userName} to solve the case of the vanishing and reappearing recycling containers."],
          optionalDetails: ["teachers are also puzzled by the overnight bin movements", "the custodial staff claims they don't move the bins"]
        }
      },
      {
        text: "{userName} interviews teachers, students, and school staff to gather information about the recycling bin mystery. They create a timeline of when the bins disappear and return, noting that it always happens on nights when {favoriteFood} is served in the cafeteria. Using their reporter notebook, {userName} maps out which classrooms are affected and discovers the disappearances follow a specific pattern through the school building.",
        pause: true,
        hook: "Where will {userName}'s investigation lead them next?",
        microVariants: {
          text: "{userName} interviews teachers, students, and school staff to gather information about the recycling bin mystery. They create a timeline of when the bins disappear and return, noting that it always happens on nights when {favoriteFood} is served in the cafeteria. Using their reporter notebook, {userName} maps out which classrooms are affected and discovers the disappearances follow a specific pattern through the school building.",
          alternatives: ["Careful detective work reveals patterns connecting cafeteria menus to recycling bin disappearances.", "The investigation uncovers timing clues that link food service days to the mysterious bin movements."],
          optionalDetails: ["security cameras don't show anyone entering the classrooms", "the pattern suggests someone with building access after hours"]
        }
      },
      {
        text: "Following their investigation clues, {userName} decides to stay after school with permission to observe what happens during the mysterious bin disappearances. Hidden in the library with a clear view of the hallway, they watch as Mr. Rodriguez, the night custodian, carefully collects the recycling bins. But instead of just emptying them, he sorts through everything, cleaning containers and organizing materials for an elaborate recycling project.",
        pause: true,
        hook: "What is Mr. Rodriguez really doing with all the recycled materials?",
        microVariants: {
          text: "Following their investigation clues, {userName} decides to stay after school with permission to observe what happens during the mysterious bin disappearances. Hidden in the library with a clear view of the hallway, they watch as Mr. Rodriguez, the night custodian, carefully collects the recycling bins. But instead of just emptying them, he sorts through everything, cleaning containers and organizing materials for an elaborate recycling project.",
          alternatives: ["After-hours observation reveals the custodian's secret recycling activities in the school basement.", "The mystery leads to Mr. Rodriguez's hidden environmental project using the school's recyclable materials."],
          optionalDetails: ["he works carefully and quietly, respecting the sleeping school", "his sorting system is incredibly organized and methodical"]
        }
      },
      {
        text: "{userName} follows Mr. Rodriguez to the school basement and discovers an amazing art studio where he creates beautiful sculptures and useful items from recycled materials. The walls are covered with stunning artwork made from plastic bottles, aluminum cans, and cardboard – all materials he's collected from the school's recycling. Mr. Rodriguez explains that he's been secretly creating these pieces to donate to local community centers and hospitals to bring joy to people who need it most.",
        pause: true,
        hook: "How will {userName} share this inspiring story with the school?",
        microVariants: {
          text: "{userName} follows Mr. Rodriguez to the school basement and discovers an amazing art studio where he creates beautiful sculptures and useful items from recycled materials. The walls are covered with stunning artwork made from plastic bottles, aluminum cans, and cardboard – all materials he's collected from the school's recycling. Mr. Rodriguez explains that he's been secretly creating these pieces to donate to local community centers and hospitals to bring joy to people who need it most.",
          alternatives: ["The basement reveals a secret art studio where recycled trash becomes beautiful community gifts.", "Mr. Rodriguez transforms the school's waste into artwork that brings happiness to those in need."],
          optionalDetails: ["children's hospital displays feature his colorful mobile sculptures", "community centers use his benches and planters"]
        }
      },
      {
        text: "{userName} writes a front-page newspaper article about Mr. Rodriguez's inspiring recycling art project, featuring photos of his beautiful creations and explaining how he turns waste into gifts of joy. The story reveals how one person's creativity and generosity can make a huge difference in the community while helping the environment. The article makes Mr. Rodriguez famous throughout the school and leads to official support for his art program.",
        pause: true,
        hook: "What positive changes will result from {userName}'s investigative reporting?",
        microVariants: {
          text: "{userName} writes a front-page newspaper article about Mr. Rodriguez's inspiring recycling art project, featuring photos of his beautiful creations and explaining how he turns waste into gifts of joy. The story reveals how one person's creativity and generosity can make a huge difference in the community while helping the environment. The article makes Mr. Rodriguez famous throughout the school and leads to official support for his art program.",
          alternatives: ["The newspaper story transforms Mr. Rodriguez from mysterious custodian to celebrated school artist.", "Investigative reporting reveals an inspiring story of environmental art and community service."],
          optionalDetails: ["the principal creates an official art space for the recycling projects", "students volunteer to help with the community art donations"]
        }
      },
      {
        text: "Thanks to {userName}'s reporting, the school creates an official \"Art from Recycling\" program where students can work with Mr. Rodriguez to create beautiful items for community donation. {userName} continues writing for the school newspaper, discovering that the best stories often come from paying attention to everyday mysteries and celebrating the hidden heroes in their community who make positive differences every day.",
        pause: true,
        hook: "What other inspiring stories will {userName} uncover through their journalism?",
        microVariants: {
          text: "Thanks to {userName}'s reporting, the school creates an official \"Art from Recycling\" program where students can work with Mr. Rodriguez to create beautiful items for community donation. {userName} continues writing for the school newspaper, discovering that the best stories often come from paying attention to everyday mysteries and celebrating the hidden heroes in their community who make positive differences every day.",
          alternatives: ["The investigation transforms into a school-wide program celebrating creativity and environmental responsibility.", "Journalism becomes {userName}'s tool for discovering and sharing stories of community heroes and positive change."],
          optionalDetails: ["the program wins environmental awards for the school", "other schools adopt similar recycling art initiatives"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} becomes the editor of the school newspaper and establishes an investigative journalism program that uncovers positive community stories and inspiring acts of service.",
        microVariants: ["The newspaper becomes famous for celebrating unsung heroes and environmental initiatives.", "{userName}'s investigative skills lead to citywide recognition for community journalism."]
      },
      {
        type: 'cozy',
        text: "{userName} and Mr. Rodriguez become great friends, spending time creating recycled art together and sharing stories about the power of turning problems into beautiful solutions.",
        microVariants: ["The friendship grows as they work together on community art projects every week.", "Their collaboration becomes a model for intergenerational partnerships in environmental action."]
      }
    ],
    reuse: {
      swappableElements: {
        "mystery item": ["recycling bins", "art supplies", "books", "plants", "equipment"],
        "school staff": ["custodian", "librarian", "teacher", "secretary", "volunteer"],
        "hidden project": ["art creation", "garden maintenance", "book repair", "equipment restoration"]
      },
      weatherVariants: ["during school year", "after lunch periods", "on quiet afternoons", "during evening hours"],
      settingVariants: ["elementary school", "middle school", "community school", "arts-focused school"]
    }
  },
  {
    title: "The Friendship Bridge Builder",
    theme: "Friendship & Teamwork",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} notices that their school playground is divided into different groups that don't usually play together. The third-graders stick to the swings, the fourth-graders dominate the basketball court, and the fifth-graders claim the picnic tables for their {favoriteFood} trading sessions. {userName} wishes everyone could be friends and have fun together, but the invisible barriers between grade levels seem too strong to break.",
        pause: true,
        hook: "How will {userName} bring all the different groups together?",
        microVariants: {
          text: "{userName} notices that their school playground is divided into different groups that don't usually play together. The third-graders stick to the swings, the fourth-graders dominate the basketball court, and the fifth-graders claim the picnic tables for their {favoriteFood} trading sessions. {userName} wishes everyone could be friends and have fun together, but the invisible barriers between grade levels seem too strong to break.",
          alternatives: ["The playground's invisible boundaries frustrate {userName}, who dreams of creating unity among separated student groups.", "Observing playground divisions, {userName} envisions breaking down barriers to create inclusive friendships across grade levels."],
          optionalDetails: ["arguments often break out over playground equipment", "younger students feel intimidated by older groups"]
        }
      },
      {
        text: "{userName} gets a brilliant idea to organize a \"Friendship Olympics\" where mixed-age teams compete in fun, cooperative games rather than competitive sports. They propose activities like three-legged races with partners from different grades, collaborative art projects, and team challenges that require everyone's unique skills to succeed. {userName} presents this idea to the playground supervisors and gets permission to organize the special event.",
        pause: true,
        hook: "Will the different grade groups agree to participate in the Friendship Olympics?",
        microVariants: {
          text: "{userName} gets a brilliant idea to organize a \"Friendship Olympics\" where mixed-age teams compete in fun, cooperative games rather than competitive sports. They propose activities like three-legged races with partners from different grades, collaborative art projects, and team challenges that require everyone's unique skills to succeed. {userName} presents this idea to the playground supervisors and gets permission to organize the special event.",
          alternatives: ["The Friendship Olympics concept promotes cooperation over competition, mixing age groups in supportive team activities.", "Creative event planning transforms playground rivalry into collaborative friendship-building opportunities."],
          optionalDetails: ["teachers volunteer to help organize the special games", "the principal promises prizes for all participants"]
        }
      },
      {
        text: "At first, some students are hesitant to join mixed-age teams, but {userName} enthusiastically demonstrates how much fun the cooperative games can be. They organize teams with names like \"The {favoriteColor} Helpers\" and \"The Kindness Crew,\" making sure every team has students from different grades who can learn from each other. The games focus on problem-solving, creativity, and helping teammates succeed rather than winning against opponents.",
        pause: true,
        hook: "What amazing teamwork will emerge during the Friendship Olympics?",
        microVariants: {
          text: "At first, some students are hesitant to join mixed-age teams, but {userName} enthusiastically demonstrates how much fun the cooperative games can be. They organize teams with names like \"The {favoriteColor} Helpers\" and \"The Kindness Crew,\" making sure every team has students from different grades who can learn from each other. The games focus on problem-solving, creativity, and helping teammates succeed rather than winning against opponents.",
          alternatives: ["Initial hesitation melts away as students discover the joy of intergenerational cooperation and mutual support.", "Team formation breaks down age barriers as students focus on collaboration and shared problem-solving."],
          optionalDetails: ["older students naturally become mentors for younger teammates", "creative team names reflect values of friendship and cooperation"]
        }
      },
      {
        text: "The Friendship Olympics becomes the most popular playground event in school history, with students cheering for all teams and celebrating everyone's contributions. {userName} watches with joy as fifth-graders patiently teach third-graders new skills, fourth-graders include everyone in their games, and friendships form across grade levels. The event demonstrates that when people focus on having fun together instead of competing against each other, everyone wins.",
        pause: true,
        hook: "How will these new friendships change the playground forever?",
        microVariants: {
          text: "The Friendship Olympics becomes the most popular playground event in school history, with students cheering for all teams and celebrating everyone's contributions. {userName} watches with joy as fifth-graders patiently teach third-graders new skills, fourth-graders include everyone in their games, and friendships form across grade levels. The event demonstrates that when people focus on having fun together instead of competing against each other, everyone wins.",
          alternatives: ["The Olympics celebration creates lasting bonds as students discover the joy of inclusive, supportive play.", "Cross-grade friendships flourish as the event proves that cooperation creates more fun than competition."],
          optionalDetails: ["parents volunteer to help with future friendship events", "teachers report improved classroom cooperation too"]
        }
      },
      {
        text: "After the successful Olympics, the playground transforms into an inclusive community where age groups naturally mix and play together. {userName} establishes a \"Friendship Council\" with representatives from each grade who work together to plan future activities and solve playground conflicts peacefully. The council meets weekly to ensure everyone feels included and to develop new ways to celebrate the diversity and talents of all students.",
        pause: true,
        hook: "What other positive changes will the Friendship Council create?",
        microVariants: {
          text: "After the successful Olympics, the playground transforms into an inclusive community where age groups naturally mix and play together. {userName} establishes a \"Friendship Council\" with representatives from each grade who work together to plan future activities and solve playground conflicts peacefully. The council meets weekly to ensure everyone feels included and to develop new ways to celebrate the diversity and talents of all students.",
          alternatives: ["The Olympics success leads to permanent playground transformation through democratic student leadership structures.", "Friendship Council governance ensures lasting inclusivity and peaceful conflict resolution among all students."],
          optionalDetails: ["conflict resolution strategies become a model for other schools", "student leadership skills develop through council participation"]
        }
      },
      {
        text: "The Friendship Olympics idea spreads to other schools in the district, with {userName} invited to help organize similar events and share strategies for building inclusive school communities. {userName} learns that creating positive change often starts with one person willing to imagine a better world and take action to make it real. Their initiative demonstrates that young people can be powerful agents of social change in their communities.",
        pause: true,
        hook: "How will {userName}'s friendship-building skills impact their future leadership?",
        microVariants: {
          text: "The Friendship Olympics idea spreads to other schools in the district, with {userName} invited to help organize similar events and share strategies for building inclusive school communities. {userName} learns that creating positive change often starts with one person willing to imagine a better world and take action to make it real. Their initiative demonstrates that young people can be powerful agents of social change in their communities.",
          alternatives: ["District-wide adoption proves that youth leadership can create systemic change in educational communities.", "The friendship model becomes a template for inclusive community building in schools everywhere."],
          optionalDetails: ["education conferences feature {userName}'s friendship-building strategies", "other youth organizers seek mentorship from {userName}"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} receives the State Youth Leadership Award for creating innovative approaches to building inclusive communities and preventing bullying through friendship-building programs.",
        microVariants: ["The award recognizes {userName}'s systematic approach to creating positive school culture change.", "Youth leadership success opens doors to educational policy influence and community organizing opportunities."]
      },
      {
        type: 'cozy',
        text: "{userName} continues organizing friendship events throughout their school years, watching as playground cooperation becomes a natural part of the school's culture and identity.",
        microVariants: ["Every recess brings joy as students from all grades play together in harmonious friendship.", "The inclusive playground becomes a lasting legacy of {userName}'s vision for community building."]
      }
    ],
    reuse: {
      swappableElements: {
        "social groups": ["grade levels", "sports teams", "club members", "neighborhood kids"],
        "activities": ["Olympics", "festivals", "talent shows", "cooperative games"],
        "meeting space": ["playground", "gymnasium", "cafeteria", "library"]
      },
      weatherVariants: ["during recess time", "at lunch periods", "during school events", "on beautiful days"],
      settingVariants: ["elementary school", "community center", "summer camp", "after-school program"]
    }
  }
];

export function getLevel2Template(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_2_TEMPLATES.length) {
    return LEVEL_2_TEMPLATES[templateIndex];
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_2_TEMPLATES.length);
  return LEVEL_2_TEMPLATES[randomIndex];
}

export function getLevel2TemplateCount(): number {
  return LEVEL_2_TEMPLATES.length;
}