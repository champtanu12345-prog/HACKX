import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Flame,
  Satellite,
  Ship,
  X,
  Film,
  Disc3,
} from 'lucide-react';

interface TimeScrubberBarProps {
  currentOffsetHours: number; // -24.0 to 0.0
  onOffsetChange: (offset: number | ((prev: number) => number)) => void;
  observationTimeUtc?: string; // e.g. "2026-09-15T01:28:00Z"
  className?: string;
  onClose?: () => void;
  autoPlay?: boolean;
}

export const TimeScrubberBar: React.FC<TimeScrubberBarProps> = ({
  currentOffsetHours,
  onOffsetChange,
  observationTimeUtc = '2026-09-15T01:28:00Z',
  className = '',
  onClose,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 0.5x, 1x, 2x, 4x

  // Base observation time (Epoch ms)
  const baseEpochMs = new Date(observationTimeUtc).getTime() || new Date('2026-09-15T01:28:00Z').getTime();

  // Current scrubbed datetime
  const currentEpochMs = baseEpochMs + currentOffsetHours * 3600 * 1000;
  const currentDate = new Date(currentEpochMs);

  const formattedUtcTime = `${currentDate.getUTCDate()} ${currentDate.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })} ${currentDate.getUTCFullYear()}  ${currentDate
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

    const intervalMs = 200;
    const stepHours = playSpeed * 0.2; // Smooth 5fps progression

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

  // Percentage along -24 to 0 timeline
  const progressPct = Math.max(0, Math.min(100, ((currentOffsetHours + 24) / 24) * 100));

  return (
    <div
      className={`bg-[#0a121e]/95 backdrop-blur-md border border-amber-500/40 rounded-xl shadow-2xl p-3 font-sans select-none text-xs text-slate-200 ring-1 ring-white/10 transition-all ${className}`}
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 158, 11, 0.1)',
      }}
    >
      {/* Top Header: Classic Nautical Timecode & Film Status */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-black text-[10px] text-amber-400 tracking-widest uppercase">
                HISTORICAL FOOTAGE REPLAY
              </span>
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-black/40 border border-slate-700 font-mono text-[9px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPlaying ? 'bg-red-500 animate-ping' : 'bg-slate-500'
                  }`}
                />
                <span className={isPlaying ? 'text-red-400 font-bold' : 'text-slate-400'}>
                  {isPlaying ? 'PLAYING' : 'PAUSED'}
                </span>
              </span>
            </div>
            <div className="font-mono font-bold text-xs text-amber-200/90 tracking-wide mt-0.5">
              {formattedUtcTime}
            </div>
          </div>
        </div>

        {/* Status Pills & Close Button */}
        <div className="flex items-center space-x-2">
          {isDischargeWindow && (
            <div className="hidden sm:flex items-center space-x-1 text-[10px] font-mono font-bold text-red-300 bg-red-950/80 border border-red-500/60 px-2 py-0.5 rounded animate-pulse">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>DISCHARGE &amp; AIS GAP WINDOW</span>
            </div>
          )}

          <div className="font-mono font-bold text-xs bg-amber-950/70 border border-amber-500/50 px-2.5 py-0.5 rounded text-amber-300 shadow-inner">
            T {currentOffsetHours === 0 ? '+0.0h' : `${currentOffsetHours.toFixed(1)}h`}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Footage Player"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Classical Scrubber Track */}
      <div className="relative py-1">
        <div className="relative h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700">
          {/* Progress fill */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-500 transition-all duration-75"
            style={{ width: `${progressPct}%` }}
          />
          {/* Discharge zone highlight */}
          <div
            className="absolute top-0 bottom-0 bg-red-600/40 border-x border-red-400/80"
            style={{ left: `${((17) / 24) * 100}%`, width: `${(2 / 24) * 100}%` }}
            title="T-7h to T-5h: Suspect Discharge Window"
          />
        </div>

        <input
          type="range"
          min="-24"
          max="0"
          step="0.2"
          value={currentOffsetHours}
          onChange={(e) => onOffsetChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Timeline Annotations */}
        <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1.5 px-0.5">
          <span className="flex items-center space-x-1" title="T-24h: Corridor Transit Entry">
            <Ship className="w-3 h-3 text-blue-400" />
            <span>T-24h (Corridor Entry)</span>
          </span>

          <span
            className="flex items-center space-x-1 text-amber-300 font-bold"
            title="T-6h: Reconstructed Discharge Locus & AIS Blackout Gap"
          >
            <Flame className="w-3 h-3 text-red-400 animate-pulse" />
            <span>T-6h (Discharge Locus)</span>
          </span>

          <span className="flex items-center space-x-1 text-emerald-300 font-bold" title="T-0h: Sentinel-1 SAR Pass">
            <Satellite className="w-3 h-3 text-emerald-400" />
            <span>T-0h (SAR Detection)</span>
          </span>
        </div>
      </div>

      {/* Classic Transport Playback Strip */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
        {/* Play / Step / Reset Transport Controls */}
        <div className="flex items-center space-x-2">
          {/* Main Play / Pause Button with Classic Gold Ring */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 px-3.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-sans font-black flex items-center space-x-1.5 cursor-pointer transition-all shadow-md active:scale-95"
            title={isPlaying ? 'Pause Playback' : 'Play Historical Footage'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            ) : (
              <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            )}
            <span className="tracking-wider text-[11px]">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Step Back 1 Hour */}
          <button
            onClick={() => {
              setIsPlaying(false);
              onOffsetChange((prev) => Math.max(-24, Number((prev - 1).toFixed(1))));
            }}
            className="h-8 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer flex items-center space-x-1 transition-colors"
            title="Step Back 1 Hour"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[10px]">-1h</span>
          </button>

          {/* Step Forward 1 Hour */}
          <button
            onClick={() => {
              setIsPlaying(false);
              onOffsetChange((prev) => Math.min(0, Number((prev + 1).toFixed(1))));
            }}
            className="h-8 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer flex items-center space-x-1 transition-colors"
            title="Step Forward 1 Hour"
          >
            <span className="font-mono text-[10px]">+1h</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Reset to T-24h */}
          <button
            onClick={() => {
              setIsPlaying(false);
              onOffsetChange(-24);
            }}
            className="h-8 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono text-[10px] cursor-pointer flex items-center space-x-1 transition-colors"
            title="Rewind to T-24h start"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Reset</span>
          </button>
        </div>

        {/* Classic Speed Selectors */}
        <div className="flex items-center space-x-1.5 font-mono text-[10px]">
          <span className="text-slate-400 mr-0.5">SPEED:</span>
          {[0.5, 1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaySpeed(spd)}
              className={`px-2 py-0.5 rounded border transition-all cursor-pointer font-bold ${
                playSpeed === spd
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-700'
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
