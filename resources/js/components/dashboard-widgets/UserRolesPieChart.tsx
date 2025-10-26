import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper
import { useIsMobile } from '@/hooks/use-mobile';

export interface UserRolesPieChartProps {
  data: { name: string; value: number; color: string }[];
  title?: string; // Add title prop
  iconName?: string; // New prop for icon
}

export default function UserRolesPieChart({ data, title, iconName }: UserRolesPieChartProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;
  const isMobile = useIsMobile();

  const legendColor = (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))
    ? '#ffffff'
    : '#111827';

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
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          {title || t('User Roles')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[220px] sm:h-[300px] flex items-center justify-center">
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
            <Tooltip />
            <Legend content={<LegendContent />} align="center" verticalAlign="bottom" />

          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}