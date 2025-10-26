import React from 'react';
import { iconMapper } from '@/lib/iconMapper';

export interface SummaryCardProps {
  label: string;
  value: number;
  iconName?: string;
}

export default function SummaryCard({ label, value, iconName }: SummaryCardProps) {
  const IconComponent = iconName ? iconMapper(iconName) : null;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-4 gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {IconComponent && (
        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500 dark:text-gray-400 shrink-0" />
      )}
      <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight max-w-full px-2 line-clamp-2">
        {label}
      </h3>
      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}