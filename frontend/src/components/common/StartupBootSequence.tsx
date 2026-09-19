import React, { useState, useEffect } from 'react';
import {
  Shield,
  Satellite,
  Compass,
  Radio,
  CheckCircle2,
  Cpu,
  Lock,
  FastForward,
  Sparkles,
  Waves,
  Terminal,
} from 'lucide-react';
import { StateEmblemIndia } from './StateEmblemIndia';
import { IndianCoastGuardInsignia } from './IndianCoastGuardInsignia';
import { TricolorRibbon } from './TricolorRibbon';
import { tacticalAudio } from '../../utils/audioAlerts';

interface StartupBootSequenceProps {
  onComplete: () => void;
}

interface BootStage {
  id: string;
  name: string;
  hindiName: string;
  detail: string;
  icon: React.ReactNode;
  threshold: number;
}

const BOOT_STAGES: BootStage[] = [
  {
    id: 'sar_radar',
    name: 'Copernicus Sentinel-1 SAR Orbit Synchronization',
    hindiName: 'उपग्रह सार रडार टेलीमेट्री लिंक',
    detail: 'C-SAR IW GRDH Swath 250km / VV+VH polarization calibrated over Mumbai High offshore basin.',
    icon: <Satellite className="w-4 h-4 text-cyan-400" />,
    threshold: 20,
  },
  {
    id: 'incois_currents',
    name: 'INCOIS 3D Hydrodynamic Current Vectors',
    hindiName: 'भारतीय महासागर सूचना सेवा (INCOIS) धारा डेटा',
    detail: 'Surface ocean currents (0.85 kts) & NOAA GFS 10m windage vectors coupled to 3D grid.',
    icon: <Waves className="w-4 h-4 text-emerald-400" />,
    threshold: 45,
  },
  {
    id: 'dgll_ais',
    name: 'DGLL Coastal AIS Vessel Telemetry Feed',
    hindiName: 'तटीय एआईएस पोत संचरण डेटा स्ट्रीम',
    detail: 'Real-time Class-A/B vessel transponders synchronized across 65 km maritime corridor.',
    icon: <Radio className="w-4 h-4 text-amber-400" />,
    threshold: 70,
  },
  {
    id: 'lagrangian_hindcast',
    name: 'Lagrangian Reverse-Time Spill Advection Engine',
    hindiName: 'लैग्रेंजियन विपरीत अपवाह एवं उद्गम विश्लेषण',
    detail: 'Reverse Monte Carlo particle hindcast running with 15-minute timestep resolution.',
    icon: <Compass className="w-4 h-4 text-sky-400" />,
    threshold: 88,
  },
  {
    id: 'statutory_ledger',
    name: 'Section 356C Merchant Shipping Act Forensic Ledger',
    hindiName: 'वाणिज्य पोत अधिनियम धारा 356C वैधानिक साक्ष्य',
    detail: 'Cryptographic SHA-256 tamper-evident integrity digest initialized for Maritime Magistrate.',
    icon: <Lock className="w-4 h-4 text-[#FFD700]" />,
    threshold: 100,
  },
];

