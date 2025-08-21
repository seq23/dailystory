// Frontend-Centric Unified Prompt Engine
// Consolidates MulticulturalVisualService, DirectContentExtractor, and AdvancedQualityEngine
// All sophisticated logic now runs on frontend for optimal performance

import { SupportedLanguage } from "@/types/multilingual";
import { UserInfo, DifficultyLevel, SkinTone } from "@/types";
import { DifficultyLevelMapper } from "./DifficultyLevelMapper";
import { FixedCulturalLogic } from "./FixedCulturalLogic";
// Style frameworks now handled server-side via backend shared utilities

// ============= CONSOLIDATED INTERFACES =============

export interface PromptTemplate {
  visualAppearance: string;
  secondaryCharacters: string;
  sceneDescription: string;
  culturalSetting: string;
  styleFramework: string;
  qualityEnhancement: string;
}

export interface EmotionalContext {
  mood: 'happy' | 'calm' | 'exciting' | 'contemplative' | 'adventurous' | 'cozy';
  intensity: 'low' | 'medium' | 'high';
  colorPalette: string[];
  lightingStyle: string;
  compositionStyle: string;
}

export interface CharacterDescriptor {
  name: string;
  type: 'primary' | 'family' | 'friend' | 'teacher' | 'community';
  relationshipToMain: string;
  culturalRole: string;
  physicalTraits: string;
  clothingStyle: string;
  seed?: number;
  lastUsedPage: number;
}

// Direct Content Extraction Interfaces
export interface PageContent {
  subject: string;
  action: string;
  object?: string;
  location?: string;
  descriptor?: string;
}

export interface DirectImagePrompt {
  visualPrompt: string;
  characterInfo: string;
  style: string;
  negativePrompt?: string[];
}

// Quality Enhancement Interfaces
export interface QualityEnhancementResult {
  enhancedPrompt: string;
  qualityScore: number;
  optimizations: string[];
  suggestedParameters: {
    cfgScale: number;
    steps: number;
    model: string;
    scheduler: string;
  };
  visualConsistencyImprovements: string[];
}

// Multicultural Interfaces
export interface FacialFeaturesSystem {
  eyes: string[];
  eyebrows: string[];
  eyelashes: string[];
  nose: string[];
  lips: string[];
  facialStructure: string[];
}

export interface CulturalVisualProfile {
  skinTones: string[];
  hairStyles: string[];
  facialFeatures: string[] | FacialFeaturesSystem;
  culturalElements: string[];
  familyStructure: string[];
  settings: string[];
  clothing: string[];
  celebrations: string[];
  negativePrompts: string[];
  boysHairStyles?: string[];
  girlsHairStyles?: string[];
  mainstreamSettings?: string[];
}

// ============= MAIN UNIFIED ENGINE CLASS =============

export class StructuredPromptEngine {
  // ============= MULTICULTURAL DATA (524 lines merged) =============
  
