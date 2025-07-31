import type { UserInfo } from "@/components/UserInfoForm";
import type { ReadingProgress } from "./progressTrackingService";

export interface LearningChallenge {
  id: string;
  type: "vocabulary" | "comprehension" | "phonics" | "fluency" | "writing";
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  targetAudience: "native" | "esl" | "both";
  estimatedMinutes: number;
  requiredLevel: number;
  rewards: {
    points: number;
    badge?: string;
  };
  content: any; // Challenge-specific content
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  targetAudience: "native" | "esl" | "both";
  difficulty: "easy" | "medium" | "hard" | "expert";
  challenges: LearningChallenge[];
  totalEstimatedHours: number;
  prerequisites?: string[];
}

export interface VocabularyGame {
  id: string;
  type: "matching" | "definition" | "synonym" | "pronunciation";
  words: Array<{
    word: string;
    definition: string;
    difficulty: "easy" | "medium" | "hard" | "expert";
    context: string;
  }>;
  timeLimit?: number;
  targetScore: number;
}

export interface ComprehensionQuiz {
  id: string;
  storyExcerpt: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  difficulty: "easy" | "medium" | "hard" | "expert";
  targetAudience: "native" | "esl" | "both";
}

export class PersonalizedLearningService {
  
  // Generate personalized learning path based on user info and progress
  static generateLearningPath(userInfo: UserInfo, progress: ReadingProgress): LearningPath {
    const isESLLearner = userInfo.nativeLanguage !== 'en';
    const currentLevel = this.determineUserLevel(userInfo, progress);
    const targetAudience = isESLLearner ? "esl" : "native";
    
    const challenges = this.generateChallenges(userInfo, progress, currentLevel, targetAudience);
    
    return {
      id: `path-${userInfo.name}-${Date.now()}`,
      name: isESLLearner ? "English Language Learning Journey" : "Reading Mastery Path",
      description: this.getPathDescription(userInfo, isESLLearner),
      targetAudience,
      difficulty: currentLevel,
      challenges,
      totalEstimatedHours: challenges.reduce((total, c) => total + (c.estimatedMinutes / 60), 0),
      prerequisites: this.getPrerequisites(currentLevel)
    };
  }

  private static determineUserLevel(userInfo: UserInfo, progress: ReadingProgress): "easy" | "medium" | "hard" | "expert" {
    const age = userInfo.age || 8;
    const readingAbility = userInfo.readingAbility;
    const storiesCompleted = progress.storiesCompleted;
    
    // For ESL learners, be more conservative with level determination
    const isESLLearner = userInfo.nativeLanguage !== 'en';
    
    if (isESLLearner) {
      if (age < 8 || readingAbility === "easy" || storiesCompleted < 3) return "easy";
      if (age < 12 || readingAbility === "medium" || storiesCompleted < 8) return "medium";
      if (age < 16 || readingAbility === "hard" || storiesCompleted < 15) return "hard";
      return "expert";
    } else {
      if (age < 6 || readingAbility === "easy" || storiesCompleted < 5) return "easy";
      if (age < 10 || readingAbility === "medium" || storiesCompleted < 12) return "medium";
      if (age < 14 || readingAbility === "hard" || storiesCompleted < 20) return "hard";
      return "expert";
    }
  }

  private static getPathDescription(userInfo: UserInfo, isESLLearner: boolean): string {
    if (isESLLearner) {
      return `A personalized English learning journey for ${userInfo.name}, focusing on building vocabulary, grammar, and reading comprehension while celebrating your ${userInfo.nativeLanguage} heritage.`;
    } else {
      return `A tailored reading adventure for ${userInfo.name}, designed to enhance vocabulary, comprehension, and critical thinking skills through engaging stories and activities.`;
    }
  }

  private static getPrerequisites(level: "easy" | "medium" | "hard" | "expert"): string[] {
    switch (level) {
      case "easy":
        return ["Basic letter recognition", "Simple word recognition"];
      case "medium":
        return ["Can read simple sentences", "Understands basic punctuation"];
      case "hard":
        return ["Comfortable with paragraph reading", "Understands story structure"];
      case "expert":
        return ["Advanced reading fluency", "Critical thinking skills"];
      default:
        return [];
    }
  }

