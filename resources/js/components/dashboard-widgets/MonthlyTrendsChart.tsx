import React from 'react';
import { Line, LineChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper
import { useAppearance } from '@/hooks/use-appearance';

export interface MonthlyTrendsChartProps {
  data: { [key: string]: any }[]; // Make data more generic
  xAxisDataKey?: string; // New prop for dynamic X-axis
  yAxisDataKey1?: string; // New prop for dynamic Y-axis 1
  yAxisDataKey2?: string; // New prop for dynamic Y-axis 2
  iconName?: string; // New prop for icon
}

export default function MonthlyTrendsChart({ data, xAxisDataKey = 'name', yAxisDataKey1 = 'Users', yAxisDataKey2 = 'Backups', iconName }: MonthlyTrendsChartProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;
  const { appearance } = useAppearance();
  const isDark = appearance === 'dark';
  const axisColor = isDark ? '#cbd5e1' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const legendColor = isDark ? '#ffffff' : '#111827';

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

  return (
    <Card className="bg-white dark:!bg-[#0b1437] shadow-sm rounded-2xl overflow-hidden h-full border border-gray-100 dark:!border-[#1a2541] group hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          {t('Monthly Trends')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] sm:h-[280px] md:h-[320px] min-w-0 bg-white dark:!bg-[#0b1437]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={xAxisDataKey} stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} />
            <YAxis stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} width={30} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#0b1437' : '#ffffff', borderColor: isDark ? '#1a2541' : '#e5e7eb' }} labelStyle={{ color: isDark ? '#e5e7eb' : '#111827' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} content={<LegendContent />} align="center" verticalAlign="top" />
            <Line type="monotone" dataKey={yAxisDataKey1} stroke="var(--color-primary, var(--primary))" strokeWidth={2} />
            <Line type="monotone" dataKey={yAxisDataKey2} stroke="var(--color-primary, var(--primary))" strokeOpacity={0.6} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}