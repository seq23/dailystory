// Avatar Identity Processor - Unified Avatar Processing
// Provides standardized avatar identity mapping and processing

export class AvatarIdentityProcessor {
  
  // ============= STANDARDIZED AVATAR IDENTITY MAPPING =============
  static mapAvatarIdentity(userInfo, avatarIdentity = null) {
    // Priority order: provided avatarIdentity > userInfo.avatar > userInfo defaults
    if (avatarIdentity && avatarIdentity.type) {
      return {
        type: avatarIdentity.type,
        skinTone: avatarIdentity.skinTone || userInfo?.avatar?.skinTone || 'medium',
        hairColor: avatarIdentity.hairColor || userInfo?.avatar?.hairColor || 'brown',
        visualDescription: avatarIdentity.visualDescription || this.generateVisualDescription(avatarIdentity, userInfo)
      };
    }
    
    if (userInfo?.avatar?.type) {
      return {
        type: userInfo.avatar.type,
        skinTone: userInfo.avatar.skinTone || 'medium',
        hairColor: userInfo.avatar.hairColor || 'brown',
        visualDescription: userInfo.avatar.visualDescription || this.generateVisualDescription(userInfo.avatar, userInfo)
      };
    }
    
    // Fallback to basic child representation
    const defaultGender = userInfo?.gender || 'child';
    return {
      type: defaultGender === 'boy' ? 'boy' : defaultGender === 'girl' ? 'girl' : 'child',
      skinTone: 'medium',
      hairColor: 'brown',
      visualDescription: `young ${defaultGender} with friendly appearance`
    };
  }
  
  // ============= VISUAL DESCRIPTION GENERATION =============
  static generateVisualDescription(avatarData, userInfo) {
    if (avatarData.visualDescription) {
      return avatarData.visualDescription;
    }
    
    const type = avatarData.type || userInfo?.gender || 'child';
    const skinTone = avatarData.skinTone || 'medium';
    const hairColor = avatarData.hairColor || 'brown';
    
    return `young ${type} with ${skinTone} skin tone and ${hairColor} hair`;
  }
  
  // ============= CULTURAL PROFILE DETERMINATION =============
  static determineCulturalProfile(userInfo, avatarIdentity) {
    const mappedIdentity = this.mapAvatarIdentity(userInfo, avatarIdentity);
    
    // Check for African American features
    const isDarkSkinned = mappedIdentity.skinTone === 'dark' || mappedIdentity.skinTone === 'deep brown';
    const isAfricanAmerican = isDarkSkinned && (mappedIdentity.type === 'boy' || mappedIdentity.type === 'girl');
    
    // Base cultural profile from language
    const baseCulturalProfile = userInfo?.nativeLanguage || 'en';
    
    return {
      baseCulturalProfile,
      isAfricanAmerican,
      shouldApplyAfricanAmericanEnhancements: isAfricanAmerican,
      culturalContext: {
        language: baseCulturalProfile,
        africanAmericanEnhancements: isAfricanAmerican,
        skinTone: mappedIdentity.skinTone,
        type: mappedIdentity.type
      }
    };
  }
  
  // ============= CONSISTENCY VALIDATION =============
  static validateAvatarConsistency(avatarIdentity, userInfo) {
    const mapped = this.mapAvatarIdentity(userInfo, avatarIdentity);
    
    const issues = [];
    
    if (!mapped.type) {
      issues.push('Missing avatar type');
    }
    
    if (!mapped.skinTone) {
      issues.push('Missing skin tone');
    }
    
    if (!mapped.visualDescription) {
      issues.push('Missing visual description');
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues,
      mappedIdentity: mapped
    };
  }
  
  // ============= CONTEXT INTEGRATION =============
  static buildAvatarContextForPrompt(avatarIdentity, userInfo, storyContext = '') {
    const mapped = this.mapAvatarIdentity(userInfo, avatarIdentity);
    const cultural = this.determineCulturalProfile(userInfo, avatarIdentity);
    
    const contextParts = [];
    
    // Add visual description
    if (mapped.visualDescription) {
      contextParts.push(`Character: ${mapped.visualDescription}`);
    }
    
    // Add cultural context if applicable
    if (cultural.isAfricanAmerican) {
      contextParts.push('Cultural Context: African American child with authentic features');
    }
    
    // Add story-specific context
    if (storyContext) {
      contextParts.push(`Story Context: ${storyContext}`);
    }
    
    return {
      contextString: contextParts.join('. '),
      mappedIdentity: mapped,
      culturalProfile: cultural,
      hasContext: contextParts.length > 0
    };
  }
}

// Export singleton instance
export const avatarIdentityProcessor = new AvatarIdentityProcessor();