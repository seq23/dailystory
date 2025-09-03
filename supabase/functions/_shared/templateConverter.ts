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
  
  // Enhanced level detection: Handle both template levels and difficulty mappings
  const isHardOrExpert = template.level === 'Level 3' || template.level === 'Level 4' || 
                         template.level === 'hard' || template.level === 'expert';
  const isMedium = template.level === 'Level 1' || template.level === 'Level 2' || 
                   template.level === 'medium';
  
  // Log level detection for debugging
  console.log(`🎯 LEVEL DETECTION: template.level="${template.level}" → isHardOrExpert=${isHardOrExpert}, isMedium=${isMedium}`);
  
  // AGGRESSIVE content selection for Hard/Expert levels - ALWAYS add content
  let shouldAddDetail = false;
  if (isHardOrExpert) {
    shouldAddDetail = true; // 100% chance for Hard/Expert
  } else {
    // FIXED: Testing mode gets 100% detail chance, real-user gets 40%
    const baseDetailChance = (mode === 'testing') ? 1.0 : 0.4;
    shouldAddDetail = Math.random() < baseDetailChance;
  }
  
  // FIXED: Smart content selection instead of aggressive concatenation
  if (shouldAddDetail && scene.microVariants.optionalDetails.length > 0) {
    const allDetails = scene.microVariants.optionalDetails;
    const currentWordCount = text.split(' ').length;
    const targetWordCount = isHardOrExpert ? (template.level === 'Level 3' || template.level === 'hard' ? 80 : 100) : (isMedium ? 45 : 30);
    const wordsNeeded = targetWordCount - currentWordCount;
    
    if (isHardOrExpert && wordsNeeded > 20) {
      // For Hard/Expert: Add details only if we need more content, intelligently select
      const selectedDetails: string[] = [];
      let addedWords = 0;
      
      // Select details that fit within our word budget
      for (const detail of allDetails) {
        const detailWords = detail.split(' ').length;
        if (addedWords + detailWords <= wordsNeeded && selectedDetails.length < 2) {
          selectedDetails.push(detail);
          addedWords += detailWords;
        }
      }
      
      if (selectedDetails.length > 0) {
        // Natural integration: integrate details seamlessly into the narrative flow
        const detailText = selectedDetails.length === 1 
          ? selectedDetails[0]
          : `${selectedDetails[0]}. Additionally, ${selectedDetails[1]}`;
          
        // Integrate naturally at sentence boundaries
        if (text.trim().endsWith('.')) {
          // Add as new sentences after the main text
          text = `${text} ${detailText.charAt(0).toUpperCase()}${detailText.slice(1)}.`;
        } else {
          // Complete the sentence first, then add details
          text = `${text}. ${detailText.charAt(0).toUpperCase()}${detailText.slice(1)}.`;
        }
        
        console.log(`🎯 NATURAL INTEGRATION: Added ${selectedDetails.length} details (${addedWords} words) as complete sentences`);
      }
    } else if (!isHardOrExpert && wordsNeeded > 10) {
      // Normal levels: selective single detail addition as complete sentence
      const detail = pick(allDetails);
      
      if (text.trim().endsWith('.')) {
        // Add as new sentence after the main text
        text = `${text} ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`;
      } else {
        // Complete the sentence first, then add detail
        text = `${text}. ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`;
      }
        
      console.log(`🎯 NATURAL: Added 1 detail (${detail.split(' ').length} words) as complete sentence`);
    }
  }
  
  // Word count validation with proper level-based targets
  const finalWordCount = text.split(' ').length;
  let targetWords;
  if (isHardOrExpert) {
    targetWords = template.level === 'Level 3' || template.level === 'hard' ? 80 : 100;
  } else if (isMedium) {
    targetWords = 45; // Medium level target: 45 words per page
  } else {
    targetWords = 30; // Beginner/easy level target: 30 words per page
  }
  
  console.log(`📊 WORD COUNT TARGET: Level "${template.level}" → Target: ${targetWords} words, Current: ${finalWordCount} words`);
  
  // SMARTER WORD COUNT ENFORCEMENT: Use alternatives as replacements, not additions
  const newFinalWordCount = text.split(' ').length;
  if (isHardOrExpert && newFinalWordCount < targetWords) {
    console.log(`⚠️ WORD COUNT STILL LOW: ${newFinalWordCount} words (target: ${targetWords})`);
    
    // Use alternative as REPLACEMENT if it's longer than current text
    if (scene.microVariants.alternatives.length > 0) {
      const longestAlternative = scene.microVariants.alternatives
        .reduce((longest, current) => 
          current.split(' ').length > longest.split(' ').length ? current : longest
        );
      
      if (longestAlternative.split(' ').length > scene.text.split(' ').length) {
        // Replace with longer alternative
        text = longestAlternative;
        console.log(`🔄 REPLACED with longer alternative (${longestAlternative.split(' ').length} words)`);
      } else {
        // Only add alternative as separate sentence if we're significantly short
        const wordsShort = targetWords - newFinalWordCount;
        if (wordsShort > 20) {
          const alternative = pick(scene.microVariants.alternatives);
          // Add as separate sentence to avoid concatenation issues
          text = text.trim().endsWith('.') 
            ? `${text} ${alternative.charAt(0).toUpperCase()}${alternative.slice(1)}.`
            : `${text}. ${alternative.charAt(0).toUpperCase()}${alternative.slice(1)}.`;
          console.log(`🔧 Added alternative as separate sentence (${alternative.split(' ').length} words)`);
        }
      }
    }
  }
  
  // TESTING MODE: Show detailed word count analysis
  if (mode === 'testing') {
    const finalCount = text.split(' ').length;
    console.log(`✅ Selected Text (${finalCount} words): ${text.substring(0, 150)}...`);
    if (isHardOrExpert) {
      const status = finalCount >= targetWords ? '✅ MEETS TARGET' : '❌ BELOW TARGET';
      console.log(`📊 Word Count Analysis: ${finalCount}/${targetWords} words ${status}`);
    }
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
  
  // Apply sophisticated grammar validation with crash protection
  const grammarResult = safeValidateAndEnhanceGrammar(text, "they");
  text = grammarResult.result;
  if (!grammarResult.success) {
    console.warn(`⚠️ Grammar enhancement failed for scene: ${grammarResult.error}`);
  }
  
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
  
  // Apply sophisticated grammar validation to ending with crash protection
  const grammarResult = safeValidateAndEnhanceGrammar(text, "they");
  text = grammarResult.result;
  if (!grammarResult.success) {
    console.warn(`⚠️ Grammar enhancement failed for ending: ${grammarResult.error}`);
  }
  
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
      
      // Add as separate sentence to avoid concatenation issues
      text = text.trim().endsWith('.') 
        ? `${text} ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`
        : `${text}. ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`;
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
  
  // Apply sophisticated grammar validation with crash protection
  const grammarResult = safeValidateAndEnhanceGrammar(text, "they");
  text = grammarResult.result;
  if (!grammarResult.success) {
    console.warn(`⚠️ Grammar enhancement failed for cycle variation: ${grammarResult.error}`);
  }
  
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