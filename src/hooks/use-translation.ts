import { useLanguageStore, type Language } from '@/global-state/language.store';
import enTranslation from '@/i18n/locales/en/enTranslation';
import deTranslation from '@/i18n/locales/de/deTranslation';

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

  const t = (key: string, fallback?: string): string => {
    const translation = getNestedValue(translations[language], key);
    return translation !== key ? translation : fallback || key;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
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
