import React from 'react';
import { Badge, BadgeVariant } from './Badge';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  severity?: 'critical' | 'warning' | 'info' | 'normal';
  category?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  const getBadgeVariant = (sev?: string): BadgeVariant => {
    switch (sev) {
      case 'critical':
        return 'critical';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'normal':
        return 'normal';
      default:
        return 'neutral';
    }
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {events.map((event, idx) => (
        <div
          key={event.id || idx}
          className="bg-bridge-900 border border-bridge-700 p-2.5 rounded-[2px] flex items-start space-x-3 text-xs font-mono"
        >
          <div className="flex-shrink-0 text-[10px] text-bridge-400 bg-bridge-950 px-1.5 py-0.5 rounded border border-bridge-800">
            {event.timestamp}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-bridge-100 text-[11px] truncate">
                {event.title}
              </span>
              {event.category && (
                <Badge variant={getBadgeVariant(event.severity)} size="xs">
                  {event.category}
                </Badge>
              )}
            </div>
            {event.description && (
              <p className="text-[10px] text-bridge-400 mt-1 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <div className="p-4 text-center text-bridge-500 font-mono text-[11px] uppercase tracking-wider">
          NO TIMELINE EVENTS RECORDED
        </div>
      )}
    </div>
  );
};
