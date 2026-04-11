import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'de';

/**
 * Detect the browser's preferred language.
 * Maps 'de' variants to 'de', everything else to 'en'.
 * Only English and German translations exist — extendable by adding to this mapping.
 */
function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  const browserLang = navigator.language || '';
  console.log('Detected browser language:', browserLang);
  return browserLang.startsWith('de') ? 'de' : 'en';
}

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    set => ({
      language: detectBrowserLanguage(),
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: 'language-storage',
      version: 1,
      migrate: () => ({
        language: detectBrowserLanguage(),
      }),
    }
  )
);
