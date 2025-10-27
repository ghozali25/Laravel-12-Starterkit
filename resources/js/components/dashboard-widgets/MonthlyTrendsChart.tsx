import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper
import { useAppearance } from '@/hooks/use-appearance';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, ChartLegend);

// Transparent background plugin
const TransparentBgPlugin = {
  id: 'transparentBg',
  beforeDraw: (chart: any) => {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.restore();
  },
};

export interface MonthlyTrendsChartProps {
  data: { [key: string]: any }[]; // Make data more generic
  xAxisDataKey?: string; // New prop for dynamic X-axis
  yAxisDataKey1?: string; // New prop for dynamic Y-axis 1
  yAxisDataKey2?: string; // New prop for dynamic Y-axis 2
  iconName?: string; // New prop for icon
}

export default function MonthlyTrendsChart({ data, xAxisDataKey = 'name', yAxisDataKey1 = 'Users', yAxisDataKey2 = 'Backups', iconName }: MonthlyTrendsChartProps) {
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
  const axisColor = isDark ? '#cbd5e1' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb';
  const legendColor = isDark ? '#ffffff' : '#111827';

  const rows = (data as Array<Record<string, any>>) || [];
  const labels = rows.map((d) => String(d[xAxisDataKey] ?? ''));
  const ds1 = rows.map((d) => Number(d[yAxisDataKey1] ?? 0));
  const ds2 = rows.map((d) => Number(d[yAxisDataKey2] ?? 0));

  const datasets = [
    { label: t(String(yAxisDataKey1)), data: ds1, borderColor: 'var(--color-chart-1, #3b82f6)', backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: t(String(yAxisDataKey2)), data: ds2, borderColor: 'var(--color-chart-2, #10b981)', backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 2, borderDash: [4, 4] as number[] },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: true, position: 'top' as const, labels: { color: legendColor, boxWidth: 10, font: { size: 10 } } },
      tooltip: {
        backgroundColor: isDark ? '#0b1437' : '#ffffff',
        titleColor: legendColor,
        bodyColor: legendColor,
        borderColor: isDark ? '#1a2541' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      x: { grid: { color: gridColor, drawBorder: false, borderColor: 'transparent' }, ticks: { color: axisColor, font: { size: 10 } }, drawTicks: false },
      y: { grid: { color: gridColor, drawBorder: false, borderColor: 'transparent' }, ticks: { color: axisColor, font: { size: 10 } }, drawTicks: false },
    },
  } as const;

  return (
    <Card className={`shadow-sm rounded-2xl overflow-hidden h-full border group hover:shadow-xl transition-all duration-300 
      ${isDark ? 'bg-[#0b1437] border-[#1a2541] hover:border-emerald-600' : 'bg-white border-gray-100 hover:border-emerald-300'}`}>
      <CardHeader className={`px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2 ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}>
        <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />}
          {t('Monthly Trends')}
        </CardTitle>
      </CardHeader>
      <CardContent className={`h-[240px] sm:h-[280px] md:h-[320px] min-w-0 ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}>
        <div key={isDark ? 'dark' : 'light'} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.01]">
          <Line data={{ labels, datasets }} options={options} plugins={[TransparentBgPlugin]} />
        </div>
      </CardContent>
    </Card>
  );
}