/**
 * Enhanced Fallback Templates System - PROTECTED LEVEL 0 INTEGRATION
 * Combines preserved Level 0 system with new 35-template library for higher difficulties
 */

import { UserInfo, DifficultyLevel } from "@/types";
import { NameFormatter } from "@/utils/nameFormatter";
import { ensureColorName } from "@/utils/colorConverter";

// NEW TEMPLATE SYSTEM IMPORTS
import { 
  getFallbackTemplate, 
  resolveStoryPlaceholders, 
  FallbackLevel, 
  StoryTemplate,
  PersonalizationPlaceholders 
} from "@/constants/newFallbackTemplates";

export interface EnhancedFallbackTemplate {
  setup: string[];
  development: string[];
  climax: string[];
  resolution: string[];
  contextualContinuations: string[];
  continuationPoints: string[]; // NEW: Story continuation hooks
  nextStorySeeds: string[];     // NEW: Ideas for next story
}

// ===== PROTECTED LEVEL 0 SYSTEM - DO NOT MODIFY =====
// Import Level 0 templates - these are preserved exactly as-is
import { VOCABULARY_COMPLIANT_LEVEL_0_TEMPLATES } from './gradeBased/level0VocabularyCompliantTemplates';
import { LEVEL_0_EXTENSIONS } from './gradeBased/level0ExtensionTemplates';

// ===== NEW TEMPLATE SYSTEM INTEGRATION =====
// Map DifficultyLevel to FallbackLevel for new template system integration
const DIFFICULTY_TO_FALLBACK_MAP: Record<Exclude<DifficultyLevel, 'beginner'>, FallbackLevel> = {
  easy: 'level1',      // Ages 6-7
  medium: 'level2',    // Ages 8-9  
  hard: 'level3',      // Ages 10-11
  expert: 'level4'     // Ages 12-13
};

/**
 * PROTECTED LEVEL 0 SYSTEM - Complete Level 0 templates preserved exactly as-is
 * This system is used only for 'beginner' difficulty level
 * DO NOT MODIFY - Level 0 system remains fully intact
 */
export const LEVEL_0_ENHANCED_TEMPLATES: EnhancedFallbackTemplate[] = [
  // Convert vocabulary-compliant Level 0 templates to enhanced format
  ...VOCABULARY_COMPLIANT_LEVEL_0_TEMPLATES.map(template => ({
    setup: template.slice(0, 2),
    development: template.slice(2, 3),
    climax: template.slice(3, 4),
    resolution: template.slice(4, 5),
    contextualContinuations: [],
    continuationPoints: ["What happens next?", "Where will they go?"],
    nextStorySeeds: ["Another adventure begins", "A new friend appears"]
  })),
  // Convert Level 0 extensions (universal access)
  ...LEVEL_0_EXTENSIONS.map(template => ({
    setup: template.slice(0, 2),
    development: template.slice(2, 3),
    climax: template.slice(3, 4),
    resolution: template.slice(4, 5),
    contextualContinuations: [],
    continuationPoints: ["What happens next?", "Where will they go?"],
    nextStorySeeds: ["Another adventure begins", "A new friend appears"]
  })),
  // Original enhanced fallback with proper user placeholders
  {
    setup: [
      "{userName} sees a {favoriteAnimal}.",
      "The {favoriteAnimal} is {favoriteColor}.",
      "{userName} can play."
    ],
    development: [
      "{userName} and {favoriteAnimal} play.",
      "They run and jump.",
      "The {favoriteAnimal} is happy."
    ],
    climax: [
      "{userName} helps the {favoriteAnimal}.",
      "They are good friends.",
      "{userName} has fun."
    ],
    resolution: [
      "{userName} is happy.",
      "The {favoriteAnimal} is happy.",
      "It is a good day. What adventure awaits next?"
    ],
    contextualContinuations: ["Together they discover new places", "New friends join their games"],
    continuationPoints: ["What magical place will they explore?", "Who else wants to play?"],
    nextStorySeeds: ["A mysterious door appears", "Strange sounds come from the forest"]
  }
];

/**
 * INTEGRATED FALLBACK SYSTEM
 * Level 0 (beginner): Uses protected old system
 * Levels 1-4 (easy/medium/hard/expert): Uses new 35-template system
 */
