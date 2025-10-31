import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import ImagePreviewDialog from '@/components/ImagePreviewDialog';
import { useState } from 'react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const [previewOpen, setPreviewOpen] = useState(false);

    return (
        <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group justify-center group-data-[collapsible=icon]:!w-auto">
                            <UserInfo user={auth.user} onAvatarClick={() => setPreviewOpen(true)} />
                            <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <UserMenuContent user={auth.user} onAvatarClick={() => setPreviewOpen(true)} />
                    </DropdownMenuContent>
                </DropdownMenu>
                <ImagePreviewDialog src={auth.user?.avatar_url ?? null} alt={auth.user?.name ?? 'avatar'} open={previewOpen} onOpenChange={setPreviewOpen} />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
