// Enhanced culturally-aware image generator
import type { UserInfo, DifficultyLevel } from "@/types";
import CulturalAdaptationService from "./culturalAdaptationService";
import { ContentSecurity } from "@/utils/security";

export interface CulturalImageContext {
  storyText: string;
  pageIndex: number;
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
  totalPages: number;
  culturalElements?: any;
  authorStyle?: string;
}

export class CulturalImageGenerator {
  
  static generateCulturallyAwarePrompt(context: CulturalImageContext): string {
    const { storyText, pageIndex, userInfo, difficulty, totalPages, culturalElements } = context;
    
    // Get cultural context for authentic representation
    const culturalContext = CulturalAdaptationService.getCulturalContext(userInfo.nativeLanguage || 'en');
    
    // Create culturally appropriate character description
    const character = this.createCulturalCharacter(userInfo, culturalContext);
    
    // Extract story elements with cultural awareness
    const storyElements = this.extractCulturalStoryElements(storyText, culturalElements);
    
    // Get art style that respects cultural aesthetics
    const artStyle = this.getCulturalArtStyle(difficulty, culturalContext);
    
    // Determine scene composition
    const sceneType = this.getSceneType(pageIndex, totalPages);
    
    // Build culturally sensitive prompt
    let prompt = `${artStyle} children's book illustration in the style of diverse global art traditions. `;
    
    // Add culturally appropriate character
    prompt += `${character} `;
    
    // Add story elements with cultural context
    if (storyElements.action) {
      prompt += `${storyElements.action} `;
    }
    
    if (storyElements.setting) {
      prompt += `in ${storyElements.setting} that reflects ${culturalContext.region} cultural aesthetics `;
    }
    
    if (storyElements.object) {
      prompt += `with ${storyElements.object} `;
    }
    
    if (storyElements.animal) {
      const animalDescription = storyElements.animalAttributes && storyElements.animalAttributes.length > 0 
        ? `a ${storyElements.animalAttributes.join(' ')} ${storyElements.animal}`
        : `a friendly ${storyElements.animal}`;
      prompt += `alongside ${animalDescription} `;
    }
    
    // Add scene context
    prompt += `${sceneType}. `;
    
    // Add cultural and safety modifiers
    prompt += this.getCulturalSafetyModifiers(culturalContext, difficulty);
    
    // Validate prompt for appropriateness
    const validation = ContentSecurity.isContentAppropriate(prompt, userInfo.grade, userInfo.nativeLanguage);
    if (!validation.appropriate) {
      console.warn('Image prompt flagged, using safe fallback:', validation.reason);
      return this.getSafeFallbackPrompt(userInfo, difficulty);
    }
    
    return prompt.trim();
  }
  
  private static createCulturalCharacter(userInfo: UserInfo, culturalContext: any): string {
    const gender = userInfo.avatar?.type === 'boy' ? 'boy' : 'girl';
    const name = userInfo.name?.trim() || 'child';
    
    // Use the user's selected avatar skin tone for consistent representation in images only
    // Never mention skin tone in story text, only in image generation prompts
    const skinTone = userInfo.avatar?.skinTone || 'medium';
    const skinToneDescriptions = {
      pale: 'very light skin tone, pale complexion',
      light: 'light skin tone, fair complexion',
      medium: 'medium skin tone, warm brown complexion',
      olive: 'olive skin tone, Mediterranean complexion', 
      dark: 'dark skin tone, beautiful deep brown African/African American complexion'
    };
    
    const consistentSkinTone = skinToneDescriptions[skinTone];
    
    // Enhanced gender and ethnicity descriptions for accurate representation
    let genderDesc;
    if (skinTone === 'dark') {
      genderDesc = userInfo.avatar?.type === 'boy' ? 'young Black boy' : userInfo.avatar?.type === 'girl' ? 'young Black girl' : 'young Black child';
    } else {
      genderDesc = userInfo.avatar?.type === 'boy' ? 'young boy' : userInfo.avatar?.type === 'girl' ? 'young girl' : 'child';
    }
    
    // Cultural clothing and appearance elements
    const culturalAppearance = this.getCulturalAppearanceElements(culturalContext, userInfo);
    
    // Create character description for image generation (main character only)
    let characterDesc = `a ${gender} named ${name} with ${skinTone}`;
    
    // Add cultural appearance elements
    if (culturalAppearance.clothing) {
      characterDesc += `, wearing ${culturalAppearance.clothing}`;
    }
    
    if (userInfo.favoriteColor) {
      characterDesc += ` with ${userInfo.favoriteColor.toLowerCase()} accents`;
    }
    
    // Add cultural context if relevant
    if (culturalContext.region !== 'Western') {
      characterDesc += ` representing ${culturalContext.region} heritage`;
    }
    
    return characterDesc;
  }
  