export const ENHANCED_FALLBACK_TEMPLATES: Record<DifficultyLevel, EnhancedFallbackTemplate[]> = {
  // BEGINNER: Protected Level 0 system (67 templates)
  beginner: LEVEL_0_ENHANCED_TEMPLATES,
  
  // EASY, MEDIUM, HARD, EXPERT: Uses new 35-template system
  // Templates are generated dynamically from the new system
  easy: [], // Generated dynamically from new system
  medium: [], // Generated dynamically from new system  
  hard: [], // Generated dynamically from new system
  expert: [] // Generated dynamically from new system
};

export class EnhancedFallbackManager {
  private static usedTemplates: Map<string, Set<number>> = new Map();
  private static storyContext: Map<string, { characters: string[], themes: string[], plotElements: string[] }> = new Map();

  /**
   * INTEGRATED FALLBACK SYSTEM - Preserves Level 0, uses new system for higher levels
   * Get an enhanced fallback template for the given difficulty and context
   */
  static getFallbackTemplate(
    difficulty: DifficultyLevel,
    userInfo: UserInfo,
    pageIndex: number,
    existingStory?: string[]
  ): string {
    // PROTECTED LEVEL 0 ROUTE - Use original system exactly as-is
    if (difficulty === 'beginner') {
      return this.getLevel0Fallback(userInfo, pageIndex, existingStory);
    }

    // NEW TEMPLATE SYSTEM ROUTE - Use 35-template library for higher difficulties
    return this.getNewSystemFallback(difficulty, userInfo, pageIndex, existingStory);
  }

  /**
   * PROTECTED LEVEL 0 SYSTEM - Preserved exactly as original
   * Uses existing Level 0 templates with original logic
   */
  private static getLevel0Fallback(
    userInfo: UserInfo,
    pageIndex: number,
    existingStory?: string[]
  ): string {
    const sessionKey = `beginner-${userInfo.name || 'guest'}`;
    const templates = LEVEL_0_ENHANCED_TEMPLATES;
    
    if (!templates || templates.length === 0) {
      return this.getBasicFallback('beginner', userInfo, pageIndex);
    }

    // Track used templates to avoid repetition
    if (!this.usedTemplates.has(sessionKey)) {
      this.usedTemplates.set(sessionKey, new Set());
    }
    
    const usedSet = this.usedTemplates.get(sessionKey)!;
    
    // Find an unused template, or reset if all used
    let templateIndex = 0;
    if (usedSet.size >= templates.length) {
      usedSet.clear(); // Reset for variety
    }
    
    // Select template that hasn't been used recently
    for (let i = 0; i < templates.length; i++) {
      if (!usedSet.has(i)) {
        templateIndex = i;
        break;
      }
    }
    
    usedSet.add(templateIndex);
    const selectedTemplate = templates[templateIndex];

    // Initialize or update story context for continuation
    this.updateStoryContext(sessionKey, selectedTemplate, userInfo, pageIndex);

    // Generate Level 0 fallback using original logic
    return this.generateContextAwareFallback(
      selectedTemplate,
      'beginner',
      userInfo,
      pageIndex,
      existingStory
    );
  }

  /**
   * NEW TEMPLATE SYSTEM - Uses 35-template library for enhanced content
   * Integrates scenes, endings, and never-ending story capability
   */
  private static getNewSystemFallback(
    difficulty: DifficultyLevel,
    userInfo: UserInfo,
    pageIndex: number,
    existingStory?: string[]
  ): string {
    try {
      // Map difficulty to new system level
      const fallbackLevel = DIFFICULTY_TO_FALLBACK_MAP[difficulty as Exclude<DifficultyLevel, 'beginner'>];
      if (!fallbackLevel) {
        console.warn(`No fallback level mapping for difficulty: ${difficulty}`);
        return this.getBasicFallback(difficulty, userInfo, pageIndex);
      }

      // Get template from new system
      const template = getFallbackTemplate(fallbackLevel);
      if (!template) {
        console.warn(`No template found for fallback level: ${fallbackLevel}`);
        return this.getBasicFallback(difficulty, userInfo, pageIndex);
      }

      // Convert userInfo to PersonalizationPlaceholders format
      const placeholders: Partial<PersonalizationPlaceholders> = {
        userName: userInfo.name || 'the child',
        favoriteColor: userInfo.favoriteColor || 'blue',
        favoriteAnimal: userInfo.favoriteAnimal || 'puppy',
        favoriteFood: userInfo.favoriteFood || 'pasta',
        hobbies: userInfo.hobbies || 'playing outside',
        specialRequest: userInfo.specialRequest || 'adventure'
      };

      // Process template with new system
      return this.processNewSystemTemplate(template, placeholders, pageIndex, difficulty);

    } catch (error) {
      console.error('Error in new system fallback:', error);
      return this.getBasicFallback(difficulty, userInfo, pageIndex);
    }
  }

