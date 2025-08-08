/**
 * Enhanced Fallback Templates System
 * Uses character-driven story arcs and context-aware generation for high-quality fallbacks
 */

import { UserInfo, DifficultyLevel } from "@/types";
import { NameFormatter } from "@/utils/nameFormatter";
import { ensureColorName } from "@/utils/colorConverter";

export interface EnhancedFallbackTemplate {
  setup: string[];
  development: string[];
  climax: string[];
  resolution: string[];
  contextualContinuations: string[];
}

// Import all templates from the grade-based system including new Level 0
import { LEVEL_0_TEMPLATES } from './gradeBased/level0Templates';
import { LEVEL_0_EXTENSIONS } from './gradeBased/level0ExtensionTemplates';
import { LEVEL_1_TEMPLATES } from './gradeBased/level1Templates';
import { LEVEL_1_EXTENSIONS } from './gradeBased/level1ExtensionTemplates';
import { LEVEL_2_TEMPLATES } from './gradeBased/level2Templates';
import { LEVEL_2_EXTENSIONS } from './gradeBased/level2ExtensionTemplates';
import { LEVEL_3_TEMPLATES } from './gradeBased/level3Templates';
import { LEVEL_3_EXTENSIONS } from './gradeBased/level3ExtensionTemplates';
import { LEVEL_4_TEMPLATES } from './gradeBased/level4Templates';
import { LEVEL_4_EXTENSIONS } from './gradeBased/level4ExtensionTemplates';

/**
 * ALL 182 TEMPLATES: 160 base + 15 extension + 7 enhanced fallback
 * Now consolidated in one place for ultimate reliability
 */
export const ENHANCED_FALLBACK_TEMPLATES: Record<DifficultyLevel, EnhancedFallbackTemplate[]> = {
  // BEGINNER: Level 0 templates (40) + Level 0 extensions (5) = 45 templates
  beginner: [
    // Convert Level 0 templates to enhanced format
    ...LEVEL_0_TEMPLATES.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    // Convert Level 0 extensions (universal access)
    ...LEVEL_0_EXTENSIONS.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    // Original enhanced fallback
    {
      setup: [
        "{userName} sees a {animal}.",
        "The {animal} is {color}.",
        "{userName} can play."
      ],
      development: [
        "{userName} and {animal} play.",
        "They run and jump.",
        "The {animal} is happy."
      ],
      climax: [
        "{userName} helps the {animal}.",
        "They are good friends.",
        "They have fun."
      ],
      resolution: [
        "{userName} is happy.",
        "The {animal} is happy.",
        "It is a good day."
      ],
      contextualContinuations: []
    }
  ],
  // EASY: Level 1 templates (40) + Level 1 extensions (5) + enhanced fallbacks (2) = 47 templates  
  easy: [
    // Convert Level 1 templates to enhanced format
    ...LEVEL_1_TEMPLATES.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    // Convert Level 1 extensions
    ...LEVEL_1_EXTENSIONS.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    // Original enhanced fallbacks
    {
      setup: [
        "{userName} goes to the park today.",
        "{userName} sees a {animal} there.",
        "The {animal} looks friendly and nice."
      ],
      development: [
        "{userName} says hello to the {animal}.",
        "The {animal} wants to play together.",
        "They play with a {color} ball."
      ],
      climax: [
        "The ball rolls away fast.",
        "{userName} and {animal} run after it.",
        "They work together to get it."
      ],
      resolution: [
        "They get the ball back together.",
        "{userName} and {animal} are happy.",
        "They are good friends now."
      ],
      contextualContinuations: []
    },
    {
      setup: [
        "{userName} finds a {object} outside.",
        "It is very {color} and pretty.",
        "{userName} picks it up carefully."
      ],
      development: [
        "A {animal} comes over to see.",
        "The {animal} wants to help {userName}.",
        "They look at the {object} together."
      ],
      climax: [
        "The {object} starts to glow bright.",
        "It makes a soft, happy sound.",
        "{userName} and {animal} are surprised."
      ],
      resolution: [
        "The {object} brings them good luck.",
        "{userName} shares it with {animal}.",
        "They both feel very happy."
      ],
      contextualContinuations: []
    }
  ],

  // MEDIUM: Level 2 templates (40) + Level 2 extensions (5) + enhanced fallbacks (2) = 47 templates
  medium: [
    // Convert Level 2 templates to enhanced format  
    ...LEVEL_2_TEMPLATES.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    // Convert Level 2 extensions
    ...LEVEL_2_EXTENSIONS.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    // Original enhanced fallbacks
    {
      setup: [
        "{userName} discovers a mysterious path in the forest.",
        "The path is covered with sparkling {color} stones.",
        "A wise {animal} appears to guide the way."
      ],
      development: [
        "The {animal} leads {userName} to a hidden grove.",
        "In the center grows a magnificent {object} tree.",
        "The tree seems to whisper secrets of nature."
      ],
      climax: [
        "Suddenly, the tree begins to lose its magical glow.",
        "{userName} realizes the tree needs their help urgently.",
        "Working with {animal}, they search for the solution."
      ],
      resolution: [
        "{userName} learns that caring for nature heals everything.",
        "The tree regains its beautiful, vibrant glow completely.",
        "The forest celebrates their act of kindness and wisdom."
      ],
      contextualContinuations: []
    },
    {
      setup: [
        "{userName} receives an invitation to a special celebration.",
        "The invitation is written in shimmering {color} ink.",
        "A clever {animal} messenger delivered it personally."
      ],
      development: [
        "At the celebration, {userName} meets many interesting friends.",
        "Everyone shares their unique talents and special gifts.",
        "The {animal} teaches {userName} an important traditional dance."
      ],
      climax: [
        "When it's {userName}'s turn to share something special,",
        "they feel nervous and unsure of their abilities.",
        "The supportive friends encourage {userName} to try anyway."
      ],
      resolution: [
        "{userName} discovers their own unique talent for bringing joy.",
        "Everyone appreciates {userName}'s authentic contribution to the celebration.",
        "The experience teaches them about confidence and community belonging."
      ],
      contextualContinuations: []
    }
  ],

  // HARD: Level 3 templates (40) + Level 3 extensions (5) + enhanced fallback (1) = 46 templates
  hard: [
    // Convert Level 3 templates to enhanced format
    ...LEVEL_3_TEMPLATES.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    // Convert Level 3 extensions
    ...LEVEL_3_EXTENSIONS.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    // Original enhanced fallback
    {
      setup: [
        "{userName} lived in a peaceful village where everyone worked together harmoniously.",
        "One morning, they noticed that the village's ancient {object} had stopped glowing mysteriously.",
        "The wise elder {animal} explained that this meant trouble was approaching the community."
      ],
      development: [
        "{userName} volunteered to journey to the distant mountains to seek the legendary solution.",
        "Along the dangerous path, they encountered various challenges that tested their courage and determination.",
        "A helpful {animal} companion joined the quest, bringing valuable knowledge about the ancient mysteries."
      ],
      climax: [
        "At the mountain's peak, {userName} discovered that the solution required a significant personal sacrifice.",
        "They had to choose between their own dreams and the welfare of their community.",
        "With great courage, {userName} made the difficult choice to put others before themselves."
      ],
      resolution: [
        "Their selfless decision restored the {object}'s power and saved the entire village community.",
        "{userName} learned that true leadership means serving others with wisdom and compassion.",
        "The village thrived, and {userName} became known for their character and moral strength."
      ],
      contextualContinuations: []
    }
  ],

  // EXPERT: Level 4 templates (40) + Level 4 extensions (5) + Enhanced fallback (1) = 46 templates
  expert: [
    // Convert Level 4 templates to enhanced format
    ...LEVEL_4_TEMPLATES.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    // Convert Level 4 extensions
    ...LEVEL_4_EXTENSIONS.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: []
    })),
    {
      setup: [
        "{userName} began questioning the fundamental principles that governed their society and personal beliefs.",
        "These philosophical inquiries led to deep conversations with the enlightened {animal} who served as mentor.",
        "Together they explored complex concepts of justice, truth, and the nature of human existence."
      ],
      development: [
        "Through rigorous intellectual discourse and careful observation, {userName} examined various worldviews and perspectives.",
        "The journey of understanding revealed contradictions between idealistic theories and practical realities of life.",
        "Each new insight brought both clarity and additional questions about the complexities of ethical living."
      ],
      climax: [
        "{userName} faced a profound moral dilemma that challenged everything they believed about right and wrong.",
        "The decision required integrating philosophical understanding with practical wisdom and compassionate action.",
        "No simple answer existed, forcing {userName} to synthesize multiple viewpoints into a coherent personal philosophy."
      ],
      resolution: [
        "Through thoughtful reflection and dialogue, {userName} developed a nuanced understanding of ethical complexity.",
        "They learned that wisdom comes from embracing paradox while maintaining commitment to truth and justice.",
        "This intellectual and spiritual growth transformed {userName} into a bridge between different ways of thinking."
      ],
      contextualContinuations: []
    }
  ]
};

