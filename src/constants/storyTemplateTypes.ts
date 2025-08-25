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
  favoriteColor: string;
  favoriteAnimal: string;
  favoriteFood: string;
  hobbies: string;
}

export const DEFAULT_PLACEHOLDERS: PersonalizationPlaceholders = {
  userName: "the child",
  favoriteColor: "blue", 
  favoriteAnimal: "puppy",
  favoriteFood: "pasta",
  hobbies: "playing outside",
  specialRequest: "adventure"
};