export const StartupBootSequence: React.FC<StartupBootSequenceProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  useEffect(() => {
    // Play initial subtle naval sonar ping on boot
    try {
      tacticalAudio.playSonarPing();
    } catch {
      // Audio may require user gesture on some browsers
    }

    const durationMs = 2800; // 2.8 seconds total boot sequence
    const intervalMs = 25;
    const increment = 100 / (durationMs / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + increment);

        // Advance stage index based on threshold
        for (let i = BOOT_STAGES.length - 1; i >= 0; i--) {
          if (next >= BOOT_STAGES[i].threshold - 20) {
            setActiveStageIdx((currentIdx) => {
              if (currentIdx !== i) {
                // Stage transition sound
                if (i === BOOT_STAGES.length - 1) {
                  try {
                    tacticalAudio.playSuccessChime();
                  } catch {}
                }
                return i;
              }
              return currentIdx;
            });
            break;
          }
        }

        if (next >= 100) {
          clearInterval(timer);
          // Wait 350ms at 100% then trigger smooth holographic exit
          setTimeout(() => {
            handleFinish();
          }, 350);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  // Update dynamic terminal log lines as stages advance
  useEffect(() => {
    const stage = BOOT_STAGES[activeStageIdx];
    if (stage) {
      setLogMessages((prev) => {
        const line = `[${(progress / 10).toFixed(1)}s] ${stage.name.toUpperCase()} ... [OK]`;
        if (!prev.includes(line)) {
          return [...prev.slice(-4), line];
        }
        return prev;
      });
    }
  }, [activeStageIdx, progress]);

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 600); // matches CSS animation duration
  };

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-[#020B14] flex flex-col justify-between select-none overflow-hidden font-sans text-white transition-all ${
        isExiting ? 'animate-boot-exit' : ''
      }`}
    >
      {/* Background Animated Cybernetic Grid & Radar Sweeps */}
      <div className="absolute inset-0 animate-boot-grid opacity-35 pointer-events-none" />

      {/* Ambient Rotating Radar HUD Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-500/10 pointer-events-none flex items-center justify-center">
        <div className="w-[520px] h-[520px] rounded-full border border-emerald-500/15 flex items-center justify-center">
          <div className="w-[340px] h-[340px] rounded-full border border-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-full animate-radar-sweep border-t-2 border-emerald-400/40" />
          </div>
        </div>
      </div>

      {/* Top National Tricolor Header Ribbon */}
      <div className="relative z-10 w-full">
        <TricolorRibbon height="md" className="shadow-[0_0_20px_rgba(255,153,51,0.5)]" />
        <div className="px-6 py-3 flex items-center justify-between border-b border-emerald-900/40 bg-[#020E1C]/80 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#FFD700]" />
            <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
              MRCC MUMBAI // SECURE DEFENCE KERNEL v2.6.0
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="font-mono text-[10.5px] text-slate-400">
              CLASSIFICATION: <span className="text-[#FFD700] font-bold">RESTRICTED // SIH 260143</span>
            </span>

            {/* Instant Skip Button */}
            <button
              onClick={handleFinish}
              className="px-3 py-1 bg-emerald-950/80 hover:bg-[#064E26] text-emerald-200 hover:text-white rounded-[2px] font-mono text-[11px] font-bold border border-emerald-600/50 flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
              title="Skip startup boot sequence and jump into live workstation"
            >
              <span>त्वरित प्रवेश / ENTER NOW</span>
              <FastForward className="w-3 h-3 text-[#FFD700]" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Main Stage Display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full text-center my-auto">
        {/* Golden Ashoka Lion Capital with Halo */}
        <div className="mb-4 relative">
          <div className="animate-gold-halo inline-block p-3 rounded-full bg-gradient-to-b from-[#064E26]/40 to-transparent border border-[#FFD700]/30">
            <StateEmblemIndia size="lg" variant="gold" />
          </div>
        </div>

        {/* Official Bilingual Government Title */}
        <div className="space-y-1 mb-6">
          <div className="font-serif font-extrabold text-sm text-[#FFD700] tracking-widest uppercase">
            भारत सरकार | रक्षा मंत्रालय
          </div>
          <div className="font-serif font-bold text-xs text-emerald-200 tracking-wider">
            GOVERNMENT OF INDIA | MINISTRY OF DEFENCE
          </div>
          <h1 className="font-serif font-black text-xl md:text-2xl text-white tracking-wide mt-2 drop-shadow-md">
            भारतीय तटरक्षक | INDIAN COAST GUARD
          </h1>
          <div className="font-sans font-extrabold text-xs md:text-sm text-emerald-400 uppercase tracking-wider">
            स्वायत्त समुद्री तेल प्रदूषण निगरानी एवं पोत दायित्व निर्धारण प्रणाली
          </div>
          <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
            AUTONOMOUS MARITIME SPILL INTELLIGENCE & ATTRIBUTION WORKSTATION (HACKX)
          </div>
        </div>

        {/* Telemetry Stage Card */}
        <div className="w-full bg-[#031525]/90 border border-emerald-500/40 rounded-[3px] p-4 shadow-2xl backdrop-blur-md mb-4 text-left">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/50 text-xs">
            <div className="flex items-center space-x-2">
              {BOOT_STAGES[activeStageIdx]?.icon}
              <span className="font-serif font-bold text-[#FFD700]">
                {BOOT_STAGES[activeStageIdx]?.hindiName}
              </span>
              <span className="text-emerald-500">|</span>
              <span className="font-mono font-bold text-emerald-300 text-[11px]">
                STAGE 0{activeStageIdx + 1} OF 05
              </span>
            </div>
            <div className="font-mono text-emerald-400 font-extrabold text-xs bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-700/50">
              {progress.toFixed(0)}%
            </div>
          </div>

          <div className="font-sans text-xs text-white font-bold mb-1">
            {BOOT_STAGES[activeStageIdx]?.name}
          </div>
          <p className="font-mono text-[10.5px] text-slate-300 leading-relaxed">
            {BOOT_STAGES[activeStageIdx]?.detail}
          </p>

          {/* Terminal Console Logs */}
          <div className="mt-3 pt-2 border-t border-emerald-900/30 font-mono text-[10px] text-emerald-400/90 space-y-0.5 bg-black/40 p-2 rounded">
            {logMessages.map((msg, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <span className="text-emerald-500 font-bold">›</span>
                <span>{msg}</span>
              </div>
            ))}
            <div className="flex items-center space-x-1 text-emerald-300">
              <span className="text-emerald-500 font-bold">›</span>
              <span>SYNCHRONIZING GEO-SPATIAL MESH</span>
              <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-cursor-blink" />
            </div>
          </div>
        </div>

        {/* High-Precision Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-emerald-600/40 p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-[#FFD700] to-emerald-400 transition-all duration-75 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
            <span>DGLL · INCOIS · ISRO · SENTINEL-1A</span>
            <span className="text-[#FFD700] font-bold">
              {progress >= 100 ? '✓ INITIALIZATION COMPLETE' : 'SYSTEM INITIALIZATION IN PROGRESS'}
            </span>
            <span>WGS84 EPSG:4326</span>
          </div>
        </div>
      </div>

      {/* Bottom Tricolor Footer Ribbon */}
      <div className="relative z-10 w-full">
        <div className="px-6 py-2 bg-[#020E1C]/80 border-t border-emerald-900/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div>
            INDIAN COAST GUARD MARITIME RESCUE COORDINATION CENTRE (MRCC) WEST
          </div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SECURE MARITIME DOMAIN AWARENESS (NMDA)</span>
          </div>
        </div>
        <TricolorRibbon height="sm" />
      </div>
    </div>
  );
};