  /**
   * Process new system template with scene-based structure
   */
  private static processNewSystemTemplate(
    template: StoryTemplate,
    placeholders: Partial<PersonalizationPlaceholders>,
    pageIndex: number,
    difficulty: DifficultyLevel
  ): string {
    try {
      // Determine which scene to use based on page index
      const sceneIndex = pageIndex % template.scenes.length;
      const scene = template.scenes[sceneIndex];
      
      // Get base text from scene
      let content = scene.text;
      
      // Apply personalization using new system
      content = resolveStoryPlaceholders(content, placeholders);
      
      // Add micro-variants for variety if available
      if (scene.microVariants && scene.microVariants.alternatives.length > 0) {
        const variantIndex = Math.floor(Math.random() * scene.microVariants.alternatives.length);
        const variant = scene.microVariants.alternatives[variantIndex];
        content = resolveStoryPlaceholders(variant, placeholders);
      }
      
      // Add never-ending story hook if this is a story end
      if (scene.hook && Math.random() < 0.3) { // 30% chance to add hook
        const processedHook = resolveStoryPlaceholders(scene.hook, placeholders);
        content += ` ${processedHook}`;
      }
      
      // Ensure minimum word count for difficulty
      const minWords = this.getMinimumWordsForDifficulty(difficulty);
      const wordCount = content.split(/\s+/).length;
      
      if (wordCount < minWords) {
        // Add random ending for word count extension
        const randomEnding = template.endings[Math.floor(Math.random() * template.endings.length)];
        const processedEnding = resolveStoryPlaceholders(randomEnding.text, placeholders);
        content += ` ${processedEnding}`;
      }
      
      return content;
      
    } catch (error) {
      console.error('Error processing new system template:', error);
      return this.getBasicFallback(difficulty, { 
        name: placeholders.userName || 'the child' 
      } as UserInfo, pageIndex);
    }
  }

   /**
    * Generate context-aware fallback content (PRESERVED FOR LEVEL 0)
    */
   private static generateContextAwareFallback(
     template: EnhancedFallbackTemplate,
     difficulty: DifficultyLevel,
     userInfo: UserInfo,
     pageIndex: number,
     existingStory?: string[]
   ): string {
     // Use single page logic for all difficulties including Level 0
     const position = this.determineStoryPosition(pageIndex, 10);
     const arcTemplates = template[position];
     
     const templateIndex = pageIndex % arcTemplates.length;
     const selectedTemplate = arcTemplates[templateIndex];

     const processed = this.processTemplate(selectedTemplate, userInfo, difficulty);
     
     // Ensure minimum word count for each difficulty level
     const minWords = this.getMinimumWordsForDifficulty(difficulty);
     const wordCount = processed.split(/\s+/).length;
     
     if (wordCount < minWords) {
       // Add contextual extension to meet word count requirements
       const extension = this.generateWordCountExtension(difficulty, userInfo, processed);
       const finalContent = processed + ' ' + extension;
       
       // Validate that all placeholders were replaced
       this.validateTemplateProcessing(finalContent, pageIndex);
       
       return finalContent;
     }
     
     // Validate that all placeholders were replaced
     this.validateTemplateProcessing(processed, pageIndex);
     
     return processed;
   }

  /**
   * Determine story position based on page index
   */
  private static determineStoryPosition(currentPage: number, totalPages: number): keyof EnhancedFallbackTemplate {
    const progress = currentPage / (totalPages - 1);
    
    if (progress <= 0.25) return 'setup';
    if (progress <= 0.7) return 'development';
    if (progress <= 0.9) return 'climax';
    return 'resolution';
  }

