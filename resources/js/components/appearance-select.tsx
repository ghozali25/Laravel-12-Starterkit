'use client';

import { useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppearanceDropdown() {
  const { appearance, updateAppearance } = useAppearance();

  const handleToggle = () => {
    const next = appearance === 'dark' ? 'light' : 'dark';
    updateAppearance(next);
  };

  const icon = appearance === 'dark'
    ? <Moon className="h-4 w-4 text-purple-400" />
    : <Sun className="h-4 w-4 text-yellow-400" />;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        'relative z-40 rounded-full border border-border/50 shadow-sm transition-colors',
      )}
      aria-label="Toggle theme"
    >
      {icon || <Monitor className="h-4 w-4" />}
    </Button>
  );
}
