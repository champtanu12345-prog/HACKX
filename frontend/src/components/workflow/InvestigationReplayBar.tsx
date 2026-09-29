import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  X,
  Satellite,
  Waves,
  MapPin,
  Compass,
  Radio,
  Award,
} from 'lucide-react';

export interface ReplayStepDetail {
  step: number;
  title: string;
  subheading: string;
  explanation: string;
  icon: React.ReactNode;
}

export const REPLAY_STEPS: ReplayStepDetail[] = [
  {
    step: 1,
    title: 'STEP 01 — SATELLITE OBSERVATION',
    subheading: 'SAR Sensor Acquisition',
    explanation:
      'Sentinel-1A SAR scene ingested. Surface backscatter anomaly identified in radar roughness data.',
    icon: <Satellite className="w-3.5 h-3.5 text-blue-600" />,
  },
  {
    step: 2,
    title: 'STEP 02 — SPILL DETECTION POLYGON',
    subheading: 'Neural Boundary Extraction',
    explanation:
      'U-Net deep neural network segments dark hydrocarbon formation and extracts vector boundary.',
    icon: <Waves className="w-3.5 h-3.5 text-red-600" />,
  },
  {
    step: 3,
    title: 'STEP 03 — SPILL CENTROID IDENTIFIED',
    subheading: 'Geodetic Center Calculation',
    explanation:
      'Calculated geometric centroid coordinates serving as the Lagrangian particle tracking seed.',
    icon: <MapPin className="w-3.5 h-3.5 text-amber-600" />,
  },
  {
    step: 4,
    title: 'STEP 04 — BACKWARD TRAJECTORY',
    subheading: 'Lagrangian Reverse-Time Drift',
    explanation:
      'Reconstructing probable spill origin using observed environmental wind and ocean current conditions.',
    icon: <Compass className="w-3.5 h-3.5 text-sky-600" />,
  },
  {
    step: 5,
    title: 'STEP 05 — SOURCE REGION ESTIMATED',
    subheading: 'Hydrodynamic Convergence Locus',
    explanation:
      'Trajectory convergence establishes estimated release coordinates and temporal discharge window.',
    icon: <MapPin className="w-3.5 h-3.5 text-red-600" />,
  },
  {
    step: 6,
    title: 'STEP 06 — AIS CORRIDOR TELEMETRY',
    subheading: 'Maritime Traffic Corridor Query',
    explanation:
      'Queried historical AIS transponder telemetry within 30 NM radius of reconstructed release locus.',
    icon: <Radio className="w-3.5 h-3.5 text-blue-600" />,
  },
  {
    step: 7,
    title: 'STEP 07 — CANDIDATE VESSEL TRACKS',
    subheading: 'Track Reconstruction & Anomaly Detection',
    explanation:
      'Reconstructed full vessel transit trajectories and flagged anomalies (dark ship AIS gaps, speed drops).',
    icon: <Radio className="w-3.5 h-3.5 text-amber-600" />,
  },
  {
    step: 8,
    title: 'STEP 08 — MULTI-CRITERIA CORRELATION',
    subheading: 'Closest Point of Approach & Alignment',
    explanation:
      'Comparing estimated source location/time with vessel tracks using transparent 40/25/20/15 formula.',
    icon: <Award className="w-3.5 h-3.5 text-indigo-600" />,
  },
  {
    step: 9,
    title: 'STEP 09 — CORRELATION COMPLETE',
    subheading: 'Attribution Finalized',
    explanation:
      'Attribution finalized: candidate vessels ranked. Primary suspect identified with transparent score.',
    icon: <Award className="w-3.5 h-3.5 text-emerald-600" />,
  },
];

interface InvestigationReplayBarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onExitReplay?: () => void;
  onClose?: () => void;
  className?: string;
}

