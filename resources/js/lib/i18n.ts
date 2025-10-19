import { usePage } from '@inertiajs/react';
import React from 'react'; // Import React for useCallback

interface SharedProps {
  translations: Record<string, string>;
  locale: string;
  [key: string]: any;
}

export function useTranslation() {
  const { translations, locale } = usePage<SharedProps>().props;

  // Memoize the 't' function so it only changes when translations or locale change
  const t = React.useCallback((key: string): string => {
    return translations[key] || key;
  }, [translations, locale]); // Dependencies for useCallback

  return { t, locale };
}