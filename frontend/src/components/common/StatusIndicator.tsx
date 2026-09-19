import React from 'react';

export type OperationalStatus = 'nominal' | 'warning' | 'critical' | 'standby' | 'offline';

interface StatusIndicatorProps {
  status: OperationalStatus;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = false,
  size = 'sm',
  className = '',
}) => {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  const statusConfig: Record<OperationalStatus, { color: string; ringColor: string; defaultLabel: string }> = {
    nominal: {
      color: 'bg-emerald-500',
      ringColor: 'bg-emerald-400',
      defaultLabel: 'NOMINAL',
    },
    warning: {
      color: 'bg-amber-500',
      ringColor: 'bg-amber-400',
      defaultLabel: 'WARNING',
    },
    critical: {
      color: 'bg-red-500',
      ringColor: 'bg-red-400',
      defaultLabel: 'CRITICAL',
    },
    standby: {
      color: 'bg-blue-400',
      ringColor: 'bg-blue-300',
      defaultLabel: 'STANDBY',
    },
    offline: {
      color: 'bg-slate-500',
      ringColor: 'bg-slate-400',
      defaultLabel: 'OFFLINE',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center space-x-1.5 select-none ${className}`}>
      <span className="relative flex items-center justify-center">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.ringColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${config.color}`} />
      </span>
      {label !== undefined ? (
        <span className="font-mono text-[11px] text-bridge-200 uppercase tracking-tight">{label}</span>
      ) : null}
    </div>
  );
};
