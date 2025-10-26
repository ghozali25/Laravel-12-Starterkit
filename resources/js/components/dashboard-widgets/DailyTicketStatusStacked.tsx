import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper';
import { useAppearance } from '@/hooks/use-appearance';

export interface DailyTicketStatusStackedProps {
  data: Array<{ date: string; day: number; open: number; in_progress: number; resolved: number; closed: number; cancelled: number }>;
  title?: string;
  iconName?: string;
}

export default function DailyTicketStatusStacked({ data, title, iconName }: DailyTicketStatusStackedProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;
  const { appearance } = useAppearance();
  const isDark = appearance === 'dark';
  const legendColor = isDark ? '#e5e7eb' : '#111827';
  const axisColor = isDark ? '#cbd5e1' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';

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

  const todayStr = typeof window !== 'undefined' ? new Date().toISOString().slice(0, 10) : undefined;
  const filteredData = Array.isArray(data)
    ? (todayStr ? data.filter((d) => d.date <= todayStr) : data)
    : [];

  const barEntries = [
    { key: 'open', color: '#327ae6ff' },
    { key: 'in_progress', color: '#fbbe4eff' },
    { key: 'resolved', color: '#34d399' },
  ];

  return (
    <Card className="bg-white dark:!bg-[#0b1437] shadow-sm rounded-2xl overflow-hidden h-full border border-gray-100 dark:!border-[#1a2541] group hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2 bg-white dark:!bg-[#0b1437]">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          {title ?? t('Daily Ticket Status (This Month)')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] sm:h-[280px] md:h-[320px] min-w-0 bg-white dark:!bg-[#0b1437]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 12, right: 4, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="day" stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} interval="preserveEnd" />
            <YAxis stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} width={30} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#0b1437' : '#ffffff', borderColor: isDark ? '#1a2541' : '#e5e7eb', color: legendColor }} labelStyle={{ color: legendColor }} />
            <Legend content={<LegendContent />} align="center" verticalAlign="top" wrapperStyle={{ fontSize: '10px' }} />
            {barEntries.map((entry) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                stackId="tickets"
                fill={entry.color}
                legendType="circle"
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
