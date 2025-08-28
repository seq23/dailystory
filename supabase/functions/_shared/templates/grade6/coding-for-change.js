// Grade 6 Template: Coding for Change Initiative
export const template = {
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
};