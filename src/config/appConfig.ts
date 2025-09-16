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
      steps: 25,
      CFGScale: 8
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

// Note: Style mapping moved to centralized server-side styleFrameworks.js
// Frontend now uses server-side style definitions for consistency
// All image generation flows use the centralized style framework