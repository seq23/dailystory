// Advanced Character Descriptor Engine
// Phase 1: Consistent Secondary Character Tracking with Cultural Integration

import { SupportedLanguage } from "@/types/multilingual";
import { UserInfo } from "@/types";
import { MulticulturalVisualService } from "./MulticulturalVisualService";

export interface CharacterDescriptor {
  name: string;
  type: 'primary' | 'family' | 'friend' | 'teacher' | 'community';
  relationshipToMain: string;
  culturalRole: string;
  physicalTraits: string;
  clothingStyle: string;
  seed?: number;
  lastUsedPage: number;
  familyGroupId?: string; // For family resemblance tracking
  ageCategory: 'child' | 'teen' | 'adult' | 'elder';
}

export interface FamilyGroup {
  id: string;
  culturalBackground: SupportedLanguage;
  sharedTraits: {
    skinTone: string;
    hairTexture: string;
    facialFeatures: string;
    culturalElements: string[];
  };
  members: CharacterDescriptor[];
}

export class AdvancedCharacterEngine {
  private static characterRegistry: Map<string, CharacterDescriptor> = new Map();
  private static familyGroups: Map<string, FamilyGroup> = new Map();
  private static sessionCharacters: Map<string, Set<string>> = new Map(); // sessionId -> character names

  /**
   * Enhanced character detection with relationship mapping
   */
  static detectCharactersInText(
    storyText: string,
    sessionId: string,
    userInfo: UserInfo,
    pageNumber: number
  ): CharacterDescriptor[] {
    const detectedCharacters: CharacterDescriptor[] = [];
    const text = storyText.toLowerCase();
    
    // Primary character patterns (user)
    const primaryPatterns = [
      userInfo.name?.toLowerCase() || 'main character',
      'you', 'your', 'yourself'
    ];
    
    // Family relationship patterns
    const familyPatterns = {
      'mother|mom|mama|mum': { relationship: 'mother', type: 'family' as const, age: 'adult' as const },
      'father|dad|papa|daddy': { relationship: 'father', type: 'family' as const, age: 'adult' as const },
      'sister|sis': { relationship: 'sister', type: 'family' as const, age: 'child' as const },
      'brother|bro': { relationship: 'brother', type: 'family' as const, age: 'child' as const },
      'grandmother|grandma|nana|abuela|nai nai': { relationship: 'grandmother', type: 'family' as const, age: 'elder' as const },
      'grandfather|grandpa|abuelo|ye ye': { relationship: 'grandfather', type: 'family' as const, age: 'elder' as const },
      'aunt|tia': { relationship: 'aunt', type: 'family' as const, age: 'adult' as const },
      'uncle|tio': { relationship: 'uncle', type: 'family' as const, age: 'adult' as const },
      'cousin|prima|primo': { relationship: 'cousin', type: 'family' as const, age: 'child' as const }
    };
    
    // Community role patterns
    const communityPatterns = {
      'teacher|maestra|maestro': { relationship: 'teacher', type: 'teacher' as const, age: 'adult' as const },
      'friend|amigo|amiga': { relationship: 'friend', type: 'friend' as const, age: 'child' as const },
      'neighbor|vecino|vecina': { relationship: 'neighbor', type: 'community' as const, age: 'adult' as const },
      'classmate': { relationship: 'classmate', type: 'friend' as const, age: 'child' as const }
    };
    
    // Detect primary character
    for (const pattern of primaryPatterns) {
      if (text.includes(pattern)) {
        const primaryChar = this.getOrCreatePrimaryCharacter(sessionId, userInfo, pageNumber);
        detectedCharacters.push(primaryChar);
        break;
      }
    }
    
    // Detect family members
    for (const [pattern, info] of Object.entries(familyPatterns)) {
      const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
      if (regex.test(text)) {
        const familyChar = this.getOrCreateFamilyCharacter(
          sessionId, 
          info.relationship, 
          userInfo, 
          pageNumber,
          info.age
        );
        detectedCharacters.push(familyChar);
      }
    }
    
    // Detect community members
    for (const [pattern, info] of Object.entries(communityPatterns)) {
      const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
      if (regex.test(text)) {
        const communityChar = this.getOrCreateCommunityCharacter(
          sessionId,
          info.relationship,
          userInfo,
          pageNumber,
          info.age
        );
        detectedCharacters.push(communityChar);
      }
    }
    
    // Update session character tracking
    this.updateSessionCharacters(sessionId, detectedCharacters);
    
    console.log(`👥 Detected ${detectedCharacters.length} characters in page ${pageNumber}:`, 
      detectedCharacters.map(c => `${c.name} (${c.type})`));
    
    return detectedCharacters;
  }

