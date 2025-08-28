// Level 2 Template: Science Discovery
export const template = {
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
};