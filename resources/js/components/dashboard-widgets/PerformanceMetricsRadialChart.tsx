import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper
import { useAppearance } from '@/hooks/use-appearance';

export interface PerformanceMetricsRadialChartProps {
  data: { name: string; value: number; fill: string }[];
  iconName?: string; // New prop for icon
}

export default function PerformanceMetricsRadialChart({ data, iconName }: PerformanceMetricsRadialChartProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;
  const { appearance } = useAppearance();
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  useEffect(() => {
    const checkDark = () =>
      setIsDark(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
    checkDark();
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      const observer = new MutationObserver(checkDark);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
    return () => {};
  }, [appearance]);

  ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

  const labels = Array.isArray(data) ? data.map((d) => d.name) : [];
  const values = Array.isArray(data) ? data.map((d) => d.value) : [];
  const colors = Array.isArray(data) ? data.map((d) => d.fill) : [];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    circumference: 180,
    rotation: -90,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: isDark ? '#e5e7eb' : '#111827', boxWidth: 10, font: { size: 10 } } },
      tooltip: {
        backgroundColor: isDark ? '#0b1437' : '#ffffff',
        titleColor: isDark ? '#e5e7eb' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#111827',
        borderColor: isDark ? '#1a2541' : '#e5e7eb',
        borderWidth: 1,
      },
    },
  } as const;

  const dataset = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />}
          {t('Performance Metrics')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] sm:h-[300px]">
        <div key={isDark ? 'dark' : 'light'} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.01]">
          <Doughnut data={dataset} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}