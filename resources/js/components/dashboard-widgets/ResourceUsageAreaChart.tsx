import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

export interface ResourceUsageAreaChartProps {
  data: { [key: string]: any }[]; // Make data more generic
  xAxisDataKey?: string; // New prop for dynamic X-axis
  yAxisDataKey1?: string; // New prop for dynamic Y-axis 1
  yAxisDataKey2?: string; // New prop for dynamic Y-axis 2
}

export default function ResourceUsageAreaChart({ data, xAxisDataKey = 'month', yAxisDataKey1 = 'users', yAxisDataKey2 = 'backups' }: ResourceUsageAreaChartProps) {
  const { t } = useTranslation();
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">{t('Resource Usage')}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey={xAxisDataKey} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Area type="monotone" dataKey={yAxisDataKey1} stroke="#8884d8" fill="#c6dae7" />
            <Area type="monotone" dataKey={yAxisDataKey2} stroke="#82ca9d" fill="#b7e4c7" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}