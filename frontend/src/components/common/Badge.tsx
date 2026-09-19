import React from 'react';

export type BadgeVariant =
  | 'critical'
  | 'warning'
  | 'info'
  | 'normal'
  | 'demo'
  | 'neutral'
  | 'saffron'
  | 'navy'
  | 'gold';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'xs',
  className = '',
}) => {
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]';

  const variantClasses: Record<BadgeVariant, string> = {
    critical: 'bg-red-50 text-red-800 border border-red-300 font-bold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-300 font-bold',
    info: 'bg-blue-50 text-blue-900 border border-blue-300 font-semibold',
    normal: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
    demo: 'bg-[#FFF7ED] text-[#C85A00] border border-[#FF9933]/50 font-bold tracking-wider',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-300 font-medium',
    saffron: 'bg-[#FFF7ED] text-[#9A3412] border border-[#EA580C]/40 font-bold',
    navy: 'bg-[#E8EFF8] text-[#0B2545] border border-[#0B2545]/30 font-bold',
    gold: 'bg-[#FEFCE8] text-[#854D0E] border border-[#D4AF37]/50 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-wider rounded-[2px] leading-tight select-none ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
