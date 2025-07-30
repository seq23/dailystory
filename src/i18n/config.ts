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

const resources = {
  en: { translation: enTranslations },
  ar: { translation: arTranslations },
  es: { translation: esTranslations },
  zh: { translation: zhTranslations },
  hi: { translation: hiTranslations },
  pt: { translation: ptTranslations },
  fr: { translation: frTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Always start with English
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'], // Only check localStorage, don't auto-detect from browser
      caches: ['localStorage'],
    },
  });

export default i18n;