  private static generateChallenges(
    userInfo: UserInfo, 
    progress: ReadingProgress, 
    level: "easy" | "medium" | "hard" | "expert",
    targetAudience: "native" | "esl" | "both"
  ): LearningChallenge[] {
    const challenges: LearningChallenge[] = [];
    
    // Vocabulary building challenges
    challenges.push(this.createVocabularyChallenge(userInfo, level, targetAudience));
    
    // Comprehension challenges
    challenges.push(this.createComprehensionChallenge(userInfo, level, targetAudience));
    
    // Phonics challenges (especially important for ESL learners)
    if (targetAudience === "esl" || level === "easy") {
      challenges.push(this.createPhonicsChallenge(userInfo, level, targetAudience));
    }
    
    // Fluency challenges
    challenges.push(this.createFluencyChallenge(userInfo, level, targetAudience));
    
    // Writing challenges for advanced learners
    if (level === "hard" || level === "expert") {
      challenges.push(this.createWritingChallenge(userInfo, level, targetAudience));
    }
    
    return challenges;
  }

  private static createVocabularyChallenge(
    userInfo: UserInfo, 
    level: "easy" | "medium" | "hard" | "expert",
    targetAudience: "native" | "esl" | "both"
  ): LearningChallenge {
    const vocabularyWords = this.getVocabularyWords(level, targetAudience, userInfo);
    
    return {
      id: `vocab-${level}-${Date.now()}`,
      type: "vocabulary",
      title: targetAudience === "esl" ? "Word Discovery Quest" : "Vocabulary Builder",
      description: `Learn ${vocabularyWords.length} new words through interactive games and context clues.`,
      difficulty: level,
      targetAudience,
      estimatedMinutes: vocabularyWords.length * 2,
      requiredLevel: this.getLevelNumber(level),
      rewards: {
        points: vocabularyWords.length * 10,
        badge: level === "expert" ? "Word Master" : undefined
      },
      content: {
        words: vocabularyWords,
        activities: ["matching", "definition", "context-clues"]
      }
    };
  }

  private static createComprehensionChallenge(
    userInfo: UserInfo, 
    level: "easy" | "medium" | "hard" | "expert",
    targetAudience: "native" | "esl" | "both"
  ): LearningChallenge {
    return {
      id: `comprehension-${level}-${Date.now()}`,
      type: "comprehension",
      title: "Story Detective",
      description: "Read stories and answer questions to show your understanding.",
      difficulty: level,
      targetAudience,
      estimatedMinutes: 15,
      requiredLevel: this.getLevelNumber(level),
      rewards: {
        points: 50,
        badge: level === "expert" ? "Story Detective" : undefined
      },
      content: {
        storyCount: level === "easy" ? 2 : level === "medium" ? 3 : 4,
        questionTypes: ["main-idea", "details", "inference", "vocabulary"]
      }
    };
  }

  private static createPhonicsChallenge(
    userInfo: UserInfo, 
    level: "easy" | "medium" | "hard" | "expert",
    targetAudience: "native" | "esl" | "both"
  ): LearningChallenge {
    return {
      id: `phonics-${level}-${Date.now()}`,
      type: "phonics",
      title: "Sound Safari",
      description: "Practice pronunciation and sound patterns in English.",
      difficulty: level,
      targetAudience,
      estimatedMinutes: 10,
      requiredLevel: this.getLevelNumber(level),
      rewards: {
        points: 30,
        badge: undefined
      },
      content: {
        soundPatterns: this.getPhonicsPatterns(level),
        practiceWords: this.getPhonicsWords(level, targetAudience)
      }
    };
  }

  private static createFluencyChallenge(
    userInfo: UserInfo, 
    level: "easy" | "medium" | "hard" | "expert",
    targetAudience: "native" | "esl" | "both"
  ): LearningChallenge {
    return {
      id: `fluency-${level}-${Date.now()}`,
      type: "fluency",
      title: "Reading Race",
      description: "Practice reading aloud with proper pace and expression.",
      difficulty: level,
      targetAudience,
      estimatedMinutes: 8,
      requiredLevel: this.getLevelNumber(level),
      rewards: {
        points: 40,
        badge: undefined
      },
      content: {
        passages: this.getFluencyPassages(level, targetAudience),
        targetWPM: this.getTargetWPM(level, targetAudience)
      }
    };
  }