  private static readonly CULTURAL_VISUAL_PROFILES: Record<SupportedLanguage, CulturalVisualProfile> = {
    'ar': {
      skinTones: [
        'fair olive skin', 'light honey skin', 'golden bronze skin', 'warm olive skin', 
        'deep amber skin', 'honey-toned skin', 'rich caramel skin', 'warm mahogany skin',
        'deep bronze skin', 'rich mocha skin', 'dark olive skin', 'deep umber skin'
      ],
      hairStyles: [
        'flowing dark wavy hair', 'elegant braided hair', 'thick curly dark hair', 'straight black hair with silk scarf', 
        'traditional updo with decorative pins', 'long straight hair with hijab', 'wavy shoulder-length hair', 
        'natural curly texture', 'sleek straight hair', 'twisted updo style', 'layered wavy hair',
        'traditional braided crown', 'modern hijab styles', 'elegant chignon', 'loose flowing curls'
      ],
      facialFeatures: ['expressive dark eyes', 'elegant eyebrows', 'warm smile', 'gentle facial features', 'kind expression'],
      culturalElements: ['traditional Arabic patterns', 'geometric decorations', 'ornate designs', 'cultural jewelry', 'henna art'],
      familyStructure: ['extended family gathering', 'grandmother telling stories', 'multiple generations together', 'community elders', 'family celebration'],
      settings: ['traditional Arabic architecture', 'beautiful mosque courtyards', 'desert oasis', 'bustling marketplace', 'ornate gardens with fountains'],
      clothing: ['traditional thobe', 'modern modest clothing', 'festive cultural dress', 'elegant hijab styles', 'contemporary Middle Eastern fashion'],
      celebrations: ['Eid celebrations', 'traditional wedding', 'family feast', 'cultural festival', 'community gathering'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive', 'inaccurate cultural representation', 'negative stereotypes']
    },
    'es': {
      skinTones: [
        'fair olive skin', 'light tan skin', 'warm caramel skin', 'sun-kissed bronze skin', 
        'rich copper skin', 'golden olive skin', 'warm mahogany skin', 'deep bronze skin',
        'rich mocha skin', 'deep caramel skin', 'dark bronze skin', 'rich umber skin'
      ],
      hairStyles: [
        'thick wavy dark hair', 'long straight black hair', 'curly brown hair', 'braided hair with colorful ribbons', 
        'natural wavy hair', 'sleek bob cut', 'layered shoulder-length hair', 'loose beach waves',
        'traditional braided styles', 'modern textured cut', 'voluminous curly hair', 'straight hair with bangs',
        'twisted updo with flowers', 'side-swept bangs', 'natural texture with highlights'
      ],
      facialFeatures: ['warm brown eyes', 'expressive eyebrows', 'radiant smile', 'strong facial features', 'joyful expression'],
      culturalElements: ['vibrant colors', 'traditional patterns', 'festive decorations', 'cultural art', 'family symbols'],
      familyStructure: ['large extended family', 'abuela figure', 'many cousins playing', 'family celebration', 'multigenerational gathering'],
      settings: ['colorful Latin neighborhood', 'beautiful plaza', 'family courtyard', 'vibrant market', 'traditional hacienda'],
      clothing: ['traditional dress', 'colorful festival clothing', 'modern Latin fashion', 'cultural celebration attire', 'family gathering clothes'],
      celebrations: ['quinceañera', 'Day of the Dead celebration', 'family fiesta', 'cultural festival', 'traditional wedding'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate representation', 'negative stereotypes']
    },
    'zh': {
      skinTones: [
        'porcelain skin', 'fair peachy skin', 'light honey skin', 'warm honey skin', 
        'golden tan skin', 'light olive skin', 'soft peachy skin', 'medium tan skin',
        'warm bronze skin', 'deep honey skin', 'rich tan skin', 'deep bronze skin'
      ],
      hairStyles: [
        'straight black hair', 'elegant hair bun', 'hair with traditional ornaments', 'sleek bob cut', 
        'braided hair with silk ribbons', 'long straight hair with side part', 'layered straight hair',
        'traditional chinese bun with pins', 'modern asian pixie cut', 'shoulder-length straight hair',
        'elegant updo with chopsticks', 'natural straight texture', 'blunt cut bob', 'wispy bangs style'
      ],
      facialFeatures: ['almond-shaped eyes', 'delicate features', 'gentle smile', 'serene expression', 'kind eyes'],
      culturalElements: ['traditional Chinese patterns', 'dragon motifs', 'cherry blossoms', 'calligraphy art', 'jade jewelry'],
      familyStructure: ['multigenerational family', 'grandparents with wisdom', 'respect for elders', 'family harmony', 'traditional family structure'],
      settings: ['traditional Chinese garden', 'pagoda architecture', 'bamboo forest', 'beautiful temple', 'modern Chinese cityscape'],
      clothing: ['traditional qipao', 'modern Chinese fashion', 'festival clothing', 'elegant silk dress', 'contemporary Asian style'],
      celebrations: ['Chinese New Year', 'Moon Festival', 'traditional tea ceremony', 'family reunion', 'cultural festival'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate cultural elements', 'negative stereotypes']
    },
    'hi': {
      skinTones: [
        'fair wheat skin', 'light golden skin', 'warm wheat skin', 'golden brown skin', 
        'warm amber skin', 'rich mahogany skin', 'deep bronze skin', 'warm caramel skin',
        'deep amber skin', 'rich mocha skin', 'dark bronze skin', 'deep umber skin'
      ],
      hairStyles: [
        'long braided hair', 'hair decorated with flowers', 'traditional hair jewelry', 'elegant bun with ornaments', 
        'flowing dark hair', 'coconut oil-treated hair', 'henna-decorated hair', 'traditional plait styles',
        'modern layered cut', 'natural wavy texture', 'straight hair with traditional accessories', 
        'twisted updo with gold ornaments', 'loose curls with jasmine flowers', 'side braid with ribbons'
      ],
      facialFeatures: ['expressive dark eyes', 'elegant eyebrows', 'warm smile', 'gentle features', 'kind expression'],
      culturalElements: ['traditional Indian patterns', 'henna designs', 'colorful rangoli', 'spiritual symbols', 'cultural jewelry'],
      familyStructure: ['joint family system', 'multiple generations', 'traditional family roles', 'community celebration', 'extended family gathering'],
      settings: ['beautiful Indian architecture', 'colorful temple', 'traditional courtyard', 'vibrant marketplace', 'modern Indian home'],
      clothing: ['traditional sari', 'elegant lehenga', 'modern Indian fashion', 'festival clothing', 'contemporary Indian style'],
      celebrations: ['Diwali celebration', 'traditional wedding', 'Holi festival', 'family gathering', 'cultural ceremony'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate cultural representation', 'negative stereotypes']
    },
    'pt': {
      skinTones: [
        'fair olive skin', 'light caramel skin', 'golden olive skin', 'warm caramel skin', 
        'sun-kissed bronze skin', 'tropical tan skin', 'rich mocha skin', 'deep bronze skin',
        'warm mahogany skin', 'deep caramel skin', 'rich umber skin', 'deep ebony skin'
      ],
      hairStyles: [
        'beach wave hair', 'natural curly hair', 'long flowing hair', 'textured natural hair', 'modern Brazilian styles',
        'loose beachy curls', 'straight hair with highlights', 'voluminous natural texture', 'layered wavy hair',
        'afro-textured natural hair', 'relaxed straight styles', 'twist-out curls', 'braided protective styles',
        'natural coily texture', 'beach wave bob', 'curly pixie cut', 'long natural curls with coconut oil'
      ],
      facialFeatures: ['warm brown eyes', 'radiant smile', 'expressive features', 'joyful expression', 'vibrant personality'],
      culturalElements: ['tropical patterns', 'beach culture', 'vibrant colors', 'carnival elements', 'natural beauty'],
      familyStructure: ['beach family gathering', 'community celebration', 'large family party', 'neighborhood festival', 'extended family'],
      settings: ['beautiful Brazilian beach', 'tropical garden', 'colorful neighborhood', 'coastal town', 'modern Brazilian city'],
      clothing: ['tropical casual wear', 'carnival costume', 'beach festival clothing', 'modern Brazilian fashion', 'cultural celebration attire'],
      celebrations: ['carnival celebration', 'beach festival', 'family gathering', 'community party', 'cultural event'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate representation', 'negative stereotypes']
    },
    'fr': {
      skinTones: [
        'fair rose skin', 'warm peach skin', 'light tan skin', 'golden olive skin', 
        'creamy complexion', 'warm caramel skin', 'rich bronze skin', 'deep amber skin',
        'warm mahogany skin', 'rich ebony skin', 'deep mocha skin', 'dark umber skin'
      ],
      hairStyles: [
        'elegant French braids', 'chic bob cut', 'sophisticated updo', 'natural wavy hair', 'stylish modern cut',
        'sleek straight hair', 'loose romantic curls', 'pixie cut with texture', 'shoulder-length layers',
        'classic French twist', 'modern asymmetrical cut', 'natural texture with highlights', 'vintage-inspired waves',
        'effortless beach waves', 'elegant chignon', 'textured lob cut', 'side-swept bangs with layers'
      ],
      facialFeatures: ['bright eyes', 'refined features', 'elegant smile', 'sophisticated expression', 'charming demeanor'],
      culturalElements: ['French elegance', 'artistic elements', 'cultural sophistication', 'traditional patterns', 'refined aesthetics'],
      familyStructure: ['intimate family gathering', 'grandparents storytelling', 'elegant family dinner', 'cultural tradition', 'family celebration'],
      settings: ['charming French countryside', 'elegant Parisian street', 'beautiful French garden', 'traditional French home', 'cultural landmark'],
      clothing: ['chic French fashion', 'elegant dress', 'sophisticated style', 'cultural formal wear', 'modern French clothing'],
      celebrations: ['French cultural festival', 'family feast', 'traditional celebration', 'elegant gathering', 'cultural event'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate cultural elements', 'negative stereotypes']
    },
    'en': {
      // Full spectrum of African American skin tones (very light to very dark)
      skinTones: [
        'fair brown skin', 'light caramel skin', 'warm beige skin', 'peachy brown skin',
        'light bronze skin', 'warm honey skin', 'golden caramel skin', 'honey bronze skin',
        'caramel skin', 'deep amber skin', 'golden bronze skin', 'warm mahogany skin',
        'cool espresso skin', 'dark chocolate skin', 'deep umber skin', 'cool walnut skin',
        'rich coffee skin', 'deep chestnut skin', 'rich cocoa skin', 'deep ebony skin'
      ],
      // Boys' styles
      boysHairStyles: [
        'buzz cut', 'fade cut', 'taper fade', 'high top fade', 'low fade', 'crew cut', 'caesar cut', 
        'curly top fade', 'curly high fade', 'curly low fade', 'curly taper fade', 'curly high top', 
        'curly mohawk', 'curly faux hawk', 'curly undercut', 'fade with curls on top', 'textured crop', 
        'curly fringe fade', 'twisted top fade', 'undercut design', 'hair tattoo', 'geometric patterns', 
        'mini afro', 'medium afro', 'tapered afro', 'wash and go', 'finger coils', 'two strand twists', 
        'flat twists', 'mini twists', 'locs', 'starter locs', 'freeform locs', 'twisted locs', 
        'side part locs', 'middle part locs', 'ponytail with locs', 'nape area tapered'
      ],
      // Girls' styles
      girlsHairStyles: [
        'short natural hair', 'medium natural hair', 'long natural hair', 'shoulder-length hair', 'chin-length hair',
        'twist out', 'bantu knots', 'rod set', 'braid out', 'pineapple updo', 'high puff', 'low puff', 
        'side puff', 'double puff', 'space buns', 'top knot bun', 'low bun', 'messy bun', 'sleek bun',
        'cornrows', 'box braids', 'micro braids', 'jumbo braids', 'goddess braids', 'dutch braids', 
        'french braids', 'fishtail braids', 'halo braid', 'crown braid', 'side braids', 'three strand twists',
        'senegalese twists', 'marley twists', 'havana twists', 'passion twists', 'spring twists', 
        'kinky twists', 'chunky twists', 'protective twists', 'sisterlocs', 'microlocs', 'traditional locs',
        'interlocked locs', 'braided locs', 'loc updo', 'half up half down locs', 'afro puffs', 'large afro',
        'picked out afro', 'shaped afro', 'curly afro', 'coily afro', 'kinky afro', 'twist and pin style',
        'bobby pin curls', 'hair accessories with bows', 'headbands', 'hair clips', 'barrettes', 'scrunchies',
        'silk scarves', 'bandanas', 'side swept bangs', 'face framing layers', 'layered cut', 'blunt cut',
        'asymmetrical cut', 'zigzag parts', 'curved parts', 'triangle parts', 'diamond parts', 
        'heart shaped parts', 'star patterns'
      ],
      // Legacy field for backward compatibility
      hairStyles: [],
      // Comprehensive African American facial features system
      facialFeatures: {
        eyes: [
          'almond-shaped dark brown eyes', 'round rich brown eyes', 'deep-set hazel eyes', 
          'prominent amber eyes', 'almond-shaped hazel-green eyes', 'round dark brown eyes',
          'deep-set rich brown eyes', 'prominent hazel eyes', 'almond-shaped amber eyes',
          'round hazel-green eyes', 'expressive dark brown eyes', 'bright amber eyes',
          'warm hazel eyes', 'intelligent dark brown eyes', 'sparkling hazel-green eyes'
        ],
        eyebrows: [
          'full well-defined eyebrows', 'naturally arched eyebrows', 'thick expressive eyebrows',
          'elegantly shaped eyebrows', 'bold natural eyebrows', 'gracefully arched eyebrows'
        ],
        eyelashes: [
          'long curved eyelashes', 'naturally thick eyelashes', 'beautifully curled eyelashes',
          'full dark eyelashes', 'elegantly long eyelashes'
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
          'smooth facial contours', 'natural facial symmetry', 'elegant bone structure',
          'defined cheekbones', 'graceful jawline', 'harmonious facial features'
        ]
      },
      // Mix of African American cultural pride and general American elements
      culturalElements: [
        'modern urban style', 'contemporary American fashion', 'diverse American culture', 
        'metropolitan diversity', 'cultural pride symbols', 'community strength',
        'mainstream American culture', 'suburban lifestyle', 'middle-class family values',
        'American dream symbols', 'educational achievement', 'professional success'
      ],
      // Mainstream American settings for non-dark skin English speakers
      mainstreamSettings: [
        'suburban neighborhood', 'modern American suburb', 'middle-class community',
        'well-maintained school', 'public library', 'shopping mall', 'local park',
        'family restaurant', 'community center', 'beautiful church', 'family home',
        'historical landmark', 'cultural center'
      ],
      familyStructure: [
        'strong family bonds', 'community support', 'church family', 'multigenerational wisdom', 
        'extended family gathering', 'neighborhood community', 'nuclear family', 'suburban family',
        'professional family', 'academic family', 'middle-class household', 'two-parent home'
      ],
      // Mix of urban African American and suburban/general American settings
      settings: [
        'vibrant African American neighborhood', 'community center', 'beautiful church', 
        'family home', 'cultural center', 'historical landmark', 'suburban neighborhood',
        'modern American suburb', 'middle-class community', 'well-maintained school',
        'public library', 'shopping mall', 'local park', 'family restaurant'
      ],
      clothing: [
        'jeans and sneakers', 'casual t-shirt', 'modern American fashion', 
        'contemporary urban style', 'hoodie and jeans', 'athletic wear', 
        'modern African American fashion', 'contemporary style', 'preppy clothes',
        'school uniform', 'suburban casual wear', 'mainstream fashion', 'polo shirt'
      ],
      celebrations: [
        'Juneteenth celebration', 'family reunion', 'church gathering', 'community festival', 
        'cultural pride event', 'graduation celebration', 'birthday party', 'Christmas morning',
        'Thanksgiving dinner', 'Fourth of July barbecue', 'school achievement ceremony', 'sports victory'
      ],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'negative stereotypes', 'inaccurate representation', 'degrading imagery']
    }
  };

  // ============= STYLE FRAMEWORKS & EMOTIONAL MAPPINGS =============
  
  // DELETED: Simple STYLE_FRAMEWORKS replaced with sophisticated frontend version
  // Now using imported sophisticated style frameworks from utils/styleFrameworks.ts

  private static readonly EMOTIONAL_MAPPINGS: Record<string, EmotionalContext> = {
    'happy celebration': {
      mood: 'happy',
      intensity: 'high',
      colorPalette: ['warm yellows', 'bright oranges', 'cheerful blues'],
      lightingStyle: 'bright warm lighting',
      compositionStyle: 'dynamic joyful composition'
    },
    'peaceful moment': {
      mood: 'calm',
      intensity: 'low',
      colorPalette: ['soft pastels', 'gentle greens', 'warm beiges'],
      lightingStyle: 'soft natural lighting',
      compositionStyle: 'balanced serene composition'
    },
    'adventure scene': {
      mood: 'exciting',
      intensity: 'high',
      colorPalette: ['bold blues', 'energetic greens', 'adventurous purples'],
      lightingStyle: 'dramatic adventure lighting',
      compositionStyle: 'dynamic action composition'
    },
    'cozy family time': {
      mood: 'cozy',
      intensity: 'medium',
      colorPalette: ['warm earth tones', 'comfortable browns', 'gentle golds'],
      lightingStyle: 'warm intimate lighting',
      compositionStyle: 'cozy gathering composition'
    }
  };

  // ============= QUALITY ENHANCEMENT CONSTANTS =============
  
  private static readonly CHILDREN_BOOK_OPTIMAL_PARAMS = {
    cfgScale: 3,
    steps: 8,
    model: "runware:100@1",
    scheduler: "FlowMatchEulerDiscreteScheduler",
    outputFormat: "WEBP"
  };

  private static readonly QUALITY_ENHANCEMENT_PATTERNS = [
    {
      name: "Character Description Enhancement",
      pattern: /\b(child|boy|girl|person|character)\b/gi,
      enhancement: (match: string, context: string) => {
        const enhancements = [
          "with expressive bright eyes",
          "with a warm friendly smile", 
          "with natural-looking features"
        ];
        return `${match} ${enhancements[Math.floor(Math.random() * enhancements.length)]}`;
      }
    },
    {
      name: "Scene Atmosphere Enhancement", 
      pattern: /\bin\s+(the\s+)?(garden|park|room|house|school)/gi,
      enhancement: (match: string, context: string) => {
        return `${match} with soft natural lighting and warm atmosphere`;
      }
    },
    {
      name: "Color Vibrancy Enhancement",
      pattern: /\b(red|blue|green|yellow|orange|purple|pink)\b/gi,
      enhancement: (match: string, context: string) => {
        return `vibrant ${match}`;
      }
    }
  ];

  // ============= DIRECT CONTENT EXTRACTION CONSTANTS =============
  
  private static readonly SIMPLE_SUBJECTS = [
    'cat', 'dog', 'bird', 'fish', 'bear', 'rabbit', 'mouse', 'elephant', 'lion', 'tiger',
    'wolf', 'deer', 'fox', 'owl', 'butterfly', 'bee', 'frog', 'snake', 'giraffe', 'monkey',
    'sally', 'tom', 'sam', 'alex', 'emma', 'jack', 'lily', 'ben', 'zoe', 'max',
    'boy', 'girl', 'child', 'friend', 'family', 'mom', 'dad', 'teacher',
    'they', 'he', 'she', 'it', 'we', 'you'
  ];

  private static readonly SIMPLE_ACTIONS = [
    'runs', 'walks', 'jumps', 'plays', 'sees', 'finds', 'goes', 'comes', 'sits', 'stands',
    'looks', 'smiles', 'laughs', 'helps', 'reads', 'eats', 'sleeps', 'wakes', 'calls', 'says',
    'run', 'walk', 'jump', 'play', 'see', 'go', 'come', 'sit', 'stand', 'look', 'eat', 'sleep', 'swim'
  ];

  private static readonly SIMPLE_OBJECTS = [
    'ball', 'toy', 'book', 'tree', 'house', 'car', 'bike', 'flower', 'cake', 'apple',
    'chair', 'table', 'bed', 'door', 'window', 'box', 'bag', 'hat', 'shoe', 'coat',
    'sun', 'moon', 'star', 'cloud', 'sky', 'rainbow', 'light', 'shadow',
    'grass', 'rock', 'stick', 'leaf', 'branch', 'bush', 'sand', 'water', 'pond'
  ];

  private static readonly SIMPLE_LOCATIONS = [
    'park', 'home', 'school', 'garden', 'forest', 'beach', 'yard', 'room', 'kitchen', 'outside',
    'grass', 'field', 'woods', 'lake', 'river', 'mountain', 'hill'
  ];

  // ============= CORE PROMPT COMPOSITION METHODS =============

  /**
   * Main structured prompt composition - Phase 1: Intelligent Prompt Composition
   */
  static composeStructuredPrompt(
    storyText: string,
    userInfo: UserInfo,
    pageNumber: number,
    characterDescriptors: CharacterDescriptor[],
    emotionalContext?: EmotionalContext
  ): PromptTemplate {
    // Analyze story text for emotional content directly
    const detectedEmotion = this.analyzeEmotionalContent(storyText);
    const finalEmotionalContext = emotionalContext || detectedEmotion;

    // Extract primary scene from story text
    const primaryScene = this.extractPrimaryScene(storyText);
    
    // Generate cultural visual elements
    const culturalProfile = this.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    
    // Map difficulty level properly
    const normalizedDifficulty = DifficultyLevelMapper.normalizeLevel(
      userInfo.readingLevel || userInfo.difficultyLevel || 'easy'
    );
    
    // Compose template sections with cultural awareness
    const template: PromptTemplate = {
      visualAppearance: this.composeVisualAppearance(userInfo, characterDescriptors),
      secondaryCharacters: this.composeSecondaryCharacters(characterDescriptors, culturalProfile),
      sceneDescription: this.composeSceneDescription(primaryScene, finalEmotionalContext, userInfo),
      culturalSetting: this.composeCulturalSetting(userInfo, culturalProfile),
      styleFramework: this.composeStyleFramework(normalizedDifficulty, finalEmotionalContext),
      qualityEnhancement: this.composeQualityEnhancement(userInfo, culturalProfile)
    };

    console.log(`🎨 Structured prompt composed for page ${pageNumber}:`, {
      emotion: finalEmotionalContext.mood,
      characterCount: characterDescriptors.length,
      culturalContext: userInfo.nativeLanguage
    });

    return template;
  }

  /**
   * Convert template to final prompt string
   */
  static templateToPrompt(template: PromptTemplate): string {
    const sections = [
      template.visualAppearance,
      template.secondaryCharacters,
      template.sceneDescription,
      template.culturalSetting,
      template.styleFramework,
      template.qualityEnhancement
    ].filter(section => section.trim().length > 0);
    
    return sections.join(' ');
  }

  // ============= MULTICULTURAL METHODS (Merged from MulticulturalVisualService) =============

  static getCulturalVisualProfile(nativeLanguage: SupportedLanguage): CulturalVisualProfile {
    return this.CULTURAL_VISUAL_PROFILES[nativeLanguage] || this.CULTURAL_VISUAL_PROFILES['en'];
  }

  static generateCulturalCharacterDescription(userInfo: UserInfo): string {
    // SIMPLIFIED: Only use FixedCulturalLogic for English + dark skin
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      const profile = this.getCulturalVisualProfile('en');
      const skinTone = this.selectRandomElement(profile.skinTones.slice(10, 20)); // Use darker range
      
      // Use FixedCulturalLogic for expanded facial features
      const facialFeatures = FixedCulturalLogic.generateExpandedAfricanAmericanFeatures();
      
      // Select appropriate hair style based on avatar gender
      const isGirl = userInfo.name?.toLowerCase().includes('a') || userInfo.interests?.includes('princess');
      const hairStyles = isGirl ? (profile.girlsHairStyles || []) : (profile.boysHairStyles || []);
      const hairStyle = this.selectRandomElement(hairStyles.length > 0 ? hairStyles : ['natural short hair']);
      
      const culturalClothing = FixedCulturalLogic.selectCulturalClothing(userInfo, profile);
      
      return `child with ${skinTone}, ${facialFeatures}, ${hairStyle}, ${culturalClothing}, authentic African American features`;
    }
    
    // Standard cultural character generation for other languages/contexts
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    const skinTone = this.mapSkinToneToDescription(userInfo.avatar?.skinTone as SkinTone, profile);
    const hairStyle = this.getCulturallyAppropriateHairStyle(userInfo);
    const facialFeatures = this.generateFacialFeaturesDescription(profile.facialFeatures);
    
    // FIXED: Only use FixedCulturalLogic for English + dark skin users
    const culturalClothing = (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') 
      ? FixedCulturalLogic.selectCulturalClothing(userInfo, profile)
      : this.selectRandomElement(profile.clothing);
    
    return `child with ${skinTone}, ${facialFeatures}, ${hairStyle}, ${culturalClothing}`;
  }

  private static getCulturallyAppropriateHairStyle(userInfo: UserInfo): string {
    // FIXED: Inline hair mapping logic to avoid CommonJS require() issues
    
    // Special case: African American hair styles for English + dark skin
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      const gender = userInfo.avatar?.type === 'girl' ? 'girl' : 'boy';
      const africanAmericanHairStyles = gender === 'girl' 
        ? this.CULTURAL_VISUAL_PROFILES['en'].girlsHairStyles || []
        : this.CULTURAL_VISUAL_PROFILES['en'].boysHairStyles || [];
      
      return this.selectRandomElement(africanAmericanHairStyles) || 'natural hair';
    }
    
    // Universal hair color mapping based on skin tone - inlined logic
    const skinToneToHairColor: Record<string, string> = {
      'pale': 'blonde hair',
      'light': 'blonde hair', 
      'medium': 'brown hair',
      'olive': 'dark brown hair',
      'dark': 'black hair'
    };
    
    const hairColor = skinToneToHairColor[userInfo.avatar?.skinTone || 'medium'] || 'brown hair';
    const hairTextures = ['straight', 'wavy', 'curly'];
    const hairLengths = ['short', 'medium-length', 'long'];
    
    const texture = hairTextures[Math.floor(Math.random() * hairTextures.length)];
    const length = hairLengths[Math.floor(Math.random() * hairLengths.length)];
    
    return `${length} ${texture} ${hairColor} hair`;
  }

  private static getCulturalClothing(userInfo: UserInfo): string {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    
    // FIXED: Only use FixedCulturalLogic for English + dark skin users
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return FixedCulturalLogic.selectCulturalClothing(userInfo, profile);
    }
    
    return this.selectRandomElement(profile.clothing);
  }

  private static generateCulturalSetting(userInfo: UserInfo): string {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    
    // FIXED: Only use FixedCulturalLogic for English + dark skin users
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return FixedCulturalLogic.selectCulturalSetting(userInfo, profile);
    }
    
    return this.selectRandomElement(profile.settings);
  }

  private static generateCulturalNegativePrompt(userInfo: UserInfo): string {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    return profile.negativePrompts.join(', ');
  }

  private static getQualityEnhancementTerms(userInfo: UserInfo): string {
    const baseQuality = 'high quality, detailed, professional children\'s book illustration';
    
    // Add cultural representation quality terms
    if (userInfo.nativeLanguage !== 'en') {
      return `${baseQuality}, authentic cultural representation, respectful portrayal`;
    }
    
    return baseQuality;
  }

  private static mapSkinToneToDescription(basicSkinTone: SkinTone, profile: CulturalVisualProfile): string {
    if (!basicSkinTone) return this.selectRandomElement(profile.skinTones);
    
    const skinToneMap: Record<SkinTone, number> = {
      'pale': 0,
      'light': Math.floor(profile.skinTones.length * 0.25),
      'medium': Math.floor(profile.skinTones.length * 0.5),
      'olive': Math.floor(profile.skinTones.length * 0.65),
      'dark': Math.floor(profile.skinTones.length * 0.8)
    };
    
    const index = skinToneMap[basicSkinTone] || 0;
    return profile.skinTones[Math.min(index, profile.skinTones.length - 1)];
  }

  private static selectRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static generateFacialFeaturesDescription(facialFeatures: string[] | FacialFeaturesSystem): string {
    if (Array.isArray(facialFeatures)) {
      return this.selectRandomElement(facialFeatures);
    }
    
    // Handle structured facial features
    const eyes = this.selectRandomElement(facialFeatures.eyes);
    const structure = this.selectRandomElement(facialFeatures.facialStructure);
    return `${eyes}, ${structure}`;
  }

  // ============= DIRECT CONTENT EXTRACTION METHODS =============

  static extractPageContent(pageText: string): PageContent {
    const cleanText = pageText.toLowerCase().trim();
    const words = cleanText.split(/\s+/);
    
    return {
      subject: this.findSubject(words),
      action: this.findAction(words),
      object: this.findObject(words),
      location: this.findLocation(words),
      descriptor: this.findDescriptor(words)
    };
  }

  private static findSubject(words: string[]): string {
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      if (this.SIMPLE_SUBJECTS.includes(word)) {
        return word;
      }
    }
    
    // If no clear subject, use first word that might be a name
    for (const word of words) {
      if (word.length > 2 && /^[A-Z]/.test(word)) {
        return word.toLowerCase();
      }
    }
    
    return 'child';
  }

  private static findAction(words: string[]): string {
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/, '');
      if (this.SIMPLE_ACTIONS.includes(cleanWord)) {
        return cleanWord;
      }
    }
    
