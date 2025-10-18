import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from './locales';

i18n
  // Detects the browser's language preference
  .use(LanguageDetector)
  // Integrates i18next with React
  .use(initReactI18next)
  // Initializes i18next
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React escapes values already
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
export type Language = 'en' | 'de';
