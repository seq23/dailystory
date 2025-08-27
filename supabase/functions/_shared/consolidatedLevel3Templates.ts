/**
 * Level 3 Templates (Ages 9-11) - Complete Fallback Story Library  
 * 5 comprehensive templates with 10 scenes each, 70-100 words per scene
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from './templates/storyTemplateTypes';

export const LEVEL_3_CONSOLIDATED_TEMPLATES: StoryTemplate[] = [
  {
    title: "The Magical Treehouse Adventure",
    theme: "Magic & Fantasy",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} and their best friend {friend} stumbled upon an ancient-looking treehouse deep in the {forestType} forest. As they climbed inside, they discovered a dusty old book with strange symbols. Suddenly, the treehouse began to shake, and they realized it was lifting off the ground!",
        pause: true,
        hook: "Where will the magical treehouse take them?",
        microVariants: {
          text: "{userName} and {friend}, while exploring the {forestType} forest, found a hidden treehouse. Inside, a mysterious book with glowing symbols caused the treehouse to magically float into the sky!",
          alternatives: [
            "{userName} and {friend} were playing in the {forestType} woods when they discovered a secret treehouse. A magical book inside made the treehouse fly!"
          ],
          optionalDetails: ["The book whispered secrets.", "Strange lights flickered around them.", "The air crackled with energy."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Back in their own backyard, {userName} and {friend} built a small library for their neighborhood, filled with books from their adventure. They often read stories to the younger children, sharing the magic of reading and the importance of education.",
        microVariants: [
          "They built a neighborhood library with books from their adventure, sharing stories and the importance of education with younger children."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "forestType": ["enchanted", "dark", "sunny", "mysterious"],
        "animalType": ["owl", "fox", "bear", "squirrel"],
        "monsterType": ["goblin", "troll", "dragon", "giant"]
      },
      weatherVariants: ["sunny", "rainy", "cloudy", "stormy"],
      settingVariants: ["forest", "mountains", "beach", "desert"]
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