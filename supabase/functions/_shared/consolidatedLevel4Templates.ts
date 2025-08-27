/**
 * Level 4 Templates - Enhanced with proper word counts
 * 4-5 sentences per page (80-100 words per scene)  
 * For ages 11+, 7th-12th grade reading level
 */

import { StoryTemplate } from './templates/storyTemplateTypes';

export const LEVEL_4_CONSOLIDATED_TEMPLATES: StoryTemplate[] = [
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
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} presents their findings at a national archaeology conference, inspiring other young people to pursue careers in historical research and scientific discovery.",
        microVariants: ["The discovery changes how we understand ancient civilizations.", "{userName} becomes the youngest researcher to present at the conference."]
      }
    ],
    reuse: {
      swappableElements: {
        "artifact": ["tablet", "scroll", "carved stone", "metal disc"],
        "museum": ["university", "research center", "archaeological site", "library"]
      },
      weatherVariants: ["during summer break", "on a stormy weekend", "during winter holidays", "in the early morning"],
      settingVariants: ["natural history museum", "university museum", "archaeological institute", "cultural center"]
    }
  }
];

export function getLevel4Template(templateIndex?: number): StoryTemplate | null {
  if (templateIndex !== undefined) {
    return LEVEL_4_CONSOLIDATED_TEMPLATES[templateIndex] || null;
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_4_CONSOLIDATED_TEMPLATES.length);
  return LEVEL_4_CONSOLIDATED_TEMPLATES[randomIndex];
}

export function getLevel4TemplateCount(): number {
  return LEVEL_4_CONSOLIDATED_TEMPLATES.length;
}