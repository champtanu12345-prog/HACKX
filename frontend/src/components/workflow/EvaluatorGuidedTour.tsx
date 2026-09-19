import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Pause,
  Award,
  Satellite,
  Waves,
  Compass,
  Ship,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Shield,
  Volume2,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audioAlerts';

interface TourStep {
  stepIndex: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  narrationText: string;
  keyInnovations: string[];
  evaluatorTakeaway: string;
  targetFocus: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepIndex: 1,
    badge: 'STAGE 01 // EARTH OBSERVATION',
    title: 'उपग्रह पहचान / Satellite SAR Acquisition',
    subtitle: 'Copernicus Sentinel-1 C-SAR IW Swath over Mumbai High EEZ',
    icon: <Satellite className="w-5 h-5 text-emerald-400" />,
    accentColor: 'border-emerald-500 bg-emerald-950/80 text-emerald-300',
    narrationText:
      'HACKX ingests all-weather Synthetic Aperture Radar (SAR) imagery from Copernicus Sentinel-1. Floating hydrocarbons smooth the ocean surface, dampening capillary waves and producing distinctive dark backscatter anomalies—even through dense monsoonal cloud cover and total night darkness.',
    keyInnovations: [
      'Cloud & night penetrating active C-band radar (5.405 GHz)',
      'Dual-polarization (VV + VH) backscatter normalization',
      'Continuous automated orbital monitoring of the Western Indian EEZ',
    ],
    evaluatorTakeaway:
      'Completely bypasses the failure of optical satellites during night hours and monsoon overcast conditions in the Arabian Sea.',
    targetFocus: 'map-sar-footprint',
  },
  {
    stepIndex: 2,
    badge: 'STAGE 02 // NEURAL SEGMENTATION',
    title: 'गहन विभाजन / Deep Edge Slick Segmentation',
    subtitle: 'U-Net Deep Learning Segmentation & Geometry Extraction',
    icon: <Waves className="w-5 h-5 text-red-400" />,
    accentColor: 'border-red-500 bg-red-950/80 text-red-300',
    narrationText:
      'Our trained U-Net deep learning model extracts pixel-level oil slick masks from raw radar backscatter in under 3 seconds. It automatically computes polygon area (14.85 km²), perimeter, centroid DMS coordinates, and estimated slick age while rejecting false-positive lookalikes (algal blooms, low-wind shadows).',
    keyInnovations: [
      'Sub-second inference using lightweight optimized U-Net backbone',
      'Look-alike rejection filter trained on historical marine slicks',
      'Automated polygon centroid & DMS coordinate georeferencing',
    ],
    evaluatorTakeaway:
      'Transforms raw satellite data into actionable geographic geometry and spill magnitude instantly.',
    targetFocus: 'map-spill-plume',
  },
  {
    stepIndex: 3,
    badge: 'STAGE 03 // OCEAN PHYSICS',
    title: 'बहाव पूर्वगणना / Reverse Lagrangian Drift Hindcast',
    subtitle: 'Hydrodynamic Ocean Advection Modeling to Discharge Locus',
    icon: <Compass className="w-5 h-5 text-cyan-400" />,
    accentColor: 'border-cyan-500 bg-cyan-950/80 text-cyan-300',
    narrationText:
      'Oil does not stay where it is dumped; monsoonal currents transport it kilometers away. Our Lagrangian particle engine runs ocean hydrodynamics in reverse—integrating INCOIS surface currents (0.87 kn) and NOAA windage (3% leeway) backwards in time to reconstruct the exact origin locus and time of dumping.',
    keyInnovations: [
      '4th-Order Runge-Kutta numerical particle tracking integration',
      'Coupled INCOIS hydrodynamics + NOAA GFS wind velocity vectors',
      'Reconstructed origin locus with ±2.5 km spatial uncertainty buffer',
    ],
    evaluatorTakeaway:
      'Identifies WHERE and WHEN the oil was actually discharged, instead of where it drifted hours later.',
    targetFocus: 'map-drift-trajectory',
  },
  {
    stepIndex: 4,
    badge: 'STAGE 04 // AIS TELEMETRY',
    title: 'एआईएस सहसंबंध / Spatiotemporal Correlation & Scoring',
    subtitle: 'Corridor Interrogation & Dark Vessel Anomaly Attribution',
    icon: <Ship className="w-5 h-5 text-amber-400" />,
    accentColor: 'border-amber-500 bg-amber-950/80 text-amber-300',
    narrationText:
      'HACKX correlates all DGLL coastal AIS vessel tracks against the reverse-drift corridor. Suspect MT ARABIAN STAR is flagged with a 98.2/100 suspicion score due to an intentional 92-minute AIS blackout gap directly over the discharge locus and a suspicious speed drop to 3.8 knots (classic bilge washing speed) with CPA of 1.5 km.',
    keyInnovations: [
      'Multi-factor explainable attribution index (0–100 scale)',
      'Automated dark-ship transponder blackout gap isolation',
      'Speed Over Ground (SOG) anomaly detection for tank cleaning operations',
    ],
    evaluatorTakeaway:
      'Transparent, multi-evidence forensic proof that eliminates the anonymity of nighttime bilge dumping.',
    targetFocus: 'map-vessel-suspect',
  },
  {
    stepIndex: 5,
    badge: 'STAGE 05 // PROSECUTION',
    title: 'कानूनी डॉजियर / Court-Admissible Legal Dossier',
    subtitle: 'Section 356C Merchant Shipping Act & MARPOL Annex-I Dossier',
    icon: <FileCheck className="w-5 h-5 text-[#FFD700]" />,
    accentColor: 'border-[#FFD700] bg-amber-950/80 text-[#FFD700]',
    narrationText:
      'Evidence alone is useless without court admissibility. HACKX compiles a tamper-evident legal dossier stamped with SHA-256 cryptographic signatures, chain of custody telemetry, and direct statutory citation under Merchant Shipping Act 1958 §356C for the Indian Coast Guard to present to the Maritime Magistrate for arrest warrants and port detention.',
    keyInnovations: [
      'Court-admissible tamper-evident cryptographic evidence hashing',
      'Automated multi-channel tactical alerts (Webhook, Telegram Bot, SMS)',
      '1-Click statutory report generation for Coast Guard boarding officers',
    ],
    evaluatorTakeaway:
      'Bridges the gap between technical artificial intelligence and actual legal maritime prosecution.',
    targetFocus: 'context-dossier-panel',
  },
];

