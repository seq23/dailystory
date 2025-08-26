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
  }
];