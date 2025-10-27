import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { iconMapper } from '@/lib/iconMapper';
import { useAppearance } from '@/hooks/use-appearance';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartTooltip,
  ChartLegend
);

// Plugin untuk memastikan background transparan (tidak opaque putih)
const TransparentBgPlugin = {
  id: 'transparentBg',
  beforeDraw: (chart: any) => {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.restore();
  },
};

export interface ResourceUsageAreaChartProps {
  data: { [key: string]: any }[];
  xAxisDataKey?: string;
  yAxisDataKey1?: string;
  yAxisDataKey2?: string;
  iconName?: string;
  title?: string;
}

export default function ResourceUsageAreaChart({
  data,
  xAxisDataKey = 'month',
  yAxisDataKey1 = 'users',
  yAxisDataKey2 = 'assets',
  iconName,
  title = 'Resource Usage',
}: ResourceUsageAreaChartProps) {
  const { t } = useTranslation();
  const { appearance } = useAppearance();

  // Deteksi tema dark/light
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  useEffect(() => {
    const updateTheme = () =>
      setIsDark(
        typeof document !== 'undefined' &&
          document.documentElement.classList.contains('dark')
      );

    updateTheme();

    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      const observer = new MutationObserver(updateTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      return () => observer.disconnect();
    }
  }, [appearance]);

  const IconComponent = iconName ? iconMapper(iconName) : null;

  // Warna dinamis
  const axisColor = isDark ? '#cbd5e1' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb';

  const rows = data || [];
  const labels = rows.map((d) => String(d[xAxisDataKey] ?? ''));

  const datasets = [
    {
      label: t(String(yAxisDataKey1)),
      data: rows.map((d) => Number(d[yAxisDataKey1] ?? 0)),
      borderColor: isDark ? '#38bdf8' : '#2563eb',
      pointRadius: 0,
      borderWidth: 2,
      fill: true,
      backgroundColor: (ctx: any) => {
        const { chart } = ctx;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'rgba(37,99,235,0.2)';
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, isDark ? 'rgba(56,189,248,0.3)' : 'rgba(37,99,235,0.2)');
        g.addColorStop(1, 'rgba(37,99,235,0)');
        return g;
      },
      tension: 0.4,
    },
    {
      label: t(String(yAxisDataKey2)),
      data: rows.map((d) => Number(d[yAxisDataKey2] ?? 0)),
      borderColor: isDark ? 'rgba(147,197,253,0.6)' : 'rgba(99,102,241,0.8)',
      pointRadius: 0,
      borderWidth: 2,
      fill: true,
      backgroundColor: (ctx: any) => {
        const { chart } = ctx;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'rgba(99,102,241,0.2)';
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, isDark ? 'rgba(147,197,253,0.3)' : 'rgba(99,102,241,0.2)');
        g.addColorStop(1, 'rgba(99,102,241,0)');
        return g;
      },
      tension: 0.4,
    },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: axisColor,
          boxWidth: 10,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#0b1437' : '#ffffff',
        titleColor: isDark ? '#e5e7eb' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#111827',
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
      className={`shadow-sm rounded-2xl overflow-hidden h-full border group hover:shadow-xl transition-all duration-300 
      ${isDark
        ? 'bg-[#0b1437] border-[#1a2541] hover:border-cyan-600'
        : 'bg-white border-gray-100 hover:border-cyan-300'
      }`}
    >
      <CardHeader
        className={`px-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2 ${
          isDark ? 'bg-[#0b1437]' : 'bg-white'
        }`}
      >
        <CardTitle
          className={`text-lg font-semibold flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}
        >
          {IconComponent && (
            <div
              className={`flex-shrink-0 p-2 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110
                ${isDark
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-500/30'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'
                }`}
            >
              <IconComponent className="h-5 w-5 text-white" />
            </div>
          )}
          {t(title)}
        </CardTitle>
      </CardHeader>

      <CardContent
        className={`h-[240px] sm:h-[280px] md:h-[320px] min-w-0 ${
          isDark ? 'bg-[#0b1437]' : 'bg-white'
        }`}
      >
        <div
          key={isDark ? 'dark' : 'light'}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.01]"
        >
          <Line data={{ labels, datasets }} options={options} plugins={[TransparentBgPlugin]} />
        </div>
      </CardContent>
    </Card>
  );
}
