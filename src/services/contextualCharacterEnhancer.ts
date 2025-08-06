// Contextual Character Enhancement System
// Replaces broken placeholder system with intelligent character integration

import type { UserInfo, DifficultyLevel } from '../types';
import { CharacterPoolManager, CharacterPool } from './characterPoolManager';
import { InputEnhancementEngine } from './inputEnhancementEngine';
import { validateSentence } from '@/constants/gradeBased/unifiedTemplateSystem';

interface EnhancementContext {
  currentPage: number;
  totalPages: number;
  gradeLevel: number;
  templateTheme: string;
  storyProgression: 'opening' | 'development' | 'climax' | 'resolution';
}

interface CharacterRole {
  name: string;
  type: 'companion' | 'helper' | 'mentor' | 'collaborator' | 'friend';
  relationship: string;
  insertionPhrase: string;
}

export class ContextualCharacterEnhancer {
  private static themeAnalysisCache = new Map<string, string>();
  private static insertionPatternsCache = new Map<string, string[]>();

  /**
   * Main enhancement method - replaces broken placeholder system
   */
  static enhanceTemplateWithContext(
    templateContent: string,
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    context: EnhancementContext
  ): string {
    try {
      console.log(`🎭 Starting contextual character enhancement for page ${context.currentPage}`);
      
      // Analyze template theme for appropriate character roles
      const theme = this.analyzeTemplateTheme(templateContent);
      console.log(`📚 Detected template theme: ${theme}`);

      // Get character pool and enhanced inputs
      const characterPool = CharacterPoolManager.getCharacterPool(userInfo);
      const enhancedInputs = InputEnhancementEngine.enhanceUserInputs(userInfo);

      if (!characterPool) {
        console.log('⚠️ No character pool available, returning original content');
        return templateContent;
      }

      // Determine appropriate character role for this context
      const characterRole = this.selectCharacterRole(theme, context, characterPool);
      
      if (!characterRole) {
        console.log('ℹ️ No appropriate character role found, returning original content');
        return templateContent;
      }

      // Find natural insertion points in the template
      const enhancedContent = this.insertCharacterAtNaturalPoints(
        templateContent,
        characterRole,
        context,
        userInfo.name || 'Alex'
      );

      // Validate vocabulary compliance after enhancement
      const gradeLevel = this.mapDifficultyToGradeLevel(difficulty);
      const validation = validateSentence(
        enhancedContent, 
        gradeLevel as any, // GradeLevel type compatibility
        userInfo.name
      );

      if (!validation.isValid) {
        console.log(`❌ Enhanced content failed vocabulary validation, using original`);
        return templateContent;
      }

      console.log(`✅ Successfully enhanced template with ${characterRole.name} as ${characterRole.type}`);
      return enhancedContent;

    } catch (error) {
      console.error('Character enhancement error:', error);
      return templateContent; // Always return original on error
    }
  }

  /**
   * Analyze template content to determine theme and context
   */
  private static analyzeTemplateTheme(content: string): string {
    const cacheKey = content.slice(0, 100);
    const cached = this.themeAnalysisCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const themes = {
      'science': ['experiment', 'laboratory', 'research', 'investigate', 'discovery', 'observe', 'test', 'study'],
      'school': ['classroom', 'teacher', 'lesson', 'homework', 'student', 'learn', 'education', 'class'],
      'community': ['neighborhood', 'helper', 'volunteer', 'community', 'together', 'help', 'share'],
      'adventure': ['explore', 'journey', 'adventure', 'discover', 'travel', 'expedition', 'quest'],
      'nature': ['forest', 'garden', 'animals', 'plants', 'outdoors', 'environment', 'ecosystem'],
      'creativity': ['art', 'music', 'create', 'build', 'design', 'imagine', 'craft', 'paint'],
      'friendship': ['friend', 'together', 'share', 'play', 'team', 'cooperation', 'bond'],
      'family': ['family', 'home', 'parent', 'sibling', 'relative', 'household', 'tradition']
    };

    const lowerContent = content.toLowerCase();
    let bestTheme = 'general';
    let maxMatches = 0;

    for (const [theme, keywords] of Object.entries(themes)) {
      const matches = keywords.filter(keyword => lowerContent.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestTheme = theme;
      }
    }

    this.themeAnalysisCache.set(cacheKey, bestTheme);
    return bestTheme;
  }