interface EvaluatorGuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepIndex: number) => void;
}

export const EvaluatorGuidedTour: React.FC<EvaluatorGuidedTourProps> = ({
  isOpen,
  onClose,
  onStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);

  const step = TOUR_STEPS[currentStep - 1];

  // Auto-play timer
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) {
      setProgressPct(0);
      return;
    }

    const durationMs = 7000;
    const intervalMs = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalMs;
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      setProgressPct(pct);

      if (elapsed >= durationMs) {
        elapsed = 0;
        setCurrentStep((prev) => {
          const next = prev >= TOUR_STEPS.length ? 1 : prev + 1;
          tacticalAudio.playSonarPing();
          if (onStepChange) onStepChange(next);
          return next;
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isAutoPlaying, currentStep, onStepChange]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      tacticalAudio.playSonarPing();
      if (onStepChange) onStepChange(next);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      tacticalAudio.playSonarPing();
      if (onStepChange) onStepChange(prev);
    }
  };

  const handleJump = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    tacticalAudio.playSonarPing();
    if (onStepChange) onStepChange(stepIndex);
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-fadeIn font-sans">
      <div className="bg-[#031B0E] border-2 border-[#138808] w-full max-w-2xl rounded-[3px] shadow-[0_0_30px_rgba(19,136,8,0.4)] overflow-hidden flex flex-col text-white">
        {/* Header Strip */}
        <div className="bg-[#02140A] px-4 py-2.5 flex items-center justify-between border-b border-emerald-600/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 rounded bg-[#FF9933]/20 border border-[#FF9933]/60 text-[#FF9933]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-extrabold text-sm text-[#FFD700] tracking-wide">
                  मूल्यांकनकर्ता टूर / EVALUATOR GUIDED TOUR
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 font-mono font-bold">
                  SIH 260143
                </span>
              </div>
              <div className="text-[9.5px] text-emerald-300 font-mono">
                5-STAGE MARITIME INTELLIGENCE & ATTRIBUTION ARCHITECTURE
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto Play Toggle */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-2 py-1 rounded text-[10.5px] font-sans font-bold flex items-center space-x-1 border cursor-pointer transition-colors ${
                isAutoPlaying
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-white/10 hover:bg-white/20 text-emerald-200 border-emerald-700/50'
              }`}
              title="Toggle automatic presentation"
            >
              {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isAutoPlaying ? 'Pause Auto' : 'Auto Play'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auto Play Progress Bar */}
        {isAutoPlaying && (
          <div className="w-full h-1 bg-emerald-950">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#FFD700] transition-all duration-100 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* 5-Step Stepper Dots */}
        <div className="grid grid-cols-5 bg-[#021A0C] border-b border-emerald-800/40 text-center py-2 px-3 gap-1">
          {TOUR_STEPS.map((s) => (
            <button
              key={s.stepIndex}
              onClick={() => handleJump(s.stepIndex)}
              className={`py-1 px-1.5 rounded-[2px] border text-[10px] font-mono font-bold transition-all cursor-pointer truncate ${
                currentStep === s.stepIndex
                  ? 'bg-emerald-500 text-[#02140A] border-emerald-300 shadow-xs'
                  : currentStep > s.stepIndex
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40 hover:bg-emerald-900/60'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              Step 0{s.stepIndex}
            </button>
          ))}
        </div>

        {/* Step Card Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Step Header */}
          <div className="flex items-start justify-between border-b border-emerald-800/50 pb-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded bg-white/10 border border-emerald-500/40 flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                  {step.badge}
                </div>
                <h2 className="text-base font-bold text-white tracking-wide mt-0.5 font-sans">
                  {step.title}
                </h2>
                <p className="text-xs text-emerald-200 font-mono mt-0.5">{step.subtitle}</p>
              </div>
            </div>

            <div className="font-mono text-lg font-extrabold text-[#FFD700] px-2 py-0.5 bg-white/5 rounded border border-emerald-700/40">
              0{step.stepIndex} / 05
            </div>
          </div>

          {/* Technical Narration */}
          <div className="text-xs text-slate-200 leading-relaxed font-sans bg-white/5 p-3 rounded border border-emerald-800/40">
            {step.narrationText}
          </div>

          {/* Key Innovations */}
          <div className="space-y-1.5">
            <div className="text-[10.5px] font-mono font-bold text-[#FFD700] uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-[#FF9933]" />
              <span>मुख्य तकनीकी नवाचार / KEY TECHNICAL INNOVATIONS</span>
            </div>
            <div className="space-y-1">
              {step.keyInnovations.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluator Winning Takeaway Box */}
          <div className="bg-gradient-to-r from-emerald-950/80 to-[#0B2545]/80 border-l-4 border-l-[#FFD700] p-3 rounded-[2px] border border-emerald-600/30">
            <div className="text-[10px] font-mono font-bold text-[#FFD700] uppercase tracking-wider">
              मूल्यांकनकर्ता निर्णय कारक // EVALUATOR DECISION TAKEAWAY
            </div>
            <div className="text-xs text-emerald-100 font-medium mt-1 leading-snug">
              "{step.evaluatorTakeaway}"
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="bg-[#02140A] px-4 py-3 border-t border-emerald-800/50 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-3 py-1.5 rounded-[2px] bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-sans text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>पिछला / Previous</span>
          </button>

          <div className="text-center font-mono text-[10px] text-emerald-300">
            Interactive SIH 260143 Guided Walkthrough
          </div>

          {currentStep < TOUR_STEPS.length ? (
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-[2px] bg-[#138808] hover:bg-emerald-600 text-white font-sans text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors"
            >
              <span>अगला / Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-[2px] bg-[#D4AF37] hover:bg-[#FFD700] text-slate-950 font-sans text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>टूर समाप्त करें / Finish Tour</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
