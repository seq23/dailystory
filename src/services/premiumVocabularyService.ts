import type { UserInfo, DifficultyLevel, LanguageCode } from '../types';
import { LEVEL_1_VOCABULARY, LEVEL_2_VOCABULARY } from '@/constants/gradeBased';
import { DifficultyLevelMapper } from './DifficultyLevelMapper';
// Temporarily disabled - service removed
// import { ThemedSessionManager } from './themedSessionManager';
import { ProgressiveRevelationSystem } from './progressiveRevelationSystem';
import { InputEnhancementEngine } from './inputEnhancementEngine';

// Vocabulary bucket management interfaces (consolidated from vocabularyBucketManager)
interface VocabularyBucket {
  category: string;
  words: string[];
  usedWords: Set<string>;
  priority: number;
}

interface UserVocabularyState {
  level1Buckets: VocabularyBucket[];
  level2Buckets: VocabularyBucket[];
  encounterHistory: Map<string, number>;
  lastSessionBuckets: string[];
}

interface PremiumVocabularyFeatures {
  personalizedVocabularyTracking: boolean;
  advancedPhoneticSystem: boolean;
  adaptiveDifficultyEngine: boolean;
  customVocabularyLists: boolean;
  crossLanguageLearning: boolean;
  vocabularyProgressReports: boolean;
}

interface VocabularyAnalytics {
  wordsLearned: number;
  vocabularyLevel: DifficultyLevel;
  strugglingWords: string[];
  masteredWords: string[];
  recommendedWords: string[];
  learningVelocity: number;
}

interface PersonalizedVocabularyPath {
  currentLevel: DifficultyLevel;
  nextWords: string[];
  challengingWords: string[];
  reinforcementWords: string[];
  culturalAdaptations: string[];
}

export class PremiumVocabularyService {
  // Consolidated vocabulary bucket management (from vocabularyBucketManager)
  private static userStates = new Map<string, UserVocabularyState>();

  static initializeUserState(userId: string): void {
    if (this.userStates.has(userId)) return;

    const level1Buckets: VocabularyBucket[] = [{
      category: 'Level 1 Words',
      words: [...LEVEL_1_VOCABULARY],
      usedWords: new Set(),
      priority: 1
    }];

    const level2Buckets: VocabularyBucket[] = [{
      category: 'Level 2 Words', 
      words: [...LEVEL_2_VOCABULARY],
      usedWords: new Set(),
      priority: 1
    }];

    this.userStates.set(userId, {
      level1Buckets,
      level2Buckets,
      encounterHistory: new Map(),
      lastSessionBuckets: []
    });
  }

  static getThemedVocabulary(userId: string, difficulty: DifficultyLevel, sessionCount: number = 1): { theme: string; words: string[]; category: string; } {
    this.initializeUserState(userId);
    const userState = this.userStates.get(userId)!;

    const isLevel2 = ['medium', 'hard', 'expert'].includes(difficulty);
    const buckets = isLevel2 ? userState.level2Buckets : userState.level1Buckets;

    // Avoid recently used categories
    const availableBuckets = buckets.filter(bucket => 
      !userState.lastSessionBuckets.includes(bucket.category) &&
      bucket.words.length > bucket.usedWords.size
    );

    if (availableBuckets.length === 0) {
      // Reset if all categories have been used recently
      userState.lastSessionBuckets = [];
      const resetBuckets = buckets.filter(bucket => bucket.words.length > bucket.usedWords.size);
      if (resetBuckets.length === 0) {
        // Reset all buckets if fully exhausted
        buckets.forEach(bucket => bucket.usedWords.clear());
        return this.getThemedVocabulary(userId, difficulty, sessionCount);
      }
      availableBuckets.push(...resetBuckets);
    }

    // Select bucket with highest priority and available words
    const selectedBucket = availableBuckets.sort((a, b) => b.priority - a.priority)[0];
    
    // Get unused words from the bucket
    const unusedWords = selectedBucket.words.filter(word => !selectedBucket.usedWords.has(word));
    const wordsToReturn = unusedWords.slice(0, Math.min(8, unusedWords.length));

    // Update last session buckets
    userState.lastSessionBuckets.push(selectedBucket.category);
    if (userState.lastSessionBuckets.length > 3) {
      userState.lastSessionBuckets.shift();
    }

    return {
      theme: selectedBucket.category,
      words: wordsToReturn,
      category: selectedBucket.category
    };
  }

