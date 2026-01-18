import { useLanguageStore, type Language } from '@/global-state/language.store';
import enTranslation from '@/i18n/locales/en/enTranslation';
import deTranslation from '@/i18n/locales/de/deTranslation';
import i18n from '@/i18n/i18n';
import { useEffect } from 'react';

const translations = {
  en: enTranslation,
  de: deTranslation,
};

function getNestedValue(obj: any, path: string): any {
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

  // Return the value as-is (string, array, object, etc.)
  return current !== undefined ? current : path;
}

/**
 * Interpolate variables into a translation string.
 * Supports {{variable}} syntax for placeholders.
 */
function interpolate(template: string, params?: Record<string, string | number | undefined | null>): string {
  if (!params) return template;
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

export function useTranslation() {
  const { language, setLanguage } = useLanguageStore();

  // Sync custom language store with i18next
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  /**
   * Translate a key to the current language.
   * @param key - The translation key (dot-separated path)
   * @param paramsOrFallback - Either interpolation params object or a fallback string
   * @param fallback - Optional fallback string when params are provided
   */
  const t = (
    key: string, 
    paramsOrFallback?: string | Record<string, string | number | undefined | null>,
    fallback?: string
  ): any => {
    const translation = getNestedValue(translations[language], key);
    
    // Determine if second argument is params object or fallback string
    const isParams = typeof paramsOrFallback === 'object' && paramsOrFallback !== null;
    const params = isParams ? paramsOrFallback : undefined;
    const finalFallback = isParams ? fallback : (paramsOrFallback as string | undefined);
    
    const result = translation !== key ? translation : finalFallback || key;
    
    // Only interpolate if the result is a string
    if (typeof result === 'string') {
      return interpolate(result, params);
    }
    
    return result;
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