  /**
   * Get or create primary character with cultural traits
   */
  private static getOrCreatePrimaryCharacter(
    sessionId: string,
    userInfo: UserInfo,
    pageNumber: number
  ): CharacterDescriptor {
    const characterId = `${sessionId}_primary`;
    
    if (this.characterRegistry.has(characterId)) {
      const existing = this.characterRegistry.get(characterId)!;
      existing.lastUsedPage = pageNumber;
      return existing;
    }
    
    const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    const familyGroupId = `${sessionId}_family`;
    
    // Create family group for shared traits
    this.createFamilyGroup(familyGroupId, userInfo.nativeLanguage as SupportedLanguage, culturalProfile);
    
    const primaryCharacter: CharacterDescriptor = {
      name: userInfo.name || 'Main Character',
      type: 'primary',
      relationshipToMain: 'self',
      culturalRole: 'child protagonist',
      physicalTraits: MulticulturalVisualService.generateCulturalCharacterDescription(userInfo),
      clothingStyle: MulticulturalVisualService.getCulturalClothing(userInfo),
      lastUsedPage: pageNumber,
      familyGroupId,
      ageCategory: 'child'
    };
    
    this.characterRegistry.set(characterId, primaryCharacter);
    this.addToFamilyGroup(familyGroupId, primaryCharacter);
    
    console.log(`👤 Created primary character: ${primaryCharacter.name}`);
    return primaryCharacter;
  }

  /**
   * Get or create family member with resemblance to primary character
   */
  private static getOrCreateFamilyCharacter(
    sessionId: string,
    relationship: string,
    userInfo: UserInfo,
    pageNumber: number,
    ageCategory: 'child' | 'teen' | 'adult' | 'elder'
  ): CharacterDescriptor {
    const characterId = `${sessionId}_${relationship}`;
    
    if (this.characterRegistry.has(characterId)) {
      const existing = this.characterRegistry.get(characterId)!;
      existing.lastUsedPage = pageNumber;
      return existing;
    }
    
    const familyGroupId = `${sessionId}_family`;
    const familyGroup = this.familyGroups.get(familyGroupId);
    
    if (!familyGroup) {
      // Create family group if it doesn't exist
      const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
      this.createFamilyGroup(familyGroupId, userInfo.nativeLanguage as SupportedLanguage, culturalProfile);
    }
    
    const familyTraits = this.familyGroups.get(familyGroupId)!.sharedTraits;
    const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    
    // Generate age-appropriate description with family resemblance
    const physicalTraits = this.generateFamilyMemberTraits(
      familyTraits,
      relationship,
      ageCategory,
      culturalProfile
    );
    
    const familyCharacter: CharacterDescriptor = {
      name: this.generateCulturalName(relationship, userInfo.nativeLanguage as SupportedLanguage),
      type: 'family',
      relationshipToMain: relationship,
      culturalRole: this.getCulturalFamilyRole(relationship, userInfo.nativeLanguage as SupportedLanguage),
      physicalTraits,
      clothingStyle: this.getFamilyClothing(relationship, ageCategory, culturalProfile),
      lastUsedPage: pageNumber,
      familyGroupId,
      ageCategory
    };
    
    this.characterRegistry.set(characterId, familyCharacter);
    this.addToFamilyGroup(familyGroupId, familyCharacter);
    
    console.log(`👨‍👩‍👧‍👦 Created family member: ${familyCharacter.name} (${relationship})`);
    return familyCharacter;
  }

