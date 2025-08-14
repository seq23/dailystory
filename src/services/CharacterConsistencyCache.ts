// Character Consistency Cache for Story Sessions
// Phase 2: Enhanced Character Consistency Implementation

import type { UserInfo, DifficultyLevel } from '@/types';

export interface CharacterTraits {
  // Core identity (consistent across story)
  name: string;
  ageGroup: 'young child' | 'child' | 'older child' | 'young person';
  avatarType: 'boy' | 'girl' | 'prefer-not-to-answer';
  skinTone: 'pale' | 'light' | 'medium' | 'olive' | 'dark';
  
  // Derived physical traits (cached for consistency)
  hairDescription: string;
  facialFeatures: string;
  bodyType: string;
  clothing: string;
  
  // Context details
  difficultyLevel: DifficultyLevel;
  sessionId: string;
  lastUsed: number;
}

export interface SceneCharacterData {
  // Consistent traits from cache
  coreTraits: CharacterTraits;
  
  // Scene-specific details
  emotion: string;
  action: string;
  pose: string;
  expression: string;
  
  // Scene context
  setting: string;
  lighting: string;
  perspective: string;
}

export class CharacterConsistencyCache {
  private static readonly CACHE_KEY_PREFIX = 'character_traits_';
  private static readonly CACHE_EXPIRY_HOURS = 24;

  static cacheCharacterTraits(sessionId: string, userInfo: UserInfo, difficultyLevel: DifficultyLevel): CharacterTraits {
    const traits: CharacterTraits = {
      name: userInfo.name,
      ageGroup: this.getAgeGroup(userInfo.age),
      avatarType: userInfo.avatar?.type || 'prefer-not-to-answer',
      skinTone: userInfo.avatar?.skinTone || 'medium',
      hairDescription: this.generateHairDescription(userInfo),
      facialFeatures: this.generateFacialFeatures(userInfo),
      bodyType: this.generateBodyType(userInfo),
      clothing: this.generateClothing(userInfo, difficultyLevel),
      difficultyLevel,
      sessionId,
      lastUsed: Date.now()
    };

    this.saveToCache(sessionId, traits);
    return traits;
  }

