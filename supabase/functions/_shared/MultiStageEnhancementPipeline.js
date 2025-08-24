// ============= STRIPPED MULTISTAGE ENHANCEMENT PIPELINE =============
// Reduced from 1,479 lines to systematic service wrappers only
// All Tier 1 logic moved to orchestrator, BackendTokenManager deleted

export class MultiStageEnhancementPipeline {
  
  // ============= TIER 2: SYSTEMATIC SERVICE WRAPPERS ONLY =============
  
  static async processTier2HighQuality(storyText, userInfo, storyId, sessionId, pageNumber, totalPages, enhancedStoryData, avatarIdentity) {
    console.log('📈 MultiStageEnhancementPipeline - Processing Tier 2: Comprehensive Scene Builder');
    console.log('🎯 Target: Build detailed primaryScene using ALL available systematic services');
    
    try {
      // ============= Tier 2: Comprehensive Scene Building =============
      console.log('🔄 Phase 1: Building comprehensive scene using all available functions...');
      
      let primarySceneComponents = [];
      let characterDescription = '';
      let secondaryElements = [];
      let visualDetails = '';
      let contextualInfo = '';
      let styleFramework = null;
      
      // ============= Step 1: Get Main Character Description =============
      try {
        console.log('🔍 Step 1: Getting character consistency data...');
        const { CharacterConsistencyService } = await import('./CharacterConsistencyService.js');
        
        const characterSeed = await CharacterConsistencyService.getCharacterSeed(
          sessionId, 
          userInfo?.id || 'anonymous', 
          userInfo, 
          storyText, 
          avatarIdentity, 
          'story', 
          storyText
        );
        
        if (characterSeed && characterSeed.description) {
          characterDescription = characterSeed.description;
          console.log(`✅ Character description: ${characterDescription.substring(0, 100)}...`);
          primarySceneComponents.push(characterDescription);
        }
        
      } catch (characterError) {
        console.log('⚠️ Character consistency fallback:', characterError.message);
        // Use avatar identity as fallback
        if (avatarIdentity?.visualDescription) {
          characterDescription = avatarIdentity.visualDescription;
          primarySceneComponents.push(characterDescription);
        }
      }
      
      // ============= Step 2: Detect Secondary Characters and Animals =============
      try {
        console.log('🔍 Step 2: Detecting secondary elements...');
        const { SecondaryElementDetector } = await import('./SecondaryElementDetector.js');
        
        secondaryElements = await SecondaryElementDetector.parseElements(sessionId, storyText, storyText, pageNumber);
        console.log(`📊 Found ${secondaryElements.length} secondary elements:`, secondaryElements.map(e => e.name));
        
        if (secondaryElements.length > 0) {
          const elementDescriptions = secondaryElements
            .filter(e => e.needsConsistency)
            .map(e => {
              if (e.category === 'character_animal') {
                return `${e.name} ${e.species}`;
              }
              return e.name;
            })
            .join(', ');
          
          if (elementDescriptions) {
            primarySceneComponents.push(`Secondary characters: ${elementDescriptions}`);
          }
        }
        
      } catch (detectorError) {
        console.log('⚠️ SecondaryElementDetector fallback:', detectorError.message);
      }
      
      // ============= Step 3: Get Visual Details and Objects =============
      try {
        console.log('🔍 Step 3: Getting visual details...');
        const { VisualDetailTracker } = await import('./VisualDetailTracker.js');
        
        await VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);
        visualDetails = await VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
        console.log(`🎨 Visual details: ${visualDetails}`);
        
        if (visualDetails) {
          primarySceneComponents.push(`Objects and details: ${visualDetails}`);
        }
        
      } catch (trackerError) {
        console.log('⚠️ VisualDetailTracker fallback:', trackerError.message);
      }
      
      // ============= Step 4: Get Story Context and Continuity =============
      try {
        console.log('🔍 Step 4: Getting story context...');
        const { RealContextCollector } = await import('./RealContextCollector.js');
        
        const contextData = await RealContextCollector.collectRealStoryContext(sessionId, pageNumber, storyText);
        const contextualAddition = RealContextCollector.buildContextualPromptAddition(contextData, storyText);
        
        if (contextualAddition) {
          contextualInfo = contextualAddition;
          primarySceneComponents.push(`Context: ${contextualAddition}`);
        }
        
      } catch (contextError) {
        console.log('⚠️ RealContextCollector fallback:', contextError.message);
      }
      
      // ============= Step 5: Add Style Framework =============
      try {
        console.log('🔍 Step 5: Getting style framework...');
        const { getStyleFramework, getOptimizedParameters } = await import('./styleFrameworks.js');
        
        // Determine difficulty based on user info or default to medium
        const difficulty = userInfo?.preferredDifficulty || 'medium';
        styleFramework = getStyleFramework(difficulty);
        
        if (styleFramework) {
          console.log(`🎨 Style framework: ${styleFramework.name}`);
          primarySceneComponents.push(`Style: ${styleFramework.artStyle}`);
          primarySceneComponents.push(`Quality: ${styleFramework.quality}`);
          if (styleFramework.brandSuffix) {
            primarySceneComponents.push(styleFramework.brandSuffix);
          }
        }
        
      } catch (styleError) {
        console.log('⚠️ Style framework fallback:', styleError.message);
      }
      
      // ============= Step 6: Parse Action and Scene Setting =============
      const actionMatch = storyText.match(/\b(running|walking|playing|dancing|jumping|sitting|standing|lying|flying|swimming|climbing|spinning|twirling)\b/i);
      const action = actionMatch ? actionMatch[0] : 'playing';
      
      const currentSetting = this.updateSettingFromText(storyText, 'outdoor_playground');
      primarySceneComponents.push(`Setting: ${currentSetting}`);
      primarySceneComponents.push(`Action: ${action}`);
      
      // ============= Step 7: Build Final Primary Scene =============
      const baseScene = storyText.trim();
      
      // Create comprehensive primary scene
      let primaryScene = `${baseScene}. `;
      
      if (primarySceneComponents.length > 0) {
        primaryScene += primarySceneComponents.join('. ') + '.';
      }
      
      // Style framework already included in Step 5, no additional hardcoded style needed
      
      console.log('✅ Comprehensive Primary Scene Built:', primaryScene.substring(0, 200) + '...');
      
      // ============= Step 8: Build Unified Negative Prompt =============
      const culturalProfile = this.buildCulturalProfile(userInfo, enhancedStoryData);
      const framework = { styleElements: styleFramework?.name || 'children book style' };
      
      const negativePrompt = this.buildUnifiedNegativePrompt(
        userInfo, 
        culturalProfile, 
        framework, 
        pageNumber
      );
      
      console.log('✅ Tier 2 Enhancement Complete:', {
        primarySceneLength: primaryScene.length,
        componentsUsed: primarySceneComponents.length,
        negativePromptLength: negativePrompt.length
      });
      
      return {
        enhancedPrompt: primaryScene,
        negativePrompt: negativePrompt,
        metadata: {
          processingTier: 'tier-2-comprehensive',
          servicesUsed: ['CharacterConsistencyService', 'SecondaryElementDetector', 'VisualDetailTracker', 'RealContextCollector', 'styleFrameworks'],
          components: primarySceneComponents.length,
          success: true
        }
      };
      
    } catch (error) {
      console.error('🚨 Tier 2 Enhancement Pipeline Error:', error);
      
      // ============= NUCLEAR FALLBACK: Basic Scene Construction =============
      console.log('🛡️ Engaging nuclear fallback for Tier 2...');
      
      const cleanText = storyText ? storyText.trim() : 'A magical scene unfolds';
      // Apply basic style framework for fallback
      const { getStyleFramework } = await import('./styleFrameworks.js');
      const fallbackStyle = getStyleFramework('easy'); // Use easy difficulty for fallback
      const fallbackScene = `${cleanText}. ${fallbackStyle?.artStyle || 'Children book illustration style'}.`;
      
      const culturalProfile = this.buildCulturalProfile(userInfo, enhancedStoryData);
      const fallbackNegative = this.buildUnifiedNegativePrompt(userInfo, culturalProfile, {}, pageNumber);
      
      return {
        enhancedPrompt: fallbackScene,
        negativePrompt: fallbackNegative,
        metadata: {
          processingTier: 'tier-2-fallback',
          error: error.message,
          success: false
        }
      };
    }
  }
  
  // ============= TIER 1: PREMIUM PIPELINE =============
  
  static async processTier1HighQuality(storyText, userInfo, storyId, sessionId, pageNumber, totalPages, enhancedStoryData) {
    console.log(`🏆 Tier 1 Premium Pipeline: session ${sessionId} page ${pageNumber}`);
    
    try {
      // Enhanced cultural profiling
      const culturalProfile = this.buildCulturalProfile(userInfo, enhancedStoryData);
      const artFramework = this.buildArtisticFramework(userInfo, pageNumber);
      
      // Build enhanced prompt
      let enhancedPrompt = storyText;
      
      if (culturalProfile.culturalElements) {
        enhancedPrompt += `, ${culturalProfile.culturalElements}`;
      }
      
      if (artFramework.styleElements) {
        enhancedPrompt += `, ${artFramework.styleElements}`;
      }
      
      // Use unified negative prompt
      const negativePrompt = this.buildUnifiedNegativePrompt(userInfo, culturalProfile, artFramework, pageNumber);
      
      return {
        enhancedPrompt,
        negativePrompt,
        culturalProfile,
        framework: artFramework,
        metadata: {
          processingTier: 'tier-1-premium',
          culturalIntegration: true,
          artFramework: true
        }
      };
      
    } catch (error) {
      console.error('❌ Tier 1 premium error:', error);
      const fallbackCultural = this.buildCulturalProfile(userInfo, enhancedStoryData);
      return {
        enhancedPrompt: storyText,
        negativePrompt: this.buildUnifiedNegativePrompt(userInfo, fallbackCultural, {}, pageNumber),
        culturalProfile: {},
        framework: {},
        metadata: { processingTier: 'tier-1-fallback', error: error.message }
      };
    }
  }
  
  static buildCulturalProfile(userInfo, enhancedStoryData) {
    const profile = {
      culturalElements: '',
      artStyle: 'vibrant children book illustration'
    };
    
    if (userInfo?.avatar?.skinTone) {
      const skinTones = {
        pale: 'light skin tone',
        light: 'fair skin tone', 
        medium: 'medium skin tone',
        olive: 'olive skin tone',
        dark: 'dark skin tone'
      };
      profile.culturalElements += skinTones[userInfo.avatar.skinTone] || 'diverse representation';
    }
    
    if (enhancedStoryData?.culturalContext) {
      profile.culturalElements += `, ${enhancedStoryData.culturalContext}`;
    }
    
    return profile;
  }
  
  static buildArtisticFramework(userInfo, pageNumber) {
    return {
      styleElements: 'high quality children book illustration, bright colors, engaging composition',
      consistency: `page ${pageNumber} visual consistency`,
      quality: 'premium artwork quality'
    };
  }
  
  static buildUnifiedNegativePrompt(userInfo, culturalProfile, framework, pageNumber) {
    const baseNegative = [
      'blurry', 'low quality', 'distorted', 'scary', 'inappropriate',
      'violent', 'dark themes', 'adult content', 'poor composition'
    ];
    
    // Add cultural sensitivity filters
    if (culturalProfile?.culturalElements) {
      baseNegative.push('cultural insensitivity', 'stereotypes');
    }
    
    // Add consistency filters
    if (pageNumber > 1) {
      baseNegative.push('inconsistent character design', 'style variations');
    }
    
    return baseNegative.join(', ');
  }

  // ============= UTILITY FUNCTIONS =============
  
  static selectWeightedElement(elements, weights = null) {
    if (!elements || elements.length === 0) return '';
    if (!weights) return elements[Math.floor(Math.random() * elements.length)];
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (let i = 0; i < elements.length; i++) {
      randomNum -= weights[i];
      if (randomNum <= 0) return elements[i];
    }
    
    return elements[0];
  }
  
  static updateSettingFromText(text, currentSetting) {
    if (!text) return currentSetting || 'indoor scene';
    
    const textLower = text.toLowerCase();
    
    if (textLower.includes('outside') || textLower.includes('park') || textLower.includes('playground')) {
      return 'outdoor playground scene';
    } else if (textLower.includes('home') || textLower.includes('house') || textLower.includes('room')) {
      return 'cozy home indoor scene';
    } else if (textLower.includes('school') || textLower.includes('classroom')) {
      return 'bright school classroom scene';
    }
    
    return currentSetting || 'colorful indoor scene';
  }
}