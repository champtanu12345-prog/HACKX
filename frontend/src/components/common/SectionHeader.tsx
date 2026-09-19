import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`h-9 px-3 bg-white border-b border-gray-200 flex items-center justify-between text-xs select-none ${className}`}
    >
      <div className="flex items-center space-x-2 min-w-0">
        {icon && <span className="text-charcoal-500 flex-shrink-0">{icon}</span>}
        <div className="flex items-baseline space-x-2 truncate">
          <span className="font-mono font-bold tracking-wider text-charcoal-900 uppercase text-[11px]">
            {title}
          </span>
          {subtitle && (
            <span className="font-mono text-[10px] text-charcoal-500 hidden sm:inline truncate">
              // {subtitle}
            </span>
          )}
        </div>
        {badge && <div className="flex-shrink-0">{badge}</div>}
      </div>
      {actions && <div className="flex items-center space-x-1 flex-shrink-0">{actions}</div>}
    </div>
  );
};
