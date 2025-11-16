import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import AppearanceDropdown from '@/components/appearance-dropdown';
import { usePage, router, Link } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n'; // Import useTranslation
import { Bell } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
  const { t, locale } = useTranslation(); // Use the translation hook
  const page = usePage<SharedData>();
  const { auth } = page.props;

  const notifications = (page.props as any).notifications as { unread_count: number; items: Array<{ id: string; data: any; created_at?: string; read_at?: string | null; }> } | undefined;

  const handleLanguageChange = (value: string) => {
    // Hanya panggil router.get jika locale berubah
    if (value !== locale) {
      router.get(route('language.set', value), {}, {
        preserveScroll: true,
        preserveState: false,
      });
    }
  };

  return (
    <header className="relative z-30 border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between px-4 md:px-4 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {/* Left: Sidebar + Breadcrumb */}
      <div className="flex items-center gap-2 w-auto md:w-1/3 flex-shrink-0">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      {/* Center: Greeting */}
      <div className="flex justify-center items-center flex-1 px-1">
        <span className="text-xs sm:text-sm md:text-base font-medium text-foreground text-center truncate">
          {t('Hello, Welcome')} {auth.user.name}
          <span className="ml-1 align-middle leading-none text-base md:text-lg lg:text-xl hidden xs:inline" role="img" aria-label="waving hand">
            👋
          </span>
        </span>
      </div>

      {/* Right: Language + Theme + Notifications */}
      <div className="flex items-center justify-end gap-2 sm:gap-4 w-auto md:w-1/3 flex-shrink-0 pr-1">
        <Select value={locale} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[110px] sm:w-[120px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">🇮🇩 {t('Bahasa')}</SelectItem>
            <SelectItem value="en">🇺🇸 {t('English')}</SelectItem>
          </SelectContent>
        </Select>

        <AppearanceDropdown />

        {/* Notifications Bell - moved to far right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative z-40 h-9 w-9">
              <Bell className="h-5 w-5" />
              {!!notifications?.unread_count && (
                <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] leading-4 text-white">
                  {notifications.unread_count > 99 ? '99+' : notifications.unread_count}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifikasi</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => router.post(route('notifications.readAll'))}
              >
                Tandai semua dibaca
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications?.items?.length ? (
              notifications.items.map((n) => (
                <DropdownMenuItem key={n.id} onSelect={(e) => e.preventDefault()} className="whitespace-normal focus:bg-transparent">
                  <Link
                    href={n.data?.url ?? '#'}
                    className="block w-full"
                    onClick={() => router.post(route('notifications.read', n.id))}
                  >
                    <div className="text-sm font-medium">Komentar baru pada ticket #{n.data?.ticket_number ?? n.data?.ticket_id}</div>
                    <div className="text-xs text-neutral-600 line-clamp-2">{n.data?.comment}</div>
                    <div className="text-[10px] text-neutral-500 mt-1">{n.created_at}</div>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-4 text-sm text-neutral-500">Tidak ada notifikasi</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}