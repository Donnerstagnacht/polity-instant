import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from './locales';

/**
 * Detect the browser's preferred language.
 * Maps 'de' variants to 'de', everything else to 'en'.
 */
function detectBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en';
  const browserLang = navigator.language || '';
  return browserLang.startsWith('de') ? 'de' : 'en';
}

// Get initial language from localStorage (Zustand store), falling back to browser language
const getInitialLanguage = (): string => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'en';
  }

  try {
    const stored = localStorage.getItem('language-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only trust stored language if Zustand persist version matches current (1).
      // Old entries (version 0 or missing) contain the hardcoded 'en' default,
      // not the user's browser language — fall through to detection.
      if (parsed.version === 1 && parsed.state?.language) {
        return parsed.state.language;
      }
    }
  } catch (error) {
    console.error('Error reading language from localStorage:', error);
  }
  return detectBrowserLanguage();
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
