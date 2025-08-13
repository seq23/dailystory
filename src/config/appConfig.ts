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

export const IMAGE_STYLES = {
  'children-book-illustration': 'professional children\'s book illustration, vibrant colors, friendly atmosphere',
  'cartoon': 'colorful cartoon style, playful and engaging',
  'watercolor': 'soft watercolor painting, gentle and artistic',
  'digital-art': 'high-quality digital art, detailed and polished'
} as const;

export type ImageStyle = keyof typeof IMAGE_STYLES;