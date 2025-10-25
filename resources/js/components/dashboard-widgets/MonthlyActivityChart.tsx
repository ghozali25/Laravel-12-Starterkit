import React from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper
import { Button } from '@/components/ui/button';

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

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
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
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey={xAxisDataKey} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend content={<LegendContent />} align="center" verticalAlign="top" />
            <Bar
              dataKey={mode === 'growth' ? 'UsersGrowth' : 'Users'}
              name={mode === 'growth' ? t('Employees Growth') : t('Employees')}
              fill="var(--color-primary, var(--primary))"
              legendType="circle"
              radius={[4, 4, 0, 0]}
              label={{ position: 'top', fontSize: 10, fill: legendColor }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}