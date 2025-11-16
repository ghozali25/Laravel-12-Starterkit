import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

const APPEARANCE_OPTIONS: { value: Appearance; label: string; icon: ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const current = APPEARANCE_OPTIONS.find((opt) => opt.value === appearance) ?? APPEARANCE_OPTIONS[0];

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9 rounded-md"
                        aria-label="Toggle theme"
                    >
                        {current.icon}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {APPEARANCE_OPTIONS.map((opt) => (
                        <DropdownMenuItem
                            key={opt.value}
                            onClick={() => updateAppearance(opt.value)}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                            {opt.icon}
                            <span>{opt.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