  /**
   * Process template with variable substitution
   */
  private static processTemplate(
    template: string,
    userInfo: UserInfo,
    difficulty: DifficultyLevel
  ): string {
    let processed = template;
    
    // Replace user placeholders
    const formattedName = NameFormatter.capitalize(userInfo.name || 'Alex');
    processed = processed.replace(/{userName}/g, formattedName);
    
    // Get difficulty-appropriate vocabulary
    const vocabulary = this.getDifficultyVocabulary(difficulty);
    
    // Replace story elements (both old and Level 0 format)
    processed = processed.replace(/{animal}/g, 
      userInfo.favoriteAnimal || vocabulary.animals[Math.floor(Math.random() * vocabulary.animals.length)]);
    processed = processed.replace(/{favoriteAnimal}/g, 
      userInfo.favoriteAnimal || vocabulary.animals[Math.floor(Math.random() * vocabulary.animals.length)]);
    
    processed = processed.replace(/{color}/g, 
      ensureColorName(userInfo.favoriteColor) || vocabulary.colors[Math.floor(Math.random() * vocabulary.colors.length)]);
    processed = processed.replace(/{favoriteColor}/g, 
      ensureColorName(userInfo.favoriteColor) || vocabulary.colors[Math.floor(Math.random() * vocabulary.colors.length)]);
      
    processed = processed.replace(/{object}/g, 
      vocabulary.objects[Math.floor(Math.random() * vocabulary.objects.length)]);
    
    // Level 0 specific placeholders
    processed = processed.replace(/{favoriteFood}/g, 
      userInfo.favoriteFood || 'food');
    processed = processed.replace(/{hobbies}/g, 
      userInfo.hobbies || 'playing');
    processed = processed.replace(/{specialRequest}/g, 
      userInfo.specialRequest || '');
    
    return processed;
  }

  /**
   * Get vocabulary appropriate for difficulty level
   */
  private static getDifficultyVocabulary(difficulty: DifficultyLevel) {
    const vocabularies = {
      beginner: {
        animals: ['cat', 'dog', 'bird', 'fish', 'frog'],
        colors: ['red', 'blue', 'yellow'],
        objects: ['ball', 'book', 'toy']
      },
      easy: {
        animals: ['cat', 'dog', 'bird', 'fish', 'bear', 'frog'],
        colors: ['red', 'blue', 'green', 'yellow', 'pink', 'brown'],
        objects: ['ball', 'book', 'toy', 'flower', 'stone', 'shell']
      },
      medium: {
        animals: ['rabbit', 'owl', 'deer', 'fox', 'turtle', 'butterfly'],
        colors: ['golden', 'silver', 'emerald', 'sapphire', 'crimson', 'violet'],
        objects: ['treasure', 'crystal', 'scroll', 'compass', 'lantern', 'map']
      },
      hard: {
        animals: ['wolf', 'eagle', 'panther', 'raven', 'falcon', 'phoenix'],
        colors: ['iridescent', 'luminescent', 'opalescent', 'chromatic'],
        objects: ['artifact', 'relic', 'talisman', 'codex', 'grimoire', 'medallion']
      },
      expert: {
        animals: ['phoenix', 'dragon', 'sphinx', 'pegasus', 'leviathan'],
        colors: ['transcendent', 'ethereal', 'celestial', 'cosmic', 'infinite'],
        objects: ['paradigm', 'synthesis', 'manifestation', 'consciousness', 'enlightenment']
      }
    };
    
    return vocabularies[difficulty];
  }

  /**
   * Basic fallback for extreme error conditions
   */
  private static getBasicFallback(
    difficulty: DifficultyLevel,
    userInfo: UserInfo,
    pageIndex: number
  ): string {
    const name = NameFormatter.capitalize(userInfo.name || 'Alex');
    
    const basicFallbacks = {
      beginner: [
        `${name} can play.`,
        `${name} is happy.`,
        `${name} has fun.`
      ],
      easy: [
        `${name} has fun today.`,
        `${name} plays outside.`,
        `${name} feels happy.`
      ],
      medium: [
        `${name} discovers something wonderful.`,
        `${name} learns something new today.`,
        `${name} makes a good friend.`
      ],
      hard: [
        `${name} faces a challenge with courage and determination.`,
        `${name} learns valuable lessons about perseverance and growth.`,
        `${name} discovers inner strength through this experience.`
      ],
      expert: [
        `${name} contemplates the deeper meaning of this experience and its implications.`,
        `${name} synthesizes new understanding from the complex challenges they have encountered.`,
        `${name} develops a more nuanced perspective on life's fundamental questions.`
      ]
    };
    
    const fallbacks = basicFallbacks[difficulty];
    return fallbacks[pageIndex % fallbacks.length];
  }

