import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppearance } from '@/hooks/use-appearance';

export interface UserRolesPieChartProps {
  data: { name: string; value: number; color: string }[];
  title?: string; // Add title prop
  iconName?: string; // New prop for icon
}

export default function UserRolesPieChart({ data, title, iconName }: UserRolesPieChartProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;
  const isMobile = useIsMobile();
  const { appearance } = useAppearance();
  const isDark = appearance === 'dark';
  const legendColor = isDark ? '#ffffff' : '#111827';

  const LegendContent = ({ payload }: { payload?: any[] }) => (
    <div style={{ width: '100%', display: 'flex', gap: isMobile ? 8 : 12, flexWrap: 'wrap', justifyContent: 'center', fontSize: isMobile ? 9 : 10, color: legendColor }}>
      {(payload || []).map((entry: any, index: number) => (
        <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: entry.color || 'var(--primary)', borderRadius: 9999 }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="bg-white dark:!bg-[#0b1437] shadow-sm rounded-2xl overflow-hidden h-full border border-gray-100 dark:!border-[#1a2541] group hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          {title || t('User Roles')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[220px] sm:h-[300px] flex items-center justify-center bg-white dark:!bg-[#0b1437]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 28, left: 8 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy={isMobile ? '42%' : '45%'}
              outerRadius={isMobile ? '55%' : '65%'}
              label={false}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#0b1437' : '#ffffff', borderColor: isDark ? '#1a2541' : '#e5e7eb', color: legendColor }} labelStyle={{ color: legendColor }} />
            <Legend content={<LegendContent />} align="center" verticalAlign="bottom" />

          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}