// Level 4 Templates - Enhanced with proper word counts
// 4-5 sentences per page (80-100 words per scene)  
// For ages 11+, 7th-12th grade reading level

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_4_TEMPLATES: StoryTemplate[] = [
  {
    title: "The Ancient Artifact Mystery",
    theme: "Archaeology & Discovery",
    level: "Level 4", 
    scenes: [
      {
        text: "{userName} discovers an ancient artifact while volunteering at the local museum's archaeology department. The mysterious {favoriteColor} stone tablet contains symbols that don't match any known language, sparking intense curiosity among the research team. Dr. Martinez, the lead archaeologist, explains that such discoveries could rewrite our understanding of ancient civilizations and their technological capabilities.",
        pause: true,
        hook: "What secrets might this ancient artifact reveal?",
        microVariants: {
          text: "{userName} discovers an ancient artifact while volunteering at the local museum's archaeology department. The mysterious {favoriteColor} stone tablet contains symbols that don't match any known language, sparking intense curiosity among the research team. Dr. Martinez, the lead archaeologist, explains that such discoveries could rewrite our understanding of ancient civilizations and their technological capabilities.",
          alternatives: ["An mysterious artifact catches {userName}'s attention at the museum.", "While cataloging artifacts, {userName} finds something extraordinary."],
          optionalDetails: ["the tablet feels surprisingly warm to the touch", "strange symbols seem to shimmer in certain lighting"]
        }
      },
      {
        text: "Determined to decode the artifact's secrets, {userName} begins intensive research using the museum's extensive library and digital archives. They study comparative linguistics, ancient writing systems, and archaeological methodology while collaborating with university professors via video conferences. The complexity of the symbols suggests a sophisticated civilization with advanced mathematical and astronomical knowledge that challenges current historical timelines.",
        pause: true,
        hook: "What breakthrough will {userName} make in their research?",
        microVariants: {
          text: "Determined to decode the artifact's secrets, {userName} begins intensive research using the museum's extensive library and digital archives. They study comparative linguistics, ancient writing systems, and archaeological methodology while collaborating with university professors via video conferences. The complexity of the symbols suggests a sophisticated civilization with advanced mathematical and astronomical knowledge that challenges current historical timelines.",
          alternatives: ["Deep research reveals the artifact's incredible complexity.", "{userName} works tirelessly to unlock the tablet's mysteries."],
          optionalDetails: ["professors from around the world join the investigation", "each symbol represents multiple concepts simultaneously"]
        }
      },
      {
        text: "After months of analysis, {userName} makes a groundbreaking discovery that the symbols form a mathematical sequence related to astronomical cycles. Working with astrophysicists and mathematicians, they realize the artifact may contain ancient knowledge about planetary movements that predates known astronomical records. This revelation suggests the civilization possessed scientific understanding far more advanced than previously believed possible for that time period.",
        pause: true,
        hook: "How will this discovery change our understanding of ancient science?",
        microVariants: {
          text: "After months of analysis, {userName} makes a groundbreaking discovery that the symbols form a mathematical sequence related to astronomical cycles. Working with astrophysicists and mathematicians, they realize the artifact may contain ancient knowledge about planetary movements that predates known astronomical records. This revelation suggests the civilization possessed scientific understanding far more advanced than previously believed possible for that time period.",
          alternatives: ["Mathematical patterns reveal ancient astronomical knowledge beyond current understanding.", "The symbols unlock secrets about how ancient civilizations understood the cosmos."],
          optionalDetails: ["the calculations match modern astronomical data with startling accuracy", "researchers from NASA join the investigation"]
        }
      },
      {
        text: "The international scientific community takes notice of {userName}'s research, leading to collaborative expeditions and advanced dating techniques that confirm the artifact's extraordinary age and significance. {userName} learns that archaeological discovery requires not just scientific rigor, but also cultural sensitivity, international cooperation, and respect for indigenous knowledge systems. The experience teaches them that the past continues to inform the present in unexpected ways.",
        pause: true,
        hook: "What global impact will {userName}'s archaeological breakthrough have?",
        microVariants: {
          text: "The international scientific community takes notice of {userName}'s research, leading to collaborative expeditions and advanced dating techniques that confirm the artifact's extraordinary age and significance. {userName} learns that archaeological discovery requires not just scientific rigor, but also cultural sensitivity, international cooperation, and respect for indigenous knowledge systems. The experience teaches them that the past continues to inform the present in unexpected ways.",
          alternatives: ["Global recognition brings new responsibilities and deeper understanding of archaeological ethics.", "The discovery opens doors to international collaboration and cultural preservation efforts."],
          optionalDetails: ["indigenous elders share oral traditions that support the findings", "the artifact becomes a symbol of ancient scientific achievement"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} presents their findings at a national archaeology conference, inspiring other young people to pursue careers in historical research and scientific discovery.",
        microVariants: ["The discovery changes how we understand ancient civilizations.", "{userName} becomes the youngest researcher to present at the conference."]
      },
      {
        type: 'reflective', 
        text: "{userName} realizes that some mysteries are meant to be explored gradually, with patience and respect for ancient cultures.",
        microVariants: ["The journey of discovery proves more valuable than quick answers.", "Each clue leads to deeper questions about human history."]
      }
    ],
    reuse: {
      swappableElements: {
        "artifact": ["manuscript", "tool", "sculpture", "map", "vessel"],
        "Dr. Martinez": ["Dr. Chen", "Professor Williams", "Dr. Patel", "Dr. Johnson"],
        "museum": ["university", "research center", "archaeological site", "library"]
      },
      weatherVariants: ["during summer break", "on a stormy weekend", "during winter holidays", "in the early morning"],
      settingVariants: ["natural history museum", "university museum", "archaeological institute", "cultural center"]
    }
  },
  {
    title: "The AI Ethics Dilemma",
    theme: "Technology & Ethics",
    level: "Level 4",
    scenes: [
      {
        text: "{userName} joins their school's advanced computer science program and becomes fascinated with artificial intelligence development. While working on a machine learning project that analyzes social media data to predict behavior patterns, they discover their algorithm inadvertently reinforces existing biases present in the training data. This realization forces {userName} to confront complex questions about AI ethics, algorithmic fairness, and the responsibility of technologists to create equitable systems.",
        pause: true,
        hook: "How will {userName} address the ethical implications of biased AI systems?",
        microVariants: {
          text: "{userName} joins their school's advanced computer science program and becomes fascinated with artificial intelligence development. While working on a machine learning project that analyzes social media data to predict behavior patterns, they discover their algorithm inadvertently reinforces existing biases present in the training data. This realization forces {userName} to confront complex questions about AI ethics, algorithmic fairness, and the responsibility of technologists to create equitable systems.",
          alternatives: ["Computer science studies reveal the hidden biases embedded in AI technology.", "A machine learning project opens {userName}'s eyes to algorithmic discrimination."],
          optionalDetails: ["the bias particularly affects {favoriteColor} profile themes", "patterns show discrimination against certain communities"]
        }
      },
      {
        text: "Determined to understand and solve this problem, {userName} researches AI ethics frameworks, studies bias detection methods, and collaborates with ethicists, social scientists, and affected community members. They learn about the historical context of technological discrimination, the importance of diverse development teams, and methods for creating more equitable AI systems. This interdisciplinary approach teaches {userName} that effective technology requires understanding not just code, but also social justice, cultural competency, and systemic inequality.",
        pause: true,
        hook: "What solutions will {userName} develop to create more ethical AI systems?",
        microVariants: {
          text: "Determined to understand and solve this problem, {userName} researches AI ethics frameworks, studies bias detection methods, and collaborates with ethicists, social scientists, and affected community members. They learn about the historical context of technological discrimination, the importance of diverse development teams, and methods for creating more equitable AI systems. This interdisciplinary approach teaches {userName} that effective technology requires understanding not just code, but also social justice, cultural competency, and systemic inequality.",
          alternatives: ["Research into AI ethics reveals the complexity of creating truly fair algorithms.", "Collaboration with diverse experts provides insights into algorithmic justice."],
          optionalDetails: ["community feedback sessions inform the redesign process", "ethical frameworks guide every development decision"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} develops new bias detection tools that become industry standards, helping create more equitable AI systems worldwide.",
        microVariants: ["The ethical AI framework influences technology companies globally.", "{userName} becomes a leading voice in responsible AI development."]
      },
      {
        type: 'reflective',
        text: "{userName} dedicates their career to ensuring technology serves justice and human dignity rather than perpetuating inequality.",
        microVariants: ["Every algorithm {userName} creates prioritizes fairness and social responsibility.", "Technology becomes a tool for justice rather than discrimination."]
      }
    ],
    reuse: {
      swappableElements: {
        "AI system": ["recommendation engine", "facial recognition", "hiring algorithm", "predictive policing"],
        "bias type": ["racial", "gender", "socioeconomic", "geographic", "age-based"],
        "solution": ["diverse training data", "fairness constraints", "algorithmic auditing", "community oversight"]
      },
      weatherVariants: ["during a tech conference", "after a coding bootcamp", "during ethics week", "following a bias incident"],
      settingVariants: ["computer lab", "tech company", "university", "community center"]
    }
  }
];

export function getLevel4Template(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_4_TEMPLATES.length) {
    return LEVEL_4_TEMPLATES[templateIndex];
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_4_TEMPLATES.length);
  return LEVEL_4_TEMPLATES[randomIndex];
}

export function getLevel4TemplateCount(): number {
  return LEVEL_4_TEMPLATES.length;
}

export function getLevel4TotalPages(): number {
  return LEVEL_4_TEMPLATES.length * 5;
}