  /**
   * Validate that template processing was successful
   */
  private static validateTemplateProcessing(content: string, pageIndex: number): void {
    const unreplacedPlaceholders = content.match(/\{[^}]+\}/g);
    
    if (unreplacedPlaceholders) {
      console.warn(`🚨 Template validation failed on page ${pageIndex}:`, {
        unreplacedPlaceholders,
        content: content.substring(0, 100) + '...'
      });
    }
  }

  /**
   * Update story context for continuation support
   */
  private static updateStoryContext(
    sessionKey: string,
    template: EnhancedFallbackTemplate,
    userInfo: UserInfo,
    pageIndex: number
  ): void {
    if (!this.storyContext.has(sessionKey)) {
      this.storyContext.set(sessionKey, {
        characters: [userInfo.favoriteAnimal || 'friend'],
        themes: ['friendship', 'adventure'],
        plotElements: template.continuationPoints || []
      });
    }
    
    // Update context with new story elements
    const context = this.storyContext.get(sessionKey)!;
    if (template.nextStorySeeds && template.nextStorySeeds.length > 0) {
      context.plotElements.push(...template.nextStorySeeds);
    }
  }

  /**
   * Get continuation content for ongoing stories
   */
  static getContinuationContent(
    difficulty: DifficultyLevel,
    userInfo: UserInfo,
    pageIndex: number
  ): string {
    const sessionKey = `${difficulty}-${userInfo.name || 'guest'}`;
    const context = this.storyContext.get(sessionKey);
    
    if (!context || !context.plotElements.length) {
      // Fall back to regular template if no continuation context
      return this.getFallbackTemplate(difficulty, userInfo, pageIndex);
    }
    
    // Use stored plot elements for continuation
    const plotElement = context.plotElements[pageIndex % context.plotElements.length];
    const name = NameFormatter.capitalize(userInfo.name || 'Alex');
    
    return `${name} ${plotElement.toLowerCase()}.`;
  }

  /**
   * Get minimum word count for difficulty level
   */
  private static getMinimumWordsForDifficulty(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'beginner': return 2; // Level 0: 1 sentence per page (2-8 words)
      case 'easy': return 25; // Basic paragraphs  
      case 'medium': return 38; // Compound sentences
      case 'hard': return 45; // Complex paragraphs
      case 'expert': return 49; // Sophisticated content
      default: 
        // Handle expert grade levels (6th, 7th, 8th, 9th, 10th)
        const difficultyStr = String(difficulty);
        if (difficultyStr.includes('th')) {
          return 75; // Expert grade levels need substantial content
        }
        return 30;
    }
  }

  /**
   * Generate word count extension to meet minimum requirements
   */
  private static generateWordCountExtension(difficulty: DifficultyLevel, userInfo: UserInfo, baseContent: string): string {
    const extensions = [
      `${userInfo.name} felt excited about this new adventure and looked forward to sharing it with friends.`,
      `This experience taught ${userInfo.name} important lessons about perseverance and creativity.`,
      `As ${userInfo.name} reflected on the day, they realized how much they had learned and grown.`,
      `The ${userInfo.favoriteColor || 'bright'} sky reminded ${userInfo.name} of all the possibilities ahead.`,
      `${userInfo.name} couldn't wait to tell ${userInfo.favoriteAnimal || 'their pet'} about this amazing experience.`
    ];
    
    const randomExtension = extensions[Math.floor(Math.random() * extensions.length)];
    return randomExtension;
  }

  /**
   * Clear session data for testing or reset
   */
  static clearSession(): void {
    this.usedTemplates.clear();
    this.storyContext.clear();
  }
}