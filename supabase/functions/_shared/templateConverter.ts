/**
 * Template Converter for Story Templates
 * Converts StoryTemplate objects to string[] arrays with full placeholder resolution
 */

// Import sophisticated placeholder resolver and grammar validation from shared services
import { resolveAllPlaceholders, MicroContext, UserInfo } from './placeholderResolver.ts';
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
function processScene(scene: StoryScene, userInfo: UserInfo, template: StoryTemplate, mode: string = 'testing'): string {
  // TESTING MODE: Show organized console output and always use main text
  if (mode === 'testing') {
    console.log(`\n🔍 SCENE ANALYSIS:`);
    console.log(`📝 Full Scene Text (${scene.text.split(' ').length} words): ${scene.text.substring(0, 100)}...`);
    console.log(`📝 Summary Text (${scene.microVariants.text.split(' ').length} words): ${scene.microVariants.text.substring(0, 100)}...`);
    console.log(`🔄 Alternatives (${scene.microVariants.alternatives.length}):`, scene.microVariants.alternatives.map(alt => `"${alt.substring(0, 50)}..." (${alt.split(' ').length} words)`));
    console.log(`📎 Optional Details (${scene.microVariants.optionalDetails.length}):`, scene.microVariants.optionalDetails.map(detail => `"${detail.substring(0, 40)}..."`));
  }
  
  // REAL USER MODE: Always use full scene content (not short summaries)
  // TESTING MODE: Always use full scene content for complete validation
  let text = scene.text; // Use full scene content (60-120+ words) instead of microVariants summary
  
  // Enhanced content selection for Hard and Expert levels
  const isHardOrExpert = template.level === 'level3' || template.level === 'level4';
  
  // In real-user mode, add optional details more frequently for Hard/Expert levels
  const baseDetailChance = (mode === 'real-user') ? 0.4 : 0;
  const enhancedDetailChance = isHardOrExpert ? 0.8 : baseDetailChance;
  const shouldAddDetail = Math.random() < enhancedDetailChance;
  
  // Add optional detail (enhanced for Hard/Expert levels)
  if (shouldAddDetail && scene.microVariants.optionalDetails.length > 0) {
    const detail = pick(scene.microVariants.optionalDetails);
    
    // For Hard/Expert levels, try to add multiple details if available
    if (isHardOrExpert && scene.microVariants.optionalDetails.length > 1 && Math.random() < 0.5) {
      const secondDetail = pick(scene.microVariants.optionalDetails.filter(d => d !== detail));
      text = text.trim().endsWith('.') 
        ? `${text.slice(0, -1)}, ${detail}, and ${secondDetail}.`
        : `${text} ${detail.charAt(0).toUpperCase()}${detail.slice(1)}, and ${secondDetail}.`;
    } else {
      // Single detail addition
      text = text.trim().endsWith('.') 
        ? `${text.slice(0, -1)}, and ${detail}.`
        : `${text} ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`;
    }
  }
  
  // TESTING MODE: Show all content for validation
  if (mode === 'testing') {
    console.log(`✅ Selected Text (${text.split(' ').length} words): ${text.substring(0, 150)}...`);
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
  
  // EMERGENCY FALLBACK: Ensure never empty
  if (!text || text.trim().length === 0) {
    console.log('🚨 EMERGENCY: Empty scene text, creating fallback');
    text = `This is a story scene from "${template?.title || 'a story'}".`;
  }
  
  return text;
}

// Process ending with sophisticated grammar validation (PHASE 4)
function processEnding(endings: AttachableEnding[], userInfo: UserInfo, template: StoryTemplate, mode: string = 'testing'): string {
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
/**
 * Convert a StoryTemplate to a string array with sophisticated processing (Phase 5: Dual-Mode)
 */
export function convertStoryTemplateToStringArray(
  template: StoryTemplate, 
  userInfo: UserInfo = {}, 
  pageCount: number = 5,
  mode: string = 'testing'
): string[] | { pages: string[], testingData?: any } {
  if (mode === 'testing') {
    console.log(`🔄 Converting template: "${template.title}" for ${pageCount} pages (${mode} mode)`);
  }
  
  // TESTING MODE: Show complete template structure
  if (mode === 'testing') {
    console.log(`\n🎭 TEMPLATE ANALYSIS: "${template.title}"`);
    console.log(`📚 Level: ${template.level} | Theme: ${template.theme}`);
    console.log(`🎬 Scenes: ${template.scenes.length} | 🎯 Endings: ${template.endings.length}`);
    console.log(`🔄 Reusable Elements:`, Object.keys(template.reuse.swappableElements || {}));
    console.log(`🌤️ Weather Variants: ${template.reuse.weatherVariants?.length || 0}`);
    console.log(`🏠 Setting Variants: ${template.reuse.settingVariants?.length || 0}`);
  }
  
  const pages: string[] = [];
  
  if (mode === 'real-user' && pageCount === 1) {
    // Real user mode: generate single page (Phase 4: Never-ending sustainability)
    return [getNextTemplatePage(template, userInfo, 0)];
  }
  
  // Testing mode: generate specific page count (Phase 3: Intelligent Scene Distribution)
  if (template.scenes.length >= pageCount - 1) {
    // Enough scenes for direct mapping
    for (let i = 0; i < pageCount - 1; i++) {
      const processedScene = processScene(template.scenes[i], userInfo, template, mode);
      pages.push(processedScene);
    }
  } else {
    // Scene cycling needed: fewer scenes than target pages
    console.log(`📚 Scene cycling: ${template.scenes.length} scenes for ${pageCount - 1} story pages`);
    
    for (let i = 0; i < pageCount - 1; i++) {
      const sceneIndex = i % template.scenes.length;
      const cycleNumber = Math.floor(i / template.scenes.length);
      
      // Enhanced scene with cycle variation
      const processedScene = processSceneWithCycleVariation(
        template.scenes[sceneIndex], 
        userInfo, 
        template, 
        cycleNumber,
        mode
      );
      pages.push(processedScene);
    }
  }
  
  // Always add ending
  const ending = processEnding(template.endings, userInfo, template, mode);
  pages.push(ending);
  
  // TESTING MODE: Show all endings for validation
  if (mode === 'testing') {
    console.log(`\n🎬 ENDINGS ANALYSIS:`);
    template.endings.forEach((ending, i) => {
      console.log(`🎯 Ending ${i + 1} (${ending.type}): "${ending.text.substring(0, 100)}..." (${ending.text.split(' ').length} words)`);
      console.log(`🔄 Micro Variants (${ending.microVariants.length}):`, ending.microVariants.map(variant => `"${variant.substring(0, 50)}..." (${variant.split(' ').length} words)`));
    });
  }
  
  if (mode === 'testing') {
    console.log(`✅ Template converted to ${pages.length} pages`);
  }
  
  // TESTING MODE: Log first few characters of each page for validation
  if (mode === 'testing') {
    pages.forEach((page, index) => {
      console.log(`📄 Page ${index + 1}: ${page ? page.substring(0, 50) + '...' : 'EMPTY'}`);
    });
  }
  
  // EMERGENCY FALLBACK: If no pages, create minimal content
  if (pages.length === 0) {
    console.log('🚨 EMERGENCY: No pages generated, creating fallback');
    return [`This is a fallback story page for template: ${template?.title || 'Unknown'}`];
  }
  
  // TESTING MODE: Return enhanced data structure with complete template info
  if (mode === 'testing') {
    const testingData = {
      templateStructure: {
        title: template.title,
        theme: template.theme,
        level: template.level,
        totalScenes: template.scenes.length,
        totalEndings: template.endings.length
      },
      sceneDetails: template.scenes.map((scene, index) => ({
        index: index + 1,
        mainText: scene.text,
        alternatives: scene.microVariants?.alternatives || [],
        optionalDetails: scene.microVariants?.optionalDetails || [],
        hook: scene.hook,
        pause: scene.pause
      })),
      endingDetails: template.endings.map((ending, index) => ({
        index: index + 1,
        type: ending.type,
        mainText: ending.text,
        variants: ending.microVariants || []
      })),
      reusableElements: {
        swappableElements: template.reuse.swappableElements || {},
        weatherVariants: template.reuse.weatherVariants || [],
        settingVariants: template.reuse.settingVariants || [],
        randomSeed: template.reuse.randomSeed
      }
    };
    
    return { pages, testingData };
  }
  
  return pages;
}

/**
 * Generate next page for never-ending story mode (Phase 4)
 */
export function getNextTemplatePage(
  template: StoryTemplate, 
  userInfo: UserInfo = {}, 
  pageIndex: number = 0
): string {
  const sceneIndex = pageIndex % template.scenes.length;
  const cycleNumber = Math.floor(pageIndex / template.scenes.length);
  
  return processSceneWithCycleVariation(
    template.scenes[sceneIndex], 
    userInfo, 
    template, 
    cycleNumber
  );
}

/**
 * Process scene with cycle variation for sustainability (Phase 3 & 4)
 */
function processSceneWithCycleVariation(
  scene: StoryScene, 
  userInfo: UserInfo, 
  template: StoryTemplate, 
  cycleNumber: number = 0,
  mode: string = 'testing'
): string {
  // Always use full scene content for proper user experience (not short summaries) 
  let text = scene.text;
  
  // In real-user mode, add variation with cycle awareness
  if (mode === 'real-user') {
    const variationBoost = Math.min(cycleNumber * 0.15, 0.6); // Up to 60% boost
    const shouldAddDetail = Math.random() < (0.4 + variationBoost);
  
    // Enhanced detail addition with cycle awareness (real-user mode only)
    if (shouldAddDetail && scene.microVariants.optionalDetails.length > 0) {
      // Use cycle number to ensure different details over time
      const detailIndex = (cycleNumber % scene.microVariants.optionalDetails.length);
      const detail = scene.microVariants.optionalDetails[detailIndex];
      
      text = text.trim().endsWith('.') 
        ? `${text.slice(0, -1)}, and ${detail}.`
        : `${text} ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`;
    }
  }
  
  // Process swappable elements with cycle variation
  const swappedElements = processSwappableElementsWithCycle(template, userInfo, cycleNumber);
  const seedData = applyRandomSeedSelection(template, userInfo);
  
  // Create enhanced MicroContext with cycle-aware variations
  const microContext: MicroContext = {
    userInfo: userInfo,
    pageText: text,
    seed: { ...seedData, ...swappedElements, cycleNumber }
  };
  
  // Apply sophisticated placeholder resolution
  text = resolveAllPlaceholders(text, microContext);
  
  // Apply sophisticated grammar validation
  text = validateAndEnhanceGrammar(text, "they");
  
  return text;
}

/**
 * Process swappable elements with cycle awareness (Phase 4 enhancement)
 */
function processSwappableElementsWithCycle(
  template: StoryTemplate, 
  userInfo: UserInfo, 
  cycleNumber: number = 0
): Record<string, string> {
  const swappedElements: Record<string, string> = {};
  
  if (template.reuse && template.reuse.swappableElements) {
    for (const [key, options] of Object.entries(template.reuse.swappableElements)) {
      if (options && options.length > 0) {
        // Cycle-aware selection to avoid immediate repetition
        const baseIndex = Math.floor(Math.random() * options.length);
        const cycleOffset = cycleNumber % options.length;
        const finalIndex = (baseIndex + cycleOffset) % options.length;
        
        swappedElements[key] = options[finalIndex];
      }
    }
  }
  
  return swappedElements;
}