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

// Update document direction and language attributes when language changes
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'ar' || lng === 'ur';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Apply language-specific font classes to body
  document.body.className = document.body.className.replace(/\blang-\w+\b/g, '');
  document.body.classList.add(`lang-${lng}`);
  
  // Note: Story content and navigation components can override RTL/LTR via CSS classes
  // This ensures global UI changes while preserving story display consistency
});

export default i18n;