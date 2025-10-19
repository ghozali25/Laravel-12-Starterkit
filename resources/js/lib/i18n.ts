import { usePage } from '@inertiajs/react';

interface SharedProps {
  translations: Record<string, string>;
  locale: string;
  [key: string]: any;
}

export function useTranslation() {
  const { translations, locale } = usePage<SharedProps>().props;

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return { t, locale };
}