// Frontend Intelligence - Auto-generated from 2025-01-20T22:30:00.000Z
// This file contains real AI functions extracted from frontend TypeScript services
//
// ============= ES6 IMPORT STANDARDS =============
// STATIC IMPORTS: Use for modules that are always needed at file load
//   import { Module } from './module.js';
// 
// DYNAMIC IMPORTS: Use for conditional loading, error-prone modules, or performance optimization
//   const { Module } = await import('./module.js');
//
// NEVER USE: CommonJS require() statements in ES6 modules
//   const { Module } = require('./module.js'); // ❌ NEVER
// 
// ERROR HANDLING: Wrap dynamic imports in try/catch for graceful fallbacks
//   try {
//     const { Module } = await import('./module.js');
//   } catch (error) {
//     console.warn('Module unavailable, using fallback:', error.message);
//   }
// ============= END IMPORT STANDARDS =============

import { UnifiedCharacterDescriptor } from './UnifiedCharacterDescriptor.js';

export class FrontendIntelligence {
  
  // ============= PHASE 1: SAFETY FOUNDATION =============
  // Feature flags for gradual rollout
  static FEATURE_FLAGS = {
    dynamicPrompts: true,        // Enable dynamic prompt building
    enhancedCulturalProfiles: true,  // Enable standard-american profile
    improvedErrorHandling: true,     // Enable 503 error handling
    pixarStylingPrecision: true,     // Ensure exact Pixar styling
    africanAmericanEnhancements: true // Enable enhanced AA character support
  };
  