export const InvestigationReplayBar: React.FC<InvestigationReplayBarProps> = ({
  currentStep,
  onStepChange,
  onExitReplay,
  onClose,
  className = '',
}) => {
  const handleExit = onExitReplay || onClose || (() => {});
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeStepDetail = REPLAY_STEPS[currentStep - 1] || REPLAY_STEPS[0];

  useEffect(() => {
    if (isPlaying) {
      const delayMs = Math.round(2800 / playbackSpeed);
      timerRef.current = setTimeout(() => {
        if (currentStep < 9) {
          onStepChange(currentStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, delayMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStep, playbackSpeed, onStepChange]);

  const handleTogglePlay = () => {
    if (!isPlaying && currentStep >= 9) {
      onStepChange(1);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    onStepChange(Math.max(1, currentStep - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    onStepChange(Math.min(9, currentStep + 1));
  };

  const handleResetToStart = () => {
    setIsPlaying(false);
    onStepChange(1);
  };

  const cycleSpeed = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2);
    else setPlaybackSpeed(1);
  };

  return (
    <div
      className={`bg-[#0a121e]/95 backdrop-blur-md border border-amber-500/40 rounded-xl shadow-2xl p-3 font-sans text-xs select-none z-30 ring-1 ring-white/10 text-slate-200 transition-all ${className}`}
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 158, 11, 0.1)',
      }}
    >
      {/* Top Header: Step Indicator, Title & Close Button */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex-shrink-0">
            {activeStepDetail.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-slate-100 tracking-tight">
                {activeStepDetail.title}
              </span>
              <span className="text-[10px] text-amber-300 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/40 font-mono font-semibold">
                STEP {currentStep} / 9
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {activeStepDetail.subheading}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <button
            onClick={cycleSpeed}
            className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-amber-300 text-[10px] border border-slate-700 font-bold font-mono cursor-pointer"
            title="Toggle playback speed"
          >
            {playbackSpeed}x
          </button>
          <button
            onClick={handleExit}
            className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-red-950/80 text-red-300 text-[11px] font-semibold border border-slate-700 hover:border-red-500/60 flex items-center space-x-1 transition-colors cursor-pointer"
            title="Exit Investigation Replay"
          >
            <X className="w-3 h-3 text-red-400" />
            <span>Exit Replay</span>
          </button>
        </div>
      </div>

      {/* Contextual Technical Explanation Banner */}
      <div className="bg-slate-900/80 border border-slate-800 px-2.5 py-2 rounded-lg mb-2.5 text-[11px] leading-relaxed text-slate-300">
        <div className="flex items-start space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0 animate-pulse" />
          <p className="flex-1">{activeStepDetail.explanation}</p>
        </div>
      </div>

      {/* Scrubber Range Slider & Step Nodes */}
      <div className="space-y-1">
        <div className="relative flex items-center px-1">
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={currentStep}
            onChange={(e) => {
              setIsPlaying(false);
              onStepChange(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500 z-10"
          />
        </div>

        {/* Step Numbers Tick Markers */}
        <div className="grid grid-cols-9 text-center text-[10px] font-mono font-semibold">
          {REPLAY_STEPS.map((s) => {
            const isCompleted = s.step <= currentStep;
            const isCurrent = s.step === currentStep;
            return (
              <button
                key={s.step}
                onClick={() => {
                  setIsPlaying(false);
                  onStepChange(s.step);
                }}
                className={`py-0.5 transition-colors cursor-pointer ${
                  isCurrent
                    ? 'text-amber-400 font-extrabold underline'
                    : isCompleted
                    ? 'text-slate-300 hover:text-amber-300'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title={s.title}
              >
                0{s.step}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Transport Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetToStart}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={handleStepBack}
            disabled={currentStep <= 1}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700 cursor-pointer"
            title="Step Backward"
          >
            <SkipBack className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-3.5 py-1 rounded font-sans font-black text-[11px] flex items-center space-x-1.5 border transition-all cursor-pointer shadow-md ${
              isPlaying
                ? 'bg-amber-600 text-white border-amber-500 hover:bg-amber-700'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-amber-400 hover:from-amber-300 hover:to-amber-500'
            }`}
            title={isPlaying ? 'Pause Auto-Replay' : 'Play Auto-Replay'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current text-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current text-slate-950" />
                <span>{currentStep >= 9 ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStep >= 9}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700 cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1.5">
          <span>MODE:</span>
          <span className="text-amber-300 font-bold">TACTICAL FOOTAGE REPLAY</span>
        </div>
      </div>
    </div>
  );
};
