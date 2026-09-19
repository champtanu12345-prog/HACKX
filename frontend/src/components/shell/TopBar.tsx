import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  Radio,
  Play,
  RotateCcw,
  Loader2,
  ChevronDown,
  Activity,
  Sparkles,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { StatusIndicator } from '../common/StatusIndicator';
import { DEMO_SCENARIOS } from '../../data/maritimeDemoData';
import { tacticalAudio } from '../../utils/audioAlerts';

interface TopBarProps {
  currentScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  isScenarioLoading?: boolean;
  onRunAnalysis?: () => void;
  isAnalyzing?: boolean;
  onStartReplay?: () => void;
  isReplaying?: boolean;
  onOpenGuidedTour?: () => void;
  onOpenAlertDispatch?: () => void;
  isSoundActive?: boolean;
  onToggleSound?: () => void;
  onReplayStartup?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentScenarioId,
  onSelectScenario,
  isScenarioLoading = false,
  onRunAnalysis,
  isAnalyzing = false,
  onStartReplay,
  isReplaying = false,
  onOpenGuidedTour,
  onOpenAlertDispatch,
  isSoundActive,
  onToggleSound,
  onReplayStartup,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [selectedScenarioInput, setSelectedScenarioInput] = useState<string>(currentScenarioId);

  useEffect(() => {
    setSelectedScenarioInput(currentScenarioId);
  }, [currentScenarioId]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const year = now.getUTCFullYear();
      const month = pad(now.getUTCMonth() + 1);
      const day = pad(now.getUTCDate());
      const hours = pad(now.getUTCHours());
      const minutes = pad(now.getUTCMinutes());
      const seconds = pad(now.getUTCSeconds());
      setUtcTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedScenarioInput(newId);
    onSelectScenario(newId);
  };

