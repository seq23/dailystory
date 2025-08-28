// Grade 7 Template: Cultural Heritage Research Project
export const template = {
  title: "The Cultural Heritage Research Project",
  theme: "Identity & Cultural Understanding",
  level: "Grade 7",
  scenes: [
    {
      text: "{userName} stared at the family assignment sheet with a mix of curiosity and uncertainty - create a presentation about their cultural heritage and family immigration story. While some classmates immediately knew which countries to research and which traditions to highlight, {userName} realized their family history was more complicated, involving multiple generations, adopted relatives, and cultural influences that didn't fit neatly into the assignment's apparent expectations of a single, clear heritage narrative.",
      pause: true,
      hook: "How will {userName} navigate the complexity of modern family identity?",
      microVariants: {
        text: "{userName} faced a challenging assignment about cultural heritage that revealed the complex nature of their modern, multi-faceted family identity and the assumptions embedded in traditional heritage projects.",
        alternatives: [
          "The cultural heritage project assignment made {userName} confront questions about identity, belonging, and the diverse ways that families and cultures intersect in contemporary society."
        ],
        optionalDetails: ["Some students excitedly discussed obvious heritage connections.", "The assignment guidelines seemed to assume simpler family narratives.", "Questions about identity felt suddenly more complex than expected."]
      }
    },
    {
      text: "Through interviews with family members, {userName} discovered that their grandmother had been adopted as a child, their grandfather's family included multiple ethnic backgrounds, and their parents had consciously created new family traditions that blended influences from their travels, friendships, and personal values rather than following any single cultural template - leading {userName} to realize that heritage isn't just about ancestry, but about the meaningful traditions and values that families actively choose to embrace and pass forward.",
      pause: true,
      hook: "What unique family story will {userName} share with their classmates?",
      microVariants: {
        text: "Family interviews revealed that {userName}'s heritage included adoption, multiple ethnicities, and consciously created traditions, teaching them that cultural identity involves both inherited and chosen elements.",
        alternatives: [
          "Research into their family history helped {userName} understand that modern heritage encompasses both traditional ancestry and the new customs that families deliberately create and maintain."
        ],
        optionalDetails: ["Old photo albums told stories of diverse family members.", "Grandparents shared memories of adapting to new places and customs.", "Parents explained how they'd intentionally built inclusive family traditions."]
      }
    }
  ],
  endings: [
    {
      type: 'reflective',
      text: "Standing before their classmates with a presentation that celebrated their family's unique blend of adopted members, multiple ethnic influences, and consciously created traditions, {userName} felt a deep sense of pride in their complex heritage story. 'I learned that families don't have to fit traditional patterns to be meaningful,' they concluded thoughtfully. 'Our heritage includes both what we inherit and what we choose to create, and both parts are equally valid and important in shaping who we become.'",
      microVariants: [
        "Presenting their complex family heritage story, {userName} gained confidence in the validity of non-traditional family narratives and the beauty of consciously created cultural traditions."
      ]
    },
    {
      type: 'triumphant',
      text: "The presentation sparked meaningful discussions throughout the school about different types of families and heritage stories, leading {userName} and several classmates to propose a 'Modern Families' club where students could explore and celebrate the diverse ways that contemporary families create identity, belonging, and cultural meaning beyond traditional ancestry-based definitions.",
      microVariants: [
        "{userName}'s presentation inspired schoolwide conversations about family diversity and led to the creation of a club celebrating various forms of modern family identity and belonging."
      ]
    }
  ],
  reuse: {
    swappableElements: {
      "family_types": ["blended families", "adoptive families", "multi-ethnic families", "families of choice"],
      "traditions": ["holiday celebrations", "food customs", "storytelling practices", "value systems"],
      "heritage_elements": ["ancestral connections", "chosen traditions", "community influences", "personal values"]
    },
    weatherVariants: ["research phase", "interview sessions", "presentation day"],
    settingVariants: ["classroom", "family home", "community center", "school library"]
  }
};