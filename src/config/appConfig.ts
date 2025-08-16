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

// Style framework by difficulty level - Phase 1 Implementation
export const DIFFICULTY_STYLE_MAPPING = {
  'beginner': {
    name: 'Playful & Colorful',
    prompt: '3D children\'s book art, bright colors, smooth rendering, cheerful',
    complexity: 'standard',
    colorPalette: 'bright_vibrant',
    detailLevel: 'high',
    rendering: '3d_smooth',
    brandSuffix: 'children\'s book illustration, warm earth tones, diverse inclusive characters, professional artwork'
  },
  'easy': {
    name: 'Playful & Colorful', 
    prompt: '3D children\'s book art, bright colors, smooth rendering, cheerful',
    complexity: 'standard',
    colorPalette: 'bright_vibrant',
    detailLevel: 'high',
    rendering: '3d_smooth',
    brandSuffix: 'children\'s book illustration, warm earth tones, diverse inclusive characters, professional artwork'
  },
  'medium': {
    name: 'Rich & Engaging',
    prompt: 'children\'s book illustration, soft pastels, warm lighting, digital art',
    complexity: 'minimal',
    colorPalette: 'warm_pastels',
    detailLevel: 'medium',
    rendering: 'painterly',
    brandSuffix: 'children\'s book illustration, warm colors, safe wholesome content'
  },
  'hard': {
    name: 'Artistic & Sophisticated',
    prompt: '2D digital illustration (sophisticated artistic style)',
    complexity: 'high',
    colorPalette: 'nuanced color gradients, artistic palette',
    detailLevel: 'highly detailed',
    rendering: 'Advanced digital painting techniques with nuanced lighting, refined textures, and sophisticated color blending',
    brandSuffix: 'artistic children\'s book illustration, refined quality, inclusive'
  },
  'expert': {
    name: 'Masterful & Complex',
    prompt: '2D digital illustration (masterful artistic technique)',
    complexity: 'very high',
    colorPalette: 'complex color theory, professional artist palette',
    detailLevel: 'intricate and complex',
    rendering: 'Complex artistic techniques with intricate details, sophisticated lighting systems, and advanced composition methods',
    brandSuffix: 'masterful children\'s book art, sophisticated quality, diverse representation'
  }
} as const;

export const IMAGE_STYLES = {
  'children-book-illustration': 'professional children\'s book illustration, vibrant colors, friendly atmosphere',
  'cartoon': 'colorful cartoon style, playful and engaging', 
  'watercolor': 'soft watercolor painting, gentle and artistic',
  'digital-art': 'high-quality digital art, detailed and polished'
} as const;

export type ImageStyle = keyof typeof IMAGE_STYLES;