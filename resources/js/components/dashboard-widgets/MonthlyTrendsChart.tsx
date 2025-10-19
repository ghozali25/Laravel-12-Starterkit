import React from 'react';
import { Line, LineChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

export interface MonthlyTrendsChartProps {
  data: { name: string; Users: number; Backups: number }[];
}

export default function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const { t } = useTranslation();
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">{t('Monthly Trends')}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Users" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="Backups" stroke="#f43f5e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}