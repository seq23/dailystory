// Centralized Application Configuration
// Single source of truth for all app settings

export interface AppConfig {
  images: {
    defaultProvider: 'runware' | 'dalle';
    fallbackProvider: 'openai' | 'dalle';
    runware: {
      model: string;
      width: number;
      height: number;
      outputFormat: string;
      steps: number;
      CFGScale: number;
    };
    dalle: {
      model: string;
      size: string;
      quality: string;
    };
    fallbackSettings: {
      enabled: boolean;
      retryDelay: number;
      providerPriority: string[];
    };
  };
  stories: {
    maxRetries: number;
    timeoutMs: number;
    fallbackEnabled: boolean;
  };
  supabase: {
    projectUrl: string;
    anonKey: string;
  };
  features: {
    comprehension: {
      inlineChecksEnabled: boolean;
      inlineCheckEveryNPages: number;
      minLevelForFullQuiz: 'medium' | 'hard' | 'expert';
    };
    postSessionActivities: {
      enabled: boolean;
    };
    resumeOnRefresh: {
      premium: boolean;
      guest: boolean;
      allowUrlOverride: boolean;
    };
    authorVoice: {
      deepeningEnabled: boolean;
      applyOn: { first: 'opening' | 'transition' | 'closing'; middle: 'opening' | 'transition' | 'closing'; last: 'opening' | 'transition' | 'closing' };
      grammarTweaks: { theyAgreement: boolean };
      placeholderTweaks: { pluralAnimalDetection: boolean; pancakesPluralPreference: boolean };
    };
    aiImageEnhancement: {
      enabled: boolean;
      costTrackingEnabled: boolean;
      maxDailyCostUSD: number;
      enhanceOnlyWhenNeeded: boolean;
    };
  };
}

export const APP_CONFIG: AppConfig = {
  images: {
    defaultProvider: 'runware',
    fallbackProvider: 'openai',
    runware: {
      model: 'runware:100@1',
      width: 1024,
      height: 1024,
      outputFormat: 'WEBP',
      steps: 3,
      CFGScale: 1.5
    },
    dalle: {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard'
    },
    fallbackSettings: {
      enabled: true,
      retryDelay: 1000,
      providerPriority: ['runware', 'openai']
    }
  },
  stories: {
    maxRetries: 3,
    timeoutMs: 30000,
    fallbackEnabled: true
  },
  supabase: {
    projectUrl: 'https://cpzeuogomaixamrtnnmj.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino'
  },
  features: {
    comprehension: {
      inlineChecksEnabled: false,
      inlineCheckEveryNPages: 3,
      minLevelForFullQuiz: 'medium'
    },
    postSessionActivities: {
      enabled: true
    },
    resumeOnRefresh: {
      premium: false,
      guest: false,
      allowUrlOverride: true
    },
    authorVoice: {
      deepeningEnabled: true,
      applyOn: { first: 'opening', middle: 'transition', last: 'closing' },
      grammarTweaks: { theyAgreement: true },
      placeholderTweaks: { pluralAnimalDetection: true, pancakesPluralPreference: true }
    },
    aiImageEnhancement: {
      enabled: true,
      costTrackingEnabled: true,
      maxDailyCostUSD: 0.50,
      enhanceOnlyWhenNeeded: true
    }
  }
};

