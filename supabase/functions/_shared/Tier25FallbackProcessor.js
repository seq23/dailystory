// Tier 2.5 Fallback Processor - Ultra-fast fallback for failed tiers
// Provides minimal but functional prompts when all main tiers fail

import { Tier25FallbackConstants } from './Tier25FallbackConstants.js';

export class Tier25FallbackProcessor {
  
  // ============= TIER 2.5 MAIN PROCESSING =============
  static async processTier25Fallback(storyText, userInfo, storyId, sessionId, pageNumber, totalPages, avatarIdentity) {
    try {
      console.log(`🚨 TIER 2.5 FALLBACK: Ultra-fast processing for page ${pageNumber}/${totalPages}`);
      console.log('⚡ Tier 2.5: Processing with minimal dependencies and maximum safety');
      
      // Use only constants and safe processing - no external dependencies
      const startTime = performance.now();
      
      // 1. Generate basic character description from avatar or defaults
      const characterDescription = this.generateFallbackCharacterDescription(userInfo, avatarIdentity);
      
      // 2. Extract basic scene from story text
      const sceneDescription = this.extractBasicScene(storyText);
      
      // 3. Generate cultural context safely
      const culturalContext = this.generateBasicCulturalContext(userInfo, avatarIdentity);
      
      // 4. Build minimal but complete prompt
      const enhancedPrompt = this.buildFallbackPrompt(
        storyText,
        characterDescription,
        sceneDescription,
        culturalContext,
        userInfo
      );
      
      // 5. Generate basic negative prompt
      const negativePrompt = Tier25FallbackConstants.BASIC_NEGATIVE_PROMPT;
      
      // 6. Generate basic generation parameters
      const generationParams = {
        steps: 20,
        cfg_scale: 7.0,
        width: 1024,
        height: 1024,
        sampler: 'DPM++ 2M',
        scheduler: 'karras'
      };
      
      const processingTime = performance.now() - startTime;
      
      console.log(`⚡ TIER 2.5 COMPLETE: Ultra-fast processing in ${processingTime.toFixed(2)}ms`);
      
      return {
        enhancedPrompt,
        negativePrompt,
        generationParams,
        metadata: {
          tier: 'tier-2.5-fallback',
          processingTime: processingTime,
          characterDescription,
          sceneDescription,
          culturalContext: culturalContext.length > 0 ? 'applied' : 'none',
          fallbackReason: 'tier-1-and-2-failed',
          isMinimal: true,
          safetyLevel: 'maximum'
        }
      };
      
    } catch (error) {
      console.error('❌ TIER 2.5 FALLBACK FAILED:', error.message);
      
      // Ultimate fallback - cannot fail
      return this.generateUltimateFallback(storyText, userInfo);
    }
  }
  
  // ============= FALLBACK CHARACTER DESCRIPTION =============
  static generateFallbackCharacterDescription(userInfo, avatarIdentity) {
    try {
      // Priority: avatarIdentity > userInfo.avatar > defaults
      if (avatarIdentity?.visualDescription) {
        return avatarIdentity.visualDescription;
      }
      
      if (avatarIdentity?.type) {
        const type = avatarIdentity.type;
        const skinTone = avatarIdentity.skinTone || 'medium';
        return `young ${type} with ${skinTone} skin tone`;
      }
      
      if (userInfo?.avatar?.type) {
        const type = userInfo.avatar.type;
        const skinTone = userInfo.avatar.skinTone || 'medium';
        return `young ${type} with ${skinTone} skin tone`;
      }
      
      // Ultimate fallback
      const gender = userInfo?.gender || 'child';
      return `young ${gender} with friendly appearance`;
      
    } catch (error) {
      console.warn('⚠️ Tier 2.5: Character description fallback failed, using ultimate default');
      return 'young child with friendly appearance';
    }
  }
  