    // Look for common action patterns
    if (words.some(w => w.includes('run'))) return 'running';
    if (words.some(w => w.includes('walk'))) return 'walking';
    if (words.some(w => w.includes('jump'))) return 'jumping';
    if (words.some(w => w.includes('play'))) return 'playing';
    if (words.some(w => w.includes('see'))) return 'looking at';
    if (words.some(w => w.includes('go'))) return 'going';
    
    return 'standing happily';
  }

  private static findObject(words: string[]): string | undefined {
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/, '');
      if (this.SIMPLE_OBJECTS.includes(cleanWord)) {
        return cleanWord;
      }
    }
    
    // Look for "a/an/the + object" patterns
    for (let i = 0; i < words.length - 1; i++) {
      if (['a', 'an', 'the'].includes(words[i].toLowerCase())) {
        const nextWord = words[i + 1].toLowerCase().replace(/[.,!?]/, '');
        if (nextWord.length > 2) {
          return nextWord;
        }
      }
    }
    
    return undefined;
  }

  private static findLocation(words: string[]): string | undefined {
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/, '');
      if (this.SIMPLE_LOCATIONS.includes(cleanWord)) {
        return cleanWord;
      }
    }
    
    // Look for "in/at/to + location" patterns
    for (let i = 0; i < words.length - 1; i++) {
      if (['in', 'at', 'to', 'near'].includes(words[i].toLowerCase())) {
        const nextWord = words[i + 1].toLowerCase().replace(/[.,!?]/, '');
        if (this.SIMPLE_LOCATIONS.includes(nextWord)) {
          return nextWord;
        }
      }
    }
    
    return undefined;
  }

  private static findDescriptor(words: string[]): string | undefined {
    const descriptors = [
      'big', 'small', 'fast', 'slow', 'happy', 'sad', 'red', 'blue', 'green', 'yellow', 'little', 'old', 'new', 'good', 'nice', 'funny',
      'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'silver', 'gold',
      'tall', 'short', 'soft', 'hard', 'smooth', 'rough', 'fun', 'scary', 'bright', 'dark', 'loud', 'quiet'
    ];
    
    const foundDescriptors: string[] = [];
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/, '');
      if (descriptors.includes(cleanWord)) {
        foundDescriptors.push(cleanWord);
      }
    }
    
    return foundDescriptors.length > 0 ? foundDescriptors.join(', ') : undefined;
  }

  static generateDirectPrompt(
    content: PageContent, 
    userInfo: UserInfo,
    style: string = 'children-book-illustration',
    sessionId?: string
  ): DirectImagePrompt {
    // Build character description
    const characterInfo = this.buildSimpleCharacterDescription(userInfo, content.subject);
    
    // Build the visual scene directly from page content
    let visualScene = '';
    
    if (content.subject === userInfo.name.toLowerCase() || ['child', 'boy', 'girl'].includes(content.subject)) {
      // It's the main character
      visualScene = `${characterInfo} ${content.action}`;
    } else {
      // It's another character/object
      const descriptor = content.descriptor ? `${content.descriptor} ` : '';
      visualScene = `${descriptor}${content.subject} ${content.action}`;
      
      // Add character if mentioned alongside
      if (content.object && content.object.includes(userInfo.name.toLowerCase())) {
        visualScene += ` with ${characterInfo}`;
      }
    }
    
    // Add object if present
    if (content.object && !content.object.includes(userInfo.name.toLowerCase())) {
      const descriptor = content.descriptor && !visualScene.includes(content.descriptor) ? `${content.descriptor} ` : '';
      visualScene += ` ${descriptor}${content.object}`;
    }
    
    // Add location if present
    if (content.location) {
      visualScene += ` in ${content.location}`;
    }
    
    // Simplified prompt - environmental context now handled frontend-side
    const visualPrompt = `A ${style} showing ${visualScene}. Bright, cheerful, safe for children.`;
    
    return {
      visualPrompt,
      characterInfo,
      style
    };
  }

  private static buildSimpleCharacterDescription(userInfo: UserInfo, subject: string): string {
    // Only describe the main character if they're the subject
    if (subject === userInfo.name.toLowerCase() || ['child', 'boy', 'girl'].includes(subject)) {
      const age = userInfo.age;
      const ageGroup = age <= 5 ? 'young child' : age <= 8 ? 'child' : 'older child';
      const skinTone = userInfo.avatar?.skinTone || 'medium';
      
      // Enhanced skin tone descriptions for better representation
      const skinToneMap: Record<string, string> = {
        'pale': 'pale skin',
        'light': 'light skin',
        'medium': 'medium skin',
        'olive': 'olive skin',
        'dark': 'rich brown skin, beautiful dark complexion, African American features'
      };
      
      // Enhanced hair descriptions for texture representation
      const hairTextureMap: Record<string, string> = {
        'dark': ', natural African American hair textures like afros curls braids and locs',
        'light': ', straight hair',
        'medium': ', wavy hair',
        'olive': ', dark wavy hair',
        'pale': ', light hair'
      };
      
      const skinDescription = skinToneMap[skinTone] || skinTone + ' skin';
      const hairDescription = hairTextureMap[skinTone] || '';
      
      return `${ageGroup} named ${userInfo.name} with ${skinDescription}${hairDescription}, proper human anatomy, realistic child proportions`;
    }
    
    return subject;
  }

  static createSimplePrompt(pageText: string, userInfo: UserInfo, sessionId?: string): string {
    const content = this.extractPageContent(pageText);
    const prompt = this.generateDirectPrompt(content, userInfo, 'children-book-illustration', sessionId);
    
    console.log(`📝 Direct Content: "${pageText}" → "${prompt.visualPrompt}"`);
    
    return prompt.visualPrompt;
  }

  // ============= QUALITY ENHANCEMENT METHODS =============

  static optimizeForChildrensBooks(
    prompt: string, 
    sessionId?: string, 
    pageNumber?: number,
    userInfo?: any
  ): QualityEnhancementResult {
    let enhancedPrompt = prompt;
    const optimizations: string[] = [];
    const visualConsistencyImprovements: string[] = [];

    // 1. Apply children's book specific enhancements
    for (const pattern of this.QUALITY_ENHANCEMENT_PATTERNS) {
      const matches = prompt.matchAll(pattern.pattern);
      for (const match of matches) {
        if (match[0] && match.index !== undefined) {
          const enhanced = pattern.enhancement(match[0], prompt);
          enhancedPrompt = enhancedPrompt.replace(match[0], enhanced);
          optimizations.push(`Applied ${pattern.name}: ${match[0]} → ${enhanced}`);
        }
      }
    }

    // 2. Add professional children's book illustration suffix
    const professionalSuffix = ", professional children's book illustration, warm earth tones and soft natural lighting, diverse inclusive characters with expressive faces, contemporary storybook art style, safe wholesome content, high quality digital artwork, soft painterly texture, appealing composition";
    
    if (!enhancedPrompt.includes("professional children's book illustration")) {
      enhancedPrompt += professionalSuffix;
      optimizations.push("Added professional children's book illustration styling");
    }

    // 3. Calculate quality score
    const qualityScore = this.calculateQualityScore(enhancedPrompt, optimizations.length);

    return {
      enhancedPrompt,
      qualityScore,
      optimizations,
      suggestedParameters: this.CHILDREN_BOOK_OPTIMAL_PARAMS,
      visualConsistencyImprovements
    };
  }

  static getOptimalParameters(complexity: 'simple' | 'medium' | 'complex' = 'medium'): typeof StructuredPromptEngine.CHILDREN_BOOK_OPTIMAL_PARAMS {
    const baseParams = { ...this.CHILDREN_BOOK_OPTIMAL_PARAMS };
    
    switch (complexity) {
      case 'simple':
        return { ...baseParams, cfgScale: 3, steps: 8 };
      case 'complex':
        return { ...baseParams, cfgScale: 4, steps: 12 };
      default:
        return baseParams;
    }
  }

  private static calculateQualityScore(prompt: string, optimizationCount: number): number {
    let score = 0.6; // Base score
    
    // Length bonus (optimal prompts are detailed but not too long)
    const promptLength = prompt.length;
    if (promptLength > 100 && promptLength < 2800) {
      score += 0.2;
    }

    // Enhancement bonus
    score += Math.min(optimizationCount * 0.05, 0.3);

    // Professional styling bonus
    if (prompt.includes("professional children's book illustration")) {
      score += 0.1;
    }

    // Descriptive detail bonus
    const descriptiveWords = (prompt.match(/\b(vibrant|soft|warm|bright|expressive|natural|cozy|magical)\b/gi) || []).length;
    score += Math.min(descriptiveWords * 0.02, 0.1);

    return Math.min(score, 1.0);
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Analyze story text for emotional content and map to visual style
   */
  private static analyzeEmotionalContent(storyText: string): EmotionalContext {
    const text = storyText.toLowerCase();
    
    // Happy/celebration patterns
    if (text.includes('laugh') || text.includes('smile') || text.includes('joy') || 
        text.includes('celebrate') || text.includes('party') || text.includes('happy')) {
      return this.EMOTIONAL_MAPPINGS['happy celebration'];
    }
    
    // Adventure/exciting patterns
    if (text.includes('adventure') || text.includes('explore') || text.includes('discover') ||
        text.includes('journey') || text.includes('exciting') || text.includes('climb')) {
      return this.EMOTIONAL_MAPPINGS['adventure scene'];
    }
    
    // Cozy/family patterns
    if (text.includes('family') || text.includes('home') || text.includes('cozy') ||
        text.includes('together') || text.includes('warm') || text.includes('hug')) {
      return this.EMOTIONAL_MAPPINGS['cozy family time'];
    }
    
    // Default to peaceful
    return this.EMOTIONAL_MAPPINGS['peaceful moment'];
  }

  /**
   * Extract the most visually descriptive scene from story text
   */
  private static extractPrimaryScene(storyText: string): string {
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Score sentences by visual action words
    const actionWords = ['walk', 'run', 'play', 'look', 'see', 'go', 'find', 'hold', 'sit', 'stand', 'move', 'jump', 'climb'];
    
    let bestScene = sentences[0] || storyText;
    let highestScore = 0;
    
    for (const sentence of sentences) {
      const words = sentence.toLowerCase().split(/\s+/);
      const score = words.filter(word => actionWords.includes(word)).length;
      
      if (score > highestScore) {
        highestScore = score;
        bestScene = sentence.trim();
      }
    }
    
    return bestScene;
  }

  /**
   * Compose visual appearance section with cultural authenticity
   */
  private static composeVisualAppearance(userInfo: UserInfo, characters: CharacterDescriptor[]): string {
    const primaryCharacter = characters.find(c => c.type === 'primary');
    if (!primaryCharacter) {
      return this.generateCulturalCharacterDescription(userInfo);
    }
    
    return primaryCharacter.physicalTraits;
  }

  /**
   * Compose secondary characters with family resemblance and cultural consistency
   */
  private static composeSecondaryCharacters(characters: CharacterDescriptor[], culturalProfile: CulturalVisualProfile): string {
    const secondaryChars = characters.filter(c => c.type !== 'primary');
    
    if (secondaryChars.length === 0) return '';
    
    const descriptions = secondaryChars.map(char => {
      // Add family resemblance for family members
      if (char.type === 'family') {
        return `${char.relationshipToMain} with similar ${culturalProfile.skinTones[0]}, ${char.physicalTraits}`;
      }
      
      return `${char.relationshipToMain} ${char.physicalTraits}`;
    });
    
    return descriptions.length > 0 ? `, with ${descriptions.join(', ')}` : '';
  }

  /**
   * Compose scene description with emotional tone mapping
   */
  private static composeSceneDescription(
    primaryScene: string, 
    emotionalContext: EmotionalContext,
    userInfo: UserInfo
  ): string {
    // Integrate user preferences into scene composition
    const userColorPreference = userInfo.favoriteColor;
    let colorPalette = emotionalContext.colorPalette.join(', ');
    
    // Enhance color palette with user's favorite color if appropriate
    if (userColorPreference && !colorPalette.toLowerCase().includes(userColorPreference.toLowerCase())) {
      colorPalette = `${userColorPreference} tones, ${colorPalette}`;
    }
    
    const lighting = emotionalContext.lightingStyle;
    
    return `${primaryScene}, ${colorPalette}, ${lighting}`;
  }

  /**
   * Compose cultural setting with authentic elements and user preferences
   */
  private static composeCulturalSetting(userInfo: UserInfo, culturalProfile: CulturalVisualProfile): string {
    let setting = this.generateCulturalSetting(userInfo);
    
    const culturalElements = culturalProfile.culturalElements.slice(0, 2).join(', ');
    
    // Integrate user's special request into cultural setting if relevant
    const specialRequest = userInfo.specialRequest;
    if (specialRequest && specialRequest.includes('theme:')) {
      const theme = specialRequest.replace('theme:', '').trim();
      return `${setting}, ${culturalElements}, ${theme} atmosphere`;
    }
    
    return `${setting}, ${culturalElements}`;
  }

  /**
   * Compose style framework based on difficulty and emotion
   */
  private static composeStyleFramework(difficulty: DifficultyLevel, emotionalContext: EmotionalContext): string {
    // Style frameworks now handled server-side for consistency
    // Basic composition for frontend use only
    const composition = emotionalContext.compositionStyle;
    
    return `${difficulty} level illustration, ${composition}`;
  }

  /**
   * Compose quality enhancement with cultural sensitivity
   */
  private static composeQualityEnhancement(userInfo: UserInfo, culturalProfile: CulturalVisualProfile): string {
    const baseQuality = this.getQualityEnhancementTerms(userInfo);
    const negativePrompt = this.generateCulturalNegativePrompt(userInfo);
    
    return `${baseQuality}, positive cultural representation, respectful authentic portrayal`;
  }

  /**
   * Context-aware style selection based on story elements
   */
  static selectDynamicStyle(
    storyText: string,
    userInfo: UserInfo,
    pageNumber: number,
    totalPages: number
  ): string {
    const emotionalContext = this.analyzeEmotionalContent(storyText);
    
    // Use proper difficulty level mapping
    const difficulty = DifficultyLevelMapper.normalizeLevel(
      userInfo.readingLevel || userInfo.difficultyLevel || 'easy'
    );
    
    // Adjust complexity based on story progression
    const progressionFactor = pageNumber / totalPages;
    
    // Increase visual complexity in later pages for advanced readers
    if (difficulty === 'expert' && progressionFactor > 0.7) {
      return `${difficulty} level illustration, ${emotionalContext.compositionStyle}, increasingly sophisticated visual storytelling`;
    }
    
    return this.composeStyleFramework(difficulty, emotionalContext);
  }
}