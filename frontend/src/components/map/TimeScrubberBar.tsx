import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  AlertTriangle,
  FastForward,
  ChevronRight,
  ChevronLeft,
  Flame,
  Satellite,
  Ship,
} from 'lucide-react';

interface TimeScrubberBarProps {
  currentOffsetHours: number; // -24.0 to 0.0
  onOffsetChange: (offset: number | ((prev: number) => number)) => void;
  observationTimeUtc?: string; // e.g. "2026-09-15T01:28:00Z"
  className?: string;
}

export const TimeScrubberBar: React.FC<TimeScrubberBarProps> = ({
  currentOffsetHours,
  onOffsetChange,
  observationTimeUtc = '2026-09-15T01:28:00Z',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 1x, 2x, 4x

  // Base observation time (Epoch ms)
  const baseEpochMs = new Date(observationTimeUtc).getTime() || new Date('2026-09-15T01:28:00Z').getTime();

  // Current scrubbed datetime
  const currentEpochMs = baseEpochMs + currentOffsetHours * 3600 * 1000;
  const currentDate = new Date(currentEpochMs);

  const formattedUtcTime = `${currentDate.getUTCDate()} ${currentDate.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })} ${currentDate.getUTCFullYear()}, ${currentDate
    .getUTCHours()
    .toString()
    .padStart(2, '0')}:${currentDate
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}:${currentDate
    .getUTCSeconds()
    .toString()
    .padStart(2, '0')} UTC`;

  // Auto-advance loop when playing
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 250;
    const stepHours = (playSpeed * 0.25); // Advance smoothly

    const timer = setInterval(() => {
      onOffsetChange((prev) => {
        const next = prev + stepHours;
        if (next >= 0) {
          setIsPlaying(false);
          return 0;
        }
        return Number(next.toFixed(2));
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, onOffsetChange]);

  const isDischargeWindow = currentOffsetHours >= -7.0 && currentOffsetHours <= -5.0;

  return (
    <div
      className={`bg-white/95 backdrop-blur-md border-2 border-[#064E26] rounded-[3px] shadow-xl p-2.5 font-sans select-none text-xs text-slate-800 transition-all ${className}`}
    >
      {/* Top Header & Scrubbed Timestamp Display */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-[#064E26] text-[#FFD700] flex items-center justify-center font-bold">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-mono font-bold text-[10px] text-slate-500 uppercase tracking-wider block leading-none">
              HISTORICAL TIME RECONSTRUCTION
            </span>
            <span className="font-mono font-bold text-xs text-[#064E26]">
              {formattedUtcTime}
            </span>
          </div>
        </div>

        {/* T-offset Pill & Status */}
        <div className="flex items-center space-x-2">
          {isDischargeWindow && (
            <div className="flex items-center space-x-1 text-[10.5px] font-mono font-bold text-red-700 bg-red-100/90 border border-red-300 px-2 py-0.5 rounded animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>DISCHARGE & AIS BLACKOUT WINDOW</span>
            </div>
          )}

          <div className="font-mono font-bold text-xs bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-900">
            T {currentOffsetHours === 0 ? '+0.0h' : `${currentOffsetHours.toFixed(1)}h`}
          </div>
        </div>
      </div>

      {/* Main Slider Track */}
      <div className="relative py-1">
        <input
          type="range"
          min="-24"
          max="0"
          step="0.25"
          value={currentOffsetHours}
          onChange={(e) => onOffsetChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#064E26] focus:outline-none"
        />

        {/* Marker Annotations along timeline */}
        <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
          <span className="flex items-center space-x-0.5" title="T-24h: Corridor Entry">
            <Ship className="w-2.5 h-2.5 text-blue-600" />
            <span>T-24h (Corridor)</span>
          </span>

          <span
            className="flex items-center space-x-0.5 text-amber-700 font-bold"
            title="T-6h: Reconstructed Discharge Locus & AIS Blackout Gap"
          >
            <Flame className="w-2.5 h-2.5 text-red-600" />
            <span>T-6h (Discharge/Gap)</span>
          </span>

          <span className="flex items-center space-x-0.5 text-emerald-800 font-bold" title="T-0h: Sentinel-1 SAR Pass">
            <Satellite className="w-2.5 h-2.5 text-emerald-600" />
            <span>T-0h (SAR Pass)</span>
          </span>
        </div>
      </div>

      {/* Playback Controls Strip */}
      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
        {/* Play/Pause & Step Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 rounded bg-[#064E26] hover:bg-[#0D5204] text-white font-sans font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
            title={isPlaying ? 'Pause Playback' : 'Play Historical Trajectory'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[#FFD700]" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={() => onOffsetChange(Math.max(-24, currentOffsetHours - 1))}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
            title="Step back 1 hour"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOffsetChange(Math.min(0, currentOffsetHours + 1))}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
            title="Step forward 1 hour"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onOffsetChange(-24);
            }}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-mono text-[10px] cursor-pointer"
            title="Reset to T-24h"
          >
            <RotateCcw className="w-3 h-3 inline mr-1" />
            <span>Reset</span>
          </button>
        </div>

        {/* Playback Speed Toggles */}
        <div className="flex items-center space-x-1 font-mono text-[10px]">
          <span className="text-slate-400 mr-1">Speed:</span>
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaySpeed(spd)}
              className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                playSpeed === spd
                  ? 'bg-[#064E26] text-white border-[#064E26] font-bold'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
