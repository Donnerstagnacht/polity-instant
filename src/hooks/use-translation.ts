import { useLanguageStore, type Language } from '@/global-state/language.store';
import enTranslation from '@/i18n/locales/en/enTranslation';
import deTranslation from '@/i18n/locales/de/deTranslation';
import i18n from '@/i18n/i18n';
import { useEffect } from 'react';

const translations = {
  en: enTranslation,
  de: deTranslation,
};

function getNestedValue(obj: any, path: string): string {
  if (!path || !obj) return path;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return the original key if not found
    }
  }

  return typeof current === 'string' ? current : path;
}

export function useTranslation() {
  const { language, setLanguage } = useLanguageStore();

  // Sync custom language store with i18next
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const translation = getNestedValue(translations[language], key);
    return translation !== key ? translation : fallback || key;
  };

  const changeLanguage = async (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Also change i18next language
    await i18n.changeLanguage(newLanguage);
  };

  return {
    t,
    language,
    changeLanguage,
    i18n: {
      language,
      changeLanguage,
    },
  };
}
