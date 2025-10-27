import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper';
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

export interface DailyTicketStatusStackedProps {
  data: Array<{ date: string; day: number; open: number; in_progress: number; resolved: number; closed: number; cancelled: number }>;
  title?: string;
  iconName?: string;
}

export default function DailyTicketStatusStacked({ data, title, iconName }: DailyTicketStatusStackedProps) {
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
  const legendColor = isDark ? '#e5e7eb' : '#111827';
  const axisColor = isDark ? '#cbd5e1' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.01)' : '#e5e7eb';

  const labels = Array.isArray(data) ? data.map((d) => String(d.day)) : [];
  const barEntries = [
    { key: 'open', color: '#327ae6ff', label: t('Open') },
    { key: 'in_progress', color: '#fbbe4eff', label: t('In Progress') },
    { key: 'resolved', color: '#34d399', label: t('Resolved') },
  ];
  const datasets = barEntries.map((b) => ({
    label: b.label,
    data: Array.isArray(data) ? data.map((d: any) => Number(d[b.key] ?? 0)) : [],
    backgroundColor: b.color,
    borderWidth: 0,
    borderRadius: 4,
    stack: 'tickets',
    barPercentage: 0.8,
    categoryPercentage: 0.7,
  }));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
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
        stacked: true,
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: axisColor, font: { size: 10 } },
      },
      y: {
        stacked: true,
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: axisColor, font: { size: 10 } },
      },
    },
  } as const;

  const todayStr = typeof window !== 'undefined' ? new Date().toISOString().slice(0, 10) : undefined;
  const filteredLabels = todayStr && Array.isArray(data)
    ? data.filter((d) => d.date <= todayStr).map((d) => String(d.day))
    : labels;
  const filteredDatasets = todayStr && Array.isArray(data)
    ? datasets.map((ds) => ({
        ...ds,
        data: data.filter((d) => d.date <= todayStr).map((d: any, i: number) => ds.data[i]),
      }))
    : datasets;

  return (
    <Card className={`shadow-sm rounded-2xl overflow-hidden h-full border group hover:shadow-xl transition-all duration-300 
      ${isDark ? 'bg-[#0b1437] border-[#1a2541] hover:border-purple-600' : 'bg-white border-gray-100 hover:border-purple-300'}`}
    >
      <CardHeader className={`px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2 ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}>
        <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />}
          {title ?? t('Daily Ticket Status (This Month)')}
        </CardTitle>
      </CardHeader>
      <CardContent className={`h-[240px] sm:h-[280px] md:h-[320px] min-w-0 ${isDark ? 'bg-[#0b1437]' : 'bg-white'}`}>
        <div key={isDark ? 'dark' : 'light'} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.01]">
          <Bar data={{ labels: filteredLabels, datasets: filteredDatasets }} options={options} plugins={[TransparentBgPlugin]} />
        </div>
      </CardContent>
    </Card>
  );
}

