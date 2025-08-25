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
  continuationPoints: string[]; // NEW: Story continuation hooks
  nextStorySeeds: string[];     // NEW: Ideas for next story
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
 * ALL 231+ TEMPLATES: Comprehensive fallback system with proper user placeholders
 * Level segregation ensures appropriate content for each difficulty
 * Never-ending story hooks create seamless continuation flow
 */
export const ENHANCED_FALLBACK_TEMPLATES: Record<DifficultyLevel, EnhancedFallbackTemplate[]> = {
  // BEGINNER: Level 0 templates (40) + Level 0 extensions (7) + enhanced (1) = 48 templates
  beginner: [
    // Convert Level 0 templates to enhanced format
    ...LEVEL_0_TEMPLATES.map(template => ({
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
        "They have fun."
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
  ],
  // EASY: Level 1 templates (40) + Level 1 extensions (7) + enhanced fallbacks (2) = 49 templates  
  easy: [
    // Convert Level 1 templates to enhanced format
    ...LEVEL_1_TEMPLATES.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: [],
      continuationPoints: ["What adventure comes next?", "Who will they meet?"],
      nextStorySeeds: ["A new challenge appears", "An exciting discovery awaits"]
    })),
    // Convert Level 1 extensions
    ...LEVEL_1_EXTENSIONS.map(template => ({
      setup: template.slice(0, 2),
      development: template.slice(2, 3),
      climax: template.slice(3, 4),
      resolution: template.slice(4, 5),
      contextualContinuations: [],
      continuationPoints: ["What adventure comes next?", "Who will they meet?"],
      nextStorySeeds: ["A new challenge appears", "An exciting discovery awaits"]
    })),
    // Enhanced fallbacks with proper user placeholders and never-ending hooks
    {
      setup: [
        "{userName} goes to the park today.",
        "{userName} sees a {favoriteAnimal} there.",
        "The {favoriteAnimal} looks friendly and nice."
      ],
      development: [
        "{userName} says hello to the {favoriteAnimal}.",
        "The {favoriteAnimal} wants to play together.",
        "They play with a {favoriteColor} ball while thinking about {hobbies}."
      ],
      climax: [
        "The ball rolls away fast toward the playground.",
        "{userName} and {favoriteAnimal} run after it together.",
        "They work as a team to retrieve it."
      ],
      resolution: [
        "They get the ball back and share some {favoriteFood}.",
        "{userName} and {favoriteAnimal} are happy friends.",
        "They plan tomorrow's adventure. What exciting quest will they choose?"
      ],
      contextualContinuations: ["The next day brings new challenges", "Other animals want to join their friendship"],
      continuationPoints: ["What thrilling adventure awaits tomorrow?", "Which new friend will they meet?"],
      nextStorySeeds: ["A treasure map appears in the wind", "Strange footprints lead to mystery"]
    },
    {
      setup: [
        "{userName} finds a magical {favoriteColor} stone outside.",
        "It sparkles like the {favoriteAnimal} in their dreams.",
        "{userName} picks it up with curiosity."
      ],
      development: [
        "A wise {favoriteAnimal} comes to investigate the discovery.",
        "The {favoriteAnimal} knows ancient secrets about magical stones.",
        "Together they study the stone's mysterious patterns."
      ],
      climax: [
        "The stone begins glowing with {favoriteColor} light.",
        "It whispers secrets about {specialRequest} adventures.",
        "{userName} and {favoriteAnimal} listen with wonder."
      ],
      resolution: [
        "The stone grants them a wish for {hobbies} adventures.",
        "{userName} shares the magic with their {favoriteAnimal} friend.",
        "They both feel the magic growing stronger. What wish will they make next?"
      ],
      contextualContinuations: ["The magic stone leads to hidden realms", "Ancient guardians emerge from the shadows"],
      continuationPoints: ["What magical realm will the stone reveal?", "Which ancient secrets await discovery?"],
      nextStorySeeds: ["A portal opens to enchanted lands", "Mystical creatures emerge from hiding"]
    }
  ],

  // MEDIUM: Level 2 templates (40) + Level 2 extensions (6) + enhanced fallbacks (2) = 48 templates
  medium: [
    // Convert Level 2 templates to enhanced format (2 sentences per section for 38+ words)
    ...LEVEL_2_TEMPLATES.map(template => ({
      setup: [template.slice(0, 2).join(' ')],
      development: [template.slice(1, 3).join(' ')],
      climax: [template.slice(2, 4).join(' ')],
      resolution: [template.slice(3, 5).join(' ')],
      contextualContinuations: [],
      continuationPoints: ["What deeper mysteries await?", "How will this journey continue?"],
      nextStorySeeds: ["A greater challenge emerges", "Hidden secrets are revealed"]
    })),
    // Convert Level 2 extensions (2 sentences per section for proper word count)
    ...LEVEL_2_EXTENSIONS.map(template => ({
      setup: [template.slice(0, 2).join(' ')],
      development: [template.slice(1, 3).join(' ')],
      climax: [template.slice(2, 4).join(' ')],
      resolution: [template.slice(3, 5).join(' ')],
      contextualContinuations: [],
      continuationPoints: ["What deeper mysteries await?", "How will this journey continue?"],
      nextStorySeeds: ["A greater challenge emerges", "Hidden secrets are revealed"]
    })),
    // Enhanced medium-level fallbacks with comprehensive user personalization
    {
      setup: [
        "{userName} discovers a mysterious path through the {favoriteColor} forest.",
        "The path sparkles with stones that remind them of {favoriteAnimal} scales.",
        "A wise {favoriteAnimal} appears, drawn by {userName}'s love of {hobbies}."
      ],
      development: [
        "The {favoriteAnimal} leads {userName} to a hidden grove of {favoriteFood} trees.",
        "In the center grows a magnificent tree bearing {favoriteColor} fruit.",
        "The tree whispers secrets about {specialRequest} and natural magic."
      ],
      climax: [
        "Suddenly, the tree begins losing its magical glow and strength.",
        "{userName} realizes their {hobbies} skills might help save it.",
        "Working with the {favoriteAnimal}, they combine wisdom and creativity."
      ],
      resolution: [
        "{userName} learns that sharing {favoriteFood} and kindness heals everything.",
        "The tree regains its vibrant {favoriteColor} glow completely.",
        "The forest celebrates their teamwork and growing wisdom. What environmental challenge will they face next?"
      ],
      contextualContinuations: ["Ancient forest spirits emerge from hiding", "The tree's magic spreads to heal other wounded places"],
      continuationPoints: ["What deeper environmental mysteries await discovery?", "How will their conservation journey continue?"],
      nextStorySeeds: ["A dying river calls for their help", "Mysterious pollution threatens the animal kingdom"]
    },
    {
      setup: [
        "{userName} receives an invitation to a {favoriteColor} celebration of {specialRequest}.",
        "The invitation features beautiful drawings of {favoriteAnimal} and {hobbies}.",
        "A clever {favoriteAnimal} messenger delivered it while {userName} was enjoying {favoriteFood}."
      ],
      development: [
        "At the celebration, {userName} meets friends who share their passion for {hobbies}.",
        "Everyone displays talents related to {favoriteAnimal} care and {specialRequest}.",
        "The {favoriteAnimal} teaches {userName} traditional dances from their culture."
      ],
      climax: [
        "When it's {userName}'s turn to share their {hobbies} expertise,",
        "they feel nervous about presenting their {favoriteColor} project.",
        "The supportive friends encourage {userName} to share their {specialRequest} vision anyway."
      ],
      resolution: [
        "{userName} discovers their unique talent for combining {hobbies} with {specialRequest}.",
        "Everyone appreciates how {userName}'s {favoriteFood} recipes brought the community together.",
        "The experience teaches them about leadership and cultural appreciation. Which tradition will they learn next?"
      ],
      contextualContinuations: ["Cultural exchange programs emerge from the celebration", "New international friendships blossom from shared interests"],
      continuationPoints: ["What cultural celebrations will they organize next?", "Which global friends will join their mission?"],
      nextStorySeeds: ["An international pen pal writes seeking help", "A cultural festival needs their unique skills"]
    }
  ],

  // HARD: Level 3 templates (40) + Level 3 extensions (6) + enhanced fallback (1) = 47 templates
  hard: [
    // Convert Level 3 templates to enhanced format (3 sentences per section for 45+ words)
    ...LEVEL_3_TEMPLATES.map(template => ({
      setup: [template.slice(0, 2).join(' ') + (template[2] ? ' ' + template[2] : '')],
      development: [template.slice(1, 3).join(' ') + (template[3] ? ' ' + template[3] : '')],
      climax: [template.slice(2, 4).join(' ') + (template[4] ? ' ' + template[4] : '')],
      resolution: [template.slice(3, 5).join(' ')],
      contextualContinuations: [],
      continuationPoints: ["What moral complexities will emerge?", "How will leadership be tested?"],
      nextStorySeeds: ["Greater responsibilities await", "Complex ethical dilemmas arise"]
    })),
    // Convert Level 3 extensions (3 sentences per section for proper word count)
    ...LEVEL_3_EXTENSIONS.map(template => ({
      setup: [template.slice(0, 2).join(' ') + (template[2] ? ' ' + template[2] : '')],
      development: [template.slice(1, 3).join(' ') + (template[3] ? ' ' + template[3] : '')],
      climax: [template.slice(2, 4).join(' ') + (template[4] ? ' ' + template[4] : '')],
      resolution: [template.slice(3, 5).join(' ')],
      contextualContinuations: [],
      continuationPoints: ["What moral complexities will emerge?", "How will leadership be tested?"],
      nextStorySeeds: ["Greater responsibilities await", "Complex ethical dilemmas arise"]
    })),
    // Enhanced hard-level fallback with deep personalization and moral complexity
    {
      setup: [
        "{userName} lived in a peaceful village where everyone shared {favoriteFood} and pursued {hobbies} together harmoniously.",
        "One morning, they noticed that the village's ancient {favoriteColor} crystal had stopped glowing mysteriously.",
        "The wise elder {favoriteAnimal} explained that this loss of light meant {specialRequest} was endangered."
      ],
      development: [
        "{userName} volunteered to journey to distant mountains, using their {hobbies} skills for navigation.",
        "Along the treacherous path, they encountered challenges that tested both their {specialRequest} values and determination.",
        "A loyal {favoriteAnimal} companion joined the quest, sharing wisdom about {favoriteColor} crystal magic."
      ],
      climax: [
        "At the mountain's peak, {userName} discovered the solution required sacrificing their prized {favoriteFood} collection.",
        "They faced choosing between personal {hobbies} dreams and their community's survival needs.",
        "With profound wisdom beyond their years, {userName} chose to embrace {specialRequest} over self-interest."
      ],
      resolution: [
        "Their selfless choice restored the {favoriteColor} crystal's power and saved the entire community.",
        "{userName} learned that true leadership means embodying {specialRequest} through service to others.",
        "The village flourished with renewed {favoriteAnimal} populations and {favoriteFood} abundance. What greater moral challenge will test their character next?"
      ],
      contextualContinuations: ["Neighboring villages seek guidance from their wisdom", "Ancient prophecies reveal greater responsibilities ahead"],
      continuationPoints: ["What complex ethical dilemmas will challenge their growing wisdom?", "How will their leadership inspire others to embrace sacrifice?"],
      nextStorySeeds: ["A moral crisis divides two allied communities", "Ancient enemies seek reconciliation through their example"]
    }
  ],

  // EXPERT: Level 4 templates (40) + Level 4 extensions (5) + Enhanced fallback (1) = 46 templates
  expert: [
    // Convert Level 4 templates to enhanced format (4-5 sentences per section for 49+ words)
    ...LEVEL_4_TEMPLATES.map(template => ({
      setup: [template.slice(0, 2).join(' ') + (template[2] ? ' ' + template[2] : '') + (template[3] ? ' ' + template[3] : '')],
      development: [template.slice(1, 4).join(' ') + (template[4] ? ' ' + template[4] : '')],
      climax: [template.slice(2, 5).join(' ')],
      resolution: [template.slice(3, 5).join(' ') + (template[0] ? ' ' + template[0].replace(/\{userName\}/g, '{userName}') : '')],
      contextualContinuations: [],
      continuationPoints: ["What philosophical depths await exploration?", "How will wisdom manifest?"],
      nextStorySeeds: ["Deeper philosophical questions emerge", "Abstract concepts take concrete form"]
    })),
    // Convert Level 4 extensions (4-5 sentences per section for substantial content)
    ...LEVEL_4_EXTENSIONS.map(template => ({
      setup: [template.slice(0, 2).join(' ') + (template[2] ? ' ' + template[2] : '') + (template[3] ? ' ' + template[3] : '')],
      development: [template.slice(1, 4).join(' ') + (template[4] ? ' ' + template[4] : '')],
      climax: [template.slice(2, 5).join(' ')],
      resolution: [template.slice(3, 5).join(' ') + (template[0] ? ' ' + template[0].replace(/\{userName\}/g, '{userName}') : '')],
      contextualContinuations: [],
      continuationPoints: ["What philosophical depths await exploration?", "How will wisdom manifest?"],
      nextStorySeeds: ["Deeper philosophical questions emerge", "Abstract concepts take concrete form"]
    })),
    {
      setup: [
        "{userName} began questioning fundamental principles about {specialRequest} that governed their society and beliefs.",
        "These philosophical inquiries led to deep conversations with the enlightened {favoriteAnimal} who served as mentor.",
        "Together they explored complex concepts of justice, truth, and how {hobbies} shapes human understanding."
      ],
      development: [
        "Through rigorous intellectual discourse about {favoriteColor} symbolism, {userName} examined various worldviews and perspectives.",
        "The journey revealed contradictions between idealistic {specialRequest} theories and practical realities of {favoriteFood} scarcity.",
        "Each insight about {favoriteAnimal} behavior brought clarity and additional questions about ethical living."
      ],
      climax: [
        "{userName} faced a profound moral dilemma where {specialRequest} values conflicted with {hobbies} community needs.",
        "The decision required integrating philosophical understanding of {favoriteColor} justice with compassionate action.",
        "No simple answer existed about balancing {favoriteAnimal} welfare with human {favoriteFood} requirements."
      ],
      resolution: [
        "Through thoughtful reflection about {specialRequest}, {userName} developed nuanced understanding of ethical complexity.",
        "They learned that wisdom means embracing paradox while maintaining commitment to {favoriteColor} truth and justice.",
        "This growth transformed {userName} into a bridge between {hobbies} idealism and practical compassion. What profound philosophical question will challenge them next?"
      ],
      contextualContinuations: ["Philosophical schools seek their synthesized wisdom", "Ancient texts reveal deeper layers of ethical complexity"],
      continuationPoints: ["What metaphysical mysteries will expand their consciousness?", "How will their philosophical insights reshape society?"],
      nextStorySeeds: ["A cosmic ethical dilemma transcends earthly concerns", "Time itself becomes a philosophical laboratory"]
    }
  ]
};

