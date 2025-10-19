import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from './locales';

// Get initial language from localStorage (Zustand store)
const getInitialLanguage = (): string => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'en';
  }

  try {
    const stored = localStorage.getItem('language-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.language || 'en';
    }
  } catch (error) {
    console.error('Error reading language from localStorage:', error);
  }
  return 'en';
};

i18n
  // Erkennt die Sprachpräferenz des Browsers
  .use(LanguageDetector)
  // Integriert i18next mit React
  .use(initReactI18next)
  // Initialisiert i18next
  .init({
    resources,
    lng: getInitialLanguage(), // Use stored language as initial
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