  /**
   * Get or create community member with cultural authenticity
   */
  private static getOrCreateCommunityCharacter(
    sessionId: string,
    relationship: string,
    userInfo: UserInfo,
    pageNumber: number,
    ageCategory: 'child' | 'teen' | 'adult' | 'elder'
  ): CharacterDescriptor {
    const characterId = `${sessionId}_${relationship}`;
    
    if (this.characterRegistry.has(characterId)) {
      const existing = this.characterRegistry.get(characterId)!;
      existing.lastUsedPage = pageNumber;
      return existing;
    }
    
    const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    
    const communityCharacter: CharacterDescriptor = {
      name: this.generateCulturalName(relationship, userInfo.nativeLanguage as SupportedLanguage),
      type: relationship === 'teacher' ? 'teacher' : (relationship === 'friend' || relationship === 'classmate' ? 'friend' : 'community'),
      relationshipToMain: relationship,
      culturalRole: this.getCulturalCommunityRole(relationship, userInfo.nativeLanguage as SupportedLanguage),
      physicalTraits: this.generateCommunityMemberTraits(ageCategory, culturalProfile),
      clothingStyle: this.getCommunityClothing(relationship, ageCategory, culturalProfile),
      lastUsedPage: pageNumber,
      ageCategory
    };
    
    this.characterRegistry.set(characterId, communityCharacter);
    
    console.log(`🏘️ Created community member: ${communityCharacter.name} (${relationship})`);
    return communityCharacter;
  }

  // Helper methods for cultural authenticity and family resemblance

  private static createFamilyGroup(
    groupId: string,
    culturalBackground: SupportedLanguage,
    culturalProfile: any
  ): void {
    const sharedTraits = {
      skinTone: culturalProfile.skinTones[Math.floor(Math.random() * culturalProfile.skinTones.length)],
      hairTexture: culturalProfile.hairStyles[0].split(' ')[0], // Extract texture
      facialFeatures: culturalProfile.facialFeatures[0],
      culturalElements: culturalProfile.culturalElements.slice(0, 2)
    };
    
    const familyGroup: FamilyGroup = {
      id: groupId,
      culturalBackground,
      sharedTraits,
      members: []
    };
    
    this.familyGroups.set(groupId, familyGroup);
    console.log(`👨‍👩‍👧‍👦 Created family group with traits:`, sharedTraits);
  }

  private static addToFamilyGroup(groupId: string, character: CharacterDescriptor): void {
    const group = this.familyGroups.get(groupId);
    if (group) {
      group.members.push(character);
    }
  }

  private static generateFamilyMemberTraits(
    familyTraits: any,
    relationship: string,
    ageCategory: string,
    culturalProfile: any
  ): string {
    const baseTraits = [familyTraits.skinTone];
    
    // Age-appropriate hair styling
    if (ageCategory === 'elder') {
      baseTraits.push('gray hair with wisdom');
    } else if (ageCategory === 'adult') {
      baseTraits.push(culturalProfile.hairStyles[Math.floor(Math.random() * culturalProfile.hairStyles.length)]);
    } else {
      baseTraits.push('youthful ' + familyTraits.hairTexture + ' hair');
    }
    
    // Shared facial features
    baseTraits.push(familyTraits.facialFeatures);
    
    // Relationship-specific traits
    if (relationship.includes('mother') || relationship.includes('father')) {
      baseTraits.push('nurturing expression');
    } else if (relationship.includes('grand')) {
      baseTraits.push('wise kind eyes');
    }
    
    return baseTraits.join(', ');
  }

  private static generateCommunityMemberTraits(ageCategory: string, culturalProfile: any): string {
    const traits = [
      culturalProfile.skinTones[Math.floor(Math.random() * culturalProfile.skinTones.length)],
      culturalProfile.hairStyles[Math.floor(Math.random() * culturalProfile.hairStyles.length)],
      culturalProfile.facialFeatures[Math.floor(Math.random() * culturalProfile.facialFeatures.length)]
    ];
    
    if (ageCategory === 'child') {
      traits.push('youthful friendly appearance');
    } else if (ageCategory === 'adult') {
      traits.push('professional caring demeanor');
    }
    
    return traits.join(', ');
  }

