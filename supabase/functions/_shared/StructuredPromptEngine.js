// Structured Prompt Engine - Master Factory Builder for Image Generation
// Dynamically composes sophisticated, culturally-aware image prompts

export class StructuredPromptEngine {
  static composeStructuredPrompt(storyText, userInfo, pageNumber, characterDescriptors, emotionalContext) {
    console.log(`🏗️ Composing structured prompt for page ${pageNumber}`);
    
    const template = {
      visualAppearance: this.composeVisualAppearance(userInfo, characterDescriptors),
      sceneDescription: this.composeSceneDescription(storyText, emotionalContext),
      secondaryCharacters: this.composeSecondaryCharacters(characterDescriptors),
      culturalSetting: this.composeCulturalSetting(userInfo),
      styleFramework: this.composeStyleFramework(userInfo, pageNumber),
      qualityEnhancement: this.composeQualityEnhancement()
    };
    
    return template;
  }
  
  static composeVisualAppearance(userInfo, characterDescriptors) {
    if (!userInfo || !characterDescriptors.length) {
      return "friendly character with warm expression";
    }
    
    const primaryChar = characterDescriptors.find(c => c.type === 'primary');
    if (!primaryChar) {
      return "friendly character with warm expression";
    }
    
    const { physicalTraits } = primaryChar;
    const skinTone = physicalTraits?.skinTone || userInfo.avatar?.skinTone || 'medium';
    const age = physicalTraits?.age || userInfo.avatar?.type || 'child';
    const gender = physicalTraits?.gender || (userInfo.avatar?.type?.includes('girl') ? 'female' : 'male');
    
    const skinToneMap = {
      'pale': 'fair skin',
      'light': 'light skin tone',
      'medium': 'medium skin tone',
      'olive': 'olive skin tone',
      'dark': 'dark skin tone'
    };
    
    return `${age} with ${skinToneMap[skinTone] || 'medium skin tone'}, friendly expression, bright eyes`;
  }
  
  static composeSceneDescription(storyText, emotionalContext) {
    // Extract primary action or scene
    const scenes = storyText.split(/[.!?]/).filter(s => s.trim().length > 0);
    let primaryScene = scenes[0];
    
    // Look for action scenes
    for (const scene of scenes) {
      if (/\b(run|jump|play|explore|discover|walk|climb|swing|dance)\b/i.test(scene)) {
        primaryScene = scene;
        break;
      }
    }
    
    const mood = emotionalContext?.mood || 'neutral';
    const lighting = emotionalContext?.lighting || 'soft natural lighting';
    
    return `${primaryScene.trim()}, ${lighting}, ${mood} atmosphere`;
  }
  
  static composeSecondaryCharacters(characterDescriptors) {
    const secondary = characterDescriptors.filter(c => c.type !== 'primary');
    if (!secondary.length) return '';
    
    return secondary.map(char => {
      const relationship = char.relationship || 'friend';
      return `${relationship} with warm expression`;
    }).join(', ');
  }
  
  static composeCulturalSetting(userInfo) {
    const language = userInfo?.nativeLanguage || 'en';
    
    const culturalContexts = {
      'en': 'diverse inclusive environment',
      'es': 'vibrant Latino cultural elements',
      'fr': 'elegant French-inspired setting',
      'zh': 'harmonious East Asian cultural elements',
      'hi': 'colorful South Asian cultural atmosphere',
      'ar': 'rich Middle Eastern cultural elements',
      'pt': 'warm Brazilian cultural atmosphere'
    };
    
    return culturalContexts[language] || culturalContexts['en'];
  }
  
  static composeStyleFramework(userInfo, pageNumber) {
    const difficulty = userInfo?.readingLevel || 'medium';
    
    const stylesByDifficulty = {
      'beginner': 'simple bright children\'s book illustration style',
      'easy': 'colorful storybook illustration with clear details',
      'medium': 'detailed children\'s book art with rich colors and textures',
      'hard': 'sophisticated illustration with complex composition',
      'expert': 'masterful children\'s book art with advanced visual storytelling'
    };
    
    return stylesByDifficulty[difficulty] || stylesByDifficulty['medium'];
  }
  
  static composeQualityEnhancement() {
    return 'high quality, detailed, vibrant colors, child-friendly, wholesome, safe content';
  }
  
  static templateToPrompt(template) {
    const parts = [
      template.visualAppearance,
      template.sceneDescription,
      template.secondaryCharacters,
      template.culturalSetting,
      template.styleFramework,
      template.qualityEnhancement
    ].filter(part => part && part.trim().length > 0);
    
    return parts.join(', ');
  }
  
  static selectDynamicStyle(storyText, userInfo, pageNumber, totalPages) {
    // Progressive style enhancement based on story progression
    const progressRatio = pageNumber / totalPages;
    const difficulty = userInfo?.readingLevel || 'medium';
    
    if (progressRatio < 0.3) {
      return 'introduction style, simple clear composition';
    } else if (progressRatio < 0.7) {
      return 'development style, detailed engaging scenes';
    } else {
      return 'climax style, dynamic exciting composition';
    }
  }
}