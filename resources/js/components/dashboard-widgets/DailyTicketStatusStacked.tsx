import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper';

export interface DailyTicketStatusStackedProps {
  data: Array<{ date: string; day: number; open: number; in_progress: number; resolved: number; closed: number; cancelled: number }>;
  title?: string;
  iconName?: string;
}

export default function DailyTicketStatusStacked({ data, title, iconName }: DailyTicketStatusStackedProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          {title ?? t('Daily Ticket Status (This Month)')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Bar dataKey="open" stackId="tickets" fill="#ef4444" radius={[4,4,0,0]} />
            <Bar dataKey="in_progress" stackId="tickets" fill="#f97316" radius={[4,4,0,0]} />
            <Bar dataKey="resolved" stackId="tickets" fill="#22c55e" radius={[4,4,0,0]} />
            <Bar dataKey="closed" stackId="tickets" fill="#6b7280" radius={[4,4,0,0]} />
            <Bar dataKey="cancelled" stackId="tickets" fill="#9ca3af" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
