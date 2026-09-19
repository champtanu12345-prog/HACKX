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
      className={`bg-white border border-gray-300 rounded-[2px] shadow-lg p-3 font-sans text-xs select-none z-30 transition-all ${className}`}
    >
      {/* Top Header: Step Indicator, Title & Close Button */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-2 mb-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1 rounded-[2px] bg-blue-50 border border-blue-200 flex-shrink-0">
            {activeStepDetail.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-charcoal-900 tracking-tight">
                {activeStepDetail.title}
              </span>
              <span className="text-[10px] text-charcoal-600 bg-gray-100 px-1.5 py-0.5 rounded-[2px] border border-gray-200 font-mono font-semibold">
                {currentStep} / 9
              </span>
            </div>
            <div className="text-[11px] text-charcoal-500 truncate">
              {activeStepDetail.subheading}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <button
            onClick={cycleSpeed}
            className="px-1.5 py-0.5 rounded-[2px] bg-gray-50 hover:bg-gray-100 text-charcoal-700 text-[10px] border border-gray-200 font-bold font-mono cursor-pointer"
            title="Toggle playback speed"
          >
            {playbackSpeed}x
          </button>
          <button
            onClick={handleExit}
            className="px-2 py-0.5 rounded-[2px] bg-white hover:bg-red-50 text-red-700 text-[11px] font-semibold border border-red-200 flex items-center space-x-1 transition-colors cursor-pointer"
            title="Exit Investigation Replay"
          >
            <X className="w-3 h-3 text-red-600" />
            <span>Exit Replay</span>
          </button>
        </div>
      </div>

      {/* Contextual Technical Explanation Banner */}
      <div className="bg-blue-50/70 border border-blue-100 px-2.5 py-2 rounded-[2px] mb-2.5 text-[11px] leading-relaxed text-charcoal-800">
        <div className="flex items-start space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
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
            className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer accent-blue-600 z-10"
          />
        </div>

        {/* Step Numbers Tick Markers */}
        <div className="grid grid-cols-9 text-center text-[10px] font-mono text-charcoal-400 font-semibold">
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
                    ? 'text-blue-700 font-extrabold underline'
                    : isCompleted
                    ? 'text-charcoal-800 hover:text-blue-700'
                    : 'text-charcoal-400 hover:text-charcoal-600'
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
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleResetToStart}
            className="p-1 rounded-[2px] bg-white hover:bg-gray-100 text-charcoal-700 border border-gray-200 cursor-pointer"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleStepBack}
            disabled={currentStep <= 1}
            className="p-1 rounded-[2px] bg-white hover:bg-gray-100 disabled:opacity-40 text-charcoal-700 border border-gray-200 cursor-pointer"
            title="Step Backward"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-3 py-1 rounded-[2px] font-sans font-semibold text-[11px] flex items-center space-x-1.5 border transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700'
                : 'bg-blue-700 hover:bg-blue-800 text-white border-blue-800'
            }`}
            title={isPlaying ? 'Pause Auto-Replay' : 'Play Auto-Replay'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>{currentStep >= 9 ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStep >= 9}
            className="p-1 rounded-[2px] bg-white hover:bg-gray-100 disabled:opacity-40 text-charcoal-700 border border-gray-200 cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[10px] font-sans text-charcoal-500 flex items-center space-x-1">
          <span>Mode:</span>
          <span className="text-emerald-700 font-semibold">Live Investigation Replay</span>
        </div>
      </div>
    </div>
  );
};
