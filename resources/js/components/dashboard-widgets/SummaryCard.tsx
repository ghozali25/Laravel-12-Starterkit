import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper

export interface SummaryCardProps {
  label: string;
  value: number;
  iconName?: string; // Changed to string
}

export default function SummaryCard({ label, value, iconName }: SummaryCardProps) {
  const IconComponent = iconName ? iconMapper(iconName) : null; // Get the icon component

  return (
    <Card className="h-full border-0 shadow-none rounded-none bg-transparent">
      <CardHeader 
        className="!flex !flex-col !items-center !text-center px-3 py-2 sm:px-4 sm:py-3 !space-y-0 pb-2 !gap-1"
      >
        {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground shrink-0" />}
        <CardTitle 
          className="!text-xs sm:!text-sm font-medium text-gray-800 dark:text-white !text-center !leading-tight !w-full line-clamp-2"
        >
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-1 sm:px-4 sm:py-2 !text-center">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      </CardContent>
    </Card>
  );
}