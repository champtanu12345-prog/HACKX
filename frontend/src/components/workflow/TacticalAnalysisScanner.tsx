import React from 'react';
import { Satellite, Shield, Cpu, Activity, Database, CheckCircle2 } from 'lucide-react';
import { AnalysisStage } from '../../types';

interface TacticalAnalysisScannerProps {
  isAnalyzing: boolean;
  stage: AnalysisStage;
  elapsedSeconds: number;
  onCancel?: () => void;
}

export const TacticalAnalysisScanner: React.FC<TacticalAnalysisScannerProps> = ({
  isAnalyzing,
  stage,
  elapsedSeconds,
  onCancel,
}) => {
  if (!isAnalyzing) return null;

  const stageTitles: Record<AnalysisStage, { title: string; subtitle: string; step: number }> = {
    IDLE: { title: 'प्रतीक्षारत / STANDBY', subtitle: 'Awaiting radar ingest', step: 0 },
    SATELLITE_ANALYSIS: {
      title: 'चरण 1/5: उपग्रह विश्लेषण / SATELLITE INGEST',
      subtitle: 'Sentinel-1 C-SAR IW GRD segmentation running via U-Net v2.0 neural network...',
      step: 1,
    },
    SPILL_DETECTED: {
      title: 'चरण 2/5: रिसाव पहचान / SPILL IDENTIFIED',
      subtitle: 'Hydrocarbon damping signature segmented. Surface area & perimeter extracted.',
      step: 2,
    },
    DRIFT_RECONSTRUCTION: {
      title: 'चरण 3/5: बहाव पुनर्रचना / DRIFT RECONSTRUCTION',
      subtitle: 'Simulating Lagrangian 48h reverse advection under INCOIS currents & GFS winds...',
      step: 3,
    },
    SOURCE_ESTIMATED: {
      title: 'चरण 4/5: उद्गम निर्धारण / SOURCE LOCALIZATION',
      subtitle: 'Discharge origin centroid and spatiotemporal uncertainty buffer compiled.',
      step: 4,
    },
    AIS_CORRELATION: {
      title: 'चरण 5/5: पोत सहसंबंध / AIS CORRELATION',
      subtitle: 'Cross-referencing 148 AIS transits. Evaluating CPA and speed anomalies...',
      step: 5,
    },
    VESSEL_RANKING: {
      title: 'डोजियर निर्माण / DOSSIER COMPILATION',
      subtitle: 'Scoring candidates and generating legal evidence report under MSA 1958 Sec 356C.',
      step: 5,
    },
    INVESTIGATION_READY: {
      title: 'जांच पूर्ण / ANALYSIS COMPLETE',
      subtitle: 'Legal dossier finalized with digital signature.',
      step: 5,
    },
  };

  const currentInfo = stageTitles[stage] || stageTitles.SATELLITE_ANALYSIS;

  return (
    <div
      className="fixed inset-0 z-[9990] bg-[#032B13]/80 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-fadeIn"
      role="alertdialog"
      aria-label="Tactical Analysis Scanner"
    >
      {/* Laser Scanning Line Animating Top to Bottom */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#22C55E] to-transparent animate-laser-scan shadow-[0_0_20px_#22C55E]"
        />
        <div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent animate-laser-scan shadow-[0_0_15px_#FFD700]"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Main Holographic Telemetry Box */}
      <div className="relative bg-[#02210F]/95 border-2 border-emerald-500 rounded-[4px] p-6 max-w-xl w-full shadow-2xl space-y-5 text-white font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-emerald-600/40 pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-full bg-[#22C55E] animate-ping" />
            <span className="font-serif font-bold text-sm text-[#FFD700] uppercase tracking-wider">
              भारतीय तटरक्षक स्वायत्त विश्लेषण प्रणाली
            </span>
          </div>
          <span className="font-mono text-xs text-emerald-300 font-bold">
            {elapsedSeconds.toFixed(1)}s ELAPSED
          </span>
        </div>

        {/* Center Animated Icon with Rotating Ring */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Outer Rotating Radar Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/70 animate-radar-sweep" />
            <div className="absolute inset-2 rounded-full border border-emerald-300/40 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-[#064E26] border border-emerald-300/80 flex items-center justify-center shadow-lg">
              <Cpu className="w-8 h-8 text-[#FFD700] animate-pulse" />
            </div>
          </div>

          {/* Current Stage Title & Description */}
          <div className="text-center space-y-1">
            <div className="font-serif font-extrabold text-base text-white">
              {currentInfo.title}
            </div>
            <div className="text-xs text-slate-200 font-sans max-w-md mx-auto leading-relaxed font-medium">
              {currentInfo.subtitle}
            </div>
          </div>
        </div>

        {/* Live Audio-Visual Telemetry Waveform */}
        <div className="p-3 bg-[#000A1A] border border-cyan-900/60 rounded flex items-center justify-between space-x-1">
          {Array.from({ length: 24 }).map((_, i) => {
            const heights = ['h-2', 'h-4', 'h-6', 'h-3', 'h-7', 'h-5', 'h-8', 'h-4'];
            return (
              <div
                key={i}
                className={`w-1.5 bg-gradient-to-t from-cyan-600 to-[#FF9933] rounded-full transition-all duration-150 ${heights[i % heights.length]} animate-pulse`}
                style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
              />
            );
          })}
        </div>

        {/* Pipeline Stepper Indicators */}
        <div className="grid grid-cols-5 gap-1.5 text-[10px] font-mono text-center">
          {['SAR PASS', 'SPILL ML', 'HINDCAST', 'SOURCE', 'CORRELATION'].map((stName, idx) => {
            const isDone = currentInfo.step > idx + 1;
            const isCurrent = currentInfo.step === idx + 1;
            return (
              <div
                key={stName}
                className={`py-1.5 px-1 rounded border transition-all ${
                  isDone
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : isCurrent
                    ? 'bg-amber-950/80 border-[#FF9933] text-[#FF9933] font-bold animate-pulse'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                {stName}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-[9.5px] font-mono text-slate-400 text-center flex items-center justify-center space-x-1">
          <Activity className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>INCOIS OPENDRIFT // DGLL AIS 4D SPATIOTEMPORAL CORRELATION CORE</span>
        </div>
      </div>
    </div>
  );
};