  static markWordsAsUsed(userId: string, words: string[], category: string): void {
    this.initializeUserState(userId);
    const userState = this.userStates.get(userId)!;

    // Find the bucket and mark words as used
    const allBuckets = [...userState.level1Buckets, ...userState.level2Buckets];
    const bucket = allBuckets.find(b => b.category === category);
    
    if (bucket) {
      words.forEach(word => {
        bucket.usedWords.add(word);
        const currentCount = userState.encounterHistory.get(word) || 0;
        userState.encounterHistory.set(word, currentCount + 1);
      });
    }
  }

  static getWordEncounterCount(userId: string, word: string): number {
    this.initializeUserState(userId);
    const userState = this.userStates.get(userId)!;
    return userState.encounterHistory.get(word) || 0;
  }

  static resetUserProgress(userId: string): void {
    this.userStates.delete(userId);
  }

  static getVocabularyStats(userId: string): {
    level1Progress: { category: string; used: number; total: number }[];
    level2Progress: { category: string; used: number; total: number }[];
    totalWordsEncountered: number;
    mostPracticedWords: { word: string; count: number }[];
  } {
    this.initializeUserState(userId);
    const userState = this.userStates.get(userId)!;

    const level1Progress = userState.level1Buckets.map(bucket => ({
      category: bucket.category,
      used: bucket.usedWords.size,
      total: bucket.words.length
    }));

    const level2Progress = userState.level2Buckets.map(bucket => ({
      category: bucket.category,
      used: bucket.usedWords.size,
      total: bucket.words.length
    }));

    const totalWordsEncountered = userState.encounterHistory.size;

    const mostPracticedWords = Array.from(userState.encounterHistory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    return {
      level1Progress,
      level2Progress,
      totalWordsEncountered,
      mostPracticedWords
    };
  }
  private static userVocabularyProfiles = new Map<string, VocabularyAnalytics>();
  private static personalizedPaths = new Map<string, PersonalizedVocabularyPath>();

  static initializePremiumUser(userInfo: UserInfo): PremiumVocabularyFeatures {
    // Initialize vocabulary buckets for this user
    this.initializeUserState(userInfo.name);
    const userId = this.getUserId(userInfo);
    
    // Initialize premium analytics
    if (!this.userVocabularyProfiles.has(userId)) {
      this.userVocabularyProfiles.set(userId, {
        wordsLearned: 0,
        vocabularyLevel: DifficultyLevelMapper.toBackend(userInfo.difficultyLevel || 'beginner'),
        strugglingWords: [],
        masteredWords: [],
        recommendedWords: [],
        learningVelocity: 0
      });
    }

    // Initialize personalized learning path
    if (!this.personalizedPaths.has(userId)) {
      this.personalizedPaths.set(userId, {
        currentLevel: DifficultyLevelMapper.toBackend(userInfo.difficultyLevel || 'beginner'),
        nextWords: [],
        challengingWords: [],
        reinforcementWords: [],
        culturalAdaptations: this.generateCulturalAdaptations(userInfo)
      });
    }

    return {
      personalizedVocabularyTracking: true,
      advancedPhoneticSystem: true,
      adaptiveDifficultyEngine: true,
      customVocabularyLists: true,
      crossLanguageLearning: userInfo.nativeLanguage !== 'en',
      vocabularyProgressReports: true
    };
  }

  static analyzeVocabularyProgress(userInfo: UserInfo, sessionWords: string[], readingTime: number, accuracy: number): VocabularyAnalytics {
    const userId = this.getUserId(userInfo);
    const profile = this.userVocabularyProfiles.get(userId);
    
    if (!profile) {
      return this.initializePremiumUser(userInfo) as any;
    }

    // Update vocabulary analytics
    profile.wordsLearned += sessionWords.length;
    profile.learningVelocity = this.calculateLearningVelocity(readingTime, sessionWords.length, accuracy);

    // Classify words based on performance
    sessionWords.forEach(word => {
      if (accuracy > 0.85) {
        if (!profile.masteredWords.includes(word)) {
          profile.masteredWords.push(word);
        }
        // Remove from struggling if mastered
        profile.strugglingWords = profile.strugglingWords.filter(w => w !== word);
      } else if (accuracy < 0.7) {
        if (!profile.strugglingWords.includes(word)) {
          profile.strugglingWords.push(word);
        }
      }
    });

    // Generate recommendations for next session
    profile.recommendedWords = this.generatePersonalizedRecommendations(userInfo, profile);

    // Adaptive difficulty adjustment
    profile.vocabularyLevel = this.calculateAdaptiveDifficulty(profile, DifficultyLevelMapper.toBackend(userInfo.difficultyLevel || 'beginner'));

    this.userVocabularyProfiles.set(userId, profile);
    return { ...profile };
  }

  static generatePersonalizedVocabularyPath(userInfo: UserInfo): PersonalizedVocabularyPath {
    const userId = this.getUserId(userInfo);
    const profile = this.userVocabularyProfiles.get(userId);
    const currentPath = this.personalizedPaths.get(userId);

    if (!profile || !currentPath) {
      return this.createDefaultPath(userInfo);
    }

    // Generate next words based on current progress
    const nextWords = this.selectNextWords(profile, userInfo);
    
    // Identify challenging words that need reinforcement
    const challengingWords = profile.strugglingWords.slice(0, 5);
    
    // Select words for reinforcement (previously learned but need practice)
    const reinforcementWords = this.selectReinforcementWords(profile, userInfo);

    const updatedPath: PersonalizedVocabularyPath = {
      currentLevel: profile.vocabularyLevel,
      nextWords,
      challengingWords,
      reinforcementWords,
      culturalAdaptations: this.updateCulturalAdaptations(userInfo, profile)
    };

    this.personalizedPaths.set(userId, updatedPath);
    return updatedPath;
  }

  static generateAdvancedPhoneticSupport(word: string, userLanguage: LanguageCode): {
    phonetic: string;
    culturalPronunciation: string;
    practiceExercises: string[];
  } {
    const phoneticMappings: Record<LanguageCode, Record<string, string>> = {
      'es': {
        'cat': '/kæt/ → Similar to "gato" but with English "a" sound',
        'dog': '/dɔg/ → Like "perro" but shorter vowel',
        'book': '/bʊk/ → Similar to "libro" but with different "oo" sound'
      },
      'fr': {
        'cat': '/kæt/ → Like "chat" but with different vowel',
        'dog': '/dɔg/ → Similar to "chien" pronunciation pattern',
        'book': '/bʊk/ → Compare with "livre" for context'
      },
      'fr-francophone-african': {
        'cat': '/kæt/ → Like "chat" but with different vowel',
        'dog': '/dɔg/ → Similar to "chien" pronunciation pattern',
        'book': '/bʊk/ → Compare with "livre" for context'
      },
      'zh': {
        'cat': '/kæt/ → 猫 (māo) - Practice the "a" sound difference',
        'dog': '/dɔg/ → 狗 (gǒu) - Focus on the "o" vowel sound',
        'book': '/bʊk/ → 书 (shū) - Practice the short "u" sound'
      },
      'ar': {
        'cat': '/kæt/ → قط (qitt) - Practice the short "a" vowel',
        'dog': '/dɔg/ → كلب (kalb) - Focus on the "o" sound',
        'book': '/bʊk/ → كتاب (kitāb) - Practice English vowel sounds'
      },
      'hi': {
        'cat': '/kæt/ → बिल्ली (billī) - Practice the English "a" sound',
        'dog': '/dɔg/ → कुत्ता (kuttā) - Focus on the "o" vowel',
        'book': '/bʊk/ → पुस्तक (pustak) - Practice the "oo" sound'
      },
      'pt': {
        'cat': '/kæt/ → Like "gato" but different vowel sound',
        'dog': '/dɔg/ → Similar to "cão" pronunciation patterns',
        'book': '/bʊk/ → Compare with "livro" for vowel differences'
      },
      'en': {
        'cat': '/kæt/ → Standard English pronunciation',
        'dog': '/dɔg/ → Standard English pronunciation',
        'book': '/bʊk/ → Standard English pronunciation'
      },
      'en-african-american': {
        'cat': '/kæt/ → Standard English pronunciation',
        'dog': '/dɔg/ → Standard English pronunciation',
        'book': '/bʊk/ → Standard English pronunciation'
      }
    };

    const mapping = phoneticMappings[userLanguage] || phoneticMappings['en'];
    const phoneticInfo = mapping[word.toLowerCase()] || `/phonetic for ${word}/`;

    return {
      phonetic: phoneticInfo,
      culturalPronunciation: `Pronunciation adapted for ${userLanguage} speakers`,
      practiceExercises: [
        `Repeat "${word}" 5 times slowly`,
        `Use "${word}" in a sentence`,
        `Find words that rhyme with "${word}"`
      ]
    };
  }

  static generateCrossLanguageLearningContent(userInfo: UserInfo, targetWords: string[]): {
    translations: Record<string, string>;
    culturalContexts: Record<string, string>;
    cognates: string[];
    falseCaninds: string[];
  } {
    const translations: Record<string, string> = {};
    const culturalContexts: Record<string, string> = {};
    const cognates: string[] = [];
    const falseCaninds: string[] = [];

    // Simple translation mapping (in real implementation, use translation API)
    const translationMappings: Record<LanguageCode, Record<string, string>> = {
      'en': {
        'cat': 'cat',
        'dog': 'dog',
        'book': 'book',
        'house': 'house',
        'family': 'family'
      },
      'es': {
        'cat': 'gato',
        'dog': 'perro',
        'book': 'libro',
        'house': 'casa',
        'family': 'familia'
      },
      'fr': {
        'cat': 'chat',
        'dog': 'chien',
        'book': 'livre',
        'house': 'maison',
        'family': 'famille'
      },
      'zh': {
        'cat': '猫',
        'dog': '狗',
        'book': '书',
        'house': '房子',
        'family': '家庭'
      },
      'ar': {
        'cat': 'قط',
        'dog': 'كلب',
        'book': 'كتاب',
        'house': 'بيت',
        'family': 'عائلة'
      },
      'hi': {
        'cat': 'बिल्ली',
        'dog': 'कुत्ता',
        'book': 'पुस्तक',
        'house': 'घर',
        'family': 'परिवार'
      },
      'pt': {
        'cat': 'gato',
        'dog': 'cão',
        'book': 'livro',
        'house': 'casa',
        'family': 'família'
      },
      'en-african-american': {
        'cat': 'cat',
        'dog': 'dog',
        'book': 'book',
        'house': 'house',
        'family': 'family'
      },
      'fr-francophone-african': {
        'cat': 'chat',
        'dog': 'chien',
        'book': 'livre',
        'house': 'maison',
        'family': 'famille'
      }
    };

    const userTranslations = translationMappings[userInfo.nativeLanguage] || {};

    targetWords.forEach(word => {
      translations[word] = userTranslations[word.toLowerCase()] || word;
      
      // Cultural context
      culturalContexts[word] = this.generateCulturalContext(word, userInfo.nativeLanguage);
      
      // Identify cognates (words with similar roots)
      if (this.isCognate(word, userInfo.nativeLanguage)) {
        cognates.push(word);
      }
      
      // Identify false friends
      if (this.isFalseFriend(word, userInfo.nativeLanguage)) {
        falseCaninds.push(word);
      }
    });

    return {
      translations,
      culturalContexts,
      cognates,
      falseCaninds
    };
  }

  static generateVocabularyProgressReport(userInfo: UserInfo): {
    weeklyProgress: { week: number; wordsLearned: number; accuracy: number }[];
    strongAreas: string[];
    improvementAreas: string[];
    nextWeekGoals: string[];
    culturalLearningInsights: string[];
  } {
    const userId = this.getUserId(userInfo);
    const profile = this.userVocabularyProfiles.get(userId);
    
    if (!profile) {
      return this.generateDefaultReport(userInfo);
    }

    const stats = this.getVocabularyStats(userId);

    return {
      weeklyProgress: this.generateWeeklyProgressData(profile),
      strongAreas: this.identifyStrongAreas(stats, profile),
      improvementAreas: this.identifyImprovementAreas(profile),
      nextWeekGoals: this.generateNextWeekGoals(profile, userInfo),
      culturalLearningInsights: this.generateCulturalInsights(userInfo, profile)
    };
  }

  // Private helper methods
  private static getUserId(userInfo: UserInfo): string {
    return `${userInfo.name}-${userInfo.age}-${userInfo.nativeLanguage}`.toLowerCase();
  }

  private static calculateLearningVelocity(readingTime: number, wordCount: number, accuracy: number): number {
    // Words per minute adjusted for accuracy
    const wpm = (wordCount / (readingTime / 60000)) * accuracy;
    return Math.round(wpm * 100) / 100;
  }

  private static generateCulturalAdaptations(userInfo: UserInfo): string[] {
    const adaptations: Record<LanguageCode, string[]> = {
      'es': ['Focus on "th" sounds', 'Practice silent letters', 'Work on vowel distinctions'],
      'fr': ['Practice English "h" sounds', 'Work on nasal vowels', 'Focus on final consonants'],
      'fr-francophone-african': ['Practice English "h" sounds', 'Work on nasal vowels', 'Focus on final consonants'],
      'zh': ['Practice consonant clusters', 'Work on vowel length', 'Focus on stress patterns'],
      'ar': ['Practice "p" vs "b" sounds', 'Work on vowel systems', 'Focus on consonant endings'],
      'hi': ['Practice "v" vs "w" sounds', 'Work on "th" sounds', 'Focus on consonant clusters'],
      'pt': ['Practice nasal vowels', 'Work on final consonants', 'Focus on stress patterns'],
      'en': ['Standard English learning path'],
      'en-african-american': ['Standard English learning path']
    };

    return adaptations[userInfo.nativeLanguage] || adaptations['en'];
  }

  private static generatePersonalizedRecommendations(userInfo: UserInfo, profile: VocabularyAnalytics): string[] {
    // Generate words based on user's struggles and progress
    const recommendations: string[] = [];
    
    // Add words that complement struggling words
    profile.strugglingWords.forEach(word => {
      const relatedWords = this.getRelatedWords(word);
      recommendations.push(...relatedWords.slice(0, 2));
    });

    // Add level-appropriate words
    const levelWords = this.getLevelAppropriateWords(profile.vocabularyLevel, userInfo);
    recommendations.push(...levelWords.slice(0, 5));

    return [...new Set(recommendations)].slice(0, 10);
  }

  private static calculateAdaptiveDifficulty(profile: VocabularyAnalytics, currentLevel: DifficultyLevel): DifficultyLevel {
    const masteryRatio = profile.masteredWords.length / Math.max(profile.wordsLearned, 1);
    const strugglingRatio = profile.strugglingWords.length / Math.max(profile.wordsLearned, 1);

    if (masteryRatio > 0.8 && strugglingRatio < 0.2) {
      // User is excelling, consider increasing difficulty
      const levels: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      const currentIndex = levels.indexOf(currentLevel);
      return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentLevel;
    } else if (masteryRatio < 0.5 || strugglingRatio > 0.4) {
      // User is struggling, consider decreasing difficulty
      const levels: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      const currentIndex = levels.indexOf(currentLevel);
      return currentIndex > 0 ? levels[currentIndex - 1] : currentLevel;
    }

    return currentLevel;
  }

  private static createDefaultPath(userInfo: UserInfo): PersonalizedVocabularyPath {
    return {
      currentLevel: DifficultyLevelMapper.toBackend(userInfo.difficultyLevel || 'beginner'),
      nextWords: ['cat', 'dog', 'book', 'happy', 'play'],
      challengingWords: [],
      reinforcementWords: [],
      culturalAdaptations: this.generateCulturalAdaptations(userInfo)
    };
  }

  private static selectNextWords(profile: VocabularyAnalytics, userInfo: UserInfo): string[] {
    // Smart word selection based on user progress
    return ['elephant', 'adventure', 'friendship', 'explore', 'magical'];
  }

  private static selectReinforcementWords(profile: VocabularyAnalytics, userInfo: UserInfo): string[] {
    // Select previously learned words that need reinforcement
    return profile.masteredWords.slice(-5);
  }

  private static updateCulturalAdaptations(userInfo: UserInfo, profile: VocabularyAnalytics): string[] {
    // Update cultural adaptations based on progress
    return this.generateCulturalAdaptations(userInfo);
  }

  private static generateCulturalContext(word: string, nativeLanguage: LanguageCode): string {
    return `Cultural context for "${word}" in ${nativeLanguage} learning environment`;
  }

  private static isCognate(word: string, nativeLanguage: LanguageCode): boolean {
    // Simple cognate detection (in real implementation, use linguistic databases)
    const cognates: Record<LanguageCode, string[]> = {
      'en': [],
      'es': ['family', 'animal', 'natural', 'hospital'],
      'fr': ['family', 'animal', 'natural', 'hospital'],
      'fr-francophone-african': ['family', 'animal', 'natural', 'hospital'],
      'pt': ['family', 'animal', 'natural', 'hospital'],
      'ar': [],
      'zh': [],
      'hi': [],
      'en-african-american': []
    };
    
    return cognates[nativeLanguage]?.includes(word.toLowerCase()) || false;
  }

  private static isFalseFriend(word: string, nativeLanguage: LanguageCode): boolean {
    // Simple false friend detection
    const falseFriends: Record<LanguageCode, string[]> = {
      'en': [],
      'es': ['embarrassed', 'library', 'actual'],
      'fr': ['library', 'actual', 'eventually'],
      'fr-francophone-african': ['library', 'actual', 'eventually'],
      'pt': ['embarrassed', 'library'],
      'ar': [],
      'zh': [],
      'hi': [],
      'en-african-american': []
    };
    
    return falseFriends[nativeLanguage]?.includes(word.toLowerCase()) || false;
  }

  private static generateWeeklyProgressData(profile: VocabularyAnalytics): { week: number; wordsLearned: number; accuracy: number }[] {
    // Mock weekly progress data
    return [
      { week: 1, wordsLearned: 15, accuracy: 0.75 },
      { week: 2, wordsLearned: 22, accuracy: 0.82 },
      { week: 3, wordsLearned: 18, accuracy: 0.88 },
      { week: 4, wordsLearned: 25, accuracy: 0.91 }
    ];
  }

  private static identifyStrongAreas(stats: any, profile: VocabularyAnalytics): string[] {
    const strongAreas: string[] = [];
    
    if (profile.learningVelocity > 20) {
      strongAreas.push('Reading Speed');
    }
    
    if (profile.masteredWords.length > 50) {
      strongAreas.push('Vocabulary Retention');
    }

    return strongAreas;
  }

  private static identifyImprovementAreas(profile: VocabularyAnalytics): string[] {
    const improvementAreas: string[] = [];
    
    if (profile.strugglingWords.length > 10) {
      improvementAreas.push('Word Recognition');
    }
    
    if (profile.learningVelocity < 10) {
      improvementAreas.push('Reading Speed');
    }

    return improvementAreas;
  }

  private static generateNextWeekGoals(profile: VocabularyAnalytics, userInfo: UserInfo): string[] {
    return [
      `Learn 20 new ${profile.vocabularyLevel} level words`,
      'Improve accuracy to 90%+',
      'Master challenging words from previous sessions',
      `Practice pronunciation for ${userInfo.nativeLanguage} speakers`
    ];
  }

  private static generateCulturalInsights(userInfo: UserInfo, profile: VocabularyAnalytics): string[] {
    return [
      `Your ${userInfo.nativeLanguage} background helps with cognate recognition`,
      'Continue practicing consonant cluster pronunciation',
      'Cultural context learning is improving word retention'
    ];
  }

  private static generateDefaultReport(userInfo: UserInfo): any {
    return {
      weeklyProgress: [],
      strongAreas: ['Getting Started'],
      improvementAreas: ['Building Foundation'],
      nextWeekGoals: ['Complete first assessment', 'Learn 10 basic words'],
      culturalLearningInsights: [`Personalized for ${userInfo.nativeLanguage} speakers`]
    };
  }

  private static getRelatedWords(word: string): string[] {
    const relatedWordsMap: Record<string, string[]> = {
      'cat': ['kitten', 'pet', 'animal', 'fur'],
      'dog': ['puppy', 'pet', 'animal', 'bark'],
      'book': ['read', 'story', 'page', 'library']
    };
    
    return relatedWordsMap[word.toLowerCase()] || [];
  }

  private static getLevelAppropriateWords(level: DifficultyLevel, userInfo: UserInfo): string[] {
    const levelWords: Record<DifficultyLevel, string[]> = {
      'beginner': ['cat', 'dog', 'red', 'blue', 'ball', 'toy'],
      'easy': ['sun', 'moon', 'tree', 'flower', 'bird'],
      'medium': ['adventure', 'friendship', 'explore', 'discover', 'magical'],
      'hard': ['mysterious', 'extraordinary', 'fascinating', 'remarkable', 'incredible'],
      'expert': ['philosophical', 'transformative', 'multifaceted', 'sophisticated', 'intricate']
    };
    
    return levelWords[level] || levelWords['easy'];
  }
}