/**
 * Enhanced fallback template selector with session management
 */
export class EnhancedFallbackManager {
  private static usedTemplates: Map<string, Set<number>> = new Map();

  /**
   * Get an enhanced fallback template for the given difficulty and context
   */
  static getFallbackTemplate(
    difficulty: DifficultyLevel,
    userInfo: UserInfo,
    pageIndex: number,
    existingStory?: string[]
  ): string {
    const sessionKey = `${difficulty}-${userInfo.name || 'guest'}`;
    
    // Get available templates for this difficulty
    const templates = ENHANCED_FALLBACK_TEMPLATES[difficulty];
    
    if (!templates || templates.length === 0) {
      return this.getBasicFallback(difficulty, userInfo, pageIndex);
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

    // Generate context-aware fallback using story arc structure
    return this.generateContextAwareFallback(
      selectedTemplate,
      difficulty,
      userInfo,
      pageIndex,
      existingStory
    );
  }

  /**
   * Generate context-aware fallback content
   */
  private static generateContextAwareFallback(
    template: EnhancedFallbackTemplate,
    difficulty: DifficultyLevel,
    userInfo: UserInfo,
    pageIndex: number,
    existingStory?: string[]
  ): string {
    // For Level 0 (beginner), return complete story instead of single page
    if (difficulty === 'beginner' && pageIndex === 0) {
      // Return complete 5-page story by combining all template parts
      const allPages = [
        ...template.setup,
        ...template.development, 
        ...template.climax,
        ...template.resolution
      ];
      
      // Process all pages and return as complete story
      const processedPages = allPages.map(page => this.processTemplate(page, userInfo, difficulty));
      
      // Validate all pages
      processedPages.forEach((page, idx) => this.validateTemplateProcessing(page, idx));
      
      return processedPages.join('\n\n');
    }
    
    // For other difficulties or subsequent pages, use single page logic
    const position = this.determineStoryPosition(pageIndex, 10);
    const arcTemplates = template[position];
    
    const templateIndex = pageIndex % arcTemplates.length;
    const selectedTemplate = arcTemplates[templateIndex];

    const processed = this.processTemplate(selectedTemplate, userInfo, difficulty);
    
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
   * Clear session data for testing or reset
   */
  static clearSession(): void {
    this.usedTemplates.clear();
  }
}