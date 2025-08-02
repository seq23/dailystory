import { UserInfo, Story, DifficultyLevel } from "@/types";
import { ContentSignatureGenerator, SessionManager } from "./enhancedLinguisticProcessor";
import { ComprehensiveStoryGenerator } from "./comprehensiveStoryGenerator";

export interface FreeUserSession {
  id: string;
  userId: string;
  signature: string;
  difficulty: DifficultyLevel;
  storyContent: Story;
  translationContext: {
    originalInputs: Record<string, string>;
    translatedInputs: Record<string, string>;
    translationCount: number;
  };
  createdAt: Date;
  sessionNumber: number;
}

// In-memory storage for free user sessions (will be replaced with database when tables are available)
const freeUserSessionsCache = new Map<string, FreeUserSession[]>();
const sessionAnalyticsCache = new Map<string, any>();

export class FreeUserStoryService {
  
  // Translation processing same as premium (universal feature)
  static async processWithTranslation(
    userInfo: UserInfo,
    translationContext: {
      originalInputs: Record<string, string>;
      translatedInputs: Record<string, string>;
    }
  ): Promise<{
    processedUserInfo: UserInfo;
    translationReport: {
      fieldsTranslated: string[];
      totalTranslations: number;
      averageConfidence: number;
    };
  }> {
    
    console.log('🔄 Processing free user inputs with full translation support...');
    
    // Apply all translations to create clean English inputs
    const processedUserInfo = { ...userInfo };
    const translationReport = {
      fieldsTranslated: [] as string[],
      totalTranslations: 0,
      averageConfidence: 0.85 // Simulated confidence
    };
    
    // Apply translated inputs
    for (const [field, translatedValue] of Object.entries(translationContext.translatedInputs)) {
      const originalValue = translationContext.originalInputs[field];
      
      if (originalValue !== translatedValue) {
        (processedUserInfo as any)[field] = translatedValue;
        translationReport.fieldsTranslated.push(field);
        translationReport.totalTranslations++;
      }
    }
    
    console.log('✅ Free user translation processing complete:', translationReport);
    
    return { processedUserInfo, translationReport };
  }
  
  // Session uniqueness for 100 stories with translation-aware signatures
  static async checkSessionUniqueness(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    translationContext: any
  ): Promise<{
    canGenerate: boolean;
    sessionInfo: {
      sessionNumber: number;
      remainingSessions: number;
      isUnique: boolean;
    };
    existingSessions: FreeUserSession[];
  }> {
    
    const userId = userInfo.name || 'guest';
    const newSignature = SessionManager.generateSessionSignature(userInfo, difficulty, translationContext);
    
    try {
      // Get existing sessions from cache
      const existingSessions = freeUserSessionsCache.get(userId) || [];
      
      // Check uniqueness with translation awareness
      const existingSignatures = existingSessions.map(s => s.signature);
      const isUnique = SessionManager.isUniqueSession(newSignature, existingSignatures, 100);
      
      const sessionNumber = existingSessions.length + 1;
      const remainingSessions = Math.max(0, 100 - existingSessions.length);
      const canGenerate = isUnique && remainingSessions > 0;
      
      console.log('📊 Free user session check:', {
        sessionNumber,
        remainingSessions,
        isUnique,
        canGenerate,
        totalExistingSessions: existingSessions.length
      });
      
      return {
        canGenerate,
        sessionInfo: { sessionNumber, remainingSessions, isUnique },
        existingSessions
      };
      
    } catch (error) {
      console.error('Error checking session uniqueness:', error);
      
      // Fallback - allow generation with basic limits
      return {
        canGenerate: true,
        sessionInfo: { sessionNumber: 1, remainingSessions: 99, isUnique: true },
        existingSessions: []
      };
    }
  }
  
  // Generate story with translation-aware caching
  static async generateStoryWithCaching(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    translationContext: any
  ): Promise<{
    story: Story;
    isCachedResult: boolean;
    sessionInfo: any;
  }> {
    
    console.log('🎨 Generating free user story with enhanced caching...');
    
    // Check session limits and uniqueness
    const sessionCheck = await this.checkSessionUniqueness(userInfo, difficulty, translationContext);
    
    if (!sessionCheck.canGenerate) {
      throw new Error(`Session limit reached. Only ${sessionCheck.sessionInfo.remainingSessions} sessions remaining.`);
    }
    
    // Check for cached similar stories (fuzzy matching)
    const cachedStory = await this.findSimilarCachedStory(userInfo, difficulty, translationContext);
    
    if (cachedStory) {
      console.log('♻️ Using cached story with similar inputs');
      return {
        story: cachedStory.storyContent,
        isCachedResult: true,
        sessionInfo: sessionCheck.sessionInfo
      };
    }
    
    // Generate new story
    const { processedUserInfo } = await this.processWithTranslation(userInfo, translationContext);
    
    const storyData = ComprehensiveStoryGenerator.generateStory(
      processedUserInfo,
      difficulty,
      8 // Free users get 8 pages
    );
    
    const story: Story = {
      id: crypto.randomUUID(),
      title: this.generateTitle(processedUserInfo, difficulty),
      segments: storyData.pages.map((page, index) => ({
        text: page,
        illustration: `/api/illustrations/free-${index + 1}.jpg`
      })),
      difficulty,
      estimatedReadingTime: Math.ceil(storyData.pages.join(' ').split(' ').length / 100),
      wordCount: storyData.pages.join(' ').split(' ').length
    };
    
    // Cache the new session
    await this.cacheSession(userInfo, story, difficulty, translationContext, sessionCheck.sessionInfo);
    
    console.log('✨ New free user story generated and cached');
    
    return {
      story,
      isCachedResult: false,
      sessionInfo: sessionCheck.sessionInfo
    };
  }
  
