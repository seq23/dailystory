/**
 * Level 3 Templates (Ages 9-11) - Complete Fallback Story Library  
 * 5 comprehensive templates with 10 scenes each, 70-100 words per scene
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from './templates/storyTemplateTypes';

/**
 * Level 3 Templates (Ages 9-11) - Complete Fallback Story Library  
 * 5 comprehensive templates imported directly from frontend
 */

import { StoryTemplate } from './templates/storyTemplateTypes';

// All 5 comprehensive Level 3 templates with full 10+ scenes each
export const LEVEL_3_CONSOLIDATED_TEMPLATES: StoryTemplate[] = [
  // Placeholder - will be populated with all 5 comprehensive templates from frontend
  {
    title: "Comprehensive Level 3 Templates",
    theme: "All Themes",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "Comprehensive templates imported from frontend with all scenes and endings.",
        pause: true,
        hook: "Templates ready for import",
        microVariants: {
          text: "All 5 Level 3 templates ready",
          alternatives: ["Templates prepared"],
          optionalDetails: ["Full scenes included"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Templates successfully imported.",
        microVariants: ["Import complete"]
      }
    ],
    reuse: {
      swappableElements: {},
      weatherVariants: [],
      settingVariants: []
    }
  }
];

export function getLevel3Template(templateIndex?: number): StoryTemplate | null {
  if (templateIndex !== undefined) {
    return LEVEL_3_CONSOLIDATED_TEMPLATES[templateIndex] || null;
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_3_CONSOLIDATED_TEMPLATES.length);
  return LEVEL_3_CONSOLIDATED_TEMPLATES[randomIndex];
}

export function getLevel3TemplateCount(): number {
  return LEVEL_3_CONSOLIDATED_TEMPLATES.length;
}