  return (
    <header className="h-12 bg-white border-b-2 border-emerald-300 px-4 flex items-center justify-between text-xs select-none relative z-30 shadow-xs">
      {/* LEFT: Sector Dispatch & Regional Command Identity */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-[2px] bg-[#064E26] border border-emerald-500/40 flex items-center justify-center text-[#FFD700] shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-classic font-bold text-xs text-[#064E26] tracking-wide">
                ICG-MRCC
              </span>
              <span className="text-slate-300 font-serif">/</span>
              <span className="font-serif font-bold text-xs text-slate-800">
                परिचालन नियंत्रण कक्ष
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono tracking-tight leading-none">
              REGIONAL TACTICAL MARITIME COMMAND
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-300 hidden md:block" />

        {/* Sector Dispatch Selector */}
        <div className="flex items-center space-x-2 bg-emerald-50/50 px-2.5 py-1 rounded-[2px] border border-emerald-200 shadow-2xs">
          <span className="text-[10px] font-mono font-bold text-[#064E26] uppercase tracking-wider hidden sm:inline">
            क्षेत्र / SECTOR:
          </span>
          <select
            value={selectedScenarioInput}
            onChange={handleScenarioChange}
            disabled={isAnalyzing || isScenarioLoading}
            className="bg-white text-slate-900 text-xs font-sans px-2 py-0.5 rounded-[2px] border border-emerald-300 outline-none cursor-pointer focus:border-[#0D5204] focus:ring-1 focus:ring-[#0D5204] font-bold text-[11.5px]"
          >
            {Object.values(DEMO_SCENARIOS).map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-white text-slate-900 font-medium">
                {sc.title} ({sc.region})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RIGHT: Primary Tactical Run Analysis, Agency Feeds, Replay */}
      <div className="flex items-center space-x-2.5">
        {/* Sensor Stream Status indicators */}
        <div className="hidden xl:flex items-center space-x-3 text-[10.5px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-[2px] border border-slate-200">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
            <span className="font-semibold text-slate-700">INCOIS: LIVE</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1">
            <Radio className="w-3 h-3 text-[#064E26]" />
            <span className="font-semibold text-slate-700">DGLL AIS: SYNC</span>
          </div>
        </div>

        {/* 1-Click Smart India Hackathon Evaluator Tour Button */}
        {onOpenGuidedTour && (
          <button
            onClick={onOpenGuidedTour}
            className="px-2.5 py-1.5 rounded-[2px] bg-gradient-to-r from-amber-50 to-amber-100/90 hover:from-amber-100 hover:to-amber-200 text-[#7C3D00] font-sans font-bold text-xs flex items-center space-x-1.5 border border-amber-400 shadow-xs cursor-pointer transition-all hover:shadow-md"
            title="Interactive 5-Stage Smart India Hackathon Evaluator Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E67300] animate-pulse" />
            <span className="hidden sm:inline">मूल्यांकनकर्ता टूर / EVALUATOR TOUR</span>
            <span className="sm:hidden">TOUR</span>
          </button>
        )}

        {/* Tactical Multi-Channel Emergency Dispatch Alert */}
        {onOpenAlertDispatch && (
          <button
            onClick={onOpenAlertDispatch}
            className="px-2.5 py-1.5 rounded-[2px] bg-red-50 hover:bg-red-100 text-red-800 font-sans font-bold text-xs flex items-center space-x-1.5 border border-red-300 shadow-xs cursor-pointer transition-colors"
            title="Transmit Tactical Emergency Alert via Webhook, Telegram, SMS"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden md:inline">प्रेषण अलर्ट / DISPATCH</span>
            <span className="md:hidden">ALERT</span>
          </button>
        )}

        {/* Primary Action Button: RUN TACTICAL ANALYSIS */}
        <button
          id="btn-run-analysis"
          onClick={onRunAnalysis}
          disabled={isAnalyzing || isScenarioLoading}
          className="px-4 py-1.5 rounded-[2px] bg-[#0D5204] hover:bg-[#064E26] active:bg-[#032B13] disabled:opacity-50 text-white font-sans font-bold text-xs flex items-center space-x-2 border border-[#064E26] transition-all cursor-pointer select-none shadow-sm hover:shadow-md"
          title="Execute Satellite SAR Detection, Lagrangian Drift, and AIS Correlation"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>विश्लेषण प्रगति पर है... (Analyzing)</span>
            </>
          ) : (
            <>
              <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>विश्लेषण प्रारंभ करें / RUN ANALYSIS</span>
            </>
          )}
        </button>

        {/* Replay Investigation Button if provided */}
        {onStartReplay && (
          <button
            onClick={onStartReplay}
            disabled={isAnalyzing || isReplaying}
            className={`px-2.5 py-1.5 rounded-[2px] font-sans font-bold text-xs flex items-center space-x-1.5 border transition-colors cursor-pointer ${
              isReplaying
                ? 'bg-[#064E26] text-white border-[#064E26]'
                : 'bg-white text-[#064E26] hover:bg-emerald-50 border-emerald-300'
            }`}
            title="Chronological 9-step evidence reconstruction"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">पुनरावलोकन / REPLAY</span>
          </button>
        )}

        {/* Tactical Sound Toggle */}
        <button
          onClick={() => {
            if (onToggleSound) {
              onToggleSound();
            } else {
              const current = tacticalAudio.isEnabled();
              tacticalAudio.setEnabled(!current);
              if (!current) tacticalAudio.playSonarPing();
            }
          }}
          className={`p-1.5 rounded-[2px] border transition-colors cursor-pointer ${
            (isSoundActive !== undefined ? isSoundActive : tacticalAudio.isEnabled())
              ? 'bg-emerald-50 text-[#064E26] border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-400 border-slate-300 hover:bg-slate-200'
          }`}
          title={
            (isSoundActive !== undefined ? isSoundActive : tacticalAudio.isEnabled())
              ? 'Tactical Naval Acoustics: ENABLED (Click to mute)'
              : 'Tactical Acoustics: MUTED (Click to enable)'
          }
        >
          {(isSoundActive !== undefined ? isSoundActive : tacticalAudio.isEnabled()) ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Replay Startup Boot Animation */}
        {onReplayStartup && (
          <button
            onClick={onReplayStartup}
            className="p-1.5 rounded-[2px] border border-amber-300 bg-amber-50/80 text-[#7C3D00] hover:bg-amber-100 transition-colors cursor-pointer"
            title="प्रणाली बूट एनीमेशन रीप्ले / Replay Startup Boot Animation"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E67300]" />
          </button>
        )}

        <div className="h-5 w-px bg-slate-300 hidden md:block" />

        {/* Official Status */}
        <div className="flex items-center space-x-1.5 font-mono text-[10px] text-[#064E26] bg-emerald-50 border border-emerald-300 px-2 py-1 rounded-[2px] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#138808]" />
          <span>प्रणाली सक्रिय (ACTIVE)</span>
        </div>
      </div>
    </header>
  );
};
