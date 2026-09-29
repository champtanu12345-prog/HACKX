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
  Workflow,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { StatusIndicator } from '../common/StatusIndicator';
import { DEMO_SCENARIOS } from '../../data/maritimeDemoData';
import { tacticalAudio } from '../../utils/audioAlerts';
import { AuthUser } from '../../api/auth';

interface TopBarProps {
  currentScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  isScenarioLoading?: boolean;
  onRunAnalysis?: () => void;
  isAnalyzing?: boolean;
  onStartReplay?: () => void;
  isReplaying?: boolean;
  onOpenGuidedTour?: () => void;
  onOpenPipelineWizard?: () => void;
  onOpenAlertDispatch?: () => void;
  isSoundActive?: boolean;
  onToggleSound?: () => void;
  onReplayStartup?: () => void;
  currentUser?: AuthUser | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
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
  onOpenPipelineWizard,
  onOpenAlertDispatch,
  isSoundActive,
  onToggleSound,
  onReplayStartup,
  currentUser,
  onOpenLogin,
  onLogout,
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
    <header className="h-12 bg-white border-b-2 border-slate-200 border-t-2 border-t-[#EA580C] px-4 flex items-center justify-between text-xs select-none relative z-30 shadow-xs">
      {/* LEFT: Sector Dispatch & Regional Command Identity */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 whitespace-nowrap flex-shrink-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-sky-600 to-cyan-600 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-1.5 whitespace-nowrap">
            <span className="font-mono font-bold text-xs text-slate-900 tracking-wider">
              ICG-MRCC
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold text-sky-800">
              Tactical Command
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-300 hidden md:block" />

        {/* Sector Dispatch Selector */}
        <div className="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider hidden sm:inline">
            SECTOR:
          </span>
          <select
            value={selectedScenarioInput}
            onChange={handleScenarioChange}
            disabled={isAnalyzing || isScenarioLoading}
            className="bg-slate-50 text-slate-900 text-xs font-sans px-2 py-0.5 rounded border border-slate-200 outline-none cursor-pointer focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-bold text-[11.5px]"
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
        {/* Sensor Stream Status indicators (Teal Accent on White) */}
        <div className="hidden xl:flex items-center space-x-3 text-[10.5px] font-mono text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 border-t-2 border-t-teal-500 shadow-2xs">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">INCOIS: LIVE</span>
          </div>
          <span className="text-slate-200">|</span>
          <div className="flex items-center space-x-1">
            <Radio className="w-3 h-3 text-teal-600" />
            <span className="font-semibold text-slate-700">DGLL AIS: SYNC</span>
          </div>
        </div>

        {/* 1-Click Smart India Hackathon Evaluator Tour Button (Amber Accent on White) */}
        {onOpenGuidedTour && (
          <button
            onClick={onOpenGuidedTour}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50/60 text-amber-900 font-sans font-bold text-xs flex items-center space-x-1.5 border border-slate-200 border-t-2 border-t-amber-500 shadow-2xs cursor-pointer transition-all hover:shadow-sm"
            title="Interactive 5-Stage Smart India Hackathon Evaluator Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline">EVALUATOR TOUR</span>
            <span className="sm:hidden">TOUR</span>
          </button>
        )}

        {/* 5-Step End-to-End Investigation Pipeline Wizard (Indigo Accent on White) */}
        {onOpenPipelineWizard && (
          <button
            id="btn-investigation-pipeline-wizard"
            onClick={onOpenPipelineWizard}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50/60 text-blue-900 font-sans font-bold text-xs flex items-center space-x-1.5 border border-slate-200 border-t-2 border-t-indigo-600 shadow-2xs cursor-pointer transition-all hover:shadow-sm"
            title="5-Step End-to-End Guided Investigation Pipeline"
          >
            <Workflow className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden lg:inline">5-STEP PIPELINE</span>
            <span className="lg:hidden">PIPELINE</span>
          </button>
        )}

        {/* Tactical Multi-Channel Emergency Dispatch Alert (Rose Accent on White) */}
        {onOpenAlertDispatch && (
          <button
            onClick={onOpenAlertDispatch}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50/60 text-rose-800 font-sans font-bold text-xs flex items-center space-x-1.5 border border-slate-200 border-t-2 border-t-rose-500 shadow-2xs cursor-pointer transition-colors hover:shadow-sm"
            title="Transmit Tactical Emergency Alert via Webhook, Telegram, SMS"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">DISPATCH ALERT</span>
            <span className="md:hidden">ALERT</span>
          </button>
        )}

        {/* Primary Action Button: RUN TACTICAL ANALYSIS (Emerald Action) */}
        <button
          id="btn-run-analysis"
          onClick={onRunAnalysis}
          disabled={isAnalyzing || isScenarioLoading}
          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-sans font-bold text-xs flex items-center space-x-2 border border-emerald-700 transition-all cursor-pointer select-none shadow-sm hover:shadow-md"
          title="Execute Satellite SAR Detection, Lagrangian Drift, and AIS Correlation"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>RUN ANALYSIS</span>
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
            <span className="hidden sm:inline">REPLAY</span>
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

        {/* Official Status (Emerald Accent on White) */}
        <div className="flex items-center space-x-1.5 font-mono text-[10px] text-slate-700 bg-white border border-slate-200 border-t-2 border-t-emerald-500 px-2.5 py-1 rounded-lg font-bold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>प्रणाली सक्रिय (ACTIVE)</span>
        </div>

        {/* User Login / Profile Button */}
        {currentUser ? (
          <div className="flex items-center space-x-1.5 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs font-sans shadow-xs border border-slate-700">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold truncate max-w-[120px] text-[11px]">{currentUser.name}</span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-1 text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="bg-slate-900 hover:bg-black text-white px-3 py-1 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
              title="Official Command / Officer Login"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>LOGIN</span>
            </button>
          )
        )}
      </div>
    </header>
  );
};
