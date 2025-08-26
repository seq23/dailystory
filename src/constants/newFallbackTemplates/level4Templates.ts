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