/**
 * Enhanced fallback template selector with session management and continuation support
 */
export class EnhancedFallbackManager {
  private static usedTemplates: Map<string, Set<number>> = new Map();
  private static storyContext: Map<string, { characters: string[], themes: string[], plotElements: string[] }> = new Map();

  /**
   * Get an enhanced fallback template for the given difficulty and context
   * Now supports story continuation with consistent narrative elements
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

    // Initialize or update story context for continuation
    this.updateStoryContext(sessionKey, selectedTemplate, userInfo, pageIndex);

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
        `{userName} can play.`,
        `{userName} is happy.`,
        `{userName} has fun.`
      ],
      easy: [
        `{userName} has fun today.`,
        `{userName} plays outside.`,
        `{userName} feels happy.`
      ],
      medium: [
        `{userName} discovers something wonderful.`,
        `{userName} learns something new today.`,
        `{userName} makes a good friend.`
      ],
      hard: [
        `{userName} faces a challenge with courage and determination.`,
        `{userName} learns valuable lessons about perseverance and growth.`,
        `{userName} discovers inner strength through this experience.`
      ],
      expert: [
        `{userName} contemplates the deeper meaning of this experience and its implications.`,
        `{userName} synthesizes new understanding from the complex challenges they have encountered.`,
        `{userName} develops a more nuanced perspective on life's fundamental questions.`
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
    
    return `{userName} ${plotElement.toLowerCase()}.`;
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