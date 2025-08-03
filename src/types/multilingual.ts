export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ar' | 'zh' | 'hi' | 'pt';

export interface LanguageStoryConfig {
  language: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  enabled: boolean;
  templateSets: {
    easy: string[];
    medium: string[];
    hard: string[];
    expert: string[];
  };
  culturalAdaptations?: {
    characterNames?: string[];
    settings?: string[];
    activities?: string[];
  };
}

export interface MultilingualStoryRequest {
  userInfo: any;
  difficulty: string;
  storyLanguage: SupportedLanguage;
  pageCount?: number;
  translationContext?: {
    originalLanguage: SupportedLanguage;
    translatedInputs: Record<string, string>;
  };
}

export interface StoryGenerationContext {
  language: SupportedLanguage;
  culturalContext: string[];
  templatePreferences: string[];
  userNativeLanguage?: SupportedLanguage;
}