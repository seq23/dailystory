// Grade 6 Template: Urban Farming Innovation Lab
export const template = {
  title: "The Urban Farming Innovation Lab",
  theme: "Sustainable Agriculture & Food Security",
  level: "Grade 6",
  scenes: [
    {
      text: "{userName} had always wondered why their neighborhood had three fast-food restaurants but no grocery store with fresh vegetables, until they joined the school's environmental club and learned about food deserts - urban areas where residents lack access to affordable, nutritious whole foods. When they discovered that their own zip code was classified as a food desert, affecting thousands of families including many of their classmates, {userName} decided to research innovative solutions that could bring healthy food production directly into urban communities.",
      pause: true,
      hook: "What creative farming solutions can {userName} develop for urban environments?",
      microVariants: {
        text: "{userName} discovered their neighborhood was a food desert lacking access to fresh produce, inspiring them to research urban farming solutions for healthy food accessibility.",
        alternatives: [
          "Learning about food deserts in their own community, {userName} became motivated to explore innovative methods for growing fresh food in urban settings."
        ],
        optionalDetails: ["The nearest full grocery store was over two miles away.", "Many families relied on corner stores for food.", "School lunch programs provided the only fresh vegetables for some students."]
      }
    },
    {
      text: "Working with the school's science department and local urban agriculture experts, {userName} designed an experimental rooftop garden system using hydroponic towers, recycled materials, and solar-powered growing equipment. Their research showed that a single rooftop could produce enough fresh vegetables to supply a small neighborhood year-round. They tested different growing mediums, lighting systems, and water conservation methods, documenting which approaches produced the most nutritious food with the least environmental impact.",
      pause: true,
      hook: "How successful will {userName}'s rooftop farming experiments prove to be?",
      microVariants: {
        text: "{userName} designed experimental rooftop gardens using hydroponics and solar power, testing which methods could produce the most nutritious food sustainably.",
        alternatives: [
          "Through collaboration with urban agriculture experts, {userName} developed innovative rooftop farming systems to maximize food production in limited urban spaces."
        ],
        optionalDetails: ["The hydroponic towers used 90% less water than traditional farming.", "Solar panels powered LED growing lights during winter months.", "Recycled plastic bottles became plant containers."]
      }
    },
    {
      text: "The pilot rooftop garden exceeded all expectations, producing over 200 pounds of fresh vegetables in its first season while serving as an outdoor classroom where younger students learned about nutrition, environmental science, and sustainable technology. Local media covered the project, and city officials visited to discuss scaling the program to other schools and community buildings. {userName} created a detailed manual showing exactly how other communities could replicate their success, including cost breakdowns, maintenance schedules, and educational curriculum ideas.",
      pause: true,
      hook: "What impact will {userName}'s urban farming model have beyond their school?",
      microVariants: {
        text: "The rooftop garden produced 200+ pounds of vegetables while serving as an educational space, attracting media attention and inspiring replication efforts.",
        alternatives: [
          "{userName}'s successful urban farm became both a food source and learning laboratory, drawing interest from city officials and other communities."
        ],
        optionalDetails: ["Students took vegetables home to their families.", "The garden attracted beneficial insects and birds.", "Cooking classes used the fresh produce in healthy meals."]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "Two years later, {userName}'s urban farming model had been adopted by fifteen schools across the city, creating a network of community food production sites that collectively provided fresh produce to over 3,000 families. Their innovative approach earned recognition from the National Science Foundation and led to policy changes that made rooftop farming eligible for city development grants, ensuring that future urban planning would include food security considerations.",
      microVariants: [
        "{userName}'s urban farming network expanded to fifteen schools, providing fresh food to thousands of families and influencing city policy on sustainable development."
      ]
    },
    {
      type: 'reflective',
      text: "Standing among the thriving plants on their original rooftop garden, {userName} reflected on how food justice connected to environmental sustainability, community health, and educational equity all at once. 'Growing food in cities isn't just about agriculture,' they realized with deep satisfaction. 'It's about growing communities, growing knowledge, and growing hope that we can solve complex problems by working together and thinking creatively about the spaces around us.'",
      microVariants: [
        "Surrounded by the flourishing rooftop garden, {userName} appreciated how urban farming addressed multiple community needs while demonstrating the power of creative problem-solving."
      ]
    }
  ],
  reuse: {
    swappableElements: {
      "urban_challenges": ["food deserts", "air quality", "green space access", "community health"],
      "farming_methods": ["hydroponics", "vertical farming", "aquaponics", "container gardening"],
      "sustainable_tech": ["solar power", "rainwater collection", "composting systems", "LED grow lights"]
    },
    weatherVariants: ["growing season", "winter greenhouse", "spring planting", "harvest celebration"],
    settingVariants: ["school rooftop", "community center", "apartment building", "urban lot"]
  }
};