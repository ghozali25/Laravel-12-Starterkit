import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import AppearanceDropdown from '@/components/appearance-dropdown';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
  const [lang, setLang] = useState('id');
  const page = usePage<SharedData>();
  const { auth } = page.props;

  return (
    <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between px-6 md:px-4 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {/* Left: Sidebar + Breadcrumb */}
      <div className="flex items-center gap-2 w-1/3">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      {/* Center: Greeting */}
      <div className="flex justify-center items-center w-1/3">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 text-center truncate">
          Hallo, Welcome {auth.user.name} 👋
        </span>
      </div>

      {/* Right: Language + Theme */}
      <div className="flex items-center justify-end gap-4 w-1/3">
        {/*<Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
           } <SelectItem value="id">🇮🇩 Bahasa</SelectItem>
            <SelectItem value="en">🇺🇸 English</SelectItem>*
          </SelectContent>
        </Select>*/}

        <AppearanceDropdown />
      </div>
    </header>
  );
}
