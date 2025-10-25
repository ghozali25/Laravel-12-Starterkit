import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid, Bar, BarChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper';

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

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          {title ?? t('Daily Activity (This Month)')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {hasBar ? (
            <BarChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xAxisDataKey} stroke="#6b7280" tickCount={data?.length ?? 31} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              {series.map((s) =>
                s.type === 'bar' ? (
                  <Bar key={s.key} dataKey={s.key} fill={s.color ?? '#3b82f6'} radius={[4, 4, 0, 0]} />
                ) : (
                  <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color ?? '#10b981'} dot={false} strokeWidth={2} />
                ),
              )}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xAxisDataKey} stroke="#6b7280" tickCount={data?.length ?? 31} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              {series.map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color ?? '#10b981'} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