  /**
   * Select appropriate character role based on theme and context
   */
  private static selectCharacterRole(
    theme: string,
    context: EnhancementContext,
    characterPool: CharacterPool
  ): CharacterRole | null {
    const storyPosition = context.currentPage / context.totalPages;
    
    // Define character roles by theme and story position
    const roleMapping = {
      'science': {
        early: { type: 'collaborator', relationship: 'lab partner', phrase: 'with help from' },
        middle: { type: 'mentor', relationship: 'science teacher', phrase: 'guided by' },
        late: { type: 'companion', relationship: 'research buddy', phrase: 'alongside' }
      },
      'school': {
        early: { type: 'friend', relationship: 'classmate', phrase: 'with' },
        middle: { type: 'helper', relationship: 'study partner', phrase: 'working with' },
        late: { type: 'companion', relationship: 'teammate', phrase: 'together with' }
      },
      'community': {
        early: { type: 'helper', relationship: 'neighbor', phrase: 'helped by' },
        middle: { type: 'collaborator', relationship: 'volunteer partner', phrase: 'alongside' },
        late: { type: 'friend', relationship: 'community friend', phrase: 'with support from' }
      },
      'adventure': {
        early: { type: 'companion', relationship: 'adventure buddy', phrase: 'accompanied by' },
        middle: { type: 'helper', relationship: 'guide', phrase: 'with guidance from' },
        late: { type: 'friend', relationship: 'loyal companion', phrase: 'together with' }
      },
      'general': {
        early: { type: 'friend', relationship: 'friend', phrase: 'with' },
        middle: { type: 'helper', relationship: 'helper', phrase: 'helped by' },
        late: { type: 'companion', relationship: 'companion', phrase: 'alongside' }
      }
    };

    const themeRoles = roleMapping[theme] || roleMapping['general'];
    const timeOfStory = storyPosition < 0.4 ? 'early' : storyPosition < 0.8 ? 'middle' : 'late';
    const roleConfig = themeRoles[timeOfStory];

    // Select appropriate character from pool
    let selectedCharacter;
    
    if (context.gradeLevel <= 1 && characterPool.friends?.length > 0) {
      // For younger children, prioritize friends
      selectedCharacter = characterPool.friends[0];
    } else if (context.gradeLevel >= 3 && characterPool.mentors?.length > 0 && roleConfig.type === 'mentor') {
      // For older children, use mentors when appropriate
      selectedCharacter = characterPool.mentors[0];
    } else if (characterPool.family?.length > 0 && storyPosition < 0.3) {
      // Use family early in story
      selectedCharacter = characterPool.family[0];
    } else if (characterPool.friends?.length > 0) {
      // Default to friends
      selectedCharacter = characterPool.friends[0];
    } else {
      return null;
    }

    return {
      name: selectedCharacter.name,
      type: roleConfig.type as any,
      relationship: roleConfig.relationship,
      insertionPhrase: roleConfig.phrase
    };
  }

  /**
   * Insert character at natural points in the text
   */
  private static insertCharacterAtNaturalPoints(
    content: string,
    character: CharacterRole,
    context: EnhancementContext,
    userName: string
  ): string {
    // Find natural insertion points based on sentence structure
    const sentences = content.split(/(?<=[.!?])\s+/);
    
    if (sentences.length === 0) {
      return content;
    }

    // For Level 0-1: Simple insertions
    if (context.gradeLevel <= 1) {
      return this.insertCharacterSimple(content, character, userName);
    }

    // For Level 2+: More sophisticated insertions
    return this.insertCharacterAdvanced(content, character, context, userName);
  }

  /**
   * Simple character insertion for early grades
   */
  private static insertCharacterSimple(
    content: string,
    character: CharacterRole,
    userName: string
  ): string {
    // Look for first occurrence of userName followed by a verb
    const pattern = new RegExp(`(${userName}\\s+)(\\w+s?\\b)`, 'i');
    const match = content.match(pattern);
    
    if (match) {
      const replacement = `${match[1]}${match[2]} with ${character.name}`;
      return content.replace(pattern, replacement);
    }

    // Fallback: add at end of first sentence
    const firstSentenceEnd = content.indexOf('.');
    if (firstSentenceEnd > -1) {
      return content.slice(0, firstSentenceEnd) + ` with ${character.name}` + content.slice(firstSentenceEnd);
    }

    return content;
  }

  /**
   * Advanced character insertion for higher grades
   */
  private static insertCharacterAdvanced(
    content: string,
    character: CharacterRole,
    context: EnhancementContext,
    userName: string
  ): string {
    // Look for natural insertion points like:
    // - After action verbs
    // - Before collaborative activities
    // - At clause boundaries

    const collaborativeWords = ['studies', 'researches', 'explores', 'investigates', 'works on', 'examines'];
    const lowerContent = content.toLowerCase();
    
    for (const word of collaborativeWords) {
      const index = lowerContent.indexOf(word);
      if (index > -1) {
        const insertPoint = index + word.length;
        const before = content.slice(0, insertPoint);
        const after = content.slice(insertPoint);
        
        return `${before} ${character.insertionPhrase} ${character.name}${after}`;
      }
    }

    // Fallback to simple insertion
    return this.insertCharacterSimple(content, character, userName);
  }

  /**
   * Map difficulty to grade level for validation
   */
  private static mapDifficultyToGradeLevel(difficulty: DifficultyLevel): number {
    const mapping = {
      'beginner': 0,
      'easy': 1,
      'medium': 2,
      'hard': 3,
      'expert': 4
    };
    
    return mapping[difficulty] || 1;
  }

  /**
   * Clear caches for testing
   */
  static clearCaches(): void {
    this.themeAnalysisCache.clear();
    this.insertionPatternsCache.clear();
  }

  /**
   * Get enhancement analytics
   */
  static getAnalytics() {
    return {
      cacheSize: this.themeAnalysisCache.size,
      supportedThemes: ['science', 'school', 'community', 'adventure', 'nature', 'creativity', 'friendship', 'family'],
      enhancementStrategies: ['simple_insertion', 'advanced_collaborative', 'theme_based_roles'],
      gradeSupport: '0-4'
    };
  }
}