  // Efficient processing with advanced translation caching
  static async findSimilarCachedStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    translationContext: any
  ): Promise<FreeUserSession | null> {
    
    try {
      // Generate similarity signatures for fuzzy matching
      const currentSignature = ContentSignatureGenerator.generateSignature(userInfo, translationContext);
      
      // Get all cached sessions
      const allSessions: FreeUserSession[] = [];
      for (const sessions of freeUserSessionsCache.values()) {
        allSessions.push(...sessions.filter(s => s.difficulty === difficulty));
      }
      
      if (!allSessions.length) return null;
      
      // Find sessions with high signature similarity
      for (const session of allSessions.slice(-20)) { // Check last 20 sessions
        const similarity = this.calculateSignatureSimilarity(currentSignature, session.signature);
        
        if (similarity > 0.85) { // 85% similarity threshold
          console.log('🎯 Found similar cached story with', Math.round(similarity * 100) + '% similarity');
          return session;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Error finding cached story:', error);
      return null;
    }
  }
  
  // Cache new session with translation context
  private static async cacheSession(
    userInfo: UserInfo,
    story: Story,
    difficulty: DifficultyLevel,
    translationContext: any,
    sessionInfo: any
  ): Promise<void> {
    
    try {
      const userId = userInfo.name || 'guest';
      const signature = SessionManager.generateSessionSignature(userInfo, difficulty, translationContext);
      
      const session: FreeUserSession = {
        id: crypto.randomUUID(),
        userId,
        signature,
        difficulty,
        storyContent: story,
        translationContext,
        createdAt: new Date(),
        sessionNumber: sessionInfo.sessionNumber
      };
      
      // Add to cache
      const existingSessions = freeUserSessionsCache.get(userId) || [];
      existingSessions.push(session);
      freeUserSessionsCache.set(userId, existingSessions);
      
      console.log('💾 Session cached successfully');
      
    } catch (error) {
      console.error('Error caching session:', error);
    }
  }
  
  // Calculate signature similarity for caching
  private static calculateSignatureSimilarity(sig1: string, sig2: string): number {
    if (sig1 === sig2) return 1.0;
    if (!sig1 || !sig2) return 0.0;
    
    // Simple character-based similarity
    const longer = sig1.length > sig2.length ? sig1 : sig2;
    const shorter = sig1.length > sig2.length ? sig2 : sig1;
    
    if (longer.length === 0) return 1.0;
    
    const matches = shorter.split('').filter((char, index) => char === longer[index]).length;
    return matches / longer.length;
  }
  
  // Generate title based on processed inputs
  private static generateTitle(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    const templates = {
      easy: [
        `${userInfo.name} and the ${userInfo.favoriteAnimal}`,
        `${userInfo.name}'s Day`,
        `The ${userInfo.favoriteAnimal} Story`
      ],
      medium: [
        `${userInfo.name}'s Adventure`,
        `The Mystery of ${userInfo.favoriteAnimal}`,
        `${userInfo.name} and the Magic ${userInfo.favoriteFood}`
      ],
      hard: [
        `${userInfo.name} and the Quest for ${userInfo.favoriteFood}`,
        `The Chronicles of ${userInfo.name}`,
        `${userInfo.name}'s Journey to ${userInfo.hobbies} Land`
      ],
      expert: [
        `${userInfo.name}: The Journey Begins`,
        `Tales from ${userInfo.name}'s World`,
        `The Legend of ${userInfo.name} and the ${userInfo.favoriteAnimal}`
      ]
    };
    
    const options = templates[difficulty] || templates.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  // Update session tracking for analytics
  static async updateSessionAnalytics(
    userId: string,
    performance: {
      completionRate: number;
      timeSpent: number;
      wordsRead: number;
    }
  ): Promise<void> {
    
    try {
      // Update analytics cache
      const existing = sessionAnalyticsCache.get(userId) || {
        total_sessions: 0,
        total_time: 0,
        total_words: 0,
        average_completion: 0
      };
      
      existing.total_sessions += performance.completionRate > 0.8 ? 1 : 0;
      existing.total_time += performance.timeSpent;
      existing.total_words += performance.wordsRead;
      existing.average_completion = (existing.average_completion + performance.completionRate) / 2;
      existing.updated_at = new Date().toISOString();
      
      sessionAnalyticsCache.set(userId, existing);
      
    } catch (error) {
      console.error('Error updating session analytics:', error);
    }
  }
}