  // ============= BASIC SCENE EXTRACTION =============
  static extractBasicScene(storyText) {
    try {
      const text = storyText.toLowerCase();
      
      // Simple keyword detection for scene
      const sceneKeywords = {
        'park': 'outdoor park setting',
        'school': 'school environment',
        'home': 'home interior',
        'kitchen': 'kitchen interior',
        'bedroom': 'bedroom interior',
        'garden': 'garden setting',
        'playground': 'playground environment',
        'forest': 'forest setting',
        'beach': 'beach environment',
        'library': 'library interior',
        'classroom': 'classroom setting'
      };
      
      for (const [keyword, scene] of Object.entries(sceneKeywords)) {
        if (text.includes(keyword)) {
          return scene;
        }
      }
      
      // Default scene
      return 'indoor scene';
      
    } catch (error) {
      console.warn('⚠️ Tier 2.5: Scene extraction failed, using default');
      return 'indoor scene';
    }
  }
  
  // ============= BASIC CULTURAL CONTEXT =============
  static generateBasicCulturalContext(userInfo, avatarIdentity) {
    try {
      const contextElements = [];
      
      // Check for African American characteristics
      const isDarkSkinned = avatarIdentity?.skinTone === 'dark' || avatarIdentity?.skinTone === 'deep brown';
      const isChild = avatarIdentity?.type === 'boy' || avatarIdentity?.type === 'girl';
      
      if (isDarkSkinned && isChild) {
        contextElements.push('authentic african american features');
      }
      
      // Add language-based context if not English
      if (userInfo?.nativeLanguage && userInfo.nativeLanguage !== 'en') {
        contextElements.push('multicultural background');
      }
      
      return contextElements;
      
    } catch (error) {
      console.warn('⚠️ Tier 2.5: Cultural context failed, using empty array');
      return [];
    }
  }
  
  // ============= FALLBACK PROMPT BUILDING =============
  static buildFallbackPrompt(storyText, characterDescription, sceneDescription, culturalContext, userInfo) {
    try {
      const promptParts = [];
      
      // Base style
      promptParts.push('pixar 3d style');
      
      // Character
      promptParts.push(characterDescription);
      
      // Cultural context if available
      if (culturalContext.length > 0) {
        promptParts.push(culturalContext.join(', '));
      }
      
      // Scene
      promptParts.push(`in ${sceneDescription}`);
      
      // Basic story reference
      const storyFragment = storyText.substring(0, 100).toLowerCase();
      if (storyFragment.includes('happy') || storyFragment.includes('joy')) {
        promptParts.push('happy expression');
      } else if (storyFragment.includes('sad') || storyFragment.includes('cry')) {
        promptParts.push('concerned expression');
      } else {
        promptParts.push('friendly expression');
      }
      
      // Quality modifiers
      promptParts.push('high quality, detailed, child-friendly');
      
      return promptParts.join(', ');
      
    } catch (error) {
      console.warn('⚠️ Tier 2.5: Prompt building failed, using ultra-basic prompt');
      return 'pixar 3d style, young child with friendly expression, high quality, child-friendly';
    }
  }
  
  // ============= ULTIMATE FALLBACK =============
  static generateUltimateFallback(storyText, userInfo) {
    console.log('🚨 ULTIMATE FALLBACK: Tier 2.5 failed, using hardcoded minimal prompt');
    
    return {
      enhancedPrompt: 'pixar 3d style, young child with friendly expression, high quality, child-friendly',
      negativePrompt: 'nsfw, violence, dark themes, inappropriate content',
      generationParams: {
        steps: 20,
        cfg_scale: 7.0,
        width: 1024,
        height: 1024,
        sampler: 'DPM++ 2M',
        scheduler: 'karras'
      },
      metadata: {
        tier: 'ultimate-fallback',
        processingTime: 0,
        fallbackReason: 'tier-2.5-failed',
        isUltimate: true,
        safetyLevel: 'maximum'
      }
    };
  }
  
  // ============= QUICK VALIDATION =============
  static validateFallbackResult(result) {
    return result && 
           result.enhancedPrompt && 
           result.negativePrompt && 
           result.generationParams &&
           result.metadata;
  }
}

// Export singleton instance
export const tier25FallbackProcessor = new Tier25FallbackProcessor();