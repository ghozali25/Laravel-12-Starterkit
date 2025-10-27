import type { LucideIcon } from 'lucide-react';
import { icons } from '@/lib/icon-list';
import { horizonIcons } from '@/lib/icon-list-horizon';
import { LayoutGrid } from 'lucide-react';

// Build lucide map
const lucideMap = icons.reduce((acc, curr) => {
  acc[curr.name] = curr.icon as unknown as LucideIcon;
  return acc;
}, {} as Record<string, LucideIcon>);

// Build horizon map
const horizonMap = horizonIcons.reduce((acc, curr) => {
  acc[curr.name] = curr.icon as unknown as LucideIcon;
  return acc;
}, {} as Record<string, LucideIcon>);

export function iconMapper(name?: string): LucideIcon {
  if (!name) return LayoutGrid;

  const formatted = name.charAt(0).toUpperCase() + name.slice(1); // e.g. user → User
  // Prefer Horizon icon if available, fallback to Lucide, then LayoutGrid
  return horizonMap[formatted] || lucideMap[formatted] || LayoutGrid;
}
