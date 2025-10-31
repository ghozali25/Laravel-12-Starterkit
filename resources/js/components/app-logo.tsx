import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
  const setting = usePage().props.setting as {
    nama_app?: string;
    logo?: string;
  } | null;

  const defaultAppName = 'Your Company';
  const defaultLogo = '';

  const appName = setting?.nama_app || defaultAppName;
  const logo = setting?.logo || defaultLogo;

  return (
    <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:w-full">
      {logo ? (
        <div className="flex aspect-square size-8 items-center justify-center rounded-md group-data-[collapsible=icon]:mx-auto">
          <img
            src={`/storage/${logo}`}
            alt="Logo"
            className="h-6 w-6 object-contain"
          />
        </div>
      ) : (
        <div className="flex aspect-square size-8 items-center justify-center rounded-md group-data-[collapsible=icon]:mx-auto">
          <AppLogoIcon className="size-[1.375rem] fill-current text-black dark:text-white" />
        </div>
      )}
      <div className="grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
        <span className="mb-0.5 truncate leading-none font-semibold">
          {appName}
        </span>
      </div>
    </div>
  );
}

