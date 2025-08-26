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