import React from 'react';

interface TricolorRibbonProps {
  className?: string;
  height?: 'sm' | 'md' | 'lg';
}

export const TricolorRibbon: React.FC<TricolorRibbonProps> = ({
  className = '',
  height = 'md',
}) => {
  const heightClasses = {
    sm: 'h-[2px]',
    md: 'h-[3px]',
    lg: 'h-[4px]',
  };

  return (
    <div
      className={`w-full flex ${heightClasses[height]} select-none ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="flex-1 bg-[#FF9933]" />
      <div className="flex-1 bg-[#FFFFFF] border-t border-b border-gray-100" />
      <div className="flex-1 bg-[#138808]" />
    </div>
  );
};
