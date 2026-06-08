/**
 * useLocale - React hook for language switching
 * 
 * Usage:
 *   import { useLocale } from '../lib/useLocale';
 *   const { locale, setLocale, t, isThai } = useLocale();
 * 
 * Or in client components:
 *   const { locale, setLocale, t } = useLocaleLocale();
 */

import { useState, useEffect, useCallback } from 'react';
import { t as translate, LOCALE_KEY, getSavedLocale, saveLocale, VALID_LOCALES } from './i18n';

export function useLocale() {
  const [locale, setLocaleState] = useState('th');
  const [isClient, setIsClient] = useState(false);

  // Initialize locale from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const saved = getSavedLocale();
    setLocaleState(saved);
  }, []);

  // Set locale and save to localStorage
  const setLocale = useCallback((newLocale) => {
    if (!VALID_LOCALES.includes(newLocale)) {
      console.warn('Invalid locale:', newLocale);
      return;
    }
    setLocaleState(newLocale);
    saveLocale(newLocale);
  }, []);

  // Translation function for current locale
  const t = useCallback((key) => {
    return translate(key, locale);
  }, [locale]);

  // Shorthand checks
  const isThai = locale === 'th';
  const isEn = locale === 'en';

  return {
    locale,
    setLocale,
    t,
    isThai,
    isEn,
    isClient
  };
}

// Export locale context for wrapping app
export const LocaleContext = null; // Placeholder for future Context API usage

export default useLocale;
