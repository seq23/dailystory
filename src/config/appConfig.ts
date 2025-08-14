// Centralized Application Configuration
// Single source of truth for all app settings

export interface AppConfig {
  images: {
    defaultProvider: 'runware' | 'dalle';
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
  };
}

export const APP_CONFIG: AppConfig = {
  images: {
    defaultProvider: 'runware',
    runware: {
      model: 'runware:100@1',
      width: 1024,
      height: 1024,
      outputFormat: 'WEBP',
      steps: 6,
      CFGScale: 3
    },
    dalle: {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard'
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
    }
  }
};

// Style framework by difficulty level - Phase 1 Implementation
export const DIFFICULTY_STYLE_MAPPING = {
  'beginner': {
    name: 'Simple & Warm',
    prompt: 'simple children\'s book illustration with bold, clear shapes and bright, warm colors. Minimal details, large friendly elements, very safe and comforting visual style',
    complexity: 'low',
    colorPalette: 'primary colors, high contrast',
    detailLevel: 'minimal'
  },
  'easy': {
    name: 'Playful & Colorful', 
    prompt: 'cheerful children\'s book illustration with playful characters and vibrant, engaging colors. Moderate detail level with clear visual storytelling',
    complexity: 'moderate',
    colorPalette: 'bright rainbow colors, cheerful tones',
    detailLevel: 'moderate'
  },
  'medium': {
    name: 'Rich & Engaging',
    prompt: 'professional children\'s book illustration with rich colors, engaging characters, and good detail balance. Sophisticated but age-appropriate artistic style',
    complexity: 'balanced',
    colorPalette: 'rich harmonious colors, sophisticated palette',
    detailLevel: 'detailed'
  },
  'hard': {
    name: 'Artistic & Sophisticated',
    prompt: 'high-quality artistic illustration with sophisticated composition, nuanced colors, and rich environmental details. Advanced visual storytelling techniques',
    complexity: 'high',
    colorPalette: 'nuanced color gradients, artistic palette',
    detailLevel: 'highly detailed'
  },
  'expert': {
    name: 'Masterful & Complex',
    prompt: 'masterful illustration with complex artistic techniques, sophisticated lighting, intricate details, and advanced composition. Museum-quality children\'s art',
    complexity: 'very high',
    colorPalette: 'complex color theory, professional artist palette',
    detailLevel: 'intricate and complex'
  }
} as const;

export const IMAGE_STYLES = {
  'children-book-illustration': 'professional children\'s book illustration, vibrant colors, friendly atmosphere',
  'cartoon': 'colorful cartoon style, playful and engaging', 
  'watercolor': 'soft watercolor painting, gentle and artistic',
  'digital-art': 'high-quality digital art, detailed and polished'
} as const;

export type ImageStyle = keyof typeof IMAGE_STYLES;