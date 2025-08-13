// Enhanced Page Extension Manager for Premium Stories
// Provides intelligent story continuation with maintained vocabulary compliance

import { UserInfo, DifficultyLevel } from '@/types';
import { 
  GradeLevel, 
  difficultyToGradeLevel,
  getVocabularySet
  // validateSentence removed in advisory mode
} from '@/constants/gradeBased';
import { computeCoverage } from '@/utils/vocabCoverage';

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
    
    // Create continuation templates based on theme and context - Level 0 vocabulary only
    const continuationTemplates = {
      adventure: [
        `${mainCharacter} can see something.`,
        `${mainCharacter} can go up.`,
        `${mainCharacter} can look.`,
        `${mainCharacter} can run.`,
        `${mainCharacter} is big.`
      ],
      family: [
        `${mainCharacter} can go home.`,
        `${mainCharacter} sees my family.`,
        `We are together.`,
        `${mainCharacter} is happy.`,
        `We can play.`
      ],
      friendship: [
        `${mainCharacter} can see a friend.`,
        `We can play.`,
        `${mainCharacter} and me play.`,
        `${mainCharacter} is happy.`,
        `We like to play.`
      ],
      animals: [
        `${mainCharacter} can see the cat.`,
        `The cat is little.`,
        `${mainCharacter} can play.`,
        `${mainCharacter} likes the cat.`,
        `The cat is happy.`
      ],
      school: [
        `${mainCharacter} can go to school.`,
        `${mainCharacter} can see books.`,
        `${mainCharacter} can look.`,
        `${mainCharacter} is happy.`,
        `School is fun.`
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
        // Find a simpler alternative using only Dolch Pre-Primer vocabulary
        const simpleAlternatives: { [key: string]: string } = {
          'adventure': 'play',
          'discovered': 'see',
          'enormous': 'big',
          'beautiful': 'pretty',
          'exciting': 'fun',
          'wonderful': 'good',
          'amazing': 'good',
          'magical': 'pretty',
          'explored': 'see'
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
      
      // Advisory-only: always accept the generated page; compute coverage for metrics later
      newPages.push(newPage);
      // Update context with new vocabulary
      const newWords = newPage.toLowerCase().split(/\s+/);
      newWords.forEach(word => context.vocabularyUsed.add(word.replace(/[.,!?]/g, '')));
    }

    // Calculate quality metrics (advisory coverage)
    const continuityScore = this.calculateContinuityScore(pages, newPages, context);
    const avgCoverage = newPages.length
      ? newPages.map(p => computeCoverage(p, gradeLevel, { userName: userInfo?.name }).coverage)
          .reduce((a, b) => a + b, 0) / newPages.length
      : 1;
    const vocabularyCompliant = avgCoverage >= 0.6; // advisory threshold
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

    // Check vocabulary level consistency using coverage
    const pageCoverages = newPages.map(p => computeCoverage(p, context.gradeLevel).coverage);
    const avgCoverage = pageCoverages.length ? pageCoverages.reduce((a,b)=>a+b,0)/pageCoverages.length : 1;
    if (avgCoverage > 0.6) {
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