  // Error logging for monitoring
  static logPromptError(method, error, context = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      method,
      error: error.message || error,
      context,
      featureFlags: this.FEATURE_FLAGS
    };
    console.error('🚨 FI-PROMPT-ERROR:', JSON.stringify(errorData));
  }
  
  // ============= CULTURAL VISUAL PROFILES =============
  // These profiles are designed to enhance visual generation for different cultures
  static CULTURAL_VISUAL_PROFILES = {
    'en': {
      skinToneKeywords: ['brown skin', 'dark skin', 'light skin', 'olive skin', 'tan skin'],
      hairStyleKeywords: ['curly hair', 'braided hair', 'afro', 'wavy hair', 'straight hair'],
      clothingKeywords: ['traditional wear', 'modern fashion', 'casual clothes', 'formal attire'],
      settingKeywords: ['urban environment', 'rural landscape', 'historical place', 'modern city'],
      culturalElements: ['cultural symbols', 'traditional art', 'local festivals', 'ethnic patterns']
    },
    'es': {
      skinToneKeywords: ['piel morena', 'piel oscura', 'piel clara', 'piel oliva', 'piel bronceada'],
      hairStyleKeywords: ['pelo rizado', 'pelo trenzado', 'afro', 'pelo ondulado', 'pelo lacio'],
      clothingKeywords: ['ropa tradicional', 'moda moderna', 'ropa casual', 'atuendo formal'],
      settingKeywords: ['entorno urbano', 'paisaje rural', 'lugar histórico', 'ciudad moderna'],
      culturalElements: ['símbolos culturales', 'arte tradicional', 'festivales locales', 'patrones étnicos']
    },
    'fr': {
      skinToneKeywords: ['peau brune', 'peau foncée', 'peau claire', 'peau olive', 'peau bronzée'],
      hairStyleKeywords: ['cheveux bouclés', 'cheveux tressés', 'afro', 'cheveux ondulés', 'cheveux raides'],
      clothingKeywords: ['vêtements traditionnels', 'mode moderne', 'vêtements décontractés', 'tenue formelle'],
      settingKeywords: ['environnement urbain', 'paysage rural', 'lieu historique', 'ville moderne'],
      culturalElements: ['symboles culturels', 'art traditionnel', 'festivals locaux', 'motifs ethniques']
    },
    'zh': {
      skinToneKeywords: ['棕色皮肤', '深色皮肤', '浅色皮肤', '橄榄色皮肤', '棕褐色皮肤'],
      hairStyleKeywords: ['卷发', '辫子发型', '爆炸头', '波浪发', '直发'],
      clothingKeywords: ['传统服装', '现代时尚', '休闲装', '正式服装'],
      settingKeywords: ['城市环境', '乡村景观', '历史名胜', '现代城市'],
      culturalElements: ['文化符号', '传统艺术', '地方节日', '民族图案']
    },
    'ar': {
      skinToneKeywords: ['بشرة سمراء', 'بشرة داكنة', 'بشرة فاتحة', 'بشرة زيتونية', 'بشرة برونزية'],
      hairStyleKeywords: ['شعر مجعد', 'شعر مضفر', 'شعر أفرو', 'شعر متموج', 'شعر أملس'],
      clothingKeywords: ['ملابس تقليدية', 'موضة عصرية', 'ملابس غير رسمية', 'ملابس رسمية'],
      settingKeywords: ['بيئة حضرية', 'منظر ريفي', 'مكان تاريخي', 'مدينة حديثة'],
      culturalElements: ['رموز ثقافية', 'فنون تقليدية', 'مهرجانات محلية', 'أنماط عرقية']
    },
    'hi': {
      skinToneKeywords: ['भूरे रंग की त्वचा', 'गहरी त्वचा', 'हल्की त्वचा', 'जैतून की त्वचा', 'सांवली त्वचा'],
      hairStyleKeywords: ['घुंघराले बाल', 'ब्रेडेड हेयर', 'अफ्रो', 'लहराते बाल', 'सीधे बाल'],
      clothingKeywords: ['पारंपरिक वस्त्र', 'आधुनिक फैशन', 'आरामदायक कपड़े', 'औपचारिक पोशाक'],
      settingKeywords: ['शहरी वातावरण', 'ग्रामीण परिदृश्य', 'ऐतिहासिक स्थल', 'आधुनिक शहर'],
      culturalElements: ['सांस्कृतिक प्रतीक', 'पारंपरिक कला', 'स्थानीय त्योहार', 'जातीय पैटर्न']
    }
  };
  
  
  // ============= AFRICAN AMERICAN CULTURAL ARRAYS =============
  // Elaborate arrays for African American character generation
  
  static EXPANDED_AFRICAN_AMERICAN_HAIRSTYLES = {
    boys: [
      'textured buzz cut', 'detailed fade cut', 'textured taper fade', 'detailed high top fade', 
      'textured low fade', 'detailed crew cut', 'textured caesar cut', 'detailed curly top fade', 
      'textured curly high fade', 'detailed curly low fade', 'textured curly taper fade', 
      'detailed curly high top', 'textured curly mohawk', 'detailed curly faux hawk', 
      'textured curly undercut', 'detailed fade with curls on top', 'textured crop', 
      'detailed curly fringe fade', 'textured twisted top fade', 'detailed undercut design', 
      'textured hair tattoo', 'detailed geometric patterns', 'textured mini afro', 
      'detailed medium afro', 'textured tapered afro', 'detailed wash and go', 
      'textured finger coils', 'detailed two strand twists', 'textured flat twists', 
      'detailed mini twists', 'textured locs', 'detailed starter locs', 'textured freeform locs', 
      'detailed twisted locs', 'textured side part locs', 'detailed middle part locs', 
      'textured ponytail with locs', 'detailed nape area tapered'
    ],
    girls: [
      'textured medium natural hair', 'textured long natural hair', 'textured shoulder-length hair', 
      'textured chin-length hair', 'detailed twist out', 'detailed bantu knots', 'detailed rod set', 
      'detailed braid out', 'textured high puff', 'textured low puff', 'textured side puff', 
      'textured double puff', 'detailed space buns', 'detailed top knot bun', 'detailed low bun', 
      'detailed messy bun', 'detailed sleek bun', 'detailed cornrows', 'detailed box braids', 
      'detailed micro braids', 'detailed jumbo braids', 'detailed goddess braids', 
      'detailed dutch braids', 'detailed french braids', 'detailed fishtail braids', 
      'detailed halo braid', 'detailed crown braid', 'detailed side braids', 
      'detailed three strand twists', 'detailed senegalese twists', 'detailed marley twists', 
      'detailed havana twists', 'detailed passion twists', 'detailed spring twists', 
      'detailed kinky twists', 'detailed chunky twists', 'detailed protective twists', 
      'textured sisterlocs', 'textured microlocs', 'textured traditional locs', 
      'textured interlocked locs', 'detailed braided locs', 'detailed loc updo', 
      'textured half up half down locs', 'textured afro puffs', 'textured large afro', 
      'textured picked out afro', 'textured shaped afro', 'textured curly afro', 
      'textured coily afro', 'textured kinky afro', 'textured side swept bangs', 
      'textured face framing layers', 'textured layered cut', 'detailed blunt cut', 
      'detailed asymmetrical cut'
    ]
  };
  
  static EXPANDED_AFRICAN_AMERICAN_FACIAL_FEATURES = [
    'authentic african american features'
  ];
  
  static EXPANDED_AFRICAN_AMERICAN_CLOTHING = [
    'casual t-shirt and jeans', 'hoodie and sneakers', 'polo shirt and khakis', 
    'graphic tee and shorts', 'button-up shirt and pants', 'sweater and jeans', 
    'tank top and cargo shorts', 'flannel shirt and jeans', 'jersey and joggers', 
    'denim jacket and jeans', 'cardigan and slacks', 'henley shirt and chinos', 
    'baseball cap and casual wear', 'sneakers and athletic socks', 'backpack and school clothes', 
    'comfortable everyday outfit', 'playground-appropriate clothing', 'weekend casual wear', 
    'school uniform alternatives', 'athletic wear and running shoes', 'layered casual look', 
    'seasonal appropriate clothing', 'comfortable playtime outfit', 'trendy youth fashion', 
    'classic American casual style', 'modern comfortable clothing', 'age-appropriate fashion'
  ];
  
  // Removed EXPANDED_AFRICAN_AMERICAN_SETTINGS array
  
  // Removed CULTURAL_PRIDE_ELEMENTS array

  // ============= CULTURAL PRIDE KEYWORDS MAP =============
  // Keywords that warrant cultural pride elements in the story context
  static CULTURAL_PRIDE_KEYWORDS = {
    'heritage': ['cultural symbols', 'ancestral pride', 'rich heritage'],
    'tradition': ['soul food traditions', 'family recipes', 'generational wisdom'],
    'community': ['community strength', 'collective strength', 'community uplift'],
    'celebration': ['cultural celebration', 'heritage festival', 'Mardi Gras celebrations'],
    'family': ['family bonds', 'extended family gatherings', 'Sunday dinner traditions'],
    'church': ['church community', 'gospel music'],
    'history': ['historical consciousness', 'cultural resilience'],
    'pride': ['cultural pride', 'community pride', 'hometown pride'],
    'culture': ['cultural symbols', 'cultural heritage', 'Louisiana culture'],
    'music': ['musical heritage', 'jazz music traditions', 'gospel music'],
    'cooking': ['soul food', 'family recipes', 'creole cooking traditions'],
    'storytelling': ['family storytelling', 'creole storytelling'],
    'values': ['community values', 'cultural values', 'family values']
  };
  
  // ============= EMOTIONAL CONTEXT DETECTION =============
  // This method detects the emotional context of the story text
  static detectEmotionalContext(storyText) {
    // Placeholder: Implement real AI-driven emotional analysis here
    const positiveKeywords = ['happy', 'joyful', 'excited', 'cheerful', 'delighted', 'thrilled', 'optimistic', 'content', 'blissful', 'ecstatic'];
    const negativeKeywords = ['sad', 'unhappy', 'depressed', 'miserable', 'gloomy', 'sorrowful', 'heartbroken', 'pessimistic', 'melancholy', 'grief'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    for (const keyword of positiveKeywords) {
      if (storyText.toLowerCase().includes(keyword)) {
        positiveScore++;
      }
    }
    
    for (const keyword of negativeKeywords) {
      if (storyText.toLowerCase().includes(keyword)) {
        negativeScore++;
      }
    }
    
    let mood = 'neutral';
    if (positiveScore > negativeScore) {
      mood = 'positive';
    } else if (negativeScore > positiveScore) {
      mood = 'negative';
    }
    
    return {
      mood: mood,
      positiveScore: positiveScore,
      negativeScore: negativeScore
    };
  }
  
  // ============= SCENE CONTEXT DETECTION =============
  // This method detects the scene context of the story text
  static detectSceneContext(storyText) {
    // Placeholder: Implement real AI-driven scene analysis here
    const sceneKeywords = ['park', 'school', 'home', 'forest', 'beach', 'mountain', 'city', 'village'];
    let detectedScene = 'generic scene';
    
    for (const keyword of sceneKeywords) {
      if (storyText.toLowerCase().includes(keyword)) {
        detectedScene = keyword + ' scene';
        break;
      }
    }
    
    return detectedScene;
  }
  
  // ============= CULTURAL ENHANCEMENT LOGIC =============
  
  // Keyword mapping for cultural settings
  static CULTURAL_SETTING_KEYWORDS = {
    // Church/Religious settings
    'church': ['gospel church', 'community church', 'sunday service'],
    'chapel': ['family chapel', 'community chapel'],
    'temple': ['local temple', 'community temple'],
    
    // Community spaces
    'community center': ['local community center', 'neighborhood community center'],
    'community': ['community gathering space', 'neighborhood community'],
    
    // Cultural/Educational spaces  
    'museum': ['cultural heritage museum', 'african american heritage museum'],
    'library': ['community library', 'neighborhood library'],
    'cultural center': ['african american cultural center', 'community cultural center'],
    
    // Food/Social spaces
    'restaurant': ['soul food restaurant', 'family restaurant'], 
    'diner': ['local diner', 'neighborhood diner'],
    'barbershop': ['family barbershop', 'community barbershop'],
    'salon': ['beauty salon', 'neighborhood salon'],
    
    // Celebration spaces
    'festival': ['cultural festival', 'community festival'],
    'celebration': ['family celebration', 'community celebration'],
    'reunion': ['family reunion park', 'family gathering']
  };
  
  // This method enhances the visual prompt with cultural elements
  static enhanceVisualPromptWithCulture(visualPrompt, userInfo, culturalProfile, storyText = '') {
    let enhancedPrompt = visualPrompt;
    
    // CRITICAL FIX: Only apply cultural profiles based on proper language + skin tone detection
    if (userInfo.nativeLanguage && culturalProfile) {
      
      // Check if African American enhancements should be applied (English + dark skin)
      if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo.avatarIdentity, userInfo)) {
        console.log('🎯 Applying African American cultural enhancements only (no base cultural profile)');
        
        // Only apply cultural pride elements and settings - no base profile keywords
        const culturalPrideElement = this.detectCulturalPrideFromStory(storyText, userInfo.avatarIdentity, userInfo);
        if (culturalPrideElement) {
          enhancedPrompt += `, ${culturalPrideElement}`;
        }
        
        const culturalSetting = this.detectCulturalSettingFromStory(storyText, userInfo);
        if (culturalSetting) {
          enhancedPrompt += `, ${culturalSetting}`;
        }
        
      } else if (this.shouldApplyNativeLanguageCulturalProfile(userInfo)) {
        console.log('🌍 Applying native language cultural profile for non-English user');
        
        // Apply full cultural profile for non-English users
        const skinToneKeyword = this.getRandomElement(culturalProfile.skinToneKeywords);
        enhancedPrompt += `, ${skinToneKeyword}`;
        
        const hairStyleKeyword = this.getRandomElement(culturalProfile.hairStyleKeywords);
        enhancedPrompt += `, ${hairStyleKeyword}`;
        
        const clothingKeyword = this.getRandomElement(culturalProfile.clothingKeywords);
        enhancedPrompt += `, ${clothingKeyword}`;
        
        const culturalSetting = this.detectCulturalSettingFromStory(storyText, userInfo);
        if (culturalSetting) {
          enhancedPrompt += `, ${culturalSetting}`;
        }
        
        const culturalPrideElement = this.detectCulturalPrideFromStory(storyText, userInfo.avatarIdentity, userInfo);
        if (culturalPrideElement) {
          enhancedPrompt += `, ${culturalPrideElement}`;
        } else {
          const culturalElement = this.getRandomElement(culturalProfile.culturalElements);
          enhancedPrompt += `, ${culturalElement}`;
        }
        
      } else {
        console.log('⭕ English + non-dark skin user - NO cultural enhancements applied (hair mapping handled separately)');
        // English + non-dark skin users get NO cultural enhancements
        // Hair mapping is handled separately by UnifiedCharacterConsistency.js
      }
    }
    
    return enhancedPrompt;
  }
  
  // ============= AI-ENHANCED SETTING ENHANCEMENT =============
  // This method enhances the AI-determined setting with cultural context
  static enhanceAISettingWithCulture(aiEnhancedData, userInfo, culturalProfile, storyText = '') {
    let enhancedSetting = aiEnhancedData.setting?.location || 'generic location';
    
    if (userInfo.nativeLanguage && culturalProfile) {
      // Only enhance setting if story contains relevant keywords
      const culturalSetting = this.detectCulturalSettingFromStory(storyText, userInfo);
      if (culturalSetting) {
        enhancedSetting += `, ${culturalSetting}`;
      }
    }
    
    return enhancedSetting;
  }
  
  // ============= CULTURAL PRIDE DETECTION =============
  // This method detects if story contains keywords that warrant cultural pride elements
  static detectCulturalPrideFromStory(storyText, avatarIdentity, userInfo) {
    if (!storyText || typeof storyText !== 'string') {
      return null;
    }
    
    const lowerStoryText = storyText.toLowerCase();
    
    // Check each keyword category for matches
    for (const [keyword, prideElements] of Object.entries(this.CULTURAL_PRIDE_KEYWORDS)) {
      if (lowerStoryText.includes(keyword.toLowerCase())) {
        // Skip African American cultural pride elements - use general elements only
        // Return general cultural pride element
        return this.getRandomElement(prideElements);
      }
    }
    
    return null; // No keyword match found, no cultural pride element enhancement
  }

  // ============= CULTURAL SETTING DETECTION =============
  // This method detects if story contains keywords that warrant cultural setting enhancement
  static detectCulturalSettingFromStory(storyText, userInfo) {
    if (!storyText || typeof storyText !== 'string') {
      return null;
    }
    
    const lowerStoryText = storyText.toLowerCase();
    
    // Check each keyword category for matches
    for (const [keyword, culturalSettings] of Object.entries(this.CULTURAL_SETTING_KEYWORDS)) {
      if (lowerStoryText.includes(keyword)) {
        // Skip African American cultural settings - use general settings only
        // Return general cultural setting
        return this.getRandomElement(culturalSettings);
      }
    }
    
    return null; // No keyword match found, no cultural setting enhancement
  }
  
  // ============= PREMIUM PROMPT BUILDING =============
  // PHASE 1: Enhanced with feature flags and backup methods
  static buildPremiumPrompt(storyText, userInfo, characterSeed, culturalProfile, sceneContext, emotionalContext, styleFramework, details, imageDifficulty) {
    console.log('🎨 FI-PROMPT: Building premium prompt with safety features');
    
    // Feature flag check for enhanced processing
    const useEnhancedProcessing = this.FEATURE_FLAGS?.dynamicPrompts !== false;
    
    if (!useEnhancedProcessing) {
      console.log('🎨 FI-PROMPT: Feature disabled, using basic prompt');
      return this.buildBasicPromptFallback(storyText, userInfo, details);
    }
    
    try {
      return this.buildEnhancedPromptWithSafety(storyText, userInfo, characterSeed, culturalProfile, sceneContext, emotionalContext, styleFramework, details, imageDifficulty);
    } catch (error) {
      console.error('🚨 FI-PROMPT: Error in buildPremiumPrompt, using fallback:', error);
      this.logPromptError('buildPremiumPrompt', error, { storyText, userInfo, imageDifficulty });
      return this.buildBasicPromptFallback(storyText, userInfo, details);
    }
  }
  
  // PHASE 2: Emergency method - throws error for clean routing to Tier 2.5
  static buildBasicPromptFallback(storyText, userInfo, details, avatarIdentity) {
    console.log('🎨 FI-PROMPT: buildBasicPromptFallback called - routing to Tier 2.5');
    
    // ARCHITECTURAL CHANGE: Tier 2 should only do AI enhancement or fail cleanly to Tier 2.5
    throw new Error('Tier 2 basic prompt fallback triggered. Routing to Tier 2.5 for template-based generation.');
  }
  
  // PHASE 3: Dynamic prompt building method (replaces template)
  static buildEnhancedPromptWithSafety(storyText, userInfo, characterSeed, culturalProfile, sceneContext, emotionalContext, styleFramework, details, imageDifficulty) {
    console.log('🎨 FI-PROMPT: Building dynamic enhanced prompt (Phase 3)');
    
    try {
      // 1. Character Description with avatar identity support
      const avatarIdentity = details?.avatarIdentity || null;
      const characterDescription = this.buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed, imageDifficulty, avatarIdentity);
      
      // 2. Setting Enhancement with cultural integration
      let settingDescription = details.existingSetting || sceneContext || this.detectSceneContext(storyText) || 'vibrant classroom setting';
      
      // PHASE 3: Enhanced setting with cultural elements
      const culturalSetting = this.detectCulturalSettingFromStory(storyText, userInfo);
      if (culturalSetting) {
        settingDescription = `${settingDescription}, ${culturalSetting}`;
      }
      
      // 3. Scene Description with emotion integration
      const baseScene = storyText;
      const emotionalMood = emotionalContext?.mood || this.detectEmotionalContext(storyText)?.mood || 'neutral';
      const sceneDescription = `${baseScene}. The atmosphere is ${emotionalMood} and engaging`;
      
      // 4. PHASE 3: Enhanced Visual Details with dynamic elements
      let visualDetails = details.visualDetails || '';
      if (!visualDetails) {
        // Dynamic visual details based on story content and difficulty
        const visualElements = [
          'rich details and vibrant colors',
          'expressive character emotions',
          'detailed background elements',
          'soft lighting and warm atmosphere'
        ];
        
        if (imageDifficulty >= 2) {
          visualElements.push('intricate environmental details', 'nuanced character expressions');
        }
        
        visualDetails = visualElements.join(', ');
      }
      
      // 5. PHASE 3: Precise style handling
      let styleDescription = styleFramework?.prompt || 'children\'s book illustration';
      if (this.FEATURE_FLAGS?.pixarStylingPrecision && imageDifficulty <= 1) {
        styleDescription = "3D rendered, Pixar-like animation style";
      }
      
      // 6. Art Inspiration enhancement
      const artInspiration = styleFramework?.brandSuffix || 'high-quality children\'s book illustration';
      
      // PHASE 3: Build dynamic prompt (no template dependency)
      const promptComponents = [
        `A captivating children's book illustration featuring ${characterDescription}`,
        `in ${settingDescription}`,
        `${sceneDescription}`,
        `The scene includes ${visualDetails}`,
        `Art style: ${styleDescription}`,
        `Quality: ${artInspiration}`
      ];
      
      let enhancedPrompt = promptComponents.join('. ') + '.';
      
      // 7. Cultural enhancement with story context
      enhancedPrompt = this.enhanceVisualPromptWithCulture(enhancedPrompt, userInfo, culturalProfile, storyText);
      
      // PHASE 4: Enhanced African American character treatment
      if (this.FEATURE_FLAGS?.africanAmericanEnhancements && 
          this.shouldApplyAfricanAmericanCulturalVariations(avatarIdentity, userInfo)) {
        const culturalPrideElement = this.detectCulturalPrideFromStory(storyText, avatarIdentity, userInfo);
        if (culturalPrideElement) {
          enhancedPrompt += `. ${culturalPrideElement}`;
        }
      }
      
      console.log(`🎨 FI-PROMPT: Dynamic prompt built (${enhancedPrompt.length} chars)`);
      return enhancedPrompt;
      
    } catch (error) {
      console.error('🚨 FI-PROMPT: Error in enhanced prompt building:', error);
      this.logPromptError('buildEnhancedPromptWithSafety', error, { storyText, imageDifficulty });
      
      // ARCHITECTURAL CHANGE: Tier 2 should only do AI enhancement or fail cleanly to Tier 2.5
      throw new Error(`Tier 2 AI enhancement failed: ${error.message}. Routing to Tier 2.5 fallback.`);
    }
  }
  
  
  // ============= CHARACTER DESCRIPTION BUILDING =============
  // This method builds a character description based on user info and character seed
  static buildCharacterDescription(userInfo, characterSeed, avatarIdentity) {
    // Placeholder: Implement real AI-driven character description here
    const name = userInfo?.name || 'Alex';
    const gender = avatarIdentity?.type || userInfo?.avatar?.type === 'girl' ? 'girl' : 'boy';
    const skinTone = userInfo?.avatar?.skinTone || 'medium';
    
    return `${name} (${gender}, ${skinTone} skin)`;
  }
  
  // ============= UTILITY METHODS =============
  // This method returns a random element from an array
  static getRandomElement(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // ============= AFRICAN AMERICAN DETECTION METHODS =============
  
  // PHASE 4: Enhanced African American character treatment verification
  static shouldApplyAfricanAmericanCulturalVariations(avatarIdentity, userInfo = null) {
    // Enhanced detection - specifically English + dark skin combination
    const nativeLanguage = userInfo?.nativeLanguage?.toLowerCase() || 'en';
    
    // Must be English-speaking for African American enhancements
    if (nativeLanguage !== 'en') {
      return false;
    }
    
    // PHASE 4: Enhanced detection with multiple keywords and fallback sources
    const keywords = [
      'black', 'african american', 'african-american', 'black american', 
      'black girl', 'black boy', 'african', 'afro'
    ];
    
    console.log('🎯 FI-PROMPT: Checking African American cultural variations', {
      avatarIdentity: avatarIdentity ? 'present' : 'missing',
      userInfo: userInfo ? 'present' : 'missing',
      language: nativeLanguage
    });
    
    // Primary: Check avatarIdentity.visualDescription (from AI enhancement)
    const visualDesc = avatarIdentity?.visualDescription?.toLowerCase() || '';
    if (keywords.some(keyword => visualDesc.includes(keyword))) {
      console.log('✅ FI-PROMPT: African American detected via visualDescription');
      return true;
    }
    
    // Secondary: Check avatarIdentity.culturalProfile
    const culturalProfile = avatarIdentity?.culturalProfile?.toLowerCase() || '';
    if (culturalProfile.includes('african-american') || culturalProfile.includes('african american')) {
      console.log('✅ FI-PROMPT: African American detected via culturalProfile');
      return true;
    }
    
    // Fallback: Check userInfo.avatar if avatarIdentity doesn't have clear indicators
    if (userInfo?.avatar || avatarIdentity) {
      const skinTone = (avatarIdentity?.skinTone || userInfo?.avatar?.skinTone)?.toLowerCase() || '';
      const type = (avatarIdentity?.type || userInfo?.avatar?.type)?.toLowerCase() || '';
      
      // Check for dark skin tone combined with specific descriptors (with fallback pattern)
      if (skinTone === 'dark' && (type === 'girl' || type === 'boy')) {
        console.log('✅ FI-PROMPT: African American detected via English language + dark skin tone + gender');
        return true;
      }
    }
    
    console.log('⭕ FI-PROMPT: African American cultural variations not detected');
    return false;
  }

  // NEW METHOD: Determine if native language cultural profile should be applied
  static shouldApplyNativeLanguageCulturalProfile(userInfo) {
    const nativeLanguage = userInfo?.nativeLanguage?.toLowerCase() || 'en';
    
    // Only apply native language profiles for non-English languages
    if (nativeLanguage === 'en') {
      console.log('⭕ English language - no native cultural profile applied');
      return false;
    }
    
    console.log(`✅ Non-English language (${nativeLanguage}) - native cultural profile will be applied`);
    return true;
  }
  
  static generateExpandedAfricanAmericanFeatures() {
    return this.EXPANDED_AFRICAN_AMERICAN_FACIAL_FEATURES;
  }
  
  static getUniversalHairMapping(avatarIdentity, gender = 'boy', userInfo = null) {
    if (this.shouldApplyAfricanAmericanCulturalVariations(avatarIdentity, userInfo)) {
      const genderKey = gender === 'girl' ? 'girls' : 'boys';
      return this.EXPANDED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey] || [];
    }
    // Fallback for non-African American characters
    const profile = this.CULTURAL_VISUAL_PROFILES.en || {};
    return profile.hairStyleKeywords || ['natural hair styling'];
  }
  
  static shouldApplyConsistentProcessing(userInfo) {
    return userInfo.nativeLanguage === 'en'; // All English speakers get same processing
  }

  static buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed, difficulty = null, avatarIdentity = null) {
    // Enhanced logic with African American cultural support
    console.log('Building advanced character description with African American cultural detection');
    
    const name = userInfo?.name || 'Alex';
    const gender = (avatarIdentity?.type || userInfo?.avatar?.type) === 'girl' ? 'girl' : 'boy';
    console.log(`🎭 DEBUG: Using avatar type: ${avatarIdentity?.type || userInfo?.avatar?.type}, Gender: ${gender}`);
    const skinTone = userInfo?.avatar?.skinTone || 'medium';
    
    // Get age category from Tier 1 system (replaces hardcoded numeric ranges)
    const ageCategory = UnifiedCharacterDescriptor.getAgeFromDifficulty(difficulty);
    console.log(`🎯 Using age category from Tier 1: ${ageCategory} (difficulty: ${difficulty})`);
    
    // Enhanced skin tone mapping with cultural considerations
    const skinMap = {
      light: 'light skin',
      medium: 'medium skin',
      olive: 'olive skin', 
      dark: 'dark skin',
      pale: 'pale skin'
    };
    
    // Check for African American cultural variations
    let culturalElements = '';
    let facialFeatures = '';
    let hairStyling = '';
    
    if (this.shouldApplyAfricanAmericanCulturalVariations(avatarIdentity, userInfo)) {
      console.log('🎯 Applying African American cultural enhancements');
      
      // Use elaborate facial features
      const features = this.generateExpandedAfricanAmericanFeatures();
      if (features.length > 0) {
        facialFeatures = `, ${this.getRandomElement(features)}`;
      }
      
      // Use elaborate hairstyles
      const hairstyles = this.getUniversalHairMapping(avatarIdentity, gender, userInfo);
      if (hairstyles.length > 0) {
        hairStyling = `, ${this.getRandomElement(hairstyles)}`;
      }
      
      // Use elaborate clothing
      const clothing = this.getRandomElement(this.EXPANDED_AFRICAN_AMERICAN_CLOTHING);
      if (clothing) {
        culturalElements = `, wearing ${clothing}`;
      }
    } else {
      // Default cultural elements for non-African American characters
      if (this.shouldApplyConsistentProcessing(userInfo)) {
        culturalElements = ', with natural styling';
      }
    }
    
    return `${name} (${ageCategory} ${gender}, with ${skinMap[skinTone] || 'medium skin'}${facialFeatures}${hairStyling}${culturalElements})`;
  }

}
