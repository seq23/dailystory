// ============= STRIPPED MULTISTAGE ENHANCEMENT PIPELINE =============
// Reduced from 1,479 lines to systematic service wrappers only
// All Tier 1 logic moved to orchestrator, BackendTokenManager deleted

export class MultiStageEnhancementPipeline {
  
  // ============= TIER 2: SYSTEMATIC SERVICE WRAPPERS ONLY =============
  
  static async processTier2HighQuality(storyText, userInfo, storyId, sessionId, pageNumber, totalPages, enhancedStoryData, avatarIdentity) {
    console.log('🚀 Tier 2: Starting enhancement pipeline...');
    console.log('📈 MultiStageEnhancementPipeline - Processing Tier 2: Comprehensive Scene Builder');
    console.log('🎯 Target: Build detailed primaryScene using ALL available systematic services');
    
    // ============= Tier 2: Comprehensive Scene Building =============
    console.log('🔄 Phase 1: Building comprehensive scene using all available functions...');
    
    let primarySceneComponents = [];
    let characterDescription = '';
    let secondaryElements = [];
    let visualDetails = '';
    let contextualInfo = '';
    let styleFramework = null;
    
    // ============= Step 1: Get Main Character Description =============
    console.log('👤 Step 1: Character consistency processing...');
    console.log('🔍 Step 1: Getting character consistency data...');
    
    try {
      const { CharacterConsistencyService } = await import('./CharacterConsistencyService.js');
      
      console.log('🔍 AVATAR IDENTITY DEBUG - Tier 2 Flow:', {
        hasAvatarIdentity: !!avatarIdentity,
        avatarType: avatarIdentity?.type,
        avatarSkinTone: avatarIdentity?.skinTone,
        sessionId: sessionId,
        userInfo: !!userInfo
      });
      
      const characterService = new CharacterConsistencyService();
      // FIXED: Use proper clothing detection instead of raw story text
      const detectedClothing = characterService.detectClothingFromText(storyText);
      console.log('🧥 Clothing Detection:', detectedClothing || 'No clothing detected');
      
      const characterSeed = await characterService.getCharacterSeed(
        sessionId, 
        userInfo?.id || 'anonymous', 
        userInfo, 
        storyText, 
        avatarIdentity, 
        'story', 
        detectedClothing
      );
      
      if (characterSeed && (characterSeed.characterDescription || characterSeed.description)) {
        characterDescription = characterSeed.characterDescription || characterSeed.description;
        console.log(`✅ Character description: ${characterDescription.substring(0, 100)}...`);
        primarySceneComponents.push(characterDescription);
        
        // Update SessionStateManager with character data
        const { globalSessionManager } = await import('./SessionStateManager.js');
        globalSessionManager.updateCharacterWithSeed(sessionId, userInfo?.name || 'child', characterSeed.seed, {
          characterDescription: characterDescription,
          avatarType: characterSeed.avatarIdentity?.type,
          skinTone: characterSeed.avatarIdentity?.skinTone,
          description: characterDescription
        });
      }
    } catch (characterError) {
      throw new Error(`Tier2.CharacterConsistency failed: ${characterError.message}`);
    }
    
    // ============= Step 2: Detect Secondary Characters and Animals =============
    console.log('🔍 Step 2: Secondary element detection...');
    console.log('🔍 Step 2: Detecting secondary elements...');
    
    try {
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
      throw new Error(`Tier2.SecondaryElementDetector failed: ${detectorError.message}`);
    }
    
    // ============= Step 3: Get Visual Details and Objects =============
    console.log('🎨 Step 3: Visual detail tracking...');
    console.log('🔍 Step 3: Getting visual details...');
    
    try {
      const { VisualDetailTracker } = await import('./VisualDetailTracker.js');
      
      await VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);
      visualDetails = await VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
      console.log(`🎨 Visual details: ${visualDetails}`);
      
      if (visualDetails) {
        primarySceneComponents.push(`Objects and details: ${visualDetails}`);
      }
    } catch (trackerError) {
      throw new Error(`Tier2.VisualDetailTracker failed: ${trackerError.message}`);
    }
    
    // ============= Step 4: Get Story Context and Continuity =============
    console.log('📖 Step 4: Story context collection...');
    console.log('🔍 Step 4: Getting story context...');
    
    try {
      const { RealContextCollector } = await import('./RealContextCollector.js');
      
      const contextData = await RealContextCollector.collectRealStoryContext(sessionId, pageNumber, storyText);
      const contextualAddition = RealContextCollector.buildContextualPromptAddition(contextData, storyText);
      
      if (contextualAddition) {
        contextualInfo = contextualAddition;
        primarySceneComponents.push(`Context: ${contextualAddition}`);
      }
    } catch (contextError) {
      throw new Error(`Tier2.RealContextCollector failed: ${contextError.message}`);
    }
    
