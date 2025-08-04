import { LEVEL_1_VOCABULARY } from '../constants/level1Vocabulary';
import { LEVEL_2_VOCABULARY } from '../constants/level2Vocabulary';
import type { DifficultyLevel, UserInfo } from '../types';

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

export class VocabularyBucketManager {
  private static userStates = new Map<string, UserVocabularyState>();

  // Level 1 vocabulary categories for themed sessions
  private static level1Categories = {
    'animals': ['cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'hen', 'bee', 'bug', 'bear', 'fox', 'frog', 'mouse', 'horse', 'lion', 'tiger', 'sheep', 'goat', 'owl', 'bat', 'ant', 'fly'],
    'colors': ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown', 'orange', 'purple', 'gray', 'grey'],
    'actions': ['go', 'goes', 'see', 'sees', 'run', 'runs', 'play', 'plays', 'eat', 'eats', 'get', 'gets', 'give', 'gives', 'look', 'looks', 'find', 'finds', 'help', 'helps', 'come', 'comes', 'want', 'wants', 'like', 'likes', 'make', 'makes', 'take', 'takes', 'walk', 'walks', 'jump', 'jumps', 'sit', 'sits'],
    'home': ['home', 'house', 'room', 'bed', 'door', 'key', 'cup', 'pot', 'pan', 'box', 'bag', 'hat', 'coat', 'sock', 'book'],
    'food': ['apple', 'banana', 'bread', 'cake', 'cheese', 'cookie', 'fish', 'food', 'ice', 'meat', 'milk', 'pie', 'rice', 'soup', 'tea', 'water'],
    'family': ['mom', 'dad', 'baby', 'boy', 'girl', 'man', 'woman', 'friend', 'friends', 'teacher', 'child', 'kids', 'family'],
    'places': ['park', 'school', 'store', 'farm', 'zoo', 'beach', 'forest', 'garden', 'yard'],
    'toys': ['ball', 'toy', 'game', 'bike', 'boat', 'car', 'truck', 'train', 'doll', 'drum', 'kite'],
    'nature': ['tree', 'leaf', 'flower', 'sun', 'moon', 'star', 'hill', 'lake', 'sea', 'sand', 'rock', 'wind', 'rain', 'fire'],
    'descriptors': ['big', 'small', 'good', 'bad', 'hot', 'cold', 'old', 'new', 'fast', 'slow', 'happy', 'sad', 'nice', 'pretty', 'fun', 'long', 'short', 'tall']
  };

  // Level 2 vocabulary categories for more complex themed sessions
  private static level2Categories = {
    'emotions': ['excited', 'nervous', 'worried', 'calm', 'angry', 'upset', 'surprised', 'amazed', 'proud', 'embarrassed', 'shy', 'brave', 'scared', 'confused', 'curious', 'bored', 'tired', 'relaxed', 'joyful', 'grumpy'],
    'weather': ['weather', 'sunny', 'cloudy', 'windy', 'rainy', 'snowy', 'stormy', 'spring', 'summer', 'fall', 'winter', 'temperature', 'warm', 'cool', 'thunder', 'lightning', 'rainbow'],
    'body': ['head', 'hair', 'face', 'eyes', 'nose', 'mouth', 'ears', 'neck', 'arms', 'hands', 'fingers', 'chest', 'back', 'legs', 'feet', 'heart', 'brain'],
    'advanced_animals': ['elephant', 'giraffe', 'zebra', 'monkey', 'rabbit', 'turtle', 'butterfly', 'spider', 'snake', 'whale', 'dolphin', 'shark', 'penguin', 'eagle', 'squirrel', 'deer'],
    'technology': ['computer', 'tablet', 'phone', 'television', 'radio', 'camera', 'video', 'music', 'movie', 'game', 'internet', 'picture', 'battery', 'screen'],
    'school': ['school', 'classroom', 'teacher', 'student', 'desk', 'pencil', 'paper', 'homework', 'test', 'lesson', 'math', 'science', 'art', 'library', 'playground'],
    'sports': ['sport', 'team', 'player', 'practice', 'exercise', 'soccer', 'basketball', 'baseball', 'tennis', 'swimming', 'running', 'dancing', 'singing'],
    'meals': ['breakfast', 'lunch', 'dinner', 'snack', 'hungry', 'thirsty', 'delicious', 'sweet', 'sour', 'vegetables', 'fruits', 'sandwich', 'pizza', 'juice'],
    'transportation': ['airplane', 'helicopter', 'bicycle', 'motorcycle', 'subway', 'taxi', 'bus', 'truck', 'driver', 'passenger', 'traffic', 'bridge'],
    'clothing': ['clothes', 'shirt', 'pants', 'dress', 'shoes', 'boots', 'jacket', 'coat', 'gloves', 'scarf', 'belt', 'glasses', 'uniform']
  };

  static initializeUserState(userId: string): void {
    if (this.userStates.has(userId)) return;

    const level1Buckets = Object.entries(this.level1Categories).map(([category, words], index) => ({
      category,
      words: words.filter(word => LEVEL_1_VOCABULARY.has(word)),
      usedWords: new Set<string>(),
      priority: index + 1
    }));

    const level2Buckets = Object.entries(this.level2Categories).map(([category, words], index) => ({
      category,
      words: words.filter(word => LEVEL_2_VOCABULARY.has(word)),
      usedWords: new Set<string>(),
      priority: index + 1
    }));

    this.userStates.set(userId, {
      level1Buckets,
      level2Buckets,
      encounterHistory: new Map(),
      lastSessionBuckets: []
    });
  }

  static getThemedVocabulary(userId: string, difficulty: DifficultyLevel, sessionCount: number = 0): {
    theme: string;
    words: string[];
    category: string;
  } {
    this.initializeUserState(userId);
    const userState = this.userStates.get(userId)!;

    if (difficulty === 'easy') {
      return this.getLevel1ThemedVocabulary(userState, sessionCount);
    } else if (difficulty === 'medium') {
      return this.getLevel2ThemedVocabulary(userState, sessionCount);
    } else {
      // For hard/expert, use progressive revelation instead
      return this.getProgressiveVocabulary(userState, difficulty);
    }
  }

  private static getLevel1ThemedVocabulary(userState: UserVocabularyState, sessionCount: number): {
    theme: string;
    words: string[];
    category: string;
  } {
    // Cycle through themes, avoiding recent ones
    const availableBuckets = userState.level1Buckets.filter(bucket => 
      !userState.lastSessionBuckets.includes(bucket.category)
    );

    if (availableBuckets.length === 0) {
      // Reset if all buckets used recently
      userState.lastSessionBuckets = [];
      availableBuckets.push(...userState.level1Buckets);
    }

    // Pick bucket with highest priority (lowest number) and least used words
    const selectedBucket = availableBuckets.reduce((best, current) => {
      const bestUnusedCount = best.words.length - best.usedWords.size;
      const currentUnusedCount = current.words.length - current.usedWords.size;
      
      if (currentUnusedCount > bestUnusedCount) return current;
      if (currentUnusedCount === bestUnusedCount && current.priority < best.priority) return current;
      return best;
    });

    // Get unused words from selected bucket
    const unusedWords = selectedBucket.words.filter(word => 
      !selectedBucket.usedWords.has(word)
    );

    // If bucket is exhausted, reset it
    if (unusedWords.length === 0) {
      selectedBucket.usedWords.clear();
      unusedWords.push(...selectedBucket.words);
    }

    // Track session usage
    userState.lastSessionBuckets.push(selectedBucket.category);
    if (userState.lastSessionBuckets.length > 3) {
      userState.lastSessionBuckets.shift();
    }

    return {
      theme: this.getThemeTitle(selectedBucket.category),
      words: unusedWords.slice(0, 15), // Limit words per session
      category: selectedBucket.category
    };
  }

  private static getLevel2ThemedVocabulary(userState: UserVocabularyState, sessionCount: number): {
    theme: string;
    words: string[];
    category: string;
  } {
    // Similar logic for Level 2 but with more complex themes
    const availableBuckets = userState.level2Buckets.filter(bucket => 
      !userState.lastSessionBuckets.includes(bucket.category)
    );

    if (availableBuckets.length === 0) {
      userState.lastSessionBuckets = [];
      availableBuckets.push(...userState.level2Buckets);
    }

    const selectedBucket = availableBuckets.reduce((best, current) => {
      const bestUnusedCount = best.words.length - best.usedWords.size;
      const currentUnusedCount = current.words.length - current.usedWords.size;
      
      if (currentUnusedCount > bestUnusedCount) return current;
      if (currentUnusedCount === bestUnusedCount && current.priority < best.priority) return current;
      return best;
    });

    const unusedWords = selectedBucket.words.filter(word => 
      !selectedBucket.usedWords.has(word)
    );

    if (unusedWords.length === 0) {
      selectedBucket.usedWords.clear();
      unusedWords.push(...selectedBucket.words);
    }

    userState.lastSessionBuckets.push(selectedBucket.category);
    if (userState.lastSessionBuckets.length > 3) {
      userState.lastSessionBuckets.shift();
    }

    return {
      theme: this.getThemeTitle(selectedBucket.category),
      words: unusedWords.slice(0, 20), // More words for Level 2
      category: selectedBucket.category
    };
  }

  private static getProgressiveVocabulary(userState: UserVocabularyState, difficulty: DifficultyLevel): {
    theme: string;
    words: string[];
    category: string;
  } {
    // For progressive revelation, mix vocabulary from multiple sources
    return {
      theme: 'Progressive Learning',
      words: [], // Will be handled by progressive revelation system
      category: 'progressive'
    };
  }

  static markWordsAsUsed(userId: string, words: string[], category: string): void {
    this.initializeUserState(userId);
    const userState = this.userStates.get(userId)!;

    // Mark words as used in appropriate buckets
    const allBuckets = [...userState.level1Buckets, ...userState.level2Buckets];
    const bucket = allBuckets.find(b => b.category === category);
    
    if (bucket) {
      words.forEach(word => {
        bucket.usedWords.add(word.toLowerCase());
        // Track encounter history
        const currentCount = userState.encounterHistory.get(word.toLowerCase()) || 0;
        userState.encounterHistory.set(word.toLowerCase(), currentCount + 1);
      });
    }
  }

  static getWordEncounterCount(userId: string, word: string): number {
    this.initializeUserState(userId);
    const userState = this.userStates.get(userId)!;
    return userState.encounterHistory.get(word.toLowerCase()) || 0;
  }

  static resetUserProgress(userId: string): void {
    this.userStates.delete(userId);
  }

  private static getThemeTitle(category: string): string {
    const titles: Record<string, string> = {
      'animals': 'Animal Friends',
      'colors': 'Rainbow World',
      'actions': 'Action Adventure',
      'home': 'Home Sweet Home',
      'food': 'Yummy Food',
      'family': 'Family Time',
      'places': 'Places to Go',
      'toys': 'Playtime Fun',
      'nature': 'Nature Walk',
      'descriptors': 'Describing Things',
      'emotions': 'Feelings and Emotions',
      'weather': 'Weather Wonders',
      'body': 'My Body',
      'advanced_animals': 'Amazing Animals',
      'technology': 'Tech Time',
      'school': 'School Days',
      'sports': 'Sports and Games',
      'meals': 'Meal Time',
      'transportation': 'Getting Around',
      'clothing': 'What to Wear'
    };
    return titles[category] || 'Learning Adventure';
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
}