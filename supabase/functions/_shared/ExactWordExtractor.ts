// ============= EMERGENCY RECOVERY: EXACT WORD EXTRACTION SYSTEM =============
// Purpose: Preserve exact story words without enhancement modifications
// Core Innovation: Word-for-word formulaic template system

/**
 * FORMULAIC TEMPLATE SYSTEM - Exact Word Preservation
 * Extracts exact words from story text for use in [ACTION], [OBJECT], [SETTING] templates
 */

export interface ExactWordMapping {
  action: string;      // Exact action word from story (e.g., "runs", "running", "rolled")
  objects: string[];   // Exact object words from story (e.g., ["red", "ball"])  
  setting: string;     // Exact setting word from story (e.g., "hill", "playground")
  originalForm: boolean; // Whether to preserve exact grammatical form
}

export class ExactWordExtractor {
  
  /**
   * EMERGENCY RECOVERY: Extract exact words without enhancement
   * Input: "The ball rolls down the hill" 
   * Output: { action: "rolls", objects: ["ball"], setting: "hill" }
   */
  static extractExactWords(pageText: string): ExactWordMapping {
    const cleanText = pageText.toLowerCase().trim();
    
    // Extract exact action (preserve verb form from text)
    const action = this.extractExactAction(cleanText);
    
    // Extract exact objects (preserve color + noun combinations)
    const objects = this.extractExactObjects(cleanText);
    
    // Extract exact setting (preserve location words)  
    const setting = this.extractExactSetting(cleanText);
    
    console.log('🎯 EXACT WORD EXTRACTION:', { action, objects, setting, source: pageText });
    
    return {
      action,
      objects, 
      setting,
      originalForm: true
    };
  }
  
  /**
   * Extract exact action verb from story text
   * Preserve exact conjugation: "runs" stays "runs", "running" stays "running"
   */
  private static extractExactAction(text: string): string {
    const actionWords = [
      'runs', 'run', 'running', 'ran',
      'jumps', 'jump', 'jumping', 'jumped', 
      'rolls', 'roll', 'rolling', 'rolled',
      'plays', 'play', 'playing', 'played',
      'walks', 'walk', 'walking', 'walked',
      'climbs', 'climb', 'climbing', 'climbed',
      'throws', 'throw', 'throwing', 'threw',
      'catches', 'catch', 'catching', 'caught',
      'swims', 'swim', 'swimming', 'swam',
      'slides', 'slide', 'sliding', 'slid',
      'hides', 'hide', 'hiding', 'hid',
      'digs', 'dig', 'digging', 'dug',
      'kicks', 'kick', 'kicking', 'kicked'
    ];
    
    // Find first action word that appears in text (preserves order)
    for (const action of actionWords) {
      if (text.includes(' ' + action + ' ') || text.includes(action + ' ') || text.includes(' ' + action)) {
        console.log(`🎯 Exact action found: "${action}"`);
        return action;
      }
    }
    
    return 'playing'; // Safe fallback
  }
  
  /**
   * Extract exact objects with color preservation
   * Input: "red ball" → Output: ["red", "ball"]
   * Input: "ball" → Output: ["ball"] 
   */
  private static extractExactObjects(text: string): string[] {
    const objects = [];
    
    // Color + Object combinations (preserve exact color words)
    const colorObjectPatterns = [
      { pattern: /red ball/g, result: ['red', 'ball'] },
      { pattern: /blue ball/g, result: ['blue', 'ball'] },
      { pattern: /green ball/g, result: ['green', 'ball'] },
      { pattern: /yellow ball/g, result: ['yellow', 'ball'] },
      { pattern: /red apple/g, result: ['red', 'apple'] },
      { pattern: /green apple/g, result: ['green', 'apple'] }
    ];
    
    // Check for color + object combinations first
    for (const { pattern, result } of colorObjectPatterns) {
      if (pattern.test(text)) {
        console.log(`🎯 Exact color+object found: ${result.join(' ')}`);
        return result;
      }
    }
    
    // Single objects (no color modification) 
    const singleObjects = [
      'ball', 'apple', 'banana', 'dog', 'cat', 'bird', 'tree', 'flower',
      'book', 'toy', 'bike', 'swing', 'slide', 'car', 'truck'
    ];
    
    for (const obj of singleObjects) {
      if (text.includes(' ' + obj + ' ') || text.includes(obj + ' ') || text.includes(' ' + obj)) {
        console.log(`🎯 Exact object found: "${obj}"`);
        return [obj];
      }
    }
    
    return []; // No objects found
  }
  
  /**
   * Extract exact setting words from story text
   * Preserve location words exactly: "hill" stays "hill", "playground" stays "playground"
   */
  private static extractExactSetting(text: string): string {
    const settings = [
      'hill', 'park', 'playground', 'garden', 'room', 'house', 'kitchen',
      'bedroom', 'classroom', 'library', 'forest', 'beach', 'field',
      'yard', 'backyard', 'school', 'store', 'hospital', 'restaurant'
    ];
    
    for (const setting of settings) {
      if (text.includes(' ' + setting + ' ') || text.includes(setting + ' ') || text.includes(' ' + setting)) {
        console.log(`🎯 Exact setting found: "${setting}"`);
        return setting;
      }
    }
    
    return 'outdoor space'; // Safe fallback
  }
  
  /**
   * FORMULAIC TEMPLATE BUILDER
   * Create bracket-style templates with exact word replacement
   * Template: "[ACTION] with [OBJECT] in [SETTING]"
   * Example: "rolling with ball in hill" (exact story preservation)
   */
  static buildFormulaikTemplate(exact: ExactWordMapping): string {
    const objectText = exact.objects.length > 0 ? exact.objects.join(' ') : 'toys';
    
    // Formulaic structure with exact words only
    const template = `${exact.action} with ${objectText} in ${exact.setting}`;
    
    console.log('🎯 FORMULAIC TEMPLATE BUILT:', template);
    return template;
  }
  
  /**
   * HYBRID SYSTEM: Combine exact content + visual enhancement
   * Content: Exact story words (formulaic)
   * Enhancement: Visual quality only (separate section)  
   */
  static buildHybridPrompt(pageText: string, visualEnhancements: string = ''): string {
    const exact = this.extractExactWords(pageText);
    const formulaic = this.buildFormulaikTemplate(exact);
    
    // Separate content preservation from visual enhancement
    const hybridPrompt = visualEnhancements 
      ? `${formulaic}, ${visualEnhancements}`
      : formulaic;
      
    console.log('🎯 HYBRID PROMPT (Content + Visual):', hybridPrompt);
    return hybridPrompt;
  }
}