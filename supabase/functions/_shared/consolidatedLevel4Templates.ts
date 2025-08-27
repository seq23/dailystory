/**
 * Level 4 Templates - Enhanced with proper word counts
 * 4-5 sentences per page (80-100 words per scene)  
 * For ages 11+, 7th-12th grade reading level
 */

import { StoryTemplate } from './templates/storyTemplateTypes.ts';
import { LEVEL_4_TEMPLATES } from '../../../src/constants/newFallbackTemplates/level4Templates.ts';

// All 5 comprehensive Level 4 templates with full scenes
export const LEVEL_4_CONSOLIDATED_TEMPLATES: StoryTemplate[] = LEVEL_4_TEMPLATES;

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