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
  const legendColor = (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))
    ? '#ffffff'
    : '#111827';

  const LegendContent = ({ payload }: { payload?: any[] }) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', fontSize: 10, color: legendColor }}>
      {(payload || []).map((entry: any, index: number) => (
        <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: entry.color || 'var(--primary)', borderRadius: 9999 }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );

  // Filter out future dates (only show up to today)
  const todayStr = typeof window !== 'undefined' ? new Date().toISOString().slice(0, 10) : undefined;
  const filteredData = Array.isArray(data)
    ? (todayStr ? data.filter((d) => d.date <= todayStr) : data)
    : [];

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
          <BarChart data={filteredData} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend content={<LegendContent />} align="center" verticalAlign="top" />
            <Bar dataKey="open" stackId="tickets" fill={"color-mix(in srgb, var(--color-primary, var(--primary)) 95%, white 5%)"} legendType="circle" radius={[4,4,0,0]} />
            <Bar dataKey="in_progress" stackId="tickets" fill={"color-mix(in srgb, var(--color-primary, var(--primary)) 75%, white 25%)"} legendType="circle" radius={[4,4,0,0]} />
            <Bar dataKey="resolved" stackId="tickets" fill={"color-mix(in srgb, var(--color-primary, var(--primary)) 55%, white 45%)"} legendType="circle" radius={[4,4,0,0]} />
            <Bar dataKey="closed" stackId="tickets" fill={"color-mix(in srgb, var(--color-primary, var(--primary)) 40%, white 60%)"} legendType="circle" radius={[4,4,0,0]} />
            <Bar dataKey="cancelled" stackId="tickets" fill={"color-mix(in srgb, var(--color-primary, var(--primary)) 25%, white 75%)"} legendType="circle" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
