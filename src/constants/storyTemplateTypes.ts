/**
 * Story Template Types for the Complete Fallback Library System
 * Supports never-ending stories with modular scenes and attach-anytime endings
 */

export interface SceneMicroVariants {
  text: string;
  alternatives: string[];
  optionalDetails: string[];
}

export interface StoryScene {
  text: string;
  pause: boolean;
  hook: string;
  microVariants: SceneMicroVariants;
}

export interface AttachableEnding {
  type: 'cozy' | 'silly' | 'triumphant' | 'reflective';
  text: string;
  microVariants: string[];
}

export interface StoryTemplate {
  title: string;
  theme: string;
  level: string;
  scenes: StoryScene[];
  endings: AttachableEnding[];
  reuse: {
    swappableElements: Record<string, string[]>;
    weatherVariants: string[];
    settingVariants: string[];
    randomSeed?: number; // For grades 6-10
  };
}

export interface PersonalizationPlaceholders {
  userName: string;
  specialRequest: string;
  favoriteColor?: string;  // Optional - only if user provided
  favoriteAnimal?: string; // Optional - only if user provided
  favoriteFood?: string;   // Optional - only if user provided
  hobbies?: string;        // Optional - only if user provided
}

export const DEFAULT_PLACEHOLDERS: PersonalizationPlaceholders = {
  userName: "the child",
  specialRequest: "adventure"
  // favoriteColor, favoriteAnimal, favoriteFood, hobbies omitted = truly optional
};