  private static getCulturalAppearanceElements(culturalContext: any, userInfo: UserInfo): any {
    // Respectful cultural clothing representations
    const culturalClothing = {
      'Arabic': ['traditional colorful clothing', 'beautiful patterned fabrics', 'flowing comfortable garments'],
      'East Asian': ['elegant traditional clothing', 'colorful festival attire', 'beautiful silk garments'],
      'South Asian': ['vibrant traditional dress', 'colorful celebration clothing', 'beautiful embroidered fabrics'],
      'Latin American': ['festive traditional clothing', 'bright colorful attire', 'beautiful woven fabrics'],
      'African': ['stunning traditional patterns', 'vibrant cultural clothing', 'beautiful textile designs'],
      'European': ['comfortable everyday clothing', 'colorful casual attire', 'traditional festival dress'],
      'Western': ['everyday children\'s clothing', 'comfortable play clothes', 'colorful casual attire']
    };
    
    const region = culturalContext.region || 'Western';
    const clothingOptions = culturalClothing[region] || culturalClothing['Western'];
    
    return {
      clothing: clothingOptions[Math.floor(Math.random() * clothingOptions.length)]
    };
  }
  
  private static extractCulturalStoryElements(storyText: string, culturalElements: any): any {
    const text = storyText.toLowerCase();
    
    // Enhanced element detection with cultural awareness
    const elements = {
      action: null as string | null,
      setting: null as string | null,
      object: null as string | null,
      animal: null as string | null,
      animalAttributes: [] as string[],
      cultural: null as string | null
    };
    
    // Action detection
    const actions = {
      'playing': 'joyfully playing',
      'dancing': 'gracefully dancing',
      'exploring': 'curiously exploring',
      'helping': 'kindly helping',
      'sharing': 'generously sharing',
      'learning': 'eagerly learning',
      'discovering': 'excitedly discovering',
      'creating': 'thoughtfully creating'
    };
    
    // Cultural setting detection
    const settings = {
      'home': culturalElements?.setting || 'a warm family home',
      'school': 'a welcoming school',
      'park': 'a beautiful community park',
      'garden': 'a flourishing garden',
      'forest': 'a magical forest',
      'celebration': culturalElements?.celebration || 'a joyful celebration',
      'festival': culturalElements?.celebration || 'a colorful festival'
    };
    
    // Enhanced animal detection with color and attribute extraction
    const animalKeywords = [
      'cat', 'kitten', 'dog', 'puppy', 'bird', 'butterfly', 'rabbit', 'bunny', 
      'elephant', 'lion', 'tiger', 'panda', 'bear', 'fox', 'deer', 'owl', 'eagle',
      'fish', 'turtle', 'frog', 'horse', 'cow', 'pig', 'sheep', 'duck', 'chicken'
    ];
    
    // Color and attribute keywords for extraction
    const colorKeywords = [
      'blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white',
      'golden', 'silver', 'gray', 'grey', 'violet', 'turquoise', 'crimson', 'emerald', 'magenta'
    ];
    
    const attributeKeywords = [
      'tiny', 'small', 'little', 'big', 'large', 'huge', 'giant', 'fluffy', 'soft', 'shiny', 
      'sparkly', 'glowing', 'magical', 'friendly', 'wise', 'clever', 'adorable', 'cute', 
      'beautiful', 'mysterious', 'ancient', 'young', 'old'
    ];
    
    // Extract animals with their descriptive attributes
    for (const animal of animalKeywords) {
      const animalRegex = new RegExp(`\\b([a-zA-Z\\s]*?)\\b${animal}\\b`, 'gi');
      const matches = text.match(animalRegex);
      
      if (matches) {
        elements.animal = animal;
        const attributes = [];
        
        for (const match of matches) {
          const cleanMatch = match.trim().toLowerCase();
          
          // Extract colors
          for (const color of colorKeywords) {
            if (cleanMatch.includes(color)) {
              attributes.push(color);
            }
          }
          
          // Extract other attributes
          for (const attr of attributeKeywords) {
            if (cleanMatch.includes(attr)) {
              attributes.push(attr);
            }
          }
        }
        
        elements.animalAttributes = [...new Set(attributes)]; // Remove duplicates
        break; // Use first found animal
      }
    }
    
    // Object detection with cultural items
    const objects = {
      'book': 'a precious book',
      'toy': 'a cherished toy',
      'food': culturalElements?.food || 'delicious food',
      'gift': 'a special gift',
      'treasure': 'a wonderful treasure',
      'crystal': 'a magical crystal',
      'flower': 'beautiful flowers'
    };
    
    // Find elements in priority order
    for (const [key, desc] of Object.entries(actions)) {
      if (text.includes(key)) {
        elements.action = desc;
        break;
      }
    }
    
    for (const [key, desc] of Object.entries(settings)) {
      if (text.includes(key)) {
        elements.setting = desc;
        break;
      }
    }
    
    // Animal elements are now handled in the enhanced extraction above
    // No separate loop needed since we extract attributes with the animal
    
    for (const [key, desc] of Object.entries(objects)) {
      if (text.includes(key)) {
        elements.object = desc;
        break;
      }
    }
    
    return elements;
  }
  