  static getCachedCharacterTraits(sessionId: string): CharacterTraits | null {
    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY_PREFIX}${sessionId}`);
      if (!cached) return null;

      const traits: CharacterTraits = JSON.parse(cached);
      
      // Check expiry
      const hoursOld = (Date.now() - traits.lastUsed) / (1000 * 60 * 60);
      if (hoursOld > this.CACHE_EXPIRY_HOURS) {
        this.clearCache(sessionId);
        return null;
      }

      // Update last used
      traits.lastUsed = Date.now();
      this.saveToCache(sessionId, traits);
      
      return traits;
    } catch (error) {
      console.warn('Failed to load cached character traits:', error);
      return null;
    }
  }

  static buildSceneCharacterData(
    sessionId: string, 
    userInfo: UserInfo, 
    difficultyLevel: DifficultyLevel,
    sceneContext: {
      emotion: string;
      action: string;
      setting: string;
      lighting: string;
      perspective: string;
    }
  ): SceneCharacterData {
    // Get or create cached traits
    let coreTraits = this.getCachedCharacterTraits(sessionId);
    if (!coreTraits) {
      coreTraits = this.cacheCharacterTraits(sessionId, userInfo, difficultyLevel);
    }

    return {
      coreTraits,
      emotion: sceneContext.emotion,
      action: sceneContext.action,
      pose: this.generatePose(sceneContext.action),
      expression: this.generateExpression(sceneContext.emotion),
      setting: sceneContext.setting,
      lighting: sceneContext.lighting,
      perspective: sceneContext.perspective
    };
  }

  static generateCharacterPrompt(sceneData: SceneCharacterData): string {
    const { coreTraits } = sceneData;
    
    let prompt = `${coreTraits.ageGroup} named ${coreTraits.name}, `;
    prompt += `${coreTraits.avatarType} appearance with ${coreTraits.skinTone} skin tone, `;
    prompt += `${coreTraits.hairDescription}, ${coreTraits.facialFeatures}, `;
    prompt += `${coreTraits.bodyType}, wearing ${coreTraits.clothing}. `;
    prompt += `Character is ${sceneData.action} with ${sceneData.expression} expression, `;
    prompt += `${sceneData.pose} pose, showing ${sceneData.emotion} emotion`;

    return prompt;
  }

  private static getAgeGroup(age: number): 'young child' | 'child' | 'older child' | 'young person' {
    if (age <= 5) return 'young child';
    if (age <= 8) return 'child';
    if (age <= 12) return 'older child';
    return 'young person';
  }

  private static generateHairDescription(userInfo: UserInfo): string {
    const styles = ['short wavy', 'shoulder-length', 'curly', 'straight', 'braided', 'ponytail'];
    const colors = ['brown', 'blonde', 'black', 'dark brown', 'light brown'];
    
    // Use user's favorite color as hint, but keep realistic
    const hairColor = colors[Math.floor(Math.random() * colors.length)];
    const hairStyle = styles[Math.floor(Math.random() * styles.length)];
    
    return `${hairStyle} ${hairColor} hair`;
  }

  private static generateFacialFeatures(userInfo: UserInfo): string {
    const features = [
      'kind expressive eyes',
      'friendly smile', 
      'warm gentle features',
      'bright curious eyes',
      'cheerful face'
    ];
    
    return features[Math.floor(Math.random() * features.length)];
  }

  private static generateBodyType(userInfo: UserInfo): string {
    const ageGroup = this.getAgeGroup(userInfo.age);
    
    switch (ageGroup) {
      case 'young child': return 'small child proportions';
      case 'child': return 'child proportions';
      case 'older child': return 'pre-teen proportions';
      case 'young person': return 'teenage proportions';
      default: return 'child proportions';
    }
  }

  private static generateClothing(userInfo: UserInfo, difficultyLevel: DifficultyLevel): string {
    const casual = ['comfortable t-shirt and shorts', 'casual play clothes', 'everyday outfit'];
    const adventurous = ['adventure-ready clothes', 'exploration outfit', 'outdoor gear'];
    const formal = ['nice outfit', 'school clothes', 'neat casual wear'];
    
    // Base clothing on difficulty complexity
    if (difficultyLevel === 'beginner' || difficultyLevel === 'easy') {
      return casual[Math.floor(Math.random() * casual.length)];
    } else if (difficultyLevel === 'expert' || difficultyLevel === 'hard') {
      return adventurous[Math.floor(Math.random() * adventurous.length)];
    } else {
      return formal[Math.floor(Math.random() * formal.length)];
    }
  }

  private static generatePose(action: string): string {
    const poseMap: Record<string, string[]> = {
      'exploring': ['walking forward', 'looking around curiously', 'pointing ahead'],
      'playing': ['active play pose', 'joyful movement', 'engaged play position'],
      'learning': ['attentive listening pose', 'focused concentration', 'thoughtful stance'],
      'helping': ['reaching out helpfully', 'supportive gesture', 'caring position'],
      'creating': ['hands-on making pose', 'artistic concentration', 'creative focus'],
      'traveling': ['walking confidently', 'adventure-ready stance', 'journey pose'],
      'celebrating': ['joyful celebration pose', 'happy jumping', 'festive gesture'],
      'solving': ['thinking pose', 'problem-solving stance', 'analytical position'],
      'resting': ['peaceful relaxed pose', 'calm sitting', 'restful position']
    };

    const poses = poseMap[action] || ['natural standing pose', 'comfortable position'];
    return poses[Math.floor(Math.random() * poses.length)];
  }

  private static generateExpression(emotion: string): string {
    const expressionMap: Record<string, string[]> = {
      'happy': ['bright smile', 'joyful grin', 'cheerful expression'],
      'sad': ['gentle sad look', 'thoughtful expression', 'subdued face'],
      'excited': ['wide-eyed excitement', 'animated expression', 'enthusiastic look'],
      'curious': ['wondering expression', 'inquisitive look', 'interested face'],
      'peaceful': ['calm serene expression', 'content smile', 'tranquil look'],
      'surprised': ['amazed expression', 'wonder-filled look', 'astonished face']
    };

    const expressions = expressionMap[emotion] || ['friendly expression', 'pleasant look'];
    return expressions[Math.floor(Math.random() * expressions.length)];
  }

  private static saveToCache(sessionId: string, traits: CharacterTraits): void {
    try {
      localStorage.setItem(`${this.CACHE_KEY_PREFIX}${sessionId}`, JSON.stringify(traits));
    } catch (error) {
      console.warn('Failed to cache character traits:', error);
    }
  }

  static clearCache(sessionId: string): void {
    try {
      localStorage.removeItem(`${this.CACHE_KEY_PREFIX}${sessionId}`);
    } catch (error) {
      console.warn('Failed to clear character cache:', error);
    }
  }

  static clearAllCaches(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear all character caches:', error);
    }
  }
}
