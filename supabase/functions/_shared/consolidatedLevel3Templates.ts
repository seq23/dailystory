/**
 * Level 3 Templates (Ages 9-11) - Complete Fallback Story Library  
 * 5 comprehensive templates with 10 scenes each, 70-100 words per scene
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from './templates/storyTemplateTypes.ts';
import { LEVEL_3_FALLBACK_TEMPLATES } from '../../../src/constants/newFallbackTemplates/level3Templates.ts';

// All 5 comprehensive Level 3 templates with full 10+ scenes each
export const LEVEL_3_CONSOLIDATED_TEMPLATES: StoryTemplate[] = LEVEL_3_FALLBACK_TEMPLATES;

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