import React from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

export interface MonthlyActivityChartProps {
  data: { [key: string]: any }[];
  xAxisDataKey?: string;
  yAxisDataKey1?: string;
  yAxisDataKey2?: string;
  iconName?: string;
}

export default function MonthlyActivityChart({ data, xAxisDataKey = 'name', yAxisDataKey1 = 'Users', yAxisDataKey2 = 'Backups', iconName }: MonthlyActivityChartProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;

  const initialMode: 'total' | 'growth' = yAxisDataKey1 === 'UsersGrowth' ? 'growth' : 'total';
  const [mode, setMode] = React.useState<'total' | 'growth'>(initialMode);
  const canToggle = yAxisDataKey1 === 'Users' || yAxisDataKey1 === 'UsersGrowth';

  const processedData = mode === 'growth'
    ? (data || []).map((d, i, arr) => {
        const prev = i > 0 ? Number(arr[i - 1]['Users'] ?? 0) : 0;
        const curr = Number(d['Users'] ?? 0);
        return { ...d, UsersGrowth: curr - prev };
      })
    : data;

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

  const shortMonth = (label: any) => {
    const str = String(label ?? '');
    const [mon] = str.split(' ');
    return mon?.slice(0, 3) || str;
  };

  return (
    <Card className="bg-white dark:!bg-[#0b1437] shadow-sm rounded-2xl overflow-hidden h-full border border-gray-100 dark:!border-[#1a2541] group hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          {t('Monthly Activity')}
        </CardTitle>
        {canToggle && (
          <div className="flex items-center gap-1">
            <Button variant={mode === 'total' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('total')}>
              {t('Total')}
            </Button>
            <Button variant={mode === 'growth' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('growth')}>
              {t('Growth')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="h-[240px] sm:h-[280px] md:h-[320px] min-w-0 bg-white dark:!bg-[#0b1437]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 12, right: 4, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={xAxisDataKey} stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} interval="preserveEnd" tickFormatter={shortMonth} />
            <YAxis stroke={axisColor} tick={{ fontSize: 9, fill: axisColor }} width={30} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#0b1437' : '#ffffff', borderColor: isDark ? '#1a2541' : '#e5e7eb', color: legendColor }} labelStyle={{ color: legendColor }} />
            <Legend content={<LegendContent />} align="center" verticalAlign="top" wrapperStyle={{ fontSize: '10px' }} />
            <Bar
              dataKey={mode === 'growth' ? 'UsersGrowth' : 'Users'}
              name={mode === 'growth' ? t('Employees Growth') : t('Employees')}
              fill="var(--color-primary, var(--primary))"
              legendType="circle"
              radius={[4, 4, 0, 0]}
              label={{ position: 'top', fontSize: 9, fill: legendColor }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}