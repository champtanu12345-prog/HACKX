import React from 'react';
import { Satellite, Wind, Radio, ShieldAlert, Activity, Compass, AlertCircle } from 'lucide-react';

interface LiveOperationsTickerProps {
  className?: string;
  activeSectorName?: string;
}

export const LiveOperationsTicker: React.FC<LiveOperationsTickerProps> = ({
  className = '',
  activeSectorName = 'Offshore Mumbai High (Sector MH-4)',
}) => {
  const tickerItems = [
    {
      id: 1,
      tag: 'SAR PASS // उपग्रह अधिग्रहण',
      text: 'Sentinel-1A C-SAR IW GRD pass processed over Western EEZ. Hydrocarbon damping anomaly isolated.',
      icon: <Satellite className="w-3.5 h-3.5 text-cyan-400" />,
      tagColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/50',
    },
    {
      id: 2,
      tag: 'INCOIS FORECAST // समुद्री धाराएं',
      text: 'Arabian Sea Hydrodynamics: Surface Current 0.45 m/s (0.87 kn) @ 065° NE | Sig Wave Ht 1.6m | Sea Temp 28.4°C',
      icon: <Compass className="w-3.5 h-3.5 text-[#FF9933]" />,
      tagColor: 'text-[#FF9933] bg-amber-950/60 border-amber-700/50',
    },
    {
      id: 3,
      tag: 'DGLL AIS // तटीय ट्रैकिंग',
      text: '148 transit vessels correlated in Sector MH-4 | 1 AIS blackout gap detected (92 min duration)',
      icon: <Radio className="w-3.5 h-3.5 text-emerald-400" />,
      tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50',
    },
    {
      id: 4,
      tag: 'ICG-MRCC // परिचालन अलर्ट',
      text: `Tactical Incident Dossier Active for ${activeSectorName} | Priority-1 referral prepared for Maritime Magistrate`,
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
      tagColor: 'text-red-400 bg-red-950/60 border-red-700/50',
    },
    {
      id: 5,
      tag: 'NOAA-GFS // मौसमीय दशाएं',
      text: 'Surface Wind: 14.2 kn @ 245° WSW | Monsoonal Drift Deflection: 3.0% with 15° Leeway Angle',
      icon: <Wind className="w-3.5 h-3.5 text-blue-400" />,
      tagColor: 'text-blue-400 bg-blue-950/60 border-blue-700/50',
    },
  ];

  return (
    <div
      className={`w-full bg-[#04331A] text-white border-b border-emerald-600/40 flex items-center overflow-hidden h-7 select-none text-[11px] shadow-xs ${className}`}
      role="region"
      aria-label="Live Maritime Operations Ticker"
    >
      {/* Left Fixed Badge */}
      <div className="flex-shrink-0 bg-[#064E26] text-[#FFD700] px-3 h-full flex items-center space-x-1.5 border-r border-emerald-500/40 font-mono font-bold text-[10px] uppercase tracking-wider z-10 shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
        <span className="font-serif">लाइव टेलीमेट्री</span>
        <span className="text-emerald-300">|</span>
        <span className="text-white">OPS STREAM</span>
      </div>

      {/* Scrolling Marquee Container */}
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div className="animate-ticker flex items-center space-x-8 text-slate-100">
          {/* Repeat twice for continuous infinite scroll */}
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center space-x-2 flex-shrink-0 font-sans">
              <span className={`px-1.5 py-0.5 rounded-[2px] font-mono text-[9.5px] font-bold border ${item.tagColor} flex items-center space-x-1`}>
                {item.icon}
                <span>{item.tag}</span>
              </span>
              <span className="text-slate-100 font-medium text-[11px]">{item.text}</span>
              <span className="text-[#FFD700] mx-2 font-bold">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Fixed Status */}
      <div className="hidden lg:flex flex-shrink-0 bg-[#02210F] text-emerald-300 px-3 h-full items-center space-x-2 border-l border-emerald-800 font-mono text-[10px] z-10 font-bold">
        <span className="text-emerald-400">● INCOIS + DGLL CONNECTED</span>
      </div>
    </div>
  );
};
