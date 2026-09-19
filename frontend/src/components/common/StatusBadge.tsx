import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'severity' | 'case' | 'confidence';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'severity' }) => {
  let colorStyle = 'bg-bridge-800 text-bridge-300 border-bridge-700';

  const normalized = status.toUpperCase();

  if (normalized === 'CRITICAL' || normalized === 'HIGH' || normalized === 'ESCALATED_TO_COAST_GUARD') {
    colorStyle = 'bg-red-950/60 text-tactical-red border-red-800/80';
  } else if (normalized === 'MEDIUM' || normalized === 'TRIAGED' || normalized === 'WARNING') {
    colorStyle = 'bg-amber-950/60 text-tactical-amber border-amber-800/80';
  } else if (normalized === 'LOW' || normalized === 'CLOSED' || normalized === 'OPERATIONAL') {
    colorStyle = 'bg-emerald-950/60 text-tactical-emerald border-emerald-800/80';
  } else if (normalized === 'OPEN' || normalized === 'HINDCAST' || normalized === 'FORECAST') {
    colorStyle = 'bg-cyan-950/60 text-tactical-cyan border-cyan-800/80';
  }

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border uppercase tracking-wider ${colorStyle}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};
