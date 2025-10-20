import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePage, Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { iconMapper } from '@/lib/iconMapper';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n'; // Import useTranslation

interface MenuItem {
  id: number;
  title: string;
  route: string | null;
  icon: string;
  children?: MenuItem[];
}

interface RenderMenuProps {
  items: MenuItem[];
  level?: number;
  openMenus: Record<number, boolean>;
  toggleMenu: (id: number) => void;
}

function RenderMenu({ items, level = 0, openMenus, toggleMenu }: RenderMenuProps) {
  const { url: currentUrl } = usePage();
  const { t } = useTranslation(); // Use the translation hook

  if (!Array.isArray(items)) return null;

  return (
    <>
      {items.map((menu) => {
        if (!menu) return null;
        const Icon = iconMapper(menu.icon || 'Folder') as LucideIcon;
        const children = Array.isArray(menu.children) ? menu.children.filter(Boolean) : [];
        const hasChildren = children.length > 0;
        const isActive = menu.route && currentUrl.startsWith(menu.route);
        const indentClass = level > 0 ? `pl-${4 + level * 3}` : '';

        const activeClass = isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';

        if (!menu.route && !hasChildren) return null;

        return (
          <SidebarMenuItem key={menu.id}>
            {hasChildren ? (
              <>
                <SidebarMenuButton
                  onClick={() => toggleMenu(menu.id)}
                  className={cn(
                    `group flex items-center justify-between rounded-md cursor-pointer transition-colors ${indentClass}`,
                    activeClass,
                    level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3'
                  )}
                >
                  <div className="flex items-center">
                    <Icon className="size-4 mr-3 opacity-80 group-hover:opacity-100" />
                    <span>{t(menu.title)}</span> {/* Translate menu title */}
                  </div>
                  <ChevronDown
                    className={cn(
                      'size-4 opacity-50 transition-transform duration-200',
                      openMenus[menu.id] ? 'rotate-180' : 'rotate-0'
                    )}
                  />
                </SidebarMenuButton>

                {/* submenu collapsible */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    openMenus[menu.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <SidebarMenu className="ml-2 border-l border-muted pl-2">
                    <RenderMenu items={children} level={level + 1} openMenus={openMenus} toggleMenu={toggleMenu} />
                  </SidebarMenu>
                </div>
              </>
            ) : (
              <SidebarMenuButton
                asChild
                className={cn(
                  `group flex items-center rounded-md transition-colors ${indentClass}`,
                  activeClass,
                  level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3'
                )}
              >
                <Link href={menu.route || '#'}>
                  <Icon className="size-4 mr-3 opacity-80 group-hover:opacity-100" />
                  <span>{t(menu.title)}</span> {/* Translate menu title */}
                  {level > 0 && (
                    <ChevronRight className="ml-auto size-4 opacity-0 group-hover:opacity-50" />
                  )}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

export function AppSidebar() {
  const { menus = [] } = usePage().props as { menus?: MenuItem[] };
  const { t } = useTranslation(); // Use the translation hook
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  // Function to toggle menu expansion
  const toggleMenu = useCallback((id: number) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Log untuk memeriksa prop menus
  console.log('AppSidebar received menus:', menus);

  const footerNavItems = [
    {
      title: t('Creator By Ahmad Ghozali'), // Translate footer item title
      url: 'https://github.com/ghozali25/Laravel-12-Starterkit',
      icon: iconMapper('Star') as LucideIcon,
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <SidebarHeader className="px-4 py-3 border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          <RenderMenu items={menus} openMenus={openMenus} toggleMenu={toggleMenu} />
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t">
        <NavUser />
        <NavFooter items={footerNavItems} className="justify-center gap-4" />
      </SidebarFooter>
    </Sidebar>
  );
}