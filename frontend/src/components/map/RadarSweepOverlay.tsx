import React, { useState } from 'react';
import { Radio, Crosshair, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface RadarSweepOverlayProps {
  isVisible: boolean;
  onToggle: () => void;
  sectorName?: string;
  targetCount?: number;
}

export const RadarSweepOverlay: React.FC<RadarSweepOverlayProps> = ({
  isVisible,
  onToggle,
  sectorName = 'SECTOR MH-4 // WESTERN EEZ',
  targetCount = 4,
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden flex items-center justify-center">
      {/* Radar Center Coordinate Reticle */}
      <div className="relative w-[520px] h-[520px] md:w-[680px] md:h-[680px] rounded-full border border-emerald-500/25 flex items-center justify-center">
        {/* Concentric Range Rings (5 NM, 10 NM, 15 NM) */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
        <div className="absolute inset-16 rounded-full border border-emerald-500/25 border-dashed" />
        <div className="absolute inset-32 rounded-full border border-emerald-500/20" />
        <div className="absolute inset-48 rounded-full border border-emerald-500/30" />
        <div className="absolute inset-[240px] md:inset-[300px] rounded-full border border-emerald-400/40" />

        {/* Range Ring Distance Labels */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-emerald-400/70 bg-black/40 px-1 rounded">
          15 NM (27.8 km)
        </span>
        <span className="absolute top-18 left-1/2 -translate-x-1/2 text-[9px] font-mono text-emerald-400/70 bg-black/40 px-1 rounded">
          10 NM (18.5 km)
        </span>
        <span className="absolute top-34 left-1/2 -translate-x-1/2 text-[9px] font-mono text-emerald-400/70 bg-black/40 px-1 rounded">
          5 NM (9.3 km)
        </span>

        {/* Crosshair Axes */}
        <div className="absolute w-full h-[1px] bg-emerald-500/20" />
        <div className="absolute h-full w-[1px] bg-emerald-500/20" />
        <div className="absolute w-full h-[1px] bg-emerald-500/10 rotate-45" />
        <div className="absolute w-full h-[1px] bg-emerald-500/10 -rotate-45" />

        {/* Cardinal Markers */}
        <div className="absolute top-3 font-mono font-bold text-[11px] text-[#FFD700] drop-shadow-md">000° N</div>
        <div className="absolute bottom-3 font-mono font-bold text-[11px] text-[#FFD700] drop-shadow-md">180° S</div>
        <div className="absolute right-3 font-mono font-bold text-[11px] text-[#FFD700] drop-shadow-md">090° E</div>
        <div className="absolute left-3 font-mono font-bold text-[11px] text-[#FFD700] drop-shadow-md">270° W</div>

        {/* Rotating 360° Tactical Radar Sweep Beam */}
        <div className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none">
          <div
            className="w-1/2 h-1/2 origin-bottom-right"
            style={{
              background: 'conic-gradient(from 0deg at 100% 100%, rgba(16, 185, 129, 0.45) 0deg, rgba(16, 185, 129, 0.15) 30deg, transparent 60deg)',
              borderRight: '2px solid rgba(52, 211, 153, 0.95)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
            }}
          />
        </div>

        {/* Tactical Sonar Ping Wave from Center */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-emerald-400/80 animate-sonar-wave pointer-events-none" />

        {/* Radar Telemetry Header Badge */}
        <div className="absolute top-6 left-6 pointer-events-auto bg-[#001737]/90 text-white border border-[#D4AF37]/50 px-3 py-1.5 rounded-[2px] shadow-lg backdrop-blur-md font-mono text-[10px] flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-[#FFD700]">ICG S-BAND RADAR HUD ACTIVE</span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-300">{targetCount} TARGETS IN SWEEP</span>
        </div>
      </div>
    </div>
  );
};
