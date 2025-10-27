import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
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
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  useEffect(() => {
    const checkDark = () => setIsDark(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
    checkDark();
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      const observer = new MutationObserver(checkDark);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
    return () => {};
  }, [appearance]);
  const legendColor = isDark ? '#ffffff' : '#111827';

  ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

  // Transparent background plugin to avoid any white shape
  const TransparentBgPlugin = {
    id: 'transparentBg',
    beforeDraw: (chart: any) => {
      const { ctx, width, height } = chart;
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.restore();
    },
  };

  const labels = Array.isArray(data) ? data.map((d) => d.name) : [];
  const values = Array.isArray(data) ? data.map((d) => d.value) : [];
  const colors = Array.isArray(data) ? data.map((d) => d.color) : [];

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        // Remove separators entirely
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: isMobile ? '55%' : '60%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { color: legendColor, boxWidth: 10, font: { size: isMobile ? 9 : 10 } },
      },
      tooltip: {
        backgroundColor: isDark ? '#0b1437' : '#ffffff',
        titleColor: legendColor,
        bodyColor: legendColor,
        borderColor: isDark ? '#1a2541' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    elements: { arc: { borderWidth: 0 } },
  } as const;

  return (
    <Card className={`shadow-sm rounded-2xl overflow-hidden h-full border group hover:shadow-xl transition-all duration-300 
      ${isDark ? 'bg-[#0b1437] border-[#1a2541] hover:border-indigo-600' : 'bg-white border-gray-100 hover:border-indigo-300'}`}>
      <CardHeader className={`px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2 ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}>
        <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />}
          {title || t('User Roles')}
        </CardTitle>
      </CardHeader>
      <CardContent className={`h-[220px] sm:h-[300px] flex items-center justify-center ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}>
        <div key={isDark ? 'dark' : 'light'} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.01]">
          <Doughnut data={chartData} options={options} plugins={[TransparentBgPlugin]} />
        </div>
      </CardContent>
    </Card>
  );
}