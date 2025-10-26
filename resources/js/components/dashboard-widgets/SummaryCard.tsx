import React from 'react';
import { iconMapper } from '@/lib/iconMapper';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface SummaryCardProps {
  label: string;
  value: number;
  iconName?: string;
  growth?: number; // Optional growth percentage
  showGrowth?: boolean; // Whether to show growth indicator
}

export default function SummaryCard({ label, value, iconName, growth, showGrowth = false }: SummaryCardProps) {
  const IconComponent = iconName ? iconMapper(iconName) : null;
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div className="relative h-full w-full flex items-start gap-4 p-5 bg-white dark:bg-[#0b1437] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1a2541] overflow-hidden hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600 hover:scale-[1.02] transition-all duration-300">
      {/* Icon */}
      {IconComponent && (
        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300">
          <IconComponent className="h-6 w-6 text-white" />
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </h3>
        
        {/* Real growth indicator - only show if showGrowth is true and growth is defined */}
        {showGrowth && growth !== undefined && (
          <div className="flex items-center gap-1.5 text-xs">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            )}
            <span className={`font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{growth.toFixed(1)}%
            </span>
            <span className="text-gray-500 dark:text-gray-400">since last month</span>
          </div>
        )}
      </div>
    </div>
  );
}