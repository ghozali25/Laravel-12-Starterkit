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
            <defs>
              <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.95} />
                <stop offset="100%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="gradInProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.35} />
              </linearGradient>
              <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.25} />
              </linearGradient>
              <linearGradient id="gradClosed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="gradCancelled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="open" stackId="tickets" fill="url(#gradOpen)" stroke="var(--color-primary, var(--primary))" radius={[4,4,0,0]} />
            <Bar dataKey="in_progress" stackId="tickets" fill="url(#gradInProgress)" stroke="var(--color-primary, var(--primary))" radius={[4,4,0,0]} />
            <Bar dataKey="resolved" stackId="tickets" fill="url(#gradResolved)" stroke="var(--color-primary, var(--primary))" radius={[4,4,0,0]} />
            <Bar dataKey="closed" stackId="tickets" fill="url(#gradClosed)" stroke="var(--color-primary, var(--primary))" radius={[4,4,0,0]} />
            <Bar dataKey="cancelled" stackId="tickets" fill="url(#gradCancelled)" stroke="var(--color-primary, var(--primary))" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
