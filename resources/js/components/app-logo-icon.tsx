import { usePage } from '@inertiajs/react';
import type { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
  const setting = usePage().props.setting as {
    logo?: string;
  } | null;

  const defaultPublicLogoPath = '/logo.svg'; // Path to a logo in the public folder

  // Prioritize logo from settings
  if (setting?.logo) {
    return (
      <img
        src={`/storage/${setting.logo}`}
        alt="App Logo"
        className={cn("object-contain", props.className)}
      />
    );
  }

  // If no logo is set in app settings, use the default public logo.
  // If this file doesn't exist, the browser will show a broken image icon.
  return (
    <img
      src={defaultPublicLogoPath}
      alt="App Logo"
      className={cn("object-contain", props.className)}
    />
  );
}