import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper

export interface ResourceUsageAreaChartProps {
  data: { [key: string]: any }[]; // Make data more generic
  xAxisDataKey?: string; // New prop for dynamic X-axis
  yAxisDataKey1?: string; // New prop for dynamic Y-axis 1
  yAxisDataKey2?: string; // New prop for dynamic Y-axis 2
  iconName?: string; // New prop for icon
}

export default function ResourceUsageAreaChart({ data, xAxisDataKey = 'month', yAxisDataKey1 = 'users', yAxisDataKey2 = 'backups', iconName }: ResourceUsageAreaChartProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;

  return (
    <Card className="bg-white dark:bg-[#0b1437] shadow-sm rounded-2xl overflow-hidden h-full border border-gray-100 dark:border-[#1a2541] group hover:shadow-xl hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          {t('Resource Usage')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] sm:h-[280px] md:h-[320px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="gradArea1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="gradArea2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-primary, var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey={xAxisDataKey} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Area type="monotone" dataKey={yAxisDataKey1} stroke="var(--color-primary, var(--primary))" fill="url(#gradArea1)" strokeWidth={2} />
            <Area type="monotone" dataKey={yAxisDataKey2} stroke="var(--color-primary, var(--primary))" strokeOpacity={0.6} fill="url(#gradArea2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}