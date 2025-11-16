import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

    const handleChange = (value: string) => {
        updateAppearance(value as Appearance);
    };

    return (
        <div className={className} {...props}>
            <Select value={appearance} onValueChange={handleChange}>
                <SelectTrigger className="w-[110px] sm:w-[120px]">
                    <SelectValue>
                        <span className="flex items-center gap-2 text-xs sm:text-sm">
                            {current.icon}
                            <span className="hidden xs:inline truncate max-w-[36px] sm:max-w-[64px]">
                                {current.label}
                            </span>
                        </span>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent align="end">
                    {APPEARANCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2 text-sm">
                                {opt.icon}
                                <span>{opt.label}</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
