import type { UserInfo, DifficultyLevel } from '../types';
import { PremiumVocabularyService } from './premiumVocabularyService';
import { InputEnhancementEngine } from './inputEnhancementEngine';

interface ThemedSession {
  theme: string;
  category: string;
  targetVocabulary: string[];
  enhancedInputs: {
    characterTraits: string[];
    storyElements: string[];
    vocabularyConnections: string[];
  };
  sessionGoals: string[];
  storyTemplate: string;
}

interface SessionProgress {
  currentSession: number;
  completedThemes: string[];
  vocabularyMastery: Record<string, number>;
  lastSessionDate: Date;
}

export class ThemedSessionManager {
  private static userProgress = new Map<string, SessionProgress>();

  static generateThemedSession(userInfo: UserInfo, difficulty: DifficultyLevel, sessionNumber: number = 0): ThemedSession {
    const userId = this.getUserId(userInfo);
    
    // Initialize user progress if needed
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        currentSession: 0,
        completedThemes: [],
        vocabularyMastery: {},
        lastSessionDate: new Date()
      });
    }

    const progress = this.userProgress.get(userId)!;
    progress.currentSession = sessionNumber;
    progress.lastSessionDate = new Date();

    // Get themed vocabulary for the session
    const vocabularyData = PremiumVocabularyService.getThemedVocabulary(userId, difficulty, sessionNumber);
    
    // Get enhanced inputs
    const enhancedInputs = InputEnhancementEngine.getEnhancedInputsForDifficulty(userInfo, difficulty);

    // Generate session-specific story template
    const storyTemplate = this.generateStoryTemplate(vocabularyData, enhancedInputs, userInfo, difficulty);

    // Set session goals
    const sessionGoals = this.generateSessionGoals(vocabularyData, difficulty, userInfo);

    // Track completed theme
    if (!progress.completedThemes.includes(vocabularyData.category)) {
      progress.completedThemes.push(vocabularyData.category);
    }

    return {
      theme: vocabularyData.theme,
      category: vocabularyData.category,
      targetVocabulary: vocabularyData.words,
      enhancedInputs,
      sessionGoals,
      storyTemplate
    };
  }

  private static getUserId(userInfo: UserInfo): string {
    return `${userInfo.name}-${userInfo.age}-${userInfo.nativeLanguage}`.toLowerCase();
  }

  private static generateStoryTemplate(
    vocabularyData: { theme: string; category: string; words: string[] },
    enhancedInputs: { characterTraits: string[]; storyElements: string[]; vocabularyConnections: string[] },
    userInfo: UserInfo,
    difficulty: DifficultyLevel
  ): string {
    const templates = this.getThemeTemplates(vocabularyData.category, difficulty);
    
    // Select template based on session progress and user preferences
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return this.personalizeTemplate(selectedTemplate, userInfo, vocabularyData, enhancedInputs);
  }

  private static getThemeTemplates(category: string, difficulty: DifficultyLevel): string[] {
    const templateMap: Record<string, Record<DifficultyLevel, string[]>> = {
      'animals': {
        'easy': [
          "{name} goes to see the {animals}. The {color} {animal} says hello. {name} likes to {action} with {animal} friends. They all {action} together in the {place}.",
          "{name} meets a {color} {animal}. The {animal} wants to {action}. {name} helps the {animal} {action}. They become good friends.",
          "In the {place}, {name} sees many {animals}. A {color} {animal} needs help. {name} uses {skill} to help. The {animal} is very happy."
        ],
        'medium': [
          "{name} discovers a secret {place} where {animals} live in harmony. A wise {color} {animal} teaches {name} about {theme_lesson}. Together, they must {action} to protect their {color} home from danger.",
          "When {name} visits the magical {place}, {animals} are preparing for their annual {celebration}. The {color} {animal} leader asks {name} to help organize the event using {skill}.",
          "{name} finds a {color} {animal} who has lost its way home. Using {hobby} skills and {personality_trait}, {name} guides the {animal} through various {obstacles} back to the {place}."
        ],
        'hard': [
          "{name}'s deep connection with {animals} leads to an extraordinary adventure when a {color} {animal} reveals an ancient secret about the {magical_place}. The journey requires {name} to use {advanced_skill} while learning about {complex_theme}.",
          "In a world where {animals} and humans communicate through {special_method}, {name} becomes the bridge between species when conflict arises in the {mystical_location}. {name}'s {unique_trait} proves essential for peace."
        ],
        'expert': [
          "{name} inherits the ability to understand the ancient language of {animals} and must navigate complex diplomatic relations between different animal kingdoms while exploring themes of {sophisticated_concept} and {moral_dilemma}."
        ]
      },
      'colors': {
        'easy': [
          "{name} loves the color {color}. Everything {color} makes {name} happy. {name} finds {color} {objects} everywhere. The {color} {object} is very special.",
          "{name} paints with {color} paint. The {color} picture shows a {animal}. {name} likes to {action} with {color} things.",
          "In {name}'s {color} room, there are {color} {objects}. {name} uses the {color} {object} to {action}. It makes everything {emotion}."
        ],
        'medium': [
          "{name} enters a magical world where everything is painted in shades of {color}. Each {color} object has special powers that help {name} on a quest to {goal}.",
          "When {name} discovers a {color} crystal, it unlocks the ability to {magical_skill}. The crystal leads {name} to the {color} kingdom where {challenges} await.",
          "{name} becomes the guardian of the {color} realm, where {color} energy powers everything. When the color begins to fade, {name} must {heroic_action} to restore balance."
        ],
        'hard': [
          "{name} discovers that colors are actually living entities with their own consciousness, and the {color} spectrum holds the key to understanding {philosophical_concept}.",
          "In a reality where {color} represents {abstract_concept}, {name} must navigate a world where color perception directly affects {complex_outcome}."
        ],
        'expert': [
          "{name} becomes part of an interdimensional council where different color wavelengths correspond to different planes of existence, requiring mastery of {advanced_concept} to maintain cosmic balance."
        ]
      },
      // Add more categories...
      'emotions': {
        'easy': [
          "{name} feels {emotion} today. When {name} is {emotion}, {name} likes to {action}. {name}'s {color} {object} helps {name} feel better.",
          "{name} sees a {emotion} {animal}. {name} wants to help the {animal} feel {positive_emotion}. They {action} together and both feel {happy_emotion}."
        ],
        'medium': [
          "{name} learns about different emotions when visiting the Feeling Forest. Each tree represents a different emotion, and {name} must help balance the {emotional_challenge}.",
          "When {name} meets characters experiencing various emotions, {name} uses {empathy_skill} and {hobby} to help everyone understand their feelings better."
        ],
        'hard': [
          "{name} discovers that emotions have physical manifestations in a parallel dimension, and must learn to navigate complex emotional landscapes while solving {internal_conflict}.",
          "In a world where emotions directly influence the environment, {name} becomes an emotional architect, learning to balance {complex_emotions} to create harmony."
        ],
        'expert': [
          "{name} explores the neuroscience and psychology of emotions, becoming a bridge between scientific understanding and emotional intelligence in a narrative that addresses {sophisticated_emotional_concept}."
        ]
      }
    };

    const categoryTemplates = templateMap[category];
    if (!categoryTemplates) {
      // Fallback to general adventure templates
      return this.getGeneralTemplates(difficulty);
    }

    return categoryTemplates[difficulty] || categoryTemplates['easy'];
  }

  private static getGeneralTemplates(difficulty: DifficultyLevel): string[] {
    const generalTemplates: Record<DifficultyLevel, string[]> = {
      'easy': [
        "{name} goes on an adventure. {name} meets a {color} {animal}. They {action} together and have fun.",
        "{name} finds a special {object}. The {color} {object} helps {name} {action}. {name} is very {emotion}."
      ],
      'medium': [
        "{name} embarks on a journey to the {magical_place} where {adventure_goal} awaits. Using {skill} and {personality_trait}, {name} overcomes {challenge}.",
        "When {name} discovers a mysterious {object}, it leads to an adventure involving {theme} and the importance of {lesson}."
      ],
      'hard': [
        "{name} navigates a complex world where {abstract_concept} and {moral_theme} intersect, requiring both {advanced_skill} and {character_growth}.",
        "In a narrative exploring {sophisticated_theme}, {name} must balance {competing_interests} while learning about {life_lesson}."
      ],
      'expert': [
        "{name} engages with multifaceted scenarios involving {complex_social_issue}, {scientific_concept}, and {philosophical_question}, developing {advanced_character_trait}."
      ]
    };

    return generalTemplates[difficulty];
  }

  private static personalizeTemplate(
    template: string,
    userInfo: UserInfo,
    vocabularyData: { words: string[]; category: string },
    enhancedInputs: { characterTraits: string[]; storyElements: string[]; vocabularyConnections: string[] }
  ): string {
    let personalized = template;

    // Basic replacements
    personalized = personalized.replace(/{name}/g, userInfo.name);
    personalized = personalized.replace(/{color}/g, userInfo.favoriteColor);
    personalized = personalized.replace(/{animal}/g, userInfo.favoriteAnimal);
    personalized = personalized.replace(/{hobby}/g, userInfo.hobbies);
    personalized = personalized.replace(/{food}/g, userInfo.favoriteFood);

    // Enhanced replacements
    if (enhancedInputs.characterTraits.length > 0) {
      const trait = enhancedInputs.characterTraits[0];
      personalized = personalized.replace(/{personality_trait}/g, trait);
    }

    if (enhancedInputs.storyElements.length > 0) {
      const element = enhancedInputs.storyElements[0];
      personalized = personalized.replace(/{story_element}/g, element);
    }

    // Vocabulary-specific replacements
    if (vocabularyData.words.length > 0) {
      const randomWord = vocabularyData.words[Math.floor(Math.random() * vocabularyData.words.length)];
      personalized = personalized.replace(/{vocabulary_word}/g, randomWord);
    }

    // Category-specific replacements
    personalized = this.applyCategorySpecificReplacements(personalized, vocabularyData.category, vocabularyData.words);

    return personalized;
  }

  private static applyCategorySpecificReplacements(template: string, category: string, words: string[]): string {
    let processed = template;

    switch (category) {
      case 'animals':
        const animals = words.filter(word => this.isAnimalWord(word));
        if (animals.length > 0) {
          processed = processed.replace(/{animals}/g, animals.slice(0, 3).join(', '));
        }
        break;
      
      case 'emotions':
        const emotions = words.filter(word => this.isEmotionWord(word));
        if (emotions.length > 0) {
          processed = processed.replace(/{emotion}/g, emotions[0]);
          processed = processed.replace(/{positive_emotion}/g, 'happy');
          processed = processed.replace(/{happy_emotion}/g, 'joyful');
        }
        break;

      case 'actions':
        const actions = words.filter(word => this.isActionWord(word));
        if (actions.length > 0) {
          processed = processed.replace(/{action}/g, actions[0]);
        }
        break;

      case 'places':
        const places = words.filter(word => this.isPlaceWord(word));
        if (places.length > 0) {
          processed = processed.replace(/{place}/g, places[0]);
        }
        break;
    }

    return processed;
  }

  private static generateSessionGoals(vocabularyData: { words: string[]; category: string; theme: string }, difficulty: DifficultyLevel, userInfo: UserInfo): string[] {
    const goals: string[] = [];

    // Vocabulary goals
    const wordCount = Math.min(vocabularyData.words.length, difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12);
    goals.push(`Learn ${wordCount} new words from the ${vocabularyData.theme} theme`);

    // Reading comprehension goals
    if (difficulty === 'easy') {
      goals.push('Read each page carefully and identify the main character');
      goals.push('Point to words you recognize');
    } else if (difficulty === 'medium') {
      goals.push('Understand the story sequence and main events');
      goals.push('Connect new words to things you already know');
    } else {
      goals.push('Analyze character motivations and story themes');
      goals.push('Make connections between vocabulary and concepts');
    }

    // Engagement goals
    goals.push(`Connect the story to your love of ${userInfo.favoriteAnimal}s and ${userInfo.favoriteColor} things`);

    return goals;
  }

  static getSessionProgress(userInfo: UserInfo): SessionProgress | null {
    const userId = this.getUserId(userInfo);
    return this.userProgress.get(userId) || null;
  }

  static markVocabularyEncountered(userInfo: UserInfo, words: string[]): void {
    const userId = this.getUserId(userInfo);
    const progress = this.userProgress.get(userId);
    
    if (progress) {
      words.forEach(word => {
        const currentMastery = progress.vocabularyMastery[word] || 0;
        progress.vocabularyMastery[word] = currentMastery + 1;
      });
    }

    // Also mark in vocabulary bucket manager
    PremiumVocabularyService.markWordsAsUsed(userId, words, 'session');
  }

  static resetUserProgress(userInfo: UserInfo): void {
    const userId = this.getUserId(userInfo);
    this.userProgress.delete(userId);
    PremiumVocabularyService.resetUserProgress(userId);
  }

  // Helper methods for word classification
  private static isAnimalWord(word: string): boolean {
    const animalWords = ['cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'hen', 'bee', 'bug', 'bear', 'fox', 'frog', 'mouse', 'horse', 'lion', 'tiger', 'sheep', 'goat', 'owl', 'bat', 'ant', 'fly', 'elephant', 'giraffe', 'zebra', 'monkey', 'rabbit', 'turtle', 'butterfly', 'spider', 'snake', 'whale', 'dolphin', 'shark', 'penguin', 'eagle'];
    return animalWords.includes(word.toLowerCase());
  }

  private static isEmotionWord(word: string): boolean {
    const emotionWords = ['happy', 'sad', 'angry', 'excited', 'nervous', 'worried', 'calm', 'upset', 'surprised', 'amazed', 'proud', 'embarrassed', 'shy', 'brave', 'scared', 'confused', 'curious', 'bored', 'tired', 'relaxed', 'joyful', 'grumpy'];
    return emotionWords.includes(word.toLowerCase());
  }

  private static isActionWord(word: string): boolean {
    const actionWords = ['run', 'jump', 'walk', 'play', 'eat', 'sleep', 'read', 'write', 'sing', 'dance', 'swim', 'climb', 'fly', 'drive', 'cook', 'paint', 'draw', 'build', 'clean', 'help'];
    return actionWords.includes(word.toLowerCase());
  }

  private static isPlaceWord(word: string): boolean {
    const placeWords = ['home', 'school', 'park', 'store', 'farm', 'zoo', 'beach', 'forest', 'garden', 'yard', 'library', 'playground', 'house', 'room'];
    return placeWords.includes(word.toLowerCase());
  }
}