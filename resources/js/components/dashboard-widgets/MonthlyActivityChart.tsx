import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, ChartLegend);

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

export interface MonthlyActivityChartProps {
  data: { [key: string]: any }[];
  xAxisDataKey?: string;
  yAxisDataKey1?: string;
  yAxisDataKey2?: string;
  iconName?: string;
}

export default function MonthlyActivityChart({ data, xAxisDataKey = 'name', yAxisDataKey1 = 'Users', yAxisDataKey2 = 'Backups', iconName }: MonthlyActivityChartProps) {
  const { t } = useTranslation();
  const IconComponent = iconName ? iconMapper(iconName) : null;

  const initialMode: 'total' | 'growth' = yAxisDataKey1 === 'UsersGrowth' ? 'growth' : 'total';
  const [mode, setMode] = React.useState<'total' | 'growth'>(initialMode);
  const canToggle = yAxisDataKey1 === 'Users' || yAxisDataKey1 === 'UsersGrowth';

  const processedData = mode === 'growth'
    ? (data || []).map((d, i, arr) => {
        const prev = i > 0 ? Number(arr[i - 1]['Users'] ?? 0) : 0;
        const curr = Number(d['Users'] ?? 0);
        return { ...d, UsersGrowth: curr - prev };
      })
    : data;

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
  const legendColor = isDark ? '#e5e7eb' : '#111827';
  const axisColor = isDark ? '#cbd5e1' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.01)' : '#e5e7eb';

  const normalizedData = (processedData as Array<Record<string, any>>) || [];
  const labels = Array.isArray(normalizedData) ? normalizedData.map((d) => String(d[xAxisDataKey as string] ?? '')) : [];
  const values = Array.isArray(normalizedData)
    ? normalizedData.map((d) => Number(d[mode === 'growth' ? 'UsersGrowth' : 'Users'] ?? 0))
    : [];

  // Resolve CSS variable to concrete color string for Chart.js canvas
  const resolveCssVar = (name: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v && v.length > 0 ? v : fallback;
  };
  // Use a fixed orange for Monthly Activity bars (component-level override)
  const barColor = '#1f8de0ff';

  const datasets = [
    {
      label: mode === 'growth' ? t('Employees Growth') : t('Employees'),
      data: values,
      backgroundColor: barColor,
      borderColor: barColor,
      borderRadius: 4,
      borderWidth: 0,
      barPercentage: 0.8,
      categoryPercentage: 0.7,
    },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: true, labels: { color: legendColor, boxWidth: 10, font: { size: 10 } }, position: 'top' as const },
      tooltip: {
        backgroundColor: isDark ? '#0b1437' : '#ffffff',
        titleColor: legendColor,
        bodyColor: legendColor,
        borderColor: isDark ? '#1a2541' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      x: { grid: { color: gridColor, drawBorder: false }, ticks: { color: axisColor, font: { size: 10 } } },
      y: { grid: { color: gridColor, drawBorder: false }, ticks: { color: axisColor, font: { size: 10 } } },
    },
  } as const;

  const shortMonth = (label: any) => {
    const str = String(label ?? '');
    const [mon] = str.split(' ');
    return mon?.slice(0, 3) || str;
  };

  return (
    <Card className={`shadow-sm rounded-2xl overflow-hidden h-full border group hover:shadow-xl transition-all duration-300 
      ${isDark ? 'bg-[#0b1437] border-[#1a2541] hover:border-blue-600' : 'bg-white border-gray-100 hover:border-blue-300'}`}>
      <CardHeader className={`px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2 ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}>
        <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {IconComponent && (
            <div className={`flex-shrink-0 p-2 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 
              ${isDark ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-500/30' : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'}`}
            >
              <IconComponent className="h-5 w-5 text-white" />
            </div>
          )}
          {t('Monthly Activity')}
        </CardTitle>
        {canToggle && (
          <div className="flex items-center gap-1">
            <Button variant={mode === 'total' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('total')}>
              {t('Total')}
            </Button>
            <Button variant={mode === 'growth' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('growth')}>
              {t('Growth')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className={`h-[240px] sm:h-[280px] md:h-[320px] min-w-0 ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}>
        <div key={isDark ? 'dark' : 'light'} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.01]">
          <Bar data={{ labels: labels.map(shortMonth), datasets }} options={options} plugins={[TransparentBgPlugin]} />
        </div>
      </CardContent>
    </Card>
  );
}