import React from 'react';
import {
  Waves,
  Compass,
  MapPin,
  Radio,
  FileCheck,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { AnalysisStage } from '../../types';

interface AnalysisProgressBarProps {
  currentStage: AnalysisStage;
  isAnalyzing: boolean;
  elapsedSeconds?: number;
  activeStep?: number;
  onStepClick?: (step: number) => void;
  onStartReplay?: () => void;
  isReplaying?: boolean;
  className?: string;
}

interface WorkflowStep {
  stepNumber: number;
  code: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  matchingStages: AnalysisStage[];
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    stepNumber: 1,
    code: '01',
    label: 'उपग्रह पहचान / SAR Detect',
    description: 'Sentinel-1 SAR Slick Neural Segmentation',
    icon: <Waves className="w-3.5 h-3.5" />,
    matchingStages: ['SATELLITE_ANALYSIS', 'SPILL_DETECTED'],
  },
  {
    stepNumber: 2,
    code: '02',
    label: 'बहाव पूर्वगणना / Drift Hindcast',
    description: 'Reverse Lagrangian Ocean Advection Modeling',
    icon: <Compass className="w-3.5 h-3.5" />,
    matchingStages: ['DRIFT_RECONSTRUCTION'],
  },
  {
    stepNumber: 3,
    code: '03',
    label: 'उद्गम स्थल / Source Origin',
    description: 'Probable Discharge Locus & Dispersion Envelope',
    icon: <MapPin className="w-3.5 h-3.5" />,
    matchingStages: ['SOURCE_ESTIMATED'],
  },
  {
    stepNumber: 4,
    code: '04',
    label: 'एआईएस मिलान / AIS Correlate',
    description: 'Spatiotemporal Vessel Track Interrogation',
    icon: <Radio className="w-3.5 h-3.5" />,
    matchingStages: ['AIS_CORRELATION', 'VESSEL_RANKING'],
  },
  {
    stepNumber: 5,
    code: '05',
    label: 'कानूनी डॉजियर / Legal Dossier',
    description: 'Tamper-Evident Coast Guard Evidence Dossier',
    icon: <FileCheck className="w-3.5 h-3.5" />,
    matchingStages: ['INVESTIGATION_READY'],
  },
];

export const AnalysisProgressBar: React.FC<AnalysisProgressBarProps> = ({
  currentStage,
  isAnalyzing,
  elapsedSeconds = 0,
  activeStep,
  onStepClick,
  onStartReplay,
  isReplaying = false,
  className = '',
}) => {
  // Map current stage to 1-5 step index
  const getCurrentStepIndex = (): number => {
    switch (currentStage) {
      case 'SATELLITE_ANALYSIS':
      case 'SPILL_DETECTED':
        return 1;
      case 'DRIFT_RECONSTRUCTION':
        return 2;
      case 'SOURCE_ESTIMATED':
        return 3;
      case 'AIS_CORRELATION':
      case 'VESSEL_RANKING':
        return 4;
      case 'INVESTIGATION_READY':
        return 5;
      default:
        return 5; // Default to full readiness in idle demo mode
    }
  };

  const currentStep = activeStep ?? getCurrentStepIndex();

  return (
    <div
      className={`bg-white border-b border-gray-200 px-4 py-1.5 font-sans select-none shadow-2xs flex flex-wrap items-center justify-between gap-2 ${className}`}
    >
      {/* LEFT: 5-Step Pipeline Strip */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-400 mr-1 hidden xl:inline">
          Pipeline:
        </span>

        {WORKFLOW_STEPS.map((step) => {
          const isSelected = currentStep === step.stepNumber;
          const isCompleted =
            !isAnalyzing && (currentStage === 'INVESTIGATION_READY' || currentStage === 'IDLE');
          const isCurrentActive = isAnalyzing && step.matchingStages.includes(currentStage);

          return (
            <button
              key={step.stepNumber}
              onClick={() => onStepClick && onStepClick(step.stepNumber)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[2px] border text-xs transition-all cursor-pointer ${
                isSelected || isCurrentActive
                  ? 'bg-emerald-50 border-2 border-[#064E26] text-[#064E26] font-bold shadow-xs'
                  : isCompleted
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800 font-medium'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 font-medium'
              }`}
              title={step.description}
            >
              {isCurrentActive ? (
                <Loader2 className="w-3 h-3 text-[#E67300] animate-spin flex-shrink-0" />
              ) : (
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isSelected ? 'text-[#064E26]' : 'text-slate-400'
                  }`}
                >
                  {step.code}
                </span>
              )}

              <span className="truncate text-[11px]">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* RIGHT: Progress / Replay Analysis Action */}
      <div className="flex items-center space-x-2 text-xs">
        {isAnalyzing ? (
          <div className="flex items-center space-x-1.5 font-mono text-[#064E26] bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200 text-[11px]">
            <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
            <span>Processing: {elapsedSeconds.toFixed(1)}s</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center space-x-1 text-emerald-700 text-[11px] font-medium mr-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pipeline synchronized</span>
          </div>
        )}

        {/* Integrated Replay Analysis Button */}
        {onStartReplay && (
          <button
            onClick={onStartReplay}
            disabled={isAnalyzing}
            className={`px-2.5 py-1 rounded-[2px] font-sans font-semibold text-xs flex items-center space-x-1.5 border transition-colors cursor-pointer select-none ${
              isReplaying
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-white hover:bg-gray-50 text-charcoal-700 border-gray-300'
            }`}
            title="Replay actual analysis sequence step-by-step on map"
          >
            <RotateCcw className="w-3 h-3 text-charcoal-500" />
            <span>Replay Analysis</span>
          </button>
        )}
      </div>
    </div>
  );
};