    // ============= Step 5: Add Style Framework =============
    console.log('🎯 Step 5: Style framework application...');
    console.log('🔍 Step 5: Getting style framework...');
    
    try {
      const { getStyleFramework, getOptimizedParameters } = await import('./styleFrameworks.js');
      const { DifficultyLevelMapper } = await import('./DifficultyLevelMapper.js');
      
      // 🔧 FIX: Use proper difficulty mapping instead of defaulting to 'medium'
      const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      console.log(`🎯 Mapped difficulty: ${JSON.stringify(userInfo?.readingLevel || userInfo?.difficultyLevel)} → ${difficulty}`);
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
      throw new Error(`Tier2.StyleFramework failed: ${styleError.message}`);
    }
    
    // ============= Step 6: Enhanced Context Collection with Character Names =============
    try {
      console.log('🔍 Step 6: Enhancing context collection with character names...');
      
      // Extract character names from story text for better pronoun clarity
      const characterNames = this.extractCharacterNamesFromText(storyText);
      if (characterNames.length > 0) {
        const characterContext = `Character names in scene: ${characterNames.join(', ')}`;
        primarySceneComponents.push(characterContext);
        console.log('✅ Added character names for context:', characterNames);
      }
    } catch (contextError) {
      throw new Error(`Tier2.CharacterNameExtraction failed: ${contextError.message}`);
    }
    
    // ============= Step 7: Parse Action and Scene Setting =============
    const actionMatch = storyText.match(/\b(running|walking|playing|dancing|jumping|sitting|standing|lying|flying|swimming|climbing|spinning|twirling)\b/i);
    const action = actionMatch ? actionMatch[0] : 'playing';
    
    const currentSetting = this.updateSettingFromText(storyText, 'outdoor_playground');
    primarySceneComponents.push(`Setting: ${currentSetting}`);
    primarySceneComponents.push(`Action: ${action}`);
    
    // ============= Step 8: Build Final Primary Scene (OPTIMIZED ORDER) =============
    // 🔧 FIX: Reorder for Runware's left-to-right processing
    // Priority Order: Character Description → Core Action → Base Story → Setting → Secondary Elements → Style Group → Context
    
    const baseScene = storyText.trim();
    const actionComponent = primarySceneComponents.find(comp => comp.startsWith('Action:')) || '';
    const setting = primarySceneComponents.find(comp => comp.startsWith('Setting:')) || '';
    const style = primarySceneComponents.find(comp => comp.startsWith('Style:')) || '';
    const quality = primarySceneComponents.find(comp => comp.startsWith('Quality:')) || '';
    
    // Filter out components we're explicitly ordering
    const otherComponents = primarySceneComponents.filter(comp => 
      !comp.startsWith('Action:') && 
      !comp.startsWith('Setting:') && 
      !comp.startsWith('Style:') && 
      !comp.startsWith('Quality:')
    );
    
    // OPTIMIZED: Reorder components for Runware's left-to-right processing
    let primaryScene = '';
    
    // 1. Character descriptions with precise filtering
    const characterComps = otherComponents.filter(comp => {
      const lowerComp = comp.toLowerCase();
      return lowerComp.match(/\b(character|avatar|protagonist|\d+-year-old|boy|girl|child|with .* hair)\b/) && 
             !lowerComp.includes('story') && !lowerComp.includes('page');
    });
    if (characterComps.length > 0) {
      primaryScene += characterComps.join('. ') + '. ';
      console.log('👤 Character Components:', characterComps.length);
    }
    
    // 2. Key Visual Style (early for better influence)
    if (style) {
      primaryScene += style + '. ';
    }
    
    // 3. Core action
    if (action) {
      primaryScene += action + '. ';
    }
    
    // 4. Base story text (reduced emphasis)
    primaryScene += `${baseScene}. `;
    
    // 5. Setting/Environment
    if (setting) {
      primaryScene += setting + '. ';
    }
    
    // 6. Secondary elements (filtered to avoid story text)
    const secondaryComps = otherComponents.filter(comp => {
      const lowerComp = comp.toLowerCase();
      return !lowerComp.match(/\b(character|avatar|protagonist|\d+-year-old|boy|girl|child|with .* hair)\b/) &&
             !lowerComp.includes('story') && !lowerComp.includes('page') && comp.length < 100;
    });
    if (secondaryComps.length > 0) {
      primaryScene += secondaryComps.join('. ') + '. ';
    }
    
