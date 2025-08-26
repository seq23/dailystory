// Grade 7 Templates (Ages 12-13) - Identity & Social Awareness
export const CONSOLIDATED_GRADE_7_TEMPLATES = [
  {
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
  },
  {
    title: "The Digital Citizenship Dilemma",
    theme: "Ethics & Technology",
    level: "Grade 7",
    scenes: [
      {
        text: "{userName} witnessed something troubling during lunch when a group of students used social media to spread a false rumor about a classmate, watching as the story grew more exaggerated with each share and seeing how quickly online drama could impact someone's real-life friendships and emotional well-being, forcing {userName} to grapple with questions about bystander responsibility, digital ethics, and the power that young people wield when they participate in or stay silent about online behavior.",
        pause: true,
        hook: "What action will {userName} take regarding the harmful social media situation?",
        microVariants: {
          text: "{userName} witnessed harmful social media behavior targeting a classmate, confronting difficult questions about digital responsibility and the real-world impact of online actions.",
          alternatives: [
            "Observing how false rumors spread rapidly through social media and damaged a peer's reputation, {userName} faced challenging decisions about intervention and digital citizenship."
          ],
          optionalDetails: ["The rumors seemed to multiply exponentially online.", "The targeted student appeared increasingly isolated at school.", "Friends were choosing sides based on incomplete information."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "By courageously speaking up and helping to organize a school-wide digital citizenship workshop, {userName} not only helped clear their classmate's reputation but also sparked important conversations about online responsibility that led to new school policies supporting both digital wellness and restorative justice approaches to technology-related conflicts.",
        microVariants: [
          "{userName}'s intervention in the digital bullying situation led to positive school policy changes and enhanced awareness about responsible technology use among students."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "digital_platforms": ["social media apps", "messaging groups", "online forums", "video platforms"],
        "ethical_dilemmas": ["cyberbullying intervention", "false information sharing", "privacy violations", "digital harassment"],
        "solutions": ["peer mediation", "adult intervention", "education programs", "policy changes"]
      },
      weatherVariants: ["lunch period", "after school", "weekend online activity"],
      settingVariants: ["school cafeteria", "computer lab", "guidance counselor office", "peer mediation room"]
    }
  },
  {
    title: "The Mental Health Awareness Campaign",
    theme: "Peer Support & Emotional Wellness",
    level: "Grade 7",
    scenes: [
      {
        text: "{userName} noticed that several classmates had become increasingly withdrawn and anxious during the school year, but when they tried to talk to friends about mental health, they realized that most students lacked the vocabulary and knowledge to discuss emotional wellness openly. After learning that suicide rates among teenagers had increased dramatically and that many young people felt isolated in their struggles, {userName} decided to research how schools could better support student mental health through peer education and destigmatization efforts.",
        pause: true,
        hook: "How can {userName} create effective mental health support among their peers?",
        microVariants: {
          text: "{userName} observed classmates struggling with mental health but lacking tools for open discussion, inspiring research into peer-based emotional wellness support systems.",
          alternatives: [
            "Recognizing emotional struggles among peers and inadequate mental health discourse, {userName} began developing student-centered wellness education approaches."
          ],
          optionalDetails: ["Guidance counselors had long waiting lists for appointments.", "Students often masked their feelings with humor or silence.", "Social media amplified both connection and comparison pressures."]
        }
      },
      {
        text: "Collaborating with school counselors and researching evidence-based mental health programs, {userName} developed a peer support network called 'Circle of Care' where trained student volunteers could provide initial emotional support and connect classmates with appropriate professional resources. They learned about active listening techniques, crisis recognition signs, and the importance of maintaining appropriate boundaries while helping friends. The program emphasized that peer supporters were not therapists, but rather bridges to professional help when needed.",
        pause: true,
        hook: "What challenges will arise as {userName} implements peer mental health support?",
        microVariants: {
          text: "{userName} created 'Circle of Care,' training student volunteers in active listening and crisis recognition to provide peer support and connect classmates with professional help.",
          alternatives: [
            "The peer support network taught students supportive communication skills while establishing clear boundaries and referral protocols for serious mental health concerns."
          ],
          optionalDetails: ["Training included role-playing difficult conversations.", "Students learned to recognize signs of depression and anxiety.", "Clear protocols existed for involving adults when necessary."]
        }
      },
      {
        text: "The Circle of Care program launched with monthly mental health awareness assemblies where students shared personal stories, professionals provided education about common mental health conditions, and the school community learned practical strategies for supporting emotional wellness. {userName} organized stress-reduction workshops during exam periods, created quiet spaces for students who felt overwhelmed, and established anonymous suggestion systems where students could request help without fear of judgment or social stigma.",
        pause: true,
        hook: "How will the school community respond to increased mental health openness?",
        microVariants: {
          text: "Monthly assemblies featured student stories and professional education, while {userName} organized stress-reduction workshops and created safe spaces for emotional support.",
          alternatives: [
            "The program combined personal storytelling with expert education, offering practical wellness strategies and judgment-free support systems for struggling students."
          ],
          optionalDetails: ["Student participation in assemblies was voluntary but enthusiastic.", "Teachers received training on recognizing student distress.", "Parents attended evening sessions about supporting teen mental health."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Six months later, {userName} sat in the newly designated 'Wellness Corner' of the library, surrounded by comfortable chairs and soft lighting, watching as students naturally gravitated toward this peaceful space during stressful moments. The gentle hum of quiet conversation and the sight of peers supporting each other created an atmosphere of healing and hope. 'Sometimes the most powerful medicine is simply knowing you're not alone,' {userName} reflected as they witnessed authentic friendships forming through shared vulnerability.",
        microVariants: [
          "In the peaceful Wellness Corner, {userName} found satisfaction watching peers support each other, realizing that connection and understanding were powerful healing forces."
        ]
      },
      {
        type: 'triumphant',
        text: "The Circle of Care program expanded to include partnerships with five neighboring schools, creating a regional youth mental health network that served over 2,000 students. {userName} was invited to present their peer support model at a national conference on adolescent mental health, where education professionals praised the program's effectiveness in reducing stigma and connecting students to appropriate resources. Several states expressed interest in implementing similar programs in their school districts.",
        microVariants: [
          "{userName}'s Circle of Care expanded regionally, serving thousands of students and earning national recognition as an effective model for peer-based mental health support."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "mental_health_challenges": ["anxiety disorders", "depression", "eating disorders", "social isolation", "academic pressure"],
        "support_strategies": ["peer listening", "stress management", "mindfulness practice", "crisis intervention", "resource connection"],
        "wellness_activities": ["meditation sessions", "art therapy", "journaling workshops", "exercise programs", "support groups"]
      },
      weatherVariants: ["stressful exam period", "transitional school season", "winter wellness focus", "spring renewal activities"],
      settingVariants: ["school counseling office", "peer support room", "wellness corner", "community mental health center"]
    }
  }
];