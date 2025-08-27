/**
 * Template Converter for Story Templates
 * Converts StoryTemplate objects to string[] arrays with full placeholder resolution
 */

// Import sophisticated placeholder resolver and grammar validation from shared services
import { resolveAllPlaceholders, MicroContext } from './placeholderResolver.ts';
import { validateAndEnhanceGrammar } from './grammarValidator.ts';

// Types matching the frontend
interface MicroVariants {
  text: string;
  alternatives: string[];
  optionalDetails: string[];
}

interface StoryScene {
  text: string;
  pause: boolean;
  hook: string;
  microVariants: MicroVariants;
}

interface AttachableEnding {
  type: 'cozy' | 'silly' | 'triumphant' | 'reflective';
  text: string;
  microVariants: string[];
}

interface StoryTemplate {
  title: string;
  theme: string;
  level: string;
  scenes: StoryScene[];
  endings: AttachableEnding[];
  reuse: {
    swappableElements: Record<string, string[]>;
    weatherVariants: string[];
    settingVariants: string[];
    randomSeed?: number;
  };
}

interface UserInfo {
  name?: string;
  avatar?: any;
  favoriteColor?: string;
  favoriteAnimal?: string;
  favoriteFood?: string;
  hobbies?: string;
  specialRequest?: string;
  difficultyLevel?: string;
}

// Simple seeded random generator (Linear Congruential Generator)
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Process swappable elements for random variation (Grades 6-10 feature)
function processSwappableElements(template: StoryTemplate, userInfo: UserInfo): Record<string, string> {
  const swappedElements: Record<string, string> = {};
  
  if (template.reuse && template.reuse.swappableElements) {
    for (const [key, options] of Object.entries(template.reuse.swappableElements)) {
      if (options && options.length > 0) {
        // Randomly swap elements each time (as requested)
        const randomIndex = Math.floor(Math.random() * options.length);
        swappedElements[key] = options[randomIndex];
      }
    }
  }
  
  return swappedElements;
}

// Apply random seed selection for consistent but varied stories (Grades 6-10)
function applyRandomSeedSelection(template: StoryTemplate, userInfo: UserInfo): Record<string, any> {
  const seedData: Record<string, any> = {};
  
  if (template.reuse && template.reuse.randomSeed !== undefined) {
    // Seeded random selection for consistent but varied stories
    const seed = template.reuse.randomSeed;
    
    // Create deterministic but varied selections based on seed and user info
    const userSeed = userInfo.name ? userInfo.name.length : 1;
    const combinedSeed = (seed + userSeed) % 10000;
    
    // Use proper seeded random generator
    const seededRandom = createSeededRandom(combinedSeed);
    
    // Apply seeded randomization to weather and setting variants
    if (template.reuse.weatherVariants && template.reuse.weatherVariants.length > 0) {
      const weatherIndex = Math.floor(seededRandom() * template.reuse.weatherVariants.length);
      seedData.weather = template.reuse.weatherVariants[weatherIndex];
    }
    
    if (template.reuse.settingVariants && template.reuse.settingVariants.length > 0) {
      const settingIndex = Math.floor(seededRandom() * template.reuse.settingVariants.length);
      seedData.setting = template.reuse.settingVariants[settingIndex];
    }
  }
  
  return seedData;
}


// Process scene with microVariants and sophisticated placeholder resolution
function processScene(scene: StoryScene, userInfo: UserInfo, template: StoryTemplate): string {
  const shouldUseAlternative = Math.random() < 0.3; // 30% chance for variety
  const shouldAddDetail = Math.random() < 0.4; // 40% chance for detail
  
  let text = shouldUseAlternative && scene.microVariants.alternatives.length > 0
    ? pick(scene.microVariants.alternatives)
    : scene.microVariants.text;
  
  // Add optional detail
  if (shouldAddDetail && scene.microVariants.optionalDetails.length > 0) {
    const detail = pick(scene.microVariants.optionalDetails);
    // Simple sentence combination
    text = text.trim().endsWith('.') 
      ? `${text.slice(0, -1)}, and ${detail}.`
      : `${text} ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`;
  }
  
  // Process swappable elements and seed data for Grades 6-10
  const swappedElements = processSwappableElements(template, userInfo);
  const seedData = applyRandomSeedSelection(template, userInfo);
  
  // Create enhanced MicroContext with swapped elements and seed data
  const microContext: MicroContext = {
    userInfo: userInfo,
    pageText: text,
    seed: { ...seedData, ...swappedElements }
  };
  
  // Apply sophisticated placeholder resolution
  text = resolveAllPlaceholders(text, microContext);
  
  // Apply sophisticated grammar validation
  text = validateAndEnhanceGrammar(text, "they");
  
  return text;
}

// Process ending with sophisticated grammar validation (PHASE 4)
function processEnding(endings: AttachableEnding[], userInfo: UserInfo, template: StoryTemplate): string {
  if (endings.length === 0) return "And they lived happily ever after.";
  
  const ending = pick(endings);
  const shouldUseVariant = Math.random() < 0.4 && ending.microVariants.length > 0;
  
  let text = shouldUseVariant ? pick(ending.microVariants) : ending.text;
  
  // Process swappable elements and seed data for consistent ending
  const swappedElements = processSwappableElements(template, userInfo);
  const seedData = applyRandomSeedSelection(template, userInfo);
  
  // Create enhanced MicroContext for ending
  const microContext: MicroContext = {
    userInfo: userInfo,
    pageText: text,
    seed: { ...seedData, ...swappedElements }
  };
  
  // Apply sophisticated placeholder resolution
  text = resolveAllPlaceholders(text, microContext);
  
  // Apply sophisticated grammar validation to ending (PHASE 4 enhancement)
  text = validateAndEnhanceGrammar(text, "they");
  
  return text;
}

/**
 * Convert a StoryTemplate to a string array with sophisticated processing
 */
export function convertStoryTemplateToStringArray(
  template: StoryTemplate, 
  userInfo: UserInfo = {}, 
  pageCount: number = 5
): string[] {
  console.log(`🔄 Converting template: "${template.title}" for ${pageCount} pages`);
  
  const pages: string[] = [];
  
  // Process scenes up to pageCount - 1 (save one slot for ending)
  const scenesToUse = Math.min(pageCount - 1, template.scenes.length);
  
  for (let i = 0; i < scenesToUse; i++) {
    const processedScene = processScene(template.scenes[i], userInfo, template);
    pages.push(processedScene);
  }
  
  // Add ending with sophisticated processing (PHASE 4)
  const ending = processEnding(template.endings, userInfo, template);
  pages.push(ending);
  
  console.log(`✅ Template converted to ${pages.length} pages`);
  return pages;
}