import React, { useEffect, useState } from 'react';
import { iconMapper } from '@/lib/iconMapper';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export interface SummaryCardProps {
  label: string;
  value: number;
  iconName?: string;
  growth?: number;
  showGrowth?: boolean;
}

export default function SummaryCard({
  label,
  value,
  iconName,
  growth,
  showGrowth = false,
}: SummaryCardProps) {
  const { appearance } = useAppearance();

  // Force re-render saat theme berubah
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    checkDark(); // panggil langsung untuk sinkron awal
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [appearance]);

  const IconComponent = iconName ? iconMapper(iconName) : null;
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div
      className={`summary-card relative h-full w-full flex items-start gap-4 p-5 rounded-2xl shadow-sm border overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300
        ${isDark
          ? 'bg-[#0b1437] border-[#1a2541] hover:border-blue-500'
          : 'bg-white border-gray-100 hover:border-blue-400'}`}
    >
      {/* Icon */}
      {IconComponent && (
        <div
          className={`flex-shrink-0 p-3 rounded-xl shadow-lg hover:scale-110 transition-all duration-300
            ${isDark
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-500/30 hover:shadow-blue-500/50'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30 hover:shadow-blue-500/50'}`}
        >
          <IconComponent className="h-6 w-6 text-white" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p
          className={`text-sm font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {label}
        </p>

        <h3
          className={`text-2xl sm:text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {value.toLocaleString()}
        </h3>

        {/* Growth indicator */}
        {showGrowth && growth !== undefined && (
          <div className="flex items-center gap-1.5 text-xs self-start mt-1">
            {isPositive ? (
              <TrendingUp
                className={`h-3.5 w-3.5 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}
              />
            ) : (
              <TrendingDown
                className={`h-3.5 w-3.5 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`}
              />
            )}

            <span
              className={`font-semibold ${
                isPositive
                  ? isDark
                    ? 'text-green-400'
                    : 'text-green-600'
                  : isDark
                  ? 'text-red-400'
                  : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {growth.toFixed(1)}%
            </span>

            <span
              className={`${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              since last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
