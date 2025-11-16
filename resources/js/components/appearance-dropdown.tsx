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
                <SelectTrigger className="w-[130px] h-9">
                    <SelectValue>
                        <span className="flex items-center gap-2 text-sm">
                            {current.icon}
                            <span>{current.label}</span>
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
