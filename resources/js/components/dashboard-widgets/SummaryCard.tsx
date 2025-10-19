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
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-800 dark:text-white">{label}</CardTitle>
        {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />} {/* Render the icon component */}
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      </CardContent>
    </Card>
  );
}