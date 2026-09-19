import React from 'react';
import { AnimatedCounter } from './AnimatedCounter';

interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
  accent?: 'blue' | 'amber' | 'red' | 'green' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  unit,
  subtext,
  trend,
  accent = 'neutral',
  icon,
  className = '',
}) => {
  const accentClasses = {
    blue: 'border-l-2 border-l-blue-600',
    amber: 'border-l-2 border-l-amber-600',
    red: 'border-l-2 border-l-red-600',
    green: 'border-l-2 border-l-emerald-600',
    neutral: 'border-l border-l-gray-300',
  };

  const valueColors = {
    blue: 'text-blue-900',
    amber: 'text-amber-800',
    red: 'text-red-700',
    green: 'text-emerald-800',
    neutral: 'text-charcoal-900',
  };

  return (
    <div
      className={`bg-white border border-gray-200 px-3 py-2 rounded-[2px] shadow-2xs flex flex-col justify-between transition-all hover:shadow-md ${accentClasses[accent]} ${className}`}
    >
      <div className="flex items-center justify-between text-[11px] font-sans text-charcoal-500 font-semibold uppercase tracking-wider">
        <span>{label}</span>
        {icon && <span className="text-charcoal-400">{icon}</span>}
      </div>

      <div className="my-0.5 flex items-baseline space-x-1">
        <span className={`text-xl font-bold font-sans tabular-nums tracking-tight leading-tight ${valueColors[accent]}`}>
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </span>
        {unit && <span className="text-xs font-sans font-medium text-charcoal-500">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-[11px] font-sans text-charcoal-500">
        {subtext && <span className="truncate">{subtext}</span>}
        {trend && (
          <span
            className={`text-[10px] font-bold ${
              trend.direction === 'up'
                ? 'text-emerald-700'
                : trend.direction === 'down'
                ? 'text-red-700'
                : 'text-charcoal-400'
            }`}
          >
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};
