// Level 2 Templates - Enhanced with proper word counts  
// 3-4 sentences per page (60-80 words per scene)
// For ages 7-9, 3rd-4th grade reading level

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_2_TEMPLATES: StoryTemplate[] = [
  {
    title: "The School Science Fair Champion",
    theme: "Science & Discovery", 
    level: "Level 2",
    scenes: [
      {
        text: "{userName} joins the school science club and discovers they have a talent for experiments. The teacher, Mrs. Johnson, shows them how to create colorful chemical reactions using safe household ingredients.",
        pause: true,
        hook: "What amazing project will {userName} create for the science fair?",
        microVariants: {
          text: "{userName} joins the school science club and discovers they have a talent for experiments. The teacher, Mrs. Johnson, shows them how to create colorful chemical reactions using safe household ingredients.",
          alternatives: ["At science club, {userName} learns to mix chemicals safely.", "Mrs. Johnson teaches {userName} about exciting chemical reactions."],
          optionalDetails: ["the mixtures bubble and foam", "different colors swirl together beautifully"]
        }
      },
      {
        text: "For their first project, {userName} decides to build a volcano that actually erupts. They carefully mix baking soda, vinegar, and {favoriteColor} food coloring while following the scientific method.",
        pause: true,
        hook: "Will the volcano work perfectly for the science fair?",
        microVariants: {
          text: "For their first project, {userName} decides to build a volcano that actually erupts. They carefully mix baking soda, vinegar, and {favoriteColor} food coloring while following the scientific method.",
          alternatives: ["A erupting volcano becomes {userName}'s science fair project.", "{userName} creates a spectacular volcano with colorful lava."],
          optionalDetails: ["they measure each ingredient precisely", "the volcano is shaped like a real mountain"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName} wins second place and decides to become a scientist who helps people understand our amazing planet.",
        microVariants: ["The judges are amazed by {userName}'s scientific knowledge.", "{userName} inspires other students to love science too."]
      },
      {
        type: 'cozy',
        text: "{userName} shares their love of science by teaching younger students about experiments.",
        microVariants: ["Science becomes {userName}'s favorite subject forever.", "Every weekend, {userName} does new experiments at home."]
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
  }
];

export function getLevel2Template(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_2_TEMPLATES.length) {
    return LEVEL_2_TEMPLATES[templateIndex];
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_2_TEMPLATES.length);
  return LEVEL_2_TEMPLATES[randomIndex];
}

export function getLevel2TemplateCount(): number {
  return LEVEL_2_TEMPLATES.length;
}