    // 7. Technical Quality (last)
    if (quality) {
      primaryScene += quality + '.';
    }
    
    // Style framework already included in Step 5, no additional hardcoded style needed
    
    console.log('✅ Comprehensive Primary Scene Built:', primaryScene.substring(0, 200) + '...');
    
    // ============= Step 9: Build Unified Negative Prompt =============
    const culturalProfile = this.buildCulturalProfile(userInfo, enhancedStoryData);
    const framework = { styleElements: styleFramework?.name || 'children book style' };
    
    const negativePrompt = this.buildUnifiedNegativePrompt(
      userInfo, 
      culturalProfile, 
      framework, 
      pageNumber
    );
    
    console.log('✅ Tier 2: Successfully completed all steps');
    console.log('✅ Tier 2 Enhancement Complete:', {
      primarySceneLength: primaryScene.length,
      componentsUsed: primarySceneComponents.length,
      negativePromptLength: negativePrompt.length
    });
    
    // ============= Step 10: Avatar Quality Validation for Tier 2.5 Fallback =============
    try {
      const { validateAvatarQuality } = await import('./avatarConsistency.js');
      const qualityCheck = validateAvatarQuality(primaryScene, avatarIdentity, userInfo);
      
      if (!qualityCheck.isQualityAcceptable) {
        console.log(`🔍 TIER 2 QUALITY CHECK: Avatar quality unacceptable (${qualityCheck.reason}) - should trigger Tier 2.5`);
        // Note: This doesn't trigger Tier 2.5 directly, just logs for orchestrator to handle
        return {
          enhancedPrompt: primaryScene,
          negativePrompt: negativePrompt,
          metadata: {
            processingTier: 'tier-2-comprehensive',
            servicesUsed: ['CharacterConsistencyService', 'SecondaryElementDetector', 'VisualDetailTracker', 'RealContextCollector', 'styleFrameworks'],
            components: primarySceneComponents.length,
            success: true,
            avatarQualityCheck: qualityCheck
          }
        };
      }
    } catch (qualityError) {
      console.log('🔍 TIER 2 QUALITY CHECK: Avatar quality validation failed, proceeding without quality check');
    }
    
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
  }
  
  // ============= TIER 1: PREMIUM PIPELINE =============
  
  static async processTier1HighQuality(storyText, userInfo, storyId, sessionId, pageNumber, totalPages, enhancedStoryData) {
    console.log(`🏆 Tier 1 Premium Pipeline: session ${sessionId} page ${pageNumber}`);
    
    try {
      // Enhanced cultural profiling
      const culturalProfile = this.buildCulturalProfile(userInfo, enhancedStoryData);
      const artFramework = await this.buildArtisticFramework(userInfo, pageNumber);
      
      // Build enhanced prompt with proper style framework integration
      let enhancedPrompt = storyText;
      
      if (culturalProfile.culturalElements) {
        enhancedPrompt += `, ${culturalProfile.culturalElements}`;
      }
      
      if (artFramework.styleElements) {
        enhancedPrompt += `, ${artFramework.styleElements}`;
      }
      
      // Add brand suffix for consistent styling across all tiers
      if (artFramework.brandSuffix) {
        enhancedPrompt += `, ${artFramework.brandSuffix}`;
      }
      
      // Use unified negative prompt
      const negativePrompt = this.buildUnifiedNegativePrompt(userInfo, culturalProfile, artFramework, pageNumber);
      
      console.log('✅ Tier 1 Enhanced Prompt with Style Framework:', enhancedPrompt.substring(0, 200) + '...');
      
      return {
        enhancedPrompt,
        negativePrompt,
        culturalProfile,
        framework: artFramework,
        metadata: {
          processingTier: 'tier-1-premium',
          culturalIntegration: true,
          artFramework: true,
          styleFrameworkUsed: artFramework.framework?.name || 'fallback'
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
  
  static async buildArtisticFramework(userInfo, pageNumber) {
    try {
      // Import style framework system (same as Tier 2)
      const { getStyleFramework } = await import('./styleFrameworks.js');
      const { DifficultyLevelMapper } = await import('./DifficultyLevelMapper.js');
      
      // Map user info to difficulty level (same logic as Tier 2)
      const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      
      // Get dynamic style framework
      const framework = getStyleFramework(difficulty);
      
      console.log(`🎨 Tier 1 using style framework for difficulty: ${difficulty}`, {
        artStyle: framework.artStyle?.substring(0, 100),
        brandSuffix: framework.brandSuffix?.substring(0, 100)
      });
      
      return {
        styleElements: framework.artStyle,
        quality: framework.quality,
        brandSuffix: framework.brandSuffix,
        colorPalette: framework.colorPalette,
        lighting: framework.lighting,
        consistency: `page ${pageNumber} visual consistency`,
        framework: framework
      };
    } catch (error) {
      console.error('❌ Error building artistic framework in Tier 1:', error);
      
      // Fallback to basic framework
      return {
        styleElements: 'high quality children book illustration, bright colors, engaging composition',
        consistency: `page ${pageNumber} visual consistency`,
        quality: 'premium artwork quality'
      };
    }
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
    
    // Daily Life Contexts
    if (textLower.includes('morning') || textLower.includes('bedtime') || textLower.includes('breakfast') || 
        textLower.includes('lunch') || textLower.includes('dinner') || textLower.includes('chores') || 
        textLower.includes('cleaning')) {
      return 'cozy home indoor scene';
    }
    
    // Healthcare Contexts
    if (textLower.includes('doctor') || textLower.includes('dentist') || textLower.includes('checkup') || 
        textLower.includes('medicine') || textLower.includes('bandage') || textLower.includes('clinic') || 
        textLower.includes('hospital')) {
      return 'bright medical office scene';
    }
    
    // Cooking/Kitchen Contexts - CRITICAL FIX for "makes yummy apples"
    if (textLower.includes('cooking') || textLower.includes('kitchen') || textLower.includes('baking') || 
        textLower.includes('yummy') || textLower.includes('apples') || textLower.includes('recipe') || 
        textLower.includes('ingredients') || textLower.includes('oven') || textLower.includes('stirring') || 
        textLower.includes('mixing') || textLower.includes('makes') && (textLower.includes('food') || textLower.includes('yummy'))) {
      return 'warm kitchen scene';
    }
    
    // Educational Contexts
    if (textLower.includes('school') || textLower.includes('classroom') || textLower.includes('reading') || 
        textLower.includes('book') || textLower.includes('learning') || textLower.includes('teacher') || 
        textLower.includes('homework')) {
      return 'bright school classroom scene';
    }
    
    // Play & Recreation Contexts
    if (textLower.includes('playground') || textLower.includes('toys') || textLower.includes('games') || 
        textLower.includes('swimming') || textLower.includes('playing') || textLower.includes('fun') || 
        textLower.includes('swings') || textLower.includes('slide')) {
      return 'colorful playground scene';
    }
    
    // Nature & Animals Contexts
    if (textLower.includes('garden') || textLower.includes('flowers') || textLower.includes('animals') || 
        textLower.includes('pets') || textLower.includes('farm') || textLower.includes('outside') || 
        textLower.includes('park') || textLower.includes('trees') || textLower.includes('nature')) {
      return 'beautiful outdoor nature scene';
    }
    
    // Community Contexts
    if (textLower.includes('shopping') || textLower.includes('store') || textLower.includes('library') || 
        textLower.includes('fire station') || textLower.includes('community') || textLower.includes('market')) {
      return 'bustling community scene';
    }
    
    // Transportation Contexts
    if (textLower.includes('car') || textLower.includes('bus') || textLower.includes('travel') || 
        textLower.includes('trip') || textLower.includes('driving') || textLower.includes('vehicle')) {
      return 'travel scene with vehicles';
    }
    
    // Special Occasions
    if (textLower.includes('birthday') || textLower.includes('party') || textLower.includes('celebration') || 
        textLower.includes('holiday') || textLower.includes('cake') || textLower.includes('present')) {
      return 'festive celebration scene';
    }
    
    // Home/Indoor fallback
    if (textLower.includes('home') || textLower.includes('house') || textLower.includes('room') || 
        textLower.includes('inside') || textLower.includes('indoors')) {
      return 'cozy home indoor scene';
    }
    
    return currentSetting || 'colorful indoor scene';
  }

  // ============= CHARACTER NAME EXTRACTION FOR CONTEXT =============
  static extractCharacterNamesFromText(text) {
    if (!text) return [];
    
    // Simple pattern matching for character names (proper nouns)
    const namePattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g;
    const matches = text.match(namePattern) || [];
    
    // Filter out common words that might be capitalized
    const commonWords = ['The', 'A', 'An', 'This', 'That', 'Then', 'When', 'Where', 'Why', 'How', 'But', 'And', 'Or', 'So'];
    const characterNames = matches
      .filter(name => !commonWords.includes(name))
      .filter(name => name.length > 2)
      .slice(0, 3); // Limit to 3 most likely names
    
    // Remove duplicates
    return [...new Set(characterNames)];
  }
}