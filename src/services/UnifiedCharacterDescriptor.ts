/**
 * Unified Character Descriptor System - Simplified
 * Basic character generation without frontend cultural arrays
 * All cultural enhancement is now handled on the backend
 */

import type { UserInfo } from "@/types";
import { DebugLogger } from '@/services/DebugLogger';

export type OutputMode = 'rich' | 'basic';

export class UnifiedCharacterDescriptor {
  
  // ============= BASIC CHARACTER GENERATION =============
  
  // Enhanced age mapping with categories  
  private static getAgeRange(difficulty: string): string {
    const ageMapping = {
      'K': '4-5 years old',
      '1st': '6-7 years old', 
      '2nd': '7-8 years old',
      '3rd': '8-9 years old',
      '4th': '9-10 years old',
      '5th': '10-11 years old',
      'easy': '5-7 years old',
      'medium': '7-9 years old', 
      'hard': '9-11 years old'
    };
    
    return ageMapping[difficulty] || '7-9 years old';
  }

  // Get age category for character generation
  static getAgeCategory(difficulty: string): 'child' | 'teen' | 'adult' | 'elder' {
    const categoryMapping = {
      'K': 'child',
      '1st': 'child',
      '2nd': 'child', 
      '3rd': 'child',
      '4th': 'child',
      '5th': 'child',
      'easy': 'child',
      'medium': 'child',
      'hard': 'child'
    };
    
    return categoryMapping[difficulty] || 'child';
  }

  // ============= MAIN CHARACTER DESCRIPTION GENERATOR =============
  
  /**
   * Generate basic character description (no cultural enhancement - handled on backend)
   */
  static generateCharacterDescription(
    userInfo: UserInfo, 
    difficulty: string = 'medium', 
    outputMode: OutputMode = 'rich', 
    culturalEnhancement: boolean = false
  ): string {
    const name = userInfo?.name || 'Child';
    const gender = userInfo?.avatar?.type || 'child';
    const ageRange = this.getAgeRange(difficulty);
    
    // Basic skin tone mapping without cultural elements
    const skinToneMap = {
      'pale': 'pale skin',
      'light': 'light skin', 
      'medium': 'medium skin',
      'olive': 'olive skin',
      'dark': 'dark skin'
    };
    
    const skinTone = skinToneMap[userInfo?.avatar?.skinTone || 'medium'] || 'medium skin';
    
    // Simple description - all cultural enhancement happens on backend
    return `${name} (${gender}, ${ageRange}, ${skinTone})`;
  }

  /**
   * SAFE character description that NEVER fails - for reliable fallback
   */
  static getCharacterDescriptionSafe(userInfo: UserInfo, difficulty?: string): string {
    try {
      return this.generateCharacterDescription(userInfo, difficulty, 'rich', false);
    } catch (error) {
      DebugLogger.warn('story', 'UnifiedCharacterDescriptor failed, using emergency fallback', { error });
      const avatarType = userInfo?.avatar?.type || 'child';
      const skinTone = userInfo?.avatar?.skinTone || 'medium';
      const genderTerm = avatarType === 'girl' ? 'girl' : 'boy';
      return `friendly ${genderTerm} ${avatarType} with ${skinTone} skin, warm smile, children's book style`;
    }
  }

  /**
   * Legacy compatibility for buildAdvancedCharacterDescription (Tier 1)
   */
  static buildAdvancedCharacterDescription(
    userInfo: UserInfo,
    culturalProfile: any,
    characterSeed: any,
    difficulty: string
  ): string {
    return this.generateCharacterDescription(userInfo, difficulty, 'rich', false);
  }

  /**
   * Legacy compatibility for buildSimpleCharacterDescription (Tier 2)  
   */
  static buildSimpleCharacterDescription(
    userInfo: UserInfo,
    difficulty: string = 'easy'
  ): string {
    return this.generateCharacterDescription(userInfo, difficulty, 'basic', false);
  }

  /**
   * Simple session character storage
   */
  private static characterRegistry: Map<string, CharacterDescriptor> = new Map();

  /**
   * Generate primary character description with session consistency
   */
  static generatePrimaryCharacter(userInfo: UserInfo, difficulty: string = 'easy', sessionId?: string): CharacterDescriptor {
    if (sessionId) {
      const characterId = `${sessionId}_primary`;
      
      if (this.characterRegistry.has(characterId)) {
        const existing = this.characterRegistry.get(characterId)!;
        return existing;
      }
      
      // Create new primary character
      const primaryCharacter: CharacterDescriptor = {
        name: userInfo.name?.split(' ')[0] || 'Child',
        type: 'primary',
        relationshipToMain: 'self',
        culturalRole: 'child protagonist',
        physicalTraits: this.generateCharacterDescription(userInfo, difficulty, 'rich', false),
        clothingStyle: 'casual children\'s clothing',
        lastUsedPage: 1,
        familyGroupId: `${sessionId}_family`,
        ageCategory: this.getAgeCategory(difficulty)
      };
      
      this.characterRegistry.set(characterId, primaryCharacter);
      return primaryCharacter;
    }
    
    // Non-session version
    return {
      name: userInfo.name?.split(' ')[0] || 'Child',
      type: 'primary',
      relationshipToMain: 'self', 
      culturalRole: 'child protagonist',
      physicalTraits: this.generateCharacterDescription(userInfo, difficulty, 'rich', false),
      clothingStyle: 'casual children\'s clothing',
      lastUsedPage: 1,
      ageCategory: this.getAgeCategory(difficulty)
    };
  }