  private static createWritingChallenge(
    userInfo: UserInfo, 
    level: "easy" | "medium" | "hard" | "expert",
    targetAudience: "native" | "esl" | "both"
  ): LearningChallenge {
    return {
      id: `writing-${level}-${Date.now()}`,
      type: "writing",
      title: "Story Creator",
      description: "Write your own creative stories using new vocabulary words.",
      difficulty: level,
      targetAudience,
      estimatedMinutes: 20,
      requiredLevel: this.getLevelNumber(level),
      rewards: {
        points: 100,
        badge: "Young Author"
      },
      content: {
        prompts: this.getWritingPrompts(level, userInfo),
        requiredWords: this.getRequiredVocabulary(level),
        minLength: level === "hard" ? 100 : 150
      }
    };
  }

  // Helper methods
  private static getLevelNumber(level: "easy" | "medium" | "hard" | "expert"): number {
    switch (level) {
      case "easy": return 1;
      case "medium": return 2;
      case "hard": return 3;
      case "expert": return 4;
      default: return 1;
    }
  }

  private static getVocabularyWords(
    level: "easy" | "medium" | "hard" | "expert",
    targetAudience: "native" | "esl" | "both",
    userInfo: UserInfo
  ) {
    const baseWords = {
      easy: ["happy", "friend", "color", "animal", "home", "family", "play", "learn"],
      medium: ["adventure", "mystery", "courage", "discover", "magical", "wisdom", "journey", "treasure"],
      hard: ["perseverance", "determination", "extraordinary", "magnificent", "mysterious", "resilience", "empathy", "civilization"],
      expert: ["sophisticated", "philosophical", "introspective", "paradigm", "metamorphosis", "transcendent", "synthesis", "eloquent"]
    };

    // Add personalized words based on user interests
    const personalizedWords = [];
    if (userInfo.hobbies) {
      personalizedWords.push(...this.getHobbyRelatedWords(userInfo.hobbies, level));
    }
    if (userInfo.favoriteAnimal) {
      personalizedWords.push(...this.getAnimalRelatedWords(userInfo.favoriteAnimal, level));
    }

    return [...baseWords[level], ...personalizedWords].slice(0, level === "easy" ? 8 : level === "medium" ? 10 : 12);
  }

  private static getHobbyRelatedWords(hobby: string, level: "easy" | "medium" | "hard" | "expert"): string[] {
    const hobbyWords = {
      easy: ["fun", "game", "sport", "art", "music"],
      medium: ["creative", "athletic", "artistic", "musical", "skillful"],
      hard: ["recreational", "competitive", "expressive", "therapeutic", "disciplined"],
      expert: ["recreational", "aesthetic", "kinesthetic", "therapeutic", "contemplative"]
    };
    return hobbyWords[level] || [];
  }

  private static getAnimalRelatedWords(animal: string, level: "easy" | "medium" | "hard" | "expert"): string[] {
    const animalWords = {
      easy: ["pet", "wild", "cute", "big", "small"],
      medium: ["habitat", "species", "behavior", "instinct", "ecosystem"],
      hard: ["biodiversity", "conservation", "adaptation", "evolution", "predatory"],
      expert: ["ecological", "evolutionary", "behavioral", "taxonomic", "symbiotic"]
    };
    return animalWords[level] || [];
  }

  private static getPhonicsPatterns(level: "easy" | "medium" | "hard" | "expert"): string[] {
    switch (level) {
      case "easy": return ["at", "an", "it", "in", "op", "ot"];
      case "medium": return ["ch", "sh", "th", "ng", "ck", "qu"];
      case "hard": return ["tion", "sion", "ough", "ight", "eigh"];
      case "expert": return ["ough", "augh", "ique", "tion", "ssion"];
      default: return [];
    }
  }

  private static getPhonicsWords(level: "easy" | "medium" | "hard" | "expert", targetAudience: "native" | "esl" | "both"): string[] {
    const words = {
      easy: ["cat", "bat", "hat", "sit", "hit", "top", "hop"],
      medium: ["chair", "ship", "think", "bring", "duck", "quick"],
      hard: ["action", "mission", "through", "light", "eight"],
      expert: ["rough", "laugh", "technique", "creation", "expression"]
    };
    return words[level] || [];
  }

