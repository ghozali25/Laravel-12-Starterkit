import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip as ChartTooltip, Legend as ChartLegend, Filler } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper';
import { useAppearance } from '@/hooks/use-appearance';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTooltip, ChartLegend, Filler);

// Transparent canvas/chart-area plugin
const TransparentBgPlugin = {
  id: 'transparentBg',
  beforeDraw: (chart: any) => {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.restore();
  },
};

export interface DailyActivityChartProps {
  data: Array<{ date: string; day: number; [key: string]: any }>;
  xAxisDataKey?: string;
  series?: Array<{ key: string; type?: 'line' | 'bar'; color?: string }>;
  title?: string;
  iconName?: string;
}

export default function DailyActivityChart({
  data,
  xAxisDataKey = 'day',
  series = [
    { key: 'Tickets', type: 'bar', color: '#3b82f6' },
    { key: 'Users', type: 'line', color: '#22c55e' },
    { key: 'Assets', type: 'line', color: '#a78bfa' },
    { key: 'Backups', type: 'line', color: '#f59e0b' },
  ],
  title,
  iconName,
}: DailyActivityChartProps) {
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
  const gridColor = isDark ? 'rgba(255,255,255,0.01)' : '#e5e7eb';
  const legendColor = isDark ? '#e5e7eb' : '#111827';

  const labels = Array.isArray(data) ? data.map((d) => String(d[xAxisDataKey as string] ?? '')) : [];
  const palette = [
    'var(--color-chart-1, #3b82f6)',
    'var(--color-chart-2, #10b981)',
    'var(--color-chart-3, #0ea5e9)',
    'var(--color-chart-4, #f59e0b)',
    'var(--color-chart-5, #ef4444)',
  ];
  const datasets = series.map((s, i) => {
    const values = Array.isArray(data) ? data.map((d) => Number(d[s.key] ?? 0)) : [];
    const base = {
      label: s.key,
      data: values,
      borderColor: s.color ?? palette[i % palette.length],
      backgroundColor: s.type === 'bar'
        ? (s.color ?? palette[i % palette.length])
        : (s.color ?? palette[i % palette.length]),
    } as any;
    if (s.type === 'bar') {
      return { ...base, type: 'bar', borderWidth: 0, borderRadius: 4, barPercentage: 0.8, categoryPercentage: 0.7 };
    }
    return { ...base, type: 'line', tension: 0.4, fill: false, pointRadius: 0, borderWidth: 2 };
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        labels: { color: legendColor, boxWidth: 10, font: { size: 10 } },
      },
      tooltip: {
        backgroundColor: isDark ? '#0b1437' : '#ffffff',
        titleColor: legendColor,
        bodyColor: legendColor,
        borderColor: isDark ? '#1a2541' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: axisColor, font: { size: 10 } },
      },
      y: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: axisColor, font: { size: 10 } },
      },
    },
  } as const;

  return (
    <Card
      className={`widget-card shadow-sm rounded-2xl overflow-hidden h-full border group transition-all duration-300 
        ${isDark ? 'bg-[#0b1437] border-[#1a2541] hover:shadow-xl hover:border-blue-600' : 'bg-white border-gray-100 hover:shadow-xl hover:border-blue-300'}`}
    >
      <CardHeader
        className={`px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2 ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}
      >
        <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {IconComponent && (
            <div className={`flex-shrink-0 p-2 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 
              ${isDark ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-500/30' : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'}`}
            >
              <IconComponent className="h-5 w-5 text-white" />
            </div>
          )}
          {title ?? t('Daily Activity (This Month)')}
        </CardTitle>
      </CardHeader>

      <CardContent className={`h-[240px] sm:h-[280px] md:h-[320px] min-w-0 transition-colors duration-300 ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}>
        {/* ✅ Key penting agar chart redraw ketika theme berubah */}
        <div key={isDark ? 'dark' : 'light'} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.01]">
          <Chart type='bar' data={{ labels, datasets }} options={options} plugins={[TransparentBgPlugin]} />
        </div>
      </CardContent>
    </Card>
  );
}

