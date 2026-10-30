import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';
import esTranslations from './locales/es.json';
import zhTranslations from './locales/zh.json';
import hiTranslations from './locales/hi.json';
import ptTranslations from './locales/pt.json';
import frTranslations from './locales/fr.json';
import urTranslations from './locales/ur.json';

const resources = {
  en: { translation: enTranslations },
  ar: { translation: arTranslations },
  es: { translation: esTranslations },
  zh: { translation: zhTranslations },
  hi: { translation: hiTranslations },
  pt: { translation: ptTranslations },
  fr: { translation: frTranslations },
  ur: { translation: urTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
      prefix: '{{',
      suffix: '}}',
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
    },
    load: 'languageOnly',
    cleanCode: true,
    keySeparator: '.',
    nsSeparator: false,
    react: {
      useSuspense: false, // Prevent rendering issues with async translations
    },
  });

// Apply on startup as well as changes, including regional language tags.
export function applyDocumentLanguage(lng: string): void {
  const language = lng.toLowerCase().split(/[-_]/)[0];
  document.documentElement.dir = language === 'ar' || language === 'ur' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  document.body.className = document.body.className.replace(/\blang-\w+\b/g, '');
  document.body.classList.add(`lang-${language}`);
}
i18n.on('languageChanged', applyDocumentLanguage);
applyDocumentLanguage(i18n.resolvedLanguage || i18n.language || 'en');

export default i18n;