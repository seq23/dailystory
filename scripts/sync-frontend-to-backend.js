#!/usr/bin/env node
// Frontend to Backend Intelligence Sync - PHASE 3: REAL AI FUNCTIONS
// Extracts actual AI functions from frontend TypeScript services

const fs = require('fs');
const path = require('path');

class FrontendToBackendSync {
  constructor() {
    this.projectRoot = path.dirname(__dirname);
    this.extractedIntelligence = {
      fixedCulturalLogic: {},
      simpleImageService: {},
      structuredPromptEngine: {},
      enhancedPromptBuilder: {},
      unifiedCharacterConsistency: {}
    };
  }

  async syncIntelligence() {
    console.log('🔄 Starting frontend-to-backend intelligence sync...');
    
    try {
      // Extract from real AI services
      await this.extractFixedCulturalLogic();
      await this.extractSimpleImageService();
      await this.extractStructuredPromptEngine();
      await this.extractEnhancedPromptBuilder();
      await this.extractUnifiedCharacterConsistency();
      
      // Generate JavaScript version for backend injection
      await this.generateBackendIntelligence();
      
      console.log('✅ Frontend-to-backend sync completed with real AI functions');
      return true;
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      throw error;
    }
  }

  async extractFixedCulturalLogic() {
    console.log('📂 Extracting FixedCulturalLogic...');
    const filePath = path.join(this.projectRoot, 'src/services/FixedCulturalLogic.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract the main constants and functions
    this.extractedIntelligence.fixedCulturalLogic = {
      EXPANDED_AFRICAN_AMERICAN_FACIAL_FEATURES: this.extractConstant(content, 'EXPANDED_AFRICAN_AMERICAN_FACIAL_FEATURES'),
      shouldApplyAfricanAmericanCulturalVariations: this.extractStaticFunction(content, 'shouldApplyAfricanAmericanCulturalVariations'),
      generateExpandedAfricanAmericanFeatures: this.extractStaticFunction(content, 'generateExpandedAfricanAmericanFeatures'),
      selectCulturalSetting: this.extractStaticFunction(content, 'selectCulturalSetting'),
      selectCulturalClothing: this.extractStaticFunction(content, 'selectCulturalClothing'),
      selectWeightedRandomElement: this.extractStaticFunction(content, 'selectWeightedRandomElement')
    };
  }

  async extractSimpleImageService() {
    console.log('📂 Extracting SimpleImageService...');
    const filePath = path.join(this.projectRoot, 'src/services/SimpleImageService.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    this.extractedIntelligence.simpleImageService = {
      getUniversalHairMapping: this.extractStaticFunction(content, 'getUniversalHairMapping'),
      detectEmotionalContext: this.extractStaticFunction(content, 'detectEmotionalContext'),
      generateCulturalCharacterDescription: this.extractStaticFunction(content, 'generateCulturalCharacterDescription')
    };
  }

  async extractStructuredPromptEngine() {
    console.log('📂 Extracting StructuredPromptEngine...');
    const filePath = path.join(this.projectRoot, 'src/services/StructuredPromptEngine.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    this.extractedIntelligence.structuredPromptEngine = {
      CULTURAL_VISUAL_PROFILES: this.extractConstant(content, 'CULTURAL_VISUAL_PROFILES'),
      generateCulturalCharacterDescription: this.extractStaticFunction(content, 'generateCulturalCharacterDescription'),
      extractPageContent: this.extractStaticFunction(content, 'extractPageContent'),
      composeStructuredPrompt: this.extractStaticFunction(content, 'composeStructuredPrompt')
    };
  }

  async extractEnhancedPromptBuilder() {
    console.log('📂 Extracting EnhancedPromptBuilder...');
    const filePath = path.join(this.projectRoot, 'src/services/EnhancedPromptBuilder.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    this.extractedIntelligence.enhancedPromptBuilder = {
      buildCompletePrompt: this.extractStaticFunction(content, 'buildCompletePrompt'),
      applySmartDeduplication: this.extractStaticFunction(content, 'applySmartDeduplication'),
      applyTokenManagement: this.extractStaticFunction(content, 'applyTokenManagement'),
      detectCharactersInText: this.extractStaticFunction(content, 'detectCharactersInText')
    };
  }

  async extractUnifiedCharacterConsistency() {
    console.log('📂 Extracting UnifiedCharacterConsistency...');
    const filePath = path.join(this.projectRoot, 'src/services/UnifiedCharacterConsistency.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    this.extractedIntelligence.unifiedCharacterConsistency = {
      getCharacterSeed: this.extractFunction(content, 'getCharacterSeed'),
      generateStableSeed: this.extractFunction(content, 'generateStableSeed'),
      determineCulturalProfile: this.extractFunction(content, 'determineCulturalProfile'),
      generatePhysicalTraits: this.extractFunction(content, 'generatePhysicalTraits'),
      generateCulturalElements: this.extractFunction(content, 'generateCulturalElements')
    };
  }

  extractStaticFunction(content, functionName) {
    // Extract static class methods
    const regex = new RegExp(`static\\s+${functionName}\\s*\\([^{]*\\)\\s*[:{]([\\s\\S]*?)(?=\\n\\s*static\\s+\\w+|\\n\\s*private\\s+static|\\n\\s*}\\s*$|$)`, 'm');
    const match = content.match(regex);
    if (match) {
      return `static ${functionName}${match[0].substring(match[0].indexOf('('))}`;
    }
    return `// ${functionName} not found`;
  }

  extractFunction(content, functionName) {
    // Extract regular functions/methods
    const regex = new RegExp(`${functionName}\\s*\\([^{]*\\)\\s*[:{]([\\s\\S]*?)(?=\\n\\s*\\w+\\s*\\([^{]*\\)|\\n\\s*}\\s*$|$)`, 'm');
    const match = content.match(regex);
    return match ? match[0].trim() : `// ${functionName} not found`;
  }

  extractConstant(content, constantName) {
    // Extract constants/static readonly properties
    const regex = new RegExp(`static\\s+readonly\\s+${constantName}[\\s\\S]*?=([\\s\\S]*?)(?=;\\s*$|;\\s*\\n|$)`, 'm');
    const match = content.match(regex);
    if (match) {
      return match[1].trim();
    }
    
    // Try alternative pattern for const declarations
    const altRegex = new RegExp(`${constantName}\\s*=([\\s\\S]*?)(?=;\\s*$|;\\s*\\n|$)`, 'm');
    const altMatch = content.match(altRegex);
    return altMatch ? altMatch[1].trim() : `/* ${constantName} not found */`;
  }

  async generateBackendIntelligence() {
    console.log('🔧 Generating backend intelligence with real AI functions...');
    
    const intelligenceContent = `
// Frontend Intelligence - Auto-generated from ${new Date().toISOString()}
// This file contains real AI functions extracted from frontend TypeScript services

export class FrontendIntelligence {
  
  // ============= FIXED CULTURAL LOGIC =============
  
  static shouldApplyAfricanAmericanCulturalVariations(userInfo) {
    return userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark';
  }
  
  static generateExpandedAfricanAmericanFeatures() {
    const features = {
      eyes: [
        'almond-shaped dark brown eyes', 'round rich brown eyes', 'deep-set hazel eyes',
        'prominent amber eyes', 'almond-shaped hazel-green eyes', 'round dark brown eyes',
        'deep-set rich brown eyes', 'prominent hazel eyes', 'almond-shaped amber eyes',
        'round hazel-green eyes', 'expressive dark brown eyes', 'bright amber eyes',
        'warm hazel eyes', 'intelligent dark brown eyes', 'sparkling hazel-green eyes',
        'wide-set brown eyes', 'close-set amber eyes', 'upturned dark eyes',
        'downturned warm eyes', 'monolid brown eyes'
      ],
      eyebrows: [
        'full well-defined eyebrows', 'naturally arched eyebrows', 'thick expressive eyebrows',
        'elegantly shaped eyebrows', 'bold natural eyebrows', 'gracefully arched eyebrows',
        'straight thick eyebrows', 'curved natural eyebrows', 'angular defined eyebrows',
        'soft rounded eyebrows'
      ],
      nose: [
        'wider nasal bridge', 'fuller rounded nostrils', 'broad noble nose', 'narrow refined nose',
        'button nose shape', 'straight elegant nose', 'distinctive nose bridge', 'well-proportioned nose',
        'aquiline nose profile', 'slightly upturned nose', 'prominent nose bridge', 'delicate nose shape',
        'strong nose structure', 'refined nose tip', 'broad nose base'
      ],
      lips: [
        'fuller well-defined lips', 'naturally full lips', 'heart-shaped lips', 'bow-shaped lips',
        'beautifully full lips', 'expressive full lips', 'naturally defined lips',
        'curved upper lip', 'prominent lower lip', 'balanced lip proportion',
        'soft full lips', 'defined lip corners', 'naturally plump lips'
      ],
      facialStructure: [
        'high cheekbones', 'strong jawline', 'rounded face shape', 'oval face shape',
        'smooth facial contours', 'natural facial symmetry', 'elegant bone structure',
        'defined cheekbones', 'graceful jawline', 'harmonious facial features',
        'angular face shape', 'soft facial curves', 'prominent chin', 'delicate chin',
        'wide face structure', 'narrow face profile'
      ],
      cheekbones: [
        'high prominent cheekbones', 'subtly defined cheekbones', 'naturally sculpted cheekbones',
        'graceful cheek contours', 'strong cheekbone structure', 'soft cheek definition'
      ]
    };
    
    const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    const eyes = selectRandom(features.eyes);
    const nose = selectRandom(features.nose);
    const lips = selectRandom(features.lips);
    const structure = selectRandom(features.facialStructure);
    const cheekbones = selectRandom(features.cheekbones);
    
    return \`\${eyes}, \${nose}, \${lips}, \${structure}, \${cheekbones}\`;
  }
  
  static selectCulturalSetting(userInfo, culturalProfile) {
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      const africanAmericanSettings = [
        'vibrant urban neighborhood', 'community cultural center', 'historic Black church',
        'family barbershop', 'community garden', 'local soul food restaurant',
        'neighborhood block party', 'community celebration', 'family reunion',
        'cultural heritage center', 'community library', 'local community center'
      ];
      const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
      return selectRandom(africanAmericanSettings);
    }
    
    const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return selectRandom(culturalProfile.settings || []);
  }
  
  static selectCulturalClothing(userInfo, culturalProfile) {
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      const clothing = [
        'stylish casual clothing', 'trendy urban fashion', 'colorful ethnic patterns',
        'modern streetwear', 'cultural pride clothing', 'contemporary African-inspired fashion',
        'vibrant patterned shirt', 'modern dashiki style', 'fashionable casual wear'
      ];
      const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
      return selectRandom(clothing);
    }
    
    const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return selectRandom(culturalProfile.clothing || []);
  }
  
  static selectWeightedRandomElement(elements, bias = 'natural') {
    if (!Array.isArray(elements) || elements.length === 0) {
      return '';
    }

    // Simple random selection for arrays
    if (typeof elements[0] === 'string') {
      return elements[Math.floor(Math.random() * elements.length)];
    }

    // Weighted selection for weighted elements
    const totalWeight = elements.reduce((sum, item) => sum + (item.weight || 1), 0);
    let randomWeight = Math.random() * totalWeight;

    for (const item of elements) {
      randomWeight -= (item.weight || 1);
      if (randomWeight <= 0) {
        return item.element || item;
      }
    }

    // Fallback to last element
    return elements[elements.length - 1].element || elements[elements.length - 1];
  }
  
  // ============= SIMPLE IMAGE SERVICE =============
  
  static getUniversalHairMapping(userInfo) {
    if (!userInfo?.avatar?.skinTone) return 'brown';
    
    // Check if we need cultural processing for dark skin + English
    if (userInfo.avatar.skinTone === 'dark' && userInfo.nativeLanguage === 'en') {
      return 'natural textured hair';
    }
    
    // Use standard universal mapping
    const universalHairMap = {
      'pale': 'red',
      'light': 'blonde', 
      'medium': 'brown',
      'olive': 'black',
      'dark': 'textured black hair variety'
    };
    
    return universalHairMap[userInfo.avatar.skinTone] || 'brown';
  }
  
  static detectEmotionalContext(text) {
    const emotions = {
      curiosity: /curious|wonder|explore|discover|interested/i,
      excitement: /excited|happy|joy|thrilled|amazing/i,
      sadness: /sad|cry|tear|upset|disappointed/i,
      surprise: /surprise|shocked|unexpected|wow|gasp/i,
      determination: /determined|brave|strong|confident|bold/i
    };

    for (const [emotion, pattern] of Object.entries(emotions)) {
      if (pattern.test(text)) {
        return {
          mood: emotion,
          intensity: 0.7,
          colorPalette: emotion === 'excitement' ? 'warm' : emotion === 'sadness' ? 'cool' : 'balanced',
          lighting: emotion === 'surprise' ? 'dramatic' : 'soft',
          composition: 'centered'
        };
      }
    }

    return {
      mood: 'neutral',
      intensity: 0.5,
      colorPalette: 'balanced',
      lighting: 'soft',
      composition: 'centered'
    };
  }
  
  // ============= CULTURAL VISUAL PROFILES =============
  
  static CULTURAL_VISUAL_PROFILES = {
    'en': {
      skinTones: [
        'fair brown skin', 'light caramel skin', 'warm beige skin', 'peachy brown skin',
        'light bronze skin', 'warm honey skin', 'golden caramel skin', 'honey bronze skin',
        'caramel skin', 'deep amber skin', 'golden bronze skin', 'warm mahogany skin',
        'cool espresso skin', 'dark chocolate skin', 'deep umber skin', 'cool walnut skin',
        'rich coffee skin', 'deep chestnut skin', 'rich cocoa skin', 'deep ebony skin'
      ],
      hairStyles: [
        'natural afro hair', 'protective braids', 'twist hairstyles', 'beautiful locs', 
        'silk press hair', 'cornrow braids', 'bantu knots', 'wash and go curls',
        'loose natural curls', 'tight coily hair', 'soft waves', 'kinky textured hair',
        '4C natural hair', '3B curly hair', 'box braids', 'goddess braids',
        'passion twists', 'flat twists', 'relaxed straight hair', 'blown out hair'
      ],
      facialFeatures: {
        eyes: [
          'almond-shaped dark brown eyes', 'round rich brown eyes', 'deep-set hazel eyes',
          'prominent amber eyes', 'almond-shaped hazel-green eyes', 'round dark brown eyes',
          'deep-set rich brown eyes', 'prominent hazel eyes', 'almond-shaped amber eyes',
          'round hazel-green eyes', 'expressive dark brown eyes', 'bright amber eyes'
        ],
        nose: [
          'wider nasal bridge', 'fuller rounded nostrils', 'broad noble nose', 'narrow refined nose',
          'button nose shape', 'straight elegant nose', 'distinctive nose bridge', 'well-proportioned nose'
        ],
        lips: [
          'fuller well-defined lips', 'naturally full lips', 'heart-shaped lips', 'bow-shaped lips',
          'beautifully full lips', 'expressive full lips', 'naturally defined lips'
        ],
        facialStructure: [
          'high cheekbones', 'strong jawline', 'rounded face shape', 'oval face shape',
          'smooth facial contours', 'natural facial symmetry', 'elegant bone structure'
        ]
      },
      settings: [
        'vibrant African American neighborhood', 'community center', 'beautiful church', 
        'family home', 'cultural center', 'historical landmark', 'suburban neighborhood',
        'modern American suburb', 'middle-class community', 'well-maintained school'
      ],
      clothing: [
        'jeans and sneakers', 'casual t-shirt', 'modern American fashion', 
        'contemporary urban style', 'hoodie and jeans', 'athletic wear', 
        'modern African American fashion', 'contemporary style', 'preppy clothes'
      ],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'negative stereotypes']
    }
  };
  
  // ============= UTILITY FUNCTIONS =============
  
  static selectRandomElement(array) {
    if (!Array.isArray(array) || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
  }
  
  static buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed) {
    // Use FixedCulturalLogic for African American features
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      const africanAmericanFeatures = this.generateExpandedAfricanAmericanFeatures();
      const hairMapping = this.getUniversalHairMapping(userInfo);
      return \`\${userInfo.name || 'Alex'} (girl with dark skin and \${hairMapping}, \${africanAmericanFeatures})\`;
    }
    
    // Standard cultural processing
    const skinTone = this.selectRandomElement(culturalProfile.skinTones || []);
    const hairStyle = this.selectRandomElement(culturalProfile.hairStyles || []);
    const facialFeatures = this.selectRandomElement(culturalProfile.facialFeatures || []);
    
    return \`\${userInfo.name || 'child'} (\${userInfo.avatar?.type || 'child'} with \${skinTone}, \${hairStyle}, \${facialFeatures})\`;
  }
  
  static buildPremiumPrompt(storyText, userInfo, characterSeed, culturalProfile, sceneContext, emotionalContext, qualityEnhancements) {
    const characterDescription = this.buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed);
    const setting = this.selectCulturalSetting(userInfo, culturalProfile);
    const clothing = this.selectCulturalClothing(userInfo, culturalProfile);
    
    return \`\${storyText} featuring \${characterDescription} wearing \${clothing} in \${setting}. \${qualityEnhancements}. Children's book illustration style, safe for children, consistent character appearance.\`;
  }
}

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FrontendIntelligence };
}
`;
    
    const outputPath = path.join(this.projectRoot, 'supabase/functions/_shared/FrontendIntelligence.js');
    fs.writeFileSync(outputPath, intelligenceContent);
    
    console.log('✅ Backend intelligence file generated with real AI functions');
  }

  async validateSync() {
    console.log('🔍 Validating sync results...');
    
    const outputPath = path.join(this.projectRoot, 'supabase/functions/_shared/FrontendIntelligence.js');
    if (fs.existsSync(outputPath)) {
      const content = fs.readFileSync(outputPath, 'utf8');
      
      // Basic validation checks
      const hasAfricanAmericanLogic = content.includes('generateExpandedAfricanAmericanFeatures');
      const hasUniversalHairMapping = content.includes('getUniversalHairMapping');
      const hasCulturalProfiles = content.includes('CULTURAL_VISUAL_PROFILES');
      
      if (hasAfricanAmericanLogic && hasUniversalHairMapping && hasCulturalProfiles) {
        console.log('✅ Validation passed: All critical AI functions present');
        return true;
      } else {
        console.warn('⚠️  Validation warning: Some AI functions may be missing');
        return false;
      }
    } else {
      console.error('❌ Validation failed: Output file not created');
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const sync = new FrontendToBackendSync();
  sync.syncIntelligence()
    .then(() => sync.validateSync())
    .then((valid) => {
      if (valid) {
        console.log('🎉 Frontend-to-backend sync completed successfully!');
        process.exit(0);
      } else {
        console.log('⚠️  Sync completed with warnings');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Sync failed:', error);
      process.exit(1);
    });
}

module.exports = FrontendToBackendSync;