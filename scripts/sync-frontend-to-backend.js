#!/usr/bin/env node
// Build-Time Frontend to Backend Intelligence Sync
// Extracts frontend cultural intelligence and converts to backend-compatible JavaScript

const fs = require('fs');
const path = require('path');

class FrontendToBackendSync {
  constructor() {
    this.extractedIntelligence = {
      culturalProfiles: {},
      emotionalMappings: {},
      qualityPatterns: [],
      characterGeneration: {},
      settingGeneration: {},
      skinToneDistribution: {},
      imageGeneration: {}
    };
  }

  async syncIntelligence() {
    console.log('🔄 Starting frontend-to-backend intelligence sync...');
    
    try {
      // Extract cultural intelligence from MulticulturalVisualService
      await this.extractCulturalIntelligence();
      
      // Extract emotional context from StructuredPromptEngine
      await this.extractEmotionalIntelligence();
      
      // Extract quality optimization from AdvancedQualityEngine
      await this.extractQualityIntelligence();
      
      // Generate JavaScript version for backend injection
      await this.generateBackendIntelligence();
      
      console.log('✅ Frontend-to-backend sync completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      throw error;
    }
  }

  async extractCulturalIntelligence() {
    const multiculturalPath = path.join(__dirname, '../src/services/MulticulturalVisualService.ts');
    const content = fs.readFileSync(multiculturalPath, 'utf8');
    
    // Also extract from SimpleImageService for consistent tiered generation
    const simpleImagePath = path.join(__dirname, '../src/services/SimpleImageService.ts');
    const simpleImageContent = fs.readFileSync(simpleImagePath, 'utf8');
    
    // Extract cultural profiles with regex parsing
    const profileMatch = content.match(/CULTURAL_VISUAL_PROFILES:\s*Record<[^>]+>\s*=\s*{([\s\S]*?)};/);
    if (profileMatch) {
      const profilesStr = profileMatch[1];
      
      // Parse each language profile
      const languageMatches = profilesStr.matchAll(/'([^']+)':\s*{([\s\S]*?)(?=},?\s*'|\s*})/g);
      
      for (const [, language, profileContent] of languageMatches) {
        // Extract facial features with support for comprehensive system
        let facialFeatures = this.parseStringArray(profileContent, 'facialFeatures');
        
        // Check for comprehensive facial features system (English)
        const facialFeaturesObject = this.parseFacialFeaturesObject(profileContent);
        if (facialFeaturesObject) {
          facialFeatures = facialFeaturesObject;
        }
        
        this.extractedIntelligence.culturalProfiles[language] = {
          skinTones: this.parseStringArray(profileContent, 'skinTones'),
          hairStyles: this.parseStringArray(profileContent, 'hairStyles'),
          facialFeatures: facialFeatures,
          culturalElements: this.parseStringArray(profileContent, 'culturalElements'),
          familyStructure: this.parseStringArray(profileContent, 'familyStructure'),
          settings: this.parseStringArray(profileContent, 'settings'),
          clothing: this.parseStringArray(profileContent, 'clothing'),
          celebrations: this.parseStringArray(profileContent, 'celebrations'),
          negativePrompts: this.parseStringArray(profileContent, 'negativePrompts')
        };
      }
    }
    
    // Extract African American weighted randomization logic
    const africanAmericanMatch = content.match(/generateMixedAfricanAmericanDescription[\s\S]*?return `[^`]*`;/);
    if (africanAmericanMatch) {
      this.extractedIntelligence.characterGeneration.africanAmericanLogic = africanAmericanMatch[0];
    }
    
    // Extract SimpleImageService tiered generation logic
    this.extractSimpleImageServiceLogic(simpleImageContent);
    
    console.log('📋 Extracted cultural profiles for languages:', Object.keys(this.extractedIntelligence.culturalProfiles));
  }

  extractSimpleImageServiceLogic(content) {
    // Extract DEFAULT_CONFIG
    const configMatch = content.match(/DEFAULT_CONFIG:\s*ImageGenerationConfig\s*=\s*{([\s\S]*?)};/);
    if (configMatch) {
      const configStr = configMatch[1];
      this.extractedIntelligence.imageGeneration = {
        defaultProvider: this.parseStringValue(configStr, 'provider'),
        defaultDimensions: {
          width: this.parseNumberValue(configStr, 'width') || 1024,
          height: this.parseNumberValue(configStr, 'height') || 1024
        },
        defaultStyle: this.parseStringValue(configStr, 'style'),
        defaultDifficulty: this.parseStringValue(configStr, 'difficultyLevel')
      };
    }

    // Extract hair color mapping
    const hairColorMatch = content.match(/hairColorMap\s*=\s*{([\s\S]*?)};/);
    if (hairColorMatch) {
      const hairMapStr = hairColorMatch[1];
      const hairMapping = {};
      const hairMatches = hairMapStr.matchAll(/'([^']+)':\s*'([^']+)',?/g);
      for (const [, key, value] of hairMatches) {
        hairMapping[key] = value;
      }
      this.extractedIntelligence.imageGeneration.hairColorMapping = hairMapping;
    }

    // Extract emotional context patterns
    const emotionMatch = content.match(/emotions\s*=\s*{([\s\S]*?)};/);
    if (emotionMatch) {
      const emotionsStr = emotionMatch[1];
      const emotionPatterns = {};
      const patternMatches = emotionsStr.matchAll(/(\w+):\s*\/([^\/]*)\//gi);
      for (const [, emotion, pattern] of patternMatches) {
        emotionPatterns[emotion] = pattern;
      }
      this.extractedIntelligence.imageGeneration.emotionalPatterns = emotionPatterns;
    }

    // Extract concurrency and rate limits
    const concurrencyMatch = content.match(/CONCURRENCY_LIMIT\s*=\s*(\d+)/);
    const rateLimitMatch = content.match(/RATE_LIMIT_PER_SEC\s*=\s*(\d+)/);
    const costCeilingMatch = content.match(/DAILY_COST_CEILING_USD\s*=\s*(\d+)/);
    const estimatedCostMatch = content.match(/ESTIMATED_COST_PER_IMAGE_USD\s*=\s*([\d.]+)/);

    if (concurrencyMatch || rateLimitMatch || costCeilingMatch || estimatedCostMatch) {
      this.extractedIntelligence.imageGeneration.limits = {
        concurrency: concurrencyMatch ? parseInt(concurrencyMatch[1]) : 4,
        rateLimit: rateLimitMatch ? parseInt(rateLimitMatch[1]) : 2,
        dailyCostCeiling: costCeilingMatch ? parseInt(costCeilingMatch[1]) : 50,
        estimatedCost: estimatedCostMatch ? parseFloat(estimatedCostMatch[1]) : 0.002
      };
    }

    // Extract tier generation methods for backend use
    const tierMethods = content.match(/generateWith\w+.*?Promise<ImageResult>/g);
    if (tierMethods) {
      this.extractedIntelligence.imageGeneration.tierMethods = tierMethods.map(method => method.split('(')[0]);
      this.extractedIntelligence.imageGeneration.tierCount = tierMethods.length;
    }
    
    // Extract prompt generation logic
    const promptLogic = content.match(/generateSimplePrompt.*?return[^}]*}/s);
    if (promptLogic) {
      this.extractedIntelligence.imageGeneration.promptGeneration = promptLogic[0];
    }
  }

  parseFacialFeaturesObject(content) {
    // Parse comprehensive facial features object for English
    const facialMatch = content.match(/facialFeatures:\s*{([\s\S]*?)},?\s*culturalElements/);
    if (facialMatch) {
      const facialContent = facialMatch[1];
      const facialObj = {};
      
      // Extract each facial feature category
      const categories = ['eyes', 'eyebrows', 'eyelashes', 'nose', 'lips', 'facialStructure'];
      categories.forEach(category => {
        const categoryArray = this.parseStringArray(facialContent, category);
        if (categoryArray.length > 0) {
          facialObj[category] = categoryArray;
        }
      });
      
      return Object.keys(facialObj).length > 0 ? facialObj : null;
    }
    return null;
  }

  async extractEmotionalIntelligence() {
    const structuredPath = path.join(__dirname, '../src/services/StructuredPromptEngine.ts');
    const content = fs.readFileSync(structuredPath, 'utf8');
    
    // Extract emotional mappings
    const emotionalMatch = content.match(/EMOTIONAL_MAPPINGS:\s*Record<[^>]+>\s*=\s*{([\s\S]*?)};/);
    if (emotionalMatch) {
      const mappingsStr = emotionalMatch[1];
      
      // Parse emotional contexts
      const contextMatches = mappingsStr.matchAll(/'([^']+)':\s*{([\s\S]*?)(?=},?\s*'|\s*})/g);
      
      for (const [, emotion, contextContent] of contextMatches) {
        this.extractedIntelligence.emotionalMappings[emotion] = {
          mood: this.parseStringValue(contextContent, 'mood'),
          intensity: this.parseStringValue(contextContent, 'intensity'),
          colorPalette: this.parseStringArray(contextContent, 'colorPalette'),
          lightingStyle: this.parseStringValue(contextContent, 'lightingStyle'),
          compositionStyle: this.parseStringValue(contextContent, 'compositionStyle')
        };
      }
    }
    
    // Extract style frameworks
    const styleMatch = content.match(/STYLE_FRAMEWORKS:\s*Record<[^>]+>\s*=\s*{([\s\S]*?)};/);
    if (styleMatch) {
      const stylesStr = styleMatch[1];
      
      const styleMatches = stylesStr.matchAll(/'([^']+)':\s*'([^']*)',?/g);
      this.extractedIntelligence.emotionalMappings.styleFrameworks = {};
      
      for (const [, difficulty, style] of styleMatches) {
        this.extractedIntelligence.emotionalMappings.styleFrameworks[difficulty] = style;
      }
    }
    
    console.log('🎭 Extracted emotional mappings:', Object.keys(this.extractedIntelligence.emotionalMappings));
  }

  async extractQualityIntelligence() {
    const qualityPath = path.join(__dirname, '../src/services/AdvancedQualityEngine.ts');
    const content = fs.readFileSync(qualityPath, 'utf8');
    
    // Extract quality enhancement patterns
    const patternsMatch = content.match(/QUALITY_ENHANCEMENT_PATTERNS\s*=\s*\[([\s\S]*?)\];/);
    if (patternsMatch) {
      const patternsStr = patternsMatch[1];
      
      // Parse pattern objects
      const patternMatches = patternsStr.matchAll(/{[\s\S]*?name:\s*"([^"]*)"[\s\S]*?pattern:\s*([^,]*),[\s\S]*?enhancement:\s*\([^)]*\)\s*=>\s*{[\s\S]*?return\s*`([^`]*)`[\s\S]*?}[\s\S]*?}/g);
      
      for (const [, name, pattern, enhancement] of patternMatches) {
        this.extractedIntelligence.qualityPatterns.push({
          name,
          pattern: pattern.trim(),
          enhancement: enhancement.trim()
        });
      }
    }
    
    // Extract optimal parameters
    const paramsMatch = content.match(/CHILDREN_BOOK_OPTIMAL_PARAMS\s*=\s*{([\s\S]*?)};/);
    if (paramsMatch) {
      const paramsStr = paramsMatch[1];
      this.extractedIntelligence.qualityPatterns.optimalParams = {
        cfgScale: this.parseNumberValue(paramsStr, 'cfgScale'),
        steps: this.parseNumberValue(paramsStr, 'steps'),
        model: this.parseStringValue(paramsStr, 'model'),
        scheduler: this.parseStringValue(paramsStr, 'scheduler'),
        outputFormat: this.parseStringValue(paramsStr, 'outputFormat')
      };
    }
    
    console.log('🎯 Extracted quality patterns:', this.extractedIntelligence.qualityPatterns.length);
  }

  parseStringArray(content, key) {
    const match = content.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`));
    if (!match) return [];
    
    const arrayStr = match[1];
    const items = arrayStr.match(/'([^']*?)'/g);
    return items ? items.map(item => item.slice(1, -1)) : [];
  }

  parseStringValue(content, key) {
    const match = content.match(new RegExp(`${key}:\\s*'([^']*)'`));
    return match ? match[1] : '';
  }

  parseNumberValue(content, key) {
    const match = content.match(new RegExp(`${key}:\\s*(\\d+(?:\\.\\d+)?)`));
    return match ? parseFloat(match[1]) : 0;
  }

  async generateBackendIntelligence() {
    const intelligenceJs = `// Auto-generated Frontend Intelligence for Backend
// Generated: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Regenerated on each build

export const FrontendIntelligence = ${JSON.stringify(this.extractedIntelligence, null, 2)};

// Comprehensive Facial Features Generation
export function generateFacialFeaturesDescription(facialFeatures) {
  // Handle comprehensive facial features system for English speakers
  if (typeof facialFeatures === 'object' && facialFeatures.eyes) {
    const eyes = selectWeightedElement(facialFeatures.eyes);
    const eyebrows = selectWeightedElement(facialFeatures.eyebrows);
    const eyelashes = selectWeightedElement(facialFeatures.eyelashes);
    const nose = selectWeightedElement(facialFeatures.nose);
    const lips = selectWeightedElement(facialFeatures.lips);
    const structure = selectWeightedElement(facialFeatures.facialStructure);
    
    return \`\${eyes} with \${eyebrows}, \${eyelashes}, \${nose}, \${lips}, \${structure}\`;
  }
  
  // Handle simple array format for other languages
  if (Array.isArray(facialFeatures)) {
    return selectWeightedElement(facialFeatures);
  }
  
  return 'warm friendly features';
}

// African American Weighted Selection
export function selectAfricanAmericanSkinTone() {
  const skinTones = FrontendIntelligence.culturalProfiles.en?.skinTones || [];
  if (skinTones.length === 0) return 'warm caramel skin';
  
  // Weighted selection favoring diversity across the spectrum
  const weights = skinTones.map((_, index) => {
    const position = index / (skinTones.length - 1);
    // Higher weight for middle and darker tones
    return position > 0.3 ? 1.5 : 1.0;
  });
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const random = Math.random() * totalWeight;
  
  let cumulativeWeight = 0;
  for (let i = 0; i < skinTones.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return skinTones[i];
    }
  }
  
  return skinTones[Math.floor(Math.random() * skinTones.length)];
}

// Enhanced Cultural Character Generation
export function generateCulturalCharacterDescription(userInfo) {
  const language = userInfo?.nativeLanguage || 'en';
  const profile = FrontendIntelligence.culturalProfiles[language] || FrontendIntelligence.culturalProfiles.en;
  
  if (!profile) return 'child with warm friendly appearance';
  
  // Special handling for English speakers with dark skin
  if (language === 'en' && userInfo.avatar?.skinTone === 'dark') {
    return generateMixedAfricanAmericanDescription(userInfo, profile);
  }
  
  const skinTone = selectWeightedElement(profile.skinTones);
  const hairStyle = selectWeightedElement(profile.hairStyles);
  const facialFeatures = generateFacialFeaturesDescription(profile.facialFeatures);
  const culturalElement = selectWeightedElement(profile.culturalElements);
  
  const genderTerm = userInfo.avatar?.type === 'boy' ? 'boy' : 
                    userInfo.avatar?.type === 'girl' ? 'girl' : 'child';
  
  return \`\${genderTerm} with \${skinTone}, \${hairStyle}, \${facialFeatures}, \${culturalElement}\`;
}

function generateMixedAfricanAmericanDescription(userInfo, profile) {
  const genderTerm = userInfo.avatar?.type === 'boy' ? 'boy' : 
                    userInfo.avatar?.type === 'girl' ? 'girl' : 'child';
  
  const skinTone = selectAfricanAmericanSkinTone();
  
  // African American hair styles
  const africanAmericanHairStyles = [
    'natural afro hair', 'protective braids', 'twist hairstyles', 'beautiful locs', 
    'silk press hair', 'cornrow braids', 'bantu knots', 'wash and go curls',
    'loose natural curls', 'tight coily hair', 'kinky textured hair',
    '4C natural hair', '3B curly hair', 'box braids', 'goddess braids',
    'passion twists', 'flat twists', 'relaxed straight hair', 'blown out hair',
    'tapered natural cut', 'fade with curls on top', 'twist out', 'braid out'
  ];
  
  const hairStyle = selectWeightedElement(africanAmericanHairStyles);
  
  // Use comprehensive facial features system
  const profile = FrontendIntelligence.culturalProfiles.en;
  const facialFeatures = generateFacialFeaturesDescription(profile.facialFeatures);
  
  // 50/50 mix of cultural elements
  const culturalElement = Math.random() < 0.5
    ? selectWeightedElement(['cultural pride symbols', 'community strength', 'modern urban style'])
    : selectWeightedElement(['mainstream American culture', 'suburban lifestyle', 'educational achievement']);
  
  return \`\${genderTerm} with \${skinTone}, \${hairStyle}, \${facialFeatures}, \${culturalElement}\`;
}

function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

// Enhanced Scene Analysis
export function analyzeEmotionalContent(storyText) {
  const text = storyText.toLowerCase();
  const mappings = FrontendIntelligence.emotionalMappings;
  
  // Happy/celebration patterns
  if (text.includes('laugh') || text.includes('smile') || text.includes('joy') || 
      text.includes('celebrate') || text.includes('party') || text.includes('happy')) {
    return mappings['happy celebration'] || getDefaultEmotionalContext();
  }
  
  // Adventure/exciting patterns
  if (text.includes('adventure') || text.includes('explore') || text.includes('discover') ||
      text.includes('journey') || text.includes('exciting') || text.includes('climb')) {
    return mappings['adventure scene'] || getDefaultEmotionalContext();
  }
  
  // Cozy/family patterns
  if (text.includes('family') || text.includes('home') || text.includes('cozy') ||
      text.includes('together') || text.includes('warm') || text.includes('hug')) {
    return mappings['cozy family time'] || getDefaultEmotionalContext();
  }
  
  // Default to peaceful
  return mappings['peaceful moment'] || getDefaultEmotionalContext();
}

function getDefaultEmotionalContext() {
  return {
    mood: 'calm',
    intensity: 'medium',
    colorPalette: ['soft pastels', 'gentle colors', 'warm tones'],
    lightingStyle: 'soft natural lighting',
    compositionStyle: 'balanced composition'
  };
}
`;

    // Write the generated intelligence file
    const outputPath = path.join(__dirname, '../supabase/functions/_shared/FrontendIntelligence.js');
    fs.writeFileSync(outputPath, intelligenceJs);
    
    console.log('📝 Generated backend intelligence file:', outputPath);
  }

  async validateSync() {
    const outputPath = path.join(__dirname, '../supabase/functions/_shared/FrontendIntelligence.js');
    
    if (!fs.existsSync(outputPath)) {
      throw new Error('Sync failed: Backend intelligence file not generated');
    }
    
    const stats = fs.statSync(outputPath);
    if (stats.size < 1000) {
      throw new Error('Sync failed: Generated file appears incomplete');
    }
    
    console.log('✅ Sync validation passed');
    return true;
  }
}

// Execute sync if run directly
if (require.main === module) {
  (async () => {
    const sync = new FrontendToBackendSync();
    await sync.syncIntelligence();
    await sync.validateSync();
    console.log('🎉 Frontend-to-backend sync completed successfully');
  })().catch((error) => {
    console.error('💥 Sync failed:', error.message);
    process.exit(1);
  });
}

module.exports = { FrontendToBackendSync };