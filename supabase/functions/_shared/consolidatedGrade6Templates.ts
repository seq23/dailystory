// Grade 6 Templates (Ages 11-12) - Scientific Discovery & Innovation
export const CONSOLIDATED_GRADE_6_TEMPLATES = [
  {
    title: "The Biosphere Project",
    theme: "Scientific Discovery & Innovation",
    level: "Grade 6",
    scenes: [
      {
        text: "{userName} couldn't contain their excitement as they entered the state-of-the-art environmental science laboratory at Jefferson Middle School, where Dr. Martinez had just announced the most ambitious student research project in the school's history: creating a fully functional closed-ecosystem biosphere that could potentially serve as a model for sustainable living in extreme environments like Mars colonies or underwater research stations.",
        pause: true,
        hook: "What challenges will {userName} face in creating a self-sustaining ecosystem?",
        microVariants: {
          text: "{userName} couldn't contain their excitement as they entered the state-of-the-art environmental science laboratory at Jefferson Middle School, where Dr. Martinez had just announced the most ambitious student research project in the school's history.",
          alternatives: [
            "{userName} felt their pulse quicken with anticipation as they stepped into the advanced environmental science facility, where Dr. Martinez had just revealed an unprecedented student research initiative."
          ],
          optionalDetails: ["The laboratory buzzed with cutting-edge equipment and monitoring systems.", "Students whispered excitedly about the project's potential implications.", "Dr. Martinez's eyes sparkled with the passion of a true scientist-educator."]
        }
      },
      {
        text: "As {userName} began researching the complex interdependent relationships within ecosystems, they discovered that creating a balanced biosphere required understanding photosynthesis, nitrogen cycles, water filtration, waste decomposition, and the delicate symbiotic relationships between plants, microorganisms, and small animals - all while maintaining proper temperature, humidity, and atmospheric composition within their sealed transparent dome.",
        pause: true,
        hook: "How will {userName} balance all these interconnected systems?",
        microVariants: {
          text: "As {userName} began researching the complex interdependent relationships within ecosystems, they discovered that creating a balanced biosphere required understanding multiple scientific processes and delicate symbiotic relationships.",
          alternatives: [
            "Through their initial research phase, {userName} realized that successful biosphere creation demanded comprehensive knowledge of ecological processes and careful balance of environmental factors."
          ],
          optionalDetails: ["Charts and diagrams covered the laboratory walls.", "Computer simulations showed various ecosystem models.", "The complexity was both daunting and thrilling."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Six months later, {userName} stood proudly before the regional science fair judges, presenting their thriving biosphere - a perfect miniature world where plants grew lush and green, beneficial bacteria processed waste efficiently, and the entire system maintained itself in beautiful equilibrium. Their project not only earned first place but also attracted attention from environmental scientists who praised their innovative approaches to sustainability and their potential contributions to future space exploration and environmental conservation efforts.",
        microVariants: [
          "At the regional science fair, {userName} presented their successful biosphere project, earning recognition for their innovative contributions to environmental science and space exploration research."
        ]
      },
      {
        type: 'reflective',
        text: "Looking through the clear walls of their functioning biosphere, {userName} experienced a profound moment of understanding about the interconnectedness of all life on Earth. 'Every single organism plays a crucial role,' they realized with deep appreciation. 'From the tiniest bacteria to the largest plants, everything depends on everything else. If we can create sustainable miniature worlds, maybe we can better protect our own planet too.'",
        microVariants: [
          "Observing their thriving biosphere, {userName} gained deep insight into Earth's interconnected systems and the importance of environmental stewardship for planetary health."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "ecosystems": ["rainforest biosphere", "desert ecosystem", "aquatic habitat", "grassland environment"],
        "organisms": ["beneficial bacteria", "nitrogen-fixing plants", "decomposer fungi", "pollinator insects"],
        "processes": ["photosynthesis", "nitrogen cycling", "water filtration", "waste decomposition"]
      },
      weatherVariants: ["controlled laboratory conditions", "optimal growth environment", "stable climate simulation"],
      settingVariants: ["environmental lab", "research facility", "science classroom", "innovation center"]
    }
  },
  {
    title: "The Coding for Change Initiative",
    theme: "Technology & Social Impact",
    level: "Grade 6",
    scenes: [
      {
        text: "{userName} had always enjoyed playing video games and using apps, but it wasn't until they joined the after-school coding club that they realized technology could be a powerful tool for solving real-world problems in their community, especially after learning about their elderly neighbor Mrs. Chen who struggled with grocery shopping and keeping track of her medications since her children lived far away.",
        pause: true,
        hook: "What kind of technological solution can {userName} create to help Mrs. Chen?",
        microVariants: {
          text: "{userName} had always enjoyed technology, but joining the coding club opened their eyes to using programming for community problem-solving, particularly after meeting their elderly neighbor Mrs. Chen who faced daily challenges.",
          alternatives: [
            "Through the after-school coding club, {userName} discovered that programming skills could address real community needs, especially after learning about elderly neighbors facing daily challenges."
          ],
          optionalDetails: ["The coding club met in the school's computer lab every Tuesday.", "Students worked on various community-focused projects.", "Mrs. Chen often waved from her garden when {userName} walked by."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Three months later, {userName} sat in Mrs. Chen's kitchen, sharing tea and homemade cookies while helping her test the final version of the 'Community Care App' they had developed together. The app connected Mrs. Chen with neighborhood volunteers for grocery runs and sent gentle medication reminders to her phone. 'You've given me such independence and peace of mind,' Mrs. Chen said warmly, patting {userName}'s hand. 'Technology isn't scary when it comes from the heart of someone who cares.'",
        microVariants: [
          "Sharing tea with Mrs. Chen, {userName} felt the deep satisfaction of using technology to create meaningful connections and provide practical help for community members in need."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "technologies": ["mobile apps", "websites", "databases", "automated systems"],
        "community_needs": ["elderly assistance", "environmental monitoring", "educational support", "accessibility tools"],
        "programming_languages": ["Scratch", "Python", "JavaScript", "HTML/CSS"]
      },
      weatherVariants: ["after-school sessions", "weekend hackathons", "community meetings"],
      settingVariants: ["computer lab", "community center", "neighbor's home", "coding club"]
    }
  },
  {
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
  }
];