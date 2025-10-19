import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

export interface PerformanceMetricsRadialChartProps {
  data: { name: string; value: number; fill: string }[];
}

export default function PerformanceMetricsRadialChart({ data }: PerformanceMetricsRadialChartProps) {
  const { t } = useTranslation();
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">{t('Performance Metrics')}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="30%"
            outerRadius="80%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={10}
              label={{ fill: '#fff', position: 'insideStart' }}
            />
            <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}