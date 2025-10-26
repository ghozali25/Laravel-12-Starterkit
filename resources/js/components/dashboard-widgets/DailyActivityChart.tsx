import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid, Bar, BarChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper';
import { useAppearance } from '@/hooks/use-appearance';

export interface DailyActivityChartProps {
  data: Array<{ date: string; day: number; [key: string]: any }>;
  xAxisDataKey?: string; // default 'day'
  series?: Array<{ key: string; type?: 'line' | 'bar'; color?: string }>;
  title?: string;
  iconName?: string;
}

export default function DailyActivityChart({
  data,
  xAxisDataKey = 'day',
  series = [
    { key: 'Tickets', type: 'bar', color: '#3b82f6' },
    { key: 'Users', type: 'line', color: '#22c55e' },
    { key: 'Assets', type: 'line', color: '#a78bfa' },
    { key: 'Backups', type: 'line', color: '#f59e0b' },
  ],
  title,
  iconName,
}: DailyActivityChartProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;

  // Choose composite chart: bars for first series if type=bar then overlay lines
  const hasBar = series.some((s) => s.type === 'bar');

  const { appearance } = useAppearance();
  const isDark = appearance === 'dark';
  const axisColor = isDark ? '#cbd5e1' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const legendStyle = { fontSize: 10, color: isDark ? '#e5e7eb' : '#111827' } as const;

  return (
    <Card className="widget-card bg-white dark:!bg-[#0b1437] shadow-sm rounded-2xl overflow-hidden h-full border border-gray-100 dark:!border-[#1a2541] group hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2 bg-white dark:!bg-[#0b1437]">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          {title ?? t('Daily Activity (This Month)')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] sm:h-[280px] md:h-[320px] min-w-0 bg-white dark:!bg-[#0b1437]">
        <ResponsiveContainer width="100%" height="100%">
          {hasBar ? (
            <BarChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey={xAxisDataKey} stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} interval="preserveEnd" />
              <YAxis stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} width={30} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#0b1437' : '#ffffff', borderColor: isDark ? '#1a2541' : '#e5e7eb', color: legendStyle.color as string }} labelStyle={{ color: legendStyle.color as string }} />
              <Legend wrapperStyle={{ ...legendStyle, fontSize: '10px' }} />
              {series.map((s) =>
                s.type === 'bar' ? (
                  <Bar key={s.key} dataKey={s.key} fill={s.color ?? '#3b82f6'} radius={[4, 4, 0, 0]} />
                ) : (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stroke="var(--color-primary, var(--primary))"
                    strokeOpacity={s.key === 'Users' ? 0.9 : s.key === 'Assets' ? 0.6 : 0.5}
                    dot={false}
                    strokeWidth={2}
                  />
                ),
              )}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey={xAxisDataKey} stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} interval="preserveEnd" />
              <YAxis stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} width={30} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#0b1437' : '#ffffff', borderColor: isDark ? '#1a2541' : '#e5e7eb', color: legendStyle.color as string }} labelStyle={{ color: legendStyle.color as string }} />
              <Legend wrapperStyle={{ ...legendStyle, fontSize: '10px' }} />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke="var(--color-primary, var(--primary))"
                  strokeOpacity={s.key === 'Users' ? 0.9 : s.key === 'Assets' ? 0.6 : 0.5}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
