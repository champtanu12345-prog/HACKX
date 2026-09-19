import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  variant?: 'cyan' | 'red' | 'amber' | 'default';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  variant = 'default',
  icon,
}) => {
  let valueColor = 'text-bridge-100';
  if (variant === 'cyan') valueColor = 'text-tactical-cyan';
  if (variant === 'red') valueColor = 'text-tactical-red';
  if (variant === 'amber') valueColor = 'text-tactical-amber';

  return (
    <div className="bg-bridge-900 border border-bridge-700 p-2.5 rounded">
      <div className="flex items-center justify-between text-[11px] text-bridge-400 font-mono">
        <span className="uppercase tracking-wider">{label}</span>
        {icon && <span className="text-bridge-500">{icon}</span>}
      </div>
      <div className="mt-1 flex items-baseline space-x-1">
        <span className={`text-lg font-mono font-semibold ${valueColor}`}>{value}</span>
        {unit && <span className="text-xs font-mono text-bridge-400">{unit}</span>}
      </div>
      {subtext && <div className="mt-0.5 text-[10px] text-bridge-500 font-mono">{subtext}</div>}
    </div>
  );
};