  private static generateCulturalName(relationship: string, language: SupportedLanguage): string {
    const namePatterns: Record<SupportedLanguage, Record<string, string[]>> = {
      'ar': {
        mother: ['Amina', 'Fatima', 'Aisha'],
        father: ['Ahmad', 'Omar', 'Hassan'],
        grandmother: ['Hajja Fatima', 'Sitt Amina'],
        teacher: ['Ustaz Ahmad', 'Miss Aisha']
      },
      'es': {
        mother: ['María', 'Carmen', 'Rosa'],
        father: ['José', 'Carlos', 'Miguel'],
        grandmother: ['Abuela Rosa', 'Abuelita María'],
        teacher: ['Señorita Carmen', 'Maestro José']
      },
      'zh': {
        mother: ['Li Wei', 'Wang Ming', 'Chen Mei'],
        father: ['Li Gang', 'Wang Jun', 'Chen Hao'],
        grandmother: ['Nai Nai', 'Po Po'],
        teacher: ['Teacher Wang', 'Miss Li']
      },
      'hi': {
        mother: ['Priya', 'Sunita', 'Kavya'],
        father: ['Raj', 'Amit', 'Vikram'],
        grandmother: ['Dadi', 'Nani'],
        teacher: ['Priya Madam', 'Raj Sir']
      },
      'pt': {
        mother: ['Maria', 'Ana', 'Lucia'],
        father: ['João', 'Carlos', 'Pedro'],
        grandmother: ['Vovó Maria', 'Vovó Ana'],
        teacher: ['Professora Ana', 'Professor João']
      },
      'fr': {
        mother: ['Marie', 'Sophie', 'Claire'],
        father: ['Pierre', 'Jean', 'Paul'],
        grandmother: ['Grand-mère Marie', 'Mémé Sophie'],
        teacher: ['Madame Claire', 'Monsieur Pierre']
      },
      'en': {
        mother: ['Mom', 'Mother', 'Mama'],
        father: ['Dad', 'Father', 'Papa'],
        grandmother: ['Grandma', 'Nana', 'Grammy'],
        teacher: ['Mrs. Johnson', 'Mr. Smith', 'Ms. Davis']
      }
    };
    
    const names = namePatterns[language]?.[relationship] || namePatterns['en'][relationship] || [relationship];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static getCulturalFamilyRole(relationship: string, language: SupportedLanguage): string {
    // Return culturally appropriate family role descriptions
    return `loving ${relationship}`;
  }

  private static getCulturalCommunityRole(relationship: string, language: SupportedLanguage): string {
    // Return culturally appropriate community role descriptions
    return `supportive ${relationship}`;
  }

  private static getFamilyClothing(relationship: string, ageCategory: string, culturalProfile: any): string {
    return culturalProfile.clothing[Math.floor(Math.random() * culturalProfile.clothing.length)];
  }

  private static getCommunityClothing(relationship: string, ageCategory: string, culturalProfile: any): string {
    if (relationship === 'teacher') {
      return 'professional teaching attire';
    }
    return culturalProfile.clothing[Math.floor(Math.random() * culturalProfile.clothing.length)];
  }

  private static updateSessionCharacters(sessionId: string, characters: CharacterDescriptor[]): void {
    if (!this.sessionCharacters.has(sessionId)) {
      this.sessionCharacters.set(sessionId, new Set());
    }
    
    const sessionSet = this.sessionCharacters.get(sessionId)!;
    characters.forEach(char => sessionSet.add(char.name));
  }

  /**
   * Get all characters for a session
   */
  static getSessionCharacters(sessionId: string): CharacterDescriptor[] {
    const sessionSet = this.sessionCharacters.get(sessionId);
    if (!sessionSet) return [];
    
    return Array.from(sessionSet).map(name => {
      for (const [id, char] of this.characterRegistry) {
        if (char.name === name && id.startsWith(sessionId)) {
          return char;
        }
      }
      return null;
    }).filter(Boolean) as CharacterDescriptor[];
  }

  /**
   * Clear session data
   */
  static clearSession(sessionId: string): void {
    // Remove characters
    for (const [id] of this.characterRegistry) {
      if (id.startsWith(sessionId)) {
        this.characterRegistry.delete(id);
      }
    }
    
    // Remove family groups
    for (const [id] of this.familyGroups) {
      if (id.startsWith(sessionId)) {
        this.familyGroups.delete(id);
      }
    }
    
    // Remove session tracking
    this.sessionCharacters.delete(sessionId);
    
    console.log(`🗑️ Cleared character data for session: ${sessionId}`);
  }
}