  /**
   * Generate secondary characters (simplified)
   */
  static generateSecondaryCharacter(
    type: 'family' | 'community' | 'animal',
    details: SecondaryCharacterDetails,
    userInfo: UserInfo,
    sessionId?: string
  ): CharacterDescriptor | AnimalCharacter {
    if (type === 'animal') {
      return {
        species: details.species || 'dog',
        name: details.name,
        color: details.color,
        size: details.size,
        personality: details.personality,
        seed: Math.random() * 1000000,
        firstMentionedPage: 1,
        lastMentionedPage: 1,
        mentionCount: 1,
        createdAt: Date.now()
      };
    }
    
    const characterId = `${sessionId || 'default'}_${type}_${details.relationship || details.name}`;
    
    if (this.characterRegistry.has(characterId)) {
      const existing = this.characterRegistry.get(characterId)!;
      return existing;
    }
    
    const ageCategory = this.mapRelationshipToAge(details.relationship || 'friend');
    
    const secondaryCharacter: CharacterDescriptor = {
      name: details.name || this.generateSimpleName(details.relationship || 'friend'),
      type: type === 'family' ? 'family' : 'community',
      relationshipToMain: details.relationship || 'friend',
      culturalRole: `supportive ${details.relationship || 'friend'}`,
      physicalTraits: this.generateBasicTraits(ageCategory),
      clothingStyle: this.getAgeAppropriateClothing(ageCategory),
      lastUsedPage: 1,
      familyGroupId: type === 'family' ? `${sessionId}_family` : undefined,
      ageCategory
    };
    
    if (sessionId) {
      this.characterRegistry.set(characterId, secondaryCharacter);
    }
    
    return secondaryCharacter;
  }

  /**
   * Get character consistency data for session
   */
  static getCharacterConsistencyData(sessionId: string): CharacterConsistencyData {
    const sessionChars = Array.from(this.characterRegistry.entries())
      .filter(([id]) => id.startsWith(sessionId))
      .map(([_, char]) => char);
      
    return {
      characters: sessionChars,
      animals: [],
      sessionId,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Clear session data 
   */
  static clearSession(sessionId: string): void {
    for (const [id] of this.characterRegistry) {
      if (id.startsWith(sessionId)) {
        this.characterRegistry.delete(id);
      }
    }
    DebugLogger.log('story', `Cleared unified character data for session: ${sessionId}`);
  }

  // ============= HELPER METHODS =============

  private static mapRelationshipToAge(relationship: string): 'child' | 'teen' | 'adult' | 'elder' {
    const ageMapping: Record<string, 'child' | 'teen' | 'adult' | 'elder'> = {
      'sister': 'child',
      'brother': 'child', 
      'cousin': 'child',
      'friend': 'child',
      'classmate': 'child',
      'mother': 'adult',
      'father': 'adult',
      'aunt': 'adult',
      'uncle': 'adult',
      'teacher': 'adult',
      'neighbor': 'adult',
      'grandmother': 'elder',
      'grandfather': 'elder'
    };
    
    return ageMapping[relationship] || 'adult';
  }

  private static generateBasicTraits(ageCategory: 'child' | 'teen' | 'adult' | 'elder'): string {
    const traitMap = {
      'child': 'friendly child with youthful appearance',
      'teen': 'friendly teenager with energetic appearance',
      'adult': 'friendly adult with mature appearance',
      'elder': 'wise elder with gentle appearance'
    };
    
    return traitMap[ageCategory];
  }

  private static getAgeAppropriateClothing(ageCategory: 'child' | 'teen' | 'adult' | 'elder'): string {
    const clothingMap = {
      'child': 'casual children\'s clothing',
      'teen': 'trendy youth clothing',
      'adult': 'professional adult attire',
      'elder': 'comfortable elder clothing'
    };
    
    return clothingMap[ageCategory];
  }

  private static generateSimpleName(relationship: string): string {
    const names: Record<string, string[]> = {
      'mother': ['Mom', 'Mother', 'Mama'],
      'father': ['Dad', 'Father', 'Papa'],
      'grandmother': ['Grandma', 'Nana', 'Grammy'],
      'grandfather': ['Grandpa', 'Granddad', 'Gramps'],
      'teacher': ['Mrs. Smith', 'Mr. Johnson', 'Ms. Davis'],
      'friend': ['Alex', 'Sam', 'Jordan']
    };
    
    const nameList = names[relationship] || ['Friend'];
    return nameList[Math.floor(Math.random() * nameList.length)];
  }
}
// ============= INTERFACE DEFINITIONS =============

export interface CharacterDescriptor {
  name: string;
  type: 'primary' | 'family' | 'friend' | 'teacher' | 'community';
  relationshipToMain: string;
  culturalRole: string;
  physicalTraits: string;
  clothingStyle: string;
  seed?: number;
  lastUsedPage: number;
  familyGroupId?: string;
  ageCategory: 'child' | 'teen' | 'adult' | 'elder';
}

export interface AnimalCharacter {
  species: string;
  name?: string;
  color?: string;
  size?: string;
  personality?: string;
  seed: number;
  firstMentionedPage: number;
  lastMentionedPage: number;
  mentionCount: number;
  createdAt: number;
}

export interface SecondaryCharacterDetails {
  relationship?: string; // Optional for animals
  name?: string;
  species?: string; // For animals
  color?: string; // For animals
  size?: string; // For animals
  personality?: string; // For animals
}

export interface CharacterConsistencyData {
  characters: CharacterDescriptor[];
  animals: AnimalCharacter[];
  sessionId: string;
  lastUpdated: string;
}