// Style framework by difficulty level - Synchronized with backend
export const DIFFICULTY_STYLE_MAPPING = {
  'beginner': {
    // Level 0 - Pre-reader
    name: 'High-Quality 3D Children\'s Art',
    artStyle: 'High-quality 3D-rendered digital illustration with cartoon aesthetics (NO TEXT)',
    colorPalette: 'Bright, cheerful colors with blue/turquoise dominant tones',
    lighting: 'Natural daylight with soft shadows and highlights',
    texture: 'Smooth, polished surfaces with subtle material definition',
    composition: 'Clear, focused composition with appealing depth',
    quality: 'Premium children\'s book illustration with depth and dimension',
    
    // Prompt components
    prompt: '3D children\'s book art, bright colors, smooth rendering, cheerful',
    complexity: 'standard',
    colorPaletteKey: 'bright_vibrant',
    detailLevel: 'high',
    rendering: '3d_smooth',
    brandSuffix: 'children\'s book illustration, warm earth tones, diverse inclusive characters, professional artwork'
  },
  'easy': {
    // Level 1 - Beginner (identical to Level 0)
    name: 'High-Quality 3D Children\'s Art',
    artStyle: 'High-quality 3D-rendered digital illustration with cartoon aesthetics (NO TEXT)',
    colorPalette: 'Bright, cheerful colors with blue/turquoise dominant tones',
    lighting: 'Natural daylight with soft shadows and highlights',
    texture: 'Smooth, polished surfaces with subtle material definition',
    composition: 'Clear, focused composition with appealing depth',
    quality: 'Premium children\'s book illustration with depth and dimension',
    
    // Prompt components
    prompt: '3D children\'s book art, bright colors, smooth rendering, cheerful',
    complexity: 'standard',
    colorPaletteKey: 'bright_vibrant',
    detailLevel: 'high',
    rendering: '3d_smooth',
    brandSuffix: 'children\'s book illustration, warm earth tones, diverse inclusive characters, professional artwork'
  },
  'medium': {
    // Level 2 - Developing
    name: 'Digital Painterly Illustration',
    artStyle: 'Digital illustration with painterly qualities, soft brush strokes',
    colorPalette: 'Warm, muted tones with soft pastels',
    lighting: 'Gentle, diffused natural lighting with subtle rim lighting',
    texture: 'Smooth gradients with subtle texture overlay',
    composition: 'Clean, focused composition with depth of field',
    quality: 'Professional children\'s book illustration standard',
    
    // Prompt components
    prompt: 'children\'s book illustration, soft pastels, warm lighting, digital art',
    complexity: 'minimal',
    colorPaletteKey: 'warm_pastels',
    detailLevel: 'medium',
    rendering: 'painterly',
    brandSuffix: 'children\'s book illustration, warm colors, safe wholesome content'
  },
  'hard': {
    // Level 3 - Sophisticated
    name: 'Sophisticated 2D Digital Art',
    artStyle: '2D digital illustration (sophisticated artistic style)',
    colorPalette: 'Nuanced color gradients, artistic palette',
    lighting: 'Advanced lighting with sophisticated shadows and highlights',
    texture: 'Refined digital textures with artistic depth',
    composition: 'Sophisticated artistic composition with visual hierarchy',
    quality: 'Sophisticated artistic children\'s book illustration',
    
    // Prompt components
    prompt: '2D digital illustration (sophisticated artistic style), nuanced color gradients, artistic palette, highly detailed, advanced digital painting techniques',
    complexity: 'high',
    colorPaletteKey: 'nuanced_artistic',
    detailLevel: 'highly detailed',
    rendering: 'advanced_digital_painting',
    brandSuffix: 'artistic children\'s book illustration, refined quality, diverse representation'
  },
  'expert': {
    // Level 4 - Masterful
    name: 'Masterful 2D Digital Art',
    artStyle: '2D digital illustration (masterful artistic technique)',
    colorPalette: 'Complex color theory, professional artist palette',
    lighting: 'Complex artistic lighting with intricate shadow work',
    texture: 'Intricate artistic textures with masterful detail',
    composition: 'Masterful artistic composition with complex visual storytelling',
    quality: 'Masterful children\'s book art with diverse representation',
    
    // Prompt components
    prompt: '2D digital illustration (masterful artistic technique), complex color theory, intricate details',
    complexity: 'very_high',
    colorPaletteKey: 'complex_professional',
    detailLevel: 'intricate and complex',
    rendering: 'masterful_artistic_technique',
    brandSuffix: 'masterful children\'s book art, sophisticated quality, diverse representation'
  }
} as const;

export const IMAGE_STYLES = {
  'children-book-illustration': 'quality, professional artwork, children\'s book illustration, vibrant colors, friendly atmosphere',
  'illustrated-artwork': 'detailed illustrated artwork, vibrant and engaging, storybook style', 
  'watercolor': 'soft watercolor painting, gentle and artistic',
  'digital-art': 'high-quality digital art, detailed and polished'
} as const;

export type ImageStyle = keyof typeof IMAGE_STYLES;