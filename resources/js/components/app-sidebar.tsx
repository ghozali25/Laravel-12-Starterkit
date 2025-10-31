import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePage, Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { iconMapper } from '@/lib/iconMapper';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

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

interface RenderMenuPropsExtended extends RenderMenuProps {
  onExpandRequest?: (menuId: number) => void;
}

function RenderMenu({ items, level = 0, openMenus, toggleMenu, onExpandRequest }: RenderMenuPropsExtended) {
  const { url: currentUrl } = usePage();
  const { t } = useTranslation();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;

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
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';

        if (!menu.route && !hasChildren) return null;

        return (
          <SidebarMenuItem key={menu.id}>
            {hasChildren ? (
              <>
                <SidebarMenuButton
                  onClick={() => {
                    if (isCollapsed && onExpandRequest) {
                      // Request sidebar expand and defer submenu opening
                      onExpandRequest(menu.id);
                    } else {
                      toggleMenu(menu.id);
                    }
                  }}
                  tooltip={t(menu.title)}
                  className={cn(
                    `group flex items-center justify-between rounded-md cursor-pointer transition-colors ${indentClass}`,
                    activeClass,
                    level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3'
                  )}
                >
                  <div className="flex items-center w-full">
                    <Icon className="size-4 opacity-80 group-hover:opacity-100" />
                    <span className="ml-3 group-data-[collapsible=icon]:hidden">{t(menu.title)}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'size-4 opacity-50 transition-transform duration-200 group-data-[collapsible=icon]:hidden',
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
                    <RenderMenu items={children} level={level + 1} openMenus={openMenus} toggleMenu={toggleMenu} onExpandRequest={onExpandRequest} />
                  </SidebarMenu>
                </div>
              </>
            ) : (
              <SidebarMenuButton
                asChild
                tooltip={t(menu.title)}
                className={cn(
                  `group flex items-center rounded-md transition-colors ${indentClass}`,
                  activeClass,
                  level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3'
                )}
              >
                <Link href={menu.route || '#'} className="flex items-center w-full">
                  <Icon className="size-4 opacity-80 group-hover:opacity-100" />
                  <span className="ml-3 group-data-[collapsible=icon]:hidden">{t(menu.title)}</span>
                  {level > 0 && (
                    <ChevronRight className="ml-auto size-4 opacity-0 group-hover:opacity-50 group-data-[collapsible=icon]:hidden" />
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
  const { t } = useTranslation();
  const { state, setOpen } = useSidebar();
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});
  const [pendingMenuId, setPendingMenuId] = useState<number | null>(null);

  const toggleMenu = useCallback((id: number) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Auto-open submenu after sidebar expands
  useEffect(() => {
    if (state === 'expanded' && pendingMenuId !== null) {
      setTimeout(() => {
        setOpenMenus((prev) => ({ ...prev, [pendingMenuId]: true }));
        setPendingMenuId(null);
      }, 100);
    }
  }, [state, pendingMenuId]);

  const footerNavItems = [
    {
      title: t('Creator By Ahmad Ghozali'),
      url: 'https://github.com/ghozali25/Laravel-12-Starterkit',
      icon: iconMapper('Star') as LucideIcon,
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="px-4 py-3 border-b group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent justify-center data-[collapsible=icon]:px-0"
            >
              <Link href="/dashboard" prefetch className="flex w-full items-center justify-center">
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          <RenderMenu 
            items={menus} 
            openMenus={openMenus} 
            toggleMenu={toggleMenu}
            onExpandRequest={(menuId) => {
              setOpen(true);
              setPendingMenuId(menuId);
            }}
          />
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t">
        <NavUser />
        <NavFooter items={footerNavItems} className="justify-center gap-4" />
      </SidebarFooter>
    </Sidebar>
  );
}