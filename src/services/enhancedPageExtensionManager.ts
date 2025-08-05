// Enhanced Page Extension Manager for Premium Stories
// Provides intelligent story continuation with maintained vocabulary compliance

import { UserInfo, DifficultyLevel } from '@/types';
import { 
  GradeLevel, 
  difficultyToGradeLevel,
  validateSentence,
  getVocabularySet,
  LEVEL_0_VOCABULARY,
  LEVEL_1_VOCABULARY,
  LEVEL_2_VOCABULARY,
  LEVEL_3_VOCABULARY,
  LEVEL_4_VOCABULARY
} from '@/constants/gradeBased';

export interface ExtensionContext {
  currentPages: string[];
  storyTheme: string;
  characterNames: string[];
  mainPlotPoints: string[];
  vocabularyUsed: Set<string>;
  gradeLevel: GradeLevel;
}

export interface ExtensionResult {
  newPages: string[];
  continuityScore: number;
  vocabularyCompliant: boolean;
  storyArcComplete: boolean;
  extensionMethod: string;
  metadata: {
    contextMaintained: boolean;
    characterConsistency: boolean;
    plotProgression: boolean;
  };
}

export class EnhancedPageExtensionManager {
  private static extractStoryContext(pages: string[]): ExtensionContext {
    const allText = pages.join(' ').toLowerCase();
    
    // Extract character names (capitalized words that appear multiple times)
    const words = allText.split(/\s+/);
    const namePattern = /^[A-Z][a-z]+$/;
    const wordCounts = new Map<string, number>();
    
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?]/g, '');
      if (namePattern.test(cleanWord)) {
        wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);
      }
    });
    
    const characterNames = Array.from(wordCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([name, _]) => name)
      .slice(0, 3); // Limit to 3 main characters

    // Extract plot points from action words
    const actionWords = ['went', 'found', 'saw', 'made', 'got', 'came', 'ran', 'played', 'helped'];
    const mainPlotPoints = actionWords.filter(action => allText.includes(action));

    // Determine story theme from content
    let storyTheme = 'adventure';
    if (allText.includes('home') || allText.includes('family')) storyTheme = 'family';
    if (allText.includes('friend') || allText.includes('play')) storyTheme = 'friendship';
    if (allText.includes('animal') || allText.includes('cat') || allText.includes('dog')) storyTheme = 'animals';
    if (allText.includes('school') || allText.includes('learn')) storyTheme = 'school';

    // Track vocabulary used
    const vocabularyUsed = new Set(words.map(w => w.replace(/[.,!?]/g, '').toLowerCase()));

    return {
      currentPages: pages,
      storyTheme,
      characterNames,
      mainPlotPoints,
      vocabularyUsed,
      gradeLevel: 1 // Will be set by caller
    };
  }

  private static generateContextAwarePage(
    context: ExtensionContext, 
    pageNumber: number,
    targetLength: number = 25
  ): string {
    const { characterNames, storyTheme, mainPlotPoints, gradeLevel } = context;
    const vocabulary = Array.from(getVocabularySet(gradeLevel));
    
    // Ensure we have at least one character name
    const mainCharacter = characterNames[0] || 'Sam';
    
    // Create continuation templates based on theme and context
    const continuationTemplates = {
      adventure: [
        `${mainCharacter} found something new.`,
        `They went to a new place.`,
        `${mainCharacter} saw something big.`,
        `The adventure was not over yet.`,
        `${mainCharacter} had to be brave.`
      ],
      family: [
        `${mainCharacter} went home.`,
        `The family was happy.`,
        `They all sat together.`,
        `${mainCharacter} told them about the day.`,
        `Everyone smiled and laughed.`
      ],
      friendship: [
        `${mainCharacter} met a new friend.`,
        `They played together.`,
        `The friends had fun.`,
        `${mainCharacter} was happy.`,
        `They wanted to play again.`
      ],
      animals: [
        `${mainCharacter} saw the animal again.`,
        `The animal was friendly.`,
        `They played together.`,
        `${mainCharacter} gave it some food.`,
        `The animal was happy.`
      ],
      school: [
        `${mainCharacter} learned something new.`,
        `The teacher was proud.`,
        `All the kids clapped.`,
        `${mainCharacter} felt good.`,
        `School was fun that day.`
      ]
    };

    const templates = continuationTemplates[storyTheme as keyof typeof continuationTemplates] || 
                     continuationTemplates.adventure;
    
    // Select template based on page number for story progression
    const templateIndex = (pageNumber - context.currentPages.length - 1) % templates.length;
    let basePage = templates[templateIndex];

    // Replace character names to maintain consistency
    if (characterNames.length > 1 && Math.random() > 0.5) {
      const secondCharacter = characterNames[1];
      basePage = basePage.replace(mainCharacter, secondCharacter);
    }

    // Ensure vocabulary compliance
    const words = basePage.split(' ');
    const compliantWords = words.map(word => {
      const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
      if (!vocabulary.includes(cleanWord) && cleanWord.length > 2) {
        // Find a simpler alternative
        const simpleAlternatives: { [key: string]: string } = {
          'adventure': 'trip',
          'discovered': 'found',
          'enormous': 'big',
          'beautiful': 'nice',
          'exciting': 'fun',
          'wonderful': 'good',
          'amazing': 'great'
        };
        return simpleAlternatives[cleanWord] || 'fun';
      }
      return word;
    });

    return compliantWords.join(' ');
  }

  static async extendStoryIntelligently(
    pages: string[],
    targetPages: number,
    userInfo?: UserInfo,
    difficulty: DifficultyLevel = 'beginner'
  ): Promise<ExtensionResult> {
    const gradeLevel = difficultyToGradeLevel(difficulty);
    const context = this.extractStoryContext(pages);
    context.gradeLevel = gradeLevel;

    const newPages: string[] = [];
    const currentPageCount = pages.length;
    const pagesToGenerate = targetPages - currentPageCount;

    // Generate pages with story progression
    for (let i = 0; i < pagesToGenerate; i++) {
      const pageNumber = currentPageCount + i + 1;
      const newPage = this.generateContextAwarePage(context, pageNumber);
      
      // Validate vocabulary compliance
      const validationResult = validateSentence(newPage, gradeLevel);
      if (validationResult.isValid) {
        newPages.push(newPage);
        // Update context with new vocabulary
        const newWords = newPage.toLowerCase().split(/\s+/);
        newWords.forEach(word => context.vocabularyUsed.add(word.replace(/[.,!?]/g, '')));
      } else {
        // Fallback to simpler page
        const simplePage = `${context.characterNames[0] || 'Sam'} was happy. The end.`;
        newPages.push(simplePage);
      }
    }

    // Calculate quality metrics
    const continuityScore = this.calculateContinuityScore(pages, newPages, context);
    const vocabularyCompliant = newPages.every(page => validateSentence(page, gradeLevel).isValid);
    const storyArcComplete = this.assessStoryCompletion(pages, newPages, context);

    return {
      newPages,
      continuityScore,
      vocabularyCompliant,
      storyArcComplete,
      extensionMethod: 'intelligent-context-aware',
      metadata: {
        contextMaintained: continuityScore > 0.7,
        characterConsistency: this.checkCharacterConsistency(pages, newPages, context),
        plotProgression: this.checkPlotProgression(pages, newPages, context)
      }
    };
  }

  private static calculateContinuityScore(
    originalPages: string[], 
    newPages: string[], 
    context: ExtensionContext
  ): number {
    let score = 0;
    const totalChecks = 4;

    // Check character name consistency
    const originalText = originalPages.join(' ').toLowerCase();
    const newText = newPages.join(' ').toLowerCase();
    
    context.characterNames.forEach(name => {
      if (newText.includes(name.toLowerCase())) {
        score += 0.25;
      }
    });

    // Check theme consistency
    const themeWords = {
      adventure: ['went', 'found', 'saw', 'new'],
      family: ['home', 'together', 'family'],
      friendship: ['friend', 'played', 'fun'],
      animals: ['animal', 'pet', 'cat', 'dog'],
      school: ['school', 'learn', 'teacher']
    };

    const relevantWords = themeWords[context.storyTheme as keyof typeof themeWords] || [];
    const hasThemeWords = relevantWords.some(word => newText.includes(word));
    if (hasThemeWords) score += 0.25;

    // Check plot progression
    if (newPages.length > 0 && newPages[newPages.length - 1].includes('end')) {
      score += 0.25;
    }

    // Check vocabulary level consistency
    const vocabulary = Array.from(getVocabularySet(context.gradeLevel));
    const newWords = newText.split(/\s+/).map(w => w.replace(/[.,!?]/g, ''));
    const compliantWords = newWords.filter(word => vocabulary.includes(word.toLowerCase()));
    if (compliantWords.length / newWords.length > 0.8) {
      score += 0.25;
    }

    return Math.min(score, 1.0);
  }

  private static checkCharacterConsistency(
    originalPages: string[], 
    newPages: string[], 
    context: ExtensionContext
  ): boolean {
    const newText = newPages.join(' ').toLowerCase();
    return context.characterNames.some(name => newText.includes(name.toLowerCase()));
  }

  private static checkPlotProgression(
    originalPages: string[], 
    newPages: string[], 
    context: ExtensionContext
  ): boolean {
    const newText = newPages.join(' ').toLowerCase();
    const progressionWords = ['then', 'next', 'after', 'finally', 'end'];
    return progressionWords.some(word => newText.includes(word));
  }

  private static assessStoryCompletion(
    originalPages: string[], 
    newPages: string[], 
    context: ExtensionContext
  ): boolean {
    const lastPage = newPages[newPages.length - 1]?.toLowerCase() || '';
    const completionWords = ['end', 'finished', 'done', 'home', 'happy'];
    return completionWords.some(word => lastPage.includes(word));
  }

  static getExtensionCapabilities(): {
    maxExtension: number;
    supportedThemes: string[];
    qualityMetrics: string[];
  } {
    return {
      maxExtension: 10,
      supportedThemes: ['adventure', 'family', 'friendship', 'animals', 'school'],
      qualityMetrics: ['continuityScore', 'vocabularyCompliant', 'storyArcComplete']
    };
  }
}