  private static getCulturalArtStyle(difficulty: DifficultyLevel, culturalContext: any): string {
    const baseStyles = {
      easy: 'Bright, colorful cartoon-style',
      medium: 'Warm, illustrated storybook',
      hard: 'Detailed realistic children\'s book',
      expert: 'Sophisticated artistic children\'s literature'
    };
    
    const culturalInfluences = {
      'Arabic': 'with geometric patterns and warm desert colors',
      'East Asian': 'with watercolor aesthetics and natural harmony',
      'South Asian': 'with vibrant colors and intricate details',
      'Latin American': 'with bold colors and celebratory energy',
      'African': 'with rich earth tones and dynamic patterns',
      'European': 'with classical illustration traditions',
      'Western': 'with contemporary children\'s book aesthetics'
    };
    
    const region = culturalContext.region || 'Western';
    const baseStyle = baseStyles[difficulty];
    const culturalInfluence = culturalInfluences[region] || culturalInfluences['Western'];
    
    return `${baseStyle} ${culturalInfluence}`;
  }
  
  private static getSceneType(pageIndex: number, totalPages: number): string {
    if (pageIndex === 0) {
      return 'Character introduction scene showing warmth and welcome';
    } else if (pageIndex === totalPages - 1) {
      return 'Happy conclusion scene with satisfaction and joy';
    } else if (pageIndex < totalPages / 2) {
      return 'Adventure beginning scene with excitement and discovery';
    } else {
      return 'Story development scene with engagement and growth';
    }
  }
  
  private static getCulturalSafetyModifiers(culturalContext: any, difficulty: DifficultyLevel): string {
    const baseModifiers = 'Safe for children, no text in image, culturally respectful, inclusive representation, warm lighting, joyful atmosphere';
    
    const difficultyModifiers = {
      easy: 'simple and cheerful, bright primary colors, clear composition',
      medium: 'engaging and detailed, harmonious colors, balanced composition',
      hard: 'rich detail and depth, natural color palette, sophisticated composition',
      expert: 'artistic excellence, nuanced lighting, cinematic quality'
    };
    
    const culturalSensitivity = 'celebrates diversity, avoids stereotypes, shows authentic cultural elements respectfully';
    
    return `${baseModifiers}, ${difficultyModifiers[difficulty]}, ${culturalSensitivity}`;
  }
  
  private static getSafeFallbackPrompt(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    const name = userInfo.name || 'a child';
    const gender = userInfo.avatar?.type || 'child';
    
    return `Beautiful, safe children's book illustration of ${name} as a happy ${gender} having a wonderful adventure, ${difficulty} reading level, bright colors, joyful expression, completely safe for children, no text in image, warm and welcoming atmosphere`;
  }
}