  private static getFluencyPassages(level: "easy" | "medium" | "hard" | "expert", targetAudience: "native" | "esl" | "both"): string[] {
    return [`Sample passage for ${level} level fluency practice.`];
  }

  private static getTargetWPM(level: "easy" | "medium" | "hard" | "expert", targetAudience: "native" | "esl" | "both"): number {
    const baseWPM = {
      easy: 60,
      medium: 80,
      hard: 120,
      expert: 150
    };
    
    // ESL learners typically need more time
    return targetAudience === "esl" ? Math.floor(baseWPM[level] * 0.8) : baseWPM[level];
  }

  private static getWritingPrompts(level: "easy" | "medium" | "hard" | "expert", userInfo: UserInfo): string[] {
    const prompts = {
      easy: [
        `Write about your favorite ${userInfo.favoriteAnimal || "animal"}`,
        `Describe a perfect day`,
        `Tell about your family`
      ],
      medium: [
        `Write an adventure story about a character who loves ${userInfo.hobbies || "reading"}`,
        `Describe a magical place where your favorite color ${userInfo.favoriteColor || "blue"} is everywhere`,
        `Create a story about friendship`
      ],
      hard: [
        `Write about a character who discovers a hidden talent for ${userInfo.hobbies || "art"}`,
        `Create a mystery story set in your dream location`,
        `Write about overcoming a challenge`
      ],
      expert: [
        `Craft a thought-provoking story about the importance of ${userInfo.specialRequest || "kindness"} in society`,
        `Write a science fiction story about future technology`,
        `Create a complex character study`
      ]
    };
    
    return prompts[level] || [];
  }

  private static getRequiredVocabulary(level: "easy" | "medium" | "hard" | "expert"): string[] {
    return this.getVocabularyWords(level, "both", {} as UserInfo).slice(0, 5);
  }

  // Generate vocabulary game based on user progress
  static generateVocabularyGame(userInfo: UserInfo, difficulty: "easy" | "medium" | "hard" | "expert"): VocabularyGame {
    const words = this.getVocabularyWords(difficulty, userInfo.nativeLanguage !== 'en' ? "esl" : "native", userInfo);
    
    return {
      id: `vocab-game-${Date.now()}`,
      type: "matching",
      words: words.map(word => ({
        word,
        definition: `Definition for ${word}`,
        difficulty,
        context: `Example sentence with ${word}.`
      })),
      timeLimit: difficulty === "easy" ? 120 : difficulty === "medium" ? 90 : 60,
      targetScore: Math.floor(words.length * 0.8)
    };
  }

  // Generate comprehension quiz based on a story
  static generateComprehensionQuiz(storyContent: string[], userInfo: UserInfo, difficulty: "easy" | "medium" | "hard" | "expert"): ComprehensionQuiz {
    const storyExcerpt = storyContent.slice(0, 3).join(" ");
    
    const questions = [
      {
        question: "What is the main character's name?",
        options: [userInfo.name, "Tom", "Sarah", "Alex"],
        correctAnswer: 0,
        explanation: `The story is about ${userInfo.name}.`
      },
      {
        question: "What is the main theme of this story?",
        options: ["Adventure", "Mystery", "Friendship", "Learning"],
        correctAnswer: 3,
        explanation: "The story focuses on learning and growth."
      }
    ];
    
    return {
      id: `quiz-${Date.now()}`,
      storyExcerpt,
      questions,
      difficulty,
      targetAudience: userInfo.nativeLanguage !== 'en' ? "esl" : "native"
    };
  }

  // Save and load learning paths
  static saveLearningPath(path: LearningPath): void {
    const paths = this.loadLearningPaths();
    paths.push(path);
    sessionStorage.setItem('learningPaths', JSON.stringify(paths));
  }

  static loadLearningPaths(): LearningPath[] {
    const stored = sessionStorage.getItem('learningPaths');
    return stored ? JSON.parse(stored) : [];
  }

  static getUserCurrentPath(userInfo: UserInfo): LearningPath | null {
    const paths = this.loadLearningPaths();
    return paths.find(path => path.name.includes(userInfo.name)) || null;
  }
}

export default PersonalizedLearningService;